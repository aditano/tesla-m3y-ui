import type { PointerEvent as ReactPointerEvent } from "react";
import { etaClock, etaSeconds, formatDistance, formatDuration } from "../geo/polyline";
import { nextTurn } from "../geo/osrm";
import { useVehicle } from "../state/store";
import {
  IconArrive,
  IconEq,
  IconPause,
  IconPlay,
  IconRepeat,
  IconSearch,
  IconShuffle,
  IconSkip,
  IconSkipBack,
  IconStraight,
  IconTurnLeft,
  IconTurnRight,
} from "./Icons";
import type { Maneuver } from "../state/types";
import { ArrivalBattery, TripProgress } from "./TripProgress";
import { cycleRepeat, scrubFromClientX, togglePlayback, toggleShuffle } from "./shellActions";
import { showsExpandedTripCards } from "../viz/layout";

const TRACK_SECONDS = 214;

function formatClock(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

function TurnGlyph({ m }: { m: Maneuver }) {
  if (m.type === "arrive") return <IconArrive width={30} height={30} />;
  const mod = m.modifier ?? "";
  if (mod.includes("left")) return <IconTurnLeft width={30} height={30} />;
  if (mod.includes("right")) return <IconTurnRight width={30} height={30} />;
  return <IconStraight width={30} height={30} />;
}

function PlusGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/**
 * v12 on-viz player (`nata-v12-media-player.jpg`): art left, title + artist,
 * shuffle/repeat on the top row, a hairline scrubber, then the transport row.
 */
function DriveMedia() {
  const media = useVehicle((s) => s.media);
  const patchUi = useVehicle((s) => s.patchUi);
  const skipTrack = useVehicle((s) => s.skipTrack);
  const openFull = () => patchUi({ mediaOpen: true, climateOpen: false, climateFull: false, appsOpen: false, tempPopup: null });
  const pct = Math.round(media.progress * 100);
  const onScrubPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.type === "pointermove" && event.buttons === 0) return;
    if (event.type === "pointerdown") {
      event.currentTarget.setPointerCapture?.(event.pointerId);
    }
    const rect = event.currentTarget.getBoundingClientRect();
    scrubFromClientX(event.clientX, rect.left, rect.width);
  };

  return (
    <div className="drive-media">
      <div className="drive-media-top">
        <button type="button" className="drive-media-main" onClick={openFull}>
          <div className="media-art" />
          <span>
            <strong>{media.track}</strong>
            <span>{media.artist}</span>
          </span>
        </button>
        <button
          type="button"
          className={media.shuffle ? "on" : ""}
          title="Shuffle"
          onClick={toggleShuffle}
        >
          <IconShuffle width={20} height={20} />
        </button>
        <button
          type="button"
          className={media.repeat !== "off" ? "on" : ""}
          title="Repeat"
          onClick={cycleRepeat}
        >
          <IconRepeat width={20} height={20} />
        </button>
      </div>
      <div
        className="drive-media-progress"
        role="slider"
        tabIndex={0}
        aria-label="Playback position"
        aria-valuemin={0}
        aria-valuemax={TRACK_SECONDS}
        aria-valuenow={Math.round(media.progress * TRACK_SECONDS)}
        aria-valuetext={`${formatClock(media.progress * TRACK_SECONDS)} of ${formatClock(TRACK_SECONDS)}`}
        onPointerDown={onScrubPointer}
        onPointerMove={onScrubPointer}
      >
        <i style={{ width: `${pct}%` }} />
        <b style={{ left: `${pct}%` }} />
      </div>
      <div className="drive-media-actions">
        <button type="button" title="Previous" onClick={() => skipTrack(-1)}>
          <IconSkipBack width={22} height={22} />
        </button>
        <button type="button" title={media.playing ? "Pause" : "Play"} onClick={togglePlayback}>
          {media.playing ? <IconPause width={24} height={24} /> : <IconPlay width={24} height={24} />}
        </button>
        <button type="button" title="Next" onClick={() => skipTrack(1)}>
          <IconSkip width={22} height={22} />
        </button>
        <button type="button" title="Add to library">
          <PlusGlyph />
        </button>
        <button type="button" title="Equalizer" onClick={openFull}>
          <IconEq width={22} height={22} />
        </button>
        <button type="button" title="Search media" onClick={openFull}>
          <IconSearch width={22} height={22} />
        </button>
      </div>
    </div>
  );
}

/**
 * On-viz chrome. Split view: the v12 media card. Expanded viz (map is the corner inset):
 * next-turn card top-left, trip card bottom-right, per `nata-park-assist-fullscreen.jpg`.
 */
export function DriveOverlay({ expanded }: { expanded: boolean }) {
  const phase = useVehicle((s) => s.phase);
  const route = useVehicle((s) => s.route);
  const dest = useVehicle((s) => s.destination);
  const pose = useVehicle((s) => s.pose);
  const mediaOpen = useVehicle((s) => s.ui.mediaOpen);
  const miles = useVehicle((s) => s.flags.unitsMph);
  const frozen = useVehicle((s) => s.qa.frozen);
  const disengage = useVehicle((s) => s.disengageFsd);

  const showNav = route != null && dest != null && showsExpandedTripCards(expanded, phase, true);
  const turn = showNav ? nextTurn(pose.traveledM, route.maneuvers) : null;
  const remainingM = route ? pose.remainingM || route.distanceM : 0;
  const remainingS = route ? etaSeconds(route.distanceM, route.durationS, remainingM, pose.speedMph) : 0;
  const etaNow = frozen ? new Date(2026, 8, 16, 16, 20, 0) : new Date();

  return (
    <>
      {showNav && turn ? (
        <div className="drive-turn">
          <TurnGlyph m={turn.maneuver} />
          <div className="drive-turn-copy">
            <strong>{formatDistance(turn.distanceM, miles)}</strong>
            <span>{turn.maneuver.name || turn.maneuver.instruction}</span>
          </div>
        </div>
      ) : null}
      <div className={`drive-overlay ${expanded ? "expanded" : ""}`}>
        {mediaOpen ? <span /> : <DriveMedia />}
        {showNav ? (
          <div className="drive-nav">
            <div className="drive-nav-row">
              <strong>{etaClock(remainingS, etaNow)}</strong>
              <span>
                {formatDuration(remainingS)} · {formatDistance(remainingM, miles)}
              </span>
            </div>
            <div className="drive-nav-row">
              <span className="drive-nav-dest">{dest.name}</span>
              <ArrivalBattery route={route} />
            </div>
            <TripProgress route={route} />
            <div className="drive-nav-actions">
              {phase === "fsd" ? (
                <button type="button" className="drive-end" onClick={disengage}>
                  End Self-Driving
                </button>
              ) : (
                <span className="drive-end muted">Self-Driving off</span>
              )}
              <button type="button" className="drive-more" title="More trip options">
                •••
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
