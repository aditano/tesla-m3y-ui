import { Box3, Mesh, Object3D, Quaternion, Vector3 } from "three";

export type WheelHub = {
  id: string;
  position: [number, number, number];
  radius: number;
  width: number;
  side: "L" | "R";
};

const STOCK_WHEEL = /^(wheel|cal)(?:\.|_)/i;

export function isStockWheelPart(name: string): boolean {
  return STOCK_WHEEL.test(name) || /^wheel/i.test(name) || /^cal(?:\.|_|\b)/i.test(name);
}

export function hubKey(name: string): string | null {
  const match = name.match(/^(wheel(?:\.\d+)?)/i);
  return match ? match[1].toLowerCase() : null;
}

export function hideStockWheels(root: Object3D): void {
  root.traverse((obj) => {
    if (isStockWheelPart(obj.name)) obj.visible = false;
  });
}

export function locateWheelHubs(root: Object3D): WheelHub[] {
  root.updateMatrixWorld(true);
  const worldScale = new Vector3();
  root.matrixWorld.decompose(new Vector3(), new Quaternion(), worldScale);
  const groups = new Map<string, Mesh[]>();
  root.traverse((obj) => {
    if (!(obj instanceof Mesh)) return;
    const key = hubKey(obj.name);
    if (!key) return;
    const list = groups.get(key) ?? [];
    list.push(obj);
    groups.set(key, list);
  });

  const hubs: WheelHub[] = [];
  for (const [id, meshes] of groups) {
    const box = new Box3();
    for (const mesh of meshes) box.expandByObject(mesh);
    const center = box.getCenter(new Vector3());
    root.worldToLocal(center);
    const size = box.getSize(new Vector3());
    const radius = Math.min(
      0.42,
      Math.max(0.3, Math.max(size.y / Math.max(worldScale.y, 1e-4), size.z / Math.max(worldScale.z, 1e-4)) * 0.5),
    );
    const width = Math.min(0.28, Math.max(0.18, size.x / Math.max(worldScale.x, 1e-4)));
    hubs.push({
      id,
      position: [center.x, center.y, center.z],
      radius,
      width,
      side: center.x < 0 ? "L" : "R",
    });
  }
  hubs.sort((a, b) => a.id.localeCompare(b.id));
  return hubs;
}
