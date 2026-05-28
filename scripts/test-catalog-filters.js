const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'data', 'products.generated.js');
const EXPECTED_COUNTS = {
  'iphone-incell': 23,
  'iphone-oled': 24,
  'samsung-incell': 20,
  'samsung-oled': 19,
};

const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(DATA_FILE, 'utf8'), context);

const products = context.window.HAODE_PRODUCTS_DATA || [];
const allowedCategories = new Set(Object.keys(EXPECTED_COUNTS));

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function productsFor(category) {
  if (category === 'all') return products;
  return products.filter((product) => product.category === category);
}

assert(products.length === 86, `Expected 86 products, got ${products.length}`);

for (const product of products) {
  assert(allowedCategories.has(product.category), `Invalid category for ${product.id}: ${product.category}`);
}

for (const [category, expectedCount] of Object.entries(EXPECTED_COUNTS)) {
  const filtered = productsFor(category);
  assert(filtered.length === expectedCount, `Expected ${expectedCount} ${category} products, got ${filtered.length}`);
  assert(filtered.every((product) => product.category === category), `Filter ${category} returned mixed categories`);
}

assert(productsFor('all').length === products.length, 'Filter all did not return every product');

console.log('Catalog filter logic OK');
console.log(JSON.stringify(EXPECTED_COUNTS, null, 2));
