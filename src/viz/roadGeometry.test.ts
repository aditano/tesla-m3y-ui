import { describe, expect, it } from "vitest";
import { dashedRibbonArrays, offsetSides, ribbonArrays } from "../viz/roadGeometry";

describe("road geometry", () => {
  it("offsets right turns onto +X", () => {
    const pts = [
      { x: 0, z: 0 },
      { x: 0, z: 10 },
      { x: 8, z: 18 },
    ];
    const { right } = offsetSides(pts, 2);
    expect(right[0].x).toBeGreaterThan(0);
    expect(right[right.length - 1].x).toBeGreaterThan(pts[pts.length - 1].x);
  });

  it("emits a ribbon that follows a curved centerline", () => {
    const pts = Array.from({ length: 16 }, (_, i) => {
      const t = i / 15;
      return { x: t * t * 12, z: t * 20 };
    });
    const { left, right } = offsetSides(pts, 1.2);
    const ribbon = ribbonArrays(left, right, 0.02);
    expect(ribbon.positions.length).toBeGreaterThan(9);
    expect(ribbon.normals[1]).toBe(1);
  });

  it("builds dashed marks along a curve instead of one box per OSM vertex", () => {
    const pts = Array.from({ length: 24 }, (_, i) => {
      const t = i / 23;
      return { x: Math.sin(t * Math.PI) * 6, z: t * 40 };
    });
    const dashes = dashedRibbonArrays(pts, 0.08, 0.04);
    expect(dashes.positions.length).toBeGreaterThan(30);
  });
});
