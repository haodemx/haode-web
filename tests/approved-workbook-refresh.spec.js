const { test, expect } = require('@playwright/test');
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const BASE = (process.env.BASE_URL || 'http://127.0.0.1:4191').replace(/\/$/, '');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../data/products.generated.js'), 'utf8'), context);
const products = context.window.HAODE_PRODUCTS_DATA;

test.beforeEach(async ({ page }) => {
  await page.route('**/*', route => {
    const request = route.request();
    if (new URL(request.url()).origin === new URL(BASE).origin && request.method() === 'GET') return route.continue();
    return route.fulfill({ status: 200, body: '' });
  });
  await page.addInitScript(() => localStorage.setItem('haode-privacy-consent-v1', JSON.stringify({ version: 1, analytics: false, advertising: false })));
  await page.route('**/public-stock.json**', route => route.fulfill({ json: [] }));
});

const cases = [
  ['iphone-incell-xr', [160, 150, 145, 140], 'INCELL FHD C/IC'],
  ['samsung-incell-note-10-lite', [695, 650, 615, 595], 'INCELL FHD C/M'],
  ['samsung-incell-note-20', [575, 540, 505, 490], 'INCELL FHD C/M'],
  ['samsung-incell-s10-lite', [290, 270, 255, 250], 'INCELL FHD C/M'],
];
for (const [id, prices, quality] of cases) {
  test(`${id} preserves confirmed named tiers and quality while ERP refreshes stock`, async ({ page }) => {
    const product = products.find(p => p.id === id);
    await page.route('**/api/public/catalog**', route => route.fulfill({ json: { products: [{
      sku: id, slug: id, public_name_es: product.name, category: id.startsWith('iphone') ? 'iPhone INCELL' : 'Samsung INCELL',
      model: product.model, quality: 'INCELL FHD', public_price_mxn: 999,
      public_price_tiers: [
        { code: 'WHOLESALE_5', unit_price_mxn: 998 },
        { code: 'MIXED_100', unit_price_mxn: 997 },
        { code: 'MODEL_100', unit_price_mxn: 996 },
        { code: 'BOX_MODEL', unit_price_mxn: 995 },
      ],
      sales_available: true, price_status: 'confirmed', stock_status: 'available', stock_label: 'Disponible ERP', updated_at: '2026-10-26T12:00:00-06:00',
    }] } }));
    await page.goto(`${BASE}/producto/${id}/`, { waitUntil: 'networkidle' });
    await expect(page.locator('[data-detail-subtitle]').first()).toContainText('Disponible ERP');
    const table = page.locator('[data-detail-price-body]');
    for (const [i, label] of ['Menudeo', 'Mayoreo', 'Caja', '⭐ VIP'].entries()) {
      const row = table.locator('tr').filter({ hasText: label });
      await expect(row).toContainText(`$${prices[i]} MXN`);
    }
    await expect(table).not.toContainText('$999 MXN');
    await expect(page.locator('[data-detail-quality]')).toHaveText(quality);
    const offers = await page.evaluate(() => [...document.querySelectorAll('script[type=\"application/ld+json\"]')].flatMap(script => { const data = JSON.parse(script.textContent); return data['@graph'] || [data]; }).find(node => node['@type'] === 'Product').offers);
    for (const [i, label] of ['Menudeo', 'Mayoreo', 'Caja', '⭐ VIP'].entries()) {
      expect(Number(offers.find(offer => offer.name === label).price)).toBe(prices[i]);
    }
    const quote = new URL(await page.locator('[data-detail-whatsapp]').first().getAttribute('href')).searchParams.get('text');
    expect(quote).toContain(quality);
    expect(quote).toContain(`/producto/${id}/`);
  });
}

test('XR keeps approved price and quality when the catalog is unavailable', async ({ page }) => {
  await page.route('**/api/public/catalog**', route => route.fulfill({ status: 503, json: { error: 'isolated catalog unavailable' } }));
  await page.goto(`${BASE}/producto/iphone-incell-xr/`, { waitUntil: 'networkidle' });
  await expect(page.locator('[data-detail-price-body]').locator('tr').filter({ hasText: 'Caja' })).toContainText('$145 MXN');
  await expect(page.locator('[data-detail-quality]')).toHaveText('INCELL FHD C/IC');
});
