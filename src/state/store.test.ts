import { beforeEach, describe, expect, it, vi } from "vitest";
import { applyQaScene } from "../qa/applyScene";
import { buildIndex, interpolate } from "../geo/polyline";
import { fetchRoute } from "../geo/osrm";
import { useVehicle } from "./store";
import type { Place, RoutePlan } from "./types";

vi.mock("../geo/osrm", async () => {
  const actual = await vi.importActual<typeof import("../geo/osrm")>("../geo/osrm");
  return {
    ...actual,
    fetchRoute: vi.fn(actual.fetchRoute),
  };
});

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

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const destA: Place = { name: "A", label: "Place A", lng: -79.94, lat: 40.45 };
const destB: Place = { name: "B", label: "Place B", lng: -79.9, lat: 40.46 };

function routeWith(distanceM: number): RoutePlan {
  return { ...line, distanceM };
}

describe("shared ego pose", () => {
  beforeEach(() => {
    vi.mocked(fetchRoute).mockReset();
    useVehicle.setState({
      phase: "idle",
      gear: "P",
      destination: null,
      route: null,
      routeBusy: false,
      routeError: null,
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

  it("ignores a stale routing response when a newer request is in flight", async () => {
    const first = deferred<RoutePlan>();
    const second = deferred<RoutePlan>();
    vi.mocked(fetchRoute).mockImplementationOnce(() => first.promise).mockImplementationOnce(() => second.promise);
    const pendingA = useVehicle.getState().navigateTo(destA);
    const pendingB = useVehicle.getState().navigateTo(destB);
    first.resolve(routeWith(111));
    await pendingA;
    expect(useVehicle.getState().destination?.name).toBe("B");
    expect(useVehicle.getState().route).toBeNull();
    expect(useVehicle.getState().routeBusy).toBe(true);
    expect(useVehicle.getState().routeError).toBeNull();
    second.resolve(routeWith(222));
    await pendingB;
    expect(useVehicle.getState().route?.distanceM).toBe(222);
    expect(useVehicle.getState().destination?.name).toBe("B");
    expect(useVehicle.getState().phase).toBe("routed");
    expect(useVehicle.getState().routeBusy).toBe(false);
  });

  it("does not apply a stale routing failure over a newer request", async () => {
    const first = deferred<RoutePlan>();
    const second = deferred<RoutePlan>();
    vi.mocked(fetchRoute).mockImplementationOnce(() => first.promise).mockImplementationOnce(() => second.promise);
    const pendingA = useVehicle.getState().navigateTo(destA);
    const pendingB = useVehicle.getState().navigateTo(destB);
    first.reject(new Error("older router failed"));
    await pendingA;
    expect(useVehicle.getState().routeError).toBeNull();
    expect(useVehicle.getState().destination?.name).toBe("B");
    second.resolve(routeWith(333));
    await pendingB;
    expect(useVehicle.getState().route?.distanceM).toBe(333);
    expect(useVehicle.getState().routeError).toBeNull();
  });

  it("cancel invalidates an in-flight route", async () => {
    const pendingRoute = deferred<RoutePlan>();
    vi.mocked(fetchRoute).mockImplementation((_from, _to, signal) => {
      signal?.addEventListener("abort", () => {
        pendingRoute.reject(new DOMException("aborted", "AbortError"));
      });
      return pendingRoute.promise;
    });
    const pending = useVehicle.getState().navigateTo(destA);
    expect(useVehicle.getState().routeBusy).toBe(true);
    useVehicle.getState().cancelNav();
    await pending;
    const state = useVehicle.getState();
    expect(state.route).toBeNull();
    expect(state.destination).toBeNull();
    expect(state.phase).toBe("idle");
    expect(state.routeBusy).toBe(false);
    expect(state.routeError).toBeNull();
    expect(state.gear).toBe("P");
  });

  it("changing origin drops the old polyline and rebuilds from the new start", async () => {
    const rebuilt = deferred<RoutePlan>();
    vi.mocked(fetchRoute).mockImplementation(() => rebuilt.promise);
    useVehicle.setState({
      phase: "fsd",
      gear: "D",
      route: line,
      destination: destA,
      pose: {
        ...useVehicle.getState().pose,
        lng: -79.99,
        lat: 40.448,
        speedMph: 36,
        setSpeedMph: 36,
        traveledM: 400,
        remainingM: 700,
      },
    });
    const nextOrigin: Place = { name: "New start", label: "New start", lng: -80.2, lat: 40.5 };
    useVehicle.getState().setOrigin(nextOrigin);
    const mid = useVehicle.getState();
    expect(mid.route).toBeNull();
    expect(mid.phase).not.toBe("fsd");
    expect(mid.pose.lng).toBe(nextOrigin.lng);
    expect(mid.pose.lat).toBe(nextOrigin.lat);
    expect(mid.pose.speedMph).toBe(0);
    expect(mid.pose.traveledM).toBe(0);
    useVehicle.getState().tickDrive(1);
    expect(useVehicle.getState().pose.lng).toBe(nextOrigin.lng);
    expect(useVehicle.getState().pose.lat).toBe(nextOrigin.lat);
    expect(vi.mocked(fetchRoute)).toHaveBeenCalledWith(
      expect.objectContaining({ lng: nextOrigin.lng, lat: nextOrigin.lat }),
      expect.objectContaining({ name: destA.name }),
      expect.any(AbortSignal),
    );
    rebuilt.resolve(routeWith(880));
    await vi.waitFor(() => {
      expect(useVehicle.getState().phase).toBe("routed");
    });
    expect(useVehicle.getState().route?.distanceM).toBe(880);
    expect(useVehicle.getState().pose.lng).toBe(nextOrigin.lng);
    expect(useVehicle.getState().pose.traveledM).toBe(0);
    expect(useVehicle.getState().phase).not.toBe("fsd");
  });

  it("keeps the route when only the origin name changes", () => {
    useVehicle.setState({ phase: "routed", route: line, destination: destA });
    const origin = useVehicle.getState().origin;
    useVehicle.getState().setOrigin({ ...origin, name: "Renamed" });
    expect(useVehicle.getState().route).toEqual(line);
    expect(useVehicle.getState().origin.name).toBe("Renamed");
    expect(vi.mocked(fetchRoute)).not.toHaveBeenCalled();
  });

  it("reverse and neutral leave FSD and do not keep accelerating", () => {
    useVehicle.setState({
      phase: "fsd",
      gear: "D",
      route: line,
      pose: {
        ...useVehicle.getState().pose,
        speedMph: 30,
        setSpeedMph: 30,
        traveledM: 40,
        remainingM: 1000,
      },
    });
    useVehicle.getState().setGear("R");
    expect(useVehicle.getState().phase).toBe("disengaged");
    expect(useVehicle.getState().gear).toBe("R");
    expect(useVehicle.getState().pose.speedMph).toBe(0);
    const stayed = useVehicle.getState().pose;
    useVehicle.getState().tickDrive(1);
    expect(useVehicle.getState().pose.traveledM).toBe(stayed.traveledM);
    expect(useVehicle.getState().pose.lng).toBe(stayed.lng);
    expect(useVehicle.getState().pose.lat).toBe(stayed.lat);

    useVehicle.setState({
      phase: "fsd",
      gear: "D",
      route: line,
      pose: { ...useVehicle.getState().pose, speedMph: 22, setSpeedMph: 22, traveledM: 40 },
    });
    useVehicle.getState().setGear("N");
    expect(useVehicle.getState().phase).toBe("disengaged");
    expect(useVehicle.getState().gear).toBe("N");
    expect(useVehicle.getState().pose.speedMph).toBe(0);
    const neutral = useVehicle.getState().pose.traveledM;
    useVehicle.getState().tickDrive(1);
    expect(useVehicle.getState().pose.traveledM).toBe(neutral);
  });

  it("does not accelerate when FSD is active without Drive", () => {
    useVehicle.setState({
      phase: "fsd",
      gear: "N",
      route: line,
      pose: { ...useVehicle.getState().pose, speedMph: 12, setSpeedMph: 30, traveledM: 15 },
    });
    useVehicle.getState().tickDrive(1);
    expect(useVehicle.getState().pose.speedMph).toBe(12);
    expect(useVehicle.getState().pose.traveledM).toBe(15);
  });

  it("startFsd engages Drive before the loop can move the car", () => {
    useVehicle.setState({
      phase: "routed",
      gear: "R",
      route: line,
      pose: { ...useVehicle.getState().pose, speedMph: 0, setSpeedMph: 0, traveledM: 0, remainingM: line.distanceM },
    });
    useVehicle.getState().startFsd();
    expect(useVehicle.getState().phase).toBe("fsd");
    expect(useVehicle.getState().gear).toBe("D");
    useVehicle.getState().tickDrive(1);
    expect(useVehicle.getState().pose.traveledM).toBeGreaterThan(0);
    expect(useVehicle.getState().pose.lat).toBeGreaterThan(40.4406);
  });
});
