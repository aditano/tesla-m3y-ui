import { expect, test } from "@playwright/test";
import path from "node:path";
import { QA_SCENE_IDS, type QaSceneId } from "../../src/qa/scenes";

const OUT = path.join("docs", "qa", "screenshots");

async function capture(page: import("@playwright/test").Page, scene: QaSceneId): Promise<void> {
  await page.goto(`/tesla-m3y-ui/?qa=${scene}`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector('html[data-qa-ready="true"]', { timeout: 120_000 });
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await page.waitForTimeout(900);
  const bezel = page.locator(".bezel");
  await expect(bezel).toBeVisible();
  await expect(page.locator(".shell")).toHaveAttribute("data-qa-scene", scene);
  // Parked MapLibre + WebGL overlays can stall Playwright's element-stability
  // wait, so crop a page screenshot instead of locator.screenshot.
  const box = await bezel.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  });
  const x = Math.max(0, Math.floor(box.x));
  const y = Math.max(0, Math.floor(box.y));
  // Chromium's compositor hangs on parked WebGL+MapLibre canvases. Blit them to
  // images first (needs preserveDrawingBuffer on the QA path).
  await page.evaluate(async () => {
    const canvases = Array.from(document.querySelectorAll("canvas"));
    const pending: Promise<void>[] = [];
    for (const canvas of canvases) {
      let url = "";
      try {
        url = canvas.toDataURL("image/png");
      } catch {
        url = "";
      }
      if (!url || url === "data:,") continue;
      const img = document.createElement("img");
      img.alt = "";
      const style = getComputedStyle(canvas);
      img.style.cssText = `position:${style.position};inset:0;width:100%;height:100%;display:block;pointer-events:none;`;
      pending.push(
        new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = url;
        }),
      );
      canvas.replaceWith(img);
    }
    await Promise.all(pending);
  });
  await page.screenshot({
    path: path.join(OUT, `${scene}.png`),
    animations: "allow",
    timeout: 15_000,
    clip: {
      x,
      y,
      width: Math.max(1, Math.min(Math.ceil(box.width), 1920 - x)),
      height: Math.max(1, Math.min(Math.ceil(box.height), 1200 - y)),
    },
  });
}

test.describe("visual QA harness", () => {
  test("captures parked home", async ({ page }) => {
    await capture(page, "parked-home");
    await expect(page.getByRole("button", { name: "P", exact: true })).toHaveClass(/on/);
    await expect(page.getByText("TRUNK", { exact: true })).toBeVisible();
    await expect(page.getByTitle("Passenger airbag on")).toBeVisible();
    await expect(page.getByLabel("Controls")).toHaveCount(0);
  });

  test("captures route set", async ({ page }) => {
    await capture(page, "route-set");
    await expect(page.getByRole("button", { name: "Start Full Self-Driving" })).toBeVisible();
  });

  test("captures FSD engaged", async ({ page }) => {
    await capture(page, "fsd-engaged");
    await expect(page.getByRole("button", { name: "End Self-Driving" }).first()).toBeVisible();
    await expect(page.locator(".hud-speed .label")).toContainText("Self-Driving");
  });

  test("captures Controls open", async ({ page }) => {
    await capture(page, "controls");
    await expect(page.getByRole("dialog", { name: "Controls" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Quick Controls" })).toBeVisible();
  });

  test("captures climate open", async ({ page }) => {
    await capture(page, "climate");
    await expect(page.getByRole("dialog", { name: "Climate" })).toBeVisible();
  });

  test("captures media open", async ({ page }) => {
    await capture(page, "media");
    await expect(page.getByRole("dialog", { name: "Media" })).toBeVisible();
  });

  test("captures viz expanded", async ({ page }) => {
    await capture(page, "viz-expanded");
    await expect(page.locator(".map-pane.mini")).toBeVisible();
    await expect(page.getByRole("button", { name: "End Self-Driving" }).first()).toBeVisible();
  });

  test("scene catalog matches the checklist", () => {
    expect([...QA_SCENE_IDS]).toHaveLength(7);
  });
});
