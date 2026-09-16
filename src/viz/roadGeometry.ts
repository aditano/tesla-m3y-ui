import type { EgoFramePoint } from "../geo/ego";

export interface XZ {
  x: number;
  z: number;
}

export function offsetSides(pts: XZ[], half: number): { left: XZ[]; right: XZ[] } {
  const left: XZ[] = [];
  const right: XZ[] = [];
  for (let i = 0; i < pts.length; i++) {
    const prev = pts[Math.max(0, i - 1)];
    const next = pts[Math.min(pts.length - 1, i + 1)];
    let dx = next.x - prev.x;
    let dz = next.z - prev.z;
    const len = Math.hypot(dx, dz);
    if (len < 1e-6) {
      dx = 0;
      dz = 1;
    } else {
      dx /= len;
      dz /= len;
    }
    const rx = dz * half;
    const rz = -dx * half;
    left.push({ x: pts[i].x - rx, z: pts[i].z - rz });
    right.push({ x: pts[i].x + rx, z: pts[i].z + rz });
  }
  return { left, right };
}

export function ribbonArrays(left: XZ[], right: XZ[], y: number): {
  positions: Float32Array;
  normals: Float32Array;
} {
  const tri = Math.max(0, left.length - 1) * 6;
  const positions = new Float32Array(tri * 3);
  const normals = new Float32Array(tri * 3);
  let o = 0;
  const push = (p: XZ) => {
    positions[o] = p.x;
    positions[o + 1] = y;
    positions[o + 2] = p.z;
    normals[o + 1] = 1;
    o += 3;
  };
  for (let i = 0; i < left.length - 1; i++) {
    const a = left[i];
    const b = right[i];
    const c = left[i + 1];
    const d = right[i + 1];
    push(a);
    push(b);
    push(c);
    push(b);
    push(d);
    push(c);
  }
  return { positions, normals };
}

function walk(pts: XZ[]): { dist: number[]; total: number } {
  const dist = [0];
  for (let i = 1; i < pts.length; i++) {
    dist.push(dist[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].z - pts[i - 1].z));
  }
  return { dist, total: dist[dist.length - 1] ?? 0 };
}

function atDistance(pts: XZ[], dist: number[], meters: number): XZ {
  if (pts.length === 0) return { x: 0, z: 0 };
  if (meters <= 0) return pts[0];
  for (let i = 1; i < pts.length; i++) {
    if (dist[i] >= meters || i === pts.length - 1) {
      const span = Math.max(1e-6, dist[i] - dist[i - 1]);
      const t = Math.min(1, Math.max(0, (meters - dist[i - 1]) / span));
      return {
        x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * t,
        z: pts[i - 1].z + (pts[i].z - pts[i - 1].z) * t,
      };
    }
  }
  return pts[pts.length - 1];
}

/** Curved dashed ribbon that follows the polyline instead of faceted boxes. */
export function dashedRibbonArrays(
  pts: XZ[],
  half: number,
  y: number,
  dashM = 2.6,
  gapM = 4.4,
): { positions: Float32Array; normals: Float32Array } {
  if (pts.length < 2) return { positions: new Float32Array(), normals: new Float32Array() };
  const { dist, total } = walk(pts);
  const chunks: { positions: Float32Array; normals: Float32Array }[] = [];
  let m = 1.2;
  while (m < total - 0.4) {
    const a = Math.min(total, m);
    const b = Math.min(total, m + dashM);
    if (b - a < 0.4) break;
    const samples: XZ[] = [];
    const step = Math.max(0.35, (b - a) / 4);
    for (let s = a; s <= b + 1e-4; s += step) samples.push(atDistance(pts, dist, Math.min(b, s)));
    const last = samples[samples.length - 1];
    const end = atDistance(pts, dist, b);
    if (!last || Math.hypot(last.x - end.x, last.z - end.z) > 1e-4) {
      samples.push(end);
    }
    const { left, right } = offsetSides(samples, half);
    chunks.push(ribbonArrays(left, right, y));
    m += dashM + gapM;
  }
  let n = 0;
  for (const c of chunks) n += c.positions.length;
  const positions = new Float32Array(n);
  const normals = new Float32Array(n);
  let o = 0;
  for (const c of chunks) {
    positions.set(c.positions, o);
    normals.set(c.normals, o);
    o += c.positions.length;
  }
  return { positions, normals };
}

export function mergeRibbons(
  parts: Array<{ positions: Float32Array; normals: Float32Array }>,
): { positions: Float32Array; normals: Float32Array } {
  let n = 0;
  for (const p of parts) n += p.positions.length;
  const positions = new Float32Array(n);
  const normals = new Float32Array(n);
  let o = 0;
  for (const p of parts) {
    positions.set(p.positions, o);
    normals.set(p.normals, o);
    o += p.positions.length;
  }
  return { positions, normals };
}

export function asXZ(pts: EgoFramePoint[]): XZ[] {
  return pts.map((p) => ({ x: p.x, z: p.z }));
}
