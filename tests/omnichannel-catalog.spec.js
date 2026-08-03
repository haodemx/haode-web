const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

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
      sku: "SS-NOTE-10PLUS-OLED-PREM",
      slug: "samsung-oled-note-10-plus",
      public_name_es: "Pantalla Samsung NOTE 10+ OLED PREMIUM",
      brand: "HAODE",
      category: "Samsung OLED",
      quality: "OLED PREMIUM",
      model: "Samsung Note 10 Plus",
      image_url: "",
      public_price_mxn: 1000,
      public_price_tiers: [],
      price_status: "CONFIRMED",
      sales_available: true,
      stock_status: "available",
      stock_label: "Disponible",
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
    },
    {
      sku: "MICA-X200T",
      slug: "mica-x200t",
      public_name_es: "Máquina de Micas X200T",
      brand: "HAODE",
      category: "MICA",
      quality: "",
      model: "Máquina de Micas X200T",
      image_url: "",
      public_price_mxn: 6800,
      public_price_tiers: [],
      price_status: "CONFIRMED",
      sales_available: true,
      stock_status: "available",
      stock_label: "Disponible",
      updated_at: "2026-07-14T12:00:00.000Z"
    }
  ]
};

const APP_LOCAL_ACTIVE_PRODUCT_COUNT = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../app/products.json"), "utf8")
).filter((product) => product.id && product.activo !== false).length;
const websiteProductSandbox = { window: {} };
vm.runInNewContext(
  fs.readFileSync(path.join(__dirname, "../data/products.generated.js"), "utf8"),
  websiteProductSandbox
);
const WEBSITE_LOCAL_PRODUCT_COUNT = websiteProductSandbox.window.HAODE_PRODUCTS_DATA.length;

test("keeps the approved App catalog authoritative and submits an attributed idempotent lead", async ({ page }) => {
  let submitted;
  await page.addInitScript(() => {
    localStorage.setItem("haode-privacy-consent-v1", JSON.stringify({
      version: 1,
      analytics: false,
      advertising: false
    }));
    window.open = () => null;
  });
  await page.route("**/api/public/catalog**", (route) => route.fulfill({ json: catalog }));
  await page.route("**/api/public/web-orders", async (route) => {
    submitted = {
      body: route.request().postDataJSON(),
      idempotencyKey: route.request().headers()["idempotency-key"]
    };
    await route.fulfill({ status: 201, json: { ok: true, order_number: "WEB-QA-1", lead_id: 1 } });
  });

  await page.goto(`${APP_URL}?utm_source=google_business&utm_campaign=omnichannel_2#lista`, { waitUntil: "domcontentloaded" });

  await expect.poll(() => page.evaluate(() => window.HAODE_DIAGNOSTICS?.productosActivos)).toBe(APP_LOCAL_ACTIVE_PRODUCT_COUNT);

  await expect(page.locator(".product-card", { hasText: "Producto ERP exclusivo X200" })).toHaveCount(0);
  await expect(page.locator(".product-card", { hasText: "Producto con precio pendiente" })).toHaveCount(0);
  await expect(page.locator(".product-card", { hasText: "NOTE 10+ OLED PREMIUM" })).toHaveCount(0);

  const approvedCard = page.locator(".product-card", { hasText: "HAODE X200T Cortadora Inteligente de Micas" });
  await expect(approvedCard).toContainText("$6,800");
  await expect(approvedCard).toContainText("$6,500");
  await expect(approvedCard).not.toContainText("$6,700");
  await approvedCard.getByRole("button", { name: "Agregar" }).click();

  await page.locator("[data-customer-name]").fill("Cliente QA");
  await page.locator("[data-customer-phone]").fill("5512345678");
  await page.locator("[data-customer-city]").fill("CDMX");
  await page.locator("[data-whatsapp-link]").click();

  await expect.poll(() => submitted?.body?.product_sku).toBe("x200t-cortadora-micas");
  expect(submitted.body.utm_source).toBe("google_business");
  expect(submitted.body.utm_campaign).toBe("omnichannel_2");
  expect(submitted.idempotencyKey).toBe(submitted.body.client_request_id);

  const mergedIphoneCards = page.locator(".product-card", { hasText: "Pantalla iPhone 14 INCELL FHD" });
  await expect(mergedIphoneCards).toHaveCount(1);

  const g3Card = page.locator(".product-card", { hasText: "Gafas AI G3" });
  await expect(g3Card).toHaveCount(1);
  await expect(g3Card.locator("img")).toHaveAttribute("src", /ai-smart-glasses-aimb-g3-main\.jpeg/);

  const localBolsaCard = page.locator(".product-card", { hasText: "iPhone 11 Bolsa Protectora" });
  await expect(localBolsaCard).toBeVisible();
  await expect(localBolsaCard).toContainText("$160 MXN");

  await page.goto(`${APP_URL}#producto/x200t-cortadora-micas`, { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: /X200T/i })).toBeVisible();
  await expect(page.locator("[data-product-gallery] img").first()).toBeVisible();
  await saveEvidence(page, "app-erp-catalog.png");
});

test("keeps the approved desktop catalog authoritative", async ({ page }) => {
  await page.route("**/api/public/catalog**", (route) => route.fulfill({ json: catalog }));
  await page.goto(`${SERVER_URL}/productos/?utm_source=facebook`, { waitUntil: "domcontentloaded" });

  await expect.poll(() => page.evaluate(() => window.HAODE_PRODUCTS?.length)).toBe(WEBSITE_LOCAL_PRODUCT_COUNT);

  await expect(page.locator(".shop-card", { hasText: "Producto ERP exclusivo X200" })).toHaveCount(0);
  await expect(page.locator(".shop-card", { hasText: "Producto con precio pendiente" })).toHaveCount(0);
  await expect(page.locator(".shop-card", { hasText: "NOTE 10+ OLED PREMIUM" })).toHaveCount(0);

  const g3Card = page.locator(".shop-card", { hasText: "Gafas AI G3" });
  await expect(g3Card).toHaveCount(1);
  await expect(g3Card.locator("img")).toHaveAttribute("src", /ai-smart-glasses-aimb-g3-main\.jpeg/);

  const localBolsaCard = page.locator(".shop-card", { hasText: "Pantalla para iPhone 11 Bolsa Protectora" });
  await expect(localBolsaCard).toBeVisible();
  await expect(localBolsaCard).toContainText("Caja/modelo");
  await expect(localBolsaCard).toContainText("$140 MXN");
  await saveEvidence(page, "website-erp-catalog.png");
});
