import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { mediaSafeHtml } = require('../scripts/product-media-policy.cjs');
const id = 'gafas-ai-gafas-ai-m08';
const nodes = html => [...html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
  .flatMap(([, source]) => { const data = JSON.parse(source); return data['@graph'] || [data]; });

test('M08 static Product omits unconfirmed image, retains four approved offers', () => {
  const product = nodes(fs.readFileSync(`producto/${id}/index.html`, 'utf8')).find(n => n['@type'] === 'Product');
  assert.ok(!Object.hasOwn(product, 'image'));
  assert.deepEqual(product.offers.map(o => Number(o.price)), [1000, 945, 870, 845]);
});

test('M08 generation policy removes only Product image and is idempotent', () => {
  for (const type of ['Product', ['Thing', 'Product']]) {
    const graph = { '@graph': [
      { '@type': type, name: 'Gafas AI M08', image: ['https://haode.com.mx/assets/products/placeholder.svg'], offers: [{ price: '1000' }] },
      { '@type': 'Organization', image: 'brand.jpg' },
      { '@type': 'BreadcrumbList', itemListElement: [] },
    ] };
    const original = `<meta property="og:image" content="unchanged.svg"><script type="application/ld+json">${JSON.stringify(graph)}</script><img src="placeholder.svg">`;
    const clean = mediaSafeHtml(original, id);
    const expected = structuredClone(graph['@graph']);
    delete expected[0].image;
    assert.deepEqual(nodes(clean), expected);
    assert.equal(mediaSafeHtml(clean, id), clean);
    assert.ok(clean.includes('<img src="placeholder.svg">'));
    assert.ok(clean.includes('content="unchanged.svg"'));
    assert.equal(mediaSafeHtml(original, 'gafas-ai-gafas-ai-m02'), original);
  }
});

test('M08 price page generator cannot restore placeholder Product image', () => {
  const source = fs.readFileSync('scripts/sync-customer-prices.js', 'utf8').replace(/^main\(\);$/m, '');
  const sandbox = { require: createRequire(new URL('../scripts/sync-customer-prices.js', import.meta.url)), __dirname: new URL('../scripts/', import.meta.url).pathname, process, console };
  vm.runInNewContext(source, sandbox);
  const product = { id, name: 'Gafas AI M08', category: 'gafas-ai', description: 'M08', images: ['assets/products/placeholder.svg'], prices: [{ quantity: 'Menudeo', price: '$1,000' }] };
  const html = sandbox.genericProductPage(product);
  assert.ok(!Object.hasOwn(nodes(html).find(n => n['@type'] === 'Product'), 'image'));
  assert.equal(nodes(html).find(n => n['@type'] === 'Product').offers.price, '1000');
});
