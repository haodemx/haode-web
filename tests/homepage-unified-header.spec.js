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

test('desktop header keeps actions inside one restrained dark surface', async ({ page }) => {
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
  await expect(appLabel).toHaveCSS('color', 'rgb(255, 122, 58)');
  await expect(appAction).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(whatsappAction).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(catalogAction).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(activeNavigation).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');

  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/homepage-header-desktop.png', fullPage: false });
});

test('mobile header remains compact, readable, and keyboard-operable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });

  await expect(page.locator('.reference-logo')).toBeVisible();
  const desktopInfo = page.locator('.reference-head-info');
  await expect(desktopInfo).toHaveCount(2);
  await expect(desktopInfo.first()).toBeHidden();
  await expect(desktopInfo.last()).toBeHidden();
  await expect(page.locator('.reference-nav-actions a[href*="wa.me"]')).toBeVisible();
  await expect(page.locator('.reference-nav-actions a[href="/app/"]')).toBeVisible();

  const menu = page.locator('[data-reference-menu-button]');
  await menu.focus();
  await page.keyboard.press('Enter');
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#primary-navigation')).toBeVisible();

  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/homepage-header-mobile.png', fullPage: false });
});
