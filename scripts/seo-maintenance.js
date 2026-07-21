const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE_URL = 'https://haode.com.mx';
const TODAY = process.env.HAODE_SEO_DATE || new Date().toISOString().slice(0, 10);
const PRODUCTS_FILE = path.join(ROOT, 'data', 'products.generated.js');
const SITEMAP_FILE = path.join(ROOT, 'sitemap.xml');
const BUSINESS_DESCRIPTION = 'Pantallas, micas, fundas y productos AI para técnicos, tiendas de reparación y distribuidores en México.';
const SKIP_DIRS = new Set(['.git', 'node_modules', 'android', 'previews', 'output', 'artifacts']);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walk(path.join(dir, entry.name), files);
    } else if (entry.name.endsWith('.html')) {
      files.push(path.join(dir, entry.name));
    }
  }
  return files;
}

function rel(file) {
  return path.relative(ROOT, file).replace(/\\/g, '/');
}

function readProducts() {
  const text = fs.readFileSync(PRODUCTS_FILE, 'utf8');
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start < 0 || end < start) return [];
  return JSON.parse(text.slice(start, end + 1));
}

function escapeAttr(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function decodeHtmlEntities(value) {
  return String(value || '')
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeSpaces(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function titleFromHtml(html) {
  return normalizeSpaces(decodeHtmlEntities((html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || ''));
}

function canonicalFromHtml(html) {
  const match = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)
    || html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  return match ? match[1] : '';
}

function metaContent(html, attr, key) {
  const pattern = new RegExp(`<meta\\s+${attr}=["']${escapeRegExp(key)}["'][^>]*content=["']([^"']*)["'][^>]*>`, 'i');
  const reverse = new RegExp(`<meta\\s+[^>]*content=["']([^"']*)["'][^>]*${attr}=["']${escapeRegExp(key)}["'][^>]*>`, 'i');
  const match = html.match(pattern) || html.match(reverse);
  return match ? normalizeSpaces(decodeHtmlEntities(match[1])) : '';
}

function setMeta(html, attr, key, content) {
  const tag = `  <meta ${attr}="${key}" content="${escapeAttr(content)}" />`;
  const pattern = new RegExp(`^\\s*<meta\\s+${attr}=["']${escapeRegExp(key)}["'][^>]*>\\s*$`, 'im');
  const reverse = new RegExp(`^\\s*<meta\\s+[^>]*${attr}=["']${escapeRegExp(key)}["'][^>]*>\\s*$`, 'im');
  if (pattern.test(html)) return html.replace(pattern, tag);
  if (reverse.test(html)) return html.replace(reverse, tag);
  if (/^\s*<link[^>]+rel=["']canonical["'][^>]*>\s*$/im.test(html)) {
    return html.replace(/^(\s*<link[^>]+rel=["']canonical["'][^>]*>\s*)$/im, `${tag}\n$1`);
  }
  return html.replace(/^(\s*<title>)/im, `${tag}\n$1`);
}

function hasJsonLd(html) {
  return /<script[^>]+type=["']application\/ld\+json["'][^>]*>/i.test(html);
}

function jsonTypeIncludes(node, typeName) {
  const type = node && node['@type'];
  return Array.isArray(type) ? type.includes(typeName) : type === typeName;
}

function updateJsonLdNode(node, productDescription) {
  if (!node || typeof node !== 'object') return false;
  let changed = false;
  if (jsonTypeIncludes(node, 'Product') && node.description !== productDescription) {
    node.description = productDescription;
    changed = true;
  }
  if (jsonTypeIncludes(node, 'LocalBusiness') && node.description !== BUSINESS_DESCRIPTION) {
    node.description = BUSINESS_DESCRIPTION;
    changed = true;
  }
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (updateJsonLdNode(item, productDescription)) changed = true;
      });
    } else if (value && typeof value === 'object') {
      if (updateJsonLdNode(value, productDescription)) changed = true;
    }
  }
  return changed;
}

function updateJsonLdDescriptions(html, productDescription) {
  return html.replace(/<script([^>]+type=["']application\/ld\+json["'][^>]*)>([\s\S]*?)<\/script>/gi, (match, attrs, body) => {
    try {
      const json = JSON.parse(body.trim());
      if (!updateJsonLdNode(json, productDescription)) return match;
      const serialized = JSON.stringify(json, null, 2).split('\n').map((line) => `  ${line}`).join('\n');
      return `<script${attrs}>\n${serialized}\n  </script>`;
    } catch {
      return match;
    }
  });
}

function insertJsonLd(html, json) {
  const serialized = JSON.stringify(json, null, 2).split('\n').map((line) => `  ${line}`).join('\n');
  const block = `  <script type="application/ld+json">\n${serialized}\n  </script>\n`;
  if (/<!-- Google tag/i.test(html)) return html.replace(/\n\s*<!-- Google tag/i, `\n${block}$&`);
  return html.replace(/\n\s*<\/head>/i, `\n${block}</head>`);
}

function routeUrlForFile(file) {
  const relative = rel(file);
  if (relative === 'index.html') return `${SITE_URL}/`;
  if (relative.endsWith('/index.html')) return `${SITE_URL}/${relative.slice(0, -'index.html'.length)}`;
  return `${SITE_URL}/${relative}`;
}

function isSeoSkipped(relative) {
  return relative === '404.html'
    || relative === 'offline.html'
    || relative.startsWith('app/admin')
    || relative.startsWith('admin/')
    || /^google[a-z0-9]+\.html$/i.test(relative);
}

function isRedirectPage(html) {
  return /<meta[^>]+http-equiv=["']refresh["']|window\.location|location\.href/i.test(html);
}

function isNoindex(html) {
  return /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html);
}

function productIdFromCanonical(canonical) {
  const match = String(canonical || '').match(/\/producto\/([^/?#]+)\/?/);
  return match ? decodeURIComponent(match[1]) : '';
}

function absoluteAssetUrl(value) {
  const text = String(value || '').trim();
  if (!text) return `${SITE_URL}/assets/logo/logo.png`;
  if (/^https?:\/\//i.test(text)) return text;
  return `${SITE_URL}/${text.replace(/^\/+/, '')}`;
}

function productDescription(product, fallbackTitle) {
  const rawName = product?.name || fallbackTitle || 'Producto HAODE';
  const name = rawName.replace(/\s*\|\s*HAODE.*$/i, '').trim() || 'Producto HAODE';
  const description = `${name} en HAODE México. Consulta precio, disponibilidad y compatibilidad por WhatsApp.`;
  if (description.length <= 165) return description;
  return `${name} en HAODE México. Consulta por WhatsApp.`;
}

function pageDescription(title) {
  const name = title.replace(/\s*\|\s*HAODE.*$/i, '').replace(/\s+HAODE México$/i, '').trim() || 'HAODE México';
  return `${name} en HAODE México para técnicos, tiendas de reparación y distribuidores. Consulta por WhatsApp.`;
}

function updateSocialTags(html, title, description, image) {
  let next = html;
  next = setMeta(next, 'name', 'twitter:card', 'summary_large_image');
  next = setMeta(next, 'name', 'twitter:title', title);
  next = setMeta(next, 'name', 'twitter:description', description);
  next = setMeta(next, 'name', 'twitter:image', image);
  return next;
}

function updateProductPage(file, html, productsById) {
  const relative = rel(file);
  const canonical = canonicalFromHtml(html);
  const routeUrl = routeUrlForFile(file);
  const canonicalProductId = productIdFromCanonical(canonical);
  const routeProductId = productIdFromCanonical(routeUrl);
  const product = productsById.get(canonicalProductId) || productsById.get(routeProductId);
  if (!product && !relative.startsWith('producto/')) return html;
  if (isNoindex(html) && canonical !== routeUrl) return html;

  const title = metaContent(html, 'property', 'og:title') || titleFromHtml(html) || product?.name || 'Producto HAODE México';
  const description = productDescription(product, title);
  const image = metaContent(html, 'property', 'og:image') || absoluteAssetUrl(product?.images?.[0]);
  let next = html;
  next = setMeta(next, 'name', 'description', description);
  next = setMeta(next, 'property', 'og:description', description);
  next = updateSocialTags(next, title, description, image);
  next = updateJsonLdDescriptions(next, description);
  if (!hasJsonLd(next) && canonical.startsWith(SITE_URL)) {
    next = insertJsonLd(next, {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product?.name || title,
      brand: {
        '@type': 'Brand',
        name: 'HAODE México',
      },
      description,
      image,
      url: canonical,
    });
  }
  return next;
}

function updateGenericPage(file, html) {
  const relative = rel(file);
  if (isSeoSkipped(relative)) return html;
  const canonical = canonicalFromHtml(html);
  if (!canonical.startsWith(SITE_URL)) return html;
  const redirect = isRedirectPage(html);
  const noindex = isNoindex(html);
  const title = titleFromHtml(html) || metaContent(html, 'property', 'og:title') || 'HAODE México';
  const ogDescription = metaContent(html, 'property', 'og:description');
  const currentDescription = metaContent(html, 'name', 'description');
  const image = metaContent(html, 'property', 'og:image') || `${SITE_URL}/assets/logo/logo.png`;
  let description = currentDescription;
  if (!description || description.length < 70) description = ogDescription.length >= 70 ? ogDescription : pageDescription(title);
  if (description.length > 170 && ogDescription.length >= 70 && ogDescription.length <= 170) description = ogDescription;

  let next = html;
  next = setMeta(next, 'name', 'description', description);
  next = setMeta(next, 'property', 'og:description', ogDescription || description);
  next = updateSocialTags(next, metaContent(next, 'property', 'og:title') || title, ogDescription || description, image);

  if (!redirect && !noindex && !hasJsonLd(next)) {
    next = insertJsonLd(next, {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: title,
      url: canonical,
      description,
      isPartOf: {
        '@type': 'WebSite',
        name: 'HAODE México',
        url: `${SITE_URL}/`,
      },
      inLanguage: 'es-MX',
    });
  }
  return next;
}

function collectSitemapUrls(files) {
  const urls = new Set();
  for (const file of files) {
    const relative = rel(file);
    if (isSeoSkipped(relative)) continue;
    const html = fs.readFileSync(file, 'utf8');
    const canonical = canonicalFromHtml(html);
    if (!canonical.startsWith(SITE_URL)) continue;
    const routeUrl = routeUrlForFile(file);
    if (isNoindex(html) && canonical.replace(/\/$/, '') === routeUrl.replace(/\/$/, '')) continue;
    urls.add(canonical);
  }
  return [...urls].sort((a, b) => {
    const rank = (url) => {
      if (url === `${SITE_URL}/`) return 0;
      if (url === `${SITE_URL}/app/`) return 1;
      if (url === `${SITE_URL}/productos/`) return 2;
      if (url.includes('/categoria/')) return 3;
      if (url.includes('/producto/')) return 4;
      return 5;
    };
    return rank(a) - rank(b) || a.localeCompare(b);
  });
}

function writeSitemap(urls) {
  const entries = urls.map((url) => `  <url>\n    <loc>${url}</loc>\n    <lastmod>${TODAY}</lastmod>\n  </url>`).join('\n');
  const content = `<?xml version='1.0' encoding='UTF-8'?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
  fs.writeFileSync(SITEMAP_FILE, content, 'utf8');
}

function main() {
  const products = readProducts();
  const productsById = new Map(products.map((product) => [product.id, product]));
  const htmlFiles = walk(ROOT).sort();
  const changedFiles = [];

  for (const file of htmlFiles) {
    const original = fs.readFileSync(file, 'utf8');
    const relative = rel(file);
    const updated = relative.startsWith('producto/')
      ? updateProductPage(file, original, productsById)
      : updateGenericPage(file, original);
    if (updated !== original) {
      fs.writeFileSync(file, updated, 'utf8');
      changedFiles.push(relative);
    }
  }

  const urls = collectSitemapUrls(htmlFiles);
  const originalSitemap = fs.existsSync(SITEMAP_FILE) ? fs.readFileSync(SITEMAP_FILE, 'utf8') : '';
  writeSitemap(urls);
  if (fs.readFileSync(SITEMAP_FILE, 'utf8') !== originalSitemap && !changedFiles.includes('sitemap.xml')) {
    changedFiles.push('sitemap.xml');
  }

  console.log(JSON.stringify({
    htmlScanned: htmlFiles.length,
    htmlChanged: changedFiles.filter((file) => file.endsWith('.html')).length,
    sitemapUrls: urls.length,
    changedFiles,
  }, null, 2));
}

main();
