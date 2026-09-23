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
