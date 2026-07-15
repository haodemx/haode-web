const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const APP_URL = process.env.BASE_URL || "http://127.0.0.1:4173/app/";

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
  await saveEvidence(page, "app-erp-catalog.png");
});

test("shows ERP-only products in the desktop catalog", async ({ page }) => {
  await page.route("**/api/public/catalog**", (route) => route.fulfill({ json: catalog }));
  await page.goto("http://127.0.0.1:4173/productos/?utm_source=facebook", { waitUntil: "domcontentloaded" });

  const productCard = page.locator(".shop-card", { hasText: "Producto ERP exclusivo X200" });
  await expect(productCard).toBeVisible();
  await expect(productCard.getByRole("link", { name: "Cotizar por WhatsApp" })).toHaveAttribute("href", /ERP-ONLY-X200/);
  await saveEvidence(page, "website-erp-catalog.png");
});
