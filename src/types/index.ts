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
  commence_time: string;
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
  hideCompleted?: boolean;
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
  ncaaPercent: number;
  nflPercent: number;
};
export interface Scoreboard {
  events: Event[];
  leagues: League[];
}

export interface Event {
  id: string;
  weather: Weather;
  uid: string;
  shortName: string;
  week: Week;
  name: string;
  status: Status;
  links: EventLink[];
  season: EventSeason;
  competitions: Competition[];
  date: string;
}

export interface Competition {
  id: string;
  competitors: Competitor[];
  playByPlayAvailable: boolean;
  highlights: any[];
  geoBroadcasts: GeoBroadcast[];
  status: Status;
  type: CompetitionType;
  startDate: string;
  venue: Venue;
  format: Format;
  notes: any[];
  recent: boolean;
  date: string;
  timeValid: boolean;
  broadcasts: Broadcast[];
  broadcast: string;
  conferenceCompetition: boolean;
  situation?: Situation;
  leaders: CompetitionLeader[];
  neutralSite: boolean;
  attendance: number;
  uid: string;
}

export interface Broadcast {
  names: string[];
  market: string;
}

export interface Competitor {
  statistics: any[];
  team: CompetitorTeam;
  type: string;
  linescores: Linescore[];
  order: number;
  records: Record[];
  score: string;
  homeAway: string;
  id: string;
  uid: string;
}

export interface Linescore {
  value: number;
}

export interface Record {
  summary: string;
  name: string;
  abbreviation?: string;
  type: string;
}

export interface CompetitorTeam {
  name: string;
  uid: string;
  alternateColor: string;
  isActive: boolean;
  venue: VenueClass;
  color: string;
  shortDisplayName: string;
  location: string;
  logo: string;
  abbreviation: string;
  id: string;
  displayName: string;
  links: TeamLink[];
}

export interface TeamLink {
  text: string;
  rel: string[];
  isExternal: boolean;
  isPremium: boolean;
  href: string;
}

export interface VenueClass {
  id: string;
}

export interface Format {
  regulation: Regulation;
}

export interface Regulation {
  periods: number;
}

export interface GeoBroadcast {
  type: GeoBroadcastType;
  lang: string;
  region: string;
  market: Market;
  media: Media;
}

export interface Market {
  type: string;
  id: string;
}

export interface Media {
  shortName: string;
}

export interface GeoBroadcastType {
  id: string;
  shortName: string;
}

export interface CompetitionLeader {
  name: string;
  displayName: string;
  abbreviation: string;
  shortDisplayName: string;
  leaders: LeaderLeader[];
}

export interface LeaderLeader {
  displayValue: string;
  value: number;
  athlete: Athlete;
  team: VenueClass;
}

export interface Athlete {
  team: VenueClass;
  fullName: string;
  shortName: string;
  position: Position;
  links: AthleteLink[];
  id: string;
  displayName: string;
  headshot: string;
  active: boolean;
  jersey: string;
}

export interface AthleteLink {
  href: string;
  rel: Rel[];
}

export enum Rel {
  Athlete = "athlete",
  Desktop = "desktop",
  Playercard = "playercard",
}

export interface Position {
  abbreviation: string;
}

export interface Situation {
  possession: string;
  awayTimeouts: number;
  yardLine: number;
  shortDownDistanceText: string;
  downDistanceText: string;
  possessionText: string;
  isRedZone: boolean;
  down: number;
  distance: number;
  lastPlay?: LastPlay;
  homeTimeouts: number;
}

export interface LastPlay {
  probability: Probability;
  team: VenueClass;
  scoreValue: number;
  drive: Drive;
  type: LastPlayType;
  text: string;
  statYardage: number;
  athletesInvolved: AthletesInvolved[];
  id: string;
  end: End;
  start: End;
}

export interface AthletesInvolved {
  shortName: string;
  id: string;
  jersey: string;
  links: AthleteLink[];
  displayName: string;
  fullName: string;
  team: VenueClass;
  headshot: string;
  position: string;
}

export interface Drive {
  timeElapsed: TimeElapsed;
  start: Start;
  description: string;
}

export interface Start {
  yardLine: number;
  text: string;
}

export interface TimeElapsed {
  displayValue: string;
}

export interface End {
  yardLine: number;
  team: VenueClass;
}

export interface Probability {
  homeWinPercentage: number;
  tiePercentage: number;
  secondsLeft: number;
  awayWinPercentage: number;
}

export interface LastPlayType {
  abbreviation: string;
  id: string;
  text: string;
}

export interface Status {
  displayClock: string;
  clock: number;
  period: number;
  type: StatusType;
  isTBDFlex?: boolean;
}

export interface StatusType {
  description: string;
  id: string;
  shortDetail: string;
  state: string;
  completed: boolean;
  name: string;
  detail: string;
}

export interface CompetitionType {
  abbreviation: string;
  id: string;
}

export interface Venue {
  address: Address;
  fullName: string;
  id: string;
  indoor: boolean;
}

export interface Address {
  city: string;
  state: string;
}

export interface EventLink {
  isExternal: boolean;
  href: string;
  language: string;
  isPremium: boolean;
  shortText: string;
  rel: string[];
  text: string;
}

export interface EventSeason {
  year: number;
  type: number;
  slug: string;
}

export interface Weather {
  conditionId: string;
  highTemperature: number;
  temperature: number;
  link: EventLink;
  displayValue: string;
}

export interface Week {
  number: number;
}

export interface League {
  uid: string;
  abbreviation: string;
  name: string;
  season: LeagueSeason;
  calendarStartDate: string;
  calendarType: string;
  logos: Logo[];
  slug: string;
  calendar: Calendar[];
  calendarIsWhitelist: boolean;
  id: string;
  calendarEndDate: string;
}

export interface Calendar {
  label: string;
  startDate: string;
  entries: Entry[];
  value: string;
  endDate: string;
}

export interface Entry {
  startDate: string;
  detail: string;
  label: string;
  value: string;
  alternateLabel: string;
  endDate: string;
}

export interface Logo {
  width: number;
  lastUpdated: string;
  height: number;
  rel: string[];
  alt: string;
  href: string;
}

export interface LeagueSeason {
  endDate: string;
  year: number;
  displayName: string;
  type: SeasonType;
  startDate: string;
}

export interface SeasonType {
  id: string;
  abbreviation: string;
  name: string;
  type: number;
}