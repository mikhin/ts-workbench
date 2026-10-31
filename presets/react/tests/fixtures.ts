import { test as base } from "@playwright/test";

export { expect } from "@playwright/test";

export const test = base.extend<{ coverage: null }>({
  coverage: [
    async ({ browserName, page }, runFixture, testInfo): Promise<void> => {
      if (process.env["E2E_COVERAGE"] !== "1") return runFixture(null);

      if (browserName !== "chromium") throw new Error("JS coverage requires Chromium");

      await page.coverage.startJSCoverage({ resetOnNavigation: false });

      try {
        await runFixture(null);
      } finally {
        const entries = await page.coverage.stopJSCoverage();

        await testInfo.attach("v8-coverage", {
          body: Buffer.from(JSON.stringify(entries)),
          contentType: "application/json",
        });
      }
    },
    { auto: true },
  ],
});
