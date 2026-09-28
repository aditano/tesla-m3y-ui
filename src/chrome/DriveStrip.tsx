import { useVehicle } from "../state/store";
import type { Gear } from "../state/types";
import { isParkedFullscreen } from "../viz/layout";
import { selectGear } from "./gearSelection";
import { IconAutoShiftCar } from "./Icons";

const GEARS: Gear[] = ["P", "R", "N", "D"];

/** Auto Shift swipe hint: thin chevrons inside the blue magnet halo. */
function Chevron({ up = false }: { up?: boolean }) {
  return (
    <svg viewBox="0 0 12 6" width="12" height="6">
      <path
        d={up ? "M1 5.2 6 1l5 4.2" : "M1 .8 6 5l5-4.2"}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DriveStrip() {
  const gear = useVehicle((s) => s.gear);
  const phase = useVehicle((s) => s.phase);
  const parked = isParkedFullscreen(gear, phase);

  const select = (g: Gear) => {
    selectGear(g);
  };

  if (parked) {
    return (
      <aside className="drive-strip parked" aria-label="Drive mode">
        <div className="auto-shift">
          <div className="auto-shift-prnd">
            {GEARS.map((g) => (
              <button
                key={g}
                type="button"
                className={`auto-shift-letter ${gear === g ? "on" : ""}`}
                onClick={() => select(g)}
              >
                {g}
              </button>
            ))}
          </div>
          <div className="auto-shift-stack">
            <span className="auto-shift-rail" aria-hidden="true" />
            <button
              className={`gear auto d ${gear === "D" ? "on" : ""}`}
              onClick={() => select("D")}
              title="Drive"
            >
              D
            </button>
            <span className="auto-shift-magnet up" aria-hidden="true">
              <Chevron up />
              <Chevron up />
            </span>
            <IconAutoShiftCar className="auto-shift-car" />
            <span className="auto-shift-magnet down" aria-hidden="true">
              <Chevron />
              <Chevron />
            </span>
            <button
              className={`gear auto r ${gear === "R" ? "on" : ""}`}
              onClick={() => select("R")}
              title="Reverse"
            >
              R
            </button>
            <span className="auto-shift-rail" aria-hidden="true" />
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="drive-strip" aria-label="Drive mode">
      {GEARS.map((g) => (
        <button
          key={g}
          className={`gear ${gear === g ? "on" : ""} ${g.toLowerCase()}`}
          onClick={() => select(g)}
        >
          {g}
        </button>
      ))}
    </aside>
  );
}
