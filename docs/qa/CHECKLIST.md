# Fidelity checklist

**Agents must update this file** when they change parked viz, FSD/map sync, Controls, chrome, type, or media/climate.

Status: `FAIL` / `PARTIAL` / `PASS`. Every FAIL needs a one-line reason. Compare against [`../references/REFERENCES.md`](../references/REFERENCES.md). Re-run `npm run qa:screenshots` and link the new still.

Baseline captured from this harness on 2026-09-16 (`docs/qa/screenshots/*.png`). OSM / MapLibre / OSRM mapping is in-scope to **keep**.

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
| Parked home | `screenshots/parked-home.png` | `manual-m3-touchscreen-p8.jpg`, `nata-parked-car-vis.jpg` | FAIL | Split viz+map. Not full-screen centered Highland Park. Map is the large pane, not a top-right snippet. |
| Route set | `screenshots/route-set.png` | `manual-m3-maps-nav-p170.jpg`, `nata-trip-progress.jpg` | PARTIAL | Turn list + Start FSD exist. No traffic progress bar, no gray traveled path, no energy-to-destination. |
| FSD engaged | `screenshots/fsd-engaged.png` | `manual-m3-driving-status-p16.jpg`, `nata-ui-v12-hero.jpg` | FAIL | Viz does not prove it sits on the same road the map drives. Cheap traffic/lanes. Media player is in the dock, not on the viz. |
| Controls open | `screenshots/controls.png` | `nata-quick-controls.jpg`, `nata-controls-search.jpg` | FAIL | Sheet covers the whole stage. Missing top Search, wrong categories (no Dynamics/Charging/Trips), tile layout ≠ Quick Controls. |
| Climate open | `screenshots/climate.png` | `manual-m3-climate-popup-p160.jpg` | FAIL | Generic panel, not Tesla popup (seats / defrost / Split slider). |
| Media open | `screenshots/media.png` | `nata-media-player-full.jpg` | FAIL | Small opaque dialog. v12 wants translucent player with scrubber, shuffle, repeat, search, EQ. |
| Viz expanded | `screenshots/viz-expanded.png` | `nata-park-assist-fullscreen.jpg` | FAIL | Mini-map exists only at extreme drag. No centered Navigate + media on the viz. Surroundings look sparse. |

## Layout / type / chrome (all scenes)

| Check | Reference | Status | Notes |
| --- | --- | --- | --- |
| Typeface | Tesla UI is not Plus Jakarta Sans | FAIL | Use a licensed grotesque similar to Universal/Tesla Sans. Do not rip car fonts. |
| Status bar order (Park) | `nata-status-bar.jpg` | FAIL | Profile / Sentry / Wi‑Fi should sit toward the driver; weather/temp missing. |
| PRND / Auto Shift | `nata-auto-shift.jpg` | FAIL | Always-on full-height strip. Highland is compact. |
| Dock: My Apps + climate cluster + volume | `manual-m3-touchscreen-p8.jpg` | FAIL | Extra app icons, climate not a Tesla cluster, media lives in the dock instead of on viz. |
| Vertical power / regen meter | `nata-regen-speedometer.jpg` | missing | Should sit left of viz while driving. |
| Larger speed readout | `nata-regen-speedometer.jpg`, driving-status PDF | PARTIAL | HUD exists; type/size/placement off. |
| Map orientation + tracking chip | Maps PDF p.169 | PARTIAL | Compass toggle exists; no “Tracking Disabled” chip. |
| FSD viz ↔ map polyline | Tone + driving-status PDF | FAIL | Other lane. Harness scene `fsd-engaged` is the regression still. |
| Parked full-screen vehicle | UI v12 notes + `nata-parked-car-vis.jpg` | FAIL | Other lane. Scene `parked-home`. |
| Controls overlay on **map only** | Touchscreen PDF + `nata-quick-controls.jpg` | FAIL | Other lane. Scene `controls`. |

## How to record a pass

```
| Parked home | screenshots/parked-home.png | nata-parked-car-vis.jpg | PASS | Full-screen car, map chip top-right, Navigate+media lower third. 2026-09-xx screenshot.
```

If you only fixed one pane, mark that row PARTIAL and leave the others FAIL.
