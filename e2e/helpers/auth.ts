import { Page } from "@playwright/test";

export async function loginMobile(page: Page, phone?: string, password?: string) {
  // Navigate to Profile tab → Login
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // Tap Profile tab (บัญชี)
  const profileTab = page.locator('text=บัญชี, text=Profile, [aria-label*="บัญชี"]').first();
  await profileTab.click().catch(() => {});
  await page.waitForLoadState("networkidle");

  // Tap "เข้าสู่ระบบ" button
  const loginBtn = page.locator('text=เข้าสู่ระบบ').first();
  await loginBtn.click();
  await page.waitForLoadState("networkidle");

  // Fill form
  await page.fill('input[placeholder*="อีเมล"], input[placeholder*="เบอร์"]', phone ?? process.env.TEST_PHONE ?? "");
  await page.fill('input[type="password"]', password ?? process.env.TEST_PASSWORD ?? "");
  await page.click('text=เข้าสู่ระบบ');
  await page.waitForLoadState("networkidle");
}
