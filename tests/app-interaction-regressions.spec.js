const { test, expect } = require("@playwright/test");

const BASE_URL = (process.env.BASE_URL || "http://127.0.0.1:4173").replace(/\/$/, "");
const APP_URL = `${BASE_URL}/app/`;
const CONSENT_STORAGE_KEY = "haode-privacy-consent-v1";

test.beforeEach(async ({ page }) => {
  await page.addInitScript((key) => {
    localStorage.setItem(key, JSON.stringify({
      version: 1,
      analytics: false,
      advertising: false,
      updatedAt: new Date().toISOString(),
    }));
  }, CONSENT_STORAGE_KEY);
  await page.route("https://erp.haode.com.mx/**", (route) => {
    route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
  });
});

test("App search keeps typed character order, caret position, and announces results", async ({ page }) => {
  await page.goto(`${APP_URL}#lista`, { waitUntil: "domcontentloaded" });

  const search = page.locator("[data-search-products]");
  await expect(search).toBeVisible({ timeout: 15000 });
  await search.click();
  await page.keyboard.type("iphone");

  await expect(search).toHaveValue("iphone");
  await expect.poll(() => search.evaluate((input) => input.selectionStart)).toBe(6);

  await search.focus();
  await search.evaluate((input) => input.setSelectionRange(1, 1));
  await page.keyboard.type("X");
  await expect(search).toHaveValue("iXphone");
  await expect.poll(() => search.evaluate((input) => input.selectionStart)).toBe(2);
  await expect(page.locator("[data-app-status]")).toContainText('productos encontrados para "iXphone"');
});

test("cart traps focus, closes with Escape, and restores the opening control", async ({ page }) => {
  await page.goto(APP_URL, { waitUntil: "domcontentloaded" });

  const addButton = page.locator("[data-add-product]").first();
  const closeButton = page.locator("[data-close-cart]");
  await expect(addButton).toBeVisible({ timeout: 15000 });
  await addButton.focus();
  await addButton.press("Enter");

  await expect(page.locator("[data-cart-drawer]")).toHaveAttribute("aria-hidden", "false");
  await expect(closeButton).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  expect(await page.evaluate(() => document.querySelector(".cart-panel")?.contains(document.activeElement))).toBe(true);
  await page.keyboard.press("Tab");
  await expect(closeButton).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(page.locator("[data-cart-drawer]")).toHaveAttribute("aria-hidden", "true");
  await expect(addButton).toBeFocused();
  await expect(page.locator("body")).not.toHaveClass(/cart-open/);
});

test("desktop share copies the product URL when native sharing is unavailable", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", { configurable: true, value: undefined });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (value) => {
          window.__copiedProductUrl = value;
        },
      },
    });
  });
  await page.goto(`${APP_URL}#producto/x200t-cortadora-micas`, { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: /X200T/i })).toBeVisible({ timeout: 15000 });
  await page.locator("[data-share-product]").click();

  await expect.poll(() => page.evaluate(() => window.__copiedProductUrl || "")).toBe(
    `${APP_URL}#producto/x200t-cortadora-micas`,
  );
  await expect(page.locator("[data-app-status]")).toHaveText("Enlace del producto copiado.");
});

test("catalog group and category use unique IDs", async ({ page }) => {
  await page.goto(`${BASE_URL}/productos/`, { waitUntil: "domcontentloaded" });

  await expect(page.locator('[data-catalog-group="celulares-samsung"]')).toBeVisible({ timeout: 15000 });
  await expect(page.locator('[id="celulares-samsung"]')).toHaveCount(1);
  await expect(page.locator('section[data-category="celulares-samsung"]')).toHaveAttribute(
    "id",
    "celulares-samsung-productos",
  );
});

test("homepage App links describe their real destinations", async ({ page }) => {
  await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });

  const appEntry = page.locator(".reference-head-account");
  await expect(appEntry).toContainText("Abrir");
  await expect(appEntry).toContainText("APP");
  await expect(appEntry).toHaveAttribute("href", "/app/");
  await expect(page.locator('.reference-nav a[href="/app/#lista"]')).toHaveText("Catálogo");
});
