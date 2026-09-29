import { expect, test, type Page } from "@playwright/test";

type LayoutReport = {
  scrollW: number;
  clientW: number;
  clientH: number;
  outside: string[];
  dockOverlap: boolean;
  climateY: number;
  volumeY: number;
  myApps: string;
  hotspots: string;
  disclaimerFits: boolean;
};

async function layoutReport(page: Page): Promise<LayoutReport> {
  return page.evaluate(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const selectors = [
      ".disclaimer",
      ".disclaimer button",
      ".portrait-hotspots button",
      ".nav-stack input",
      ".bottom-dock button",
      ".volume-wrap",
      ".volume-wrap input",
      ".parked-media",
      ".status-bar",
    ];
    const outside: string[] = [];
    for (const sel of selectors) {
      for (const el of document.querySelectorAll(sel)) {
        const r = el.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) continue;
        if (r.left < -1 || r.top < -1 || r.right > vw + 1 || r.bottom > vh + 1) {
          const label = (
            el.getAttribute("aria-label") ||
            el.getAttribute("title") ||
            el.getAttribute("placeholder") ||
            el.textContent ||
            sel
          )
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 48);
          outside.push(label);
        }
      }
    }

    const dockButtons = [...document.querySelectorAll(".bottom-dock button")]
      .map((el) => el.getBoundingClientRect())
      .filter((r) => r.width > 2 && r.height > 2);
    let dockOverlap = false;
    for (let i = 0; i < dockButtons.length; i++) {
      for (let j = i + 1; j < dockButtons.length; j++) {
        const a = dockButtons[i];
        const b = dockButtons[j];
        const ix = Math.min(a.right, b.right) - Math.max(a.left, b.left);
        const iy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        if (ix > 2 && iy > 2) dockOverlap = true;
      }
    }

    const climate = document.querySelector(".climate-cluster")?.getBoundingClientRect();
    const volume = document.querySelector(".volume-wrap")?.getBoundingClientRect();
    const disclaimer = document.querySelector(".disclaimer");
    return {
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
      clientH: document.documentElement.clientHeight,
      outside,
      dockOverlap,
      climateY: climate?.y ?? -1,
      volumeY: volume?.y ?? -1,
      myApps: document.querySelector(".my-apps")
        ? getComputedStyle(document.querySelector(".my-apps")!).display
        : "absent",
      hotspots: document.querySelector(".portrait-hotspots")
        ? getComputedStyle(document.querySelector(".portrait-hotspots")!).display
        : "absent",
      disclaimerFits: !!disclaimer && disclaimer.scrollHeight <= disclaimer.clientHeight + 1,
    };
  });
}

async function expectCenterAspect(page: Page) {
  const box = await page.locator(".bezel").evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { width: r.width, height: r.height, x: r.x, y: r.y, vw: window.innerWidth, vh: window.innerHeight };
  });
  expect(box.height).toBeGreaterThan(40);
  expect(box.width / box.height).toBeCloseTo(1920 / 1200, 2);
  expect(box.x).toBeGreaterThanOrEqual(-1);
  expect(box.y).toBeGreaterThanOrEqual(-1);
  expect(box.x + box.width).toBeLessThanOrEqual(box.vw + 1);
  expect(box.y + box.height).toBeLessThanOrEqual(box.vh + 1);
  const fillsWidth = Math.abs(box.width - box.vw) <= 2;
  const fillsHeight = Math.abs(box.height - box.vh) <= 2;
  expect(fillsWidth || fillsHeight).toBe(true);
}

test("portrait 390 keeps the 1920×1200 display, charge, navigate, volume, and the disclaimer on screen", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/tesla-m3y-ui/", { waitUntil: "domcontentloaded" });
  await page.locator(".bottom-dock").waitFor();
  await expectCenterAspect(page);

  const parked = await layoutReport(page);
  expect(parked.scrollW).toBeLessThanOrEqual(parked.clientW + 1);
  expect(parked.outside).toEqual([]);
  expect(parked.dockOverlap).toBe(false);
  expect(parked.disclaimerFits).toBe(true);
  expect(parked.hotspots).toBe("none");
  // Pinned app icons were removed from the dock (touchscreen PDF p.8: Car + All Apps only).
  expect(parked.myApps).toBe("absent");
  expect(Math.abs(parked.climateY - parked.volumeY)).toBeLessThan(12);

  const charge = page.locator('[data-hotspot="charge"] button');
  await expect(charge).toBeVisible();
  await charge.dispatchEvent("click");
  await expect(charge).toHaveText(/Close/);
  await expect(page.getByPlaceholder("Navigate")).toBeVisible();
  await expect(page.getByRole("slider", { name: "Volume" })).toBeVisible();
  await expect(page.getByRole("button", { name: "OK" })).toBeVisible();

  await page.evaluate(() => {
    document.querySelector<HTMLButtonElement>(".drive-strip button.gear.auto.d")?.click();
  });
  await expect(page.locator(".bezel")).toHaveClass(/driving/);
  const driving = await layoutReport(page);
  expect(driving.scrollW).toBeLessThanOrEqual(driving.clientW + 1);
  expect(driving.outside).toEqual([]);
  expect(driving.dockOverlap).toBe(false);
  const map = await page.locator(".map-pane:not(.mini)").boundingBox();
  expect(map).not.toBeNull();
  expect(map!.x + map!.width).toBeLessThanOrEqual(driving.clientW + 1);
});

test("landscape and desktop keep the single-row dock", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/tesla-m3y-ui/", { waitUntil: "domcontentloaded" });
  await page.locator(".bottom-dock").waitFor();

  await expectCenterAspect(page);
  const desktop = await layoutReport(page);
  expect(desktop.scrollW).toBeLessThanOrEqual(desktop.clientW + 1);
  expect(desktop.hotspots).toBe("none");
  expect(desktop.myApps).toBe("absent");
  expect(Math.abs(desktop.climateY - desktop.volumeY)).toBeLessThan(12);

  await page.setViewportSize({ width: 844, height: 390 });
  await page.waitForTimeout(50);
  await expectCenterAspect(page);
  const landscape = await layoutReport(page);
  expect(landscape.scrollW).toBeLessThanOrEqual(landscape.clientW + 1);
  expect(landscape.hotspots).toBe("none");
  expect(landscape.myApps).toBe("absent");
  expect(Math.abs(landscape.climateY - landscape.volumeY)).toBeLessThan(12);

  await page.setViewportSize({ width: 1920, height: 1200 });
  await page.waitForTimeout(50);
  await expectCenterAspect(page);
  const exact = await page.locator(".bezel").boundingBox();
  expect(exact?.width).toBeGreaterThan(1910);
  expect(exact?.height).toBeGreaterThan(1190);

  await page.setViewportSize({ width: 2560, height: 1080 });
  await page.waitForTimeout(50);
  await expectCenterAspect(page);
});
