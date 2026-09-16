import { describe, expect, it } from "vitest";
import { searchSettings } from "./settingsCatalog";
import { MEDIA_LIBRARY, useVehicle } from "../state/store";

describe("settings catalog", () => {
  it("finds Controls sections from public IA labels", () => {
    expect(searchSettings("sentry")[0]?.tab).toBe("safety");
    expect(searchSettings("walk-away")[0]?.tab).toBe("locks");
    expect(searchSettings("following")[0]?.tab).toBe("autopilot");
    expect(searchSettings("charge")[0]?.tab).toBe("charging");
    expect(searchSettings("trip")[0]?.tab).toBe("trips");
    expect(searchSettings("zzzz").length).toBe(0);
  });
});

describe("vehicle chrome state", () => {
  it("toggles lock, sentry, and headlights", () => {
    const startLocked = useVehicle.getState().flags.locked;
    useVehicle.getState().patchFlags({ locked: !startLocked, sentry: true, headlights: "on" });
    const flags = useVehicle.getState().flags;
    expect(flags.locked).toBe(!startLocked);
    expect(flags.sentry).toBe(true);
    expect(flags.headlights).toBe("on");
  });

  it("nudges climate and cycles seat heat", () => {
    useVehicle.getState().patchClimate({ driverTempF: 70, sync: true, split: false });
    useVehicle.getState().nudgeTemp("driver", 2);
    expect(useVehicle.getState().climate.driverTempF).toBe(72);
    expect(useVehicle.getState().climate.passengerTempF).toBe(72);
    useVehicle.getState().cycleSeat("fl");
    expect(useVehicle.getState().climate.seats.fl).toBeGreaterThan(0);
  });

  it("skips media tracks in the library", () => {
    useVehicle.getState().patchMedia({ libraryIndex: 0, track: MEDIA_LIBRARY[0].track });
    useVehicle.getState().skipTrack(1);
    expect(useVehicle.getState().media.track).toBe(MEDIA_LIBRARY[1].track);
  });

  it("does not start FSD from Drive gear alone", () => {
    useVehicle.setState({ phase: "routed" });
    useVehicle.getState().setGear("D");
    expect(useVehicle.getState().phase).toBe("routed");
    expect(useVehicle.getState().gear).toBe("D");
  });
});
