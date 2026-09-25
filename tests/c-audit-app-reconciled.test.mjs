import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const repo = fileURLToPath(new URL('../', import.meta.url));
const base = '5dd00d207e91e2bf3fa0a1a67495653ccea165ee';
const files = ['app/products.json', 'data/products.generated.js'];
const parse = (text) => JSON.parse(text.slice(text.indexOf('['), text.lastIndexOf(']') + 1));
const read = (root, file) => parse(fs.readFileSync(path.join(root, file), 'utf8'));
const source = JSON.parse(fs.readFileSync(path.join(repo, 'data/customer-price-list-2026-09-24.json'), 'utf8'));
const report = JSON.parse(fs.readFileSync(path.join(repo, 'docs/reports/customer-price-sync-2026-09-24.json'), 'utf8'));

function withoutPriceFields(products, file) {
  return products.map((product) => {
    const copy = { ...product };
    const fields = file.startsWith('app/')
      ? ['precioPublico', 'precioMayoreo', 'priceTiers', 'priceSource', 'descripcion', 'offerBadge', 'offerDisplayPrice']
      : ['prices', 'priceSource', 'description'];
    fields.forEach((field) => delete copy[field]);
    return copy;
  });
}

function numericPrice(value) {
  return Number(String(value || '').replace(/[^0-9.]/g, ''));
}

test('2026-09-24 sync changes only price surfaces and keeps non-price product data equal to deployed main', () => {
  for (const file of files) {
    const before = parse(execFileSync('git', ['show', `${base}:${file}`], { cwd: repo, encoding: 'utf8' }));
    const after = read(repo, file);
    assert.deepEqual(withoutPriceFields(after, file), withoutPriceFields(before, file));
  }
});

test('every matched product uses the exact workbook row and named manual tiers', () => {
  const website = new Map(read(repo, 'data/products.generated.js').map((product) => [product.id, product]));
  const app = new Map(read(repo, 'app/products.json').map((product) => [product.id, product]));
  const sourceByCoordinate = new Map(source.rows.map((row) => [`${row.sourceSheet}:${row.sourceRow}`, row]));
  assert.equal(report.summary.websiteMatched, 152);
  assert.equal(report.summary.appMatched, 152);

  for (const match of report.matched) {
    const row = sourceByCoordinate.get(`${match.sheet}:${match.row}`);
    const websiteProduct = website.get(match.id);
    const appProduct = app.get(match.id);
    assert.ok(row, `Missing source row for ${match.id}`);
    assert.ok(websiteProduct, `Missing website product ${match.id}`);
    assert.ok(appProduct, `Missing App product ${match.id}`);
    assert.match(websiteProduct.priceSource, /HAODE_Lista_de_Precios_2026-09-24\.xlsx/);
    assert.match(appProduct.priceSource, /HAODE_Lista_de_Precios_2026-09-24\.xlsx/);
    assert.deepEqual(websiteProduct.prices.map((tier) => numericPrice(tier.price)), [
      row.prices.retail,
      row.prices.wholesale,
      row.prices.box,
      row.prices.vip,
    ].filter((value) => value !== null));
    assert.equal(appProduct.precioPublico, row.prices.retail);
    assert.equal(appProduct.precioMayoreo, row.prices.wholesale || row.prices.retail);
    assert.ok(appProduct.priceTiers.every((tier) => tier.autoApply === false), `${match.id} has an automatic tier`);
  }
});

test('isolated 2026-09-24 resync is idempotent', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'haode-price-resync-'));
  const inputs = [
    'scripts/sync-customer-prices.js',
    'data/customer-price-list-2026-09-24.json',
    ...files,
    'docs/master-data/products-master.csv',
  ];
  try {
    fs.mkdirSync(path.join(root, 'docs/reports'), { recursive: true });
    for (const file of inputs) {
      fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
      fs.copyFileSync(path.join(repo, file), path.join(root, file));
    }
    const run = () => spawnSync(process.execPath, ['scripts/sync-customer-prices.js', '--apply', '--summary-only'], { cwd: root, encoding: 'utf8' });
    const first = run();
    assert.equal(first.status, 0, first.stderr || first.stdout);
    const firstPass = files.map((file) => read(root, file));
    const second = run();
    assert.equal(second.status, 0, second.stderr || second.stdout);
    assert.deepEqual(files.map((file) => read(root, file)), firstPass);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
