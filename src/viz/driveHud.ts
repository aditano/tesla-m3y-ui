import type { EgoPose, TripPhase } from "../state/types";

/** Steady-speed load so a cruise still shows a little power, the way aero drag does. */
export function cruisePowerNorm(speedMph: number): number {
  const v = Math.max(0, speedMph);
  return Math.min(0.36, (v * v) / 12000);
}

/**
 * Vertical meter position, -1 full regen to +1 full power.
 * `dtSec` of 0 (first paint, frozen still) falls back to cruise load.
 */
export function powerNorm(prevMph: number, nextMph: number, dtSec: number): number {
  const cruise = cruisePowerNorm(nextMph);
  if (!(dtSec > 0.02)) return cruise;
  const accel = (nextMph - prevMph) / dtSec;
  if (accel >= -0.35) {
    return Math.max(-1, Math.min(1, cruise + Math.min(1, Math.max(0, accel) / 8) * 0.85));
  }
  return Math.max(-1, Math.min(1, accel / 12));
}

/** Speed cluster the driving viz paints: mph, limit badge, and set speed while self-driving. */
export function driveHudReadout(pose: EgoPose, phase: TripPhase): {
  speedMph: number;
  unit: "mph";
  limitMph: number;
  setSpeedMph: number | null;
} {
  return {
    speedMph: Math.round(pose.speedMph),
    unit: "mph",
    limitMph: Math.round(pose.speedLimitMph),
    setSpeedMph: phase === "fsd" ? Math.round(pose.setSpeedMph) : null,
  };
}

/** Segments above and below the zero tick on the vertical power meter. */
export const METER_SEGMENTS = 14;

/** How many power segments (up) and regen segments (down) to light for a `-1..1` reading. */
export function meterSegments(norm: number, perSide: number = METER_SEGMENTS): { up: number; down: number } {
  const n = Math.max(-1, Math.min(1, Number.isFinite(norm) ? norm : 0));
  const lit = (v: number) => Math.max(0, Math.min(perSide, Math.ceil(v * perSide - 1e-6)));
  if (n >= 0) return { up: lit(n), down: 0 };
  return { up: 0, down: lit(-n) };
}
