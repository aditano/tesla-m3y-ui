import { Html } from "@react-three/drei";
import type { ReactNode } from "react";
import { IconChargePort, IconFrunk, IconTrunk } from "../chrome/Icons";
import { useVehicle } from "../state/store";
import { HOTSPOT_PINS, type HotspotId } from "./hotspots";

function hotspotIcon(id: HotspotId): ReactNode {
  switch (id) {
    case "frunk":
      return <IconFrunk />;
    case "trunk":
      return <IconTrunk />;
    case "charge":
      return <IconChargePort />;
    default: {
      const _exhaustive: never = id;
      throw new Error(`Unhandled hotspot: ${String(_exhaustive)}`);
    }
  }
}

export function ParkedHotspots(): ReactNode {
  const flags = useVehicle((s) => s.flags);
  const patchFlags = useVehicle((s) => s.patchFlags);
  const open = {
    frunk: flags.frunkOpen,
    trunk: flags.trunkOpen,
    charge: flags.chargePortOpen,
  };
  const toggle = {
    frunk: () => patchFlags({ frunkOpen: !flags.frunkOpen }),
    trunk: () => patchFlags({ trunkOpen: !flags.trunkOpen }),
    charge: () => patchFlags({ chargePortOpen: !flags.chargePortOpen }),
  };

  return (
    <group name="parked-hotspots">
      {HOTSPOT_PINS.map((pin) => (
        <Html
          key={pin.id}
          position={[pin.position[0], pin.position[1], pin.position[2]]}
          occlude={false}
          zIndexRange={[40, 10]}
          style={{ pointerEvents: "none" }}
        >
          <div className={`parked-callout ${pin.id} ${open[pin.id] ? "on" : ""}`} data-hotspot={pin.id}>
            <div className="parked-callout-head">
              <span className="parked-callout-kicker">{pin.kicker}</span>
              <button type="button" className="parked-callout-card" onClick={toggle[pin.id]}>
                {hotspotIcon(pin.id)}
                <span>{open[pin.id] ? "Close" : "Open"}</span>
              </button>
            </div>
            <span className="parked-callout-stem" aria-hidden="true" />
            <span className="parked-callout-dot" aria-hidden="true" />
          </div>
        </Html>
      ))}
    </group>
  );
}
