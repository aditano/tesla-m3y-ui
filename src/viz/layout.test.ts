import { describe, expect, it } from "vitest";
import { VIZ_RATIO_MAX, VIZ_RATIO_MIN } from "../geo/constants";
import { isParkedFullscreen, useMiniMap, vizRatioForKey } from "./layout";

describe("parked layout", () => {
  it("is fullscreen in Park while idle, routed, or arrived", () => {
    expect(isParkedFullscreen("P", "idle")).toBe(true);
    expect(isParkedFullscreen("P", "routed")).toBe(true);
    expect(isParkedFullscreen("P", "arrived")).toBe(true);
  });

  it("leaves parked viz when FSD is engaged or not in Park", () => {
    expect(isParkedFullscreen("P", "fsd")).toBe(false);
    expect(isParkedFullscreen("D", "idle")).toBe(false);
    expect(isParkedFullscreen("R", "idle")).toBe(false);
  });

  it("uses the inset map while parked even at the default split ratio", () => {
    expect(useMiniMap(true, 0.42)).toBe(true);
    expect(useMiniMap(false, 0.42)).toBe(false);
    expect(useMiniMap(false, 0.8)).toBe(true);
  });
});

describe("visualization splitter keys", () => {
  it("steps the ratio with the arrow keys and clamps at the ends", () => {
    expect(vizRatioForKey(0.48, "ArrowRight", false)).toBeCloseTo(0.5);
    expect(vizRatioForKey(0.48, "ArrowLeft", false)).toBeCloseTo(0.46);
    expect(vizRatioForKey(0.48, "ArrowUp", true)).toBeCloseTo(0.56);
    expect(vizRatioForKey(0.48, "ArrowDown", true)).toBeCloseTo(0.4);
    expect(vizRatioForKey(VIZ_RATIO_MAX - 0.01, "ArrowRight", false)).toBe(VIZ_RATIO_MAX);
    expect(vizRatioForKey(VIZ_RATIO_MIN + 0.01, "ArrowLeft", false)).toBe(VIZ_RATIO_MIN);
    expect(vizRatioForKey(0.5, "Home", false)).toBe(VIZ_RATIO_MIN);
    expect(vizRatioForKey(0.5, "End", false)).toBe(VIZ_RATIO_MAX);
    expect(vizRatioForKey(0.5, "Enter", false)).toBeNull();
  });
});
