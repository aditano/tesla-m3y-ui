import type { ComponentType, SVGProps } from "react";
import { useVehicle } from "../state/store";
import { useDialogA11y } from "./dialogA11y";
import type { ControlsTab, HeadlightMode, WiperMode } from "../state/types";
import {
  IconBell,
  IconBluetooth,
  IconBolt,
  IconCamera,
  IconCar,
  IconCarWash,
  IconChildLock,
  IconClose,
  IconDownload,
  IconGear,
  IconGlovebox,
  IconHeadlight,
  IconHome,
  IconInfo,
  IconLock,
  IconMirror,
  IconNav,
  IconPerson,
  IconSearch,
  IconSteering,
  IconSun,
  IconToggles,
  IconTrip,
  IconWifi,
  IconWindowLock,
  IconWiper,
  IconWrench,
} from "./Icons";
import { searchSettings } from "./settingsCatalog";
import { FollowPips, Segmented, ToggleRow } from "./ToggleRow";

type IconCmp = ComponentType<SVGProps<SVGSVGElement>>;

const TABS: { id: ControlsTab; label: string; Icon: IconCmp }[] = [
  { id: "quick", label: "Controls", Icon: IconToggles },
  { id: "dynamics", label: "Dynamics", Icon: IconCar },
  { id: "charging", label: "Charging", Icon: IconBolt },
  { id: "autopilot", label: "Autopilot", Icon: IconSteering },
  { id: "locks", label: "Locks", Icon: IconLock },
  { id: "lights", label: "Lights", Icon: IconSun },
  { id: "display", label: "Display", Icon: IconGear },
  { id: "trips", label: "Trips", Icon: IconTrip },
  { id: "navigation", label: "Navigation", Icon: IconNav },
  { id: "safety", label: "Safety", Icon: IconInfo },
  { id: "service", label: "Service", Icon: IconWrench },
  { id: "software", label: "Software", Icon: IconDownload },
  { id: "wifi", label: "Wi-Fi", Icon: IconWifi },
];

const LIGHT_MODES: { id: HeadlightMode; label: string }[] = [
  { id: "off", label: "Off" },
  { id: "parking", label: "Parking" },
  { id: "on", label: "On" },
  { id: "auto", label: "Auto" },
];

const WIPER_MODES: { id: WiperMode; label: string }[] = [
  { id: "off", label: "Off" },
  { id: "auto", label: "Auto" },
  { id: "i", label: "I" },
  { id: "ii", label: "II" },
  { id: "iii", label: "III" },
  { id: "iiii", label: "IIII" },
];

export function ControlsOverlay() {
  const open = useVehicle((s) => s.ui.controlsOpen);
  const tab = useVehicle((s) => s.ui.controlsTab);
  const query = useVehicle((s) => s.ui.controlsQuery);
  const profile = useVehicle((s) => s.ui.driverProfile);
  const flags = useVehicle((s) => s.flags);
  const patchFlags = useVehicle((s) => s.patchFlags);
  const patchUi = useVehicle((s) => s.patchUi);
  const setControlsTab = useVehicle((s) => s.setControlsTab);
  const close = () => patchUi({ controlsOpen: false, controlsQuery: "" });
  const dialogRef = useDialogA11y<HTMLElement>(open, close);

  if (!open) return null;

  const hits = searchSettings(query);

  return (
    <>
      <button className="overlay-scrim" aria-label="Close Controls" onClick={close} />
      <section
        ref={dialogRef}
        className="controls-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Controls"
        tabIndex={-1}
      >
        <header className="controls-topbar">
          <label className="controls-search">
            <IconSearch />
            <input
              value={query}
              placeholder="Search Settings"
              onChange={(e) => patchUi({ controlsQuery: e.target.value })}
              aria-label="Search settings"
            />
          </label>
          <span className="controls-top-spacer" />
          <button type="button" className="profile-chip" onClick={() => setControlsTab("quick")}>
            <IconPerson />
            {profile}
          </button>
          <button type="button" className="icon-ghost" title="Home" onClick={close}>
            <IconHome />
          </button>
          <button type="button" className="icon-ghost" title="Alerts">
            <IconBell />
          </button>
          <button
            type="button"
            className={`icon-ghost ${flags.bluetooth ? "on" : ""}`}
            title="Bluetooth"
            onClick={() => patchFlags({ bluetooth: !flags.bluetooth })}
          >
            <IconBluetooth />
          </button>
          <button
            type="button"
            className={`icon-ghost ${flags.wifi ? "on" : ""}`}
            title="Wi-Fi"
            onClick={() => setControlsTab("wifi")}
          >
            <IconWifi />
          </button>
          <button type="button" className="icon-ghost" aria-label="Close" onClick={close}>
            <IconClose />
          </button>
        </header>
        <nav className="controls-nav">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={tab === t.id && !query ? "on" : ""}
              onClick={() => setControlsTab(t.id)}
            >
              <t.Icon width={18} height={18} />
              {t.label}
            </button>
          ))}
        </nav>
        <div className="controls-body">
          {query.trim() ? (
            <div className="row-list">
              <h2>Search</h2>
              {hits.length === 0 ? <p className="software-block">No matching settings.</p> : null}
              {hits.map((hit) => (
                <button key={hit.id} type="button" className="row" onClick={() => setControlsTab(hit.tab)}>
                  <span className="row-copy">
                    <span>{hit.label}</span>
                    <small>{TABS.find((t) => t.id === hit.tab)?.label}</small>
                  </span>
                </button>
              ))}
            </div>
          ) : (
            renderTab(tab)
          )}
        </div>
      </section>
    </>
  );

  function renderTab(current: ControlsTab) {
    switch (current) {
      case "quick":
        return (
          <div className="quick-layout">
            <div className="quick-lights">
              <div className="segmented lights-seg" role="radiogroup" aria-label="Exterior lights">
                {LIGHT_MODES.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    role="radio"
                    aria-checked={flags.headlights === opt.id}
                    className={flags.headlights === opt.id ? "on" : ""}
                    onClick={() => patchFlags({ headlights: opt.id })}
                  >
                    {opt.id === "off" ? <IconSun width={18} height={18} /> : null}
                    {opt.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className={`quick-accent ${flags.autoHighBeam ? "on" : ""}`}
                title="Auto High Beam"
                onClick={() => patchFlags({ autoHighBeam: !flags.autoHighBeam })}
              >
                <IconHeadlight />
              </button>
            </div>
            <div className="tile-grid three">
              <button
                type="button"
                className={`tile ${flags.mirrorsFolded ? "on" : ""}`}
                onClick={() => patchFlags({ mirrorsFolded: !flags.mirrorsFolded })}
              >
                <IconMirror />
                <strong>Fold Mirrors</strong>
              </button>
              <button
                type="button"
                className={`tile ${flags.childLock ? "on" : ""}`}
                onClick={() => patchFlags({ childLock: !flags.childLock })}
              >
                <IconChildLock />
                <strong>Child Lock</strong>
                <span>{flags.childLock ? "On" : "Off"}</span>
              </button>
              <button
                type="button"
                className={`tile ${flags.windowLock ? "on" : ""}`}
                onClick={() => patchFlags({ windowLock: !flags.windowLock })}
              >
                <IconWindowLock />
                <strong>Window Lock</strong>
              </button>
            </div>
            <div className="segmented wiper-seg" role="radiogroup" aria-label="Wipers">
              {WIPER_MODES.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  aria-checked={flags.wipers === opt.id}
                  className={flags.wipers === opt.id ? "on" : ""}
                  onClick={() => patchFlags({ wipers: opt.id })}
                >
                  {opt.id === "off" ? <IconWiper width={18} height={18} /> : null}
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="tile-grid three">
              <button type="button" className="tile" title="Adjust mirrors">
                <IconMirror />
                <strong>Mirrors</strong>
              </button>
              <button type="button" className="tile dim" disabled>
                <IconCamera />
                <strong>Unavailable</strong>
              </button>
              <button
                type="button"
                className={`tile ${flags.carWash ? "on" : ""}`}
                onClick={() => patchFlags({ carWash: !flags.carWash })}
              >
                <IconCarWash />
                <strong>Car Wash</strong>
              </button>
              <button
                type="button"
                className={`tile ${flags.steeringHeat ? "on" : ""}`}
                onClick={() => patchFlags({ steeringHeat: !flags.steeringHeat })}
              >
                <IconSteering />
                <strong>Steering</strong>
              </button>
              <button
                type="button"
                className="tile"
                onClick={() => patchUi({ appsOpen: true, controlsOpen: false })}
              >
                <IconCamera />
                <strong>Camera</strong>
              </button>
              <button
                type="button"
                className={`tile ${flags.gloveboxOpen ? "on" : ""}`}
                onClick={() => patchFlags({ gloveboxOpen: !flags.gloveboxOpen })}
              >
                <IconGlovebox />
                <strong>Glovebox</strong>
              </button>
            </div>
            <div className="quick-bright">
              <div className="bright-track">
                <IconSun />
                <input
                  className="slider"
                  type="range"
                  min={10}
                  max={100}
                  value={flags.brightness}
                  onChange={(e) => patchFlags({ brightness: Number(e.target.value), autoBrightness: false })}
                  aria-label="Display brightness"
                />
              </div>
              <button
                type="button"
                className={`quick-accent text ${flags.autoBrightness ? "on" : ""}`}
                onClick={() => patchFlags({ autoBrightness: !flags.autoBrightness })}
              >
                Auto
              </button>
            </div>
          </div>
        );
      case "lights":
        return (
          <>
            <h2>Lights</h2>
            <div className="row-list">
              <div className="row stack">
                <span>Exterior lights</span>
                <Segmented
                  value={flags.headlights}
                  options={LIGHT_MODES}
                  onChange={(headlights) => patchFlags({ headlights })}
                />
              </div>
              <div className="row stack">
                <span>Wipers</span>
                <Segmented value={flags.wipers} options={WIPER_MODES} onChange={(wipers) => patchFlags({ wipers })} />
              </div>
              <ToggleRow
                on={flags.autoHighBeam}
                label="Auto High Beam"
                onClick={() => patchFlags({ autoHighBeam: !flags.autoHighBeam })}
              />
              <ToggleRow
                on={flags.headlightsAfterExit}
                label="Headlights after Exit"
                onClick={() => patchFlags({ headlightsAfterExit: !flags.headlightsAfterExit })}
              />
              <ToggleRow
                on={flags.fogLights}
                label="Fog lights"
                onClick={() => patchFlags({ fogLights: !flags.fogLights })}
              />
              <ToggleRow
                on={flags.domeLights}
                label="Dome lights"
                onClick={() => patchFlags({ domeLights: !flags.domeLights })}
              />
              <ToggleRow
                on={flags.ambientLights}
                label="Ambient lights"
                onClick={() => patchFlags({ ambientLights: !flags.ambientLights })}
              />
              <ToggleRow
                on={flags.steeringWheelLights}
                label="Steering wheel lights"
                onClick={() => patchFlags({ steeringWheelLights: !flags.steeringWheelLights })}
              />
            </div>
          </>
        );
      case "locks":
        return (
          <>
            <h2>Locks</h2>
            <div className="row-list">
              <ToggleRow
                on={flags.walkAwayLock}
                label="Walk-Away Door Lock"
                onClick={() => patchFlags({ walkAwayLock: !flags.walkAwayLock })}
              />
              <ToggleRow
                on={flags.unlockOnPark}
                label="Unlock on Park"
                onClick={() => patchFlags({ unlockOnPark: !flags.unlockOnPark })}
              />
              <ToggleRow
                on={flags.lockConfirmationSound}
                label="Lock confirmation sound"
                onClick={() => patchFlags({ lockConfirmationSound: !flags.lockConfirmationSound })}
              />
              <ToggleRow
                on={flags.childLock}
                label="Child Lock"
                onClick={() => patchFlags({ childLock: !flags.childLock })}
              />
              <ToggleRow
                on={flags.windowLock}
                label="Window Lock"
                onClick={() => patchFlags({ windowLock: !flags.windowLock })}
              />
              <ToggleRow
                on={flags.autoFoldMirrors}
                label="Mirror Auto Fold"
                onClick={() => patchFlags({ autoFoldMirrors: !flags.autoFoldMirrors })}
              />
              <ToggleRow
                on={flags.mirrorAutoTilt}
                label="Mirror Auto Tilt"
                onClick={() => patchFlags({ mirrorAutoTilt: !flags.mirrorAutoTilt })}
              />
              <button
                type="button"
                className="row"
                onClick={() => patchFlags({ locked: true, doors: { fl: false, fr: false, rl: false, rr: false } })}
              >
                <span>Lock doors</span>
              </button>
              <p className="software-block">Keys list is a stub in this recreation (phone / card / fob).</p>
            </div>
          </>
        );
      case "display":
        return (
          <>
            <h2>Display</h2>
            <div className="row-list">
              <div className="row stack">
                <span>Appearance</span>
                <Segmented
                  value={flags.appearance}
                  options={[
                    { id: "dark", label: "Dark" },
                    { id: "light", label: "Light" },
                    { id: "auto", label: "Auto" },
                  ]}
                  onChange={(appearance) => patchFlags({ appearance })}
                />
              </div>
              <div className="row stack">
                <span>Brightness</span>
                <input
                  className="slider"
                  type="range"
                  min={10}
                  max={100}
                  value={flags.brightness}
                  onChange={(e) => patchFlags({ brightness: Number(e.target.value), autoBrightness: false })}
                />
              </div>
              <ToggleRow
                on={flags.autoBrightness}
                label="Auto brightness"
                onClick={() => patchFlags({ autoBrightness: !flags.autoBrightness })}
              />
              <ToggleRow
                on={flags.reduceBlueLight}
                label="Reduce Blue Light"
                onClick={() => patchFlags({ reduceBlueLight: !flags.reduceBlueLight })}
              />
              <ToggleRow
                on={flags.energyAsPercent}
                label="Energy display as percent"
                onClick={() => patchFlags({ energyAsPercent: !flags.energyAsPercent })}
              />
              <ToggleRow
                on={flags.unitsMph}
                label="Distance in miles"
                onClick={() => patchFlags({ unitsMph: !flags.unitsMph })}
              />
              <ToggleRow
                on={flags.temperatureF}
                label="Temperature in Fahrenheit"
                onClick={() => patchFlags({ temperatureF: !flags.temperatureF })}
              />
              <ToggleRow
                on={flags.timeFormat24}
                label="24-hour clock"
                onClick={() => patchFlags({ timeFormat24: !flags.timeFormat24 })}
              />
              <div className="row stack">
                <span>Text size</span>
                <Segmented
                  value={flags.textSize}
                  options={[
                    { id: "standard", label: "Standard" },
                    { id: "large", label: "Large" },
                  ]}
                  onChange={(textSize) => patchFlags({ textSize })}
                />
              </div>
              <ToggleRow
                on={flags.lockRearDisplay}
                label="Lock Rear Display"
                onClick={() => patchFlags({ lockRearDisplay: !flags.lockRearDisplay })}
              />
              <ToggleRow
                on={flags.screenClean}
                label="Screen Clean Mode"
                hint="Darkens controls in this recreation"
                onClick={() => patchFlags({ screenClean: !flags.screenClean })}
              />
            </div>
          </>
        );
      case "dynamics":
        return (
          <>
            <h2>Dynamics</h2>
            <div className="row-list">
              <div className="row stack">
                <span>Acceleration</span>
                <Segmented
                  value={flags.steeringMode === "sport" ? "sport" : "chill"}
                  options={[
                    { id: "chill", label: "Chill" },
                    { id: "sport", label: "Standard" },
                  ]}
                  onChange={(mode) =>
                    patchFlags({ steeringMode: mode === "sport" ? "sport" : "comfort" })
                  }
                />
              </div>
              <div className="row stack">
                <span>Regenerative braking</span>
                <Segmented
                  value={flags.regenerativeBraking}
                  options={[
                    { id: "standard", label: "Standard" },
                    { id: "low", label: "Low" },
                  ]}
                  onChange={(regenerativeBraking) => patchFlags({ regenerativeBraking })}
                />
              </div>
              <div className="row stack">
                <span>Stopping Mode</span>
                <Segmented
                  value={flags.stoppingMode}
                  options={[
                    { id: "hold", label: "Hold" },
                    { id: "roll", label: "Roll" },
                    { id: "creep", label: "Creep" },
                  ]}
                  onChange={(stoppingMode) => patchFlags({ stoppingMode })}
                />
              </div>
              <div className="row stack">
                <span>Steering mode</span>
                <Segmented
                  value={flags.steeringMode}
                  options={[
                    { id: "comfort", label: "Comfort" },
                    { id: "standard", label: "Standard" },
                    { id: "sport", label: "Sport" },
                  ]}
                  onChange={(steeringMode) => patchFlags({ steeringMode })}
                />
              </div>
              <ToggleRow on={flags.slipStart} label="Slip Start" onClick={() => patchFlags({ slipStart: !flags.slipStart })} />
            </div>
          </>
        );
      case "charging":
        return (
          <>
            <h2>Charging</h2>
            <div className="row-list">
              <div className="row stack">
                <span>Charge limit · {flags.chargeLimitPct}%</span>
                <input
                  className="slider"
                  type="range"
                  min={50}
                  max={100}
                  value={flags.chargeLimitPct}
                  onChange={(e) => patchFlags({ chargeLimitPct: Number(e.target.value) })}
                />
              </div>
              <ToggleRow
                on={flags.chargePortOpen}
                label="Charge port"
                onClick={() => patchFlags({ chargePortOpen: !flags.chargePortOpen })}
              />
              <p className="software-block">Scheduled charging and Supercharger pricing are stubs in this recreation.</p>
            </div>
          </>
        );
      case "autopilot":
        return (
          <>
            <h2>Autopilot</h2>
            <div className="row-list">
              <p className="software-block">
                Full Self-Driving in this demo is a <b>simulated visualization</b> along an OpenStreetMap route. It is not
                Autopilot, not FSD Supervised, and not vehicle control.
              </p>
              <ToggleRow
                on={flags.fsdEnabled}
                label="Full Self-Driving (Supervised) — simulated"
                onClick={() => patchFlags({ fsdEnabled: !flags.fsdEnabled })}
              />
              <ToggleRow
                on={flags.autosteer}
                label="Autosteer"
                onClick={() => patchFlags({ autosteer: !flags.autosteer })}
              />
              <ToggleRow
                on={flags.trafficControl}
                label="Traffic Light and Stop Sign Control"
                onClick={() => patchFlags({ trafficControl: !flags.trafficControl })}
              />
              <ToggleRow
                on={flags.visualizationPreview}
                label="Visualization Preview"
                onClick={() => patchFlags({ visualizationPreview: !flags.visualizationPreview })}
              />
              <div className="row stack">
                <span>Following distance</span>
                <FollowPips
                  value={flags.followingDistance}
                  onChange={(followingDistance) => patchFlags({ followingDistance })}
                />
              </div>
            </div>
          </>
        );
      case "trips":
        return (
          <>
            <h2>Trips</h2>
            <div className="row-list">
              <div className="row">
                <span className="row-copy">
                  <span>Trip A</span>
                  <small>Since reset</small>
                </span>
                <strong>{flags.unitsMph ? "128 mi" : "206 km"}</strong>
              </div>
              <div className="row">
                <span className="row-copy">
                  <span>Trip B</span>
                  <small>Since charge</small>
                </span>
                <strong>{flags.unitsMph ? "41 mi" : "66 km"}</strong>
              </div>
              <p className="software-block">Trip meters are labeled stubs. Energy graphs belong to the Energy app.</p>
            </div>
          </>
        );
      case "navigation":
        return (
          <>
            <h2>Navigation</h2>
            <div className="row-list">
              <ToggleRow
                on={flags.onlineRouting}
                label="Online Routing"
                onClick={() => patchFlags({ onlineRouting: !flags.onlineRouting })}
              />
              <ToggleRow
                on={flags.avoidTolls}
                label="Avoid Tolls"
                onClick={() => patchFlags({ avoidTolls: !flags.avoidTolls })}
              />
              <ToggleRow
                on={flags.avoidFerries}
                label="Avoid Ferries"
                onClick={() => patchFlags({ avoidFerries: !flags.avoidFerries })}
              />
              <ToggleRow
                on={flags.avoidHighways}
                label="Avoid Highways"
                onClick={() => patchFlags({ avoidHighways: !flags.avoidHighways })}
              />
              <ToggleRow
                on={flags.automaticNavigation}
                label="Automatic Navigation"
                hint="Resume a recent destination when you shift into Drive (simulated)"
                onClick={() => patchFlags({ automaticNavigation: !flags.automaticNavigation })}
              />
              <ToggleRow
                on={flags.showChargingStops}
                label="Show charging in search"
                onClick={() => patchFlags({ showChargingStops: !flags.showChargingStops })}
              />
            </div>
          </>
        );
      case "safety":
        return (
          <>
            <h2>Safety</h2>
            <div className="row-list">
              <ToggleRow
                on={flags.sentry}
                label="Sentry Mode"
                onClick={() => patchFlags({ sentry: !flags.sentry })}
              />
              <ToggleRow
                on={flags.parkAssistChimes}
                label="Park Assist chimes"
                onClick={() => patchFlags({ parkAssistChimes: !flags.parkAssistChimes })}
              />
              <ToggleRow on={flags.joeMode} label="Joe Mode" onClick={() => patchFlags({ joeMode: !flags.joeMode })} />
              <ToggleRow
                on={flags.allowMobileAccess}
                label="Allow Mobile Access"
                onClick={() => patchFlags({ allowMobileAccess: !flags.allowMobileAccess })}
              />
            </div>
          </>
        );
      case "service":
        return (
          <>
            <h2>Service</h2>
            <div className="row-list">
              <ToggleRow
                on={flags.wiperService}
                label="Wiper service mode"
                hint="Stub — holds wipers up in a real vehicle"
                onClick={() => patchFlags({ wiperService: !flags.wiperService })}
              />
              <ToggleRow
                on={flags.jackMode}
                label="Jack mode"
                hint="Stub"
                onClick={() => patchFlags({ jackMode: !flags.jackMode })}
              />
              <ToggleRow
                on={flags.cameraCalibrating}
                label="Camera calibration"
                hint="Stub"
                onClick={() => patchFlags({ cameraCalibrating: !flags.cameraCalibrating })}
              />
              <p className="software-block">Headlight aim and factory reset are not available in this recreation.</p>
            </div>
          </>
        );
      case "software":
        return (
          <>
            <h2>Software</h2>
            <div className="software-block">
              <p>
                <b>{flags.vehicleName}</b>
              </p>
              <p>
                <b>Model 3 / Y Display</b> — fan recreation of the 2026.14 center display
              </p>
              <p>
                Version 2026.14.3 · <code>tesla-m3y-ui</code>
              </p>
              <p>Not affiliated with Tesla, Inc. Original art. OpenStreetMap data.</p>
            </div>
            <div className="row-list">
              <ToggleRow
                on={flags.autoInstallUpdates}
                label="Automatically Install Updates"
                hint="2026.14 software control"
                onClick={() => patchFlags({ autoInstallUpdates: !flags.autoInstallUpdates })}
              />
            </div>
          </>
        );
      case "wifi":
        return (
          <>
            <h2>Wi-Fi</h2>
            <div className="row-list">
              <ToggleRow on={flags.wifi} label="Wi-Fi" onClick={() => patchFlags({ wifi: !flags.wifi })} />
              <ToggleRow
                on={flags.bluetooth}
                label="Bluetooth"
                onClick={() => patchFlags({ bluetooth: !flags.bluetooth })}
              />
              <div className="row">
                <span className="row-copy">
                  <span>Home-Net</span>
                  <small>Connected · stub network list</small>
                </span>
              </div>
            </div>
          </>
        );
      default: {
        const _exhaustive: never = current;
        return _exhaustive;
      }
    }
  }
}
