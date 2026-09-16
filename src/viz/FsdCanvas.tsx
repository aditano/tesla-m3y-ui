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
  return (
    <>
      <color attach="background" args={["#e7ebf0"]} />
      <fog attach="fog" args={["#e7ebf0", 12, 28]} />
      <PerspectiveCamera makeDefault fov={28} position={[-6.15, 1.32, 4.85]} near={0.1} far={80} />
      <ambientLight intensity={0.62} />
      <hemisphereLight args={["#f4f7fb", "#c5ccd4", 0.85]} />
      <spotLight
        position={[-3.2, 8.2, 5.4]}
        angle={0.42}
        penumbra={0.95}
        intensity={70}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.00015}
      />
      <spotLight position={[6, 4.2, 2]} angle={0.6} penumbra={1} intensity={22} color="#dfe7f4" />
      <directionalLight position={[2.2, 7, -4]} intensity={0.7} color="#ffffff" />
      <Environment resolution={256} environmentIntensity={0.55}>
        <Lightformer intensity={8} position={[0, 7, 1]} scale={[12, 1.4, 1]} form="rect" color="#ffffff" />
        <Lightformer intensity={3} position={[-6, 2.4, 3]} scale={[5, 6, 1]} color="#cdd6e4" form="rect" />
        <Lightformer intensity={2.6} position={[7, 1.2, -1]} scale={[3, 8, 1]} form="rect" color="#eef2f7" />
        <Lightformer intensity={1.8} position={[0, 2, -8]} scale={[14, 6, 1]} color="#f7f9fc" form="rect" />
      </Environment>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[48, 48]} />
        <meshStandardMaterial color="#e7ebf0" roughness={0.92} metalness={0} />
      </mesh>
      <group rotation={gear === "R" ? [0, Math.PI, 0] : [0, -0.22, 0]} position={[0, 0, 0.08]}>
        <Model3 scale={1.12} />
      </group>
      <ContactShadows opacity={0.28} scale={16} blur={2.6} far={8} resolution={1024} color="#8b919a" />
      <OrbitControls
        enablePan={false}
        minDistance={5.1}
        maxDistance={9.2}
        autoRotate={false}
        minPolarAngle={1.18}
        maxPolarAngle={1.38}
        target={[0, 0.52, 0]}
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
      <button
        className={`parked-chip ${flags.frunkOpen ? "on" : ""}`}
        onClick={() => patchFlags({ frunkOpen: !flags.frunkOpen })}
      >
        {flags.frunkOpen ? "Frunk open" : "Open Frunk"}
      </button>
      <button
        className={`parked-chip ${flags.trunkOpen ? "on" : ""}`}
        onClick={() => patchFlags({ trunkOpen: !flags.trunkOpen })}
      >
        {flags.trunkOpen ? "Trunk open" : "Open Trunk"}
      </button>
      <button
        className={`parked-chip ${flags.chargePortOpen ? "on" : ""}`}
        onClick={() => patchFlags({ chargePortOpen: !flags.chargePortOpen })}
      >
        {flags.chargePortOpen ? "Charge port" : "Charge"}
      </button>
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
