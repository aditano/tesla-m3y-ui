import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import type { Group } from "three";
import { CanvasTexture, SRGBColorSpace } from "three";
import { offsetAlongHeading } from "../geo/ego";
import { indexFor, interpolate, lngLatToLocal } from "../geo/polyline";
import { useVehicle } from "../state/store";
import type { RoutePlan } from "../state/types";

export type TrafficTone = "white" | "silver" | "gray";

const TONES: readonly TrafficTone[] = ["white", "silver", "gray", "white", "gray", "silver", "white", "gray"];

/** Other vehicles are only white or gray, the way the occupancy render draws them. */
export function trafficBodyTone(slot: number): TrafficTone {
  const tone = TONES[Math.abs(slot) % TONES.length];
  if (tone === undefined) return "white";
  return tone;
}

const BODY: Record<TrafficTone, string> = {
  white: "#f3f5f7",
  silver: "#c5ccd3",
  gray: "#8b939c",
};

const CABIN: Record<TrafficTone, string> = {
  white: "#e4e8ed",
  silver: "#b4bcc6",
  gray: "#7a828b",
};

export function anchorOnRoute(
  route: RoutePlan,
  offsetM: number,
  lane: number,
): { x: number; z: number; yaw: number } | null {
  const pose = useVehicle.getState().pose;
  const index = indexFor(route.coords);
  const meters = pose.traveledM + offsetM;
  if (meters < 8 || meters > route.distanceM - 8) return null;
  const geo = interpolate(index, meters);
  const placed = offsetAlongHeading(geo.position, geo.heading, lane, 0);
  const loc = lngLatToLocal(placed, route.coords[0]);
  const oncoming = lane < -1;
  return {
    x: loc.x,
    z: loc.z,
    yaw: (geo.heading * Math.PI) / 180 + (oncoming ? Math.PI : 0),
  };
}

/** Small along-track drift. Frozen QA stills stay put. */
export function actorDrift(slot: number, frozen: boolean): number {
  if (frozen) return 0;
  return Math.sin(performance.now() / 1000 * 0.42 + slot * 0.85) * 1.7;
}

function Shade({ color, roughness = 0.46 }: { color: string; roughness?: number }) {
  return <meshStandardMaterial color={color} roughness={roughness} metalness={0.06} />;
}

/** Smooth low-poly car. Rounded boxes, not a faceted toy. */
export function BlobVehicle({ tone, kind = "car" }: { tone: TrafficTone; kind?: "car" | "truck" }): ReactNode {
  const body = BODY[tone];
  const cabin = CABIN[tone];
  if (kind === "truck") {
    return (
      <group>
        <RoundedBox args={[2.15, 0.72, 6.4]} radius={0.18} smoothness={4} position={[0, 0.7, 0]}>
          <Shade color={body} roughness={0.55} />
        </RoundedBox>
        <RoundedBox args={[2.05, 0.7, 1.5]} radius={0.16} smoothness={4} position={[0, 1.25, 2.15]}>
          <Shade color={cabin} />
        </RoundedBox>
      </group>
    );
  }
  return (
    <group>
      <RoundedBox args={[1.74, 0.5, 4.15]} radius={0.24} smoothness={4} position={[0, 0.5, 0]}>
        <Shade color={body} />
      </RoundedBox>
      <RoundedBox args={[1.55, 0.42, 1.9]} radius={0.2} smoothness={4} position={[0, 0.9, -0.08]}>
        <Shade color={cabin} />
      </RoundedBox>
      <mesh position={[0, 0.86, 0.78]} rotation={[-0.55, 0, 0]}>
        <planeGeometry args={[1.28, 0.46]} />
        <meshStandardMaterial color="#242a32" roughness={0.25} metalness={0.35} />
      </mesh>
      <mesh position={[0, 0.78, -1.15]} rotation={[0.4, 0, 0]}>
        <planeGeometry args={[1.22, 0.4]} />
        <meshStandardMaterial color="#2a3038" roughness={0.3} metalness={0.2} />
      </mesh>
    </group>
  );
}

export function Pedestrian({ tone = "gray" }: { tone?: TrafficTone }): ReactNode {
  const cloth = tone === "white" ? "#e8ebef" : "#9aa3ad";
  return (
    <group>
      <mesh position={[0, 1.55, 0]}>
        <sphereGeometry args={[0.16, 16, 12]} />
        <Shade color="#d5d8de" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.95, 0]}>
        <capsuleGeometry args={[0.18, 0.55, 4, 10]} />
        <Shade color={cloth} roughness={0.7} />
      </mesh>
      <mesh position={[-0.16, 0.38, 0]}>
        <capsuleGeometry args={[0.07, 0.28, 3, 8]} />
        <Shade color="#6e7680" roughness={0.75} />
      </mesh>
      <mesh position={[0.16, 0.38, 0]}>
        <capsuleGeometry args={[0.07, 0.28, 3, 8]} />
        <Shade color="#6e7680" roughness={0.75} />
      </mesh>
    </group>
  );
}

export function Cone(): ReactNode {
  return (
    <group>
      <mesh position={[0, 0.28, 0]}>
        <coneGeometry args={[0.16, 0.5, 14]} />
        <meshStandardMaterial color="#ff7a1a" roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.17, 0.17, 0.05, 14]} />
        <meshStandardMaterial color="#f7f7f5" roughness={0.4} />
      </mesh>
    </group>
  );
}

function signTexture(limit: number): CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext("2d");
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  if (!ctx) return tex;
  ctx.clearRect(0, 0, 128, 128);
  ctx.fillStyle = "#e10600";
  ctx.beginPath();
  ctx.arc(64, 64, 60, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f4f4f4";
  ctx.beginPath();
  ctx.arc(64, 64, 46, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#111";
  ctx.font = "700 44px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(limit), 64, 66);
  tex.needsUpdate = true;
  return tex;
}

export function SpeedSign({ limit }: { limit: number }): ReactNode {
  const map = useMemo(() => signTexture(limit), [limit]);
  return (
    <group>
      <mesh position={[0, 1.15, 0]}>
        <cylinderGeometry args={[0.045, 0.05, 2.3, 8]} />
        <meshStandardMaterial color="#3a4048" roughness={0.6} metalness={0.2} />
      </mesh>
      <mesh position={[0, 2.35, 0]}>
        <circleGeometry args={[0.42, 28]} />
        <meshBasicMaterial map={map} toneMapped={false} />
      </mesh>
    </group>
  );
}

export function SignalHead({ lit = "green" }: { lit?: "red" | "yellow" | "green" }): ReactNode {
  const lamps = [
    { id: "red", y: 0.28, color: "#ff3b30" },
    { id: "yellow", y: 0, color: "#ffd60a" },
    { id: "green", y: -0.28, color: "#30d158" },
  ] as const;
  return (
    <group>
      <mesh position={[0, 2.15, 0]}>
        <cylinderGeometry args={[0.06, 0.07, 3.5, 8]} />
        <meshStandardMaterial color="#2a2e33" roughness={0.55} metalness={0.25} />
      </mesh>
      <mesh position={[0.22, 3.55, 0]}>
        <boxGeometry args={[0.28, 0.92, 0.22]} />
        <meshStandardMaterial color="#1a1d22" roughness={0.4} metalness={0.3} />
      </mesh>
      {lamps.map((lamp) => (
        <mesh key={lamp.id} position={[0.36, 3.55 + lamp.y, 0]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshBasicMaterial
            color={lamp.id === lit ? lamp.color : "#2a2e33"}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

const ROADSIDE = [
  { kind: "ped", offsetM: 22, lane: 4.35, slot: 1 },
  { kind: "ped", offsetM: 70, lane: -4.5, slot: 2 },
  { kind: "cone", offsetM: 46, lane: 2.15, slot: 3 },
  { kind: "cone", offsetM: 49.2, lane: 2.05, slot: 4 },
  { kind: "cone", offsetM: 52.4, lane: 2.25, slot: 5 },
  { kind: "sign", offsetM: 88, lane: 4.8, slot: 6 },
  { kind: "signal", offsetM: 120, lane: 4.6, slot: 7 },
] as const;

type RoadsideKind = (typeof ROADSIDE)[number]["kind"];

function RoadsideMesh({ kind, limit }: { kind: RoadsideKind; limit: number }): ReactNode {
  switch (kind) {
    case "ped":
      return <Pedestrian tone="gray" />;
    case "cone":
      return <Cone />;
    case "sign":
      return <SpeedSign limit={limit} />;
    case "signal":
      return <SignalHead lit="red" />;
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

export function RoadsidePack({ route }: { route: RoutePlan }): ReactNode {
  const refs = useRef<Array<Group | null>>([]);
  const limit = useVehicle((s) => Math.round(s.pose.speedLimitMph));

  const placeAll = () => {
    const frozen = useVehicle.getState().qa.frozen;
    ROADSIDE.forEach((actor, i) => {
      const node = refs.current[i];
      if (!node) return;
      const drift = actor.kind === "cone" || actor.kind === "sign" || actor.kind === "signal" ? 0 : actorDrift(actor.slot, frozen);
      const at = anchorOnRoute(route, actor.offsetM + drift, actor.lane);
      if (!at) {
        node.visible = false;
        return;
      }
      node.visible = true;
      node.position.set(at.x, 0, at.z);
      node.rotation.set(0, at.yaw, 0);
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
      {ROADSIDE.map((actor, i) => (
        <group
          key={`${actor.kind}-${actor.offsetM}`}
          ref={(el) => {
            refs.current[i] = el;
          }}
        >
          <RoadsideMesh kind={actor.kind} limit={limit} />
        </group>
      ))}
    </group>
  );
}
