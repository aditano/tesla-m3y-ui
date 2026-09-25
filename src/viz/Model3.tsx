import { useCursor, useGLTF } from "@react-three/drei";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useVehicle } from "../state/store";
import { PAINT_NATA_RED } from "./carMaterials";
import { applyHighlandLook, fitHighland, highlandMaterials } from "./highlandRig";
import { HOTSPOT_PINS } from "./hotspots";
import { ParkedHotspots } from "./ParkedHotspots";

/** Studio Highland GLB (meshopt + external textures). Not the David_Holiday remesh. */
export const MODEL3_URL = `${import.meta.env.BASE_URL}models/highland/model.glb`;

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
  const gltf = useGLTF(MODEL3_URL, false, true);
  const headlights = useVehicle((s) => s.flags.headlights);
  const parked = useVehicle((s) => s.gear === "P");
  const frunk = useVehicle((s) => s.flags.frunkOpen);
  const trunk = useVehicle((s) => s.flags.trunkOpen);
  const charge = useVehicle((s) => s.flags.chargePortOpen);
  const patchFlags = useVehicle((s) => s.patchFlags);
  const lit = headlights !== "off";
  const [doors, setDoors] = useState({ fl: false, fr: false, rl: false, rr: false });

  // Highland is a fused shell. Wheels, cabin, and glass are already in the GLB,
  // so the David_Holiday aero-wheel swap, cabin blocker, and greenhouse split stay off.
  const car = useMemo(() => fitHighland(gltf.scene), [gltf.scene]);

  useEffect(() => {
    const materials = highlandMaterials(car);
    if (!materials) return;
    applyHighlandLook(materials, {
      paintHex: parked ? PAINT_NATA_RED : "#e1252e",
      lit,
      parked,
    });
  }, [car, lit, parked]);

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

useGLTF.preload(MODEL3_URL, false, true);
