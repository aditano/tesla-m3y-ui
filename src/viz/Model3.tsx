import { RoundedBox } from "@react-three/drei";
import { useVehicle } from "../state/store";

export function Model3({ scale = 1 }: { scale?: number }) {
  const headlights = useVehicle((s) => s.flags.headlights);
  const parked = useVehicle((s) => s.gear === "P");
  const frunk = useVehicle((s) => s.flags.frunkOpen);
  const trunk = useVehicle((s) => s.flags.trunkOpen);
  const patchFlags = useVehicle((s) => s.patchFlags);
  const lit = headlights !== "off";
  const paint = "#d7dce4";

  return (
    <group scale={scale}>
      <group position={[0, 0, 0]}>
        <RoundedBox args={[1.86, 0.32, 4.55]} radius={0.08} smoothness={4} position={[0, 0.58, 0.05]} castShadow receiveShadow>
          <meshStandardMaterial color={paint} metalness={0.82} roughness={0.22} />
        </RoundedBox>
        <mesh position={[0, 0.62, 1.35]} rotation={[-0.18, 0, 0]} castShadow>
          <boxGeometry args={[1.78, 0.16, 1.35]} />
          <meshStandardMaterial color={paint} metalness={0.84} roughness={0.2} />
        </mesh>
        <mesh
          position={[0, 0.68, 1.95]}
          rotation={[frunk ? -0.7 : -0.08, 0, 0]}
          onClick={(e) => {
            e.stopPropagation();
            patchFlags({ frunkOpen: !frunk });
          }}
        >
          <boxGeometry args={[1.74, 0.06, 0.7]} />
          <meshStandardMaterial color={paint} metalness={0.85} roughness={0.18} />
        </mesh>
        <mesh position={[0, 0.92, -0.15]} castShadow>
          <boxGeometry args={[1.58, 0.42, 1.85]} />
          <meshPhysicalMaterial
            color="#8aa0b5"
            metalness={0.15}
            roughness={0.06}
            transparent
            opacity={0.72}
            transmission={0.15}
          />
        </mesh>
        <mesh position={[0, 0.78, -1.35]} rotation={[0.42, 0, 0]} castShadow>
          <boxGeometry args={[1.62, 0.28, 1.15]} />
          <meshStandardMaterial color={paint} metalness={0.8} roughness={0.24} />
        </mesh>
        <mesh
          position={[0, 0.7, -2.12]}
          rotation={[trunk ? 0.85 : 0.2, 0, 0]}
          onClick={(e) => {
            e.stopPropagation();
            patchFlags({ trunkOpen: !trunk });
          }}
        >
          <boxGeometry args={[1.7, 0.08, 0.55]} />
          <meshStandardMaterial color={paint} metalness={0.82} roughness={0.22} />
        </mesh>
        <mesh position={[0, 0.42, 2.28]}>
          <boxGeometry args={[1.46, 0.05, 0.07]} />
          <meshStandardMaterial
            color={lit ? "#f7fbff" : "#c5ced8"}
            emissive={lit ? "#e8f6ff" : "#000"}
            emissiveIntensity={lit ? 4 : 0}
          />
        </mesh>
        <mesh position={[0, 0.52, -2.28]}>
          <boxGeometry args={[1.4, 0.06, 0.06]} />
          <meshStandardMaterial
            color="#7a1212"
            emissive={parked ? "#ff3030" : "#5a0000"}
            emissiveIntensity={parked ? 2.2 : 0.35}
          />
        </mesh>
        <mesh position={[-0.95, 0.78, 0.42]}>
          <boxGeometry args={[0.07, 0.16, 0.26]} />
          <meshStandardMaterial color={paint} metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0.95, 0.78, 0.42]}>
          <boxGeometry args={[0.07, 0.16, 0.26]} />
          <meshStandardMaterial color={paint} metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
      <Wheel x={-0.88} z={1.38} />
      <Wheel x={0.88} z={1.38} />
      <Wheel x={-0.88} z={-1.42} />
      <Wheel x={0.88} z={-1.42} />
    </group>
  );
}

function Wheel({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0.33, z]} rotation={[0, 0, Math.PI / 2]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.33, 0.33, 0.26, 28]} />
        <meshStandardMaterial color="#111114" roughness={0.65} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.21, 0.21, 0.28, 18]} />
        <meshStandardMaterial color="#c9ced6" metalness={0.9} roughness={0.18} />
      </mesh>
    </group>
  );
}
