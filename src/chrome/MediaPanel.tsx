import { useVehicle } from "../state/store";
import { IconPause, IconPlay, IconSkip } from "./Icons";

export function MediaPanel() {
  const open = useVehicle((s) => s.ui.mediaOpen);
  const media = useVehicle((s) => s.media);
  const patchMedia = useVehicle((s) => s.patchMedia);
  const patchUi = useVehicle((s) => s.patchUi);

  if (!open) return null;

  return (
    <div className="panel" role="dialog" aria-label="Media">
      <h3>Media</h3>
      <div style={{ display: "grid", gridTemplateColumns: "88px 1fr", gap: 16, alignItems: "center" }}>
        <div className="media-art" style={{ width: 88, height: 88, borderRadius: 12 }} />
        <div>
          <strong style={{ fontSize: 22 }}>{media.track}</strong>
          <div style={{ color: "#999", margin: "4px 0 12px" }}>
            {media.artist} · {media.source}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn ghost" onClick={() => patchMedia({ playing: !media.playing })}>
              {media.playing ? <IconPause width={18} height={18} /> : <IconPlay width={18} height={18} />}
            </button>
            <button className="btn ghost">
              <IconSkip width={18} height={18} />
            </button>
            <button className="btn ghost" onClick={() => patchUi({ mediaOpen: false })}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
