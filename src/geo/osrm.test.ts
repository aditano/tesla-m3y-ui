import { afterEach, describe, expect, it, vi } from "vitest";
import { OSRM_ENDPOINTS } from "./constants";
import { buildOsrmRouteUrl, fetchRoute } from "./osrm";
import type { Place } from "../state/types";

const from: Place = { name: "A", label: "A", lng: -79.9959, lat: 40.4406 };
const to: Place = { name: "B", label: "B", lng: -79.9436, lat: 40.4433 };

const osrmOk = {
  code: "Ok",
  routes: [
    {
      distance: 1200,
      duration: 180,
      geometry: {
        type: "LineString",
        coordinates: [
          [from.lng, from.lat],
          [to.lng, to.lat],
        ],
      },
      legs: [
        {
          steps: [
            {
              distance: 1200,
              duration: 180,
              name: "Forbes",
              maneuver: { type: "depart", location: [from.lng, from.lat] },
            },
          ],
        },
      ],
    },
  ],
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("OSRM route URLs", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("keeps the routed-car prefix on the fallback and the bare path on the primary", () => {
    const coords = `${from.lng},${from.lat};${to.lng},${to.lat}`;
    const primary = new URL(buildOsrmRouteUrl(OSRM_ENDPOINTS[0], from, to));
    const fallback = new URL(buildOsrmRouteUrl(OSRM_ENDPOINTS[1], from, to));
    expect(primary.origin).toBe(new URL(OSRM_ENDPOINTS[0]).origin);
    expect(primary.pathname).toBe(`/route/v1/driving/${coords}`);
    expect(fallback.origin).toBe(new URL(OSRM_ENDPOINTS[1]).origin);
    expect(fallback.pathname).toBe(`/routed-car/route/v1/driving/${coords}`);
    expect(primary.searchParams.get("steps")).toBe("true");
    expect(fallback.searchParams.get("overview")).toBe("full");
    expect(fallback.searchParams.get("geometries")).toBe("geojson");
  });

  it("requests the primary endpoint, then the prefixed fallback", async () => {
    const calls: string[] = [];
    vi.stubGlobal("fetch", (url: string) => {
      calls.push(String(url));
      if (calls.length === 1) return Promise.resolve(new Response("down", { status: 503 }));
      return Promise.resolve(jsonResponse(osrmOk));
    });
    const route = await fetchRoute(from, to);
    expect(route.distanceM).toBe(1200);
    expect(calls).toHaveLength(2);
    expect(calls[0]).toContain("https://router.project-osrm.org/route/v1/driving/");
    expect(calls[0]).not.toContain("/routed-car/");
    expect(calls[1]).toContain("https://routing.openstreetmap.de/routed-car/route/v1/driving/");
  });

  it("does not try the fallback after the request is aborted", async () => {
    const calls: string[] = [];
    const controller = new AbortController();
    vi.stubGlobal("fetch", (url: string, init?: RequestInit) => {
      calls.push(String(url));
      return new Promise((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => {
          reject(new DOMException("aborted", "AbortError"));
        });
      });
    });
    const pending = fetchRoute(from, to, controller.signal);
    controller.abort();
    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
    expect(calls).toHaveLength(1);
    expect(calls[0]).toContain("/route/v1/driving/");
    expect(calls[0]).not.toContain("/routed-car/");
  });
});
