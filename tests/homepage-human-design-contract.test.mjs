import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const appHtml = fs.readFileSync(new URL('../app/index.html', import.meta.url), 'utf8');
const appJs = fs.readFileSync(new URL('../app/app.js', import.meta.url), 'utf8');
const serviceWorker = fs.readFileSync(new URL('../service-worker.js', import.meta.url), 'utf8');
const script = fs.readFileSync(new URL('../script.js', import.meta.url), 'utf8');
const transparentWordmark = fs.readFileSync(new URL('../assets/images/haode-wordmark-transparent.png', import.meta.url));

function openingTagWith(attribute) {
  const pattern = new RegExp(`<[^>]+\\b${attribute}\\b[^>]*>`, 'i');
  return html.match(pattern)?.[0] || '';
}

test('homepage exposes a keyboard skip path and a named main landmark', () => {
  assert.match(html, /<a\b[^>]*class=["'][^"']*reference-skip-link[^"']*["'][^>]*href=["']#main-content["'][^>]*>/i);
  assert.match(html, /<main\b[^>]*id=["']main-content["'][^>]*>/i);
});

test('primary navigation is focused and controlled by an accessible button', () => {
  const navigation = html.match(/<nav\b[^>]*id=["']primary-navigation["'][^>]*>([\s\S]*?)<\/nav>/i);
  assert.ok(navigation, 'primary navigation must use #primary-navigation');

  const directLinks = navigation[1].match(/<a\b/g) || [];
  assert.ok(directLinks.length <= 5, `primary navigation must have at most 5 links; found ${directLinks.length}`);

  const menuButton = openingTagWith('data-reference-menu-button');
  assert.match(menuButton, /^<button\b/i);
  assert.match(menuButton, /aria-controls=["']primary-navigation["']/i);
  assert.match(menuButton, /aria-expanded=["']false["']/i);
  assert.match(navigation[0], /\bhidden\b/i, 'mobile navigation must be closed before JavaScript runs');
  assert.match(script, /panel\.hidden\s*=\s*mobile\.matches\s*\?\s*!shouldOpen\s*:\s*false/i);
});

test('homepage navigation script bypasses stale service-worker copies', () => {
  assert.match(html, /<script\b[^>]*src=["']\/script\.js\?v=\d{8}-final-audit["'][^>]*><\/script>/i);
  assert.match(serviceWorker, /url\.pathname\s*===\s*["']\/script\.js["']/i);
});

test('hero has one primary WhatsApp action and keeps official catalog search secondary', () => {
  const primaryActions = html.match(/<a\b[^>]*class=["'][^"']*haode-hero-primary[^"']*["'][^>]*href=["'][^"']*wa\.me[^"']*["'][^>]*>/gi) || [];
  assert.equal(primaryActions.length, 1);
  assert.match(html, /<form\b[^>]*action=["']\/productos\/["'][^>]*data-home-catalog-search-form/i);
  assert.match(html, /placeholder=["']Ej\. iPhone 14 Pro Max, S24 Ultra o SKU…["']/i);
});

test('homepage presents four primary supply paths without fake carousel controls', () => {
  const supplyPaths = html.match(/class=["'][^"']*haode-supply-path(?:\s|["'])/gi) || [];
  assert.equal(supplyPaths.length, 4);
  assert.doesNotMatch(html, /class=["'][^"']*reference-round-arrow/i);
});

test('dynamic promotion is announced and below-fold content media is deferred', () => {
  const dailyAd = openingTagWith('data-daily-ad');
  assert.match(dailyAd, /aria-live=["']polite["']/i);
  assert.match(dailyAd, /aria-atomic=["']true["']/i);

  const belowFold = html.slice(html.indexOf('<section class="reference-wholesale-band"'));
  const contentImages = [...belowFold.matchAll(/<img\b[^>]*>/gi)].map((match) => match[0]);
  assert.ok(contentImages.length > 0, 'expected below-fold images to validate');
  for (const image of contentImages) {
    assert.match(image, /loading=["']lazy["']/i, `missing lazy loading: ${image}`);
    assert.match(image, /decoding=["']async["']/i, `missing async decoding: ${image}`);
  }
});

test('mobile surface opts into safe-area layout and current theme color', () => {
  assert.match(html, /<meta\b[^>]*name=["']viewport["'][^>]*content=["'][^"']*viewport-fit=cover[^"']*["']/i);
  assert.match(html, /<meta\b[^>]*name=["']theme-color["'][^>]*content=["']#151515["']/i);
});

test('homepage and App use the same transparent HAODE wordmark', () => {
  const wordmarkPath = '/assets/images/haode-wordmark-transparent.png';
  assert.match(html, new RegExp(`src=["']${wordmarkPath.replaceAll('/', '\\/')}["']`, 'i'));
  assert.match(appHtml, new RegExp(`src=["']${wordmarkPath.replaceAll('/', '\\/')}["']`, 'i'));
  assert.ok(serviceWorker.includes(`"${wordmarkPath}"`), 'installed App must cache the transparent wordmark');

  assert.equal(transparentWordmark.subarray(1, 4).toString('ascii'), 'PNG');
  const pngColorType = transparentWordmark[25];
  assert.ok([4, 6].includes(pngColorType), `wordmark PNG must carry alpha; color type was ${pngColorType}`);
});

test('homepage and App lead with pantallas instead of talleres', () => {
  assert.match(html, /<h1>Fábrica directa\s*<span>para pantallas<\/span><\/h1>/i);
  assert.doesNotMatch(html, /<h1>Fábrica directa\s*<span>para talleres<\/span><\/h1>/i);
  assert.match(appJs, /<h1>Fábrica directa para pantallas<\/h1>/i);
  assert.doesNotMatch(appJs, /<h1>Fábrica directa para talleres<\/h1>/i);
});

test('App keeps one primary heading, reserves product image space, and avoids unconfirmed delivery claims', () => {
  assert.doesNotMatch(appHtml, /<h1\b[^>]*class=["']app-seo-title["']/i);
  assert.match(appHtml, /<p\b[^>]*class=["']app-seo-title["']/i);
  assert.doesNotMatch(appJs, /Envío rápido/i);
  assert.match(appJs, /Envío por confirmar/i);

  const dynamicImages = [...appJs.matchAll(/<img\b[^>]*>/gi)].map((match) => match[0]);
  assert.ok(dynamicImages.length > 0, 'expected dynamic App images to validate');
  for (const image of dynamicImages) {
    assert.match(image, /\bwidth=["']\d+["']/i, `missing intrinsic width: ${image}`);
    assert.match(image, /\bheight=["']\d+["']/i, `missing intrinsic height: ${image}`);
  }
});

test('homepage footer uses the transparent wordmark and screen-first copy', () => {
  const footer = html.match(/<footer\b[^>]*class=["'][^"']*reference-footer[^"']*["'][^>]*>([\s\S]*?)<\/footer>/i);
  assert.ok(footer, 'homepage must include the reference footer');
  assert.match(footer[1], /<img\b[^>]*src=["']\/assets\/images\/haode-wordmark-transparent\.png["'][^>]*>/i);
  assert.match(footer[1], /Pantallas y refacciones para técnicos, tiendas y distribuidores\./i);
  assert.doesNotMatch(footer[1], /Refacciones y productos para talleres/i);
});

test('homepage footer links the verified HAODE Instagram and YouTube accounts', () => {
  assert.match(
    html,
    /<a\b[^>]*href=["']https:\/\/www\.instagram\.com\/cristi3an\/["'][^>]*target=["']_blank["'][^>]*rel=["']noopener noreferrer["'][^>]*aria-label=["']Instagram de HAODE México["'][^>]*>ig<\/a>/i,
  );
  assert.match(
    html,
    /<a\b[^>]*href=["']https:\/\/www\.youtube\.com\/@haodemx["'][^>]*target=["']_blank["'][^>]*rel=["']noopener noreferrer["'][^>]*aria-label=["']YouTube de HAODE México["'][^>]*>yt<\/a>/i,
  );
  assert.doesNotMatch(html, /<span\b[^>]*aria-label=["']Instagram[^"']*["'][^>]*>ig<\/span>/i);
  assert.doesNotMatch(html, /<span\b[^>]*aria-label=["']YouTube[^"']*["'][^>]*>yt<\/span>/i);
});
