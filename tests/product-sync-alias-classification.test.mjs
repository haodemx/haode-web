import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import test from 'node:test';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);

test('product sync distinguishes historical route aliases from missing products', () => {
  const output = execFileSync(
    process.execPath,
    [path.join(ROOT, 'scripts', 'validate-products-sync.js')],
    { cwd: ROOT, encoding: 'utf8' }
  );

  assert.match(output, /REPORT HISTORICAL_ROUTE_ALIAS iphone-14-incell/);
  assert.doesNotMatch(output, /WARN STATIC_PAGE_WITHOUT_WEBSITE_PRODUCT iphone-14-incell/);
  assert.match(output, /REPORT HISTORICAL_ROUTE_ALIAS funda-magnetica-17-pro-max/);
  assert.doesNotMatch(output, /WARN ROUTE_CANONICAL_SLUG_MISMATCH funda-magnetica-17-pro-max/);
  assert.doesNotMatch(output, /WARN STATIC_PAGE_WITHOUT_WEBSITE_PRODUCT funda-magnetica-estilo-iphone-17-pro-max/);
  assert.match(output, /WARN STATIC_PAGE_WITHOUT_WEBSITE_PRODUCT iphone-oled-11/);
});
