/** Local-space pins on the fitted Model 3 (meters, after `extractCar`). */
export type HotspotId = "frunk" | "trunk" | "charge";

export type HotspotPin = {
  id: HotspotId;
  kicker: "FRUNK" | "TRUNK" | "CHARGE";
  /** Surface point the leader square sits on. */
  position: readonly [number, number, number];
  /** Invisible click volume centered on the pin. */
  hit: readonly [number, number, number];
};

/**
 * Nata pins: FRUNK on hood center, TRUNK on decklid/liftgate center (not the
 * quarter panel), CHARGE on the driver-side charge-port door.
 */
export const HOTSPOT_PINS: readonly HotspotPin[] = [
  { id: "frunk", kicker: "FRUNK", position: [0, 0.78, 1.52], hit: [1.48, 0.18, 0.88] },
  /**
   * Trunk pin sits low near the rear bumper face.  The 3D projection lands
   * near the bottom of the bezel in screen space; the tall CSS stem then
   * carries the card up into empty studio above the roofline.
   */
  { id: "trunk", kicker: "TRUNK", position: [0.12, 0.08, -2.0], hit: [1.22, 0.14, 0.52] },
  { id: "charge", kicker: "CHARGE", position: [-0.93, 0.7, -1.58], hit: [0.16, 0.26, 0.28] },
];

export function hotspotPin(id: HotspotId): HotspotPin {
  const pin = HOTSPOT_PINS.find((p) => p.id === id);
  if (!pin) {
    throw new Error(`Unknown hotspot: ${id}`);
  }
  return pin;
}
