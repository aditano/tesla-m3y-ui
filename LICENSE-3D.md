# Third-party 3D assets

This repository redistributes **openly licensed** 3D models only. It does **not**
include Tesla firmware, vehicle dumps, or proprietary meshes.

**Not affiliated with Tesla, Inc.** Tesla, Model 3, and Model Y are trademarks of
Tesla, Inc. The mesh below is an independent fan-created model.

## Tesla Model 3

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
but is **gated off by default** (`M3_BAKE_AO`) and is not bound at runtime — the
overlapping smart-UV atlas chalked the candy coat. Runtime 5-cover aero wheels
(`src/viz/AeroWheel.tsx`) are original geometry and replace the stock
wheel/caliper primitives at load time.

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

Runtime: Three.js `GLTFLoader` with the bundled glTF Draco decoder. Hit volumes
for frunk, trunk, charge port, and doors are original to this project. Draco
decoder files under `public/draco/` come from Three.js examples (Apache-2.0).

## Fonts

UI type is **Inter** (OFL) via Google Fonts — an open SF-like stack tuned to public
UI v12 screenshots. Tesla’s proprietary display fonts are not used.
