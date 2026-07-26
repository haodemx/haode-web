const { test, expect } = require("@playwright/test");

const SERVER_URL = (process.env.BASE_URL || "http://127.0.0.1:4173").replace(/\/app\/?$/, "").replace(/\/$/, "");
const APP_URL = `${SERVER_URL}/app/`;

const catalog = {
  products: [
    {
      sku: "IP-14-INCELL-FHD",
      slug: "pantalla-iphone-14-incell-fhd",
      public_name_es: "Pantalla iPhone 14 INCELL FHD",
      brand: "HAODE",
      category: "iPhone INCELL",
      quality: "INCELL FHD",
      model: "iPhone 14",
      public_price_mxn: 999,
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
  const approvedCard = page.locator(".product-card", { hasText: "Pantalla iPhone 14 INCELL FHD" });
  await expect(approvedCard).toBeVisible();
  await expect(approvedCard).toContainText("$260");
  await expect(approvedCard).not.toContainText("$999");

  await page.goto(`${APP_URL}#lista`, { waitUntil: "domcontentloaded" });
  const card = page.locator(".product-card", { hasText: "Pantalla iPhone 14 INCELL FHD" });
  await card.getByRole("button", { name: "Agregar" }).click();
  await page.locator("[data-customer-name]").fill("Cliente campaña QA");
  await page.locator("[data-customer-phone]").fill("5512345678");
  await page.locator("[data-customer-city]").fill("CDMX");
  const whatsappText = await page.locator("[data-whatsapp-link]").evaluate((link) => {
    const url = new URL(link.href);
    return decodeURIComponent(url.searchParams.get("text") || "");
  });

  expect(whatsappText).toContain("Origen: instagram");
  expect(whatsappText).toContain("Referencia: instagram/verano_2026/video_a");
  await page.locator("[data-whatsapp-link]").click();

  await expect.poll(() => submitted?.utm_source).toBe("instagram");
  expect(submitted.utm_medium).toBe("organic_social");
  expect(submitted.utm_campaign).toBe("verano_2026");
  expect(submitted.utm_content).toBe("video_a");
  expect(submitted.landing_page).toBe("/app/");
  const unexpectedConsoleErrors = consoleErrors.filter((message) => (
    !message.includes("@firebase/firestore") || !message.includes("Could not reach Cloud Firestore backend")
  ));
  expect(unexpectedConsoleErrors).toEqual([]);
});
