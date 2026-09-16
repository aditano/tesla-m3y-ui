import type { ControlsTab } from "../state/types";

export interface SettingHit {
  id: string;
  label: string;
  tab: ControlsTab;
  keywords: string;
}

export const SETTINGS_CATALOG: SettingHit[] = [
  { id: "lights", label: "Exterior lights", tab: "lights", keywords: "headlights auto parking fog" },
  { id: "wipers", label: "Wipers", tab: "quick", keywords: "wiper washer rain" },
  { id: "child", label: "Child lock", tab: "locks", keywords: "child rear doors" },
  { id: "walkaway", label: "Walk-Away Door Lock", tab: "locks", keywords: "lock walk away phone" },
  { id: "unlockpark", label: "Unlock on Park", tab: "locks", keywords: "unlock park doors" },
  { id: "windows", label: "Window lock", tab: "locks", keywords: "window rear switches" },
  { id: "energy", label: "Energy display", tab: "display", keywords: "percent battery range" },
  { id: "distance", label: "Distance units", tab: "display", keywords: "miles kilometers units" },
  { id: "appearance", label: "Appearance", tab: "display", keywords: "dark light auto brightness" },
  { id: "regen", label: "Regenerative braking", tab: "dynamics", keywords: "regen braking pedals steering" },
  { id: "stopping", label: "Stopping Mode", tab: "dynamics", keywords: "hold roll creep" },
  { id: "steering", label: "Steering mode", tab: "dynamics", keywords: "comfort sport steering" },
  { id: "slip", label: "Slip Start", tab: "dynamics", keywords: "traction snow" },
  { id: "charge", label: "Charge limit", tab: "charging", keywords: "charge port scheduled limit" },
  { id: "fsd", label: "Full Self-Driving (simulated)", tab: "autopilot", keywords: "fsd autopilot autosteer" },
  { id: "follow", label: "Following distance", tab: "autopilot", keywords: "follow gap cruise" },
  { id: "routing", label: "Online routing", tab: "navigation", keywords: "nav route tolls ferries highways" },
  { id: "sentry", label: "Sentry Mode", tab: "safety", keywords: "sentry camera security" },
  { id: "joe", label: "Joe Mode", tab: "safety", keywords: "chimes quiet" },
  { id: "trips", label: "Trip meters", tab: "trips", keywords: "odometer trip a b" },
  { id: "wiperservice", label: "Wiper service mode", tab: "service", keywords: "wiper service" },
  { id: "jack", label: "Jack mode", tab: "service", keywords: "jack air suspension" },
  { id: "name", label: "Name your vehicle", tab: "software", keywords: "name software version" },
  { id: "wifi", label: "Wi-Fi", tab: "wifi", keywords: "wifi wireless network bluetooth" },
];

export function searchSettings(query: string): SettingHit[] {
  const q = query.trim().toLowerCase();
  if (q.length < 1) return [];
  return SETTINGS_CATALOG.filter((s) => `${s.label} ${s.keywords} ${s.tab}`.toLowerCase().includes(q));
}
