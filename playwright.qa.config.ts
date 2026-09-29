import { defineConfig, devices } from "@playwright/test";

const port = process.env.QA_PORT ?? "5173";
const origin = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./tests/visual",
  fullyParallel: false,
  workers: 1,
  timeout: 240_000,
  expect: { timeout: 20_000 },
  reporter: [["list"]],
  use: {
    ...devices["Desktop Chrome"],
    baseURL: origin,
    viewport: { width: 1920, height: 1200 },
    deviceScaleFactor: 1,
    colorScheme: "dark",
  },
  webServer: {
    command: `npm run dev -- --host 127.0.0.1 --port ${port} --strictPort`,
    url: `${origin}/tesla-m3y-ui/`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
