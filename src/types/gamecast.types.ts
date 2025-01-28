export interface GameCast {
  teams: CompetitorElement[];
  id: number;
  drives: Drives | null;
  competitions: Competition[];
  season: Season;
  week: number;
  boxScore: BoxScore;
  scoringPlays: ScoringPlay[];
  standings: GameCastStandings;
}

export interface BoxScore {
  teams: BoxScoreTeam[];
  players: Player[];
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
  links: AthleteLink[];
  id: string;
}

export interface AthleteLink {
  rel: Rel[];
  href: string;
  text: Text;
}

export enum Rel {
  Athlete = "athlete",
  Clubhouse = "clubhouse",
  Desktop = "desktop",
  Playercard = "playercard",
  Team = "team",
}

export enum Text {
  Clubhouse = "Clubhouse",
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

export interface BoxScoreTeam {
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

export interface Competition {
  date: string;
  commentaryAvailable: boolean;
  conferenceCompetition: boolean;
  liveAvailable: boolean;
  broadcasts: Broadcast[];
  playByPlaySource: BoxscoreSource;
  uid: string;
  competitors: CompetitorElement[];
  onWatchESPN: boolean;
  boxscoreAvailable: boolean;
  id: string;
  neutralSite: boolean;
  recent: boolean;
  boxscoreSource: BoxscoreSource;
  status: CompetitionStatus;
}

export enum BoxscoreSource {
  Dark = "dark",
  Default = "default",
  Full = "full",
  Scoreboard = "scoreboard",
}

export interface Broadcast {
  market: Market;
  media: Media;
  type: BroadcastType;
  lang: string;
  region: string;
}

export interface Market {
  id: string;
  type: string;
}

export interface Media {
  shortName: string;
}

export interface BroadcastType {
  id: string;
  shortName: string;
}

export interface CompetitorElement {
  uid: string;
  homeAway: string;
  score: string;
  timeoutsUsed: number;
  record: Record[];
  possession: boolean;
  id: string;
  team: CompetitorTeam;
  linescores: TimeElapsed[];
  order: number;
}

export interface TimeElapsed {
  displayValue: string;
}

export interface Record {
  summary: string;
  displayValue: string;
  type: string;
}

export interface CompetitorTeam {
  uid: string;
  alternateColor: string;
  color: string;
  displayName: string;
  name: string;
  nickname: string;
  location: string;
  links: AthleteLink[];
  id: string;
  abbreviation: string;
  logos: Logo[];
}

export interface Logo {
  lastUpdated: LastUpdated;
  width: number;
  alt: string;
  rel: BoxscoreSource[];
  href: string;
  height: number;
}

export enum LastUpdated {
  The20240625T1844Z = "2024-06-25T18:44Z",
  The20240625T1845Z = "2024-06-25T18:45Z",
  The20240625T1846Z = "2024-06-25T18:46Z",
  The20240625T1847Z = "2024-06-25T18:47Z",
  The20240625T1856Z = "2024-06-25T18:56Z",
}

export interface CompetitionStatus {
  period: number;
  displayClock: string;
  isTBDFlex: boolean;
  type: StatusType;
}

export interface StatusType {
  name: string;
  description: string;
  id: string;
  state: string;
  completed: boolean;
  detail: string;
  shortDetail: string;
}

export interface Drives {
  current: Current;
  previous: Previous[];
}

export interface Current {
  timeElapsed: TimeElapsed;
  isScore: boolean;
  plays: CurrentPlay[];
  start: Start;
  description: string;
  offensivePlays: number;
  id: string;
  team: CurrentTeam;
  yards: number;
  displayResult: string;
}

export interface CurrentPlay {
  sequenceNumber: string;
  period: PlayPeriod;
  homeScore: number;
  start: End;
  scoringPlay: boolean;
  clock: TimeElapsed;
  type: PlayType;
  priority: boolean;
  statYardage: number;
  awayScore: number;
  wallclock: Date;
  modified: string;
  end: End;
  id: string;
  text: string;
  scoreValue?: number;
  participants?: Participant[];
}

export interface End {
  shortDownDistanceText?: string;
  possessionText?: string;
  downDistanceText?: string;
  distance: number;
  yardLine: number;
  team?: EndTeam;
  down: number;
  yardsToEndzone: number;
}

export interface EndTeam {
  id: string;
}

export interface Participant {
  athlete: ParticipantAthlete;
  stats: ParticipantStat[];
  type: string;
}

export interface ParticipantAthlete {
  lastName: string;
  displayName: string;
  collegeAthlete: CollegeAthlete;
  fullName: string;
  team: AthleteTeam;
  uid: string;
  headshot: Headshot;
  jersey: string;
  guid: string;
  links: AthleteLink[];
  id: string;
  position: ScoringType;
  shortName: string;
  status: AthleteStatus;
}

export interface CollegeAthlete {
  $ref: string;
}

export interface Headshot {
  alt: string;
  href: string;
}

export interface ScoringType {
  displayName: string;
  name: string;
  abbreviation: string;
}

export interface AthleteStatus {
  name: string;
  id: string;
  type: string;
  abbreviation: string;
}

export interface AthleteTeam {
  abbreviation: string;
}

export interface ParticipantStat {
  displayValue: string;
  name: string;
}

export interface PlayPeriod {
  number: number;
}

export interface PlayType {
  id: string;
  text: string;
  abbreviation?: string;
}

export interface Start {
  period: StartPeriod;
  yardLine: number;
  clock: TimeElapsed;
  text: string;
}

export interface StartPeriod {
  number: number;
  type: TypeEnum;
}

export enum TypeEnum {
  Quarter = "quarter",
}

export interface CurrentTeam {
  shortDisplayName: string;
  displayName: string;
  name: string;
  abbreviation: string;
  logos: Logo[];
}

export interface Previous {
  displayResult?: string;
  isScore: boolean;
  plays: PreviousPlay[];
  start: Start;
  description: string;
  team: CurrentTeam;
  yards: number;
  timeElapsed: TimeElapsed;
  result?: string;
  offensivePlays: number;
  end?: Start;
  id: string;
  shortDisplayResult?: string;
}

export interface PreviousPlay {
  sequenceNumber: string;
  period: PlayPeriod;
  homeScore: number;
  start: End;
  scoringPlay: boolean;
  clock: TimeElapsed;
  type: PlayType;
  priority: boolean;
  statYardage: number;
  awayScore: number;
  wallclock: Date;
  modified: string;
  end: End;
  id: string;
  text: string;
  scoringType?: ScoringType;
  pointAfterAttempt?: PointAfterAttempt;
}

export interface PointAfterAttempt {
  id: number;
  text: string;
  abbreviation: string;
  value: number;
}

export interface ScoringPlay {
  period: PlayPeriod;
  homeScore: number;
  awayScore: number;
  scoringType: ScoringType;
  id: string;
  text: string;
  clock: Clock;
  team: ScoringPlayTeam;
  type: PlayType;
}

export interface Clock {
  displayValue: string;
  value: number;
}

export interface ScoringPlayTeam {
  uid: string;
  displayName: string;
  logo: string;
  links: FullViewLinkElement[];
  id: string;
  abbreviation: string;
  logos: Logo[];
}

export interface FullViewLinkElement {
  href: string;
  text: string;
}

export interface Season {
  year: number;
  type: number;
}

export interface GameCastStandings {
  fullViewLink: FullViewLinkElement;
  groups: Group[];
}

export interface Group {
  header: string;
  href: string;
  standings: GroupStandings;
}

export interface GroupStandings {
  entries: Entry[];
}

export interface Entry {
  uid: string;
  stats: EntryStat[];
  link: string;
  logo: Logo[];
  team: string;
  id: string;
}

export interface EntryStat {
  shortDisplayName?: string;
  displayValue: string;
  displayName?: string;
  name: string;
  description?: string;
  abbreviation: string;
  type: string;
  value?: number;
  summary?: string;
  id?: string;
}
