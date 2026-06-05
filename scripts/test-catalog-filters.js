const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'data', 'products.generated.js');
const EXPECTED_CATEGORIES = [
  'iphone-incell',
  'iphone-oled',
  'samsung-incell',
  'samsung-oled',
];

const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(DATA_FILE, 'utf8'), context);

const products = context.window.HAODE_PRODUCTS_DATA || [];
const allowedCategories = new Set(EXPECTED_CATEGORIES);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function productsFor(category) {
  if (category === 'all') return products;
  return products.filter((product) => product.category === category);
}

assert(products.length > 0, 'Expected product data to contain products');

for (const product of products) {
  assert(allowedCategories.has(product.category), `Invalid category for ${product.id}: ${product.category}`);
}

const categoryCounts = Object.fromEntries(EXPECTED_CATEGORIES.map((category) => [
  category,
  products.filter((product) => product.category === category).length,
]));

for (const [category, expectedCount] of Object.entries(categoryCounts)) {
  const filtered = productsFor(category);
  assert(filtered.length === expectedCount, `Expected ${expectedCount} ${category} products, got ${filtered.length}`);
  assert(filtered.every((product) => product.category === category), `Filter ${category} returned mixed categories`);
}

assert(productsFor('all').length === products.length, 'Filter all did not return every product');

console.log('Catalog filter logic OK');
console.log(JSON.stringify(categoryCounts, null, 2));
