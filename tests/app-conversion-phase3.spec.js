const { test, expect } = require("@playwright/test");

const SERVER_URL = (process.env.BASE_URL || "https://haode.com.mx").replace(/\/app\/?$/, "").replace(/\/$/, "");
const APP_URL = `${SERVER_URL}/app/`;

test.describe("HAODE App conversion UI phase 3", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("https://erp.haode.com.mx/**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "[]",
      });
    });
  });

  test("list and cart flows keep bulk WhatsApp prompts visible", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 844 });
    await page.goto(`${APP_URL}#lista`, { waitUntil: "domcontentloaded" });

    await expect(page.locator(".app-bulk-panel").first()).toBeVisible();
    await expect(page.locator(".app-bulk-panel").first()).toContainText("Compra muchas piezas");
    await expectListSearchBeforeBulkPanel(page);
    await expect(page.locator(".app-card-badges").first()).toContainText("WhatsApp privado");
    await expect(page.locator(".app-card-b2b-strip").first()).toContainText("Lista grande por WhatsApp");
    await expect(page.locator(".app-card-b2b-strip").first()).toContainText("garantía local");
    await expectFirstProductStartsInView(page);
    await expectBottomNavigationLabelsFit(page);
    await expectNoHorizontalOverflow(page);

    const productCards = page.locator(".product-card");
    const pricedProductCards = productCards.filter({ has: page.locator(".price-lines") });
    await expect(pricedProductCards.first()).toBeVisible({ timeout: 15000 });
    await pricedProductCards.first().getByRole("button", { name: "Agregar" }).click();
    await expect(page.locator(".cart-bulk-note")).toBeVisible();

    await page.locator("[data-close-cart]").click();
    await page.evaluate(() => { window.location.hash = "#carrito"; });
    await expect(page.locator(".app-bulk-panel").first()).toContainText("Envía este carrito");
    const cartReviewCta = page.locator(".app-bulk-panel [data-open-cart]").first();
    await expect(cartReviewCta).toContainText("Revisar carrito por WhatsApp");
    await expectCartReviewCtaInView(page);
    await cartReviewCta.click();
    await expect(page.locator("[data-cart-drawer]")).toHaveClass(/open/);
    await expect(page.locator("[data-cart-items] .cart-item").first()).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}

async function expectCartReviewCtaInView(page) {
  await page.waitForFunction(() => {
    const cta = document.querySelector(".app-bulk-panel [data-open-cart]");
    return cta && cta.getBoundingClientRect().top >= 0;
  });

  const layout = await page.evaluate(() => {
    const cta = document.querySelector(".app-bulk-panel [data-open-cart]")?.getBoundingClientRect();
    return {
      top: Math.round(cta?.top || 0),
      bottom: Math.round(cta?.bottom || 0),
    };
  });

  expect(layout.top).toBeGreaterThanOrEqual(0);
  expect(layout.bottom).toBeLessThanOrEqual(844);
}

async function expectListSearchBeforeBulkPanel(page) {
  const layout = await page.evaluate(() => {
    const search = document.querySelector('[data-search-products]')?.getBoundingClientRect();
    const bulk = document.querySelector('.app-bulk-panel')?.getBoundingClientRect();
    const input = document.querySelector('[data-search-products]');
    return {
      searchTop: Math.round(search?.top || 0),
      searchBottom: Math.round(search?.bottom || 0),
      bulkTop: Math.round(bulk?.top || 0),
      inputBorder: input ? getComputedStyle(input).borderColor : '',
    };
  });

  expect(layout.searchTop).toBeGreaterThanOrEqual(0);
  expect(layout.searchBottom).toBeLessThan(layout.bulkTop);
  expect(layout.searchBottom).toBeLessThan(360);
  expect(layout.inputBorder).toContain('240');
}

async function expectFirstProductStartsInView(page) {
  const layout = await page.locator(".product-card").first().evaluate((el) => {
    const rect = el.getBoundingClientRect();
    return {
      top: Math.round(rect.top),
      width: Math.round(rect.width),
    };
  });

  expect(layout.top).toBeGreaterThanOrEqual(0);
  expect(layout.top).toBeLessThan(844);
  expect(layout.width).toBeGreaterThan(300);
}

async function expectBottomNavigationLabelsFit(page) {
  const labels = await page.locator(".bottom-nav span").evaluateAll((items) => items.map((item) => ({
    text: item.textContent?.trim() || "",
    overflow: item.scrollWidth - item.clientWidth,
  })));

  expect(labels).toHaveLength(5);
  labels.forEach((label) => {
    expect(label.text.length).toBeGreaterThan(0);
    expect(label.overflow).toBeLessThanOrEqual(1);
  });
}
