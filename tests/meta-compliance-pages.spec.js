const { test, expect } = require("@playwright/test");

const BASE_URL = (process.env.BASE_URL || "http://127.0.0.1:4173").replace(/\/$/, "");

const pages = [
  {
    path: "/privacidad/",
    heading: "Aviso de privacidad",
    canonical: "https://haode.com.mx/privacidad/",
  },
  {
    path: "/eliminacion-de-datos/",
    heading: "Eliminación de datos",
    canonical: "https://haode.com.mx/eliminacion-de-datos/",
  },
];

for (const compliancePage of pages) {
  test(`${compliancePage.heading} is public-ready on desktop`, async ({ page }) => {
    await page.goto(`${BASE_URL}${compliancePage.path}`, { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { name: compliancePage.heading })).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", compliancePage.canonical);
    await expect(page.locator('a[href^="mailto:ventas@haode.com.mx"]')).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
}

test("Meta compliance pages remain usable on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  for (const compliancePage of pages) {
    await page.goto(`${BASE_URL}${compliancePage.path}`, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: compliancePage.heading })).toBeVisible();
    await expect(page.locator('a[href^="mailto:ventas@haode.com.mx"]')).toBeVisible();
    await expectNoHorizontalOverflow(page);
  }
});

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
}
