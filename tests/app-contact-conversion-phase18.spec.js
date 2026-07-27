const { test, expect } = require('@playwright/test');

const SERVER_URL = (process.env.BASE_URL || 'https://haode.com.mx').replace(/\/app\/?$/, '').replace(/\/$/, '');
const APP_URL = `${SERVER_URL}/app/`;

test.describe('HAODE App contact conversion UI phase 18', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('https://erp.haode.com.mx/**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });
  });

  test('contact page shows list intake, quantity price and WhatsApp prompts', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${APP_URL}#contacto`, { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'Contacto HAODE' })).toBeVisible();
    await expect(page.locator('.app-contact-board')).toContainText('lista grande');
    await expect(page.locator('.detail-conversion-strip')).toContainText('Stock en México');
    await expect(page.locator('.detail-conversion-strip')).toContainText('Precio por cantidad');
    await expect(page.locator('.detail-conversion-strip')).toContainText('WhatsApp privado');
    await expect(page.getByRole('link', { name: 'Enviar lista por WhatsApp' })).toHaveAttribute('href', /wa\.me/);
    await expect(page.getByRole('heading', { name: 'Prepara tu cotización' })).toBeVisible();
    await expect(page.locator('.app-contact-detail-grid')).toContainText('Modelo o SKU');
    await expect(page.locator('.app-contact-detail-grid')).toContainText('Cantidad');
    await expect(page.locator('.app-contact-detail-grid')).toContainText('Ciudad');
    await expect(page.locator('.app-contact-address')).toContainText('Eje Central Lázaro Cárdenas 87');
    await expect(page.getByRole('link', { name: 'Ver catálogo' })).toHaveAttribute('href', '#lista');

    const overflow = await page.evaluate(() => (
      Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth)
    ));
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
