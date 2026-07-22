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

function jsonLdBlocks(html) {
  return [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => JSON.parse(match[1].trim()));
}

test('sitemap keeps canonical static SEO pages and excludes redirect aliases', () => {
  const locs = sitemapLocs();
  const required = [
    '/',
    '/app/',
    '/productos/',
    '/productos-ai/',
    '/micas.html',
    '/garantia/',
    '/contacto/',
    '/distribuidores/',
    '/categoria/camaras-inteligentes/',
    '/categoria/gafas-inteligentes-ai/',
    '/guia-ia-haode-mexico/',
  ].map((urlPath) => `${SITE_URL}${urlPath}`);

  for (const url of required) {
    assert.ok(locs.includes(url), `missing sitemap URL: ${url}`);
  }

  assert.ok(!locs.includes(`${SITE_URL}/categoria/camaras-digitales/`));
  assert.ok(!locs.includes(`${SITE_URL}/micas/`));
});

test('sitemap generator preserves the same static SEO routes', () => {
  const script = read('scripts/build-products.js');
  const requiredStaticPaths = [
    '/productos-ai/',
    '/ai-productos.html',
    '/micas.html',
    '/contacto/',
    '/distribuidores/',
    '/categoria/camaras-inteligentes/',
    '/categoria/gafas-inteligentes-ai/',
    '/productos/samsung-z-flip7/',
    '/productos/samsung-z-fold6/',
    '/guia-ia-haode-mexico/',
  ];

  for (const urlPath of requiredStaticPaths) {
    assert.ok(script.includes(`'${urlPath}'`), `missing generator static URL: ${urlPath}`);
  }
  assert.ok(!script.includes("'/micas/'"));
  assert.ok(!script.includes("'/categoria/camaras-digitales/'"));
});

test('redirect aliases are noindex and point to canonical pages', () => {
  const cameraAlias = read('categoria/camaras-digitales/index.html');
  const micaAlias = read('micas/index.html');

  assert.match(cameraAlias, /<meta name="robots" content="noindex,follow" \/>/);
  assert.match(cameraAlias, /<link rel="canonical" href="https:\/\/haode\.com\.mx\/categoria\/camaras-inteligentes\/" \/>/);
  assert.match(micaAlias, /<meta name="robots" content="noindex,follow">/);
  assert.match(micaAlias, /<link rel="canonical" href="https:\/\/haode\.com\.mx\/micas\.html">/);
});

test('homepage JSON-LD has parseable WebPage and category ItemList nodes', () => {
  const blocks = jsonLdBlocks(read('index.html'));
  const graph = blocks.flatMap((block) => block['@graph'] || [block]);
  const types = new Set(graph.map((node) => node['@type']));
  const itemList = graph.find((node) => node['@id'] === `${SITE_URL}/#main-categories`);

  assert.ok(types.has('Organization'));
  assert.ok(types.has('LocalBusiness'));
  assert.ok(types.has('WebSite'));
  assert.ok(types.has('WebPage'));
  assert.equal(itemList?.['@type'], 'ItemList');
  assert.equal(itemList.itemListElement.length, 7);
});
