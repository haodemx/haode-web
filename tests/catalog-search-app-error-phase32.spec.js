const { test, expect } = require('@playwright/test');

const baseURL = (process.env.BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');

test.describe('HAODE catalog search and App error state phase 32', () => {
  test('category search filters models and keeps WhatsApp recovery', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${baseURL}/categoria/iphone-incell/`, { waitUntil: 'domcontentloaded' });

    const search = page.locator('[data-category-search]');
    await expect(search).toBeVisible();
    await expect(page.locator('[data-category-search-count]')).toContainText('32');

    await search.fill('modelo inexistente 999');
    const empty = page.locator('[data-category-search-empty]');
    await expect(empty).toBeVisible();
    await expect(empty).toContainText('Sin resultados');
    await expect(empty.locator('a[href*="wa.me"]')).toBeVisible();
    await expect(page.locator('[data-category-search-count]')).toContainText('0 de 32');

    await empty.locator('[data-clear-category-search]').click();
    await expect(search).toHaveValue('');
    await expect(page.locator('.new-product-card').first()).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test('shared product template receives the unified sales shell', async ({ page }) => {
    await page.goto(`${baseURL}/producto/iphone-incell-12-12pro/`, { waitUntil: 'domcontentloaded' });

    await expect(page.locator('body')).toHaveClass(/conversion-reference-page/);
    await expect(page.locator('[data-detail-header-whatsapp]')).toBeVisible();
    await expect(page.locator('[data-detail-header-app]')).toBeVisible();
    await expect(page.locator('[data-site-sales-footer]')).toBeVisible();
    await expect(page.locator('.detail-shell')).toHaveCSS('border-radius', '4px');
    await expectNoHorizontalOverflow(page);
  });

  test('App load failure offers retry and WhatsApp instead of a dead end', async ({ page }) => {
    await page.route('**/app/products.json', (route) => route.abort());
    await page.route('https://erp.haode.com.mx/**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${baseURL}/app/`, { waitUntil: 'domcontentloaded' });

    const error = page.locator('.app-load-error');
    await expect(error).toBeVisible();
    await expect(error.getByRole('button', { name: 'Reintentar' })).toBeVisible();
    await expect(error.getByRole('link', { name: 'Cotizar por WhatsApp' })).toHaveAttribute('href', /wa\.me/);
    await expectNoHorizontalOverflow(page);
  });
});

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(
    () => Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth)
  );
  expect(overflow).toBe(0);
}
