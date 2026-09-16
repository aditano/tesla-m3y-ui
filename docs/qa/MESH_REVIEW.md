# Parked mesh review

Compare `docs/qa/screenshots/parked-home.png` to `docs/references/nata-parked-car-vis.jpg`.
Scores: `FAIL` / `PARTIAL` / `PASS`. One line each. Loop until near PASS or document a ceiling.

Legal: CC-BY-4.0 David_Holiday derivative only. No Tesla firmware meshes.

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




