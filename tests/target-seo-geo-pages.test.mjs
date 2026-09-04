import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('diagnostic iPhone category aligns Mexican search intent without changing its canonical route', () => {
  const html = read('categoria/oled-diagnostica/index.html');
  const title = 'Pantallas diagnóstico para iPhone | HAODE México';
  assert.ok(html.includes(`<title>${title}</title>`));
  assert.ok(html.includes(`<meta property="og:title" content="${title}"`));
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1);
  assert.match(html, /<h1>Pantallas diagnóstico para iPhone<\/h1>/);
  assert.match(html, /<meta name="description" content="Pantallas diagnóstico para iPhone/);
  assert.match(html, /<link rel="canonical" href="https:\/\/haode.com.mx\/categoria\/oled-diagnostica\/"/);
  assert.match(html, /data-category="oled-diagnostica"/);
  assert.match(html, /name="robots" content="index,follow/);
  assert.ok(read('sitemap.xml').includes('<loc>https://haode.com.mx/categoria/oled-diagnostica/</loc>'));
  assert.doesNotMatch(html, /https:\/\/schema.org\/InStock|aggregateRating/);
});

test('diagnostic FAQ schema exactly matches visible answers and qualifies technical claims', () => {
  const html = read('categoria/oled-diagnostica/index.html');
  const visible = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  const graph = jsonLdBlocks(html).flatMap(block => block['@graph'] || [block]);
  const faq = graph.find(node => node['@type'] === 'FAQPage');
  assert.equal(faq.mainEntity.length, 4);
  for (const question of faq.mainEntity) {
    assert.ok(visible.includes(`<h3>${question.name}</h3>`));
    assert.ok(visible.includes(`<p>${question.acceptedAnswer.text}</p>`));
  }
  assert.match(visible, /pantallas diagnosticables/);
  assert.match(visible, /No es una guía para entrar al modo de diagnóstico del teléfono/);
  assert.match(visible, /HAODE no los garantiza para toda la categoría/);
  assert.match(visible, /modelo o SKU/);
  assert.match(visible, /versión de iOS/);
  assert.match(visible, /Disponibilidad, precio final, garantía y envío se confirman/);
  const collection = graph.find(node => node['@type'] === 'CollectionPage');
  assert.equal(collection.inLanguage, 'es-MX');
  for (const item of collection.mainEntity.itemListElement) {
    assert.ok(visible.includes(`href="${new URL(item.url).pathname}"`));
    assert.ok(visible.includes(item.name));
  }
});

test('diagnostic category has crawlable incoming links and existing local destinations', () => {
  for (const page of ['categoria/iphone-oled/index.html', 'guia-ia-haode-mexico/index.html']) {
    assert.match(read(page), /href="\/categoria\/oled-diagnostica\/"[^>]*>(?:<strong>)?Pantallas diagnóstico para iPhone/i);
  }
  const html = read('categoria/oled-diagnostica/index.html');
  const links = [...html.matchAll(/href="(\/[^"?#]*)/g)].map(([, href]) => href);
  for (const href of links) {
    const destination = href.endsWith('/') ? `${href}index.html` : href;
    assert.ok(fs.existsSync(path.join(ROOT, destination)), `Missing destination: ${href}`);
  }
  assert.match(html, /wa\.me\/525645866014/);
});

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function jsonLdBlocks(html) {
  return [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map(([, json]) => JSON.parse(json.trim()));
}

test('four low-click pages retain aligned Spanish intent and conversion signals', () => {
  const pages = [
    ['categoria/samsung-oled/index.html', /Pantallas Samsung OLED y AMOLED/, /Pantallas Samsung OLED y AMOLED para técnicos/],
    ['categoria/maquinas-de-hidrogel/index.html', /Máquinas de hidrogel y corte de micas/, /Máquinas de Hidrogel para corte de micas/],
    ['producto/iphone-incell-xr/index.html', /Pantalla para iPhone XR INCELL/, /Pantalla para iPhone XR INCELL/],
    ['app/index.html', /HAODE APP/, /HAODE App de catálogo/],
  ];

  for (const [page, title, h1] of pages) {
    const html = read(page);
    assert.match(html, new RegExp(`<title>${title.source}[^<]*<\\/title>`), `${page} has an incomplete title`);
    assert.match(html, /<meta name="description" content="[^"]+"/, `${page} missing description`);
    assert.match(html, new RegExp(`<h1[^>]*>${h1.source}`), `${page} has an incomplete H1`);
    assert.match(html, /wa\.me\/525645866014/, `${page} missing WhatsApp CTA`);
    assert.match(html, /href="\/(?:categoria|productos|guia-ia-haode-mexico)/, `${page} missing internal link`);
  }
});

test('App and iPhone XR expose visible FAQ content with FAQPage schema', () => {
  for (const page of ['app/index.html', 'producto/iphone-incell-xr/index.html']) {
    const html = read(page);
    const graph = jsonLdBlocks(html).flatMap((block) => block['@graph'] || [block]);
    const faq = graph.find((node) => node['@type'] === 'FAQPage');

    assert.ok(faq, `${page} missing FAQPage schema`);
    assert.ok(faq.mainEntity.length >= 3, `${page} should expose three FAQ answers`);
    assert.match(html, /Preguntas frecuentes/, `${page} missing visible FAQ heading`);
  }
});

test('target pages ask for confirmation instead of claiming unverified inventory or warranty', () => {
  const pages = [
    'categoria/samsung-oled/index.html',
    'categoria/maquinas-de-hidrogel/index.html',
    'producto/iphone-incell-xr/index.html',
    'app/index.html'
  ];

  for (const page of pages) {
    const html = read(page);
    assert.doesNotMatch(html, /Stock local en CDMX|Stock en México|Garantía local/i, `${page} claims unverified inventory or warranty`);
    assert.doesNotMatch(html, /Disponible para técnicos, tiendas y mayoreo HAODE|https:\/\/schema\.org\/InStock/i, `${page} claims unverified availability`);
    assert.doesNotMatch(html, /envíos a todo México/i, `${page} claims unverified delivery coverage`);
  }
});

test('App rendered conversion labels keep availability, warranty and delivery confirmation-first', () => {
  const appSource = read('app/app.js');
  const unverifiedLabels = [
    '<span>Stock México</span>',
    '<strong>Stock en México</strong>',
    'benefitHtml("Stock en México", "grid")',
    'Inventario México',
    '<strong>Garantía local</strong>',
    '<strong>Envío</strong> a todo México'
  ];

  for (const label of unverifiedLabels) {
    assert.doesNotMatch(appSource, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `App still presents unverified claim: ${label}`);
  }
  assert.match(appSource, /Referencia por confirmar/, 'App needs a confirmation-first availability label');
  assert.match(appSource, /Condiciones por confirmar/, 'App needs a confirmation-first conditions label');
});
