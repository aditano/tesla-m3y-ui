import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MAP_STYLE, ROUTE_BLUE } from "../geo/constants";
import { useVehicle } from "../state/store";
import { NavSearch } from "../chrome/NavSearch";
import { RouteCard } from "../chrome/RouteCard";
import { IconCompass } from "../chrome/Icons";

function carSvg(): string {
  return `<svg class="car-marker" viewBox="0 0 24 36" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2c3 0 6 3.2 6.4 8.2l.6 14.2c.2 3-1.8 5.6-5 5.6h-4c-3.2 0-5.2-2.6-5-5.6L5.6 10.2C6 5.2 9 2 12 2z" fill="#d9dee6" stroke="#111" stroke-width="1"/>
    <rect x="7.2" y="8" width="9.6" height="6" rx="1.4" fill="#1b1f28"/>
    <circle cx="8.2" cy="22" r="1.6" fill="#111"/>
    <circle cx="15.8" cy="22" r="1.6" fill="#111"/>
  </svg>`;
}

export function TeslaMap() {
  const host = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const origin = useVehicle((s) => s.origin);
  const route = useVehicle((s) => s.route);
  const dest = useVehicle((s) => s.destination);
  const orientation = useVehicle((s) => s.ui.mapOrientation);
  const patchUi = useVehicle((s) => s.patchUi);
  const setOriginFromMap = useVehicle((s) => s.setOriginFromMap);

  useEffect(() => {
    if (!host.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: host.current,
      style: MAP_STYLE,
      center: [origin.lng, origin.lat],
      zoom: 14.2,
      pitch: 0,
      attributionControl: {
        compact: true,
      },
    });
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");
    const el = document.createElement("div");
    el.innerHTML = carSvg();
    const marker = new maplibregl.Marker({ element: el.firstElementChild as HTMLElement, rotationAlignment: "map" })
      .setLngLat([origin.lng, origin.lat])
      .addTo(map);
    markerRef.current = marker;
    map.on("load", () => {
      map.addSource("route", {
        type: "geojson",
        data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [] } },
      });
      map.addLayer({
        id: "route-casing",
        type: "line",
        source: "route",
        paint: { "line-color": "#0b1b33", "line-width": 12, "line-opacity": 0.9 },
        layout: { "line-cap": "round", "line-join": "round" },
      });
      map.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        paint: { "line-color": ROUTE_BLUE, "line-width": 7, "line-opacity": 0.95 },
        layout: { "line-cap": "round", "line-join": "round" },
      });
    });
    map.on("dragstart", () => patchUi({ tracking: false }));
    map.on("click", (e) => {
      if (useVehicle.getState().phase !== "idle") return;
      void setOriginFromMap(e.lngLat.lng, e.lngLat.lat);
    });
    mapRef.current = map;
    return () => {
      marker.remove();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- map is created once
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const apply = () => {
      const src = map.getSource("route") as maplibregl.GeoJSONSource | undefined;
      if (!src) return;
      if (!route) {
        src.setData({ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [] } });
        return;
      }
      src.setData({
        type: "Feature",
        properties: {},
        geometry: route.geometry,
      });
      if (useVehicle.getState().phase !== "fsd") {
        const b = new maplibregl.LngLatBounds();
        route.coords.forEach((c) => b.extend(c));
        map.fitBounds(b, { padding: 72, duration: 800, maxZoom: 15.5 });
      }
    };
    if (map.isStyleLoaded()) apply();
    else map.once("load", apply);
  }, [route]);

  useEffect(() => {
    return useVehicle.subscribe((state) => {
      const map = mapRef.current;
      const marker = markerRef.current;
      if (!map || !marker) return;
      marker.setLngLat([state.pose.lng, state.pose.lat]);
      marker.setRotation(state.pose.heading);
      if (!state.ui.tracking) return;
      const headingUp = state.ui.mapOrientation === "heading";
      map.easeTo({
        center: [state.pose.lng, state.pose.lat],
        bearing: headingUp ? state.pose.heading : 0,
        pitch: state.phase === "fsd" ? 48 : 0,
        zoom: state.phase === "fsd" ? 16.4 : map.getZoom(),
        duration: 280,
        essential: true,
      });
    });
  }, []);

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div ref={host} style={{ position: "absolute", inset: 0 }} />
      <RouteCard />
      <NavSearch />
      <div className="map-tools">
        <button
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
        <button title="Recenter" onClick={() => patchUi({ tracking: true })}>
          ⌖
        </button>
      </div>
      {dest ? null : (
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
