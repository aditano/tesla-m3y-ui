import type { ComponentType, SVGProps } from "react";
import { useVehicle } from "../state/store";
import { useDialogA11y } from "./dialogA11y";
import {
  IconBolt,
  IconCalendar,
  IconCamera,
  IconFan,
  IconMusic,
  IconNav,
  IconPhone,
} from "./Icons";

type Glyph = ComponentType<SVGProps<SVGSVGElement>>;

const APPS: { id: string; label: string; tone: string; Icon: Glyph; open: "camera" | "climate" | "media" | "nav" | "none" }[] = [
  { id: "camera", label: "Camera", tone: "camera", Icon: IconCamera, open: "camera" },
  { id: "climate", label: "Climate", tone: "climate", Icon: IconFan, open: "climate" },
  { id: "media", label: "Media", tone: "media", Icon: IconMusic, open: "media" },
  { id: "energy", label: "Energy", tone: "energy", Icon: IconBolt, open: "none" },
  { id: "phone", label: "Phone", tone: "phone", Icon: IconPhone, open: "none" },
  { id: "calendar", label: "Calendar", tone: "calendar", Icon: IconCalendar, open: "none" },
  { id: "nav", label: "Nav", tone: "nav", Icon: IconNav, open: "nav" },
  { id: "theater", label: "Theater", tone: "theater", Icon: IconMusic, open: "media" },
];

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
              cameraOpen: app.open === "camera",
              climateOpen: app.open === "climate",
              climateFull: app.open === "climate",
              mediaOpen: app.open === "media",
              searchOpen: app.open === "nav",
              controlsOpen: false,
              tempPopup: null,
            })
          }
        >
          <span className={`app-glyph ${app.tone}`}>
            <app.Icon />
          </span>
          <span>{app.label}</span>
        </button>
      ))}
    </div>
  );
}
