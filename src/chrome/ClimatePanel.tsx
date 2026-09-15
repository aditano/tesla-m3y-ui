import { useVehicle } from "../state/store";

export function ClimatePanel() {
  const open = useVehicle((s) => s.ui.climateOpen);
  const climate = useVehicle((s) => s.climate);
  const patchClimate = useVehicle((s) => s.patchClimate);
  const patchUi = useVehicle((s) => s.patchUi);

  if (!open) return null;

  return (
    <div className="panel" role="dialog" aria-label="Climate">
      <h3>Climate</h3>
      <div className="climate-grid">
        <div>
          <button className="btn ghost" onClick={() => patchClimate({ driverTempF: climate.driverTempF - 1 })}>
            −
          </button>
          <div className="big-temp">{climate.on ? `${climate.driverTempF}°` : "Off"}</div>
          <button className="btn ghost" onClick={() => patchClimate({ driverTempF: climate.driverTempF + 1 })}>
            +
          </button>
        </div>
        <div className="tile-grid">
          <button className={`tile ${climate.on ? "on" : ""}`} onClick={() => patchClimate({ on: !climate.on })}>
            <strong>Power</strong>
            <span>{climate.on ? "On" : "Off"}</span>
          </button>
          <button className={`tile ${climate.auto ? "on" : ""}`} onClick={() => patchClimate({ auto: !climate.auto })}>
            <strong>Auto</strong>
            <span>Climate</span>
          </button>
          <button
            className={`tile ${climate.defrostFront ? "on" : ""}`}
            onClick={() => patchClimate({ defrostFront: !climate.defrostFront })}
          >
            <strong>Front defrost</strong>
            <span>Windshield</span>
          </button>
          <button
            className={`tile ${climate.defrostRear ? "on" : ""}`}
            onClick={() => patchClimate({ defrostRear: !climate.defrostRear })}
          >
            <strong>Rear defrost</strong>
            <span>Glass</span>
          </button>
        </div>
        <div>
          <button
            className="btn ghost"
            onClick={() => patchClimate({ passengerTempF: climate.passengerTempF - 1, split: true })}
          >
            −
          </button>
          <div className="big-temp">{climate.passengerTempF}°</div>
          <button
            className="btn ghost"
            onClick={() => patchClimate({ passengerTempF: climate.passengerTempF + 1, split: true })}
          >
            +
          </button>
        </div>
      </div>
      <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
        <button className="btn ghost" onClick={() => patchUi({ climateOpen: false })}>
          Close
        </button>
      </div>
    </div>
  );
}
