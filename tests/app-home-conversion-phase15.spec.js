const { test, expect } = require('@playwright/test');

const serverURL = (process.env.BASE_URL || 'https://haode.com.mx').replace(/\/app\/?$/, '').replace(/\/$/, '');
const appURL = `${serverURL}/app/`;

test.describe('HAODE App home conversion UI phase 15', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('https://erp.haode.com.mx/**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });
  });

  test('App first screen shows factory, quantity pricing and private WhatsApp prompts', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(appURL, { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'Fábrica directa para talleres' })).toBeVisible();
    await expect(page.locator('.app-stock-strip')).toContainText('Stock en México');
    await expect(page.locator('.app-stock-strip')).toContainText('Precio por cantidad');
    await expect(page.locator('.app-stock-strip')).toContainText('Calidad revisada');
    await expect(page.locator('.app-stock-strip')).toContainText('WhatsApp privado');
    await expect(page.locator('.app-hero-actions a[href*="wa.me"]').first()).toBeVisible();
    await expect(page.locator('.app-home-product-card').first()).toBeVisible({ timeout: 15000 });

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
