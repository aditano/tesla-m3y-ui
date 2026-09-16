# Parked mesh review

Compare `docs/qa/screenshots/parked-home.png` to `docs/references/nata-parked-car-vis.jpg`.
Scores: `FAIL` / `PARTIAL` / `PASS`. One line each. Loop until near PASS or document a ceiling.

Legal: CC-BY-4.0 David_Holiday derivative only. No Tesla firmware meshes.

> **Reconcile note (2026-09-16).** PR 2 (parked base) and its four stacked siblings —
> PR 9 (mesh topology), PR 8 (wheels), PR 6 (paint/glass/studio), PR 7 (hostile critic) —
> were folded into this one branch. Iterations 0–4 were identical across every lane and
> appear once below. Each lane then iterated in parallel and reused the same
> "Iteration 5+" numbers, so those later entries are preserved verbatim under per-lane
> headings to keep every score. See the **Reconciled result** section at the end for the
> combined final state.

## Iteration 0 — 2026-09-16 (HEAD before remesh)

Still: `parked-home.png` after studio polish (`0aba5ff`). Mesh: vendored 27k David_Holiday, no baked maps.

| Axis | Score | Notes |
| --- | --- | --- |
| Paint | PARTIAL | Ultra Red midtones improved; still flatter than nata, specular wrap is dull, C-pillar highlight is a blob not a streak. |
| Glass | FAIL | Roof and backlight are faceted; triangulation reads through; cabin seats are crude blocks; chrome beltline incomplete. |
| Wheels | FAIL | Dark discs, not nata’s 5-spoke aero wheels; tires lack sidewall/tread. |
| Proportions | PARTIAL | Overall Model 3 silhouette is recognizable; window corners, spoiler lip, and panel gaps are low-poly. |
| Lighting | PARTIAL | Soft studio + cool rim; still more side-on than nata’s higher rear-3/4; gray void and a faint floor band remain. |
| Leaders | PARTIAL | TRUNK pin is on the decklid (not quarter); card still sits on the glass. Nata’s card floats in empty studio with a long vertical. FRUNK/CHARGE attached. |

**Worst FAIL:** wheels, then glass faceting. Next: Blender subdiv/bevel/AO bake on the CC-BY GLB, then studio/camera to match nata’s overhead rear-3/4.

## Iteration 1 — 2026-09-16 (remesh + studio flip, `ff78ffb`)

Still: `parked-home.png` after CC-BY subdiv/bevel (~94k faces), baked paint AO, stock wheels hidden, React aero wheels, rear-right camera.

| Axis | Score | Notes |
| --- | --- | --- |
| Paint | FAIL | AO atlas from overlapping smart UVs blotched Ultra Red into chalky patches; no longer a clean candy coat. |
| Glass | PARTIAL | Backlight is darker and less faceted than iter 0; cabin still reads as toy blocks through the glass. |
| Wheels | FAIL | Wheel wells empty (front-left is a hole). Stock discs hidden; replacements did not sit in the hubs. One red blob under the quarter — unnamed aero meshes got the paint “other” material. |
| Proportions | PARTIAL | Rear-right 3/4 now matches nata’s yaw. Silhouette is smoother; open wells and melted C-pillar still cheap. |
| Lighting | PARTIAL | White studio closer to nata; contact shadow still weak; AO dirt reads as bad lighting. |
| Leaders | PARTIAL | TRUNK pin on the decklid, card still overlaps the backlight. CHARGE/FRUNK attached. |

**Worst FAIL:** wheels not in the wells, then AO-ruined paint. Next: attach original aero wheels inside `extractCar` (skip paint pass), drop the AO map, fix tire torus to stand in YZ, pull camera back so the TRUNK card can sit in empty studio.

## Iteration 2 — 2026-09-16 (hub-parent aero wheels, `5fb0c63`)

Still: `parked-home.png` after parenting aero wheels onto `wheel` / `wheel.N` nodes. AO not applied.

| Axis | Score | Notes |
| --- | --- | --- |
| Paint | PARTIAL | Candy coat is back (no AO blotch). Still darker and flatter than nata; C-pillar highlight is a broad wrap, not a streak. |
| Glass | PARTIAL | Roof and backlight are dark and smoother; side glass is too transmissive — cabin blocks and a white void show through. |
| Wheels | PARTIAL | Rear-right 5-cover aero reads from overhead (the first time this campaign does). Front-left well is still an empty red hole. |
| Proportions | PARTIAL | Rear-right 3/4 matches nata’s yaw; silhouette is smoother than 27k. Open front well and cheap window corners remain. |
| Lighting | PARTIAL | White studio is closer; contact shadow still faint vs nata’s oval. |
| Leaders | PARTIAL | TRUNK pin on decklid; card still sits on the backlight. FRUNK/CHARGE attached. |

**Worst FAIL:** front-left wheel well is empty. Next: place each aero wheel on the stock mesh’s local bbox center (hub origin is not the geometric center), then darken side glass.

## Iteration 3 — 2026-09-16 (outboard 18" aero, `a0230e7`)

Still: `parked-home.png` after uniform 0.365m aero wheels with 0.1m outboard offset.

| Axis | Score | Notes |
| --- | --- | --- |
| Paint | PARTIAL | Smooth candy red, no AO blotch. Still a bit dark vs nata; C-pillar wrap is broad. |
| Glass | FAIL | Overhead angle turns the cabin into a white tunnel; toy seats still read through the glass. |
| Wheels | PARTIAL | Rear-right 5-cover aero is the first honest nata-like wheel. Front-left tire now shows; a red inner-well hole remains above it. |
| Proportions | PARTIAL | Rear-right 3/4 is right. Front well cutout on this mesh is still a bite out of the fender. |
| Lighting | PARTIAL | White studio OK; contact shadow still faint. |
| Leaders | PARTIAL | TRUNK still on the backlight. |

**Worst FAIL:** see-through cabin. Next: original dark cabin blocker + wheel-well liners, pull camera back so TRUNK can sit in empty studio.

## Iteration 4 — 2026-09-16 (fitted cabin, `1485608`)

Still: `parked-home.png` after parenting a sized cabin blocker to the clone (the wrapper-space blocker sat on the roof and was pulled back under the glass).

| Axis | Score | Notes |
| --- | --- | --- |
| Paint | PARTIAL | Smooth candy Ultra Red, no AO blotch, studio reflections. Still flatter than nata; C-pillar highlight is a wrap not a streak. |
| Glass | PARTIAL | Cabin no longer tunnels to the studio. Roof/backlight are dark. Side glass still a cheap opening, not nata’s tinted laminate. |
| Wheels | PARTIAL | Rear-right 5-cover aero reads from overhead. Front-left tire is present; this mesh’s fender cutout still shows a red inner well. |
| Proportions | PARTIAL | Rear-right 3/4 matches nata’s yaw. Window corners, spoiler, and panel gaps remain a 27k-derived silhouette. |
| Lighting | PARTIAL | White studio + contact shadow. Shadow is still lighter than nata’s oval. |
| Leaders | PARTIAL | TRUNK pin on the decklid; card still kisses the backlight. FRUNK/CHARGE attached. |

**Ceiling (honest):** parked-home no longer reads as the toy 27k disc-wheel car, but it is not a Tesla viz one-to-one. Remaining FAILs that need a different mesh (Highland / the 737k David_Holiday we cannot download without Sketchfab auth): fender-well wrap, panel gaps, glass laminate, aero face from every hub. Do not apply the overlapping paint AO atlas. Floor stays blit-safe (no `MeshReflectorMaterial`).





---

# Lane: PR 2 — parked base (hub artifact, shadow, leader)

## Iteration 5 — 2026-09-16 (hub-artifact + shadow + leader lane)

Still: `parked-home.png` after:
- Caliper dark (no red `#b01018` box sticking out of hub)
- Tire rotation fixed y→z (tire stands vertical, not flat)
- Compact wheel size (~480mm OD, fits fender arch)
- Contact shadow darkened (opacity 0.74, blur 1.2, colour #28242a)
- TRUNK pin at floor-level rear bumper [0.12, 0.08, −2.0], stem 50vh/440px

| Axis | Score | Notes |
| --- | --- | --- |
| Paint | PARTIAL | Smooth candy Ultra Red, studio reflections, no caliper artifact. Still flatter than nata. |
| Glass | PARTIAL | Cabin blocker prevents tunnel. Roof glass dark. Side glass still cheap. |
| Wheels | PARTIAL | Front-left shows a compact arc inside the fender (27k fender opening is shallow — ceiling for this mesh). Rear-right correct under the body. No red artifacts. |
| Proportions | PARTIAL | Rear-right 3/4 matches nata yaw. Smoother silhouette from subdiv. |
| Lighting | PARTIAL | White studio. Contact shadow is now a clear dark oval. Better match to nata. |
| Leaders | PARTIAL | FRUNK floats in empty studio (top). TRUNK card improved but still overlaps glass — geometric ceiling: this camera angle + this mesh leave no empty space above the rear glass. Stem goes to floor-level bumper. CHARGE attached. |

**Lane ceiling reached for this mesh + camera combo:** TRUNK card into pure empty studio requires a lower camera polar angle or a longer car (different topology). Siblings working on camera/topology will resolve.






---

# Lane: PR 9 — mesh topology surgery (wheel-well liners + SideGlass split)

## Iteration 5 — 2026-09-16 (topology surgery: liners + side-glass split)

Blender GLB now carries original **wheel-well liner shells** (dark plastic cup + back-wall disc at each hub, parented under `RootNode`) and a **`SideGlass` material split** — the near-vertical greenhouse panes (side windows, windshield, backlight rake) get their own slot so the runtime can tint them independently of the panoramic roof. Stray `Cylinder012` studio prop dropped; AO bake gated off (never bound at runtime). Runtime derivative: `glass` kind → near-zero env dark laminate (kills the Fresnel blow-out), `roofGlass` → glossy dark roof only, `chrome` tamed (satin, not mirror), and the `AeroWheel` caliper moved off the hub center to the lower-rear rim.

| Axis | Score | Notes |
| --- | --- | --- |
| Paint | PARTIAL | Smooth candy Ultra Red, no AO blotch, studio reflections. Unchanged from iter 4 — still a touch flatter than nata; C-pillar highlight is a broad wrap. |
| Glass | PARTIAL | Big jump: side windows + backlight + roof now read as dark tinted laminate, not a chrome-bright opening. Near-side front pane keeps a nata-like reflection streak; the far-side panes still catch a brighter key-light smear. |
| Wheels | PARTIAL | Front well is now a dark liner cavity — the red inner-well hole is gone. Rear-right 5-cover aero reads from overhead. The floating red caliper cube (aero-wheel caliper at the hub center) is fixed. |
| Proportions | PARTIAL | Rear-right 3/4 matches nata. The front side-marker still reads as a dark socket with a bright rim; window corners, spoiler lip, and panel gaps are still the 27k-derived silhouette. |
| Lighting | PARTIAL | White studio + contact shadow. Shadow still lighter than nata’s oval. |
| Leaders | PARTIAL | TRUNK pin on the decklid; card kisses the backlight. FRUNK/CHARGE attached. |

**Worst FAIL:** Proportions — the front side-marker socket artifact plus soft window-corner/panel-gap silhouette. Next (iter 6): reshape/close the side-marker so it stops reading as a hole, then bevel-tighten window corners and panel gaps.

## Iteration 6 — 2026-09-16 (silhouette tighten: subdiv creases)

`remesh_model3.py` now creases hard dihedrals (>30°, weight 1.0) on paint/chrome/glass before Catmull-Clark and bumps the paint bevel to 0.0018. Point of the pass: the earlier subdiv melted every character line into a blob; creasing keeps the window-cutout corners, panel gaps, hood/shoulder lines and the decklid/spoiler edge crisp toward Highland while the broad panels stay smooth (verified: no faceting).

Investigated the front side-marker "socket": the clay render shows it is the low-poly **side-mirror base**, a concave non-manifold pocket in the door skin (not a clean open hole), so it is a mesh-ceiling artifact rather than a fillable gap — left as-is instead of risking a bad manual patch.

| Axis | Score | Notes |
| --- | --- | --- |
| Paint | PARTIAL | Unchanged candy Ultra Red; the crisper creases give slightly sharper character-line highlights. |
| Glass | PARTIAL | Unchanged from iter 5 — dark tinted side/rear/roof, near-side front pane keeps a nata-like reflection. |
| Wheels | PARTIAL | Unchanged — dark liner wells, aero covers, no red caliper. |
| Proportions | PARTIAL | Window corners, panel gaps and the decklid edge read tighter (creased through subdiv). Front side-mirror base still a dark pocket; front overhang still long vs nata — mesh ceiling. |
| Lighting | PARTIAL | White studio + contact shadow. Out of this pass's mesh/GLB scope. |
| Leaders | PARTIAL | Unchanged. |

**Worst FAIL:** Glass uniformity + Paint — far-side panes and the lower body/rocker still catch a harder studio smear than nata's smooth dark gradient. Next (iter 7): even out the vertical-glass tint across both sides and calm the rocker/clearcoat blowout for a smoother nata-like body.

## Iteration 7 — 2026-09-16 (paint/glass reflection polish)

Parked candy paint now spreads its clearcoat (`clearcoatRoughness` 0.045 → 0.075, `envMapIntensity` 1.22 → 1.12) so the bright studio softbox reads as a smooth sweep down the rocker/shoulder instead of a hard white streak (side-by-side confirms the blown mirror line is gone). Vertical glass and chrome trim nudged a touch calmer (`glass` clearcoat/spec down, `chrome` env 0.5 → 0.42) so the door panes read as more uniform dark tint. GLB unchanged from iter 6 — this is pure runtime material.

| Axis | Score | Notes |
| --- | --- | --- |
| Paint | PASS-ish | Smooth candy Ultra Red; the rocker/shoulder highlight is now a broad soft sweep like nata, not a blown streak. Closest to nata this campaign. |
| Glass | PARTIAL | Side/rear/roof dark tinted; door panes read more uniform. Near-side front pane keeps a nata-like reflection; far panes acceptable. |
| Wheels | PARTIAL | Dark liner wells, aero covers, no red caliper. |
| Proportions | PARTIAL | Creased character lines/window corners hold. Side-mirror base pocket + front overhang are the standing mesh ceiling. |
| Lighting | PARTIAL | White studio + contact shadow (out of mesh/GLB scope). |
| Leaders | PARTIAL | Unchanged. |

**Ceiling (honest):** across iters 5–7 parked-home gained closed dark wheel wells, dark tinted laminate glass (side windows no longer chrome-white), no floating red caliper, crisper creased silhouette, and smoother candy paint. Remaining gaps are true mesh-geometry limits of the 27k-derived David_Holiday base (low-poly side-mirror base pocket, long front overhang, soft one-piece greenhouse) that need a higher-poly Highland/737k mesh we cannot fetch without Sketchfab auth. Do not apply the overlapping paint AO atlas; floor stays blit-safe (no `MeshReflectorMaterial`).



---

# Lane: PR 8 — wheels / hubs / aero

## Iteration 5 — 2026-09-16 (hub-anchored 5-cover aero remesh, working tree)

Still: `parked-home.png` after replacing stock wheel meshes at each `wheel`/`wheel.N` parent with side-aware 5-cover aero groups, dark cavity blockers, and subtler calipers.

| Axis | Score | Notes |
| --- | --- | --- |
| Paint | PARTIAL | Candy coat and studio highlights remain stable vs iter 4; still flatter/darker than nata around the C-pillar streak. |
| Glass | PARTIAL | Cabin blocker still prevents tunnel-through; side glass remains too open vs nata’s deeper laminate tint. |
| Wheels | PARTIAL | All four hub parents now carry a stable aero wheel (no empty front-left hole, no red inner cavity). Rear-right reads closer to nata’s 5-cover look, but front-left still favors sidewall silhouette over visible cover at this camera. |
| Proportions | PARTIAL | Rear-right 3/4 pose remains aligned; wheel-well/fender cutout topology still limits a true nata-like wrap around the front-left arch. |
| Lighting | PARTIAL | White studio and contact shadow remain close enough for wheel validation; still lighter than nata’s denser rear shadow oval. |
| Leaders | PARTIAL | TRUNK pin remains on decklid but card still intersects backlight space. |

**Ceiling (wheels):** hub parenting + bbox-centered placement is now stable across parked/route QA captures, but strict 1:1 aero read from this angle is constrained by the low-poly wheel-well/fender geometry. Without a higher-fidelity CC-BY wheel-arch mesh, further material-only tweaks are likely diminishing returns.





---

# Lane: PR 6 — paint / glass / studio

## Iteration 5 — 2026-09-16 (paint/glass/studio pass, `03a9d96`)

Still: `parked-home.png` after candy-coat materials, greenhouse split, Lightformer studio, longer TRUNK stem, camera pulled back.

| Axis | Score | Notes |
| --- | --- | --- |
| Paint | FAIL | Clay / toy-matte Ultra Red. `Environment frames={1}` never ran a useFrame capture, so the Lightformer cubemap stayed empty; anisotropy + streak clearcoat had nothing to reflect. No C-pillar streak. |
| Glass | PARTIAL | White cabin tunnel is gone. Roof reads as gray primer, not nata’s glossy black laminate — same empty env. Side/back IOR split is in code, not visible as glass. |
| Wheels | PARTIAL | Rear aero still reads. Front-left well cutout unchanged (mesh ceiling). |
| Proportions | PARTIAL | More rear-on than nata’s 3/4; C-pillar is edge-on so a streak could not land. |
| Lighting | PARTIAL | Deeper oval contact shadow is the first honest nata-like puddle. Floor gloss and white multi-bounce did not show (empty env + lights pulled too far down). |
| Leaders | PARTIAL | TRUNK card now floats in empty studio with a long vertical to the decklid (no longer kissing the backlight). FRUNK still sits on the roof glass. |

**Worst FAIL:** empty Lightformer cubemap flattened paint and glass. Next: `preset="studio"` + a few startup env frames, compute tangents, restore 3/4 so the C-pillar can catch a streak.

## Iteration 6 — 2026-09-16 (env capture + 3/4, `af406c4`)

Still: `parked-home.png` after studio-preset Lightformers (8 frames) and rear-right camera.

| Axis | Score | Notes |
| --- | --- | --- |
| Paint | PARTIAL | Gloss is back (no longer clay). Still a broad satin wrap; C-pillar highlight is not a nata streak. Studio HDRI lights are too soft. |
| Glass | PARTIAL | Roof is darker and reads as glass. Side openings no longer tunnel to white. Still missing chrome-belt laminate sparkle. |
| Wheels | PARTIAL | Unchanged mesh ceiling. |
| Proportions | PARTIAL | 3/4 is closer to nata than iter 5. |
| Lighting | PARTIAL | Oval contact shadow holds. Floor gloss still weak. Soft studio wrap remains. |
| Leaders | PARTIAL | TRUNK still floats in empty studio with a long vertical to the decklid. |

**Worst remaining:** C-pillar streak. Next: drop the HDRI wrap and paint a static equirect with a thin overhead strip.

## Iteration 7 — 2026-09-16 (painted equirect, `50010cc`)

Still: `parked-home.png` after swapping the HDRI for a static strip env via `<Environment map={dataTex} />`.

| Axis | Score | Notes |
| --- | --- | --- |
| Paint | FAIL | Flat again. The DataTexture never became a working PMREM env, so candy clearcoat had nothing to reflect. |
| Glass | PARTIAL | Roof stays dark; still no laminate sparkle. |
| Wheels | PARTIAL | Unchanged. |
| Proportions | PARTIAL | Same 3/4 as iter 6. |
| Lighting | PARTIAL | Oval shadow holds. Floor gloss gone with the missing env. |
| Leaders | PARTIAL | TRUNK still floats with a long vertical. |

**Worst FAIL:** env map not bound. Next: `PMREMGenerator.fromEquirectangular` on the painted studio, keep a fill light so we cannot regress to clay.

## Iteration 8 — 2026-09-16 (PMREM bake, `9d099d6`)

Still: `parked-home.png` after PMREM-baking the painted studio.

| Axis | Score | Notes |
| --- | --- | --- |
| Paint | PARTIAL | Sheen is back on the front quarter. Rear/C-pillar still a satin wrap, not a nata streak. |
| Glass | PARTIAL | Roof is a dark slab; chrome beltline is faint. Side glass is a hole more than laminate. |
| Wheels | PARTIAL | Unchanged. |
| Proportions | PARTIAL | Same 3/4. |
| Lighting | PARTIAL | Oval shadow is the strongest nata read. Floor gloss still subtle. |
| Leaders | PARTIAL | TRUNK card in empty studio, long vertical, pin on decklid. |

**Worst remaining:** C-pillar streak. Next: thin `RectAreaLight` keys (direct lobe on clearcoat, not only IBL).

## Iteration 9 — 2026-09-16 (RectAreaLights, `986afc4`)

Still: `parked-home.png` after a 6cm C-pillar key + overhead strip.

| Axis | Score | Notes |
| --- | --- | --- |
| Paint | PARTIAL | First honest candy streak on the camera-side C-pillar / rear shoulder. Midtones still a bit toy-bright vs nata Ultra Red. |
| Glass | PARTIAL | Roof is a dark slab; chrome beltline now reads. Side glass still a cheap tinted hole. |
| Wheels | PARTIAL | Unchanged mesh ceiling. |
| Proportions | PARTIAL | Rear-right 3/4 holds. |
| Lighting | PARTIAL | Oval contact shadow is close to nata. Floor picked up a left-side area-light hotspot — next pass damps it. |
| Leaders | PARTIAL | TRUNK floats in empty studio with a long vertical to the decklid. FRUNK still on the roof. |

**Next:** deepen candy midtones, thin the pillar key, kill the floor bloom.

## Iteration 10 — 2026-09-16 (streak polish, `4bbc07a`)

Still: `parked-home.png` after deeper Ultra Red, thinner C-pillar key, damped floor gloss.

| Axis | Score | Notes |
| --- | --- | --- |
| Paint | PARTIAL | Candy Ultra Red with a visible C-pillar / rear-shoulder streak (not a plastic wrap). Midtones still flatter than nata; mesh normals cannot hold a razor highlight. |
| Glass | PARTIAL | Roof is a dark laminate slab; chrome beltline reads. Side/back IOR split is live; side glass still a cheap opening vs nata’s tinted pane. |
| Wheels | PARTIAL | Unchanged mesh ceiling (front well cutout). |
| Proportions | PARTIAL | Rear-right 3/4 matches nata’s yaw. Panel gaps remain 27k-derived. |
| Lighting | PARTIAL | White studio + deeper oval contact shadow. Floor gloss is present and blit-safe (no reflector RT). Mild left fill remains. |
| Leaders | PARTIAL | TRUNK Open card floats in empty studio with a long vertical to a decklid pin — no longer kissing the backlight. FRUNK still sits on the roof. |

**Ceiling (this lane):** paint/glass/lighting/leaders are as close as this CC-BY remesh + runtime PBR can get without a new mesh. Remaining FAILs that need a different mesh: fender-well wrap, side-glass laminate, panel gaps. Floor stays blit-safe.







---

# Lane: PR 7 — hostile visual critic (materials/leaders cleanup)

## Iteration 1
**Changes Made:**
- Removed noise textures from paint, increased metalness to 0.5, clearcoat to 1.0.
- Changed glass to be fully transparent with high transmission (0.9) and IOR 1.5.
- Changed environment lighting to "city" with intensity 1.2.
- Redesigned hotspot UI to be smaller, pill-shaped with blur, and thinner stems.
- Increased chrome metalness to 1.0 and roughness to 0.05.

**Hostile Critique:**
- **Paint**: The paint is better, no longer looking like sandpaper, but it's still a bit flat. It lacks the deep, rich subsurface scattering and the dual-tone effect of real automotive paint. The clearcoat needs more contrast.
- **Glass**: The glass is too transparent now. Real car glass has a tint and reflects the environment strongly at grazing angles (Fresnel effect). Right now it looks like it's barely there.
- **Wheels**: Still low-poly black cylinders. The rim material is slightly better, but the geometry is fundamentally flawed. We need to tweak the material to at least give it some fake depth or just accept the bad geometry for now.
- **Lighting**: The "city" environment is okay, but it might be too busy. A studio lighting setup with strong softboxes might highlight the car's curves better.
- **UI**: The hotspots are vastly improved. The pill shape and blur look modern. However, the stems are still a bit too dark, and the dots could be smaller.

**Score**: 6/10. Better than the plastic toy we started with, but not hyper-real yet.

**Next Steps:**
- Tweak paint to add a subtle flake normal map back in, but scale it down massively so it looks like metallic flake, not noise.
- Fix glass by increasing opacity slightly and ensuring the Fresnel effect is visible (maybe adjust specular/ior).
- Change environment to a high-contrast studio setup.

## Iteration 2
**Changes Made:**
- Added a very subtle flake normal map back to the paint (`0.005` scale) to give it a realistic metallic flake without the noise.
- Adjusted glass to have a slight dark tint (`#020202`), increased transmission to `0.85`, and bumped `envMapIntensity` to `2.5` for strong reflections.
- Changed environment lighting to "sunset" with intensity `1.5` for warmer, more dramatic reflections that highlight the car's curves.
- Refined UI leaders: made the stem a thin dark line (`rgba(0, 0, 0, 0.6)`), changed the dot to a small 4x4 square, and made the kicker text smaller and darker.

**Hostile Critique:**
- **Paint**: The paint is now much closer to the reference. The subtle flake adds realism without looking like a glitter bomb. The sunset lighting gives it that deep, rich look.
- **Glass**: The glass reflections are much better. The tint and high environment intensity make it look like real automotive glass rather than a black void or a clear window.
- **Lighting**: The sunset environment works well, but it might be slightly too warm depending on the exact reference. However, it provides the necessary contrast and soft reflections.
- **UI**: The UI is now sleek and elegant. The thin dark stems and small square dots perfectly match the hyper-real reference. The buttons are unobtrusive.
- **Wheels**: Still the weakest point. The rims are okay, but the geometry is just too simple. Without a new mesh, this is as good as it gets.

**Score**: 8.5/10. The materials and UI are now vastly improved and approach the hyper-real bar. The only thing holding it back is the underlying low-poly geometry of the wheels.

---

# Reconciled result — 2026-09-16 (PRs 6–9 folded into PR 2)

All four sibling lanes were merged into `cursor/parked-car-viz-typography-053e`
(order 9 → 8 → 6 → 7). Conflicts were resolved for the best combined visual:

- **Topology (PR 9):** the remeshed GLB with dark **wheel-well liner shells**
  (no red inner-well cavity) and the **`SideGlass` split** (roof keeps
  `Material.017`; near-vertical panes tint independently).
- **Wheels (PR 8):** side-aware 5-cover **aero wheels + hub anchoring**
  (`AeroWheel` + `wheelHubs`), no red caliper brick.
- **Paint / glass / studio (PR 6):** **candy Ultra Red** (streak clearcoat,
  no flake "glitter"), the `glassPanes` greenhouse split, and the blit-safe
  `parkedStudio` PMREM env + RectAreaLight keys + deep contact shadow.
- **Critic polish (PR 7):** the glassy-pill **leader/callout CSS**. PR 7's
  `sunset` env and see-through/transmissive glass were intentionally dropped —
  they fought PR 6's candy studio and PR 9's tinted laminate.

## Regressions found while integrating (and fixed)

1. **Black body.** PR 9's Catmull-Clark remesh ships near-zero UV islands, so
   `computeTangents` produced NaN/zero tangents that collapsed PR 6's candy
   clearcoat **normal-map** shading to unlit black on the whole body.
   Fix: `ensureMeshTangents` now validates tangents and, when they are
   degenerate, drops the tangent-space paint features (clearcoat normal map +
   anisotropy) for that mesh only. Body is candy red again.
2. **One aero wheel instead of four.** `GLTFLoader` sanitizes node names
   (`wheel.001` → `wheel001`), so the dotted-only hub regex matched only the
   first hub. Fix: match the sanitized form; all four corners now carry aero
   wheels.

| Axis | Score | Notes |
| --- | --- | --- |
| Paint | PASS-ish | Candy Ultra Red with a smooth studio sweep down the shoulder; no glitter, no black panels. On the remeshed body the tangent-space clearcoat *streak*/anisotropy micro-detail is dropped (degenerate UVs), so the sweep is a touch softer than PR 6 on the pre-remesh mesh — colour and gloss match. |
| Glass | PARTIAL | Side/rear/roof read as dark tinted laminate (no chrome-white blow-out); near-side front pane keeps a nata-like reflection. |
| Wheels | PARTIAL | Dark 5-cover aero on all four hubs, dark liner wells, no red caliper. Front wheels are largely occluded by the body from this rear-3/4 camera. |
| Proportions | PARTIAL | Rear-right 3/4 matches nata; creased character lines hold; low-poly side-mirror base + long front overhang remain the 27k-derived mesh ceiling. |
| Lighting | PARTIAL | Candy studio + deep oval contact shadow, blit-safe (8/8 QA scenes capture). |
| Leaders | PARTIAL | FRUNK/CHARGE attach cleanly; TRUNK card rides the long stem up toward empty studio but still grazes the roofline at this camera + mesh — the documented lane/mesh ceiling. |

**Honest remaining gaps:** the tangent-space clearcoat streak is disabled on the
remeshed body, the TRUNK leader can't reach fully-empty studio at this camera,
and true panel-gap/side-mirror fidelity still needs a higher-poly Highland mesh
that can't be fetched without a Sketchfab token. QA: `npm test` (30) +
`npm run typecheck` + `npm run qa:screenshots` (8/8) all green.
