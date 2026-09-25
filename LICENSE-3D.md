# Third-party 3D assets

This repository redistributes **openly licensed** 3D models only. It does **not**
include Tesla firmware, vehicle dumps, or proprietary meshes.

**Not affiliated with Tesla, Inc.** Tesla, Model 3, and Model Y are trademarks of
Tesla, Inc. The meshes below are independent fan-created models.

## Tesla Model 3 (runtime)

Parked and FSD views load the **2024 Model 3 Highland** set copied from
[aditano/tesla-studio](https://github.com/aditano/tesla-studio) `public/models/highland/`.
It is not Tesla OEM CAD.

| | |
| --- | --- |
| File | `public/models/highland/model.glb` plus `texture-0.png` … `texture-5.png` |
| Artist | [RBLXSupercars](https://sketchfab.com/RBLXSupercars) |
| Title | 2024 Tesla Model 3 |
| License | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| Source embedded in the GLB | https://sketchfab.com/3d-models/2024-tesla-model-3-fd22be415215453693d67e33aa7812d0 |
| Download-page uploader | [brandonleong28](https://sketchfab.com/3d-models/tesla-model-3-2024-36c52f3f89f6439c90310f14e8ff33f2) |
| Studio copy | [erictfree/Carbon-Footprint-AI-Visualizer](https://github.com/erictfree/Carbon-Footprint-AI-Visualizer/tree/af4bef33ca371b24c1f043486f09a13571f4919b/models/tesla-model-3-2024) via tesla-studio |
| Triangles | 179,692 |

Full credit, the source SHA-256, and the texture list live in
[`public/models/highland/CREDITS.md`](public/models/highland/CREDITS.md) and
`public/models/highland/manifest.json`. You must retain that attribution if you
copy the GLB or the textures.

The GLB uses `EXT_meshopt_compression`. The app decodes it with the Meshopt
decoder bundled by `@react-three/drei` / three.js. Runtime fit (4.72 m length,
nose toward +Z, wheel groups, Ultra Red) is original presentation code in
`src/viz/highlandRig.ts`, adapted from Tesla Studio `src/studio/vehicles/highland.ts`.
Panel splits are not a factory rig.

## Previous Model 3 derivative (not loaded)

`public/models/tesla_model_3.glb` stays in the tree for the earlier review history.
Parked and FSD views do not load it. The aero-wheel swap, cabin blocker, and
greenhouse split in `src/viz/` are not applied to the Highland rig.

| | |
| --- | --- |
| File | `public/models/tesla_model_3.glb` |
| Author | [David_Holiday](https://sketchfab.com/David_Holiday) |
| Title | Tesla Model 3 |
| License | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| Source | https://sketchfab.com/3d-models/tesla-model-3-123c10f376ec4f18b93c73afc382808b |
| Face count | 27,012 (source archive); published derivative ≈ 92,913 faces |

You must retain this attribution if you copy the GLB.

The published Sketchfab archive is downloadable under CC-BY-4.0. This tree vendors
the same Model 3 glTF used by [wass08/r3f-3d-slideshow](https://github.com/wass08/r3f-3d-slideshow)
(Wawa Sensei), which credits the identical Sketchfab source. Extra slideshow props
that may exist in that packaging (speakers, tire debris) are **not rendered**.

The unmodified download is archived at `tools/mesh/tesla_model_3.src.glb`.
`public/models/tesla_model_3.glb` is a **CC-BY-4.0 derivative** of that file,
produced by `tools/mesh/remesh_model3.py`: Blender subdivision, angle-limited
bevels, and weighted normals. Authorship of the underlying David_Holiday mesh is
unchanged, but the derivative now carries a few materially new pieces, all
**original geometry / material work, not Tesla assets**:

- **Wheel-well liner shells** — a dark plastic cup (open tube + back-wall disc)
  added at each hub so the fender opening never shows a red interior cavity
  above the tire.
- **`SideGlass` material split** — the near-vertical greenhouse panes are
  reassigned to a separate `SideGlass` slot (the roof panel keeps `Material.017`),
  so the runtime can tint the side/rear/windshield glass as dark laminate
  independently of the panoramic roof.
- The stray `Cylinder012` studio prop from the source archive is removed.

The paint AO bake (`public/models/maps/paint_ao.png`) is retained for reference
but is **gated off by default** (`M3_BAKE_AO`) and is not bound at runtime. The
overlapping smart-UV atlas chalked the candy coat. `src/viz/AeroWheel.tsx` is
original geometry that used to replace the stock wheel primitives on this
derivative. It is not parented onto the Highland mesh.

### Mesh ceiling (2026-09-16 re-eval)

A higher-poly **David_Holiday** Model 3 exists on Sketchfab
([uid `bcecd9bf5ffe43d7bac744332fc12d82`](https://sketchfab.com/3d-models/tesla-model-3-bcecd9bf5ffe43d7bac744332fc12d82),
737,161 faces / 391,059 verts, same CC-BY-4.0, `isDownloadable: true`). It is the
best legally compatible upgrade we found (same author/license as the vendored
mesh). **It is not in this tree** because:

- `GET https://api.sketchfab.com/v3/models/…/download` returns **401 Token**
  without a Sketchfab account token. This environment has none.
- No public GitHub, Khronos, Hugging Face, or Objaverse mirror of that uid was
  found. Sketchfab media CDN glTF URLs return 403.
- Paid / editorial archives (CGTrader, iMeshh) are out of policy.

The source 27k-face GLB has **no** `normalTexture` / `occlusionTexture` /
`emissiveTexture` in its glTF materials. Runtime PBR (streaky clearcoat normal in
linear/`NoColorSpace`, roof/side/backlight IOR+transmission, rubber bump, rim
metal, Lightformer studio + one-shot contact shadow, glossy floor that picks
up the environment) is an adaptation under CC-BY-4.0.
It is not Tesla’s viz-grade Highland mesh. A true `MeshReflectorMaterial` ground
was tried and dropped: extra render targets blew the parked blit and hung
Chromium QA.

That archived derivative was loaded with Three.js `GLTFLoader` and the bundled
glTF Draco decoder. Hit volumes for frunk, trunk, charge port, and doors are
original to this project and still sit on the Highland fit. Draco decoder files
under `public/draco/` come from Three.js examples (Apache-2.0).

## Fonts

UI type is **Inter** (OFL) via Google Fonts — an open SF-like stack tuned to public
UI v12 screenshots. Tesla’s proprietary display fonts are not used.
