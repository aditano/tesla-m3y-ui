# Visual QA harness

Playwright captures the seven frozen UI states other agents must beat.

## Run

```bash
npm install
npx playwright install chromium   # or: npm run qa:install
npm test                          # unit tests, including canned QA scenes
npm run qa:screenshots            # writes docs/qa/screenshots/<scene>.png
```

Dev server is started automatically (`vite` on `http://127.0.0.1:5173/tesla-m3y-ui/`).

Manual inspect (same fixtures, no Playwright):

```
http://localhost:5173/tesla-m3y-ui/?qa=parked-home
http://localhost:5173/tesla-m3y-ui/?qa=route-set
http://localhost:5173/tesla-m3y-ui/?qa=fsd-engaged
http://localhost:5173/tesla-m3y-ui/?qa=controls
http://localhost:5173/tesla-m3y-ui/?qa=climate
http://localhost:5173/tesla-m3y-ui/?qa=media
http://localhost:5173/tesla-m3y-ui/?qa=viz-expanded
```

GitHub Pages: `https://aditano.github.io/tesla-m3y-ui/?qa=parked-home`.

## What the harness freezes

- Disclaimer dismissed
- Clock `4:20 PM` (Tesla manual example time)
- Drive loop (`qa.frozen` skips `tickDrive`)
- Parked studio auto-rotate
- Map ease/fit durations
- Canned Pittsburgh → CMU polyline (no live OSRM)

Map **tiles** still load from OpenFreeMap. Wait for `html[data-qa-ready="true"]` (map `idle` or 4.5s fallback).

## After you change chrome / viz / FSD

1. `npm run qa:screenshots`
2. Commit the new `docs/qa/screenshots/*.png` if the pixels are meant to be the new baseline
3. Update every touched row in [`CHECKLIST.md`](CHECKLIST.md)

Do not mark a row PASS unless you compared the new still to a file in [`../references/`](../references/REFERENCES.md).
