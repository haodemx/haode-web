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
});
