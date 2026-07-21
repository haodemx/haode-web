const { test, expect } = require("@playwright/test");

const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:4173";

test("iPhone 11 and XR wholesale landing page keeps confirmed prices separated", async ({ page }) => {
  await page.goto(`${BASE_URL}/pantallas-iphone-11-xr-mayoreo/`, { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: /Pantallas iPhone 11 y XR Mayoreo/i })).toBeVisible();
  await expect(page.locator("body")).toContainText("Bolsa Protectora caja/modelo $140 MXN");
  await expect(page.locator("body")).toContainText("Versión estándar caja/modelo $155 MXN");
  await expect(page.getByRole("link", { name: /Ver iPhone 11 Bolsa/i })).toHaveAttribute("href", "/producto/iphone-incell-11-bolsa-protectora/");
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
