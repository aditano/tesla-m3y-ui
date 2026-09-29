import { describe, expect, it } from "vitest";
import { CENTER_DISPLAY_HEIGHT, CENTER_DISPLAY_WIDTH, centerDisplayFrame } from "./displayFrame";

const RATIO = CENTER_DISPLAY_WIDTH / CENTER_DISPLAY_HEIGHT;

function expectFitted(viewport: { width: number; height: number; offsetLeft?: number; offsetTop?: number }) {
  const frame = centerDisplayFrame(viewport);
  expect(frame.width / frame.height).toBeCloseTo(RATIO, 6);
  expect(frame.width).toBeCloseTo(CENTER_DISPLAY_WIDTH * frame.scale, 6);
  expect(frame.height).toBeCloseTo(CENTER_DISPLAY_HEIGHT * frame.scale, 6);
  expect(frame.width).toBeLessThanOrEqual(viewport.width + 0.001);
  expect(frame.height).toBeLessThanOrEqual(viewport.height + 0.001);
  expect(frame.scale).toBeCloseTo(Math.min(viewport.width / CENTER_DISPLAY_WIDTH, viewport.height / CENTER_DISPLAY_HEIGHT), 6);
  const fillsWidth = Math.abs(frame.width - viewport.width) < 0.001;
  const fillsHeight = Math.abs(frame.height - viewport.height) < 0.001;
  expect(fillsWidth || fillsHeight).toBe(true);
  return frame;
}

describe("center display frame", () => {
  it("is exactly 1920×1200 when the viewport is the center display", () => {
    const frame = expectFitted({ width: 1920, height: 1200 });
    expect(frame.scale).toBe(1);
    expect(frame.left).toBe(0);
    expect(frame.top).toBe(0);
  });

  it("keeps 1920:1200 on a phone, a laptop, and an ultrawide", () => {
    const phone = expectFitted({ width: 390, height: 844 });
    expect(phone.scale).toBeCloseTo(390 / 1920, 6);
    expect(phone.left).toBeCloseTo(0, 6);
    expect(phone.top).toBeGreaterThan(0);

    const laptop = expectFitted({ width: 1512, height: 982 });
    expect(laptop.width / laptop.height).toBeCloseTo(RATIO, 6);

    const wide = expectFitted({ width: 2560, height: 1080 });
    expect(wide.height).toBeCloseTo(1080, 6);
    expect(wide.left).toBeGreaterThan(0);
    expect(wide.top).toBeCloseTo(0, 6);
  });

  it("centers inside a visual viewport that is offset from the layout viewport", () => {
    const frame = expectFitted({ width: 800, height: 600, offsetLeft: 12, offsetTop: 40 });
    expect(frame.width).toBeCloseTo(800, 6);
    expect(frame.left).toBeCloseTo(12, 6);
    expect(frame.top).toBeCloseTo(40 + (600 - frame.height) / 2, 6);
  });
});
