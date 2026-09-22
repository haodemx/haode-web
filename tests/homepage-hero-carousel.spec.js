const { test, expect } = require('@playwright/test');

const BASE_URL = (process.env.BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');

test.describe('homepage approved current C-layout hero', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('https://erp.haode.com.mx/**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
  });

  test('uses the approved real product composition without a generic carousel', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(page.locator('.c-hero-media img')).toHaveAttribute('src', '/assets/images/homepage-c/phase3/hero/iphone-16pro-composition-a-1200.webp');
    await expect(page.locator('.c-hero-media source[type="image/avif"]')).toHaveCount(1);
    await expect(page.locator('[data-home-hero-carousel]')).toHaveCount(0);
    await expect(page.locator('.c-hero h1')).toContainText('Pantallas y tecnología');
  });

  test('keeps the approved real product composition loaded and contained', async ({ page }) => {
    await page.setViewportSize({ width: 1792, height: 1200 });
    const image = page.locator('.c-hero-media img');
    await expect(image).toHaveCount(1);
    await expect.poll(() => image.evaluate((node) => node.complete && node.naturalWidth > 0)).toBe(true);
    await expect(image).toHaveCSS('object-fit', 'contain');
  });

  test('mobile keeps the same hero language without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator('.c-hero-media img')).toBeVisible();
    await expect(page.locator('.c-hero h1')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  });

  test('mobile product photography remains uncropped and available', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const image = page.locator('.c-hero-media img');
    await expect(image).toHaveCSS('object-fit', 'contain');
    await expect.poll(() => image.evaluate((node) => node.complete && node.naturalWidth > 0)).toBe(true);
  });

  test('service strip keeps its copy readable', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const colors = await page.locator('.c-proof-row').evaluate((band) => ({
      background: getComputedStyle(band).backgroundColor,
      title: getComputedStyle(band.querySelector('strong')).color,
    }));
    expect(colors.background).not.toBe(colors.title);
    await expect(page.locator('.c-proof-row')).toContainText('Verificación de pedido');
  });

  test('home has one stable product composition and no duplicate storefront caption', async ({ page }) => {
    await expect(page.locator('.c-hero-media')).toHaveCount(1);
    await expect(page.locator('text=Fachada oficial · Local 225')).toHaveCount(0);
  });

  test('category finder keeps nine distinct approved catalog entries', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator('.c-category-rail')).toBeVisible();
    await expect(page.locator('.c-category-card')).toHaveCount(9);
    await expect(page.locator('.c-category-rail')).toContainText('iPhone');
    await expect(page.locator('.c-category-rail')).toContainText('Samsung');
    await expect(page.locator('.c-category-rail')).toContainText('Hidrogel');
    await expect(page.locator('.c-category-rail')).toContainText('Productos AI');
  });
});
