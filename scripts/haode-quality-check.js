const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE_URL = 'https://haodemx.github.io/haode-web';
const PUBLIC_EXTENSIONS = new Set(['.html', '.js', '.css', '.xml', '.txt', '.webmanifest', '.json']);
const PUBLIC_DIRS = new Set(['app', 'categoria', 'contacto', 'distribuidores', 'garantia', 'micas', 'producto', 'productos', 'productos-ai']);
const FORBIDDEN = ['file://', 'localhost', '127.0.0.1', '/Users/mac', 'squarespace', 'under construction'];

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
  if (href.startsWith('/haode-web/')) href = href.slice('/haode-web/'.length);
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

  htmlFiles.forEach((file) => {
    const text = read(file);
    checkJsonLd(file, text, issues);
    const canonicals = extractAttributes(text, 'href').filter((href) => text.includes(`rel="canonical"`) || text.includes(`rel='canonical'`));
    const canonicalMatch = text.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)
      || text.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
    if (canonicalMatch && !canonicalMatch[1].startsWith(SITE_URL)) {
      add(issues, 'error', 'CANONICAL_DOMAIN', file, canonicalMatch[1]);
    }
    if (!canonicalMatch && relative(file) !== '404.html') {
      add(issues, 'warn', 'CANONICAL_MISSING', file, 'no canonical URL found');
    }

    const refreshMatch = text.match(/http-equiv=["']refresh["'][^>]+content=["'][^"']*url=([^"']+)["']/i);
    if (refreshMatch) {
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
    if (!sitemapText.includes(SITE_URL)) add(issues, 'error', 'SITEMAP_SITE_URL_MISSING', sitemap, SITE_URL);
    htmlFiles.forEach((file) => {
      const rel = relative(file);
      if (rel === '404.html' || rel.includes('/admin')) return;
      const urlPath = rel.endsWith('/index.html') ? rel.slice(0, -'index.html'.length) : rel;
      const expected = `${SITE_URL}/${urlPath}`.replace(/\/+$/, '/');
      if (!sitemapText.includes(expected) && rel.startsWith('producto/')) {
        add(issues, 'warn', 'SITEMAP_ENTRY_MISSING', file, expected);
      }
    });
  }

  if (!fs.existsSync(appProducts)) add(issues, 'error', 'APP_PRODUCTS_MISSING', appProducts, 'app/products.json missing');
  if (!fs.existsSync(reportsDir)) add(issues, 'error', 'REPORTS_DIR_MISSING', reportsDir, 'reports directory missing');

  const counts = issues.reduce((acc, item) => {
    acc[item.severity] = (acc[item.severity] || 0) + 1;
    return acc;
  }, {});
  const summary = {
    status: counts.error ? 'FAIL' : 'PASS',
    scannedFiles: files.length,
    htmlFiles: htmlFiles.length,
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
