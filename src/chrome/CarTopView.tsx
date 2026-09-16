import type { DoorState, SeatHeat } from "../state/types";

interface CarTopViewProps {
  mode: "controls" | "climate";
  frunkOpen?: boolean;
  trunkOpen?: boolean;
  chargePortOpen?: boolean;
  doors?: DoorState;
  seats?: SeatHeat;
  steeringHeat?: boolean;
  onFrunk?: () => void;
  onTrunk?: () => void;
  onCharge?: () => void;
  onDoor?: (door: keyof DoorState) => void;
  onSeat?: (seat: keyof SeatHeat) => void;
  onSteering?: () => void;
}

export function CarTopView({
  mode,
  frunkOpen,
  trunkOpen,
  chargePortOpen,
  doors,
  seats,
  steeringHeat,
  onFrunk,
  onTrunk,
  onCharge,
  onDoor,
  onSeat,
  onSteering,
}: CarTopViewProps) {
  return (
    <svg className={`car-top ${mode}`} viewBox="0 0 220 420" role="img" aria-label="Vehicle from above">
      <defs>
        <linearGradient id="glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6a7c92" />
          <stop offset="100%" stopColor="#2a3340" />
        </linearGradient>
        <linearGradient id="body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#d8dde4" />
          <stop offset="100%" stopColor="#9aa3ae" />
        </linearGradient>
      </defs>
      <ellipse cx="110" cy="408" rx="58" ry="8" fill="#000" opacity="0.35" />
      <path
        d="M58 86c0-28 22-52 52-52s52 24 52 52v248c0 28-22 48-52 48s-52-20-52-48V86Z"
        fill="url(#body)"
        stroke="#1a1c20"
        strokeWidth="2"
      />
      <rect x="48" y="118" width="10" height="52" rx="4" fill="#2b2e33" />
      <rect x="162" y="118" width="10" height="52" rx="4" fill="#2b2e33" />
      <rect x="48" y="248" width="10" height="52" rx="4" fill="#2b2e33" />
      <rect x="162" y="248" width="10" height="52" rx="4" fill="#2b2e33" />

      <path
        className={`hotspot ${frunkOpen ? "open" : ""}`}
        d="M72 78c4-22 16-36 38-36s34 14 38 36v28H72V78Z"
        fill="#c5ccd4"
        onClick={onFrunk}
      />
      <text x="110" y="92" textAnchor="middle" className="car-label" opacity={mode === "controls" ? 1 : 0}>
        Frunk
      </text>

      <path d="M74 128h72l8 42v78l-8 36H74l-8-36V170l8-42Z" fill="url(#glass)" opacity="0.92" />
      <rect x="96" y="148" width="28" height="18" rx="6" fill="#1c222b" onClick={onSteering} className="hotspot" />
      {steeringHeat ? <circle cx="110" cy="157" r="4" fill="#ff922b" /> : null}

      {mode === "climate" ? (
        <>
          <rect
            x="78"
            y="172"
            width="28"
            height="32"
            rx="6"
            className={`seat-pad ${seats && seats.fl ? "on" : ""}`}
            onClick={() => onSeat?.("fl")}
          />
          <rect
            x="114"
            y="172"
            width="28"
            height="32"
            rx="6"
            className={`seat-pad ${seats && seats.fr ? "on" : ""}`}
            onClick={() => onSeat?.("fr")}
          />
          <rect
            x="78"
            y="248"
            width="28"
            height="32"
            rx="6"
            className={`seat-pad ${seats && seats.rl ? "on" : ""}`}
            onClick={() => onSeat?.("rl")}
          />
          <rect
            x="114"
            y="248"
            width="28"
            height="32"
            rx="6"
            className={`seat-pad ${seats && seats.rr ? "on" : ""}`}
            onClick={() => onSeat?.("rr")}
          />
        </>
      ) : (
        <>
          <path
            className={`door ${doors?.fl ? "ajar" : ""}`}
            d="M60 140h16v70H60z"
            onClick={() => onDoor?.("fl")}
          />
          <path
            className={`door ${doors?.fr ? "ajar" : ""}`}
            d="M144 140h16v70h-16z"
            onClick={() => onDoor?.("fr")}
          />
          <path
            className={`door ${doors?.rl ? "ajar" : ""}`}
            d="M60 230h16v70H60z"
            onClick={() => onDoor?.("rl")}
          />
          <path
            className={`door ${doors?.rr ? "ajar" : ""}`}
            d="M144 230h16v70h-16z"
            onClick={() => onDoor?.("rr")}
          />
        </>
      )}

      <path
        className={`hotspot ${trunkOpen ? "open" : ""}`}
        d="M74 338h72v36c-8 12-20 18-36 18s-28-6-36-18v-36Z"
        fill="#c5ccd4"
        onClick={onTrunk}
      />
      <text x="110" y="360" textAnchor="middle" className="car-label" opacity={mode === "controls" ? 1 : 0}>
        Trunk
      </text>

      <circle
        cx="168"
        cy="300"
        r="9"
        className={`charge-port ${chargePortOpen ? "open" : ""}`}
        onClick={onCharge}
      />
    </svg>
  );
}
