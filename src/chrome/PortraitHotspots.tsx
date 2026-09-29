import { useVehicle } from "../state/store";
import { isParkedFullscreen } from "../viz/layout";
import { IconChargePort, IconFrunk, IconTrunk } from "./Icons";

/**
 * Phone-portrait stand-in for the 3D frunk / trunk / charge callouts.
 * Those leaders are framed for a landscape center screen and project past a ~390px viewport.
 */
export function PortraitHotspots() {
  const gear = useVehicle((s) => s.gear);
  const phase = useVehicle((s) => s.phase);
  const flags = useVehicle((s) => s.flags);
  const toggleClosure = useVehicle((s) => s.toggleClosure);
  if (!isParkedFullscreen(gear, phase)) return null;

  return (
    <div className="portrait-hotspots">
      <button
        type="button"
        className={flags.frunkOpen ? "on" : ""}
        onClick={() => toggleClosure("frunk")}
      >
        <IconFrunk />
        <span>Frunk</span>
      </button>
      <button
        type="button"
        className={flags.trunkOpen ? "on" : ""}
        onClick={() => toggleClosure("trunk")}
      >
        <IconTrunk />
        <span>Trunk</span>
      </button>
      <button
        type="button"
        className={flags.chargePortOpen ? "on" : ""}
        aria-label={flags.chargePortOpen ? "Close charge port" : "Open charge port"}
        onClick={() => toggleClosure("charge")}
      >
        <IconChargePort />
        <span>Charge</span>
      </button>
    </div>
  );
}
