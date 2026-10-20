import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const checker = path.join(root, 'scripts/haode-quality-check.js');
const productPath = path.join(root, 'producto/mica-hd/index.html');

function checkInjectedAvailability(array) {
  const html = fs.readFileSync(productPath, 'utf8').replace(
    /(<script[^>]*type="application\/ld\+json"[^>]*>)([\s\S]*?)(<\/script>)/,
    (_match, start, source, end) => {
      const data = JSON.parse(source);
      const product = data['@graph'].find(node => node['@type'] === 'Product');
      const offer = { ...product.offers[0], availability: 'https://schema.org/InStock' };
      product.offers = array ? [offer, ...product.offers.slice(1)] : offer;
      return start + JSON.stringify(data) + end;
    }
  );
  const output = [];
  const realRequire = createRequire(checker);
  const readonlyFs = { ...fs, readFileSync(file, ...args) {
    return path.resolve(file) === productPath ? html : fs.readFileSync(file, ...args);
  }};
  vm.runInNewContext(fs.readFileSync(checker, 'utf8'), {
    __dirname: path.dirname(checker),
    require: name => name === 'fs' ? readonlyFs : realRequire(name),
    console: { log: value => output.push(String(value)) },
    process: { exit() {} },
  }, { filename: checker });
  return output.join('\n');
}

for (const array of [false, true]) {
  test(`quality gate rejects unconfirmed stock in ${array ? 'an Offer array' : 'one Offer object'}`, () => {
    const output = checkInjectedAvailability(array);
    assert.match(output, /UNCONFIRMED_SCHEMA_AVAILABILITY producto\/mica-hd\/index\.html: https:\/\/schema\.org\/InStock/);
  });
}

const { stripProductAvailability } = createRequire(import.meta.url)('../scripts/product-schema-trust.cjs');

test('cleanup removes stock from every Product offer without changing other entities or prices', () => {
  const source = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Product', name: 'Test film', offers: [
        { '@type': 'Offer', price: '350', priceCurrency: 'MXN', availability: 'https://schema.org/InStock' },
        { '@type': 'Offer', price: '300', availability: 'https://schema.org/OutOfStock' },
      ] },
      { '@type': ['Product', 'Thing'], offers: { price: 800, availability: null } },
      { '@type': 'Service', offers: { availability: 'unchanged', price: 25 } },
    ],
  };
  const expected = structuredClone(source);
  delete expected['@graph'][0].offers[0].availability;
  delete expected['@graph'][0].offers[1].availability;
  delete expected['@graph'][1].offers.availability;
  const cleaned = stripProductAvailability(JSON.stringify(source));
  assert.deepEqual(JSON.parse(cleaned), expected);
  assert.equal(stripProductAvailability(cleaned), cleaned, 'cleanup must be idempotent');
});

test('cleanup preserves clean JSON bytes and leaves malformed JSON for the syntax validator', () => {
  for (const source of [' { "@type":"Product", "offers":[{"price":350},null] } ', '{invalid json']) {
    assert.equal(stripProductAvailability(source), source);
  }
});
