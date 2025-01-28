import * as dayjs from "dayjs";
import { auth } from "firebase-admin";
import { getFunctions } from "firebase-admin/functions";
import { onCall } from "firebase-functions/v2/https";
import { db } from ".";
import simulate from "./simulate";
import { Stats, WeekDocument } from "./types";
import {
  getScore,
  getScoreboardHelper,
  initializeWeekHelper,
  refetchWeekHelper,
  updateLocksHelper,
  updateOddsHelper,
  updateRankingsHelper,
  updateResultsHelper,
  updateTeamsHelper,
} from "./utils";
import cfb, { Data } from "./cfb";
import nfl from "./nfl";
import { error } from "firebase-functions/logger";
export const initializeWeek = onCall(async (req) => {
  const count = await db.collection("weeks").count().get();
  const today = dayjs().subtract(2, "days");
  const from = today.toISOString().split("T")[0];
  const to = today.add(7, "days").toISOString().split("T")[0];
  const res = await initializeWeekHelper(
    from,
    to,
    `Week ${count.data().count + 1}`
  );
  return res;
});

export const updateGames = onCall(async (req) => {
  const { weekId } = req.data;
  return await refetchWeekHelper(weekId);
});

export const updateOdds = onCall(async (req) => {
  const { weekId } = req.data;
  return await updateOddsHelper(weekId);
});

export const updateResults = onCall(async (req) => {
  const { weekId } = req.data;
  return await updateResultsHelper(weekId);
});

export const updateLocks = onCall(async (req) => {
  const { weekId } = req.data;
  return await updateLocksHelper(weekId);
});

export const updateRankings = onCall(async (req) => {
  return await updateRankingsHelper();
});

export const updateTeams = onCall(async (req) => {
  return await updateTeamsHelper();
});

export const getEmail = onCall(async (req) => {
  const { uid } = req.data;
  // get auth user
  const user = await auth().getUser(uid);
  return user.email;
});

export const getChanceToWin = onCall(async (req) => {
  const { weekId } = req.data as {
    weekId: string;
  };
  const week = await db.collection("weeks").doc(weekId).get();
  if (!week.exists) {
    return { error: "Error, week does not exist" };
  }
  const weekDoc = week.data() as WeekDocument | undefined;
  if (!weekDoc) {
    return { error: "Error, week does not exist" };
  }
  const chances = simulate(weekDoc);
  if (!chances) {
    return { error: "Error, simulations failed" };
  }
  await db.collection("chances").doc(weekId).set(chances);
});

export const getNewsFeed = onCall(
  {
    timeoutSeconds: 540,
    memory: "2GiB",
  },
  async (req) => {
    const { weekId } = req.data as {
      weekId: string;
    };
    const week = await db.collection("weeks").doc(weekId).get();
    if (!week.exists) {
      return { error: "Error, week does not exist" };
    }
    const weekDoc = week.data() as WeekDocument | undefined;
    if (!weekDoc) {
      return { error: "Error, week does not exist" };
    }
    const games = weekDoc.games;
    if (!games?.length) {
      return { error: "Error, no games found" };
    }
    const validGames = games.filter((game) => game.config?.enabled);
    for (const game of validGames) {
      const getNewsFeedQueue = getFunctions().taskQueue("getNewsFeedQueue");
      await getNewsFeedQueue.enqueue({
        weekId: weekId,
        gameId: game.id,
      });
    }

    return { success: "Success" };
  }
);

export const updateStats = onCall(async () => {
  // fetch all weeks
  const weeks = await db.collection("weeks").get();
  if (!weeks.docs.length) return;
  const stats: Record<string, Stats> = {}; // uid -> stats
  for (const week of weeks.docs) {
    const weekDoc = week.data() as WeekDocument | undefined;
    if (!weekDoc) continue;
    const isCompleted = weekDoc.games?.every(
      (game) =>
        !game.config?.enabled ||
        (game.results?.winner && game.results?.overUnder)
    );
    const uids = Object.keys(weekDoc.picks ?? {});

    const scores = uids
      ?.map((uid) => [uid, getScore(uid, weekDoc)] as const)
      .sort((a, b) => b[1] - a[1]);

    const getRank = (score: number) => {
      const rank = scores.findIndex((s) => s[1] === score);
      return rank + 1;
    };
    const paid = ({ uid }: { uid: string }) => {
      return weekDoc.payments?.[uid]?.paid;
    };

    const totalPot = Object.keys(weekDoc.picks ?? {}).length * 20;
    const allRanks = scores.map((s) => getRank(s[1]));
    const numberOfWinners = allRanks.filter((rank) => rank === 1).length;
    const firstPlacePot =
      numberOfWinners === 1 ? totalPot * 0.8 : totalPot / numberOfWinners;
    const numberOfSecondPlaceWinners = allRanks.filter(
      (rank) => rank === 2
    ).length;
    const secondPlacePot =
      numberOfWinners === 1
        ? numberOfSecondPlaceWinners === 1
          ? totalPot * 0.2
          : (totalPot * 0.2) / numberOfSecondPlaceWinners
        : 0;
    for (const pick of Object.entries(weekDoc.picks ?? {})) {
      if (!isCompleted) continue;
      const uid = pick[0];
      if (!paid({ uid })) continue;
      const score = getScore(uid, weekDoc);
      const rank = getRank(score);
      stats[uid] = stats[uid] ?? {
        wins: 0,
        weeksPlayed: 0,
        averagePercent: 0,
        moneyWon: 0,
        bestFinish: 0,
        averageFinish: 0,
      };
      stats[uid].wins = rank === 1 ? stats[uid].wins + 1 : stats[uid].wins;
      stats[uid].weeksPlayed = stats[uid].weeksPlayed + 1;
      if (stats[uid].weeksPlayed === 1) {
        stats[uid].averagePercent = score;
      } else {
        stats[uid].averagePercent =
          (stats[uid].averagePercent * (stats[uid].weeksPlayed - 1) + score) /
          stats[uid].weeksPlayed;
      }
      stats[uid].bestFinish =
        rank > 0
          ? stats[uid].bestFinish
            ? Math.min(stats[uid].bestFinish, rank)
            : rank
          : stats[uid].bestFinish;

      stats[uid].moneyWon =
        rank === 1
          ? stats[uid].moneyWon + firstPlacePot
          : rank === 2
          ? stats[uid].moneyWon + secondPlacePot
          : stats[uid].moneyWon;

      stats[uid].averageFinish =
        (stats[uid].averageFinish * (stats[uid].weeksPlayed - 1) + rank) /
        stats[uid].weeksPlayed;
    }
  }
  const promises = Object.keys(stats).map((uid) =>
    db.collection("stats").doc(uid).set(stats[uid])
  );
  await Promise.all(promises);
});

export const getScoreboard = onCall(async () => {
  try {
    const week = await db
      .collection("weeks")
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();
    if (!week.docs.length) return;
    await getScoreboardHelper(week.docs[0].data() as any);
    return { success: "Success" };
  } catch (error) {
    console.log(error);
    return { error: JSON.stringify(error) };
  }
});

export const getGamecast = onCall(async (req) => {
  const { id, sport } = req.data;
  const service = sport === "americanfootball_nfl" ? nfl : cfb;
  const gamecast = await cfb.getPlayByPlay(id);
  return { gamecast };
});

export const getPicks = onCall(async (req) => {
  const { id, sport } = req.data;
  const service = sport === "americanfootball_nfl" ? nfl : cfb;
  const picks = await service.getPicks(id);
  return { picks };
});

export const logError = onCall<{ error: string }>(async (req) => {
  const { error: e } = req.data;
  error(e);
});