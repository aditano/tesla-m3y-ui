import { etaClock, etaSeconds, formatDistance, formatDuration } from "../geo/polyline";
import { upcomingManeuverIndex } from "../geo/osrm";
import { useVehicle } from "../state/store";
import {
  IconArrive,
  IconPause,
  IconPlay,
  IconRepeat,
  IconShuffle,
  IconSkip,
  IconSkipBack,
  IconStraight,
  IconTurnLeft,
  IconTurnRight,
} from "./Icons";
import type { Maneuver } from "../state/types";

const TRACK_SECONDS = 214;

function formatClock(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

function TurnGlyph({ m }: { m: Maneuver }) {
  if (m.type === "arrive") return <IconArrive width={22} height={22} />;
  const mod = m.modifier ?? "";
  if (mod.includes("left")) return <IconTurnLeft width={22} height={22} />;
  if (mod.includes("right")) return <IconTurnRight width={22} height={22} />;
  return <IconStraight width={22} height={22} />;
}

/** Media strip on the visualization, plus the navigate card when the map is the corner inset. */
export function DriveOverlay({ expanded }: { expanded: boolean }) {
  const phase = useVehicle((s) => s.phase);
  const route = useVehicle((s) => s.route);
  const dest = useVehicle((s) => s.destination);
  const pose = useVehicle((s) => s.pose);
  const media = useVehicle((s) => s.media);
  const mediaOpen = useVehicle((s) => s.ui.mediaOpen);
  const miles = useVehicle((s) => s.flags.unitsMph);
  const frozen = useVehicle((s) => s.qa.frozen);
  const patchUi = useVehicle((s) => s.patchUi);
  const patchMedia = useVehicle((s) => s.patchMedia);
  const skipTrack = useVehicle((s) => s.skipTrack);
  const disengage = useVehicle((s) => s.disengageFsd);

  const showNav = expanded && route && dest && (phase === "fsd" || phase === "disengaged");
  const next = showNav ? route.maneuvers[upcomingManeuverIndex(pose.traveledM, route.maneuvers)] : undefined;
  const remainingS = route
    ? etaSeconds(route.distanceM, route.durationS, pose.remainingM || route.distanceM, pose.speedMph)
    : 0;
  const etaNow = frozen ? new Date(2026, 8, 16, 16, 20, 0) : new Date();
  const totalM = route ? Math.max(1, pose.traveledM + pose.remainingM) : 1;
  const progress = route ? Math.min(100, (pose.traveledM / totalM) * 100) : 0;

  return (
    <div className={`drive-overlay ${expanded ? "expanded" : ""}`}>
      {showNav && next ? (
        <div className="drive-nav">
          <TurnGlyph m={next} />
          <div className="drive-nav-copy">
            <strong>{next.instruction}</strong>
            <span>
              {etaClock(remainingS, etaNow)} · {formatDuration(remainingS)} ·{" "}
              {formatDistance(pose.remainingM || route.distanceM, miles)}
              {dest ? ` · ${dest.name}` : ""}
            </span>
          </div>
          {phase === "fsd" ? (
            <button type="button" className="drive-end" onClick={disengage}>
              End Self-Driving
            </button>
          ) : null}
          <div className="trip-bar" aria-hidden="true">
            <i style={{ width: `${progress}%` }} />
          </div>
        </div>
      ) : null}
      {mediaOpen ? null : (
        <div className="drive-media">
          <button
            type="button"
            className="drive-media-main"
            onClick={() => patchUi({ mediaOpen: true, climateOpen: false, appsOpen: false, tempPopup: null })}
          >
            <span>
              <strong>{media.track}</strong>
              <span>{media.artist}</span>
            </span>
            <div className="media-art" />
          </button>
          <div className="drive-media-actions">
            <button type="button" title="Previous" onClick={() => skipTrack(-1)}>
              <IconSkipBack width={22} height={22} />
            </button>
            <button
              type="button"
              title={media.playing ? "Pause" : "Play"}
              onClick={() => patchMedia({ playing: !media.playing })}
            >
              {media.playing ? <IconPause width={26} height={26} /> : <IconPlay width={26} height={26} />}
            </button>
            <button type="button" title="Next" onClick={() => skipTrack(1)}>
              <IconSkip width={22} height={22} />
            </button>
            <button
              type="button"
              className={media.shuffle ? "on" : ""}
              title="Shuffle"
              onClick={() => patchMedia({ shuffle: !media.shuffle })}
            >
              <IconShuffle width={20} height={20} />
            </button>
            <button
              type="button"
              className={media.repeat !== "off" ? "on" : ""}
              title="Repeat"
              onClick={() =>
                patchMedia({
                  repeat: media.repeat === "off" ? "all" : media.repeat === "all" ? "one" : "off",
                })
              }
            >
              <IconRepeat width={20} height={20} />
            </button>
          </div>
          <div className="drive-media-times">
            <span>{formatClock(media.progress * TRACK_SECONDS)}</span>
            <div className="drive-media-progress" aria-hidden="true">
              <i style={{ width: `${Math.round(media.progress * 100)}%` }} />
            </div>
            <span>−{formatClock(TRACK_SECONDS - media.progress * TRACK_SECONDS)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
