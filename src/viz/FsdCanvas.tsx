import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Lightformer,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import { useMemo, useRef } from "react";
import type { Group } from "three";
import { ACESFilmicToneMapping, SRGBColorSpace, Vector3 } from "three";
import { useVehicle } from "../state/store";
import { lngLatToLocal } from "../geo/polyline";
import { Model3 } from "./Model3";
import { LaneMarks, RoadRibbon, SignalProps, TrafficPack, headingQuat, toWorld } from "./RoadKit";
import { isParkedFullscreen } from "./layout";

function ParkedStudio() {
  const gear = useVehicle((s) => s.gear);
  const frozen = useVehicle((s) => s.qa.frozen);
  return (
    <>
      <color attach="background" args={["#07080c"]} />
      <fog attach="fog" args={["#07080c", 10, 26]} />
      <PerspectiveCamera makeDefault fov={30} position={[5.15, 1.42, 6.35]} near={0.1} far={80} />
      <ambientLight intensity={0.18} />
      <hemisphereLight args={["#8ea0b8", "#08090d", 0.38]} />
      <spotLight
        position={[4.2, 7.4, 5.2]}
        angle={0.38}
        penumbra={0.92}
        intensity={90}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0002}
      />
      <spotLight position={[-5.2, 4.8, 2.4]} angle={0.55} penumbra={1} intensity={28} color="#9bb4d4" />
      <directionalLight position={[0.6, 6.5, -5.5]} intensity={0.55} color="#d5deea" />
      <Environment resolution={256} environmentIntensity={0.32}>
        <Lightformer intensity={5.5} position={[0, 6, 2]} scale={[9, 1.15, 1]} form="rect" />
        <Lightformer intensity={2.4} position={[-5, 2.2, 1]} scale={[4, 5, 1]} color="#8aa4c8" form="rect" />
        <Lightformer intensity={3.2} position={[6, 1.4, -1.5]} scale={[2.4, 7, 1]} form="rect" />
        <Lightformer intensity={1.4} position={[0, 2.8, -7]} scale={[12, 5, 1]} color="#c5d0e0" form="rect" />
      </Environment>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[22, 72]} />
        <meshStandardMaterial color="#0a0b10" roughness={0.88} metalness={0.18} />
      </mesh>
      <group rotation={gear === "R" ? [0, Math.PI, 0] : [0, 0.52, 0]} position={[0, 0, 0.15]}>
        <Model3 scale={1.05} />
      </group>
      <ContactShadows opacity={0.62} scale={18} blur={2.6} far={9} resolution={1024} color="#000" />
      <OrbitControls
        enablePan={false}
        minDistance={5.6}
        maxDistance={10.5}
        autoRotate={!frozen}
        autoRotateSpeed={0.28}
        minPolarAngle={0.92}
        maxPolarAngle={1.22}
        target={[0, 0.58, 0]}
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

function OpenCallout({ label }: { label: string }) {
  return <span className="parked-chip">{label}</span>;
}

function ParkedHud() {
  const flags = useVehicle((s) => s.flags);
  const items = [
    flags.frunkOpen ? "Frunk" : null,
    flags.trunkOpen ? "Trunk" : null,
    flags.chargePortOpen ? "Charge port" : null,
  ].filter((v): v is string => Boolean(v));
  if (!items.length) return null;
  return (
    <div className="parked-callouts">
      {items.map((label) => (
        <OpenCallout key={label} label={label} />
      ))}
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
  const parked = isParkedFullscreen(gear, phase);
  const driving = !parked && (phase === "fsd" || gear === "D" || gear === "N" || (phase === "disengaged" && Boolean(route)));

  return (
    <>
      <Canvas
        shadows
        dpr={[1, 1.6]}
        gl={{
          antialias: true,
          toneMapping: ACESFilmicToneMapping,
          toneMappingExposure: 1.08,
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
