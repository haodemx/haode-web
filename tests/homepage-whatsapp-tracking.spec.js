const { test, expect } = require("@playwright/test");

const BASE_URL = (process.env.BASE_URL || "http://127.0.0.1:4173").replace(/\/$/, "");

test("homepage WhatsApp CTA sends one GA4 contact event", async ({ page }) => {
  await page.goto(`${BASE_URL}/?utm_source=google`, { waitUntil: "domcontentloaded" });

  await page.evaluate(() => {
    window.__haodeTrackedEvents = [];
    window.gtag = (...args) => window.__haodeTrackedEvents.push(args);
    document.addEventListener("click", (event) => {
      if (event.target.closest('a[href*="wa.me"]')) event.preventDefault();
    }, true);
  });

  await page.locator('a[href*="wa.me"]').first().click();

  await expect.poll(() => page.evaluate(() => (
    window.__haodeTrackedEvents.filter((event) => event[0] === "event" && event[1] === "contact").length
  ))).toBe(1);
  const event = await page.evaluate(() => (
    window.__haodeTrackedEvents.find((entry) => entry[0] === "event" && entry[1] === "contact")
  ));
  expect(event[0]).toBe("event");
  expect(event[1]).toBe("contact");
  expect(event[2]).toEqual(expect.objectContaining({
    method: "whatsapp",
    source: "google",
    page_path: "/",
    contact_area: "site_link",
  }));
  expect(JSON.stringify(event)).not.toContain("quiero");
});

test("product catalog keeps product WhatsApp tracking as the single contact source", async ({ page }) => {
  await page.goto(`${BASE_URL}/productos/?utm_source=facebook`, { waitUntil: "domcontentloaded" });

  await page.evaluate(() => {
    window.__haodeTrackedEvents = [];
    window.gtag = (...args) => window.__haodeTrackedEvents.push(args);
    document.addEventListener("click", (event) => {
      if (event.target.closest('a[href*="wa.me"]')) event.preventDefault();
    }, true);
  });

  await page.getByRole("link", { name: /Cotizar por WhatsApp/i }).first().click();

  await expect.poll(() => page.evaluate(() => (
    window.__haodeTrackedEvents.filter((event) => event[0] === "event" && event[1] === "contact").length
  ))).toBe(1);
  const event = await page.evaluate(() => (
    window.__haodeTrackedEvents.find((entry) => entry[0] === "event" && entry[1] === "contact")
  ));
  expect(event[0]).toBe("event");
  expect(event[1]).toBe("contact");
  expect(event[2]).toEqual(expect.objectContaining({
    method: "whatsapp",
    source: "facebook",
  }));
});
