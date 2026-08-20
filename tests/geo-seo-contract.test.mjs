import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const GEO_URL = 'https://haode.com.mx/guia-ia-haode-mexico/';

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function parseJsonLd(relativePath) {
  const html = read(relativePath);
  return [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map(([, json]) => JSON.parse(json.trim()));
}

function flattenGraph(blocks) {
  return blocks.flatMap((block) => block['@graph'] || [block]);
}

test('GEO guide exposes official HAODE facts for AI search', () => {
  const llms = read('llms.txt');
  const guide = read('guia-ia-haode-mexico/index.html');

  assert.match(llms, /HAODE Mexico/);
  assert.match(llms, /WhatsApp \+52 56 4586 6014/);
  assert.match(llms, /No inventar stock/);
  assert.match(llms, /cotizacion por WhatsApp/);
  assert.ok(llms.includes(GEO_URL));

  assert.ok(guide.includes('<link rel="canonical" href="https://haode.com.mx/guia-ia-haode-mexico/" />'));
  assert.ok(guide.includes('<link rel="alternate" type="text/plain" href="/llms.txt"'));
  assert.match(guide, /No inventar stock/);
  assert.match(guide, /cotización por WhatsApp/);
  assert.match(guide, /HAODE México/);

  assert.ok(parseJsonLd('guia-ia-haode-mexico/index.html').length > 0, 'expected JSON-LD on GEO guide');
});

test('GEO route is connected to homepage, sitemap and quality scripts', () => {
  const home = read('index.html');
  const sitemap = read('sitemap.xml');
  const buildProducts = read('scripts/build-products.js');
  const qualityCheck = read('scripts/haode-quality-check.js');

  assert.ok(home.includes('<link rel="alternate" type="text/plain" href="/llms.txt"'));
  assert.ok(home.includes('/guia-ia-haode-mexico/'));
  assert.ok(sitemap.includes(GEO_URL));
  assert.ok(buildProducts.includes("'/guia-ia-haode-mexico/'"));
  assert.ok(qualityCheck.includes("'guia-ia-haode-mexico'"));
});

test('core GEO landing pages expose visible FAQ and FAQPage schema', () => {
  const pages = [
    'index.html',
    'categoria/pantallas/index.html',
    'categoria/iphone-incell/index.html',
    'categoria/iphone-oled/index.html',
    'categoria/samsung-incell/index.html',
    'categoria/samsung-oled/index.html',
    'micas.html',
    'categoria/micas/index.html',
    'categoria/maquinas-de-hidrogel/index.html',
    'categoria/fundas/index.html',
    'productos-ai/index.html',
    'contacto/index.html',
    'tienda-oficial-hl-cdmx/index.html',
    'distribuidores/index.html',
  ];

  for (const page of pages) {
    const html = read(page);
    const graph = flattenGraph(parseJsonLd(page));
    const faq = graph.find((node) => node['@type'] === 'FAQPage');

    assert.ok(faq, `${page} missing FAQPage schema`);
    assert.ok(faq.mainEntity.length >= 3, `${page} FAQPage should have at least 3 questions`);
    assert.match(html, /Preguntas frecuentes|Información oficial para búsqueda/, `${page} missing visible GEO/FAQ content`);
    assert.match(html, /WhatsApp|búsqueda|busqueda/i, `${page} should explain confirmation or search context`);
  }
});

test('llms.txt maps high-intent GEO searches to canonical HAODE pages', () => {
  const llms = read('llms.txt');
  const routes = [
    '/categoria/pantallas/',
    '/categoria/iphone-incell/',
    '/categoria/iphone-oled/',
    '/categoria/samsung-incell/',
    '/categoria/samsung-oled/',
    '/micas.html',
    '/categoria/maquinas-de-hidrogel/',
    '/categoria/fundas/',
    '/productos-ai/',
    '/distribuidores/',
    '/tienda-oficial-hl-cdmx/',
  ];

  assert.match(llms, /Intenciones de busqueda recomendadas/);
  for (const route of routes) {
    assert.ok(llms.includes(`https://haode.com.mx${route}`), `missing llms route: ${route}`);
  }
});
