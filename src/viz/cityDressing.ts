import type { XZ } from "./roadGeometry";

export interface CityBlock {
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  yaw: number;
  shade: number;
}

function hash01(n: number): number {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Pale block buildings along a centerline, kept off the asphalt.
 * Deterministic so a frozen QA pose does not shimmer.
 */
export function cityBlocksAlong(center: XZ[]): CityBlock[] {
  if (center.length < 2) return [];
  const blocks: CityBlock[] = [];
  let acc = 0;
  let next = 10;
  for (let i = 1; i < center.length; i++) {
    const dx = center[i].x - center[i - 1].x;
    const dz = center[i].z - center[i - 1].z;
    const seg = Math.hypot(dx, dz);
    if (seg < 1e-4) continue;
    const ux = dx / seg;
    const uz = dz / seg;
    const rx = uz;
    const rz = -ux;
    const yaw = Math.atan2(dx, dz);
    while (next <= acc + seg && blocks.length < 64) {
      const t = (next - acc) / seg;
      const x = center[i - 1].x + dx * t;
      const z = center[i - 1].z + dz * t;
      for (const side of [-1, 1] as const) {
        const seed = next * 0.17 + side * 3.1;
        if (hash01(seed) < 0.14) continue;
        const w = 8 + hash01(seed + 1) * 11;
        const depth = 8 + hash01(seed + 2) * 12;
        const h = 6 + hash01(seed + 4) * 22;
        const innerFace = 10.6 + hash01(seed + 5) * 2.2;
        const off = innerFace + w * 0.5;
        blocks.push({
          x: x + rx * side * off,
          z: z + rz * side * off,
          w,
          d: depth,
          h,
          yaw,
          shade: hash01(seed + 6),
        });
      }
      next += 24 + hash01(next + 8) * 14;
    }
    acc += seg;
  }
  return blocks;
}
