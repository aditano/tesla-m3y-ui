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
| Face count | 27,012 |

You must retain this attribution if you copy the GLB.

The published Sketchfab archive is downloadable under CC-BY-4.0. This tree vendors
the same Model 3 glTF used by [wass08/r3f-3d-slideshow](https://github.com/wass08/r3f-3d-slideshow)
(Wawa Sensei), which credits the identical Sketchfab source. Extra slideshow props
that may exist in that packaging (speakers, tire debris) are **not rendered**.

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

The vendored 27k-face GLB has **no** `normalTexture` / `occlusionTexture` /
`emissiveTexture` in its glTF materials. Runtime PBR (clearcoat flake normal in
linear/`NoColorSpace`, glass IOR/transmission, rubber bump, rim metal, glossy
studio floor that picks up the environment) is an adaptation under CC-BY-4.0;
the mesh is still David_Holiday’s 27k asset. It is not Tesla’s viz-grade
Highland mesh. A true `MeshReflectorMaterial` ground was tried and dropped:
extra render targets blew the parked blit and hung Chromium QA.

Runtime: Three.js `GLTFLoader` with the bundled glTF Draco decoder. Hit volumes
for frunk, trunk, charge port, and doors are original to this project. Draco
decoder files under `public/draco/` come from Three.js examples (Apache-2.0).

## Fonts

UI type is **Inter** (OFL) via Google Fonts — an open SF-like stack tuned to public
UI v12 screenshots. Tesla’s proprietary display fonts are not used.
