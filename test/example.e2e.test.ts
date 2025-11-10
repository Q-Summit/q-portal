// E2E tests should only run with Playwright, not bun test
// Exit immediately if running with Bun to prevent discovery and execution
if (typeof Bun !== "undefined") {
  process.exit(0);
}

// This import will never execute when run with Bun due to the guard above
import { test, expect } from "@playwright/test";

/**
 * Example e2e test demonstrating how to test full page flows using Playwright.
 *
 * E2E tests should test complete user flows and page interactions,
 * simulating real user behavior in a browser.
 */
test.describe("Home Page E2E Tests", () => {
  test("should load the home page", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    // Wait for the page to be fully loaded
    await page.waitForLoadState("domcontentloaded");

    // Check that the page title is correct
    await expect(page).toHaveTitle(/Q Portal/i);

    // Check that the main heading is visible (heading contains "Q" and "Portal")
    // The heading text is "Q Portal" but split across elements, so we search for heading containing "Q"
    const heading = page.locator("h1").filter({ hasText: /Q/i });
    await expect(heading).toBeVisible();
    await expect(heading).toContainText(/Portal/i);
  });

  test("should display tRPC greeting", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    // Wait for the greeting to appear (it's loaded from tRPC)
    // The greeting will be "Hello from tRPC!" based on the page.tsx
    const greeting = page.getByText(/Hello.*from.*tRPC/i);
    await expect(greeting).toBeVisible({ timeout: 10000 });
  });

  test("should have a test button", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    // Wait for the button to appear
    const button = page.getByRole("button", { name: /test button/i });
    await expect(button).toBeVisible({ timeout: 10000 });
  });

  test("should be responsive", async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/", { waitUntil: "networkidle" });

    const heading = page.locator("h1").filter({ hasText: /Q/i });
    await expect(heading).toBeVisible();
    await expect(heading).toContainText(/Portal/i);

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(heading).toBeVisible();
  });
});
