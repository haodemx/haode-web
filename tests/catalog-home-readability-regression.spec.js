const { test, expect } = require('@playwright/test');

const BASE_URL = (process.env.BASE_URL || 'http://127.0.0.1:4181').replace(/\/$/, '');

test.beforeEach(async ({ page }) => {
  await page.route('https://erp.haode.com.mx/**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
});

test('catalog keeps its technical filters and products readable', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${BASE_URL}/productos/`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.zay-filter-panel')).toBeVisible();
  await expect(page.locator('[data-primary-filter]')).toHaveCount(4);
  await expect(page.locator('[data-catalog-card]:visible').first()).toBeVisible();
  const panel = await page.locator('.zay-filter-panel').boundingBox();
  expect(panel.width).toBeGreaterThanOrEqual(240);
});

test('current homepage and V3 routes use their approved HAODE wordmarks', async ({ page }) => {
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.c-logo img')).toHaveAttribute('src', '/assets/images/homepage-c/phase3/brand/haode-official-trimmed.webp');
  for (const route of ['/productos/', '/contacto/', '/producto/iphone-incell-14/']) {
    await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded' });
    const logo = page.locator('.zay-brand img');
    await expect(logo).toHaveAttribute('src', '/assets/images/haode-header-logo-horizontal-preview.png');
    const ratio = await logo.evaluate((image) => image.getBoundingClientRect().width / image.getBoundingClientRect().height);
    expect(ratio).toBeGreaterThan(2.5);
  }
});

test('homepage C-layout hero labels remain readable beside product photography', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.c-hero-media img')).toBeVisible();
  const presentation = await page.locator('.c-hero-copy').evaluate((copy) => ({
    title: getComputedStyle(copy.querySelector('h1')).color,
    size: parseFloat(getComputedStyle(copy.querySelector('h1')).fontSize),
    promise: getComputedStyle(copy.querySelector('.c-hero-lead')).color,
  }));
  expect(presentation.title).not.toBe(presentation.promise);
  expect(presentation.size).toBeGreaterThanOrEqual(52);
});
