import { useVehicle } from "../state/store";
import type { RepeatMode, VehicleFlags } from "../state/types";

export type QuickFlag = "mirrorsFolded" | "childLock" | "windowLock" | "carWash" | "steeringHeat" | "gloveboxOpen" | "autoHighBeam" | "autoBrightness";

/** Dock temperature opens the full climate screen. */
export function openFullClimate(): void {
  useVehicle.getState().patchUi({
    climateOpen: true,
    climateFull: true,
    mediaOpen: false,
    appsOpen: false,
    cameraOpen: false,
    tempPopup: null,
    controlsOpen: false,
  });
}

/** Dock fan opens (or closes) the compact climate popup. */
export function openCompactClimate(): void {
  const ui = useVehicle.getState().ui;
  const compact = ui.climateOpen && !ui.climateFull;
  useVehicle.getState().patchUi({
    climateOpen: !compact,
    climateFull: false,
    mediaOpen: false,
    appsOpen: false,
    tempPopup: null,
  });
}

/** Car button toggles Controls over the map, Quick Controls first. */
export function toggleControls(): void {
  const ui = useVehicle.getState().ui;
  useVehicle.getState().patchUi({
    controlsOpen: !ui.controlsOpen,
    controlsTab: "quick",
    appsOpen: false,
    cameraOpen: false,
    climateOpen: false,
    mediaOpen: false,
    tempPopup: null,
  });
}

/** App launcher toggles the tray. A second call, or a tile, dismisses it. */
export function toggleAppLauncher(): void {
  const ui = useVehicle.getState().ui;
  useVehicle.getState().patchUi({
    appsOpen: !ui.appsOpen,
    cameraOpen: false,
    climateOpen: false,
    mediaOpen: false,
    tempPopup: null,
  });
}

export function dismissAppLauncher(): void {
  useVehicle.getState().patchUi({ appsOpen: false });
}

export function togglePlayback(): void {
  const media = useVehicle.getState().media;
  useVehicle.getState().patchMedia({ playing: !media.playing });
}

export function toggleShuffle(): void {
  const media = useVehicle.getState().media;
  useVehicle.getState().patchMedia({ shuffle: !media.shuffle });
}

export function cycleRepeat(): void {
  const media = useVehicle.getState().media;
  const repeat: RepeatMode = media.repeat === "off" ? "all" : media.repeat === "all" ? "one" : "off";
  useVehicle.getState().patchMedia({ repeat });
}

export function scrubMedia(progress: number): void {
  useVehicle.getState().patchMedia({ progress: Math.min(1, Math.max(0, progress)) });
}

/** Map a pointer's clientX onto the scrubber and store that playback position. */
export function scrubFromClientX(clientX: number, left: number, width: number): void {
  if (!(width > 0)) return;
  scrubMedia((clientX - left) / width);
}

export function toggleQuickControl(key: QuickFlag): void {
  const flags: VehicleFlags = useVehicle.getState().flags;
  useVehicle.getState().patchFlags({ [key]: !flags[key] });
}
