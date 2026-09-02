import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT = path.join(ROOT, 'catalogo-modelos', 'index.html');
const APPLY = process.argv.includes('--apply');
const SITE_URL = 'https://haode.com.mx';

const CATEGORY_META = new Map([
  ['iphone-incell', ['iPhone INCELL', '/categoria/iphone-incell/']],
  ['iphone-oled', ['iPhone OLED', '/categoria/iphone-oled/']],
  ['oled-diagnostica', ['OLED diagnóstica', '/categoria/oled-diagnostica/']],
  ['samsung-incell', ['Samsung INCELL', '/categoria/samsung-incell/']],
  ['samsung-oled', ['Samsung OLED', '/categoria/samsung-oled/']],
  ['samsung-tipo-original', ['Samsung TIPO ORIGINAL', '/categoria/samsung-tipo-original/']],
  ['celulares-samsung', ['Celulares Samsung', '/categoria/celulares-samsung/']],
  ['micas', ['Micas', '/micas.html']],
  ['fundas', ['Fundas', '/categoria/fundas/']],
  ['gafas-ai', ['Gafas AI', '/categoria/gafas-inteligentes-ai/']],
  ['camaras-inteligentes', ['Cámaras inteligentes', '/categoria/camaras-inteligentes/']],
]);

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function readProducts() {
  const context = { window: {} };
  const source = fs.readFileSync(path.join(ROOT, 'data', 'products.generated.js'), 'utf8');
  vm.runInNewContext(source, context, { filename: 'data/products.generated.js' });
  return Array.isArray(context.window.HAODE_PRODUCTS_DATA) ? context.window.HAODE_PRODUCTS_DATA : [];
}

function sitemapProductIds() {
  const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
  return [...sitemap.matchAll(/<loc>https:\/\/haode\.com\.mx\/producto\/([^<\/]+)\/<\/loc>/g)]
    .map((match) => decodeURIComponent(match[1]));
}

function cleanProductName(product) {
  return String(product.name || product.model || product.id)
    .replace(/\s*\|\s*HAODE México.*$/i, '')
    .trim();
}

function buildGroups() {
  const productsById = new Map(readProducts().map((product) => [product.id, product]));
  const groups = new Map();
  for (const id of sitemapProductIds()) {
    const product = productsById.get(id);
    if (!product) throw new Error(`Producto del sitemap sin datos públicos: ${id}`);
    const category = product.category || 'otros';
    if (!groups.has(category)) groups.set(category, []);
    groups.get(category).push({ id, name: cleanProductName(product) });
  }
  return [...groups]
    .map(([category, products]) => ({
      category,
      label: CATEGORY_META.get(category)?.[0] || category,
      categoryUrl: CATEGORY_META.get(category)?.[1] || '/productos/',
      products: products.sort((a, b) => a.name.localeCompare(b.name, 'es-MX')),
    }))
    .sort((a, b) => a.label.localeCompare(b.label, 'es-MX'));
}

function buildPage() {
  const groups = buildGroups();
  const total = groups.reduce((sum, group) => sum + group.products.length, 0);
  const sections = groups.map((group) => `
        <section class="model-directory-group" aria-labelledby="model-group-${escapeHtml(group.category)}">
          <div class="model-directory-heading">
            <div>
              <p class="section-kicker">${escapeHtml(group.label)}</p>
              <h2 id="model-group-${escapeHtml(group.category)}">${escapeHtml(group.label)}</h2>
            </div>
            <a href="${escapeHtml(group.categoryUrl)}">Ver categoría</a>
          </div>
          <div class="model-directory-links">
${group.products.map((product) => `            <a href="/producto/${encodeURIComponent(product.id)}/">${escapeHtml(product.name)}</a>`).join('\n')}
          </div>
        </section>`).join('\n');

  return `<!DOCTYPE html>
<html lang="es-MX">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="Directorio completo de modelos publicados por HAODE México, organizado por categoría para técnicos, talleres y distribuidores." />
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="HAODE MÉXICO" />
  <meta property="og:title" content="Catálogo de modelos HAODE México" />
  <meta property="og:description" content="Encuentra fichas públicas de pantallas, refacciones y productos HAODE por familia y modelo." />
  <meta property="og:url" content="${SITE_URL}/catalogo-modelos/" />
  <meta property="og:image" content="${SITE_URL}/assets/logo/logo.png" />
  <link rel="canonical" href="${SITE_URL}/catalogo-modelos/" />
  <link rel="describedby" type="text/markdown" href="/llms.txt" />
  <title>Catálogo de modelos | HAODE México</title>
  <link rel="icon" href="/assets/icons/favicon.png" type="image/png" />
  <link rel="stylesheet" href="/style.css?v=20260821-static-crawl" />
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": "${SITE_URL}/catalogo-modelos/#webpage",
        "url": "${SITE_URL}/catalogo-modelos/",
        "name": "Catálogo de modelos HAODE México",
        "description": "Directorio de ${total} fichas públicas organizado por familia de producto.",
        "isPartOf": { "@id": "${SITE_URL}/#website" },
        "inLanguage": "es-MX"
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "${SITE_URL}/" },
          { "@type": "ListItem", "position": 2, "name": "Catálogo de modelos", "item": "${SITE_URL}/catalogo-modelos/" }
        ]
      }
    ]
  }
  </script>
  <script src="/analytics.js?v=20260813-ga4-conversions"></script>
</head>
<body class="catalog-page catalog-reference-page model-directory-page">
  <header class="reference-header">
    <div class="reference-wrap reference-nav-shell">
      <a class="reference-logo" href="/" aria-label="HAODE México inicio">
        <img src="/assets/images/factory-store-wordmark.png" alt="HAODE Refacciones para Celular" width="200" height="58" />
      </a>
      <nav class="reference-nav" aria-label="Navegación principal">
        <a href="/">Inicio</a>
        <a href="/productos/">Catálogo visual</a>
        <a class="is-active" href="/catalogo-modelos/" aria-current="page">Todos los modelos</a>
        <a href="/contacto/">Contacto</a>
      </nav>
      <div class="reference-nav-actions">
        <a class="reference-btn reference-btn-whatsapp model-directory-whatsapp" href="https://wa.me/523326684296?text=Hola%20HAODE%20M%C3%A9xico%2C%20quiero%20consultar%20el%20cat%C3%A1logo.%20Modelo%2FSKU%3A%20%20Cantidad%3A%20%20Ciudad%3A%20%20%C2%BFMe%20confirman%20stock%20en%20M%C3%A9xico%2C%20precio%20por%20cantidad%2C%20garant%C3%ADa%20local%20y%20env%C3%ADo%3F" target="_blank" rel="noopener noreferrer"><span class="reference-btn-icon" aria-hidden="true">W</span><span>WhatsApp</span></a>
        <a class="reference-btn reference-btn-solid" href="/app/"><span class="reference-btn-icon" aria-hidden="true">A</span><span>App</span></a>
      </div>
    </div>
  </header>

  <main class="catalog-main">
    <section class="catalog-hero model-directory-hero">
      <div class="reference-wrap catalog-hero-inner">
        <div class="catalog-hero-copy">
          <p class="section-kicker">Directorio HTML</p>
          <h1>Catálogo de modelos HAODE México</h1>
          <p class="catalog-intro">Explora ${total} fichas públicas por categoría. Cada enlace abre una página canónica con el modelo publicado y su canal de cotización.</p>
          <p class="catalog-warning">Disponibilidad, compatibilidad, precio final y envío se confirman antes del pedido.</p>
        </div>
      </div>
    </section>

    <section class="section model-directory-section">
      <div class="reference-wrap model-directory-groups">
${sections}
      </div>
    </section>
  </main>

  <script src="/campaign-attribution.js?v=20260821-ga4-channels"></script>
  <script src="/site-footer.js?v=20260821-static-crawl"></script>
</body>
</html>
`;
}

const expected = buildPage();
const current = fs.existsSync(OUTPUT) ? fs.readFileSync(OUTPUT, 'utf8') : '';

if (current === expected) {
  console.log('Static product directory is current.');
} else if (APPLY) {
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, expected, 'utf8');
  console.log(`Static product directory updated: ${path.relative(ROOT, OUTPUT)}`);
} else {
  console.error('Static product directory is stale. Run with --apply.');
  process.exitCode = 1;
}
