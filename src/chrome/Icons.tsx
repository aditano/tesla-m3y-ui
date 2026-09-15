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
      <rect x="6" y="11" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8.5 11V8.2a3.5 3.5 0 0 1 7 0V11" stroke="currentColor" strokeWidth="1.7" />
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

export function IconApps(props: IconProps) {
  return (
    <I {...props}>
      <rect x="4" y="4" width="6.2" height="6.2" rx="1.4" fill="currentColor" />
      <rect x="13.8" y="4" width="6.2" height="6.2" rx="1.4" fill="currentColor" />
      <rect x="4" y="13.8" width="6.2" height="6.2" rx="1.4" fill="currentColor" />
      <rect x="13.8" y="13.8" width="6.2" height="6.2" rx="1.4" fill="currentColor" />
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
