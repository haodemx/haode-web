const { test, expect } = require('@playwright/test');
const BASE = (process.env.BASE_URL || 'http://127.0.0.1:4188').replace(/\/$/, '');
const id = 'gafas-ai-gafas-ai-m08';
const readSchemas = () => [...document.querySelectorAll('script[type="application/ld+json"]')]
  .flatMap(s => { const data = JSON.parse(s.textContent); return data['@graph'] || [data]; });

for (const width of [390, 1440]) for (const available of [true, false]) {
  test(`M08 omits placeholder schema image after ERP ${available ? 'refresh' : 'failure'} at ${width}`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.route('**/*', r => new URL(r.request().url()).origin === new URL(BASE).origin && r.request().method() === 'GET' ? r.continue() : r.abort());
    await page.route('**/public-stock.json**', r => r.fulfill({ json: [] }));
    await page.route('**/api/public/catalog**', r => r.fulfill(available ? { json: { products: [{
      sku: id, public_name_es: 'Gafas AI M08', model: 'OLD ERP MODEL', quality: 'OLD ERP QUALITY',
      description_es: 'Old ERP $999', public_price_mxn: 999, public_price_tiers: [],
      image_url: 'https://haode.com.mx/assets/products/placeholder.svg',
      stock_status: 'ask_stock', stock_label: 'Inventario de prueba — no real', updated_at: '2026-10-29T00:00:00Z',
    }] } } : { status: 503, json: { error: 'isolated fixture outage' } }));
    await page.addInitScript(() => {
      localStorage.setItem('haode-privacy-consent-v1', JSON.stringify({ version: 1, analytics: false, advertising: false }));
      // An old cached HTML document must also be repaired by the current runtime.
      document.addEventListener('DOMContentLoaded', () => {
        for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
          const data = JSON.parse(script.textContent);
          for (const node of data['@graph'] || [data]) if (node['@type'] === 'Product') node.image = 'https://haode.com.mx/assets/products/placeholder.svg';
          script.textContent = JSON.stringify(data);
        }
      }, { once: true });
    });
    await page.goto(`${BASE}/producto/${id}/?utm_source=m08_image_qa`, { waitUntil: 'networkidle' });
    if (available) await expect.poll(() => page.evaluate(() => window.HAODE_PRODUCTS.find(p => p.id === 'gafas-ai-gafas-ai-m08').erpStockUpdatedAt)).toBe('2026-10-29T00:00:00Z');
    const product = (await page.evaluate(readSchemas)).find(n => n['@type'] === 'Product');
    expect(product).not.toHaveProperty('image');
    expect(product.offers.map(o => Number(o.price))).toEqual([1000, 945, 870, 845]);
    expect((await page.locator('[data-detail-price-body] td').allTextContents()).map(t => Number(t.replace(/[^0-9.]/g, '')))).toEqual([1000, 945, 870, 845]);
    expect(product.description).toBe((await page.locator('[data-detail-description]').textContent()).trim());
    expect(product).not.toHaveProperty('aggregateRating');
    expect(product).not.toHaveProperty('review');
    expect(product.offers.every(o => !('availability' in o))).toBe(true);
    const quote = new URL(await page.locator('[data-detail-whatsapp]').getAttribute('href'));
    expect(quote.pathname).toBe('/523326684296');
    expect(quote.searchParams.get('text')).toContain('M08');
    expect(quote.searchParams.get('text')).toContain('m08_image_qa');
    expect(quote.searchParams.get('text')).not.toContain('999');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await page.screenshot({ path: info.outputPath(`m08-${width}.png`) });
  });
}
