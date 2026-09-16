/**
 * Parked Highland studio. Keep this blit-safe: one-shot env + contact
 * shadows, no MeshReflectorMaterial / AccumulativeShadows / SoftShadows.
 */
export const PARKED_STUDIO = {
  background: "#f3f4f6",
  envFrames: 1,
  envResolution: 256,
  envIntensity: 1.02,
  camera: {
    fov: 26,
    position: [3.48, 4.95, -7.55] as const,
    target: [0.02, 0.3, -0.22] as const,
    near: 0.1,
    far: 80,
    minDistance: 6.4,
    maxDistance: 10.2,
    minPolar: 0.86,
    maxPolar: 1.08,
  },
  car: {
    position: [-0.48, 0, 0.18] as const,
    rotationY: -0.28,
    scale: 1.06,
  },
  shadow: {
    opacity: 0.9,
    scale: [6.5, 10.8] as const,
    blur: 1.75,
    far: 4.1,
    color: "#1a1718",
    frames: 1,
    resolution: 1024,
  },
  floor: {
    roughness: 0.4,
    metalness: 0.08,
    envMapIntensity: 0.4,
    clearcoat: 0.14,
    clearcoatRoughness: 0.4,
  },
} as const;

export function parkedStudioIsBlitSafe(): boolean {
  return (
    PARKED_STUDIO.envFrames === 1 &&
    PARKED_STUDIO.shadow.frames === 1 &&
    PARKED_STUDIO.envResolution <= 384
  );
}
