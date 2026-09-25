import { VIZ_RATIO_MAX, VIZ_RATIO_MIN } from "../geo/constants";
import type { Gear, TripPhase } from "../state/types";

/** Parked viz is immersive whenever the car is in P and FSD is not running. */
export function isParkedFullscreen(gear: Gear, phase: TripPhase): boolean {
  return gear === "P" && phase !== "fsd";
}

/** Split viz vs map; parked always uses the inset map card. */
export function useMiniMap(parked: boolean, vizRatio: number): boolean {
  return parked || vizRatio > 0.74;
}

function clampVizRatio(ratio: number): number {
  return Math.min(VIZ_RATIO_MAX, Math.max(VIZ_RATIO_MIN, ratio));
}

/** Keyboard step for the viz/map splitter. Shift moves a larger step. Unhandled keys return null. */
export function vizRatioForKey(current: number, key: string, shift: boolean): number | null {
  const step = shift ? 0.08 : 0.02;
  if (key === "ArrowRight" || key === "ArrowUp") return clampVizRatio(current + step);
  if (key === "ArrowLeft" || key === "ArrowDown") return clampVizRatio(current - step);
  if (key === "Home") return VIZ_RATIO_MIN;
  if (key === "End") return VIZ_RATIO_MAX;
  return null;
}
