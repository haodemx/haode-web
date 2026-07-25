const { test, expect } = require('@playwright/test');

const SERVER_URL = (process.env.BASE_URL || 'https://haode.com.mx').replace(/\/app\/?$/, '').replace(/\/$/, '');
const APP_URL = `${SERVER_URL}/app/`;

const productRoutes = [
  ['iphone-incell-14', 'Pantalla para iPhone 14'],
  ['x200t-cortadora-micas', 'X200T'],
];

test.describe('HAODE App product detail conversion UI phase 17', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('https://erp.haode.com.mx/**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });
  });

  for (const [productId, heading] of productRoutes) {
    test(`${productId} shows detail conversion strip and WhatsApp path`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`${APP_URL}#producto/${productId}`, { waitUntil: 'domcontentloaded' });

      await expect(page.getByRole('heading', { name: new RegExp(heading, 'i') })).toBeVisible({ timeout: 15000 });
      await expect(page.locator('.detail-conversion-strip')).toContainText('Stock en México');
      await expect(page.locator('.detail-conversion-strip')).toContainText('Precio por cantidad');
      await expect(page.locator('.detail-conversion-strip')).toContainText('Calidad revisada');
      await expect(page.locator('.detail-conversion-strip')).toContainText('WhatsApp privado');
      await expect(page.locator('.sticky-actions a[href*="wa.me"]').first()).toBeVisible();

      const overflow = await page.evaluate(() => (
        Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth)
      ));
      expect(overflow).toBeLessThanOrEqual(1);
    });
  }

  test('catalog navigation opens product detail from the top', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${APP_URL}#lista`, { waitUntil: 'domcontentloaded' });

    const productCards = page.locator('.product-card');
    await expect(productCards.nth(4)).toBeVisible({ timeout: 15000 });
    await page.evaluate(() => window.scrollTo(0, 1100));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(600);

    await productCards.nth(4).locator('a[href^="#producto/"]').first().click();
    await expect(page.locator('.detail-panel h1')).toBeVisible({ timeout: 15000 });
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThanOrEqual(4);

    const topBox = await page.locator('.page-stack').evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { top: Math.round(rect.top), bottom: Math.round(rect.bottom) };
    });
    expect(topBox.top).toBeGreaterThanOrEqual(0);
    expect(topBox.top).toBeLessThan(160);
    await expect(page.locator('.back-link')).toBeVisible();
  });
});
