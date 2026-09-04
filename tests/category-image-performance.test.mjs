import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const source = readFileSync(new URL('../categoria/category-page.js', import.meta.url), 'utf8');
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const repoRoot = fileURLToPath(new URL('../', import.meta.url));

function listHtmlFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return listHtmlFiles(path);
    return entry.name === 'index.html' ? [path] : [];
  });
}

test('category cards request existing display variants near the viewport', () => {
  assert.match(source, /replace\(\/\\\.\(\?:jpe\?g\|png\)\$\/i, '\.display\.webp'\)/);
  assert.match(source, /data-product-src=/);
  assert.match(source, /rootMargin: '256px 0px'/);
  assert.match(source, /IntersectionObserver/);
});

test('category cards retain the verified original asset as an error fallback', () => {
  assert.match(source, /data-product-fallback=/);
  assert.match(source, /image\.addEventListener\('error'/);
  assert.match(source, /image\.src = fallback/);
});

test('screen category headers start with the final lightweight wordmark', () => {
  for (const path of [
    'categoria/iphone-incell/index.html',
    'categoria/iphone-oled/index.html',
    'categoria/oled-diagnostica/index.html',
    'categoria/samsung-incell/index.html',
    'categoria/samsung-oled/index.html',
    'categoria/samsung-tipo-original/index.html',
  ]) {
    const html = read(path);
    assert.match(html, /brand-logo" src="\/assets\/images\/factory-store-wordmark\.png"/);
    assert.doesNotMatch(html, /brand-logo" src="\/assets\/logo\/logo\.png"/);
  }
});

test('screen wholesale panels use existing optimized display assets', () => {
  const expected = new Map([
    ['pantallas-iphone-mayoreo-mexico/index.html', 'iphone-oled/main-card.webp'],
    ['pantallas-iphone-incell-mayoreo-mexico/index.html', 'iphone-incell/main-card.webp'],
    ['pantallas-iphone-oled-mayoreo-mexico/index.html', 'iphone-oled/main-card.webp'],
    ['pantallas-samsung-mayoreo-mexico/index.html', 'samsung-oled/s24-ultra/main.display.webp'],
    ['pantallas-samsung-incell-mayoreo-mexico/index.html', 'samsung-incell/main-card.webp'],
    ['pantallas-samsung-oled-mayoreo-mexico/index.html', 'samsung-oled/s24-ultra/main.display.webp'],
    ['pantallas-samsung-zflip-zfold-original-mexico/index.html', 'samsung-original/z-flip5/main.display.webp'],
  ]);
  for (const [path, asset] of expected) {
    const html = read(path);
    assert.match(html, new RegExp(`reference-conversion-panel[\\s\\S]*?src="/assets/products/${asset.replaceAll('.', '\\.')}"`));
    assert.match(html, /brand-logo" src="\/assets\/images\/factory-store-wordmark\.png"/);
  }
});

test('static Samsung original cards use existing display assets', () => {
  const html = read('categoria/samsung-tipo-original/index.html');
  const images = [...html.matchAll(/<img src="(\/assets\/products\/samsung-original\/[^"]+)"/g)]
    .map((match) => match[1]);
  assert.equal(images.length, 9);
  for (const image of images) {
    assert.match(image, /\/main\.display\.webp$/);
    assert.ok(existsSync(join(repoRoot, image)), `${image} should exist`);
  }
});

test('screen product video posters use existing display variants when available', () => {
  let checked = 0;
  for (const path of listHtmlFiles(join(repoRoot, 'producto'))) {
    const html = readFileSync(path, 'utf8');
    for (const tag of html.match(/<video\b[^>]*data-seo-static-video[^>]*>/g) || []) {
      const poster = tag.match(/\bposter="([^"]+)"/)?.[1];
      if (!poster?.startsWith('/assets/products/')) continue;
      const optimizedPoster = poster.replace(/\/main\.(?:jpe?g|png)$/i, '/main.display.webp');
      if (!existsSync(join(repoRoot, optimizedPoster))) continue;
      assert.equal(poster, optimizedPoster, `${path} should use its display poster`);
      checked += 1;
    }
  }
  assert.ok(checked >= 74, `expected at least 74 optimized posters, found ${checked}`);
});
