import { defineConfig, devices } from "@playwright/test";

const PORT = 5183;
const URL = `http://localhost:${PORT}`;
const EXPECT_TIMEOUT = 10_000;
const TEST_TIMEOUT = 30_000;
const SERVER_TIMEOUT = 120_000;

export default defineConfig({
  expect: { timeout: EXPECT_TIMEOUT },
  forbidOnly: Boolean(process.env["CI"]),
  fullyParallel: true,
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  reporter: "html",
  retries: process.env["CI"] ? 2 : 0,
  testDir: "./tests",
  timeout: TEST_TIMEOUT,
  use: {
    baseURL: URL,
    screenshot: "only-on-failure",
    trace: "on-first-retry",
  },
  webServer: {
    command: `pnpm dev --port ${PORT} --strictPort`,
    reuseExistingServer: !process.env["CI"],
    timeout: SERVER_TIMEOUT,
    url: URL,
  },
  workers: process.env["CI"] ? 1 : 4,
});
