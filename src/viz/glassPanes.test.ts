import { BufferAttribute, BufferGeometry, Group, Mesh, MeshStandardMaterial, Vector3 } from "three";
import { describe, expect, it } from "vitest";
import {
  classifyGlassByWorldPoint,
  glassMeshName,
  splitGreenhouseGlass,
} from "./glassPanes";

describe("classifyGlassByWorldPoint", () => {
  it("buckets backlight, side, and windshield", () => {
    expect(classifyGlassByWorldPoint(new Vector3(0.1, 1.05, -1.4))).toBe("backGlass");
    expect(classifyGlassByWorldPoint(new Vector3(0.82, 1.0, 0.1))).toBe("sideGlass");
    expect(classifyGlassByWorldPoint(new Vector3(0.05, 1.05, 1.45))).toBe("glass");
  });
});

describe("glassMeshName", () => {
  it("uses stable prefixes classifyCarMaterial can read", () => {
    expect(glassMeshName("backGlass")).toBe("glass-back");
    expect(glassMeshName("sideGlass")).toBe("glass-side");
    expect(glassMeshName("glass")).toBe("glass-wind");
  });
});

describe("splitGreenhouseGlass", () => {
  it("splits one Glass mesh into windshield / side / backlight", () => {
    const positions = new Float32Array([
      -0.05, 1.05, 1.4, 0.05, 1.05, 1.4, 0, 1.15, 1.4, -0.7, 1.0, 0.1, -0.8, 1.0, 0.1, -0.75, 1.1, 0.1, -0.05, 1.05,
      -1.35, 0.05, 1.05, -1.35, 0, 1.15, -1.35,
    ]);
    const geo = new BufferGeometry();
    geo.setAttribute("position", new BufferAttribute(positions, 3));
    const mat = new MeshStandardMaterial({ name: "Glass" });
    const mesh = new Mesh(geo, mat);
    mesh.name = "Capot.003_Glass_0";
    const root = new Group();
    root.add(mesh);

    splitGreenhouseGlass(root);

    const names = root.children.map((c) => c.name).sort();
    expect(names).toEqual(["glass-back", "glass-side", "glass-wind"]);
    expect(root.getObjectByName("Capot.003_Glass_0")).toBeUndefined();
  });
});
