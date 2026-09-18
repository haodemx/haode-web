import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const productsScript = fs.readFileSync(new URL('../products.js', import.meta.url), 'utf8');

test('product media gallery uses one stage for images and exact-match videos', () => {
  assert.match(productsScript, /dataset\.detailMediaStage/);
  assert.match(productsScript, /dataset\.detailStageVideo/);
  assert.match(productsScript, /createImageThumbnail/);
  assert.match(productsScript, /createVideoThumbnail/);
  assert.match(productsScript, /this\.productDirectory/);
  assert.match(productsScript, /directory === this\.productDirectory/);
  assert.match(productsScript, /Prueba real —/);
});

test('video entry opens the shared stage instead of scrolling to a separate player', () => {
  assert.match(productsScript, /data-product-media-kind="video"/);
  assert.match(productsScript, /this\.showVideo\(src, button\)/);
  assert.match(productsScript, /this\.setSectionVisibility\(this\.videoWrap, false\)/);
  assert.doesNotMatch(productsScript, /videoWrap\?\.scrollIntoView/);
});
