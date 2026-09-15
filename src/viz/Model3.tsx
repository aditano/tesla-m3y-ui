import { useMemo } from "react";
import { useVehicle } from "../state/store";

export function Model3({
  scale = 1,
}: {
  scale?: number;
}) {
  const headlights = useVehicle((s) => s.flags.headlights);
  const brake = useVehicle((s) => s.phase !== "fsd" && s.gear === "P");
  const frunk = useVehicle((s) => s.flags.frunkOpen);
  const trunk = useVehicle((s) => s.flags.trunkOpen);
  const patchFlags = useVehicle((s) => s.patchFlags);
  const lit = headlights !== "off";
  const body = useMemo(() => "#d5dae2", []);

  return (
    <group scale={scale}>
      <group position={[0, 0.32, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.86, 0.38, 4.62]} />
          <meshStandardMaterial color={body} metalness={0.78} roughness={0.24} />
        </mesh>
        <mesh position={[0, 0.28, -0.12]} castShadow>
          <boxGeometry args={[1.78, 0.28, 3.1]} />
          <meshStandardMaterial color={body} metalness={0.74} roughness={0.26} />
        </mesh>
        <mesh position={[0, 0.52, -0.18]} castShadow>
          <boxGeometry args={[1.62, 0.42, 2.05]} />
          <meshPhysicalMaterial
            color="#9eb4c8"
            metalness={0.1}
            roughness={0.08}
            transmission={0.35}
            transparent
            opacity={0.92}
          />
        </mesh>
        <mesh position={[0, 0.18, 2.18]} rotation={[frunk ? -0.55 : 0, 0, 0]} onClick={(e) => {
          e.stopPropagation();
          patchFlags({ frunkOpen: !frunk });
        }}>
          <boxGeometry args={[1.78, 0.08, 0.7]} />
          <meshStandardMaterial color={body} metalness={0.8} roughness={0.22} />
        </mesh>
        <mesh
          position={[0, 0.32, -2.22]}
          rotation={[trunk ? 0.7 : 0, 0, 0]}
          onClick={(e) => {
            e.stopPropagation();
            patchFlags({ trunkOpen: !trunk });
          }}
        >
          <boxGeometry args={[1.76, 0.1, 0.62]} />
          <meshStandardMaterial color={body} metalness={0.8} roughness={0.22} />
        </mesh>
        <mesh position={[0, 0.08, 2.34]}>
          <boxGeometry args={[1.52, 0.06, 0.08]} />
          <meshStandardMaterial
            color={lit ? "#f4fbff" : "#cfd8e3"}
            emissive={lit ? "#d9f1ff" : "#000"}
            emissiveIntensity={lit ? 3.2 : 0}
          />
        </mesh>
        <mesh position={[0, 0.22, -2.34]}>
          <boxGeometry args={[1.5, 0.07, 0.07]} />
          <meshStandardMaterial
            color="#8b1515"
            emissive={brake ? "#ff2a2a" : "#4a0000"}
            emissiveIntensity={brake ? 2.4 : 0.4}
          />
        </mesh>
        <mesh position={[-0.98, 0.42, 0.55]}>
          <boxGeometry args={[0.08, 0.18, 0.28]} />
          <meshStandardMaterial color={body} metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0.98, 0.42, 0.55]}>
          <boxGeometry args={[0.08, 0.18, 0.28]} />
          <meshStandardMaterial color={body} metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
      <Wheel x={-0.78} z={1.42} />
      <Wheel x={0.78} z={1.42} />
      <Wheel x={-0.78} z={-1.48} />
      <Wheel x={0.78} z={-1.48} />
    </group>
  );
}

function Wheel({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0.34, z]} rotation={[0, 0, Math.PI / 2]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.34, 0.34, 0.28, 24]} />
        <meshStandardMaterial color="#111" roughness={0.7} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.2, 0.2, 0.3, 16]} />
        <meshStandardMaterial color="#c5c9d1" metalness={0.85} roughness={0.2} />
      </mesh>
    </group>
  );
}
