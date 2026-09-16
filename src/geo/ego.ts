import type { EgoPose } from "../state/types";
import type { LngLat, Maneuver } from "../state/types";
import {
  closestTraveledM,
  indexFor,
  interpolate,
  lngLatToLocal,
  type PolylineIndex,
  type SampledPose,
} from "./polyline";

const DEG = Math.PI / 180;
const denseCache = new WeakMap<PolylineIndex, SampledPose[]>();

export const VIZ_BEHIND_M = 36;
export const VIZ_AHEAD_M = 210;
export const VIZ_STEP_M = 1.25;

export interface EgoFramePoint {
  x: number;
  z: number;
  traveledM: number;
  heading: number;
}

/**
 * Rotate ENU (east, north) into the ego heading frame.
 * +Z is forward along geographic heading, +X is to the right.
 * Heading is degrees clockwise from north — same value MapLibre uses for the car marker.
 */
export function enuToEgo(east: number, north: number, headingDeg: number): { x: number; z: number } {
  const h = headingDeg * DEG;
  const c = Math.cos(h);
  const s = Math.sin(h);
  return {
    x: east * c - north * s,
    z: east * s + north * c,
  };
}

export function lngLatToEgo(p: LngLat, ego: LngLat, headingDeg: number): { x: number; z: number } {
  const enu = lngLatToLocal(p, ego);
  return enuToEgo(enu.x, enu.z, headingDeg);
}

export function densifyRoute(index: PolylineIndex, stepM = VIZ_STEP_M): SampledPose[] {
  const cached = denseCache.get(index);
  if (cached) return cached;
  if (index.coords.length === 0 || index.totalMeters <= 0) {
    denseCache.set(index, []);
    return [];
  }
  const out: SampledPose[] = [];
  const step = Math.max(0.5, stepM);
  for (let m = 0; m < index.totalMeters; m += step) {
    out.push(interpolate(index, m));
  }
  const last = interpolate(index, index.totalMeters);
  if (out.length === 0 || last.traveledM - out[out.length - 1].traveledM > 0.2) {
    out.push(last);
  }
  denseCache.set(index, out);
  return out;
}

export function sampleToEgo(sample: SampledPose, pose: EgoPose): EgoFramePoint {
  const xz = lngLatToEgo(sample.position, [pose.lng, pose.lat], pose.heading);
  return {
    x: xz.x,
    z: xz.z,
    traveledM: sample.traveledM,
    heading: sample.heading,
  };
}

/** Slice the active route around the shared ego pose and project into the local heading frame. */
export function routeWindowInEgoFrame(
  coords: LngLat[],
  pose: EgoPose,
  behindM = VIZ_BEHIND_M,
  aheadM = VIZ_AHEAD_M,
): EgoFramePoint[] {
  const index = indexFor(coords);
  const dense = densifyRoute(index);
  const lo = pose.traveledM - behindM;
  const hi = pose.traveledM + aheadM;
  const slice = dense.filter((s) => s.traveledM >= lo && s.traveledM <= hi);
  if (slice.length < 2) {
    const fallback = [
      interpolate(index, Math.max(0, lo)),
      interpolate(index, Math.min(index.totalMeters, hi)),
    ];
    return fallback.map((s) => sampleToEgo(s, pose));
  }
  return slice.map((s) => sampleToEgo(s, pose));
}

export function interpolateInEgoFrame(coords: LngLat[], meters: number, pose: EgoPose): EgoFramePoint {
  return sampleToEgo(interpolate(indexFor(coords), meters), pose);
}

/** Offset a geographic point by meters right of `headingDeg` (and optional meters forward). */
export function offsetAlongHeading(
  origin: LngLat,
  headingDeg: number,
  rightM: number,
  forwardM = 0,
): LngLat {
  const h = headingDeg * DEG;
  const east = Math.sin(h) * forwardM + Math.cos(h) * rightM;
  const north = Math.cos(h) * forwardM - Math.sin(h) * rightM;
  const mPerDegLat = 111320;
  const mPerDegLng = 111320 * Math.cos(origin[1] * DEG);
  return [origin[0] + east / mPerDegLng, origin[1] + north / mPerDegLat];
}

export function maneuverInEgoFrame(
  maneuver: Maneuver,
  pose: EgoPose,
  coords: LngLat[],
  rightM: number,
): EgoFramePoint | null {
  const along = lngLatToEgo(maneuver.location, [pose.lng, pose.lat], pose.heading);
  if (along.z > VIZ_AHEAD_M + 20 || along.z < -VIZ_BEHIND_M) return null;
  const index = indexFor(coords);
  const at = interpolate(index, closestTraveledM(index, maneuver.location));
  const offset = offsetAlongHeading(at.position, at.heading, rightM, 1.2);
  const xz = lngLatToEgo(offset, [pose.lng, pose.lat], pose.heading);
  return { x: xz.x, z: xz.z, traveledM: at.traveledM, heading: at.heading };
}

export function egoWorldShift(
  pose: EgoPose,
  origin: LngLat,
): { x: number; z: number; yaw: number } {
  const enu = lngLatToLocal([pose.lng, pose.lat], origin);
  return { x: -enu.x, z: -enu.z, yaw: -(pose.heading * DEG) };
}

export function isTurnManeuver(m: Maneuver): boolean {
  const mod = m.modifier ?? "";
  return (
    m.type === "turn" ||
    m.type === "end of road" ||
    m.type === "roundabout" ||
    m.type === "rotary" ||
    m.type === "fork" ||
    m.type === "on ramp" ||
    m.type === "off ramp" ||
    mod.includes("left") ||
    mod.includes("right")
  );
}
