import {
  DEFAULT_ORIGIN,
  VIZ_RATIO_DEFAULT,
  VIZ_RATIO_MAX,
  WORK_PLACE,
} from "../geo/constants";
import { buildIndex, interpolate } from "../geo/polyline";
import type {
  ClimateState,
  ControlsTab,
  Gear,
  MediaState,
  Place,
  QaState,
  RoutePlan,
  TripPhase,
  UiState,
  VehicleFlags,
} from "../state/types";

/** Frozen clock used by `?qa=` scenes so screenshots do not drift. */
export const QA_CLOCK = "4:20 PM";

export const QA_SCENE_IDS = [
  "parked-home",
  "route-set",
  "fsd-engaged",
  "controls",
  "climate",
  "media",
  "viz-expanded",
] as const;

export type QaSceneId = (typeof QA_SCENE_IDS)[number];

export function isQaSceneId(value: string): value is QaSceneId {
  return (QA_SCENE_IDS as readonly string[]).includes(value);
}

/** Canned downtown Pittsburgh → CMU route so QA never depends on live OSRM. */
export const QA_ROUTE_COORDS: [number, number][] = [
  [-79.9959, 40.4406],
  [-79.9935, 40.4414],
  [-79.989, 40.4418],
  [-79.98, 40.443],
  [-79.968, 40.444],
  [-79.955, 40.4438],
  [-79.9436, 40.4433],
];

export function buildQaRoute(): RoutePlan {
  const coords = QA_ROUTE_COORDS.map((c) => [c[0], c[1]] as [number, number]);
  const index = buildIndex(coords);
  const dest = coords[coords.length - 1];
  return {
    coords,
    distanceM: index.totalMeters,
    durationS: Math.round(index.totalMeters / 11.2),
    geometry: { type: "LineString", coordinates: coords },
    maneuvers: [
      {
        type: "depart",
        modifier: null,
        instruction: "Head toward Grant Street",
        name: "Grant Street",
        distanceM: index.cumMeters[2] ?? 400,
        durationS: 40,
        location: coords[0],
        speedLimitMph: 25,
      },
      {
        type: "continue",
        modifier: "straight",
        instruction: "Continue on Forbes Avenue",
        name: "Forbes Avenue",
        distanceM: Math.max(200, index.totalMeters * 0.45),
        durationS: 90,
        location: coords[3],
        speedLimitMph: 25,
      },
      {
        type: "turn",
        modifier: "right",
        instruction: "Turn right toward Carnegie Mellon",
        name: "Morewood Avenue",
        distanceM: Math.max(120, index.totalMeters * 0.2),
        durationS: 28,
        location: coords[5],
        speedLimitMph: 25,
      },
      {
        type: "arrive",
        modifier: null,
        instruction: "You have arrived",
        name: WORK_PLACE.name,
        distanceM: 0,
        durationS: 0,
        location: dest,
        speedLimitMph: 25,
      },
    ],
  };
}

export const QA_DESTINATION: Place = {
  name: WORK_PLACE.name,
  label: WORK_PLACE.label,
  lng: WORK_PLACE.lng,
  lat: WORK_PLACE.lat,
};

const climate: ClimateState = {
  on: true,
  driverTempF: 70,
  passengerTempF: 70,
  split: false,
  sync: true,
  fan: 3,
  auto: true,
  defrostFront: false,
  defrostRear: false,
  recirc: false,
  rearOn: false,
  bioweapon: false,
  seats: { fl: 0, fr: 0, rl: 0, rr: 0 },
};

const media: MediaState = {
  playing: true,
  volume: 42,
  muted: false,
  track: "Night Drive",
  artist: "Open Frequency",
  source: "radio",
  progress: 0.34,
  shuffle: false,
  repeat: "off",
  libraryIndex: 0,
};

const flags: VehicleFlags = {
  locked: true,
  sentry: false,
  bluetooth: true,
  wifi: true,
  cellular: true,
  frunkOpen: false,
  trunkOpen: false,
  chargePortOpen: false,
  doors: { fl: false, fr: false, rl: false, rr: false },
  headlights: "auto",
  fogLights: false,
  domeLights: false,
  ambientLights: true,
  autoHighBeam: true,
  headlightsAfterExit: true,
  steeringWheelLights: true,
  wipers: "auto",
  childLock: false,
  windowLock: false,
  walkAwayLock: true,
  unlockOnPark: false,
  lockConfirmationSound: true,
  steeringHeat: false,
  mirrorHeat: false,
  mirrorsFolded: false,
  autoFoldMirrors: true,
  mirrorAutoTilt: true,
  followingDistance: 3,
  unitsMph: true,
  energyAsPercent: false,
  temperatureF: true,
  timeFormat24: false,
  textSize: "standard",
  appearance: "dark",
  reduceBlueLight: false,
  brightness: 70,
  screenClean: false,
  lockRearDisplay: false,
  autoBrightness: true,
  carWash: false,
  chargeLimitPct: 80,
  regenerativeBraking: "standard",
  stoppingMode: "hold",
  steeringMode: "standard",
  slipStart: false,
  onlineRouting: true,
  avoidTolls: false,
  avoidFerries: false,
  avoidHighways: false,
  automaticNavigation: true,
  showChargingStops: true,
  parkAssistChimes: true,
  joeMode: false,
  allowMobileAccess: true,
  fsdEnabled: true,
  autosteer: true,
  trafficControl: true,
  visualizationPreview: true,
  autoInstallUpdates: true,
  wiperService: false,
  jackMode: false,
  cameraCalibrating: false,
  gloveboxOpen: false,
  vehicleName: "Pittsburgh",
};

function closedUi(overrides: Partial<UiState> = {}): UiState {
  return {
    controlsOpen: false,
    controlsTab: "quick",
    controlsQuery: "",
    climateOpen: false,
    mediaOpen: false,
    appsOpen: false,
    searchOpen: false,
    tempPopup: null,
    vizRatio: VIZ_RATIO_DEFAULT,
    mapOrientation: "north",
    tracking: true,
    pinDrop: null,
    disclaimerDismissed: true,
    driverProfile: "Anthony",
    ...overrides,
  };
}

export interface QaSnapshot {
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
  pose: {
    lng: number;
    lat: number;
    heading: number;
    speedMph: number;
    setSpeedMph: number;
    speedLimitMph: number;
    traveledM: number;
    remainingM: number;
  };
  searchQuery: string;
  searchResults: Place[];
  searchBusy: boolean;
  routeBusy: boolean;
  routeError: string | null;
  recents: Place[];
}

function parkedBase(scene: QaSceneId, ui: UiState): QaSnapshot {
  return {
    gear: "P",
    phase: "idle",
    flags,
    climate,
    media,
    ui,
    qa: { frozen: true, clock: QA_CLOCK, scene },
    origin: DEFAULT_ORIGIN,
    destination: null,
    route: null,
    pose: {
      lng: DEFAULT_ORIGIN.lng,
      lat: DEFAULT_ORIGIN.lat,
      heading: 12,
      speedMph: 0,
      setSpeedMph: 0,
      speedLimitMph: 25,
      traveledM: 0,
      remainingM: 0,
    },
    searchQuery: "",
    searchResults: [],
    searchBusy: false,
    routeBusy: false,
    routeError: null,
    recents: [],
  };
}

function routedBase(scene: QaSceneId, ui: UiState, phase: TripPhase): QaSnapshot {
  const route = buildQaRoute();
  const index = buildIndex(route.coords);
  const traveled = phase === "fsd" ? index.totalMeters * 0.32 : 0;
  const sample = interpolate(index, traveled);
  return {
    gear: phase === "fsd" ? "D" : "P",
    phase,
    flags: { ...flags, locked: phase !== "fsd" },
    climate,
    media,
    ui,
    qa: { frozen: true, clock: QA_CLOCK, scene },
    origin: DEFAULT_ORIGIN,
    destination: QA_DESTINATION,
    route,
    pose: {
      lng: sample.position[0],
      lat: sample.position[1],
      heading: sample.heading,
      speedMph: phase === "fsd" ? 32 : 0,
      setSpeedMph: phase === "fsd" ? 25 : 0,
      speedLimitMph: 25,
      traveledM: sample.traveledM,
      remainingM: sample.remainingM,
    },
    searchQuery: QA_DESTINATION.name,
    searchResults: [],
    searchBusy: false,
    routeBusy: false,
    routeError: null,
    recents: [QA_DESTINATION],
  };
}

export function snapshotForScene(scene: QaSceneId): QaSnapshot {
  switch (scene) {
    case "parked-home":
      return parkedBase(scene, closedUi());
    case "route-set":
      return routedBase(scene, closedUi(), "routed");
    case "fsd-engaged":
      return routedBase(
        scene,
        closedUi({ mapOrientation: "heading", vizRatio: VIZ_RATIO_DEFAULT }),
        "fsd",
      );
    case "controls":
      return parkedBase(scene, closedUi({ controlsOpen: true, controlsTab: "quick" as ControlsTab }));
    case "climate":
      return parkedBase(scene, closedUi({ climateOpen: true }));
    case "media":
      return parkedBase(scene, closedUi({ mediaOpen: true }));
    case "viz-expanded":
      return routedBase(
        scene,
        closedUi({ mapOrientation: "heading", vizRatio: VIZ_RATIO_MAX }),
        "fsd",
      );
    default: {
      const _exhaustive: never = scene;
      return _exhaustive;
    }
  }
}
