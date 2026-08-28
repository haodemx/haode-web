import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

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
