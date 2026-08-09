import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');

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
