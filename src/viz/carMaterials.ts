import { Color, Mesh, MeshPhysicalMaterial, MeshStandardMaterial, Object3D } from "three";

export type CarMaterialKind =
  | "paint"
  | "chrome"
  | "glass"
  | "headlight"
  | "tail"
  | "rubber"
  | "plastic"
  | "caliper"
  | "interior"
  | "rim"
  | "other";

const PAINT = new Color("#2a2d33");
const CHROME = new Color("#c5ccd6");
const RUBBER = new Color("#111114");
const PLASTIC = new Color("#1a1b1e");
const GLASS = new Color("#8aa0b8");
const CALIPER = new Color("#b10e1e");
const INTERIOR = new Color("#16171a");

export function classifyCarMaterial(name: string): CarMaterialKind {
  const n = name.toLowerCase().replace(/\s+/g, "_");
  if (n.includes("car") && n.includes("paint")) return "paint";
  if (n.includes("chrome")) return "chrome";
  if (n.includes("glass") || n === "material.017") return "glass";
  if (n.includes("led") || n.includes("phare")) return "headlight";
  if (n === "material.007" || n === "material.002") return "tail";
  if (n === "material.014") return "caliper";
  if (n === "material.009") return "rubber";
  if (n === "material.011" || n === "material.012" || n === "material.003" || n === "material.004") {
    return "rim";
  }
  if (
    n.includes("plastic") ||
    n === "material.001" ||
    n === "material.008" ||
    n === "material.016" ||
    n === "material.010" ||
    n === "material.013"
  ) {
    return "plastic";
  }
  if (n === "material.015") return "interior";
  return "other";
}

function physical(kind: CarMaterialKind, lit: boolean, parked: boolean): MeshPhysicalMaterial {
  switch (kind) {
    case "paint":
      return new MeshPhysicalMaterial({
        color: PAINT,
        metalness: 0.86,
        roughness: 0.28,
        clearcoat: 1,
        clearcoatRoughness: 0.06,
        envMapIntensity: 1.35,
        sheen: 0.35,
        sheenColor: new Color("#6a7a90"),
      });
    case "chrome":
    case "rim":
      return new MeshPhysicalMaterial({
        color: CHROME,
        metalness: 1,
        roughness: 0.16,
        envMapIntensity: 1.35,
      });
    case "glass":
      return new MeshPhysicalMaterial({
        color: GLASS,
        metalness: 0.12,
        roughness: 0.04,
        transparent: true,
        opacity: 0.42,
        transmission: 0.28,
        thickness: 0.35,
        envMapIntensity: 1.4,
      });
    case "headlight":
      return new MeshPhysicalMaterial({
        color: lit ? "#f7fbff" : "#d7dee8",
        emissive: lit ? new Color("#eef6ff") : new Color("#000000"),
        emissiveIntensity: lit ? 3.4 : 0.05,
        metalness: 0.2,
        roughness: 0.12,
        transparent: true,
        opacity: 0.92,
      });
    case "tail":
      return new MeshPhysicalMaterial({
        color: "#7a1218",
        emissive: new Color(parked ? "#ff2a2a" : "#5a0008"),
        emissiveIntensity: parked ? 2.4 : 0.45,
        metalness: 0.25,
        roughness: 0.28,
      });
    case "rubber":
      return new MeshPhysicalMaterial({
        color: RUBBER,
        metalness: 0.04,
        roughness: 0.78,
      });
    case "plastic":
      return new MeshPhysicalMaterial({
        color: PLASTIC,
        metalness: 0.08,
        roughness: 0.55,
      });
    case "caliper":
      return new MeshPhysicalMaterial({
        color: CALIPER,
        metalness: 0.35,
        roughness: 0.4,
      });
    case "interior":
      return new MeshPhysicalMaterial({
        color: INTERIOR,
        metalness: 0.05,
        roughness: 0.7,
      });
    case "other":
      return new MeshPhysicalMaterial({
        color: "#2a2c31",
        metalness: 0.2,
        roughness: 0.5,
      });
    default: {
      const _exhaustive: never = kind;
      throw new Error(`Unhandled material kind: ${String(_exhaustive)}`);
    }
  }
}

export function applyCarMaterials(root: Object3D, lit: boolean, parked: boolean): void {
  root.traverse((obj) => {
    if (!(obj instanceof Mesh)) return;
    obj.castShadow = true;
    obj.receiveShadow = true;
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    const next = mats.map((mat) => {
      const name = (mat as MeshStandardMaterial).name || obj.name || "";
      const kind = classifyCarMaterial(name);
      const upgraded = physical(kind, lit, parked);
      upgraded.name = name;
      return upgraded;
    });
    obj.material = next.length === 1 ? next[0] : next;
  });
}
