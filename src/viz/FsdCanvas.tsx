import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls } from "@react-three/drei";
import { useMemo, useRef } from "react";
import type { Group } from "three";
import { Vector3 } from "three";
import { useVehicle } from "../state/store";
import { lngLatToLocal } from "../geo/polyline";
import { Model3 } from "./Model3";
import { LaneMarks, RoadRibbon, SignalProps, TrafficPack, headingQuat, toWorld } from "./RoadKit";

function ParkedStudio() {
  const gear = useVehicle((s) => s.gear);
  return (
    <>
      <color attach="background" args={["#07080c"]} />
      <ambientLight intensity={0.35} />
      <spotLight position={[6, 10, 4]} angle={0.45} penumbra={0.8} intensity={90} castShadow />
      <directionalLight position={[-6, 8, -4]} intensity={1.4} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[18, 48]} />
        <meshStandardMaterial color="#101218" roughness={0.85} />
      </mesh>
      <group rotation={gear === "R" ? [0, Math.PI, 0] : [0, 0.35, 0]} position={[0, 0, 0]}>
        <Model3 scale={1.15} />
      </group>
      <ContactShadows opacity={0.45} scale={18} blur={2.2} far={8} />
      <Environment preset="night" />
      <OrbitControls
        enablePan={false}
        minDistance={5}
        maxDistance={14}
        autoRotate
        autoRotateSpeed={0.6}
        maxPolarAngle={Math.PI / 2.05}
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
    const back = 13.5;
    const height = 5.8;
    const camPos = new Vector3(
      loc.x - Math.sin(h) * back,
      height,
      loc.z - Math.cos(h) * back,
    );
    const look = new Vector3(loc.x + Math.sin(h) * 22, 0.4, loc.z + Math.cos(h) * 22);
    camera.position.lerp(camPos, 0.12);
    camera.lookAt(look);
  });

  const carPos = toWorld([pose.lng, pose.lat], origin);
  const fsd = phase === "fsd";

  if (!route) {
    return (
      <>
        <color attach="background" args={["#05070b"]} />
        <fog attach="fog" args={["#05070b", 30, 140]} />
        <ambientLight intensity={0.4} />
        <Model3 />
      </>
    );
  }

  return (
    <>
      <color attach="background" args={["#05070b"]} />
      <fog attach="fog" args={["#05070b", 28, 160]} />
      <ambientLight intensity={0.42} />
      <directionalLight position={[8, 18, 6]} intensity={1.6} castShadow />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[carPos.x, 0, carPos.z]} receiveShadow>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#0b0d12" />
      </mesh>
      <RoadRibbon route={route} origin={origin} />
      <LaneMarks route={route} origin={origin} fsd={fsd} />
      <TrafficPack route={route} origin={origin} traveledM={pose.traveledM} />
      <SignalProps maneuvers={route.maneuvers} origin={origin} />
      <group ref={cam} position={[carPos.x, 0, carPos.z]} rotation={headingQuat(pose.heading)}>
        <Model3 />
      </group>
    </>
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
  const driving = phase === "fsd" || gear === "D" || gear === "N";

  return (
    <>
      <Canvas
        shadows
        dpr={[1, 1.6]}
        camera={{ fov: 42, position: [5.4, 2.8, 7.2], near: 0.1, far: 400 }}
      >
        {driving ? <DrivingWorld /> : <ParkedStudio />}
      </Canvas>
      <VizHud />
    </>
  );
}
