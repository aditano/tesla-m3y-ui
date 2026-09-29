import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { useLayoutEffect, useMemo, useRef } from "react";
import {
  ACESFilmicToneMapping,
  BackSide,
  CanvasTexture,
  PMREMGenerator,
  RectAreaLight,
  SRGBColorSpace,
  Vector3,
} from "three";
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js";
import { useVehicle } from "../state/store";
import { Model3 } from "./Model3";
import { DRIVE_CHASE, DRIVE_FOG, DRIVE_WORLD } from "./driveScene";
import { METER_SEGMENTS, meterSegments, powerNorm } from "./driveHud";
import { RoadsidePack } from "./occupancy";
import { CityBlocks, EgoCar, EgoFrame, RouteRoad, SignalProps, TrafficPack } from "./RoadKit";
import { isParkedFullscreen } from "./layout";
import { createDriveEnv, createStudioEnv, studioFor, type StudioTheme } from "./parkedStudio";
import { SoftShadow } from "./SoftShadow";

RectAreaLightUniformsLib.init();

const CAM_POS = new Vector3(...DRIVE_CHASE.position);
const CAM_LOOK = new Vector3(...DRIVE_CHASE.look);

function studioFloorMap(theme: StudioTheme): CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext("2d");
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  if (!ctx) return tex;
  const g = ctx.createRadialGradient(256, 256, 40, 256, 256, 250);
  if (theme === "dark") {
    g.addColorStop(0, "#16191e");
    g.addColorStop(1, "#121418");
  } else {
    g.addColorStop(0, "#e4e7ec");
    g.addColorStop(1, "#e7eaee");
  }
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 512);
  tex.needsUpdate = true;
  return tex;
}

function Ibl({ theme }: { theme: StudioTheme | "drive" }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useLayoutEffect(() => {
    const source = theme === "drive" ? createDriveEnv() : createStudioEnv(theme);
    const pmrem = new PMREMGenerator(gl);
    pmrem.compileEquirectangularShader();
    const rt = pmrem.fromEquirectangular(source);
    scene.environment = rt.texture;
    scene.environmentIntensity = theme === "drive" ? 0.65 : studioFor(theme).envIntensity;
    source.dispose();
    return () => {
      if (scene.environment === rt.texture) scene.environment = null;
      rt.dispose();
      pmrem.dispose();
    };
  }, [gl, scene, theme]);
  return null;
}

function skyMap(): CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 8;
  c.height = 256;
  const ctx = c.getContext("2d");
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  if (!ctx) return tex;
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, "#2a313c");
  g.addColorStop(0.42, "#232830");
  g.addColorStop(0.7, DRIVE_WORLD);
  g.addColorStop(1, "#161a20");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 8, 256);
  tex.needsUpdate = true;
  return tex;
}

function SkyDome() {
  const map = useMemo(() => skyMap(), []);
  return (
    <mesh frustumCulled={false} renderOrder={-1}>
      <sphereGeometry args={[280, 28, 18]} />
      <meshBasicMaterial map={map} side={BackSide} fog={false} depthWrite={false} />
    </mesh>
  );
}

function lookAtPoint(light: RectAreaLight | null, x: number, y: number, z: number): void {
  if (light) light.lookAt(x, y, z);
}

function StudioKeys({ theme }: { theme: StudioTheme }) {
  const key = useRef<RectAreaLight>(null);
  const rim = useRef<RectAreaLight>(null);
  const fill = useRef<RectAreaLight>(null);
  const dark = theme === "dark";
  useLayoutEffect(() => {
    lookAtPoint(key.current, 0.2, 0.8, 0.1);
    lookAtPoint(rim.current, 0, 0.9, -0.4);
    lookAtPoint(fill.current, 0, 0.4, 0);
  }, [theme]);
  return (
    <>
      <rectAreaLight
        ref={key}
        width={5.2}
        height={2.6}
        intensity={dark ? 4.5 : 7}
        color={dark ? "#f2f5f8" : "#ffffff"}
        position={[2.6, 4.4, -2.8]}
      />
      <rectAreaLight
        ref={rim}
        width={3.4}
        height={1.8}
        intensity={dark ? 8 : 3.2}
        color={dark ? "#c5d4ea" : "#f7f8fb"}
        position={[-3.1, 2.6, 3.4]}
      />
      <rectAreaLight
        ref={fill}
        width={6}
        height={3}
        intensity={dark ? 1.1 : 1.6}
        color={dark ? "#1c2430" : "#e7ecf2"}
        position={[-1.2, 1.4, 3.2]}
      />
    </>
  );
}

function ParkedStudio() {
  const gear = useVehicle((s) => s.gear);
  const appearance = useVehicle((s) => s.flags.appearance);
  const theme: StudioTheme = appearance === "dark" ? "dark" : "light";
  const floorMap = useMemo(() => studioFloorMap(theme), [theme]);
  const { camera, car, shadow, floor, background, fog } = studioFor(theme);
  const dark = theme === "dark";
  return (
    <>
      <Grade exposure={dark ? 1.12 : 1.02} />
      <color attach="background" args={[background]} />
      <fog attach="fog" args={[fog.color, fog.near, fog.far]} />
      <PerspectiveCamera
        makeDefault
        fov={camera.fov}
        position={[...camera.position]}
        near={camera.near}
        far={camera.far}
      />
      <ambientLight intensity={dark ? 0.08 : 0.2} />
      <hemisphereLight args={[dark ? "#243040" : "#f7f8fa", dark ? "#0c0e12" : "#c5ccd4", dark ? 0.28 : 0.42]} />
      <directionalLight position={[3.2, 8.5, -2.2]} intensity={dark ? 0.35 : 0.48} color="#f4f7fb" />
      <StudioKeys theme={theme} />
      <Ibl theme={theme} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[240, 240]} />
        <meshPhysicalMaterial
          map={floorMap}
          color={floor.color}
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
        <SoftShadow width={shadow.scale[0]} length={shadow.scale[1]} opacity={shadow.opacity} color={shadow.color} />
      </group>
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

/** ACES for the car. Road ribbons opt out with toneMapped={false} so the gray stays put. */
function Grade({ exposure }: { exposure: number }) {
  const gl = useThree((s) => s.gl);
  useLayoutEffect(() => {
    const prevMapping = gl.toneMapping;
    const prevExposure = gl.toneMappingExposure;
    gl.toneMapping = ACESFilmicToneMapping;
    gl.toneMappingExposure = exposure;
    gl.shadowMap.enabled = false;
    return () => {
      gl.toneMapping = prevMapping;
      gl.toneMappingExposure = prevExposure;
    };
  }, [gl, exposure]);
  return null;
}

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
      <Grade exposure={1.08} />
      <color attach="background" args={[DRIVE_WORLD]} />
      <fog attach="fog" args={[DRIVE_FOG.color, DRIVE_FOG.near, DRIVE_FOG.far]} />
      <SkyDome />
      <EgoCamera />
      <Ibl theme="drive" />
      <hemisphereLight args={["#9aa8b8", "#1a1e24", 0.35]} />
      <ambientLight intensity={0.18} />
      <directionalLight position={[2, 10, 6]} intensity={1.15} color="#f4f7fb" />
      <directionalLight position={[-6, 4, -4]} intensity={0.35} color="#9eb0c8" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 20]}>
        <circleGeometry args={[360, 48]} />
        <meshBasicMaterial color="#161a20" toneMapped={false} />
      </mesh>
      {route ? (
        <EgoFrame>
          <RouteRoad route={route} />
          <CityBlocks route={route} />
          {fsd ? <TrafficPack route={route} /> : null}
          {fsd ? <RoadsidePack route={route} /> : null}
          <SignalProps route={route} />
        </EgoFrame>
      ) : null}
      <EgoCar />
      <SoftShadow width={2.8} length={5.2} opacity={0.62} color="#050607" y={0.03} />
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

  const lit = meterSegments(norm);
  const power = Array.from({ length: METER_SEGMENTS }, (_, i) => METER_SEGMENTS - 1 - i);
  const regen = Array.from({ length: METER_SEGMENTS }, (_, i) => i);
  return (
    <div className="hud">
      <div className="hud-cluster">
        <div className="power-meter" aria-hidden="true" data-up={lit.up} data-down={lit.down}>
          <div className="power-side up">
            {power.map((i) => (
              <i key={i} className={i < lit.up ? "on" : ""} />
            ))}
          </div>
          <b className="power-zero" />
          <div className="power-side down">
            {regen.map((i) => (
              <i key={i} className={i < lit.down ? "on" : ""} />
            ))}
          </div>
        </div>
        <div className="hud-speed" aria-label={`${Math.round(pose.speedMph)} miles per hour`}>
          <div className="mph">{Math.round(pose.speedMph)}</div>
          <div className="label">mph</div>
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
        dpr={[1, 1.6]}
        gl={{
          antialias: true,
          preserveDrawingBuffer: frozen,
          failIfMajorPerformanceCaveat: false,
          toneMapping: ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
          outputColorSpace: SRGBColorSpace,
        }}
        camera={{ fov: DRIVE_CHASE.fov, position: [CAM_POS.x, CAM_POS.y, CAM_POS.z], near: 0.1, far: 420 }}
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
