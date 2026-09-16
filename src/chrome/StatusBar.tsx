import { useEffect, useState } from "react";
import { useVehicle } from "../state/store";
import {
  IconBattery,
  IconBluetooth,
  IconCell,
  IconGear,
  IconLock,
  IconPerson,
  IconShield,
  IconUnlock,
  IconWifi,
} from "./Icons";

function useClock(): string {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 10_000);
    return () => window.clearInterval(id);
  }, []);
  let h = now.getHours();
  const m = now.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

export function StatusBar() {
  const live = useClock();
  const qaClock = useVehicle((s) => s.qa.clock);
  const time = qaClock ?? live;
  const flags = useVehicle((s) => s.flags);
  const patchFlags = useVehicle((s) => s.patchFlags);
  const patchUi = useVehicle((s) => s.patchUi);
  const energyAsPercent = flags.energyAsPercent;
  const range = energyAsPercent ? "82%" : "278 mi";

  return (
    <header className="status-bar">
      <div className="status-left">
        <button
          className="status-icon"
          title="Controls"
          onClick={() => patchUi({ controlsOpen: true, appsOpen: false, climateOpen: false })}
        >
          <IconGear />
        </button>
        <button className="status-icon" title="Driver profile" onClick={() => patchUi({ controlsOpen: true, controlsTab: "quick" })}>
          <IconPerson />
        </button>
        <button
          className={`status-icon ${flags.sentry ? "warn" : ""}`}
          title="Sentry Mode"
          onClick={() => patchFlags({ sentry: !flags.sentry })}
        >
          <IconShield />
        </button>
        {flags.bluetooth ? (
          <span className="status-icon" title="Bluetooth">
            <IconBluetooth />
          </span>
        ) : null}
        {flags.wifi ? (
          <span className="status-icon" title="Wi-Fi">
            <IconWifi />
          </span>
        ) : null}
        {flags.cellular ? (
          <span className="status-icon" title="Cellular">
            <IconCell />
          </span>
        ) : null}
      </div>
      <div className="status-time">{time}</div>
      <div className="status-right">
        <button
          className="battery-chip"
          title="Toggle energy display"
          onClick={() => patchFlags({ energyAsPercent: !energyAsPercent })}
        >
          <IconBattery />
          <span className="range-label">{range}</span>
        </button>
        <button
          className="status-icon"
          title={flags.locked ? "Unlock" : "Lock"}
          onClick={() => patchFlags({ locked: !flags.locked })}
        >
          {flags.locked ? <IconLock /> : <IconUnlock />}
        </button>
      </div>
    </header>
  );
}
