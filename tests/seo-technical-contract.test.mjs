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
    '/privacidad/',
    '/eliminacion-de-datos/',
    '/terminos/',
    '/distribuidores/',
    '/categoria/camaras-inteligentes/',
    '/categoria/gafas-inteligentes-ai/',
    '/guia-ia-haode-mexico/',
    '/categoria/celulares-samsung/',
    '/fundas-celular-mayoreo-mexico/',
    '/pantallas-samsung-mayoreo-mexico/',
    '/micas-hidrogel-mayoreo-mexico/',
    '/pantallas-iphone-incell-mayoreo-mexico/',
    '/pantallas-iphone-oled-mayoreo-mexico/',
    '/pantallas-samsung-incell-mayoreo-mexico/',
    '/pantallas-samsung-oled-mayoreo-mexico/',
    '/pantallas-samsung-zflip-zfold-original-mexico/',
    '/refacciones-celulares-mayoreo-mexico/',
  ].map((urlPath) => `${SITE_URL}${urlPath}`);

  for (const url of required) {
    assert.ok(locs.includes(url), `missing sitemap URL: ${url}`);
  }

  assert.ok(!locs.includes(`${SITE_URL}/categoria/camaras-digitales/`));
  assert.ok(!locs.includes(`${SITE_URL}/micas/`));
  [
    'aimb-g5-ai-sports',
    'haode-ai-g3-smart-glasses',
    'haode-ai-w610-smart-glasses',
    's1-ai-classic',
    'w630-ai-pro',
  ].forEach((id) => {
    assert.ok(!locs.includes(`${SITE_URL}/producto/${id}/`), `redirect URL found in sitemap: ${id}`);
  });
});

test('sitemap generator preserves the same static SEO routes', () => {
  const script = read('scripts/build-products.js');
  const requiredStaticPaths = [
    '/productos-ai/',
    '/ai-productos.html',
    '/micas.html',
    '/contacto/',
    '/privacidad/',
    '/eliminacion-de-datos/',
    '/terminos/',
    '/distribuidores/',
    '/categoria/camaras-inteligentes/',
    '/categoria/gafas-inteligentes-ai/',
    '/guia-ia-haode-mexico/',
    '/categoria/celulares-samsung/',
    '/fundas-celular-mayoreo-mexico/',
    '/micas-hidrogel-mayoreo-mexico/',
    '/pantallas-iphone-incell-mayoreo-mexico/',
    '/pantallas-iphone-oled-mayoreo-mexico/',
    '/pantallas-samsung-incell-mayoreo-mexico/',
    '/pantallas-samsung-oled-mayoreo-mexico/',
    '/pantallas-samsung-mayoreo-mexico/',
    '/pantallas-samsung-zflip-zfold-original-mexico/',
    '/refacciones-celulares-mayoreo-mexico/',
  ];

  for (const urlPath of requiredStaticPaths) {
    assert.ok(script.includes(`'${urlPath}'`), `missing generator static URL: ${urlPath}`);
  }
  assert.ok(!script.includes("'/micas/'"));
  assert.ok(!script.includes("'/categoria/camaras-digitales/'"));
});

test('privacy and data deletion pages expose canonical public instructions', () => {
  const privacy = read('privacidad/index.html');
  const deletion = read('eliminacion-de-datos/index.html');
  const terms = read('terminos/index.html');

  assert.match(privacy, /<link rel="canonical" href="https:\/\/haode\.com\.mx\/privacidad\/" \/>/);
  assert.match(privacy, /ventas@haode\.com\.mx/);
  assert.match(privacy, /No vendemos datos personales/);
  assert.match(deletion, /<link rel="canonical" href="https:\/\/haode\.com\.mx\/eliminacion-de-datos\/" \/>/);
  assert.match(deletion, /No envíes contraseñas, códigos de verificación, tokens ni información bancaria\./);
  assert.match(deletion, /Integración en modo de verificación/);
  assert.match(terms, /<link rel="canonical" href="https:\/\/haode\.com\.mx\/terminos\/" \/>/);
  assert.match(terms, /No se permiten envíos masivos no solicitados/);
  assert.match(terms, /ventas@haode\.com\.mx/);
});

test('redirect aliases are noindex and point to canonical pages', () => {
  const cameraAlias = read('categoria/camaras-digitales/index.html');
  const micaAlias = read('micas/index.html');

  assert.match(cameraAlias, /<meta name="robots" content="noindex,follow" \/>/);
  assert.match(cameraAlias, /<link rel="canonical" href="https:\/\/haode\.com\.mx\/categoria\/camaras-inteligentes\/" \/>/);
  assert.match(micaAlias, /<meta name="robots" content="noindex,follow">/);
  assert.match(micaAlias, /<link rel="canonical" href="https:\/\/haode\.com\.mx\/micas\.html">/);

  const productAiAlias = read('categoria/productos-ai/index.html');
  const micaCategoryAlias = read('categoria/micas/index.html');
  const foldableAlias = read('productos/samsung-z-flip3/index.html');
  assert.match(productAiAlias, /<meta name="robots" content="noindex,follow" \/>/);
  assert.match(productAiAlias, /<link rel="canonical" href="https:\/\/haode\.com\.mx\/productos-ai\/" \/>/);
  assert.match(micaCategoryAlias, /<meta name="robots" content="noindex,follow" \/>/);
  assert.match(micaCategoryAlias, /<link rel="canonical" href="https:\/\/haode\.com\.mx\/micas\.html" \/>/);
  assert.match(foldableAlias, /<meta name="robots" content="noindex,follow" \/>/);
  assert.match(foldableAlias, /<link rel="canonical" href="https:\/\/haode\.com\.mx\/producto\/samsung-original-z-flip3\/" \/>/);
});

test('product SEO titles distinguish screen quality and static H1 text is crawlable', () => {
  const locs = sitemapLocs().filter((url) => url.startsWith(`${SITE_URL}/producto/`));
  const titles = new Map();
  const h1s = new Map();

  for (const url of locs) {
    const slug = new URL(url).pathname.split('/').filter(Boolean).at(-1);
    const html = read(`producto/${slug}/index.html`);
    const title = html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim();
    const h1 = html.match(/<h1\b[^>]*data-detail-title[^>]*>([^<]+)<\/h1>/i)?.[1]?.trim();
    assert.ok(title, `missing product title: ${slug}`);
    if (h1) assert.notEqual(h1, 'Producto HAODE México', `generic product H1: ${slug}`);
    const duplicates = titles.get(title) || [];
    duplicates.push(slug);
    titles.set(title, duplicates);
    if (h1) {
      const h1Duplicates = h1s.get(h1) || [];
      h1Duplicates.push(slug);
      h1s.set(h1, h1Duplicates);
    }
  }

  const duplicateTitles = [...titles].filter(([, slugs]) => slugs.length > 1);
  const duplicateH1s = [...h1s].filter(([, slugs]) => slugs.length > 1);
  assert.deepEqual(duplicateTitles, []);
  assert.deepEqual(duplicateH1s, []);
});

test('legacy product redirects do not use root-relative producto.html paths', () => {
  const productDir = path.join(ROOT, 'producto');
  const badRedirects = [];

  for (const slug of fs.readdirSync(productDir)) {
    const file = path.join(productDir, slug, 'index.html');
    if (!fs.existsSync(file)) continue;
    const html = fs.readFileSync(file, 'utf8');
    if (/window\.location\.replace\('\/producto\.html\?id=/.test(html) || /href="\/producto\.html\?id=/.test(html)) {
      badRedirects.push(`producto/${slug}/index.html`);
    }
  }

  assert.equal(badRedirects.length, 0, badRedirects.join('\n'));
});

test('homepage JSON-LD has parseable WebPage and category ItemList nodes', () => {
  const blocks = jsonLdBlocks(read('index.html'));
  const graph = blocks.flatMap((block) => block['@graph'] || [block]);
  const types = new Set(graph.map((node) => node['@type']));
  const itemList = graph.find((node) => node['@id'] === `${SITE_URL}/#main-categories`);
  const organization = graph.find((node) => node['@id'] === `${SITE_URL}/#organization`);
  const localBusiness = graph.find((node) => node['@id'] === `${SITE_URL}/#localbusiness`);

  assert.ok(types.has('Organization'));
  assert.ok(types.has('LocalBusiness'));
  assert.ok(types.has('WebSite'));
  assert.ok(types.has('WebPage'));
  assert.equal(itemList?.['@type'], 'ItemList');
  assert.equal(itemList.itemListElement.length, 8);
  assert.equal(organization?.contactPoint?.telephone, '+52 56 4586 6014');
  assert.equal(organization?.contactPoint?.contactType, 'ventas');
  assert.ok(!Object.hasOwn(localBusiness || {}, 'priceRange'));
});

test('homepage does not publish unsupported performance claims or testimonials', () => {
  const homepage = read('index.html');
  for (const unsupportedClaim of [
    '+8,000',
    '+25,000',
    '98%',
    'Carlos M.',
    'Pruebas 100%',
    'Mejor precio al mayoreo',
    'te respondemos en minutos',
    'Cada pieza revisada',
    'atención inmediata',
  ]) {
    assert.ok(!homepage.includes(unsupportedClaim), `unsupported homepage claim found: ${unsupportedClaim}`);
  }
  for (const confirmedServiceFact of [
    'Atención local',
    'Precio por cantidad',
    'Cotización directa',
    'Envío bajo confirmación',
    'Stock en México',
    'Sujeto a confirmación',
    'Garantía según producto',
    'Modelo o SKU',
    'Ciudad de entrega',
  ]) {
    assert.ok(homepage.includes(confirmedServiceFact), `missing confirmed homepage fact: ${confirmedServiceFact}`);
  }
});
