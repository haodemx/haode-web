import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SHARED_ANALYTICS = '<script src="/analytics.js?v=20260813-ga4-conversions"></script>';
const SKIP_DIRECTORIES = new Set([
  '.git',
  'node_modules',
  'overnight-previews',
  'playwright-report',
  'test-results'
]);

function collectHtmlFiles(directory = ROOT, files = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && SKIP_DIRECTORIES.has(entry.name)) continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      collectHtmlFiles(fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(fullPath);
    }
  }
  return files;
}

function isDirectGoogleLoader(attributes) {
  return /googletagmanager\.com\/gtag\/js\?id=G-22TCLJDXYS/i.test(attributes);
}

function isInlineGoogleConfig(attributes, body) {
  return !/\bsrc\s*=/i.test(attributes)
    && /G-22TCLJDXYS/.test(body)
    && /gtag\s*\(\s*['"]config['"]/i.test(body);
}

let convertedDirectTagFiles = 0;
let addedProductFiles = 0;
let updatedSharedTagFiles = 0;

for (const file of collectHtmlFiles()) {
  const relativePath = path.relative(ROOT, file);
  const original = fs.readFileSync(file, 'utf8');
  const hadSharedAnalytics = /<script\b[^>]*src=["'][^"']*\/analytics\.js(?:\?[^"']*)?["'][^>]*><\/script>/i.test(original);
  let insertedSharedAnalytics = false;
  let removedDirectTag = false;

  let updated = original.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (script, attributes, body) => {
    if (!isDirectGoogleLoader(attributes) && !isInlineGoogleConfig(attributes, body)) return script;
    removedDirectTag = true;
    if (hadSharedAnalytics || insertedSharedAnalytics) return '';
    insertedSharedAnalytics = true;
    return SHARED_ANALYTICS;
  });

  updated = updated.replace(
    /<script\b[^>]*src=["'][^"']*\/analytics\.js(?:\?[^"']*)?["'][^>]*><\/script>/gi,
    SHARED_ANALYTICS
  );
  updated = updated.replace(
    /(<script src="\/analytics\.js\?v=20260813-ga4-conversions"><\/script>)\r?\n[ \t]+\r?\n/g,
    '$1\n'
  );

  const isProductIndex = relativePath.startsWith(`producto${path.sep}`)
    && path.basename(file) === 'index.html';
  const hasSharedAnalytics = updated.includes('/analytics.js?v=20260813-ga4-conversions');
  if (isProductIndex && !hasSharedAnalytics) {
    if (!/<\/head>/i.test(updated)) {
      throw new Error(`Cannot add analytics before </head>: ${relativePath}`);
    }
    updated = updated.replace(/<\/head>/i, `  ${SHARED_ANALYTICS}\n</head>`);
    addedProductFiles += 1;
  }

  if (updated === original) continue;
  fs.writeFileSync(file, updated, 'utf8');
  if (removedDirectTag) convertedDirectTagFiles += 1;
  if (hadSharedAnalytics) updatedSharedTagFiles += 1;
}

const remainingDirectTags = collectHtmlFiles().filter((file) => {
  const html = fs.readFileSync(file, 'utf8');
  return /googletagmanager\.com\/gtag\/js\?id=G-22TCLJDXYS/i.test(html)
    || (/G-22TCLJDXYS/.test(html) && /gtag\s*\(\s*['"]config['"]/i.test(html));
});
if (remainingDirectTags.length) {
  throw new Error(`Direct GA tags remain:\n${remainingDirectTags.map((file) => path.relative(ROOT, file)).join('\n')}`);
}

const untaggedProducts = collectHtmlFiles(path.join(ROOT, 'producto')).filter((file) => {
  return path.basename(file) === 'index.html'
    && !fs.readFileSync(file, 'utf8').includes('/analytics.js?v=20260813-ga4-conversions');
});
if (untaggedProducts.length) {
  throw new Error(`Product routes without shared analytics:\n${untaggedProducts.map((file) => path.relative(ROOT, file)).join('\n')}`);
}

console.log(JSON.stringify({
  convertedDirectTagFiles,
  addedProductFiles,
  updatedSharedTagFiles,
  remainingDirectTags: remainingDirectTags.length,
  untaggedProducts: untaggedProducts.length
}, null, 2));
