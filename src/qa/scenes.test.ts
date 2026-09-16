import { describe, expect, it } from "vitest";
import { buildIndex, haversineMeters, interpolate } from "../geo/polyline";
import {
  QA_SCENE_IDS,
  buildQaRoute,
  isQaSceneId,
  snapshotForScene,
  type QaSceneId,
} from "./scenes";

describe("QA scenes", () => {
  it("lists the seven required visual states", () => {
    expect([...QA_SCENE_IDS]).toEqual([
      "parked-home",
      "route-set",
      "fsd-engaged",
      "controls",
      "climate",
      "media",
      "viz-expanded",
    ]);
  });

  it("builds a canned Pittsburgh route without a network call", () => {
    const route = buildQaRoute();
    const index = buildIndex(route.coords);
    expect(route.coords.length).toBeGreaterThan(3);
    expect(index.totalMeters).toBeGreaterThan(2000);
    expect(index.totalMeters).toBeLessThan(12000);
    expect(route.maneuvers[0]?.type).toBe("depart");
    expect(route.maneuvers.at(-1)?.type).toBe("arrive");
  });

  it("freezes every scene and dismisses the disclaimer", () => {
    for (const id of QA_SCENE_IDS) {
      const snap = snapshotForScene(id);
      expect(snap.qa.frozen).toBe(true);
      expect(snap.qa.scene).toBe(id);
      expect(snap.ui.disclaimerDismissed).toBe(true);
      expect(snap.qa.clock).toBe("4:20 PM");
    }
  });

  it("opens the matching overlay for chrome scenes", () => {
    expect(snapshotForScene("controls").ui.controlsOpen).toBe(true);
    expect(snapshotForScene("climate").ui.climateOpen).toBe(true);
    expect(snapshotForScene("media").ui.mediaOpen).toBe(true);
    expect(snapshotForScene("parked-home").phase).toBe("idle");
    expect(snapshotForScene("route-set").phase).toBe("routed");
    expect(snapshotForScene("fsd-engaged").phase).toBe("fsd");
    expect(snapshotForScene("viz-expanded").ui.vizRatio).toBeGreaterThan(0.8);
  });

  it("type-guards scene ids", () => {
    expect(isQaSceneId("parked-home")).toBe(true);
    expect(isQaSceneId("not-a-scene")).toBe(false);
    const id: QaSceneId = "media";
    expect(id).toBe("media");
  });

  it("places frozen FSD ego on the canned MapLibre/OSRM polyline", () => {
    for (const id of ["fsd-engaged", "viz-expanded"] as const) {
      const snap = snapshotForScene(id);
      expect(snap.route).not.toBeNull();
      const index = buildIndex(snap.route!.coords);
      const expected = interpolate(index, index.totalMeters * 0.32);
      expect(snap.pose.traveledM).toBeCloseTo(expected.traveledM, 5);
      expect(snap.pose.remainingM).toBeCloseTo(expected.remainingM, 5);
      expect(snap.pose.lng).toBeCloseTo(expected.position[0], 7);
      expect(snap.pose.lat).toBeCloseTo(expected.position[1], 7);
      expect(snap.pose.heading).toBeCloseTo(expected.heading, 5);
      expect(
        haversineMeters([snap.pose.lng, snap.pose.lat], expected.position),
      ).toBeLessThan(0.05);
    }
  });
});
