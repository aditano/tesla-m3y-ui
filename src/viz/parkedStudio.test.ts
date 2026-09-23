import { EquirectangularReflectionMapping } from "three";
import { describe, expect, it } from "vitest";
import {
  createCandyStudioEnv,
  PARKED_FOG,
  PARKED_STUDIO,
  parkedStudioIsBlitSafe,
  studioEnvStreakStrength,
} from "./parkedStudio";

describe("PARKED_STUDIO", () => {
  it("stays on one-shot env and contact shadows so Playwright can blit the canvas", () => {
    expect(parkedStudioIsBlitSafe()).toBe(true);
    expect(PARKED_STUDIO.shadow.scale[1]).toBeGreaterThan(PARKED_STUDIO.shadow.scale[0]);
    expect(PARKED_STUDIO.floor.roughness).toBeGreaterThan(0.2);
    expect(PARKED_STUDIO.floor.roughness).toBeLessThan(0.7);
  });

  it("keeps studio haze behind the car so the body stays sharp", () => {
    expect(PARKED_FOG.near).toBeGreaterThan(10);
    expect(PARKED_FOG.far).toBeGreaterThan(PARKED_FOG.near);
    expect(PARKED_FOG.far).toBeLessThan(60);
  });

  it("paints a thin bright streak into a static equirect env", () => {
    const tex = createCandyStudioEnv();
    expect(tex.mapping).toBe(EquirectangularReflectionMapping);
    expect(studioEnvStreakStrength()).toBeGreaterThan(60);
    tex.dispose();
  });
});
