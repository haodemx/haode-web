import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';
import { SCREEN_DATE, SCREEN_LANDINGS, DIAGNOSTIC_FAQ, isScreen, screenName, refreshScreenProduct, refreshScreenLanding } from '../scripts/screen-seo-content.mjs';

const root = new URL('../', import.meta.url);
const read = (file) => fs.readFileSync(new URL(file, root), 'utf8');
const context = { window: {} };
vm.runInNewContext(read('data/products.generated.js'), context);
const products = context.window.HAODE_PRODUCTS_DATA.filter(isScreen);
const paths = [...products.map((p) => `producto/${p.id}/index.html`), ...SCREEN_LANDINGS.keys()];
const meta = (html, key) => html.match(new RegExp(`<meta (?:name|property)="${key}" content="([^"]*)"`))?.[1];
const nodes = (html) => [...html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
  .flatMap((m) => { const data = JSON.parse(m[1]); return data['@graph'] || [data]; });

test('screen selection covers all six screen families without Samsung whole phones', () => {
  assert.equal(new Set(products.map((p) => p.category)).size, 6);
  assert.ok(products.length >= 141);
  assert.ok(!products.some((p) => p.category === 'celulares-samsung'));
  assert.equal(SCREEN_LANDINGS.size, 18);
});

test('screen pages have unique titles, aligned social metadata and self canonical URLs', () => {
  const titles = new Set();
  const sitemap = read('sitemap.xml');
  for (const file of paths) {
    const html = read(file);
    const title = html.match(/<title>([^<]*)<\/title>/)?.[1];
    assert.ok(title && !titles.has(title), `duplicate or missing title: ${file}`);
    titles.add(title);
    const description = meta(html, 'description');
    assert.ok(description?.length >= 60 && description.length <= 165, `snippet length: ${file}`);
    assert.equal(meta(html, 'og:title'), title, file);
    assert.equal(meta(html, 'twitter:title'), title, file);
    assert.equal(meta(html, 'og:description'), description, file);
    assert.equal(meta(html, 'twitter:description'), description, file);
    const url = `https://haode.com.mx/${file.replace(/index.html$/, '')}`;
    assert.ok(html.includes(`<link rel="canonical" href="${url}"`), file);
    assert.equal(meta(html, 'og:url'), url, file);
    assert.ok(sitemap.includes(`<loc>${url}</loc>`), file);
    assert.doesNotMatch(meta(html, 'robots') || '', /noindex/i, file);
    assert.equal((html.match(/<h1\b/g) || []).length, 1, file);
    nodes(html);
  }
});

test('static quality and product schema describe the same published reference', () => {
  for (const product of products) {
    const html = read(`producto/${product.id}/index.html`);
    assert.equal(html.match(/data-detail-quality[^>]*>([^<]*)</)?.[1], product.quality, product.id);
    assert.ok(html.includes('data-curated-seo'), product.id);
    assert.ok(html.includes(`data-screen-seo="${SCREEN_DATE}"`), product.id);
    assert.ok(html.includes(`La calidad registrada es ${product.quality}`), product.id);
    const schema = nodes(html).find((node) => node['@type'] === 'Product');
    assert.ok(schema, product.id);
    assert.equal(schema.name, screenName(product), product.id);
    assert.equal(schema.description, meta(html, 'description'), product.id);
    assert.equal(schema.offers?.availability, undefined, product.id);
    if (product.category === 'oled-diagnostica') assert.match(meta(html, 'og:title'), /iPhone/, product.id);
    if (product.category.startsWith('samsung-')) assert.doesNotMatch(meta(html, 'description'), /iPhone/i, product.id);
  }
});

test('generated screen guidance links to existing canonical pages with labelled choices', () => {
  const sitemap = read('sitemap.xml');
  for (const file of paths) {
    const html = read(file);
    const section = html.match(/<section[^>]*data-screen-seo="[^"\n]+"[\s\S]*?<\/section>/)?.[0];
    assert.ok(section, file);
    for (const [, href] of section.matchAll(/href="([^"#]+)"/g)) {
      assert.ok(href.startsWith('/'), `${file}: ${href}`);
      const target = href.endsWith('/') ? `${href.slice(1)}index.html` : href.slice(1);
      assert.ok(fs.existsSync(new URL(target, root)), `${file}: ${href}`);
      assert.ok(sitemap.includes(`<loc>https://haode.com.mx${href}</loc>`), `${file}: noncanonical ${href}`);
    }
  }
});

test('diagnostic FAQ schema exactly matches visible questions and answers', () => {
  const html = read('categoria/oled-diagnostica/index.html');
  const faq = nodes(html).find((node) => node['@type'] === 'FAQPage');
  assert.equal(faq.mainEntity.length, DIAGNOSTIC_FAQ.length);
  for (const [question, answer] of DIAGNOSTIC_FAQ) {
    assert.ok(html.includes(`<h3>${question}</h3><p>${answer}</p>`));
    assert.ok(faq.mainEntity.some((q) => q.name === question && q.acceptedAnswer.text === answer));
  }
});

test('editorial transformations are idempotent and do not duplicate guidance', () => {
  for (const product of products) {
    const html = read(`producto/${product.id}/index.html`);
    assert.equal(refreshScreenProduct(html, product), html, product.id);
    assert.equal((html.match(/data-seo-product-guide=/g) || []).length, 1, product.id);
  }
  for (const [file, config] of SCREEN_LANDINGS) {
    const html = read(file);
    assert.equal(refreshScreenLanding(html, config, products), html, file);
    assert.equal((html.match(/data-seo-index-hub=/g) || []).length, 1, file);
  }
});

test('category pages offer model discovery while wholesale pages explain purchasing', () => {
  for (const [file, config] of SCREEN_LANDINGS) {
    const html = read(file);
    if (config.kind === 'category') assert.match(html, /aria-label="Consultar fichas y categorías"/);
    if (config.kind === 'wholesale') {
      assert.match(html, /Cómo preparar tu solicitud de mayoreo/);
      assert.match(html, /una fila por referencia, versión y cantidad/);
    }
  }
});
