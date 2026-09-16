import { useVehicle } from "../state/store";
import { isParkedFullscreen } from "../viz/layout";
import {
  IconApps,
  IconBolt,
  IconCalendar,
  IconCamera,
  IconFan,
  IconMusic,
  IconPause,
  IconPlay,
  IconSeat,
  IconSkip,
  IconVolume,
} from "./Icons";

export function BottomDock() {
  const climate = useVehicle((s) => s.climate);
  const media = useVehicle((s) => s.media);
  const ui = useVehicle((s) => s.ui);
  const parked = useVehicle((s) => isParkedFullscreen(s.gear, s.phase));
  const patchClimate = useVehicle((s) => s.patchClimate);
  const patchMedia = useVehicle((s) => s.patchMedia);
  const patchUi = useVehicle((s) => s.patchUi);

  const tempClass = climate.driverTempF >= 72 ? "heat" : "cool";

  return (
    <footer className="bottom-dock">
      <div className="my-apps">
        <button
          className={`app-btn ${ui.appsOpen ? "on" : ""}`}
          title="App launcher"
          onClick={() => patchUi({ appsOpen: !ui.appsOpen, climateOpen: false, mediaOpen: false })}
        >
          <IconApps />
        </button>
        <button className="app-btn" title="Camera" onClick={() => patchUi({ appsOpen: true })}>
          <IconCamera />
        </button>
        <button className="app-btn" title="Calendar" onClick={() => patchUi({ appsOpen: true })}>
          <IconCalendar />
        </button>
        <button className="app-btn" title="Energy" onClick={() => patchUi({ appsOpen: true })}>
          <IconBolt />
        </button>
      </div>

      <div className="climate-cluster">
        <button
          className={`seat-btn ${climate.seats.fl ? "on" : ""}`}
          title="Driver seat heater"
          onClick={() =>
            patchClimate({ seats: { ...climate.seats, fl: climate.seats.fl ? 0 : 3 } })
          }
        >
          <IconSeat />
        </button>
        <button
          className={`temp-btn ${tempClass}`}
          title="Climate"
          onClick={() =>
            patchUi({ climateOpen: !ui.climateOpen, mediaOpen: false, appsOpen: false })
          }
        >
          {climate.on ? climate.driverTempF : "Off"}
        </button>
        <button
          className="app-btn"
          title="Fan"
          onClick={() => patchUi({ climateOpen: true })}
        >
          <IconFan />
        </button>
        <button
          className={`temp-btn ${climate.split && climate.passengerTempF >= 72 ? "heat" : "cool"}`}
          onClick={() => patchClimate({ split: true, passengerTempF: climate.passengerTempF })}
        >
          {climate.split ? climate.passengerTempF : climate.driverTempF}
        </button>
        <button
          className={`seat-btn ${climate.seats.fr ? "on" : ""}`}
          title="Passenger seat heater"
          onClick={() =>
            patchClimate({ seats: { ...climate.seats, fr: climate.seats.fr ? 0 : 3 } })
          }
        >
          <IconSeat />
        </button>
      </div>

      {parked ? null : (
        <button
          className="media-card"
          onClick={() => patchUi({ mediaOpen: !ui.mediaOpen, climateOpen: false, appsOpen: false })}
        >
          <div className="media-art" />
          <div className="media-meta">
            <strong>{media.track}</strong>
            <span>
              {media.artist} · {media.source}
            </span>
          </div>
          <div className="media-controls">
            <span
              role="presentation"
              onClick={(e) => {
                e.stopPropagation();
                patchMedia({ playing: !media.playing });
              }}
            >
              {media.playing ? <IconPause /> : <IconPlay />}
            </span>
            <span role="presentation">
              <IconSkip />
            </span>
          </div>
        </button>
      )}

      <div className="volume-wrap">
        <IconVolume />
        <input
          type="range"
          min={0}
          max={100}
          value={media.muted ? 0 : media.volume}
          onChange={(e) => patchMedia({ volume: Number(e.target.value), muted: false })}
        />
        <IconMusic />
      </div>
    </footer>
  );
}
