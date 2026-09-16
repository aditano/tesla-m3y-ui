import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type ReactNode } from "react";
import type { Group, Mesh } from "three";
import { Color, DoubleSide } from "three";
import { LANE_WIDTH_M } from "../geo/constants";
import { densifyRoute, egoWorldShift, isTurnManeuver, offsetAlongHeading } from "../geo/ego";
import { closestTraveledM, indexFor, interpolate, lngLatToLocal } from "../geo/polyline";
import { useVehicle } from "../state/store";
import type { RoutePlan } from "../state/types";
import { Model3 } from "./Model3";
import { dashedRibbonArrays, mergeRibbons, offsetSides, ribbonArrays, type XZ } from "./roadGeometry";

const ROAD = new Color("#2a303c");
const PATH = new Color("#2f74ea");
const LINE = new Color("#e8edf6");

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
    const lo = traveledBucket - 40;
    const hi = traveledBucket + 220;
    const pts: XZ[] = densifyRoute(index)
      .filter((s) => s.traveledM >= lo && s.traveledM <= hi)
      .map((s) => {
        const p = lngLatToLocal(s.position, origin);
        return { x: p.x, z: p.z };
      });
    if (pts.length < 2) return null;
    const asphalt = offsetSides(pts, LANE_WIDTH_M * 1.55);
    const path = offsetSides(pts, 1.18);
    const leftCurb = offsetSides(asphalt.left, 0.08);
    const rightCurb = offsetSides(asphalt.right, 0.08);
    const laneSep = offsetSides(pts, LANE_WIDTH_M * 0.5);
    const outerLane = offsetSides(pts, LANE_WIDTH_M * 1.5);
    return {
      road: ribbonArrays(asphalt.left, asphalt.right, 0.012),
      path: ribbonArrays(path.left, path.right, 0.028),
      edges: mergeRibbons([
        ribbonArrays(leftCurb.left, leftCurb.right, 0.04),
        ribbonArrays(rightCurb.left, rightCurb.right, 0.04),
      ]),
      dashes: mergeRibbons([
        dashedRibbonArrays(laneSep.left, 0.075, 0.046),
        dashedRibbonArrays(laneSep.right, 0.075, 0.046),
        dashedRibbonArrays(outerLane.left, 0.07, 0.046, 2.2, 5.2),
        dashedRibbonArrays(outerLane.right, 0.07, 0.046, 2.2, 5.2),
      ]),
    };
  }, [route, traveledBucket]);

  if (!geom) return null;

  return (
    <group>
      <MeshRibbon positions={geom.road.positions} normals={geom.road.normals} color={ROAD} />
      <MeshRibbon
        positions={geom.path.positions}
        normals={geom.path.normals}
        color={PATH}
        opacity={0.88}
        emissive={PATH}
        emissiveIntensity={0.55}
      />
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

const TRAFFIC = ["#c0392b", "#1f6feb", "#27ae60", "#f1c40f", "#7f8c8d", "#8e44ad", "#d35400"];
const TRAFFIC_SLOTS = [
  { offsetM: 22, lane: 0 },
  { offsetM: 48, lane: LANE_WIDTH_M },
  { offsetM: 76, lane: 0 },
  { offsetM: 108, lane: LANE_WIDTH_M },
  { offsetM: 142, lane: -LANE_WIDTH_M * 1.05 },
  { offsetM: 175, lane: -LANE_WIDTH_M * 1.05 },
  { offsetM: -16, lane: LANE_WIDTH_M },
];

export function TrafficPack({ route }: { route: RoutePlan }) {
  const refs = useRef<Array<Mesh | null>>([]);
  const origin: [number, number] = route.coords[0];

  useFrame(() => {
    const pose = useVehicle.getState().pose;
    const index = indexFor(route.coords);
    TRAFFIC_SLOTS.forEach((slot, i) => {
      const mesh = refs.current[i];
      if (!mesh) return;
      const meters = pose.traveledM + slot.offsetM;
      if (meters < 8 || meters > route.distanceM - 8) {
        mesh.visible = false;
        return;
      }
      const geo = interpolate(index, meters);
      const placed = offsetAlongHeading(geo.position, geo.heading, slot.lane, 0);
      const loc = lngLatToLocal(placed, origin);
      mesh.visible = true;
      mesh.position.set(loc.x, 0.48, loc.z);
      mesh.rotation.set(0, (geo.heading * Math.PI) / 180, 0);
    });
  });

  return (
    <group>
      {TRAFFIC_SLOTS.map((slot, i) => (
        <mesh
          key={`${slot.offsetM}-${slot.lane}`}
          ref={(el) => {
            refs.current[i] = el;
          }}
          castShadow
        >
          <boxGeometry args={[1.7, 0.62, 4.15]} />
          <meshStandardMaterial color={TRAFFIC[i % TRAFFIC.length]} metalness={0.38} roughness={0.44} />
        </mesh>
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
