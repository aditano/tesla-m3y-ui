import { describe, expect, it } from "vitest";
import { HOTSPOT_PINS, hotspotPin } from "./hotspots";

describe("HOTSPOT_PINS", () => {
  it("pins FRUNK on the centerline and CHARGE on the driver door", () => {
    expect(hotspotPin("frunk").position[0]).toBe(0);
    expect(hotspotPin("charge").position[0]).toBeLessThan(-0.8);
  });

  it("puts TRUNK on the rear decklid, not the bumper or the quarter panel", () => {
    const [x, y, z] = hotspotPin("trunk").position;
    expect(Math.abs(x)).toBeLessThan(0.15);
    expect(z).toBeGreaterThan(-2.15);
    expect(z).toBeLessThan(-1.85);
    expect(y).toBeGreaterThan(0.82);
    expect(y).toBeLessThan(1.02);
  });

  it("puts FRUNK on the hood rather than the roof", () => {
    const [, y, z] = hotspotPin("frunk").position;
    expect(z).toBeGreaterThan(1.2);
    expect(y).toBeLessThan(1.05);
  });

  it("exports one pin per Open card", () => {
    expect(HOTSPOT_PINS.map((p) => p.kicker)).toEqual(["FRUNK", "TRUNK", "CHARGE"]);
  });
});
