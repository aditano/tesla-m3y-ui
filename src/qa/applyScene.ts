import { useVehicle } from "../state/store";
import { isQaSceneId, snapshotForScene, type QaSceneId } from "./scenes";

function markDocument(scene: QaSceneId): void {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.qaScene = scene;
  document.documentElement.dataset.qaReady = "pending";
}

export function applyQaScene(scene: QaSceneId): void {
  markDocument(scene);
  const snap = snapshotForScene(scene);
  useVehicle.setState(snap);
}

export function applyQaFromLocation(search = window.location.search): QaSceneId | null {
  const params = new URLSearchParams(search);
  const raw = params.get("qa");
  if (!raw || !isQaSceneId(raw)) return null;
  applyQaScene(raw);
  return raw;
}

export function markQaReady(): void {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.qaReady = "true";
}

export function isQaHarnessActive(): boolean {
  return useVehicle.getState().qa.frozen;
}
