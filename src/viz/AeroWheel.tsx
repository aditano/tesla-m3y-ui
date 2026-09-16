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
const RIM = new Color("#14171b");
const COVER = new Color("#1d2127");
const HUB = new Color("#0c0e10");
const ROTOR = new Color("#4e555d");
const CALIPER = new Color("#565b64");

function petalGeometry(inner: number, outer: number, halfAngle: number, depth: number): ExtrudeGeometry {
  const shape = new Shape();
  const steps = 16;
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
export function createAeroWheel(radius = 0.338, width = 0.235, side: "L" | "R" = "R"): Group {
  const rimR = radius * 0.56;
  const sideSign = side === "L" ? -1 : 1;
  const group = new Group();
  group.name = "aero-wheel";

  const tire = new Mesh(
    new TorusGeometry(radius * 0.84, width * 0.42, 30, 88),
    phys(RUBBER, { roughness: 0.96, metalness: 0 }),
  );
  tire.rotation.y = Math.PI / 2;
  tire.scale.y = 0.95;
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
    phys(RIM, { metalness: 0.38, roughness: 0.64, clearcoat: 0.08, clearcoatRoughness: 0.62 }),
  );
  rim.rotation.z = Math.PI / 2;
  rim.castShadow = true;
  group.add(rim);

  const facePlate = new Mesh(
    new CylinderGeometry(rimR * 0.98, rimR * 0.98, width * 0.042, 64),
    phys(new Color("#171b20"), { metalness: 0.32, roughness: 0.66 }),
  );
  facePlate.rotation.z = Math.PI / 2;
  facePlate.position.x = sideSign * width * 0.34;
  group.add(facePlate);

  const petal = petalGeometry(rimR * 0.34, rimR * 0.99, 0.62, width * 0.105);
  const coverMat = phys(COVER, { metalness: 0.28, roughness: 0.62, clearcoat: 0.05, clearcoatRoughness: 0.72 });
  for (let i = 0; i < 5; i++) {
    const cover = new Mesh(petal, coverMat);
    cover.rotation.x = (i * Math.PI * 2) / 5;
    cover.position.x = sideSign * width * 0.37;
    cover.castShadow = true;
    group.add(cover);
  }

  const cavityBlocker = new Mesh(
    new CylinderGeometry(rimR * 0.9, rimR * 0.9, width * 0.12, 48),
    phys(new Color("#090b0d"), { roughness: 0.9, metalness: 0.04 }),
  );
  cavityBlocker.rotation.z = Math.PI / 2;
  cavityBlocker.position.x = -sideSign * width * 0.2;
  group.add(cavityBlocker);

  const hub = new Mesh(
    new CylinderGeometry(rimR * 0.22, rimR * 0.22, width * 0.12, 32),
    phys(HUB, { metalness: 0.4, roughness: 0.54 }),
  );
  hub.rotation.z = Math.PI / 2;
  hub.position.x = sideSign * width * 0.4;
  hub.castShadow = true;
  group.add(hub);

  const rotor = new Mesh(
    new CylinderGeometry(rimR * 0.52, rimR * 0.52, 0.02, 40),
    phys(ROTOR, { metalness: 0.62, roughness: 0.58 }),
  );
  rotor.rotation.z = Math.PI / 2;
  rotor.position.x = -sideSign * width * 0.22;
  group.add(rotor);

  const caliper = new Mesh(
    new BoxGeometry(0.052, 0.1, 0.145),
    phys(CALIPER, { metalness: 0.38, roughness: 0.46, clearcoat: 0.14 }),
  );
  caliper.position.set(-sideSign * width * 0.25, rimR * 0.2, -rimR * 0.28);
  caliper.rotation.x = 0.18;
  caliper.castShadow = true;
  group.add(caliper);

  return group;
}

export function AeroWheel({
  radius = 0.338,
  width = 0.235,
  side = "R",
}: {
  radius?: number;
  width?: number;
  side?: "L" | "R";
}): ReactNode {
  const wheel = useMemo(() => createAeroWheel(radius, width, side), [radius, side, width]);
  return <primitive object={wheel} />;
}
