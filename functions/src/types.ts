export type WeekDocument = {
  id: string;
  name: string;
  games?: GameDocument[];
  picks?: { [uid: string]: PickDocument[] };
  payments?: {
    [uid: string]: {
      paid: boolean;
    };
  };
  chats?: ChatDocument[];
  createdAt?: number;
  from?: string;
  to?: string;
  published?: boolean;
};

export type ChatDocument = {
  message: string;
  timestamp: number;
  displayName?: string;
  uid: string;
};

export type GameDocument = {
  id: string;
  sport: "americanfootball_ncaaf" | "americanfootball_nfl" | "custom";
  home: string;
  away: string;
  home_spread: number;
  away_spread: number;
  overUnder: number;
  config?: {
    pickMethod?: "both" | "either";
    enabled?: boolean;
  };
  results?: {
    winner?: "home" | "away" | "push";
    overUnder?: "over" | "under" | "push";
  };
  currentScore?: {
    home: number;
    away: number;
    last_update: string | null;
  };
  commence_time?: string;
  locked?: boolean;
};

export type PickDocument = {
  game: string;
  winner?: "home" | "away";
  overUnder?: "over" | "under";
};

export type UserDocument = {
  week: string;
  displayName?: string;
  isAdmin?: boolean;
};

export type OddsResponse = {
  id: string;
  sport_key: "americanfootball_ncaaf" | "americanfootball_nfl";
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: {
    key: string;
    title: string;
    last_update: string;
    markets: {
      key: "spreads" | "totals";
      last_update: string;
      outcomes: {
        name: OddsResponse["away_team"] | OddsResponse["home_team"];
        price: number;
        point: number;
      }[];
    }[];
  }[];
};

export type ScoresResponse = {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  completed: Boolean;
  home_team: string;
  away_team: string;
  scores:
    | [
        {
          name: ScoresResponse["home_team"];
          score: string;
        },
        {
          name: ScoresResponse["away_team"];
          score: string;
        }
      ]
    | null;
  last_update: string | null;
};

export type RankingsResponse = {
  season: number;
  seasonType: "regular" | "postseason";
  week: number;
  polls: {
    poll: "AP Top 25" | "Coaches Poll" | "FCS Coaches Poll";
    ranks: {
      rank: number;
      school: string;
      conference: string;
      firstPlaceVotes: number;
      points: number;
    }[];
  }[];
};

export type TeamsResponse = {
  id: number;
  school: string;
  mascot: string;
  abbreviation: string;
  alt_name1: string | null;
  alt_name2: string;
  alt_name3: string;
  conference: string;
  classification: "fcs" | "ncaa";
  color: string;
  alt_color: string;
  logos: string[];
  twitter: string;
  location: {
    venue_id: number;
    name: string;
    city: string;
    state: string;
    zip: string;
    country_code: string;
    timezone: string;
    latitude: number;
    longitude: number;
    elevation: string;
    capacity: number;
    year_constructed: number;
    grass: boolean;
    dome: boolean;
  };
};

export type Stats = {
  wins: number;
  averagePercent: number;
  weeksPlayed: number;
  moneySpent: number;
  moneyWon: number;
  bestFinish: number;
  averageFinish: number;
  ncaaWins: number;
  totalNcaa: number;
  ncaaPercent: number;
  totalNfl: number;
  nflWins: number;
  nflPercent: number;
};