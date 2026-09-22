import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import { useLayoutEffect, useMemo, useRef } from "react";
import { ACESFilmicToneMapping, CanvasTexture, PMREMGenerator, RectAreaLight, SRGBColorSpace, Vector3 } from "three";
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js";
import { useVehicle } from "../state/store";
import { Model3 } from "./Model3";
import { powerNorm } from "./driveHud";
import { EgoCar, EgoFrame, RouteRoad, SignalProps, TrafficPack } from "./RoadKit";
import { isParkedFullscreen } from "./layout";
import { createCandyStudioEnv, PARKED_STUDIO } from "./parkedStudio";

RectAreaLightUniformsLib.init();

const WORLD = "#7b858f";

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

function ParkedEnvironment() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useLayoutEffect(() => {
    const source = createCandyStudioEnv();
    const pmrem = new PMREMGenerator(gl);
    pmrem.compileEquirectangularShader();
    const rt = pmrem.fromEquirectangular(source);
    scene.environment = rt.texture;
    scene.environmentIntensity = PARKED_STUDIO.envIntensity;
    source.dispose();
    return () => {
      if (scene.environment === rt.texture) scene.environment = null;
      rt.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

function lookAtPoint(light: RectAreaLight | null, x: number, y: number, z: number): void {
  if (light) light.lookAt(x, y, z);
}

function CPillarKeys() {
  const pillar = useRef<RectAreaLight>(null);
  const shoulder = useRef<RectAreaLight>(null);
  const bounce = useRef<RectAreaLight>(null);
  useLayoutEffect(() => {
    lookAtPoint(pillar.current, 0.48, 0.94, -1.1);
    lookAtPoint(shoulder.current, 0.1, 0.82, -0.2);
    lookAtPoint(bounce.current, 0, 0.4, 0);
  }, []);
  return (
    <>
      <rectAreaLight
        ref={pillar}
        width={0.045}
        height={2.85}
        intensity={78}
        color="#ffffff"
        position={[2.05, 1.58, -0.55]}
      />
      <rectAreaLight
        ref={shoulder}
        width={3.6}
        height={0.07}
        intensity={16}
        color="#f7f8fa"
        position={[0.15, 3.35, -0.35]}
      />
      <rectAreaLight
        ref={bounce}
        width={6}
        height={4}
        intensity={2.1}
        color="#e8edf2"
        position={[-2.8, 1.8, 2.2]}
      />
    </>
  );
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
      <ambientLight intensity={0.36} />
      <hemisphereLight args={["#f7f8fa", "#c9ccd2", 0.24]} />
      <directionalLight position={[3.2, 6.8, -3.4]} intensity={0.28} color="#f6f5f2" />
      <CPillarKeys />
      <ParkedEnvironment />
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

const CAM_POS = new Vector3(0, 6.15, -10.4);
const CAM_LOOK = new Vector3(0, 0.45, 16);

/** Chase camera for the driving world; snaps immediately when frozen for QA stills. */
function EgoCamera() {
  const snapped = useRef(false);
  useFrame(({ camera }) => {
    const frozen = useVehicle.getState().qa.frozen;
    if (!snapped.current || frozen) {
      camera.position.copy(CAM_POS);
      snapped.current = true;
    } else {
      camera.position.lerp(CAM_POS, 0.2);
    }
    camera.lookAt(CAM_LOOK);
  });
  return null;
}

function DrivingWorld() {
  const route = useVehicle((s) => s.route);
  const phase = useVehicle((s) => s.phase);
  const fsd = phase === "fsd";

  return (
    <>
      <color attach="background" args={[WORLD]} />
      <fog attach="fog" args={[WORLD, 90, 240]} />
      <EgoCamera />
      <hemisphereLight args={["#e7edf4", "#5c6672", 0.85]} />
      <ambientLight intensity={0.62} />
      <directionalLight position={[10, 18, 6]} intensity={0.85} castShadow={false} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 20]} receiveShadow>
        <circleGeometry args={[360, 48]} />
        <meshStandardMaterial color={WORLD} roughness={1} />
      </mesh>
      {route ? (
        <EgoFrame>
          <RouteRoad route={route} />
          {fsd ? <TrafficPack route={route} /> : null}
          <SignalProps route={route} />
        </EgoFrame>
      ) : null}
      <EgoCar />
    </>
  );
}

function VizHud() {
  const pose = useVehicle((s) => s.pose);
  const phase = useVehicle((s) => s.phase);
  const follow = useVehicle((s) => s.flags.followingDistance);
  const driving = phase === "fsd" || phase === "disengaged" || pose.speedMph > 0.4;
  const sample = useRef({ speed: pose.speedMph, time: 0, norm: powerNorm(pose.speedMph, pose.speedMph, 0) });
  const now = performance.now();
  const dt = sample.current.time === 0 ? 0 : (now - sample.current.time) / 1000;
  const norm = powerNorm(sample.current.speed, pose.speedMph, dt);
  sample.current = { speed: pose.speedMph, time: now, norm };

  if (!driving) return null;

  const up = Math.max(0, norm);
  const down = Math.max(0, -norm);
  const status = phase === "fsd" ? "Self-Driving" : phase === "disengaged" ? "Disengaged" : "mph";

  return (
    <div className="hud">
      <div className="hud-cluster">
        <div className="power-meter" aria-hidden="true">
          <i className="power-up" style={{ height: `${up * 50}%` }} />
          <i className="power-down" style={{ height: `${down * 50}%` }} />
          <i className="power-zero" />
        </div>
        <div className="hud-speed" aria-label={`${Math.round(pose.speedMph)} miles per hour`}>
          <div className="mph">{Math.round(pose.speedMph)}</div>
          <div className={phase === "fsd" ? "label" : "label muted"}>{status}</div>
        </div>
      </div>
      <div className="road-badges">
        <div className="speed-limit" title="Speed limit">
          {Math.round(pose.speedLimitMph)}
        </div>
        {phase === "fsd" ? (
          <div className="set-speed-stack">
            <div className="set-speed" title="Set speed">
              {Math.round(pose.setSpeedMph)}
            </div>
            <div className="follow-pips" title="Following distance">
              {Array.from({ length: 7 }, (_, i) => (
                <i key={i} className={i < follow ? "on" : ""} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
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
          failIfMajorPerformanceCaveat: false,
          toneMapping: ACESFilmicToneMapping,
          toneMappingExposure: parked ? 1.02 : 1.08,
          outputColorSpace: SRGBColorSpace,
        }}
        camera={{ fov: 36, position: [0, 6.15, -10.4], near: 0.1, far: 500 }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener("webglcontextlost", (event) => {
            event.preventDefault();
          });
        }}
      >
        {driving ? <DrivingWorld /> : <ParkedStudio />}
      </Canvas>
      {parked ? null : <VizHud />}
    </>
  );
}
