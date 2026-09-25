import { Box3, BufferAttribute, BufferGeometry, Group, Mesh, MeshStandardMaterial, Vector3 } from "three";
import { describe, expect, it } from "vitest";
import { PAINT_NATA_RED } from "./carMaterials";
import {
  applyHighlandLook,
  fitHighland,
  highlandMaterials,
  highlandRole,
  highlandWheelPart,
  HIGHLAND_LENGTH_M,
} from "./highlandRig";

function triangle(name: string, origin: [number, number, number]): Mesh {
  const [x, y, z] = origin;
  const geo = new BufferGeometry();
  geo.setAttribute(
    "position",
    new BufferAttribute(new Float32Array([x, y, z, x + 0.2, y, z, x, y + 0.2, z]), 3),
  );
  geo.computeVertexNormals();
  const mesh = new Mesh(geo, new MeshStandardMaterial({ name, color: "#111111" }));
  mesh.name = name;
  return mesh;
}

describe("highlandRole", () => {
  it("tags the fused body, glass, tires, and lamps the way Studio does", () => {
    expect(highlandRole("Geohoodsub00021Mtl", 0, 1, 0)).toBe("exterior_paint");
    expect(highlandRole("Georimblurlfsub021Mtl", 0.9, 0.3, -1.4)).toBe("wheel_finish");
    expect(highlandRole("Tire1Mtl", 0.9, 0.3, -1.4)).toBe("tire_rubber");
    expect(highlandRole("Geoextwindow0021Mtl", 0, 1.1, 0.2)).toBe("glass");
    expect(highlandRole("Ln12Mtl", 0, 0.8, 2)).toBe("taillight_led");
    expect(highlandRole("Ln7Mtl", 0, 0.7, -1.9)).toBe("headlight_led");
    expect(highlandRole("Ln7Mtl", 0, 0.8, 0.4)).toBe("interior_leather");
    expect(highlandRole("Geohoodsub00031Mtl", 0, 0.9, 1)).toBe("trim");
  });
});

describe("highlandWheelPart", () => {
  it("names the four hubs and leaves the body shell alone", () => {
    expect(highlandWheelPart("Tire1Mtl", -0.9, 0.34, -1.49)).toBe("wheel_fl");
    expect(highlandWheelPart("Tire1Mtl", 0.9, 0.34, -1.49)).toBe("wheel_fr");
    expect(highlandWheelPart("Georimblurlfsub021Mtl", -0.9, 0.34, 1.385)).toBe("wheel_rl");
    expect(highlandWheelPart("Georimblurlfsub021Mtl", 0.9, 0.34, 1.385)).toBe("wheel_rr");
    expect(highlandWheelPart("Geohoodsub00021Mtl", 0, 0.9, 0)).toBe("body");
    expect(highlandWheelPart("Tire1Mtl", 0.1, 0.34, 0)).toBe("body");
  });
});

describe("fitHighland", () => {
  it("grounds the shell and turns the Studio nose onto +Z", () => {
    const root = new Group();
    const nose = triangle("Geohoodsub00021Mtl", [10, 0.2, 0]);
    nose.name = "nose";
    const tail = triangle("Geohoodsub00021Mtl", [0, 0.2, 0]);
    tail.name = "tail";
    root.add(nose, tail);
    const fit = fitHighland(root);
    fit.updateMatrixWorld(true);
    const box = new Box3().setFromObject(fit);
    const size = box.getSize(new Vector3());
    expect(box.min.y).toBeGreaterThan(-0.05);
    expect(box.min.y).toBeLessThan(0.05);
    expect(size.z).toBeCloseTo(HIGHLAND_LENGTH_M, 1);
    const noseBox = new Box3().setFromObject(fit.getObjectByName("nose:exterior_paint")!);
    const tailBox = new Box3().setFromObject(fit.getObjectByName("tail:exterior_paint")!);
    expect(noseBox.getCenter(new Vector3()).z).toBeGreaterThan(tailBox.getCenter(new Vector3()).z);
    expect(fit.getObjectByName("wheel_fl")).toBeTruthy();
    expect(fit.getObjectByName("body")).toBeTruthy();

    const materials = highlandMaterials(fit);
    expect(materials).toBeTruthy();
    applyHighlandLook(materials!, { paintHex: PAINT_NATA_RED, lit: false, parked: true });
    const paint = [...materials!.values()].find((m) => m.name === "exterior_paint");
    expect(paint?.color.getHexString()).toBe(PAINT_NATA_RED.slice(1));
    expect(paint?.clearcoat).toBe(1);
  });
});
