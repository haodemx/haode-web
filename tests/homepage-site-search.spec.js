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
  await page.route('https://erp.haode.com.mx/**', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
  });
});

test('homepage search stays on the website and filters the official catalog', async ({ page }) => {
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });

  const search = page.locator('[data-home-catalog-search-input]');
  await expect(search).toBeVisible();
  await search.fill('iPhone 14 Pro Max');
  await search.press('Enter');

  await expect(page).toHaveURL(/\/productos\/\?q=iPhone(?:\+|%20)14(?:\+|%20)Pro(?:\+|%20)Max$/i);
  expect(page.url()).not.toContain('/app/');

  await expect(page.locator('[data-site-catalog-search-input]')).toHaveValue('iPhone 14 Pro Max');
  await expect(page.locator('[data-site-catalog-status]')).toContainText('resultados');

  const visibleCards = page.locator('[data-site-search-item]:visible');
  expect(await visibleCards.count()).toBeGreaterThan(0);
  await expect(visibleCards.first()).toContainText(/iPhone 14 Pro Max/i);
});

test('homepage search reaches non-screen website products and handles no matches', async ({ page }) => {
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
  await page.locator('[data-home-catalog-search-input]').fill('LK-007');
  await page.locator('[data-home-catalog-search-input]').press('Enter');

  await expect(page).toHaveURL(/\/productos\/\?q=LK-007$/i);
  await expect(page.locator('[data-catalog-group="productos-ai"]')).toBeVisible();
  await expect(page.locator('[data-catalog-group="pantallas"]')).toBeHidden();
  await expect(page.locator('[data-site-search-item]:visible').first()).toContainText('LK-007');

  await page.locator('[data-site-catalog-search-input]').fill('modelo inexistente sitio 999');
  await page.locator('[data-site-catalog-search-input]').press('Enter');
  await expect(page).toHaveURL(/\/productos\/\?q=modelo(?:\+|%20)inexistente(?:\+|%20)sitio(?:\+|%20)999$/i);
  await expect(page.locator('[data-site-catalog-empty]')).toBeVisible();
  await expect(page.locator('[data-site-catalog-empty]')).toContainText('modelo inexistente sitio 999');
  await expect(page.locator('[data-catalog-group]:visible')).toHaveCount(0);
});
