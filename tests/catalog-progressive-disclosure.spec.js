const { test, expect } = require('@playwright/test');

const BASE_URL = (process.env.BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');

test.describe('V3 catalog progressive disclosure', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/public/catalog*', (route) => route.fulfill({ contentType: 'application/json', body: '[]' }));
    await page.route('**/public-stock.json*', (route) => route.fulfill({ contentType: 'application/json', body: '[]' }));
  });

  test('background hydration preserves the published catalog count', async ({ page }) => {
    await page.goto(`${BASE_URL}/productos/`, { waitUntil: 'domcontentloaded' });
    const initial = await page.locator('[data-catalog-card]').count();
    await page.waitForTimeout(600);
    expect(await page.locator('[data-catalog-card]').count()).toBe(initial);
    expect(initial).toBeGreaterThan(100);
  });

  test('plain catalog WhatsApp entry keeps the confirmed quote template', async ({ page }) => {
    await page.goto(`${BASE_URL}/productos/`, { waitUntil: 'domcontentloaded' });
    const href = await page.locator('.zay-floating[href*="wa.me"]').getAttribute('href');
    expect(decodeURIComponent(href || '')).toContain('Modelo/SKU:');
    expect(decodeURIComponent(href || '')).toContain('Cantidad:');
  });

  test('mobile catalog initially limits products and reveals all on demand', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/productos/`, { waitUntil: 'domcontentloaded' });
    const all = await page.locator('[data-catalog-card]').count();
    const visible = page.locator('[data-catalog-card]:visible');
    expect(all).toBeGreaterThan(12);
    await expect(visible).toHaveCount(12);
    const more = page.locator('[data-v3-more]');
    expect(await more.evaluate((button) => button.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);
    await more.click();
    await expect(visible).toHaveCount(all);
  });

  test('catalog search exposes a matching model from the full current catalog', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/productos/?q=LK-007`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-catalog-card]:visible').filter({ hasText: 'LK-007' })).toHaveCount(1);
  });
});
