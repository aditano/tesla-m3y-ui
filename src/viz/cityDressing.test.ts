import { describe, expect, it } from "vitest";
import { cityBlocksAlong } from "./cityDressing";

describe("city blocks", () => {
  it("lines both sides of a straight road and stays off the lanes", () => {
    const center = Array.from({ length: 48 }, (_, i) => ({ x: 0, z: i * 6 }));
    const blocks = cityBlocksAlong(center);
    expect(blocks.length).toBeGreaterThan(8);
    expect(blocks.some((b) => b.x < -12)).toBe(true);
    expect(blocks.some((b) => b.x > 12)).toBe(true);
    expect(blocks.every((b) => Math.abs(b.x) > 12)).toBe(true);
    expect(blocks.every((b) => b.h > 4 && b.w > 4)).toBe(true);
  });

  it("is stable for the same centerline", () => {
    const center = Array.from({ length: 20 }, (_, i) => ({ x: i * 3, z: i * 8 }));
    const a = cityBlocksAlong(center);
    const b = cityBlocksAlong(center);
    expect(a).toEqual(b);
  });
});
