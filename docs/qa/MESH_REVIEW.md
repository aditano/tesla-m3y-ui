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
