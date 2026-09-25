const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:4173";

function captureConsoleErrors(page) {
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

async function saveEvidence(page, fileName) {
  if (!process.env.SCREENSHOT_DIR) return;
  const directory = path.resolve(process.env.SCREENSHOT_DIR);
  fs.mkdirSync(directory, { recursive: true });
  await page.screenshot({ path: path.join(directory, fileName), fullPage: true });
}

test("Samsung S8 detail shows all four approved named customer prices", async ({ page }) => {
  const consoleErrors = captureConsoleErrors(page);
  await page.route("**/api/public/catalog**", (route) => route.fulfill({ json: { products: [] } }));
  await page.route("**/public-stock.json**", (route) => route.fulfill({ json: { products: [] } }));
  await page.goto(`${BASE_URL}/producto/samsung-incell-s8/`, { waitUntil: "networkidle" });

  const priceTable = page.getByRole("table", { name: "Tabla completa de precios" });
  await expect(priceTable).toContainText("Menudeo");
  await expect(priceTable).toContainText("$365 MXN");
  await expect(priceTable).toContainText("Mayoreo");
  await expect(priceTable).toContainText("$345 MXN");
  await expect(priceTable).toContainText("Caja");
  await expect(priceTable).toContainText("$325 MXN");
  await expect(priceTable).toContainText("VIP");
  await expect(priceTable).toContainText("$315 MXN");
  expect(consoleErrors).toEqual([]);
  await saveEvidence(page, "website-samsung-s8-four-named-prices.png");
});

test("App uses retail price for one Samsung S8 instead of box price", async ({ page }) => {
  const consoleErrors = captureConsoleErrors(page);
  await page.route("**/api/public/catalog**", (route) => route.fulfill({ json: { products: [] } }));
  await page.route("**/public-stock.json**", (route) => route.fulfill({ json: { products: [] } }));
  await page.goto(`${BASE_URL}/app/#producto/samsung-incell-s8`, { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: /Pantalla Samsung S8$/ })).toBeVisible();
  await expect(page.locator(".price-stack")).toContainText("$365 MXN");
  await page.locator("[data-add-product='samsung-incell-s8']").click();
  await page.goto(`${BASE_URL}/app/#carrito`, { waitUntil: "domcontentloaded" });

  const cartItem = page.locator(".cart-items-page .cart-item", { hasText: "Pantalla Samsung S8" });
  await expect(cartItem).toContainText("$365 MXN");
  await expect(cartItem).not.toContainText("$315 MXN");
  expect(consoleErrors).toEqual([]);
  await saveEvidence(page, "app-samsung-s8-retail-price.png");
});

test("App shows inventory only when the exact ERP stock feed supplies it", async ({ page }) => {
  const consoleErrors = captureConsoleErrors(page);
  await page.route("**/api/public/catalog**", (route) => route.fulfill({ json: { products: [] } }));
  await page.route("**/public-stock.json**", (route) => route.fulfill({
    json: [{
      sku: "iphone-incell-14",
      stock_status: "available",
      stock_label: "Disponible ERP",
      updated_at: "2026-09-24T20:00:00-06:00"
    }]
  }));

  await page.goto(`${BASE_URL}/app/#producto/iphone-incell-14`, { waitUntil: "domcontentloaded" });
  await expect(page.locator(".stock-badge").first()).toContainText("Disponible ERP");
  expect(consoleErrors).toEqual([]);
});

test("iPhone 11 standard FHD uses the confirmed image on website and App", async ({ page }) => {
  const consoleErrors = captureConsoleErrors(page);
  await page.route("**/api/public/catalog**", (route) => route.fulfill({ json: { products: [] } }));
  await page.route("**/public-stock.json**", (route) => route.fulfill({ json: { products: [] } }));

  await page.goto(`${BASE_URL}/producto/iphone-incell-11/`, { waitUntil: "networkidle" });
  await expect(page.locator("[data-detail-title]")).toHaveText("Pantalla iPhone 11 INCELL FHD");
  await expect(page.locator("[data-detail-quality]")).toHaveText("INCELL FHD C/IC");
  await expect(page.locator("[data-detail-main-image]")).toHaveAttribute(
    "src",
    "/assets/products/iphone-incell/11/fhd-main.display.webp"
  );
  await expect(page.locator("[data-product-image-status]")).toHaveCount(0);
  await expect.poll(
    () => page.locator("[data-detail-main-image]").evaluate((image) => image.complete && image.naturalWidth > 0),
    { timeout: 10000 }
  ).toBe(true);
  await saveEvidence(page, "website-iphone-11-fhd-confirmed-image.png");

  await page.goto(`${BASE_URL}/app/#producto/iphone-incell-11`, { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Pantalla iPhone 11 INCELL FHD" })).toBeVisible();
  await expect(page.locator(".spec-grid")).toContainText("iPhone 11 INCELL FHD");
  await expect(page.locator(".spec-grid")).toContainText("INCELL FHD C/IC");
  await expect(page.locator(".stock-badge").first()).toContainText("consultar inventario");
  await expect(page.locator("[data-product-gallery] img").first()).toHaveAttribute(
    "src",
    "/assets/products/iphone-incell/11/fhd-main.jpg"
  );
  await expect(page.locator("[data-product-gallery] .product-image-status")).toHaveCount(0);
  await expect.poll(
    () => page.locator("[data-product-gallery] img").first().evaluate((image) => image.complete && image.naturalWidth > 0),
    { timeout: 10000 }
  ).toBe(true);

  expect(consoleErrors).toEqual([]);
  await saveEvidence(page, "app-iphone-11-fhd-confirmed-image.png");
});
