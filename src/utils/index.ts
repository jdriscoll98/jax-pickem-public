import {
  GameDocument,
  RankingsResponse,
  TeamsResponse,
  WeekDocument,
} from "../types";

export function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

export function getGameId(game: GameDocument, week: WeekDocument) {
  return slugify(`${game.home} ${game.away} ${week.id.slice(-5)}`);
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

export function getPotentialScore(
  uid: string,
  week: WeekDocument,
  currUserUid?: string
) {
  if (!currUserUid) return 0;
  // return the score if the user's remaining picks are all correct
  const currUserPicks = week.picks?.[currUserUid];
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
  const remainingPicks =
    games?.reduce((acc, game) => {
      if (game.results?.winner && game.results?.overUnder) return acc;
      if (
        picks?.find((pick) => pick.game === game.id)?.overUnder ===
          currUserPicks?.find((pick) => pick.game === game.id)?.overUnder &&
        picks?.find((pick) => pick.game === game.id)?.winner ===
          currUserPicks?.find((pick) => pick.game === game.id)?.winner
      ) {
        return acc + 2;
      } else if (
        picks?.find((pick) => pick.game === game.id)?.overUnder ===
        currUserPicks?.find((pick) => pick.game === game.id)?.overUnder
      ) {
        return acc + 1;
      } else if (
        picks?.find((pick) => pick.game === game.id)?.winner ===
        currUserPicks?.find((pick) => pick.game === game.id)?.winner
      ) {
        return acc + 1;
      }
      return acc;
    }, 0) ?? 0;

  const potentialScore = correctPicks + remainingPicks;

  const totalPicks =
    games?.reduce((acc, game) => {
      if (game.config?.pickMethod === "both") {
        return acc + 2;
      }
      return acc + 1;
    }, 0) ?? 0;

  if (!totalPicks || !potentialScore) return 0;
  const score = (potentialScore / totalPicks) * 100;
  return score;
}

export function getChanceToWin(week: WeekDocument, uid: string) {
  // for every combination of possible results, get the amount of times that the user won
  const possibleResults = [
    ["home", "away"],
    ["away", "away"],
    ["away", "home"],
    ["home", "home"],
  ];
  const picks1 = ["home", "home"];
  const picks2 = ["home", "away"];

  let timesWon = 0;
  for (const results of possibleResults) {
    let correctPicks1 = 0;
    for (let i = 0; i < picks1.length; i++) {
      if (results[i] === picks1[i]) {
        correctPicks1++;
      }
    }

    let correctPicks2 = 0;
    for (let i = 0; i < picks2.length; i++) {
      if (results[i] === picks2[i]) {
        correctPicks2++;
      }
    }
    if (correctPicks1 > correctPicks2) {
      timesWon++;
    }
  }
  return (timesWon / possibleResults.length) * 100;
}

export function getImageUrl(
  name: string,
  sport: GameDocument["sport"],
  team?: TeamsResponse
) {
  if (team?.logos?.[1]) {
    return team.logos[1];
  } else if (team?.logos?.[0]) {
    return team.logos[0];
  }
  return `https://firebasestorage.googleapis.com/v0/b/jax-pickem.appspot.com/o/${sport}%2F${encodeURI(
    name
  )}.${sport === "americanfootball_nfl" ? "webp" : "png"}?alt=media`;
}

export function getRank(
  name: string,
  rankings?: RankingsResponse,
  team?: TeamsResponse
) {
  if (!rankings || !team) return "";
  const rank = rankings.polls
    .find((poll) => poll.poll === "AP Top 25")
    ?.ranks.find((rank) => rank.school === team.school);
  if (rank) {
    return `${rank.rank}`;
  }
  return "";
}

export function convertUTCToEST(utcDateString: string) {
  // Create a Date object from the UTC date string
  const utcDate = new Date(utcDateString);

  // Convert UTC date to EST (or EDT depending on Daylight Saving Time)
  const estDate = new Date(
    utcDate.toLocaleString("en-US", { timeZone: "America/New_York" })
  );

  // Return the converted EST Date object
  return estDate;
}

export function getLockTime(week?: WeekDocument, game_id?: string): number {
  const game = week?.games?.find((g) => g.id === game_id);
  if (!game) return 0;
  const now = convertUTCToEST(new Date().toUTCString());
  const gameCommenceDate = convertUTCToEST(game.commence_time);
  if (gameCommenceDate.getTime() < now.getTime()) {
    return 0;
  }
  if (gameCommenceDate.getDay() === 4 || gameCommenceDate.getDay() === 5) {
    // Thursday/Friday games lock at the start of the game. Also a fallback in case of any other games.
    return gameCommenceDate.getTime();
  } else if (gameCommenceDate.getDay() === 6) {
    // Saturday games lock at the beginning of the first Saturday Game
    const saturdayGames = (week?.games ?? [])
      .filter(
        (g) =>
          g.commence_time && convertUTCToEST(g.commence_time).getDay() === 6 && g.config?.enabled
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
      return saturdayGameCommenceTime;
    } else {
      return convertUTCToEST(game.commence_time!).getTime();
    }
  } else if (
    gameCommenceDate.getDay() === 0 ||
    gameCommenceDate.getDay() === 1
  ) {
    // Sunday / Monday games lock at the beginning of the first Sunday game
    const sundayGames = (week?.games ?? [])
      .filter(
        (g) =>
          g.commence_time && convertUTCToEST(g.commence_time).getDay() === 0 && g.config?.enabled
      )
      .sort(
        (a, b) =>
          convertUTCToEST(a.commence_time!).getTime() -
          convertUTCToEST(b.commence_time!).getTime()
      );
    if (sundayGames.length) {
      const gameCommenceDateEST = convertUTCToEST(game.commence_time!);
      if (gameCommenceDateEST.getHours() === 9)
        return gameCommenceDateEST.getTime();
      const sundayGame = sundayGames.find(
        (g) => convertUTCToEST(g.commence_time!).getHours() === 13 && g.config?.enabled
      );
      if (!sundayGame) return convertUTCToEST(game.commence_time!).getTime();
      const sundayGameCommenceTime = convertUTCToEST(
        sundayGame.commence_time!
      ).getTime();
      return sundayGameCommenceTime;
    } else {
      return convertUTCToEST(game.commence_time!).getTime();
    }
  } else {
    return convertUTCToEST(game.commence_time!).getTime();
  }
}
