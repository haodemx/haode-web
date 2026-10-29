const { test, expect } = require('@playwright/test');
const fs = require('fs');
const BASE = (process.env.BASE_URL || 'http://127.0.0.1:4188').replace(/\/$/, '');
const app = JSON.parse(fs.readFileSync('app/products.json', 'utf8'));
// These independent expected values are transcribed from the Owner's November PDF.
const cases = [
  ['iphone-incell-xr', [175,165,160,155]],
  ['iphone-incell-xr-bolsa-protectora', [170,160,150,145]],
  ['iphone-incell-11-bolsa-protectora', [170,160,150,145]],
  ['gafas-ai-gafas-ai-m08', [1000,945,870,845]],
  ['mica-hd', [375,325,300,275]],
  ['x200t-cortadora-micas', [6100,5900,5600,5400]],
  ['samsung-incell-s23-ultra', [480,455,430,410]],
  ['samsung-oled-s23-ultra', [1755,1700,1535,1425]],
  ['lk-030-mini-camara-retro-digital', [440,330]],
];
for (const width of [390,1440]) for (const [id, prices] of cases) {
  test(`November approved price survives stale ERP ${id} ${width}`, async ({ page }, info) => {
    const p = app.find(p => p.id === id);
    await page.setViewportSize({ width, height:900 });
    await page.route('**/*', r => new URL(r.request().url()).origin === new URL(BASE).origin && r.request().method() === 'GET' ? r.continue() : r.abort());
    await page.addInitScript(() => localStorage.setItem('haode-privacy-consent-v1', JSON.stringify({version:1,analytics:false,advertising:false})));
    await page.route('**/public-stock.json**', r => r.fulfill({json:[]}));
    await page.route('**/api/public/catalog**', r => r.fulfill({json:{products:[{
      sku:p.sku || id, slug:id, public_name_es:p.nombre, category:p.categoria,
      model:'OLD ERP MODEL', quality:'OLD ERP QUALITY', description_es:'Old ERP price $999 MXN',
      public_price_mxn:999, public_price_tiers:[], stock_status:'ask_stock',
      stock_label:'Inventario de prueba — no real',
    }]}}));
    await page.goto(`${BASE}/app/?utm_source=november_price_qa#producto/${id}`, {waitUntil:'domcontentloaded'});
    await expect.poll(() => page.evaluate(() => window.HAODE_DIAGNOSTICS?.externalRefresh?.phase)).toBe('complete');
    const diagnostic = await page.evaluate(() => window.HAODE_DIAGNOSTICS);
    expect(diagnostic.catalogAttempts.at(-1).status).toBe('success');
    expect((await page.locator('.price-stack strong').allTextContents()).map(v => Number(v.replace(/[^0-9.]/g,'')))).toEqual(prices);
    // Samsung display names omit "para" in the existing compact App heading.
    await expect(page.locator('main')).toContainText(p.nombre.replace('Pantalla para Samsung', 'Pantalla Samsung'));
    await expect(page.locator('main')).not.toContainText('OLD ERP');
    // Prove the exact local SKU was enriched, rather than silently ignoring the fixture.
    await expect(page.locator('main')).toContainText('Inventario de prueba — no real');
    const quote = new URL(await page.locator('[data-detail-whatsapp]').getAttribute('href'));
    expect(quote.pathname).toBe('/523326684296');
    expect(quote.searchParams.get('text')).toContain('november_price_qa');
    expect(quote.searchParams.get('text')).not.toContain('999');
    // Products whose official SKU is pending retain the "Referencia web" label.
    expect(quote.searchParams.get('text')).toContain(p.sku || id);
    if (id.includes('bolsa')) expect(quote.searchParams.get('text')).toContain('HD+ C/IC');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await page.screenshot({path:info.outputPath('new-price-app.png')});
    await page.goto(`${BASE}/producto/${id}/`, {waitUntil:'networkidle'});
    const nodes = await page.locator('script[type="application/ld+json"]').evaluateAll(xs => xs.flatMap(s => {const j=JSON.parse(s.textContent);return j['@graph']||[j];}));
    expect(nodes.find(n => n['@type']==='Product').offers.map(o => Number(o.price))).toEqual(prices);
    expect((await page.locator('[data-detail-price-body] td').allTextContents()).map(v => Number(v.replace(/[^0-9.]/g,'')))).toEqual(prices);
    await expect(page.locator('main')).not.toContainText('Old ERP');
    await page.screenshot({path:info.outputPath('new-price-website.png')});
  });
}
