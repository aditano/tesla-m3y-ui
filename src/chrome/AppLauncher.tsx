import { useVehicle } from "../state/store";
import { useDialogA11y } from "./dialogA11y";
import { IconBolt, IconCalendar, IconCamera, IconMusic, IconPhone } from "./Icons";

const APPS = [
  { id: "camera", label: "Camera", Icon: IconCamera },
  { id: "calendar", label: "Calendar", Icon: IconCalendar },
  { id: "energy", label: "Energy", Icon: IconBolt },
  { id: "phone", label: "Phone", Icon: IconPhone },
  { id: "theater", label: "Theater", Icon: IconMusic },
] as const;

export function AppLauncher() {
  const open = useVehicle((s) => s.ui.appsOpen);
  const patchUi = useVehicle((s) => s.patchUi);
  const close = () => patchUi({ appsOpen: false });
  const dialogRef = useDialogA11y<HTMLDivElement>(open, close);
  if (!open) return null;

  return (
    <div ref={dialogRef} className="apps-tray" role="dialog" aria-modal="true" aria-label="Apps" tabIndex={-1}>
      {APPS.map((app) => (
        <button
          key={app.id}
          type="button"
          className="app-tile"
          title={app.label}
          onClick={() =>
            patchUi({
              appsOpen: false,
              mediaOpen: app.id === "theater",
            })
          }
        >
          <span className="app-btn">
            <app.Icon />
          </span>
          <span>{app.label}</span>
        </button>
      ))}
    </div>
  );
}
