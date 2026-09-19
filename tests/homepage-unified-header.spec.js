const { test, expect } = require('@playwright/test');

const BASE_URL = (process.env.BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');

test.beforeEach(async ({ page }) => {
  await page.route('https://erp.haode.com.mx/**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
});

test('desktop header exposes locked navigation and primary WhatsApp action', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator('.zay-header')).toBeVisible();
  await expect(page.locator('.zay-brand img')).toHaveAttribute('src', '/assets/images/haode-header-logo-horizontal-preview.png');
  await expect(page.locator('.zay-nav')).toContainText('Pantallas');
  await expect(page.locator('.zay-header-actions a[href*="wa.me"]')).toBeVisible();
  await expect(page.locator('.zay-header-actions a[href="/app/"]')).toBeVisible();
});

test('ultrawide homepage keeps a centered readable content width', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1000 });
  const box = await page.locator('.zay-hero .zay-container').boundingBox();
  expect(box.width).toBeGreaterThanOrEqual(1400);
  expect(box.width).toBeLessThanOrEqual(1480);
  expect(Math.abs(box.x - (1920 - box.x - box.width))).toBeLessThanOrEqual(2);
});

test('featured products form a complete desktop row and a balanced tablet grid', async ({ page }) => {
  const grid = page.locator('[data-ui-id="home-featured-products"] .zay-product-grid');

  await page.setViewportSize({ width: 1440, height: 900 });
  expect((await grid.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ').length))).toBe(4);

  await page.setViewportSize({ width: 768, height: 1024 });
  expect((await grid.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ').length))).toBe(2);
});

test('desktop navigation hover remains readable and restrained', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const link = page.locator('.zay-nav details').first().locator('summary');
  await link.hover();
  const style = await link.evaluate((element) => ({ color: getComputedStyle(element).color, fontSize: parseFloat(getComputedStyle(element).fontSize) }));
  expect(style.color).toBe('rgb(255, 90, 18)');
  expect(style.fontSize).toBeGreaterThanOrEqual(12);
});

test('desktop header and hero labels use readable type sizes', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const sizes = await page.evaluate(() => ({
    nav: parseFloat(getComputedStyle(document.querySelector('.zay-nav a')).fontSize),
    title: parseFloat(getComputedStyle(document.querySelector('.zay-hero h1')).fontSize),
    promise: parseFloat(getComputedStyle(document.querySelector('.zay-hero-grid > div > p:not(.zay-kicker)')).fontSize),
  }));
  expect(sizes.nav).toBeGreaterThanOrEqual(12);
  expect(sizes.title).toBeGreaterThanOrEqual(64);
  expect(sizes.promise).toBeGreaterThanOrEqual(16);
});

test('mobile header is compact, readable, and keyboard-operable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const menu = page.locator('.zay-menu-button');
  await expect(menu).toBeVisible();
  await expect(page.locator('.zay-nav')).toBeHidden();
  await menu.focus();
  await page.keyboard.press('Enter');
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('.zay-nav a').first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
});
