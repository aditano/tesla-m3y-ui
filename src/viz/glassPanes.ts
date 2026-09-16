import {
  BufferGeometry,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Vector3,
} from "three";

export type GreenhousePane = "glass" | "sideGlass" | "backGlass";

const WORLD = new Vector3();
const A = new Vector3();
const B = new Vector3();
const C = new Vector3();

/** World-space pane buckets after `extractCar` (Y-up, +Z forward). */
export function classifyGlassByWorldPoint(p: Vector3): GreenhousePane {
  if (p.z < -1.02 && Math.abs(p.x) < 0.72) return "backGlass";
  if (Math.abs(p.x) > 0.62) return "sideGlass";
  return "glass";
}

export function glassMeshName(kind: GreenhousePane): string {
  switch (kind) {
    case "backGlass":
      return "glass-back";
    case "sideGlass":
      return "glass-side";
    case "glass":
      return "glass-wind";
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

function isSharedGlassMesh(mesh: Mesh): boolean {
  if (mesh.name.startsWith("orig-") || mesh.name.startsWith("glass-")) return false;
  const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  return mats.some((mat) => {
    const n = ((mat as MeshStandardMaterial).name || mesh.name || "").toLowerCase();
    return n.includes("glass") && !n.includes("material.017");
  });
}

function pushTriangle(
  buckets: Record<GreenhousePane, number[]>,
  kind: GreenhousePane,
  i0: number,
  i1: number,
  i2: number,
): void {
  buckets[kind].push(i0, i1, i2);
}

function geometryForBucket(source: BufferGeometry, indices: number[]): BufferGeometry | null {
  if (indices.length < 3) return null;
  const next = source.clone();
  next.setIndex(indices);
  next.computeVertexNormals();
  next.computeBoundingBox();
  next.computeBoundingSphere();
  return next;
}

/**
 * The Sketchfab greenhouse is one `Glass` mesh. Split it so roof (already
 * Material.017) / side / backlight can take different IOR and transmission.
 */
export function splitGreenhouseGlass(root: Object3D): void {
  const meshes: Mesh[] = [];
  root.traverse((obj) => {
    if (obj instanceof Mesh && isSharedGlassMesh(obj)) meshes.push(obj);
  });

  for (const mesh of meshes) {
    const geo = mesh.geometry;
    const pos = geo.getAttribute("position");
    if (!pos) continue;
    mesh.updateWorldMatrix(true, false);

    const buckets: Record<GreenhousePane, number[]> = {
      glass: [],
      sideGlass: [],
      backGlass: [],
    };
    const index = geo.getIndex();
    const triCount = index ? index.count / 3 : pos.count / 3;

    for (let t = 0; t < triCount; t++) {
      const i0 = index ? index.getX(t * 3) : t * 3;
      const i1 = index ? index.getX(t * 3 + 1) : t * 3 + 1;
      const i2 = index ? index.getX(t * 3 + 2) : t * 3 + 2;
      A.fromBufferAttribute(pos, i0).applyMatrix4(mesh.matrixWorld);
      B.fromBufferAttribute(pos, i1).applyMatrix4(mesh.matrixWorld);
      C.fromBufferAttribute(pos, i2).applyMatrix4(mesh.matrixWorld);
      WORLD.set((A.x + B.x + C.x) / 3, (A.y + B.y + C.y) / 3, (A.z + B.z + C.z) / 3);
      pushTriangle(buckets, classifyGlassByWorldPoint(WORLD), i0, i1, i2);
    }

    const filled = (Object.entries(buckets) as [GreenhousePane, number[]][]).filter(
      ([, ids]) => ids.length >= 3,
    );
    if (filled.length <= 1) {
      const kind = filled[0]?.[0] ?? "glass";
      mesh.name = glassMeshName(kind);
      mesh.userData.glassKind = kind;
      continue;
    }

    const parent = mesh.parent;
    if (!parent) continue;
    for (const [kind, ids] of filled) {
      const geometry = geometryForBucket(geo, ids);
      if (!geometry) continue;
      const child = new Mesh(geometry);
      child.name = glassMeshName(kind);
      child.userData.glassKind = kind;
      child.position.copy(mesh.position);
      child.quaternion.copy(mesh.quaternion);
      child.scale.copy(mesh.scale);
      child.castShadow = true;
      child.receiveShadow = true;
      parent.add(child);
    }
    parent.remove(mesh);
    geo.dispose();
  }
}
