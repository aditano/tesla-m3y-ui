import { useEffect } from "react";
import { useVehicle } from "../state/store";
import {
  IconApps,
  IconBolt,
  IconCalendar,
  IconCamera,
  IconCar,
  IconChevron,
  IconChevronLeft,
  IconFan,
  IconSeat,
  IconVolume,
} from "./Icons";

function tempTone(tempF: number, on: boolean): "heat" | "cool" | "off" {
  if (!on) return "off";
  return tempF >= 72 ? "heat" : "cool";
}

function displayTemp(tempF: number, celsius: boolean): string {
  if (celsius) return String(Math.round(((tempF - 32) * 5) / 9));
  return String(tempF);
}

export function BottomDock() {
  const climate = useVehicle((s) => s.climate);
  const media = useVehicle((s) => s.media);
  const ui = useVehicle((s) => s.ui);
  const flags = useVehicle((s) => s.flags);
  const patchClimate = useVehicle((s) => s.patchClimate);
  const patchMedia = useVehicle((s) => s.patchMedia);
  const patchUi = useVehicle((s) => s.patchUi);
  const cycleSeat = useVehicle((s) => s.cycleSeat);
  const celsius = !flags.temperatureF;

  useEffect(() => {
    if (!ui.tempPopup) return;
    const close = () => patchUi({ tempPopup: null });
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, [patchUi, ui.tempPopup]);

  const driverTemp = climate.on ? displayTemp(climate.driverTempF, celsius) : "Off";
  const passengerTemp = displayTemp(climate.split ? climate.passengerTempF : climate.driverTempF, celsius);

  return (
    <footer className="bottom-dock">
      <div className="dock-left">
        <button
          type="button"
          className={`app-btn ${ui.controlsOpen ? "on" : ""}`}
          title="Controls"
          onClick={() =>
            patchUi({
              controlsOpen: !ui.controlsOpen,
              controlsTab: "quick",
              appsOpen: false,
              climateOpen: false,
              mediaOpen: false,
              tempPopup: null,
            })
          }
        >
          <IconCar />
        </button>
        <button
          type="button"
          className={`app-btn launcher ${ui.appsOpen ? "on" : ""}`}
          title="App launcher"
          onClick={() =>
            patchUi({
              appsOpen: !ui.appsOpen,
              climateOpen: false,
              mediaOpen: false,
              tempPopup: null,
            })
          }
        >
          <IconApps />
        </button>
        <div className="my-apps">
          <button
            type="button"
            className="app-btn"
            title="Camera"
            onClick={() => patchUi({ appsOpen: true, climateOpen: false, mediaOpen: false })}
          >
            <IconCamera />
          </button>
          <button
            type="button"
            className="app-btn"
            title="Calendar"
            onClick={() => patchUi({ appsOpen: true, climateOpen: false, mediaOpen: false })}
          >
            <IconCalendar />
          </button>
          <button
            type="button"
            className="app-btn"
            title="Energy"
            onClick={() => patchUi({ appsOpen: true, climateOpen: false, mediaOpen: false })}
          >
            <IconBolt />
          </button>
        </div>
      </div>

      <div className="climate-cluster">
        <button
          type="button"
          className={`seat-btn ${climate.seats.fl ? "on" : ""}`}
          title="Driver seat heater"
          onClick={() => cycleSeat("fl")}
        >
          <IconSeat />
          <span className="seat-pips" data-level={climate.seats.fl}>
            <i />
            <i />
            <i />
          </span>
        </button>
        <div className="temp-stack" onPointerDown={(e) => e.stopPropagation()}>
          <button
            type="button"
            className={`temp-btn ${tempTone(climate.driverTempF, climate.on)}`}
            title="Driver temperature"
            onClick={() =>
              patchUi({
                climateOpen: true,
                mediaOpen: false,
                appsOpen: false,
                tempPopup: null,
              })
            }
          >
            {driverTemp}
          </button>
          {ui.tempPopup === "driver" ? (
            <div className="temp-popover">
              <button type="button" onClick={() => useVehicle.getState().nudgeTemp("driver", -1)}>
                −
              </button>
              <span>{driverTemp}</span>
              <button type="button" onClick={() => useVehicle.getState().nudgeTemp("driver", 1)}>
                +
              </button>
              <button
                type="button"
                className={climate.split ? "on" : ""}
                onClick={() => patchClimate({ split: !climate.split, sync: climate.split })}
              >
                Split
              </button>
            </div>
          ) : null}
        </div>
        <button
          type="button"
          className={`fan-btn ${ui.climateOpen ? "on" : ""} ${climate.on ? "live" : ""}`}
          title="Climate"
          onClick={() =>
            patchUi({
              climateOpen: !ui.climateOpen,
              mediaOpen: false,
              appsOpen: false,
              tempPopup: null,
            })
          }
        >
          <IconFan />
        </button>
        {climate.split ? (
          <div className="temp-stack" onPointerDown={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={`temp-btn ${tempTone(climate.passengerTempF, climate.on)}`}
              title="Passenger temperature"
              onClick={() =>
                patchUi({
                  climateOpen: true,
                  mediaOpen: false,
                  appsOpen: false,
                  tempPopup: null,
                })
              }
            >
              {passengerTemp}
            </button>
          </div>
        ) : (
          <button
            type="button"
            className={`temp-btn ${tempTone(climate.driverTempF, climate.on)}`}
            title="Passenger temperature"
            onClick={() => patchClimate({ split: true, sync: false })}
          >
            {passengerTemp}
          </button>
        )}
        <button
          type="button"
          className={`seat-btn ${climate.seats.fr ? "on" : ""}`}
          title="Passenger seat heater"
          onClick={() => cycleSeat("fr")}
        >
          <IconSeat />
          <span className="seat-pips" data-level={climate.seats.fr}>
            <i />
            <i />
            <i />
          </span>
        </button>
      </div>

      <div className="dock-right">
        <div className="volume-wrap">
          <button
            type="button"
            className="vol-step"
            title="Quieter"
            onClick={() => patchMedia({ volume: Math.max(0, media.volume - 5), muted: false })}
          >
            <IconChevronLeft />
          </button>
          <button type="button" className="vol-icon" title="Mute" onClick={() => patchMedia({ muted: !media.muted })}>
            <IconVolume />
          </button>
          <button
            type="button"
            className="vol-step"
            title="Louder"
            onClick={() => patchMedia({ volume: Math.min(100, media.volume + 5), muted: false })}
          >
            <IconChevron />
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={media.muted ? 0 : media.volume}
            onChange={(e) => patchMedia({ volume: Number(e.target.value), muted: false })}
            aria-label="Volume"
          />
        </div>
      </div>
    </footer>
  );
}
