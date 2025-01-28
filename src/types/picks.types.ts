export interface Picks {
  boxscore: Boxscore;
  format: Format;
  gameInfo: GameInfo;
  drives: Drives;
  leaders: PicksLeader[];
  broadcasts: PicksBroadcast[];
  predictor: Predictor;
  pickcenter: any[];
  againstTheSpread: AgainstTheSpread[];
  odds: any[];
  winProbability: Winprobability[];
  scoringPlays: ScoringPlay[];
  header: Header;
  videos: Video[];
  news: News;
  standings: PicksStandings;
}

export interface AgainstTheSpread {
  team: AgainstTheSpreadTeam;
  records: any[];
}

export interface AgainstTheSpreadTeam {
  id: string;
  uid: string;
  displayName: string;
  abbreviation: string;
  links: FullViewLinkElement[];
  logo: string;
  logos: LogoElement[];
}

export interface FullViewLinkElement {
  href: string;
  text: Text;
}

export enum Text {
  Clubhouse = "Clubhouse",
  FullStandings = "Full Standings",
  Schedule = "Schedule",
}

export interface LogoElement {
  href: string;
  width: number;
  height: number;
  alt: string;
  rel: BoxscoreSource[];
  lastUpdated?: string;
}

export enum BoxscoreSource {
  Dark = "dark",
  Day = "day",
  Default = "default",
  Full = "full",
  Interior = "interior",
  PrimaryLogoOnBlackColor = "primary_logo_on_black_color",
  PrimaryLogoOnPrimaryColor = "primary_logo_on_primary_color",
  PrimaryLogoOnSecondaryColor = "primary_logo_on_secondary_color",
  PrimaryLogoOnWhiteColor = "primary_logo_on_white_color",
  SecondaryLogoOnBlackColor = "secondary_logo_on_black_color",
  SecondaryLogoOnPrimaryColor = "secondary_logo_on_primary_color",
  SecondaryLogoOnSecondaryColor = "secondary_logo_on_secondary_color",
  SecondaryLogoOnWhiteColor = "secondary_logo_on_white_color",
}

export interface Boxscore {
  teams: TeamElement[];
  players: Player[];
}

export interface Player {
  team: PlayerTeam;
  statistics: PlayerStatistic[];
  displayOrder: number;
}

export interface PlayerStatistic {
  name: string;
  keys: string[];
  text: string;
  labels: string[];
  descriptions: string[];
  athletes: AthleteElement[];
  totals: string[];
}

export interface AthleteElement {
  athlete: AthleteAthlete;
  stats: string[];
}

export interface AthleteAthlete {
  id: string;
  uid: string;
  guid: string;
  firstName: string;
  lastName: string;
  displayName: string;
  links: AthleteLink[];
  jersey: string;
}

export interface AthleteLink {
  rel: string[];
  href: string;
  text: string;
}

export interface PlayerTeam {
  id: string;
  uid: string;
  slug: string;
  location: string;
  name: string;
  abbreviation: string;
  displayName: string;
  shortDisplayName: string;
  color: string;
  alternateColor: string;
  logo: string;
}

export interface TeamElement {
  team: PlayerTeam;
  statistics: TeamStatistic[];
  displayOrder: number;
  homeAway: string;
}

export interface TeamStatistic {
  name: string;
  displayValue: string;
  label: string;
}

export interface PicksBroadcast {
  type: PurpleType;
  station: string;
  market: Market;
  media: PurpleMedia;
  lang: string;
  region: string;
}

export interface Market {
  id: string;
  type: string;
}

export interface PurpleMedia {
  callLetters: string;
  name: string;
  shortName: string;
}

export interface PurpleType {
  id: string;
  shortName: string;
  longName: string;
  slug: string;
}

export interface Drives {
  current: Current;
  previous: Previous[];
}

export interface Current {
  id: string;
  description: string;
  team: CurrentTeam;
  start: CurrentEnd;
  end: CurrentEnd;
  timeElapsed: TimeElapsed;
  yards: number;
  isScore: boolean;
  offensivePlays: number;
  result: string;
  shortDisplayResult: string;
  displayResult: string;
  plays: CurrentPlay[];
}

export interface CurrentEnd {
  period: EndPeriod;
  clock: TimeElapsed;
  yardLine: number;
  text: string;
}

export interface TimeElapsed {
  displayValue: string;
}

export interface EndPeriod {
  type: string;
  number: number;
}

export interface CurrentPlay {
  id: string;
  sequenceNumber: string;
  type: PlayType;
  text: string;
  awayScore: number;
  homeScore: number;
  period: PlayPeriod;
  clock: TimeElapsed;
  scoringPlay: boolean;
  priority: boolean;
  modified: string;
  wallclock: Date;
  start: PlayEnd;
  end: PlayEnd;
  statYardage: number;
  scoreValue?: number;
  participants?: Participant[];
  mediaId?: string;
  scoringType?: ScoringType;
  pointAfterAttempt?: PointAfterAttempt;
}

export interface PlayEnd {
  down: number;
  distance: number;
  yardLine: number;
  yardsToEndzone: number;
  downDistanceText?: string;
  shortDownDistanceText?: string;
  possessionText?: string;
  team: EndTeam;
}

export interface EndTeam {
  id: string;
}

export interface Participant {
  athlete: ParticipantAthlete;
  type: string;
  stats: any[];
}

export interface ParticipantAthlete {
  id: string;
  uid: string;
  guid: string;
  lastName: string;
  fullName: string;
  displayName: string;
  shortName: string;
  links: AthleteLink[];
  headshot: Headshot;
  jersey: string;
  position: ScoringType;
  team: PositionClass;
  status: AthleteStatus;
}

export interface Headshot {
  href: string;
  alt: string;
}

export interface ScoringType {
  name: string;
  displayName: string;
  abbreviation: string;
}

export interface AthleteStatus {
  id: string;
  name: NameEnum;
  type: StatusTypeEnum;
  abbreviation: NameEnum;
}

export enum NameEnum {
  Active = "Active",
}

export enum StatusTypeEnum {
  Active = "active",
}

export interface PositionClass {
  abbreviation: string;
}

export interface PlayPeriod {
  number: number;
}

export interface PointAfterAttempt {
  id: number;
  text: string;
  abbreviation: string;
  value: number;
}

export interface PlayType {
  id: string;
  text: string;
  abbreviation?: string;
}

export interface CurrentTeam {
  name: string;
  abbreviation: string;
  displayName: string;
  shortDisplayName: string;
  logos: LogoElement[];
}

export interface Previous {
  id: string;
  description: string;
  team: CurrentTeam;
  start: CurrentEnd;
  end: CurrentEnd;
  timeElapsed: TimeElapsed;
  yards: number;
  isScore: boolean;
  offensivePlays: number;
  result: string;
  shortDisplayResult: string;
  displayResult: string;
  plays: PreviousPlay[];
}

export interface PreviousPlay {
  id: string;
  sequenceNumber: string;
  type: PlayType;
  text: string;
  awayScore: number;
  homeScore: number;
  period: PlayPeriod;
  clock: TimeElapsed;
  scoringPlay: boolean;
  priority: boolean;
  modified: string;
  wallclock: Date;
  start: PlayEnd;
  end: PlayEnd;
  statYardage: number;
  mediaId?: string;
  scoringType?: ScoringType;
  pointAfterAttempt?: PointAfterAttempt;
}

export interface Format {
  regulation: Overtime;
  overtime: Overtime;
}

export interface Overtime {
  periods: number;
  displayName: string;
  slug: string;
  clock?: number;
}

export interface GameInfo {
  venue: Venue;
  weather: Weather;
}

export interface Venue {
  id: string;
  fullName: string;
  address: Address;
  grass: boolean;
  images: LogoElement[];
}

export interface Address {
  city: string;
  state: string;
  zipCode: string;
}

export interface Weather {
  temperature: number;
  highTemperature: number;
  lowTemperature: number;
  conditionId: string;
  gust: number;
  precipitation: number;
  link: WeatherLink;
}

export interface WeatherLink {
  language?: string;
  rel: string[];
  href: string;
  text: string;
  shortText: string;
  isExternal: boolean;
  isPremium: boolean;
}

export interface Header {
  id: string;
  uid: string;
  season: Season;
  timeValid: boolean;
  competitions: Competition[];
  links: WeatherLink[];
  week: number;
  league: HeaderLeague;
}

export interface Competition {
  id: string;
  uid: string;
  date: string;
  dateValid: boolean;
  neutralSite: boolean;
  conferenceCompetition: boolean;
  boxscoreAvailable: boolean;
  commentaryAvailable: boolean;
  liveAvailable: boolean;
  onWatchESPN: boolean;
  recent: boolean;
  boxscoreSource: BoxscoreSource;
  playByPlaySource: BoxscoreSource;
  competitors: Competitor[];
  status: CompetitionStatus;
  broadcasts: CompetitionBroadcast[];
  groups: Groups;
}

export interface CompetitionBroadcast {
  type: FluffyType;
  market: Market;
  media: FluffyMedia;
  lang: string;
  region: string;
}

export interface FluffyMedia {
  shortName: string;
}

export interface FluffyType {
  id: string;
  shortName: string;
}

export interface Competitor {
  id: string;
  uid: string;
  order: number;
  homeAway: string;
  team: CompetitorTeam;
  score: string;
  linescores: TimeElapsed[];
  record: Record[];
  timeoutsUsed: number;
  possession: boolean;
  rank?: number;
}

export interface Record {
  type: RecordType;
  summary: string;
  displayValue: string;
}

export enum RecordType {
  Total = "total",
  Vsconf = "vsconf",
}

export interface CompetitorTeam {
  id: string;
  uid: string;
  location: string;
  name: string;
  nickname: string;
  abbreviation: string;
  displayName: string;
  color: string;
  alternateColor: string;
  logos: LogoElement[];
  links: AthleteLink[];
}

export interface Groups {
  id: string;
  name: string;
  abbreviation: string;
  shortName: string;
  midsizeName: string;
}

export interface CompetitionStatus {
  displayClock: string;
  period: number;
  type: StatusTypeClass;
}

export interface StatusTypeClass {
  id: string;
  name: string;
  state: string;
  completed: boolean;
  description: string;
  detail: string;
  shortDetail: string;
}

export interface HeaderLeague {
  id: string;
  uid: string;
  name: string;
  abbreviation: string;
  midsizeName: string;
  slug: string;
  isTournament: boolean;
  links: AthleteLink[];
}

export interface Season {
  year: number;
  type: number;
}

export interface PicksLeader {
  team: AgainstTheSpreadTeam;
  leaders: PurpleLeader[];
}

export interface PurpleLeader {
  name: string;
  displayName: string;
  leaders: FluffyLeader[];
}

export interface FluffyLeader {
  displayValue: string;
  athlete: LeaderAthlete;
}

export interface LeaderAthlete {
  id: string;
  uid: string;
  guid: string;
  lastName: string;
  fullName: string;
  displayName: string;
  shortName: string;
  links: AthleteLink[];
  headshot: Headshot;
  jersey: string;
  position: PositionClass;
  status: AthleteStatus;
}

export interface News {
  header: string;
  link: WeatherLink;
  articles: Article[];
}

export interface Article {
  images: ArticleImage[];
  dataSourceIdentifier: string;
  description: string;
  published: Date;
  type: string;
  premium: boolean;
  links: ArticleLinks;
  lastModified: Date;
  categories: Category[];
  headline: string;
}

export interface Category {
  id?: number;
  description?: string;
  type: CategoryType;
  sportId?: number;
  leagueId?: number;
  league?: CategoryLeague;
  uid?: string;
  createDate: Date;
  teamId?: number;
  team?: CategoryTeam;
  topicId?: number;
  guid?: string;
  athleteId?: number;
  athlete?: CategoryAthlete;
}

export interface CategoryAthlete {
  id: number;
  description: string;
  links: AthleteLinks;
}

export interface AthleteLinks {
  api: PurpleAPI;
  web: PurpleAPI;
  mobile: PurpleAPI;
}

export interface PurpleAPI {
  athletes: Sportscenter;
}

export interface Sportscenter {
  href: string;
}

export interface CategoryLeague {
  id: number;
  description: string;
  links: LeagueLinks;
}

export interface LeagueLinks {
  api: FluffyAPI;
  web: FluffyAPI;
  mobile: FluffyAPI;
}

export interface FluffyAPI {
  leagues: Sportscenter;
}

export interface CategoryTeam {
  id: number;
  description: string;
  links: TeamLinks;
}

export interface TeamLinks {
  api: TentacledAPI;
  web: TentacledAPI;
  mobile: TentacledAPI;
}

export interface TentacledAPI {
  teams: Sportscenter;
}

export enum CategoryType {
  Athlete = "athlete",
  GUID = "guid",
  League = "league",
  Team = "team",
  Topic = "topic",
}

export interface ArticleImage {
  name: string;
  width: number;
  alt: string;
  caption: string;
  url: string;
  height: number;
}

export interface ArticleLinks {
  api: StickyAPI;
  web: Sportscenter;
}

export interface StickyAPI {
  news: Sportscenter;
  self: Sportscenter;
}

export interface Predictor {
  header: string;
  homeTeam: Team;
  awayTeam: Team;
}

export interface Team {
  id: string;
  gameProjection: string;
  teamChanceLoss: string;
}

export interface ScoringPlay {
  id: string;
  type: PlayType;
  text: string;
  awayScore: number;
  homeScore: number;
  period: PlayPeriod;
  clock: Clock;
  team: AgainstTheSpreadTeam;
  scoringType: ScoringType;
}

export interface Clock {
  value: number;
  displayValue: string;
}

export interface PicksStandings {
  fullViewLink: FullViewLinkElement;
  groups: Group[];
}

export interface Group {
  standings: GroupStandings;
  header: string;
}

export interface GroupStandings {
  entries: Entry[];
}

export interface Entry {
  team: string;
  link: string;
  id: string;
  uid: string;
  stats: Stat[];
  logo: LogoElement[];
}

export interface Stat {
  id: string;
  name: Name;
  abbreviation: StatAbbreviation;
  displayName: DisplayName;
  shortDisplayName: ShortDisplayName;
  description: Description;
  type: RecordType;
  summary: string;
  displayValue: string;
}

export enum StatAbbreviation {
  Conf = "CONF",
  Overall = "overall",
}

export enum Description {
  ConferenceRecord = "Conference Record",
  OverallRecord = "Overall Record",
}

export enum DisplayName {
  Overall = "Overall",
  VsConference = "vs. Conference",
}

export enum Name {
  Overall = "overall",
  VsConf = "vs. Conf.",
}

export enum ShortDisplayName {
  Conf = "CONF",
  Over = "OVER",
}

export interface Video {
  id: number;
  cerebroId: string;
  source: string;
  headline: string;
  description: string;
  lastModified: Date;
  originalPublishDate: Date;
  duration: number;
  timeRestrictions: TimeRestrictions;
  deviceRestrictions: DeviceRestrictions;
  thumbnail: string;
  links: VideoLinks;
  ad: Ad;
  tracking: Tracking;
  playId: string;
}

export interface Ad {
  sport: string;
  bundle: string;
}

export interface DeviceRestrictions {
  type: string;
  devices: string[];
}

export interface VideoLinks {
  web: Web;
  mobile: Mobile;
  api: IndigoAPI;
  source: Source;
  sportscenter: Sportscenter;
}

export interface IndigoAPI {
  self: Sportscenter;
  artwork: Sportscenter;
}

export interface Mobile {
  href: string;
  source: Sportscenter;
  alert: Sportscenter;
  streaming: Sportscenter;
  progressiveDownload: Sportscenter;
}

export interface Source {
  href: string;
  mezzanine: Sportscenter;
  flash: Sportscenter;
  hds: Sportscenter;
  HLS: HLS;
  HD: Sportscenter;
  full: Sportscenter;
}

export interface HLS {
  href: string;
  HD: Sportscenter;
}

export interface Web {
  href: string;
  self: Self;
  seo: Sportscenter;
}

export interface Self {
  href: string;
  dsi: Sportscenter;
}

export interface TimeRestrictions {
  embargoDate: Date;
  expirationDate: Date;
}

export interface Tracking {
  sportName: string;
  leagueName: string;
  coverageType: string;
  trackingName: string;
  trackingId: string;
}

export interface Winprobability {
  tiePercentage: number;
  homeWinPercentage: number;
  secondsLeft: number;
  playId: string;
}
