import { upcomingManeuverIndex } from "../geo/osrm";
import { etaClock, etaSeconds, formatDistance, formatDuration } from "../geo/polyline";
import type { RoutePlan } from "../state/types";

/** Fields the parked route card shows for one route. */
export interface RouteCardFacts {
  eta: string;
  duration: string;
  distance: string;
  turns: string[];
  turnIndex: number;
  canCancel: boolean;
}

export function routeCardFacts(
  route: RoutePlan,
  traveledM: number,
  remainingM: number,
  speedMph: number,
  miles: boolean,
  now: Date,
): RouteCardFacts {
  const remaining = remainingM || route.distanceM;
  const remainingS = etaSeconds(route.distanceM, route.durationS, remaining, speedMph);
  const turnIndex = upcomingManeuverIndex(traveledM, route.maneuvers);
  return {
    eta: etaClock(remainingS, now),
    duration: formatDuration(remainingS),
    distance: formatDistance(remaining, miles),
    turns: route.maneuvers.slice(turnIndex, turnIndex + 4).map((m) => m.instruction),
    turnIndex,
    canCancel: true,
  };
}
