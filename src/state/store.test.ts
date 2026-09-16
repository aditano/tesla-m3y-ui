import { beforeEach, describe, expect, it } from "vitest";
import { applyQaScene } from "../qa/applyScene";
import { buildIndex, interpolate } from "../geo/polyline";
import { useVehicle } from "./store";
import type { RoutePlan } from "./types";

const line: RoutePlan = {
  coords: [
    [-79.9959, 40.4406],
    [-79.9959, 40.4506],
  ],
  distanceM: 1113,
  durationS: 120,
  maneuvers: [],
  geometry: {
    type: "LineString",
    coordinates: [
      [-79.9959, 40.4406],
      [-79.9959, 40.4506],
    ],
  },
};

describe("shared ego pose", () => {
  beforeEach(() => {
    useVehicle.setState({
      phase: "idle",
      gear: "P",
      destination: null,
      route: null,
      qa: { frozen: false, clock: null, scene: null },
      pose: {
        lng: -79.9959,
        lat: 40.4406,
        heading: 12,
        speedMph: 0,
        setSpeedMph: 0,
        speedLimitMph: 25,
        traveledM: 0,
        remainingM: 0,
      },
    });
  });

  it("tickDrive writes the same pose the map marker and viz read", () => {
    useVehicle.setState({
      phase: "fsd",
      gear: "D",
      route: line,
      pose: {
        ...useVehicle.getState().pose,
        speedMph: 30,
        setSpeedMph: 30,
        remainingM: line.distanceM,
      },
    });
    useVehicle.getState().tickDrive(1);
    const pose = useVehicle.getState().pose;
    expect(pose.lat).toBeGreaterThan(40.4406);
    expect(pose.heading).toBeCloseTo(0, 0);
    expect(pose.traveledM).toBeGreaterThan(10);
    expect(useVehicle.getState().pose).toBe(pose);
  });

  it("cancelNav drops the route and zeros motion so viz can return to parked", () => {
    useVehicle.setState({
      phase: "fsd",
      gear: "D",
      route: line,
      destination: { name: "Work", label: "CMU", lng: -79.94, lat: 40.44 },
      pose: { ...useVehicle.getState().pose, speedMph: 28, traveledM: 80, remainingM: 200 },
    });
    useVehicle.getState().cancelNav();
    const s = useVehicle.getState();
    expect(s.phase).toBe("idle");
    expect(s.route).toBeNull();
    expect(s.gear).toBe("P");
    expect(s.pose.speedMph).toBe(0);
    expect(s.pose.traveledM).toBe(0);
    expect(s.ui.mapOrientation).toBe("north");
  });

  it("frozen QA FSD pose stays on the polyline when the drive loop ticks", () => {
    applyQaScene("fsd-engaged");
    const before = useVehicle.getState().pose;
    const index = buildIndex(useVehicle.getState().route!.coords);
    const sample = interpolate(index, before.traveledM);
    expect(before.lng).toBeCloseTo(sample.position[0], 7);
    expect(before.lat).toBeCloseTo(sample.position[1], 7);
    expect(before.heading).toBeCloseTo(sample.heading, 5);
    useVehicle.getState().tickDrive(1);
    const after = useVehicle.getState().pose;
    expect(after.lng).toBe(before.lng);
    expect(after.lat).toBe(before.lat);
    expect(after.heading).toBe(before.heading);
    expect(after.traveledM).toBe(before.traveledM);
  });

  it("disengageFsd stops the car but keeps the route for a still-aligned viz", () => {
    useVehicle.setState({
      phase: "fsd",
      gear: "D",
      route: line,
      pose: { ...useVehicle.getState().pose, speedMph: 32, setSpeedMph: 32, traveledM: 40 },
    });
    useVehicle.getState().disengageFsd();
    const s = useVehicle.getState();
    expect(s.phase).toBe("disengaged");
    expect(s.route).toEqual(line);
    expect(s.pose.speedMph).toBe(0);
    expect(s.gear).toBe("D");
  });
});
