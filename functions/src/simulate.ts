import { log } from "firebase-functions/logger";
import { GameDocument, PickDocument, WeekDocument } from "./types";

export default function simulate(week: WeekDocument) {
  if (!week.picks) return;

  log("Simulating chances for week", week.id);
  // Number of simulations
  const NUM_SIMULATIONS = 10000;

  // Get the list of games
  const games = week.games || [];

  // Separate games into completed and pending
  const completedGames = games.filter(
    (game) => game.results && (game.results.winner || game.results.overUnder)
  );
  log("Found", completedGames.length, "completed games");

  const pendingGames = games.filter(
    (game) => !game.results || (!game.results.winner && !game.results.overUnder)
  );
  log("Found", pendingGames.length, "pending games");

  // Get the list of player UIDs
  const playerUIDs = Object.keys(week.picks);
  log("Found", playerUIDs.length, "players");

  // Prepare players data
  const players = playerUIDs.map((uid) => ({
    uid: uid,
    picks: week.picks![uid] || [],
  }));
  log("Player data", players);

  // Preprocess picks for faster access
  const playerPicksMap: Record<string, Record<string, PickDocument>> = {};
  players.forEach((player) => {
    // Create a map of gameId to pick for each player
    const pickMap: Record<string, PickDocument> = {};
    player.picks.forEach((pick) => {
      pickMap[pick.game] = pick;
    });
    playerPicksMap[player.uid] = pickMap;
  });
  log("Player picks", playerPicksMap);

  // Preprocess actual outcomes of completed games
  const completedGameOutcomes: Record<
    string,
    { winner?: string; overUnder?: string; gameId: string }
  > = {};

  completedGames.forEach((game) => {
    completedGameOutcomes[game.id] = {
      gameId: game.id,
      winner: game.results!.winner, // Assuming results are defined
      overUnder: game.results!.overUnder,
    };
  });

  // Initialize win counts for all players
  const playerWinCounts: Record<string, number> = {};
  playerUIDs.forEach((uid) => {
    playerWinCounts[uid] = 0;
  });

  // Function to simulate a single game outcome
  function simulateGameOutcome(game: GameDocument) {
    // For simplicity, we'll assume 50% chance for each outcome
    // If you have probabilities, adjust accordingly

    // Simulate winner
    const winnerOutcome = Math.random() < 0.5 ? "home" : "away";

    // Simulate over/under
    const overUnderOutcome = Math.random() < 0.5 ? "over" : "under";

    return {
      gameId: game.id,
      winner: winnerOutcome,
      overUnder: overUnderOutcome,
    };
  }

  // Run simulations
  for (let sim = 0; sim < NUM_SIMULATIONS; sim++) {
    if (sim % 10000 === 0) {
      log("Simulation", sim, "of", NUM_SIMULATIONS);
    }
    // Simulate outcomes for pending games
    const simulatedOutcomes: Record<
      string,
      { winner: string; overUnder: string; gameId: string }
    > = {};

    pendingGames.forEach((game) => {
      const outcome = simulateGameOutcome(game);
      simulatedOutcomes[game.id] = outcome;
    });

    // Combine completed game outcomes and simulated outcomes
    const allOutcomes: Record<
      string,
      { winner?: string; overUnder?: string; gameId: string }
    > = { ...completedGameOutcomes, ...simulatedOutcomes };

    // Calculate scores for each player
    const playerScores: Record<string, number> = {};
    players.forEach((player) => {
      let score = 0;
      const pickMap = playerPicksMap[player.uid];

      games.forEach((game) => {
        const pick = pickMap[game.id];
        const outcome = allOutcomes[game.id];

        if (pick && outcome) {
          if (pick.winner && outcome.winner && pick.winner === outcome.winner) {
            score += 1;
          }
          if (
            pick.overUnder &&
            outcome.overUnder &&
            pick.overUnder === outcome.overUnder
          ) {
            score += 1;
          }
        }
      });

      playerScores[player.uid] = score;
    });

    // Determine the highest score
    const scores = Object.values(playerScores);
    const highestScore = Math.max(...scores);

    // Find all players with the highest score
    const winners = players.filter(
      (player) => playerScores[player.uid] === highestScore
    );

    // Distribute win counts among winners
    const winIncrement = 1 / winners.length;
    winners.forEach((winner) => {
      playerWinCounts[winner.uid] += winIncrement;
    });
  }

  log("Win counts", playerWinCounts);
  // Calculate the percentage chances
  const playerChances: Record<string, number> = {};
  playerUIDs.forEach((uid) => {
    playerChances[uid] = (playerWinCounts[uid] / NUM_SIMULATIONS) * 100;
  });
  log("Done simulating chances for week", week.id);

  return playerChances;
}
