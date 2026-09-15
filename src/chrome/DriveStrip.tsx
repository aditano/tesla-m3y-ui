import { useVehicle } from "../state/store";
import type { Gear } from "../state/types";

const GEARS: Gear[] = ["P", "R", "N", "D"];

export function DriveStrip() {
  const gear = useVehicle((s) => s.gear);
  const setGear = useVehicle((s) => s.setGear);
  const phase = useVehicle((s) => s.phase);

  return (
    <aside className="drive-strip" aria-label="Drive mode">
      {GEARS.map((g) => (
        <button
          key={g}
          className={`gear ${gear === g ? "on" : ""} ${g.toLowerCase()}`}
          onClick={() => {
            if (g === "D" && phase === "routed") {
              useVehicle.getState().startFsd();
              return;
            }
            setGear(g);
          }}
        >
          {g}
        </button>
      ))}
    </aside>
  );
}
