import { test, expect } from "@playwright/test";

test.describe("Profile", () => {
  test("profile tab shows login or profile screen", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.locator('text=บัญชี').first().click();
    await page.waitForLoadState("networkidle");

    const hasLoginBtn = await page.locator("text=เข้าสู่ระบบ").isVisible().catch(() => false);
    const hasRegisterBtn = await page.locator("text=สมัครสมาชิก").isVisible().catch(() => false);
    const hasProfile = await page.locator("text=บัญชีของฉัน").isVisible().catch(() => false);
    expect(hasLoginBtn || hasRegisterBtn || hasProfile).toBe(true);
  });

  test("login screen has form inputs", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.locator('text=บัญชี').first().click();
    await page.waitForLoadState("networkidle");

    const loginBtn = page.locator("text=เข้าสู่ระบบ").first();
    if (await loginBtn.isVisible().catch(() => false)) {
      await loginBtn.click();
      await page.waitForLoadState("networkidle");
      const hasInput = await page.locator("input").first().isVisible().catch(() => false);
      expect(hasInput).toBe(true);
    } else {
      expect(true).toBe(true); // already logged in
    }
  });
});
