/** Public parked status-bar order. Cellular stays in Controls, not on this bar. */
export const PARKED_STATUS_ORDER = [
  "lock",
  "profile",
  "sentry",
  "wifi",
  "clock",
  "outdoor",
  "airbag",
] as const;

export type StatusItemId = (typeof PARKED_STATUS_ORDER)[number];

export function parkedStatusOrder(): readonly StatusItemId[] {
  return PARKED_STATUS_ORDER;
}

const LEFT = new Set<StatusItemId>(["lock", "profile", "sentry", "wifi"]);
const CENTER = new Set<StatusItemId>(["clock", "outdoor"]);

export function statusLeftIds(): StatusItemId[] {
  return parkedStatusOrder().filter((id) => LEFT.has(id));
}

export function statusCenterIds(): StatusItemId[] {
  return parkedStatusOrder().filter((id) => CENTER.has(id));
}

export function statusRightIds(): StatusItemId[] {
  return parkedStatusOrder().filter((id) => id === "airbag");
}
