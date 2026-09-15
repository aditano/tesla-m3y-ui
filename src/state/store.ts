import { create } from "zustand";
import {
  DEFAULT_ORIGIN,
  DEFAULT_SPEED_LIMIT_MPH,
  VIZ_RATIO_DEFAULT,
  VIZ_RATIO_MAX,
  VIZ_RATIO_MIN,
} from "../geo/constants";
import { fetchRoute, speedLimitAt } from "../geo/osrm";
import { reverseGeocode, searchPlaces } from "../geo/geocode";
import { buildIndex, interpolate, mphToMps } from "../geo/polyline";
import type {
  ClimateState,
  ControlsTab,
  Gear,
  MediaState,
  Place,
  TripPhase,
  UiState,
  VehicleFlags,
  VehicleStore,
} from "./types";

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

const ui: UiState = {
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
  disclaimerDismissed: false,
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
}

export type Store = VehicleStore & Actions;

let searchTimer: number | undefined;
const polylineCache = { key: "", index: buildIndex([]) };

function routeKey(coords: [number, number][]): string {
  return `${coords.length}:${coords[0]?.join(",")}:${coords[coords.length - 1]?.join(",")}`;
}

export const useVehicle = create<Store>((set, get) => ({
  gear: "P",
  phase: "idle",
  flags,
  climate,
  media,
  ui,
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
    const { phase } = get();
    if (gear === "P") {
      if (phase === "fsd") {
        get().disengageFsd();
        return;
      }
      set({
        gear: "P",
        pose: { ...get().pose, speedMph: 0 },
      });
      return;
    }
    if (gear === "R") {
      set({ gear: "R", pose: { ...get().pose, speedMph: 0 } });
      return;
    }
    if (gear === "N") {
      set({ gear: "N" });
      return;
    }
    set({ gear: "D" });
  },

  patchFlags: (partial) => set({ flags: { ...get().flags, ...partial } }),
  patchClimate: (partial) => set({ climate: { ...get().climate, ...partial } }),
  patchMedia: (partial) => set({ media: { ...get().media, ...partial } }),
  patchUi: (partial) => set({ ui: { ...get().ui, ...partial } }),
  setControlsTab: (tab) => set({ ui: { ...get().ui, controlsTab: tab, controlsOpen: true } }),

  setVizRatio: (ratio) =>
    set({
      ui: {
        ...get().ui,
        vizRatio: Math.min(VIZ_RATIO_MAX, Math.max(VIZ_RATIO_MIN, ratio)),
      },
    }),

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
    set({
      origin: place,
      pose: { ...get().pose, lng: place.lng, lat: place.lat, traveledM: 0 },
      ui: { ...get().ui, tracking: true },
    });
  },

  setOriginFromMap: async (lng, lat) => {
    if (get().phase === "fsd") return;
    const place = await reverseGeocode(lng, lat);
    get().setOrigin(place);
    set({ ui: { ...get().ui, pinDrop: place, searchOpen: true } });
  },

  navigateTo: async (place) => {
    const origin = get().origin;
    set({
      destination: place,
      routeBusy: true,
      routeError: null,
      ui: { ...get().ui, searchOpen: false },
      searchQuery: place.name,
    });
    try {
      const route = await fetchRoute(origin, place);
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
    } catch {
      set({
        routeBusy: false,
        routeError: "Could not build a road route. Try another place.",
        phase: "idle",
      });
    }
  },

  cancelNav: () => {
    set({
      phase: "idle",
      destination: null,
      route: null,
      gear: "P",
      pose: {
        ...get().pose,
        speedMph: 0,
        setSpeedMph: 0,
        traveledM: 0,
        remainingM: 0,
      },
    });
  },

  startFsd: () => {
    const { route, pose } = get();
    if (!route) return;
    const limit = route.maneuvers[0]?.speedLimitMph ?? DEFAULT_SPEED_LIMIT_MPH;
    set({
      phase: "fsd",
      gear: "D",
      flags: { ...get().flags, locked: false },
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
    if (state.phase !== "fsd" || !state.route) return;
    const key = routeKey(state.route.coords);
    if (polylineCache.key !== key) {
      polylineCache.key = key;
      polylineCache.index = buildIndex(state.route.coords);
    }
    const index = polylineCache.index;
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
    const remainingTime = speed > 1 ? sample.remainingM / mphToMps(Math.max(speed, 8)) : 0;
    void remainingTime;
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
    set({
      origin: {
        ...get().origin,
        lng,
        lat,
      },
      pose: { ...get().pose, lng, lat },
    });
  },
}));
