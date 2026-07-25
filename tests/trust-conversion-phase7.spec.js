const { test, expect } = require("@playwright/test");

const BASE_URL = (process.env.BASE_URL || "https://haode.com.mx").replace(/\/$/, "");

test.describe("HAODE trust conversion UI phase 7", () => {
  for (const path of ["/garantia/", "/garantia.html"]) {
    test(`${path} shows warranty WhatsApp support path`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`${BASE_URL}${path}`, { waitUntil: "domcontentloaded" });

      await expect(page.locator("body")).toHaveClass(/trust-conversion-page/);
      await expect(page.locator(".topnav a").first()).toBeVisible();
      await expect(page.locator(".reference-conversion-strip").first()).toContainText("Soporte profesional");
      await expect(page.locator('[data-reference-conversion="warranty-trust"]')).toContainText("Consulta garantía");
      await expect(page.locator('[data-reference-conversion="warranty-trust"] a[href*="wa.me"]')).toBeVisible();
      await expect(page.locator(".contact-whatsapp-list")).toContainText("Garantía por WhatsApp");
      await expect(page.locator(".floating-cta")).toBeHidden();
      await expectNoHorizontalOverflow(page);
    });
  }

  test("distributors page emphasizes volume WhatsApp intake", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/distribuidores/`, { waitUntil: "domcontentloaded" });

    await expect(page.locator("body")).toHaveClass(/distributor-conversion-page/);
    await expect(page.locator(".topnav a").first()).toBeVisible();
    await expect(page.locator(".distributor-header-whatsapp")).toBeVisible();
    await expect(page.locator(".distributor-header-whatsapp")).toHaveAttribute("href", /wa\.me/);
    await expect(page.locator(".reference-conversion-strip").first()).toContainText("Precio por cantidad");
    await expect(page.locator('[data-reference-conversion="distributor-trust"]')).toContainText("Solicita distribución");
    await expect(page.locator('[data-reference-conversion="distributor-trust"] a[href*="wa.me"]')).toBeVisible();
    await expectFirstWhatsAppInViewport(page);
    await expectNoHorizontalOverflow(page);
  });
});

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}

async function expectFirstWhatsAppInViewport(page) {
  const isInViewport = await page.locator('a[href*="wa.me"]').first().evaluate((el) => {
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && rect.top < window.innerHeight;
  });
  expect(isInViewport).toBe(true);
}
