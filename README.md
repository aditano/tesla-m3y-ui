# Tesla Model 3/Y Center Display (fan recreation)

Educational browser recreation of the Tesla Model 3 / Model Y **center touchscreen** (UI v12 / Highland-like dark theme): map, navigation, and a simulated Autopilot / Full Self-Driving visualization.

**Not affiliated with Tesla, Inc.** Tesla, Model 3, Model Y, Autopilot, and Full Self-Driving are trademarks of Tesla, Inc. This project is an independent fan / educational recreation. It does **not** use Tesla firmware, vehicle dumps, proprietary fonts, or proprietary map tiles.

Live demo (GitHub Pages): **https://aditano.github.io/tesla-m3y-ui/**

## What you can do

1. Search a real street address or place (OpenStreetMap Nominatim, Photon fallback).
2. See a Tesla-like dark map with a blue route, ETA, and turn list (OSRM on OSM roads).
3. Press **Start Full Self-Driving**.
4. Watch the car drive along the real road network while a 3D-ish visualization updates.
5. Click the chrome: map pan / zoom / rotate / heading-up, drag the viz divider to expand, Controls overlay, climate / media dock, PRND strip, status bar, cancel / end FSD.

Default origin is **downtown Pittsburgh** so the demo is consistent on GitHub Pages. Home / Work / Villanova shortcuts are on the Navigate sheet. Click the map (when idle) or the locate control to set a new origin; the site does not auto-jump to browser geolocation.

## How it works

| Piece | Implementation |
| --- | --- |
| UI | Vite + React + TypeScript. Original CSS / SVG / Three.js art. |
| Map | [MapLibre GL](https://maplibre.org/) + [OpenFreeMap](https://openfreemap.org/) dark vector tiles (OSM data, no API key). |
| Geocoding | [Nominatim](https://nominatim.org/) with debounce + cache; [Photon](https://photon.komoot.io/) fallback. |
| Routing | Public [OSRM](https://project-osrm.org/) car profile (`router.project-osrm.org`, then `routing.openstreetmap.de`). |
| Drive sim | Ego pose interpolates the routed polyline at a believable speed (step speed limits / turn slowing). |
| Visualization | Three.js + React Three Fiber. 2024 Model 3 Highland GLB from Tesla Studio (CC BY 4.0), lane ribbons, **simulated** nearby traffic and lights. |

State machine: **Parked (full-screen vehicle viz) → Navigating (route set) → FSD Engaged → Arrived / Disengaged**.

In Park the car is center-stage (UI v12 / Highland-like): small map card top-right, **Navigate** module lower-left, larger media strip in the dock. Drag the viz divider while driving to grow the visualization.

## Limitations (read this)

- **Not real FSD.** There is no camera perception, no occupancy network, no vehicle control. Nearby cars and signals are synthetic props for visual richness.
- Public OSRM / Nominatim instances can be slow or rate-limit. The UI identifies itself via Referer on GitHub Pages and debounces search.
- No Google Maps keys. No satellite / live traffic (those need paid or proprietary tiles).
- Best on a **landscape desktop** or large tablet. It is a 15″-class screen layout, not a phone UI.

## Local development

```bash
npm install
npm test
npm run dev
```

The Vite `base` is `/tesla-m3y-ui/` so local dev is at `http://localhost:5173/tesla-m3y-ui/`.

```bash
npm run build
npm run preview
```

## GitHub Pages

Push to `main`. `.github/workflows/deploy.yml` builds the static site and deploys with `actions/deploy-pages`. Repo Pages source must be **GitHub Actions** (`build_type=workflow`).

Pull requests run `.github/workflows/ci.yml` (`npm run typecheck`, `npm test`, and `npm run build`, plus a curl smoke of the production preview). Deploy stays on pushes to `main`.

No secrets are required for the default demo path.

## Attribution

- Map data © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors.
- Vector tiles: OpenFreeMap.
- Routing: OSRM / FOSSGIS.
- Geocoding: Nominatim / Komoot Photon.
- 3D Model 3: 2024 Highland by [RBLXSupercars](https://sketchfab.com/RBLXSupercars), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), copied from [tesla-studio](https://github.com/aditano/tesla-studio). See [LICENSE-3D.md](LICENSE-3D.md) and [public/models/highland/CREDITS.md](public/models/highland/CREDITS.md).
- UI type: [Inter](https://rsms.me/inter/) (OFL). Not Tesla’s proprietary font.

Layout is informed by publicly documented Tesla owner-manual behavior — status bar, map always present in Park, visualization expand, Controls overlay with Search, dock climate/media, PRND — and public UI v12 notes (NotATeslaApp parked viz: centered 3D vehicle, map snippet, Navigate To, media strip). Sources used for information architecture only (no copyrighted manual text is reproduced here):

- [Touchscreen](https://www.tesla.com/ownersmanual/model3/en_us/GUID-518C51C1-E9AC-4A68-AE12-07F4FF8C881E.html)
- [Operating Climate Controls](https://www.tesla.com/ownersmanual/model3/en_us/GUID-4F3599A1-20D9-4A49-B4A0-5261F957C096.html)
- [Maps and Navigation](https://www.tesla.com/ownersmanual/model3/en_us/GUID-01F1A582-99D1-4933-B5FB-B2F0203FFE6F.html)
- [Media](https://www.tesla.com/ownersmanual/model3/en_us/GUID-7A85FB6B-9DF6-4C55-A2F9-793207E48E9D.html)
- [Lights](https://www.tesla.com/ownersmanual/model3/en_us/GUID-1C209641-AA23-47AC-B0D1-3FE3779CF222.html)

Chrome uses **Inter Tight** (Google Fonts), not Tesla’s vehicle typeface. Existing open demos were used for inspiration only; this tree is original CSS / SVG aside from the attributed CC model.

## Fidelity / screenshot QA

Public inventory, fair-use reference stills, and a Playwright harness live under [`docs/`](docs/FIDELITY.md). Other agents must update [`docs/qa/CHECKLIST.md`](docs/qa/CHECKLIST.md) when they change parked viz, FSD/map sync, or Controls.

```bash
npm run qa:install          # once: Playwright Chromium
npm run qa:screenshots      # writes docs/qa/screenshots/*.png
```

Frozen scenes: `/?qa=parked-home` · `route-set` · `fsd-engaged` · `controls` · `climate` · `media` · `viz-expanded`.

## License

MIT. Original UI art in this repository. Do not add ripped Tesla assets.
