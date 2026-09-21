import { expect, test } from "@playwright/test";

test.describe("the app", () => {
  test("serves the page", async ({ page }) => {
    const response = await page.goto("/");

    expect(response?.ok()).toBe(true);
  });
});
