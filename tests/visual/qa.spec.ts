import { expect, test } from "@playwright/test";
import path from "node:path";
import { QA_SCENE_IDS, type QaSceneId } from "../../src/qa/scenes";

const OUT = path.join("docs", "qa", "screenshots");

async function capture(page: import("@playwright/test").Page, scene: QaSceneId): Promise<void> {
  await page.goto(`/tesla-m3y-ui/?qa=${scene}`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector('html[data-qa-ready="true"]', { timeout: 45_000 });
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await page.waitForTimeout(900);
  const bezel = page.locator(".bezel");
  await expect(bezel).toBeVisible();
  await expect(page.locator(".shell")).toHaveAttribute("data-qa-scene", scene);
  await bezel.screenshot({
    path: path.join(OUT, `${scene}.png`),
    animations: "disabled",
  });
}

test.describe("visual QA harness", () => {
  test("captures parked home", async ({ page }) => {
    await capture(page, "parked-home");
    await expect(page.getByRole("button", { name: "P" })).toHaveClass(/on/);
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
