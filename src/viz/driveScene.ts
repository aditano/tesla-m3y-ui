/** High rear chase. The real viz looks down the lane; it does not sit inside the cabin. */
export const DRIVE_CHASE = {
  fov: 48,
  position: [0, 4.85, -6.8] as const,
  look: [0, 0.45, 11] as const,
} as const;

export const DRIVE_WORLD = "#1c2128";
export const DRIVE_FOG = { color: DRIVE_WORLD, near: 36, far: 150 } as const;
