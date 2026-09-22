import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

const expected = [
  ['mica-hd', ['350', '300', '275', '250']],
  ['mica-matte', ['350', '300', '275', '250']],
  ['mica-privacidad-hd', ['800', '750', '700', '650']],
  ['mica-privacidad-matte', ['800', '750', '700', '650']],
  ['x200t-cortadora-micas', ['6000', '5800', '5500', '5300']],
];

function schemas(html) {
  return [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .flatMap((match) => {
      const parsed = JSON.parse(match[1].trim());
      return Array.isArray(parsed['@graph']) ? parsed['@graph'] : [parsed];
    });
}

test('five candidate pages publish the source-backed named tiers without automatic quantity thresholds', () => {
  for (const [id, prices] of expected) {
    const html = read(`producto/${id}/index.html`);
    assert.match(html, /data-detail-price>Menudeo:/, `${id} main price is not Menudeo`);
    for (const label of ['Menudeo', 'Mayoreo', 'Caja', '⭐ VIP']) {
      assert.ok(html.includes(`<th scope="row">${label}</th>`), `${id} missing ${label}`);
    }

    const product = schemas(html).find((node) => node['@type'] === 'Product');
    assert.ok(product, `${id} missing Product schema`);
    assert.equal(product.offers.length, 4, `${id} must expose exactly four offers`);
    assert.deepEqual(product.offers.map((offer) => offer.price), prices);
    assert.deepEqual(product.offers.map((offer) => offer.name), ['Menudeo', 'Mayoreo', 'Caja', '⭐ VIP']);
    assert.ok(product.offers.every((offer) => !('eligibleQuantity' in offer)));
    assert.ok(product.offers.every((offer) => !('priceSpecification' in offer)));
  }
});

test('OEM landing contains only the owner-approved scope and conversion route', () => {
  const html = read('micas-hidrogel-marca-propia/index.html');
  assert.match(html, /<title>Micas de hidrogel con marca propia \| HAODE México<\/title>/);
  assert.match(html, /rel="canonical" href="https:\/\/haode\.com\.mx\/micas-hidrogel-marca-propia\/"/);
  assert.match(html, /<h1>Micas de hidrogel con tu marca<\/h1>/);
  for (const phrase of ['Personalización desde 5,000 piezas', 'Tu marca', 'Tu logo', 'Empaque personalizado', 'Producción por volumen', 'Directo de fábrica', 'Solicitar cotización']) {
    assert.ok(html.includes(phrase), `OEM page missing ${phrase}`);
  }
  assert.doesNotMatch(html, /gratis|sin costo|entrega en|días hábiles/i);
  assert.match(html, /wa\.me\/523326684296/);
  const types = schemas(html).map((node) => node['@type']);
  assert.ok(types.includes('WebPage'));
  assert.ok(types.includes('Service'));
  assert.ok(types.includes('BreadcrumbList'));
  assert.match(read('micas-hidrogel-mayoreo-mexico/index.html'), /href="\/micas-hidrogel-marca-propia\/"/);
});

test('keyword map assigns one distinct search intent to every Phase 1 URL', () => {
  const map = read('docs/reports/hydrogel-keyword-map-20260918.csv');
  const urls = [
    'micas-hidrogel-mayoreo-mexico/',
    'producto/mica-hd/',
    'producto/mica-matte/',
    'producto/mica-privacidad-hd/',
    'producto/mica-privacidad-matte/',
    'producto/x200t-cortadora-micas/',
    'micas-hidrogel-marca-propia/',
  ];
  for (const url of urls) assert.equal(map.split(url).length - 1, 1, `${url} must have one target row`);
});

test('all five owner-approved assets pass the final website handoff gate', () => {
  const review = JSON.parse(read('docs/reports/hydrogel-asset-owner-review-20260918.json'));
  assert.equal(review.assets.length, 5);
  for (const asset of review.assets) {
    assert.equal(asset.sourceStatus, 'OWNER_CONFIRMED');
    assert.equal(asset.currentQc, 'QC_PASS');
    assert.equal(asset.sourceConfirmed, true);
    assert.equal(asset.qcPass, true);
    assert.equal(asset.approvedForWeb, true);
  }

  const expectedAssets = new Map([
    ['HD Clear', ['assets/products/micas/hd/main.png', 'df542437288941c231905d692d9462149a3567a03bfaed7d0cf57d31a62d0f4e']],
    ['Matte', ['assets/products/micas/matte/main.png', 'ed0bf69572a19da5d8602512e9339f04e8a2c28484e325af73ede2ee30f75ab6']],
    ['Privacy HD', ['assets/products/micas/privacidad-hd/main.png', '03a7c7ca2eac23327e98c303671de3ea56d1515a64bb70f86243f1185289a894']],
    ['Privacy Matte', ['assets/products/micas/privacidad-matte/main.png', '27c3e03dfcf2be1bafaf8bda976b713cb95ced9a8efc38b6aaf49ac17302983e']],
    ['X200T', ['assets/products/cut-machine/x200t/main.jpg', 'b1ddba6da770ea592c4bf47034cd26055549bc51fba27619b080fee5c4a1d514']],
  ]);
  for (const asset of review.assets) {
    assert.deepEqual([asset.filePath, asset.sha256], expectedAssets.get(asset.product));
  }

  const products = read('data/products.generated.js');
  const hdProduct = products.match(/"id": "mica-hd",[\s\S]*?"videos": \[\]/)?.[0] ?? '';
  assert.match(hdProduct, /assets\/products\/micas\/hd\/main\.png/);
  assert.doesNotMatch(hdProduct, /gallery-01\.png/);
});
