import axios from "axios";

interface PlayByPlayResponse {
  teams: any;
  id: number;
  drives: any;
  competitions: any;
  season: any;
  week: any;
  boxScore: any;
  scoringPlays: any;
  standings: any;
}

interface BoxScoreResponse {
  id: number;
  [key: string]: any;
}

interface SummaryResponse {
  id: number;
  boxScore: any;
  gameInfo: any;
  drives: any;
  leaders: any;
  header: any;
  teams: any;
  scoringPlays: any;
  winProbability: any;
  competitions: any;
  season: any;
  week: any;
  standings: any;
}

interface PicksResponse {
  id: number;
  gameInfo: any;
  leaders: any;
  header: any;
  teams: any;
  competitions: any;
  winProbability: any;
  pickcenter: any;
  againstTheSpread: any;
  odds: any;
  season: any;
  week: any;
  standings: any;
}

interface ScoreboardParams {
  year?: number;
  month?: number;
  day?: number;
  limit?: number;
}

interface ScheduleParams {
  year?: number;
  month?: number;
  day?: number;
}

interface WeeklyScheduleParams {
  week?: number;
  year?: number;
  seasonType?: number;
}

interface StandingsParams {
  year?: number;
  group?: "league" | "conference" | "division";
}

interface TeamInfoParams {
  id: number;
}

export default {
  async getPlayByPlay(id: number): Promise<PlayByPlayResponse> {
    const baseUrl = "http://cdn.espn.com/core/nfl/playbyplay";
    const params = {
      gameId: id,
      xhr: 1,
      render: "false",
      userab: 18,
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

  async getBoxScore(id: number): Promise<BoxScoreResponse> {
    const baseUrl = "http://cdn.espn.com/core/nfl/boxscore";
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

  async getSummary(id: number): Promise<SummaryResponse> {
    const baseUrl =
      "http://site.api.espn.com/apis/site/v2/sports/football/nfl/summary";
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

  async getPicks(id: number): Promise<PicksResponse> {
    const baseUrl =
      "http://site.api.espn.com/apis/site/v2/sports/football/nfl/summary";
    const params = { event: id };
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
    };
  },

  async getSchedule(params: ScheduleParams): Promise<any> {
    const { year, month, day } = params;
    const baseUrl = `http://cdn.espn.com/core/nfl/schedule?dates=${year}${
      month && month <= 9 ? "0" + month : month
    }${day && day <= 9 ? "0" + day : day}`;
    const requestParams = {
      xhr: 1,
      render: false,
      device: "desktop",
      userab: 18,
    };
    const res = await axios.get(baseUrl, { params: requestParams });
    return res.data.content.schedule;
  },

  async getWeeklySchedule(params: WeeklyScheduleParams): Promise<any> {
    const { week = 1, seasonType = 2 } = params;
    let { year } = params;
    if (!year) year = new Date().getFullYear();
    const baseUrl = `http://cdn.espn.com/core/nfl/schedule/_/week/${week}/year/${year}/seasontype/${seasonType}`;
    const requestParams = {
      xhr: 1,
      render: false,
      device: "desktop",
      userab: 18,
    };
    const res = await axios.get(baseUrl, { params: requestParams });
    return res.data.content.schedule;
  },

  async getScoreboard(params: ScoreboardParams): Promise<any> {
    const baseUrl =
      "http://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard";
    const requestParams: any = {
      limit: params.limit ?? 300,
    };
    if (params.year && params.month && params.day) {
      requestParams.dates = `${params.year}${
        params.month <= 9 ? "0" + params.month : params.month
      }${params.day <= 9 ? "0" + params.day : params.day}`;
    }
    const res = await axios.get(baseUrl, { params: requestParams });
    return res.data;
  },

  async getStandings(params: StandingsParams): Promise<any> {
    const { year = new Date().getFullYear(), group = "league" } = params;
    const groupId = group === "league" ? 1 : group === "conference" ? 2 : 3;
    const baseUrl =
      "https://site.web.api.espn.com/apis/v2/sports/football/nfl/standings";
    const requestParams = {
      region: "us",
      lang: "en",
      contentorigin: "espn",
      season: year,
      type: 1,
      level: groupId,
    };
    const res = await axios.get(baseUrl, { params: requestParams });
    return res.data;
  },

  async getTeamList(): Promise<any> {
    const baseUrl =
      "http://site.api.espn.com/apis/site/v2/sports/football/nfl/teams";
    const params = { limit: 1000 };
    const res = await axios.get(baseUrl, { params });
    return res.data;
  },

  async getTeamInfo(params: TeamInfoParams): Promise<any> {
    const baseUrl = `http://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${params.id}`;
    const res = await axios.get(baseUrl);
    return res.data;
  },

  async getTeamPlayers(params: TeamInfoParams): Promise<any> {
    const baseUrl = `http://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${params.id}`;
    const requestParams = { enable: "roster" };
    const res = await axios.get(baseUrl, { params: requestParams });
    return res.data;
  },
};
