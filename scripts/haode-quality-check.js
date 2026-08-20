const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE_URL = 'https://haode.com.mx';
const PUBLIC_EXTENSIONS = new Set(['.html', '.js', '.css', '.xml', '.txt', '.webmanifest', '.json']);
const PUBLIC_DIRS = new Set([
  'app',
  'categoria',
  'contacto',
  'tienda-oficial-hl-cdmx',
  'distribuidores',
  'fundas-celular-mayoreo-mexico',
  'garantia',
  'guia-ia-haode-mexico',
  'micas',
  'micas-hidrogel-mayoreo-mexico',
  'pantallas-iphone-incell-mayoreo-mexico',
  'pantallas-iphone-oled-mayoreo-mexico',
  'pantallas-samsung-incell-mayoreo-mexico',
  'pantallas-samsung-zflip-zfold-original-mexico',
  'producto',
  'productos',
  'productos-ai',
]);
const FORBIDDEN = ['file://', 'localhost', '127.0.0.1', '/Users/mac', 'squarespace', 'under construction'];
const REQUIRED_SITEMAP_URLS = [
  `${SITE_URL}/`,
  `${SITE_URL}/app/`,
  `${SITE_URL}/productos/`,
  `${SITE_URL}/productos-ai/`,
  `${SITE_URL}/micas.html`,
  `${SITE_URL}/garantia/`,
  `${SITE_URL}/contacto/`,
  `${SITE_URL}/tienda-oficial-hl-cdmx/`,
  `${SITE_URL}/distribuidores/`,
  `${SITE_URL}/fundas-celular-mayoreo-mexico/`,
  `${SITE_URL}/guia-ia-haode-mexico/`,
  `${SITE_URL}/micas-hidrogel-mayoreo-mexico/`,
  `${SITE_URL}/pantallas-iphone-incell-mayoreo-mexico/`,
  `${SITE_URL}/pantallas-iphone-oled-mayoreo-mexico/`,
  `${SITE_URL}/pantallas-samsung-incell-mayoreo-mexico/`,
  `${SITE_URL}/pantallas-samsung-zflip-zfold-original-mexico/`,
];
const REQUIRED_GEO_FAQ_PAGES = [
  'index.html',
  'categoria/pantallas/index.html',
  'categoria/iphone-incell/index.html',
  'categoria/iphone-oled/index.html',
  'categoria/samsung-incell/index.html',
  'categoria/samsung-oled/index.html',
  'micas.html',
  'categoria/micas/index.html',
  'categoria/maquinas-de-hidrogel/index.html',
  'categoria/fundas/index.html',
  'productos-ai/index.html',
  'contacto/index.html',
  'tienda-oficial-hl-cdmx/index.html',
  'distribuidores/index.html',
];
const KEY_REPORTS = [
  'reports/product-data-consistency-audit.md',
  'reports/video-missing-audit.md',
  'reports/owner-confirmation-checklist.md',
];
const KEY_PAGES = [
  'index.html',
  'productos.html',
  'productos/index.html',
  'producto.html',
  'micas.html',
  'productos-ai.html',
  'contacto/index.html',
  'app/index.html',
  'app/products.json',
  'sitemap.xml',
  'robots.txt',
];

function walk(dir, files = []) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    if (entry.name === '.git' || entry.name === 'node_modules') return;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else {
      files.push(full);
    }
  });
  return files;
}

function relative(filePath) {
  return path.relative(ROOT, filePath).replace(/\\/g, '/');
}

function isPublicFile(filePath) {
  const rel = relative(filePath);
  if (rel === 'package.json' || rel === 'package-lock.json') return false;
  const first = rel.split('/')[0];
  const ext = path.extname(filePath).toLowerCase();
  return PUBLIC_EXTENSIONS.has(ext) && (PUBLIC_DIRS.has(first) || !rel.includes('/'));
}

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function add(issues, severity, type, file, detail) {
  issues.push({ severity, type, file: relative(file), detail });
}

function extractAttributes(text, attr) {
  const values = [];
  const re = new RegExp(`${attr}\\s*=\\s*["']([^"']+)["']`, 'gi');
  let match;
  while ((match = re.exec(text))) values.push(match[1]);
  return values;
}

function resolveInternalTarget(fromFile, href) {
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return null;
  if (/^https?:\/\//i.test(href)) {
    if (!href.startsWith(SITE_URL)) return null;
    href = href.slice(SITE_URL.length) || '/';
  }
  href = href.split('#')[0].split('?')[0];
  if (!href) return null;
  if (href.startsWith('/')) href = href.slice('/'.length);
  else if (href.startsWith('/')) href = href.slice(1);
  else href = path.join(path.dirname(relative(fromFile)), href).replace(/\\/g, '/');
  if (!href || href === '.') href = 'index.html';
  if (href.endsWith('/')) href += 'index.html';
  if (!path.extname(href)) href = `${href}/index.html`;
  return path.join(ROOT, href);
}

function checkJsonLd(filePath, text, issues) {
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = re.exec(text))) {
    const json = match[1].trim();
    if (!json) {
      add(issues, 'error', 'JSON_LD_EMPTY', filePath, 'empty JSON-LD block');
      continue;
    }
    try {
      JSON.parse(json);
    } catch (error) {
      add(issues, 'error', 'JSON_LD_INVALID', filePath, error.message);
    }
  }
}

function jsonLdNodes(text) {
  const nodes = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = re.exec(text))) {
    try {
      const parsed = JSON.parse(match[1].trim());
      nodes.push(...(parsed['@graph'] || [parsed]));
    } catch (_) {
      // Invalid JSON-LD is reported by checkJsonLd.
    }
  }
  return nodes;
}

function hasRequiredFaqSchema(text) {
  return jsonLdNodes(text).some((node) => node['@type'] === 'FAQPage' && Array.isArray(node.mainEntity) && node.mainEntity.length >= 3);
}

function extractSitemapUrls(text) {
  const urls = [];
  const re = /<loc>\s*([^<\s]+)\s*<\/loc>/gi;
  let match;
  while ((match = re.exec(text))) urls.push(match[1]);
  return urls;
}

function extractCanonicalUrl(text) {
  const match = text.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)
    || text.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  return match ? match[1] : '';
}

function extractRobotsContent(text) {
  const match = text.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i)
    || text.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']robots["']/i);
  return match ? match[1].toLowerCase() : '';
}

function isVerificationFile(filePath) {
  return /^google[a-z0-9]+\.html$/i.test(relative(filePath));
}

function main() {
  const issues = [];
  const files = walk(ROOT).filter(isPublicFile);
  const htmlFiles = files.filter((file) => path.extname(file).toLowerCase() === '.html');
  const sitemap = path.join(ROOT, 'sitemap.xml');
  const appProducts = path.join(ROOT, 'app', 'products.json');
  const reportsDir = path.join(ROOT, 'reports');

  files.forEach((file) => {
    const text = read(file);
    FORBIDDEN.forEach((needle) => {
      if (text.toLowerCase().includes(needle.toLowerCase())) {
        add(issues, 'error', 'FORBIDDEN_STRING', file, needle);
      }
    });
  });

  let redirectPages = 0;
  htmlFiles.forEach((file) => {
    const text = read(file);
    checkJsonLd(file, text, issues);
    if (/<\/header>\s*<\/header>/i.test(text)) {
      add(issues, 'error', 'DUPLICATE_HEADER_CLOSE', file, 'consecutive closing header tags');
    }
    const rel = relative(file);
    const canonicalUrl = extractCanonicalUrl(text);
    const noindex = extractRobotsContent(text).includes('noindex');
    jsonLdNodes(text)
      .filter((node) => node?.['@type'] === 'Product' && Object.hasOwn(node.offers || {}, 'availability'))
      .forEach((node) => {
        add(issues, 'error', 'UNCONFIRMED_SCHEMA_AVAILABILITY', file, String(node.offers.availability));
      });
    if (canonicalUrl && !canonicalUrl.startsWith(SITE_URL)) {
      add(issues, 'error', 'CANONICAL_DOMAIN', file, canonicalUrl);
    }
    if (!canonicalUrl && rel !== '404.html' && !noindex && !isVerificationFile(file)) {
      add(issues, 'warn', 'CANONICAL_MISSING', file, 'no canonical URL found');
    }

    const refreshMatch = text.match(/http-equiv=["']refresh["'][^>]+content=["'][^"']*url=([^"']+)["']/i);
    if (refreshMatch) {
      redirectPages += 1;
      const target = resolveInternalTarget(file, refreshMatch[1].trim());
      if (target && !fs.existsSync(target)) add(issues, 'warn', 'REDIRECT_TARGET_MISSING', file, refreshMatch[1].trim());
    }

    extractAttributes(text, 'href').forEach((href) => {
      const target = resolveInternalTarget(file, href);
      if (target && !fs.existsSync(target)) add(issues, 'warn', 'INTERNAL_LINK_MISSING', file, href);
    });
  });

  if (!fs.existsSync(sitemap)) {
    add(issues, 'error', 'SITEMAP_MISSING', sitemap, 'sitemap.xml missing');
  } else {
    const sitemapText = read(sitemap);
    const sitemapUrls = extractSitemapUrls(sitemapText);
    if (!sitemapText.includes(SITE_URL)) add(issues, 'error', 'SITEMAP_SITE_URL_MISSING', sitemap, SITE_URL);
    if (!sitemapUrls.length) add(issues, 'error', 'SITEMAP_NO_LOC_ENTRIES', sitemap, 'no <loc> entries found');
    sitemapUrls.forEach((url) => {
      if (!url.startsWith(SITE_URL)) add(issues, 'error', 'SITEMAP_URL_DOMAIN', sitemap, url);
      const target = resolveInternalTarget(sitemap, url);
      if (target && !fs.existsSync(target)) {
        add(issues, 'warn', 'SITEMAP_TARGET_MISSING', sitemap, url);
      } else if (target && path.extname(target).toLowerCase() === '.html') {
        const targetText = read(target);
        const canonicalUrl = extractCanonicalUrl(targetText);
        const robotsContent = extractRobotsContent(targetText);
        const isRedirectPage = /http-equiv=["']refresh["']/i.test(targetText);
        if (isRedirectPage) add(issues, 'warn', 'SITEMAP_REDIRECT_URL', sitemap, url);
        if (canonicalUrl && canonicalUrl !== url && !robotsContent.includes('noindex')) {
          add(issues, 'warn', 'SITEMAP_NON_CANONICAL_URL', sitemap, `${url} canonical=${canonicalUrl}`);
        }
      }
    });
    REQUIRED_SITEMAP_URLS.forEach((url) => {
      if (!sitemapText.includes(`<loc>${url}</loc>`)) add(issues, 'warn', 'SITEMAP_REQUIRED_URL_MISSING', sitemap, url);
    });
    htmlFiles.forEach((file) => {
      const rel = relative(file);
      if (rel === '404.html' || rel.includes('/admin')) return;
      const text = read(file);
      const noindex = extractRobotsContent(text).includes('noindex');
      const urlPath = rel.endsWith('/index.html') ? rel.slice(0, -'index.html'.length) : rel;
      const expected = `${SITE_URL}/${urlPath}`.replace(/\/+$/, '/');
      const canonicalUrl = extractCanonicalUrl(text);
      const canonicalCoveredBySitemap = canonicalUrl && canonicalUrl !== expected && sitemapText.includes(canonicalUrl);
      if (!sitemapText.includes(expected) && rel.startsWith('producto/') && !noindex && !canonicalCoveredBySitemap) {
        add(issues, 'warn', 'SITEMAP_ENTRY_MISSING', file, expected);
      }
    });
  }

  if (!fs.existsSync(appProducts)) add(issues, 'error', 'APP_PRODUCTS_MISSING', appProducts, 'app/products.json missing');
  if (!fs.existsSync(reportsDir)) add(issues, 'error', 'REPORTS_DIR_MISSING', reportsDir, 'reports directory missing');
  KEY_REPORTS.forEach((report) => {
    const target = path.join(ROOT, report);
    if (!fs.existsSync(target)) add(issues, 'error', 'KEY_REPORT_MISSING', target, `${report} missing`);
  });
  KEY_PAGES.forEach((page) => {
    const target = path.join(ROOT, page);
    if (!fs.existsSync(target)) add(issues, 'error', 'KEY_PAGE_MISSING', target, `${page} missing`);
  });
  REQUIRED_GEO_FAQ_PAGES.forEach((page) => {
    const target = path.join(ROOT, page);
    if (!fs.existsSync(target)) {
      add(issues, 'error', 'GEO_FAQ_PAGE_MISSING', target, `${page} missing`);
      return;
    }
    const text = read(target);
    if (!hasRequiredFaqSchema(text)) add(issues, 'warn', 'GEO_FAQ_SCHEMA_MISSING', target, 'missing FAQPage schema with at least 3 questions');
    if (!/Preguntas frecuentes|Información oficial para búsqueda/i.test(text)) {
      add(issues, 'warn', 'GEO_FAQ_VISIBLE_COPY_MISSING', target, 'missing visible GEO/FAQ answer section');
    }
  });

  const counts = issues.reduce((acc, item) => {
    acc[item.severity] = (acc[item.severity] || 0) + 1;
    return acc;
  }, {});
  const summary = {
    status: counts.error ? 'FAIL' : 'PASS',
    scannedFiles: files.length,
    htmlFiles: htmlFiles.length,
    redirectPages,
    errors: counts.error || 0,
    warnings: counts.warn || 0,
  };
  console.log(JSON.stringify(summary, null, 2));
  issues.slice(0, 160).forEach((item) => {
    console.log(`${item.severity.toUpperCase()} ${item.type} ${item.file}: ${item.detail}`);
  });
  if (issues.length > 160) console.log(`... ${issues.length - 160} more issues`);
  if (summary.status !== 'PASS') process.exit(1);
}

main();
