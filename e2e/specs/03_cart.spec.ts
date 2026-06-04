import { test, expect } from "@playwright/test";

test.describe("Cart", () => {
  test("cart tab loads", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.locator('text=ตะกร้า').first().click();
    await page.waitForLoadState("networkidle");
    const hasCart =
      await page.locator("text=ตะกร้าสินค้า").isVisible().catch(() => false) ||
      await page.locator("text=ยังไม่มีสินค้า").isVisible().catch(() => false);
    expect(hasCart).toBe(true);
  });
});
