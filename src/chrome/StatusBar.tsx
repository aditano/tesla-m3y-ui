import { useEffect, useState } from "react";
import { useVehicle } from "../state/store";
import { IconAirbag, IconLock, IconPerson, IconShield, IconUnlock, IconWifi } from "./Icons";
import { statusCenterIds, statusLeftIds, statusRightIds, type StatusItemId } from "./statusItems";

function useClock(format24: boolean): string {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 10_000);
    return () => window.clearInterval(id);
  }, []);
  const m = now.getMinutes().toString().padStart(2, "0");
  if (format24) {
    return `${now.getHours().toString().padStart(2, "0")}:${m}`;
  }
  let h = now.getHours();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

export function StatusBar() {
  const flags = useVehicle((s) => s.flags);
  const profile = useVehicle((s) => s.ui.driverProfile);
  const patchFlags = useVehicle((s) => s.patchFlags);
  const patchUi = useVehicle((s) => s.patchUi);
  const live = useClock(flags.timeFormat24);
  const qaClock = useVehicle((s) => s.qa.clock);
  const time = qaClock ?? live;
  const outdoor = flags.temperatureF ? "54°" : "12°";

  const left = statusLeftIds();
  const center = statusCenterIds();

  const item = (id: StatusItemId) => {
    switch (id) {
      case "lock":
        return (
          <button
            key={id}
            className="status-icon"
            title={flags.locked ? "Unlock" : "Lock"}
            onClick={() => patchFlags({ locked: !flags.locked })}
          >
            {flags.locked ? <IconLock /> : <IconUnlock />}
          </button>
        );
      case "profile":
        return (
          <button
            key={id}
            className="status-profile"
            title={`Driver profile · ${profile}`}
            onClick={() =>
              patchUi({
                controlsOpen: true,
                controlsTab: "quick",
                appsOpen: false,
                climateOpen: false,
                mediaOpen: false,
                tempPopup: null,
              })
            }
          >
            <IconPerson />
            <span>{profile}</span>
          </button>
        );
      case "sentry":
        return (
          <button
            key={id}
            className={`status-icon ${flags.sentry ? "warn" : ""}`}
            title="Sentry Mode"
            onClick={() => patchFlags({ sentry: !flags.sentry })}
          >
            <IconShield />
          </button>
        );
      case "wifi":
        return (
          <button
            key={id}
            className={`status-icon ${flags.wifi ? "active" : "dim"}`}
            title="Wi-Fi"
            onClick={() => patchFlags({ wifi: !flags.wifi })}
          >
            <IconWifi />
          </button>
        );
      case "clock":
        return (
          <div key={id} className="status-time">
            {time}
          </div>
        );
      case "outdoor":
        return (
          <span key={id} className="status-weather" title="Outdoor temperature">
            {outdoor}
          </span>
        );
      case "airbag":
        return (
          <span key={id} className="status-airbag" title="Passenger airbag on">
            <IconAirbag />
            <span className="status-airbag-copy">
              <span>Passenger</span>
              <span>
                Airbag <em>On</em>
              </span>
            </span>
          </span>
        );
      default: {
        const _exhaustive: never = id;
        return _exhaustive;
      }
    }
  };

  return (
    <header className={`status-bar ${flags.textSize === "large" ? "text-lg" : ""}`}>
      <div className="status-left">{left.map(item)}</div>
      <div className="status-center">{center.map(item)}</div>
      <div className="status-right">{statusRightIds().map(item)}</div>
    </header>
  );
}
