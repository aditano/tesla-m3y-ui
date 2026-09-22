import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import type { Group, InstancedMesh } from "three";
import {
  BoxGeometry,
  CanvasTexture,
  Color,
  DoubleSide,
  Matrix4,
  MeshStandardMaterial,
  Quaternion,
  SRGBColorSpace,
  Vector3,
} from "three";
import { LANE_WIDTH_M } from "../geo/constants";
import { densifyRoute, egoWorldShift, isTurnManeuver, offsetAlongHeading } from "../geo/ego";
import { closestTraveledM, indexFor, interpolate, lngLatToLocal } from "../geo/polyline";
import { useVehicle } from "../state/store";
import type { RoutePlan } from "../state/types";
import { cityBlocksAlong, type CityBlock } from "./cityDressing";
import { Model3 } from "./Model3";
import { dashedRibbonArrays, mergeRibbons, offsetSides, ribbonArrays, type XZ } from "./roadGeometry";

const ROAD = new Color("#2a313b");
const SHOULDER = new Color("#353d49");
const PATH = new Color("#3b82f6");
const LINE = new Color("#f7f9fc");
const BUILDING = ["#e7edf2", "#d5dde6", "#c5ced8"] as const;
const AMBER = "#ff9f1a";

function buildingFacadeMap(): CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 128;
  const ctx = c.getContext("2d");
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  if (!ctx) return tex;
  ctx.fillStyle = "#d5dde6";
  ctx.fillRect(0, 0, 64, 128);
  ctx.fillStyle = "#1a2128";
  for (let y = 8; y < 122; y += 16) {
    for (let x = 5; x < 60; x += 12) {
      ctx.fillRect(x, y, 7, 10);
    }
  }
  tex.needsUpdate = true;
  return tex;
}

export type TurnLamp = "left" | "right" | "off";

/** Deterministic amber lamps so a frozen still shows 2026.14 turn signals. */
export function trafficTurnLamp(slot: number): TurnLamp {
  if (slot % 4 === 0) return "right";
  if (slot % 4 === 1) return "left";
  return "off";
}

function CityBlocks({ blocks }: { blocks: CityBlock[] }) {
  const ref = useRef<InstancedMesh>(null);
  const geom = useMemo(() => new BoxGeometry(1, 1, 1), []);
  const materials = useMemo(() => {
    const facade = new MeshStandardMaterial({ map: buildingFacadeMap(), roughness: 0.88, metalness: 0.02 });
    const roof = new MeshStandardMaterial({ color: "#8e98a3", roughness: 0.94, metalness: 0.02 });
    const underside = new MeshStandardMaterial({ color: "#3a414a", roughness: 1 });
    return [facade, facade, roof, underside, facade, facade];
  }, []);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const matrix = new Matrix4();
    const position = new Vector3();
    const quaternion = new Quaternion();
    const scale = new Vector3();
    const color = new Color();
    const up = new Vector3(0, 1, 0);
    blocks.forEach((block, i) => {
      position.set(block.x, block.h / 2, block.z);
      quaternion.setFromAxisAngle(up, block.yaw);
      scale.set(block.w, block.h, block.d);
      matrix.compose(position, quaternion, scale);
      mesh.setMatrixAt(i, matrix);
      color.set(BUILDING[Math.min(BUILDING.length - 1, Math.floor(block.shade * BUILDING.length))]);
      mesh.setColorAt(i, color);
    });
    mesh.count = blocks.length;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [blocks]);
  if (blocks.length === 0) return null;
  return (
    <instancedMesh ref={ref} args={[geom, materials, blocks.length]} frustumCulled={false} castShadow receiveShadow />
  );
}

function MeshRibbon({
  positions,
  normals,
  color,
  opacity = 1,
  emissive,
  emissiveIntensity = 0,
}: {
  positions: Float32Array;
  normals: Float32Array;
  color: Color;
  opacity?: number;
  emissive?: Color;
  emissiveIntensity?: number;
}) {
  if (positions.length < 9) return null;
  return (
    <mesh receiveShadow>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-normal" args={[normals, 3]} />
      </bufferGeometry>
      <meshStandardMaterial
        color={color}
        side={DoubleSide}
        roughness={0.86}
        metalness={0.04}
        transparent={opacity < 1}
        opacity={opacity}
        emissive={emissive ?? color}
        emissiveIntensity={emissiveIntensity}
      />
    </mesh>
  );
}

export function RouteRoad({ route }: { route: RoutePlan }) {
  const traveledBucket = useVehicle((s) => Math.round(s.pose.traveledM / 12) * 12);
  const geom = useMemo(() => {
    const origin: [number, number] = route.coords[0];
    const index = indexFor(route.coords);
    const lo = traveledBucket - 90;
    const hi = traveledBucket + 260;
    const pts: XZ[] = densifyRoute(index)
      .filter((s) => s.traveledM >= lo && s.traveledM <= hi)
      .map((s) => {
        const p = lngLatToLocal(s.position, origin);
        return { x: p.x, z: p.z };
      });
    if (pts.length < 2) return null;
    const asphalt = offsetSides(pts, LANE_WIDTH_M * 2.05);
    const path = offsetSides(pts, 1.45);
    const leftShoulder = offsetSides(asphalt.left, 1.15);
    const rightShoulder = offsetSides(asphalt.right, 1.15);
    const leftCurb = offsetSides(asphalt.left, 0.07);
    const rightCurb = offsetSides(asphalt.right, 0.07);
    const laneSep = offsetSides(pts, LANE_WIDTH_M * 0.5);
    const outerLane = offsetSides(pts, LANE_WIDTH_M * 1.5);
    return {
      road: ribbonArrays(asphalt.left, asphalt.right, 0.02),
      shoulders: mergeRibbons([
        ribbonArrays(leftShoulder.left, leftShoulder.right, 0.012),
        ribbonArrays(rightShoulder.left, rightShoulder.right, 0.012),
      ]),
      path: ribbonArrays(path.left, path.right, 0.045),
      edges: mergeRibbons([
        ribbonArrays(leftCurb.left, leftCurb.right, 0.055),
        ribbonArrays(rightCurb.left, rightCurb.right, 0.055),
      ]),
      dashes: mergeRibbons([
        dashedRibbonArrays(laneSep.left, 0.08, 0.06),
        dashedRibbonArrays(laneSep.right, 0.08, 0.06),
        dashedRibbonArrays(outerLane.left, 0.07, 0.06, 2.4, 4.8),
        dashedRibbonArrays(outerLane.right, 0.07, 0.06, 2.4, 4.8),
      ]),
      blocks: cityBlocksAlong(pts),
    };
  }, [route, traveledBucket]);

  if (!geom) return null;

  const rich = useVehicle((s) => s.flags.visualizationPreview);

  return (
    <group>
      <MeshRibbon positions={geom.shoulders.positions} normals={geom.shoulders.normals} color={SHOULDER} />
      <MeshRibbon positions={geom.road.positions} normals={geom.road.normals} color={ROAD} />
      <MeshRibbon
        positions={geom.path.positions}
        normals={geom.path.normals}
        color={PATH}
        opacity={0.92}
        emissive={PATH}
        emissiveIntensity={0.72}
      />
      {rich ? <CityBlocks blocks={geom.blocks} /> : null}
      <MeshRibbon
        positions={geom.edges.positions}
        normals={geom.edges.normals}
        color={LINE}
        emissive={LINE}
        emissiveIntensity={0.18}
      />
      <MeshRibbon
        positions={geom.dashes.positions}
        normals={geom.dashes.normals}
        color={LINE}
        emissive={LINE}
        emissiveIntensity={0.22}
      />
    </group>
  );
}

const TRAFFIC = ["#c0392b", "#1f6feb", "#f4f6f8", "#1a1d22", "#d8dde4", "#7f8c8d", "#b9c0c8"];
const TRAFFIC_SLOTS = [
  { offsetM: 18, lane: LANE_WIDTH_M },
  { offsetM: 36, lane: 0 },
  { offsetM: 58, lane: LANE_WIDTH_M },
  { offsetM: 84, lane: -LANE_WIDTH_M },
  { offsetM: 112, lane: LANE_WIDTH_M * 2 },
  { offsetM: 146, lane: 0 },
  { offsetM: 178, lane: -LANE_WIDTH_M },
  { offsetM: -22, lane: LANE_WIDTH_M },
];

function placeTraffic(route: RoutePlan, car: Group, slot: { offsetM: number; lane: number }): void {
  const pose = useVehicle.getState().pose;
  const index = indexFor(route.coords);
  const meters = pose.traveledM + slot.offsetM;
  if (meters < 8 || meters > route.distanceM - 8) {
    car.visible = false;
    return;
  }
  const geo = interpolate(index, meters);
  const placed = offsetAlongHeading(geo.position, geo.heading, slot.lane, 0);
  const loc = lngLatToLocal(placed, route.coords[0]);
  const oncoming = slot.lane < -1;
  car.visible = true;
  car.position.set(loc.x, 0, loc.z);
  car.rotation.set(0, (geo.heading * Math.PI) / 180 + (oncoming ? Math.PI : 0), 0);
}

function TrafficCar({ color, signal }: { color: string; signal: TurnLamp }) {
  const lampX = signal === "left" ? -0.72 : 0.72;
  return (
    <group>
      {[
        [-0.78, 1.35],
        [0.78, 1.35],
        [-0.78, -1.35],
        [0.78, -1.35],
      ].map(([x, z]) => (
        <mesh key={`${x}-${z}`} position={[x, 0.28, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.32, 0.32, 0.22, 12]} />
          <meshStandardMaterial color="#14161a" roughness={0.92} />
        </mesh>
      ))}
      <mesh position={[0, 0.48, 0.15]} castShadow>
        <boxGeometry args={[1.78, 0.42, 4.35]} />
        <meshStandardMaterial color={color} metalness={0.55} roughness={0.32} />
      </mesh>
      <mesh position={[0, 0.92, -0.2]} castShadow>
        <boxGeometry args={[1.58, 0.46, 2.05]} />
        <meshStandardMaterial color="#141920" metalness={0.15} roughness={0.08} />
      </mesh>
      <mesh position={[0, 0.58, 2.16]}>
        <boxGeometry args={[1.42, 0.1, 0.05]} />
        <meshStandardMaterial color="#f4f7ff" emissive="#f4f7ff" emissiveIntensity={1.4} />
      </mesh>
      <mesh position={[0, 0.56, -2.16]}>
        <boxGeometry args={[1.46, 0.09, 0.05]} />
        <meshStandardMaterial color="#ff3b3b" emissive="#ff2a2a" emissiveIntensity={1.1} />
      </mesh>
      {signal === "off" ? null : (
        <group>
          <mesh position={[lampX, 0.58, 2.12]}>
            <boxGeometry args={[0.22, 0.08, 0.04]} />
            <meshStandardMaterial color={AMBER} emissive={AMBER} emissiveIntensity={4} />
          </mesh>
          <mesh position={[lampX, 0.56, -2.12]}>
            <boxGeometry args={[0.22, 0.08, 0.04]} />
            <meshStandardMaterial color={AMBER} emissive={AMBER} emissiveIntensity={3.2} />
          </mesh>
        </group>
      )}
    </group>
  );
}

export function TrafficPack({ route }: { route: RoutePlan }) {
  const refs = useRef<Array<Group | null>>([]);

  const placeAll = () => {
    TRAFFIC_SLOTS.forEach((slot, i) => {
      const car = refs.current[i];
      if (car) placeTraffic(route, car, slot);
    });
  };

  useLayoutEffect(() => {
    placeAll();
  }, [route]);

  useFrame(() => {
    placeAll();
  });

  return (
    <group>
      {TRAFFIC_SLOTS.map((slot, i) => (
        <group
          key={`${slot.offsetM}-${slot.lane}`}
          ref={(el) => {
            refs.current[i] = el;
          }}
        >
          <TrafficCar color={TRAFFIC[i % TRAFFIC.length]} signal={trafficTurnLamp(i)} />
        </group>
      ))}
    </group>
  );
}

export function SignalProps({ route }: { route: RoutePlan }) {
  const lights = useMemo(() => {
    const origin: [number, number] = route.coords[0];
    const index = indexFor(route.coords);
    return route.maneuvers
      .filter(isTurnManeuver)
      .map((m) => {
        const at = interpolate(index, closestTraveledM(index, m.location));
        const right = m.modifier?.includes("left") ? -5.8 : 5.8;
        const placed = offsetAlongHeading(at.position, at.heading, right, 1.2);
        const p = lngLatToLocal(placed, origin);
        return { x: p.x, z: p.z, yaw: (at.heading * Math.PI) / 180 };
      })
      .slice(0, 10);
  }, [route]);

  return (
    <group>
      {lights.map((l, i) => (
        <group key={i} position={[l.x, 0, l.z]} rotation={[0, l.yaw, 0]}>
          <mesh position={[0, 1.7, 0]}>
            <boxGeometry args={[0.12, 3.3, 0.12]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          <mesh position={[0, 3.42, 0]}>
            <boxGeometry args={[0.32, 0.82, 0.2]} />
            <meshStandardMaterial color="#111" />
          </mesh>
          <mesh position={[0, 3.62, 0.12]}>
            <sphereGeometry args={[0.09, 12, 12]} />
            <meshStandardMaterial color="#2ecc71" emissive="#2ecc71" emissiveIntensity={2.4} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Applies the shared ego pose so the ENU route is expressed in the local heading frame. */
export function EgoFrame({ children }: { children: ReactNode }) {
  const spin = useRef<Group>(null);
  const shift = useRef<Group>(null);

  useFrame(() => {
    const { pose, route } = useVehicle.getState();
    if (!spin.current || !shift.current) return;
    const origin = route?.coords[0] ?? ([pose.lng, pose.lat] as [number, number]);
    const t = egoWorldShift(pose, origin);
    shift.current.position.set(t.x, 0, t.z);
    spin.current.rotation.set(0, t.yaw, 0);
  });

  return (
    <group ref={spin}>
      <group ref={shift}>{children}</group>
    </group>
  );
}

export function EgoCar() {
  return (
    <group position={[0, 0, 0]}>
      <Model3 />
    </group>
  );
}
