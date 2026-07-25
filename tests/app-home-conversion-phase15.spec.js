const { test, expect } = require('@playwright/test');

const serverURL = (process.env.BASE_URL || 'https://haode.com.mx').replace(/\/app\/?$/, '').replace(/\/$/, '');
const appURL = `${serverURL}/app/`;

test.describe('HAODE App home conversion UI phase 15', () => {
  async function routeErpEmpty(page) {
    await page.route('https://erp.haode.com.mx/**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });
  }

  async function makeErpHang(page) {
    await page.addInitScript(() => {
      const originalFetch = window.fetch.bind(window);
      window.fetch = (input, init = {}) => {
        const url = typeof input === 'string' ? input : input?.url || '';
        if (url.startsWith('https://erp.haode.com.mx/')) {
          return new Promise((resolve, reject) => {
            init.signal?.addEventListener('abort', () => {
              reject(new DOMException('Aborted', 'AbortError'));
            });
          });
        }
        return originalFetch(input, init);
      };
    });
  }

  test('App first screen shows factory, quantity pricing and private WhatsApp prompts', async ({ page }) => {
    await routeErpEmpty(page);
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

  test('App shows local catalog immediately when ERP does not answer', async ({ page }) => {
    await makeErpHang(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(appURL, { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'Fábrica directa para talleres' })).toBeVisible({ timeout: 6000 });
    await expect(page.locator('.app-home-product-card').first()).toBeVisible({ timeout: 6000 });

    const diagnostics = await page.evaluate(() => window.HAODE_DIAGNOSTICS);
    expect(diagnostics.fuente).toBe('products.json');
    expect(diagnostics.productosVisibles).toBeGreaterThan(0);
  });
});
