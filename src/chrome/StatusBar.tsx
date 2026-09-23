import { useEffect, useState } from "react";
import { useVehicle } from "../state/store";
import { IconAirbag, IconCell, IconLock, IconPerson, IconShield, IconUnlock, IconWifi } from "./Icons";

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

  return (
    <header className={`status-bar ${flags.textSize === "large" ? "text-lg" : ""}`}>
      <div className="status-left">
        <button
          className="status-icon"
          title={flags.locked ? "Unlock" : "Lock"}
          onClick={() => patchFlags({ locked: !flags.locked })}
        >
          {flags.locked ? <IconLock /> : <IconUnlock />}
        </button>
        <button
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
        <button
          className={`status-icon ${flags.sentry ? "warn" : ""}`}
          title="Sentry Mode"
          onClick={() => patchFlags({ sentry: !flags.sentry })}
        >
          <IconShield />
        </button>
        <button
          className={`status-icon ${flags.cellular ? "active" : "dim"}`}
          title="Cellular"
          onClick={() => patchFlags({ cellular: !flags.cellular })}
        >
          <IconCell />
        </button>
        <button
          className={`status-icon ${flags.wifi ? "active" : "dim"}`}
          title="Wi-Fi"
          onClick={() => patchFlags({ wifi: !flags.wifi })}
        >
          <IconWifi />
        </button>
      </div>
      <div className="status-center">
        <div className="status-time">{time}</div>
        <span className="status-weather" title="Outdoor temperature">
          {outdoor}
        </span>
      </div>
      <div className="status-right">
        <span className="status-airbag" title="Passenger airbag on">
          <IconAirbag />
          <span>Passenger airbag</span>
        </span>
      </div>
    </header>
  );
}
