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
| `climate` | Climate popup / full climate from the dock temperature. |
| `media` | v12 media player (translucent, shuffle/repeat/search on the card). |
| `viz-expanded` | Visualization dragged wide; small map top-right; media + Navigate remain. |

Scenes are **canned**. They do not call live OSRM. Pose, clock (`4:20 PM`), and the drive loop are frozen so screenshots are comparable.

## Legal / asset rules

- Research **only** from public web: Tesla owner manuals, Tesla software-release notes republished by press, NotATeslaApp articles.
- Do **not** paste large copyrighted manual text into the repo. Inventory files summarize **function lists** and cite URLs.
- Do **not** add firmware dumps, leaked Figma kits, or fonts ripped from the car. Use a licensed look-alike (currently Inter OFL — PARTIAL vs Tesla’s UI type; still not Tesla Sans).
- Reference images are fair-use stills for offline comparison, attributed in [`REFERENCES.md`](references/REFERENCES.md). They are **not** to be bundled into the shipped UI.

## Current verdict (this pass)

Parked viz hyper-real campaign (CC-BY David_Holiday derivative, not a new Sketchfab download):

- Parked home is a **full-screen rear-right Model 3** on a white studio, with a subdivided/bevelled CC-BY mesh (~94k faces), candy Ultra Red clearcoat + C-pillar streak, pane-split glass IOR, oval contact shadow, original 5-cover aero wheels, and a TRUNK Open card on a long vertical in empty studio. Score: **PARTIAL** vs `nata-parked-car-vis.jpg` — materials/leaders moved; front well cutout and side-glass openings remain a mesh ceiling. See `docs/qa/MESH_REVIEW.md`.
- Type is Inter (OFL). Still not Tesla Sans. Score: **PARTIAL**.
- Park status-bar order and parked PRND remain **PARTIAL**.
- FSD viz shares the map pose. The driving world is a gray studio road with a blue lane, pale block buildings, and car-shaped traffic — simulated, not an occupancy mesh. Speed, a vertical power/regen bar, and an on-viz media strip are on the visualization; expanded viz keeps Navigate + media centered.
- Dock climate cluster and Controls chrome are still not pixel matches (other lanes).

The harness exists so those gaps are **measurable**. Update [`qa/CHECKLIST.md`](qa/CHECKLIST.md) on every visual PR.
