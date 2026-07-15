const { test, expect } = require("@playwright/test");

const APP_URL = process.env.BASE_URL || "http://127.0.0.1:4173/app/";

const catalog = {
  products: [
    {
      sku: "ERP-CAMPAIGN-QA",
      slug: "erp-campaign-qa",
      public_name_es: "Producto atribución QA",
      brand: "HAODE",
      category: "AI Products",
      quality: "Profesional",
      model: "QA",
      public_price_mxn: 350,
      public_price_tiers: [],
      price_status: "CONFIRMED",
      sales_available: true,
      stock_status: "available",
      stock_label: "Disponible"
    }
  ]
};

test("keeps canonical campaign attribution through navigation and ERP checkout", async ({ page }) => {
  let submitted;
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  await page.addInitScript(() => { window.open = () => null; });
  await page.route("**/api/public/catalog**", (route) => route.fulfill({ json: catalog }));
  await page.route("**/api/public/web-orders", async (route) => {
    submitted = route.request().postDataJSON();
    await route.fulfill({ status: 201, json: { ok: true, order_number: "WEB-CAMPAIGN-QA" } });
  });

  await page.goto(
    `${APP_URL}?utm_source=Instagram&utm_medium=Organic%20Social&utm_campaign=Verano%202026&utm_content=Video%20A#lista`,
    { waitUntil: "domcontentloaded" }
  );
  await expect(page.locator(".product-card", { hasText: "Producto atribución QA" })).toBeVisible();

  await page.goto(`${APP_URL}#lista`, { waitUntil: "domcontentloaded" });
  const card = page.locator(".product-card", { hasText: "Producto atribución QA" });
  await card.getByRole("button", { name: "Agregar" }).click();
  await page.locator("[data-customer-name]").fill("Cliente campaña QA");
  await page.locator("[data-customer-phone]").fill("5512345678");
  await page.locator("[data-customer-city]").fill("CDMX");
  await page.locator("[data-whatsapp-link]").click();

  await expect.poll(() => submitted?.utm_source).toBe("instagram");
  expect(submitted.utm_medium).toBe("organic_social");
  expect(submitted.utm_campaign).toBe("verano_2026");
  expect(submitted.utm_content).toBe("video_a");
  expect(submitted.landing_page).toBe("/app/");
  expect(consoleErrors).toEqual([]);
});
