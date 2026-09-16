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
import { ACESFilmicToneMapping, CanvasTexture, SRGBColorSpace, Vector3 } from "three";
import { useVehicle } from "../state/store";
import { lngLatToLocal } from "../geo/polyline";
import { Model3 } from "./Model3";
import { LaneMarks, RoadRibbon, SignalProps, TrafficPack, headingQuat, toWorld } from "./RoadKit";
import { isParkedFullscreen } from "./layout";
import { PARKED_STUDIO } from "./parkedStudio";

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
  const g = ctx.createRadialGradient(256, 256, 22, 256, 256, 248);
  g.addColorStop(0, "#c4c7cd");
  g.addColorStop(0.2, "#e2e4e8");
  g.addColorStop(0.52, "#eef0f3");
  g.addColorStop(1, "#f3f4f6");
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
  const { camera, car, shadow, floor, background } = PARKED_STUDIO;
  return (
    <>
      <color attach="background" args={[background]} />
      <fog attach="fog" args={[background, 22, 48]} />
      <PerspectiveCamera
        makeDefault
        fov={camera.fov}
        position={[...camera.position]}
        near={camera.near}
        far={camera.far}
      />
      <ambientLight intensity={0.28} />
      <hemisphereLight args={["#f7f8fa", "#c9ccd2", 0.22]} />
      <directionalLight position={[2.8, 6.6, -3.2]} intensity={0.34} color="#f6f5f2" />
      <Environment
        frames={PARKED_STUDIO.envFrames}
        resolution={PARKED_STUDIO.envResolution}
        environmentIntensity={PARKED_STUDIO.envIntensity}
      >
        <Lightformer
          form="rect"
          intensity={1.4}
          color="#ffffff"
          position={[0, 9.2, 0]}
          scale={[20, 20, 1]}
          rotation={[Math.PI / 2, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={10.2}
          color="#ffffff"
          position={[3.35, 5.7, -2.55]}
          scale={[0.15, 7.6, 1]}
          target={[0.18, 0.92, -1.12]}
        />
        <Lightformer
          form="rect"
          intensity={3.6}
          color="#f3f5f8"
          position={[2.6, 6.2, 1.35]}
          scale={[0.13, 5.1, 1]}
          target={[0, 0.72, 0.15]}
        />
        <Lightformer form="rect" intensity={0.82} color="#f1f2f5" position={[0, 2.3, -9]} scale={[14, 8, 1]} />
        <Lightformer form="rect" intensity={0.48} color="#eceef2" position={[0, 2.1, 9]} scale={[14, 7, 1]} />
        <Lightformer form="rect" intensity={0.36} color="#e7edf2" position={[9, 2.5, 0]} scale={[14, 8, 1]} />
        <Lightformer form="rect" intensity={0.28} color="#e4e7ec" position={[-9, 2.3, 0]} scale={[14, 8, 1]} />
        <Lightformer
          form="rect"
          intensity={0.26}
          color="#d8dce2"
          position={[0, -0.15, 0]}
          scale={[16, 16, 1]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
      </Environment>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshPhysicalMaterial
          map={floorMap}
          color="#eef0f3"
          roughness={floor.roughness}
          metalness={floor.metalness}
          envMapIntensity={floor.envMapIntensity}
          clearcoat={floor.clearcoat}
          clearcoatRoughness={floor.clearcoatRoughness}
        />
      </mesh>
      <group
        rotation={gear === "R" ? [0, Math.PI, 0] : [0, car.rotationY, 0]}
        position={[...car.position]}
      >
        <Model3 scale={car.scale} />
      </group>
      <ContactShadows
        opacity={shadow.opacity}
        scale={[...shadow.scale]}
        blur={shadow.blur}
        far={shadow.far}
        resolution={shadow.resolution}
        color={shadow.color}
        frames={shadow.frames}
      />
      <OrbitControls
        enablePan={false}
        minDistance={camera.minDistance}
        maxDistance={camera.maxDistance}
        autoRotate={false}
        minPolarAngle={camera.minPolar}
        maxPolarAngle={camera.maxPolar}
        target={[...camera.target]}
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
        dpr={[1, 1.6]}
        gl={{
          antialias: true,
          preserveDrawingBuffer: frozen,
          toneMapping: ACESFilmicToneMapping,
          toneMappingExposure: parked ? 1.02 : 1.08,
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
