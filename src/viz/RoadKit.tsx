import { useMemo } from "react";
import { Color, DoubleSide, Euler, Vector3 } from "three";
import { LANE_WIDTH_M } from "../geo/constants";
import { lngLatToLocal } from "../geo/polyline";
import type { LngLat, Maneuver, RoutePlan } from "../state/types";

export interface WorldOrigin {
  lng: number;
  lat: number;
}

export function toWorld(p: LngLat, origin: WorldOrigin): Vector3 {
  const loc = lngLatToLocal(p, [origin.lng, origin.lat]);
  return new Vector3(loc.x, 0, loc.z);
}

export function headingQuat(headingDeg: number): Euler {
  return new Euler(0, -((headingDeg * Math.PI) / 180), 0);
}

export function RoadRibbon({
  route,
  origin,
}: {
  route: RoutePlan;
  origin: WorldOrigin;
}) {
  const geom = useMemo(() => {
    const pts = route.coords.map((c) => toWorld(c, origin));
    const half = LANE_WIDTH_M * 1.55;
    const left: Vector3[] = [];
    const right: Vector3[] = [];
    for (let i = 0; i < pts.length; i++) {
      const prev = pts[Math.max(0, i - 1)];
      const next = pts[Math.min(pts.length - 1, i + 1)];
      const dir = next.clone().sub(prev);
      dir.y = 0;
      if (dir.lengthSq() < 1e-6) dir.set(0, 0, 1);
      dir.normalize();
      const side = new Vector3(-dir.z, 0, dir.x).multiplyScalar(half);
      left.push(pts[i].clone().add(side));
      right.push(pts[i].clone().sub(side));
    }
    const positions: number[] = [];
    const colors: number[] = [];
    const asphalt = new Color("#1a1d24");
    for (let i = 0; i < pts.length - 1; i++) {
      const a = left[i];
      const b = right[i];
      const c = left[i + 1];
      const d = right[i + 1];
      positions.push(a.x, 0.02, a.z, b.x, 0.02, b.z, c.x, 0.02, c.z);
      positions.push(b.x, 0.02, b.z, d.x, 0.02, d.z, c.x, 0.02, c.z);
      for (let k = 0; k < 6; k++) colors.push(asphalt.r, asphalt.g, asphalt.b);
    }
    return { positions: new Float32Array(positions), colors: new Float32Array(colors) };
  }, [origin.lat, origin.lng, route]);

  return (
    <mesh receiveShadow>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[geom.positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[geom.colors, 3]} />
      </bufferGeometry>
      <meshStandardMaterial vertexColors side={DoubleSide} roughness={0.92} metalness={0.04} />
    </mesh>
  );
}

export function LaneMarks({
  route,
  origin,
  fsd,
}: {
  route: RoutePlan;
  origin: WorldOrigin;
  fsd: boolean;
}) {
  const dashes = useMemo(() => {
    const pts = route.coords.map((c) => toWorld(c, origin));
    const items: { pos: Vector3; rot: number; color: string }[] = [];
    let acc = 0;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1];
      const b = pts[i];
      const seg = b.clone().sub(a);
      const len = seg.length();
      const heading = Math.atan2(seg.x, seg.z);
      const n = Math.max(1, Math.floor(len / 6));
      for (let k = 0; k < n; k++) {
        acc += 6;
        const t = (k + 0.5) / n;
        const pos = a.clone().lerp(b, t);
        pos.y = 0.04;
        items.push({
          pos,
          rot: heading,
          color: fsd ? "#3d8bfd" : "#d8dce3",
        });
      }
    }
    return items.slice(0, 420);
  }, [fsd, origin.lat, origin.lng, route]);

  return (
    <group>
      {dashes.map((d, i) => (
        <mesh key={i} position={d.pos} rotation={[0, d.rot, 0]}>
          <boxGeometry args={[0.12, 0.01, 2.4]} />
          <meshStandardMaterial
            color={d.color}
            emissive={fsd ? "#1d4ed8" : "#222"}
            emissiveIntensity={fsd ? 1.4 : 0.1}
          />
        </mesh>
      ))}
    </group>
  );
}

export function TrafficPack({
  route,
  origin,
  traveledM,
}: {
  route: RoutePlan;
  origin: WorldOrigin;
  traveledM: number;
}) {
  const cars = useMemo(() => {
    const total = route.distanceM;
    const palette = ["#c0392b", "#1f6feb", "#2ecc71", "#f1c40f", "#7f8c8d", "#8e44ad"];
    return Array.from({ length: 10 }, (_, i) => ({
      offsetM: ((i * 47) % Math.max(80, total - 40)) + 30,
      lane: i % 2 === 0 ? LANE_WIDTH_M : -LANE_WIDTH_M,
      color: palette[i % palette.length],
    }));
  }, [origin.lat, origin.lng, route]);

  const pts = useMemo(() => route.coords.map((c) => toWorld(c, origin)), [origin.lat, origin.lng, route]);

  return (
    <group>
      {cars.map((car, idx) => {
        const along = (traveledM + car.offsetM) % Math.max(1, route.distanceM);
        const pose = sampleWorld(pts, along);
        const side = new Vector3(Math.cos(pose.rot), 0, -Math.sin(pose.rot)).multiplyScalar(car.lane * 0.55);
        return (
          <mesh
            key={idx}
            position={pose.pos.clone().add(side).setY(0.45)}
            rotation={[0, pose.rot, 0]}
            castShadow
          >
            <boxGeometry args={[1.7, 0.7, 4.2]} />
            <meshStandardMaterial color={car.color} metalness={0.45} roughness={0.4} />
          </mesh>
        );
      })}
    </group>
  );
}

function sampleWorld(
  pts: Vector3[],
  meters: number,
): { pos: Vector3; rot: number } {
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const len = pts[i].distanceTo(pts[i - 1]);
    if (acc + len >= meters || i === pts.length - 1) {
      const t = len < 1e-3 ? 0 : (meters - acc) / len;
      const pos = pts[i - 1].clone().lerp(pts[i], Math.min(1, Math.max(0, t)));
      const dir = pts[i].clone().sub(pts[i - 1]);
      const rot = Math.atan2(dir.x, dir.z);
      return { pos, rot };
    }
    acc += len;
  }
  return { pos: pts[0], rot: 0 };
}

export function SignalProps({
  maneuvers,
  origin,
}: {
  maneuvers: Maneuver[];
  origin: WorldOrigin;
}) {
  const lights = maneuvers.filter(
    (m) => m.type === "turn" || m.type === "end of road" || m.modifier === "left" || m.modifier === "right",
  );
  return (
    <group>
      {lights.slice(0, 12).map((m, i) => {
        const p = toWorld(m.location, origin);
        return (
          <group key={i} position={[p.x + 5.5, 0, p.z + 1.5]}>
            <mesh position={[0, 1.6, 0]}>
              <boxGeometry args={[0.12, 3.2, 0.12]} />
              <meshStandardMaterial color="#222" />
            </mesh>
            <mesh position={[0, 3.3, 0]}>
              <boxGeometry args={[0.28, 0.72, 0.18]} />
              <meshStandardMaterial color="#111" />
            </mesh>
            <mesh position={[0, 3.48, 0.1]}>
              <sphereGeometry args={[0.08, 12, 12]} />
              <meshStandardMaterial color="#2ecc71" emissive="#2ecc71" emissiveIntensity={2} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
