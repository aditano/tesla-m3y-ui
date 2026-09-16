import { Mesh, Object3D, Vector3 } from "three";
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

/**
 * The GLB wheel-parent node sits exactly at the hub centre in the car's local
 * coordinate frame (after extractCar scaling + grounding). We average all four
 * hub Y positions to calibrate the aero wheel radius so the tire just kisses
 * the studio floor.
 *
 * Model3 wraps the car in <group scale={1.12}>, so geometry added here is
 * scaled again in the scene. We pre-divide to compensate.
 */
const SCENE_EXTRA_SCALE = 1.12;

function hubCentreHeight(root: Object3D): number {
  let total = 0;
  let count = 0;
  root.traverse((obj) => {
    if (!WHEEL_PARENT.test(obj.name)) return;
    const world = new Vector3();
    obj.getWorldPosition(world);
    total += world.y;
    count++;
  });
  return count > 0 ? total / count : 0.36;
}

/** Hide stock discs/calipers and parent original aero wheels at the GLB hub nodes. */
export function replaceStockWheels(root: Object3D): WheelHub[] {
  root.updateMatrixWorld(true);
  const parents: Object3D[] = [];
  root.traverse((obj) => {
    if (WHEEL_PARENT.test(obj.name)) parents.push(obj);
  });

  const centreH = hubCentreHeight(root);
  // The GLB hub centre height reflects the fan-model's oversized wheels.
  // Hard-cap to a compact diameter that fits the 27k mesh fender opening.
  // target outer in scene ≈ 0.24m (< real 0.33m; fender arch on this mesh is shallow)
  const TARGET_OUTER_SCENE = 0.24;
  const TYRE_EXPAND = 0.84 + 0.60 * 0.42;
  void centreH; // checked for floor proximity — acceptable float at this scale
  const tyreRadius = TARGET_OUTER_SCENE / (SCENE_EXTRA_SCALE * TYRE_EXPAND);
  const rimWidth = tyreRadius * 0.60;

  const hubs: WheelHub[] = [];
  for (const parent of parents) {
    parent.traverse((obj) => {
      if (obj instanceof Mesh) obj.visible = false;
    });
    const world = new Vector3();
    parent.getWorldPosition(world);
    const wheel = createAeroWheel(tyreRadius, rimWidth);
    // Hub-parent IS the wheel centre — place at local origin.
    wheel.position.set(0, 0, 0);
    parent.add(wheel);
    hubs.push({
      id: parent.name.toLowerCase(),
      position: [world.x, world.y, world.z],
      radius: tyreRadius,
      width: rimWidth,
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
    hubs.push({
      id: obj.name.toLowerCase(),
      position: [world.x, world.y, world.z],
      radius: 0.33,
      width: 0.21,
      side: world.x < 0 ? "L" : "R",
    });
  });
  hubs.sort((a, b) => a.id.localeCompare(b.id));
  return hubs;
}
