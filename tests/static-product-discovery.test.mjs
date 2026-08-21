import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE_URL = 'https://haode.com.mx';

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function sitemapLocs() {
  return [...read('sitemap.xml').matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((match) => match[1]);
}

function htmlPath(url) {
  const pathname = decodeURIComponent(new URL(url).pathname);
  if (pathname === '/') return 'index.html';
  if (pathname.endsWith('/')) return `${pathname.slice(1)}index.html`;
  return pathname.slice(1);
}

function normalizedHref(href, sourceUrl) {
  if (!href || href.startsWith('#') || /^(?:mailto:|tel:|javascript:)/i.test(href)) return '';
  try {
    const url = new URL(href, sourceUrl);
    if (url.origin !== SITE_URL) return '';
    url.hash = '';
    url.search = '';
    return url.toString();
  } catch {
    return '';
  }
}

test('every indexable product has a static HTML link from another sitemap page', () => {
  const locs = sitemapLocs();
  const productUrls = locs.filter((url) => url.startsWith(`${SITE_URL}/producto/`));
  const inbound = new Map(productUrls.map((url) => [url, new Set()]));

  for (const sourceUrl of locs) {
    const file = path.join(ROOT, htmlPath(sourceUrl));
    if (!fs.existsSync(file)) continue;
    const html = fs.readFileSync(file, 'utf8');
    for (const match of html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi)) {
      const target = normalizedHref(match[1], sourceUrl);
      if (target && target !== sourceUrl && inbound.has(target)) inbound.get(target).add(sourceUrl);
    }
  }

  const orphanProducts = [...inbound]
    .filter(([, sources]) => sources.size === 0)
    .map(([url]) => url);

  assert.deepEqual(orphanProducts, []);
  assert.ok(productUrls.length >= 150, 'expected the complete public product catalog');
});

test('the model directory is crawlable, canonical and connected from main catalog surfaces', () => {
  const directory = read('catalogo-modelos/index.html');
  const home = read('index.html');
  const products = read('productos/index.html');
  const productLinks = [...directory.matchAll(/<a\b[^>]*href=["'](\/producto\/[^"']+)["']/gi)];

  assert.match(directory, /<link rel="canonical" href="https:\/\/haode\.com\.mx\/catalogo-modelos\/"/);
  assert.match(directory, /<h1[^>]*>Catálogo de modelos HAODE México<\/h1>/);
  assert.ok(productLinks.length >= 150, 'model directory should expose the public product routes');
  assert.ok(home.includes('href="/catalogo-modelos/"'));
  assert.ok(products.includes('href="/catalogo-modelos/"'));
});
