import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import test from 'node:test';
import { buildFeed, readAssetQc, readPublicProducts, validateFeed, ROOT, OUTPUT, ORIGIN } from '../scripts/build-chatgpt-product-feed.mjs';
const products = readPublicProducts();
const feed = buildFeed();
const assetQc = readAssetQc();

test('feed deterministic serialization, stable ids, priority coverage and public projection', () => {
  assert.equal(validateFeed(feed), true);
  assert.equal(fs.readFileSync(`${ROOT}/${OUTPUT}`, 'utf8'), `${JSON.stringify(feed, null, 2)}\n`);
  assert.deepEqual(buildFeed([...products].reverse()), feed);
  assert.equal(feed.items.length, 146);
  assert.deepEqual(Object.fromEntries(['Pantallas', 'Hydrogel', 'X200T'].map(g => [g, feed.items.filter(p => p.priority_group === g).length])), { Pantallas: 141, Hydrogel: 4, X200T: 1 });
  assert.doesNotMatch(JSON.stringify(feed), /"(?:precioMayoreo|cost_price|landed_cost|sourceRows|customer_name|phone|priceSource)"\s*:/);
});

test('every product and exact image resolve locally, with canonical and sitemap', () => {
  const sitemap = fs.readFileSync(`${ROOT}/sitemap.xml`, 'utf8');
  for (const row of feed.items) {
    const html = fs.readFileSync(`${ROOT}/producto/${row.id}/index.html`, 'utf8');
    assert.ok(html.includes(`rel="canonical" href="${row.link}"`), row.id);
    assert.ok(sitemap.includes(`<loc>${row.link}</loc>`), row.id);
    const source = products.find(p => p.id === row.id);
    assert.equal(row.title, source.name);
    assert.ok(html.includes('wa.me/'), row.id);
    if (Object.hasOwn(assetQc, row.id)) {
      assert.equal(row.image_link, null);
      assert.equal(row.image_status, 'asset_rejected');
      assert.ok(row.blockers.includes('confirmed_product_image_required'));
      assert.ok(row.blockers.includes('asset_qc_failed'));
    } else if (row.image_link) {
      const imagePath = new URL(row.image_link).pathname.slice(1);
      assert.equal(imagePath, source.images[0]);
      assert.ok(html.includes(imagePath));
      assert.equal(crypto.createHash('sha256').update(fs.readFileSync(`${ROOT}/${imagePath}`)).digest('hex'), row.source.image_sha256);
    } else {
      assert.equal(row.image_status, 'asset_missing');
      assert.ok(row.blockers.includes('confirmed_product_image_required'));
    }
  }
});

test('confirmed retail prices are used while unverified stock and ERP-like fields stay closed', () => {
  const modified = products.map(p => ({ ...p, stockStatus: 'in_stock', public_price_mxn: 123, sales_available: true, cost_price: 17 }));
  const result = buildFeed(modified);
  for (const [index, item] of result.items.entries()) {
    assert.deepEqual(item.price, feed.items[index].price);
    assert.equal(item.price_status, 'confirmed_retail_2026-09-24');
    assert.equal(item.availability, 'unknown');
    assert.equal(item.platform_ready, false);
    assert.equal(item.blockers.includes('confirmed_current_price_required'), false);
  }
  assert.equal(JSON.stringify(result).includes('cost_price'), false);
  assert.throws(() => validateFeed({ ...feed, items: [{ ...feed.items[0], price: { amount: 0, currency: 'MXN' } }] }));
  assert.throws(() => validateFeed({ ...feed, items: [{ ...feed.items[0], price: { amount: 100, currency: 'USD' } }] }));
  assert.throws(() => buildFeed(products.map(p => p.id === feed.items[0].id ? { ...p, prices: [] } : p)));
  assert.throws(() => buildFeed([...products, products.find(p => p.category === 'micas')]));
});

test('missing/unsafe image never uses a replacement and invalid routes fail closed', () => {
  const row = products.find(p => p.id === 'mica-hd');
  for (const images of [[], ['assets/products/placeholder.svg'], ['https://private.example/image.png'], ['assets/products/../../private.jpg']]) {
    assert.equal(buildFeed([{ ...row, images }]).items[0].image_link, null);
  }
  assert.throws(() => buildFeed([{ ...row, id: '../private' }]));
});

test('known wrong-model and promotional main images are rejected from the candidate feed', () => {
  assert.equal(Object.keys(assetQc).length, 6);
  const rejected = feed.items.filter(item => item.image_status === 'asset_rejected');
  assert.deepEqual(rejected.map(item => item.id).sort(), Object.keys(assetQc).sort());
  assert.equal(rejected.every(item => item.image_link === null && item.source.image_sha256 === null && item.platform_ready === false), true);
});

test('QC rejection remains fail-closed when the former source image disappears or becomes unsafe', () => {
  const blocked = products.find(product => product.id === 'samsung-oled-note-20');
  for (const images of [[], ['assets/products/placeholder.svg'], ['https://private.example/image.png'], ['assets/products/../../private.jpg']]) {
    const result = buildFeed([{ ...blocked, images }]);
    assert.equal(result.items[0].image_link, null);
    assert.equal(result.items[0].image_status, 'asset_rejected');
    assert.deepEqual(result.items[0].blockers.slice(-2), ['confirmed_product_image_required', 'asset_qc_failed']);
    assert.equal(validateFeed(result), true);
  }
});

test('three Spanish campaigns reuse canonical landing pages and safe UTM', () => {
  const pack = JSON.parse(fs.readFileSync(`${ROOT}/data/marketing/chatgpt-launch-pack.json`));
  assert.equal(pack.campaigns.length, 3);
  const sitemap = fs.readFileSync(`${ROOT}/sitemap.xml`, 'utf8');
  for (const campaign of pack.campaigns) {
    const url = new URL(campaign.url);
    assert.equal(url.origin, ORIGIN);
    assert.equal(`${url.origin}${url.pathname}`, campaign.landing_page);
    assert.equal(url.searchParams.get('utm_source'), 'chatgpt');
    assert.equal(url.searchParams.get('utm_medium'), 'paid');
    assert.equal(url.searchParams.size, 5);
    assert.ok(campaign.context_hints.length);
    const html = fs.readFileSync(`${ROOT}${url.pathname}index.html`, 'utf8');
    assert.ok(html.includes(`rel="canonical" href="${campaign.landing_page}"`));
    assert.ok(sitemap.includes(`<loc>${campaign.landing_page}</loc>`));
    assert.ok(html.includes('wa.me/'));
    assert.doesNotMatch([...campaign.headlines, ...campaign.descriptions].join(' '), /\$|descuento|gratis|garantizado|stock inmediato/i);
  }
});

test('schema required fields match the generated contract and validation rejects extra private keys', () => {
  const schema = JSON.parse(fs.readFileSync(`${ROOT}/docs/chatgpt-ads/candidate-feed.schema.json`, 'utf8'));
  assert.deepEqual([...schema.required].sort(), Object.keys(feed).sort());
  assert.deepEqual([...schema.properties.items.items.required].sort(), Object.keys(feed.items[0]).sort());
  assert.throws(() => validateFeed({ ...feed, private_token: 'not-allowed' }));
  assert.throws(() => validateFeed({ ...feed, items: [{ ...feed.items[0], customer_name: 'not-allowed' }] }));
  assert.throws(() => validateFeed({ ...feed, items: [{ ...feed.items[0], source: { ...feed.items[0].source, phone: 'not-allowed' } }] }));
});

test('nested private objects and coerced scalar values fail closed', () => {
  const secret = { phone: 'synthetic-private-value' };
  for (const field of ['price_policy', 'availability_policy', 'content_sha256']) {
    assert.throws(() => validateFeed({ ...feed, [field]: secret }));
  }
  for (const field of ['id', 'title', 'description', 'image_link', 'category']) {
    assert.throws(() => validateFeed({ ...feed, items: [{ ...feed.items[0], [field]: secret }] }));
  }
  for (const blockers of [[secret], ['arbitrary'], [...feed.items[0].blockers, secret]]) {
    assert.throws(() => validateFeed({ ...feed, items: [{ ...feed.items[0], blockers }] }));
  }
  assert.throws(() => validateFeed({ ...feed, items: [{ ...feed.items[0], source: { ...feed.items[0].source, image_sha256: [feed.items[0].source.image_sha256] } }] }));
});
