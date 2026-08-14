import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = (relativePath) => fs.readFileSync(new URL(`../${relativePath}`, import.meta.url), 'utf8');
const RELEASE_DATE = '2026-08-13';

function sitemapLastmod(url) {
  const sitemap = read('sitemap.xml');
  const escapedUrl = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = sitemap.match(new RegExp(`<loc>${escapedUrl}</loc>\\s*<lastmod>([^<]+)</lastmod>`));
  return match?.[1] || '';
}

test('sitemap reflects the final UI and product-detail release date', () => {
  assert.equal(sitemapLastmod('https://haode.com.mx/'), RELEASE_DATE);
  assert.equal(sitemapLastmod('https://haode.com.mx/app/'), RELEASE_DATE);
  assert.equal(sitemapLastmod('https://haode.com.mx/producto/iphone-incell-14/'), RELEASE_DATE);
});

test('service worker treats the product renderer as a fresh application resource', () => {
  const serviceWorker = read('service-worker.js');
  assert.match(serviceWorker, /url\.pathname === ["']\/products\.js["']/);
  assert.match(serviceWorker, /20260813-performance1/);
});

test('product detail uses optimized display media and defers below-fold payloads', () => {
  const productRenderer = read('products.js');
  const productPage = read('producto/iphone-incell-14/index.html');
  assert.match(productRenderer, /\.display\.webp/);
  assert.match(productRenderer, /deferProductMedia\(img, gallerySource\)/);
  assert.match(productRenderer, /frame\.preload = 'none'/);
  assert.match(productPage, /data-detail-main-image[^>]+main\.display\.webp/);
  assert.ok(fs.existsSync(new URL('../assets/products/iphone-incell/14/main.display.webp', import.meta.url)));
});
