import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./specs",
  fullyParallel: false,
  retries: 1,
  workers: 1,
  reporter: "html",
  use: {
    baseURL: process.env.MOBILE_WEB_URL ?? "http://localhost:8082",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    viewport: { width: 390, height: 844 }, // iPhone 14 Pro
  },
  projects: [
    { name: "mobile-chrome", use: { ...devices["Pixel 5"] } },
  ],
});
