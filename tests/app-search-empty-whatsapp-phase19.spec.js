const { test, expect } = require('@playwright/test');

const SERVER_URL = (process.env.BASE_URL || 'https://haode.com.mx').replace(/\/app\/?$/, '').replace(/\/$/, '');
const APP_URL = `${SERVER_URL}/app/`;

test.describe('HAODE App empty search WhatsApp UI phase 19', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('https://erp.haode.com.mx/**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });
  });

  test('empty search result sends the searched model to WhatsApp', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${APP_URL}#lista`, { waitUntil: 'domcontentloaded' });
    await page.locator('[data-search-products]').fill('modelo inexistente 999');

    await expect(page.locator('.empty-state-whatsapp')).toContainText('Sin resultados');
    await expect(page.locator('.empty-state-whatsapp')).toContainText('lista grande por WhatsApp');
    await expect(page.getByRole('link', { name: 'Enviar búsqueda por WhatsApp' })).toHaveAttribute('href', /modelo%20inexistente%20999/);

    const overflow = await page.evaluate(() => (
      Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth)
    ));
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
