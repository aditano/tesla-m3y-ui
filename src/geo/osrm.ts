import { DEFAULT_SPEED_LIMIT_MPH, OSRM_ENDPOINTS } from "./constants";
import { simplifyPolyline } from "./polyline";
import type { LngLat, Maneuver, Place, RoutePlan } from "../state/types";

interface OsrmManeuver {
  type: string;
  modifier?: string;
  location: [number, number];
}

interface OsrmStep {
  distance: number;
  duration: number;
  name: string;
  maneuver: OsrmManeuver;
  mode?: string;
}

interface OsrmRoute {
  distance: number;
  duration: number;
  geometry: { type: "LineString"; coordinates: LngLat[] };
  legs: { steps: OsrmStep[]; annotation?: { maxspeed?: Array<number | string> } }[];
}

interface OsrmResponse {
  code: string;
  routes?: OsrmRoute[];
}

function instructionFor(step: OsrmStep): string {
  const mod = step.maneuver.modifier ?? "";
  const name = step.name && step.name !== "-" ? step.name : "";
  const type = step.maneuver.type;
  switch (type) {
    case "depart":
      return name ? `Head toward ${name}` : "Head out";
    case "arrive":
      return "You have arrived";
    case "roundabout":
    case "rotary":
      return name ? `Enter roundabout onto ${name}` : "Enter the roundabout";
    case "merge":
      return name ? `Merge onto ${name}` : "Merge";
    case "fork":
      return `Keep ${mod || "straight"}`;
    case "end of road":
      return name ? `Turn ${mod} onto ${name}` : `Turn ${mod}`;
    case "continue":
      return name ? `Continue on ${name}` : "Continue";
    case "new name":
      return name ? `Continue on ${name}` : "Continue";
    case "turn":
      return name ? `Turn ${mod} onto ${name}` : `Turn ${mod}`;
    case "on ramp":
      return name ? `Take the ramp onto ${name}` : "Take the ramp";
    case "off ramp":
      return name ? `Take the exit onto ${name}` : "Take the exit";
    default:
      return name ? `${type} ${mod} ${name}`.trim() : type;
  }
}

function stepLimit(step: OsrmStep, fallback: number): number {
  const name = step.name.toLowerCase();
  if (name.includes("interstate") || /\bi-?\d/.test(name) || name.includes("freeway")) {
    return Math.max(fallback, 65);
  }
  if (name.includes("blvd") || name.includes("avenue") || name.includes("highway")) {
    return Math.max(fallback, 35);
  }
  return fallback;
}

function toManeuvers(route: OsrmRoute): Maneuver[] {
  const steps = route.legs.flatMap((leg) => leg.steps ?? []);
  return steps.map((step) => ({
    type: step.maneuver.type,
    modifier: step.maneuver.modifier ?? null,
    instruction: instructionFor(step),
    name: step.name === "-" ? "" : step.name,
    distanceM: step.distance,
    durationS: step.duration,
    location: step.maneuver.location,
    speedLimitMph: stepLimit(step, DEFAULT_SPEED_LIMIT_MPH),
  }));
}

async function fetchOsrm(base: string, from: Place, to: Place): Promise<RoutePlan> {
  const path = `/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}`;
  const url = new URL(path, base.endsWith("/") ? base : `${base}/`);
  url.searchParams.set("overview", "full");
  url.searchParams.set("geometries", "geojson");
  url.searchParams.set("steps", "true");
  url.searchParams.set("annotations", "true");
  const res = await fetch(url);
  if (!res.ok) throw new Error(`OSRM ${res.status}`);
  const data = (await res.json()) as OsrmResponse;
  if (data.code !== "Ok" || !data.routes?.[0]) {
    throw new Error(data.code || "no route");
  }
  const r = data.routes[0];
  const coords = simplifyPolyline(r.geometry.coordinates, 3);
  return {
    coords,
    distanceM: r.distance,
    durationS: r.duration,
    maneuvers: toManeuvers(r),
    geometry: { type: "LineString", coordinates: coords },
  };
}

export async function fetchRoute(from: Place, to: Place): Promise<RoutePlan> {
  let last: unknown;
  for (const base of OSRM_ENDPOINTS) {
    try {
      return await fetchOsrm(base, from, to);
    } catch (err) {
      last = err;
    }
  }
  throw last instanceof Error ? last : new Error("Routing failed");
}

export function speedLimitAt(
  traveledM: number,
  maneuvers: Maneuver[],
): number {
  let acc = 0;
  let limit = DEFAULT_SPEED_LIMIT_MPH;
  for (const m of maneuvers) {
    if (traveledM < acc + Math.max(8, m.distanceM * 0.85)) {
      limit = m.speedLimitMph ?? limit;
      const turnish =
        m.type === "turn" ||
        m.type === "roundabout" ||
        m.modifier === "left" ||
        m.modifier === "right" ||
        m.modifier === "sharp left" ||
        m.modifier === "sharp right";
      if (turnish && traveledM > acc + m.distanceM - 40) {
        return Math.min(limit, 18);
      }
      return limit;
    }
    acc += m.distanceM;
  }
  return limit;
}

export function upcomingManeuverIndex(traveledM: number, maneuvers: Maneuver[]): number {
  let acc = 0;
  for (let i = 0; i < maneuvers.length; i++) {
    acc += maneuvers[i].distanceM;
    if (traveledM < acc - 4) return i;
  }
  return Math.max(0, maneuvers.length - 1);
}
