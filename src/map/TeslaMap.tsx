import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MAP_STYLE, MAP_STYLE_PARKED } from "../geo/constants";
import { indexFor, splitAtMeters } from "../geo/polyline";
import { useVehicle } from "../state/store";
import { NavSearch } from "../chrome/NavSearch";
import { RouteCard } from "../chrome/RouteCard";
import { IconCompass, IconLocate } from "../chrome/Icons";
import type { RoutePlan } from "../state/types";

function carSvg(): string {
  return `<svg class="car-marker" viewBox="0 0 24 36" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2c3 0 6 3.2 6.4 8.2l.6 14.2c.2 3-1.8 5.6-5 5.6h-4c-3.2 0-5.2-2.6-5-5.6L5.6 10.2C6 5.2 9 2 12 2z" fill="#d9dee6" stroke="#111" stroke-width="1"/>
    <rect x="7.2" y="8" width="9.6" height="6" rx="1.4" fill="#1b1f28"/>
    <circle cx="8.2" cy="22" r="1.6" fill="#111"/>
    <circle cx="15.8" cy="22" r="1.6" fill="#111"/>
  </svg>`;
}

const EMPTY = {
  type: "Feature" as const,
  properties: {},
  geometry: { type: "LineString" as const, coordinates: [] as [number, number][] },
};

function emptyPoint() {
  return {
    type: "Feature" as const,
    properties: {},
    geometry: { type: "Point" as const, coordinates: [0, 0] as [number, number] },
  };
}

function ensureLayers(map: maplibregl.Map): void {
  if (!map.getSource("route")) {
    map.addSource("route", { type: "geojson", data: EMPTY });
    map.addLayer({
      id: "route-glow",
      type: "line",
      source: "route",
      paint: { "line-color": "#7eb6ff", "line-width": 16, "line-opacity": 0.28, "line-blur": 1.2 },
      layout: { "line-cap": "round", "line-join": "round" },
    });
    map.addLayer({
      id: "route-casing",
      type: "line",
      source: "route",
      paint: { "line-color": "#08203d", "line-width": 14, "line-opacity": 0.95 },
      layout: { "line-cap": "round", "line-join": "round" },
    });
    map.addLayer({
      id: "route-line",
      type: "line",
      source: "route",
      paint: { "line-color": "#5aa7ff", "line-width": 8, "line-opacity": 1 },
      layout: { "line-cap": "round", "line-join": "round" },
    });
  }
  if (!map.getSource("route-traveled")) {
    map.addSource("route-traveled", { type: "geojson", data: EMPTY });
    map.addLayer(
      {
        id: "route-traveled",
        type: "line",
        source: "route-traveled",
        paint: { "line-color": "#9aa3ad", "line-width": 7, "line-opacity": 0.95 },
        layout: { "line-cap": "round", "line-join": "round" },
      },
      map.getLayer("route-glow") ? "route-glow" : undefined,
    );
  }
  if (!map.getSource("dest")) {
    map.addSource("dest", { type: "geojson", data: emptyPoint() });
    map.addLayer({
      id: "dest-halo",
      type: "circle",
      source: "dest",
      paint: { "circle-radius": 14, "circle-color": "#3e6ae1", "circle-opacity": 0.25 },
    });
    map.addLayer({
      id: "dest-dot",
      type: "circle",
      source: "dest",
      paint: { "circle-radius": 6, "circle-color": "#6ea8ff", "circle-stroke-width": 2, "circle-stroke-color": "#fff" },
    });
  }
}

type CamState = {
  phase: string;
  pose: { lng: number; lat: number; heading: number };
  ui: { tracking: boolean; mapOrientation: "north" | "heading" };
  qa: { frozen: boolean };
};

function trackingView(state: CamState, zoom: number) {
  const headingUp = state.ui.mapOrientation === "heading";
  const fsd = state.phase === "fsd";
  return {
    center: [state.pose.lng, state.pose.lat] as [number, number],
    bearing: headingUp ? state.pose.heading : 0,
    pitch: fsd ? 42 : 0,
    zoom: fsd ? 16.2 : zoom,
  };
}

function lineData(coordinates: [number, number][]) {
  return {
    type: "Feature" as const,
    properties: {},
    geometry: { type: "LineString" as const, coordinates },
  };
}

function updateRouteLines(map: maplibregl.Map, route: RoutePlan | null, traveledM: number): void {
  ensureLayers(map);
  const src = map.getSource("route") as maplibregl.GeoJSONSource | undefined;
  const traveledSrc = map.getSource("route-traveled") as maplibregl.GeoJSONSource | undefined;
  if (!src || !traveledSrc) return;
  if (!route) {
    src.setData(EMPTY);
    traveledSrc.setData(EMPTY);
    return;
  }
  const parts = splitAtMeters(indexFor(route.coords), traveledM);
  src.setData(lineData(parts.remaining.length > 1 ? parts.remaining : []));
  traveledSrc.setData(lineData(parts.traveled.length > 1 ? parts.traveled : []));
}

function paintRoute(map: maplibregl.Map, route: RoutePlan | null, destLng?: number, destLat?: number): void {
  ensureLayers(map);
  const destSrc = map.getSource("dest") as maplibregl.GeoJSONSource;
  updateRouteLines(map, route, useVehicle.getState().pose.traveledM);
  if (!route) {
    destSrc.setData(emptyPoint());
    return;
  }
  if (destLng != null && destLat != null) {
    destSrc.setData({
      type: "Feature",
      properties: {},
      geometry: { type: "Point", coordinates: [destLng, destLat] },
    });
  }
  if (useVehicle.getState().phase === "fsd") return;
  const b = new maplibregl.LngLatBounds();
  route.coords.forEach((c) => b.extend(c));
  const duration = useVehicle.getState().qa.frozen ? 0 : 900;
  map.fitBounds(b, { padding: { top: 56, left: 80, right: 48, bottom: 88 }, duration, maxZoom: 14.8 });
}

export function TeslaMap({ compact = false, bare = false }: { compact?: boolean; bare?: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const lastCam = useRef(0);
  const route = useVehicle((s) => s.route);
  const dest = useVehicle((s) => s.destination);
  const origin = useVehicle((s) => s.origin);
  const orientation = useVehicle((s) => s.ui.mapOrientation);
  const patchUi = useVehicle((s) => s.patchUi);
  const setOriginFromMap = useVehicle((s) => s.setOriginFromMap);

  useEffect(() => {
    if (!host.current || mapRef.current) return;
    const start = useVehicle.getState();
    const boot = trackingView(start, 14.2);
    const map = new maplibregl.Map({
      container: host.current,
      style: compact ? MAP_STYLE_PARKED : MAP_STYLE,
      center: boot.center,
      zoom: boot.zoom,
      pitch: boot.pitch,
      maxPitch: 50,
      fadeDuration: 0,
      bearing: boot.bearing,
      attributionControl: { compact: true },
      canvasContextAttributes: {
        antialias: true,
        preserveDrawingBuffer: true,
        failIfMajorPerformanceCaveat: false,
      },
    });
    const el = document.createElement("div");
    el.innerHTML = carSvg();
    const marker = new maplibregl.Marker({ element: el.firstElementChild as HTMLElement, rotationAlignment: "map" })
      .setLngLat([start.pose.lng, start.pose.lat])
      .setRotation(start.pose.heading)
      .addTo(map);
    markerRef.current = marker;
    const onReady = () => {
      const s = useVehicle.getState();
      paintRoute(map, s.route, s.destination?.lng, s.destination?.lat);
      if (s.ui.tracking) {
        map.jumpTo(trackingView(s, map.getZoom()));
      }
    };
    map.on("load", onReady);
    map.once("idle", () => {
      window.dispatchEvent(new Event("tesla-qa-map-idle"));
    });
    map.on("dragstart", () => patchUi({ tracking: false }));
    map.on("click", (e) => {
      if (useVehicle.getState().phase !== "idle") return;
      void setOriginFromMap(e.lngLat.lng, e.lngLat.lat);
    });
    mapRef.current = map;
    const ro = new ResizeObserver(() => map.resize());
    ro.observe(host.current);
    return () => {
      ro.disconnect();
      marker.remove();
      map.remove();
      mapRef.current = null;
    };
  }, [compact, patchUi, setOriginFromMap]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const run = () => paintRoute(map, route, dest?.lng, dest?.lat);
    if (map.isStyleLoaded()) run();
    else map.once("load", run);
  }, [dest, route]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || useVehicle.getState().phase === "fsd") return;
    map.easeTo({ center: [origin.lng, origin.lat], duration: useVehicle.getState().qa.frozen ? 0 : 700 });
  }, [origin.lat, origin.lng]);

  useEffect(() => {
    return useVehicle.subscribe((state, prev) => {
      const map = mapRef.current;
      const marker = markerRef.current;
      if (!map || !marker) return;
      const poseMoved =
        !prev ||
        state.pose.lng !== prev.pose.lng ||
        state.pose.lat !== prev.pose.lat ||
        state.pose.heading !== prev.pose.heading ||
        state.ui.tracking !== prev.ui.tracking ||
        state.ui.mapOrientation !== prev.ui.mapOrientation ||
        state.phase !== prev.phase;
      const progressMoved =
        !prev || Math.abs(state.pose.traveledM - prev.pose.traveledM) > 6 || state.phase !== prev.phase;
      if (progressMoved && map.isStyleLoaded()) {
        updateRouteLines(map, state.route, state.pose.traveledM);
      }
      if (!poseMoved) return;
      marker.setLngLat([state.pose.lng, state.pose.lat]);
      marker.setRotation(state.pose.heading);
      if (!state.ui.tracking || !map.isStyleLoaded()) return;
      const view = trackingView(state, map.getZoom());
      if (state.phase === "fsd") {
        const now = performance.now();
        if (!state.qa.frozen && now - lastCam.current < 90) return;
        lastCam.current = now;
        map.jumpTo(view);
        return;
      }
      map.easeTo({ ...view, duration: state.qa.frozen ? 0 : 280, essential: true });
    });
  }, []);

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div ref={host} style={{ position: "absolute", inset: 0 }} />
      {compact || bare ? null : (
        <>
          <RouteCard />
          <NavSearch />
        </>
      )}
      {compact || bare ? null : (
        <div className="map-tools">
        <button
          type="button"
          className={orientation === "heading" ? "on" : ""}
          title="Heading / North up"
          onClick={() =>
            patchUi({
              mapOrientation: orientation === "north" ? "heading" : "north",
              tracking: true,
            })
          }
        >
          <IconCompass />
        </button>
        <button type="button" title="Recenter on car" onClick={() => patchUi({ tracking: true })}>
          <IconLocate />
        </button>
        <button
          type="button"
          title="Use my location"
          onClick={() => {
            if (!navigator.geolocation) return;
            navigator.geolocation.getCurrentPosition(
              (pos) =>
                useVehicle.getState().setOrigin({
                  name: "Current location",
                  label: "Current location",
                  lng: pos.coords.longitude,
                  lat: pos.coords.latitude,
                }),
              () => undefined,
              { maximumAge: 30_000, timeout: 6000 },
            );
          }}
        >
          ◎
        </button>
      </div>
      )}
      {dest || compact || bare ? null : (
        <div
          style={{
            position: "absolute",
            right: 16,
            top: 16,
            zIndex: 6,
            fontSize: 12,
            color: "#bbb",
            background: "rgba(0,0,0,.45)",
            padding: "6px 10px",
            borderRadius: 10,
          }}
        >
          Click map to set origin
        </div>
      )}
    </div>
  );
}
