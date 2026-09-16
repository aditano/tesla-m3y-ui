import type { Gear, TripPhase } from "../state/types";

/** Parked viz is immersive whenever the car is in P and FSD is not running. */
export function isParkedFullscreen(gear: Gear, phase: TripPhase): boolean {
  return gear === "P" && phase !== "fsd";
}

/** Split viz vs map; parked always uses the inset map card. */
export function useMiniMap(parked: boolean, vizRatio: number): boolean {
  return parked || vizRatio > 0.74;
}
