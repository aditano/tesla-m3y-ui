import { useVehicle } from "../state/store";
import { IconPause, IconPlay, IconSkip } from "./Icons";

export function ParkedMedia() {
  const media = useVehicle((s) => s.media);
  const patchMedia = useVehicle((s) => s.patchMedia);
  const patchUi = useVehicle((s) => s.patchUi);

  return (
    <div className="parked-media">
      <button
        className="parked-media-main"
        onClick={() => patchUi({ mediaOpen: true, climateOpen: false, appsOpen: false })}
      >
        <div className="media-art" />
        <div className="media-meta">
          <strong>{media.track}</strong>
          <span>
            {media.artist} · {media.source}
          </span>
        </div>
      </button>
      <div className="parked-media-transport">
        <button
          title={media.playing ? "Pause" : "Play"}
          onClick={() => patchMedia({ playing: !media.playing })}
        >
          {media.playing ? <IconPause /> : <IconPlay />}
        </button>
        <button title="Next">
          <IconSkip />
        </button>
      </div>
      <div className="media-progress" aria-hidden="true">
        <i style={{ width: `${Math.round(media.progress * 100)}%` }} />
      </div>
    </div>
  );
}
