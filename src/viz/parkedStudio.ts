/**
 * Parked Highland studio. Keep this blit-safe: one-shot env + contact
 * shadows, no MeshReflectorMaterial / AccumulativeShadows / SoftShadows.
 */
export const PARKED_STUDIO = {
  background: "#f3f4f6",
  envFrames: 8,
  envResolution: 256,
  envIntensity: 0.9,
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
    PARKED_STUDIO.envFrames !== Number.POSITIVE_INFINITY &&
    PARKED_STUDIO.envFrames <= 12 &&
    PARKED_STUDIO.shadow.frames === 1 &&
    PARKED_STUDIO.envResolution <= 384
  );
}
