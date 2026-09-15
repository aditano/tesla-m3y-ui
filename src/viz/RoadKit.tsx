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

function offsets(pts: Vector3[], half: number): { left: Vector3[]; right: Vector3[] } {
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
  return { left, right };
}

function ribbonGeometry(left: Vector3[], right: Vector3[], y: number, color: Color) {
  const positions: number[] = [];
  const colors: number[] = [];
  for (let i = 0; i < left.length - 1; i++) {
    const a = left[i];
    const b = right[i];
    const c = left[i + 1];
    const d = right[i + 1];
    positions.push(a.x, y, a.z, b.x, y, b.z, c.x, y, c.z);
    positions.push(b.x, y, b.z, d.x, y, d.z, c.x, y, c.z);
    for (let k = 0; k < 6; k++) colors.push(color.r, color.g, color.b);
  }
  return { positions: new Float32Array(positions), colors: new Float32Array(colors) };
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
    const { left, right } = offsets(pts, LANE_WIDTH_M * 1.85);
    return ribbonGeometry(left, right, 0.015, new Color("#2c313c"));
  }, [origin.lat, origin.lng, route]);

  const path = useMemo(() => {
    const pts = route.coords.map((c) => toWorld(c, origin));
    const { left, right } = offsets(pts, 1.15);
    return ribbonGeometry(left, right, 0.04, new Color("#2f6fe4"));
  }, [origin.lat, origin.lng, route]);

  return (
    <group>
      <mesh receiveShadow>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[geom.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[geom.colors, 3]} />
        </bufferGeometry>
        <meshStandardMaterial vertexColors side={DoubleSide} roughness={0.9} metalness={0.05} />
      </mesh>
      <mesh>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[path.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[path.colors, 3]} />
        </bufferGeometry>
        <meshStandardMaterial
          vertexColors
          side={DoubleSide}
          roughness={0.35}
          metalness={0.1}
          emissive={new Color("#1d4cb8")}
          emissiveIntensity={0.55}
          transparent
          opacity={0.85}
        />
      </mesh>
    </group>
  );
}

export function LaneMarks({
  route,
  origin,
}: {
  route: RoutePlan;
  origin: WorldOrigin;
}) {
  const marks = useMemo(() => {
    const pts = route.coords.map((c) => toWorld(c, origin));
    const dashes: { pos: Vector3; rot: number; w: number; l: number; color: string }[] = [];
    const { left, right } = offsets(pts, LANE_WIDTH_M * 1.7);
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1];
      const b = pts[i];
      const seg = b.clone().sub(a);
      const len = seg.length();
      const heading = Math.atan2(seg.x, seg.z);
      const n = Math.max(1, Math.floor(len / 5.5));
      for (let k = 0; k < n; k++) {
        const t = (k + 0.5) / n;
        const pos = a.clone().lerp(b, t);
        pos.y = 0.05;
        dashes.push({ pos, rot: heading, w: 0.14, l: 2.2, color: "#e8edf4" });
      }
      const le = left[i - 1].clone().lerp(left[i], 0.5);
      const re = right[i - 1].clone().lerp(right[i], 0.5);
      le.y = 0.05;
      re.y = 0.05;
      dashes.push({ pos: le, rot: heading, w: 0.12, l: Math.min(len, 8), color: "#f2f4f8" });
      dashes.push({ pos: re, rot: heading, w: 0.12, l: Math.min(len, 8), color: "#f2f4f8" });
    }
    return dashes.slice(0, 700);
  }, [origin.lat, origin.lng, route]);

  return (
    <group>
      {marks.map((d, i) => (
        <mesh key={i} position={d.pos} rotation={[0, d.rot, 0]}>
          <boxGeometry args={[d.w, 0.012, d.l]} />
          <meshStandardMaterial color={d.color} emissive={d.color} emissiveIntensity={0.15} />
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
    return Array.from({ length: 8 }, (_, i) => ({
      offsetM: ((i * 63) % Math.max(80, total - 40)) + 40,
      lane: i % 2 === 0 ? LANE_WIDTH_M : -LANE_WIDTH_M * 0.9,
      color: palette[i % palette.length],
    }));
  }, [route]);

  const pts = useMemo(() => route.coords.map((c) => toWorld(c, origin)), [origin.lat, origin.lng, route]);

  return (
    <group>
      {cars.map((car, idx) => {
        const along = (traveledM + car.offsetM) % Math.max(1, route.distanceM);
        const pose = sampleWorld(pts, along);
        const side = new Vector3(Math.cos(pose.rot), 0, -Math.sin(pose.rot)).multiplyScalar(car.lane * 0.7);
        return (
          <mesh
            key={idx}
            position={pose.pos.clone().add(side).setY(0.48)}
            rotation={[0, pose.rot, 0]}
            castShadow
          >
            <boxGeometry args={[1.65, 0.62, 4.1]} />
            <meshStandardMaterial color={car.color} metalness={0.4} roughness={0.42} />
          </mesh>
        );
      })}
    </group>
  );
}

function sampleWorld(pts: Vector3[], meters: number): { pos: Vector3; rot: number } {
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
      {lights.slice(0, 10).map((m, i) => {
        const p = toWorld(m.location, origin);
        return (
          <group key={i} position={[p.x + 6.2, 0, p.z + 1.2]}>
            <mesh position={[0, 1.7, 0]}>
              <boxGeometry args={[0.12, 3.3, 0.12]} />
              <meshStandardMaterial color="#222" />
            </mesh>
            <mesh position={[0, 3.4, 0]}>
              <boxGeometry args={[0.3, 0.78, 0.2]} />
              <meshStandardMaterial color="#111" />
            </mesh>
            <mesh position={[0, 3.58, 0.12]}>
              <sphereGeometry args={[0.09, 12, 12]} />
              <meshStandardMaterial color="#2ecc71" emissive="#2ecc71" emissiveIntensity={2.4} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
