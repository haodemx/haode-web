const { test, expect } = require('@playwright/test');
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const BASE = (process.env.BASE_URL || 'http://127.0.0.1:4188').replace(/\/$/, '');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../data/products.generated.js'), 'utf8'), context);
const products = context.window.HAODE_PRODUCTS_DATA;
// Public ERP values captured 2026-10-26. These older quoted amounts must not
// replace the approved customer workbook, including in descriptive text.
const erp = {
  sku: 'IP-XR-INCELL-FHD', public_name_es: 'Pantalla iPhone XR INCELL FHD',
  model: 'Pantalla iPhone XR INCELL FHD', quality: 'INCELL FHD',
  description_es: '100 pzs surtido: 170; 100 pzs/modelo: 165; Nota: Tamaño original; Fuente: Lista_Precios',
  public_price_mxn: 180, public_price_tiers: [
    { code: 'WHOLESALE_5', unit_price_mxn: 175 },
    { code: 'MIXED_100', unit_price_mxn: 170 },
    { code: 'MODEL_100', unit_price_mxn: 165 },
    { code: 'BOX_MODEL', unit_price_mxn: 155 },
  ], price_status: 'confirmed', stock_status: 'available', stock_label: 'Disponible', sales_available: true,
};
const readSchemas = () => [...document.querySelectorAll('script[type="application/ld+json"]')]
  .flatMap(script => { const data = JSON.parse(script.textContent); return data['@graph'] || [data]; });

test.beforeEach(async ({ page }) => {
  await page.route('**/*', route => {
    const req = route.request();
    return new URL(req.url()).origin === new URL(BASE).origin && req.method() === 'GET'
      ? route.continue() : route.fulfill({ status: 200, body: '' });
  });
  await page.addInitScript(() => localStorage.setItem('haode-privacy-consent-v1', JSON.stringify({version: 1, analytics: false, advertising: false})));
  await page.route('**/public-stock.json**', route => route.fulfill({ json: [] }));
});

for (const available of [true, false]) {
  test(`XR schemas stay consistent with approved visible facts: ERP ${available ? 'refresh' : 'unavailable'}`, async ({ page }) => {
    await page.route('**/api/public/catalog**', route => route.fulfill(available
      ? { json: { products: [erp] } } : { status: 503, json: {error: 'isolated outage'} }));
    await page.goto(`${BASE}/producto/iphone-incell-xr/?utm_source=schema-audit#prices`, {waitUntil: 'networkidle'});
    const source = products.find(p => p.id === 'iphone-incell-xr');
    await expect.soft(page.locator('[data-detail-description]')).toHaveText(source.description);
    await expect(page.locator('[data-detail-quality]')).toHaveText(source.quality);
    const nodes = await page.evaluate(readSchemas);
    const product = nodes.find(n => n['@type'] === 'Product');
    expect(product.name).toContain('iPhone XR');
    expect(product.name).toContain('INCELL');
    expect.soft(product.description).toBe(await page.locator('[data-detail-description]').textContent());
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(product.url).toBe(canonical);
    for (const [i, offer] of product.offers.entries()) {
      expect.soft(offer.url).toBe(canonical);
      expect(offer.priceCurrency).toBe('MXN');
      expect(Number(offer.price)).toBe([175, 165, 160, 155][i]);
      expect(offer).not.toHaveProperty('availability');
    }
    expect(product).not.toHaveProperty('aggregateRating');
    expect(product).not.toHaveProperty('review');
    expect(product).not.toHaveProperty('hasCertification');
    const breadcrumb = nodes.find(n => n['@type'] === 'BreadcrumbList').itemListElement;
    expect(breadcrumb.map(n => n.position)).toEqual([1,2,3]);
    expect(breadcrumb.at(-1).item).toBe(canonical);
    const org = nodes.find(n => n['@type'] === 'Organization');
    expect(org['@id']).toBe('https://haode.com.mx/#organization');
    expect(org.url).toBe('https://haode.com.mx/');
    expect(org.name).toBe('HAODE México');
  });
}

for (const id of ['samsung-incell-note-10-lite', 'samsung-incell-note-20', 'samsung-incell-s10-lite', 'samsung-original-z-fold4', 'mica-hd', 'x200t-cortadora-micas', 'gafas-ai-gafas-ai-m02']) {
  test(`${id} Product offers and description match the rendered page`, async ({ page }) => {
    await page.route('**/api/public/catalog**', route => route.fulfill({json: {products: []}}));
    await page.goto(`${BASE}/producto/${id}/?utm_source=schema-audit`, {waitUntil: 'networkidle'});
    const nodes = await page.evaluate(readSchemas);
    const product = nodes.find(n => n['@type'] === 'Product');
    expect(product).toBeTruthy();
    expect(product.description).toBe((await page.locator('[data-detail-description]').textContent()).trim());
    const rows = await page.locator('[data-detail-price-body] tr').evaluateAll(rows => rows.map(row => ({
      name: row.querySelector('th').textContent.trim(),
      price: row.querySelector('td').textContent.trim(),
    })));
    const expected = rows.filter(r => /[0-9]/.test(r.price)).map(r => ({name: r.name, price: r.price.replace(/[^0-9.]/g, '')}));
    expect(product.offers.map(o=>({name:o.name,price:o.price}))).toEqual(expected);
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    for (const offer of product.offers) {
      expect(offer.url).toBe(canonical);
      expect(offer).not.toHaveProperty('availability');
    }
    const breadcrumb = nodes.find(n => n['@type'] === 'BreadcrumbList');
    expect(breadcrumb.itemListElement.at(-1).item).toBe(canonical);
    expect(breadcrumb.itemListElement.map(i=>i.position)).toEqual([1,2,3]);
  });
}
