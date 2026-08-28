import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LANDING_PATH = '/micas-hidrogel-mayoreo-mexico/';
const MICA_PAGES = [
  ['producto/mica-hd/index.html', 'MICA HD', /alta transparencia/i],
  ['producto/mica-matte/index.html', 'MICA MATTE', /menos reflejo/i],
  ['producto/mica-privacidad-hd/index.html', 'MICA PRIVACIDAD HD', /privacidad lateral/i],
  ['producto/mica-privacidad-matte/index.html', 'MICA PRIVACIDAD MATTE', /acabado matte/i],
];

function absolute(relativePath) {
  return path.join(ROOT, relativePath);
}

function read(relativePath) {
  return fs.readFileSync(absolute(relativePath), 'utf8');
}

function jsonLdGraph(html) {
  return [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map(([, json]) => JSON.parse(json.trim()))
    .flatMap((block) => block['@graph'] || [block]);
}

test('short hydrogel route provides a noindex canonical redirect alias', () => {
  const relativePath = 'micas-hidrogel/index.html';
  assert.ok(fs.existsSync(absolute(relativePath)), `${relativePath} is missing`);

  const html = read(relativePath);
  assert.match(html, /<meta name="robots" content="noindex,follow"\s*\/>/);
  assert.match(html, /<link rel="canonical" href="https:\/\/haode\.com\.mx\/micas-hidrogel-mayoreo-mexico\/"\s*\/>/);
  assert.match(html, /<meta http-equiv="refresh" content="0; url=\/micas-hidrogel-mayoreo-mexico\/"\s*\/>/);
  assert.match(html, /window\.location\.replace\(['"]\/micas-hidrogel-mayoreo-mexico\/['"]\)/);
  assert.doesNotMatch(read('sitemap.xml'), /<loc>https:\/\/haode\.com\.mx\/micas-hidrogel\/<\/loc>/);
});

test('four MICA product pages expose unique visible guidance and matching FAQPage schema', () => {
  for (const [relativePath, productName, distinguishingCopy] of MICA_PAGES) {
    const html = read(relativePath);
    const graph = jsonLdGraph(html);
    const product = graph.find((node) => node['@type'] === 'Product');
    const faq = graph.find((node) => node['@type'] === 'FAQPage');

    assert.ok(product, `${relativePath} is missing Product schema`);
    assert.ok(faq, `${relativePath} is missing FAQPage schema`);
    assert.equal(faq.mainEntity.length, 3, `${relativePath} should expose exactly three focused questions`);
    assert.ok(faq.mainEntity.every((entry) => entry['@type'] === 'Question'), `${relativePath} has a malformed FAQ question`);
    assert.ok(faq.mainEntity.some((entry) => entry.name.includes(productName)), `${relativePath} FAQ should name the product`);

    assert.match(html, /data-mica-indexing-content/, `${relativePath} is missing visible indexing content`);
    assert.match(html, /Preguntas frecuentes/, `${relativePath} is missing a visible FAQ heading`);
    assert.match(html, distinguishingCopy, `${relativePath} is missing product-specific copy`);
    assert.match(html, new RegExp(`href=["']${LANDING_PATH.replaceAll('/', '\\/')}["']`), `${relativePath} is missing the hydrogel landing link`);
    assert.match(html, /href=["']\/categoria\/maquinas-de-hidrogel\/["']/, `${relativePath} is missing the cutting-machine link`);
    assert.match(html, /confirma(?:r|mos)? (?:la )?disponibilidad/i, `${relativePath} must keep availability confirmation-first`);
  }
});

test('indexed hydrogel landing page links directly to every MICA product page', () => {
  const html = read('micas-hidrogel-mayoreo-mexico/index.html');

  for (const [relativePath] of MICA_PAGES) {
    const slug = relativePath.split('/')[1];
    assert.match(html, new RegExp(`href=["']\\/producto\\/${slug}\\/["']`), `landing page is missing ${slug}`);
  }
});
