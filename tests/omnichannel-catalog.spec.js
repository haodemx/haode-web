const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const SERVER_URL = (process.env.BASE_URL || "http://127.0.0.1:4173").replace(/\/app\/?$/, "").replace(/\/$/, "");
const APP_URL = `${SERVER_URL}/app/`;

async function saveEvidence(page, fileName) {
  if (!process.env.SCREENSHOT_DIR) return;
  const directory = path.resolve(process.env.SCREENSHOT_DIR);
  fs.mkdirSync(directory, { recursive: true });
  await page.screenshot({ path: path.join(directory, fileName), fullPage: true });
}

const catalog = {
  schema_version: "2.0",
  generated_at: "2026-07-14T12:00:00.000Z",
  products: [
    {
      sku: "ERP-ONLY-X200",
      slug: "erp-only-x200",
      public_name_es: "Producto ERP exclusivo X200",
      brand: "HAODE",
      category: "AI Products",
      quality: "Profesional",
      model: "X200",
      image_url: "",
      public_price_mxn: 999,
      public_price_tiers: [],
      price_status: "CONFIRMED",
      sales_available: true,
      stock_status: "available",
      stock_label: "Disponible",
      updated_at: "2026-07-14T12:00:00.000Z"
    },
    {
      sku: "ERP-PENDING-PRICE",
      slug: "erp-pending-price",
      public_name_es: "Producto con precio pendiente",
      brand: "HAODE",
      category: "AI Products",
      quality: "Profesional",
      model: "Pendiente",
      image_url: "",
      public_price_mxn: null,
      public_price_tiers: [],
      price_status: "PRICE_PENDING",
      sales_available: false,
      stock_status: "ask_stock",
      stock_label: "Consultar inventario",
      updated_at: "2026-07-14T12:00:00.000Z"
    },
    {
      sku: "x200t-cortadora-micas",
      slug: "x200t-cortadora-micas",
      public_name_es: "HAODE X200T Cortadora Inteligente de Micas",
      brand: "HAODE",
      category: "Máquinas de Mica",
      quality: "Profesional",
      model: "X200T",
      image_url: "",
      public_price_mxn: 6700,
      public_price_tiers: [],
      price_status: "CONFIRMED",
      sales_available: true,
      stock_status: "available",
      stock_label: "Disponible",
      updated_at: "2026-07-14T12:00:00.000Z"
    },
    {
      sku: "IP-14-INCELL-FHD",
      slug: "pantalla-iphone-14-incell-fhd",
      public_name_es: "Pantalla iPhone 14 INCELL FHD",
      brand: "HAODE",
      category: "iPhone INCELL",
      quality: "INCELL FHD",
      model: "iPhone 14",
      image_url: "",
      public_price_mxn: 260,
      public_price_tiers: [],
      price_status: "CONFIRMED",
      sales_available: true,
      stock_status: "available",
      stock_label: "Disponible",
      updated_at: "2026-07-14T12:00:00.000Z"
    },
    {
      sku: "AI-GAFAS-G3",
      slug: "gafas-ai-g3",
      public_name_es: "Gafas AI G3",
      brand: "HAODE",
      category: "Productos AI",
      quality: "Gafas AI",
      model: "",
      image_url: "",
      public_price_mxn: 1700,
      public_price_tiers: [],
      price_status: "CONFIRMED",
      sales_available: true,
      stock_status: "available",
      stock_label: "Disponible",
      updated_at: "2026-07-14T12:00:00.000Z"
    }
  ]
};

test("merges ERP-only SKUs and submits an attributed idempotent lead", async ({ page }) => {
  let submitted;
  await page.addInitScript(() => { window.open = () => null; });
  await page.route("**/api/public/catalog**", (route) => route.fulfill({ json: catalog }));
  await page.route("**/api/public/web-orders", async (route) => {
    submitted = {
      body: route.request().postDataJSON(),
      idempotencyKey: route.request().headers()["idempotency-key"]
    };
    await route.fulfill({ status: 201, json: { ok: true, order_number: "WEB-QA-1", lead_id: 1 } });
  });

  await page.goto(`${APP_URL}?utm_source=google_business&utm_campaign=omnichannel_2#lista`, { waitUntil: "domcontentloaded" });

  await expect.poll(() => page.evaluate(() => window.HAODE_DIAGNOSTICS?.productosActivos)).toBe(catalog.products.length);

  const availableCard = page.locator(".product-card", { hasText: "Producto ERP exclusivo X200" });
  await expect(availableCard).toBeVisible();
  await expect(availableCard).toContainText("$999");
  await availableCard.getByRole("button", { name: "Agregar" }).click();

  await page.locator("[data-customer-name]").fill("Cliente QA");
  await page.locator("[data-customer-phone]").fill("5512345678");
  await page.locator("[data-customer-city]").fill("CDMX");
  await page.locator("[data-whatsapp-link]").click();

  await expect.poll(() => submitted?.body?.product_sku).toBe("ERP-ONLY-X200");
  expect(submitted.body.utm_source).toBe("google_business");
  expect(submitted.body.utm_campaign).toBe("omnichannel_2");
  expect(submitted.idempotencyKey).toBe(submitted.body.client_request_id);

  const pendingCard = page.locator(".product-card", { hasText: "Producto con precio pendiente" });
  await expect(pendingCard).toBeVisible();
  await expect(pendingCard.getByRole("button")).toBeDisabled();
  await expect(pendingCard.getByRole("button")).toHaveText("Consultar");

  const syncedCard = page.locator(".product-card", { hasText: "HAODE X200T Cortadora Inteligente de Micas" });
  await expect(syncedCard).toContainText("$6,800");
  await expect(syncedCard).toContainText("$6,500");
  await expect(syncedCard).not.toContainText("$6,700");

  const mergedIphoneCards = page.locator(".product-card", { hasText: "Pantalla iPhone 14 INCELL FHD" });
  await expect(mergedIphoneCards).toHaveCount(1);

  const g3Card = page.locator(".product-card", { hasText: "Gafas AI G3" });
  await expect(g3Card).toHaveCount(1);
  await expect(g3Card.locator("img")).toHaveAttribute("src", /ai-smart-glasses-aimb-g3-main\.jpeg/);
  await saveEvidence(page, "app-erp-catalog.png");
});

test("shows ERP-only products in the desktop catalog", async ({ page }) => {
  await page.route("**/api/public/catalog**", (route) => route.fulfill({ json: catalog }));
  await page.goto("http://127.0.0.1:4173/productos/?utm_source=facebook", { waitUntil: "domcontentloaded" });

  await expect.poll(() => page.evaluate(() => window.HAODE_PRODUCTS?.length)).toBe(catalog.products.length);

  const productCard = page.locator(".shop-card", { hasText: "Producto ERP exclusivo X200" });
  await expect(productCard).toBeVisible();
  await expect(productCard.getByRole("link", { name: "Cotizar por WhatsApp" })).toHaveAttribute("href", /ERP-ONLY-X200/);

  const pendingCard = page.locator(".shop-card", { hasText: "Producto con precio pendiente" });
  await expect(pendingCard).toBeVisible();
  await expect(pendingCard).toHaveAttribute("data-sales-available", "false");
  await expect(pendingCard).toContainText("Precio pendiente de confirmación");
  await expect(pendingCard.getByRole("link", { name: "Consultar por WhatsApp" })).toHaveAttribute("href", /ERP-PENDING-PRICE/);

  const g3Card = page.locator(".shop-card", { hasText: "Gafas AI G3" });
  await expect(g3Card).toHaveCount(1);
  await expect(g3Card.locator("img")).toHaveAttribute("src", /ai-smart-glasses-aimb-g3-main\.jpeg/);
  await saveEvidence(page, "website-erp-catalog.png");
});
