const { test, expect } = require("@playwright/test");

const BASE_URL = (process.env.BASE_URL || "https://haode.com.mx").replace(/\/$/, "");

test.describe("HAODE secondary pages conversion UI phase 4", () => {
  const pages = [
    {
      path: "/categoria/",
      panel: "category-hub",
      text: "Envíanos tu lista grande por WhatsApp privado",
      cta: "Enviar lista"
    },
    {
      path: "/productos-ai/",
      zay: true,
      surface: ".zay-shell",
      text: "Productos AI confirmados",
      cta: "Cotizar por WhatsApp"
    },
    {
      path: "/contacto/",
      zay: true,
      surface: "body",
      text: "Contacto oficial",
      cta: "Abrir WhatsApp"
    }
  ];

  for (const pageCase of pages) {
    test(`${pageCase.path} shows unified WhatsApp conversion panel`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto(`${BASE_URL}${pageCase.path}`, { waitUntil: "domcontentloaded" });

      const panel = pageCase.zay
        ? page.locator(pageCase.surface)
        : page.locator(`[data-reference-conversion="${pageCase.panel}"]`);
      await expect(panel).toBeVisible();
      await expect(panel).toContainText(pageCase.text);
      await expect(panel.locator('a[href*="wa.me"]').first()).toHaveAttribute("href", /wa\.me/);
      await expectNoHorizontalOverflow(page);

      await page.setViewportSize({ width: 360, height: 844 });
      await page.goto(`${BASE_URL}${pageCase.path}`, { waitUntil: "domcontentloaded" });
      await expect(page.locator(".zay-menu-button")).toBeVisible();
      await expect(page.locator(".zay-floating")).toBeVisible();
      await page.locator(".zay-menu-button").click();
      await expect(page.locator(".zay-nav a").first()).toBeVisible();
      await expect(page.locator(".zay-floating")).toBeVisible();
      await expectHeaderWhatsAppGreen(page);
      await expectHeaderHeightAtMost(page, ".zay-header", 200);
      await page.locator(".zay-menu-button").click();
      await expect(panel).toBeVisible();
      if (pageCase.path === "/categoria/") {
        await expectFirstCategoryCardStartsInView(page);
      }
      await expectNoHorizontalOverflow(page);
    });
  }
});

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}

async function expectHeaderHeightAtMost(page, selector, maxHeight) {
  const height = await page.locator(selector).first().evaluate((el) => Math.round(el.getBoundingClientRect().height));
  expect(height).toBeLessThanOrEqual(maxHeight);
}

async function expectHeaderWhatsAppGreen(page) {
  const background = await page.locator(".zay-floating").evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(background).toBe("rgb(21, 154, 85)");
}

async function expectContactPanelCtaInView(page) {
  const layout = await page.evaluate(() => {
    const cta = document.querySelector('[data-reference-conversion="contacto"] .reference-btn-whatsapp')?.getBoundingClientRect();
    return {
      top: Math.round(cta?.top || 0),
      bottom: Math.round(cta?.bottom || 0),
    };
  });

  expect(layout.top).toBeGreaterThanOrEqual(0);
  expect(layout.bottom).toBeLessThanOrEqual(844);
}

async function expectDarkConversionStrip(page, selector) {
  const color = await page.locator(`${selector} strong`).first().evaluate((el) => getComputedStyle(el).color);
  expect(color).toBe("rgb(255, 255, 255)");
}

async function expectFirstCategoryCardStartsInView(page) {
  const top = await page.locator(".home-category-card").first().evaluate((el) => Math.round(el.getBoundingClientRect().top));
  expect(top).toBeGreaterThanOrEqual(0);
  expect(top).toBeLessThan(844);
}
