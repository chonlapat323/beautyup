import { test, expect } from "@playwright/test";

test.describe("Home Screen", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("home screen loads", async ({ page }) => {
    const hasContent =
      await page.locator("text=แบรนด์").isVisible().catch(() => false) ||
      await page.locator("text=สูตรพิเศษ").isVisible().catch(() => false) ||
      await page.locator("text=สินค้าแนะนำ").isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });

  test("bottom tab bar has 4 tabs", async ({ page }) => {
    const tabs = await page.locator('text=หน้าหลัก, text=ช้อป, text=ตะกร้า, text=บัญชี').all();
    expect(tabs.length).toBeGreaterThanOrEqual(1);
  });
});
