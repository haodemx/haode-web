import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import test from 'node:test';

const root = new URL('..', import.meta.url).pathname;
const auditPath = `${root}/docs/chatgpt-ads/feed-closeout-audit.json`;
const reportPath = `${root}/docs/chatgpt-ads/feed-closeout-audit.md`;
const feedPath = `${root}/data/marketing/chatgpt-product-feed.json`;
const audit = JSON.parse(fs.readFileSync(auditPath, 'utf8'));
const feed = JSON.parse(fs.readFileSync(feedPath, 'utf8'));
const sha256File = path => crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex');
const productSource = fs.readFileSync(`${root}/data/products.generated.js`, 'utf8');
const products = JSON.parse(productSource.slice(productSource.indexOf('['), productSource.lastIndexOf(']') + 1));

function primaryAssetsFingerprint(overrides = {}) {
  const byId = Object.fromEntries(products.map(product => [product.id, product]));
  const digest = crypto.createHash('sha256');
  let existingFiles = 0;
  for (const productId of audit.items.map(item => item.id).sort()) {
    const main = byId[productId].images?.[0] ?? null;
    const safePath = typeof main === 'string' && !main.startsWith('/') && !main.split('/').includes('..');
    const fullPath = safePath ? `${root}/${main}` : null;
    let exists = Boolean(fullPath && fs.existsSync(fullPath) && fs.statSync(fullPath).isFile());
    let fileHash = exists ? sha256File(fullPath) : null;
    if (Object.hasOwn(overrides, productId)) {
      exists = overrides[productId].exists;
      fileHash = overrides[productId].sha256;
    }
    existingFiles += Number(exists);
    digest.update(`${JSON.stringify([productId, main, exists, fileHash])}\n`);
  }
  return { candidates: audit.items.length, existing_files: existingFiles, sha256: digest.digest('hex') };
}

const missingIds = [
  'iphone-incell-17e',
  'iphone-oled-16e',
  'iphone-oled-soft-14',
  'iphone-oled-soft-14-plus',
  'iphone-oled-soft-15pro',
  'oled-diagnostica-12mini-hard',
  'oled-diagnostica-16e-soft',
  'samsung-incell-s20-4g',
  'samsung-incell-s20-5g',
  'samsung-incell-z-flip3',
  'samsung-incell-z-flip4',
  'samsung-incell-z-flip5',
  'samsung-incell-z-flip6',
  'samsung-original-note-20-ultra',
];

const excludedRows = [
  ['02 PRODUCTOS AI', 'Gafas AI G5'],
  ['02 PRODUCTOS AI', 'Gafas AI W630'],
  ['02 PRODUCTOS AI', 'Gafas AI W610'],
  ['02 PRODUCTOS AI', 'Gafas AI G3'],
  ['02 PRODUCTOS AI', 'Gafas AI M89'],
  ['02 PRODUCTOS AI', 'Gafas AI M08 13MP'],
  ['02 PRODUCTOS AI', 'Gafas AI M95'],
  ['03 IPHONE INCELL', 'X Bolsa Protectora'],
  ['03 IPHONE INCELL', 'Xs Bolsa Protectora'],
  ['08 SAMSUNG ORIGINAL', 'S26 Ultra'],
];

test('closeout audit maps the 156 workbook rows without expanding the 146-item feed', () => {
  assert.equal(audit.schema_version, 2);
  assert.deepEqual(audit.summary, {
    feed_candidates: 146,
    workbook_product_rows: 156,
    mapped_feed_rows: 146,
    unmapped_feed_rows: 0,
    workbook_rows_excluded_from_feed: 10,
    customer_owner_sales_tiers_match: 146,
    website_sales_tiers_match_customer: 146,
    app_sales_tiers_match_customer: 146,
    structured_data_tiers_match_customer: 146,
    quality_mapping_review_required: 0,
    unit_currency_mapping_complete: 146,
    feed_price_matches_customer: 146,
    existing_public_images: 132,
    asset_missing: 14,
    feed_usable_images: 126,
    feed_image_blockers: 20,
    approved_for_web_assets: 5,
    source_unconfirmed_assets: 127,
    asset_qc_fail: 6,
    asset_manual_review: 10,
    exact_duplicate_asset_groups: 8,
    platform_ready: 0,
    owner_confirmed_cost_checks: 3,
    price_source_revision_review: 0,
    vip_only_policy_difference: 0,
    public_surface_divergence: 0,
  });
  assert.deepEqual(audit.items.map(item => item.id).sort(), feed.items.map(item => item.id).sort());
  assert.deepEqual(
    audit.excluded_workbook_rows.map(item => [item.sheet, item.model]),
    excludedRows,
  );
});

test('confirmed retail prices are exported while inventory and private values remain closed', () => {
  for (const item of audit.items) {
    assert.equal(item.feed_price, 'confirmed_retail_mxn', item.id);
    assert.equal(item.feed_price_matches_customer, true, item.id);
    assert.equal(item.feed_availability, 'unknown', item.id);
    assert.equal(item.platform_ready, false, item.id);
    assert.equal(item.inventory_source.current_live_verified, false, item.id);
    assert.equal(item.inventory_source.feed_value, 'unknown', item.id);
    assert.equal(item.currency, 'MXN', item.id);
    assert.ok(['piece', 'pack_50', 'equipment'].includes(item.unit), item.id);
  }
  assert.equal(audit.sources.owner_workbook.private_values_exported, false);
  assert.equal(audit.sources.customer_workbook.confirmation, 'USER_CONFIRMED_PUBLIC_PRICE_SYNC');
  assert.equal(audit.sources.customer_workbook.public_price_tier_approved, true);
  assert.equal(audit.owner_cost_confirmation_checks.every(item => item.confirmed_match), true);

  const serialized = `${fs.readFileSync(auditPath, 'utf8')}\n${fs.readFileSync(reportPath, 'utf8')}`;
  assert.doesNotMatch(serialized, /\/Users\/|\/Volumes\//);
  assert.doesNotMatch(serialized, /"(?:cost|inventory_quantity|vip_price|price_value)"\s*:/i);
  assert.equal(audit.owner_cost_confirmation_checks.every(item => Object.keys(item).sort().join(',') === 'confirmed_match,model_key,sheet'), true);
});

test('missing and invalid image evidence fails closed by exact product id', () => {
  assert.deepEqual(
    audit.items.filter(item => item.image.qc_status === 'ASSET_MISSING').map(item => item.id).sort(),
    [...missingIds].sort(),
  );
  assert.equal(audit.items.filter(item => item.image.qc_status === 'ASSET_MISSING').every(item => item.official_sku_status === 'pending'), true);

  const byId = Object.fromEntries(audit.items.map(item => [item.id, item]));
  for (const id of ['iphone-incell-11-bolsa-protectora', 'iphone-incell-xr-bolsa-protectora']) {
    assert.equal(byId[id].image.qc_status, 'QC_FAIL_PROMO_WRONG_MAIN_IMAGE');
  }
  for (const id of ['samsung-oled-note-20', 'samsung-incell-note-10-lite', 'samsung-incell-note-20', 'samsung-incell-s10-lite']) {
    assert.equal(byId[id].image.qc_status, 'QC_FAIL_WRONG_MODEL');
  }
  for (const id of ['samsung-oled-s21-ultra', 'samsung-original-s21-ultra', 'samsung-oled-s22-ultra', 'samsung-original-s22-ultra', 'samsung-oled-s23-ultra', 'samsung-original-s23-ultra']) {
    assert.equal(byId[id].image.qc_status, 'MANUAL_REVIEW_CROSS_QUALITY');
  }
  for (const id of ['haode-pantalla-oled-diagnostica-modelo-13', 'haode-pantalla-oled-diagnostica-modelo-13-pro', 'haode-pantalla-oled-diagnostica-modelo-14', 'haode-pantalla-oled-diagnostica-modelo-14-pro']) {
    assert.equal(byId[id].image.qc_status, 'MANUAL_REVIEW_SHARED_SERIES');
  }
});

test('the audit is tied to the exact supplied workbook revisions', () => {
  assert.equal(audit.sources.customer_workbook.sha256, '3afbebfaa59bbf599545ad385b7727f9b41353ebd0750abaa62be3812a609f5a');
  assert.equal(audit.sources.owner_workbook.sha256, '5ea4a6ca14aada298c43b0ba0e902616d8e4c4899a4086334eb0e3c204da8709');
});

test('the committed audit fingerprints every mutable public input', () => {
  assert.equal(audit.sources.website.sha256, sha256File(`${root}/data/products.generated.js`));
  assert.equal(audit.sources.app.sha256, sha256File(`${root}/app/products.json`));
  assert.equal(audit.sources.feed.sha256, sha256File(feedPath));
  assert.equal(audit.sources.asset_qc_policy.sha256, sha256File(`${root}/data/marketing/chatgpt-feed-asset-qc.json`));
  assert.equal(audit.sources.approved_asset_manifest.sha256, sha256File(`${root}/docs/reports/hydrogel-asset-owner-review-20260918.json`));
  assert.deepEqual(audit.sources.candidate_primary_assets, primaryAssetsFingerprint());

  const structured = crypto.createHash('sha256');
  for (const id of audit.items.map(item => item.id).sort()) {
    structured.update(`${id}\0${sha256File(`${root}/producto/${id}/index.html`)}\n`);
  }
  assert.equal(audit.sources.structured_data.product_pages, 146);
  assert.equal(audit.sources.structured_data.sha256, structured.digest('hex'));

  const report = fs.readFileSync(reportPath, 'utf8');
  assert.match(report, /Feed 候选：146/);
  assert.match(report, /图片阻塞：20/);
  assert.match(report, /官网 \/ App \/ 结构化数据与 2026-09-24 客户表四档一致：146 \/ 146 \/ 146/);
  assert.match(report, /跨公开表面自身不一致：0/);
});

test('rejected image deletion or byte replacement invalidates the physical asset fingerprint', () => {
  const current = audit.sources.candidate_primary_assets.sha256;
  const rejectedId = 'iphone-incell-11-bolsa-protectora';
  assert.notEqual(primaryAssetsFingerprint({ [rejectedId]: { exists: false, sha256: null } }).sha256, current);
  assert.notEqual(primaryAssetsFingerprint({ [rejectedId]: { exists: true, sha256: '0'.repeat(64) } }).sha256, current);
});
