import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PRODUCT_DATA = path.join(ROOT, 'data', 'products.generated.js');
const PRODUCT_ROUTES = path.join(ROOT, 'producto');
const APPLY = process.argv.includes('--apply');
const PRODUCTS_CACHE_KEY = '20260813-ga4-conversions';

function displayImagePath(source) {
  return String(source || '').replace(/\.(?:jpe?g|png)$/i, '.display.webp');
}

function readProducts() {
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(PRODUCT_DATA, 'utf8'), sandbox);
  return Array.isArray(sandbox.window.HAODE_PRODUCTS_DATA)
    ? sandbox.window.HAODE_PRODUCTS_DATA
    : [];
}

function imageWidth(sourceFile) {
  const output = execFileSync('sips', ['-g', 'pixelWidth', sourceFile], { encoding: 'utf8' });
  return Number(output.match(/pixelWidth:\s*(\d+)/)?.[1] || 0);
}

function generateDisplayImage(relativeSource) {
  const source = path.join(ROOT, relativeSource.replace(/^\/+/, ''));
  const relativeOutput = displayImagePath(relativeSource);
  const output = path.join(ROOT, relativeOutput.replace(/^\/+/, ''));
  if (!fs.existsSync(source) || source === output) return null;

  if (fs.existsSync(output) && fs.statSync(output).mtimeMs >= fs.statSync(source).mtimeMs) {
    return { source, output, skipped: true };
  }

  const args = ['-quiet', '-q', '80', '-m', '6', '-metadata', 'icc'];
  if (imageWidth(source) > 800) args.push('-resize', '800', '0');
  args.push(source, '-o', output);
  execFileSync('cwebp', args, { stdio: 'inherit' });
  return { source, output, skipped: false };
}

function replaceTagSource(tag) {
  return tag.replace(/\bsrc=(['"])([^'"]+)\1/i, (match, quote, source) => {
    const relativeSource = source.replace(/^\/+/, '');
    const relativeDisplay = displayImagePath(relativeSource);
    if (relativeDisplay === relativeSource || !fs.existsSync(path.join(ROOT, relativeDisplay))) return match;
    return `src=${quote}/${relativeDisplay}${quote}`;
  });
}

function updateProductRoute(file) {
  const before = fs.readFileSync(file, 'utf8');
  let after = before.replace(/<img\b(?=[^>]*\bdata-detail-main-image\b)[^>]*>/gi, replaceTagSource);
  after = after.replace(
    /(<div\b[^>]*\bdata-detail-mobile-preview\b[^>]*>\s*)(<img\b[^>]*>)/gi,
    (match, prefix, image) => `${prefix}${replaceTagSource(image)}`,
  );
  after = after.replace(/\/products\.js\?v=[^'"]+/g, `/products.js?v=${PRODUCTS_CACHE_KEY}`);
  if (after === before) return false;
  if (APPLY) fs.writeFileSync(file, after, 'utf8');
  return true;
}

const products = readProducts();
const sources = [...new Set(products
  .map((product) => product.images?.[0])
  .filter((source) => /\.(?:jpe?g|png)$/i.test(String(source || ''))))];

let generated = 0;
let skipped = 0;
let sourceBytes = 0;
let outputBytes = 0;

if (APPLY) {
  sources.forEach((source) => {
    const result = generateDisplayImage(source);
    if (!result) return;
    if (result.skipped) skipped += 1;
    else generated += 1;
    sourceBytes += fs.statSync(result.source).size;
    outputBytes += fs.statSync(result.output).size;
  });
}

const routeFiles = fs.readdirSync(PRODUCT_ROUTES, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => path.join(PRODUCT_ROUTES, entry.name, 'index.html'))
  .filter((file) => fs.existsSync(file));
const updatedRoutes = routeFiles.filter(updateProductRoute).length;

console.log(JSON.stringify({
  mode: APPLY ? 'apply' : 'check',
  products: products.length,
  displaySources: sources.length,
  generated,
  skipped,
  sourceBytes,
  outputBytes,
  savedBytes: Math.max(0, sourceBytes - outputBytes),
  updatedRoutes,
}, null, 2));
