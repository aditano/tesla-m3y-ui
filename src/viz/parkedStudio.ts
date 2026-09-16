import { DataTexture, EquirectangularReflectionMapping, RGBAFormat, SRGBColorSpace, UnsignedByteType } from "three";

/**
 * Parked Highland studio. Keep this blit-safe: static painted env + one-shot
 * contact shadows. No MeshReflectorMaterial / AccumulativeShadows / SoftShadows.
 */
export const PARKED_STUDIO = {
  background: "#f3f4f6",
  envFrames: 1,
  envMapSize: 1024,
  envIntensity: 1.22,
  camera: {
    fov: 26,
    position: [4.62, 5.12, -6.88] as const,
    target: [0.04, 0.28, -0.2] as const,
    near: 0.1,
    far: 80,
    minDistance: 6.2,
    maxDistance: 10.2,
    minPolar: 0.84,
    maxPolar: 1.08,
  },
  car: {
    position: [-0.3, 0, 0.1] as const,
    rotationY: -0.22,
    scale: 1.08,
  },
  shadow: {
    opacity: 0.92,
    scale: [6.4, 10.6] as const,
    blur: 1.7,
    far: 4.1,
    color: "#161314",
    frames: 1,
    resolution: 1024,
  },
  floor: {
    roughness: 0.46,
    metalness: 0.07,
    envMapIntensity: 0.32,
    clearcoat: 0.1,
    clearcoatRoughness: 0.48,
  },
} as const;

export function parkedStudioIsBlitSafe(): boolean {
  return (
    PARKED_STUDIO.envFrames === 1 &&
    PARKED_STUDIO.shadow.frames === 1 &&
    PARKED_STUDIO.envMapSize <= 1024
  );
}

function sampleStudioPixel(u: number, v: number): [number, number, number] {
  let r = 176;
  let g = 178;
  let b = 184;
  if (v > 0.7) {
    const t = (v - 0.7) / 0.3;
    r = 176 + t * 36;
    g = 178 + t * 34;
    b = 184 + t * 28;
  } else if (v < 0.26) {
    const t = 1 - v / 0.26;
    r = 176 - t * 22;
    g = 178 - t * 22;
    b = 184 - t * 20;
  }

  const strip = Math.exp(-(((v - 0.8) * 58) ** 2));
  const pillar = Math.exp(-(((u - 0.2) * 95) ** 2)) * Math.exp(-(((v - 0.72) * 8) ** 2));
  const pillar2 = Math.exp(-(((u - 0.78) * 110) ** 2)) * Math.exp(-(((v - 0.7) * 9) ** 2));
  const boost = Math.min(1, strip * 0.95 + pillar * 1.15 + pillar2 * 0.7);
  r = Math.min(255, r + boost * 255);
  g = Math.min(255, g + boost * 250);
  b = Math.min(255, b + boost * 245);
  return [Math.round(r), Math.round(g), Math.round(b)];
}

/** White multi-bounce room plus a thin overhead strip for a C-pillar streak. */
export function createCandyStudioEnv(): DataTexture {
  const w = PARKED_STUDIO.envMapSize;
  const h = w / 2;
  const data = new Uint8Array(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const [r, g, b] = sampleStudioPixel((x + 0.5) / w, 1 - (y + 0.5) / h);
      const i = (y * w + x) * 4;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = 255;
    }
  }
  const tex = new DataTexture(data, w, h, RGBAFormat, UnsignedByteType);
  tex.mapping = EquirectangularReflectionMapping;
  tex.colorSpace = SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export function studioEnvStreakStrength(): number {
  const wall = sampleStudioPixel(0.45, 0.5);
  const streak = sampleStudioPixel(0.2, 0.72);
  return streak[0] - wall[0];
}
