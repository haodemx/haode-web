const { test, expect } = require('@playwright/test');

const BASE_URL = (process.env.BASE_URL || 'https://haode.com.mx').replace(/\/$/, '');
const APP_URL = `${BASE_URL}/app/`;

function decodedWhatsappText(href) {
  const url = new URL(href);
  return decodeURIComponent(url.searchParams.get('text') || '');
}

test.describe('HAODE WhatsApp message templates phase 23', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('https://erp.haode.com.mx/**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });
  });

  test('website product detail asks for quantity, city and local warranty confirmation', async ({ page }) => {
    await page.goto(`${BASE_URL}/producto/iphone-incell-14/`, { waitUntil: 'domcontentloaded' });
    const href = await page.locator('[data-detail-whatsapp]').getAttribute('href');
    const message = decodedWhatsappText(href);

    expect(message).toContain('Producto: Pantalla para iPhone 14');
    expect(message).toMatch(/(?:SKU|Referencia web):/);
    expect(message).toContain('Cantidad:');
    expect(message).toContain('Ciudad:');
    expect(message).toContain('stock en México');
    expect(message).toContain('precio por cantidad');
    expect(message).toContain('garantía local');
  });

  test('App product WhatsApp keeps the same B2B confirmation prompts', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${APP_URL}#producto/iphone-incell-14`, { waitUntil: 'domcontentloaded' });
    const href = await page.locator('.sticky-actions a[href*="wa.me"]').getAttribute('href');
    const message = decodedWhatsappText(href);

    expect(message).toContain('Pantalla para iPhone 14');
    expect(message).toContain('SKU:');
    expect(message).toContain('Modelo:');
    expect(message).toContain('stock en México');
    expect(message).toContain('precio por cantidad');
    expect(message).toContain('garantía local');
    expect(message).toContain('envío');
  });

  test('generic homepage, catalog and contact WhatsApp links ask for useful quote details', async ({ page }) => {
    for (const path of ['/', '/productos/', '/contacto/']) {
      await page.goto(`${BASE_URL}${path}`, { waitUntil: 'domcontentloaded' });
      const href = await page.locator('a[href*="wa.me"]').first().getAttribute('href');
      const message = decodedWhatsappText(href);

      expect(message).toContain('HAODE México');
      expect(message).toMatch(/Modelo\/SKU|Modelos/);
      expect(message).toMatch(/Cantidad|Cantidades/);
      expect(message).toContain('Ciudad');
      expect(message).toContain('stock en México');
      expect(message).toContain('precio por cantidad');
      expect(message).toContain('garantía local');
      expect(message).toContain('envío');
    }
  });
});
