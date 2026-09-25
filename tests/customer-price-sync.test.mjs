import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

function websiteProducts() {
  const text = fs.readFileSync(new URL('../data/products.generated.js', import.meta.url), 'utf8');
  return JSON.parse(text.slice(text.indexOf('['), text.lastIndexOf(']') + 1));
}
const website = websiteProducts();
const app = JSON.parse(fs.readFileSync(new URL('../app/products.json', import.meta.url), 'utf8'));
const source = JSON.parse(fs.readFileSync(new URL('../data/customer-price-list-2026-09-24.json', import.meta.url), 'utf8'));
const report = JSON.parse(fs.readFileSync(new URL('../docs/reports/customer-price-sync-2026-09-24.json', import.meta.url), 'utf8'));
const appJs = fs.readFileSync(new URL('../app/app.js', import.meta.url), 'utf8');

function byId(items,id){const p=items.find(x=>x.id===id);assert.ok(p,`Missing product ${id}`);return p;}
function price(product,label){return product.prices.find(x=>x.quantity===label)?.price;}

test('2026-09-24 workbook is the authoritative customer price source', () => {
  assert.equal(source.sourceVersion, '2026-09-24');
  assert.equal(source.sourceWorkbook, 'HAODE_Lista_de_Precios_2026-09-24.xlsx');
  assert.equal(source.sourceWorkbookSha256, '3afbebfaa59bbf599545ad385b7727f9b41353ebd0750abaa62be3812a609f5a');
  assert.equal(source.rows.length, 156);
  assert.deepEqual(source.rules.tiers, ['Menudeo','Mayoreo','Caja','VIP']);
  assert.equal(source.rules.automaticQuantityDiscounts, false);
});

test('website and App received all exact matched prices', () => {
  assert.equal(report.summary.websiteMatched, 152);
  assert.equal(report.summary.appMatched, 152);
  assert.equal(report.summary.ambiguous, 0);
  assert.equal(report.summary.unmatchedSource, 4);
  assert.equal(price(byId(website,'iphone-incell-11'),'Menudeo'),'$160 MXN');
  assert.equal(price(byId(website,'iphone-incell-11'),'Mayoreo'),'$150 MXN');
  assert.equal(price(byId(website,'iphone-incell-11'),'Caja'),'$145 MXN');
  assert.equal(price(byId(website,'iphone-incell-11'),'⭐ VIP'),'$140 MXN');
  assert.equal(byId(app,'iphone-incell-11').precioPublico,160);
  assert.equal(byId(app,'iphone-incell-11').precioMayoreo,150);
});

test('website and App quality labels use workbook column B for every exact match', () => {
  const sourceByLocation = new Map(source.rows.map((row) => [`${row.sourceSheet}:${row.sourceRow}`, row]));
  for (const match of report.matched) {
    const sourceRow = sourceByLocation.get(`${match.sheet}:${match.row}`);
    assert.ok(sourceRow, `Missing source row ${match.sheet}:${match.row}`);
    if (!sourceRow.quality) continue;
    assert.equal(byId(website, match.id).quality, sourceRow.quality, `${match.id} website quality`);
    assert.equal(byId(app, match.id).calidad, sourceRow.quality, `${match.id} App quality`);
  }
  assert.equal(report.summary.websiteQualityAligned, 152);
  assert.equal(report.summary.appQualityAligned, 152);
  assert.doesNotMatch(byId(website, 'iphone-incell-xr').description, /Disponible para técnicos/i);
  assert.doesNotMatch(byId(app, 'iphone-incell-xr').descripcion, /Disponible para técnicos/i);
});

test('representative OLED, diagnostic, Samsung, hydrogel and AI prices match workbook', () => {
  assert.equal(price(byId(website,'iphone-oled-13pro'),'Menudeo'),'$620 MXN');
  assert.equal(price(byId(website,'haode-pantalla-oled-diagnostica-modelo-13-pro'),'Menudeo'),'$980 MXN');
  assert.equal(price(byId(website,'samsung-incell-s8'),'Menudeo'),'$365 MXN');
  assert.equal(price(byId(website,'samsung-original-z-fold3'),'Menudeo'),'$4,100 MXN');
  assert.equal(price(byId(website,'mica-hd'),'Menudeo'),'$350 MXN');
  assert.equal(price(byId(website,'mica-hd'),'⭐ VIP'),'$250 MXN');
  assert.equal(price(byId(website,'aimb-g5-ai-sports'),'Menudeo'),'$855 MXN');
  assert.equal(price(byId(website,'gafas-ai-gafas-ai-m02'),'Caja'),'$680 MXN');
});

test('manual Mayoreo/Caja/VIP tiers are displayed but never auto-applied', () => {
  const p=byId(app,'iphone-incell-11');
  assert.deepEqual(p.priceTiers.map(x=>x.code),['WHOLESALE','BOX','VIP']);
  assert.ok(p.priceTiers.every(x=>x.autoApply===false));
  assert.ok(appJs.includes('Confirmed customer lists use named price levels'));
  for (const id of ['iphone-incell-11-bolsa-protectora', 'iphone-incell-11pro', 'iphone-incell-14', 'iphone-incell-xr-bolsa-protectora']) {
    const product = byId(app, id);
    const box = product.priceTiers.find((tier) => tier.code === 'BOX');
    assert.equal(product.offerDisplayPrice, `$${box.price.toLocaleString('es-MX')} MXN / pieza`);
    assert.equal(product.offerDisplayNote, 'Caja · confirmar por WhatsApp');
  }
});

test('source rows without an exact website product are reported, not guessed', () => {
  assert.deepEqual(report.unmatchedSource.map(x=>x.model),['Gafas AI M08 13MP','X Bolsa Protectora','Xs Bolsa Protectora','S26 Ultra']);
});

test('legacy AI product pages expose every source-backed tier and matching Product JSON-LD', () => {
  const routes = new Map([
    ['aimb-g5-ai-sports', 'ai-smart-glasses-aimb-g5.html'],
    ['haode-ai-g3-smart-glasses', 'ai-smart-glasses-aimb-g3.html'],
    ['haode-ai-w610-smart-glasses', 'ai-smart-glasses-w610.html'],
    ['w630-ai-pro', 'ai-smart-glasses-w630.html'],
  ]);
  for (const [id, route] of routes) {
    const product = byId(website, id);
    const html = fs.readFileSync(new URL(`../${route}`, import.meta.url), 'utf8');
    for (const tier of product.prices) {
      assert.match(html, new RegExp(`${tier.quantity}[\\s\\S]*?${tier.price.replace('$', '\\$')}`));
    }
    const schema = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
      .flatMap((match) => {
        const data = JSON.parse(match[1]);
        return Array.isArray(data['@graph']) ? data['@graph'] : [data];
      })
      .find((node) => node['@type'] === 'Product');
    assert.ok(schema, `${route} must contain Product JSON-LD`);
    assert.deepEqual(schema.offers.map((offer) => offer.name), product.prices.map((tier) => tier.quantity));
    assert.equal(product.prices.some((tier) => tier.quantity.includes('VIP')), true, `${id} must retain the confirmed VIP quote tier`);
  }
});

test('reapplying the customer price sync preserves named manual tiers', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'haode-price-sync-'));
  for (const directory of ['scripts', 'data', 'app', 'docs/master-data', 'docs/reports']) {
    fs.mkdirSync(path.join(root, directory), { recursive: true });
  }
  for (const file of [
    'scripts/sync-customer-prices.js',
    'data/customer-price-list-2026-09-24.json',
    'data/products.generated.js',
    'app/products.json',
    'docs/master-data/products-master.csv',
  ]) {
    fs.copyFileSync(new URL(`../${file}`, import.meta.url), path.join(root, file));
  }

  const result = spawnSync(process.execPath, [path.join(root, 'scripts/sync-customer-prices.js'), '--apply'], {
    cwd: root,
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const syncedWebsiteText = fs.readFileSync(path.join(root, 'data/products.generated.js'), 'utf8');
  const syncedWebsite = JSON.parse(syncedWebsiteText.slice(syncedWebsiteText.indexOf('['), syncedWebsiteText.lastIndexOf(']') + 1));
  const syncedApp = JSON.parse(fs.readFileSync(path.join(root, 'app/products.json'), 'utf8'));
  assert.deepEqual(byId(syncedWebsite, 'samsung-incell-s8').prices.map((row) => row.quantity), ['Menudeo', 'Mayoreo', 'Caja', '⭐ VIP']);
  assert.deepEqual(byId(syncedApp, 'samsung-incell-s8').priceTiers.map((tier) => tier.code), ['WHOLESALE', 'BOX', 'VIP']);
  assert.ok(byId(syncedApp, 'samsung-incell-s8').priceTiers.every((tier) => tier.autoApply === false));
  assert.equal(byId(syncedApp, 'iphone-incell-11-bolsa-protectora').offerDisplayPrice, '$135 MXN / pieza');
  assert.doesNotMatch(byId(syncedApp, 'iphone-incell-xr').descripcion, /Caja \$155 MXN/);

  const masterLines = fs.readFileSync(path.join(root, 'docs/master-data/products-master.csv'), 'utf8').trim().split('\n');
  const masterHeaders = masterLines[0].split(',');
  const masterRow = masterLines.find((line) => line.startsWith('iphone-incell-14,'))?.split(',');
  assert.ok(masterRow, 'master CSV must retain the matched product');
  for (const column of ['precio_publico', 'website_precio_publico', 'app_precio_publico']) {
    assert.equal(masterRow[masterHeaders.indexOf(column)], '205', `${column} must match the confirmed retail price`);
  }
  for (const column of ['precio_mayoreo', 'website_precio_mayoreo', 'app_precio_mayoreo']) {
    assert.equal(masterRow[masterHeaders.indexOf(column)], '190', `${column} must match the confirmed wholesale price`);
  }
  assert.match(masterRow[masterHeaders.indexOf('source')], /HAODE_Lista_de_Precios_2026-09-24\.xlsx/);
  assert.equal(masterRow[masterHeaders.indexOf('last_checked')], '2026-09-24');
});

test('static detail fallback updater writes four named tiers and matching Product offers', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'haode-static-price-'));
  fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
  fs.mkdirSync(path.join(root, 'data'), { recursive: true });
  fs.mkdirSync(path.join(root, 'producto/x200t-cortadora-micas'), { recursive: true });
  fs.mkdirSync(path.join(root, 'producto/x200t-legacy-route'), { recursive: true });
  fs.mkdirSync(path.join(root, 'producto/unmatched-product'), { recursive: true });
  fs.copyFileSync(new URL('../scripts/update-static-detail-price-fallbacks.js', import.meta.url), path.join(root, 'scripts/update-static-detail-price-fallbacks.js'));
  const unmatchedProduct = {
    id: 'unmatched-product',
    priceSource: 'Fuente anterior confirmada',
    prices: [{ quantity: '1 pza', price: '$999 MXN' }],
  };
  fs.writeFileSync(path.join(root, 'data/products.generated.js'), `window.HAODE_PRODUCTS_DATA = ${JSON.stringify([byId(website, 'x200t-cortadora-micas'), unmatchedProduct])};\n`);
  fs.writeFileSync(path.join(root, 'producto/x200t-cortadora-micas/index.html'), `<!doctype html><head><meta name="description" content="Texto anterior" /><meta property="og:description" content="Texto anterior" /></head><body><p>Pantalla con stock local en CDMX.</p><div><span>Stock en México bajo confirmación</span></div><p class="detail-meta" data-detail-quality>Texto anterior</p><p class="detail-description" data-detail-description>Texto anterior</p><p class="detail-price-note" data-detail-price>$6,500 MXN</p><h2>Precios por volumen</h2><p>Precios por equipo.</p><table><tbody data-detail-price-body><tr><th>Precio público</th><td>$6,500 MXN</td></tr><tr><th>Mayoreo 5+</th><td>$6,200 MXN</td></tr><tr><th>Volumen 10+</th><td>$6,000 MXN</td></tr></tbody></table><script type="application/ld+json">{"@context":"https://schema.org","@type":"Product","description":"Texto anterior","offers":{"@type":"Offer","priceCurrency":"MXN","price":"6500"}}</script></body>`);
  fs.writeFileSync(path.join(root, 'producto/x200t-legacy-route/index.html'), `<!doctype html><head><link rel="canonical" href="https://haode.com.mx/producto/x200t-cortadora-micas/" /></head><body><p class="detail-price-note" data-detail-price>$6,500 MXN</p><table><tbody data-detail-price-body><tr><th>Precio público</th><td>$6,500 MXN</td></tr></tbody></table><script type="application/ld+json">{"@context":"https://schema.org","@type":"Product","offers":{"@type":"Offer","priceCurrency":"MXN","price":"6500"}}</script></body>`);
  const unmatchedHtml = '<!doctype html><body><p class="detail-price-note" data-detail-price>$999 MXN</p><table><tbody data-detail-price-body><tr><th>1 pza</th><td>$999 MXN</td></tr></tbody></table></body>';
  fs.writeFileSync(path.join(root, 'producto/unmatched-product/index.html'), unmatchedHtml);

  const result = spawnSync(process.execPath, [path.join(root, 'scripts/update-static-detail-price-fallbacks.js')], {
    cwd: root,
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const html = fs.readFileSync(path.join(root, 'producto/x200t-cortadora-micas/index.html'), 'utf8');
  assert.match(html, /Menudeo: \$6,000 MXN/);
  assert.match(html, /<th scope="row">Menudeo<\/th>/);
  assert.match(html, /<th scope="row">Mayoreo<\/th>/);
  assert.match(html, /<th scope="row">Caja<\/th>/);
  assert.match(html, /<th scope="row">⭐ VIP<\/th>/);
  assert.match(html, /data-detail-quality>Equipo<\/p>/);
  assert.match(html, /data-detail-description>Texto anterior<\/p>/);
  const schemaText = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/)?.[1];
  const schema = JSON.parse(schemaText);
  assert.deepEqual(schema.offers.map((offer) => offer.name), ['Menudeo', 'Mayoreo', 'Caja', '⭐ VIP']);
  assert.equal(schema.description, 'Texto anterior');
  assert.match(html, /<meta name="description" content="Texto anterior" \/>/);
  assert.match(html, /<meta property="og:description" content="Texto anterior" \/>/);
  assert.doesNotMatch(html, /stock local en CDMX|Stock en México bajo confirmación/);
  assert.match(html, /Inventario ERP por confirmar/);
  const aliasHtml = fs.readFileSync(path.join(root, 'producto/x200t-legacy-route/index.html'), 'utf8');
  assert.match(aliasHtml, /Menudeo: \$6,000 MXN/);
  assert.match(aliasHtml, /<th scope="row">⭐ VIP<\/th>/);
  assert.equal(fs.readFileSync(path.join(root, 'producto/unmatched-product/index.html'), 'utf8'), unmatchedHtml);
});
