const { test, expect } = require('@playwright/test');

const BASE_URL = (process.env.BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');

test.beforeEach(async ({ page }) => {
  await page.route('https://erp.haode.com.mx/**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
});

test('desktop header exposes approved navigation and primary WhatsApp action', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator('.c-header')).toBeVisible();
  await expect(page.locator('.c-logo img')).toHaveAttribute('src', '/assets/images/homepage-c/phase3/brand/haode-official-trimmed.webp');
  await expect(page.locator('.c-primary-nav')).toContainText('Pantallas');
  await expect(page.locator('.c-nav-actions a[href*="wa.me"]')).toBeVisible();
  await expect(page.locator('.c-nav-actions a[href="/app/"]')).toBeVisible();
});

test('ultrawide homepage keeps a centered readable content width', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1000 });
  const box = await page.locator('.c-hero-layout').boundingBox();
  expect(box.width).toBeGreaterThanOrEqual(1200);
  expect(box.width).toBeLessThanOrEqual(1500);
  expect(Math.abs(box.x - (1920 - box.x - box.width))).toBeLessThanOrEqual(2);
});

test('featured products form a complete responsive product rail', async ({ page }) => {
  const rail = page.locator('[data-ui-id="home-featured-products"] .c-product-rail');
  const cards = rail.locator('.c-product-card');
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(cards).toHaveCount(8);
  expect(await cards.first().evaluate((element) => element.getBoundingClientRect().width)).toBeGreaterThanOrEqual(200);
  await page.setViewportSize({ width: 768, height: 1024 });
  expect(await cards.first().evaluate((element) => element.getBoundingClientRect().width)).toBeGreaterThanOrEqual(190);
  await expect(rail).toHaveCSS('overflow-x', 'auto');
});

test('desktop navigation hover remains readable and restrained', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const link = page.locator('.c-primary-nav a').filter({ hasText: 'Pantallas' });
  await link.hover();
  const style = await link.evaluate((element) => ({ color: getComputedStyle(element).color, fontSize: parseFloat(getComputedStyle(element).fontSize) }));
  expect(style.color).toBe('rgb(255, 75, 24)');
  expect(style.fontSize).toBeGreaterThanOrEqual(12);
});

test('desktop header and hero labels use readable type sizes', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const sizes = await page.evaluate(() => ({
    nav: parseFloat(getComputedStyle(document.querySelector('.c-primary-nav a')).fontSize),
    title: parseFloat(getComputedStyle(document.querySelector('.c-hero h1')).fontSize),
    promise: parseFloat(getComputedStyle(document.querySelector('.c-hero-lead')).fontSize),
  }));
  expect(sizes.nav).toBeGreaterThanOrEqual(12);
  expect(sizes.title).toBeGreaterThanOrEqual(52);
  expect(sizes.promise).toBeGreaterThanOrEqual(16);
});

test('mobile header is compact, readable, and keyboard-operable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const menu = page.locator('.c-menu-button');
  await expect(menu).toBeVisible();
  await expect(page.locator('.c-primary-nav')).toBeHidden();
  await menu.focus();
  await page.keyboard.press('Enter');
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('.c-primary-nav a').first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
});
