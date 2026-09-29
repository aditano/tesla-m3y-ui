import { describe, expect, it } from "vitest";
import { ROUTE_AHEAD_COLOR, ROUTE_TRAVELED_COLOR, TRAVELED_REPAINT_M, traveledPaintDue } from "./routePaint";
import { splitAtMeters, buildIndex } from "../geo/polyline";

describe("traveled route paint", () => {
  it("accumulates distance between paints instead of comparing one sim tick", () => {
    let last: number | null = null;
    const paints: number[] = [];
    for (let meters = 0; meters <= 20; meters += 1) {
      if (traveledPaintDue(last, meters, false)) {
        paints.push(meters);
        last = meters;
      }
    }
    expect(TRAVELED_REPAINT_M).toBe(6);
    expect(paints).toEqual([0, 7, 14]);
  });

  it("paints the driven path in a different color from the path ahead", () => {
    expect(ROUTE_TRAVELED_COLOR).not.toBe(ROUTE_AHEAD_COLOR);
    const index = buildIndex([
      [-79.9959, 40.4406],
      [-79.99, 40.445],
      [-79.98, 40.45],
    ]);
    const parts = splitAtMeters(index, index.totalMeters * 0.4);
    expect(parts.traveled.length).toBeGreaterThan(1);
    expect(parts.remaining.length).toBeGreaterThan(1);
    expect(parts.traveled[0]).not.toEqual(parts.remaining[parts.remaining.length - 1]);
  });

  it("repaints immediately when the car rewinds or the route changes", () => {
    expect(traveledPaintDue(12, 4, false)).toBe(true);
    expect(traveledPaintDue(12, 14, true)).toBe(true);
    expect(traveledPaintDue(12, 18, false)).toBe(false);
    expect(traveledPaintDue(null, 0, false)).toBe(true);
  });
});
