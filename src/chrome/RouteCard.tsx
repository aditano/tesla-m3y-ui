import { etaClock, etaSeconds, formatDistance, formatDuration } from "../geo/polyline";
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

  const remainingS = etaSeconds(route.distanceM, route.durationS, pose.remainingM || route.distanceM, pose.speedMph);
  const totalM = Math.max(1, pose.traveledM + pose.remainingM);
  const progress = Math.min(100, (pose.traveledM / totalM) * 100);
  const idx = upcomingManeuverIndex(pose.traveledM, route.maneuvers);
  const etaNow = frozen ? new Date(2026, 8, 16, 16, 20, 0) : new Date();
  const upcoming = route.maneuvers.slice(idx, idx + 4);

  return (
    <aside className="route-card">
      <div className="route-head">
        <h3>{dest.name}</h3>
        <div className="eta-row">
          <span>{etaClock(remainingS, etaNow)}</span>
          <span>{formatDuration(remainingS)}</span>
          <span>{formatDistance(pose.remainingM || route.distanceM, miles)}</span>
        </div>
        <div className="trip-bar" aria-hidden="true">
          <i style={{ width: `${progress}%` }} />
        </div>
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
      {phase === "fsd" ? (
        <div className="route-actions">
          <button type="button" className="btn danger" onClick={disengageFsd}>
            End Self-Driving
          </button>
        </div>
      ) : null}
    </aside>
  );
}
