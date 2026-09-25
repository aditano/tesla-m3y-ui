import { describe, expect, it } from "vitest";
import { TRAVELED_REPAINT_M, traveledPaintDue } from "./routePaint";

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

  it("repaints immediately when the car rewinds or the route changes", () => {
    expect(traveledPaintDue(12, 4, false)).toBe(true);
    expect(traveledPaintDue(12, 14, true)).toBe(true);
    expect(traveledPaintDue(12, 18, false)).toBe(false);
    expect(traveledPaintDue(null, 0, false)).toBe(true);
  });
});
