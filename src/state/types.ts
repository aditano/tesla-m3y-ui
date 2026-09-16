export type LngLat = [number, number];

export type Gear = "P" | "R" | "N" | "D";

export type TripPhase = "idle" | "routed" | "fsd" | "arrived" | "disengaged";

export type MapOrientation = "north" | "heading";

export type HeadlightMode = "off" | "parking" | "on" | "auto";

export type WiperMode = "off" | "auto" | "i" | "ii" | "iii" | "iiii";

export type RegenerativeBraking = "standard" | "low";

export type StoppingMode = "hold" | "roll" | "creep";

export type SteeringMode = "comfort" | "standard" | "sport";

export type AppearanceMode = "dark" | "light" | "auto";

export type RepeatMode = "off" | "one" | "all";

export type MediaSourceId = "radio" | "bluetooth" | "streaming";

export type TempPopup = "driver" | "passenger" | null;

export type ControlsTab =
  | "quick"
  | "dynamics"
  | "charging"
  | "autopilot"
  | "locks"
  | "lights"
  | "display"
  | "trips"
  | "navigation"
  | "safety"
  | "service"
  | "software"
  | "wifi";

export interface Place {
  name: string;
  label: string;
  lng: number;
  lat: number;
}

export interface Maneuver {
  type: string;
  modifier: string | null;
  instruction: string;
  name: string;
  distanceM: number;
  durationS: number;
  location: LngLat;
  speedLimitMph: number | null;
}

export interface RouteLine {
  type: "LineString";
  coordinates: LngLat[];
}

export interface RoutePlan {
  coords: LngLat[];
  distanceM: number;
  durationS: number;
  maneuvers: Maneuver[];
  geometry: RouteLine;
}

export interface SeatHeat {
  fl: number;
  fr: number;
  rl: number;
  rr: number;
}

export interface DoorState {
  fl: boolean;
  fr: boolean;
  rl: boolean;
  rr: boolean;
}

export interface ClimateState {
  on: boolean;
  driverTempF: number;
  passengerTempF: number;
  split: boolean;
  sync: boolean;
  fan: number;
  auto: boolean;
  defrostFront: boolean;
  defrostRear: boolean;
  recirc: boolean;
  rearOn: boolean;
  bioweapon: boolean;
  seats: SeatHeat;
}

export interface MediaTrack {
  track: string;
  artist: string;
  source: MediaSourceId;
}

export interface MediaState {
  playing: boolean;
  volume: number;
  muted: boolean;
  track: string;
  artist: string;
  source: MediaSourceId;
  progress: number;
  shuffle: boolean;
  repeat: RepeatMode;
  libraryIndex: number;
}

export interface VehicleFlags {
  locked: boolean;
  sentry: boolean;
  bluetooth: boolean;
  wifi: boolean;
  cellular: boolean;
  frunkOpen: boolean;
  trunkOpen: boolean;
  chargePortOpen: boolean;
  doors: DoorState;
  headlights: HeadlightMode;
  fogLights: boolean;
  domeLights: boolean;
  ambientLights: boolean;
  autoHighBeam: boolean;
  headlightsAfterExit: boolean;
  steeringWheelLights: boolean;
  wipers: WiperMode;
  childLock: boolean;
  windowLock: boolean;
  walkAwayLock: boolean;
  unlockOnPark: boolean;
  lockConfirmationSound: boolean;
  steeringHeat: boolean;
  mirrorHeat: boolean;
  mirrorsFolded: boolean;
  autoFoldMirrors: boolean;
  mirrorAutoTilt: boolean;
  followingDistance: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  unitsMph: boolean;
  energyAsPercent: boolean;
  temperatureF: boolean;
  timeFormat24: boolean;
  textSize: "standard" | "large";
  appearance: AppearanceMode;
  reduceBlueLight: boolean;
  brightness: number;
  screenClean: boolean;
  lockRearDisplay: boolean;
  autoBrightness: boolean;
  carWash: boolean;
  chargeLimitPct: number;
  regenerativeBraking: RegenerativeBraking;
  stoppingMode: StoppingMode;
  steeringMode: SteeringMode;
  slipStart: boolean;
  onlineRouting: boolean;
  avoidTolls: boolean;
  avoidFerries: boolean;
  avoidHighways: boolean;
  automaticNavigation: boolean;
  showChargingStops: boolean;
  parkAssistChimes: boolean;
  joeMode: boolean;
  allowMobileAccess: boolean;
  fsdEnabled: boolean;
  autosteer: boolean;
  trafficControl: boolean;
  visualizationPreview: boolean;
  wiperService: boolean;
  jackMode: boolean;
  cameraCalibrating: boolean;
  gloveboxOpen: boolean;
  vehicleName: string;
}

export interface UiState {
  controlsOpen: boolean;
  controlsTab: ControlsTab;
  controlsQuery: string;
  climateOpen: boolean;
  mediaOpen: boolean;
  appsOpen: boolean;
  searchOpen: boolean;
  tempPopup: TempPopup;
  vizRatio: number;
  mapOrientation: MapOrientation;
  tracking: boolean;
  pinDrop: Place | null;
  disclaimerDismissed: boolean;
  driverProfile: string;
}

/** Visual QA harness freeze. Production UI never sets this unless `?qa=` is present. */
export interface QaState {
  frozen: boolean;
  clock: string | null;
  scene: string | null;
}

/** Canonical ego pose. MapLibre's car marker and the Three.js FSD viz both read this. */
export interface EgoPose {
  lng: number;
  lat: number;
  /** Geographic heading, degrees clockwise from north. Shared with MapLibre marker rotation. */
  heading: number;
  speedMph: number;
  setSpeedMph: number;
  speedLimitMph: number;
  traveledM: number;
  remainingM: number;
}

export interface VehicleStore {
  gear: Gear;
  phase: TripPhase;
  flags: VehicleFlags;
  climate: ClimateState;
  media: MediaState;
  ui: UiState;
  qa: QaState;
  origin: Place;
  destination: Place | null;
  route: RoutePlan | null;
  pose: EgoPose;
  searchQuery: string;
  searchResults: Place[];
  searchBusy: boolean;
  routeBusy: boolean;
  routeError: string | null;
  recents: Place[];
}
