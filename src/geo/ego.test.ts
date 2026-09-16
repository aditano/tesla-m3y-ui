import { describe, expect, it } from "vitest";
import {
  egoWorldShift,
  enuToEgo,
  interpolateInEgoFrame,
  lngLatToEgo,
  offsetAlongHeading,
  routeWindowInEgoFrame,
} from "./ego";
import { buildIndex, interpolate } from "./polyline";
import type { EgoPose } from "../state/types";

function poseAt(lng: number, lat: number, heading: number, traveledM = 0): EgoPose {
  return {
    lng,
    lat,
    heading,
    speedMph: 25,
    setSpeedMph: 25,
    speedLimitMph: 25,
    traveledM,
    remainingM: 400,
  };
}

describe("ego heading frame", () => {
  it("keeps north as +Z when heading is 0", () => {
    const p = enuToEgo(0, 10, 0);
    expect(p.x).toBeCloseTo(0, 6);
    expect(p.z).toBeCloseTo(10, 6);
  });

  it("maps east to +Z when heading is 90 (same clockwise heading MapLibre uses)", () => {
    const p = enuToEgo(10, 0, 90);
    expect(p.x).toBeCloseTo(0, 6);
    expect(p.z).toBeCloseTo(10, 6);
  });

  it("maps north to the left (−X) when heading east", () => {
    const p = enuToEgo(0, 10, 90);
    expect(p.x).toBeCloseTo(-10, 6);
    expect(p.z).toBeCloseTo(0, 6);
  });

  it("maps a point to the geographic right onto +X", () => {
    const p = enuToEgo(8, 0, 0);
    expect(p.x).toBeCloseTo(8, 6);
    expect(p.z).toBeCloseTo(0, 6);
  });

  it("puts a point 10m ahead of the ego at the origin of the viz", () => {
    const ego: [number, number] = [-79.9959, 40.4406];
    const ahead = offsetAlongHeading(ego, 12, 0, 10);
    const local = lngLatToEgo(ahead, ego, 12);
    expect(local.x).toBeCloseTo(0, 1);
    expect(local.z).toBeCloseTo(10, 1);
  });

  it("curves a north-then-east right turn to +X in the ego frame", () => {
    const coords: [number, number][] = [
      [-80, 40],
      [-80, 40.001],
      [-79.9988, 40.001],
    ];
    const index = buildIndex(coords);
    const cornerM = index.cumMeters[1];
    const approach = interpolate(index, Math.max(0, cornerM - 25));
    const pose = poseAt(approach.position[0], approach.position[1], approach.heading, approach.traveledM);
    const ahead = interpolateInEgoFrame(coords, cornerM + 35, pose);
    expect(ahead.x).toBeGreaterThan(8);
    expect(ahead.z).toBeGreaterThan(0);
  });

  it("ego group shift plus yaw matches lngLatToEgo for a point ahead", () => {
    const origin: [number, number] = [-79.9959, 40.4406];
    const pose = poseAt(origin[0], origin[1], 35, 0);
    const ahead = offsetAlongHeading(origin, 35, 0, 20);
    const local = lngLatToEgo(ahead, origin, 35);
    const t = egoWorldShift(pose, origin);
    expect(t.x).toBeCloseTo(0, 5);
    expect(t.z).toBeCloseTo(0, 5);
    expect(local.z).toBeCloseTo(20, 1);
    expect(Math.abs(local.x)).toBeLessThan(0.4);
  });

  it("keeps the car on the route ribbon (window passes near origin)", () => {
    const coords: [number, number][] = [
      [-79.9959, 40.4406],
      [-79.99, 40.442],
      [-79.98, 40.443],
    ];
    const index = buildIndex(coords);
    const mid = interpolate(index, index.totalMeters * 0.4);
    const pose = poseAt(mid.position[0], mid.position[1], mid.heading, mid.traveledM);
    const window = routeWindowInEgoFrame(coords, pose);
    const nearest = window.reduce(
      (best, p) => {
        const d = Math.hypot(p.x, p.z);
        return d < best.d ? { d, p } : best;
      },
      { d: Infinity, p: window[0] },
    );
    expect(nearest.d).toBeLessThan(1.5);
  });
});
