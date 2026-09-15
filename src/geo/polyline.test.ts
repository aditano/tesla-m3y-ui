import { describe, expect, it } from "vitest";
import {
  bearingDegrees,
  buildIndex,
  formatDuration,
  haversineMeters,
  interpolate,
  lerpHeading,
  lngLatToLocal,
} from "./polyline";

describe("polyline", () => {
  it("measures downtown Pittsburgh blocks", () => {
    const a: [number, number] = [-79.9959, 40.4406];
    const b: [number, number] = [-79.9959, 40.4506];
    const d = haversineMeters(a, b);
    expect(d).toBeGreaterThan(1000);
    expect(d).toBeLessThan(1200);
  });

  it("interpolates along a two-point line", () => {
    const coords: [number, number][] = [
      [-80, 40],
      [-80, 40.01],
    ];
    const idx = buildIndex(coords);
    const mid = interpolate(idx, idx.totalMeters / 2);
    expect(mid.position[1]).toBeCloseTo(40.005, 3);
    expect(mid.heading).toBeCloseTo(0, 0);
  });

  it("wraps heading lerp across 0°", () => {
    expect(lerpHeading(350, 10, 0.5)).toBeCloseTo(0, 0);
  });

  it("converts east-north local meters", () => {
    const origin: [number, number] = [-80, 40];
    const east = lngLatToLocal([-79.99, 40], origin);
    const north = lngLatToLocal([-80, 40.01], origin);
    expect(east.x).toBeGreaterThan(0);
    expect(Math.abs(east.z)).toBeLessThan(5);
    expect(north.z).toBeGreaterThan(0);
    expect(Math.abs(north.x)).toBeLessThan(5);
  });

  it("reports north bearing", () => {
    expect(bearingDegrees([-80, 40], [-80, 40.01])).toBeCloseTo(0, 0);
  });

  it("formats duration", () => {
    expect(formatDuration(90)).toBe("2 min");
    expect(formatDuration(20)).toBe("< 1 min");
    expect(formatDuration(3720)).toBe("1 hr 2 min");
  });
});
