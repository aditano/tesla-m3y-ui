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
 * Street-wall masses along a centerline. They sit just past the shoulder so a
 * chase camera sees them closing on the vanishing point, the way the FSD view does.
 * Deterministic so a frozen QA pose does not shimmer.
 */
export function cityBlocksAlong(center: XZ[]): CityBlock[] {
  if (center.length < 2) return [];
  const blocks: CityBlock[] = [];
  let acc = 0;
  let next = 8;
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
    while (next <= acc + seg && blocks.length < 80) {
      const t = (next - acc) / seg;
      const x = center[i - 1].x + dx * t;
      const z = center[i - 1].z + dz * t;
      for (const side of [-1, 1] as const) {
        const seed = next * 0.17 + side * 3.1;
        if (hash01(seed) < 0.06) continue;
        const w = 14 + hash01(seed + 1) * 12;
        const depth = 11 + hash01(seed + 2) * 9;
        const tall = hash01(seed + 7) > 0.78;
        const h = tall ? 22 + hash01(seed + 4) * 16 : 8 + hash01(seed + 4) * 12;
        const innerFace = 10.6;
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
      next += 13 + hash01(next + 8) * 5;
    }
    acc += seg;
  }
  return blocks;
}
