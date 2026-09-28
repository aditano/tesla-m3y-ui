import { describe, expect, it } from "vitest";
import { meterSegments, powerNorm } from "./driveHud";

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
describe("segmented power meter", () => {
  it("lights whole segments up for power and down for regen", () => {
    expect(meterSegments(0)).toEqual({ up: 0, down: 0 });
    expect(meterSegments(0.5, 14)).toEqual({ up: 7, down: 0 });
    expect(meterSegments(0.01, 14)).toEqual({ up: 1, down: 0 });
    expect(meterSegments(-1, 14)).toEqual({ up: 0, down: 14 });
    expect(meterSegments(4, 14)).toEqual({ up: 14, down: 0 });
    expect(meterSegments(Number.NaN, 14)).toEqual({ up: 0, down: 0 });
  });
});
