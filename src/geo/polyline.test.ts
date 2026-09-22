import { describe, expect, it } from "vitest";
import {
  bearingDegrees,
  buildIndex,
  etaSeconds,
  formatDuration,
  haversineMeters,
  interpolate,
  lerpHeading,
  lngLatToLocal,
  splitAtMeters,
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

  it("splits a line into the driven gray portion and the blue remainder", () => {
    const coords: [number, number][] = [
      [-80, 40],
      [-80, 40.01],
      [-80, 40.02],
    ];
    const idx = buildIndex(coords);
    const parts = splitAtMeters(idx, idx.totalMeters / 2);
    expect(parts.traveled.length).toBeGreaterThan(1);
    expect(parts.remaining.length).toBeGreaterThan(1);
    expect(parts.traveled[0]).toEqual(coords[0]);
    expect(parts.remaining[0][1]).toBeCloseTo(40.01, 2);
    expect(parts.remaining[parts.remaining.length - 1]).toEqual(coords[2]);
    expect(splitAtMeters(idx, 0).traveled).toEqual([]);
    expect(splitAtMeters(idx, 0).remaining).toEqual(coords);
  });

  it("estimates arrival from speed once the car is moving", () => {
    expect(etaSeconds(1000, 100, 500, 0)).toBeCloseTo(50, 5);
    expect(etaSeconds(1000, 100, 500, 30)).toBeLessThan(50);
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
