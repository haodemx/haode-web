const { test, expect } = require("@playwright/test");

const BASE_URL = (process.env.BASE_URL || "https://haode.com.mx").replace(/\/$/, "");

test.describe("HAODE legacy AI conversion UI phase 6", () => {
  test("legacy AI list page shows bulk WhatsApp path", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`${BASE_URL}/ai-productos.html`, { waitUntil: "domcontentloaded" });

    await expect(page.locator("body")).toHaveClass(/ai-legacy-reference-page/);
    await expect(page.locator(".reference-conversion-strip").first()).toContainText("Stock en México");
    await expect(page.locator('[data-reference-conversion="ai-legacy-list"]')).toContainText("Envía tu lista AI");
    await expect(page.locator('[data-reference-conversion="ai-legacy-list"] a[href*="wa.me"]')).toBeVisible();
    await expect(page.locator(".floating-cta")).toBeHidden();
    await expectNoHorizontalOverflow(page);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/ai-productos.html`, { waitUntil: "domcontentloaded" });
    await expect(page.locator(".topnav a").first()).toBeVisible();
    await expect(page.locator('[data-reference-conversion="ai-legacy-list"]')).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  for (const path of ["/ai-smart-glasses-s1.html", "/ai-smart-glasses-aimb-g3.html", "/ai-mouse.html"]) {
    test(`${path} keeps AI product conversion prompts without overflow`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`${BASE_URL}${path}`, { waitUntil: "domcontentloaded" });

      await expect(page.locator("body")).toHaveClass(/ai-detail-reference-page/);
      await expect(page.locator(".topnav a").first()).toBeVisible();
      await expect(page.locator(".reference-conversion-strip").first()).toContainText("WhatsApp privado");
      await expect(page.locator(".new-page-hero-inner a[href*='wa.me']").first()).toBeVisible();
      await expect(page.locator(".floating-cta")).toBeHidden();
      await expectNoHorizontalOverflow(page);
    });
  }
});

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}
