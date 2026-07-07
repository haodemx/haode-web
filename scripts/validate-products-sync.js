const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const WEBSITE_PRODUCTS = path.join(ROOT, 'data', 'products.generated.js');
const APP_PRODUCTS = path.join(ROOT, 'app', 'products.json');
const SITEMAP = path.join(ROOT, 'sitemap.xml');
const PRODUCT_DIR = path.join(ROOT, 'producto');
const CATEGORY_DIR = path.join(ROOT, 'categoria');
const SITE_URL = 'https://haode.com.mx';
const STRICT_SYNC = process.argv.includes('--strict') || process.env.HAODE_STRICT_PRODUCT_SYNC === '1';

function readWebsiteProducts() {
  const text = fs.readFileSync(WEBSITE_PRODUCTS, 'utf8');
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start < 0 || end < start) return [];
  return JSON.parse(text.slice(start, end + 1));
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function normalizeAsset(value) {
  return String(value || '').replace(/^\/haode-web\//, '').replace(/^\/+/, '');
}

function priceValue(value) {
  if (typeof value === 'number') return value ? String(value) : '';
  const text = String(value || '').trim();
  if (!text) return '';
  if (/^consultar$/i.test(text)) return 'CONSULTAR';
  const numeric = text.replace(/[^0-9.]/g, '');
  return numeric || '';
}

function categorySlugFromApp(category) {
  const map = {
    'Pantallas iPhone INCELL': 'iphone-incell',
    'Pantallas iPhone OLED': 'iphone-oled',
    'Pantallas OLED Diagnóstica': 'oled-diagnostica',
    'Pantallas Samsung INCELL': 'samsung-incell',
    'Pantallas Samsung OLED': 'samsung-oled',
    'Gafas AI': 'gafas-ai',
    'Productos AI': 'camaras-inteligentes',
    'Cámaras Inteligentes': 'camaras-inteligentes',
    'Micas': 'micas',
    'Maquinas de Mica': 'maquinas-de-mica',
    'Máquinas de Mica': 'maquinas-de-mica',
    'Fundas': 'fundas',
  };
  return map[category] || String(category || '').trim();
}

function findDuplicates(items, getKey) {
  const seen = new Map();
  const duplicates = [];
  items.forEach((item) => {
    const key = getKey(item);
    if (!key) return;
    seen.set(key, (seen.get(key) || 0) + 1);
  });
  seen.forEach((count, key) => {
    if (count > 1) duplicates.push({ key, count });
  });
  return duplicates;
}

function fileExists(relativePath) {
  return Boolean(relativePath) && fs.existsSync(path.join(ROOT, normalizeAsset(relativePath)));
}

function productPageExists(slug) {
  return fs.existsSync(path.join(PRODUCT_DIR, slug, 'index.html'));
}

function collectProductPageSlugs() {
  if (!fs.existsSync(PRODUCT_DIR)) return [];
  return fs.readdirSync(PRODUCT_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

function collectCategoryPageSlugs() {
  if (!fs.existsSync(CATEGORY_DIR)) return [];
  return fs.readdirSync(CATEGORY_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

function slugFromSiteUrl(value) {
  const text = String(value || '').trim();
  const match = text.match(/\/producto\/([^/?#]+)\/?/);
  return match ? match[1] : '';
}

function extractProductPageSlugs(text) {
  const canonicalMatch = text.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)
    || text.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  const ogMatch = text.match(/<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["']/i)
    || text.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:url["']/i);
  return {
    canonicalUrl: canonicalMatch ? canonicalMatch[1] : '',
    canonicalSlug: canonicalMatch ? slugFromSiteUrl(canonicalMatch[1]) : '',
    ogUrl: ogMatch ? ogMatch[1] : '',
    ogSlug: ogMatch ? slugFromSiteUrl(ogMatch[1]) : '',
  };
}

function issue(list, severity, type, sku, detail) {
  list.push({ severity, type, sku, detail });
}

function allowsPendingWholesale(product) {
  return String(product.categoria || product.category || '').includes('OLED Diagnóstica');
}

function main() {
  const issues = [];
  const websiteProducts = readWebsiteProducts();
  const appProducts = readJson(APP_PRODUCTS);
  const sitemapText = fs.existsSync(SITEMAP) ? fs.readFileSync(SITEMAP, 'utf8') : '';
  const websiteById = new Map(websiteProducts.map((product) => [product.id, product]));
  const appById = new Map(appProducts.map((product) => [product.id, product]));
  const categoryPages = new Set(collectCategoryPageSlugs());
  const staticSlugs = collectProductPageSlugs();

  findDuplicates(websiteProducts, (product) => product.id).forEach((dup) => {
    issue(issues, 'error', 'DUPLICATE_WEBSITE_SKU', dup.key, `${dup.count} entries in data/products.generated.js`);
  });
  findDuplicates(appProducts, (product) => product.id).forEach((dup) => {
    issue(issues, 'error', 'DUPLICATE_APP_SKU', dup.key, `${dup.count} entries in app/products.json`);
  });
  findDuplicates(staticSlugs.map((slug) => ({ slug })), (item) => item.slug).forEach((dup) => {
    issue(issues, 'error', 'DUPLICATE_STATIC_SLUG', dup.key, `${dup.count} static product routes`);
  });

  websiteProducts.forEach((product) => {
    const sku = product.id;
    const appProduct = appById.get(sku);
    const productPagePath = path.join(PRODUCT_DIR, sku, 'index.html');
    const productPageText = fs.existsSync(productPagePath) ? fs.readFileSync(productPagePath, 'utf8') : '';
    const isRedirectPage = /http-equiv=["']refresh|window\.location|location\.href/i.test(productPageText);
    const pageSlugs = productPageText ? extractProductPageSlugs(productPageText) : {};
    const canonicalCoveredBySitemap = Boolean(isRedirectPage && pageSlugs.canonicalUrl && sitemapText.includes(pageSlugs.canonicalUrl));
    if (!appProduct) {
      issue(issues, STRICT_SYNC ? 'error' : 'warn', 'APP_PRODUCT_MISSING', sku, 'website product is not present in app/products.json');
    }
    if (!productPageExists(sku)) issue(issues, 'error', 'STATIC_PRODUCT_PAGE_MISSING', sku, `producto/${sku}/index.html missing`);
    if (!sitemapText.includes(`${SITE_URL}/producto/${sku}/`) && !canonicalCoveredBySitemap) {
      issue(issues, 'warn', 'SITEMAP_PRODUCT_ENTRY_MISSING', sku, `sitemap lacks ${SITE_URL}/producto/${sku}/`);
    }
    if (!categoryPages.has(product.category)) {
      issue(issues, 'warn', 'CATEGORY_PAGE_MISSING', sku, `categoria/${product.category}/ missing`);
    }
    const prices = Array.isArray(product.prices) ? product.prices : [];
    if (!prices.length || prices.some((entry) => !priceValue(entry.price))) {
      issue(issues, 'error', 'WEBSITE_PRICE_FIELD_MISSING', sku, 'website product has missing price field');
    }
    if (prices.some((entry) => priceValue(entry.price) === 'CONSULTAR')) {
      issue(issues, 'report', 'WEBSITE_PRICE_REQUIRES_CONFIRMATION', sku, 'website product has Consultar price field');
    }
    const images = Array.isArray(product.images) ? product.images : [];
    if (!images.length || images.some((image) => !image || !fileExists(image))) {
      issue(issues, 'error', 'WEBSITE_IMAGE_PATH_MISSING', sku, 'website product has missing or unresolved image path');
    }
    const videos = Array.isArray(product.videos) ? product.videos : [];
    if (!videos.length) issue(issues, 'report', 'WEBSITE_VIDEO_FIELD_MISSING', sku, 'website video field is empty');
    videos.filter((video) => !fileExists(video)).forEach((video) => {
      issue(issues, 'warn', 'WEBSITE_VIDEO_PATH_UNRESOLVED', sku, video);
    });
    if (appProduct) {
      const appCategory = categorySlugFromApp(appProduct.categoria);
      if (appCategory !== product.category) {
        issue(issues, 'error', 'CATEGORY_MISMATCH', sku, `website=${product.category}; app=${appProduct.categoria}`);
      }
    }
  });

  appProducts.forEach((product) => {
    const sku = product.id;
    if (!websiteById.has(sku)) {
      issue(issues, STRICT_SYNC ? 'error' : 'warn', 'WEBSITE_PRODUCT_MISSING', sku, 'app product is not present in website product data');
    }
    if (!priceValue(product.precioPublico)) {
      issue(issues, 'error', 'APP_PRICE_FIELD_MISSING', sku, 'app product missing precioPublico');
    }
    if (!priceValue(product.precioMayoreo)) {
      issue(
        issues,
        allowsPendingWholesale(product) ? 'report' : 'error',
        allowsPendingWholesale(product) ? 'APP_WHOLESALE_REQUIRES_CONFIRMATION' : 'APP_PRICE_FIELD_MISSING',
        sku,
        allowsPendingWholesale(product) ? 'app wholesale price is pending confirmation' : 'app product missing precioMayoreo'
      );
    }
    if (!product.imagen || !fileExists(product.imagen)) {
      issue(issues, 'error', 'APP_IMAGE_PATH_MISSING', sku, 'app product has missing or unresolved imagen path');
    }
  });

  staticSlugs.forEach((slug) => {
    const filePath = path.join(PRODUCT_DIR, slug, 'index.html');
    const text = fs.readFileSync(filePath, 'utf8');
    const isRedirect = /http-equiv=["']refresh|window\.location|location\.href/i.test(text);
    const pageSlugs = extractProductPageSlugs(text);
    if (pageSlugs.canonicalSlug && pageSlugs.canonicalSlug !== slug) {
      issue(issues, 'warn', 'ROUTE_CANONICAL_SLUG_MISMATCH', slug, `canonical slug is ${pageSlugs.canonicalSlug}`);
    }
    if (pageSlugs.ogSlug && pageSlugs.ogSlug !== slug) {
      issue(issues, 'warn', 'ROUTE_OG_SLUG_MISMATCH', slug, `OG URL slug is ${pageSlugs.ogSlug}`);
    }
    if (!websiteById.has(slug) && !isRedirect) {
      issue(issues, 'warn', 'STATIC_PAGE_WITHOUT_WEBSITE_PRODUCT', slug, `producto/${slug}/index.html does not match website product data`);
    }
  });

  const counts = issues.reduce((acc, item) => {
    acc[item.severity] = (acc[item.severity] || 0) + 1;
    return acc;
  }, {});
  const summary = {
    status: counts.error ? 'FAIL' : 'PASS',
    strictSync: STRICT_SYNC,
    websiteProducts: websiteProducts.length,
    appProducts: appProducts.length,
    staticProductPages: staticSlugs.length,
    errors: counts.error || 0,
    warnings: counts.warn || 0,
    reportOnly: counts.report || 0,
  };

  console.log(JSON.stringify(summary, null, 2));
  issues.slice(0, 120).forEach((item) => {
    console.log(`${item.severity.toUpperCase()} ${item.type} ${item.sku}: ${item.detail}`);
  });
  if (issues.length > 120) console.log(`... ${issues.length - 120} more issues`);
  if (summary.status !== 'PASS') process.exit(1);
}

main();
