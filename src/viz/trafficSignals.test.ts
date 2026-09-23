import { describe, expect, it } from "vitest";
import { trafficTurnLamp } from "./RoadKit";

describe("traffic turn lamps", () => {
  it("lights amber on a fixed subset of slots", () => {
    expect(trafficTurnLamp(0)).toBe("right");
    expect(trafficTurnLamp(1)).toBe("left");
    expect(trafficTurnLamp(2)).toBe("off");
    expect(trafficTurnLamp(4)).toBe("right");
  });
});
