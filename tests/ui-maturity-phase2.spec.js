import { expect, test } from '@playwright/test';

const BASE_URL = (process.env.BASE_URL || 'http://127.0.0.1:4175').replace(/\/$/, '');

test.describe('HAODE UI maturity phase 2', () => {
  test('category page is product-first and visually restrained', async ({ page }) => {
    await page.goto(`${BASE_URL}/categoria/iphone-incell/`, { waitUntil: 'networkidle' });

    await expect(page.locator('.new-page-hero-inner')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await expect(page.locator('.new-page-hero-inner')).toHaveCSS('box-shadow', 'none');
    await expect(page.locator('.new-product-card').first()).toHaveCSS('box-shadow', 'none');
    await expect(page.locator('[data-category-products] .new-product-card').first()).toBeVisible();
  });

  test('product detail flattens the conversion panel and keeps the buying CTA', async ({ page }) => {
    await page.goto(`${BASE_URL}/producto/iphone-incell-xr/`, { waitUntil: 'networkidle' });

    await expect(page.locator('[data-detail-whatsapp]')).toBeVisible();
    await expect(page.locator('.detail-conversion-panel:not(.special-product-conversion)')).toBeVisible();
    await expect(page.locator('.detail-conversion-panel:not(.special-product-conversion)')).toHaveCSS('box-shadow', 'none');
    await expect(page.locator('.detail-main-image')).toHaveCSS('box-shadow', 'none');
  });

  test('App uses distinct product section labels and flat catalog surfaces', async ({ page }) => {
    await page.goto(`${BASE_URL}/app/`, { waitUntil: 'networkidle' });

    await expect(page.getByRole('heading', { name: 'Productos destacados' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Catálogo activo' })).toBeVisible();
    await expect(page.locator('.app-home-board')).toHaveCSS('box-shadow', 'none');
    await expect(page.locator('.product-card').first()).toHaveCSS('box-shadow', 'none');
  });

  test('App cart remains readable and operational on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/app/`, { waitUntil: 'networkidle' });

    await page.locator('.app-row-add').first().click();
    await expect(page.locator('[data-cart-drawer]')).toHaveClass(/open/);
    await expect(page.locator('[data-cart-items] .cart-item')).toBeVisible();
    await expect(page.locator('.cart-head')).toHaveCSS('background-color', 'rgb(23, 23, 21)');
    await expect(page.locator('.cart-head h2')).toHaveCSS('color', 'rgb(255, 255, 255)');
    await expect(page.locator('[data-checkout-form]')).toBeVisible();
    await expect(page.locator('.cart-panel')).toHaveCSS('overflow-y', 'auto');
    const cartHeights = await page.evaluate(() => ({
      items: document.querySelector('[data-cart-items]').clientHeight,
      item: Math.ceil(document.querySelector('[data-cart-items] .cart-item').getBoundingClientRect().height)
    }));
    expect(cartHeights.items).toBeGreaterThanOrEqual(cartHeights.item);
  });

  for (const width of [390, 430]) {
    test(`target pages have no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      for (const path of ['/categoria/iphone-incell/', '/producto/iphone-incell-xr/', '/app/']) {
        await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle' });
        const dimensions = await page.evaluate(() => ({
          clientWidth: document.documentElement.clientWidth,
          scrollWidth: document.documentElement.scrollWidth
        }));
        expect(dimensions.scrollWidth, path).toBe(dimensions.clientWidth);
      }
    });
  }
});
