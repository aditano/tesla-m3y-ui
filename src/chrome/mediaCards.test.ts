/**
 * @vitest-environment happy-dom
 */
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { DriveOverlay } from "./DriveOverlay";
import { ParkedMedia } from "./ParkedMedia";
import { MEDIA_LIBRARY, resetVehicle, useVehicle } from "../state/store";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function box(left: number, width: number): DOMRect {
  return {
    x: left,
    y: 0,
    left,
    top: 0,
    right: left + width,
    bottom: 8,
    width,
    height: 8,
    toJSON() {
      return {};
    },
  } as DOMRect;
}

describe("media cards from the parked store", () => {
  let root: Root | undefined;
  let host: HTMLDivElement | undefined;

  beforeEach(() => {
    resetVehicle();
  });

  afterEach(() => {
    act(() => {
      root?.unmount();
    });
    host?.remove();
    root = undefined;
    host = undefined;
  });

  async function mount(node: ReturnType<typeof createElement>) {
    host = document.createElement("div");
    document.body.append(host);
    root = createRoot(host);
    await act(async () => {
      root?.render(node);
    });
  }

  it("skips to the next library track from the parked card Next button", async () => {
    const before = useVehicle.getState().media;
    expect(before.track).toBe(MEDIA_LIBRARY[0].track);
    expect(before.progress).toBeCloseTo(0.34);

    await mount(createElement(ParkedMedia));
    const next = host?.querySelector<HTMLButtonElement>('button[title="Next"]');
    expect(next).toBeTruthy();
    await act(async () => {
      next?.click();
    });

    const media = useVehicle.getState().media;
    expect(media.track).toBe(MEDIA_LIBRARY[1].track);
    expect(media.artist).toBe(MEDIA_LIBRARY[1].artist);
    expect(media.libraryIndex).toBe(1);
    expect(media.playing).toBe(true);
    expect(media.progress).toBe(0);
  });

  it("scrubs playback when the driving card progress bar receives a pointer", async () => {
    expect(useVehicle.getState().media.progress).toBeCloseTo(0.34);
    await mount(createElement(DriveOverlay, { expanded: false }));
    const bar = host?.querySelector<HTMLDivElement>(".drive-media-progress");
    expect(bar).toBeTruthy();
    expect(bar?.getAttribute("role")).toBe("slider");
    if (!bar) return;

    const width = 200;
    const left = 40;
    bar.getBoundingClientRect = () => box(left, width);
    await act(async () => {
      bar.dispatchEvent(
        new PointerEvent("pointerdown", { bubbles: true, cancelable: true, clientX: left + width * 0.5, pointerId: 1, buttons: 1 }),
      );
    });
    expect(useVehicle.getState().media.progress).toBeCloseTo(0.5);

    await act(async () => {
      bar.dispatchEvent(
        new PointerEvent("pointermove", { bubbles: true, cancelable: true, clientX: left + width * 0.8, pointerId: 1, buttons: 1 }),
      );
    });
    expect(useVehicle.getState().media.progress).toBeCloseTo(0.8);

    await act(async () => {
      bar.dispatchEvent(
        new PointerEvent("pointermove", { bubbles: true, cancelable: true, clientX: left, pointerId: 1, buttons: 0 }),
      );
    });
    expect(useVehicle.getState().media.progress).toBeCloseTo(0.8);
  });
});
