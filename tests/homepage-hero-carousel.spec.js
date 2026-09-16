const { test, expect } = require('@playwright/test');

const BASE_URL = (process.env.BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');

test.describe('homepage locked D2.1 light-stage master', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('https://erp.haode.com.mx/**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
  });

  test('uses the approved factory scene without a carousel', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(page.locator('.d21-hero-scene')).toHaveAttribute('src', '/assets/images/d21-light-stage/factory-laboratory.webp');
    await expect(page.locator('[data-home-hero-carousel]')).toHaveCount(0);
    await expect(page.locator('.d21-hero h1')).toHaveText(/Pantallas.*que mantienen.*el mundo conectado/s);
    await expect(page.locator('.d21-brand-word')).toContainText('HAODE');
  });

  test('keeps the approved real product cutouts as the protagonists', async ({ page }) => {
    const images = page.locator('.d21-product img');
    await expect(images).toHaveCount(2);
    await expect.poll(() => images.evaluateAll((nodes) => nodes.every((image) => image.complete && image.naturalWidth > 0))).toBe(true);
    await expect(images.first()).toHaveCSS('object-fit', 'contain');
    await expect(page.locator('.d21-hero-product img')).toHaveAttribute('src', '/assets/images/d21-light-stage/samsung-s24.webp');
    await expect(page.locator('.vm1-category--foldables')).toContainText('REAL ASSET REQUIRED');
  });

  test('mobile keeps the independent hero composition without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator('.d21-hero-scene')).toBeVisible();
    await expect(page.locator('.d21-hero-product')).toBeVisible();
    await expect(page.locator('.d21-hero-actions')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  });

  test('mobile light stage keeps product photography uncropped', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const image = page.locator('.vm1-category--samsung img');
    await expect(image).toHaveCSS('object-fit', 'contain');
    await expect.poll(() => image.evaluate((node) => node.complete && node.naturalWidth > 0)).toBe(true);
    await expect(page.locator('.d21-product-stage')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  });

  test('dark buying-flow band keeps its copy readable', async ({ page }) => {
    const colors = await page.locator('.d21-process').evaluate((band) => ({
      background: getComputedStyle(band).backgroundColor,
      title: getComputedStyle(band.querySelector('h2')).color,
    }));
    expect(colors.background).not.toBe(colors.title);
    await expect(page.locator('.d21-process')).toContainText('Confirmación');
  });

  test('secondary categories stay text-first and batteries stay unpublished', async ({ page }) => {
    await expect(page.locator('.d21-secondary')).toBeVisible();
    await expect(page.locator('.d21-secondary img')).toHaveCount(0);
    await expect(page.locator('.d21-secondary')).toContainText('Hidrogel');
    await expect(page.locator('.d21-secondary')).toContainText('Productos AI');
    await expect(page.locator('body')).not.toContainText('Baterías');
  });
});
