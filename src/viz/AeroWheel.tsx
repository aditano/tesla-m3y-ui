import { useMemo, type ReactNode } from "react";
import { Color, ExtrudeGeometry, Shape } from "three";

const RUBBER = new Color("#050506");
const SIDEWALL = new Color("#0a0a0c");
const RIM = new Color("#14161a");
const COVER = new Color("#1a1d22");
const HUB = new Color("#0c0e10");
const ROTOR = new Color("#7c828a");
const CALIPER = new Color("#b01018");

function petalGeometry(inner: number, outer: number, halfAngle: number, depth: number): ExtrudeGeometry {
  const shape = new Shape();
  const steps = 10;
  for (let i = 0; i <= steps; i++) {
    const t = -halfAngle + (2 * halfAngle * i) / steps;
    const x = Math.cos(t) * outer;
    const y = Math.sin(t) * outer;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  for (let i = steps; i >= 0; i--) {
    const t = -halfAngle + (2 * halfAngle * i) / steps;
    const x = Math.cos(t) * inner;
    const y = Math.sin(t) * inner;
    shape.lineTo(x, y);
  }
  shape.closePath();
  const geo = new ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.005,
    bevelSize: 0.007,
    bevelSegments: 2,
    curveSegments: 8,
  });
  geo.translate(0, 0, -depth / 2);
  geo.rotateY(Math.PI / 2);
  return geo;
}

/** Original 5-cover aero wheel — not a Tesla asset. Sized for a Model 3 18" setup. */
export function AeroWheel({
  radius = 0.338,
  width = 0.235,
}: {
  radius?: number;
  width?: number;
}): ReactNode {
  const rimR = radius * 0.56;
  const petal = useMemo(
    () => petalGeometry(rimR * 0.28, rimR * 0.98, 0.42, width * 0.11),
    [rimR, width],
  );
  return (
    <group>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <torusGeometry args={[radius * 0.78, width * 0.38, 24, 64]} />
        <meshPhysicalMaterial color={RUBBER} roughness={0.96} metalness={0} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[radius * 0.7, radius * 0.7, width * 0.46, 64]} />
        <meshPhysicalMaterial color={SIDEWALL} roughness={0.92} metalness={0} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[rimR * 1.02, rimR * 0.96, width * 0.28, 64]} />
        <meshPhysicalMaterial
          color={RIM}
          metalness={0.9}
          roughness={0.26}
          clearcoat={0.28}
          clearcoatRoughness={0.22}
        />
      </mesh>
      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={i} geometry={petal} rotation={[(i * Math.PI * 2) / 5, 0, 0]} castShadow>
          <meshPhysicalMaterial
            color={COVER}
            metalness={0.72}
            roughness={0.38}
            clearcoat={0.18}
            clearcoatRoughness={0.4}
          />
        </mesh>
      ))}
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[rimR * 0.24, rimR * 0.24, width * 0.34, 32]} />
        <meshPhysicalMaterial color={HUB} metalness={0.78} roughness={0.32} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[rimR * 0.48, rimR * 0.48, 0.018, 40]} />
        <meshPhysicalMaterial color={ROTOR} metalness={0.88} roughness={0.38} />
      </mesh>
      <mesh position={[rimR * 0.46, 0, 0]} castShadow>
        <boxGeometry args={[0.07, 0.11, 0.15]} />
        <meshPhysicalMaterial color={CALIPER} metalness={0.22} roughness={0.4} clearcoat={0.35} />
      </mesh>
    </group>
  );
}
