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
  Texture,
  UnsignedByteType,
  Vector2,
} from "three";

export type CarMaterialKind =
  | "paint"
  | "chrome"
  | "glass"
  | "roofGlass"
  | "headlight"
  | "tail"
  | "rubber"
  | "plastic"
  | "caliper"
  | "interior"
  | "rim"
  | "other";

/** Ultra Red–like albedo. CC-BY allows material tint; mesh is still David_Holiday. */
export const PAINT_NATA_RED = "#8c1a22";
const CHROME = new Color("#c4c9d0");
const RUBBER = new Color("#08080a");
const PLASTIC = new Color("#121316");
const GLASS = new Color("#07090d");
const ROOF_GLASS = new Color("#050608");
const CALIPER = new Color("#b01018");
const INTERIOR = new Color("#161412");
const RIM = new Color("#16181c");

export function classifyCarMaterial(name: string): CarMaterialKind {
  const n = name.toLowerCase().replace(/\s+/g, "_");
  if (n.includes("car") && n.includes("paint")) return "paint";
  if (n.includes("chrome")) return "chrome";
  if (n.includes("glass")) return "glass";
  if (n === "material.017") return "roofGlass";
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
let flakeRough: DataTexture | null = null;
let rubberBump: DataTexture | null = null;

function noiseTexture(size: number, strength: number, asRoughness = false): DataTexture {
  const data = new Uint8Array(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    const n = Math.random();
    if (asRoughness) {
      const r = Math.round((0.42 + n * 0.38) * 255);
      data[i * 4] = r;
      data[i * 4 + 1] = r;
      data[i * 4 + 2] = r;
      data[i * 4 + 3] = 255;
    } else {
      const nx = 0.5 + (n * 2 - 1) * strength;
      const ny = 0.5 + (Math.random() * 2 - 1) * strength;
      data[i * 4] = Math.round(nx * 255);
      data[i * 4 + 1] = Math.round(ny * 255);
      data[i * 4 + 2] = 255;
      data[i * 4 + 3] = 255;
    }
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
    flakeNormal = noiseTexture(64, 0.16);
    flakeNormal.repeat.set(28, 28);
  }
  return flakeNormal;
}

function getFlakeRoughness(): DataTexture {
  if (!flakeRough) {
    flakeRough = noiseTexture(64, 0.2, true);
    flakeRough.repeat.set(18, 18);
  }
  return flakeRough;
}

function getRubberBump(): DataTexture {
  if (!rubberBump) {
    rubberBump = noiseTexture(48, 0.22);
    rubberBump.repeat.set(8, 18);
  }
  return rubberBump;
}

function physical(
  kind: CarMaterialKind,
  lit: boolean,
  parked: boolean,
  paintHex: string,
  aoMap: Texture | null,
): MeshPhysicalMaterial {
  switch (kind) {
    case "paint":
      return new MeshPhysicalMaterial({
        color: new Color(paintHex),
        metalness: 0.6,
        roughness: 0.12,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02,
        clearcoatNormalMap: getFlakeNormal(),
        clearcoatNormalScale: new Vector2(0.005, 0.005),
        envMapIntensity: parked ? 1.8 : 1.2,
        sheen: parked ? 0.2 : 0.14,
        sheenColor: new Color("#6a1218"),
        sheenRoughness: 0.48,
        specularIntensity: 1.0,
        ...(aoMap
          ? { aoMap, aoMapIntensity: parked ? 0.62 : 0.45 }
          : {}),
      });
    case "chrome":
      return new MeshPhysicalMaterial({
        color: new Color("#e0e0e0"),
        metalness: 1.0,
        roughness: 0.05,
        envMapIntensity: parked ? 2.0 : 1.15,
      });
    case "rim":
      return new MeshPhysicalMaterial({
        color: new Color("#222222"),
        metalness: 0.9,
        roughness: 0.2,
        envMapIntensity: 1.0,
        clearcoat: 0.1,
        clearcoatRoughness: 0.2,
      });
    case "glass":
      return new MeshPhysicalMaterial({
        color: new Color("#020202"),
        metalness: 0.1,
        roughness: 0.0,
        transparent: true,
        opacity: 1.0,
        transmission: parked ? 0.85 : 0.32,
        thickness: 1.5,
        envMapIntensity: parked ? 2.5 : 0.85,
        ior: 1.52,
        attenuationColor: new Color("#05070a"),
        attenuationDistance: 0.42,
        specularIntensity: 1,
      });
    case "roofGlass":
      return new MeshPhysicalMaterial({
        color: new Color("#000000"),
        metalness: 0.1,
        roughness: 0.0,
        transparent: true,
        opacity: 1.0,
        transmission: parked ? 0.8 : 0.12,
        thickness: 1.5,
        envMapIntensity: parked ? 1.5 : 0.55,
        ior: 1.5,
      });
    case "headlight":
      return new MeshPhysicalMaterial({
        color: lit && !parked ? "#f7fbff" : "#9aa3ac",
        emissive: lit && !parked ? new Color("#eef6ff") : new Color("#14161a"),
        emissiveIntensity: lit && !parked ? 3.4 : parked ? 0.04 : 0.05,
        metalness: 0.55,
        roughness: 0.18,
        transparent: true,
        opacity: 0.92,
      });
    case "tail":
      return new MeshPhysicalMaterial({
        color: "#3a080c",
        emissive: new Color(parked ? "#7a1016" : "#5a0008"),
        emissiveIntensity: parked ? 0.18 : 0.45,
        metalness: 0.22,
        roughness: 0.42,
      });
    case "rubber":
      return new MeshPhysicalMaterial({
        color: RUBBER,
        metalness: 0,
        roughness: 0.94,
        sheen: 0.12,
        sheenColor: new Color("#121214"),
        sheenRoughness: 0.82,
        bumpMap: getRubberBump(),
        bumpScale: 0.028,
      });
    case "plastic":
      return new MeshPhysicalMaterial({
        color: PLASTIC,
        metalness: 0.04,
        roughness: 0.64,
      });
    case "caliper":
      return new MeshPhysicalMaterial({
        color: CALIPER,
        metalness: 0.22,
        roughness: 0.44,
        clearcoat: 0.4,
        clearcoatRoughness: 0.28,
      });
    case "interior":
      return new MeshPhysicalMaterial({
        color: INTERIOR,
        metalness: 0.02,
        roughness: 0.82,
        sheen: 0.18,
        sheenColor: new Color("#5a4c42"),
        sheenRoughness: 0.7,
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
  aoMap: Texture | null = null,
): void {
  root.traverse((obj) => {
    if (!(obj instanceof Mesh)) return;
    if (obj.name.startsWith("orig-") || obj.parent?.name === "aero-wheel" || obj.parent?.name.startsWith("orig-")) return;
    obj.castShadow = true;
    obj.receiveShadow = true;
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    const next = mats.map((mat) => {
      const name = (mat as MeshStandardMaterial).name || obj.name || "";
      const kind = classifyCarMaterial(name);
      const paintAo = kind === "paint" ? aoMap : null;
      const upgraded = physical(kind, lit, parked, paintHex, paintAo);
      upgraded.name = name;
      return upgraded;
    });
    obj.material = next.length === 1 ? next[0] : next;
  });
}
