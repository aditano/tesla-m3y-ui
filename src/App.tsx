import { lazy, Suspense, useEffect, useRef } from "react";
import { WORK_PLACE } from "./geo/constants";
import { indexFor, interpolate } from "./geo/polyline";
import { useVehicle } from "./state/store";
import { StatusBar } from "./chrome/StatusBar";
import { DriveStrip } from "./chrome/DriveStrip";
import { BottomDock } from "./chrome/BottomDock";
import { ControlsOverlay } from "./chrome/ControlsOverlay";
import { ClimatePanel } from "./chrome/ClimatePanel";
import { MediaPanel } from "./chrome/MediaPanel";
import { AppLauncher } from "./chrome/AppLauncher";
import { markQaReady } from "./qa/applyScene";
import { NavSearch } from "./chrome/NavSearch";
import { ParkedMedia } from "./chrome/ParkedMedia";
import { RouteCard } from "./chrome/RouteCard";
import { isParkedFullscreen, useMiniMap } from "./viz/layout";

const TeslaMap = lazy(() =>
  import("./map/TeslaMap").then((m) => ({ default: m.TeslaMap })),
);
const FsdCanvas = lazy(() =>
  import("./viz/FsdCanvas").then((m) => ({ default: m.FsdCanvas })),
);

function DriveLoop() {
  const tick = useVehicle((s) => s.tickDrive);
  useEffect(() => {
    let id = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      tick(dt);
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [tick]);
  return null;
}

function VizDivider() {
  const setVizRatio = useVehicle((s) => s.setVizRatio);
  const dragging = useRef(false);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (!dragging.current) return;
      const stage = document.querySelector(".stage");
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      setVizRatio((e.clientX - rect.left) / rect.width);
    };
    const up = () => {
      dragging.current = false;
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [setVizRatio]);

  return (
    <div
      className="viz-handle"
      onPointerDown={() => {
        dragging.current = true;
      }}
      title="Drag to expand visualization"
    >
      <span />
    </div>
  );
}

function Disclaimer() {
  const dismissed = useVehicle((s) => s.ui.disclaimerDismissed);
  const patchUi = useVehicle((s) => s.patchUi);
  if (dismissed) return null;
  return (
    <div className="disclaimer">
      <div>
        Fan / educational recreation. <b>Not affiliated with Tesla, Inc.</b> Visualization is simulated
        along public map data — not real Autopilot or FSD.
      </div>
      <button onClick={() => patchUi({ disclaimerDismissed: true })}>OK</button>
    </div>
  );
}

function QaReady() {
  const scene = useVehicle((s) => s.qa.scene);
  useEffect(() => {
    if (!scene) return;
    let cancelled = false;
    const done = () => {
      if (!cancelled) markQaReady();
    };
    const onMap = () => done();
    window.addEventListener("tesla-qa-map-idle", onMap, { once: true });
    const id = window.setTimeout(done, 4500);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
      window.removeEventListener("tesla-qa-map-idle", onMap);
    };
  }, [scene]);
  return null;
}

/** `?demo=work&at=400` boots the Pittsburgh → CMU route and optionally skips ahead along the polyline. */
function DemoBoot() {
  const booted = useRef(false);
  useEffect(() => {
    if (booted.current) return;
    if (useVehicle.getState().qa.frozen) return;
    const q = new URLSearchParams(window.location.search);
    if (q.get("demo") !== "work") return;
    booted.current = true;
    const at = Number(q.get("at") || "0");
    void (async () => {
      const api = useVehicle.getState();
      api.patchUi({ disclaimerDismissed: true });
      await api.navigateTo(WORK_PLACE);
      api.startFsd();
      if (!(at > 0)) return;
      const route = useVehicle.getState().route;
      if (!route) return;
      const sample = interpolate(indexFor(route.coords), at);
      useVehicle.setState({
        pose: {
          ...useVehicle.getState().pose,
          lng: sample.position[0],
          lat: sample.position[1],
          heading: sample.heading,
          traveledM: sample.traveledM,
          remainingM: sample.remainingM,
          speedMph: Math.max(22, useVehicle.getState().pose.speedMph),
        },
      });
    })();
  }, []);
  return null;
}

export default function App() {
  const vizRatio = useVehicle((s) => s.ui.vizRatio);
  const scene = useVehicle((s) => s.qa.scene);
  const gear = useVehicle((s) => s.gear);
  const phase = useVehicle((s) => s.phase);
  const parked = isParkedFullscreen(gear, phase);
  const mini = useMiniMap(parked, vizRatio);

  return (
    <div className="shell" data-qa-scene={scene ?? undefined}>
      <QaReady />
      <div className={`bezel ${parked ? "parked" : "driving"}`}>
        <StatusBar />
        <div className="display-main">
          <DriveStrip />
          <div className="stage">
            <div className="viz-pane" style={{ width: mini ? "100%" : `${vizRatio * 100}%` }}>
              <Suspense fallback={<div className="busy">Loading visualization…</div>}>
                <FsdCanvas />
              </Suspense>
              {parked ? null : <VizDivider />}
              {mini ? (
                <div className={`map-pane mini ${parked ? "parked" : ""}`}>
                  <Suspense fallback={<div className="busy">Loading map…</div>}>
                    <TeslaMap compact={parked} />
                  </Suspense>
                </div>
              ) : null}
            </div>
            {mini ? null : (
              <div className="map-pane" style={{ width: `${(1 - vizRatio) * 100}%` }}>
                <Suspense fallback={<div className="busy">Loading map…</div>}>
                  <TeslaMap />
                </Suspense>
              </div>
            )}
            {parked ? (
              <>
                <ParkedMedia />
                <NavSearch variant="parked" />
                <RouteCard />
              </>
            ) : null}
            <ControlsOverlay />
            <ClimatePanel />
            <MediaPanel />
            <AppLauncher />
            <Disclaimer />
          </div>
        </div>
        <BottomDock />
        <DriveLoop />
        <DemoBoot />
      </div>
    </div>
  );
}
