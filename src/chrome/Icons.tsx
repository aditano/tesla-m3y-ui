import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function I(props: IconProps & { children: ReactNode }) {
  const { children, ...rest } = props;
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...rest}>
      {children}
    </svg>
  );
}

export function IconLock(props: IconProps) {
  return (
    <I {...props}>
      <rect x="6" y="11" width="12" height="9" rx="2" fill="currentColor" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8.5 11V8.2a3.5 3.5 0 0 1 7 0V11" stroke="currentColor" strokeWidth="1.8" />
    </I>
  );
}

export function IconUnlock(props: IconProps) {
  return (
    <I {...props}>
      <rect x="6" y="11" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8.5 11V8.4a3.5 3.5 0 0 1 6.4-1.9" stroke="currentColor" strokeWidth="1.7" />
    </I>
  );
}

export function IconBluetooth(props: IconProps) {
  return (
    <I {...props}>
      <path
        d="M7 8.5 16 16l-4.5 3.5V4.5L16 8 7 15.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </I>
  );
}

export function IconWifi(props: IconProps) {
  return (
    <I {...props}>
      <path d="M5 10.5a10 10 0 0 1 14 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M8 13.5a6 6 0 0 1 8 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="12" cy="17.2" r="1.2" fill="currentColor" />
    </I>
  );
}

export function IconCell(props: IconProps) {
  return (
    <I {...props}>
      <path d="M6 16h2v3H6zM10 13h2v6h-2zM14 10h2v9h-2zM18 7h2v12h-2z" fill="currentColor" />
    </I>
  );
}

export function IconBattery(props: IconProps) {
  return (
    <I {...props}>
      <rect x="3" y="8" width="16" height="8" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
      <rect x="19.4" y="10.2" width="1.8" height="3.6" rx="0.5" fill="currentColor" />
      <rect x="5" y="10" width="11" height="4" rx="0.6" fill="currentColor" />
    </I>
  );
}

export function IconGear(props: IconProps) {
  return (
    <I {...props}>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M12 4.5v2M12 17.5v2M4.5 12h2M17.5 12h2M6.6 6.6l1.4 1.4M16 16l1.4 1.4M17.4 6.6 16 8M8 16l-1.4 1.4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </I>
  );
}

export function IconPerson(props: IconProps) {
  return (
    <I {...props}>
      <circle cx="12" cy="8" r="3.1" stroke="currentColor" strokeWidth="1.7" />
      <path d="M5.5 19.2c.8-3.3 3.3-5 6.5-5s5.7 1.7 6.5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </I>
  );
}

export function IconShield(props: IconProps) {
  return (
    <I {...props}>
      <path
        d="M12 3.5 19 6.5v5.2c0 4.2-3 7.2-7 8.8-4-1.6-7-4.6-7-8.8V6.5L12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </I>
  );
}

export function IconSentry(props: IconProps) {
  return (
    <I {...props}>
      <path d="m4 11 8-7 8 7" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M7 10.5V19h10v-8.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M10 19v-5h4v5" stroke="currentColor" strokeWidth="1.7" />
    </I>
  );
}

export function IconTrunk(props: IconProps) {
  return (
    <I {...props}>
      <path
        d="M5 14.5V11l2.2-3.2h9.6L19 11v3.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M4.5 14.5h15" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="7.5" cy="17.2" r="1.3" fill="currentColor" />
      <circle cx="16.5" cy="17.2" r="1.3" fill="currentColor" />
    </I>
  );
}

export function IconFrunk(props: IconProps) {
  return (
    <I {...props}>
      <path
        d="M4.8 14.2 7 9.5h10l2.2 4.7H4.8Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M7.2 9.5 8.4 6.8h7.2l1.2 2.7" stroke="currentColor" strokeWidth="1.7" />
    </I>
  );
}

export function IconChargePort(props: IconProps) {
  return (
    <I {...props}>
      <rect x="7" y="5" width="10" height="14" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 9v4M10.2 12.2 12 14.2l1.8-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </I>
  );
}

export function IconAutoShiftCar(props: IconProps) {
  return (
    <I {...props}>
      <path
        d="M8.7 4.1h6.6c.4 0 .8.2 1 .6l1.5 2.9c.2.4.3.8.3 1.2v7.4c0 .6-.3 1.1-.9 1.4l-.8 1.6c-.2.4-.6.6-1 .6H8.6c-.4 0-.8-.2-1-.6l-.8-1.6c-.6-.3-.9-.8-.9-1.4V8.8c0-.4.1-.8.3-1.2l1.5-2.9c.2-.4.6-.6 1-.6Z"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.14"
      />
      <path d="M8.2 9.2h7.6" stroke="currentColor" strokeWidth="1.2" />
      <path d="M8.7 12.6h6.6" stroke="currentColor" strokeWidth="1.05" opacity="0.65" />
    </I>
  );
}

/** 2026.14 All Apps: a folder of live glyphs, not four identical squares. */
export function IconApps(props: IconProps) {
  return (
    <I {...props}>
      <rect x="3.1" y="4.4" width="17.8" height="15.4" rx="3.6" fill="currentColor" fillOpacity="0.14" />
      <rect x="3.1" y="4.4" width="17.8" height="15.4" rx="3.6" stroke="currentColor" strokeWidth="1.35" />
      <path d="M6.7 9.15 7.7 7.35h1.55L8.35 9.15 9.45 12.05H5.55L6.7 9.15Z" fill="#4dabf7" />
      <rect x="13.15" y="6.85" width="4.15" height="3.15" rx="0.7" fill="#ffd43b" />
      <circle cx="8.15" cy="15.35" r="1.85" fill="#ff6b6b" />
      <path d="M14.55 13.15h2.15l-1.25 2.55h1.45L13.9 18.7l.55-2.15h-1.35l1.45-3.4Z" fill="#69db7c" />
    </I>
  );
}

export function IconCamera(props: IconProps) {
  return (
    <I {...props}>
      <rect x="3.5" y="7" width="17" height="12" rx="2.2" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="13" r="3.2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M9 7 10.2 4.8h3.6L15 7" stroke="currentColor" strokeWidth="1.7" />
    </I>
  );
}

export function IconCalendar(props: IconProps) {
  return (
    <I {...props}>
      <rect x="4" y="6" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 4v4M16 4v4M4 11h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </I>
  );
}

export function IconBolt(props: IconProps) {
  return (
    <I {...props}>
      <path d="M13 3 6 13h6l-1 8 7-11h-6l1-7Z" fill="currentColor" />
    </I>
  );
}

export function IconMusic(props: IconProps) {
  return (
    <I {...props}>
      <path d="M9 18V6l10-2v12" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="7" cy="18" r="2.4" fill="currentColor" />
      <circle cx="17" cy="16" r="2.4" fill="currentColor" />
    </I>
  );
}

export function IconPhone(props: IconProps) {
  return (
    <I {...props}>
      <rect x="7" y="3" width="10" height="18" rx="2.2" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="17.6" r="0.9" fill="currentColor" />
    </I>
  );
}

export function IconVolume(props: IconProps) {
  return (
    <I {...props}>
      <path d="M4 10h3.2L12 6v12l-4.8-4H4v-4Z" fill="currentColor" />
      <path d="M15.2 9.2a4 4 0 0 1 0 5.6M17.6 7a7 7 0 0 1 0 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </I>
  );
}

export function IconSeat(props: IconProps) {
  return (
    <I {...props}>
      <path d="M8 18V9.5a3 3 0 0 1 6 0V13" stroke="currentColor" strokeWidth="1.7" />
      <path d="M6.5 18h11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M15.5 13h2.2v5" stroke="currentColor" strokeWidth="1.7" />
    </I>
  );
}

export function IconFan(props: IconProps) {
  return (
    <I {...props}>
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <path d="M12 5c2 2 2 5 0 7 2 0 5-1 7-3-3-1-6 0-7 3 0-2 1-5 3-7-1 3 0 6 3 7-2 0-5 1-7 3 0-2-1-5-3-7 3 1 6 0 7-3Z" stroke="currentColor" strokeWidth="1.4" />
    </I>
  );
}

export function IconSearch(props: IconProps) {
  return (
    <I {...props}>
      <circle cx="11" cy="11" r="6.2" stroke="currentColor" strokeWidth="1.7" />
      <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </I>
  );
}

export function IconClose(props: IconProps) {
  return (
    <I {...props}>
      <path d="m7 7 10 10M17 7 7 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </I>
  );
}

export function IconPlay(props: IconProps) {
  return (
    <I {...props}>
      <path d="M8 6.5v11L18 12 8 6.5Z" fill="currentColor" />
    </I>
  );
}

export function IconPause(props: IconProps) {
  return (
    <I {...props}>
      <rect x="7" y="6" width="3.4" height="12" rx="1" fill="currentColor" />
      <rect x="13.6" y="6" width="3.4" height="12" rx="1" fill="currentColor" />
    </I>
  );
}

export function IconSkip(props: IconProps) {
  return (
    <I {...props}>
      <path d="M6 7v10l8-5-8-5Z" fill="currentColor" />
      <rect x="15.5" y="7" width="2.2" height="10" rx="0.6" fill="currentColor" />
    </I>
  );
}

export function IconHome(props: IconProps) {
  return (
    <I {...props}>
      <path d="m4 12 8-8 8 8" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M7 11v8h10v-8" stroke="currentColor" strokeWidth="1.7" />
    </I>
  );
}

export function IconWork(props: IconProps) {
  return (
    <I {...props}>
      <rect x="3.5" y="8" width="17" height="11" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 8V6.5A1.5 1.5 0 0 1 9.5 5h5A1.5 1.5 0 0 1 16 6.5V8" stroke="currentColor" strokeWidth="1.7" />
    </I>
  );
}

export function IconStar(props: IconProps) {
  return (
    <I {...props}>
      <path d="m12 4 2.3 5.4 5.7.6-4.3 3.8 1.3 5.6L12 16.5 6.9 19.4l1.4-5.6L4 10l5.7-.6L12 4Z" fill="currentColor" />
    </I>
  );
}

export function IconCompass(props: IconProps) {
  return (
    <I {...props}>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
      <path d="m12 6 2.3 8.4L12 13l-2.3 1.4L12 6Z" fill="currentColor" />
    </I>
  );
}

export function IconChevron(props: IconProps) {
  return (
    <I {...props}>
      <path d="m8 6 8 6-8 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </I>
  );
}

export function IconTurnLeft(props: IconProps) {
  return (
    <I {...props}>
      <path d="M16 20V10H8" stroke="currentColor" strokeWidth="1.8" />
      <path d="M11 6.5 7.5 10 11 13.5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </I>
  );
}

export function IconTurnRight(props: IconProps) {
  return (
    <I {...props}>
      <path d="M8 20V10h8" stroke="currentColor" strokeWidth="1.8" />
      <path d="M13 6.5 16.5 10 13 13.5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </I>
  );
}

export function IconStraight(props: IconProps) {
  return (
    <I {...props}>
      <path d="M12 20V6" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 10.5 12 6l4 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </I>
  );
}

export function IconArrive(props: IconProps) {
  return (
    <I {...props}>
      <path d="M12 21s6-5.4 6-10.2A6 6 0 0 0 6 10.8C6 15.6 12 21 12 21Z" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="10.5" r="1.8" fill="currentColor" />
    </I>
  );
}

export function IconHeadlight(props: IconProps) {
  return (
    <I {...props}>
      <path d="M5 8h7.5a5 5 0 0 1 0 8H5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M16.5 8.5 21 6.5M16.5 12H21M16.5 15.5 21 17.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </I>
  );
}

export function IconWiper(props: IconProps) {
  return (
    <I {...props}>
      <path d="M4 17c3-8 13-8 16 0" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 17 8 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </I>
  );
}

export function IconGlovebox(props: IconProps) {
  return (
    <I {...props}>
      <rect x="4" y="8" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 12h8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </I>
  );
}

export function IconSteering(props: IconProps) {
  return (
    <I {...props}>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <path d="M12 4.2v4.4M5.2 15.2 8.4 13M18.8 15.2 15.6 13" stroke="currentColor" strokeWidth="1.6" />
    </I>
  );
}

export function IconCar(props: IconProps) {
  return (
    <I {...props}>
      <path
        d="M7 15.5 8.2 9.8A2.4 2.4 0 0 1 10.5 8h3a2.4 2.4 0 0 1 2.3 1.8L17 15.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M5.5 15.5h13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="8.2" cy="16.6" r="1.35" fill="currentColor" />
      <circle cx="15.8" cy="16.6" r="1.35" fill="currentColor" />
    </I>
  );
}

export function IconDefrostFront(props: IconProps) {
  return (
    <I {...props}>
      <path d="M5 17c2.4-6 11.6-6 14 0" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 8.5v4M12 7v6M16 8.5v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </I>
  );
}

export function IconDefrostRear(props: IconProps) {
  return (
    <I {...props}>
      <path d="M6 7h12v10H6z" stroke="currentColor" strokeWidth="1.7" />
      <path d="M9 10v4M12 10v4M15 10v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </I>
  );
}

export function IconRecirc(props: IconProps) {
  return (
    <I {...props}>
      <path d="M7 9a5 5 0 0 1 8.5-1.5L17 9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M17 15a5 5 0 0 1-8.5 1.5L7 15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="m15 6 2 3-3 .2M9 18l-2-3 3-.2" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </I>
  );
}

export function IconSkipBack(props: IconProps) {
  return (
    <I {...props}>
      <path d="M18 7v10l-8-5 8-5Z" fill="currentColor" />
      <rect x="6.3" y="7" width="2.2" height="10" rx="0.6" fill="currentColor" />
    </I>
  );
}

export function IconShuffle(props: IconProps) {
  return (
    <I {...props}>
      <path d="M4 7h3.2L14 17h6M4 17h3.2L10 13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="m17 5 3 2-3 2M17 15l3 2-3 2" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </I>
  );
}

export function IconRepeat(props: IconProps) {
  return (
    <I {...props}>
      <path d="M7 8h9a3 3 0 0 1 3 3v1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M17 16H8a3 3 0 0 1-3-3v-1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="m14 5 3 3-3 3M10 19l-3-3 3-3" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </I>
  );
}

export function IconMic(props: IconProps) {
  return (
    <I {...props}>
      <rect x="9" y="4" width="6" height="10" rx="3" stroke="currentColor" strokeWidth="1.7" />
      <path d="M7 12a5 5 0 0 0 10 0M12 17v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </I>
  );
}

export function IconBell(props: IconProps) {
  return (
    <I {...props}>
      <path d="M6.5 16h11l-1.2-2.1V11a4.3 4.3 0 0 0-8.6 0v2.9L6.5 16Z" stroke="currentColor" strokeWidth="1.7" />
      <path d="M10 16.2a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.7" />
    </I>
  );
}

export function IconCharge(props: IconProps) {
  return (
    <I {...props}>
      <path d="M8 4h8v3.2H8z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 7.2h6V19a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2V7.2Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="m12 11-1.4 3h2.6L12 17" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </I>
  );
}

export function IconChevronLeft(props: IconProps) {
  return (
    <I {...props}>
      <path d="m15 6-8 6 8 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </I>
  );
}

export function IconAirbag(props: IconProps) {
  return (
    <I {...props}>
      <circle cx="12" cy="12" r="7.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 14.5c1.2-2 6.8-2 8 0" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="9.5" cy="10" r="1" fill="currentColor" />
      <circle cx="14.5" cy="10" r="1" fill="currentColor" />
    </I>
  );
}

export function IconLocate(props: IconProps) {
  return (
    <I {...props}>
      <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 4.5v2.4M12 17.1v2.4M4.5 12h2.4M17.1 12h2.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </I>
  );
}

export function IconToggles(props: IconProps) {
  return (
    <I {...props}>
      <rect x="4" y="6" width="16" height="5" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="15" cy="8.5" r="1.6" fill="currentColor" />
      <rect x="4" y="13.5" width="16" height="5" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="9" cy="16" r="1.6" fill="currentColor" />
    </I>
  );
}

export function IconSun(props: IconProps) {
  return (
    <I {...props}>
      <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M12 4.2v1.8M12 18v1.8M4.2 12h1.8M18 12h1.8M6.4 6.4l1.3 1.3M16.3 16.3l1.3 1.3M17.6 6.4l-1.3 1.3M7.7 16.3l-1.3 1.3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </I>
  );
}

export function IconChildLock(props: IconProps) {
  return (
    <I {...props}>
      <circle cx="12" cy="7.5" r="2.4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 19v-4.2a4 4 0 0 1 8 0V19" stroke="currentColor" strokeWidth="1.6" />
      <rect x="9.2" y="13.2" width="5.6" height="4.4" rx="1" stroke="currentColor" strokeWidth="1.4" />
    </I>
  );
}

export function IconWindowLock(props: IconProps) {
  return (
    <I {...props}>
      <rect x="4.5" y="5" width="15" height="14" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4.5 10h15" stroke="currentColor" strokeWidth="1.5" />
      <rect x="9.5" y="12.2" width="5" height="4.4" rx="0.8" stroke="currentColor" strokeWidth="1.4" />
    </I>
  );
}

export function IconMirror(props: IconProps) {
  return (
    <I {...props}>
      <path d="M5 16.5c1.4-5 4.2-8.5 7-8.5s5.6 3.5 7 8.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7.2 16.5h9.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </I>
  );
}

export function IconCarWash(props: IconProps) {
  return (
    <I {...props}>
      <path d="M7 16 8.2 10.5A2.2 2.2 0 0 1 10.3 9h3.4a2.2 2.2 0 0 1 2.1 1.5L17 16" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="8.4" cy="16.8" r="1.2" fill="currentColor" />
      <circle cx="15.6" cy="16.8" r="1.2" fill="currentColor" />
      <path d="M8 6.2c.6 1.2-.2 2 0 2M12 5c.7 1.4 0 2.2.2 2.4M16 6.2c.6 1.2-.2 2 0 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </I>
  );
}

export function IconWrench(props: IconProps) {
  return (
    <I {...props}>
      <path
        d="M14.8 6.2a3.4 3.4 0 0 0-4.6 4.6L5 16l3 3 5.2-5.2a3.4 3.4 0 0 0 4.6-4.6L16 11l-3-3 1.8-1.8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </I>
  );
}

export function IconDownload(props: IconProps) {
  return (
    <I {...props}>
      <path d="M12 5v10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="m8 11 4 4 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M5 18.5h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </I>
  );
}

export function IconInfo(props: IconProps) {
  return (
    <I {...props}>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 11v5M12 8.2v.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </I>
  );
}

export function IconTrip(props: IconProps) {
  return (
    <I {...props}>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 12 16 9.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="12" cy="12" r="1.3" fill="currentColor" />
    </I>
  );
}

export function IconNav(props: IconProps) {
  return (
    <I {...props}>
      <path d="m12 4 6 16-6-3.4L6 20 12 4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </I>
  );
}

export function IconEq(props: IconProps) {
  return (
    <I {...props}>
      <path d="M7 18V9M12 18V6M17 18v-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </I>
  );
}
