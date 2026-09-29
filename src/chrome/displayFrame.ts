import { useEffect, useState } from "react";

/** Model 3/Y center display. The UI is laid out at this size on every device. */
export const CENTER_DISPLAY_WIDTH = 1920;
export const CENTER_DISPLAY_HEIGHT = 1200;

export interface ViewportBox {
  width: number;
  height: number;
  offsetLeft?: number;
  offsetTop?: number;
}

export interface CenterDisplayFrame {
  scale: number;
  width: number;
  height: number;
  left: number;
  top: number;
}

/**
 * Largest 1920×1200 frame that fits in the viewport. The layout size stays
 * 1920×1200; `scale` is the uniform fit, and `width`/`height` are the fitted box.
 */
export function centerDisplayFrame(viewport: ViewportBox): CenterDisplayFrame {
  const vw = viewport.width;
  const vh = viewport.height;
  const scale = vw > 0 && vh > 0 ? Math.min(vw / CENTER_DISPLAY_WIDTH, vh / CENTER_DISPLAY_HEIGHT) : 1;
  const width = CENTER_DISPLAY_WIDTH * scale;
  const height = CENTER_DISPLAY_HEIGHT * scale;
  const offsetLeft = viewport.offsetLeft ?? 0;
  const offsetTop = viewport.offsetTop ?? 0;
  return {
    scale,
    width,
    height,
    left: offsetLeft + Math.max(0, vw - width) / 2,
    top: offsetTop + Math.max(0, vh - height) / 2,
  };
}

export function readViewport(): ViewportBox {
  if (typeof window === "undefined") {
    return { width: CENTER_DISPLAY_WIDTH, height: CENTER_DISPLAY_HEIGHT, offsetLeft: 0, offsetTop: 0 };
  }
  const vv = window.visualViewport;
  return {
    width: vv?.width ?? window.innerWidth,
    height: vv?.height ?? window.innerHeight,
    offsetLeft: vv?.offsetLeft ?? 0,
    offsetTop: vv?.offsetTop ?? 0,
  };
}

export function useCenterDisplayFrame(): CenterDisplayFrame {
  const [frame, setFrame] = useState(() => centerDisplayFrame(readViewport()));
  useEffect(() => {
    const apply = () => setFrame(centerDisplayFrame(readViewport()));
    apply();
    window.addEventListener("resize", apply);
    window.visualViewport?.addEventListener("resize", apply);
    window.visualViewport?.addEventListener("scroll", apply);
    return () => {
      window.removeEventListener("resize", apply);
      window.visualViewport?.removeEventListener("resize", apply);
      window.visualViewport?.removeEventListener("scroll", apply);
    };
  }, []);
  return frame;
}
