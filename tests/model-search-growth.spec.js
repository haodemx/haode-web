const { test, expect } = require('@playwright/test');

const baseURL = (process.env.BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');

test.beforeEach(async ({ page }) => {
  await page.route('https://erp.haode.com.mx/**', route => route.fulfill({
    status: 200, contentType: 'application/json', body: '[]',
  }));
});

for (const surface of ['app', 'website']) {
  test(`${surface}: compact model searches find the same products as spaced models`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const search = async query => {
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
    };

    for (const [spaced, compact] of [
      ['S23 Ultra', 's23ultra'],
      ['iPhone 14 Pro Max', 'iphone14promax'],
      ['iPhone 13 Pro Max', 'iphone13promax'],
      ['LK-007', 'LK007'],
      ['máquina', 'maquina'],
    ]) {
      const expected = await search(spaced);
      expect(expected.length, spaced).toBeGreaterThan(0);
      expect(await search(compact), compact).toEqual(expected);
    }
    expect(await search('s230ultra')).toEqual([]);
    expect(await search('s2ultra')).toEqual([]);
    expect(await search('???')).toEqual([]);
    expect(await search('modelo inexistente 999')).toEqual([]);
    expect(await page.locator('a[href*="wa.me"]').count()).toBeGreaterThan(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  });
}
