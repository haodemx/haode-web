import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const [publicCss, appCss, homepage, catalog, productTemplate, appShell] = await Promise.all([
  readFile(new URL('../style.css', import.meta.url), 'utf8'),
  readFile(new URL('../app/app.css', import.meta.url), 'utf8'),
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../productos/index.html', import.meta.url), 'utf8'),
  readFile(new URL('../producto/iphone-incell-14/index.html', import.meta.url), 'utf8'),
  readFile(new URL('../app/index.html', import.meta.url), 'utf8'),
]);

const publicLayer = publicCss.split('/* HAODE premium brand system */')[1] || '';
const appLayer = appCss.split('/* HAODE premium brand system */')[1] || '';

test('public website exposes one final premium brand token layer', () => {
  assert.ok(publicLayer, 'missing final public premium brand layer');

  for (const token of [
    '--brand-ink:',
    '--brand-paper:',
    '--brand-surface:',
    '--brand-line:',
    '--brand-orange:',
    '--brand-green:',
    '--brand-focus:',
    '--brand-content:',
  ]) {
    assert.match(publicLayer, new RegExp(token), `missing ${token}`);
  }

  assert.match(publicLayer, /:focus-visible/);
  assert.match(publicLayer, /prefers-reduced-motion:\s*reduce/);
  assert.match(publicLayer, /min-height:\s*44px/);
  assert.match(publicLayer, /body\.home-page-reference/);
  assert.match(publicLayer, /body\.catalog-reference-page/);
  assert.match(publicLayer, /body\.category-page/);
  assert.match(publicLayer, /body\.product-detail-page/);
  assert.match(publicLayer, /body\.trust-conversion-page/);
  assert.doesNotMatch(publicLayer, /(?:linear|radial)-gradient\(/i);
  assert.doesNotMatch(publicLayer, /backdrop-filter|text-shadow/i);
});

test('customer App maps to the same restrained brand roles', () => {
  assert.ok(appLayer, 'missing final App premium brand layer');

  for (const token of [
    '--brand-ink:',
    '--brand-paper:',
    '--brand-surface:',
    '--brand-line:',
    '--brand-orange:',
    '--brand-green:',
    '--brand-focus:',
  ]) {
    assert.match(appLayer, new RegExp(token), `missing App ${token}`);
  }

  assert.match(appLayer, /:focus-visible/);
  assert.match(appLayer, /prefers-reduced-motion:\s*reduce/);
  assert.match(appLayer, /min-height:\s*44px/);
  assert.match(appLayer, /body\[data-route="home"\]/);
  assert.match(appLayer, /body\[data-route="list"\]/);
  assert.match(appLayer, /body\[data-route="product"\]/);
  assert.doesNotMatch(appLayer, /backdrop-filter|text-shadow/i);
});

test('brand refinement preserves core website and App commerce hooks', () => {
  assert.match(homepage, /data-home-hero-carousel/);
  assert.match(homepage, /data-home-catalog-search-form/);
  assert.match(homepage, /data-reference-menu-button/);
  assert.match(catalog, /data-product-sections/);
  assert.match(catalog, /data-site-catalog-search-form/);
  assert.match(productTemplate, /data-product-detail/);
  assert.match(appShell, /id="app-root"/);
  assert.match(appShell, /data-open-cart/);
  assert.match(appShell, /class="bottom-nav"/);
});
