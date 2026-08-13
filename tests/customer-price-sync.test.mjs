import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

function websiteProducts() {
  const text = fs.readFileSync(new URL('../data/products.generated.js', import.meta.url), 'utf8');
  return JSON.parse(text.slice(text.indexOf('['), text.lastIndexOf(']') + 1));
}

const appProducts = JSON.parse(fs.readFileSync(new URL('../app/products.json', import.meta.url), 'utf8'));
const sourceText = fs.readFileSync(new URL('../data/customer-price-list-2026-08.json', import.meta.url), 'utf8');
const source = JSON.parse(sourceText);
const website = websiteProducts();
const masterText = fs.readFileSync(new URL('../docs/master-data/products-master.csv', import.meta.url), 'utf8');
const sitemapText = fs.readFileSync(new URL('../sitemap.xml', import.meta.url), 'utf8');
const productsRuntimeText = fs.readFileSync(new URL('../products.js', import.meta.url), 'utf8');
const syncReport = JSON.parse(fs.readFileSync(new URL('../docs/reports/customer-price-sync-2026-08.json', import.meta.url), 'utf8'));
const deletedIds = [
  'funda-magnetica-17-pro-max',
  'funda-premium-17-pro-max',
  'funda-premium-aluminio-plus',
  'iphone-oled-12mini',
  'iphone-oled-12pro',
  'iphone-oled-13mini',
  'iphone-oled-15plus',
  'iphone-oled-16',
  'iphone-oled-16plus',
  'samsung-incell-s20',
  'samsung-oled-note-10-plus',
  'samsung-oled-note-9',
  'samsung-oled-s20',
  'samsung-oled-s20-ultra',
  'samsung-oled-s21',
  'samsung-oled-s21-plus',
  'samsung-oled-s22-plus',
  'samsung-oled-s23-plus',
  'samsung-oled-s24-plus',
  'samsung-oled-s9-plus',
];

function byId(items, id) {
  const product = items.find((entry) => entry.id === id);
  assert.ok(product, `Missing product ${id}`);
  return product;
}

function price(product, quantity) {
  return product.prices.find((entry) => entry.quantity === quantity)?.price;
}

test('public source excludes landed cost and records exact-match rules', () => {
  assert.equal(sourceText.includes('landed_cost'), false);
  assert.equal(source.rules.exactModelAndQualityOnly, true);
  assert.equal(source.rules.missingRowsAreNotPublished, true);
  assert.equal(source.sourceVersion, '2026-08-13');
  assert.equal(source.sourceWorkbookSha256, '94e18be3fddb6b06f150d02b5a11f49fba67184514be42a9433d52a784cd2a94');
  assert.equal(source.sourceSheet, 'Lista Clientes');
  assert.equal(source.rows.length, 190);
  assert.ok(productsRuntimeText.includes('HAODE_Lista_de_Precios_2026_Clientes_LIMPIA.xlsx'));
});

test('Samsung S8 prices match the approved Lista Clientes sheet', () => {
  const product = byId(website, 'samsung-incell-s8');
  assert.equal(price(product, '1 pza'), '$360 MXN');
  assert.equal(price(product, '5+ pzs'), '$350 MXN');
  assert.equal(price(product, '100 pzs surtido'), '$340 MXN');
  assert.equal(price(product, '100 pzs/modelo'), '$320 MXN');
  assert.equal(price(product, 'Caja/modelo'), '$310 MXN');
});

test('App keeps all approved tiers and never auto-applies box pricing', () => {
  const product = byId(appProducts, 'samsung-incell-s8');
  assert.equal(product.precioPublico, 360);
  assert.equal(product.precioMayoreo, 350);
  const boxTier = product.priceTiers.find((tier) => tier.code === 'BOX_MODEL');
  assert.equal(boxTier.price, 310);
  assert.equal(boxTier.autoApply, false);
});

test('products absent from the approved list are removed from every catalog source', () => {
  for (const id of deletedIds) {
    assert.equal(website.some((product) => product.id === id), false, `${id} remains on website`);
    assert.equal(appProducts.some((product) => product.id === id), false, `${id} remains in App`);
    assert.equal(masterText.split(/\r?\n/).some((line) => line.startsWith(`${id},`)), false, `${id} remains in master`);
    assert.equal(sitemapText.includes(`/producto/${id}/`), false, `${id} remains in sitemap`);
    assert.equal(fs.existsSync(new URL(`../producto/${id}/index.html`, import.meta.url)), false, `${id} static route remains`);
  }
  assert.equal(fs.existsSync(new URL('../producto/samsung-s20-incell/index.html', import.meta.url)), false);
  assert.equal(fs.existsSync(new URL('../producto/funda-premium-aluminio-estilo-iphone-17-pro-max/index.html', import.meta.url)), false);
  assert.equal(fs.existsSync(new URL('../producto/funda-magnetica-estilo-iphone-17-pro-max/index.html', import.meta.url)), false);
});

test('updated prices use the new main sheet and preserve approved siblings', () => {
  assert.equal(price(byId(website, 'iphone-incell-16e'), '1 pza'), '$300 MXN');
  assert.equal(price(byId(website, 'iphone-oled-12promax'), '1 pza'), '$700 MXN');
  assert.equal(price(byId(website, 'samsung-incell-s20-plus'), '1 pza'), '$550 MXN');
  assert.equal(byId(appProducts, 'samsung-original-note-20-ultra').precioPublico, 3000);
  assert.equal(price(byId(website, 'mica-hd'), '10+ paquetes'), '$300 MXN');
  assert.equal(price(byId(website, 'aimb-g5-ai-sports'), '5+ pzs'), '$855 MXN');
  assert.equal(byId(appProducts, 'lk-018-camara-accion-hd').precioPublico, 850);
});

test('iPhone 11 standard FHD uses its confirmed media without changing Bolsa Protectora', () => {
  const standardWebsite = byId(website, 'iphone-incell-11');
  const standardApp = byId(appProducts, 'iphone-incell-11');
  const bagWebsite = byId(website, 'iphone-incell-11-bolsa-protectora');
  const bagApp = byId(appProducts, 'iphone-incell-11-bolsa-protectora');

  assert.equal(standardWebsite.quality, 'INCELL FHD');
  assert.equal(standardWebsite.name, 'Pantalla iPhone 11 INCELL FHD');
  assert.equal(standardWebsite.images[0], 'assets/products/iphone-incell/11/fhd-main.jpg');
  assert.equal(standardApp.modelo, 'iPhone 11 INCELL FHD');
  assert.equal(standardApp.nombre, 'Pantalla iPhone 11 INCELL FHD');
  assert.equal(standardApp.imagen, '/assets/products/iphone-incell/11/fhd-main.jpg');
  assert.deepEqual(standardWebsite.prices.map((entry) => entry.price), [
    '$180 MXN',
    '$175 MXN',
    '$170 MXN',
    '$165 MXN',
    '$155 MXN',
  ]);
  assert.equal(bagWebsite.images[0], 'assets/products/iphone-incell/11-bolsa-protectora/main.jpg');
  assert.equal(bagApp.imagen, '/assets/products/iphone-incell/11-bolsa-protectora/main.jpg');
});

test('approved diagnostic price tiers are complete', () => {
  const product = byId(website, 'haode-pantalla-oled-diagnostica-modelo-13-pro');
  assert.deepEqual(product.prices.map((entry) => entry.price), [
    '$1,300 MXN',
    '$1,250 MXN',
    '$1,200 MXN',
    '$1,150 MXN',
    '$1,050 MXN',
  ]);
});

test('every unique approved price-list product is aligned across website and App', () => {
  assert.equal(website.length, 186);
  assert.equal(appProducts.length, 186);
  assert.deepEqual(
    website.map((product) => product.id).sort(),
    appProducts.map((product) => product.id).sort()
  );
  assert.equal(syncReport.summary.sourceRows, 190);
  assert.equal(syncReport.summary.uniqueSourceProducts, 186);
  assert.equal(syncReport.summary.websiteChanged, 45);
  assert.equal(syncReport.summary.appChanged, 45);
  assert.equal(syncReport.summary.unpublishedSourceRows, 8);
  assert.equal(syncReport.summary.unmatchedWebsite, 5);
  assert.equal(syncReport.summary.unmatchedApp, 5);
  assert.equal(syncReport.summary.ambiguous, 0);
  assert.equal(syncReport.summary.duplicateSourceRows, 0);
});

test('new products use approved prices and authorized media placeholders without fake official SKUs', () => {
  const softOled = byId(website, 'iphone-oled-soft-14');
  const phone = byId(website, 'celular-samsung-s9-6-plus-64');
  const appPhone = byId(appProducts, phone.id);
  assert.equal(price(softOled, '1 pza'), '$1,000 MXN');
  assert.equal(softOled.images[0], 'assets/products/placeholder.svg');
  assert.equal(softOled.officialSkuPending, true);
  assert.equal(phone.category, 'celulares-samsung');
  assert.equal(appPhone.categoria, 'Celulares Samsung');
  assert.equal(appPhone.imagen, '/assets/products/placeholder.svg');
  assert.equal(appPhone.officialSkuPending, true);
  assert.ok(sitemapText.includes(`/producto/${phone.id}/`));
  assert.ok(fs.existsSync(new URL(`../producto/${phone.id}/index.html`, import.meta.url)));
});

test('rows without an exact product match are reported and existing products keep their prices', () => {
  const unmatched = [...syncReport.report.unmatchedWebsite].sort();
  assert.deepEqual(unmatched, [
    'fundas-funda-5in1-con-mica-premium-3d',
    'fundas-kit-aluminio-de-17promax-con-logo',
    'fundas-kit-aluminio-de-17promax-sin-logo',
    'gafas-ai-gafas-ai-m02',
    'gafas-ai-gafas-ai-m08',
  ]);
  assert.deepEqual(syncReport.report.unpublishedSourceRows.map((row) => row.sourceRow), [
    20, 22, 186, 187, 188, 189, 190, 200,
  ]);
  assert.equal(price(byId(website, 'gafas-ai-gafas-ai-m08'), '1 pza'), '$1,700 MXN');
  assert.equal(byId(appProducts, 'gafas-ai-gafas-ai-m02').precioPublico, 1600);
});

test('legacy customer-visible pages use the approved prices', () => {
  const files = [
    ['../ai-smart-glasses-aimb-g5.html', ['$1000 MXN', '$855 MXN']],
    ['../ai-smart-glasses-s1.html', ['$545 MXN', '$510 MXN']],
    ['../ai-smart-glasses-w630.html', ['$1200 MXN', '$1000 MXN']],
    ['../producto/lk-018-camara-accion-hd/index.html', ['$850 MXN', '$700 MXN']],
    ['../producto/lk-032-camara-inteligente-con-gimbal/index.html', ['$500 MXN', '$400 MXN']],
    ['../micas.html', ['$400 MXN', '$350 c/u', '$300 c/u']],
  ];
  for (const [path, prices] of files) {
    const html = fs.readFileSync(new URL(path, import.meta.url), 'utf8');
    for (const expected of prices) assert.ok(html.includes(expected), `${path} is missing ${expected}`);
  }
});

test('static price fallback generation preserves valid product JSON-LD', () => {
  const productRoot = new URL('../producto/', import.meta.url);
  for (const entry of fs.readdirSync(productRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const file = new URL(`${entry.name}/index.html`, productRoot);
    if (!fs.existsSync(file)) continue;
    const html = fs.readFileSync(file, 'utf8');
    const blocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
    for (const [, block] of blocks) {
      assert.doesNotThrow(() => JSON.parse(block), `${entry.name} contains invalid JSON-LD`);
    }
  }
});
