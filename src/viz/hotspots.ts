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
 * Nata pins: FRUNK on hood center, TRUNK on the decklid (the dot is the
 * leader anchor; a short stem keeps the card on the lid), CHARGE on the
 * driver-side charge-port door.
 *
 * App space after `fitHighland`: nose +Z, tail -Z. The Highland decklid
 * centroid is about y=1.01, z=-1.89.
 */
export const HOTSPOT_PINS: readonly HotspotPin[] = [
  { id: "frunk", kicker: "FRUNK", position: [0, 0.78, 1.52], hit: [1.48, 0.18, 0.88] },
  { id: "trunk", kicker: "TRUNK", position: [0, 1.0, -1.88], hit: [1.2, 0.2, 0.7] },
  { id: "charge", kicker: "CHARGE", position: [-0.93, 0.7, -1.58], hit: [0.16, 0.26, 0.28] },
];

export function hotspotPin(id: HotspotId): HotspotPin {
  const pin = HOTSPOT_PINS.find((p) => p.id === id);
  if (!pin) {
    throw new Error(`Unknown hotspot: ${id}`);
  }
  return pin;
}
