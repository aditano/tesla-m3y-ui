import type { Gear } from "../state/types";
import { useVehicle } from "../state/store";

/** Gear buttons change gear only. FSD starts from the separate Start Full Self-Driving control. */
export function selectGear(gear: Gear): void {
  useVehicle.getState().setGear(gear);
}
