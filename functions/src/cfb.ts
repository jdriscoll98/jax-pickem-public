import axios from "axios";
import * as cheerio from "cheerio";

interface PlayerRanking {
  ranking: number;
  name: string;
  highSchool: string;
  position: string;
  height: string;
  weight: string;
  stars: number;
  rating: string;
  college: string;
}

interface SchoolRanking {
  rank: string;
  school: string;
  totalCommits: string;
  fiveStars: string;
  fourStars: string;
  threeStars: string;
  averageRating: string;
  points: string;
}

export interface Data {
  teams: TeamElement[];
  players: Player[];
  id: number;
}

export interface Player {
  displayOrder: number;
  team: PlayerTeam;
  statistics: PlayerStatistic[];
}

export interface PlayerStatistic {
  keys: string[];
  name: string;
  athletes: AthleteElement[];
  text: string;
  totals: string[];
  descriptions: string[];
  labels: string[];
}

export interface AthleteElement {
  athlete: AthleteAthlete;
  stats: string[];
}

export interface AthleteAthlete {
  uid: string;
  firstName: string;
  lastName: string;
  displayName: string;
  jersey: string;
  guid: string;
  links: Link[];
  id: string;
}

export interface Link {
  rel: Rel[];
  href: string;
  text: Text;
}

export enum Rel {
  Athlete = "athlete",
  Desktop = "desktop",
  Playercard = "playercard",
}

export enum Text {
  PlayerCard = "Player Card",
}

export interface PlayerTeam {
  shortDisplayName: string;
  uid: string;
  alternateColor: string;
  color: string;
  displayName: string;
  name: string;
  logo: string;
  location: string;
  id: string;
  abbreviation: string;
  slug: string;
}

export interface TeamElement {
  homeAway: string;
  displayOrder: number;
  team: PlayerTeam;
  statistics: TeamStatistic[];
}

export interface TeamStatistic {
  displayValue: string;
  name: string;
  label: string;
}

interface ScoreboardParams {
  year: number;
  month: number;
  day: number;
  groups?: number;
  seasontype?: number;
  limit?: number;
}

export default {
  async getPlayByPlay(id: number): Promise<any> {
    const baseUrl = "http://cdn.espn.com/core/college-football/playbyplay";
    const params = {
      gameId: id,
      xhr: 1,
      render: "false",
      userab: 18,
      t: Date.now(),
    };

    const res = await axios.get(baseUrl, { params });

    return {
      teams: res.data.gamepackageJSON.header.competitions[0].competitors,
      id: res.data.gameId,
      drives: res.data.gamepackageJSON.drives,
      competitions: res.data.gamepackageJSON.header.competitions,
      season: res.data.gamepackageJSON.header.season,
      week: res.data.gamepackageJSON.header.week,
      boxScore: res.data.gamepackageJSON.boxscore,
      scoringPlays: res.data.gamepackageJSON.scoringPlays,
      standings: res.data.gamepackageJSON.standings,
    };
  },

  async getBoxScore(id: number): Promise<Data> {
    const baseUrl = "http://cdn.espn.com/core/college-football/boxscore";
    const params = {
      gameId: id,
      xhr: 1,
      render: false,
      device: "desktop",
      userab: 18,
    };

    const res = await axios.get(baseUrl, { params });
    const game = res.data.gamepackageJSON.boxscore;
    game.id = res.data.gameId;

    return game;
  },

  async getSummary(id: number): Promise<any> {
    const baseUrl =
      "http://site.api.espn.com/apis/site/v2/sports/football/college-football/summary";
    const params = { event: id };

    const res = await axios.get(baseUrl, { params });

    return {
      id: parseInt(res.data.header.id),
      boxScore: res.data.boxscore,
      gameInfo: res.data.gameInfo,
      drives: res.data.drives,
      leaders: res.data.leaders,
      header: res.data.header,
      teams: res.data.header.competitions[0].competitors,
      scoringPlays: res.data.scoringPlays,
      winProbability: res.data.winprobability,
      competitions: res.data.header.competitions,
      season: res.data.header.season,
      week: res.data.header.week,
      standings: res.data.standings,
    };
  },

  async getPicks(id: number): Promise<any> {
    const baseUrl =
      "http://site.api.espn.com/apis/site/v2/sports/football/college-football/summary";
    const params = { event: id, t: Date.now() };

    const res = await axios.get(baseUrl, { params });

    return {
      id: parseInt(res.data.header.id),
      gameInfo: res.data.gameInfo,
      leaders: res.data.leaders,
      header: res.data.header,
      teams: res.data.header.competitions[0].competitors,
      competitions: res.data.header.competitions,
      winProbability: res.data.winprobability,
      pickcenter: res.data.winprobability,
      againstTheSpread: res.data.againstTheSpread,
      odds: res.data.odds,
      season: res.data.header.season,
      week: res.data.header.week,
      standings: res.data.standings,
      predictor: res.data.predictor,
    };
  },

  async getPlayerRankings({
    year,
    page = 1,
    group = "HighSchool",
    position = null,
    state = null,
  }: {
    year: number;
    page?: number;
    group?: string;
    position?: string | null;
    state?: string | null;
  }): Promise<PlayerRanking[]> {
    const baseUrl = `http://247sports.com/Season/${year}-Football/CompositeRecruitRankings`;
    const params = {
      InstitutionGroup: group,
      Page: page,
      Position: position,
      State: state,
    };

    const res = await axios.get(baseUrl, {
      headers: { "User-Agent": "Mozilla/5.0 ..." },
      params,
    });

    const $ = cheerio.load(res.data);
    const players: PlayerRanking[] = [];
    let rank = 1 + 50 * (page - 1);

    $(
      "ul.rankings-page__list > li.rankings-page__list-item:not(.rankings-page__list-item--header)"
    ).each(function () {
      const html = $(this);
      const metrics = html.find(".metrics").text().split("/");

      players.push({
        ranking: rank++,
        name: html.find(".rankings-page__name-link").text().trim(),
        highSchool: html.find("span.meta").text().trim(),
        position: html.find(".position").text().trim(),
        height: metrics[0],
        weight: metrics[1],
        stars: html.find(".rankings-page__star-and-score > .yellow").length,
        rating: html.find(".score").text().trim(),
        college: html.find(".img-link > img").attr("title") || "uncommitted",
      });
    });

    return players;
  },

  async getSchoolRankings(year: number, page = 1): Promise<SchoolRanking[]> {
    const baseUrl = `http://247sports.com/Season/${year}-Football/CompositeTeamRankings`;
    const res = await axios.get(baseUrl, {
      headers: { "User-Agent": "Mozilla/5.0 ..." },
      params: { Page: page },
    });

    const $ = cheerio.load(res.data);
    const schools: SchoolRanking[] = [];

    $(".rankings-page__list-item").each(function () {
      const html = $(this);

      schools.push({
        rank: html.find(".rank-column .primary").text().trim(),
        school: html.find(".rankings-page__name-link").text().trim(),
        totalCommits: html.find(".total a").text().trim(),
        fiveStars: $(html.find("ul.star-commits-list > li > div")[0])
          .text()
          .replace("5: ", "")
          .trim(),
        fourStars: $(html.find("ul.star-commits-list > li > div")[1])
          .text()
          .replace("4: ", "")
          .trim(),
        threeStars: $(html.find("ul.star-commits-list > li > div")[2])
          .text()
          .replace("3: ", "")
          .trim(),
        averageRating: html.find(".avg").text().trim(),
        points: html.find(".number").text().trim(),
      });
    });

    return schools;
  },

  async getSchedule({
    year,
    month,
    day,
    groups = 80,
    seasontype = 2,
  }: {
    year: number;
    month: number;
    day: number;
    groups?: number;
    seasontype?: number;
  }): Promise<any> {
    const baseUrl = `http://cdn.espn.com/core/college-football/schedule`;
    const params = {
      groups,
      seasontype,
      xhr: 1,
      render: false,
      device: "desktop",
      userab: 18,
      dates:
        year && month && day
          ? `${year}${month <= 9 ? "0" + month : month}${
              day <= 9 ? "0" + day : day
            }`
          : null,
    };

    const res = await axios.get(baseUrl, { params });
    return res.data.content.schedule;
  },

  async getScoreboard({
    year,
    month,
    day,
    groups = 80,
    seasontype = 2,
    limit = 300,
  }: ScoreboardParams): Promise<any> {
    const baseUrl = `http://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard`;
    const params: Record<string, any> = {
      groups,
      seasontype,
      limit,
      t: Date.now(),
    };

    if (year && month && day) {
      params.dates = `${year}${month <= 9 ? "0" + month : month}${
        day <= 9 ? "0" + day : day
      }`;
    }

    const res = await axios.get(baseUrl, { params });
    return res.data;
  },
};
