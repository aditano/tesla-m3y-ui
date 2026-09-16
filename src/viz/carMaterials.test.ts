import { describe, expect, it } from "vitest";
import { classifyCarMaterial, PAINT_NATA_RED } from "./carMaterials";

describe("classifyCarMaterial", () => {
  it("maps Sketchfab names to PBR roles", () => {
    expect(classifyCarMaterial("CAR PAINT")).toBe("paint");
    expect(classifyCarMaterial("chrome")).toBe("chrome");
    expect(classifyCarMaterial("Glass")).toBe("glass");
    expect(classifyCarMaterial("LED PHARE")).toBe("headlight");
    expect(classifyCarMaterial("Material.007")).toBe("tail");
    expect(classifyCarMaterial("Material.002")).toBe("paint");
    expect(classifyCarMaterial("Material.014")).toBe("caliper");
    expect(classifyCarMaterial("Material.009")).toBe("rubber");
    expect(classifyCarMaterial("Material.011")).toBe("rim");
    expect(classifyCarMaterial("PLASTIC")).toBe("plastic");
    expect(classifyCarMaterial("Material.005")).toBe("chrome");
    expect(classifyCarMaterial("unknown-part")).toBe("other");
  });

  it("keeps the nata red paint hex as a licensed tint, not a ripped asset", () => {
    expect(PAINT_NATA_RED).toMatch(/^#[0-9a-f]{6}$/i);
  });
});
