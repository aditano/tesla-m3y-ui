import { useVehicle } from "../state/store";
import type { Gear } from "../state/types";
import { isParkedFullscreen } from "../viz/layout";
import { IconCarOutline } from "./Icons";

const GEARS: Gear[] = ["P", "R", "N", "D"];

export function DriveStrip() {
  const gear = useVehicle((s) => s.gear);
  const setGear = useVehicle((s) => s.setGear);
  const phase = useVehicle((s) => s.phase);
  const parked = isParkedFullscreen(gear, phase);

  const select = (g: Gear) => {
    if (g === "D" && phase === "routed") {
      useVehicle.getState().startFsd();
      return;
    }
    setGear(g);
  };

  if (parked) {
    return (
      <aside className="drive-strip parked" aria-label="Drive mode">
        <div className="auto-shift">
          <div className="auto-shift-prnd" aria-hidden="true">
            {GEARS.map((g) => (
              <span key={g} className={gear === g ? "on" : ""}>
                {g}
              </span>
            ))}
          </div>
          <button
            className={`gear auto p ${gear === "P" ? "on" : ""}`}
            onClick={() => select("P")}
          >
            P
          </button>
          <button
            className={`gear auto d ${gear === "D" ? "on" : ""}`}
            onClick={() => select("D")}
            title="Drive"
          >
            D
          </button>
          <IconCarOutline className="auto-shift-car" />
          <button
            className={`gear auto r ${gear === "R" ? "on" : ""}`}
            onClick={() => select("R")}
            title="Reverse"
          >
            R
          </button>
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
