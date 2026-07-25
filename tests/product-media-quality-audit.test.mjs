import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import test from 'node:test';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);

test('product media audit keeps referenced primary assets valid and cross-surface images aligned', () => {
  const output = execFileSync(
    process.execPath,
    [path.join(ROOT, 'scripts', 'audit-product-media-quality.js')],
    { cwd: ROOT, encoding: 'utf8' }
  );
  const summary = JSON.parse(output);

  assert.equal(summary.missingPrimaryAssets, 0);
  assert.equal(summary.unreadablePrimaryDimensions, 0);
  assert.equal(summary.extensionContentMismatchAssets, 0);
  assert.equal(summary.crossSurfaceDifferentFile, 0);
  assert.equal(
    summary.crossSurfaceSamePath,
    summary.commonProducts,
    'every SKU shared by website and app should use the same primary image path'
  );
});
