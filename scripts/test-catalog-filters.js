const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'data', 'products.generated.js');

const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(DATA_FILE, 'utf8'), context);

const products = context.window.HAODE_PRODUCTS_DATA || [];

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

const actualCategories = [...new Set(products.map((product) => product.category).filter(Boolean))].sort();

for (const category of actualCategories) {
  assert(
    fs.existsSync(path.join(ROOT, 'categoria', category, 'index.html')),
    `Missing category page for ${category}`
  );
}

const categoryCounts = Object.fromEntries(actualCategories.map((category) => [
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
