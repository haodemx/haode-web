import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

const productPages = [
  ['producto/mica-hd/index.html', 'MICA HD', 'https://haode.com.mx/producto/mica-hd/'],
  ['producto/mica-matte/index.html', 'MICA MATTE', 'https://haode.com.mx/producto/mica-matte/'],
  ['producto/mica-privacidad-hd/index.html', 'MICA PRIVACIDAD HD', 'https://haode.com.mx/producto/mica-privacidad-hd/'],
  ['producto/mica-privacidad-matte/index.html', 'MICA PRIVACIDAD MATTE', 'https://haode.com.mx/producto/mica-privacidad-matte/'],
];

test('machine category targets the measured hydrogel-machine searches', () => {
  const html = read('categoria/maquinas-de-hidrogel/index.html');
  assert.match(html, /<title>Máquina de hidrogel para cortar micas \| HAODE México<\/title>/);
  assert.match(html, /<h1>Máquina de hidrogel para cortar micas<\/h1>/);
  assert.match(html, /meta name="description" content="[^"]*Máquina de hidrogel[^"]*"/);
  assert.match(html, /meta property="og:title" content="Máquina de hidrogel para cortar micas/);
  assert.match(html, /href="\/producto\/x200t-cortadora-micas\/"/);
  assert.doesNotMatch(html, /30,000 modelos/);
});

test('X200T page has exact machine intent and valid product schema', () => {
  const html = read('producto/x200t-cortadora-micas/index.html');
  assert.match(html, /<title>X200T máquina para cortar micas de hidrogel \| HAODE<\/title>/);
  assert.match(html, /rel="canonical" href="https:\/\/haode\.com\.mx\/producto\/x200t-cortadora-micas\/"/);
  assert.match(html, /href="\/categoria\/maquinas-de-hidrogel\/"/);
  assert.match(html, /href="\/micas-hidrogel-mayoreo-mexico\/"/);
  assert.match(html, /Máquina para cortar micas de hidrogel/);
  assert.match(html, /<body[^>]*data-curated-seo/);

  const productSchema = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
    .map((match) => JSON.parse(match[1]))
    .find((schema) => schema['@type'] === 'Product');
  assert.equal(productSchema.name, 'HAODE X200T Cortadora Inteligente de Micas');
  assert.equal(productSchema.category, 'Máquinas de hidrogel');
});

test('four official MICA pages target hidrogel without changing master names', () => {
  const titles = new Set();
  for (const [path, officialName, canonical] of productPages) {
    const html = read(path);
    const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
    assert.match(title, /hidrogel/i, `${path} title must include hidrogel`);
    assert.ok(!titles.has(title), `${path} title must be unique`);
    titles.add(title);
    assert.ok(html.includes(`<link rel="canonical" href="${canonical}" />`));
    assert.match(html, /meta name="description" content="[^"]*hidrogel[^"]*"/i);
    assert.ok(html.includes(`data-detail-title>${officialName}</h1>`), `${path} must preserve official H1`);
    assert.match(html, /href="\/micas-hidrogel-mayoreo-mexico\/"/);
    assert.match(html, /data-detail-description>[^<]*hidrogel/i);
    assert.match(html, /<body[^>]*data-curated-seo/);
  }
});

test('client renderer preserves metadata on curated SEO product pages', () => {
  const renderer = read('products.js');
  assert.match(renderer, /hasAttribute\('data-curated-seo'\)/);
  assert.match(renderer, /if \(!preservesCuratedSeo\)/);
});

test('sitemap exposes the machine and MICA landing paths with current release date', () => {
  const sitemap = read('sitemap.xml');
  const urls = [
    'https://haode.com.mx/categoria/maquinas-de-hidrogel/',
    'https://haode.com.mx/producto/x200t-cortadora-micas/',
    'https://haode.com.mx/micas-hidrogel-mayoreo-mexico/',
    ...productPages.map(([, , canonical]) => canonical),
  ];
  for (const url of urls) {
    assert.match(sitemap, new RegExp(`<loc>${url.replaceAll('.', '\\\.')}</loc>\\s*<lastmod>2026-08-21</lastmod>`));
  }
});
