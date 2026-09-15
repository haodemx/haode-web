const { test, expect } = require('@playwright/test');

const BASE_URL = (process.env.BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');

test.describe('homepage locked laboratory hero', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('https://erp.haode.com.mx/**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
  });

  test('uses the approved laboratory photograph without a generic carousel', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(page.locator('.lab-hero-photo')).toHaveAttribute('src', '/assets/images/v3-lab-hero.png');
    await expect(page.locator('[data-home-hero-carousel]')).toHaveCount(0);
    await expect(page.locator('.lab-hero h1')).toContainText('Pantallas profesionales');
  });

  test('keeps the real product cutouts inside the locked hero composition', async ({ page }) => {
    await page.setViewportSize({ width: 1792, height: 1200 });
    const images = page.locator('.lab-contract-images img');
    await expect(images).toHaveCount(2);
    await expect.poll(() => images.evaluateAll((nodes) => nodes.every((image) => image.complete && image.naturalWidth > 0))).toBe(true);
    await expect(images.first()).toHaveCSS('object-fit', 'contain');
  });

  test('mobile keeps the same hero language without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator('.lab-hero-photo')).toBeVisible();
    await expect(page.locator('.reference-mobile-hero-visual')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  });

  test('mobile product photography remains uncropped and available', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const image = page.locator('.lab-contract-images img').first();
    await expect(image).toHaveCSS('object-fit', 'contain');
    await expect.poll(() => image.evaluate((node) => node.complete && node.naturalWidth > 0)).toBe(true);
  });

  test('dark buying-flow band keeps its copy readable', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const colors = await page.locator('.lab-buying-flow').evaluate((band) => ({
      background: getComputedStyle(band).backgroundColor,
      title: getComputedStyle(band.querySelector('b')).color,
    }));
    expect(colors.background).not.toBe(colors.title);
    await expect(page.locator('.lab-buying-flow')).toContainText('Confirmación');
  });

  test('home has no duplicate storefront caption layer', async ({ page }) => {
    await expect(page.locator('.reference-store-photo-card figcaption')).toHaveCount(0);
  });

  test('category modules keep editorial divisions and honest asset placeholders', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator('.lab-category-grid')).toBeVisible();
    await expect(page.locator('.lab-category--hydrogel')).toContainText('REAL ASSET REQUIRED');
    await expect(page.locator('.lab-category--battery')).toContainText('REAL ASSET REQUIRED');
    await expect(page.locator('.lab-category')).toHaveCount(4);
  });
});
