import { useVehicle } from "../state/store";
import { useDialogA11y } from "./dialogA11y";
import { IconDefrostFront, IconDefrostRear, IconFan, IconSeat } from "./Icons";

function displayTemp(tempF: number, celsius: boolean): string {
  if (celsius) return `${Math.round(((tempF - 32) * 5) / 9)}°`;
  return `${tempF}°`;
}

export function ClimatePanel() {
  const open = useVehicle((s) => s.ui.climateOpen);
  const climate = useVehicle((s) => s.climate);
  const flags = useVehicle((s) => s.flags);
  const patchClimate = useVehicle((s) => s.patchClimate);
  const patchFlags = useVehicle((s) => s.patchFlags);
  const patchUi = useVehicle((s) => s.patchUi);
  const cycleSeat = useVehicle((s) => s.cycleSeat);
  const celsius = !flags.temperatureF;
  const close = () => patchUi({ climateOpen: false });
  const dialogRef = useDialogA11y<HTMLDivElement>(open, close);

  if (!open) return null;

  const setTemp = (next: number) => {
    const clamped = Math.min(85, Math.max(59, next));
    if (climate.split) {
      patchClimate({ driverTempF: clamped, on: true });
      return;
    }
    patchClimate({ driverTempF: clamped, passengerTempF: clamped, on: true, sync: true });
  };

  return (
    <>
      <button className="panel-scrim" aria-label="Close climate" onClick={close} />
      <div ref={dialogRef} className="climate-sheet" role="dialog" aria-modal="true" aria-label="Climate" tabIndex={-1}>
        <div className="climate-popup-row">
          <button
            type="button"
            className={`clim-tile ${climate.on ? "on" : ""}`}
            title="Main climate"
            onClick={() => patchClimate({ on: !climate.on, auto: !climate.on ? true : climate.auto })}
          >
            <IconFan width={22} height={22} />
          </button>
          <button
            type="button"
            className={`clim-tile seat ${climate.seats.fl ? "on" : ""}`}
            title="Front seats"
            onClick={() => cycleSeat("fl")}
          >
            <IconSeat width={22} height={22} />
            <span>{climate.seats.fl ? "Heat" : "Off"}</span>
          </button>
          <button
            type="button"
            className={`clim-tile ${climate.defrostFront ? "on" : ""}`}
            title="Front defrost"
            onClick={() => patchClimate({ defrostFront: !climate.defrostFront, on: true })}
          >
            <IconDefrostFront width={22} height={22} />
          </button>
          <button
            type="button"
            className={`clim-tile ${climate.defrostRear ? "on" : ""}`}
            title="Rear defrost"
            onClick={() => {
              patchClimate({ defrostRear: !climate.defrostRear });
              patchFlags({ mirrorHeat: !climate.defrostRear });
            }}
          >
            <IconDefrostRear width={22} height={22} />
          </button>
        </div>
        <div className="climate-slider-row">
          <input
            className="temp-slider"
            type="range"
            min={59}
            max={82}
            value={climate.driverTempF}
            onChange={(e) => setTemp(Number(e.target.value))}
            aria-label="Cabin temperature"
          />
          <span className="temp-readout">{climate.on ? displayTemp(climate.driverTempF, celsius) : "Off"}</span>
          <button
            type="button"
            className={`split-btn ${climate.split ? "on" : ""}`}
            onClick={() => patchClimate({ split: !climate.split, sync: climate.split })}
          >
            Split
          </button>
        </div>
      </div>
    </>
  );
}
