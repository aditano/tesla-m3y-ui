import { describe, expect, it } from "vitest";
import { DRIVE_CHASE } from "./driveScene";
import { actorDrift, trafficBodyTone } from "./occupancy";

describe("occupancy actors", () => {
  it("paints other vehicles only in white and gray", () => {
    const tones = new Set(Array.from({ length: 12 }, (_, i) => trafficBodyTone(i)));
    expect(tones.has("white")).toBe(true);
    expect(tones.has("gray")).toBe(true);
    expect([...tones].every((tone) => tone === "white" || tone === "silver" || tone === "gray")).toBe(true);
  });

  it("holds actor drift at zero while a QA still is frozen", () => {
    expect(actorDrift(2, true)).toBe(0);
    expect(Math.abs(actorDrift(2, false))).toBeLessThanOrEqual(1.7);
  });
});

describe("drive chase camera", () => {
  it("sits above and behind the car, looking down the lane", () => {
    expect(DRIVE_CHASE.position[1]).toBeGreaterThan(4.5);
    expect(DRIVE_CHASE.position[2]).toBeLessThan(0);
    expect(DRIVE_CHASE.look[2]).toBeGreaterThan(8);
    expect(DRIVE_CHASE.fov).toBeGreaterThan(30);
    expect(DRIVE_CHASE.fov).toBeLessThan(55);
  });
});
