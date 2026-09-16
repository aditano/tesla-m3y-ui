import { etaClock, formatDuration, formatMiles } from "../geo/polyline";
import { upcomingManeuverIndex } from "../geo/osrm";
import { useVehicle } from "../state/store";
import { IconArrive, IconStraight, IconTurnLeft, IconTurnRight } from "./Icons";
import type { Maneuver } from "../state/types";

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
  const startFsd = useVehicle((s) => s.startFsd);
  const cancelNav = useVehicle((s) => s.cancelNav);
  const disengageFsd = useVehicle((s) => s.disengageFsd);

  if (busy) {
    return (
      <aside className="route-card">
        <div className="route-head">
          <h3>Finding a route…</h3>
          <div className="busy">OpenStreetMap · OSRM</div>
        </div>
      </aside>
    );
  }

  if (err && !route) {
    return (
      <aside className="route-card">
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
        <h3 style={{ margin: "0 0 6px" }}>You have arrived</h3>
        <div>{dest.name}</div>
        <div className="route-actions" style={{ padding: "12px 0 0" }}>
          <button className="btn ghost" onClick={cancelNav}>
            End
          </button>
        </div>
      </aside>
    );
  }

  if (!route || !dest) return null;

  const remainingS =
    pose.speedMph > 4
      ? pose.remainingM / (pose.speedMph * 0.44704)
      : route.durationS * (pose.remainingM / Math.max(1, route.distanceM));
  const idx = upcomingManeuverIndex(pose.traveledM, route.maneuvers);
  const etaNow = frozen ? new Date(2026, 8, 16, 16, 20, 0) : new Date();

  return (
    <aside className="route-card">
      <div className="route-head">
        <h3>{dest.name}</h3>
        <div className="eta-row">
          <span>{etaClock(remainingS, etaNow)}</span>
          <span>{formatDuration(remainingS)}</span>
          <span>{formatMiles(pose.remainingM || route.distanceM)}</span>
        </div>
      </div>
      <div className="turn-list">
        {route.maneuvers.map((m, i) => (
          <div key={`${m.instruction}-${i}`} className={`turn ${i === idx ? "on" : ""}`}>
            <TurnGlyph m={m} />
            <span>{m.instruction}</span>
            <span>{formatMiles(m.distanceM)}</span>
          </div>
        ))}
      </div>
      <div className="route-actions">
        {phase === "fsd" ? (
          <button className="btn danger" onClick={disengageFsd}>
            End Self-Driving
          </button>
        ) : (
          <>
            <button className="btn ghost" onClick={cancelNav}>
              Cancel
            </button>
            <button className="btn primary" onClick={startFsd}>
              Start Full Self-Driving
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
