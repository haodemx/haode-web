const { test, expect } = require('@playwright/test');

const BASE_URL = (process.env.BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');

test.describe('homepage approved Zay hero', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('https://erp.haode.com.mx/**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
  });

  test('uses the approved real product photograph without a generic carousel', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(page.locator('.zay-hero figure img')).toHaveAttribute('src', '/assets/products/iphone-incell/16e/gallery-01.png');
    await expect(page.locator('[data-home-hero-carousel]')).toHaveCount(0);
    await expect(page.locator('.zay-hero h1')).toContainText('Pantallas y tecnología');
  });

  test('keeps the real product cutouts inside the locked hero composition', async ({ page }) => {
    await page.setViewportSize({ width: 1792, height: 1200 });
    const images = page.locator('.zay-hero figure img');
    await expect(images).toHaveCount(1);
    await expect.poll(() => images.evaluateAll((nodes) => nodes.every((image) => image.complete && image.naturalWidth > 0))).toBe(true);
    await expect(images.first()).toHaveCSS('object-fit', 'contain');
  });

  test('mobile keeps the same hero language without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator('.zay-hero figure img')).toBeVisible();
    await expect(page.locator('.zay-hero h1')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  });

  test('mobile product photography remains uncropped and available', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const image = page.locator('.zay-hero figure img').first();
    await expect(image).toHaveCSS('object-fit', 'contain');
    await expect.poll(() => image.evaluate((node) => node.complete && node.naturalWidth > 0)).toBe(true);
  });

  test('buying-flow steps keep their copy readable', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const colors = await page.locator('.zay-steps').evaluate((band) => ({
      background: getComputedStyle(band).backgroundColor,
      title: getComputedStyle(band.querySelector('strong')).color,
    }));
    expect(colors.background).not.toBe(colors.title);
    await expect(page.locator('.zay-steps')).toContainText('Confirmación');
  });

  test('home has no duplicate storefront caption layer', async ({ page }) => {
    await expect(page.locator('.reference-store-photo-card figcaption')).toHaveCount(0);
  });

  test('category modules keep three distinct approved catalog entries', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator('.zay-category-grid')).toBeVisible();
    await expect(page.locator('.zay-category-card')).toHaveCount(3);
    await expect(page.locator('.zay-category-card')).toContainText(['Pantallas', 'Hidrogel', 'Productos AI']);
  });
});
