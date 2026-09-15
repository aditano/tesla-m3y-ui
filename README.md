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

Default origin is **downtown Pittsburgh**. Home / Work / Villanova shortcuts are on the Navigate sheet. Click the map (when idle) to set a new origin if GPS is denied.

## How it works

| Piece | Implementation |
| --- | --- |
| UI | Vite + React + TypeScript. Original CSS / SVG / Three.js art. |
| Map | [MapLibre GL](https://maplibre.org/) + [OpenFreeMap](https://openfreemap.org/) dark vector tiles (OSM data, no API key). |
| Geocoding | [Nominatim](https://nominatim.org/) with debounce + cache; [Photon](https://photon.komoot.io/) fallback. |
| Routing | Public [OSRM](https://project-osrm.org/) car profile (`router.project-osrm.org`, then `routing.openstreetmap.de`). |
| Drive sim | Ego pose interpolates the routed polyline at a believable speed (step speed limits / turn slowing). |
| Visualization | Three.js / React Three Fiber. Stylized Model 3 mesh, lane ribbons, **simulated** nearby traffic and lights. |

State machine: **Parked → Navigating (route set) → FSD Engaged → Arrived / Disengaged**.

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

No secrets are required for the default demo path.

## Attribution

- Map data © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors.
- Vector tiles: OpenFreeMap.
- Routing: OSRM / FOSSGIS.
- Geocoding: Nominatim / Komoot Photon.

Layout is informed by publicly documented Tesla owner-manual behavior (status bar, map always present in Park, visualization expand, Controls overlay, dock, PRND) and public UI v12 notes. Existing open demos were used for inspiration only; this tree is original.

## License

MIT. Original UI art in this repository. Do not add ripped Tesla assets.
