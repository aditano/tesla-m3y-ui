import { useLoader } from "@react-three/fiber";
import { useCursor } from "@react-three/drei";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Box3, BoxGeometry, Group, Mesh, MeshPhysicalMaterial, Object3D, Quaternion, Vector3 } from "three";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { useVehicle } from "../state/store";
import { applyCarMaterials } from "./carMaterials";
import { HOTSPOT_PINS } from "./hotspots";
import { ParkedHotspots } from "./ParkedHotspots";
import { replaceStockWheels } from "./wheelHubs";

export const MODEL3_URL = `${import.meta.env.BASE_URL}models/tesla_model_3.glb`;
const DRACO_PATH = `${import.meta.env.BASE_URL}draco/`;

function configureGltfLoader(loader: GLTFLoader): void {
  const draco = new DRACOLoader();
  draco.setDecoderPath(DRACO_PATH);
  loader.setDRACOLoader(draco);
}

/** Model 3 overall length (m) — used to normalize the Sketchfab FBX scale. */
const MODEL3_LENGTH_M = 4.694;

function extractCar(scene: Object3D): Group {
  const source = scene.getObjectByName("Sketchfab_model") ?? scene;
  const car = source.clone(true);
  const wrapper = new Group();
  wrapper.name = "model3-fit";
  wrapper.add(car);

  wrapper.updateMatrixWorld(true);
  const box = new Box3().setFromObject(wrapper);
  const size = box.getSize(new Vector3());
  const center = box.getCenter(new Vector3());
  car.position.x -= center.x;
  car.position.z -= center.z;
  car.position.y -= box.min.y;
  const length = Math.max(size.x, size.z, 0.001);
  wrapper.scale.setScalar(MODEL3_LENGTH_M / length);
  wrapper.updateMatrixWorld(true);
  const grounded = new Box3().setFromObject(wrapper);
  wrapper.position.y -= grounded.min.y;
  wrapper.updateMatrixWorld(true);
  wrapper.traverse((obj) => {
    if (/debris|speaker/i.test(obj.name)) obj.visible = false;
  });
  replaceStockWheels(wrapper);
  addCabinBlocker(car);
  return wrapper;
}

function addCabinBlocker(car: Object3D): void {
  car.updateWorldMatrix(true, true);
  const box = new Box3().setFromObject(car);
  const worldSize = box.getSize(new Vector3());
  const worldCenter = box.getCenter(new Vector3());
  const scale = new Vector3();
  car.getWorldScale(scale);
  const cabin = new Mesh(
    new BoxGeometry(
      (worldSize.x * 0.72) / Math.max(scale.x, 1e-4),
      (worldSize.y * 0.26) / Math.max(scale.y, 1e-4),
      (worldSize.z * 0.4) / Math.max(scale.z, 1e-4),
    ),
    new MeshPhysicalMaterial({ color: "#121110", roughness: 0.95, metalness: 0 }),
  );
  cabin.name = "orig-cabin-blocker";
  car.worldToLocal(worldCenter);
  cabin.position.copy(worldCenter);
  cabin.position.y += 0.02;
  cabin.position.z -= 0.12;
  car.add(cabin);
}

function Hit({
  position,
  args,
  label,
  onToggle,
}: {
  position: [number, number, number];
  args: [number, number, number];
  label: string;
  onToggle: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);
  return (
    <mesh
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
      userData={{ hit: label }}
    >
      <boxGeometry args={args} />
      <meshStandardMaterial
        color={hovered ? "#6ea8ff" : "#ffffff"}
        transparent
        opacity={hovered ? 0.14 : 0}
        depthWrite={false}
      />
    </mesh>
  );
}

function DoorCard({
  side,
  z,
  open,
  onToggle,
}: {
  side: "L" | "R";
  z: number;
  open: boolean;
  onToggle: () => void;
}) {
  const x = side === "L" ? -0.93 : 0.93;
  const swing = open ? (side === "L" ? 0.85 : -0.85) : 0;
  return (
    <group position={[x, 0.78, z]} rotation={[0, swing, 0]}>
      <Hit
        position={[side === "L" ? -0.04 : 0.04, 0, 0]}
        args={[0.08, 0.78, 1.08]}
        label={`${side} door`}
        onToggle={onToggle}
      />
    </group>
  );
}

export function Model3({
  scale = 1,
  showHits = true,
}: {
  scale?: number;
  showHits?: boolean;
}): ReactNode {
  const gltf = useLoader(GLTFLoader, MODEL3_URL, configureGltfLoader);
  const headlights = useVehicle((s) => s.flags.headlights);
  const parked = useVehicle((s) => s.gear === "P");
  const frunk = useVehicle((s) => s.flags.frunkOpen);
  const trunk = useVehicle((s) => s.flags.trunkOpen);
  const charge = useVehicle((s) => s.flags.chargePortOpen);
  const patchFlags = useVehicle((s) => s.patchFlags);
  const lit = headlights !== "off";
  const [doors, setDoors] = useState({ fl: false, fr: false, rl: false, rr: false });

  const car = useMemo(() => extractCar(gltf.scene), [gltf.scene]);

  useEffect(() => {
    applyCarMaterials(car, lit, parked);
  }, [car, lit, parked]);

  useEffect(() => {
    const hinge = (name: string, axis: Vector3, openAngle: number, open: boolean) => {
      const node = car.getObjectByName(name);
      if (!node) return;
      if (!node.userData.baseQuat) node.userData.baseQuat = node.quaternion.clone();
      const extra = new Quaternion().setFromAxisAngle(axis, open ? openAngle : 0);
      node.quaternion.copy(node.userData.baseQuat as Quaternion).multiply(extra);
    };
    hinge("Capot", new Vector3(1, 0, 0), -0.9, frunk);
    hinge("Capot.008", new Vector3(1, 0, 0), 0.85, trunk);
  }, [car, frunk, trunk]);

  return (
    <group scale={scale}>
      <primitive object={car} />
      {showHits && parked ? <ParkedHotspots /> : null}
      {showHits ? (
        <group>
          {HOTSPOT_PINS.map((pin) => (
            <Hit
              key={pin.id}
              position={[pin.position[0], pin.position[1], pin.position[2]]}
              args={[pin.hit[0], pin.hit[1], pin.hit[2]]}
              label={pin.kicker}
              onToggle={() => {
                switch (pin.id) {
                  case "frunk":
                    patchFlags({ frunkOpen: !frunk });
                    break;
                  case "trunk":
                    patchFlags({ trunkOpen: !trunk });
                    break;
                  case "charge":
                    patchFlags({ chargePortOpen: !charge });
                    break;
                  default: {
                    const _exhaustive: never = pin.id;
                    throw new Error(`Unhandled hotspot: ${String(_exhaustive)}`);
                  }
                }
              }}
            />
          ))}
          <DoorCard
            side="L"
            z={0.42}
            open={doors.fl}
            onToggle={() => setDoors((d) => ({ ...d, fl: !d.fl }))}
          />
          <DoorCard
            side="R"
            z={0.42}
            open={doors.fr}
            onToggle={() => setDoors((d) => ({ ...d, fr: !d.fr }))}
          />
          <DoorCard
            side="L"
            z={-0.72}
            open={doors.rl}
            onToggle={() => setDoors((d) => ({ ...d, rl: !d.rl }))}
          />
          <DoorCard
            side="R"
            z={-0.72}
            open={doors.rr}
            onToggle={() => setDoors((d) => ({ ...d, rr: !d.rr }))}
          />
        </group>
      ) : null}
    </group>
  );
}

useLoader.preload(GLTFLoader, MODEL3_URL, configureGltfLoader);
