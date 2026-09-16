import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Lightformer,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import { useMemo, useRef, type ReactNode } from "react";
import type { Group } from "three";
import { ACESFilmicToneMapping, SRGBColorSpace, Vector3 } from "three";
import { useVehicle } from "../state/store";
import { lngLatToLocal } from "../geo/polyline";
import { Model3 } from "./Model3";
import { LaneMarks, RoadRibbon, SignalProps, TrafficPack, headingQuat, toWorld } from "./RoadKit";
import { isParkedFullscreen } from "./layout";
import { IconChargePort, IconFrunk, IconTrunk } from "../chrome/Icons";

function ParkedStudio() {
  const gear = useVehicle((s) => s.gear);
  return (
    <>
      <color attach="background" args={["#eef0f3"]} />
      <fog attach="fog" args={["#eef0f3", 16, 34]} />
      <PerspectiveCamera makeDefault fov={30} position={[-4.35, 5.35, -6.55]} near={0.1} far={80} />
      <ambientLight intensity={0.92} />
      <hemisphereLight args={["#ffffff", "#d4d7de", 1.05]} />
      <directionalLight position={[-5.4, 8.6, -2.2]} intensity={1.15} color="#ffffff" />
      <directionalLight position={[4.8, 3.4, 3.2]} intensity={0.32} color="#dfe4ec" />
      <spotLight
        position={[-1.2, 9.4, -4.2]}
        angle={0.72}
        penumbra={1}
        intensity={22}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0002}
      />
      <Environment resolution={512} environmentIntensity={0.72}>
        <Lightformer intensity={6.5} position={[0, 8, 0]} scale={[16, 2.2, 1]} form="rect" color="#ffffff" />
        <Lightformer intensity={2.4} position={[-7, 2.8, -2]} scale={[6, 8, 1]} color="#e4e8ee" form="rect" />
        <Lightformer intensity={2.1} position={[7, 2.2, 1]} scale={[4, 9, 1]} form="rect" color="#f4f6f8" />
        <Lightformer intensity={1.6} position={[0, 3, 8]} scale={[14, 6, 1]} color="#f7f8fa" form="rect" />
      </Environment>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[48, 48]} />
        <meshStandardMaterial color="#eef0f3" roughness={0.96} metalness={0} />
      </mesh>
      <group rotation={gear === "R" ? [0, Math.PI, 0] : [0, 0.18, 0]} position={[0, 0, 0.04]}>
        <Model3 scale={1.08} />
      </group>
      <ContactShadows opacity={0.18} scale={18} blur={3.4} far={9} resolution={1024} color="#8a8588" />
      <OrbitControls
        enablePan={false}
        minDistance={7.4}
        maxDistance={11.2}
        autoRotate={false}
        minPolarAngle={0.88}
        maxPolarAngle={1.08}
        target={[0, 0.48, -0.22]}
      />
    </>
  );
}

function DrivingWorld() {
  const route = useVehicle((s) => s.route);
  const pose = useVehicle((s) => s.pose);
  const phase = useVehicle((s) => s.phase);
  const cam = useRef<Group>(null);

  const origin = useMemo(
    () => (route ? { lng: route.coords[0][0], lat: route.coords[0][1] } : { lng: pose.lng, lat: pose.lat }),
    [pose.lat, pose.lng, route],
  );

  useFrame(({ camera }) => {
    const loc = lngLatToLocal([pose.lng, pose.lat], [origin.lng, origin.lat]);
    const h = (pose.heading * Math.PI) / 180;
    const back = 16.5;
    const height = 7.2;
    const camPos = new Vector3(loc.x - Math.sin(h) * back, height, loc.z - Math.cos(h) * back);
    const look = new Vector3(loc.x + Math.sin(h) * 26, 0.2, loc.z + Math.cos(h) * 26);
    const frozen = useVehicle.getState().qa.frozen;
    if (frozen) {
      camera.position.copy(camPos);
      camera.lookAt(look);
      return;
    }
    camera.position.lerp(camPos, 0.14);
    camera.lookAt(look);
  });

  const carPos = toWorld([pose.lng, pose.lat], origin);
  const fsd = phase === "fsd";

  if (!route) {
    return (
      <>
        <color attach="background" args={["#07090f"]} />
        <fog attach="fog" args={["#07090f", 40, 160]} />
        <ambientLight intensity={0.5} />
        <Model3 showHits={false} />
      </>
    );
  }

  return (
    <>
      <color attach="background" args={["#07090f"]} />
      <fog attach="fog" args={["#07090f", 55, 220]} />
      <ambientLight intensity={0.62} />
      <directionalLight position={[10, 22, 8]} intensity={1.85} castShadow />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[carPos.x, 0, carPos.z]} receiveShadow>
        <planeGeometry args={[500, 500]} />
        <meshStandardMaterial color="#12151c" />
      </mesh>
      <RoadRibbon route={route} origin={origin} />
      <LaneMarks route={route} origin={origin} />
      {fsd ? <TrafficPack route={route} origin={origin} traveledM={pose.traveledM} /> : null}
      <SignalProps maneuvers={route.maneuvers} origin={origin} />
      <group ref={cam} position={[carPos.x, 0, carPos.z]} rotation={headingQuat(pose.heading)}>
        <Model3 showHits={false} />
      </group>
    </>
  );
}

function ParkedHud() {
  const flags = useVehicle((s) => s.flags);
  const patchFlags = useVehicle((s) => s.patchFlags);
  return (
    <div className="parked-callouts">
      <CalloutCard
        className="frunk"
        kicker="FRUNK"
        open={flags.frunkOpen}
        icon={<IconFrunk />}
        onToggle={() => patchFlags({ frunkOpen: !flags.frunkOpen })}
      />
      <CalloutCard
        className="trunk"
        kicker="TRUNK"
        open={flags.trunkOpen}
        icon={<IconTrunk />}
        onToggle={() => patchFlags({ trunkOpen: !flags.trunkOpen })}
      />
      <CalloutCard
        className="charge"
        kicker="CHARGE"
        open={flags.chargePortOpen}
        icon={<IconChargePort />}
        onToggle={() => patchFlags({ chargePortOpen: !flags.chargePortOpen })}
      />
    </div>
  );
}

function CalloutCard({
  className,
  kicker,
  open,
  icon,
  onToggle,
}: {
  className: string;
  kicker: string;
  open: boolean;
  icon: ReactNode;
  onToggle: () => void;
}) {
  return (
    <div className={`parked-callout ${className} ${open ? "on" : ""}`}>
      <span className="parked-callout-kicker">{kicker}</span>
      <button type="button" className="parked-callout-card" onClick={onToggle}>
        {icon}
        <span>{open ? "Close" : "Open"}</span>
      </button>
      <span className="parked-callout-line" aria-hidden="true" />
      <span className="parked-callout-dot" aria-hidden="true" />
    </div>
  );
}

function VizHud() {
  const pose = useVehicle((s) => s.pose);
  const phase = useVehicle((s) => s.phase);
  const follow = useVehicle((s) => s.flags.followingDistance);
  const disengage = useVehicle((s) => s.disengageFsd);
  const driving = phase === "fsd" || pose.speedMph > 0.4;

  if (!driving && phase !== "disengaged") return null;

  return (
    <div className="hud">
      <div className="hud-speed">
        <div className="mph">{Math.round(pose.speedMph)}</div>
        <div className={phase === "fsd" ? "label" : "label muted"}>
          {phase === "fsd" ? "Self-Driving" : phase === "disengaged" ? "Disengaged" : "MPH"}
        </div>
      </div>
      <div className="speed-limit">{Math.round(pose.speedLimitMph)}</div>
      {phase === "fsd" ? <div className="set-speed">{Math.round(pose.setSpeedMph)}</div> : null}
      <div className="follow-pips">
        {Array.from({ length: 7 }, (_, i) => (
          <i key={i} className={i < follow ? "on" : ""} />
        ))}
      </div>
      {phase === "fsd" ? (
        <button className="fsd-end" onClick={disengage}>
          End Self-Driving
        </button>
      ) : null}
    </div>
  );
}

export function FsdCanvas() {
  const phase = useVehicle((s) => s.phase);
  const gear = useVehicle((s) => s.gear);
  const route = useVehicle((s) => s.route);
  const frozen = useVehicle((s) => s.qa.frozen);
  const parked = isParkedFullscreen(gear, phase);
  const driving = !parked && (phase === "fsd" || gear === "D" || gear === "N" || (phase === "disengaged" && Boolean(route)));

  return (
    <>
      <Canvas
        shadows
        dpr={[1, 1.6]}
        gl={{
          antialias: true,
          preserveDrawingBuffer: frozen,
          toneMapping: ACESFilmicToneMapping,
          toneMappingExposure: 1.12,
          outputColorSpace: SRGBColorSpace,
        }}
        camera={{ fov: 32, position: [5.2, 1.55, 6.4], near: 0.1, far: 500 }}
      >
        {driving ? <DrivingWorld /> : <ParkedStudio />}
      </Canvas>
      {parked ? <ParkedHud /> : <VizHud />}
    </>
  );
}
