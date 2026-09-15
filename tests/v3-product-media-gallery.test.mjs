import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const productsScript = fs.readFileSync(new URL('../products.js', import.meta.url), 'utf8');
const productTemplate = fs.readFileSync(new URL('../producto.html', import.meta.url), 'utf8');
const generator = fs.readFileSync(new URL('../scripts/sync-customer-prices.js', import.meta.url), 'utf8');

test('ProductMediaGallery is the shared exact-product media renderer', () => {
  assert.match(productsScript, /class ProductMediaGallery/);
  assert.match(productsScript, /hasExactProductMediaDirectory/);
  assert.match(productsScript, /this\.hasExactProductDirectory/);
  assert.match(productsScript, /directory === this\.productDirectory/);
  assert.match(productsScript, /data\.mediaSku|dataset\.mediaSku/);
  assert.match(productsScript, /data\.mediaModel|dataset\.mediaModel/);
  assert.match(productsScript, /data\.mediaQuality|dataset\.mediaQuality/);
  assert.doesNotMatch(productsScript, /Más fotos y videos próximamente\./);
});

test('product templates use the shared media slots without coming-soon filler', () => {
  for (const source of [productTemplate, generator]) {
    assert.match(source, /data-detail-gallery/);
    assert.match(source, /data-detail-videos/);
    assert.match(source, /Fotos del producto/);
    assert.match(source, /Video de prueba/);
    assert.doesNotMatch(source, /Más fotos y videos próximamente/);
  }
});

test('unconfirmed product imagery uses the authoritative asset status', () => {
  assert.match(productsScript, /imageStatus\.textContent = 'REAL ASSET REQUIRED'/);
  assert.match(generator, /REAL ASSET REQUIRED/);
});
