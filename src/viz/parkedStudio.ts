import { DataTexture, EquirectangularReflectionMapping, RGBAFormat, SRGBColorSpace, UnsignedByteType } from "three";

/**
 * Parked Highland studio. Blit-safe: one static IBL and a painted blob shadow.
 * No shadow maps, so there is no acne, peter-panning, cascade seam, or flicker.
 */
export type StudioTheme = "light" | "dark";

export const PARKED_FOG = {
  color: "#e6e9ee",
  near: 18,
  far: 46,
} as const;

const LIGHT_STUDIO = {
  background: "#e7eaee",
  envFrames: 1,
  envMapSize: 512,
  envIntensity: 1.05,
  camera: {
    fov: 28,
    position: [2.95, 2.42, -6.85] as const,
    target: [0.08, 0.62, 0.12] as const,
    near: 0.12,
    far: 80,
    minDistance: 5.4,
    maxDistance: 14,
    minPolar: 0.55,
    maxPolar: 1.35,
  },
  car: {
    position: [0, 0, 0] as const,
    rotationY: -0.72,
    scale: 0.96,
  },
  shadow: {
    kind: "blob" as const,
    opacity: 0.66,
    scale: [3.15, 5.7] as const,
    blur: 1,
    far: 1,
    color: "#1a1418",
    frames: 1,
    resolution: 1,
  },
  floor: {
    color: "#e8ebef",
    roughness: 0.62,
    metalness: 0.02,
    envMapIntensity: 0.18,
    clearcoat: 0,
    clearcoatRoughness: 1,
  },
  fog: PARKED_FOG,
} as const;

const DARK_STUDIO = {
  ...LIGHT_STUDIO,
  background: "#121418",
  envIntensity: 0.72,
  shadow: {
    ...LIGHT_STUDIO.shadow,
    opacity: 0.72,
    color: "#050607",
  },
  floor: {
    color: "#181b20",
    roughness: 0.8,
    metalness: 0.04,
    envMapIntensity: 0.12,
    clearcoat: 0,
    clearcoatRoughness: 1,
  },
  fog: {
    color: "#121418",
    near: 16,
    far: 42,
  },
} as const;

/** Light preset. Existing imports keep working. */
export const PARKED_STUDIO = LIGHT_STUDIO;

export function studioFor(theme: StudioTheme) {
  return theme === "dark" ? DARK_STUDIO : LIGHT_STUDIO;
}

export function parkedStudioIsBlitSafe(): boolean {
  return (
    PARKED_STUDIO.envFrames === 1 &&
    PARKED_STUDIO.shadow.kind === "blob" &&
    PARKED_STUDIO.shadow.frames === 1 &&
    PARKED_STUDIO.envMapSize <= 1024
  );
}

function sampleStudioPixel(u: number, v: number, theme: StudioTheme = "light"): [number, number, number] {
  const dark = theme === "dark";
  let r = dark ? 22 : 186;
  let g = dark ? 24 : 190;
  let b = dark ? 30 : 198;
  const sky = Math.max(0, v - 0.45) / 0.55;
  if (dark) {
    r += sky * 18;
    g += sky * 22;
    b += sky * 34;
  } else {
    r += sky * 22;
    g += sky * 24;
    b += sky * 26;
    if (v < 0.28) {
      const t = 1 - v / 0.28;
      r -= t * 16;
      g -= t * 14;
      b -= t * 10;
    }
  }

  // Wide softboxes. A thin streak was reflecting as a white ring on the roof glass.
  const keyU = (u - 0.3) / 0.2;
  const keyV = (v - 0.74) / 0.18;
  const key = Math.exp(-(keyU * keyU + keyV * keyV));
  const rimU = (u - 0.74) / 0.2;
  const rimV = (v - 0.6) / 0.18;
  const rim = Math.exp(-(rimU * rimU + rimV * rimV)) * (dark ? 0.85 : 0.42);
  const boost = Math.min(1, key * 0.92 + rim);
  const add = dark ? 150 : 78;
  r = Math.min(255, r + boost * add);
  g = Math.min(255, g + boost * (dark ? 160 : 80));
  b = Math.min(255, b + boost * (dark ? 180 : 84));
  return [Math.round(r), Math.round(g), Math.round(b)];
}

function paintEnv(theme: StudioTheme): DataTexture {
  const w = PARKED_STUDIO.envMapSize;
  const h = w / 2;
  const data = new Uint8Array(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const [r, g, b] = sampleStudioPixel((x + 0.5) / w, 1 - (y + 0.5) / h, theme);
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

/** Light-studio IBL. Kept for the existing blit test. */
export function createCandyStudioEnv(): DataTexture {
  return paintEnv("light");
}

export function createStudioEnv(theme: StudioTheme): DataTexture {
  return paintEnv(theme);
}

/** Dark driving IBL: a low sky and a soft overhead so paint still has a rim. */
export function createDriveEnv(): DataTexture {
  return paintEnv("dark");
}

/** Peak of the key softbox minus a wall sample. Wide and moderate, not a blown line. */
export function studioEnvStreakStrength(): number {
  const wall = sampleStudioPixel(0.5, 0.42, "light");
  const streak = sampleStudioPixel(0.3, 0.74, "light");
  return streak[0] - wall[0];
}
