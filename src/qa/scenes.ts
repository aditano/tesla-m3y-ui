import {
  DEFAULT_ORIGIN,
  VIZ_RATIO_DEFAULT,
  VIZ_RATIO_MAX,
  WORK_PLACE,
} from "../geo/constants";
import { buildIndex } from "../geo/polyline";
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
  fan: 3,
  auto: true,
  defrostFront: false,
  defrostRear: false,
  recirc: false,
  seats: { fl: 0, fr: 0, rl: 0, rr: 0 },
};

const media: MediaState = {
  playing: true,
  volume: 42,
  muted: false,
  track: "Night Drive",
  artist: "Open Frequency",
  source: "Radio",
  progress: 0.34,
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
  headlights: "auto",
  wipers: "auto",
  childLock: false,
  steeringHeat: false,
  mirrorHeat: false,
  followingDistance: 3,
  unitsMph: true,
  energyAsPercent: false,
};

function closedUi(overrides: Partial<UiState> = {}): UiState {
  return {
    controlsOpen: false,
    controlsTab: "quick",
    climateOpen: false,
    mediaOpen: false,
    appsOpen: false,
    searchOpen: false,
    vizRatio: VIZ_RATIO_DEFAULT,
    mapOrientation: "north",
    tracking: true,
    pinDrop: null,
    disclaimerDismissed: true,
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
  const sample = traveled > 0
    ? {
        lng: route.coords[2][0],
        lat: route.coords[2][1],
        heading: 82,
        speedMph: 32,
        setSpeedMph: 25,
        traveledM: traveled,
        remainingM: index.totalMeters - traveled,
      }
    : {
        lng: DEFAULT_ORIGIN.lng,
        lat: DEFAULT_ORIGIN.lat,
        heading: 82,
        speedMph: 0,
        setSpeedMph: 0,
        traveledM: 0,
        remainingM: route.distanceM,
      };
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
      ...sample,
      speedLimitMph: 25,
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
