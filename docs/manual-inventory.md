# Center-screen inventory (Model 3 / Model Y)

Public owner-manual coverage of the **center touchscreen**. Function lists only — no large quotations of Tesla manual prose.

Primary public sources (retrieved 2026-09-16):

- Model 3 US index: https://www.tesla.com/ownersmanual/model3/en_us/GUID-538D748E-6DDF-4910-A898-C17E2B671A77.html
- Model Y US index: https://www.tesla.com/ownersmanual/modely/en_us/
- Model 3 Touchscreen (HK HTML, same GUID as other locales): https://www.tesla.com/ownersmanual/model3/en_hk/GUID-518C51C1-E9AC-4A68-AE12-07F4FF8C881E.html
- Model Y Touchscreen (CN public HTML): https://www.tesla.cn/ownersmanual/modely/en_pr/GUID-518C51C1-E9AC-4A68-AE12-07F4FF8C881E.html
- Model 3 Maps: https://www.tesla.com/ownersmanual/model3/en_us/GUID-01F1A582-99D1-4933-B5FB-B2F0203FFE6F.html
- Model 3 Climate: https://www.tesla.com/ownersmanual/model3/en_us/GUID-6E3E7A58-8A2F-4648-BEDD-90CD1BB94FD4.html
- Model 3 Operating Climate: https://www.tesla.com/ownersmanual/model3/en_us/GUID-4F3599A1-20D9-4A49-B4A0-5261F957C096.html
- Model 3 Media: https://www.tesla.com/ownersmanual/model3/en_us/GUID-7A85FB6B-9DF6-4C55-A2F9-793207E48E9D.html
- Model 3 FSD Supervised: https://www.tesla.com/ownersmanual/model3/en_us/GUID-2CB60804-9CEA-4F4B-8B04-09B991368DC5.html
- Model Y FSD Supervised (same GUID family): https://www.tesla.com/ownersmanual/modely/en_us/GUID-2CB60804-9CEA-4F4B-8B04-09B991368DC5.html
- Model 3 EU PDF (Touchscreen / Maps / Climate / Media chapters): https://www.tesla.com/ownersmanual/model3/en_eu/Owners_Manual.pdf
- Model Y US PDF: https://www.tesla.com/ownersmanual/modely/en_us/Owners_Manual.pdf
- Model 3 / Y CN PDFs (same chapter structure; used for figure stills): https://www.tesla.cn/ownersmanual/model3/en_pr/Owners_Manual.pdf · https://www.tesla.cn/ownersmanual/modely/en_pr/Owners_Manual.pdf

UI v12 / 2024.14 layout notes (not the owner manual, but the Highland parked + media chrome this recreation targets):

- https://www.notateslaapp.com/news/1988/inside-teslas-new-v12-user-interface
- https://www.notateslaapp.com/news/2017/best-videos-and-photos-of-tesla-update-2024-14-features
- https://www.notateslaapp.com/news/2018/an-in-depth-look-at-teslas-new-music-player-in-update-2024-14-photos-video
- https://www.notateslaapp.com/news/2042/a-look-at-the-22-unlisted-changes-in-teslas-2024-14-update
- https://www.notateslaapp.com/software-updates/version/2024.14/release-notes

Status key: **stub** (labeled control, wrong chrome), **partial** (works, layout/type off), **ok** (keep), **missing**.

---

## Displays / Touchscreen

Always-on landscape center display. Manual callouts (Model 3/Y Touchscreen):

| # | Surface | Functions (summary) | Recreate | Status | Lane |
| --- | --- | --- | --- | --- | --- |
| 1 | Status bar | Lock, weather/temp/AQI (premium), clock, driver profile (Park), Sentry shortcut, Wi‑Fi, cellular, passenger airbag, GPS-access, cabin-camera attentiveness while Self-Driving | Gear / lock / Sentry / wifi / cell / clock / range | partial — clock center; Tesla v12 parks profile/Sentry/Wi‑Fi toward the driver; weather/temp missing | chrome |
| 2 | Navigation / map | Always on except Reverse. North Up / Heading Up, tracking, search, route | MapLibre dark OSM map, compass, search | **ok to keep** OSM stack; chrome/search placement off | maps (keep) |
| 3 | Car status / visualization | Park: 3D vehicle, open trunks/charge port, Media / tires / Trip cards. Drive: speed, power meter, detected vehicles, proximity rays, blue Autosteer lane, speed-limit badge, set speed. Drag to expand; more detail (markings, lights, objects) when FSD Visualization Preview / FSD Supervised is on. Reverse: backup camera (out of scope). | Split Three.js pane | stub — not Highland full-screen Park; viz cheap; not synced to map | parked viz + FSD sync |
| 4 | Drive mode strip | P R N D; swipe from driver edge. Highland Auto Shift is compact (room for gear + media). | Left PRND column always visible | partial — always-on full strip, not swipe/Auto Shift compact | chrome |
| 5 | Controls | Overlay **on the map**. Left categories + Search at top. | Gear opens a sheet | stub — wrong rail, missing Search, covers viz+map | Controls chrome |
| 6 | Climate (driver) | Temp stepper, Split, tap icon → full climate | Dock temps | partial | chrome |
| 7 | Media shortcut | Swipe min/max player | Dock card | stub vs v12 player | chrome |
| 8 | Full-screen Park view | Swipe toward passenger: full-screen Park with media + navigation | Missing | **missing** — Tone’s top FAIL | parked viz |
| 9 | My Apps | Customizable dock shortcuts | Four app buttons | stub | chrome |
| 10 | App launcher | Tray over the map; drag down to close | Apps tray | stub | chrome |
| 11 | Recent apps | Next to My Apps | Missing | missing | chrome |
| 12 | Climate (passenger) | Shown when Split | Second temp | partial | chrome |
| 13 | Volume | Bottom corner; nav volume is separate | Slider | partial | chrome |

Manual also lists: popup alerts at bottom of the screen, Learn More on vehicle alerts, bell list inside Controls, restart-touchscreen (hold both scroll wheels — hardware, skip).

---

## Maps and Navigation

https://www.tesla.com/ownersmanual/model3/en_us/GUID-01F1A582-99D1-4933-B5FB-B2F0203FFE6F.html

| Function | Summary | Recreate | Status |
| --- | --- | --- | --- |
| Map always present | Except Reverse | Yes | ok |
| Gestures | Drag pan, two-finger rotate, pinch zoom | MapLibre | ok |
| Tracking Disabled | Gray compass after pan; tap North/Heading to resume | Tracking flag + compass | partial |
| North Up / Heading Up | Heading icon includes compass | Toggle | partial |
| Route overview | While navigating | fitBounds on route | partial |
| Park-only map tools | Satellite, traffic, POIs, chargers, weather overlay (premium) | Missing (no proprietary tiles — OK) | n/a / document |
| Drop pin | Long-press → popup Navigate / Favorite | Click-to-set origin | partial (not long-press favorite) |
| Search | Address, business, Home, Work, Charging, Recents, Favorites, Hungry, Lucky | Nominatim + Home/Work/Villanova | partial |
| Turn list | ETA, duration, distance, energy remaining / round-trip, Set Arrival %, Superchargers via Trip Planner | ETA / duration / miles / turns | partial — no energy/traffic bar |
| Trip progress | Color-coded traffic along remaining route; traveled path turns gray | Missing | missing (v12) |
| Better route | Prompt to accept faster Online Routing | Missing | missing |
| Cancel | Bottom of turn list | Cancel | ok |
| Stops | Add / reorder / Search Along Route | Missing | missing |
| Automatic Navigation | Calendar / commute predict | Skip | n/a |
| Navigate on Autopilot | Blue single-line lane on viz | Not this product (we simulate FSD) | n/a |
| Settings | Voice guidance volume, Automatic Navigation, Trip Planner, Online Routing, Avoid Ferries/Tolls | Controls > Navigation stubs | stub |

**Keep:** OSM geocode + OSRM. Do not switch to Google/Tesla tiles.

---

## Climate

https://www.tesla.com/ownersmanual/model3/en_us/GUID-4F3599A1-20D9-4A49-B4A0-5261F957C096.html

| Function | Summary | Status |
| --- | --- | --- |
| Popup from dock arrows | Main climate, seat heat/vent, front/rear defrost, temp slider, Split | stub popup (full panel instead of Tesla popup) |
| Main climate | Power, Auto, fan slider (Low/Med/High in Auto), recirc, vent targets (face/foot/windshield), A/C, front/rear cabin, passenger vent independent | partial tiles |
| Seats | 3-level heat/vent, Auto with climate | dock 0/3 only |
| Steering wheel heat | Auto with climate; pin to My Apps | Controls stub |
| Schedule / Keep Climate On / Dog (Pet) / Camp | Park only, ≥20% battery | missing |
| Cabin Overheat Protection | Controls > Safety | missing |
| Rear screen climate (Highland 3) | Out of scope unless we add a rear display | missing |

---

## Media

https://www.tesla.com/ownersmanual/model3/en_us/GUID-7A85FB6B-9DF6-4C55-A2F9-793207E48E9D.html  
v12 player: https://www.notateslaapp.com/news/2018/an-in-depth-look-at-teslas-new-music-player-in-update-2024-14-photos-video

| Function | Summary | Status |
| --- | --- | --- |
| Sources | Streaming apps, FM, Bluetooth, USB, Caraoke; hide unused | stub Radio |
| v12 player | Album art, title, thick scrubber with thumb, shuffle/repeat/search/EQ on the card, translucent over viz | stub opaque dock card |
| Minimized | One-line strip **in the visualization**, not a dock icon | missing |
| Recents / Favorites / Up Next | Full music app | missing |
| Volume | Scroll wheel + corner control; mute; nav volume separate | slider only |
| Theater / Arcade / Toybox | Park only | launcher stubs |

---

## Controls

Overlay appears **over the map**. Search is persistent at the top (2024.14). Left rail categories observed in public stills / manual:

| Category | Typical functions (summary) | Status |
| --- | --- | --- |
| Quick Controls | Lights Off/Parking/On/Auto, wipers Off/Auto/I–IIII, fold mirrors, child lock, window lock, steering/mirror heat, car wash, glovebox, display brightness | stub tiles, wrong grid |
| Dynamics (was Pedals & Steering) | Accel, regen, Stopping Mode, Steering Weight Light/Standard/Heavy | stub “Driving” |
| Charging | Charge limit, scheduled charge, ports | missing |
| Autopilot / Self-Driving | FSD Supervised on/off, Tap to Start FSD, speed profile, following distance, visualization preview | stub copy |
| Locks | Walk-Away, child lock, keys, windows | partial |
| Lights | Exterior modes, interior, fog | partial |
| Display | Language, energy %, units, brightness, rear display lock, Pet Mode image | partial |
| Trips | Trip meters | missing |
| Navigation | Online routing, avoid tolls/ferries/highways, automatic nav | stub |
| Safety | Sentry, Park Assist chimes, Joe Mode, Cabin Overheat, passenger airbag | partial |
| Service | Wiper/jack/camera calibration, factory reset | stub |
| Software | Version, Additional Vehicle Info, Name Your Vehicle, Release Notes | stub |
| Wi-Fi / Bluetooth | Status bar + Controls | missing sheets |

v12 also rearranged status-bar icons while Parked (profile, Wi‑Fi, Sentry closer to the driver).

---

## FSD Supervised / driving visualization

https://www.tesla.com/ownersmanual/model3/en_us/GUID-2CB60804-9CEA-4F4B-8B04-09B991368DC5.html  
Model Y PDF: expand/condense visualization by dragging the car-status area; expanded view adds markings, stop lights, objects.

| Function | Summary | Status |
| --- | --- | --- |
| Enable in Park | Controls > Self-Driving > Full Self-Driving (Supervised) | stub |
| Start | Right scroll **or** Start Self-Driving on screen; optional Brake Confirm from Park; may shift P→D/R and pull out | “Start Full Self-Driving” on route card |
| Speed profiles | Sloth / Chill / Standard / Hurry / Mad Max | missing |
| Visualization | Cameras → surrounding model; other vehicles, brake/turn lamps, lane color when Autosteer/FSD active, proximity rays | cheap synthetic traffic |
| Expand | Drag car-status; mini map top-right in UI v12; media + Navigate stay | divider exists; mini-map only when almost full; media not on viz |
| Driver attentiveness | Cabin camera icon on status bar | missing |
| Cancel | Brake / End Self-Driving | End button |
| Alignment | Manual: viz is the **detected road**. Recreation must keep Three.js ego on the **same polyline** MapLibre draws from OSRM | **FAIL** per Tone — other lane |

This project must remain labeled **simulated**. No Autopilot weights, occupancy nets, or firmware.

---

## Owner-manual pages vs recreation coverage

| Manual chapter | In inventory | Screenshot scene |
| --- | --- | --- |
| Touchscreen / Displays | yes | parked-home, controls |
| Car Status / Driving Status | yes | fsd-engaged, viz-expanded |
| Maps and Navigation | yes | route-set |
| Operating Climate Controls | yes | climate |
| Media | yes | media |
| Full Self-Driving (Supervised) | yes | fsd-engaged |
| Theater / Arcade / Toybox | listed, out of primary fidelity | — |
| Rear touchscreen | listed, out of primary fidelity | — |
| Charging display | listed (v12 left meter) | — |

When you add a surface, add a row here **and** a `?qa=` scene or a checklist note that the surface is Park-only / hardware-only.
