import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ROUTE = '/tienda-oficial-hl-cdmx/';
const URL = `https://haode.com.mx${ROUTE}`;

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function graph(relativePath) {
  const html = read(relativePath);
  return [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map(([, json]) => JSON.parse(json.trim()))
    .flatMap((block) => block['@graph'] || [block]);
}

test('official HL store route is indexable, visible and complete', () => {
  const html = read('tienda-oficial-hl-cdmx/index.html');
  assert.ok(html.includes(`<link rel="canonical" href="${URL}" />`));
  assert.match(html, /meta name="robots" content="index,follow/);
  assert.equal((html.match(/<h1\b/g) || []).length, 1, 'expected one H1');
  assert.match(html, /HAODE México es la tienda oficial de fábrica HL/);
  assert.match(html, /Piso 2, Local 225/);
  assert.match(html, /haode-como-llegar-local-225\.mp4/);
  assert.match(html, /Preguntas frecuentes/);
  assert.doesNotMatch(html, /file:\/\/|localhost|127\.0\.0\.1|\/Users\/mac/);
});

test('store route publishes verified local, brand, FAQ and video schema', () => {
  const nodes = graph('tienda-oficial-hl-cdmx/index.html');
  const store = nodes.find((node) => node['@type'] === 'Store');
  const faq = nodes.find((node) => node['@type'] === 'FAQPage');
  const video = nodes.find((node) => node['@type'] === 'VideoObject');

  assert.equal(store.name, 'HAODE México');
  assert.equal(store.alternateName, 'HAODE México · Tienda oficial de fábrica HL');
  assert.equal(store.brand.name, 'HL');
  assert.equal(store.address.postalCode, '06070');
  assert.equal(store.telephone, '+52 56 4586 6014');
  assert.ok(nodes.some((node) => node['@type'] === 'BreadcrumbList'));
  assert.ok(faq.mainEntity.length >= 3);
  assert.equal(video.duration, 'PT17S');
  assert.match(video.contentUrl, /haode-como-llegar-local-225\.mp4$/);
});

test('brand relationship and local route are connected across core discovery files', () => {
  for (const page of ['index.html', 'contacto/index.html', 'guia-ia-haode-mexico/index.html']) {
    const html = read(page);
    assert.match(html, /tienda oficial de fábrica HL/i, `${page} missing HL relationship`);
    assert.ok(html.includes(ROUTE), `${page} missing store route`);
  }

  assert.ok(read('site-footer.js').includes(ROUTE));
  assert.ok(read('sitemap.xml').includes(URL));
  assert.ok(read('llms.txt').includes(URL));
  assert.ok(read('scripts/build-products.js').includes(`'${ROUTE}'`));
  assert.ok(read('scripts/haode-quality-check.js').includes("'tienda-oficial-hl-cdmx'"));
});

test('approved route media is available for website delivery', () => {
  const video = fs.statSync(path.join(ROOT, 'assets/videos/store-gallery/haode-como-llegar-local-225.mp4'));
  const poster = fs.statSync(path.join(ROOT, 'assets/images/store-gallery/haode-como-llegar-local-225.png'));
  assert.ok(video.size > 1_000_000, 'route video is unexpectedly small');
  assert.ok(poster.size > 100_000, 'route poster is unexpectedly small');
});
