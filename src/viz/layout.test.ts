import { describe, expect, it } from "vitest";
import { isParkedFullscreen, useMiniMap } from "./layout";

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
