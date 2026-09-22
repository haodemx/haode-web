import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const homepage = read('index.html');
const app = read('app/app.js');
const appShell = read('app/index.html');
const campaign = read('campaign-attribution.js');
const micas = read('micas.html');
const webProducts = read('data/products.generated.js');
const appProducts = JSON.parse(read('app/products.json'));
const atlas = read('v3-screen-atlas.js');
const serviceWorker = read('service-worker.js');
const publicManifest = read('public-site-files.json');

test('approved current C-layout order, assets and direct category routes are present', () => {
  const order = ['hero', 'service-strip', 'category-finder', 'feature-blocks', 'featured-products']
    .map((section) => homepage.indexOf(`data-home-c-section="${section}"`));
  assert.ok(order.every((index) => index >= 0));
  assert.deepEqual(order, [...order].sort((a, b) => a - b));
  for (const route of [
    '/categoria/iphone-incell/', '/categoria/iphone-oled/', '/categoria/oled-diagnostica/',
    '/categoria/samsung-incell/', '/categoria/samsung-oled/', '/categoria/samsung-tipo-original/',
    '/categoria/samsung-plegables/', '/micas-hidrogel-mayoreo-mexico/', '/productos-ai/'
  ]) assert.match(homepage, new RegExp(`href="${route.replaceAll('/', '\\/')}"`));
  assert.match(homepage, /assets\/images\/homepage-c\/phase3\/hero\/iphone-16pro-composition-a-1200\.webp/);
  assert.match(publicManifest, /homepage-c\.css/);
  assert.match(serviceWorker, /homepage-c\.css/);
  assert.doesNotMatch(homepage, /v3-screen-atlas\.(?:css|js)/);
  assert.doesNotMatch(homepage, /data\/products\.generated\.js/);
});

test('authoritative WhatsApp is the only sales number on the homepage', () => {
  assert.match(homepage, /\+52 33 2668 4296/);
  assert.match(homepage, /wa\.me\/523326684296/);
  assert.doesNotMatch(homepage, /wa\.me\/(?!523326684296)\d+/);
  assert.doesNotMatch(homepage, /\+52 (?:55|56) /);
});

test('contact areas distinguish the required customer entry points', () => {
  for (const area of ['header', 'home_hero', 'floating']) {
    assert.match(homepage, new RegExp(`data-contact-area="${area}"`));
  }
  assert.match(campaign, /data-whatsapp-link[^\n]*return "cart"|hasAttribute\("data-whatsapp-link"\)\) return "cart"/);
  assert.match(campaign, /data-product-whatsapp[^\n]*return "product"|hasAttribute\("data-product-whatsapp"\)/);
  assert.match(campaign, /return "home_hero"/);
  assert.match(campaign, /return "floating"/);
});

test('custom attribution distinguishes search, AI referral, social, UTM and direct', () => {
  assert.match(campaign, /source: "google", medium: "organic_search"/);
  assert.match(campaign, /source: "bing", medium: "organic_search"/);
  assert.match(campaign, /source: "chatgpt", medium: "ai_referral"/);
  assert.match(campaign, /medium: "organic_social"/);
  assert.match(campaign, /source: "direct", medium: "none"/);
  assert.match(campaign, /params\.get\("utm_source"\)/);
  assert.doesNotMatch(campaign, /traffic_source\s*:/);
});

test('cart quantity mutations emit complete consent-aware ecommerce events', () => {
  assert.match(app, /const eventName = delta > 0 \? "add_to_cart" : "remove_from_cart"/);
  assert.match(app, /trackGrowthEvent\(eventName,[\s\S]*value: item\.price \* changedQuantity/);
  assert.match(app, /trackGrowthEvent\("remove_from_cart", \{[\s\S]*value: item\.price \* removedQuantity/);
  assert.doesNotMatch(app, /automatico por cantidad/i);
  assert.match(app, /precio estimado de Menudeo/i);
  assert.match(app, /Mayoreo \/ Caja \/ VIP: confirmar por WhatsApp/i);
  assert.match(appShell, /Mayoreo, Caja y VIP se confirman con un asesor por WhatsApp/i);
});

test('MICA HD public sources keep exact approved prices and worksheet provenance', () => {
  const mica = appProducts.find((product) => product.id === 'mica-hd');
  assert.ok(mica);
  assert.deepEqual([mica.precioPublico, ...mica.priceTiers.map((tier) => tier.price)], [350, 300, 275, 250]);
  assert.match(mica.priceSource, /01 HIDROGEL · fila 8$/);
  assert.match(webProducts, /"id": "mica-hd"[\s\S]*?"Menudeo"[\s\S]*?\$350 MXN[\s\S]*?"Mayoreo"[\s\S]*?\$300 MXN[\s\S]*?"Caja"[\s\S]*?\$275 MXN[\s\S]*?"⭐ VIP"[\s\S]*?\$250 MXN[\s\S]*?01 HIDROGEL · fila 8/);
  assert.match(micas, /aria-label="Precios de MICA HD"[\s\S]*?\$350 MXN[\s\S]*?\$300 MXN[\s\S]*?\$275 MXN[\s\S]*?\$250 MXN/);
  assert.doesNotMatch(micas, /<\/table>75 MXN|<\/table>50 MXN/);
});

test('public labels are customer-facing Spanish and omit unconfirmed hours', () => {
  assert.doesNotMatch(atlas, /Quality \/ Technology|revisión de clasificación|clasificarse automáticamente/i);
  assert.match(atlas, /Calidad y tecnología/);
  assert.match(atlas, /También puedes explorar cámaras/);
  assert.doesNotMatch(homepage, /openingHours|10:00\s*-\s*18:00|10:00\s*–\s*18:00/);
});
