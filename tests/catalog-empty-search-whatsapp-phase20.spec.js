const { test, expect } = require('@playwright/test');

const BASE_URL = (process.env.BASE_URL || 'https://haode.com.mx').replace(/\/$/, '');

test.describe('HAODE catalog empty search WhatsApp UI phase 20', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('https://erp.haode.com.mx/**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });
  });

  test('pantallas empty search sends the searched model to WhatsApp', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/productos/?category=pantallas&q=modelo%20inexistente%20999`, { waitUntil: 'domcontentloaded' });

    const emptyState = page.locator('[data-site-catalog-empty]');
    await expect(emptyState).toBeVisible();
    await expect(emptyState).toContainText('modelo inexistente 999');
    await expect(emptyState.getByRole('link', { name: 'Consultar por WhatsApp' })).toHaveAttribute('href', /modelo%20inexistente%20999/);

    const overflow = await page.evaluate(() => (
      Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth)
    ));
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test('fundas micas empty search keeps the same WhatsApp intake', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/productos/?q=case%20mayorista%20imposible`, { waitUntil: 'domcontentloaded' });

    const emptyState = page.locator('[data-site-catalog-empty]');
    await expect(emptyState).toBeVisible();
    await expect(emptyState).toContainText('case mayorista imposible');
    await expect(emptyState.getByRole('link', { name: 'Consultar por WhatsApp' })).toHaveAttribute('href', /case%20mayorista%20imposible/);

    const overflow = await page.evaluate(() => (
      Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth)
    ));
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
