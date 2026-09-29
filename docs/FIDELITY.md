# Fidelity program

This folder is the **Research + Fidelity Harness** lane for the Model 3/Y center-display recreation.

Goal: other agents can iterate against **public** Tesla UI v12 / Highland references instead of guessing. Mapping/routing (OSM / MapLibre / OSRM) stays; chrome, parked visualization, FSD-map sync, and the car model are scored here.

**Not affiliated with Tesla, Inc.** Fan / educational recreation only.

## What this lane owns

| Deliverable | Path |
| --- | --- |
| Center-screen inventory (function lists, public URLs) | [`manual-inventory.md`](manual-inventory.md) |
| Fair-use reference stills + source log | [`references/REFERENCES.md`](references/REFERENCES.md) |
| Screenshot QA harness + agent checklist | [`qa/README.md`](qa/README.md), [`qa/CHECKLIST.md`](qa/CHECKLIST.md) |

## What this lane does **not** own

Do not implement these here. Score them on the checklist and leave the code to the named lane:

- **Car model / parked viz** — Highland full-screen centered vehicle, studio lighting, trunk/frunk/charge-port hotspots, Park-to-Drive transition.
- **FSD ↔ map sync** — ego pose, heading, and route ribbon must match MapLibre + OSRM. Visualization must not “slide off” the road the car is driving.
- **Controls chrome** — overlay that covers the **map** (not a generic modal), left rail, Quick Controls tiles, Search at top of Controls.

Keep OSM / MapLibre / OSRM. Do not replace them with proprietary tiles, firmware dumps, or ripped UI kits.

## How to compare (required loop)

1. Open the matching still in [`references/`](references/) (see [`REFERENCES.md`](references/REFERENCES.md)).
2. Load the app scene: `http://localhost:5173/tesla-m3y-ui/?qa=<scene>` (see [QA scenes](#qa-scenes)).
3. Capture a fresh still with `npm run qa:screenshots`.
4. Diff layout, type, and controls against the reference — not against memory.
5. Update the row in [`qa/CHECKLIST.md`](qa/CHECKLIST.md). Do not leave a FAIL without a one-line reason.

Live GitHub Pages also accepts the same query: `https://aditano.github.io/tesla-m3y-ui/?qa=parked-home`.

## QA scenes

| `?qa=` | Intended real UI state |
| --- | --- |
| `parked-home` | Park, no route. Highland full-screen centered car, map snippet top-right, Navigate + media in the lower third. |
| `route-set` | Park with an active turn list, ETA, Cancel + Start Self-Driving. |
| `fsd-engaged` | Drive, blue Self-Driving readout, speed / limit / set speed, visualization aligned with the map route. |
| `controls` | Controls overlay on top of the map; Quick Controls first. |
| `climate` | Compact climate popup from the dock fan button. |
| `climate-full` | Main climate screen from the dock temperature (Keep/Dog/Camp, airflow, fan, seats). |
| `media` | v12 media player (translucent, shuffle/repeat/search on the card). |
| `viz-expanded` | Visualization dragged wide; small map top-right; media + Navigate remain. |

Scenes are **canned**. They do not call live OSRM. Pose, clock (`4:20 PM`), and the drive loop are frozen so screenshots are comparable.

## Legal / asset rules

- Research **only** from public web: Tesla owner manuals, Tesla software-release notes republished by press, NotATeslaApp articles.
- Do **not** paste large copyrighted manual text into the repo. Inventory files summarize **function lists** and cite URLs.
- Do **not** add firmware dumps, leaked Figma kits, or fonts ripped from the car. Use a licensed look-alike (currently Montserrat OFL — PARTIAL vs Tesla’s UI type; still not Tesla Sans).
- Reference images are fair-use stills for offline comparison, attributed in [`REFERENCES.md`](references/REFERENCES.md). They are **not** to be bundled into the shipped UI.

## Current verdict (2026-09-29 visual pass)

Target is the center display in customer cars on software **2024.14 / 2025.x** chrome with a Highland park scene. Layout stills in `docs/references/` stay the comparison set. Tesla’s Unreal mesh is not used. GitHub Pages base path is `/tesla-m3y-ui/`.

- Parked home is a **rear three-quarter** of the CC-BY 2024 Highland GLB (179,692 triangles, RBLXSupercars). Light studio is the default; `?theme=dark` is the night studio. Lighting is an IBL plus soft key/rim, ACES tone mapping, and a painted oval under the car (shadow maps stay off). Side glass is matte dark; the white quarter-window sawtooth is recolored mesh, not a new model. Score: **PARTIAL** vs `nata-parked-car-vis.jpg`. See `docs/qa/MESH_REVIEW.md`.
- Type is Montserrat (OFL). Still not Tesla Sans. Score: **PARTIAL**.
- All Apps is a squircle grid (Camera, Climate, Media, Energy, Phone, Calendar, Nav, Theater). Camera opens a stylized 2×2 feed, not real cameras. Controls tiles use a light sheet and gray selected state.
- FSD viz shares the map pose. The chase camera looks down a dark gray road: white lane lines, a blue path, rounded white/silver/gray vehicles, a pedestrian, cones, a speed-limit disc, and a signal head. Score: **PARTIAL** vs `nata-ui-v12-hero.jpg`.
- Media source cards use colored glyphs. The dock temperature opens the full climate screen. Controls covers the map side and is still not a pixel match.
- Parked status order is lock, driver profile, Sentry, Wi-Fi, centered clock and outdoor temperature, then the passenger-airbag chip. Cellular stays off that bar.
- Reverse hides the navigation map and shows the rear of the Highland with ground guidance. That is a visualization state, not a backup camera. Park restores the parked shell.
- A set route card shows ETA, duration, distance, turns, and Cancel. Self-driving shares one ego pose between the visualization and the map marker. The driven part of the route is gray and the part ahead is blue.

The harness exists so those gaps are **measurable**. Update [`qa/CHECKLIST.md`](qa/CHECKLIST.md) on every visual PR.
