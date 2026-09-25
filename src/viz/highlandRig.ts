import {
  Box3,
  BufferGeometry,
  DoubleSide,
  Group,
  Matrix4,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Object3D,
  Vector3,
} from "three";

/** Overall length the Studio Highland rig normalizes to. */
export const HIGHLAND_LENGTH_M = 4.72;

/**
 * Studio's `prepareHighland` leaves the nose on -Z.
 * Parked hotspots and the FSD chase camera in this app face +Z.
 */
export const HIGHLAND_APP_YAW = Math.PI;

const WHEEL_ORIGINS: Record<string, readonly [number, number, number]> = {
  wheel_fl: [-0.81, 0.345, -1.49],
  wheel_fr: [0.81, 0.345, -1.49],
  wheel_rl: [-0.81, 0.345, 1.385],
  wheel_rr: [0.81, 0.345, 1.385],
};

const preparedCache = new WeakMap<Object3D, Group>();

export type HighlandRole =
  | "exterior_paint"
  | "wheel_finish"
  | "tire_rubber"
  | "interior_leather"
  | "glass"
  | "lamp_lens"
  | "headlight_led"
  | "taillight_led"
  | "trim"
  | "other";

/** Role tags from Tesla Studio `src/studio/vehicles/highland.ts`, plus wheel-well paint. */
export function highlandRole(name: string, x: number, y: number, z: number): HighlandRole | string {
  let role: HighlandRole | string = name;
  if (name === "Geohoodsub00021Mtl" || name === "Georimblurlfsub01Mtl") role = "exterior_paint";
  if (name === "Georimblurlfsub021Mtl") role = "wheel_finish";
  if (name === "Ln7Mtl") {
    if (z < -1.75 && y > 0.45 && y < 0.95) role = "headlight_led";
    else if (z > -0.6) role = "interior_leather";
  }
  if (name === "Geodoorl2intsub651Mtl" || name === "Geodoorlintsub400251Mtl") role = "interior_leather";
  if (
    /Georimblurlfsub01/.test(name) &&
    Math.abs(x) < 0.63 &&
    z > -0.55 &&
    z < 1.07 &&
    y > 0.32 &&
    y < 1.03
  ) {
    role = "interior_leather";
  }
  if (/window|extwindow|Geodoorl2sub31|Geodoorr2sub31/i.test(name)) {
    role = z < -1.7 && y > 0.5 && y < 0.82 ? "lamp_lens" : "glass";
  }
  if (name === "Ln12Mtl") role = "taillight_led";
  if (/Tire1/.test(name)) role = "tire_rubber";
  if (name === "Geohoodsub00031Mtl") role = "trim";
  return role;
}

/** Studio-space hub id. `wheel_fl` is front-left while the nose still points -Z. */
export function highlandWheelPart(name: string, x: number, y: number, z: number): string {
  const wheelMaterial =
    /Tire1|Georimblurlfsub021/.test(name) || (/Georimblurlfsub01/.test(name) && y < 0.65);
  if (
    wheelMaterial &&
    Math.abs(x) > 0.7 &&
    Math.min(Math.abs(z + 1.49), Math.abs(z - 1.385)) < 0.4
  ) {
    const axle = z < 0 ? "f" : "r";
    const side = x < 0 ? "l" : "r";
    return `wheel_${axle}${side}`;
  }
  return "body";
}

function treatHighland(material: MeshPhysicalMaterial, sourceName: string, role: string): void {
  material.side = DoubleSide;
  if (role === "exterior_paint") {
    material.metalness = 0.28;
    material.roughness = 0.22;
    material.clearcoat = 1;
    material.clearcoatRoughness = 0.06;
    material.envMapIntensity = 1.15;
  }
  if (role === "wheel_finish") {
    material.metalness = 0.9;
    material.roughness = 0.28;
    material.envMapIntensity = 1.05;
    material.color.set("#2a2e34");
  }
  if (role === "tire_rubber") {
    material.metalness = 0;
    material.roughness = 0.9;
    material.envMapIntensity = 0.22;
  }
  if (role === "interior_leather") {
    material.metalness = 0;
    material.roughness = 0.55;
    material.sheen = 0.42;
    material.sheenRoughness = 0.4;
    material.sheenColor.set("#c8c4bc");
    material.envMapIntensity = 0.6;
  }
  if (role === "glass" || role === "lamp_lens" || material.transparent) {
    material.transparent = true;
    material.roughness = role === "lamp_lens" ? 0.16 : 0.07;
    material.metalness = 0.04;
    material.opacity = role === "lamp_lens" ? 0.72 : 0.55;
    material.transmission = 0;
    material.thickness = 0;
    material.clearcoat = 1;
    material.clearcoatRoughness = role === "lamp_lens" ? 0.12 : 0.04;
    material.depthWrite = false;
    material.envMapIntensity = role === "lamp_lens" ? 0.85 : 1.15;
    material.emissive.set("#000000");
    material.emissiveIntensity = 0;
    if (role === "lamp_lens") material.color.set("#1a2228");
    if (role === "glass") material.color.set("#121820");
  }
  if (role === "trim" || sourceName === "Geohoodsub00031Mtl") {
    material.metalness = 0.92;
    material.roughness = 0.2;
    material.envMapIntensity = 1.2;
    material.color.set("#c5ccd4");
  }
  if (/Geocockpithrsub000/.test(sourceName)) material.emissiveIntensity = 0.45;
  if (role === "headlight_led") {
    material.emissive.set("#d5e4f6");
    material.emissiveIntensity = 0.08;
    material.metalness = 0.08;
    material.roughness = 0.34;
    material.transparent = false;
    material.opacity = 1;
    material.toneMapped = true;
  }
  if (role === "taillight_led") {
    material.emissive.set("#ed1828");
    material.emissiveIntensity = 0.4;
    material.metalness = 0.18;
    material.roughness = 0.24;
    material.transparent = false;
    material.opacity = 1;
    material.color.set("#6a1018");
  }
  if (sourceName === "Ln1Mtl") {
    material.emissive.set("#d6743a");
    material.emissiveIntensity = 0.35;
    material.metalness = 0.25;
    material.roughness = 0.28;
  }
}

function geometryForTriangles(source: BufferGeometry, ids: number[]): BufferGeometry {
  const selected = source.clone();
  selected.setIndex(ids);
  selected.computeBoundingSphere();
  return selected;
}

/**
 * Presentation rig for the Studio Highland GLB.
 * Wheels are split out. The body stays one static shell (no factory hinges).
 */
export function prepareHighland(source: Object3D): { scene: Group; materials: Map<string, MeshPhysicalMaterial> } {
  source.updateMatrixWorld(true);
  const bounds = new Box3().setFromObject(source);
  const center = bounds.getCenter(new Vector3());
  const scale = HIGHLAND_LENGTH_M / Math.max(bounds.max.x - bounds.min.x, 1e-4);
  const transform = new Matrix4()
    .makeRotationY(Math.PI / 2)
    .multiply(new Matrix4().makeScale(scale, scale, scale))
    .multiply(new Matrix4().makeTranslation(-center.x, -bounds.min.y, -center.z));

  const scene = new Group();
  scene.name = "highland-rig";
  const body = new Group();
  body.name = "body";
  scene.add(body);

  const groups: Record<string, Group> = { body };
  for (const [name, position] of Object.entries(WHEEL_ORIGINS)) {
    const group = new Group();
    group.name = name;
    group.position.set(position[0], position[1], position[2]);
    groups[name] = group;
    scene.add(group);
  }

  const materials = new Map<string, MeshPhysicalMaterial>();
  source.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    const originals = Array.isArray(object.material) ? object.material : [object.material];
    const original = originals[0];
    if (!(original instanceof MeshStandardMaterial)) return;
    const sourceName = original.name;
    const geometry = object.geometry.clone().applyMatrix4(new Matrix4().multiplyMatrices(transform, object.matrixWorld));
    const pos = geometry.getAttribute("position");
    if (!pos) {
      geometry.dispose();
      return;
    }
    const index = geometry.getIndex();
    const buckets = new Map<string, number[]>();
    const triCount = index ? index.count : pos.count;
    for (let i = 0; i < triCount; i += 3) {
      const ids = [0, 1, 2].map((k) => (index ? index.getX(i + k) : i + k));
      const x = (pos.getX(ids[0]) + pos.getX(ids[1]) + pos.getX(ids[2])) / 3;
      const y = (pos.getY(ids[0]) + pos.getY(ids[1]) + pos.getY(ids[2])) / 3;
      const z = (pos.getZ(ids[0]) + pos.getZ(ids[1]) + pos.getZ(ids[2])) / 3;
      const part = highlandWheelPart(sourceName, x, y, z);
      let role = highlandRole(sourceName, x, y, z);
      if (part !== "body" && role === "exterior_paint") role = "wheel_finish";
      const key = `${part}|${role}`;
      const list = buckets.get(key) ?? [];
      list.push(ids[0], ids[1], ids[2]);
      buckets.set(key, list);
    }

    for (const [key, ids] of buckets) {
      const splitAt = key.indexOf("|");
      const part = key.slice(0, splitAt);
      const role = key.slice(splitAt + 1);
      const materialKey = `${sourceName}|${role}`;
      let material = materials.get(materialKey);
      if (!material) {
        material = new MeshPhysicalMaterial();
        MeshStandardMaterial.prototype.copy.call(material, original);
        material.name = role;
        treatHighland(material, sourceName, role);
        materials.set(materialKey, material);
      }
      const compact = geometryForTriangles(geometry, ids);
      const origin = WHEEL_ORIGINS[part];
      if (origin) compact.translate(-origin[0], -origin[1], -origin[2]);
      const mesh = new Mesh(compact, material);
      mesh.name = `${object.name}:${role}`;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      const parent = groups[part] ?? body;
      parent.add(mesh);
    }
    geometry.dispose();
  });

  return { scene, materials };
}

export function highlandMaterials(root: Object3D): Map<string, MeshPhysicalMaterial> | null {
  const value: unknown = root.userData.highlandMaterials;
  return value instanceof Map ? value : null;
}

/** Normalize, split wheels, and yaw the nose onto +Z for this app. */
export function fitHighland(source: Object3D): Group {
  const cached = preparedCache.get(source);
  if (cached) return cached;
  const prepared = prepareHighland(source);
  const fit = new Group();
  fit.name = "model3-fit";
  prepared.scene.rotation.y = HIGHLAND_APP_YAW;
  fit.add(prepared.scene);
  fit.userData.highlandMaterials = prepared.materials;
  preparedCache.set(source, fit);
  return fit;
}

/** Ultra Red and lamp levels on the Highland rig. Does not rebuild David_Holiday materials. */
export function applyHighlandLook(
  materials: ReadonlyMap<string, MeshPhysicalMaterial>,
  options: { paintHex: string; lit: boolean; parked: boolean },
): void {
  const headlightsOn = options.lit && !options.parked;
  for (const material of materials.values()) {
    const role = material.name;
    if (role === "exterior_paint") {
      material.color.set(options.paintHex);
      material.metalness = options.parked ? 0.32 : 0.26;
      material.roughness = options.parked ? 0.16 : 0.24;
      material.clearcoat = 1;
      material.clearcoatRoughness = options.parked ? 0.045 : 0.08;
      material.envMapIntensity = options.parked ? 1.28 : 0.9;
      material.sheen = options.parked ? 0.14 : 0.04;
      material.sheenColor.set("#4a0c12");
      material.sheenRoughness = 0.5;
      material.emissive.set("#000000");
      material.emissiveIntensity = 0;
    } else if (role === "glass") {
      material.color.set("#10161c");
      material.opacity = options.parked ? 0.58 : 0.42;
      material.transparent = true;
      material.transmission = 0;
      material.depthWrite = false;
      material.roughness = options.parked ? 0.04 : 0.08;
      material.envMapIntensity = options.parked ? 1.3 : 0.75;
      material.clearcoat = 1;
      material.clearcoatRoughness = 0.04;
    } else if (role === "headlight_led") {
      material.color.set(headlightsOn ? "#f4f8ff" : "#b7c0c8");
      material.emissive.set(headlightsOn ? "#e7f1ff" : "#12161a");
      material.emissiveIntensity = headlightsOn ? 1.55 : 0.03;
      material.transparent = false;
      material.opacity = 1;
    } else if (role === "taillight_led") {
      material.color.set("#7a1218");
      material.emissive.set("#ed1828");
      material.emissiveIntensity = options.parked ? 0.42 : headlightsOn ? 2.4 : 0.65;
    } else if (role === "lamp_lens") {
      material.emissiveIntensity = headlightsOn ? 0.15 : 0;
    }
    material.needsUpdate = true;
  }
}
