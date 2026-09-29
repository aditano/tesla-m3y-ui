# Fidelity checklist

**Agents must update this file** when they change parked viz, FSD/map sync, Controls, chrome, type, or media/climate.

Status: `FAIL` / `PARTIAL` / `PASS`. Every FAIL needs a one-line reason. Compare against [`../references/REFERENCES.md`](../references/REFERENCES.md). Re-run `npm run qa:screenshots` and link the new still.

Baseline captured from this harness on 2026-09-16 (`docs/qa/screenshots/*.png`). FSD stills recaptured the same day after ego was sampled onto the canned polyline. OSM / MapLibre / OSRM mapping is in-scope to **keep**.

## Lane ownership

| Lane | Owns | Does not own |
| --- | --- | --- |
| Research + harness (this PR) | Inventory, references, `?qa=` scenes, this checklist | Car mesh, FSD-map math, Controls restyle |
| Car model / parked viz | Highland Park full-screen car, lighting, hotspots, P→D transition | Routing |
| FSD-map sync | Ego on the OSRM polyline; viz heading = map heading | Fonts, dock |
| Controls chrome | Overlay-on-map, left rail, Quick Controls, Search | Three.js car |

## Scene captures

| Scene | Latest still | vs reference | Status | Notes (update me) |
| --- | --- | --- | --- | --- |
| Parked home | `screenshots/parked-home.png` | `manual-m3-touchscreen-p8.jpg`, `nata-parked-car-vis.jpg`, `nata-status-bar.jpg` | PARTIAL | 2026-09-29. Same CC-BY Highland mesh. Light studio IBL, ACES, painted oval contact shadow (no shadow maps). Side glass is matte dark laminate; the white quarter-window sawtooth is gone. TRUNK card still sits on the decklid. Paint, wheels, and leaders stay PARTIAL. See `MESH_REVIEW.md`. Dark studio: `screenshots/parked-dark.png`. |
| Route set | `screenshots/route-set.png` | `manual-m3-maps-nav-p170.jpg`, `nata-trip-progress.jpg` | PARTIAL | 2026-09-28: light parked route card. Trip line follows `nata-trip-progress.jpg`: gray driven, blue ahead, orange/red traffic marks, red car arrowhead. Battery-on-arrival % sits on the ETA row. The map route has an orange/red traffic overlay. Traffic is **estimated** from OSRM segment speeds (public OSRM has no live feed); the QA route uses canned spans. Energy is a fixed ~250 Wh/mi model from `flags.batteryPct`. |
| FSD engaged | `screenshots/fsd-engaged.png` | `nata-ui-v12-hero.jpg`, `nata-intel-spring-update.jpg`, `nata-regen-speedometer.jpg` | PARTIAL | 2026-09-29: dark gray road, white lane lines, blue ego path, high rear chase. Traffic is rounded white/silver/gray blobs (one truck slot). Roadside pack adds a pedestrian, cones, a speed-limit disc, and a signal head. v12 media card and segmented meter unchanged. Still a canned occupancy scene, not Tesla's perception mesh. |
| Controls open | `screenshots/controls.png` | `nata-quick-controls.jpg`, `nata-controls-search.jpg` | PARTIAL | 2026-09-29: light sheet, search at top, left rail, Quick Controls tiles. Selected tiles are darker gray, not a blue fill; quick-accent stays blue. Montserrat. Overlay stays on the map. Not a pixel match of the Intel still. |
| Climate open | `screenshots/climate.png` | `manual-m3-climate-popup-p160.jpg` | PARTIAL | Compact popup from the dock fan button: main climate, seat heat, defrost, temp slider, Split. The temperature now opens the full screen (see next row). |
| Climate full | `screenshots/climate-full.png` | `manual-m3-climate-p158.jpg` | PARTIAL | 2026-09-28: new scene. Off/Keep/Dog/Camp, power/Auto/A/C, three airflow targets, Front/Rear, Schedule, dash illustration with air plumes, and a footer with seat heat, wiper defrost, steering heat, defrost, fan </> with Auto/HI, and recirc. The dash is a CSS illustration, not Tesla's cabin render. Vent targets are toggles, not draggable. |
| Media open | `screenshots/media.png` | `nata-media-player-full.jpg` | PARTIAL | Translucent on-viz player plus source cards (radio, TuneIn, streaming, USB, Caraoke) with colored glyphs. Active source is a white inset stroke. Stub sources stay disabled. |
| Viz expanded | `screenshots/viz-expanded.png` | `nata-park-assist-fullscreen.jpg` | PARTIAL | 2026-09-29: same occupancy road as FSD engaged, widened. Next-turn card top-left, trip card bottom-right. Still a canned scene, not park-assist blobs from the car's cameras. |

## Layout / type / chrome (all scenes)

| Check | Reference | Status | Notes |
| --- | --- | --- | --- |
| Typeface | Tesla UI is not Plus Jakarta Sans | PARTIAL | `--font` is Montserrat (OFL, Gotham-like) via `@fontsource/montserrat`. Still not Tesla's face; that cannot ship legally. |
| Status bar order (Park) | `nata-status-bar.jpg` | PARTIAL | Lock, profile+name, Sentry, Wi‑Fi toward the driver; clock + outdoor temp center; passenger airbag right as the two-line PASSENGER / AIRBAG **ON** chip (amber ON, light pill when parked). Cellular/range chips omitted vs some stills. |
| PRND / Auto Shift | `nata-auto-shift.jpg` | PARTIAL | 2026-09-28: parked column is PRND header, dotted rails on both sides, D, blue magnet with ^^ chevrons, top-down car, blue magnet with vv chevrons, R. Driving still uses the taller strip. |
| Dock: My Apps + climate cluster + volume | `manual-m3-touchscreen-p8.jpg` | PARTIAL | 2026-09-28: extra pinned Camera/Calendar/Energy icons removed; dock is Car + All Apps, climate cluster, volume. Touching the temperature opens the full climate screen (manual p.156). |
| Phone portrait (~390×844) | Mobile QA, not a Tesla phone UI | PASS | At ≤520px the dock is two rows (climate, then apps + volume). Charge/Frunk/Trunk are in-layout buttons; Navigate is full width; the disclaimer wraps inside the viewport. ≥521px, including phone landscape, keeps the single-row dock and 3D callouts. |
| Vertical power / regen meter | `nata-regen-speedometer.jpg` | PARTIAL | 2026-09-28: segmented column (14 power segments above a zero tick, 14 green regen below), lit from `meterSegments()`. Not pixel-matched to Tesla's graphic. |
| Larger speed readout | `nata-regen-speedometer.jpg`, driving-status PDF | PARTIAL | ~128px tabular speed on the viz, with limit sign and blue set-speed above the road. Montserrat, not Tesla’s type. |
| Map orientation + tracking chip | Maps PDF p.169 | PARTIAL | 2026-09-28: dragging the map shows a "Tracking Disabled" chip beside the orientation button for ~3 s, and the icon turns gray until recenter. Not covered by a QA still (all scenes track). |
| FSD viz ↔ map polyline | Tone + `nata-ui-v12-hero.jpg` (split viz/map); canned line stands in for OSRM | PASS | Marker on the route, heading-up so ahead is up; viz ribbon shares `interpolate()` at 32% of Pittsburgh→CMU. Driven portion of the map line is gray. Unit tests lock the frozen pose. |
| Parked full-screen vehicle | UI v12 notes + `nata-parked-car-vis.jpg` | PARTIAL | 2026-09-29: light and dark studios (`?theme=`). IBL softboxes, ACES, painted oval shadow. Side-window scraps that were light headliner are matte dark glass. Mesh is still the CC-BY Highland GLB. See `MESH_REVIEW.md`. |
| Controls overlay on **map only** | Touchscreen PDF + `nata-quick-controls.jpg` | PARTIAL | Sheet covers the map pane; viz and dock stay. Not a pixel match of the light Intel still. |

## How to record a pass

```
| Parked home | screenshots/parked-home.png | nata-parked-car-vis.jpg | PASS | Full-screen car, map chip top-right, Navigate+media lower third. 2026-09-xx screenshot.
```

If you only fixed one pane, mark that row PARTIAL and leave the others FAIL.
