import axios from "axios";
import { db } from ".";
import {
  OddsResponse,
  RankingsResponse,
  ScoresResponse,
  TeamsResponse,
  WeekDocument,
} from "./types";
import { getFunctions } from "firebase-admin/functions";
import { error, log } from "firebase-functions/logger";
import * as dayjs from "dayjs";
import * as utc from "dayjs/plugin/utc";
import * as tz from "dayjs/plugin/timezone";
import cfb from "./cfb";
import nfl from "./nfl";
dayjs.extend(utc);
dayjs.extend(tz);

const ODDS_API_KEY = process.env.ODDS_API_KEY;
const COLLEGE_FOOTBALL_DATA_API_KEY = process.env.COLLEGE_FOOTBALL_DATA_API_KEY;

export const updateResultsHelper = async (weekId: string) => {
  const ref = db.collection("weeks").doc(weekId);
  const week = await ref.get();
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
  // check if there are any games that are actively playing.
  // This means that the commence time is in the past and there are no results on the game
  const activeGames = games.filter((game) => {
    if (!game.commence_time) return false;
    const gameCommenceDate = dayjs.utc(game.commence_time);
    return (
      dayjs().utc().isAfter(gameCommenceDate) &&
      !game.results?.winner &&
      !game.results?.overUnder
    );
  });
  if (!activeGames.length) {
    return { success: "No active games found" };
  }
  // const ids = activeGames.map((game) => game.id).join(",");
  const ncaaIds = activeGames
    .filter((game) => game.sport === "americanfootball_ncaaf")
    .map((game) => game.id)
    .join(",");
  const nflIds = activeGames
    .filter((game) => game.sport === "americanfootball_nfl")
    .map((game) => game.id)
    .join(",");
  // /v4/sports/{sport}/scores/?apiKey={apiKey}&daysFrom={daysFrom}&dateFormat={dateFormat}
  const config = {
    method: "get",
    maxBodyLength: Infinity,
    url: `https://api.the-odds-api.com/v4/sports/americanfootball_ncaaf/scores?regions=us&apiKey=${ODDS_API_KEY}&daysFrom=3&eventIds=${ncaaIds}`,
    headers: {},
  };
  const config2 = {
    method: "get",
    maxBodyLength: Infinity,
    url: `https://api.the-odds-api.com/v4/sports/americanfootball_nfl/scores?regions=us&apiKey=${ODDS_API_KEY}&daysFrom=3&eventIds=${nflIds}`,
    headers: {},
  };
  try {
    const { data: data1 } = (await axios.request(config)) as {
      data: ScoresResponse[];
    };
    const { data: data2 } = (await axios.request(config2)) as {
      data: ScoresResponse[];
    };
    const data = [...data1, ...data2];
    const ref = db.collection("weeks").doc(weekId);
    let wasGameCompleted = false;
    data.map((score) => {
      const currGame = games.find((g) => g.id === score.id);
      if (!currGame) return;
      if (currGame.results?.winner && currGame.results?.overUnder) return;
      log(`Updating score for game ${currGame.home} vs ${currGame.away}`);
      const scores = score.scores;
      const home = scores?.find((score) => score.name === currGame.home);
      const away = scores?.find((score) => score.name === currGame.away);
      if (home && away) {
        const homeScore = +home.score;
        const awayScore = +away.score;
        const total = homeScore + awayScore;
        if (score.completed) {
          currGame.currentScore = {
            home: homeScore,
            away: awayScore,
            last_update: score.last_update,
          };
          currGame.results = {
            winner:
              homeScore + currGame.home_spread > awayScore
                ? "home"
                : homeScore + currGame.home_spread < awayScore
                ? "away"
                : "push",
            overUnder:
              total > currGame.overUnder
                ? "over"
                : total < currGame.overUnder
                ? "under"
                : "push",
          };
          log(`Score final updated to ${homeScore}:${awayScore}`);
          wasGameCompleted = true;
        } else {
          currGame.results = {};
          currGame.currentScore = {
            home: homeScore,
            away: awayScore,
            last_update: score.last_update,
          };
          log(
            `Score updated to ${homeScore}:${awayScore} with last update ${score.last_update}`
          );
        }
      }
    });
    log("New Games", { games });
    await ref.update({
      games: [...games],
    });
    if (wasGameCompleted) {
      try {
        const simulations = getFunctions().taskQueue("runSimulations");
        await simulations.enqueue({
          weekId: weekId,
        });
        simulations.enqueue({
          weekId: weekId,
        });
      } catch (e) {
        error(e);
      }
    }
    return { success: "Success" };
  } catch (error) {
    console.log(error);
    return { error: JSON.stringify(error) };
  }
};

export const updateOddsHelper = async (weekId: string) => {
  const ref = db.collection("weeks").doc(weekId);
  const week = await ref.get();
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
  // check if there are any games that aren't locked
  const activeGames = games.filter((game) => !game.locked);
  if (!activeGames.length) {
    return { success: "No active games found" };
  }
  const ncaaIds = activeGames
    .filter((game) => game.sport === "americanfootball_ncaaf")
    .map((game) => game.id)
    .join(",");
  const nflIds = activeGames
    .filter((game) => game.sport === "americanfootball_nfl")
    .map((game) => game.id)
    .join(",");
  const config = {
    method: "get",
    maxBodyLength: Infinity,
    url: `https://api.the-odds-api.com/v4/sports/americanfootball_ncaaf/odds?regions=us&markets=spreads,totals&eventIds=${ncaaIds}&apiKey=${ODDS_API_KEY}`,
    headers: {},
  };
  const config2 = {
    method: "get",
    maxBodyLength: Infinity,
    url: `https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds?regions=us&markets=spreads,totals&eventIds=${nflIds}&apiKey=${ODDS_API_KEY}`,
    headers: {},
  };
  try {
    const { data: data1 } = (await axios.request(config)) as {
      data: OddsResponse[];
    };
    const { data: data2 } = (await axios.request(config2)) as {
      data: OddsResponse[];
    };
    const data = [...data1, ...data2];
    data.forEach((game) => {
      const currGame = games.find((g) => g.id === game.id);
      if (currGame) {
        if (currGame.locked) {
          log(`Game $${game.id} is locked, skipping`);
          return;
        }
        const spreadMarket = game.bookmakers[0].markets.find(
          (market) => market.key === "spreads"
        );
        const totalMarket = game.bookmakers[0].markets.find(
          (market) => market.key === "totals"
        );
        const home = spreadMarket?.outcomes.find(
          (outcome) => outcome.name === game.home_team
        );
        const away = spreadMarket?.outcomes.find(
          (outcome) => outcome.name === game.away_team
        );
        if (home && away) {
          currGame.home_spread = home.point;
          currGame.away_spread = away.point;
        }
        const overUnder = totalMarket?.outcomes.find(
          (outcome) => outcome.name === "Over"
        );
        const under = totalMarket?.outcomes.find(
          (outcome) => outcome.name === "Under"
        );
        if (overUnder && under) {
          currGame.overUnder = overUnder.point;
        }
      }
    });
    const ref = db.collection("weeks").doc(weekId);
    await ref.update({
      games,
    });
    return {
      success: `Successfully updated odds`,
    };
  } catch (error) {
    console.log(error);
    return { error: JSON.stringify(error) };
  }
};

export const initializeWeekHelper = async (
  from: string,
  to: string,
  name: string
) => {
  if (!from || !to) {
    return { error: "Error, missing from/to" };
  }
  const config = {
    method: "get",
    maxBodyLength: Infinity,
    url: `https://api.the-odds-api.com/v4/sports/americanfootball_ncaaf/odds?regions=us&markets=spreads,totals&commenceTimeFrom=${from}T05:00:00Z&commenceTimeTo=${to}T05:00:00Z&apiKey=${ODDS_API_KEY}`,
    headers: {},
  };
  const config2 = {
    method: "get",
    maxBodyLength: Infinity,
    url: `https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds?regions=us&markets=spreads,totals&commenceTimeFrom=${from}T05:00:00Z&commenceTimeTo=${to}T05:00:00Z&apiKey=${ODDS_API_KEY}`,
    headers: {},
  };

  try {
    const { data: data1 } = (await axios.request(config)) as {
      data: OddsResponse[];
    };
    const { data: data2 } = (await axios.request(config2)) as {
      data: OddsResponse[];
    };
    const data = [...data1, ...data2];
    const games: WeekDocument["games"] = data.map((game) => {
      const home = game.home_team;
      const away = game.away_team;
      const markets = game.bookmakers[0].markets;
      const odds = markets.find((market) => market.key === "spreads")?.outcomes;
      const homeSpread = odds?.find((outcome) => outcome.name === home)?.point;
      const awaySpread = odds?.find((outcome) => outcome.name === away)?.point;
      const overUnder = markets.find((market) => market.key === "totals")
        ?.outcomes[0].point;
      return {
        id: game.id,
        sport: game.sport_key,
        home,
        away,
        home_spread: +(homeSpread ?? 0),
        away_spread: +(awaySpread ?? 0),
        overUnder: +(overUnder ?? 0),
        config: {
          pickMethod: "both",
        },
        commence_time: game.commence_time,
      };
    });
    const ref = db.collection("weeks").doc();
    const week: WeekDocument = {
      id: ref.id,
      name,
      games,
      createdAt: Date.now(),
      from: from,
      to: to,
    };
    await db.collection("weeks").doc(week.id).set(week);
    return { success: "Success" };
  } catch (error) {
    console.log(error);
    return { error: JSON.stringify(error) };
  }
};

export const updateRankingsHelper = async () => {
  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url: "https://api.collegefootballdata.com/rankings?year=2024&seasonType=regular",
    headers: {
      Authorization: `Bearer ${COLLEGE_FOOTBALL_DATA_API_KEY}`,
    },
  };

  try {
    const response = await axios.request(config);
    const data = response.data as RankingsResponse[];
    const mostRecentRankings = data.sort((a, b) => a.week - b.week).pop();
    if (!mostRecentRankings) {
      return { error: "Error, no rankings found" };
    }
    const ref = db.collection("rankings").doc("most_recent");
    await ref.set(mostRecentRankings);
    return { success: "Success" };
  } catch (error) {
    console.log(error);
    return { error: JSON.stringify(error) };
  }
};

export const updateTeamsHelper = async () => {
  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url: "https://api.collegefootballdata.com/teams",
    headers: {
      Authorization:
        `Bearer ${COLLEGE_FOOTBALL_DATA_API_KEY}`,
    },
  };

  try {
    const response = await axios.request(config);
    const data = response.data as TeamsResponse[];
    await Promise.all(
      data.map((team) => {
        const ref = db.collection("teams").doc(team.school + " " + team.mascot);
        return ref.set(team);
      })
    );
  } catch (error) {
    console.log(error);
  }
};

export const refetchWeekHelper = async (weekId: string) => {
  const ref = db.collection("weeks").doc(weekId);
  const week = await ref.get();
  if (!week.exists) {
    return { error: "Error, week does not exist" };
  }
  const weekDoc = week.data() as WeekDocument | undefined;
  if (!weekDoc) {
    return { error: "Error, week does not exist" };
  }
  if (weekDoc.published) {
    return { error: "Error, week is already published" };
  }
  const { from, to } = weekDoc;
  if (!from || !to) {
    return { error: "Error, missing from/to" };
  }
  const currGames = weekDoc.games;
  const config = {
    method: "get",
    maxBodyLength: Infinity,
    url: `https://api.the-odds-api.com/v4/sports/americanfootball_ncaaf/odds?regions=us&markets=spreads,totals&commenceTimeFrom=${from}T05:00:00Z&commenceTimeTo=${to}T05:00:00Z&apiKey=${ODDS_API_KEY}`,
    headers: {},
  };
  const config2 = {
    method: "get",
    maxBodyLength: Infinity,
    url: `https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds?regions=us&markets=spreads,totals&commenceTimeFrom=${from}T05:00:00Z&commenceTimeTo=${to}T05:00:00Z&apiKey=${ODDS_API_KEY}`,
    headers: {},
  };
  try {
    const { data: data1 } = (await axios.request(config)) as {
      data: OddsResponse[];
    };
    const { data: data2 } = (await axios.request(config2)) as {
      data: OddsResponse[];
    };
    const data = [...data1, ...data2];
    const games: WeekDocument["games"] = data.map((game) => {
      const currGame = currGames?.find((g) => g.id === game.id);
      const home = game.home_team;
      const away = game.away_team;
      const markets = game.bookmakers[0].markets;
      const odds = markets.find((market) => market.key === "spreads")?.outcomes;
      const homeSpread = odds?.find((outcome) => outcome.name === home)?.point;
      const awaySpread = odds?.find((outcome) => outcome.name === away)?.point;
      const overUnder = markets.find((market) => market.key === "totals")
        ?.outcomes[0].point;
      return {
        ...(currGame ?? {}),
        id: game.id,
        sport: game.sport_key,
        home,
        away,
        home_spread: +(homeSpread ?? 0),
        away_spread: +(awaySpread ?? 0),
        overUnder: +(overUnder ?? 0),
        commence_time: game.commence_time,
        config: currGame?.config ?? {
          pickMethod: "both",
        },
      };
    });
    const ref = db.collection("weeks").doc(weekId);
    await ref.update({
      games,
    });
    return { success: "Success" };
  } catch (error) {
    console.log(error);
    return { error: JSON.stringify(error) };
  }
};

export const updateLocksHelper = async (weekId: string) => {
  const ref = db.collection("weeks").doc(weekId);
  const week = await ref.get();
  if (!week.exists) {
    return { error: "Error, week does not exist" };
  }
  const weekDoc = week.data() as WeekDocument | undefined;
  if (!weekDoc) {
    return { error: "Error, week does not exist" };
  }
  const games = weekDoc.games?.filter(g => g.config?.enabled);
  if (!games?.length) {
    return { error: "Error, no games found" };
  }

  const currentDate = convertUTCToEST(
    new Date().toISOString().slice(0, 19) + "Z"
  );
  const currentDateTimestamp = currentDate.getTime();

  games.forEach(async (game) => {
    game.locked = false;
    if (!game.commence_time) return;

    const gameCommenceDate = convertUTCToEST(game.commence_time);
    const gameCommenceTimestamp = gameCommenceDate.getTime();

    // Thursday/Friday games lock at the start of the game. Also a fallback in case of any other games.
    if (currentDateTimestamp > gameCommenceTimestamp) {
      game.locked = true;
      return;
    }

    const dayOfWeek = gameCommenceDate.getDay();
    if (dayOfWeek === 6) {
      // Saturday games lock at the beginning of the first Saturday Game
      const saturdayGames = games
        .filter(
          (g) =>
            g.commence_time && convertUTCToEST(g.commence_time).getDay() === 6
        )
        .sort(
          (a, b) =>
            convertUTCToEST(a.commence_time!).getTime() -
            convertUTCToEST(b.commence_time!).getTime()
        );
      if (saturdayGames.length) {
        const saturdayGame = saturdayGames[0];
        const saturdayGameCommenceTime = convertUTCToEST(
          saturdayGame.commence_time!
        ).getTime();
        if (currentDateTimestamp > saturdayGameCommenceTime) {
          game.locked = true;
          return;
        }
      }
    }
    if (dayOfWeek === 0 || dayOfWeek === 1) {
      // Sunday / Monday games lock at the beginning of the first Sunday game
      const sundayGames = games
        .filter(
          (g) =>
            g.commence_time && convertUTCToEST(g.commence_time).getDay() === 0
        )
        .sort(
          (a, b) =>
            convertUTCToEST(a.commence_time!).getTime() -
            convertUTCToEST(b.commence_time!).getTime()
        );
      if (sundayGames.length) {
        const gameCommenceDateEST = convertUTCToEST(game.commence_time!);
        console.log(gameCommenceDateEST.getHours());
        const sundayGame = sundayGames.find(
          (g) => convertUTCToEST(g.commence_time!).getHours() === 13
        );
        const sundayGameCommenceTime =
          sundayGame?.commence_time && gameCommenceDateEST.getHours() !== 9
            ? convertUTCToEST(sundayGame.commence_time).getTime()
            : gameCommenceDateEST.getTime();

        if (currentDateTimestamp > sundayGameCommenceTime) {
          game.locked = true;
          return;
        }
      }
    }
  });

  await ref.update({
    games,
  });
  return { success: "Success" };
};

export function keysDiff(obj1: any, obj2: any): any {
  function isObject(obj: any): obj is Record<string, any> {
    return obj && typeof obj === "object" && !Array.isArray(obj);
  }

  function isArrayEqual(arr1: any[], arr2: any[]): boolean {
    if (arr1.length !== arr2.length) return false;

    const sortedArr1 = [...arr1].sort();
    const sortedArr2 = [...arr2].sort();

    return sortedArr1.every((value, index) => {
      if (isObject(value) || Array.isArray(value)) {
        return JSON.stringify(value) === JSON.stringify(sortedArr2[index]);
      }
      return value === sortedArr2[index];
    });
  }

  function difference(o1: any, o2: any): any {
    const diffs: any = {};

    // Iterate over the keys in the first object
    Object.keys(o1).forEach((key) => {
      if (isObject(o1[key]) && isObject(o2[key])) {
        const nestedDiff = difference(o1[key], o2[key]);
        if (Object.keys(nestedDiff).length > 0) {
          diffs[key] = nestedDiff;
        }
      } else if (Array.isArray(o1[key]) && Array.isArray(o2[key])) {
        if (!isArrayEqual(o1[key], o2[key])) {
          diffs[key] = { oldValue: o1[key], newValue: o2[key] };
        }
      } else if (o1[key] !== o2[key]) {
        diffs[key] = { oldValue: o1[key], newValue: o2[key] };
      }
    });

    // Iterate over the keys in the second object to catch properties not in the first object
    Object.keys(o2).forEach((key) => {
      if (!o1.hasOwnProperty(key)) {
        diffs[key] = { oldValue: undefined, newValue: o2[key] };
      }
    });

    return diffs;
  }

  return difference(obj1, obj2);
}

export function convertUTCToEST(utcDateString: string) {
  // Create a Date object from the UTC date string
  const utcDate = new Date(utcDateString);

  // Convert UTC date to EST (or EDT depending on Daylight Saving Time)
  const estDate = new Date(
    utcDate.toLocaleString("en-US", { timeZone: "America/New_York" })
  );

  // Format the date back to the same format as input (ISO 8601)
  return estDate;
}

export function getScore(uid: string, week: WeekDocument) {
  const picks = week.picks?.[uid];
  const games = week.games?.filter((game) => game.config?.enabled);
  const correctPicks =
    picks?.reduce((acc, pick) => {
      const game = games?.find((g) => g.id === pick.game);
      if (!game?.results?.winner && !game?.results?.overUnder) return acc;
      if (game.config?.pickMethod === "either") {
        if (
          pick.winner === game.results?.winner ||
          pick.overUnder === game.results?.overUnder
        ) {
          return acc + 1;
        }
      } else {
        let points = 0;
        if (pick.overUnder === game.results?.overUnder) {
          points += 1;
        }
        if (pick.winner === game.results?.winner) {
          points += 1;
        }
        return acc + points;
      }
      return acc;
    }, 0) ?? 0;

  const totalPicks = games?.reduce((acc, game) => {
    if (game.config?.pickMethod === "both") {
      return acc + 2;
    }
    return acc + 1;
  }, 0);

  if (!totalPicks || !correctPicks) return 0;
  const pickUnit = 1 / totalPicks;
  const score = correctPicks * pickUnit * 100;
  return score;
}

export async function getScoreboardHelper(week: WeekDocument) {
  const today = dayjs().tz("America/New_York");
  const [resCfb, resNfl] = await Promise.all([
    cfb.getScoreboard({
      year: today.year(),
      month: today.month() + 1,
      day: today.date(),
    }),
    nfl.getScoreboard({
      year: today.year(),
      month: today.month() + 1,
      day: today.date(),
    }),
  ]);
  // merge the two scores
  const mergedRes = {
    events: [...resCfb.events, ...resNfl.events],
    leagues: [...resCfb.leagues, ...resNfl.leagues],
  };
  if (resCfb.error || resNfl.error) {
    error(resCfb.error || resNfl.error);
  } else {
    log("Successfully fetched scoreboard");
    const ref = db.collection("scoreboards").doc(week.id);
    await ref.set(mergedRes);
    const games = week.games;
    if (!games?.length) {
      error("Error, no games found");
      return;
    }
    const enabledGames = games.filter((game) => game.config?.enabled);
    await Promise.all(
      enabledGames
        .map(async (game) => {
          const event = mergedRes.events.find((c: any) =>
            c.name.includes(game.away || game.home)
          );
          if (!event) return Promise.resolve();
          const service = game.sport === "americanfootball_nfl" ? nfl : cfb;
          const [gamecast, picks] = await Promise.all([
            service.getPlayByPlay(event.id),
            service.getPicks(event.id),
          ]);

          removeUndefinedRecursive(gamecast);
          removeUndefinedRecursive(picks);
          return Promise.all([
            db.collection("gamecasts").doc(event.id).set(gamecast),
            db.collection("picks").doc(event.id).set(picks),
          ]);
        })
        .flat()
    );
  }
}

function removeUndefinedRecursive(obj: any) {
  if (typeof obj === "undefined") return;
  if (obj === null) return;
  if (typeof obj !== "object") return;
  Object.keys(obj).forEach((key) => {
    if (obj[key] === undefined) delete obj[key];
    else if (typeof obj[key] === "object") removeUndefinedRecursive(obj[key]);
  });
}
