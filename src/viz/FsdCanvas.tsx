import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Lightformer,
  MeshReflectorMaterial,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import { useMemo, useRef } from "react";
import type { Group } from "three";
import { ACESFilmicToneMapping, CanvasTexture, SRGBColorSpace, Vector3 } from "three";
import { useVehicle } from "../state/store";
import { lngLatToLocal } from "../geo/polyline";
import { Model3 } from "./Model3";
import { LaneMarks, RoadRibbon, SignalProps, TrafficPack, headingQuat, toWorld } from "./RoadKit";
import { isParkedFullscreen } from "./layout";

function studioFloorMap(): CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext("2d");
  if (!ctx) {
    const tex = new CanvasTexture(c);
    tex.colorSpace = SRGBColorSpace;
    return tex;
  }
  const g = ctx.createRadialGradient(256, 256, 12, 256, 256, 248);
  g.addColorStop(0, "#d2d5dc");
  g.addColorStop(0.38, "#e4e6eb");
  g.addColorStop(1, "#eef0f3");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 512);
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function ParkedStudio() {
  const gear = useVehicle((s) => s.gear);
  const floorMap = useMemo(() => studioFloorMap(), []);
  return (
    <>
      <color attach="background" args={["#eef0f3"]} />
      <fog attach="fog" args={["#eef0f3", 11, 26]} />
      <PerspectiveCamera makeDefault fov={30} position={[-4.28, 4.78, -4.72]} near={0.1} far={80} />
      <ambientLight intensity={0.42} />
      <hemisphereLight args={["#f4f6f8", "#c5c8ce", 0.62]} />
      {/* Soft key from above-behind so Ultra Red reads metallic, not plastic. */}
      <directionalLight position={[-2.4, 8.6, -5.2]} intensity={1.18} color="#ffffff" />
      {/* Cool fill from camera-right */}
      <directionalLight position={[5.4, 3.4, -1.2]} intensity={0.42} color="#e4eaf2" />
      {/* Rim along the far flank */}
      <directionalLight position={[1.6, 2.6, 5.8]} intensity={0.58} color="#f7f8fa" />
      <spotLight
        position={[-1.4, 9.2, -2.8]}
        angle={0.72}
        penumbra={1}
        intensity={9.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.00018}
      />
      <Environment resolution={512} environmentIntensity={0.78}>
        <Lightformer intensity={7.2} position={[0, 9, 0]} scale={[18, 2.4, 1]} form="rect" color="#ffffff" />
        <Lightformer intensity={2.1} position={[-8, 3.2, -2]} scale={[5, 9, 1]} color="#e8ecf2" form="rect" />
        <Lightformer intensity={1.7} position={[8, 2.4, 1]} scale={[4, 10, 1]} form="rect" color="#f3f5f8" />
        <Lightformer intensity={1.35} position={[0, 2.6, 8]} scale={[16, 5, 1]} color="#f7f8fa" form="rect" />
      </Environment>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[42, 42]} />
        <meshBasicMaterial color="#eef0f3" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[16, 16]} />
        <MeshReflectorMaterial
          blur={[280, 50]}
          resolution={384}
          mixBlur={1}
          mixStrength={0.2}
          roughness={0.86}
          metalness={0.16}
          color="#e2e4e9"
          mirror={0.12}
          map={floorMap}
        />
      </mesh>
      <group rotation={gear === "R" ? [0, Math.PI, 0] : [0, -0.36, 0]} position={[0.06, 0, 0.18]}>
        <Model3 scale={1.34} />
      </group>
      <ContactShadows opacity={0.28} scale={16} blur={2.55} far={8} resolution={1024} color="#7a7578" />
      <OrbitControls
        enablePan={false}
        minDistance={5.8}
        maxDistance={9.4}
        autoRotate={false}
        minPolarAngle={0.92}
        maxPolarAngle={1.12}
        target={[0.02, 0.36, -0.18]}
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
        dpr={[1, 1.75]}
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
      {parked ? null : <VizHud />}
    </>
  );
}
