const { test, expect } = require("@playwright/test");

const SERVER_URL = (process.env.BASE_URL || "https://haode.com.mx").replace(/\/app\/?$/, "").replace(/\/$/, "");
const APP_URL = `${SERVER_URL}/app/`;

test.describe("HAODE App conversion UI phase 3", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("https://erp.haode.com.mx/**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "[]",
      });
    });
  });

  test("list and cart flows keep bulk WhatsApp prompts visible", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${APP_URL}#lista`, { waitUntil: "domcontentloaded" });

    await expect(page.locator(".app-bulk-panel").first()).toBeVisible();
    await expect(page.locator(".app-bulk-panel").first()).toContainText("Compra muchas piezas");
    await expect(page.locator(".app-card-badges").first()).toContainText("WhatsApp privado");
    await expectNoHorizontalOverflow(page);

    const productCards = page.locator(".product-card");
    const pricedProductCards = productCards.filter({ has: page.locator(".price-lines") });
    await expect(pricedProductCards.first()).toBeVisible({ timeout: 15000 });
    await pricedProductCards.first().getByRole("button", { name: "Agregar" }).click();
    await expect(page.locator(".cart-bulk-note")).toBeVisible();

    await page.locator("[data-close-cart]").click();
    await page.evaluate(() => { window.location.hash = "#carrito"; });
    await expect(page.locator(".app-bulk-panel").first()).toContainText("Envía este carrito");
    await expectNoHorizontalOverflow(page);
  });
});

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}
