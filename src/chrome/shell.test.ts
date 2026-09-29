import { beforeEach, describe, expect, it } from "vitest";
import { CONTROLS_RAIL } from "./settingsCatalog";
import {
  cycleRepeat,
  dismissAppLauncher,
  openCompactClimate,
  openFullClimate,
  scrubMedia,
  toggleAppLauncher,
  toggleControls,
  togglePlayback,
  toggleQuickControl,
  toggleShuffle,
} from "./shellActions";
import { parkedStatusOrder } from "./statusItems";
import { selectGear } from "./gearSelection";
import { MEDIA_LIBRARY, resetVehicle, useVehicle } from "../state/store";
import { isParkedFullscreen, isRearView, showsNavigationMap } from "../viz/layout";

describe("parked shell from the initial store", () => {
  beforeEach(() => {
    resetVehicle();
  });

  it("starts parked with the map up, closures shut, and the public status order", () => {
    const state = useVehicle.getState();
    expect(state.gear).toBe("P");
    expect(state.phase).toBe("idle");
    expect(state.route).toBeNull();
    expect(state.destination).toBeNull();
    expect(isParkedFullscreen(state.gear, state.phase)).toBe(true);
    expect(showsNavigationMap(state.gear)).toBe(true);
    expect(isRearView(state.gear)).toBe(false);
    expect(state.flags.frunkOpen).toBe(false);
    expect(state.flags.trunkOpen).toBe(false);
    expect(state.flags.chargePortOpen).toBe(false);
    expect(state.ui.controlsOpen).toBe(false);
    expect(state.ui.appsOpen).toBe(false);
    expect(state.ui.climateOpen).toBe(false);
    expect(parkedStatusOrder()).toEqual(["lock", "profile", "sentry", "wifi", "clock", "outdoor", "airbag"]);
    expect(parkedStatusOrder()).not.toContain("cellular");
  });

  it("opens trunk, frunk, and charge port from the closed parked state", () => {
    useVehicle.getState().toggleClosure("trunk");
    useVehicle.getState().toggleClosure("frunk");
    useVehicle.getState().toggleClosure("charge");
    const flags = useVehicle.getState().flags;
    expect(flags.trunkOpen).toBe(true);
    expect(flags.frunkOpen).toBe(true);
    expect(flags.chargePortOpen).toBe(true);
    useVehicle.getState().toggleClosure("trunk");
    expect(useVehicle.getState().flags.trunkOpen).toBe(false);
  });

  it("does not start self-driving from Drive, and Reverse hides the map until Park", () => {
    selectGear("D");
    expect(useVehicle.getState().gear).toBe("D");
    expect(useVehicle.getState().phase).toBe("idle");
    expect(showsNavigationMap("D")).toBe(true);

    selectGear("R");
    const reverse = useVehicle.getState();
    expect(reverse.gear).toBe("R");
    expect(reverse.phase).toBe("idle");
    expect(isRearView(reverse.gear)).toBe(true);
    expect(showsNavigationMap(reverse.gear)).toBe(false);
    expect(isParkedFullscreen(reverse.gear, reverse.phase)).toBe(false);

    selectGear("P");
    const parked = useVehicle.getState();
    expect(parked.gear).toBe("P");
    expect(isParkedFullscreen(parked.gear, parked.phase)).toBe(true);
    expect(showsNavigationMap(parked.gear)).toBe(true);
    expect(isRearView(parked.gear)).toBe(false);
  });

  it("opens Controls, climate, media transport, and the app tray from closed", () => {
    expect(useVehicle.getState().ui.controlsOpen).toBe(false);
    toggleControls();
    expect(useVehicle.getState().ui.controlsOpen).toBe(true);
    expect(useVehicle.getState().ui.controlsTab).toBe("quick");
    expect(CONTROLS_RAIL.map((tab) => tab.label)).toEqual([
      "Controls",
      "Dynamics",
      "Charging",
      "Autopilot",
      "Locks",
      "Lights",
      "Display",
      "Trips",
      "Navigation",
      "Safety",
      "Service",
      "Software",
      "Wi-Fi",
    ]);
    expect(useVehicle.getState().flags.childLock).toBe(false);
    toggleQuickControl("childLock");
    expect(useVehicle.getState().flags.childLock).toBe(true);

    openFullClimate();
    expect(useVehicle.getState().ui.climateOpen).toBe(true);
    expect(useVehicle.getState().ui.climateFull).toBe(true);
    expect(useVehicle.getState().ui.controlsOpen).toBe(false);
    useVehicle.getState().patchClimate({ keepMode: "dog", auto: true, on: true });
    useVehicle.getState().cycleSeat("fl");
    expect(useVehicle.getState().climate.keepMode).toBe("dog");
    expect(useVehicle.getState().climate.seats.fl).toBeGreaterThan(0);

    openCompactClimate();
    expect(useVehicle.getState().ui.climateOpen).toBe(true);
    expect(useVehicle.getState().ui.climateFull).toBe(false);

    const before = useVehicle.getState().media;
    expect(before.playing).toBe(true);
    togglePlayback();
    expect(useVehicle.getState().media.playing).toBe(false);
    toggleShuffle();
    expect(useVehicle.getState().media.shuffle).toBe(true);
    cycleRepeat();
    expect(useVehicle.getState().media.repeat).toBe("all");
    scrubMedia(0.62);
    expect(useVehicle.getState().media.progress).toBeCloseTo(0.62);
    useVehicle.getState().skipTrack(1);
    expect(useVehicle.getState().media.track).toBe(MEDIA_LIBRARY[1].track);
    expect(useVehicle.getState().media.playing).toBe(true);

    expect(useVehicle.getState().ui.appsOpen).toBe(false);
    toggleAppLauncher();
    expect(useVehicle.getState().ui.appsOpen).toBe(true);
    dismissAppLauncher();
    expect(useVehicle.getState().ui.appsOpen).toBe(false);
  });
});
