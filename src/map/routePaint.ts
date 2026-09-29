/** Gray traveled casing updates after this much distance since the last map paint, not per sim tick. */
export const TRAVELED_REPAINT_M = 6;

/** Path already driven is gray. The path ahead stays blue. */
export const ROUTE_TRAVELED_COLOR = "#9aa3ad";
export const ROUTE_AHEAD_COLOR = "#5aa7ff";

export function traveledPaintDue(
  lastPaintedM: number | null,
  traveledM: number,
  force: boolean,
): boolean {
  if (force || lastPaintedM == null) return true;
  if (traveledM < lastPaintedM) return true;
  return traveledM - lastPaintedM > TRAVELED_REPAINT_M;
}
