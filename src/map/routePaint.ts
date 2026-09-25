/** Gray traveled casing updates after this much distance since the last map paint, not per sim tick. */
export const TRAVELED_REPAINT_M = 6;

export function traveledPaintDue(
  lastPaintedM: number | null,
  traveledM: number,
  force: boolean,
): boolean {
  if (force || lastPaintedM == null) return true;
  if (traveledM < lastPaintedM) return true;
  return traveledM - lastPaintedM > TRAVELED_REPAINT_M;
}
