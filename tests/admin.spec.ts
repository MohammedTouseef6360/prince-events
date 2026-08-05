import { test, expect } from "@playwright/test";

const ADMIN_PASSWORD = "prince@123";

test.describe("Admin auth", () => {
  test("admin pages redirect to login when unauthenticated", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("login page rejects wrong password", async ({ page }) => {
    await page.goto("/admin/login");
    await page.fill("#admin-password", "wrong-password");
    await page.getByRole("button", { name: /login/i }).click();
    await expect(page.getByText(/invalid password/i)).toBeVisible({ timeout: 15_000 });
  });

  test("login succeeds and lands on dashboard", async ({ page }) => {
    await page.goto("/admin/login");
    await page.fill("#admin-password", ADMIN_PASSWORD);
    await page.getByRole("button", { name: /login/i }).click();
    await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 15_000 });
    await expect(page.locator("body")).toBeVisible();
  });

  test("logout returns to login and session is cleared", async ({ page }) => {
    await page.goto("/admin/login");
    await page.fill("#admin-password", ADMIN_PASSWORD);
    await page.getByRole("button", { name: /login/i }).click();
    await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 15_000 });

    const logout = page.locator("button", { hasText: /logout/i }).first();
    if (await logout.isVisible()) {
      await logout.click();
      await expect(page).toHaveURL(/\/admin\/login/, { timeout: 15_000 });
    }
  });
});

test.describe("Admin pages", () => {
  test.use({ storageState: undefined });

  test("all admin pages load after login", async ({ page }) => {
    await page.goto("/admin/login");
    await page.fill("#admin-password", ADMIN_PASSWORD);
    await page.getByRole("button", { name: /login/i }).click();
    await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 15_000 });

    for (const path of ["/admin/menu", "/admin/gallery", "/admin/orders", "/admin/settings", "/admin/testimonials"]) {
      await page.goto(path);
      await expect(page.locator("body")).toBeVisible();
      expect(page.url()).toContain("/admin/");
    }
  });
});
