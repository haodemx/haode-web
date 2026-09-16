const { test, expect } = require('@playwright/test');

const BASE_URL = (process.env.BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');

test.beforeEach(async ({ page }) => {
  await page.route('https://erp.haode.com.mx/**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
});

async function expectNoOverflow(page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
}

test('homepage desktop matches the locked laboratory editorial master', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.d21-brand-word')).toHaveText('HAODE');
  await expect(page.locator('.d21-hero h1')).toContainText('Pantallas profesionales');
  await expect(page.locator('.d21-hero-scene')).toHaveAttribute('src', '/assets/images/d21-light-stage/factory-laboratory.webp');
  await expect(page.locator('.d21-product img')).toHaveCount(3);
  await expect(page.locator('[data-home-hero-carousel]')).toHaveCount(0);
  await expectNoOverflow(page);
});

test('homepage mobile preserves the laboratory composition and readable hierarchy', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.d21-hero h1')).toBeVisible();
  await expect(page.locator('.d21-hero-scene')).toBeVisible();
  await expect(page.locator('.d21-hero-product')).toBeVisible();
  const metrics = await page.locator('.d21-hero h1').evaluate((title) => ({ size: parseFloat(getComputedStyle(title).fontSize), line: parseFloat(getComputedStyle(title).lineHeight) }));
  expect(metrics.size).toBeGreaterThanOrEqual(44);
  expect(metrics.line).toBeGreaterThanOrEqual(38);
  await expectNoOverflow(page);
});

test('catalog uses the V3 technical atlas on desktop and mobile', async ({ page }) => {
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await page.goto(`${BASE_URL}/productos/`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.v3-page-title')).toHaveText('Pantallas');
    await expect(page.locator('.v3-filter-panel')).toBeVisible();
    await expect(page.locator('[data-catalog-card]:visible').first()).toBeVisible();
    await expectNoOverflow(page);
  }
});

test('product detail keeps product photography and configuration together', async ({ page }) => {
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await page.goto(`${BASE_URL}/producto/iphone-incell-14/`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.v3-detail-atlas')).toBeVisible();
    await expect(page.locator('.detail-main-image')).toHaveCSS('object-fit', 'contain');
    await expect(page.locator('[data-v3-detail-controls]')).toBeVisible();
    await expect(page.locator('[data-detail-whatsapp]')).toHaveAttribute('href', /wa\.me/);
    await expectNoOverflow(page);
  }
});

test('App remains unchanged and usable beside the V3 website', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE_URL}/app/`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Encuentra tu refacción.' })).toBeVisible();
  await expect(page.locator('.app-home-product-card').first()).toBeVisible({ timeout: 15000 });
  await expectNoOverflow(page);
});
