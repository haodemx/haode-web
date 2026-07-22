const { test, expect } = require("@playwright/test");

const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:4173";

test("iPhone 11 and XR wholesale landing page keeps confirmed prices separated", async ({ page }) => {
  await page.goto(`${BASE_URL}/pantallas-iphone-11-xr-mayoreo/`, { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: /Pantallas iPhone 11 y XR Mayoreo/i })).toBeVisible();
  await expect(page.locator("body")).toContainText("Bolsa Protectora caja/modelo $140 MXN");
  await expect(page.locator("body")).toContainText("XR estándar caja/modelo $155 MXN");
  await expect(page.getByRole("link", { name: /Ver iPhone 11 Bolsa/i })).toHaveAttribute("href", "/producto/iphone-incell-11-bolsa-protectora/");
  await expect(page.getByRole("link", { name: /Ver iPhone 11 estándar/i })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /Ver iPhone XR estándar/i })).toHaveAttribute("href", "/producto/iphone-incell-xr/");
});

test("premium factory landing page links iPhone Pro Max and Samsung Ultra routes", async ({ page }) => {
  await page.goto(`${BASE_URL}/pantallas-premium-iphone-samsung-fabrica/`, { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: /Pantallas premium iPhone y Samsung/i })).toBeVisible();
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
  await expect(page.locator("body")).toContainText("No inventar stock");
  await expect(page.locator("body")).toContainText("No inventar precio final");
  await expect(page.locator("body")).toContainText("cotización por WhatsApp");
  await expect(page.getByRole("link", { name: /Ver llms\.txt/i })).toHaveAttribute("href", "/llms.txt");
});
