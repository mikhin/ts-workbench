import { expect, test } from "./fixtures";

test.describe("the app", () => {
  test("serves the page", async ({ page }) => {
    const response = await page.goto("/");

    expect(response?.ok()).toBe(true);

    await expect(page.getByRole("heading")).toBeVisible();
  });
});
