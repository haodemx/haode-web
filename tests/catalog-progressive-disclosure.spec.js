const { test, expect } = require('@playwright/test');

const BASE_URL = (process.env.BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');

test.describe('catalog progressive disclosure', () => {
  test('mobile catalog limits long categories and reveals the remaining models on demand', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/productos/`, { waitUntil: 'domcontentloaded' });

    const longCategory = page.locator('.catalog-category-block').filter({
      has: page.locator('[data-catalog-reveal]'),
    }).first();
    await expect(longCategory).toBeVisible();

    const cards = longCategory.locator('[data-catalog-card]');
    const initialVisibleCards = longCategory.locator('[data-catalog-card]:visible');
    expect(await cards.count()).toBeGreaterThan(4);
    await expect(initialVisibleCards).toHaveCount(4);

    const reveal = longCategory.locator('[data-catalog-reveal]');
    await expect(reveal).toBeVisible();
    await expect(reveal).toHaveText(/Mostrar .* modelos/i);
    await expect(reveal).toHaveCSS('min-height', '44px');

    await reveal.click();
    await expect(longCategory.locator('[data-catalog-card]:visible')).toHaveCount(await cards.count());
    await expect(reveal).toBeHidden();
  });

  test('catalog search exposes every matching model even when its category is collapsed', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/productos/?q=LK-007`, { waitUntil: 'domcontentloaded' });

    const matchingCard = page.locator('[data-catalog-card]:visible').filter({ hasText: 'LK-007' });
    await expect(matchingCard).toHaveCount(1);
    await expect(matchingCard).toBeVisible();
  });
});
