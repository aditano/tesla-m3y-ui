import { useEffect, useState } from "react";
import { useVehicle } from "../state/store";
import { isParkedFullscreen } from "../viz/layout";
import {
  IconBattery,
  IconBluetooth,
  IconCell,
  IconGear,
  IconLock,
  IconPerson,
  IconSentry,
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
  const gear = useVehicle((s) => s.gear);
  const phase = useVehicle((s) => s.phase);
  const parked = isParkedFullscreen(gear, phase);
  const energyAsPercent = flags.energyAsPercent;
  const range = energyAsPercent ? "82%" : "278 mi";

  const openControls = () => patchUi({ controlsOpen: true, appsOpen: false, climateOpen: false });

  if (parked) {
    return (
      <header className="status-bar parked">
        <div className="status-left">
          <button
            className="status-icon"
            title={flags.locked ? "Lock" : "Unlock"}
            onClick={() => patchFlags({ locked: !flags.locked })}
          >
            {flags.locked ? <IconLock /> : <IconUnlock />}
          </button>
          <button className="status-profile" title="Driver profile" onClick={openControls}>
            <IconPerson />
            <span>Driver</span>
          </button>
          <button
            className={`status-icon ${flags.sentry ? "warn" : ""}`}
            title="Sentry Mode"
            onClick={() => patchFlags({ sentry: !flags.sentry })}
          >
            <IconSentry />
          </button>
          {flags.wifi ? (
            <span className="status-icon" title="Wi-Fi">
              <IconWifi />
            </span>
          ) : null}
        </div>
        <div className="status-center">
          <span className="status-time">{time}</span>
          <span className="status-temp">72°</span>
        </div>
        <div className="status-right">
          <span className="airbag-badge" title="Passenger airbag on">
            <b>PASSENGER</b> AIRBAG ON
          </span>
          <button
            className="battery-chip"
            title="Toggle energy display"
            onClick={() => patchFlags({ energyAsPercent: !energyAsPercent })}
          >
            <IconBattery />
            <span className="range-label">{range}</span>
          </button>
        </div>
      </header>
    );
  }

  return (
    <header className="status-bar">
      <div className="status-left">
        <button className="status-icon" title="Controls" onClick={openControls}>
          <IconGear />
        </button>
        <button
          className="status-icon"
          title="Driver profile"
          onClick={() => patchUi({ controlsOpen: true, controlsTab: "quick" })}
        >
          <IconPerson />
        </button>
        <button
          className={`status-icon ${flags.sentry ? "warn" : ""}`}
          title="Sentry Mode"
          onClick={() => patchFlags({ sentry: !flags.sentry })}
        >
          <IconSentry />
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
