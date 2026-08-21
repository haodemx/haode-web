const { test, expect } = require('@playwright/test');

const baseURL = process.env.BASE_URL || 'http://127.0.0.1:4173';

const footerPages = [
  '/categoria/',
  '/categoria/pantallas/',
  '/categoria/iphone-incell/',
  '/contacto/',
  '/distribuidores/',
  '/productos/samsung-z-fold5/',
];

const catalogHeaderPages = [
  '/ai-productos.html',
  '/ai-smart-glasses-w610.html',
  '/garantia/',
  '/categoria/pantallas/',
  '/categoria/iphone-incell/',
  '/producto/iphone-incell-12-12pro/',
];

test.describe('HAODE public sales shell phase 30', () => {
  for (const path of footerPages) {
    test(`${path} closes with the shared sales footer`, async ({ page }) => {
      await page.goto(`${baseURL}${path}`, { waitUntil: 'domcontentloaded' });

      const footer = page.locator('[data-site-sales-footer]');
      await expect(footer).toBeVisible();
      await expect(footer).toContainText('Tienda oficial de fábrica HL');
      await expect(footer).toContainText('Garantía local');
      await expect(footer.locator('a[href*="wa.me"]')).toBeVisible();
      await expect(footer.locator('a[href="/app/"]')).toBeVisible();
    });
  }

  for (const path of catalogHeaderPages) {
    test(`${path} keeps bright WhatsApp and APP header actions`, async ({ page }) => {
      await page.goto(`${baseURL}${path}`, { waitUntil: 'domcontentloaded' });

      await expect(page.locator('[data-detail-header-whatsapp]')).toBeVisible();
      await expect(page.locator('[data-detail-header-app]')).toBeVisible();

      await page.setViewportSize({ width: 360, height: 844 });
      await expect(page.locator('[data-detail-header-whatsapp]')).toBeVisible();
      await expect(page.locator('[data-detail-header-app]')).toBeVisible();
      const overflow = await page.evaluate(
        () => Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth)
      );
      expect(overflow).toBe(0);
    });
  }

  test('404 gives catalog, category and WhatsApp recovery routes', async ({ page }) => {
    await page.goto(`${baseURL}/404.html`, { waitUntil: 'domcontentloaded' });

    await expect(page.locator('body')).toHaveClass(/not-found-reference-page/);
    await expect(page.getByRole('heading', { name: 'Esta página ya no está aquí' })).toBeVisible();
    await expect(page.locator('.reference-header-wa')).toBeVisible();
    await expect(page.locator('.reference-header-app')).toBeVisible();
    await expect(page.locator('.not-found-support a[href*="wa.me"]')).toBeVisible();
    await expect(page.locator('[data-site-sales-footer]')).toBeVisible();
  });

  test('distributor header keeps WhatsApp and APP visible', async ({ page }) => {
    await page.goto(`${baseURL}/distribuidores/`, { waitUntil: 'domcontentloaded' });

    await expect(page.locator('.distributor-header-whatsapp')).toBeVisible();
    await expect(page.locator('.distributor-header-app')).toBeVisible();

    await page.setViewportSize({ width: 360, height: 844 });
    await expect(page.locator('.distributor-header-whatsapp')).toBeVisible();
    await expect(page.locator('.distributor-header-app')).toBeVisible();
    const overflow = await page.evaluate(
      () => Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth)
    );
    expect(overflow).toBe(0);
  });

  test('offline page exposes retry and cached-state warning', async ({ page }) => {
    await page.goto(`${baseURL}/offline.html`, { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'Sin conexión por ahora' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reintentar' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Abrir HAODE App' })).toBeVisible();
    await expect(page.locator('body')).toContainText('puede no estar actualizada');
  });

  for (const width of [320, 390, 768, 1440]) {
    test(`sales shell has no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: width < 700 ? 844 : 960 });
      await page.goto(`${baseURL}/404.html`, { waitUntil: 'domcontentloaded' });

      const overflow = await page.evaluate(
        () => Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth)
      );
      expect(overflow).toBe(0);
    });
  }
});
