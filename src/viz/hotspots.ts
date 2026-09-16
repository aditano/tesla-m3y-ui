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
  { id: "frunk", kicker: "FRUNK", position: [0, 0.8, 1.48], hit: [1.48, 0.18, 0.88] },
  { id: "trunk", kicker: "TRUNK", position: [0, 0.9, -1.72], hit: [1.22, 0.14, 0.52] },
  { id: "charge", kicker: "CHARGE", position: [-0.93, 0.7, -1.28], hit: [0.16, 0.26, 0.28] },
];

export function hotspotPin(id: HotspotId): HotspotPin {
  const pin = HOTSPOT_PINS.find((p) => p.id === id);
  if (!pin) {
    throw new Error(`Unknown hotspot: ${id}`);
  }
  return pin;
}
