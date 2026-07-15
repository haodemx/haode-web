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

test('products absent from the approved exact match remain unpublished in App', () => {
  assert.equal(appProducts.some((product) => product.id === 'iphone-oled-12mini'), false);
  const websiteProduct = byId(website, 'iphone-oled-12mini');
  assert.equal(websiteProduct.prices.every((entry) => entry.price === 'Consultar'), true);
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
