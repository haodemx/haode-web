import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APPLY = process.argv.includes('--apply');
const SITE_URL = 'https://haode.com.mx';
const CHANGE_DATE = '2026-08-21';
const SKIP_DIRECTORIES = new Set(['.git', 'node_modules', 'playwright-report', 'test-results']);
const SCREEN_CATEGORIES = new Set([
  'iphone-incell',
  'iphone-oled',
  'samsung-incell',
  'samsung-oled',
  'samsung-tipo-original',
]);

const CATEGORY_CONTEXT = new Map([
  ['camaras-inteligentes', { label: 'Cámaras inteligentes', path: '/categoria/camaras-inteligentes/' }],
  ['celulares-samsung', { label: 'Celulares Samsung', path: '/categoria/celulares-samsung/' }],
  ['fundas', { label: 'Fundas para celular', path: '/categoria/fundas/' }],
  ['gafas-ai', { label: 'Gafas inteligentes AI', path: '/categoria/gafas-inteligentes-ai/' }],
  ['iphone-incell', { label: 'Pantallas iPhone INCELL', path: '/categoria/iphone-incell/' }],
  ['iphone-oled', { label: 'Pantallas iPhone OLED', path: '/categoria/iphone-oled/' }],
  ['micas', { label: 'Micas para celular', path: '/micas.html' }],
  ['oled-diagnostica', { label: 'OLED diagnostica', path: '/categoria/oled-diagnostica/' }],
  ['samsung-incell', { label: 'Pantallas Samsung INCELL', path: '/categoria/samsung-incell/' }],
  ['samsung-oled', { label: 'Pantallas Samsung OLED', path: '/categoria/samsung-oled/' }],
  ['samsung-tipo-original', { label: 'Pantallas Samsung tipo original', path: '/categoria/samsung-tipo-original/' }],
]);

const PRIORITY_PAGES = new Map([
  ['app/index.html', {
    title: 'Catálogo de pantallas y refacciones | HAODE México',
    description: 'Cotiza pantallas iPhone y Samsung, OLED, INCELL, micas y accesorios en el catálogo HAODE México. Busca el modelo y envía cantidad y ciudad por WhatsApp.',
  }],
  ['guia-ia-haode-mexico/index.html', {
    title: 'Datos oficiales HAODE para Google e IA | México',
    description: 'Datos oficiales de HAODE México para Google e IA: categorías, ubicación, contacto y enlaces canónicos para consultar pantallas y refacciones.',
  }],
  ['distribuidores/index.html', {
    title: 'Pantallas y refacciones de mayoreo | HAODE México',
    description: 'Mayoreo de pantallas y refacciones para técnicos, talleres y distribuidores en México. Envía modelo, cantidad y ciudad para cotizar con HAODE.',
  }],
  ['categoria/pantallas/index.html', {
    title: 'Pantallas para celular iPhone y Samsung | HAODE',
    description: 'Pantallas para celular iPhone y Samsung: INCELL, OLED y tipo original. Compara categorías y cotiza modelo, cantidad y ciudad con HAODE México.',
  }],
  ['categoria/samsung-oled/index.html', {
    title: 'Pantallas Samsung OLED y AMOLED | HAODE México',
    description: 'Pantallas Samsung OLED y AMOLED para técnicos y talleres en México. Consulta modelos publicados y cotiza cantidad por WhatsApp con HAODE.',
  }],
  ['refacciones-celulares-mayoreo-mexico/index.html', {
    title: 'Refacciones para celular de mayoreo | HAODE México',
    description: 'Refacciones para celular de mayoreo en México: pantallas, micas, fundas y accesorios. Envía modelo, cantidad y ciudad para cotizar por WhatsApp.',
  }],
  ['categoria/iphone-incell/index.html', {
    title: 'Pantallas iPhone INCELL de mayoreo | HAODE México',
    description: 'Pantallas iPhone INCELL para técnicos y talleres en México. Busca el modelo, compara la referencia publicada y cotiza por cantidad con HAODE.',
  }],
  ['categoria/iphone-oled/index.html', {
    title: 'Pantallas iPhone OLED de mayoreo | HAODE México',
    description: 'Pantallas iPhone OLED para técnicos y talleres en México. Consulta modelos publicados y cotiza versión, cantidad y ciudad por WhatsApp.',
  }],
  ['categoria/samsung-incell/index.html', {
    title: 'Pantallas Samsung INCELL de mayoreo | HAODE México',
    description: 'Pantallas Samsung INCELL para reparación profesional en México. Confirma modelo, versión, cantidad y ciudad antes de cotizar por WhatsApp.',
  }],
  ['fundas-celular-mayoreo-mexico/index.html', {
    title: 'Fundas para celular de mayoreo | HAODE México',
    description: 'Fundas para celular de mayoreo en México para tiendas y distribuidores. Consulta modelos publicados y cotiza cantidad y ciudad por WhatsApp.',
  }],
  ['micas-hidrogel-mayoreo-mexico/index.html', {
    title: 'Micas e hidrogel de mayoreo | HAODE México',
    description: 'Micas e hidrogel de mayoreo para técnicos y tiendas en México. Envía tipo de producto, cantidad y ciudad para recibir una cotización confirmada.',
  }],
  ['pantallas-samsung-mayoreo-mexico/index.html', {
    title: 'Pantallas Samsung de mayoreo | HAODE México',
    description: 'Pantallas Samsung INCELL, OLED y tipo original para técnicos y talleres. Consulta el modelo publicado y cotiza cantidad por WhatsApp.',
  }],
]);

const INDEX_HUB_LINKS = [
  ['/categoria/pantallas/', 'Pantallas para celular'],
  ['/categoria/iphone-incell/', 'iPhone INCELL'],
  ['/categoria/iphone-oled/', 'iPhone OLED'],
  ['/categoria/samsung-incell/', 'Samsung INCELL'],
  ['/categoria/samsung-oled/', 'Samsung OLED'],
  ['/pantallas-samsung-mayoreo-mexico/', 'Samsung mayoreo'],
  ['/refacciones-celulares-mayoreo-mexico/', 'Refacciones mayoreo'],
  ['/fundas-celular-mayoreo-mexico/', 'Fundas mayoreo'],
  ['/micas-hidrogel-mayoreo-mexico/', 'Micas e hidrogel'],
  ['/distribuidores/', 'Distribuidores'],
  ['/app/', 'Catálogo App'],
];

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

function localScreenDescription(product) {
  if (!SCREEN_CATEGORIES.has(product.category)) return '';
  return `${productSeoName(product)} para reparación profesional en México. Cotiza por cantidad y confirma compatibilidad por WhatsApp.`;
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

function absoluteUrl(relativePath) {
  return `${SITE_URL}/${String(relativePath || '').replace(/^\/+/, '')}`;
}

function indexableProductIds() {
  const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
  return new Set([...sitemap.matchAll(/<loc>https:\/\/haode\.com\.mx\/producto\/([^/<]+)\/<\/loc>/g)]
    .map((match) => decodeURIComponent(match[1])));
}

const INDEXABLE_PRODUCT_IDS = indexableProductIds();

function categoryContext(product) {
  return CATEGORY_CONTEXT.get(product.category) || { label: 'Catálogo HAODE', path: '/productos/' };
}

function productGuideDescription(product) {
  const name = productSeoName(product);
  const quality = String(product.quality || '').trim();
  const context = categoryContext(product);
  const qualitySentence = quality
    ? `La referencia publicada pertenece a la categoría ${context.label} y muestra la calidad ${quality}.`
    : `La referencia publicada pertenece a la categoría ${context.label}.`;
  return `Esta página corresponde a ${name} dentro del catálogo HAODE México. ${qualitySentence} Esta información ayuda a técnicos, talleres y compradores a identificar la referencia antes de solicitar una cotización.`;
}

function productRelatedLinks(product, products) {
  return products
    .filter((candidate) => candidate.id !== product.id)
    .filter((candidate) => candidate.category === product.category)
    .filter((candidate) => INDEXABLE_PRODUCT_IDS.has(candidate.id))
    .slice(0, 3);
}

function schemaScript(type, data) {
  const json = JSON.stringify(data, null, 2).replace(/</g, '\\u003c');
  return `<script type="application/ld+json" data-seo-schema="${type}-20260821">\n${json}\n</script>`;
}

function productBreadcrumbSchema(product) {
  const context = categoryContext(product);
  const canonical = `${SITE_URL}/producto/${encodeURIComponent(product.id)}/`;
  return schemaScript('breadcrumb', {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: context.label, item: `${SITE_URL}${context.path}` },
      { '@type': 'ListItem', position: 3, name: productSeoName(product), item: canonical },
    ],
  });
}

function videoUploadDate(videoPath) {
  try {
    return execFileSync('git', ['log', '-1', '--format=%aI', '--', videoPath], {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return '';
  }
}

function productVideoSchema(product) {
  const videoPath = product.videos?.[0];
  if (!videoPath) return '';
  const uploadDate = videoUploadDate(videoPath);
  if (!uploadDate) return '';
  const imagePath = product.images?.[0];
  const data = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: `${productSeoName(product)} - video del producto`,
    description: `Video de ${productSeoName(product)} para revisar la presentación visual publicada antes de cotizar. Confirma el modelo y la cantidad por WhatsApp.`,
    contentUrl: absoluteUrl(videoPath),
    uploadDate,
  };
  if (imagePath) data.thumbnailUrl = absoluteUrl(imagePath);
  return schemaScript('video', data);
}

function productBreadcrumbMarkup(product) {
  const context = categoryContext(product);
  return `      <nav class="seo-product-breadcrumbs" data-seo-index-strengthening="20260821" aria-label="Ruta del producto">
        <a href="/">Inicio</a><span aria-hidden="true">/</span>
        <a href="${context.path}">${escapeHtml(context.label)}</a><span aria-hidden="true">/</span>
        <span aria-current="page">${escapeHtml(productSeoName(product))}</span>
      </nav>`;
}

function productVideoMarkup(product) {
  const videoPath = product.videos?.[0];
  if (!videoPath) return '';
  const poster = product.images?.[0] ? ` poster="/${escapeHtml(product.images[0])}"` : '';
  return `<video controls playsinline preload="none"${poster} data-seo-static-video="20260821"><source src="/${escapeHtml(videoPath)}" type="video/mp4" /></video>`;
}

function productGuideMarkup(product, products) {
  const context = categoryContext(product);
  const related = productRelatedLinks(product, products);
  const relatedLinks = related
    .map((candidate) => `<a href="/producto/${encodeURIComponent(candidate.id)}/">${escapeHtml(productSeoName(candidate))}</a>`)
    .join('');
  return `      <section class="detail-seo-guide" data-seo-product-guide="20260821" aria-labelledby="seo-guide-${escapeHtml(product.id)}">
        <div>
          <p class="section-kicker">Guía de compra</p>
          <h2 id="seo-guide-${escapeHtml(product.id)}">Cómo cotizar ${escapeHtml(productSeoName(product))} sin confusiones</h2>
          <p>${escapeHtml(productGuideDescription(product))}</p>
          <p>Para cotizar, envía por WhatsApp el modelo o referencia, la versión cuando aplique, la cantidad y la ciudad. HAODE confirma los datos comerciales disponibles antes de cerrar el pedido.</p>
          <p>Antes de comprar, compara el nombre completo, la categoría y las imágenes publicadas. No uses una referencia parecida como sustituto del modelo que necesitas.</p>
        </div>
        <div class="seo-product-faq" aria-label="Preguntas para cotizar este producto">
          <details><summary>¿Qué datos debo enviar para cotizar?</summary><p>Envía el nombre o referencia, la cantidad y la ciudad. Si el equipo tiene variantes, agrega la versión exacta.</p></details>
          <details><summary>¿Cómo confirmo que es el modelo correcto?</summary><p>Compara el modelo, la categoría y las imágenes de esta página. Pide confirmación por WhatsApp antes de cerrar el pedido.</p></details>
          <details><summary>¿El precio y la disponibilidad están confirmados?</summary><p>La página muestra la información comercial publicada. Confirma vigencia, cantidad y disponibilidad actual por WhatsApp.</p></details>
        </div>
        <nav class="seo-related-static" aria-label="Más opciones de ${escapeHtml(context.label)}">
          <a class="seo-related-category" href="${context.path}">Ver ${escapeHtml(context.label)}</a>${relatedLinks}
        </nav>
      </section>`;
}

function strengthenProductPage(html, product, products) {
  let updated = html;
  updated = updated.replace(/\s*<script[^>]+data-seo-schema=["'](?:breadcrumb|video)-20260821["'][^>]*>[\s\S]*?<\/script>/gi, '');
  updated = updated.replace(/\s*<nav[^>]+data-seo-index-strengthening=["']20260821["'][\s\S]*?<\/nav>/gi, '');
  updated = updated.replace(/\s*<section[^>]+data-seo-product-guide=["']20260821["'][\s\S]*?<\/section>/gi, '');
  if (/<div class="wrap detail-shell" data-product-detail>/.test(updated)) {
    updated = updated.replace(
      /(<div class="wrap detail-shell" data-product-detail>)/,
      `$1\n${productBreadcrumbMarkup(product)}`,
    );
  } else {
    updated = updated.replace(/(<main[^>]*>)/i, `$1\n${productBreadcrumbMarkup(product)}`);
  }
  if (/<section class="detail-related-section"/.test(updated)) {
    updated = updated.replace(
      /(<section class="detail-related-section")/,
      `${productGuideMarkup(product, products)}\n$1`,
    );
  } else {
    updated = updated.replace(/<\/main>/i, `${productGuideMarkup(product, products)}\n  </main>`);
  }
  const staticVideo = productVideoMarkup(product);
  if (staticVideo && !updated.includes('data-seo-static-video="20260821"')) {
    const videoUrl = `/${product.videos[0]}`;
    const escapedVideoUrl = regexEscape(videoUrl);
    const existingVideo = new RegExp(`<video\\b([^>]*\\bsrc=["']${escapedVideoUrl}["'][^>]*)>`, 'i');
    if (existingVideo.test(updated)) {
      updated = updated.replace(existingVideo, '<video$1 data-seo-static-video="20260821">');
    } else {
      updated = updated.replace(
        /(<div class="detail-videos" data-detail-videos>)\s*(<\/div>)/,
        `$1${staticVideo}$2`,
      );
    }
  }
  updated = updated.replace(
    /<video\b[^>]*data-seo-static-video=["']20260821["'][^>]*>/gi,
    (tag) => /\bpreload=["'][^"']*["']/i.test(tag)
      ? tag.replace(/\bpreload=["'][^"']*["']/i, 'preload="none"')
      : tag.replace(/>$/, ' preload="none">'),
  );
  const schemas = [productBreadcrumbSchema(product), productVideoSchema(product)].filter(Boolean).join('\n');
  updated = updated.replace(/<\/head>/i, `${schemas}\n</head>`);
  return updated;
}

function refreshProductPage(product, products) {
  if (!INDEXABLE_PRODUCT_IDS.has(product.id)) return null;
  const relativePath = path.join('producto', product.id, 'index.html');
  const file = path.join(ROOT, relativePath);
  if (!fs.existsSync(file)) return null;

  const current = fs.readFileSync(file, 'utf8');
  const seoTitle = escapeHtml(`${productSeoName(product)} | HAODE México`);
  const localDescription = localScreenDescription(product);
  let updated = current.replace(/<title>[^<]*<\/title>/i, `<title>${seoTitle}</title>`);
  updated = replaceMetaContent(updated, 'property', 'og:title', seoTitle);
  updated = replaceMetaContent(updated, 'name', 'twitter:title', seoTitle);
  if (localDescription) {
    const escapedDescription = escapeHtml(localDescription);
    updated = replaceMetaContent(updated, 'name', 'description', escapedDescription);
    updated = replaceMetaContent(updated, 'property', 'og:description', escapedDescription);
  }
  updated = updated.replace(
    /(<h1\b[^>]*data-detail-title[^>]*>)\s*([^<]+?)\s*(<\/h1>)/i,
    (match, open, currentH1, close) => {
      const currentName = String(currentH1).trim();
      const oldName = String(product.name || '').trim();
      if (currentName !== 'Producto HAODE México' && currentName !== oldName) return match;
      return `${open}${escapeHtml(productSeoName(product))}${close}`;
    },
  );
  updated = strengthenProductPage(updated, product, products);

  return current === updated ? null : { file, relativePath, updated };
}

function indexHubMarkup() {
  const links = INDEX_HUB_LINKS
    .map(([href, label]) => `<a href="${href}">${escapeHtml(label)}</a>`)
    .join('');
  return `    <section class="section seo-index-hub" data-seo-index-hub="20260821" aria-labelledby="seo-index-hub-title">
      <div class="wrap section-shell">
        <p class="section-kicker">Rutas de compra</p>
        <h2 id="seo-index-hub-title">Encuentra la categoría antes de cotizar</h2>
        <p>Navega por tipo de pantalla o producto. Después envía el modelo, la versión cuando aplique, la cantidad y la ciudad por WhatsApp.</p>
        <nav class="seo-index-hub-links" aria-label="Categorías y páginas principales">${links}</nav>
      </div>
    </section>`;
}

function refreshPriorityPage(relativePath, metadata) {
  const file = path.join(ROOT, relativePath);
  if (!fs.existsSync(file)) throw new Error(`Missing priority page: ${relativePath}`);

  const current = fs.readFileSync(file, 'utf8');
  const title = escapeHtml(metadata.title);
  const description = escapeHtml(metadata.description);
  let updated = current.replace(/<title>[^<]*<\/title>/i, `<title>${title}</title>`);
  updated = replaceMetaContent(updated, 'name', 'description', description);
  updated = replaceMetaContent(updated, 'property', 'og:title', title);
  updated = replaceMetaContent(updated, 'property', 'og:description', description);
  updated = replaceMetaContent(updated, 'name', 'twitter:title', title);
  updated = replaceMetaContent(updated, 'name', 'twitter:description', description);
  updated = updated.replace(/\s*<section[^>]+data-seo-index-hub=["']20260821["'][\s\S]*?<\/section>/gi, '');
  updated = updated.replace(/<\/main>/i, `${indexHubMarkup()}\n  </main>`);
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
  const changedUrls = new Set(
    [...INDEXABLE_PRODUCT_IDS].map((id) => `${SITE_URL}/producto/${encodeURIComponent(id)}/`),
  );
  for (const relativePath of PRIORITY_PAGES.keys()) {
    changedUrls.add(`${SITE_URL}/${relativePath.replace(/index\.html$/, '')}`);
  }
  const updated = current.replace(/\s*<url>[\s\S]*?<\/url>/g, (block) => {
    const location = block.match(/<loc>\s*([^<\s]+)\s*<\/loc>/)?.[1];
    if (aliasUrls.has(location)) return '';
    if (!changedUrls.has(location)) return block;
    if (/<lastmod>[^<]*<\/lastmod>/.test(block)) {
      return block.replace(/<lastmod>[^<]*<\/lastmod>/, `<lastmod>${CHANGE_DATE}</lastmod>`);
    }
    return block.replace(/<\/loc>/, `</loc>\n    <lastmod>${CHANGE_DATE}</lastmod>`);
  });
  return current === updated ? null : { file, relativePath, updated };
}

function publicHtmlFiles(directory = ROOT) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (SKIP_DIRECTORIES.has(entry.name)) return [];
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return publicHtmlFiles(absolutePath);
    return entry.isFile() && entry.name.endsWith('.html') ? [absolutePath] : [];
  });
}

function regexEscape(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function stripProductAvailability(jsonSource, relativePath) {
  let parsed;
  try {
    parsed = JSON.parse(jsonSource.trim());
  } catch {
    return jsonSource;
  }

  const products = (parsed['@graph'] || [parsed])
    .filter((node) => node?.['@type'] === 'Product' && Object.hasOwn(node.offers || {}, 'availability'));
  if (!products.length) return jsonSource;

  let updated = jsonSource;
  for (const product of products) {
    const encodedValue = regexEscape(JSON.stringify(product.offers.availability));
    const trailingComma = new RegExp(`\\s*"availability"\\s*:\\s*${encodedValue}\\s*,`);
    const finalProperty = new RegExp(`,\\s*"availability"\\s*:\\s*${encodedValue}(?=\\s*})`);

    if (trailingComma.test(updated)) {
      updated = updated.replace(trailingComma, '');
    } else if (finalProperty.test(updated)) {
      updated = updated.replace(finalProperty, '');
    } else {
      throw new Error(`Unable to remove Product availability from ${relativePath}`);
    }
  }

  const reparsed = JSON.parse(updated.trim());
  const remaining = (reparsed['@graph'] || [reparsed])
    .filter((node) => node?.['@type'] === 'Product' && Object.hasOwn(node.offers || {}, 'availability'));
  if (remaining.length) throw new Error(`Product availability remains in ${relativePath}`);
  return updated;
}

function removeUnconfirmedProductAvailability(html, relativePath) {
  return html.replace(
    /(<script[^>]+type=["']application\/ld\+json["'][^>]*>)([\s\S]*?)(<\/script>)/gi,
    (block, opening, jsonSource, closing) => {
      const updatedJson = stripProductAvailability(jsonSource, relativePath);
      return updatedJson === jsonSource ? block : `${opening}${updatedJson}${closing}`;
    },
  );
}

function mergeSchemaTrustChanges(baseChanges) {
  const changesByPath = new Map(baseChanges.map((change) => [change.relativePath, change]));

  for (const file of publicHtmlFiles()) {
    const relativePath = path.relative(ROOT, file);
    const pending = changesByPath.get(relativePath);
    const current = pending?.updated ?? fs.readFileSync(file, 'utf8');
    const updated = removeUnconfirmedProductAvailability(current, relativePath);
    if (updated !== current) changesByPath.set(relativePath, { file, relativePath, updated });
  }

  return [...changesByPath.values()].filter(({ file, updated }) => fs.readFileSync(file, 'utf8') !== updated);
}

const products = readProducts();
const changes = mergeSchemaTrustChanges([
  ...products.map((product) => refreshProductPage(product, products)).filter(Boolean),
  ...[...PRIORITY_PAGES].map(([relativePath, metadata]) => refreshPriorityPage(relativePath, metadata)).filter(Boolean),
  ...[...SEO_ALIASES].map(([aliasPath, canonicalPath]) => refreshAliasPage(aliasPath, canonicalPath)).filter(Boolean),
  refreshSitemap(),
].filter(Boolean));

if (APPLY) {
  changes.forEach(({ file, updated }) => fs.writeFileSync(file, updated, 'utf8'));
  console.log(`SEO refresh applied to ${changes.length} files.`);
} else if (changes.length) {
  console.error(`SEO refresh required for ${changes.length} files. Run with --apply.`);
  process.exitCode = 1;
} else {
  console.log('SEO pages are current.');
}
