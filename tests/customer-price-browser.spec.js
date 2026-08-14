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

test("Samsung S8 detail shows all five approved customer prices", async ({ page }) => {
  const consoleErrors = captureConsoleErrors(page);
  await page.route("**/api/public/catalog**", (route) => route.fulfill({ json: { products: [] } }));
  await page.route("**/public-stock.json**", (route) => route.fulfill({ json: { products: [] } }));
  await page.goto(`${BASE_URL}/producto/samsung-incell-s8/`, { waitUntil: "networkidle" });

  const priceTable = page.getByRole("table", { name: "Tabla completa de precios" });
  await expect(priceTable).toContainText("$360 MXN");
  await expect(priceTable).toContainText("$350 MXN");
  await expect(priceTable).toContainText("$340 MXN");
  await expect(priceTable).toContainText("$320 MXN");
  await expect(priceTable).toContainText("$310 MXN");
  expect(consoleErrors).toEqual([]);
  await saveEvidence(page, "website-samsung-s8-five-prices.png");
});

test("App uses retail price for one Samsung S8 instead of box price", async ({ page }) => {
  const consoleErrors = captureConsoleErrors(page);
  await page.route("**/api/public/catalog**", (route) => route.fulfill({ json: { products: [] } }));
  await page.route("**/public-stock.json**", (route) => route.fulfill({ json: { products: [] } }));
  await page.goto(`${BASE_URL}/app/#producto/samsung-incell-s8`, { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: /Pantalla Samsung S8$/ })).toBeVisible();
  await expect(page.locator(".price-stack")).toContainText("$360 MXN");
  await page.locator("[data-add-product='samsung-incell-s8']").click();
  await page.goto(`${BASE_URL}/app/#carrito`, { waitUntil: "domcontentloaded" });

  const cartItem = page.locator(".cart-items-page .cart-item", { hasText: "Pantalla Samsung S8" });
  await expect(cartItem).toContainText("$360 MXN");
  await expect(cartItem).not.toContainText("$310 MXN");
  expect(consoleErrors).toEqual([]);
  await saveEvidence(page, "app-samsung-s8-retail-price.png");
});

test("iPhone 11 standard FHD uses the confirmed image on website and App", async ({ page }) => {
  const consoleErrors = captureConsoleErrors(page);
  await page.route("**/api/public/catalog**", (route) => route.fulfill({ json: { products: [] } }));
  await page.route("**/public-stock.json**", (route) => route.fulfill({ json: { products: [] } }));

  await page.goto(`${BASE_URL}/producto/iphone-incell-11/`, { waitUntil: "networkidle" });
  await expect(page.locator("[data-detail-title]")).toHaveText("Pantalla iPhone 11 INCELL FHD");
  await expect(page.locator("[data-detail-quality]")).toHaveText("INCELL FHD");
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
