import { HOME_PLACE, SCHOOL_PLACE, WORK_PLACE } from "../geo/constants";
import { useVehicle } from "../state/store";
import { IconHome, IconSearch, IconStar, IconWork } from "./Icons";

export function NavSearch({ variant = "map" }: { variant?: "map" | "parked" }) {
  const query = useVehicle((s) => s.searchQuery);
  const results = useVehicle((s) => s.searchResults);
  const busy = useVehicle((s) => s.searchBusy);
  const open = useVehicle((s) => s.ui.searchOpen);
  const recents = useVehicle((s) => s.recents);
  const pin = useVehicle((s) => s.ui.pinDrop);
  const phase = useVehicle((s) => s.phase);
  const setSearchQuery = useVehicle((s) => s.setSearchQuery);
  const navigateTo = useVehicle((s) => s.navigateTo);
  const patchUi = useVehicle((s) => s.patchUi);

  if (phase === "fsd") return null;

  return (
    <div className={`search-panel ${variant}`}>
      <label className="search-bar">
        <IconSearch />
        <input
          value={query}
          placeholder={variant === "parked" ? "Navigate" : "Navigate to"}
          onFocus={() => patchUi({ searchOpen: true })}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </label>
      {open ? (
        <div className="search-sheet">
          {pin ? (
            <button className="place-btn" onClick={() => void navigateTo(pin)}>
              <IconStar width={18} height={18} />
              <span>
                <b>Dropped pin</b>
                <span>{pin.label}</span>
              </span>
            </button>
          ) : null}
          <button className="quick-row" onClick={() => void navigateTo(HOME_PLACE)}>
            <IconHome width={18} height={18} />
            <span>
              <b>Home</b>
              <span>{HOME_PLACE.label}</span>
            </span>
          </button>
          <button className="quick-row" onClick={() => void navigateTo(WORK_PLACE)}>
            <IconWork width={18} height={18} />
            <span>
              <b>Work</b>
              <span>{WORK_PLACE.label}</span>
            </span>
          </button>
          <button className="quick-row" onClick={() => void navigateTo(SCHOOL_PLACE)}>
            <IconStar width={18} height={18} />
            <span>
              <b>Villanova</b>
              <span>{SCHOOL_PLACE.label}</span>
            </span>
          </button>
          {busy ? <div className="busy">Searching OpenStreetMap…</div> : null}
          {results.map((p) => (
            <button key={p.label + p.lng} className="place-btn" onClick={() => void navigateTo(p)}>
              <IconSearch width={16} height={16} />
              <span>
                <b>{p.name}</b>
                <span>{p.label}</span>
              </span>
            </button>
          ))}
          {recents.map((p) => (
            <button key={`r-${p.label}`} className="place-btn" onClick={() => void navigateTo(p)}>
              <span>
                <b>{p.name}</b>
                <span>Recent · {p.label}</span>
              </span>
            </button>
          ))}
        </div>
      ) : variant === "parked" ? (
        <div className="parked-nav-shortcuts">
          <button className="quick-row" onClick={() => void navigateTo(HOME_PLACE)}>
            <IconHome width={18} height={18} />
            <b>Home</b>
          </button>
          <button className="quick-row" onClick={() => void navigateTo(WORK_PLACE)}>
            <IconWork width={18} height={18} />
            <b>Work</b>
          </button>
        </div>
      ) : null}
    </div>
  );
}
