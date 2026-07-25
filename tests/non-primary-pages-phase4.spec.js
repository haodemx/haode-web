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
      panel: "productos-ai",
      text: "Cotiza Productos AI por WhatsApp privado",
      cta: "Enviar lista AI"
    },
    {
      path: "/contacto/",
      panel: "contacto",
      text: "Lista grande, precio por cantidad y respuesta privada",
      cta: "Enviar lista"
    }
  ];

  for (const pageCase of pages) {
    test(`${pageCase.path} shows unified WhatsApp conversion panel`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto(`${BASE_URL}${pageCase.path}`, { waitUntil: "domcontentloaded" });

      const panel = page.locator(`[data-reference-conversion="${pageCase.panel}"]`);
      await expect(panel).toBeVisible();
      await expect(panel).toContainText(pageCase.text);
      await expect(panel).toContainText("México");
      await expect(panel.getByRole("link", { name: pageCase.cta })).toHaveAttribute("href", /wa\.me/);
      await expectNoHorizontalOverflow(page);

      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`${BASE_URL}${pageCase.path}`, { waitUntil: "domcontentloaded" });
      await expect(page.locator(".reference-nav a").first()).toBeVisible();
      await expect(page.locator(".reference-nav-actions a[href*='wa.me']").first()).toBeVisible();
      await expectHeaderWhatsAppGreen(page);
      await expectHeaderHeightAtMost(page, ".reference-header", 190);
      await expect(page.locator(`[data-reference-conversion="${pageCase.panel}"]`)).toBeVisible();
      if (pageCase.path === "/contacto/") {
        await expectContactPanelCtaInView(page);
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
  const background = await page.locator(".reference-nav-actions a[href*='wa.me']").first().evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(background).toBe("rgb(18, 168, 84)");
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
