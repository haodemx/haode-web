const { test, expect } = require("@playwright/test");

const BASE_URL = (process.env.BASE_URL || "https://haode.com.mx").replace(/\/$/, "");

test.describe("HAODE conversion UI phase 2", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("https://erp.haode.com.mx/**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "[]",
      });
    });
  });

  test("catalog highlights bulk WhatsApp flow without mobile overflow", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`${BASE_URL}/productos/`, { waitUntil: "domcontentloaded" });

    await expect(page.locator(".catalog-whatsapp-panel")).toBeVisible();
    await expect(page.getByRole("link", { name: "Enviar lista por WhatsApp" }).first()).toHaveAttribute("href", /wa\.me/);
    await expect(page.locator(".shop-badge-row").first()).toContainText("WhatsApp privado");
    await expect(page.locator(".catalog-visual-strip")).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/productos/`, { waitUntil: "domcontentloaded" });
    await expect(page.locator(".reference-nav a").first()).toBeVisible();
    await expect(page.locator(".reference-nav-actions a[href*='wa.me']").first()).toBeVisible();
    await expectHeaderWhatsAppGreen(page);
    await expectHeaderAppButtonOrange(page);
    await expectCatalogVisualStrip(page);
    await expect(page.locator(".catalog-whatsapp-panel")).toBeVisible();
    const mobileCta = await page.locator(".floating-cta").evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { position: getComputedStyle(el).position, top: rect.top };
    });
    expect(mobileCta.position).not.toBe("fixed");
    expect(mobileCta.top).toBeGreaterThan(844);
    await expectNoHorizontalOverflow(page);
  });

  test("category page shows unified factory-store cards and list CTA", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`${BASE_URL}/categoria/iphone-incell/`, { waitUntil: "domcontentloaded" });

    await expect(page.locator(".new-product-card").first()).toBeVisible();
    await expect(page.locator(".new-product-badges").first()).toContainText("Precio por cantidad");
    await expect(page.locator("[data-category-whatsapp-panel]")).toBeVisible();
    await expect(page.locator(".category-whatsapp-cta")).toHaveAttribute("href", /wa\.me/);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/categoria/iphone-incell/`, { waitUntil: "domcontentloaded" });
    await expect(page.locator("[data-category-whatsapp-panel]")).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("product detail adds conversion callout and top WhatsApp", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`${BASE_URL}/producto/samsung-incell-s8/`, { waitUntil: "domcontentloaded" });

    await expect(page.locator("[data-detail-conversion]")).toBeVisible();
    await expect(page.locator("[data-detail-conversion]")).toHaveAttribute("data-reference-conversion", "product-detail");
    await expect(page.locator("[data-detail-conversion]")).toContainText("Cotiza este modelo por WhatsApp privado");
    await expect(page.locator("[data-detail-conversion]")).toContainText("Stock en México");
    await expect(page.locator("[data-detail-panel-whatsapp]")).toHaveAttribute("href", /wa\.me/);
    await expect(page.locator("[data-detail-panel-whatsapp]")).toContainText("Cotizar modelo por WhatsApp");
    await expect(page.locator("[data-detail-whatsapp]")).toBeVisible();
    await expect(page.locator("[data-detail-whatsapp]")).toHaveAttribute("href", /wa\.me/);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/producto/samsung-incell-s8/`, { waitUntil: "domcontentloaded" });
    await expect(page.locator(".floating-cta")).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}

async function expectHeaderWhatsAppGreen(page) {
  const background = await page.locator(".reference-nav-actions a[href*='wa.me']").first().evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(background).toBe("rgb(18, 168, 84)");
}

async function expectCatalogVisualStrip(page) {
  const strip = page.locator(".catalog-visual-strip");
  await expect(strip).toBeVisible();
  const details = await strip.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    const images = [...el.querySelectorAll("img")];
    return {
      top: Math.round(rect.top),
      imageCount: images.length,
      imagesLoaded: images.every((img) => img.complete && img.naturalWidth > 0)
    };
  });
  expect(details.top).toBeLessThan(844);
  expect(details.imageCount).toBeGreaterThanOrEqual(3);
  expect(details.imagesLoaded).toBe(true);
}

async function expectHeaderAppButtonOrange(page) {
  const button = page.locator(".reference-nav-actions a[href$='/app/']").first();
  await expect(button).toBeVisible();
  const styles = await button.evaluate((el) => {
    const computed = getComputedStyle(el);
    return {
      background: computed.backgroundColor,
      color: computed.color,
      text: el.textContent.trim()
    };
  });
  expect(styles.text).toContain("Comprar en APP");
  expect(styles.background).toBe("rgb(255, 90, 10)");
  expect(styles.color).toBe("rgb(255, 255, 255)");
}
