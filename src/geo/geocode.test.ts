import { afterEach, describe, expect, it, vi } from "vitest";
import { GEOCODE_TIMEOUT_MS, reverseGeocode, searchPlaces } from "./geocode";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("geocode timeouts", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uses a bounded default timeout", () => {
    expect(GEOCODE_TIMEOUT_MS).toBeGreaterThan(0);
    expect(GEOCODE_TIMEOUT_MS).toBeLessThanOrEqual(10_000);
  });

  it("falls back to Photon when Nominatim fails", async () => {
    const calls: string[] = [];
    vi.stubGlobal("fetch", (url: string) => {
      const href = String(url);
      calls.push(href);
      if (href.includes("nominatim")) return Promise.resolve(new Response("no", { status: 503 }));
      return Promise.resolve(
        jsonResponse({
          features: [
            {
              geometry: { coordinates: [-79.9, 40.4] },
              properties: { name: "Photon Place", city: "Pittsburgh", state: "PA" },
            },
          ],
        }),
      );
    });
    const hits = await searchPlaces("photon-fallback-unique");
    expect(hits[0]?.name).toBe("Photon Place");
    expect(calls.some((href) => href.includes("photon"))).toBe(true);
  });

  it("rejects when both geocoders fail", async () => {
    vi.stubGlobal("fetch", () => Promise.resolve(new Response("no", { status: 502 })));
    await expect(searchPlaces("both-geocoders-fail")).rejects.toThrow(/Photon 502/);
  });

  it("aborts a hung search when the timeout elapses", async () => {
    vi.stubGlobal("fetch", (_url: string, init?: RequestInit) => {
      return new Promise((_resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("hung")), 30_000);
        init?.signal?.addEventListener("abort", () => {
          clearTimeout(timer);
          reject(new DOMException("The operation was aborted", "AbortError"));
        });
      });
    });
    await expect(searchPlaces("timeout-both-geocoders", { timeoutMs: 20 })).rejects.toThrow(/abort/i);
  });

  it("does not call Photon after the caller aborts", async () => {
    const calls: string[] = [];
    const controller = new AbortController();
    vi.stubGlobal("fetch", (url: string, init?: RequestInit) => {
      calls.push(String(url));
      return new Promise((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => {
          reject(new DOMException("The operation was aborted", "AbortError"));
        });
      });
    });
    const pending = searchPlaces("caller-abort-unique", { signal: controller.signal, timeoutMs: 5_000 });
    controller.abort();
    await expect(pending).rejects.toThrow(/abort/i);
    expect(calls).toHaveLength(1);
    expect(calls[0]).toContain("nominatim");
  });

  it("returns a dropped pin when reverse geocoding times out", async () => {
    vi.stubGlobal("fetch", (_url: string, init?: RequestInit) => {
      return new Promise((_resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("hung")), 30_000);
        init?.signal?.addEventListener("abort", () => {
          clearTimeout(timer);
          reject(new DOMException("The operation was aborted", "AbortError"));
        });
      });
    });
    const place = await reverseGeocode(-80.1234, 40.5678, { timeoutMs: 15 });
    expect(place.name).toBe("Dropped pin");
    expect(place.lng).toBe(-80.1234);
    expect(place.lat).toBe(40.5678);
    expect(place.label).toContain("40.56780");
  });
});
