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
const AERO_RADIUS_M = 0.365;
const AERO_WIDTH_M = 0.238;
const HUB_OUTBOARD_X = 0.15;
const HUB_LIFT_Y = 0.012;

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

function localWheelBox(parent: Object3D): Box3 {
  parent.updateWorldMatrix(true, true);
  const box = new Box3();
  const inv = parent.matrixWorld.clone().invert();
  parent.traverse((obj) => {
    if (!(obj instanceof Mesh) || obj.name === "aero-wheel") return;
    obj.geometry.computeBoundingBox();
    const geoBox = obj.geometry.boundingBox;
    if (!geoBox) return;
    const worldBox = geoBox.clone().applyMatrix4(obj.matrixWorld).applyMatrix4(inv);
    box.union(worldBox);
  });
  return box;
}

function localWheelSize(parent: Object3D): { radius: number; width: number; center: Vector3 } {
  const box = localWheelBox(parent);
  if (box.isEmpty()) {
    return { radius: 0.34, width: 0.22, center: new Vector3() };
  }
  const size = box.getSize(new Vector3());
  const center = box.getCenter(new Vector3());
  const radius = Math.min(0.42, Math.max(0.32, Math.max(size.y, size.z) * 0.5));
  const width = Math.min(0.3, Math.max(0.12, size.x));
  return { radius, width, center };
}

/** Hide stock discs/calipers and parent 5-cover aero wheels at GLB hub nodes. */
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
    const { center } = localWheelSize(parent);
    const world = new Vector3();
    parent.getWorldPosition(world);
    const side: "L" | "R" = center.x < 0 || (Math.abs(center.x) < 1e-4 && world.x < 0) ? "L" : "R";
    const sideSign = side === "L" ? -1 : 1;
    const wheel = createAeroWheel(AERO_RADIUS_M, AERO_WIDTH_M, side);
    wheel.position.copy(center);
    wheel.position.x = sideSign * HUB_OUTBOARD_X;
    wheel.position.y += HUB_LIFT_Y;
    wheel.rotation.x = sideSign * 0.24;
    wheel.userData.hubAnchor = {
      from: parent.name,
      side,
      bboxCenter: [center.x, center.y, center.z] as const,
    };
    parent.add(wheel);
    const wheelWorld = parent.localToWorld(wheel.position.clone());
    hubs.push({
      id: parent.name.toLowerCase(),
      position: [wheelWorld.x, wheelWorld.y, wheelWorld.z],
      radius: AERO_RADIUS_M,
      width: AERO_WIDTH_M,
      side,
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
    const { radius, width, center } = localWheelSize(obj);
    hubs.push({
      id: obj.name.toLowerCase(),
      position: [world.x + center.x, world.y + center.y, world.z + center.z],
      radius,
      width,
      side: world.x < 0 ? "L" : "R",
    });
  });
  hubs.sort((a, b) => a.id.localeCompare(b.id));
  return hubs;
}
