import { useVehicle } from "../state/store";
import { useDialogA11y } from "./dialogA11y";
import { IconClose } from "./Icons";

const FEEDS = [
  { id: "front", label: "Front" },
  { id: "back", label: "Back" },
  { id: "left", label: "Left repeater" },
  { id: "right", label: "Right repeater" },
] as const;

/** Stylized camera app. Feeds are drawings, not vehicle camera frames. */
export function CameraPanel() {
  const open = useVehicle((s) => s.ui.cameraOpen);
  const patchUi = useVehicle((s) => s.patchUi);
  const close = () => patchUi({ cameraOpen: false });
  const dialogRef = useDialogA11y<HTMLDivElement>(open, close);
  if (!open) return null;

  return (
    <>
      <button className="panel-scrim" aria-label="Close camera" onClick={close} />
      <div ref={dialogRef} className="camera-sheet" role="dialog" aria-modal="true" aria-label="Camera" tabIndex={-1}>
        <header className="camera-head">
          <h2>Camera</h2>
          <button type="button" className="icon-ghost" aria-label="Close" onClick={close}>
            <IconClose />
          </button>
        </header>
        <div className="camera-grid">
          {FEEDS.map((feed) => (
            <div key={feed.id} className={`cam-feed cam-${feed.id}`}>
              <span>{feed.label}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
