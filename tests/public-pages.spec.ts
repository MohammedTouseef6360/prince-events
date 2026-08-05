import { test, expect } from "@playwright/test";

test.describe("Public pages smoke test", () => {
  test("home page renders with branding and navigation", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/");
    await expect(page).toHaveTitle(/PRINCE EVENTS|Prince Events/i);

    const nav = page.locator("nav").first();
    await expect(nav).toBeVisible();
    await expect(page.locator("body")).toContainText("PRINCE EVENTS");

    expect(errors).toEqual([]);
  });

  test("menu page loads", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/menu");
    await expect(page).toHaveTitle(/menu|PRINCE EVENTS/i);
    expect(errors).toEqual([]);
  });

  test("gallery page loads", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/gallery");
    await expect(page).toHaveTitle(/gallery|PRINCE EVENTS/i);
    expect(errors).toEqual([]);
  });

  test("cart page loads", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/cart");
    await expect(page).toHaveTitle(/cart|PRINCE EVENTS/i);
    expect(errors).toEqual([]);
  });

  test("my-orders page loads", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/my-orders");
    await expect(page).toHaveTitle(/orders|PRINCE EVENTS/i);
    expect(errors).toEqual([]);
  });

  test("offline page is reachable", async ({ page }) => {
    await page.goto("/offline");
    await expect(page.locator("body")).toBeVisible();
  });

  test("unknown route returns 404", async ({ page }) => {
    const res = await page.goto("/does-not-exist");
    expect(res?.status()).toBe(404);
  });

  test("navigation menu links work", async ({ page }) => {
    await page.goto("/");
    const topBarMenuLink = page.locator("a[href='/menu']").first();
    if (await topBarMenuLink.isVisible().catch(() => false)) {
      await topBarMenuLink.click();
    } else {
      await page.getByRole("button", { name: /toggle menu/i }).click();
      await page.locator("#mobile-sidebar a[href='/menu']").first().click();
    }
    await expect(page).toHaveURL(/\/menu$/);
  });

  test("skip-to-content link exists", async ({ page }) => {
    await page.goto("/");
    const skip = page.locator('a[href="#main-content"]').first();
    await expect(skip).toBeVisible();
  });
});
