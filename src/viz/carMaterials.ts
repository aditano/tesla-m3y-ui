import {
  Color,
  DataTexture,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  NoColorSpace,
  Object3D,
  RepeatWrapping,
  RGBAFormat,
  UnsignedByteType,
  Vector2,
} from "three";

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

/** Ultra Red–like albedo. CC-BY allows material tint; mesh is still David_Holiday. */
export const PAINT_NATA_RED = "#8c151c";
const CHROME = new Color("#b8c0c8");
const RUBBER = new Color("#0c0c0e");
const PLASTIC = new Color("#141518");
const GLASS = new Color("#12161c");
const CALIPER = new Color("#c4121a");
const INTERIOR = new Color("#121316");
const RIM = new Color("#1a1c20");

export function classifyCarMaterial(name: string): CarMaterialKind {
  const n = name.toLowerCase().replace(/\s+/g, "_");
  if (n.includes("car") && n.includes("paint")) return "paint";
  if (n.includes("chrome")) return "chrome";
  if (n.includes("glass") || n === "material.017") return "glass";
  if (n === "material.005") return "chrome";
  if (n.includes("led") || n.includes("phare")) return "headlight";
  if (n === "material.007") return "tail";
  if (n === "material.002") return "paint";
  if (n === "material.014") return "caliper";
  if (n === "material.009") return "rubber";
  if (
    n === "material.011" ||
    n === "material.012" ||
    n === "material.010" ||
    n === "material.013" ||
    n === "material.003" ||
    n === "material.004"
  ) {
    return "rim";
  }
  if (
    n.includes("plastic") ||
    n === "material.001" ||
    n === "material.008" ||
    n === "material.016"
  ) {
    return "plastic";
  }
  if (n === "material.015") return "interior";
  return "other";
}

let flakeNormal: DataTexture | null = null;
let rubberBump: DataTexture | null = null;

function noiseTexture(size: number, strength: number): DataTexture {
  const data = new Uint8Array(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    const nx = 0.5 + (Math.random() * 2 - 1) * strength;
    const ny = 0.5 + (Math.random() * 2 - 1) * strength;
    data[i * 4] = Math.round(nx * 255);
    data[i * 4 + 1] = Math.round(ny * 255);
    data[i * 4 + 2] = 255;
    data[i * 4 + 3] = 255;
  }
  const tex = new DataTexture(data, size, size, RGBAFormat, UnsignedByteType);
  tex.colorSpace = NoColorSpace;
  tex.wrapS = RepeatWrapping;
  tex.wrapT = RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}

function getFlakeNormal(): DataTexture {
  if (!flakeNormal) {
    flakeNormal = noiseTexture(64, 0.22);
    flakeNormal.repeat.set(22, 22);
  }
  return flakeNormal;
}

function getRubberBump(): DataTexture {
  if (!rubberBump) {
    rubberBump = noiseTexture(48, 0.18);
    rubberBump.repeat.set(6, 14);
  }
  return rubberBump;
}

function physical(
  kind: CarMaterialKind,
  lit: boolean,
  parked: boolean,
  paintHex: string,
): MeshPhysicalMaterial {
  switch (kind) {
    case "paint":
      return new MeshPhysicalMaterial({
        color: new Color(paintHex),
        metalness: 0.58,
        roughness: 0.16,
        clearcoat: 1,
        clearcoatRoughness: 0.022,
        clearcoatNormalMap: getFlakeNormal(),
        clearcoatNormalScale: new Vector2(0.07, 0.07),
        envMapIntensity: parked ? 1.62 : 1.15,
        sheen: 0.14,
        sheenColor: new Color("#5a1014"),
        sheenRoughness: 0.4,
        specularIntensity: 1,
      });
    case "chrome":
      return new MeshPhysicalMaterial({
        color: CHROME,
        metalness: 1,
        roughness: 0.08,
        envMapIntensity: 1.55,
      });
    case "rim":
      return new MeshPhysicalMaterial({
        color: RIM,
        metalness: 0.96,
        roughness: 0.22,
        envMapIntensity: 1.05,
        clearcoat: 0.35,
        clearcoatRoughness: 0.18,
      });
    case "glass":
      return new MeshPhysicalMaterial({
        color: GLASS,
        metalness: 0.04,
        roughness: 0.018,
        transparent: true,
        opacity: parked ? 0.82 : 0.55,
        transmission: parked ? 0.18 : 0.35,
        thickness: 0.72,
        envMapIntensity: 1.45,
        ior: 1.5,
        attenuationColor: new Color("#0c1016"),
        attenuationDistance: 0.85,
      });
    case "headlight":
      return new MeshPhysicalMaterial({
        color: lit && !parked ? "#f7fbff" : "#c5ccd4",
        emissive: lit && !parked ? new Color("#eef6ff") : new Color("#1a1c20"),
        emissiveIntensity: lit && !parked ? 3.4 : parked ? 0.12 : 0.05,
        metalness: 0.18,
        roughness: 0.1,
        transparent: true,
        opacity: 0.9,
      });
    case "tail":
      return new MeshPhysicalMaterial({
        color: "#5a0c10",
        emissive: new Color(parked ? "#d41822" : "#5a0008"),
        emissiveIntensity: parked ? 0.55 : 0.45,
        metalness: 0.3,
        roughness: 0.32,
      });
    case "rubber":
      return new MeshPhysicalMaterial({
        color: RUBBER,
        metalness: 0.04,
        roughness: 0.78,
        sheen: 0.28,
        sheenColor: new Color("#1a1a1c"),
        sheenRoughness: 0.62,
        bumpMap: getRubberBump(),
        bumpScale: 0.018,
      });
    case "plastic":
      return new MeshPhysicalMaterial({
        color: PLASTIC,
        metalness: 0.06,
        roughness: 0.58,
      });
    case "caliper":
      return new MeshPhysicalMaterial({
        color: CALIPER,
        metalness: 0.42,
        roughness: 0.32,
        clearcoat: 0.55,
        clearcoatRoughness: 0.2,
      });
    case "interior":
      return new MeshPhysicalMaterial({
        color: INTERIOR,
        metalness: 0.04,
        roughness: 0.74,
      });
    case "other":
      return new MeshPhysicalMaterial({
        color: paintHex,
        metalness: 0.45,
        roughness: 0.4,
      });
    default: {
      const _exhaustive: never = kind;
      throw new Error(`Unhandled material kind: ${String(_exhaustive)}`);
    }
  }
}

export function applyCarMaterials(
  root: Object3D,
  lit: boolean,
  parked: boolean,
  paintHex: string = PAINT_NATA_RED,
): void {
  root.traverse((obj) => {
    if (!(obj instanceof Mesh)) return;
    obj.castShadow = true;
    obj.receiveShadow = true;
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    const next = mats.map((mat) => {
      const name = (mat as MeshStandardMaterial).name || obj.name || "";
      const kind = classifyCarMaterial(name);
      const upgraded = physical(kind, lit, parked, paintHex);
      upgraded.name = name;
      return upgraded;
    });
    obj.material = next.length === 1 ? next[0] : next;
  });
}
