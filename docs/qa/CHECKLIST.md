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
| Parked home | `screenshots/parked-home.png` | `manual-m3-touchscreen-p8.jpg`, `nata-parked-car-vis.jpg`, `nata-status-bar.jpg` | PARTIAL | 2026-09-25. TRUNK card sits on the decklid (`parked-cabin.png` is the glasshouse crop). Cabin pads, dash, and floors use interior colors; Ultra Red stays on the outer shell. Paint, glass, wheels, lighting, and leaders stay PARTIAL. See `MESH_REVIEW.md`. |
| Route set | `screenshots/route-set.png` | `manual-m3-maps-nav-p170.jpg`, `nata-trip-progress.jpg` | PARTIAL | Turn list + Start FSD sit on the parked fullscreen (map snippet TR). Trip progress track is on the card; at the origin it is empty because nothing has been driven. Gray traveled path appears once the car moves (see FSD still). No traffic coloring, no energy-to-destination. |
| FSD engaged | `screenshots/fsd-engaged.png` | `nata-ui-v12-hero.jpg`, `nata-intel-spring-update.jpg`, `nata-regen-speedometer.jpg` (`manual-m3-driving-status-p16.jpg` is Car Status p.14, not a driving viz) | PARTIAL | Low rear chase. Speed reads the number plus **mph** (not a mode name), hairline power bar on the left. Media card: title left, art right, `m:ss` and `−m:ss` on the scrubber. Gray street, blue lane, charcoal map with streets. Car mesh is the Studio Highland import. |
| Controls open | `screenshots/controls.png` | `nata-quick-controls.jpg`, `nata-controls-search.jpg` | PARTIAL | Search Settings at top. Left rail: Controls / Dynamics / Charging / Autopilot / Locks / Lights / Display / Trips / Navigation / Safety / Service / Software / Wi-Fi. Quick Controls: lights Off–Auto + Auto High Beam, Fold Mirrors / Child Lock / Window Lock, wipers Off–IIII, Mirrors / Unavailable / Car Wash, Steering / Camera / Glovebox, brightness + Auto. Overlay sits on the **map** (viz stays). Remaining: not pixel-identical icons/type. |
| Climate open | `screenshots/climate.png` | `manual-m3-climate-popup-p160.jpg` | PARTIAL | Compact dock popup: main climate, seat heat, front/rear defrost, temp slider, Split. Not the full main climate screen (vent targets / Dog / Camp). |
| Media open | `screenshots/media.png` | `nata-media-player-full.jpg` | PARTIAL | Translucent on-viz player: large title left, art right, centered transport, thick white scrubber with thumb, shuffle/repeat/search/EQ, source grid. Minimized strip spans the viz. Stub sources (no licensed streaming apps). |
| Viz expanded | `screenshots/viz-expanded.png` | `nata-park-assist-fullscreen.jpg` | PARTIAL | Mini-map stays a map. Navigate card and media card sit on the same street chase as FSD. Density is lighter than the park-assist still. |

## Layout / type / chrome (all scenes)

| Check | Reference | Status | Notes |
| --- | --- | --- | --- |
| Typeface | Tesla UI is not Plus Jakarta Sans | PARTIAL | Inter Tight (licensed grotesque) via Google Fonts. Still not Tesla Sans / Universal. Do not rip car fonts. |
| Status bar order (Park) | `nata-status-bar.jpg` | PARTIAL | Lock, profile+name, Sentry, Wi‑Fi toward the driver; clock + outdoor temp center; passenger airbag right. Cellular/range chips omitted vs some stills. |
| PRND / Auto Shift | `nata-auto-shift.jpg` | PARTIAL | Parked is a tight PRND header + D / top-down car / R with blue magnet halos. Missing nata chevron dots. Driving still uses the taller strip. |
| Dock: My Apps + climate cluster + volume | `manual-m3-touchscreen-p8.jpg` | PARTIAL | Parked dock is light to match the studio. Car + folder All Apps (2026.14 glyph) left, climate cluster center, volume right. Extra pinned app icons remain. |
| Phone portrait (~390×844) | Mobile QA, not a Tesla phone UI | PASS | At ≤520px the dock is two rows (climate, then apps + volume). Charge/Frunk/Trunk are in-layout buttons; Navigate is full width; the disclaimer wraps inside the viewport. ≥521px, including phone landscape, keeps the single-row dock and 3D callouts. |
| Vertical power / regen meter | `nata-regen-speedometer.jpg` | PARTIAL | Hairline bar sits immediately left of the speed readout while driving. Cruise shows a little power; braking fills green downward. Not the segmented Tesla graphic. |
| Larger speed readout | `nata-regen-speedometer.jpg`, driving-status PDF | PARTIAL | ~128px tabular speed on the viz, with limit sign and blue set-speed above the road. Still Inter Tight, not Tesla’s type. |
| Map orientation + tracking chip | Maps PDF p.169 | PARTIAL | Compass toggle exists; no “Tracking Disabled” chip. |
| FSD viz ↔ map polyline | Tone + `nata-ui-v12-hero.jpg` (split viz/map); canned line stands in for OSRM | PASS | Marker on the route, heading-up so ahead is up; viz ribbon shares `interpolate()` at 32% of Pittsburgh→CMU. Driven portion of the map line is gray. Unit tests lock the frozen pose. |
| Parked full-screen vehicle | UI v12 notes + `nata-parked-car-vis.jpg` | PARTIAL | Scene `parked-home` loads the Studio Highland mesh. Outer panels are Ultra Red; the cabin tub is interior plastic, carpet, and pad colors. TRUNK leader sits on the decklid. See `LICENSE-3D.md` + `MESH_REVIEW.md`. |
| Controls overlay on **map only** | Touchscreen PDF + `nata-quick-controls.jpg` | PARTIAL | Sheet covers the map pane; viz and dock stay. Not a pixel match of the light Intel still. |

## How to record a pass

```
| Parked home | screenshots/parked-home.png | nata-parked-car-vis.jpg | PASS | Full-screen car, map chip top-right, Navigate+media lower third. 2026-09-xx screenshot.
```

If you only fixed one pane, mark that row PARTIAL and leave the others FAIL.
