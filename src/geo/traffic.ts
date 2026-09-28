import { interpolate, type PolylineIndex } from "./polyline";
import type { LngLat, TrafficLevel, TrafficSpan } from "../state/types";

/** Tesla nav: orange for slow, red for stop-and-go. Drawn on top of the blue route. */
export const TRAFFIC_COLORS: Record<TrafficLevel, string> = {
  moderate: "#f59f00",
  heavy: "#e8423f",
};

/** Segment speed as a fraction of the route's brisk (80th percentile) speed. */
export const HEAVY_RATIO = 0.35;
export const MODERATE_RATIO = 0.55;
export const MIN_SPAN_M = 60;
export const MERGE_GAP_M = 25;

export interface SegmentSample {
  distanceM: number;
  durationS: number;
}

/**
 * Public OSRM has no live traffic feed. This estimates slow stretches from the
 * per-segment speeds it does return, so the route can carry Tesla-style color.
 */
export function trafficFromSegments(segments: SegmentSample[]): TrafficSpan[] {
  const valid = (s: SegmentSample) => s.distanceM > 0 && s.durationS > 0;
  const speeds = segments
    .filter(valid)
    .map((s) => s.distanceM / s.durationS)
    .sort((a, b) => a - b);
  if (speeds.length < 4) return [];
  const brisk = speeds[Math.min(speeds.length - 1, Math.floor(speeds.length * 0.8))];
  if (!(brisk > 0)) return [];

  const spans: TrafficSpan[] = [];
  let at = 0;
  for (const s of segments) {
    const start = at;
    at += Math.max(0, s.distanceM);
    if (!valid(s)) continue;
    const ratio = s.distanceM / s.durationS / brisk;
    const level: TrafficLevel | null = ratio < HEAVY_RATIO ? "heavy" : ratio < MODERATE_RATIO ? "moderate" : null;
    if (!level) continue;
    const last = spans[spans.length - 1];
    if (last && last.level === level && start - last.endM <= MERGE_GAP_M) {
      last.endM = at;
    } else {
      spans.push({ startM: start, endM: at, level });
    }
  }
  return spans.filter((s) => s.endM - s.startM >= MIN_SPAN_M);
}

/** Only the part of each span the car has not driven yet. */
export function trafficAhead(spans: TrafficSpan[] | undefined, traveledM: number): TrafficSpan[] {
  if (!spans) return [];
  return spans
    .filter((s) => s.endM > traveledM)
    .map((s) => ({ ...s, startM: Math.max(s.startM, traveledM) }))
    .filter((s) => s.endM - s.startM > 0.5);
}

/** Polyline between two distances along the route. */
export function sliceLine(index: PolylineIndex, startM: number, endM: number): LngLat[] {
  const clamp = (m: number) => Math.max(0, Math.min(index.totalMeters, m));
  const a = clamp(startM);
  const b = clamp(endM);
  if (index.coords.length < 2 || b - a < 0.5) return [];
  const out: LngLat[] = [interpolate(index, a).position];
  for (let i = 0; i < index.coords.length; i++) {
    const m = index.cumMeters[i];
    if (m > a && m < b) out.push(index.coords[i]);
  }
  out.push(interpolate(index, b).position);
  return out;
}

export interface BarSegment {
  leftPct: number;
  widthPct: number;
  level: TrafficLevel;
}

/** Traffic marks on the trip progress line, as percentages of the whole trip. */
export function tripBarSegments(spans: TrafficSpan[] | undefined, totalM: number): BarSegment[] {
  if (!spans || !(totalM > 0)) return [];
  return spans.map((s) => {
    const left = Math.max(0, Math.min(100, (s.startM / totalM) * 100));
    const right = Math.max(left, Math.min(100, (s.endM / totalM) * 100));
    return { leftPct: left, widthPct: Math.max(0.6, right - left), level: s.level };
  });
}

/** Highland Long Range–ish: ~250 Wh/mi from a ~75 kWh pack (≈0.33% per mile). */
export const WH_PER_MILE = 250;
export const PACK_KWH = 75;

/** Battery % left on arrival, the number Tesla shows on the trip card. */
export function arrivalBatteryPct(batteryPct: number, remainingM: number): number {
  const miles = Math.max(0, remainingM) / 1609.344;
  const usedPct = ((miles * WH_PER_MILE) / (PACK_KWH * 1000)) * 100;
  return Math.max(0, Math.min(100, Math.round(batteryPct - usedPct)));
}
