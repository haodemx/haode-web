import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

function websiteProducts() {
  const text = fs.readFileSync(new URL('../data/products.generated.js', import.meta.url), 'utf8');
  return JSON.parse(text.slice(text.indexOf('['), text.lastIndexOf(']') + 1));
}

const appProducts = JSON.parse(fs.readFileSync(new URL('../app/products.json', import.meta.url), 'utf8'));
const sourceText = fs.readFileSync(new URL('../data/customer-price-list-2026-07.json', import.meta.url), 'utf8');
const source = JSON.parse(sourceText);
const website = websiteProducts();
const masterText = fs.readFileSync(new URL('../docs/master-data/products-master.csv', import.meta.url), 'utf8');
const sitemapText = fs.readFileSync(new URL('../sitemap.xml', import.meta.url), 'utf8');
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
  assert.equal(source.sourceVersion, '2026-07-16');
  assert.equal(source.rows.length, 189);
});

test('Samsung S8 prices match the approved Lista_Precios sheet', () => {
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
  assert.equal(price(byId(website, 'iphone-incell-16e'), '1 pza'), '$400 MXN');
  assert.equal(price(byId(website, 'iphone-oled-12promax'), '1 pza'), '$700 MXN');
  assert.equal(price(byId(website, 'samsung-incell-s20-plus'), '1 pza'), '$550 MXN');
  assert.equal(byId(appProducts, 'samsung-original-note-20-ultra').precioPublico, 3000);
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
