const { test, expect } = require("@playwright/test");

const BASE_URL = (process.env.BASE_URL || "http://127.0.0.1:4173").replace(/\/$/, "");
const CONSENT_KEY = "haode-privacy-consent-v1";

test.beforeEach(async ({ page }) => {
  await page.route("https://www.googletagmanager.com/**", (route) => route.fulfill({
    status: 200,
    contentType: "application/javascript",
    body: "",
  }));
  await page.route("https://www.google-analytics.com/**", (route) => route.fulfill({ status: 204, body: "" }));
});

function eventByName(events, name) {
  return events.find((event) => event.name === name);
}

test("App emits the consented GA4 product-to-lead funnel with item data", async ({ page }) => {
  await page.addInitScript((consentKey) => {
    localStorage.setItem(consentKey, JSON.stringify({
      version: 1,
      analytics: true,
      advertising: false,
    }));
    window.open = () => null;
  }, CONSENT_KEY);
  await page.route("https://erp.haode.com.mx/api/public/web-orders", async (route) => {
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({ order_number: "QA-GA4-LOCAL" }),
    });
  });

  await page.goto(`${BASE_URL}/app/#producto/iphone-incell-14`, { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-add-product]").first()).toBeVisible({ timeout: 15000 });
  await page.locator("[data-add-product]").first().click();
  await page.locator("[data-customer-name]").fill("Cliente GA4 QA");
  await page.locator("[data-customer-phone]").fill("5512345678");
  await page.locator("[data-customer-city]").fill("CDMX");
  await page.locator("[data-whatsapp-link]").click();
  await page.waitForFunction(() => Array.from(window.dataLayer || []).some((entry) => (
    Array.from(entry)[0] === "event" && Array.from(entry)[1] === "generate_lead"
  )));

  const events = await page.evaluate(() => (window.dataLayer || [])
    .map((entry) => Array.from(entry))
    .filter((entry) => entry[0] === "event")
    .map((entry) => ({ name: entry[1], parameters: entry[2] })));

  for (const eventName of ["view_item", "add_to_cart", "view_cart", "begin_checkout", "generate_lead"]) {
    const event = eventByName(events, eventName);
    expect(event, `${eventName} should be emitted`).toBeTruthy();
    expect(event.parameters).toMatchObject({ currency: "MXN" });
    expect(event.parameters.items).toHaveLength(1);
    expect(event.parameters.items[0]).toMatchObject({
      item_brand: "HAODE",
      quantity: 1,
    });
    expect(event.parameters.items[0].item_id).toBeTruthy();
    expect(event.parameters.items[0].item_name).toBeTruthy();
    expect(event.parameters.items[0].price).toBeGreaterThan(0);
  }
});

test("custom conversion events stay blocked without analytics consent", async ({ page }) => {
  await page.addInitScript((consentKey) => {
    localStorage.setItem(consentKey, JSON.stringify({
      version: 1,
      analytics: false,
      advertising: false,
    }));
  }, CONSENT_KEY);
  await page.goto(`${BASE_URL}/?utm_source=google`, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    const link = document.querySelector('a[href*="wa.me"]');
    link.addEventListener("click", (event) => event.preventDefault(), { once: true });
    link.click();
  });

  const customEvents = await page.evaluate(() => (window.dataLayer || [])
    .map((entry) => Array.from(entry))
    .filter((entry) => entry[0] === "event")
    .map((entry) => entry[1]));
  expect(customEvents).not.toContain("contact");
  expect(customEvents).not.toContain("whatsapp_click");
});
