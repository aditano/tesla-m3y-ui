import type { LngLat } from "../state/types";

const EARTH_M = 6371000;
const DEG = Math.PI / 180;

export function haversineMeters(a: LngLat, b: LngLat): number {
  const dLat = (b[1] - a[1]) * DEG;
  const dLng = (b[0] - a[0]) * DEG;
  const lat1 = a[1] * DEG;
  const lat2 = b[1] * DEG;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function bearingDegrees(a: LngLat, b: LngLat): number {
  const lat1 = a[1] * DEG;
  const lat2 = b[1] * DEG;
  const dLng = (b[0] - a[0]) * DEG;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

export function lerpHeading(from: number, to: number, t: number): number {
  const delta = ((to - from + 540) % 360) - 180;
  return (from + delta * t + 360) % 360;
}

export interface PolylineIndex {
  coords: LngLat[];
  cumMeters: number[];
  totalMeters: number;
}

export function buildIndex(coords: LngLat[]): PolylineIndex {
  if (coords.length === 0) {
    return { coords: [], cumMeters: [0], totalMeters: 0 };
  }
  const cum: number[] = [0];
  for (let i = 1; i < coords.length; i++) {
    cum.push(cum[i - 1] + haversineMeters(coords[i - 1], coords[i]));
  }
  return { coords, cumMeters: cum, totalMeters: cum[cum.length - 1] };
}

const indexCache: { key: string; index: PolylineIndex } = {
  key: "",
  index: buildIndex([]),
};

function indexKey(coords: LngLat[]): string {
  if (coords.length === 0) return "0";
  const mid = coords[Math.floor(coords.length / 2)];
  return `${coords.length}:${coords[0].join(",")}:${mid.join(",")}:${coords[coords.length - 1].join(",")}`;
}

/** Shared polyline index for the drive sim and FSD viz so both sample the same meters. */
export function indexFor(coords: LngLat[]): PolylineIndex {
  const key = indexKey(coords);
  if (indexCache.key !== key) {
    indexCache.key = key;
    indexCache.index = buildIndex(coords);
  }
  return indexCache.index;
}

export interface SampledPose {
  position: LngLat;
  heading: number;
  traveledM: number;
  remainingM: number;
  segmentIndex: number;
}

export function closestTraveledM(index: PolylineIndex, p: LngLat): number {
  if (index.coords.length === 0) return 0;
  let bestM = 0;
  let bestD = Infinity;
  for (let i = 0; i < index.coords.length; i++) {
    const d = haversineMeters(index.coords[i], p);
    if (d < bestD) {
      bestD = d;
      bestM = index.cumMeters[i];
    }
  }
  return bestM;
}

export function interpolate(index: PolylineIndex, meters: number): SampledPose {
  const { coords, cumMeters, totalMeters } = index;
  if (coords.length === 0) {
    return {
      position: [0, 0],
      heading: 0,
      traveledM: 0,
      remainingM: 0,
      segmentIndex: 0,
    };
  }
  if (coords.length === 1) {
    return {
      position: coords[0],
      heading: 0,
      traveledM: 0,
      remainingM: 0,
      segmentIndex: 0,
    };
  }
  const clamped = Math.max(0, Math.min(totalMeters, meters));
  let i = 1;
  while (i < cumMeters.length && cumMeters[i] < clamped) i++;
  const i0 = i - 1;
  const segLen = Math.max(1e-6, cumMeters[i] - cumMeters[i0]);
  const t = (clamped - cumMeters[i0]) / segLen;
  const a = coords[i0];
  const b = coords[i];
  const position: LngLat = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  let heading = bearingDegrees(a, b);
  if (i + 1 < coords.length && t > 0.85) {
    heading = lerpHeading(heading, bearingDegrees(b, coords[i + 1]), (t - 0.85) / 0.15);
  }
  return {
    position,
    heading,
    traveledM: clamped,
    remainingM: totalMeters - clamped,
    segmentIndex: i0,
  };
}

/** Driven portion (renders gray) and the rest of the route (renders blue). */
export function splitAtMeters(index: PolylineIndex, meters: number): { traveled: LngLat[]; remaining: LngLat[] } {
  const { coords, cumMeters, totalMeters } = index;
  if (coords.length === 0) return { traveled: [], remaining: [] };
  if (coords.length === 1) return { traveled: [], remaining: [coords[0]] };
  const clamped = Math.max(0, Math.min(totalMeters, meters));
  if (clamped <= 1) return { traveled: [], remaining: coords.slice() };
  if (clamped >= totalMeters - 1) return { traveled: coords.slice(), remaining: [] };
  const here = interpolate(index, clamped).position;
  const traveled: LngLat[] = [];
  for (let i = 0; i < coords.length; i++) {
    if (cumMeters[i] <= clamped) traveled.push(coords[i]);
    else break;
  }
  const last = traveled[traveled.length - 1];
  if (!last || last[0] !== here[0] || last[1] !== here[1]) traveled.push(here);
  const remaining: LngLat[] = [here];
  for (let i = 0; i < coords.length; i++) {
    if (cumMeters[i] > clamped) remaining.push(coords[i]);
  }
  return { traveled, remaining };
}

export interface LocalPoint {
  x: number;
  z: number;
}

/** Local ENU: +X east, +Z north, Y up in Three.js after mapping z → -z or using +Z north. */
export function lngLatToLocal(p: LngLat, origin: LngLat): LocalPoint {
  const mPerDegLat = 111320;
  const mPerDegLng = 111320 * Math.cos(origin[1] * DEG);
  return {
    x: (p[0] - origin[0]) * mPerDegLng,
    z: (p[1] - origin[1]) * mPerDegLat,
  };
}

export function offsetLngLat(origin: LngLat, eastM: number, northM: number): LngLat {
  const mPerDegLat = 111320;
  const mPerDegLng = 111320 * Math.cos(origin[1] * DEG);
  return [origin[0] + eastM / mPerDegLng, origin[1] + northM / mPerDegLat];
}

export function mphToMps(mph: number): number {
  return mph * 0.44704;
}

/** ETA from remaining distance. Uses live speed once the car is actually moving. */
export function etaSeconds(routeDistanceM: number, routeDurationS: number, remainingM: number, speedMph: number): number {
  if (speedMph > 4) return remainingM / Math.max(0.2, mphToMps(speedMph));
  return routeDurationS * (remainingM / Math.max(1, routeDistanceM));
}

export function mpsToMph(mps: number): number {
  return mps / 0.44704;
}

export function formatMiles(meters: number): string {
  const mi = meters / 1609.344;
  if (mi < 0.1) return `${Math.round(meters * 3.28084)} ft`;
  if (mi < 10) return `${mi.toFixed(1)} mi`;
  return `${Math.round(mi)} mi`;
}

export function formatDistance(meters: number, miles: boolean): string {
  if (miles) return formatMiles(meters);
  const km = meters / 1000;
  if (km < 0.1) return `${Math.round(meters)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  const h = Math.floor(s / 3600);
  const m = h > 0 ? Math.floor((s % 3600) / 60) : Math.max(1, Math.round(s / 60));
  if (h > 0) return `${h} hr ${m} min`;
  if (s < 30) return "< 1 min";
  return `${m} min`;
}

export function etaClock(seconds: number, now = new Date()): string {
  const arrive = new Date(now.getTime() + seconds * 1000);
  let hours = arrive.getHours();
  const mins = arrive.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${mins} ${ampm}`;
}

export function simplifyPolyline(coords: LngLat[], minM = 2.5): LngLat[] {
  if (coords.length < 3) return coords.slice();
  const out: LngLat[] = [coords[0]];
  for (let i = 1; i < coords.length - 1; i++) {
    if (haversineMeters(out[out.length - 1], coords[i]) >= minM) {
      out.push(coords[i]);
    }
  }
  out.push(coords[coords.length - 1]);
  return out;
}
