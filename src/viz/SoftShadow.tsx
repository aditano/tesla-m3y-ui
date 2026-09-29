import { useMemo, type ReactNode } from "react";
import { CanvasTexture, SRGBColorSpace } from "three";

/**
 * Painted oval under the car. A texture, not a shadow map: no acne,
 * peter-panning, flicker, or cascade seams.
 */
export function SoftShadow({
  width,
  length,
  opacity,
  color = "#140e12",
  y = 0.02,
}: {
  width: number;
  length: number;
  opacity: number;
  color?: string;
  y?: number;
}): ReactNode {
  const map = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext("2d");
    const tex = new CanvasTexture(c);
    tex.colorSpace = SRGBColorSpace;
    if (!ctx) return tex;
    const g = ctx.createRadialGradient(128, 128, 8, 128, 128, 122);
    g.addColorStop(0, hexAlpha(color, opacity));
    g.addColorStop(0.42, hexAlpha(color, opacity * 0.55));
    g.addColorStop(0.72, hexAlpha(color, opacity * 0.16));
    g.addColorStop(1, hexAlpha(color, 0));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    tex.needsUpdate = true;
    return tex;
  }, [color, opacity]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0.05]} renderOrder={2}>
      <planeGeometry args={[width, length]} />
      <meshBasicMaterial map={map} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

function hexAlpha(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = Number.parseInt(h.slice(0, 2), 16);
  const g = Number.parseInt(h.slice(2, 4), 16);
  const b = Number.parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`;
}
