import type { Place } from "../state/types";

/** Default start: Pittsburgh (Tone's roots). Click map or search to move origin. */
export const DEFAULT_ORIGIN: Place = {
  name: "Downtown Pittsburgh",
  label: "Downtown Pittsburgh, PA",
  lng: -79.9959,
  lat: 40.4406,
};

export const HOME_PLACE: Place = {
  name: "Home",
  label: "Squirrel Hill, Pittsburgh, PA",
  lng: -79.9224,
  lat: 40.4382,
};

export const WORK_PLACE: Place = {
  name: "Work",
  label: "Carnegie Mellon University",
  lng: -79.9436,
  lat: 40.4433,
};

export const SCHOOL_PLACE: Place = {
  name: "Villanova",
  label: "Villanova University",
  lng: -75.3492,
  lat: 40.0374,
};

export const NOMINATIM_URL = "https://nominatim.openstreetmap.org";
export const PHOTON_URL = "https://photon.komoot.io/api/";

export const OSRM_ENDPOINTS = [
  "https://router.project-osrm.org",
  "https://routing.openstreetmap.de/routed-car",
];

export const MAP_STYLE = "https://tiles.openfreemap.org/styles/dark";

export const APP_UA =
  "tesla-m3y-ui/1.0 (https://github.com/aditano/tesla-m3y-ui; educational fan recreation)";

export const TESLA_BLUE = "#3e6ae1";
export const ROUTE_BLUE = "#3d8bfd";

export const LANE_WIDTH_M = 3.6;
export const DEFAULT_SPEED_LIMIT_MPH = 35;
export const FSD_MAX_MPH = 75;
export const TURN_SPEED_MPH = 16;
export const ACCEL_MPH_S = 7.5;
export const DECEL_MPH_S = 9;
export const ARRIVAL_RADIUS_M = 18;

export const VIZ_RATIO_MIN = 0.28;
export const VIZ_RATIO_MAX = 0.88;
export const VIZ_RATIO_DEFAULT = 0.42;
