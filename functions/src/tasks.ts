import { onTaskDispatched } from "firebase-functions/v2/tasks";
import simulate from "./simulate";
import { db } from ".";
import { WeekDocument } from "./types";
import { error, log } from "firebase-functions/logger";
import { convertUTCToEST } from "./utils";
import axios from "axios";
import * as dayjs from "dayjs";
import cfb from "./cfb";
import nfl from "./nfl";

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

export const runSimulations = onTaskDispatched(
  {
    timeoutSeconds: 540,
    memory: "2GiB",
    rateLimits: {
      maxConcurrentDispatches: 1,
    },
  },
  async ({ data }) => {
    const { weekId } = data as { weekId: string };
    if (!weekId) {
      error("Error, no weekId provided");
      return;
    }
    log("Running simulations for week", weekId);
    const week = await db.collection("weeks").doc(weekId).get();
    if (!week.exists) {
      error("Error, week does not exist");
      return;
    }
    const weekDoc = week.data() as WeekDocument | undefined;
    if (!weekDoc?.picks) {
      error("Error, week does not exist");
      return;
    }
    const chances = simulate(weekDoc);
    if (!chances) {
      error("Error, simulations failed");
      return;
    }
    await db.collection("chances").doc(weekId).set(chances);
  }
);

export const getNewsFeedQueue = onTaskDispatched<{
  weekId: string;
  gameId: string;
}>(
  {
    timeoutSeconds: 540,
    memory: "2GiB",
    retryConfig: {
      maxAttempts: 3,
      minBackoffSeconds: 60,
    },
  },
  async ({ data }) => {
    const { weekId, gameId } = data;
    const week = await db.collection("weeks").doc(weekId).get();
    if (!week.exists) {
      error("Error, week does not exist");
      return;
    }
    const weekDoc = week.data() as WeekDocument | undefined;
    if (!weekDoc) {
      error("Error, week does not exist");
      return;
    }
    const games = weekDoc.games;
    if (!games?.length) {
      error("Error, no games found");
      return;
    }
    const game = games.find((g) => g.id === gameId);
    if (!game) {
      error("Error, game does not exist");
      return;
    }
    const matchup = `${game.away} @ ${game.home}`;
    const date = convertUTCToEST(
      game.commence_time ?? new Date().toUTCString()
    );
    const response = await axios.post(
      "https://api.perplexity.ai/chat/completions",
      JSON.stringify({
        return_images: true,
        return_related_questions: true,
        messages: [
          {
            role: "user",
            content: `You are a sports expert. Use online resources to research the game. First give a brief overview of the game. Then provide me with 5 reasons for one team to cover the spread and 5 reasons for the other team to cover the spread. Also give me 3 reasons for why the total might go over and 3 reasons why the total might go under. Game: ${matchup} game on ${dayjs(
              date
            ).format("MMMM D hh:MM A")}.`,
          },
        ],
        model: "llama-3.1-sonar-large-128k-online",
      }),
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
        },
      }
    );
    const message = response.data.choices[0].message;
    const ref = db.collection("news_feeds").doc(weekId);
    const existing = await ref.get();
    if (existing.exists) {
      await ref.update({
        [game.id]: message.content,
      });
    } else {
      await ref.set({
        [game.id]: message.content,
      });
    }
  }
);
