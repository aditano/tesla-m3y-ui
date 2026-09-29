import { EquirectangularReflectionMapping } from "three";
import { describe, expect, it } from "vitest";
import {
  createCandyStudioEnv,
  PARKED_FOG,
  PARKED_STUDIO,
  parkedStudioIsBlitSafe,
  studioEnvStreakStrength,
  studioFor,
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

  it("paints a broad softbox into a static equirect env", () => {
    const tex = createCandyStudioEnv();
    expect(tex.mapping).toBe(EquirectangularReflectionMapping);
    const strength = studioEnvStreakStrength();
    expect(strength).toBeGreaterThan(40);
    expect(strength).toBeLessThan(160);
    tex.dispose();
  });

  it("keeps a separate dark studio for the appearance toggle", () => {
    expect(studioFor("dark").background).not.toBe(studioFor("light").background);
    expect(studioFor("light").shadow.kind).toBe("blob");
    expect(studioFor("dark").shadow.kind).toBe("blob");
  });
});
