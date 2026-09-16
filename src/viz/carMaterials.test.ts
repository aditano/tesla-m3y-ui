import { describe, expect, it } from "vitest";
import { classifyCarMaterial } from "./carMaterials";

describe("classifyCarMaterial", () => {
  it("maps Sketchfab names to PBR roles", () => {
    expect(classifyCarMaterial("CAR PAINT")).toBe("paint");
    expect(classifyCarMaterial("chrome")).toBe("chrome");
    expect(classifyCarMaterial("Glass")).toBe("glass");
    expect(classifyCarMaterial("LED PHARE")).toBe("headlight");
    expect(classifyCarMaterial("Material.007")).toBe("tail");
    expect(classifyCarMaterial("Material.014")).toBe("caliper");
    expect(classifyCarMaterial("Material.009")).toBe("rubber");
    expect(classifyCarMaterial("PLASTIC")).toBe("plastic");
    expect(classifyCarMaterial("unknown-part")).toBe("other");
  });
});
