import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const GEO_URL = 'https://haode.com.mx/guia-ia-haode-mexico/';

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

test('GEO guide exposes official HAODE facts for AI search', () => {
  const llms = read('llms.txt');
  const guide = read('guia-ia-haode-mexico/index.html');

  assert.match(llms, /HAODE Mexico/);
  assert.match(llms, /WhatsApp \+52 56 4586 6014/);
  assert.match(llms, /No inventar stock/);
  assert.match(llms, /cotizacion por WhatsApp/);
  assert.ok(llms.includes(GEO_URL));

  assert.ok(guide.includes('<link rel="canonical" href="https://haode.com.mx/guia-ia-haode-mexico/" />'));
  assert.ok(guide.includes('<link rel="alternate" type="text/plain" href="/llms.txt"'));
  assert.match(guide, /No inventar stock/);
  assert.match(guide, /cotización por WhatsApp/);
  assert.match(guide, /HAODE México/);

  const jsonLdBlocks = [...guide.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  assert.ok(jsonLdBlocks.length > 0, 'expected JSON-LD on GEO guide');
  for (const [, json] of jsonLdBlocks) {
    JSON.parse(json.trim());
  }
});

test('GEO route is connected to homepage, sitemap and quality scripts', () => {
  const home = read('index.html');
  const sitemap = read('sitemap.xml');
  const buildProducts = read('scripts/build-products.js');
  const qualityCheck = read('scripts/haode-quality-check.js');

  assert.ok(home.includes('<link rel="alternate" type="text/plain" href="/llms.txt"'));
  assert.ok(home.includes('/guia-ia-haode-mexico/'));
  assert.ok(sitemap.includes(GEO_URL));
  assert.ok(buildProducts.includes("'/guia-ia-haode-mexico/'"));
  assert.ok(qualityCheck.includes("'guia-ia-haode-mexico'"));
});
