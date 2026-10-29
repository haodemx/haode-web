import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const source = JSON.parse(fs.readFileSync(new URL('data/customer-price-list-2026-11.json', root), 'utf8'));
const parseWeb = text => JSON.parse(text.slice(text.indexOf('['), text.lastIndexOf(']') + 1));
const web = parseWeb(fs.readFileSync(new URL('data/products.generated.js', root), 'utf8'));
const app = JSON.parse(fs.readFileSync(new URL('app/products.json', root), 'utf8'));
const number = value => Number(String(value).replace(/[^0-9.]/g, ''));
const byId = (items, id) => items.find(p => p.id === id);

test('November XR prices follow the newly approved PDF, with distinct HD+ Bolsa', () => {
  for (const [id, prices, quality] of [
    ['iphone-incell-xr', [175, 165, 160, 155], 'INCELL FHD C/IC'],
    ['iphone-incell-xr-bolsa-protectora', [170, 160, 150, 145], 'INCELL HD+ C/IC'],
  ]) {
    const w = byId(web, id), a = byId(app, id);
    assert.deepEqual(w.prices.map(p => number(p.price)), prices);
    assert.deepEqual([a.precioPublico, ...a.priceTiers.map(p => p.price)], prices);
    assert.equal(w.quality, quality);
    assert.equal(a.calidad, quality);
  }
  assert.match(byId(web, 'iphone-incell-xr-bolsa-protectora').description, /Caja confirmado en \$150 MXN/);
  assert.doesNotMatch(byId(app, 'iphone-incell-xr-bolsa-protectora').descripcion, /\$135 MXN/);
  const iphone11Bolsa = byId(app, 'iphone-incell-11-bolsa-protectora');
  assert.equal(iphone11Bolsa.modelo, 'iPhone 11 Bolsa Protectora INCELL HD+ C/IC');
  assert.equal(iphone11Bolsa.offerSubtitle, 'INCELL HD+ C/IC · Bolsa Protectora');
});

test('all 157 exact approved mappings use PDF prices without inventing missing tiers', () => {
  const report = JSON.parse(fs.readFileSync(new URL('docs/reports/customer-price-sync-2026-11.json', root), 'utf8'));
  assert.equal(source.rows.length, 162);
  assert.equal(report.matched.length, 157);
  assert.equal(report.unmatchedWebsite.length, 29);
  assert.equal(report.unmatchedSource.length, 5);
  const rows = new Map(source.rows.map(r => [`${r.sourceSheet}:${r.sourceRow}`, r]));
  for (const match of report.matched) {
    const row = rows.get(`${match.sheet}:${match.row}`), w = byId(web, match.id), a = byId(app, match.id);
    assert.ok(row && w && a, match.id);
    const expected = ['retail', 'wholesale', 'box', 'vip'].map(k => row.prices[k]).filter(v => v !== null);
    assert.deepEqual(w.prices.map(p => number(p.price)), expected, match.id);
    assert.deepEqual([a.precioPublico, ...a.priceTiers.map(p => p.price)], expected, match.id);
    assert.ok(a.priceTiers.every(p => p.autoApply === false), match.id);
    assert.ok(w.priceSource.startsWith(source.sourceDocument), match.id);
    assert.ok(a.priceSource.startsWith(source.sourceDocument), match.id);
  }
  assert.equal(byId(web, 'lk-007-camara-digital-4k').prices.length, 2);
  assert.deepEqual(byId(app, 'gafas-ai-gafas-ai-m08').priceTiers.map(p => p.price), [945, 870, 845]);
});

test('29 unlisted products retain every existing price and no products are added or deleted', () => {
  const report = JSON.parse(fs.readFileSync(new URL('docs/reports/customer-price-sync-2026-11.json', root), 'utf8'));
  const base = 'ba07ddbff2beb3d18157d48c75bb5d98082a9608';
  const previousWeb = parseWeb(execFileSync('git', ['show', `${base}:data/products.generated.js`], { cwd: root, encoding: 'utf8' }));
  const previousApp = JSON.parse(execFileSync('git', ['show', `${base}:app/products.json`], { cwd: root, encoding: 'utf8' }));
  assert.deepEqual(web.map(p => p.id).sort(), previousWeb.map(p => p.id).sort());
  assert.deepEqual(app.map(p => p.id).sort(), previousApp.map(p => p.id).sort());
  for (const id of report.unmatchedWebsite) {
    assert.deepEqual(byId(web, id), byId(previousWeb, id), id);
    assert.deepEqual(byId(app, id), byId(previousApp, id), id);
  }
  for (const p of web) assert.deepEqual(p.images, byId(previousWeb, p.id).images, p.id);
  for (const p of app) assert.equal(p.imagen, byId(previousApp, p.id).imagen, p.id);
});

test('homepage and landing highlights preserve literal currency and valid price table markup', () => {
  const home = fs.readFileSync(new URL('index.html', root), 'utf8');
  const landing = fs.readFileSync(new URL('pantallas-iphone-11-xr-mayoreo/index.html', root), 'utf8');
  assert.match(home, /Caja · confirmar condiciones: \$150 MXN/);
  assert.match(home, /Caja · confirmar condiciones: \$160 MXN/);
  assert.doesNotMatch(home, /condiciones: Caja/);
  assert.match(landing, /<th scope="row">Caja<\/th><td>\$150 MXN<\/td>/);
  assert.doesNotMatch(landing, /<td>\s*<table/);
  for (const id of ['iphone-incell-xr-bolsa-protectora', 'iphone-incell-11-bolsa-protectora']) {
    const detail = fs.readFileSync(new URL(`producto/${id}/index.html`, root), 'utf8');
    assert.match(detail, /<span>Caja \$150 MXN<\/span>/);
    assert.doesNotMatch(detail, /<span>Caja \$135 MXN<\/span>/);
  }
  for (const [id, retail, wholesale] of [
    ['lk-007-camara-digital-4k', 550, 440], ['lk-018-camara-accion-hd', 930, 765],
    ['lk-030-mini-camara-retro-digital', 440, 330], ['lk-032-camara-inteligente-con-gimbal', 550, 440],
  ]) {
    const detail = fs.readFileSync(new URL(`producto/${id}/index.html`, root), 'utf8');
    const summary = detail.match(/<h3 class="detail-price">([^<]*)<\/h3>/)?.[1] || '';
    assert.ok(summary.toLowerCase().includes(`menudeo $${retail} mxn`), id);
    assert.ok(summary.toLowerCase().includes(`mayoreo $${wholesale} mxn`), id);
  }
});

test('every mapped canonical and legacy detail keeps visible prices and Product offers aligned', () => {
  const matched = new Set(JSON.parse(fs.readFileSync(new URL('docs/reports/customer-price-sync-2026-11.json', root), 'utf8')).matched.map(p => p.id));
  let checked = 0, redirects = 0;
  for (const folder of ['producto', 'productos']) {
    for (const entry of fs.readdirSync(new URL(folder+'/', root), {withFileTypes:true})) {
      if (!entry.isDirectory()) continue;
      const file = new URL(`${folder}/${entry.name}/index.html`, root);
      if (!fs.existsSync(file)) continue;
      const html = fs.readFileSync(file, 'utf8');
      const id = html.match(/rel="canonical"[^>]*href="https:\/\/haode.com.mx\/producto\/([^/]+)\/"/)?.[1];
      if (!matched.has(id)) continue;
      const nodes = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
        .flatMap(m => {const data=JSON.parse(m[1]);return data['@graph']||[data];});
      const product = nodes.find(p => p['@type']==='Product');
      if (!product) {
        assert.ok(html.includes('http-equiv="refresh"'), file.pathname);
        assert.ok(html.includes(`url=/producto/${id}/`), file.pathname);
        assert.doesNotMatch(html, /\$\d/);
        redirects++;
        continue;
      }
      const expected = byId(web, id).prices.map(p => number(p.price));
      assert.deepEqual(product.offers.map(p => Number(p.price)), expected, file.pathname);
      assert.ok(product.offers.every(p => p.priceCurrency==='MXN' && p.url===`https://haode.com.mx/producto/${id}/`), file.pathname);
      const body = html.match(/<tbody data-detail-price-body>([\s\S]*?)<\/tbody>/)?.[1]||'';
      assert.deepEqual([...body.matchAll(/<td>([^<]+)<\/td>/g)].map(m => number(m[1])), expected, file.pathname);
      checked++;
    }
  }
  assert.equal(checked, 201);
  assert.equal(redirects, 5);
});
