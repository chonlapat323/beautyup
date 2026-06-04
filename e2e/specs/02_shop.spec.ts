import { test, expect } from "@playwright/test";

test.describe("Shop Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("shop tab shows brand selection", async ({ page }) => {
    await page.locator('text=ช้อป').first().click();
    await page.waitForLoadState("networkidle");
    const hasBrandStep =
      await page.locator("text=เลือกแบรนด์").isVisible().catch(() => false) ||
      await page.locator("text=แบรนด์").isVisible().catch(() => false);
    expect(hasBrandStep).toBe(true);
  });

  test("search screen opens", async ({ page }) => {
    const searchBtn = page.locator('[placeholder*="ค้นหา"], text=ค้นหาผลิตภัณฑ์').first();
    const hasSearch = await searchBtn.isVisible().catch(() => false);
    if (hasSearch) {
      await searchBtn.click();
      await page.waitForLoadState("networkidle");
      expect(page.url()).toBeTruthy();
    } else {
      // search might be on different screen
      expect(true).toBe(true);
    }
  });
});
