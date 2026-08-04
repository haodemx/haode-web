import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APPLY = process.argv.includes('--apply');
const SITE_URL = 'https://haode.com.mx';

const SEO_ALIASES = new Map([
  ['/categoria/micas/', '/micas.html'],
  ['/categoria/productos-ai/', '/productos-ai/'],
  ['/productos/samsung-z-flip3/', '/producto/samsung-original-z-flip3/'],
  ['/productos/samsung-z-flip4/', '/producto/samsung-original-z-flip4/'],
  ['/productos/samsung-z-flip5/', '/producto/samsung-original-z-flip5/'],
  ['/productos/samsung-z-flip6/', '/producto/samsung-original-z-flip6/'],
  ['/productos/samsung-z-flip7/', '/producto/samsung-original-z-flip7/'],
  ['/productos/samsung-z-fold3/', '/producto/samsung-original-z-fold3/'],
  ['/productos/samsung-z-fold4/', '/producto/samsung-original-z-fold4/'],
  ['/productos/samsung-z-fold5/', '/producto/samsung-original-z-fold5/'],
  ['/productos/samsung-z-fold6/', '/producto/samsung-original-z-fold6/'],
]);

function readProducts() {
  const context = { window: {} };
  const source = fs.readFileSync(path.join(ROOT, 'data', 'products.generated.js'), 'utf8');
  vm.runInNewContext(source, context, { filename: 'data/products.generated.js' });
  return Array.isArray(context.window.HAODE_PRODUCTS_DATA) ? context.window.HAODE_PRODUCTS_DATA : [];
}

function qualityLabel(product) {
  const quality = String(product.quality || '').toUpperCase();
  if (quality.includes('SOFT OLED')) return 'Soft OLED';
  if (quality.includes('HARD OLED')) return 'Hard OLED';
  if (quality.includes('TIPO ORIGINAL') || quality.includes('ORIGINAL')) return 'Tipo Original';
  if (quality.includes('INCELL')) return 'INCELL';
  if (quality.includes('AMOLED')) return 'AMOLED';
  if (quality.includes('OLED')) return 'OLED';
  return '';
}

function productSeoName(product) {
  const name = String(product.name || '').trim().replace(/\s*\|\s*HAODE México.*$/i, '');
  const label = qualityLabel(product);
  if (!label || !/^pantalla\b/i.test(name) || name.toLowerCase().includes(label.toLowerCase())) return name;
  return `${name} ${label}`;
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function replaceMetaContent(html, attribute, attributeValue, value) {
  const pattern = new RegExp(`(<meta\\s+${attribute}=["']${attributeValue}["']\\s+content=["'])[^"']*(["'][^>]*>)`, 'i');
  return html.replace(pattern, `$1${value}$2`);
}

function refreshProductPage(product) {
  const relativePath = path.join('producto', product.id, 'index.html');
  const file = path.join(ROOT, relativePath);
  if (!fs.existsSync(file)) return null;

  const current = fs.readFileSync(file, 'utf8');
  const seoTitle = escapeHtml(`${productSeoName(product)} | HAODE México`);
  let updated = current.replace(/<title>[^<]*<\/title>/i, `<title>${seoTitle}</title>`);
  updated = replaceMetaContent(updated, 'property', 'og:title', seoTitle);
  updated = replaceMetaContent(updated, 'name', 'twitter:title', seoTitle);
  updated = updated.replace(
    /(<h1\b[^>]*data-detail-title[^>]*>)\s*Producto HAODE México\s*(<\/h1>)/i,
    `$1${escapeHtml(product.name)}$2`,
  );

  return current === updated ? null : { file, relativePath, updated };
}

function refreshAliasPage(aliasPath, canonicalPath) {
  const relativePath = aliasPath.endsWith('/')
    ? path.join(aliasPath.replace(/^\//, ''), 'index.html')
    : aliasPath.replace(/^\//, '');
  const file = path.join(ROOT, relativePath);
  if (!fs.existsSync(file)) throw new Error(`Missing alias page: ${relativePath}`);

  const aliasUrl = `${SITE_URL}${aliasPath}`;
  const canonicalUrl = `${SITE_URL}${canonicalPath}`;
  const current = fs.readFileSync(file, 'utf8');
  let updated = current.replace(
    /<meta\s+name=["']robots["']\s+content=["'][^"']*["']\s*\/?\s*>/i,
    '<meta name="robots" content="noindex,follow" />',
  );
  updated = updated.split(aliasUrl).join(canonicalUrl);

  return current === updated ? null : { file, relativePath, updated };
}

function refreshSitemap() {
  const relativePath = 'sitemap.xml';
  const file = path.join(ROOT, relativePath);
  const current = fs.readFileSync(file, 'utf8');
  const aliasUrls = new Set([...SEO_ALIASES.keys()].map((aliasPath) => `${SITE_URL}${aliasPath}`));
  const updated = current.replace(/\s*<url>[\s\S]*?<\/url>/g, (block) => {
    const location = block.match(/<loc>\s*([^<\s]+)\s*<\/loc>/)?.[1];
    return aliasUrls.has(location) ? '' : block;
  });
  return current === updated ? null : { file, relativePath, updated };
}

const changes = [
  ...readProducts().map(refreshProductPage).filter(Boolean),
  ...[...SEO_ALIASES].map(([aliasPath, canonicalPath]) => refreshAliasPage(aliasPath, canonicalPath)).filter(Boolean),
  refreshSitemap(),
].filter(Boolean);

if (APPLY) {
  changes.forEach(({ file, updated }) => fs.writeFileSync(file, updated, 'utf8'));
  console.log(`SEO refresh applied to ${changes.length} files.`);
} else if (changes.length) {
  console.error(`SEO refresh required for ${changes.length} files. Run with --apply.`);
  process.exitCode = 1;
} else {
  console.log('SEO pages are current.');
}
