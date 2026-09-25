import { create } from "zustand";
import {
  DEFAULT_ORIGIN,
  DEFAULT_SPEED_LIMIT_MPH,
  VIZ_RATIO_DEFAULT,
  VIZ_RATIO_MAX,
  VIZ_RATIO_MIN,
} from "../geo/constants";
import { fetchRoute, isAbortError, speedLimitAt } from "../geo/osrm";
import { reverseGeocode, searchPlaces } from "../geo/geocode";
import { indexFor, interpolate, mphToMps } from "../geo/polyline";
import type {
  ClimateState,
  ControlsTab,
  Gear,
  MediaState,
  MediaTrack,
  Place,
  SeatHeat,
  TripPhase,
  UiState,
  VehicleFlags,
  VehicleStore,
} from "./types";

export const MEDIA_LIBRARY: MediaTrack[] = [
  { track: "Night Drive", artist: "Open Frequency", source: "radio" },
  { track: "Allegheny After Dark", artist: "Three Rivers FM", source: "radio" },
  { track: "Glass Horizon", artist: "North Side Ensemble", source: "streaming" },
];

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
  track: MEDIA_LIBRARY[0].track,
  artist: MEDIA_LIBRARY[0].artist,
  source: MEDIA_LIBRARY[0].source,
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

const ui: UiState = {
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
  disclaimerDismissed: false,
  driverProfile: "Anthony",
};

const qa = {
  frozen: false,
  clock: null,
  scene: null,
};

interface Actions {
  setGear: (gear: Gear) => void;
  patchFlags: (partial: Partial<VehicleFlags>) => void;
  patchClimate: (partial: Partial<ClimateState>) => void;
  patchMedia: (partial: Partial<MediaState>) => void;
  patchUi: (partial: Partial<UiState>) => void;
  setControlsTab: (tab: ControlsTab) => void;
  setVizRatio: (ratio: number) => void;
  setSearchQuery: (q: string) => void;
  runSearch: (q: string) => Promise<void>;
  setOrigin: (place: Place) => void;
  setOriginFromMap: (lng: number, lat: number) => Promise<void>;
  navigateTo: (place: Place) => Promise<void>;
  cancelNav: () => void;
  startFsd: () => void;
  disengageFsd: () => void;
  tickDrive: (dt: number) => void;
  setPoseFromGps: (lng: number, lat: number) => void;
  cycleSeat: (seat: keyof SeatHeat) => void;
  nudgeTemp: (zone: "driver" | "passenger", delta: number) => void;
  skipTrack: (dir: 1 | -1) => void;
  closeSheets: () => void;
}

export type Store = VehicleStore & Actions;

let searchTimer: number | undefined;

/** Monotonic id so a late OSRM response cannot overwrite a newer route or a cancel. */
let navRequest = 0;
let navController: AbortController | null = null;

function beginNavRequest(): { id: number; signal: AbortSignal } {
  navController?.abort();
  navRequest += 1;
  navController = new AbortController();
  return { id: navRequest, signal: navController.signal };
}

function invalidateNavRequest(): void {
  navController?.abort();
  navController = null;
  navRequest += 1;
}

function isNavCurrent(id: number): boolean {
  return id === navRequest;
}

function applyTrack(index: number): Partial<MediaState> {
  const i = (index + MEDIA_LIBRARY.length) % MEDIA_LIBRARY.length;
  const t = MEDIA_LIBRARY[i];
  return { libraryIndex: i, track: t.track, artist: t.artist, source: t.source, progress: 0 };
}

export const useVehicle = create<Store>((set, get) => ({
  gear: "P",
  phase: "idle",
  flags,
  climate,
  media,
  ui,
  qa,
  origin: DEFAULT_ORIGIN,
  destination: null,
  route: null,
  pose: {
    lng: DEFAULT_ORIGIN.lng,
    lat: DEFAULT_ORIGIN.lat,
    heading: 12,
    speedMph: 0,
    setSpeedMph: 0,
    speedLimitMph: DEFAULT_SPEED_LIMIT_MPH,
    traveledM: 0,
    remainingM: 0,
  },
  searchQuery: "",
  searchResults: [],
  searchBusy: false,
  routeBusy: false,
  routeError: null,
  recents: [],

  setGear: (gear) => {
    if (get().phase === "fsd" && gear !== "D") {
      get().disengageFsd();
    }
    if (gear === "P") {
      set({
        gear: "P",
        pose: { ...get().pose, speedMph: 0 },
        flags: {
          ...get().flags,
          locked: get().flags.unlockOnPark ? false : get().flags.locked,
        },
      });
      return;
    }
    if (gear === "R" || gear === "N") {
      set({
        gear,
        pose: { ...get().pose, speedMph: 0, setSpeedMph: 0 },
      });
      return;
    }
    set({ gear: "D" });
  },

  patchFlags: (partial) => set({ flags: { ...get().flags, ...partial } }),
  patchClimate: (partial) => set({ climate: { ...get().climate, ...partial } }),
  patchMedia: (partial) => set({ media: { ...get().media, ...partial } }),
  patchUi: (partial) => set({ ui: { ...get().ui, ...partial } }),
  setControlsTab: (tab) =>
    set({
      ui: {
        ...get().ui,
        controlsTab: tab,
        controlsOpen: true,
        climateOpen: false,
        mediaOpen: false,
        appsOpen: false,
        tempPopup: null,
        controlsQuery: tab === get().ui.controlsTab ? get().ui.controlsQuery : "",
      },
    }),

  closeSheets: () =>
    set({
      ui: {
        ...get().ui,
        controlsOpen: false,
        climateOpen: false,
        mediaOpen: false,
        appsOpen: false,
        tempPopup: null,
      },
    }),

  setVizRatio: (ratio) =>
    set({
      ui: {
        ...get().ui,
        vizRatio: Math.min(VIZ_RATIO_MAX, Math.max(VIZ_RATIO_MIN, ratio)),
      },
    }),

  cycleSeat: (seat) => {
    const seats = { ...get().climate.seats };
    seats[seat] = ((seats[seat] + 1) % 4) as SeatHeat[typeof seat];
    set({ climate: { ...get().climate, seats } });
  },

  nudgeTemp: (zone, delta) => {
    const c = get().climate;
    const next = {
      on: true,
      split: zone === "passenger" ? true : c.split,
      sync: zone === "passenger" ? false : c.sync,
      driverTempF: c.driverTempF,
      passengerTempF: c.passengerTempF,
    };
    if (zone === "driver" || c.sync) {
      next.driverTempF = Math.min(85, Math.max(59, c.driverTempF + delta));
      if (c.sync && zone === "driver") next.passengerTempF = next.driverTempF;
    }
    if (zone === "passenger") {
      next.passengerTempF = Math.min(85, Math.max(59, c.passengerTempF + delta));
    }
    set({ climate: { ...c, ...next } });
  },

  skipTrack: (dir) => {
    const i = get().media.libraryIndex + dir;
    set({ media: { ...get().media, ...applyTrack(i), playing: true } });
  },

  setSearchQuery: (q) => {
    set({ searchQuery: q, ui: { ...get().ui, searchOpen: true } });
    window.clearTimeout(searchTimer);
    if (q.trim().length < 3) {
      set({ searchResults: [], searchBusy: false });
      return;
    }
    set({ searchBusy: true });
    searchTimer = window.setTimeout(() => {
      void get().runSearch(q);
    }, 450);
  },

  runSearch: async (q) => {
    try {
      const hits = await searchPlaces(q);
      if (get().searchQuery.trim() !== q.trim()) return;
      set({ searchResults: hits, searchBusy: false });
    } catch {
      set({ searchBusy: false, routeError: "Search is unavailable right now." });
    }
  },

  setOrigin: (place) => {
    const prev = get();
    const moved = prev.origin.lng !== place.lng || prev.origin.lat !== place.lat;
    if (!moved) {
      set({
        origin: place,
        pose: { ...prev.pose, lng: place.lng, lat: place.lat },
        ui: { ...prev.ui, tracking: true },
      });
      return;
    }
    const dest = prev.destination;
    const hadNav =
      Boolean(prev.route) ||
      prev.routeBusy ||
      prev.phase === "fsd" ||
      prev.phase === "routed" ||
      prev.phase === "disengaged" ||
      prev.phase === "arrived";
    invalidateNavRequest();
    set({
      origin: place,
      route: hadNav ? null : prev.route,
      routeBusy: false,
      routeError: null,
      phase: hadNav ? "idle" : prev.phase,
      gear: prev.phase === "fsd" ? "P" : prev.gear,
      pose: {
        ...prev.pose,
        lng: place.lng,
        lat: place.lat,
        traveledM: hadNav ? 0 : prev.pose.traveledM,
        remainingM: hadNav ? 0 : prev.pose.remainingM,
        speedMph: hadNav ? 0 : prev.pose.speedMph,
        setSpeedMph: hadNav ? 0 : prev.pose.setSpeedMph,
      },
      ui: {
        ...prev.ui,
        tracking: true,
        mapOrientation: prev.phase === "fsd" ? "north" : prev.ui.mapOrientation,
      },
    });
    if (dest) void get().navigateTo(dest);
  },

  setOriginFromMap: async (lng, lat) => {
    if (get().phase === "fsd") return;
    const place = await reverseGeocode(lng, lat);
    get().setOrigin(place);
    set({ ui: { ...get().ui, pinDrop: place, searchOpen: true } });
  },

  navigateTo: async (place) => {
    const origin = get().origin;
    const { id, signal } = beginNavRequest();
    const driving = get().phase === "fsd";
    set({
      destination: place,
      route: null,
      routeBusy: true,
      routeError: null,
      phase: driving ? "idle" : get().phase,
      gear: driving ? "P" : get().gear,
      pose: driving ? { ...get().pose, speedMph: 0, setSpeedMph: 0 } : get().pose,
      ui: {
        ...get().ui,
        searchOpen: false,
        climateOpen: false,
        mediaOpen: false,
        appsOpen: false,
        ...(driving ? { mapOrientation: "north" as const } : {}),
      },
      searchQuery: place.name,
    });
    try {
      const route = await fetchRoute(origin, place, signal);
      if (!isNavCurrent(id)) return;
      const recents = [place, ...get().recents.filter((r) => r.label !== place.label)].slice(0, 8);
      set({
        route,
        routeBusy: false,
        phase: "routed",
        recents,
        pose: {
          ...get().pose,
          lng: origin.lng,
          lat: origin.lat,
          traveledM: 0,
          remainingM: route.distanceM,
          speedMph: 0,
          speedLimitMph: route.maneuvers[0]?.speedLimitMph ?? DEFAULT_SPEED_LIMIT_MPH,
        },
        ui: { ...get().ui, tracking: true, mapOrientation: "north", searchOpen: false },
      });
    } catch (err) {
      if (!isNavCurrent(id) || isAbortError(err)) return;
      set({
        route: null,
        routeBusy: false,
        routeError: "Could not build a road route. Try another place.",
        phase: "idle",
      });
    }
  },

  cancelNav: () => {
    invalidateNavRequest();
    set({
      phase: "idle",
      destination: null,
      route: null,
      routeBusy: false,
      routeError: null,
      gear: "P",
      pose: {
        ...get().pose,
        speedMph: 0,
        setSpeedMph: 0,
        traveledM: 0,
        remainingM: 0,
      },
      ui: { ...get().ui, mapOrientation: "north", tracking: true },
    });
  },

  startFsd: () => {
    const { route, pose, flags: f } = get();
    if (!route || !f.fsdEnabled) return;
    // FSD is a Drive maneuver. The gear transition and the drive loop both require D.
    const limit = route.maneuvers[0]?.speedLimitMph ?? DEFAULT_SPEED_LIMIT_MPH;
    set({
      phase: "fsd",
      gear: "D",
      flags: { ...f, locked: false },
      pose: {
        ...pose,
        setSpeedMph: Math.min(limit, 45),
        speedLimitMph: limit,
      },
      ui: {
        ...get().ui,
        tracking: true,
        mapOrientation: "heading",
        controlsOpen: false,
        climateOpen: false,
        mediaOpen: false,
        appsOpen: false,
        searchOpen: false,
        tempPopup: null,
      },
    });
  },

  disengageFsd: () => {
    const phase: TripPhase = get().phase === "arrived" ? "arrived" : "disengaged";
    set({
      phase,
      gear: "D",
      pose: { ...get().pose, speedMph: 0, setSpeedMph: 0 },
      ui: { ...get().ui, mapOrientation: "north" },
    });
  },

  tickDrive: (dt) => {
    const state = get();
    if (state.qa.frozen) return;
    if (state.phase !== "fsd" || state.gear !== "D" || !state.route) return;
    const index = indexFor(state.route.coords);
    const limit = speedLimitAt(state.pose.traveledM, state.route.maneuvers);
    const remaining = Math.max(0, index.totalMeters - state.pose.traveledM);
    let target = Math.min(state.pose.setSpeedMph || limit, limit);
    if (remaining < 80) target = Math.min(target, 18);
    if (remaining < 25) target = Math.min(target, 8);
    const accel = target >= state.pose.speedMph ? 7.5 : 10;
    let speed = state.pose.speedMph;
    if (speed < target) speed = Math.min(target, speed + accel * dt);
    else speed = Math.max(target, speed - accel * dt);
    const nextM = state.pose.traveledM + mphToMps(speed) * dt;
    if (nextM >= index.totalMeters - 2) {
      const end = interpolate(index, index.totalMeters);
      set({
        phase: "arrived",
        gear: "P",
        pose: {
          ...state.pose,
          lng: end.position[0],
          lat: end.position[1],
          heading: end.heading,
          speedMph: 0,
          setSpeedMph: 0,
          traveledM: index.totalMeters,
          remainingM: 0,
          speedLimitMph: limit,
        },
      });
      return;
    }
    const sample = interpolate(index, nextM);
    set({
      pose: {
        lng: sample.position[0],
        lat: sample.position[1],
        heading: sample.heading,
        speedMph: speed,
        setSpeedMph: Math.round(limit),
        speedLimitMph: Math.round(limit),
        traveledM: sample.traveledM,
        remainingM: sample.remainingM,
      },
    });
  },

  setPoseFromGps: (lng, lat) => {
    if (get().phase === "fsd") return;
    const origin = get().origin;
    if (origin.lng === lng && origin.lat === lat) {
      set({ pose: { ...get().pose, lng, lat } });
      return;
    }
    get().setOrigin({ ...origin, lng, lat });
  },
}));
