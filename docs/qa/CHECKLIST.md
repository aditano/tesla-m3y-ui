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
| Parked home | `screenshots/parked-home.png` | `manual-m3-touchscreen-p8.jpg`, `nata-parked-car-vis.jpg` | PARTIAL | Candy Ultra Red + C-pillar streak, pane-split glass, oval contact shadow, TRUNK card in empty studio (`parked-home.png` 2026-09-16). Still not Tesla viz-grade: front well cutout, side-glass openings. |
| Route set | `screenshots/route-set.png` | `manual-m3-maps-nav-p170.jpg`, `nata-trip-progress.jpg` | PARTIAL | Turn list + Start FSD sit on the parked fullscreen (map snippet TR). No traffic progress bar, no gray traveled path, no energy-to-destination. |
| FSD engaged | `screenshots/fsd-engaged.png` | `nata-ui-v12-hero.jpg`, `nata-intel-spring-update.jpg` (`manual-m3-driving-status-p16.jpg` is Car Status p.14, not a driving viz) | PARTIAL | CC Model 3 rides the ego-frame ribbon: heading-up MapLibre marker sits on the blue canned OSRM polyline and the viz +Z is that same heading (`interpolate()` at 32%). vs `nata-ui-v12-hero`: media still in the dock, not on the viz. vs `nata-intel-spring-update`: no occupancy mesh/buildings; traffic is boxes. 2026-09-16 screenshot. |
| Controls open | `screenshots/controls.png` | `nata-quick-controls.jpg`, `nata-controls-search.jpg` | PARTIAL | Search Settings at top. Left rail: Controls / Dynamics / Charging / Autopilot / Locks / Lights / Display / Trips / Navigation / Safety / Service / Software / Wi-Fi. Quick Controls: lights Off–Auto + Auto High Beam, Fold Mirrors / Child Lock / Window Lock, wipers Off–IIII, Mirrors / Unavailable / Car Wash, Steering / Camera / Glovebox, brightness + Auto. Overlay sits on the **map** (viz stays). Remaining: not pixel-identical icons/type. |
| Climate open | `screenshots/climate.png` | `manual-m3-climate-popup-p160.jpg` | PARTIAL | Compact dock popup: main climate, seat heat, front/rear defrost, temp slider, Split. Not the full main climate screen (vent targets / Dog / Camp). |
| Media open | `screenshots/media.png` | `nata-media-player-full.jpg` | PARTIAL | Translucent on-viz player: art, transport, scrubber, shuffle/repeat/search/EQ, source grid. Minimized one-line strip lives on the viz (parked media overlay from the viz lane). Stub sources (no licensed streaming apps). |
| Viz expanded | `screenshots/viz-expanded.png` | `nata-park-assist-fullscreen.jpg` | FAIL | Mini-map appears at extreme drag (>74%); ego/map pose match the FSD still (`interpolate()`). No centered Navigate + media on the viz. Surroundings look sparse. |

## Layout / type / chrome (all scenes)

| Check | Reference | Status | Notes |
| --- | --- | --- | --- |
| Typeface | Tesla UI is not Plus Jakarta Sans | PARTIAL | Inter Tight (licensed grotesque) via Google Fonts. Still not Tesla Sans / Universal. Do not rip car fonts. |
| Status bar order (Park) | `nata-status-bar.jpg` | PARTIAL | Lock, profile+name, Sentry, Wi‑Fi toward the driver; clock + outdoor temp center; passenger airbag right. Cellular/range chips omitted vs some stills. |
| PRND / Auto Shift | `nata-auto-shift.jpg` | PARTIAL | Parked is PRND header + D / top-down car / R with blue magnets (P lives in the header, not a full-height ladder). Missing nata chevron dots. Driving still uses the taller strip. |
| Dock: My Apps + climate cluster + volume | `manual-m3-touchscreen-p8.jpg` | PARTIAL | Car + apps left, climate cluster center, volume right. Media moved off the dock onto the viz (parked media overlay). Extra app icons remain. |
| Phone portrait (~390×844) | Mobile QA, not a Tesla phone UI | PASS | At ≤520px the dock is two rows (climate, then apps + volume). Charge/Frunk/Trunk are in-layout buttons; Navigate is full width; the disclaimer wraps inside the viewport. ≥521px, including phone landscape, keeps the single-row dock and 3D callouts. |
| Vertical power / regen meter | `nata-regen-speedometer.jpg` | missing | Should sit left of viz while driving. |
| Larger speed readout | `nata-regen-speedometer.jpg`, driving-status PDF | PARTIAL | HUD exists; type/size/placement off. |
| Map orientation + tracking chip | Maps PDF p.169 | PARTIAL | Compass toggle exists; no “Tracking Disabled” chip. |
| FSD viz ↔ map polyline | Tone + `nata-ui-v12-hero.jpg` (split viz/map); canned line stands in for OSRM | PASS | `fsd-engaged.png` 2026-09-16: marker on the blue route, heading-up so ahead is up; viz ribbon shares `interpolate()` at 32% of Pittsburgh→CMU. Unit tests lock the frozen pose to that sample. |
| Parked full-screen vehicle | UI v12 notes + `nata-parked-car-vis.jpg` | PARTIAL | Scene `parked-home`: candy Ultra Red, C-pillar streak, pane glass, oval shadow, TRUNK leader in empty studio. Front well cutout remains. See `LICENSE-3D.md` + `MESH_REVIEW.md`. |
| Controls overlay on **map only** | Touchscreen PDF + `nata-quick-controls.jpg` | PARTIAL | Sheet covers the map pane; viz and dock stay. Not a pixel match of the light Intel still. |

## How to record a pass

```
| Parked home | screenshots/parked-home.png | nata-parked-car-vis.jpg | PASS | Full-screen car, map chip top-right, Navigate+media lower third. 2026-09-xx screenshot.
```

If you only fixed one pane, mark that row PARTIAL and leave the others FAIL.
