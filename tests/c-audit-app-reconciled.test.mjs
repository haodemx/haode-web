import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const repo = fileURLToPath(new URL('../', import.meta.url));
const base = 'e53d6c0102c80d84bd73b746e3e18b499df5eea0';
const files = ['app/products.json', 'data/products.generated.js'];
const parse = (text) => JSON.parse(text.slice(text.indexOf('['), text.lastIndexOf(']') + 1));
const read = (root, file) => parse(fs.readFileSync(path.join(root, file), 'utf8'));
const withoutProvenance = (products) => products.map(({ priceSource, ...product }) => product);

test('only MICA HD provenance changes: every price, tier, identity, inventory and asset stays equal to the assigned base', () => {
  for (const file of files) {
    const before = parse(execFileSync('git', ['show', `${base}:${file}`], { cwd: repo, encoding: 'utf8' }));
    const after = read(repo, file);
    assert.deepEqual(withoutProvenance(after), withoutProvenance(before));
    assert.deepEqual(after.filter((product, index) => product.priceSource !== before[index].priceSource).map((product) => product.id), ['mica-hd']);
    assert.match(after.find((product) => product.id === 'mica-hd').priceSource, /01 HIDROGEL · fila 8$/);
  }
  const mica = read(repo, 'app/products.json').find((product) => product.id === 'mica-hd');
  assert.deepEqual([mica.precioPublico, ...mica.priceTiers.map((tier) => tier.price)], [350, 300, 275, 250]);
});

test('isolated resync uses each row sheet and preserves the baseline generator business output', () => {
  const roots = [];
  const inputs = ['scripts/sync-customer-prices.js', 'data/customer-price-list-2026-09-21.json', ...files, 'docs/master-data/products-master.csv'];
  try {
    for (const version of ['baseline', 'reconciled']) {
      const root = fs.mkdtempSync(path.join(os.tmpdir(), `haode-app-reconciled-${version}-`));
      roots.push(root);
      fs.mkdirSync(path.join(root, 'docs/reports'), { recursive: true });
      for (const file of inputs) {
        fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
        fs.copyFileSync(path.join(repo, file), path.join(root, file));
      }
      if (version === 'baseline') fs.writeFileSync(path.join(root, 'scripts/sync-customer-prices.js'), execFileSync('git', ['show', `${base}:scripts/sync-customer-prices.js`], { cwd: repo }));
      const result = spawnSync(process.execPath, ['scripts/sync-customer-prices.js', '--apply', '--summary-only'], { cwd: root, encoding: 'utf8' });
      assert.equal(result.status, 0, result.stderr || result.stdout);
    }
    for (const file of files) {
      assert.deepEqual(withoutProvenance(read(roots[1], file)), withoutProvenance(read(roots[0], file)));
      assert.match(read(roots[1], file).find((product) => product.id === 'mica-hd').priceSource, /01 HIDROGEL · fila 8$/);
    }
    const report = JSON.parse(fs.readFileSync(path.join(roots[1], 'docs/reports/customer-price-sync-2026-09-21.json'), 'utf8'));
    for (const match of report.matched) {
      for (const file of files) {
        const product = read(roots[1], file).find((product) => product.id === match.id);
        if (product) assert.ok(product.priceSource.includes(`${match.sheet} · fila ${match.row}`), `${file}: ${match.id}: ${product.priceSource}`);
      }
    }
    const firstPass = files.map((file) => read(roots[1], file));
    const repeat = spawnSync(process.execPath, ['scripts/sync-customer-prices.js', '--apply', '--summary-only'], { cwd: roots[1], encoding: 'utf8' });
    assert.equal(repeat.status, 0, repeat.stderr || repeat.stdout);
    assert.deepEqual(files.map((file) => read(roots[1], file)), firstPass);
  } finally {
    // Only directories created by this test are removed, never a checkout or source file.
    for (const root of roots) fs.rmSync(root, { recursive: true, force: true });
  }
});
