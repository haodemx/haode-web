const { test, expect } = require('@playwright/test');

const BASE_URL = (process.env.BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const CONSENT_STORAGE_KEY = 'haode-privacy-consent-v1';

test.beforeEach(async ({ page }) => {
  await page.addInitScript((key) => {
    localStorage.setItem(key, JSON.stringify({
      version: 1,
      analytics: false,
      advertising: false,
      updatedAt: new Date().toISOString(),
    }));
  }, CONSENT_STORAGE_KEY);
});

test('desktop header keeps one primary action and a compact catalog search', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });

  const header = page.locator('.reference-header');
  const topLine = page.locator('.reference-desktop-head');
  const appAction = page.locator('.reference-head-account');
  const whatsappAction = page.locator('.reference-nav-actions a[href*="wa.me"]');
  const catalogAction = page.locator('.reference-nav-actions a[href="/app/"]');
  const headerSearch = page.locator('.reference-header-search');

  await expect(header).toBeVisible();
  await expect(topLine).toHaveCSS('height', '30px');
  await expect(topLine).toHaveCSS('background-color', 'rgb(17, 17, 17)');
  await expect(appAction).toBeHidden();
  await expect(catalogAction).toBeHidden();
  await expect(whatsappAction).toBeVisible();
  await expect(whatsappAction).toHaveCSS('background-color', 'rgb(8, 122, 66)');
  await expect(headerSearch).toBeVisible();
  await expect(headerSearch.locator('input')).toHaveAttribute('placeholder', 'Busca por modelo, marca o SKU');

  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/homepage-header-desktop.png', fullPage: false });
});

test('ultrawide homepage keeps a readable maximum content width', async ({ page }) => {
  await page.setViewportSize({ width: 2048, height: 1139 });
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });

  const layout = await page.locator('.reference-hero .reference-wrap').evaluate((wrap) => {
    const rect = wrap.getBoundingClientRect();
    return {
      left: rect.left,
      width: rect.width,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });

  expect(layout.left).toBeGreaterThanOrEqual(380);
  expect(layout.width).toBeGreaterThanOrEqual(1200);
  expect(layout.width).toBeLessThanOrEqual(1241);
  expect(layout.overflow).toBeLessThanOrEqual(1);
});

test('desktop navigation hover stays quiet and keeps readable text', async ({ page }) => {
  await page.setViewportSize({ width: 2048, height: 1139 });
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });

  const link = page.locator('.reference-nav a[href="/app/#lista"]');
  await link.hover();
  const state = await link.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      background: style.backgroundColor,
      color: style.color,
    };
  });

  expect(state.background).toBe('rgba(0, 0, 0, 0)');
  expect(state.color).toBe('rgb(201, 54, 12)');
});

test('desktop header and above-fold support labels use readable type sizes', async ({ page }) => {
  await page.setViewportSize({ width: 2048, height: 1139 });
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });

  const sizes = await page.locator('.reference-header').evaluate((header) => {
    const px = (selector) => parseFloat(getComputedStyle(document.querySelector(selector)).fontSize);
    return {
      nav: px('.reference-nav a'),
      headerStrong: px('.reference-head-info strong'),
      headerSmall: px('.reference-head-info small'),
      benefitStrong: px('.reference-quick-points article strong'),
      benefitSmall: px('.reference-quick-points article small'),
    };
  });

  expect(sizes.nav).toBeGreaterThanOrEqual(14);
  expect(sizes.headerStrong).toBeGreaterThanOrEqual(11);
  expect(sizes.headerSmall).toBeGreaterThanOrEqual(10);
  expect(sizes.benefitStrong).toBeGreaterThanOrEqual(15);
  expect(sizes.benefitSmall).toBeGreaterThanOrEqual(13);
});

test('mobile header remains compact, readable, and keyboard-operable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });

  await expect(page.locator('.reference-logo')).toBeVisible();
  const desktopInfo = page.locator('.reference-head-info');
  await expect(desktopInfo).toHaveCount(2);
  await expect(desktopInfo.first()).toBeHidden();
  await expect(desktopInfo.last()).toBeHidden();
  await expect(page.locator('.reference-nav-actions a[href*="wa.me"]')).toBeHidden();
  await expect(page.locator('.reference-nav-actions a[href="/app/"]')).toBeHidden();

  const search = page.locator('.reference-hero-search');
  const heading = page.locator('.reference-hero h1');
  const positions = await Promise.all([
    search.evaluate((element) => element.getBoundingClientRect().top),
    heading.evaluate((element) => element.getBoundingClientRect().top),
  ]);
  expect(positions[0]).toBeLessThan(positions[1]);

  const mobileActions = page.locator('.haode-mobile-checkout-bar');
  await expect(mobileActions).toBeVisible();
  await expect(mobileActions).toHaveCSS('position', 'fixed');
  await expect(mobileActions.locator('a.is-primary')).toContainText('Cotizar por WhatsApp');

  const menu = page.locator('[data-reference-menu-button]');
  await menu.focus();
  await page.keyboard.press('Enter');
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#primary-navigation')).toBeVisible();

  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/homepage-header-mobile.png', fullPage: false });
});
