#!/usr/bin/env python3
"""CC-BY derivative remesh of David_Holiday Tesla Model 3.

Subdivision, bevels, weighted normals, paint AO bake. Original authorship
remains David_Holiday; this script is an adaptation under CC-BY-4.0.
"""
from __future__ import annotations

import math
import os
import sys

import bpy

SRC = os.environ.get("M3_SRC", "/workspace/tools/mesh/tesla_model_3.src.glb")
OUT = os.environ.get("M3_OUT", "/workspace/public/models/tesla_model_3.glb")
MAPS = os.environ.get("M3_MAPS", "/workspace/public/models/maps")
SUBDIV = int(os.environ.get("M3_SUBDIV", "1"))


def log(msg: str) -> None:
    print(msg, flush=True)


def reset_scene() -> None:
    bpy.ops.wm.read_factory_settings(use_empty=True)


def import_glb(path: str) -> None:
    bpy.ops.import_scene.gltf(filepath=path)


def delete_junk() -> None:
    junk = [o for o in bpy.data.objects if any(k in o.name.lower() for k in ("debris", "speaker", "walldesk"))]
    for o in junk:
        log(f"delete {o.name}")
        bpy.data.objects.remove(o, do_unlink=True)


def mesh_objects() -> list:
    return [o for o in bpy.data.objects if o.type == "MESH"]


def select_only(obj) -> None:
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj


def shade_smooth(obj, angle_deg: float) -> None:
    select_only(obj)
    try:
        bpy.ops.object.shade_smooth_by_angle(angle=math.radians(angle_deg), keep_sharp_edges=True)
    except Exception:
        bpy.ops.object.shade_smooth()
    obj.select_set(False)


def try_quads(obj) -> None:
    select_only(obj)
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    try:
        bpy.ops.mesh.tris_convert_to_quads()
    except Exception as exc:
        log(f"quad skip {obj.name}: {exc}")
    bpy.ops.object.mode_set(mode="OBJECT")
    obj.select_set(False)


def add_bevel(obj, width: float, segments: int) -> None:
    m = obj.modifiers.new("HQ_Bevel", "BEVEL")
    m.width = width
    m.segments = segments
    m.limit_method = "ANGLE"
    m.angle_limit = math.radians(38)
    m.harden_normals = True
    m.miter_outer = "MITER_ARC"
    select_only(obj)
    try:
        bpy.ops.object.modifier_apply(modifier=m.name)
    except Exception as exc:
        log(f"bevel skip {obj.name}: {exc}")
    obj.select_set(False)


def add_subdiv(obj, levels: int) -> None:
    if levels <= 0:
        return
    verts = len(obj.data.vertices)
    if verts > 80_000:
        log(f"skip subdiv {obj.name} verts={verts}")
        return
    m = obj.modifiers.new("HQ_Subdiv", "SUBSURF")
    m.levels = levels
    m.render_levels = levels
    m.quality = 3
    m.uv_smooth = "PRESERVE_CORNERS"
    m.boundary_smooth = "PRESERVE_CORNERS"
    select_only(obj)
    bpy.ops.object.modifier_apply(modifier=m.name)
    obj.select_set(False)


def add_weighted_normals(obj) -> None:
    m = obj.modifiers.new("HQ_WN", "WEIGHTED_NORMAL")
    m.keep_sharp = True
    m.weight = 50
    select_only(obj)
    try:
        bpy.ops.object.modifier_apply(modifier=m.name)
    except Exception as exc:
        log(f"weighted normal skip {obj.name}: {exc}")
    obj.select_set(False)


def kind_for(obj) -> str:
    mats = [s.material.name.lower() if s.material else "" for s in obj.material_slots]
    blob = " ".join(mats + [obj.name.lower()])
    if "glass" in blob or "material.017" in blob:
        return "glass"
    if obj.name.lower().startswith("wheel") or "wheel" in obj.name.lower():
        return "wheel"
    if "chrome" in blob:
        return "chrome"
    if "car_paint" in blob or "car paint" in blob or "material.002" in blob:
        return "paint"
    return "other"


def subdiv_level(kind: str) -> int:
    if kind == "paint":
        return max(2, SUBDIV)
    if kind == "glass":
        return max(2, SUBDIV)
    if kind == "chrome":
        return max(1, SUBDIV)
    return 0


def ensure_uv(obj) -> None:
    select_only(obj)
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=0.04)
    bpy.ops.object.mode_set(mode="OBJECT")
    obj.select_set(False)


def bake_paint_ao(path: str) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    paints = [o for o in mesh_objects() if kind_for(o) == "paint"]
    if not paints:
        log("no paint AO targets")
        return

    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = 16
    scene.cycles.bake_type = "AO"
    scene.render.bake.use_pass_direct = False
    scene.render.bake.use_pass_indirect = False
    scene.render.bake.margin = 8
    scene.render.bake.use_selected_to_active = False

    img = bpy.data.images.new("M3_AO", width=2048, height=2048, alpha=False)
    img.generated_color = (1, 1, 1, 1)

    for obj in paints:
        ensure_uv(obj)
        if not obj.data.materials:
            mat = bpy.data.materials.new("AOHolder")
            mat.use_nodes = True
            obj.data.materials.append(mat)
        mat = obj.data.materials[0]
        mat.use_nodes = True
        nodes = mat.node_tree.nodes
        tex = nodes.new("ShaderNodeTexImage")
        tex.image = img
        nodes.active = tex

    for o in bpy.data.objects:
        o.select_set(False)
    for obj in paints:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = paints[0]
    try:
        bpy.ops.object.bake(type="AO")
        img.filepath_raw = path
        img.file_format = "PNG"
        img.save()
        log(f"wrote {path}")
    except Exception as exc:
        log(f"AO bake failed: {exc}")


def count_faces() -> int:
    return sum(len(o.data.polygons) for o in mesh_objects())


def export_glb(path: str) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format="GLB",
        export_extras=False,
        export_apply=True,
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=6,
        export_lights=False,
        export_cameras=False,
    )
    log(f"wrote {path} bytes={os.path.getsize(path)} faces={count_faces()}")


def main() -> int:
    log(f"src={SRC}")
    if not os.path.isfile(SRC):
        log("missing source glb")
        return 1
    reset_scene()
    import_glb(SRC)
    delete_junk()
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    bpy.ops.object.select_all(action="DESELECT")

    for obj in mesh_objects():
        kind = kind_for(obj)
        level = subdiv_level(kind)
        log(f"{obj.name} kind={kind} verts={len(obj.data.vertices)} subdiv={level}")
        angle = 80 if kind == "glass" else 48 if kind == "paint" else 55
        if kind in {"paint", "glass", "chrome"}:
            try_quads(obj)
        shade_smooth(obj, angle)
        if kind == "paint":
            add_bevel(obj, 0.0014, 2)
        elif kind == "chrome":
            add_bevel(obj, 0.0008, 1)
        add_subdiv(obj, level)
        shade_smooth(obj, angle)
        add_weighted_normals(obj)

    for obj in mesh_objects():
        w = obj.matrix_world.translation
        if obj.name.lower().startswith("wheel"):
            log(f"WHEEL {obj.name} world=({w.x:.4f},{w.y:.4f},{w.z:.4f})")

    log(f"pre-export faces={count_faces()}")
    bake_paint_ao(os.path.join(MAPS, "paint_ao.png"))
    export_glb(OUT)
    return 0


if __name__ == "__main__":
    sys.exit(main())
