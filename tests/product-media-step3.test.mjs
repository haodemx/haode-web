import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'data', 'product-media-manifest.json'), 'utf8'));
const productsJs = fs.readFileSync(path.join(root, 'products.js'), 'utf8');

test('Step 3 manifest covers every current product and only publishes unique video matches', () => {
  assert.equal(manifest.matchingPolicy, 'STRICT_MODEL_AND_VERSION');
  assert.equal(manifest.products.length, manifest.summary.productsTotal);
  assert.ok(manifest.products.length > 0);
  for (const product of manifest.products) {
    for (const video of product.testVideos) {
      assert.equal(video.status, 'UNIQUE_MATCH');
      assert.equal(fs.existsSync(path.join(root, video.path)), true, `${product.productId}: ${video.path}`);
      assert.match(video.title, /^Prueba real — /);
    }
    for (const video of product.ambiguousVideos) assert.equal(video.status, 'AMBIGUOUS');
  }
});

test('shared diagnostic video is review-only and excluded from publishable galleries', () => {
  const diagnostic = manifest.products.filter((product) => product.productId.startsWith('haode-pantalla-oled-diagnostica-'));
  assert.ok(diagnostic.length > 0);
  for (const product of diagnostic) {
    assert.equal(product.testVideos.length, 0);
    assert.ok(product.ambiguousVideos.length > 0);
    const staticPage = fs.readFileSync(path.join(root, 'producto', product.productId, 'index.html'), 'utf8');
    assert.doesNotMatch(staticPage, /oled-diagnostica\/video-/);
    assert.doesNotMatch(staticPage, /data-seo-static-video="20260821"/);
  }
});

test('detail gallery has accessible image/video switching and conservative playback', () => {
  assert.match(productsJs, /Imágenes y prueba real/);
  assert.match(productsJs, /stageVideo\.controls = true/);
  assert.match(productsJs, /stageVideo\.playsInline = true/);
  assert.match(productsJs, /stageVideo\.preload = 'metadata'/);
  assert.doesNotMatch(productsJs, /stageVideo\.autoplay\s*=\s*true/);
  assert.doesNotMatch(productsJs, /stageVideo\.loop\s*=\s*true/);
  assert.match(productsJs, /video\.status === 'UNIQUE_MATCH'/);
});
