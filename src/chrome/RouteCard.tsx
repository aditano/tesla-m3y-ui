import { formatDistance } from "../geo/polyline";
import { useVehicle } from "../state/store";
import { routeCardFacts } from "./routeCardFacts";
import { IconArrive, IconStraight, IconTurnLeft, IconTurnRight } from "./Icons";
import type { Maneuver } from "../state/types";
import { ArrivalBattery, TripProgress } from "./TripProgress";

function TurnGlyph({ m }: { m: Maneuver }) {
  if (m.type === "arrive") return <IconArrive width={18} height={18} />;
  const mod = m.modifier ?? "";
  if (mod.includes("left")) return <IconTurnLeft width={18} height={18} />;
  if (mod.includes("right")) return <IconTurnRight width={18} height={18} />;
  return <IconStraight width={18} height={18} />;
}

export function RouteCard() {
  const route = useVehicle((s) => s.route);
  const dest = useVehicle((s) => s.destination);
  const phase = useVehicle((s) => s.phase);
  const pose = useVehicle((s) => s.pose);
  const busy = useVehicle((s) => s.routeBusy);
  const err = useVehicle((s) => s.routeError);
  const frozen = useVehicle((s) => s.qa.frozen);
  const miles = useVehicle((s) => s.flags.unitsMph);
  const cancelNav = useVehicle((s) => s.cancelNav);
  const disengageFsd = useVehicle((s) => s.disengageFsd);

  if (busy) {
    return (
      <aside className="route-card compact">
        <div className="route-head">
          <h3>Finding a route…</h3>
          <div className="busy">OpenStreetMap · OSRM</div>
        </div>
      </aside>
    );
  }

  if (err && !route) {
    return (
      <aside className="route-card compact">
        <div className="route-head">
          <h3>Navigation</h3>
          <div className="error-chip">{err}</div>
        </div>
      </aside>
    );
  }

  if (phase === "arrived" && dest) {
    return (
      <aside className="arrival">
        <h3>You have arrived</h3>
        <div>{dest.name}</div>
        <div className="route-actions" style={{ padding: "12px 0 0" }}>
          <button type="button" className="btn ghost" onClick={cancelNav}>
            End
          </button>
        </div>
      </aside>
    );
  }

  if (!route || !dest) return null;

  const etaNow = frozen ? new Date(2026, 8, 16, 16, 20, 0) : new Date();
  const facts = routeCardFacts(route, pose.traveledM, pose.remainingM, pose.speedMph, miles, etaNow);
  const upcoming = route.maneuvers.slice(facts.turnIndex, facts.turnIndex + facts.turns.length);

  return (
    <aside className="route-card">
      <div className="route-head">
        <h3>{dest.name}</h3>
        <div className="eta-row">
          <span>{facts.eta}</span>
          <span>{facts.duration}</span>
          <span>{facts.distance}</span>
          <ArrivalBattery route={route} />
        </div>
        <TripProgress route={route} />
      </div>
      <div className="turn-list">
        {upcoming.map((m, i) => (
          <div key={`${m.instruction}-${i}`} className={`turn ${i === 0 ? "on" : ""}`}>
            <TurnGlyph m={m} />
            <span>{m.instruction}</span>
            <span>{formatDistance(m.distanceM, miles)}</span>
          </div>
        ))}
      </div>
      <div className="route-actions">
        {phase === "fsd" ? (
          <button type="button" className="btn danger" onClick={disengageFsd}>
            End Self-Driving
          </button>
        ) : null}
        {facts.canCancel ? (
          <button type="button" className="btn ghost" onClick={cancelNav}>
            Cancel
          </button>
        ) : null}
      </div>
    </aside>
  );
}
