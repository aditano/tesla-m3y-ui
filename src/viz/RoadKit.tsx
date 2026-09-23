import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import type { Group } from "three";
import { CanvasTexture, Color, DoubleSide, SRGBColorSpace } from "three";
import { LANE_WIDTH_M } from "../geo/constants";
import { densifyRoute, egoWorldShift, isTurnManeuver, offsetAlongHeading } from "../geo/ego";
import { closestTraveledM, indexFor, interpolate, lngLatToLocal } from "../geo/polyline";
import { useVehicle } from "../state/store";
import type { RoutePlan } from "../state/types";
import { cityBlocksAlong } from "./cityDressing";
import { Model3 } from "./Model3";
import { dashedRibbonArrays, mergeRibbons, offsetSides, ribbonArrays, type XZ } from "./roadGeometry";

const ROAD = new Color("#4e5862");
const SHOULDER = new Color("#5c655c");
const VERGE = new Color("#6a7268");
const PATH = new Color("#3b82f6");
const LINE = new Color("#f4f7fb");
const AMBER = "#ff9f1a";
/** Three-and-a-bit lanes. Wider than this and a chase camera never sees the curb. */
const ROAD_HALF_M = LANE_WIDTH_M * 2.05;

let facadeTex: CanvasTexture | null = null;

function buildingFacade(): CanvasTexture {
  if (facadeTex) return facadeTex;
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 256;
  const ctx = c.getContext("2d");
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  if (!ctx) {
    facadeTex = tex;
    return tex;
  }
  ctx.fillStyle = "#8b959e";
  ctx.fillRect(0, 0, 128, 256);
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 4; col++) {
      const n = (row * 5 + col * 3) % 13;
      ctx.fillStyle = n === 0 ? "#e7d7b0" : "#55606a";
      ctx.fillRect(12 + col * 28, 18 + row * 24, 16, 11);
    }
  }
  ctx.fillStyle = "#6a737c";
  ctx.fillRect(0, 228, 128, 28);
  tex.needsUpdate = true;
  facadeTex = tex;
  return tex;
}

export type TurnLamp = "left" | "right" | "off";

/** Deterministic amber lamps so a frozen still shows 2026.14 turn signals. */
export function trafficTurnLamp(slot: number): TurnLamp {
  if (slot % 4 === 0) return "right";
  if (slot % 4 === 1) return "left";
  return "off";
}

function MeshRibbon({
  positions,
  normals,
  color,
  opacity = 1,
}: {
  positions: Float32Array;
  normals: Float32Array;
  color: Color;
  opacity?: number;
}) {
  if (positions.length < 9) return null;
  return (
    <mesh receiveShadow>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-normal" args={[normals, 3]} />
      </bufferGeometry>
      <meshBasicMaterial
        color={color}
        side={DoubleSide}
        transparent={opacity < 1}
        opacity={opacity}
        depthWrite={opacity >= 1}
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
    const samples = densifyRoute(index).filter((s) => s.traveledM >= lo && s.traveledM <= hi);
    const pts: XZ[] = samples.map((s) => {
      const p = lngLatToLocal(s.position, origin);
      return { x: p.x, z: p.z };
    });
    if (pts.length < 2) return null;
    const ahead = samples
      .filter((s) => s.traveledM >= traveledBucket + 6)
      .map((s) => {
        const p = lngLatToLocal(s.position, origin);
        return { x: p.x, z: p.z };
      });
    const asphalt = offsetSides(pts, ROAD_HALF_M);
    const path = offsetSides(ahead.length > 2 ? ahead : pts, 1.55);
    const leftShoulder = offsetSides(asphalt.left, 1.7);
    const rightShoulder = offsetSides(asphalt.right, 1.7);
    const leftVerge = offsetSides(leftShoulder.left, 2.4);
    const rightVerge = offsetSides(rightShoulder.right, 2.4);
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
      verge: mergeRibbons([
        ribbonArrays(leftVerge.left, leftVerge.right, 0.006),
        ribbonArrays(rightVerge.left, rightVerge.right, 0.006),
      ]),
      path: ribbonArrays(path.left, path.right, 0.045),
      edges: mergeRibbons([
        ribbonArrays(leftCurb.left, leftCurb.right, 0.055),
        ribbonArrays(rightCurb.left, rightCurb.right, 0.055),
      ]),
      dashes: mergeRibbons([
        dashedRibbonArrays(laneSep.left, 0.14, 0.07, 3.2, 5.2),
        dashedRibbonArrays(laneSep.right, 0.14, 0.07, 3.2, 5.2),
        dashedRibbonArrays(outerLane.left, 0.12, 0.065, 3.2, 5.6),
        dashedRibbonArrays(outerLane.right, 0.12, 0.065, 3.2, 5.6),
      ]),
    };
  }, [route, traveledBucket]);

  if (!geom) return null;

  return (
    <group>
      <MeshRibbon positions={geom.verge.positions} normals={geom.verge.normals} color={VERGE} />
      <MeshRibbon positions={geom.shoulders.positions} normals={geom.shoulders.normals} color={SHOULDER} />
      <MeshRibbon positions={geom.road.positions} normals={geom.road.normals} color={ROAD} />
      <MeshRibbon
        positions={geom.path.positions}
        normals={geom.path.normals}
        color={PATH}
        opacity={0.72}
      />
      <MeshRibbon positions={geom.edges.positions} normals={geom.edges.normals} color={LINE} />
      <MeshRibbon positions={geom.dashes.positions} normals={geom.dashes.normals} color={LINE} />
    </group>
  );
}

const FACADE = ["#ffffff", "#f3f5f7", "#e7ebef", "#f7f8f9", "#eceff2"];

export function CityBlocks({ route }: { route: RoutePlan }) {
  const traveledBucket = useVehicle((s) => Math.round(s.pose.traveledM / 40) * 40);
  const blocks = useMemo(() => {
    const origin: [number, number] = route.coords[0];
    const index = indexFor(route.coords);
    const pts = densifyRoute(index)
      .filter((s) => s.traveledM >= traveledBucket - 30 && s.traveledM <= traveledBucket + 240)
      .map((s) => {
        const p = lngLatToLocal(s.position, origin);
        return { x: p.x, z: p.z };
      });
    return cityBlocksAlong(pts);
  }, [route, traveledBucket]);
  const map = useMemo(() => buildingFacade(), []);

  return (
    <group>
      {blocks.map((b, i) => (
        <mesh key={`${b.x.toFixed(1)}-${b.z.toFixed(1)}-${i}`} position={[b.x, b.h / 2, b.z]} rotation={[0, b.yaw, 0]}>
          <boxGeometry args={[b.w, b.h, b.d]} />
          <meshBasicMaterial map={map} color={FACADE[i % FACADE.length]} />
        </mesh>
      ))}
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
        [-0.78, 1.45],
        [0.78, 1.45],
        [-0.78, -1.45],
        [0.78, -1.45],
      ].map(([x, z]) => (
        <mesh key={`${x}-${z}`} position={[x, 0.28, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.32, 0.32, 0.24, 12]} />
          <meshBasicMaterial color="#14161a" />
        </mesh>
      ))}
      <mesh position={[0, 0.46, 0.05]}>
        <boxGeometry args={[1.76, 0.38, 4.2]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.72, 1.15]}>
        <boxGeometry args={[1.68, 0.22, 1.35]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.78, -1.35]}>
        <boxGeometry args={[1.68, 0.28, 1.15]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh position={[0, 1.02, -0.15]}>
        <boxGeometry args={[1.58, 0.48, 1.85]} />
        <meshBasicMaterial color="#1a222c" />
      </mesh>
      <mesh position={[0, 1.08, 0.82]} rotation={[-0.45, 0, 0]}>
        <boxGeometry args={[1.42, 0.36, 0.06]} />
        <meshBasicMaterial color="#b7c6d6" />
      </mesh>
      {[-0.62, 0.62].map((x) => (
        <mesh key={`tail-${x}`} position={[x, 0.62, -2.18]}>
          <boxGeometry args={[0.32, 0.12, 0.08]} />
          <meshBasicMaterial color="#ff3b30" />
        </mesh>
      ))}
      {[-0.58, 0.58].map((x) => (
        <mesh key={`head-${x}`} position={[x, 0.58, 2.16]}>
          <boxGeometry args={[0.22, 0.08, 0.05]} />
          <meshBasicMaterial color="#f4f7ff" />
        </mesh>
      ))}
      {signal === "off" ? null : (
        <group>
          <mesh position={[lampX, 0.64, 2.48]}>
            <boxGeometry args={[0.42, 0.14, 0.08]} />
            <meshBasicMaterial color={AMBER} toneMapped={false} />
          </mesh>
          <mesh position={[lampX, 0.6, -2.48]}>
            <boxGeometry args={[0.42, 0.14, 0.08]} />
            <meshBasicMaterial color={AMBER} toneMapped={false} />
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
