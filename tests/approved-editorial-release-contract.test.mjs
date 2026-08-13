import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const [publicCss, appCss, homepage, categoryPage, productPage] = await Promise.all([
  readFile(new URL('../style.css', import.meta.url), 'utf8'),
  readFile(new URL('../app/app.css', import.meta.url), 'utf8'),
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../categoria/iphone-incell/index.html', import.meta.url), 'utf8'),
  readFile(new URL('../producto/iphone-incell-14/index.html', import.meta.url), 'utf8'),
]);

const marker = '/* HAODE approved editorial release */';
const publicLayer = publicCss.split(marker)[1] || '';
const appLayer = appCss.split(marker)[1] || '';

test('approved public release is a bright editorial system, not a dark recolor', () => {
  assert.ok(publicLayer, 'missing approved public editorial release layer');
  assert.match(publicLayer, /--brand-ink:\s*#101012/i);
  assert.match(publicLayer, /--brand-paper:\s*#fbfbf9/i);
  assert.match(publicLayer, /--brand-mist:\s*#f0f0ed/i);
  assert.match(publicLayer, /--brand-line:\s*#d7d7d2/i);
  assert.match(publicLayer, /--brand-orange:\s*#ff581f/i);
  assert.match(publicLayer, /body\.home-page-reference \.reference-header\s*{[^}]*background:\s*var\(--brand-paper\)/is);
  assert.match(publicLayer, /body\.home-page-reference \.reference-hero\s*{[^}]*background:\s*var\(--brand-paper\)/is);
  assert.match(publicLayer, /body\.home-page-reference \.reference-footer\s*{[^}]*background:\s*var\(--brand-ink\)/is);
  assert.match(publicLayer, /body\.category-page \.new-page-hero/is);
  assert.match(publicLayer, /body\.product-detail-page \.detail-shell/is);
  assert.match(publicLayer, /@media\s*\(max-width:\s*760px\)[\s\S]*\.reference-sticky-whatsapp\s*{[^}]*display:\s*none/is);
  assert.doesNotMatch(publicLayer, /(?:linear|radial)-gradient\(|backdrop-filter|text-shadow/i);
});

test('approved App release shares the light editorial hierarchy', () => {
  assert.ok(appLayer, 'missing approved App editorial release layer');
  assert.match(appLayer, /--brand-ink:\s*#101012/i);
  assert.match(appLayer, /--brand-paper:\s*#fbfbf9/i);
  assert.match(appLayer, /--brand-mist:\s*#f0f0ed/i);
  assert.match(appLayer, /--brand-line:\s*#d7d7d2/i);
  assert.match(appLayer, /--brand-orange:\s*#ff581f/i);
  assert.match(appLayer, /\.app-header\s*{[^}]*background:\s*var\(--brand-paper\)/is);
  assert.match(appLayer, /\.app-home-board \.app-home-intro\s*{[^}]*background:\s*var\(--brand-paper\)/is);
  assert.match(appLayer, /body\[data-route="list"\] \.product-grid/is);
  assert.match(appLayer, /body\[data-route="product"\] \.detail-layout/is);
  assert.match(appLayer, /\.bottom-nav\s*{[^}]*background:\s*var\(--brand-paper\)/is);
  assert.doesNotMatch(appLayer, /(?:linear|radial)-gradient\(|backdrop-filter|text-shadow/i);
});

test('UI release preserves indexable pages and commerce hooks', () => {
  assert.match(homepage, /<link\b[^>]*rel="canonical"[^>]*href="https:\/\/haode\.com\.mx\/"/i);
  assert.match(homepage, /<script\b[^>]*type="application\/ld\+json"/i);
  assert.match(homepage, /data-home-catalog-search-form/);
  assert.match(categoryPage, /<link\b[^>]*rel="canonical"/i);
  assert.match(categoryPage, /data-category-products/);
  assert.match(productPage, /<link\b[^>]*rel="canonical"/i);
  assert.match(productPage, /data-product-detail/);
  assert.match(productPage, /data-detail-whatsapp/);
});
