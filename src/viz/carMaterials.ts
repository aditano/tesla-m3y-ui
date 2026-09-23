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
  | "sideGlass"
  | "backGlass"
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
export const PAINT_NATA_RED = "#9c1620";

export const GLASS_OPTICS = {
  windshield: { ior: 1.51, transmission: 0.01, opacity: 0.982, thickness: 0.55 },
  side: { ior: 1.5, transmission: 0.004, opacity: 0.99, thickness: 0.42 },
  roof: { ior: 1.52, transmission: 0, opacity: 0.996, thickness: 0.28 },
  back: { ior: 1.54, transmission: 0, opacity: 0.994, thickness: 0.5 },
} as const;

const CHROME = new Color("#c4c9d0");
const RUBBER = new Color("#08080a");
const PLASTIC = new Color("#121316");
const GLASS = new Color("#0a0c10");
const SIDE_GLASS = new Color("#080a0e");
const ROOF_GLASS = new Color("#030405");
const BACK_GLASS = new Color("#07080b");
const CALIPER = new Color("#3a3e44");
const INTERIOR = new Color("#0c0b0a");
const RIM = new Color("#16181c");

export function classifyCarMaterial(name: string): CarMaterialKind {
  const n = name.toLowerCase().replace(/\s+/g, "_");
  if (n.includes("car") && n.includes("paint")) return "paint";
  if (n.includes("chrome")) return "chrome";
  if (n.includes("glass-back") || n === "backglass") return "backGlass";
  if (n.includes("glass-side") || n === "sideglass") return "sideGlass";
  if (n.includes("glass-wind")) return "glass";
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

let rubberBump: DataTexture | null = null;
let streakNormal: DataTexture | null = null;

function noiseTexture(size: number, strength: number): DataTexture {
  const data = new Uint8Array(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    const n = Math.random();
    const nx = 0.5 + (n * 2 - 1) * strength;
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

/** Thin directional ridges so the C-pillar reads a streak, not a plastic wrap. */
function streakNormalTexture(): DataTexture {
  const size = 256;
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const wave = Math.sin(x * 0.38 + Math.sin(y * 0.05) * 2.1);
      const ridge = Math.pow(Math.max(0, wave), 20);
      const nx = 0.5 + wave * 0.028 + ridge * 0.05;
      const ny = 0.5 + Math.sin(y * 0.018) * 0.008;
      const i = (y * size + x) * 4;
      data[i] = Math.round(Math.min(1, Math.max(0, nx)) * 255);
      data[i + 1] = Math.round(Math.min(1, Math.max(0, ny)) * 255);
      data[i + 2] = 255;
      data[i + 3] = 255;
    }
  }
  const tex = new DataTexture(data, size, size, RGBAFormat, UnsignedByteType);
  tex.colorSpace = NoColorSpace;
  tex.wrapS = RepeatWrapping;
  tex.wrapT = RepeatWrapping;
  tex.repeat.set(5.5, 1.8);
  tex.needsUpdate = true;
  return tex;
}

function getRubberBump(): DataTexture {
  if (!rubberBump) {
    rubberBump = noiseTexture(48, 0.22);
    rubberBump.repeat.set(8, 18);
  }
  return rubberBump;
}

function getStreakNormal(): DataTexture {
  if (!streakNormal) streakNormal = streakNormalTexture();
  return streakNormal;
}

function glassPhysical(
  color: Color,
  parked: boolean,
  optics: (typeof GLASS_OPTICS)[keyof typeof GLASS_OPTICS],
  env: number,
): MeshPhysicalMaterial {
  return new MeshPhysicalMaterial({
    color,
    metalness: 0.02,
    roughness: parked ? 0.022 : 0.036,
    transparent: true,
    opacity: parked ? optics.opacity : Math.min(0.7, optics.opacity * 0.62),
    transmission: parked ? optics.transmission : Math.max(0.16, optics.transmission * 14),
    thickness: optics.thickness,
    envMapIntensity: parked ? env : env * 0.72,
    ior: optics.ior,
    attenuationColor: new Color("#05070a"),
    attenuationDistance: parked ? 0.22 : 0.55,
    specularIntensity: 1,
    clearcoat: parked ? 0.35 : 0.12,
    clearcoatRoughness: 0.04,
  });
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
        metalness: 0.36,
        roughness: 0.048,
        clearcoat: 1,
        clearcoatRoughness: 0.01,
        clearcoatNormalMap: getStreakNormal(),
        clearcoatNormalScale: new Vector2(0.022, 0.014),
        anisotropy: parked ? 0.55 : 0.22,
        anisotropyRotation: 1.18,
        envMapIntensity: parked ? 1.55 : 1.05,
        sheen: parked ? 0.08 : 0.1,
        sheenColor: new Color("#4a0c12"),
        sheenRoughness: 0.7,
        specularIntensity: 1,
        specularColor: new Color("#ffd6d0"),
        iridescence: parked ? 0.045 : 0.02,
        iridescenceIOR: 1.28,
        iridescenceThicknessRange: [80, 220],
        ...(aoMap ? { aoMap, aoMapIntensity: parked ? 0.28 : 0.2 } : {}),
      });
    case "chrome":
      return new MeshPhysicalMaterial({
        color: CHROME,
        metalness: 0.86,
        roughness: parked ? 0.28 : 0.22,
        envMapIntensity: parked ? 0.48 : 0.7,
      });
    case "rim":
      return new MeshPhysicalMaterial({
        color: RIM,
        metalness: 0.88,
        roughness: 0.32,
        envMapIntensity: 0.7,
        clearcoat: 0.22,
        clearcoatRoughness: 0.28,
      });
    case "glass":
      return glassPhysical(GLASS, parked, GLASS_OPTICS.windshield, parked ? 1.08 : 0.85);
    case "sideGlass":
      return glassPhysical(SIDE_GLASS, parked, GLASS_OPTICS.side, parked ? 1.12 : 0.75);
    case "backGlass":
      return glassPhysical(BACK_GLASS, parked, GLASS_OPTICS.back, parked ? 1.18 : 0.88);
    case "roofGlass":
      return glassPhysical(ROOF_GLASS, parked, GLASS_OPTICS.roof, parked ? 0.9 : 0.55);
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
        color: parked ? "#3a080c" : "#ff3b30",
        emissive: new Color(parked ? "#7a1016" : "#ff2a22"),
        emissiveIntensity: parked ? 0.18 : 1.1,
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
        roughness: 0.88,
        sheen: 0.1,
        sheenColor: new Color("#3a322c"),
        sheenRoughness: 0.78,
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

/**
 * A tangent attribute is only usable if every sampled tangent is finite and
 * non-degenerate. The CC-BY remesh's subdivided body ships near-zero UV islands,
 * so `computeTangents` yields NaN/zero tangents that collapse the clearcoat
 * normal-map shading to black. Detecting that lets the caller drop the
 * tangent-space paint features on just those meshes.
 */
function tangentsAreValid(geo: Mesh["geometry"]): boolean {
  const t = geo.getAttribute("tangent");
  if (!t) return false;
  const step = Math.max(1, Math.floor(t.count / 128));
  for (let i = 0; i < t.count; i += step) {
    const x = t.getX(i);
    const y = t.getY(i);
    const z = t.getZ(i);
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) return false;
    if (x * x + y * y + z * z < 1e-8) return false;
  }
  return true;
}

export function ensureMeshTangents(mesh: Mesh): boolean {
  const geo = mesh.geometry;
  if (geo.getAttribute("tangent")) {
    if (tangentsAreValid(geo)) return true;
    geo.deleteAttribute("tangent");
  }
  if (!geo.getAttribute("uv") || !geo.getIndex()) return false;
  if (!geo.getAttribute("normal")) geo.computeVertexNormals();
  try {
    geo.computeTangents();
  } catch {
    return false;
  }
  if (!tangentsAreValid(geo)) {
    geo.deleteAttribute("tangent");
    return false;
  }
  return true;
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
    const tangents = ensureMeshTangents(obj);
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    const next = mats.map((mat) => {
      const name = (mat as MeshStandardMaterial).name || obj.name || "";
      const fromUser = obj.userData.glassKind as CarMaterialKind | undefined;
      const kind = fromUser ?? classifyCarMaterial(obj.name.startsWith("glass-") ? obj.name : name);
      if (kind === "caliper") obj.visible = false;
      const paintAo = kind === "paint" ? aoMap : null;
      const upgraded = physical(kind, lit, parked, paintHex, paintAo);
      if (kind === "paint" && !tangents) {
        upgraded.anisotropy = 0;
        upgraded.clearcoatNormalMap = null;
      }
      upgraded.name = name;
      return upgraded;
    });
    obj.material = next.length === 1 ? next[0] : next;
  });
}
