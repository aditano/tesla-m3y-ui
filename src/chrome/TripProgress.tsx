import { arrivalBatteryPct, tripBarSegments } from "../geo/traffic";
import { useVehicle } from "../state/store";
import type { RoutePlan } from "../state/types";

/** Battery glyph with a fill that tracks the percentage, like the trip card. */
export function BatteryGlyph({ pct }: { pct: number }) {
  const w = Math.max(1, Math.round((Math.max(0, Math.min(100, pct)) / 100) * 13));
  return (
    <svg className="battery-glyph" viewBox="0 0 20 10" aria-hidden="true">
      <rect x="0.6" y="0.6" width="16.4" height="8.8" rx="1.8" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <rect x="17.6" y="3" width="1.8" height="4" rx="0.6" fill="currentColor" />
      <rect x="2.2" y="2.2" width={w} height="5.6" rx="0.8" fill="currentColor" />
    </svg>
  );
}

/** Battery % on arrival, from the live remaining distance. */
export function useArrivalBattery(route: RoutePlan | null): number {
  const battery = useVehicle((s) => s.flags.batteryPct);
  const remainingM = useVehicle((s) => s.pose.remainingM);
  if (!route) return battery;
  return arrivalBatteryPct(battery, remainingM || route.distanceM);
}

export function ArrivalBattery({ route }: { route: RoutePlan | null }) {
  const pct = useArrivalBattery(route);
  return (
    <span className="arrival-battery" title="Battery on arrival">
      <BatteryGlyph pct={pct} />
      {pct}%
    </span>
  );
}

/**
 * `nata-trip-progress.jpg`: gray behind the car, blue ahead, orange/red slow
 * stretches, and a red arrowhead where the car is.
 */
export function TripProgress({ route }: { route: RoutePlan }) {
  const traveledM = useVehicle((s) => s.pose.traveledM);
  const remainingM = useVehicle((s) => s.pose.remainingM);
  const totalM = Math.max(1, traveledM + (remainingM || route.distanceM - traveledM));
  const done = Math.min(100, Math.max(0, (traveledM / totalM) * 100));
  const marks = tripBarSegments(route.traffic, totalM).filter((m) => m.leftPct + m.widthPct > done);

  return (
    <div className="trip-bar" aria-hidden="true">
      <i className="trip-done" style={{ width: `${done}%` }} />
      <i className="trip-ahead" style={{ left: `${done}%` }} />
      {marks.map((m) => {
        const left = Math.max(done, m.leftPct);
        return (
          <i
            key={`${m.leftPct}-${m.level}`}
            className={`trip-traffic ${m.level}`}
            style={{ left: `${left}%`, width: `${m.leftPct + m.widthPct - left}%` }}
          />
        );
      })}
      <b className="trip-car" style={{ left: `${done}%` }} />
    </div>
  );
}
