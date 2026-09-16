import { useMemo, type ReactNode } from "react";
import {
  BoxGeometry,
  Color,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshPhysicalMaterial,
  Shape,
  TorusGeometry,
} from "three";

const RUBBER = new Color("#050506");
const SIDEWALL = new Color("#0a0a0c");
const RIM = new Color("#14161a");
const COVER = new Color("#1a1d22");
const HUB = new Color("#0c0e10");
const ROTOR = new Color("#6c7280");

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

function phys(color: Color, extra: ConstructorParameters<typeof MeshPhysicalMaterial>[0] = {}): MeshPhysicalMaterial {
  return new MeshPhysicalMaterial({ color, ...extra });
}

/** Original 5-cover aero wheel — not a Tesla asset. Sized for a Model 3 18" setup. */
export function createAeroWheel(radius = 0.338, width = 0.235): Group {
  const rimR = radius * 0.56;
  const group = new Group();
  group.name = "aero-wheel";

  const tire = new Mesh(
    new TorusGeometry(radius * 0.84, width * 0.42, 28, 72),
    phys(RUBBER, { roughness: 0.96, metalness: 0 }),
  );
  // Torus hole is along Y by default; rotate Z=PI/2 so hole → X (axle axis).
  tire.rotation.z = Math.PI / 2;
  tire.castShadow = true;
  tire.receiveShadow = true;
  group.add(tire);

  const barrel = new Mesh(
    new CylinderGeometry(radius * 0.78, radius * 0.78, width * 0.52, 64),
    phys(SIDEWALL, { roughness: 0.92, metalness: 0 }),
  );
  barrel.rotation.z = Math.PI / 2;
  barrel.castShadow = true;
  group.add(barrel);

  const rim = new Mesh(
    new CylinderGeometry(rimR * 1.02, rimR * 0.96, width * 0.28, 64),
    phys(RIM, { metalness: 0.9, roughness: 0.26, clearcoat: 0.28, clearcoatRoughness: 0.22 }),
  );
  rim.rotation.z = Math.PI / 2;
  rim.castShadow = true;
  group.add(rim);

  const petal = petalGeometry(rimR * 0.28, rimR * 0.98, 0.42, width * 0.11);
  const coverMat = phys(COVER, { metalness: 0.72, roughness: 0.38, clearcoat: 0.18, clearcoatRoughness: 0.4 });
  for (let i = 0; i < 5; i++) {
    const cover = new Mesh(petal, coverMat);
    cover.rotation.x = (i * Math.PI * 2) / 5;
    cover.castShadow = true;
    group.add(cover);
  }

  const hub = new Mesh(
    new CylinderGeometry(rimR * 0.24, rimR * 0.24, width * 0.34, 32),
    phys(HUB, { metalness: 0.78, roughness: 0.32 }),
  );
  hub.rotation.z = Math.PI / 2;
  hub.castShadow = true;
  group.add(hub);

  const rotor = new Mesh(
    new CylinderGeometry(rimR * 0.48, rimR * 0.48, 0.018, 40),
    phys(ROTOR, { metalness: 0.88, roughness: 0.38 }),
  );
  rotor.rotation.z = Math.PI / 2;
  group.add(rotor);

  const caliper = new Mesh(
    new BoxGeometry(0.06, 0.10, 0.14),
    phys(new Color("#16181d"), { metalness: 0.32, roughness: 0.5 }),
  );
  caliper.position.set(0, rimR * -0.48, 0);
  caliper.castShadow = true;
  group.add(caliper);

  return group;
}

export function AeroWheel({
  radius = 0.338,
  width = 0.235,
}: {
  radius?: number;
  width?: number;
}): ReactNode {
  const wheel = useMemo(() => createAeroWheel(radius, width), [radius, width]);
  return <primitive object={wheel} />;
}
