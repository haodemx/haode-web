const { test, expect } = require('@playwright/test');

const baseURL = (process.env.BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');

test.beforeEach(async ({ page }) => {
  await page.route('https://erp.haode.com.mx/**', route => route.fulfill({
    status: 200, contentType: 'application/json', body: '[]',
  }));
  await page.setViewportSize({ width: 390, height: 844 });
});

async function search(page, surface, query) {
  if (surface === 'app') {
    await page.goto(`${baseURL}/app/#lista`, { waitUntil: 'domcontentloaded' });
    await page.locator('[data-search-products]').fill(query);
    await expect(page.locator('[data-app-status]')).toContainText(query);
    return page.locator('.product-card h3').allTextContents();
  }
  await page.goto(`${baseURL}/productos/?q=${encodeURIComponent(query)}`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-site-catalog-search-input]')).toHaveValue(query);
  await expect(page.locator('[data-site-catalog-status]')).toContainText('encontrado');
  return page.locator('[data-site-search-item] h3').allTextContents();
}

for (const surface of ['app', 'website']) {
  for (const query of ['iphone1212', 'iphone1212pro']) {
    test(`${surface}: alternative-model separator never creates ${query}`, async ({ page }) => {
      const validQuery = query.endsWith('pro') ? 'iphone12pro' : 'iphone12';
      expect((await search(page, surface, validQuery)).length).toBe(query.endsWith('pro') ? 6 : 8);
      expect(await search(page, surface, query)).toEqual([]);
    });
  }
  for (const [spaced, compact] of [['Z FLIP5', 'zflip5'], ['S20 5G', 's205g']]) {
    test(`${surface}: ${compact} finds the actual ${spaced} catalog entries`, async ({ page }) => {
      const expected = await search(page, surface, spaced);
      expect(expected.length, spaced).toBeGreaterThan(0);
      expect(expected.every(name => name.replace(/\s/g, '').toLowerCase().includes(compact))).toBe(true);
      expect(await search(page, surface, compact)).toEqual(expected);
    });
  }
  test(`${surface}: compact matching never accepts a partial or different model number`, async ({ page }) => {
    for (const query of ['zflip50', 'zflip500', 's2050g', 's20500g', '205', 's205', 's2g', 's230ultra', 's2ultra', '???']) {
      expect(await search(page, surface, query), query).toEqual([]);
    }
    expect(await page.locator('a[href*="wa.me"]').count()).toBeGreaterThan(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  });
}
