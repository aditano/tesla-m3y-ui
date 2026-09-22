import { useVehicle } from "../state/store";
import type { MediaSourceId } from "../state/types";
import {
  IconEq,
  IconPause,
  IconPlay,
  IconRepeat,
  IconSearch,
  IconShuffle,
  IconSkip,
  IconSkipBack,
} from "./Icons";

const LIVE_SOURCES: { id: MediaSourceId; label: string }[] = [
  { id: "radio", label: "Radio" },
  { id: "bluetooth", label: "Bluetooth" },
  { id: "streaming", label: "Streaming" },
];

const STUB_SOURCES = ["USB", "TuneIn", "Caraoke"] as const;

function formatClock(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export function MediaPanel() {
  const open = useVehicle((s) => s.ui.mediaOpen);
  const media = useVehicle((s) => s.media);
  const patchMedia = useVehicle((s) => s.patchMedia);
  const patchUi = useVehicle((s) => s.patchUi);
  const skipTrack = useVehicle((s) => s.skipTrack);

  const duration = 214;
  const elapsed = media.progress * duration;
  const sourceLabel = media.source[0].toUpperCase() + media.source.slice(1);

  if (!open) return null;

  return (
    <>
      <button className="panel-scrim" aria-label="Close media" onClick={() => patchUi({ mediaOpen: false })} />
      <div className="media-sheet" role="dialog" aria-label="Media">
        <div className="media-player-head">
          <div>
            <h2>{media.track}</h2>
            <div className="media-artist">
              {media.artist} · {sourceLabel}
            </div>
          </div>
          <div className="media-art hero" />
        </div>
        <div className="transport">
          <button type="button" onClick={() => skipTrack(-1)} title="Previous">
            <IconSkipBack width={22} height={22} />
          </button>
          <button type="button" className="play-lg" onClick={() => patchMedia({ playing: !media.playing })}>
            {media.playing ? <IconPause width={26} height={26} /> : <IconPlay width={26} height={26} />}
          </button>
          <button type="button" onClick={() => skipTrack(1)} title="Next">
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
          <button type="button" title="Search" className="icon-ghost">
            <IconSearch width={18} height={18} />
          </button>
          <button type="button" title="EQ" className="icon-ghost">
            <IconEq width={18} height={18} />
          </button>
        </div>
        <div className="scrub-row">
          <span>{formatClock(elapsed)}</span>
          <input
            className="scrub-input"
            type="range"
            min={0}
            max={1000}
            value={Math.round(media.progress * 1000)}
            onChange={(e) => patchMedia({ progress: Number(e.target.value) / 1000 })}
            aria-label="Scrub"
            style={{
              background: `linear-gradient(90deg, #fff ${media.progress * 100}%, rgba(255,255,255,0.28) ${media.progress * 100}%)`,
            }}
          />
          <span>−{formatClock(duration - elapsed)}</span>
        </div>
        <div className="media-source-head">
          <span>Sources</span>
        </div>
        <div className="media-source-grid">
          {LIVE_SOURCES.map((s) => (
            <button
              key={s.id}
              type="button"
              className={media.source === s.id ? "on" : ""}
              onClick={() => patchMedia({ source: s.id })}
            >
              {s.label}
            </button>
          ))}
          {STUB_SOURCES.map((label) => (
            <button key={label} type="button" className="stub" disabled>
              {label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
