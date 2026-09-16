import { describe, expect, it } from "vitest";
import { PARKED_STUDIO, parkedStudioIsBlitSafe } from "./parkedStudio";

describe("PARKED_STUDIO", () => {
  it("stays on one-shot env and contact shadows so Playwright can blit the canvas", () => {
    expect(parkedStudioIsBlitSafe()).toBe(true);
    expect(PARKED_STUDIO.shadow.scale[1]).toBeGreaterThan(PARKED_STUDIO.shadow.scale[0]);
    expect(PARKED_STUDIO.floor.roughness).toBeGreaterThan(0.2);
    expect(PARKED_STUDIO.floor.roughness).toBeLessThan(0.7);
  });
});
