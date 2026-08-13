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

test('desktop header keeps actions inside one restrained editorial surface', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });

  const header = page.locator('.reference-header');
  const appAction = page.locator('.reference-head-account');
  const appLabel = appAction.locator('strong');
  const whatsappAction = page.locator('.reference-nav-actions a[href*="wa.me"]');
  const catalogAction = page.locator('.reference-nav-actions a[href="/app/"]');
  const activeNavigation = page.locator('.reference-nav a.is-active');

  await expect(header).toBeVisible();
  await expect(appLabel).toHaveText('Abrir APP');
  await expect(appLabel).toHaveCSS('color', 'rgb(255, 88, 31)');
  await expect(appAction).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(whatsappAction).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(catalogAction).toHaveCSS('background-color', 'rgb(16, 16, 18)');
  await expect(activeNavigation).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');

  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/homepage-header-desktop.png', fullPage: false });
});

test('ultrawide homepage keeps side gutters proportional to the viewport', async ({ page }) => {
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

  expect(layout.left).toBeLessThanOrEqual(240);
  expect(layout.width).toBeGreaterThanOrEqual(1560);
  expect(layout.overflow).toBeLessThanOrEqual(1);
});

test('desktop navigation hover stays light with readable contrast', async ({ page }) => {
  await page.setViewportSize({ width: 2048, height: 1139 });
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });

  const link = page.locator('.reference-nav a[href="/productos/#pantallas"]');
  await link.hover();
  const state = await link.evaluate((element) => {
    const parseRgb = (value) => (value.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
    const luminance = (value) => {
      const channels = parseRgb(value).map((channel) => {
        const normalized = channel / 255;
        return normalized <= 0.03928
          ? normalized / 12.92
          : ((normalized + 0.055) / 1.055) ** 2.4;
      });
      return (0.2126 * channels[0]) + (0.7152 * channels[1]) + (0.0722 * channels[2]);
    };
    const style = getComputedStyle(element);
    const foreground = luminance(style.color);
    const background = luminance(style.backgroundColor);
    return {
      background,
      contrast: (Math.max(foreground, background) + 0.05)
        / (Math.min(foreground, background) + 0.05),
    };
  });

  expect(state.background).toBeGreaterThanOrEqual(0.75);
  expect(state.contrast).toBeGreaterThanOrEqual(4.5);
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

  expect(sizes.nav).toBeGreaterThanOrEqual(16);
  expect(sizes.headerStrong).toBeGreaterThanOrEqual(15);
  expect(sizes.headerSmall).toBeGreaterThanOrEqual(13);
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

  const menu = page.locator('[data-reference-menu-button]');
  await menu.focus();
  await page.keyboard.press('Enter');
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#primary-navigation')).toBeVisible();

  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/homepage-header-mobile.png', fullPage: false });
});
