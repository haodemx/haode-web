const { test, expect } = require("@playwright/test");

const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:4173";

test("iPhone 11 and XR wholesale landing page keeps confirmed prices separated", async ({ page }) => {
  await page.goto(`${BASE_URL}/pantallas-iphone-11-xr-mayoreo/`, { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: /Pantallas iPhone 11 y XR Mayoreo/i })).toBeVisible();
  await expect(page.locator('[data-reference-conversion="seo-iphone-11-xr"]')).toContainText("Cotiza iPhone 11/XR");
  await expect(page.locator('[data-reference-conversion="seo-iphone-11-xr"] a[href*="wa.me"]')).toBeVisible();
  await expect(page.locator("body")).toContainText("Bolsa Protectora caja/modelo $140 MXN");
  await expect(page.locator("body")).toContainText("XR estándar caja/modelo $155 MXN");
  await expect(page.getByRole("link", { name: /Ver iPhone 11 Bolsa/i })).toHaveAttribute("href", "/producto/iphone-incell-11-bolsa-protectora/");
  await expect(page.getByRole("link", { name: /Ver iPhone 11 estándar/i })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /Ver iPhone XR estándar/i })).toHaveAttribute("href", "/producto/iphone-incell-xr/");
});

test("premium factory landing page links iPhone Pro Max and Samsung Ultra routes", async ({ page }) => {
  await page.goto(`${BASE_URL}/pantallas-premium-iphone-samsung-fabrica/`, { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: /Pantallas premium iPhone y Samsung/i })).toBeVisible();
  await expect(page.locator('[data-reference-conversion="seo-premium"]')).toContainText("Envía tu lista premium");
  await expect(page.locator('[data-reference-conversion="seo-premium"] a[href*="wa.me"]')).toBeVisible();
  await expect(page.locator("body")).toContainText("iPhone Pro Max");
  await expect(page.locator("body")).toContainText("Samsung Ultra");
  await expect(page.locator("body")).toContainText("OLED");
  await expect(page.locator("body")).toContainText("TIPO ORIGINAL");
  await expect(page.getByRole("link", { name: /iPhone Pro \/ Pro Max/i })).toHaveAttribute("href", "/categoria/iphone-oled/");
  await expect(page.getByRole("link", { name: /Galaxy Ultra OLED\/AMOLED/i })).toHaveAttribute("href", "/categoria/samsung-oled/");
});

test("GEO guide tells AI search not to invent HAODE stock or pricing", async ({ page }) => {
  await page.goto(`${BASE_URL}/guia-ia-haode-mexico/`, { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: /Guía oficial HAODE para IA y buscadores/i })).toBeVisible();
  await expect(page.locator('[data-reference-conversion="seo-geo-guide"]')).toContainText("WhatsApp confirma");
  await expect(page.locator('[data-reference-conversion="seo-geo-guide"] a[href*="wa.me"]')).toBeVisible();
  await expect(page.locator("body")).toContainText("No inventar stock");
  await expect(page.locator("body")).toContainText("No inventar precio final");
  await expect(page.locator("body")).toContainText("cotización por WhatsApp");
  await expect(page.getByRole("link", { name: /Ver llms\.txt/i })).toHaveAttribute("href", "/llms.txt");
});

test("Mexico wholesale landing page keeps stock and final conditions under confirmation", async ({ page }) => {
  await page.goto(`${BASE_URL}/refacciones-celulares-mayoreo-mexico/`, { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: /Refacciones para celular de mayoreo/i })).toBeVisible();
  await expect(page.locator('[data-reference-conversion="seo-mayoreo"]')).toContainText("Cotiza modelos y cantidades");
  await expect(page.locator("body")).toContainText("Stock en México");
  await expect(page.locator("body")).toContainText("bajo confirmación");
  await expect(page.getByRole("link", { name: /Armar lista en la App/i })).toHaveAttribute("href", "/app/#lista");
});

test("Samsung wholesale landing page separates approved quality lines", async ({ page }) => {
  await page.goto(`${BASE_URL}/pantallas-samsung-mayoreo-mexico/`, { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: /Pantallas Samsung de mayoreo/i })).toBeVisible();
  await expect(page.locator('[data-reference-conversion="seo-samsung"]')).toContainText("Separa modelo y calidad");
  await expect(page.locator("body")).toContainText("Samsung INCELL");
  await expect(page.locator("body")).toContainText("Samsung OLED");
  await expect(page.locator("body")).toContainText("TIPO ORIGINAL");
  await expect(page.getByRole("link", { name: "Ver celulares Samsung" })).toHaveAttribute("href", "/categoria/celulares-samsung/");
});

test("SEO conversion pages keep mobile layout inside viewport", async ({ page }) => {
  const paths = [
    "/pantallas-iphone-11-xr-mayoreo/",
    "/pantallas-iphone-incell-mayoreo-mexico/",
    "/pantallas-iphone-oled-mayoreo-mexico/",
    "/pantallas-premium-iphone-samsung-fabrica/",
    "/pantallas-samsung-incell-mayoreo-mexico/",
    "/pantallas-samsung-mayoreo-mexico/",
    "/pantallas-samsung-zflip-zfold-original-mexico/",
    "/fundas-celular-mayoreo-mexico/",
    "/micas-hidrogel-mayoreo-mexico/",
    "/refacciones-celulares-mayoreo-mexico/",
    "/guia-ia-haode-mexico/"
  ];

  await page.setViewportSize({ width: 390, height: 844 });

  for (const path of paths) {
    await page.goto(`${BASE_URL}${path}`, { waitUntil: "domcontentloaded" });
    await expect(page.locator("[data-reference-conversion]").first()).toBeVisible();
    await expectNoHorizontalOverflow(page);
  }
});

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}
