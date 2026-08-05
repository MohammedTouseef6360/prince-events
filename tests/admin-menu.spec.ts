import { test, expect } from "@playwright/test";

const ADMIN_PASSWORD = "prince@123";

async function login(page: import("@playwright/test").Page) {
  await page.goto("/admin/login");
  await page.fill("#admin-password", ADMIN_PASSWORD);
  await page.getByRole("button", { name: /login/i }).click();
  await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 15_000 });
}

test.describe("Admin menu item form", () => {
  test("client-side validation requires name and price", async ({ page }) => {
    await login(page);
    await page.goto("/admin/menu");
    await page.getByRole("button", { name: /add item/i }).first().click();
    await expect(page.locator("#item-name")).toBeVisible();

    await page.getByRole("button", { name: /save/i }).click();

    const nameError = page.getByText(/name is required/i);
    await expect(nameError).toBeVisible();

    await page.fill("#item-name", "Playwright Test Dish");
    await expect(nameError).toBeHidden();

    await page.fill("#item-price", "250");
    const priceError = page.getByText(/price is required/i);
    await expect(priceError).toBeHidden();
  });

  test("form opens and closes", async ({ page }) => {
    await login(page);
    await page.goto("/admin/menu");
    await page.getByRole("button", { name: /add item/i }).first().click();
    await expect(page.locator("#item-name")).toBeVisible();
    await page.getByRole("button", { name: /close form/i }).click();
    await expect(page.locator("#item-name")).toBeHidden();
  });

  test("save submits item through the API", async ({ page }) => {
    await login(page);
    await page.goto("/admin/menu");
    await page.getByRole("button", { name: /add item/i }).first().click();

    await page.fill("#item-name", "Playwright Test Dish");
    await page.fill("#item-price", "250");

    const responsePromise = page.waitForResponse(
      (r) => r.url().includes("/api/menu") && r.request().method() === "POST",
      { timeout: 20_000 }
    );
    await page.getByRole("button", { name: /save/i }).click();
    const response = await responsePromise;

    const body = await response.json().catch(() => null);
    expect(response.ok()).toBeTruthy();
    test.info().annotations.push({ type: "firebase", description: `POST /api/menu -> ${response.status()} body=${JSON.stringify(body)}` });
  });

  test("saved item persists and appears in the admin list", async ({ page }) => {
    const uniqueName = `Persist Check ${Date.now()}`;
    await login(page);
    await page.goto("/admin/menu");
    await page.getByRole("button", { name: /add item/i }).first().click();

    await page.fill("#item-name", uniqueName);
    await page.fill("#item-price", "300");
    await page.getByRole("button", { name: /save/i }).click();
    await page.getByRole("cell", { name: uniqueName, exact: true }).first().waitFor({ timeout: 15_000 });
    await expect(page.getByRole("cell", { name: uniqueName, exact: true }).first()).toBeVisible();

    await page.reload();
    await page.getByRole("cell", { name: uniqueName, exact: true }).first().waitFor({ timeout: 15_000 });
    await expect(page.getByRole("cell", { name: uniqueName, exact: true }).first()).toBeVisible();
  });
});
