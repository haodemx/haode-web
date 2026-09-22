import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const html = read('index.html');
const appHtml = read('app/index.html');
const appJs = read('app/app.js');
const serviceWorker = read('service-worker.js');
const script = read('script.js');

test('homepage exposes a keyboard skip path and a named main landmark', () => {
  assert.match(html, /<a\b[^>]*class=["'][^"']*c-skip-link[^"']*["'][^>]*href=["']#main-content["'][^>]*>/i);
  assert.match(html, /<main\b[^>]*id=["']main-content["'][^>]*>/i);
});

test('primary navigation is focused and controlled by an accessible button', () => {
  const navigation = html.match(/<nav\b[^>]*id=["']c-primary-nav["'][^>]*>([\s\S]*?)<\/nav>/i);
  assert.ok(navigation, 'primary navigation must use #c-primary-nav');
  assert.ok((navigation[1].match(/<a\b/g) || []).length <= 6);
  assert.match(html, /<button\b[^>]*class=["'][^"']*c-menu-button[^"']*["'][^>]*aria-label=["'][^"']+["'][^>]*aria-expanded=["']false["'][^>]*aria-controls=["']c-primary-nav["']/i);
  assert.match(script, /button\.addEventListener\('click',[\s\S]*aria-expanded/);
  assert.match(script, /event\.key === 'Escape'/);
});

test('homepage navigation script bypasses stale service-worker copies', () => {
  assert.match(html, /<script\b[^>]*src=["']\/script\.js\?v=20260922-c-reconciled["'][^>]*><\/script>/i);
  assert.match(serviceWorker, /url\.pathname\s*===\s*["']\/script\.js["']/i);
  assert.match(serviceWorker, /url\.pathname\s*===\s*["']\/homepage-c\.css["']/i);
});

test('hero keeps one WhatsApp action and the official catalog search', () => {
  const hero = html.match(/<section\b[^>]*data-home-c-section=["']hero["'][^>]*>([\s\S]*?)<\/section>/i);
  assert.ok(hero);
  assert.equal((hero[1].match(/<a\b[^>]*href=["'][^"']*wa\.me/gi) || []).length, 1);
  assert.match(hero[1], /<form\b[^>]*action=["']\/productos\/["'][^>]*data-home-catalog-search-form/i);
  assert.match(hero[1], /placeholder=["']Ej\. iPhone 11, S24 Ultra, MICA HD\.\.\.["']/i);
});

test('homepage presents nine direct supply paths without fake carousel controls', () => {
  const cards = html.match(/class=["'][^"']*c-category-card(?:\s|["'])/gi) || [];
  assert.equal(cards.length, 9);
  assert.doesNotMatch(html, /data-home-hero-carousel|data-home-hero-carousel-(?:prev|next|dots)/i);
});

test('homepage hero uses one approved stable real-product composition', () => {
  assert.equal((html.match(/class=["'][^"']*c-hero-media[^"']*["']/gi) || []).length, 1);
  assert.match(html, /src=["']\/assets\/images\/homepage-c\/phase3\/hero\/iphone-16pro-composition-a-1200\.webp["']/i);
  assert.match(html, /data-media-phase=["']verified-real-asset["']/i);
});

test('below-fold product media is deferred', () => {
  const belowFold = html.slice(html.indexOf('data-home-c-section="category-finder"'));
  const images = [...belowFold.matchAll(/<img\b[^>]*>/gi)].map((match) => match[0]);
  assert.ok(images.length > 0);
  for (const image of images) {
    assert.match(image, /loading=["']lazy["']/i);
    assert.match(image, /decoding=["']async["']/i);
  }
});

test('mobile surface opts into safe-area layout and current theme color', () => {
  assert.match(html, /<meta\b[^>]*name=["']viewport["'][^>]*content=["'][^"']*viewport-fit=cover[^"']*["']/i);
  assert.match(html, /<meta\b[^>]*name=["']theme-color["'][^>]*content=["']#ff6a00["']/i);
});

test('homepage and App use approved HAODE brand assets', () => {
  assert.match(html, /src=["']\/assets\/images\/homepage-c\/phase3\/brand\/haode-official-trimmed\.webp["']/i);
  assert.match(appHtml, /src=["']\/assets\/images\/haode-header-logo-horizontal-preview\.png["']/i);
  assert.match(serviceWorker, /haode-header-logo-horizontal-preview\.png/);
});

test('homepage and App lead with product-first messages', () => {
  assert.match(html, /Pantallas y tecnología[\s\S]*para vender y reparar/i);
  assert.match(appJs, /<h1>Encuentra tu refacción\.<\/h1>/i);
  assert.match(html, /pantallas, micas, productos AI y accesorios/i);
  assert.match(appJs, /Catálogo y pedido para talleres/i);
});

test('homepage header uses one restrained C-layout action system', () => {
  const header = html.match(/<header\b[^>]*class=["'][^"']*c-header[^"']*["'][^>]*>([\s\S]*?)<\/header>/i);
  assert.ok(header);
  assert.match(header[1], /class=["'][^"']*c-button-whatsapp[^"']*["']/i);
  assert.match(header[1], /class=["'][^"']*c-button-app[^"']*["']/i);
  assert.match(header[1], /data-contact-area=["']header["']/i);
});

test('App keeps one primary heading, reserves product image space, and avoids unconfirmed delivery claims', () => {
  assert.doesNotMatch(appHtml, /<h1\b[^>]*class=["']app-seo-title["']/i);
  assert.match(appHtml, /<p\b[^>]*class=["']app-seo-title["']/i);
  assert.doesNotMatch(appJs, /Envío rápido/i);
  assert.match(appJs, /Envío por confirmar/i);
  const dynamicImages = [...appJs.matchAll(/<img\b[^>]*>/gi)].map((match) => match[0]);
  assert.ok(dynamicImages.length > 0);
  for (const image of dynamicImages) {
    assert.match(image, /\bwidth=["']\d+["']/i);
    assert.match(image, /\bheight=["']\d+["']/i);
  }
});

test('homepage footer uses the approved current logo and customer-facing copy', () => {
  const footer = html.match(/<footer\b[^>]*class=["'][^"']*reference-footer[^"']*["'][^>]*>([\s\S]*?)<\/footer>/i);
  assert.ok(footer);
  assert.match(footer[1], /homepage-c\/phase3\/brand\/haode-official-trimmed\.webp/i);
  assert.match(footer[1], /Refacciones y productos para talleres, tiendas y distribuidores\./i);
});

test('homepage footer links only confirmed social accounts', () => {
  const footer = html.match(/<footer\b[^>]*class=["'][^"']*reference-footer[^"']*["'][^>]*>([\s\S]*?)<\/footer>/i);
  assert.ok(footer);
  assert.match(footer[1], /facebook\.com\/haodemx/i);
  assert.match(footer[1], /tiktok\.com\/@haodemx/i);
  assert.doesNotMatch(footer[1], /instagram\.com|youtube\.com|<span[^>]*aria-label=["'](?:Instagram|YouTube)/i);
});
