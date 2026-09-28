import { describe, expect, it } from "vitest";
import { buildIndex, haversineMeters } from "./polyline";
import {
  arrivalBatteryPct,
  sliceLine,
  trafficAhead,
  trafficFromSegments,
  tripBarSegments,
} from "./traffic";
import type { LngLat } from "../state/types";

describe("estimated traffic", () => {
  it("marks slow stretches and merges neighbours of the same level", () => {
    const brisk = { distanceM: 100, durationS: 7 };
    const segments = [
      brisk,
      brisk,
      { distanceM: 50, durationS: 20 },
      { distanceM: 50, durationS: 20 },
      brisk,
      brisk,
      { distanceM: 80, durationS: 11 },
      brisk,
      brisk,
      brisk,
    ];
    const spans = trafficFromSegments(segments);
    expect(spans).toEqual([
      { startM: 200, endM: 300, level: "heavy" },
      { startM: 500, endM: 580, level: "moderate" },
    ]);
  });

  it("ignores very short routes and drops spans under the minimum length", () => {
    expect(trafficFromSegments([{ distanceM: 10, durationS: 9 }])).toEqual([]);
    const tiny = trafficFromSegments([
      { distanceM: 100, durationS: 7 },
      { distanceM: 100, durationS: 7 },
      { distanceM: 100, durationS: 7 },
      { distanceM: 100, durationS: 7 },
      { distanceM: 20, durationS: 20 },
    ]);
    expect(tiny).toEqual([]);
  });

  it("clips spans to what is still ahead of the car", () => {
    const spans = [
      { startM: 0, endM: 100, level: "heavy" as const },
      { startM: 150, endM: 300, level: "moderate" as const },
    ];
    expect(trafficAhead(spans, 200)).toEqual([{ startM: 200, endM: 300, level: "moderate" }]);
    expect(trafficAhead(undefined, 0)).toEqual([]);
  });

  it("slices the polyline between two distances", () => {
    const coords: LngLat[] = [
      [-80, 40.44],
      [-79.99, 40.44],
      [-79.98, 40.44],
    ];
    const index = buildIndex(coords);
    const half = index.totalMeters / 2;
    const line = sliceLine(index, half - 100, half + 100);
    expect(line.length).toBe(3);
    expect(line[1]).toEqual(coords[1]);
    expect(haversineMeters(line[0], line[line.length - 1])).toBeCloseTo(200, 0);
    expect(sliceLine(index, 50, 50)).toEqual([]);
  });

  it("maps spans onto the trip progress line", () => {
    expect(tripBarSegments([{ startM: 250, endM: 500, level: "heavy" }], 1000)).toEqual([
      { leftPct: 25, widthPct: 25, level: "heavy" },
    ]);
  });
});

describe("energy to destination", () => {
  it("subtracts about a third of a percent per mile", () => {
    expect(arrivalBatteryPct(78, 0)).toBe(78);
    expect(arrivalBatteryPct(78, 1609.344 * 30)).toBe(68);
    expect(arrivalBatteryPct(5, 1609.344 * 100)).toBe(0);
  });
});
