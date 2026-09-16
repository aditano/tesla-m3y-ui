export type LngLat = [number, number];

export type Gear = "P" | "R" | "N" | "D";

export type TripPhase = "idle" | "routed" | "fsd" | "arrived" | "disengaged";

export type MapOrientation = "north" | "heading";

export type HeadlightMode = "off" | "parking" | "on" | "auto";

export type ControlsTab =
  | "quick"
  | "lights"
  | "locks"
  | "display"
  | "driving"
  | "autopilot"
  | "navigation"
  | "safety"
  | "service"
  | "software";

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

export interface ClimateState {
  on: boolean;
  driverTempF: number;
  passengerTempF: number;
  split: boolean;
  fan: number;
  auto: boolean;
  defrostFront: boolean;
  defrostRear: boolean;
  recirc: boolean;
  seats: {
    fl: number;
    fr: number;
    rl: number;
    rr: number;
  };
}

export interface MediaState {
  playing: boolean;
  volume: number;
  muted: boolean;
  track: string;
  artist: string;
  source: string;
  progress: number;
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
  headlights: HeadlightMode;
  wipers: "off" | "auto" | "i" | "ii";
  childLock: boolean;
  steeringHeat: boolean;
  mirrorHeat: boolean;
  followingDistance: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  unitsMph: boolean;
  energyAsPercent: boolean;
}

export interface UiState {
  controlsOpen: boolean;
  controlsTab: ControlsTab;
  climateOpen: boolean;
  mediaOpen: boolean;
  appsOpen: boolean;
  searchOpen: boolean;
  vizRatio: number;
  mapOrientation: MapOrientation;
  tracking: boolean;
  pinDrop: Place | null;
  disclaimerDismissed: boolean;
}

/** Visual QA harness freeze. Production UI never sets this unless `?qa=` is present. */
export interface QaState {
  frozen: boolean;
  clock: string | null;
  scene: string | null;
}

export interface EgoPose {
  lng: number;
  lat: number;
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
