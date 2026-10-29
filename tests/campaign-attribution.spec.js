const { test, expect } = require("@playwright/test");

const SERVER_URL = (process.env.BASE_URL || "http://127.0.0.1:4173").replace(/\/app\/?$/, "").replace(/\/$/, "");
const APP_URL = `${SERVER_URL}/app/`;

test.beforeEach(async ({ page }) => {
  await page.route("https://www.googletagmanager.com/**", (route) => route.fulfill({
    status: 200,
    contentType: "application/javascript",
    body: "",
  }));
  await page.route("https://www.google-analytics.com/**", (route) => route.fulfill({ status: 204, body: "" }));
});

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
  await page.addInitScript(() => {
    localStorage.setItem("haode-privacy-consent-v1", JSON.stringify({
      version: 1,
      analytics: true,
      advertising: false
    }));
    window.__HAODE_OPENED_URL__ = "";
    window.open = (url) => {
      window.__HAODE_OPENED_URL__ = String(url || "");
      return null;
    };
  });
  await page.route("https://www.googletagmanager.com/**", route => route.fulfill({ contentType: "application/javascript", body: "/* measurement disabled in QA */" }));
  await page.route("**/public-stock.json**", route => route.fulfill({ json: [] }));
  await page.route("**/api/public/catalog**", (route) => route.fulfill({ json: catalog }));
  await page.route("**/api/public/web-orders", async (route) => {
    submitted = route.request().postDataJSON();
    await route.fulfill({ status: 201, json: { ok: true, order_number: "WEB-CAMPAIGN-QA" } });
  });

  await page.goto(
    `${APP_URL}?utm_source=Instagram&utm_medium=Organic%20Social&utm_campaign=Verano%202026&utm_content=Video%20A&utm_term=Pantallas%20Diagn%C3%B3stico%20iPhone#lista`,
    { waitUntil: "domcontentloaded" }
  );
  const approvedCard = page.locator(".product-card").filter({ has: page.locator('[data-add-product="iphone-incell-14"]') });
  await expect(approvedCard).toBeVisible();
  await expect(approvedCard).toContainText("$225");
  await expect(approvedCard).not.toContainText("$999");

  await page.goto(`${APP_URL}#lista`, { waitUntil: "domcontentloaded" });
  const card = page.locator(".product-card").filter({ has: page.locator('[data-add-product="iphone-incell-14"]') });
  await card.getByRole("button", { name: "Agregar" }).click();
  await page.locator("[data-customer-name]").fill("Cliente campaña QA");
  await page.locator("[data-customer-phone]").fill("5512345678");
  await page.locator("[data-customer-city]").fill("CDMX");
  const checkoutState = await page.locator("[data-whatsapp-link]").evaluate((link) => {
    const attribution = window.HaodeCampaign.capture();
    return {
      href: link.href,
      attribution,
      reference: window.HaodeCampaign.reference(attribution)
    };
  });

  expect(checkoutState.href).toBe("https://wa.me/523326684296");
  expect(checkoutState.attribution).toMatchObject({
    source: "instagram",
    medium: "organic_social",
    campaign: "verano_2026",
    content: "video_a",
    term: "pantallas_diagnostico_iphone"
  });
  expect(checkoutState.reference).toBe("instagram/verano_2026/video_a");
  await page.locator("[data-whatsapp-link]").click();

  const openedWhatsappText = await page.evaluate(() => {
    const url = new URL(window.__HAODE_OPENED_URL__);
    return decodeURIComponent(url.searchParams.get("text") || "");
  });
  expect(openedWhatsappText).toContain("Origen: instagram");
  expect(openedWhatsappText).toContain("Referencia: instagram/verano_2026/video_a");

  await expect.poll(() => submitted?.utm_source).toBe("instagram");
  expect(submitted.utm_medium).toBe("organic_social");
  expect(submitted.utm_campaign).toBe("verano_2026");
  expect(submitted.utm_content).toBe("video_a");
  expect(submitted.utm_term).toBe("pantallas_diagnostico_iphone");
  expect(submitted.landing_page).toBe(`${SERVER_URL}/app/`);
  const unexpectedConsoleErrors = consoleErrors.filter((message) => (
    !message.includes("@firebase/firestore") || !message.includes("Could not reach Cloud Firestore backend")
  ));
  expect(unexpectedConsoleErrors).toEqual([]);
});

test("decorates static landing WhatsApp links with the campaign reference", async ({ page }) => {
  await page.goto(
    `${SERVER_URL}/refacciones-celulares-mayoreo-mexico/?utm_source=Google%20Business&utm_medium=Organic&utm_campaign=Mayoreo%20MX&utm_content=Perfil`,
    { waitUntil: "domcontentloaded" }
  );
  const whatsapp = page.getByRole("link", { name: /Enviar lista por WhatsApp/i }).first();
  await expect(whatsapp).toBeVisible();
  const text = await whatsapp.evaluate((link) => new URL(link.href).searchParams.get("text") || "");
  expect(text).toContain("Origen: google_business/mayoreo_mx/perfil");
});

test("decorates new SEO exposure page WhatsApp links with the campaign reference", async ({ page }) => {
  await page.goto(
    `${SERVER_URL}/pantallas-iphone-incell-mayoreo-mexico/?utm_source=Facebook&utm_medium=Organic%20Social&utm_campaign=iPhone%20INCELL&utm_content=Post%201`,
    { waitUntil: "domcontentloaded" }
  );
  const whatsapp = page.getByRole("link", { name: /Cotizar por WhatsApp/i }).first();
  await expect(whatsapp).toBeVisible();
  const text = await whatsapp.evaluate((link) => new URL(link.href).searchParams.get("text") || "");
  expect(text).toContain("Origen: facebook/iphone_incell/post_1");
  expect(text).toContain("stock en México");
  expect(text).toContain("precio por cantidad");
});

for (const [label, storedLanding, expectedPath] of [
  ["legacy path strips query and fragment", "/productos/?email=qa%40example.invalid#private", "/productos/"],
  ["foreign stored URL falls back safely", "https://foreign.invalid/private?phone=5512345678", "/app/"],
  ["malformed stored URL falls back safely", "http://[", "/app/"]
]) {
  test(`ERP brand landing: ${label}`, async ({ page }) => {
    let submitted;
    await page.addInitScript((landingPage) => {
      localStorage.setItem("haode-privacy-consent-v1", JSON.stringify({ version: 1, analytics: true, advertising: false }));
      localStorage.setItem("haode-campaign-attribution-v1", JSON.stringify({ source: "google", medium: "organic_search", landingPage, capturedAt: Date.now() }));
      window.open = () => ({ closed: false, location: { href: "" } });
    }, storedLanding);
    await page.route("**/public-stock.json**", route => route.fulfill({ json: [] }));
    await page.route("**/api/public/catalog**", route => route.fulfill({ json: catalog }));
    await page.route("**/api/public/web-orders", route => {
      submitted = route.request().postDataJSON();
      return route.fulfill({ status: 201, json: { ok: true, order_number: "WEB-LANDING-QA" } });
    });
    await page.goto(`${APP_URL}#lista`, { waitUntil: "domcontentloaded" });
    await page.locator(".product-card").filter({ has: page.locator('[data-add-product="iphone-incell-14"]') }).getByRole("button", { name: "Agregar" }).click();
    await page.locator("[data-customer-name]").fill("Cliente QA aislado");
    await page.locator("[data-customer-phone]").fill("5512345678");
    await page.locator("[data-customer-city]").fill("CDMX");
    await page.locator("[data-whatsapp-link]").click();
    await expect.poll(() => submitted?.landing_page).toBe(`${SERVER_URL}${expectedPath}`);
    expect(submitted.utm_source).toBe("google");
    expect(submitted.utm_medium).toBe("organic_search");
    expect(submitted.landing_page).not.toContain("?");
    expect(submitted.landing_page).not.toContain("#");
  });
}
