const { test, expect } = require('@playwright/test');

const baseURL = process.env.BASE_URL || 'http://127.0.0.1:4173';

test.describe('HAODE product detail immediate render phase 13', () => {
  test('product detail renders local product content before ERP responds', async ({ page }) => {
    await page.route('**/api/public/catalog*', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.fulfill({ contentType: 'application/json', body: '[]' });
    });
    await page.route('**/public-stock.json*', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.fulfill({ contentType: 'application/json', body: '[]' });
    });

    await page.goto(`${baseURL}/producto/iphone-incell-14/`, { waitUntil: 'domcontentloaded' });

    await expect(page.locator('[data-detail-title]')).toHaveText('Pantalla para iPhone 14', { timeout: 250 });
    await expect(page.locator('[data-detail-conversion]')).toContainText('WhatsApp privado', { timeout: 250 });
    await expect(page.locator('[data-detail-panel-whatsapp]')).toHaveAttribute('href', /wa\.me/, { timeout: 250 });

    const overflow = await page.evaluate(() => Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth));
    expect(overflow).toBe(0);
  });

  test('static product detail stays visible when ERP catalog omits that SKU', async ({ page }) => {
    await page.route('**/api/public/catalog*', (route) => {
      route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify([
          {
            sku: 'HD-INC-14',
            public_name_es: 'Pantalla para iPhone 14',
            model: 'iPhone 14',
            quality: 'INCELL',
            category: 'Pantallas',
            public_price_mxn: 185,
            public_price_tiers: [],
            stock_status: 'available',
            sales_available: true,
          },
        ]),
      });
    });
    await page.route('**/public-stock.json*', (route) => {
      route.fulfill({ contentType: 'application/json', body: '[]' });
    });

    await page.goto(`${baseURL}/producto/iphone-oled-15/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);

    await expect(page.locator('[data-detail-title]')).toHaveText('Pantalla para iPhone 15');
    await expect(page.locator('[data-product-detail]')).not.toContainText('Producto no encontrado');
    await expect(page.locator('[data-detail-whatsapp]')).toHaveAttribute('href', /wa\.me/);
    await expect(page.locator('[data-detail-whatsapp]')).toBeVisible();

    const overflow = await page.evaluate(() => Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth));
    expect(overflow).toBe(0);
  });

  test('static product detail without generated data keeps title and WhatsApp fallback', async ({ page }) => {
    await page.route('**/api/public/catalog*', (route) => {
      route.fulfill({ contentType: 'application/json', body: '[]' });
    });
    await page.route('**/public-stock.json*', (route) => {
      route.fulfill({ contentType: 'application/json', body: '[]' });
    });

    await page.goto(`${baseURL}/producto/iphone-oled-11/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(400);

    await expect(page.locator('[data-detail-title]')).toHaveText('Pantalla para iPhone 11');
    await expect(page.locator('[data-product-detail]')).not.toContainText('Producto no encontrado');
    await expect(page.locator('[data-detail-whatsapp]')).toHaveAttribute('href', /wa\.me/);
    await expect(page.locator('[data-detail-whatsapp]')).toBeVisible();

    const overflow = await page.evaluate(() => Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth));
    expect(overflow).toBe(0);
  });
});
