const { test, expect } = require("@playwright/test");

const BASE_URL = (process.env.BASE_URL || "https://haode.com.mx").replace(/\/$/, "");

test.describe("HAODE trust conversion UI phase 7", () => {
  for (const path of ["/garantia/", "/garantia.html"]) {
    test(`${path} shows warranty WhatsApp support path`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`${BASE_URL}${path}`, { waitUntil: "domcontentloaded" });

      await expect(page.locator("body")).toHaveClass(/trust-conversion-page/);
      await expect(page.locator(".topnav a").first()).toBeVisible();
      await expectCompactTrustBrand(page);
      await expectHeaderHeightAtMost(page, ".topbar", 130);
      await expect(page.locator(".reference-conversion-strip").first()).toContainText("Garantía local");
      await expect(page.locator(".reference-conversion-strip").first()).toContainText("Stock en México");
      await expect(page.locator(".reference-conversion-strip").first()).toContainText("Soporte profesional");
      await expectDarkConversionStrip(page, ".reference-conversion-strip");
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
    await expectCompactTrustBrand(page);
    await expect(page.locator(".distributor-header-whatsapp")).toBeVisible();
    await expect(page.locator(".distributor-header-whatsapp")).toHaveAttribute("href", /wa\.me/);
    await expectHeaderHeightAtMost(page, ".site-header", 175);
    await expect(page.locator(".reference-conversion-strip").first()).toContainText("Fábrica directa");
    await expect(page.locator(".reference-conversion-strip").first()).toContainText("Stock en México");
    await expect(page.locator(".reference-conversion-strip").first()).toContainText("Precio por cantidad");
    await expectDarkConversionStrip(page, ".reference-conversion-strip");
    await expect(page.locator('[data-reference-conversion="distributor-trust"]')).toContainText("Solicita distribución");
    await expect(page.locator('[data-reference-conversion="distributor-trust"] a[href*="wa.me"]')).toBeVisible();
    await expectFirstWhatsAppInViewport(page);
    await expectDistributorHeroWhatsAppInViewport(page);
    await expectNoHorizontalOverflow(page);
  });
});

async function expectCompactTrustBrand(page) {
  await page.waitForFunction(() => {
    const logo = document.querySelector(".brand-logo");
    return Boolean(logo)
      && getComputedStyle(logo).display === "block"
      && logo.getBoundingClientRect().width >= 118;
  });

  const layout = await page.evaluate(() => {
    const brand = document.querySelector(".brand")?.getBoundingClientRect();
    const logo = document.querySelector(".brand-logo");
    const brandCopy = document.querySelector(".brand-copy");
    const brandText = document.querySelector(".brand-text");

    return {
      brandLeft: Math.round(brand?.left || 0),
      brandWidth: Math.round(brand?.width || 0),
      logoDisplay: logo ? getComputedStyle(logo).display : null,
      logoWidth: Math.round(logo?.getBoundingClientRect().width || 0),
      logoSource: logo ? getComputedStyle(logo).content : "",
      brandCopyDisplay: brandCopy ? getComputedStyle(brandCopy).display : null,
      brandTextDisplay: brandText ? getComputedStyle(brandText).display : null,
    };
  });

  expect(layout.brandLeft).toBeLessThanOrEqual(18);
  expect(layout.brandWidth).toBeGreaterThanOrEqual(100);
  expect(layout.logoDisplay).toBe("block");
  expect(layout.logoWidth).toBeGreaterThanOrEqual(118);
  expect(layout.logoSource).toContain("haode-header-logo-horizontal-preview.png");
  expect([layout.brandCopyDisplay, layout.brandTextDisplay]).toContain("none");
}

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}

async function expectHeaderHeightAtMost(page, selector, maxHeight) {
  const height = await page.locator(selector).first().evaluate((el) => Math.round(el.getBoundingClientRect().height));
  expect(height).toBeLessThanOrEqual(maxHeight);
}

async function expectFirstWhatsAppInViewport(page) {
  const isInViewport = await page.locator('a[href*="wa.me"]').first().evaluate((el) => {
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && rect.top < window.innerHeight;
  });
  expect(isInViewport).toBe(true);
}

async function expectDistributorHeroWhatsAppInViewport(page) {
  const layout = await page.locator(".distributor-hero-whatsapp").evaluate((el) => {
    const rect = el.getBoundingClientRect();
    return {
      top: Math.round(rect.top),
      bottom: Math.round(rect.bottom),
      display: getComputedStyle(el).display,
    };
  });

  expect(layout.display).not.toBe("none");
  expect(layout.top).toBeGreaterThanOrEqual(0);
  expect(layout.bottom).toBeLessThanOrEqual(844);
}

async function expectDarkConversionStrip(page, selector) {
  const color = await page.locator(`${selector} strong`).first().evaluate((el) => getComputedStyle(el).color);
  expect(color).toBe("rgb(255, 255, 255)");
}
