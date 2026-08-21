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
  const graph = flattenGraph(parseJsonLd('guia-ia-haode-mexico/index.html'));
  const organization = graph.find((node) => node['@type'] === 'Organization');
  const localBusiness = graph.find((node) => node['@type'] === 'LocalBusiness');

  assert.match(llms, /HAODE Mexico/);
  assert.match(llms, /WhatsApp \+52 33 2668 4296/);
  assert.match(llms, /No inventar stock/);
  assert.match(llms, /cotizacion por WhatsApp/);
  assert.ok(llms.includes(GEO_URL));

  assert.ok(guide.includes('<link rel="canonical" href="https://haode.com.mx/guia-ia-haode-mexico/" />'));
  assert.ok(guide.includes('<link rel="describedby" type="text/markdown" href="/llms.txt"'));
  assert.ok(guide.includes('<link rel="alternate" type="text/markdown" href="/guia-ia-haode-mexico/index.md"'));
  assert.match(guide, /No inventar stock/);
  assert.match(guide, /cotización por WhatsApp/);
  assert.match(guide, /HAODE México/);

  assert.ok(graph.length > 0, 'expected JSON-LD on GEO guide');
  assert.deepEqual(organization?.sameAs, [
    'https://www.tiktok.com/@haodemx',
    'https://www.facebook.com/people/HAODE-Display-Celular-HL-CDMX-HL-CDMX/100063509498956/',
    'https://www.instagram.com/cristi3an/',
    'https://www.youtube.com/@haodemx',
  ]);
  assert.equal(localBusiness?.priceRange, undefined, 'GEO guide must not imply an unconfirmed price range');
});

test('GEO route is connected to homepage, sitemap and quality scripts', () => {
  const home = read('index.html');
  const sitemap = read('sitemap.xml');
  const buildProducts = read('scripts/build-products.js');
  const qualityCheck = read('scripts/haode-quality-check.js');

  assert.ok(home.includes('<link rel="describedby" type="text/markdown" href="/llms.txt"'));
  assert.ok(home.includes('<link rel="alternate" type="text/markdown" href="/index.md"'));
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

test('llms.txt follows the v2 discovery format and links to concise markdown sources', () => {
  const llms = read('llms.txt');
  const lines = llms.split(/\r?\n/);
  const firstContentLine = lines.findIndex((line) => line.trim());
  const summaryLine = lines.findIndex((line, index) => index > firstContentLine && line.trim());
  const fileListLines = lines.filter((line) => line.startsWith('- ['));

  assert.equal(lines[firstContentLine], '# HAODE Mexico');
  assert.match(lines[summaryLine], /^> /);
  assert.ok(fileListLines.length >= 8, 'expected curated markdown file links');
  for (const line of fileListLines) {
    assert.match(line, /^- \[[^\]]+\]\(https:\/\/haode\.com\.mx\/[^)]+\)(?:: .+)?$/);
  }

  for (const markdownPath of [
    'index.md',
    'productos/index.md',
    'contacto/index.md',
    'garantia/index.md',
    'tienda-oficial-hl-cdmx/index.md',
    'guia-ia-haode-mexico/index.md',
  ]) {
    const markdown = read(markdownPath);
    assert.match(markdown, /^# /);
    assert.match(markdown, /HAODE/);
  }
});
