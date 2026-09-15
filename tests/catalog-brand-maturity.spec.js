const { test, expect } = require('@playwright/test');

const BASE_URL = (process.env.BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');

test('catalog cards use a restrained retail presentation instead of template effects', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE_URL}/productos/`, { waitUntil: 'domcontentloaded' });

  const card = page.locator('[data-catalog-card]:visible').first();
  await expect(card).toHaveCSS('background-image', 'none');
  await expect(card).toHaveCSS('box-shadow', 'none');
  await expect(card).toHaveCSS('border-radius', '0px');
  await expect(card.locator('img')).toHaveCSS('object-fit', 'contain');
  await expect(card.locator('.v3-product-meta')).toBeVisible();
});
