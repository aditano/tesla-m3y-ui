import { describe, expect, it } from "vitest";
import { BufferAttribute, BufferGeometry, Mesh } from "three";
import { classifyCarMaterial, ensureMeshTangents, GLASS_OPTICS, PAINT_NATA_RED } from "./carMaterials";

describe("classifyCarMaterial", () => {
  it("maps Sketchfab names to PBR roles", () => {
    expect(classifyCarMaterial("CAR PAINT")).toBe("paint");
    expect(classifyCarMaterial("chrome")).toBe("chrome");
    expect(classifyCarMaterial("Glass")).toBe("glass");
    expect(classifyCarMaterial("glass-back")).toBe("backGlass");
    expect(classifyCarMaterial("glass-side")).toBe("sideGlass");
    expect(classifyCarMaterial("glass-wind")).toBe("glass");
    expect(classifyCarMaterial("LED PHARE")).toBe("headlight");
    expect(classifyCarMaterial("Material.007")).toBe("tail");
    expect(classifyCarMaterial("Material.002")).toBe("paint");
    expect(classifyCarMaterial("Material.014")).toBe("caliper");
    expect(classifyCarMaterial("Material.009")).toBe("rubber");
    expect(classifyCarMaterial("Material.011")).toBe("rim");
    expect(classifyCarMaterial("PLASTIC")).toBe("plastic");
    expect(classifyCarMaterial("Material.005")).toBe("chrome");
    expect(classifyCarMaterial("Material.017")).toBe("roofGlass");
    expect(classifyCarMaterial("unknown-part")).toBe("other");
  });

  it("keeps the nata red paint hex as a licensed tint, not a ripped asset", () => {
    expect(PAINT_NATA_RED).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it("computes tangents when the mesh has UVs and an index", () => {
    const geo = new BufferGeometry();
    geo.setAttribute(
      "position",
      new BufferAttribute(new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]), 3),
    );
    geo.setAttribute("normal", new BufferAttribute(new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]), 3));
    geo.setAttribute("uv", new BufferAttribute(new Float32Array([0, 0, 1, 0, 0, 1]), 2));
    geo.setIndex([0, 1, 2]);
    expect(ensureMeshTangents(new Mesh(geo))).toBe(true);
    expect(geo.getAttribute("tangent")).toBeTruthy();
  });

  it("gives roof, side, backlight, and windshield distinct IOR", () => {
    const iors = [
      GLASS_OPTICS.roof.ior,
      GLASS_OPTICS.side.ior,
      GLASS_OPTICS.back.ior,
      GLASS_OPTICS.windshield.ior,
    ];
    expect(new Set(iors).size).toBe(4);
    expect(GLASS_OPTICS.roof.transmission).toBe(0);
    expect(GLASS_OPTICS.back.transmission).toBe(0);
    expect(GLASS_OPTICS.side.transmission).toBeLessThan(0.01);
  });
});
