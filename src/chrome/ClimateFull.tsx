import { useState } from "react";
import { useVehicle } from "../state/store";
import type { Airflow, KeepMode, SeatHeat } from "../state/types";
import { useDialogA11y } from "./dialogA11y";
import {
  IconChevron,
  IconChevronLeft,
  IconClose,
  IconDefrostFront,
  IconDefrostRear,
  IconFan,
  IconRecirc,
  IconSeat,
  IconSteering,
  IconWiper,
} from "./Icons";

const KEEP_MODES: { id: KeepMode; label: string }[] = [
  { id: "off", label: "Off" },
  { id: "keep", label: "Keep" },
  { id: "dog", label: "Dog" },
  { id: "camp", label: "Camp" },
];

const AIRFLOW: { id: keyof Airflow; label: string; path: string }[] = [
  { id: "screen", label: "Windshield airflow", path: "M3 6h9M6 6 4 16m6-10 2 10" },
  { id: "face", label: "Face airflow", path: "M3 11h9M3 11l3-3m-3 3 3 3" },
  { id: "feet", label: "Foot airflow", path: "M3 17h9M3 17l3-3m-3 3 3 3" },
];

export const FAN_MAX = 10;

function PowerGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path d="M12 4v7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M7.5 7a7 7 0 1 0 9 0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function AirGlyph({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 20 22" width="20" height="22" aria-hidden="true">
      <circle cx="15" cy="5" r="2.2" fill="currentColor" />
      <path d={path} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ClockGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7.5V12l3 2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function SeatButton({ seat, label }: { seat: keyof SeatHeat; label: string }) {
  const level = useVehicle((s) => s.climate.seats[seat]);
  const cycleSeat = useVehicle((s) => s.cycleSeat);
  return (
    <button type="button" className={`clim-foot-btn seat ${level ? "on" : ""}`} title={label} onClick={() => cycleSeat(seat)}>
      <IconSeat width={24} height={24} />
      <span className="seat-pips" data-level={level}>
        <i />
        <i />
        <i />
      </span>
    </button>
  );
}

/** Fan readout for the footer: Off, Auto, 1–9, or HI at the top step. */
export function fanLabel(on: boolean, auto: boolean, fan: number): string {
  if (!on) return "Off";
  if (auto) return "Auto";
  return fan >= FAN_MAX ? "HI" : String(fan);
}

/** Main climate screen from manual p.158. Opens from the dock temperature. */
export function ClimateFull() {
  const open = useVehicle((s) => s.ui.climateOpen && s.ui.climateFull);
  const climate = useVehicle((s) => s.climate);
  const steeringHeat = useVehicle((s) => s.flags.steeringHeat);
  const patchClimate = useVehicle((s) => s.patchClimate);
  const patchFlags = useVehicle((s) => s.patchFlags);
  const patchUi = useVehicle((s) => s.patchUi);
  const [zone, setZone] = useState<"front" | "rear">("front");
  const close = () => patchUi({ climateOpen: false, climateFull: false });
  const dialogRef = useDialogA11y<HTMLDivElement>(open, close);

  if (!open) return null;

  const plume = climate.on ? 0.35 + (climate.fan / FAN_MAX) * 0.65 : 0;
  const setFan = (fan: number) => patchClimate({ fan: Math.max(1, Math.min(FAN_MAX, fan)), on: true, auto: false });
  const toggleAir = (id: keyof Airflow) => {
    const next = { ...climate.airflow, [id]: !climate.airflow[id] };
    if (!next.face && !next.feet && !next.screen) return;
    patchClimate({ airflow: next, auto: false, on: true });
  };
  const lit = (v: boolean) => (v && climate.on ? "on" : "");

  return (
    <div ref={dialogRef} className={`climate-full ${climate.on ? "" : "off"}`} role="dialog" aria-modal="true" aria-label="Climate" tabIndex={-1}>
      <div className="clim-keep" role="group" aria-label="Climate keeper">
        {KEEP_MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            className={climate.keepMode === m.id ? "on" : ""}
            onClick={() => patchClimate({ keepMode: m.id, on: m.id === "off" ? climate.on : true })}
          >
            {m.label}
          </button>
        ))}
      </div>
      <button type="button" className="clim-close" title="Close climate" onClick={close}>
        <IconClose width={18} height={18} />
      </button>

      <div className="clim-top">
        <button
          type="button"
          className={`clim-top-btn power ${climate.on ? "on" : ""}`}
          title={climate.on ? "Turn climate off" : "Turn climate on"}
          onClick={() => patchClimate({ on: !climate.on })}
        >
          <PowerGlyph />
        </button>
        <button type="button" className={`clim-top-btn text ${lit(climate.auto)}`} onClick={() => patchClimate({ auto: !climate.auto, on: true })}>
          Auto
        </button>
        <button type="button" className={`clim-top-btn text ${lit(climate.ac)}`} onClick={() => patchClimate({ ac: !climate.ac, on: true })}>
          A/C
        </button>
        <div className="clim-air" role="group" aria-label="Airflow">
          {AIRFLOW.map((a) => (
            <button key={a.id} type="button" title={a.label} className={`clim-top-btn ${lit(climate.airflow[a.id])}`} onClick={() => toggleAir(a.id)}>
              <AirGlyph path={a.path} />
            </button>
          ))}
        </div>
        <div className="clim-zone" role="group" aria-label="Climate zone">
          <button type="button" className={zone === "front" ? "on" : ""} onClick={() => setZone("front")}>
            Front
          </button>
          <button
            type="button"
            className={zone === "rear" ? "on" : ""}
            onClick={() => {
              setZone("rear");
              patchClimate({ rearOn: true });
            }}
          >
            Rear
          </button>
        </div>
        <button type="button" className="clim-top-btn text schedule" title="Schedule">
          Schedule
          <ClockGlyph />
        </button>
      </div>

      <div className="clim-cabin" aria-hidden="true">
        <div className="clim-glass" />
        <div className="clim-dash" />
        <div className="clim-wheel" />
        <div className="clim-screen" />
        <div className="clim-vent-bar" />
        {zone === "front" ? (
          <>
            <i className="clim-plume driver" style={{ opacity: climate.airflow.face ? plume : 0 }} />
            <i className="clim-plume passenger" style={{ opacity: climate.airflow.face ? plume : 0 }} />
            <i className="clim-plume screen" style={{ opacity: climate.airflow.screen ? plume : 0 }} />
          </>
        ) : (
          <i className="clim-plume rear" style={{ opacity: climate.rearOn ? plume : 0 }} />
        )}
      </div>

      <div className="clim-foot">
        <SeatButton seat="fl" label="Driver seat heater" />
        <button type="button" className={`clim-foot-btn ${climate.wiperDefrost ? "on" : ""}`} title="Wiper defrost" onClick={() => patchClimate({ wiperDefrost: !climate.wiperDefrost })}>
          <IconWiper width={22} height={22} />
        </button>
        <button type="button" className={`clim-foot-btn ${steeringHeat ? "on" : ""}`} title="Steering wheel heater" onClick={() => patchFlags({ steeringHeat: !steeringHeat })}>
          <IconSteering width={22} height={22} />
        </button>
        <span className="clim-foot-gap" />
        <button type="button" className={`clim-foot-btn ${climate.defrostFront ? "on" : ""}`} title="Front defrost" onClick={() => patchClimate({ defrostFront: !climate.defrostFront, on: true })}>
          <IconDefrostFront width={22} height={22} />
        </button>
        <button
          type="button"
          className={`clim-foot-btn ${climate.defrostRear ? "on" : ""}`}
          title="Rear defrost"
          onClick={() => {
            patchClimate({ defrostRear: !climate.defrostRear });
            patchFlags({ mirrorHeat: !climate.defrostRear });
          }}
        >
          <IconDefrostRear width={22} height={22} />
        </button>
        <div className="clim-fan" role="group" aria-label="Fan speed">
          <button type="button" title="Slower fan" onClick={() => setFan(climate.fan - 1)}>
            <IconChevronLeft width={18} height={18} />
          </button>
          <IconFan width={20} height={20} />
          <span className="clim-fan-level">{fanLabel(climate.on, climate.auto, climate.fan)}</span>
          <button type="button" title="Faster fan" onClick={() => setFan(climate.fan + 1)}>
            <IconChevron width={18} height={18} />
          </button>
        </div>
        <button type="button" className={`clim-foot-btn ${climate.recirc ? "on" : ""}`} title="Recirculate" onClick={() => patchClimate({ recirc: !climate.recirc })}>
          <IconRecirc width={22} height={22} />
        </button>
        <span className="clim-foot-gap" />
        <SeatButton seat="fr" label="Passenger seat heater" />
      </div>
    </div>
  );
}
