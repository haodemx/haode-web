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
    await page.goto(`${BASE_URL}/productos/`, { waitUntil: 'domcontentloaded' });
    await page.locator('[data-pantallas-search-input]').fill('modelo inexistente 999');

    const emptyState = page.locator('[data-pantallas-empty]');
    await expect(emptyState).toBeVisible();
    await expect(emptyState).toContainText('No encontramos "modelo inexistente 999".');
    await expect(emptyState).toContainText('lista grande por WhatsApp');
    await expect(emptyState.getByRole('link', { name: 'Enviar búsqueda por WhatsApp' })).toHaveAttribute('href', /modelo%20inexistente%20999/);

    const overflow = await page.evaluate(() => (
      Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth)
    ));
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test('fundas micas empty search keeps the same WhatsApp intake', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/productos/#fundas-micas`, { waitUntil: 'domcontentloaded' });
    await page.locator('[data-catalog-search-input="fundas-micas"]').fill('case mayorista imposible');

    const emptyState = page.locator('[data-catalog-empty="fundas-micas"]');
    await expect(emptyState).toBeVisible();
    await expect(emptyState).toContainText('No encontramos "case mayorista imposible".');
    await expect(emptyState.getByRole('link', { name: 'Enviar búsqueda por WhatsApp' })).toHaveAttribute('href', /case%20mayorista%20imposible/);

    const overflow = await page.evaluate(() => (
      Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth)
    ));
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
