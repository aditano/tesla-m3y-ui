import { BoxGeometry, Group, Mesh } from "three";
import { describe, expect, it } from "vitest";
import { hideStockWheels, hubKey, isStockWheelPart, locateWheelHubs } from "./wheelHubs";

describe("wheelHubs", () => {
  it("keys Sketchfab wheel primitive names to four hubs", () => {
    expect(hubKey("wheel_Material.009_0")).toBe("wheel");
    expect(hubKey("wheel.001_Material.011_0")).toBe("wheel.001");
    expect(hubKey("cal.002_Material.014_0")).toBeNull();
  });

  it("hides stock wheel and caliper meshes, not unnamed body parts", () => {
    expect(isStockWheelPart("wheel.003_Material.010_0")).toBe(true);
    expect(isStockWheelPart("cal_Material.014_0")).toBe(true);
    expect(isStockWheelPart("Capot.001_CAR PAINT_0")).toBe(false);
    const root = new Group();
    const wheel = new Mesh(new BoxGeometry(0.2, 0.6, 0.6));
    wheel.name = "wheel_Material.009_0";
    root.add(wheel);
    hideStockWheels(root);
    expect(wheel.visible).toBe(false);
  });

  it("locates hub parents named wheel / wheel.N", () => {
    const root = new Group();
    const hub = new Group();
    hub.name = "wheel.001";
    hub.position.set(-0.8, 0.33, 1.4);
    const mesh = new Mesh(new BoxGeometry(0.22, 0.66, 0.66));
    mesh.name = "wheel.001_Material.009_0";
    hub.add(mesh);
    root.add(hub);
    const hubs = locateWheelHubs(root);
    expect(hubs).toHaveLength(1);
    expect(hubs[0]?.id).toBe("wheel.001");
    expect(hubs[0]?.side).toBe("L");
    expect(hubs[0]?.position[0]).toBeCloseTo(-0.8, 1);
  });
});
