const { test, expect } = require('@playwright/test');

const BASE_URL = (process.env.BASE_URL || 'http://127.0.0.1:4181').replace(/\/$/, '');

test.beforeEach(async ({ page }) => {
  await page.route('https://erp.haode.com.mx/**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
});

test('catalog keeps its technical filters and products readable', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${BASE_URL}/productos/`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.v3-filter-panel')).toBeVisible();
  await expect(page.locator('.v3-chip')).toHaveCount(6);
  await expect(page.locator('[data-catalog-card]:visible').first()).toBeVisible();
  const panel = await page.locator('.v3-filter-panel').boundingBox();
  expect(panel.width).toBeGreaterThan(800);
});

test('V3 routes use the official horizontal HAODE wordmark', async ({ page }) => {
  for (const route of ['/', '/productos/', '/contacto/', '/producto/iphone-incell-14/']) {
    await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded' });
    const logo = page.locator('.v3-logo img');
    await expect(logo).toHaveAttribute('src', '/assets/images/d21-light-stage/haode-logo-official.webp');
    await expect.poll(() => logo.evaluate((image) => image.complete && image.naturalWidth > 0)).toBe(true);
    const ratio = await logo.evaluate((image) => image.naturalWidth / image.naturalHeight);
    expect(ratio).toBeGreaterThan(2.5);
  }
});

test('homepage laboratory hero labels remain readable over photography', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.d21-hero-shade')).toBeVisible();
  const presentation = await page.locator('.d21-hero-copy').evaluate((copy) => ({
    title: getComputedStyle(copy.querySelector('h1')).color,
    size: parseFloat(getComputedStyle(copy.querySelector('h1')).fontSize),
    meta: getComputedStyle(copy.querySelector('.d21-hero-meta')).color,
  }));
  expect(presentation.title).toBe('rgb(255, 255, 255)');
  expect(presentation.meta).toBe('rgb(226, 233, 232)');
  expect(presentation.size).toBeGreaterThanOrEqual(64);
});
