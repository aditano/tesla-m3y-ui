import { describe, expect, it } from "vitest";
import { powerNorm } from "./driveHud";

describe("power meter", () => {
  it("shows a little power while cruising", () => {
    const cruise = powerNorm(32, 32, 0);
    expect(cruise).toBeGreaterThan(0.05);
    expect(cruise).toBeLessThan(0.36);
  });

  it("fills upward while accelerating and downward while braking", () => {
    const cruise = powerNorm(30, 30, 0);
    expect(powerNorm(10, 28, 1)).toBeGreaterThan(cruise);
    expect(powerNorm(40, 18, 1)).toBeLessThan(0);
  });
});