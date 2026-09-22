const { test, expect } = require('@playwright/test');

const BASE_URL = (process.env.BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');

test.beforeEach(async ({ page }) => {
  await page.route('https://erp.haode.com.mx/**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
});

async function expectNoOverflow(page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
}

test('homepage desktop matches the approved current C-layout sales master', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.c-hero h1')).toContainText('Pantallas y tecnología');
  await expect(page.locator('.c-logo img')).toHaveAttribute('src', '/assets/images/homepage-c/phase3/brand/haode-official-trimmed.webp');
  await expect(page.locator('.c-hero-media img')).toHaveAttribute('src', '/assets/images/homepage-c/phase3/hero/iphone-16pro-composition-a-1200.webp');
  await expect(page.locator('.c-category-card')).toHaveCount(9);
  await expect(page.locator('[data-home-hero-carousel]')).toHaveCount(0);
  await expectNoOverflow(page);
});

test('homepage mobile preserves the approved current C-layout composition and readable hierarchy', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.c-hero h1')).toBeVisible();
  await expect(page.locator('.c-hero-media img')).toBeVisible();
  const metrics = await page.locator('.c-hero h1').evaluate((title) => ({ size: parseFloat(getComputedStyle(title).fontSize), line: parseFloat(getComputedStyle(title).lineHeight) }));
  expect(metrics.size).toBeGreaterThanOrEqual(38);
  expect(metrics.line).toBeGreaterThanOrEqual(38);
  await expectNoOverflow(page);
});

test('catalog uses the approved Zay filters on desktop and mobile', async ({ page }) => {
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await page.goto(`${BASE_URL}/productos/`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.zay-page-head h1')).toHaveText('Productos publicados');
    await expect(page.locator('.zay-filter-panel')).toBeVisible();
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
