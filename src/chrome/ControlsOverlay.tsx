import { useVehicle } from "../state/store";
import type { ControlsTab } from "../state/types";
import { IconClose } from "./Icons";

const TABS: { id: ControlsTab; label: string }[] = [
  { id: "quick", label: "Quick Controls" },
  { id: "lights", label: "Lights" },
  { id: "locks", label: "Locks" },
  { id: "display", label: "Display" },
  { id: "driving", label: "Driving" },
  { id: "autopilot", label: "Autopilot" },
  { id: "navigation", label: "Navigation" },
  { id: "safety", label: "Safety" },
  { id: "service", label: "Service" },
  { id: "software", label: "Software" },
];

function Toggle({
  on,
  label,
  onClick,
}: {
  on: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button className="row" onClick={onClick}>
      <span>{label}</span>
      <span className={`toggle ${on ? "on" : ""}`}>
        <i />
      </span>
    </button>
  );
}

export function ControlsOverlay() {
  const open = useVehicle((s) => s.ui.controlsOpen);
  const tab = useVehicle((s) => s.ui.controlsTab);
  const flags = useVehicle((s) => s.flags);
  const patchFlags = useVehicle((s) => s.patchFlags);
  const patchUi = useVehicle((s) => s.patchUi);
  const setControlsTab = useVehicle((s) => s.setControlsTab);

  if (!open) return null;

  return (
    <>
      <button className="overlay-scrim" aria-label="Close Controls" onClick={() => patchUi({ controlsOpen: false })} />
      <section className="controls-sheet" role="dialog" aria-label="Controls">
        <nav className="controls-nav">
          {TABS.map((t) => (
            <button key={t.id} className={tab === t.id ? "on" : ""} onClick={() => setControlsTab(t.id)}>
              {t.label}
            </button>
          ))}
          <button onClick={() => patchUi({ controlsOpen: false })} style={{ marginTop: "auto" }}>
            <IconClose width={18} height={18} /> Close
          </button>
        </nav>
        <div className="controls-body">{renderTab(tab)}</div>
      </section>
    </>
  );

  function renderTab(current: ControlsTab) {
    switch (current) {
      case "quick":
        return (
          <>
            <h2>Quick Controls</h2>
            <div className="tile-grid">
              <button
                className={`tile ${flags.headlights !== "off" ? "on" : ""}`}
                onClick={() =>
                  patchFlags({
                    headlights: flags.headlights === "auto" ? "on" : flags.headlights === "on" ? "off" : "auto",
                  })
                }
              >
                <strong>Lights</strong>
                <span>{flags.headlights.toUpperCase()}</span>
              </button>
              <button
                className={`tile ${flags.wipers !== "off" ? "on" : ""}`}
                onClick={() => patchFlags({ wipers: flags.wipers === "auto" ? "off" : "auto" })}
              >
                <strong>Wipers</strong>
                <span>{flags.wipers.toUpperCase()}</span>
              </button>
              <button className={`tile ${flags.childLock ? "on" : ""}`} onClick={() => patchFlags({ childLock: !flags.childLock })}>
                <strong>Child Lock</strong>
                <span>{flags.childLock ? "On" : "Off"}</span>
              </button>
              <button
                className={`tile ${flags.steeringHeat ? "on" : ""}`}
                onClick={() => patchFlags({ steeringHeat: !flags.steeringHeat })}
              >
                <strong>Steering</strong>
                <span>{flags.steeringHeat ? "Heat on" : "Heat off"}</span>
              </button>
              <button className={`tile ${flags.mirrorHeat ? "on" : ""}`} onClick={() => patchFlags({ mirrorHeat: !flags.mirrorHeat })}>
                <strong>Mirrors</strong>
                <span>{flags.mirrorHeat ? "Heat on" : "Fold / heat"}</span>
              </button>
              <button className={`tile ${flags.sentry ? "on" : ""}`} onClick={() => patchFlags({ sentry: !flags.sentry })}>
                <strong>Sentry</strong>
                <span>{flags.sentry ? "Enabled" : "Disabled"}</span>
              </button>
            </div>
          </>
        );
      case "lights":
        return (
          <>
            <h2>Lights</h2>
            <div className="row-list">
              {(["off", "parking", "on", "auto"] as const).map((mode) => (
                <button
                  key={mode}
                  className="row"
                  onClick={() => patchFlags({ headlights: mode })}
                >
                  <span>{mode === "on" ? "On" : mode[0].toUpperCase() + mode.slice(1)}</span>
                  <span>{flags.headlights === mode ? "●" : ""}</span>
                </button>
              ))}
            </div>
          </>
        );
      case "locks":
        return (
          <>
            <h2>Locks</h2>
            <div className="row-list">
              <Toggle on={flags.locked} label="Walk-Away Door Lock" onClick={() => patchFlags({ locked: !flags.locked })} />
              <Toggle on={flags.childLock} label="Child Lock" onClick={() => patchFlags({ childLock: !flags.childLock })} />
              <button className="row" onClick={() => patchFlags({ locked: true })}>
                <span>Lock doors</span>
              </button>
            </div>
          </>
        );
      case "display":
        return (
          <>
            <h2>Display</h2>
            <div className="row-list">
              <Toggle
                on={flags.energyAsPercent}
                label="Energy display as percent"
                onClick={() => patchFlags({ energyAsPercent: !flags.energyAsPercent })}
              />
              <Toggle
                on={flags.unitsMph}
                label="Distance in miles"
                onClick={() => patchFlags({ unitsMph: !flags.unitsMph })}
              />
              <p className="software-block">Dark appearance is always on in this recreation.</p>
            </div>
          </>
        );
      case "driving":
        return (
          <>
            <h2>Driving</h2>
            <div className="row-list">
              <Toggle on label="Regenerative braking — Standard" onClick={() => undefined} />
              <Toggle on label="Stopping Mode — Hold" onClick={() => undefined} />
              <Toggle on={false} label="Slip Start" onClick={() => undefined} />
            </div>
          </>
        );
      case "autopilot":
        return (
          <>
            <h2>Autopilot</h2>
            <div className="row-list">
              <p className="software-block">
                Full Self-Driving in this demo is a <b>simulated visualization</b> along an OpenStreetMap
                route. It is not Autopilot, not FSD Supervised, and not vehicle control.
              </p>
              <Toggle on label="Full Self-Driving Visualization Preview" onClick={() => undefined} />
              <div className="row">
                <span>Following distance</span>
                <span>
                  {([1, 2, 3, 4, 5, 6, 7] as const).map((n) => (
                    <button
                      key={n}
                      onClick={() => patchFlags({ followingDistance: n })}
                      style={{ padding: "4px 8px", opacity: flags.followingDistance === n ? 1 : 0.4 }}
                    >
                      {n}
                    </button>
                  ))}
                </span>
              </div>
            </div>
          </>
        );
      case "navigation":
        return (
          <>
            <h2>Navigation</h2>
            <div className="row-list">
              <Toggle on label="Online Routing" onClick={() => undefined} />
              <Toggle on={false} label="Avoid Tolls" onClick={() => undefined} />
              <Toggle on={false} label="Avoid Ferries" onClick={() => undefined} />
              <Toggle on={false} label="Avoid Highways" onClick={() => undefined} />
            </div>
          </>
        );
      case "safety":
        return (
          <>
            <h2>Safety</h2>
            <div className="row-list">
              <Toggle on={flags.sentry} label="Sentry Mode" onClick={() => patchFlags({ sentry: !flags.sentry })} />
              <Toggle on label="Park Assist chimes" onClick={() => undefined} />
              <Toggle on label="Joe Mode" onClick={() => undefined} />
            </div>
          </>
        );
      case "service":
        return (
          <>
            <h2>Service</h2>
            <p className="software-block">
              Wiper service mode, jack mode, and camera calibration are stubs in this recreation.
            </p>
          </>
        );
      case "software":
        return (
          <>
            <h2>Software</h2>
            <div className="software-block">
              <p>
                <b>Model 3 / Y Display</b> — fan recreation
              </p>
              <p>
                Version 2026.9.15 · UI v12-inspired · <code>tesla-m3y-ui</code>
              </p>
              <p>Not affiliated with Tesla, Inc. Original art. OpenStreetMap data.</p>
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
