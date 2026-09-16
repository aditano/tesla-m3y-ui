import { Box3, Mesh, Object3D, Vector3 } from "three";
import { createAeroWheel } from "./AeroWheel";

export type WheelHub = {
  id: string;
  position: [number, number, number];
  radius: number;
  width: number;
  side: "L" | "R";
};

const WHEEL_PARENT = /^wheel(?:\.\d+)?$/i;
const CALIPER_PARENT = /^cal(?:\.\d+)?$/i;

export function isStockWheelPart(name: string): boolean {
  return WHEEL_PARENT.test(name) || CALIPER_PARENT.test(name) || /^wheel/i.test(name) || /^cal(?:\.|_|\b)/i.test(name);
}

export function hubKey(name: string): string | null {
  const match = name.match(/^(wheel(?:\.\d+)?)/i);
  return match ? match[1].toLowerCase() : null;
}

export function hideStockWheels(root: Object3D): void {
  root.traverse((obj) => {
    if (obj instanceof Mesh && isStockWheelPart(obj.name)) obj.visible = false;
  });
}

function localWheelSize(parent: Object3D): { radius: number; width: number } {
  parent.updateWorldMatrix(true, true);
  const box = new Box3();
  parent.traverse((obj) => {
    if (obj instanceof Mesh) box.expandByObject(obj, true);
  });
  const size = box.getSize(new Vector3());
  const scale = new Vector3();
  parent.getWorldScale(scale);
  const sy = Math.max(scale.y, 1e-4);
  const sz = Math.max(scale.z, 1e-4);
  const sx = Math.max(scale.x, 1e-4);
  const radius = Math.min(0.42, Math.max(0.32, Math.max(size.y / sy, size.z / sz) * 0.5));
  const width = Math.min(0.28, Math.max(0.2, size.x / sx));
  return { radius, width };
}

/** Hide stock discs/calipers and parent original aero wheels at the GLB hub nodes. */
export function replaceStockWheels(root: Object3D): WheelHub[] {
  root.updateMatrixWorld(true);
  const parents: Object3D[] = [];
  root.traverse((obj) => {
    if (WHEEL_PARENT.test(obj.name)) parents.push(obj);
  });

  const hubs: WheelHub[] = [];
  for (const parent of parents) {
    parent.traverse((obj) => {
      if (obj instanceof Mesh) obj.visible = false;
    });
    const { radius, width } = localWheelSize(parent);
    const wheel = createAeroWheel(radius, Math.min(width, radius * 0.72));
    parent.add(wheel);
    const world = new Vector3();
    parent.getWorldPosition(world);
    hubs.push({
      id: parent.name.toLowerCase(),
      position: [world.x, world.y, world.z],
      radius,
      width,
      side: world.x < 0 ? "L" : "R",
    });
  }

  root.traverse((obj) => {
    if (CALIPER_PARENT.test(obj.name) || (obj instanceof Mesh && /^cal/i.test(obj.name))) {
      obj.visible = false;
    }
  });

  hubs.sort((a, b) => a.id.localeCompare(b.id));
  return hubs;
}

export function locateWheelHubs(root: Object3D): WheelHub[] {
  root.updateMatrixWorld(true);
  const hubs: WheelHub[] = [];
  root.traverse((obj) => {
    if (!WHEEL_PARENT.test(obj.name)) return;
    const world = new Vector3();
    obj.getWorldPosition(world);
    root.worldToLocal(world);
    const { radius, width } = localWheelSize(obj);
    hubs.push({
      id: obj.name.toLowerCase(),
      position: [world.x, world.y, world.z],
      radius,
      width,
      side: world.x < 0 ? "L" : "R",
    });
  });
  hubs.sort((a, b) => a.id.localeCompare(b.id));
  return hubs;
}
