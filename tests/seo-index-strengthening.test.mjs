import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { buildExposurePack } from '../scripts/generate-exposure-pack.mjs';
import { SCREEN_DATE, isScreen } from '../scripts/screen-seo-content.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE_URL = 'https://haode.com.mx';
const CHANGE_DATE = '2026-08-21';
const PRIORITY_PAGES = [
  'app/index.html',
  'guia-ia-haode-mexico/index.html',
  'distribuidores/index.html',
  'categoria/pantallas/index.html',
  'categoria/samsung-oled/index.html',
  'refacciones-celulares-mayoreo-mexico/index.html',
  'categoria/iphone-incell/index.html',
  'categoria/iphone-oled/index.html',
  'categoria/samsung-incell/index.html',
  'fundas-celular-mayoreo-mexico/index.html',
  'micas-hidrogel-mayoreo-mexico/index.html',
  'categoria/gafas-inteligentes-ai/index.html',
  'pantallas-samsung-mayoreo-mexico/index.html',
];

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function productData() {
  const context = { window: {} };
  vm.runInNewContext(read('data/products.generated.js'), context);
  return context.window.HAODE_PRODUCTS_DATA;
}

function jsonLdBlocks(html) {
  return [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => JSON.parse(match[1].trim()));
}

function sitemapProductIds() {
  return [...read('sitemap.xml').matchAll(/<loc>https:\/\/haode\.com\.mx\/producto\/([^/<]+)\/<\/loc>/g)]
    .map((match) => decodeURIComponent(match[1]));
}

test('every canonical product page has crawlable guidance, breadcrumbs, and related links', () => {
  const failures = [];

  for (const id of sitemapProductIds()) {
    const html = read(`producto/${id}/index.html`);
    const nodes = jsonLdBlocks(html).flatMap((block) => block['@graph'] || [block]);
    if (!html.includes('data-seo-index-strengthening="20260821"')) failures.push(`${id}: breadcrumbs`);
    if (!html.includes('data-seo-product-guide="20260821"')) failures.push(`${id}: guide`);
    if (!html.includes('class="seo-related-static"')) failures.push(`${id}: related links`);
    if (!nodes.some((node) => node['@type'] === 'BreadcrumbList')) failures.push(`${id}: breadcrumb schema`);
  }

  assert.deepEqual(failures, []);
});

test('published product videos have static playback markup and valid VideoObject dates', () => {
  const products = new Map(productData().map((product) => [product.id, product]));
  const failures = [];

  for (const id of sitemapProductIds()) {
    const product = products.get(id);
    if (!product?.videos?.length) continue;
    const html = read(`producto/${id}/index.html`);
    const nodes = jsonLdBlocks(html).flatMap((block) => block['@graph'] || [block]);
    const video = nodes.find((node) => node['@type'] === 'VideoObject');
    if (!html.includes('data-seo-static-video="20260821"')) failures.push(`${id}: static video`);
    if (!video?.contentUrl?.startsWith(`${SITE_URL}/assets/`)) failures.push(`${id}: content URL`);
    if (!video?.uploadDate || Number.isNaN(Date.parse(video.uploadDate))) failures.push(`${id}: upload date`);
    if (video?.uploadDate && !/(?:Z|[+-]\d{2}:\d{2})$/.test(video.uploadDate)) failures.push(`${id}: timezone`);
  }

  assert.deepEqual(failures, []);
});

test('priority landing pages expose unique metadata and a crawlable category hub', () => {
  const titles = new Set();

  for (const relativePath of PRIORITY_PAGES) {
    const html = read(relativePath);
    const title = html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim();
    const description = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)/i)?.[1]?.trim();
    assert.ok(title, `missing title: ${relativePath}`);
    assert.ok(description, `missing description: ${relativePath}`);
    assert.ok(description.length <= 165, `description too long: ${relativePath}`);
    assert.ok(!titles.has(title), `duplicate title: ${title}`);
    assert.match(html, /data-seo-index-hub="20260821"/);
    assert.match(html, /class="seo-index-hub-links"/);
    titles.add(title);
  }
});

test('hydrogel micas and AI glasses are directly discoverable as priority products', () => {
  const home = read('index.html');
  const catalog = read('productos/index.html');
  const llms = read('llms.txt');
  const micas = read('micas-hidrogel-mayoreo-mexico/index.html');
  const glasses = read('categoria/gafas-inteligentes-ai/index.html');

  for (const html of [home, catalog]) {
    assert.match(html, /href=["']\/micas-hidrogel-mayoreo-mexico\/["']/);
    assert.match(html, /href=["']\/categoria\/gafas-inteligentes-ai\/["']/);
  }

  assert.match(llms, /Micas de hidrogel.+micas-hidrogel-mayoreo-mexico\//i);
  assert.match(llms, /Gafas inteligentes AI.+categoria\/gafas-inteligentes-ai\//i);
  assert.match(micas, /<h1>Micas de hidrogel para tiendas y técnicos<\/h1>/);
  assert.match(glasses, /<h1>Gafas inteligentes AI de mayoreo<\/h1>/);
});

test('priority landing pages expose every published canonical product route', () => {
  const micas = read('micas-hidrogel-mayoreo-mexico/index.html');
  const glasses = read('categoria/gafas-inteligentes-ai/index.html');
  const micaRoutes = [
    '/producto/mica-hd/',
    '/producto/mica-matte/',
    '/producto/mica-privacidad-hd/',
    '/producto/mica-privacidad-matte/',
    '/producto/x200t-cortadora-micas/',
  ];
  const glassesRoutes = [
    '/ai-smart-glasses-s1.html',
    '/ai-smart-glasses-aimb-g3.html',
    '/ai-smart-glasses-aimb-g5.html',
    '/ai-smart-glasses-w610.html',
    '/ai-smart-glasses-w630.html',
  ];

  for (const route of micaRoutes) assert.match(micas, new RegExp(`href=["']${route}["']`));
  for (const route of glassesRoutes) assert.match(glasses, new RegExp(`href=["']${route}["']`));

  const micaNodes = jsonLdBlocks(micas).flatMap((block) => block['@graph'] || [block]);
  const glassesNodes = jsonLdBlocks(glasses).flatMap((block) => block['@graph'] || [block]);
  assert.equal(micaNodes.find((node) => node['@type'] === 'ItemList')?.numberOfItems, 5);
  assert.equal(glassesNodes.find((node) => node['@type'] === 'CollectionPage')?.mainEntity?.itemListElement?.length, 5);
  assert.match(micas, /id="guia-hidrogel"/);
  assert.match(glasses, /id="guia-gafas-ai"/);
});

test('14-day exposure plan gives hydrogel micas and AI glasses two priority touches', () => {
  const pack = buildExposurePack('20260821');
  const micaItems = pack.items.filter((item) => item.url === `${SITE_URL}/micas-hidrogel-mayoreo-mexico/`);
  const glassesItems = pack.items.filter((item) => item.url === `${SITE_URL}/categoria/gafas-inteligentes-ai/`);

  assert.equal(micaItems.length, 2);
  assert.equal(glassesItems.length, 2);
  assert.ok(micaItems.some((item) => item.channels.includes('google_business')));
  assert.ok(micaItems.some((item) => item.channels.includes('tiktok')));
  assert.ok(glassesItems.some((item) => item.channels.includes('tiktok')));
  assert.ok(glassesItems.some((item) => item.channels.includes('google_business')));
  for (const item of [...micaItems, ...glassesItems]) {
    assert.ok(fs.existsSync(path.join(ROOT, item.media_asset.path)), `missing media: ${item.media_asset.path}`);
    assert.match(item.whatsapp, /confirma|confirmaci[oó]n/i);
  }
});

test('changed canonical URLs publish the current lastmod date', () => {
  const sitemap = read('sitemap.xml');
  const screenIds = new Set(productData().filter(isScreen).map((p) => p.id));

  for (const id of sitemapProductIds()) {
    const url = `${SITE_URL}/producto/${encodeURIComponent(id)}/`;
    const escaped = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const expectedDate = screenIds.has(id) ? SCREEN_DATE : CHANGE_DATE;
    assert.match(sitemap, new RegExp(`<loc>${escaped}</loc>\\s*<lastmod>${expectedDate}</lastmod>`));
  }
});
