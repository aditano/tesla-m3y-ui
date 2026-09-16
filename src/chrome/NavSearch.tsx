import { HOME_PLACE, SCHOOL_PLACE, WORK_PLACE } from "../geo/constants";
import { useVehicle } from "../state/store";
import { IconCharge, IconHome, IconMic, IconSearch, IconStar, IconWork } from "./Icons";

export function NavSearch({ variant = "map" }: { variant?: "map" | "parked" }) {
  const query = useVehicle((s) => s.searchQuery);
  const results = useVehicle((s) => s.searchResults);
  const busy = useVehicle((s) => s.searchBusy);
  const open = useVehicle((s) => s.ui.searchOpen);
  const recents = useVehicle((s) => s.recents);
  const pin = useVehicle((s) => s.ui.pinDrop);
  const phase = useVehicle((s) => s.phase);
  const dest = useVehicle((s) => s.destination);
  const charging = useVehicle((s) => s.flags.showChargingStops);
  const setSearchQuery = useVehicle((s) => s.setSearchQuery);
  const navigateTo = useVehicle((s) => s.navigateTo);
  const patchUi = useVehicle((s) => s.patchUi);
  const startFsd = useVehicle((s) => s.startFsd);
  const cancelNav = useVehicle((s) => s.cancelNav);
  const fsdEnabled = useVehicle((s) => s.flags.fsdEnabled);

  const tempPopup = useVehicle((s) => s.ui.tempPopup);
  const climateOpen = useVehicle((s) => s.ui.climateOpen);

  if (phase === "fsd") return null;
  if (tempPopup || climateOpen) return null;

  const routed = phase === "routed" || phase === "disengaged" || phase === "arrived";

  return (
    <div className={`nav-stack ${variant}`}>
      {phase !== "arrived" && dest && (phase === "routed" || phase === "disengaged") ? (
        <button type="button" className="start-fsd" disabled={!fsdEnabled} onClick={startFsd}>
          {fsdEnabled ? "Start Full Self-Driving" : "FSD unavailable"}
        </button>
      ) : null}

      {routed && dest ? (
        <div className="dest-chip">
          <IconSearch />
          <span>
            <b>{dest.name}</b>
            <span>{dest.label}</span>
          </span>
          <button type="button" className="chip-x" onClick={cancelNav} aria-label="Cancel navigation">
            ×
          </button>
        </div>
      ) : (
        <div className="search-panel">
          <label className="search-bar">
            <IconSearch />
            <input
              value={query}
              placeholder="Navigate"
              onFocus={() => patchUi({ searchOpen: true, climateOpen: false, mediaOpen: false, appsOpen: false })}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="mic-slot" title="Voice (stub)">
              <IconMic />
            </span>
          </label>
          {open ? (
            <div className="search-sheet">
              {pin ? (
                <button type="button" className="place-btn" onClick={() => void navigateTo(pin)}>
                  <IconStar width={18} height={18} />
                  <span>
                    <b>Dropped pin</b>
                    <span>{pin.label}</span>
                  </span>
                </button>
              ) : null}
              <button type="button" className="quick-row" onClick={() => void navigateTo(HOME_PLACE)}>
                <IconHome width={18} height={18} />
                <span>
                  <b>Home</b>
                  <span>{HOME_PLACE.label}</span>
                </span>
              </button>
              <button type="button" className="quick-row" onClick={() => void navigateTo(WORK_PLACE)}>
                <IconWork width={18} height={18} />
                <span>
                  <b>Work</b>
                  <span>{WORK_PLACE.label}</span>
                </span>
              </button>
              <button type="button" className="quick-row" onClick={() => void navigateTo(SCHOOL_PLACE)}>
                <IconStar width={18} height={18} />
                <span>
                  <b>Favorites</b>
                  <span>{SCHOOL_PLACE.label}</span>
                </span>
              </button>
              {charging ? (
                <button type="button" className="quick-row" onClick={() => setSearchQuery("charging station")}>
                  <IconCharge width={18} height={18} />
                  <span>
                    <b>Charging</b>
                    <span>Find nearby chargers</span>
                  </span>
                </button>
              ) : null}
              {busy ? <div className="busy">Searching OpenStreetMap…</div> : null}
              {results.map((p) => (
                <button key={p.label + p.lng} type="button" className="place-btn" onClick={() => void navigateTo(p)}>
                  <IconSearch width={16} height={16} />
                  <span>
                    <b>{p.name}</b>
                    <span>{p.label}</span>
                  </span>
                </button>
              ))}
              {recents.map((p) => (
                <button key={`r-${p.label}`} type="button" className="place-btn" onClick={() => void navigateTo(p)}>
                  <span>
                    <b>{p.name}</b>
                    <span>Recent · {p.label}</span>
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
