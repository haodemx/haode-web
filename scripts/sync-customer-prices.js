const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SOURCE_FILE = path.join(ROOT, 'data', 'customer-price-list-2026-08.json');
const WEBSITE_FILE = path.join(ROOT, 'data', 'products.generated.js');
const APP_FILE = path.join(ROOT, 'app', 'products.json');
const MASTER_FILE = path.join(ROOT, 'docs', 'master-data', 'products-master.csv');
const REPORT_FILE = path.join(ROOT, 'docs', 'reports', 'customer-price-sync-2026-08.md');
const REPORT_JSON_FILE = path.join(ROOT, 'docs', 'reports', 'customer-price-sync-2026-08.json');
const PRODUCT_DIR = path.join(ROOT, 'producto');
const SITEMAP_FILE = path.join(ROOT, 'sitemap.xml');
const APPLY = process.argv.includes('--apply');
const DELETE_UNLISTED = process.argv.includes('--delete-unlisted');
const PUBLISH_UNLISTED = process.argv.includes('--publish-unlisted');
const PLACEHOLDER_IMAGE = 'assets/products/placeholder.svg';
const TODAY = '2026-08-13';
const STATIC_ROUTE_ALIASES = {
  'funda-magnetica-17-pro-max': ['funda-magnetica-estilo-iphone-17-pro-max'],
  'funda-premium-17-pro-max': ['funda-premium-aluminio-estilo-iphone-17-pro-max'],
};
const REDIRECT_PRODUCT_IDS = new Set([
  'aimb-g5-ai-sports',
  'haode-ai-g3-smart-glasses',
  'haode-ai-w610-smart-glasses',
  's1-ai-classic',
  'w630-ai-pro',
]);

function normalize(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/PRO MAX/g, 'PROMAX')
    .replace(/\+/g, 'PLUS')
    .replace(/[^A-Z0-9]+/g, '');
}

const MODEL_NOISE = [
  'HAODEPANTALLAOLEDDIAGNOSTICA',
  'PANTALLAPARASAMSUNG',
  'PANTALLASAMSUNG',
  'PANTALLAPARAIPHONE',
  'PANTALLAIPHONE',
  'TIPOORIGINALCONMARCO',
  'SOFTOLEDPREMIUMMOVEIC',
  'SOFTOLEDPREMIUM',
  'OLEDPREMIUMMOVEIC',
  'AMOLEDPREMIUM',
  'OLEDPREMIUM',
  'DIAGNOSTICOSOFTOLED',
  'DIAGNOSTICOHARDOLED',
  'DIAGNOTICOSOFTOLED',
  'DIAGNOTICOHARDOLED',
  'INCELLFHDCONMARCO',
  'INCELLFHD',
  'INCELLCONMARCO',
  'OLEDCONMARCO',
  'TIPOORIGINAL',
  'CONMARCO',
  'TAMANOORIGINAL',
  'IPHONE',
  'SAMSUNG',
  'MODELO',
  'INCELL',
  'OLED',
];

function modelKey(value) {
  let key = normalize(value);
  MODEL_NOISE.forEach((token) => {
    key = key.split(token).join('');
  });
  return key;
}

function priceClassFromSource(row) {
  const quality = normalize(row.quality);
  if (row.section === 'iphone-diagnostic') return 'iphone-diagnostic';
  if (row.section === 'iphone') {
    if (quality.includes('INCELL')) return 'iphone-incell';
    if (quality.includes('SOFT')) return 'iphone-oled-soft';
    if (quality.includes('OLED')) return 'iphone-oled';
  }
  if (row.section === 'samsung') {
    if (quality.includes('INCELL')) return 'samsung-incell';
    if (quality.includes('ORIGINAL')) return 'samsung-original';
    if (quality.includes('OLED') || quality.includes('AMOLED')) return 'samsung-oled';
  }
  return row.section;
}

const SPECIAL_IDENTITIES = {
  'iphone-oled-14pro': ['iphone-oled-soft', '14PRO'],
  'iphone-oled-15': ['iphone-oled-soft', '15'],
  'x200t-cortadora-micas': ['micas', 'MAQUINADEMICASX200T'],
  'x200t-cortadora-inteligente-de-micas': ['micas', 'MAQUINADEMICASX200T'],
  'mica-hd': ['micas', 'MICAHD'],
  'mica-matte': ['micas', 'MICAMATTE'],
  'mica-privacidad-hd': ['micas', 'MICAPRIVACIDADHD'],
  'mica-privacidad-matte': ['micas', 'MICAPRIVACIDADMATTE'],
  'aimb-g5-ai-sports': ['ai', 'GAFASAIG5'],
  'w630-ai-pro': ['ai', 'GAFASAIW630'],
  'haode-ai-w610-smart-glasses': ['ai', 'GAFASAIW610'],
  'haode-ai-g3-smart-glasses': ['ai', 'GAFASAIG3'],
  's1-ai-classic': ['ai', 'GAFASAIS1'],
  'lk-007-camara-digital-4k': ['cameras', 'LK007'],
  'lk-030-mini-camara-retro-digital': ['cameras', 'LK030'],
  'lk-032-camara-inteligente-con-gimbal': ['cameras', 'LK032'],
  'lk-018-camara-accion-hd': ['cameras', 'LK018'],
};

function productIdentity(product, appProduct) {
  if (SPECIAL_IDENTITIES[product.id]) {
    const [priceClass, key] = SPECIAL_IDENTITIES[product.id];
    return { priceClass, key };
  }

  const category = String(appProduct ? product.categoria : product.category || '').toLowerCase();
  const quality = String(appProduct ? product.modelo || '' : product.quality || '').toUpperCase();
  let priceClass = '';
  if (category.includes('diagn')) priceClass = 'iphone-diagnostic';
  else if (category.includes('iphone') && category.includes('incell')) priceClass = 'iphone-incell';
  else if (category.includes('iphone') && category.includes('oled')) priceClass = quality.includes('SOFT') ? 'iphone-oled-soft' : 'iphone-oled';
  else if (category.includes('samsung') && category.includes('incell')) priceClass = 'samsung-incell';
  else if (category.includes('samsung') && category.includes('original')) priceClass = 'samsung-original';
  else if (category.includes('samsung') && category.includes('oled')) priceClass = 'samsung-oled';
  else if (category.includes('funda')) priceClass = 'fundas';
  else if (category.includes('mica')) priceClass = 'micas';
  else if (category.includes('gafas') || category.includes('productos ai')) priceClass = 'ai';
  else if (category.includes('camara') || category.includes('cámara')) priceClass = 'cameras';
  else if (category.includes('celular')) priceClass = 'phones';

  return {
    priceClass,
    key: priceClass === 'fundas'
      ? modelKey(product.nombre || product.name || `${product.modelo || product.model || ''}`)
      : modelKey(product.modelo || product.model || product.nombre || product.name),
  };
}

function sourceKey(row) {
  if (row.section === 'fundas') return modelKey(`${row.product || ''} ${row.model || ''}`);
  return modelKey(row.model || row.product);
}

function sourceIdentity(row) {
  return `${row.priceClass}:${row.key}`;
}

function samePublicSourceRow(left, right) {
  return JSON.stringify({
    section: left.section,
    model: left.model,
    product: left.product,
    quality: left.quality,
    brand: left.brand,
    prices: left.prices,
    note: left.note,
  }) === JSON.stringify({
    section: right.section,
    model: right.model,
    product: right.product,
    quality: right.quality,
    brand: right.brand,
    prices: right.prices,
    note: right.note,
  });
}

function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\+/g, ' plus ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function sourceCategory(row) {
  const priceClass = priceClassFromSource(row);
  const map = {
    'iphone-incell': { website: 'iphone-incell', app: 'Pantallas iPhone INCELL', brand: 'iPhone' },
    'iphone-oled-soft': { website: 'iphone-oled', app: 'Pantallas iPhone OLED', brand: 'iPhone' },
    'iphone-oled': { website: 'iphone-oled', app: 'Pantallas iPhone OLED', brand: 'iPhone' },
    'iphone-diagnostic': { website: 'oled-diagnostica', app: 'Pantallas OLED Diagnóstica', brand: 'HAODE' },
    'samsung-incell': { website: 'samsung-incell', app: 'Pantallas Samsung INCELL', brand: 'Samsung' },
    'samsung-original': { website: 'samsung-tipo-original', app: 'Pantallas Samsung Original', brand: 'Samsung' },
    'samsung-oled': { website: 'samsung-oled', app: 'Pantallas Samsung OLED', brand: 'Samsung' },
    micas: { website: 'micas', app: 'Micas', brand: 'HAODE' },
    fundas: { website: 'fundas', app: 'Fundas', brand: 'HAODE' },
    ai: { website: 'gafas-ai', app: 'Gafas AI', brand: 'HAODE' },
    cameras: { website: 'camaras-inteligentes', app: 'Cámaras Inteligentes', brand: 'HAODE' },
    phones: { website: 'celulares-samsung', app: 'Celulares Samsung', brand: 'Samsung' },
  };
  return map[priceClass] || { website: slugify(row.section), app: row.section, brand: row.brand || 'HAODE' };
}

function displayModel(row) {
  const raw = String(row.model || '').trim();
  if (!raw) return String(row.product || '').trim();
  if (row.section === 'iphone' || row.section === 'iphone-diagnostic') {
    return /^iphone\b/i.test(raw) ? raw : `iPhone ${raw}`;
  }
  return raw;
}

function sourceProductName(row) {
  const model = displayModel(row);
  if (row.section === 'iphone') return `Pantalla para ${model}`;
  if (row.section === 'iphone-diagnostic') return `Pantalla OLED Diagnóstica para ${model}`;
  if (row.section === 'samsung') return `Pantalla para Samsung ${row.model}`;
  if (row.section === 'phones') return row.model;
  if (row.section === 'fundas') return [row.product, row.model].filter(Boolean).join(' · ');
  return row.product || row.model || 'Producto HAODE';
}

function sourceProductId(row, usedIds) {
  const category = sourceCategory(row).website;
  const quality = priceClassFromSource(row);
  const identityText = row.section === 'fundas'
    ? `${row.product || ''}-${row.model || ''}`
    : row.model || row.product;
  let base = `${category}-${slugify(identityText)}`;
  if (quality === 'iphone-oled-soft') base = `iphone-oled-soft-${slugify(row.model)}`;
  if (quality === 'iphone-diagnostic') {
    const diagnosticQuality = normalize(row.quality).includes('HARD') ? 'hard' : 'soft';
    base = `oled-diagnostica-${slugify(row.model)}-${diagnosticQuality}`;
  }
  if (row.section === 'phones') base = `celular-${slugify(row.model)}-${slugify(row.quality)}`;
  if (!usedIds.has(base)) return base;
  let suffix = 2;
  while (usedIds.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}

function sourceDescription(row) {
  const name = sourceProductName(row);
  const details = [row.quality, row.note].filter(Boolean).join(' · ');
  if (row.section === 'phones') {
    return `${name}${row.quality ? ` ${row.quality}` : ''} publicado desde la lista de precios HAODE. Consulta disponibilidad, estado del equipo y condiciones por WhatsApp antes de confirmar el pedido.`;
  }
  return `${name}${details ? ` · ${details}` : ''} para técnicos, tiendas y mayoreo HAODE en México. Consulta disponibilidad, modelo exacto y cantidad por WhatsApp antes de confirmar el pedido.`;
}

function sourcePriceReference(source, rows) {
  return `${source.sourceWorkbook} · ${source.sourceSheet} · ${rows.length > 1 ? `filas ${rows.map((row) => row.sourceRow).join(', ')}` : `fila ${rows[0].sourceRow}`}`;
}

function makeWebsiteProduct(id, row, rows, source, existing = null, appProduct = null) {
  const category = sourceCategory(row);
  const name = sourceProductName(row);
  const appImage = String(appProduct?.imagen || '').replace(/^\/+/, '');
  const existingImages = Array.isArray(existing?.images) ? existing.images.filter(Boolean) : [];
  const image = existingImages[0] || appImage || PLACEHOLDER_IMAGE;
  return {
    ...(existing || {}),
    id,
    category: category.website,
    brand: existing?.brand || category.brand,
    model: existing?.model || displayModel(row),
    name: existing?.name || appProduct?.nombre || name,
    quality: existing?.quality || row.quality || row.note || displayModel(row),
    images: existingImages.length ? existingImages : [image],
    videos: Array.isArray(existing?.videos) ? existing.videos : [],
    prices: websitePrices(row),
    priceSource: sourcePriceReference(source, rows),
    whatsappText: existing?.whatsappText || `Hola HAODE, quiero cotizar: ${name}`,
    description: existing?.description || appProduct?.descripcion || sourceDescription(row),
    stockStatus: existing?.stockStatus || 'ask_stock',
    internalId: existing?.internalId === true || !existing,
    officialSkuPending: existing?.officialSkuPending === true || !existing,
    sourceRows: rows.map((item) => item.sourceRow),
  };
}

function makeAppProduct(id, row, rows, source, existing = null, websiteProduct = null, order = 9999) {
  const category = sourceCategory(row);
  const name = websiteProduct?.name || sourceProductName(row);
  const webImage = String(websiteProduct?.images?.[0] || PLACEHOLDER_IMAGE).replace(/^\/+/, '');
  return {
    ...(existing || {}),
    id,
    categoria: category.app,
    nombre: existing?.nombre || name,
    modelo: existing?.modelo || [displayModel(row), row.quality].filter(Boolean).join(' '),
    descripcion: existing?.descripcion || websiteProduct?.description || sourceDescription(row),
    precioPublico: Number(row.prices.retail),
    precioMayoreo: Number(row.prices.wholesale5 || row.prices.retail),
    imagen: existing?.imagen || `/${webImage}`,
    stock: existing?.stock || 'consultar inventario',
    activo: true,
    orden: Number(existing?.orden || order),
    priceTiers: appPriceTiers(row),
    priceSource: sourcePriceReference(source, rows),
    internalId: existing?.internalId === true || !existing,
    officialSkuPending: existing?.officialSkuPending === true || !existing,
    sourceRows: rows.map((item) => item.sourceRow),
  };
}

function readWebsiteProducts() {
  const text = fs.readFileSync(WEBSITE_FILE, 'utf8');
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  return {
    products: JSON.parse(text.slice(start, end + 1)),
    buildText: text.slice(end + 1),
  };
}

function money(value) {
  return Number.isFinite(Number(value)) && Number(value) > 0 ? Number(value) : null;
}

function websitePrices(row) {
  const tiers = [
    ['1 pza', row.prices.retail],
    ['5+ pzs', row.prices.wholesale5],
    ['100 pzs surtido', row.prices.mixed100],
    ['100 pzs/modelo', row.prices.model100],
    ['Caja/modelo', row.prices.boxModel],
  ];
  if (row.section === 'micas' && row.prices.quantity10) {
    tiers.splice(2, 3, ['10+ paquetes', row.prices.quantity10]);
  }
  return tiers
    .filter(([, value]) => money(value))
    .map(([quantity, value]) => ({ quantity, price: `$${Number(value).toLocaleString('es-MX')} MXN` }));
}

function appPriceTiers(row) {
  const tiers = [];
  if (money(row.prices.wholesale5)) {
    tiers.push({ code: 'WHOLESALE_5', minQty: 5, maxQty: 99, price: Number(row.prices.wholesale5), label: 'Mayoreo 5 pzs', scope: 'single_product' });
  }
  if (money(row.prices.mixed100)) {
    tiers.push({ code: 'MIXED_100', minQty: 100, maxQty: null, price: Number(row.prices.mixed100), label: '100 pzs surtido', scope: 'mixed_order' });
  }
  if (money(row.prices.model100)) {
    tiers.push({ code: 'MODEL_100', minQty: 100, maxQty: null, price: Number(row.prices.model100), label: '100 pzs/modelo', scope: 'same_model' });
  }
  if (money(row.prices.boxModel)) {
    tiers.push({ code: 'BOX_MODEL', minQty: 1, maxQty: null, price: Number(row.prices.boxModel), label: 'Caja/modelo', scope: 'box_model', autoApply: false });
  }
  if (row.section === 'micas' && money(row.prices.quantity10)) {
    tiers.push({ minQty: 10, maxQty: null, price: Number(row.prices.quantity10), label: '10+ paquetes', scope: 'single_product' });
  }
  return tiers;
}

function priceNumber(value) {
  const parsed = Number(String(value || '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function csvRows(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"') {
      if (quoted && text[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else quoted = !quoted;
    } else if (char === ',' && !quoted) {
      row.push(cell);
      cell = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[index + 1] === '\n') index += 1;
      row.push(cell);
      if (row.some((value) => value !== '')) rows.push(row);
      row = [];
      cell = '';
    } else cell += char;
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

function csvCell(value) {
  const text = String(value ?? '');
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function updateMasterCsv(changes, deletedIds, sourceVersion) {
  const rows = csvRows(fs.readFileSync(MASTER_FILE, 'utf8'));
  const headers = rows[0];
  const idIndex = headers.indexOf('id');
  const publicIndex = headers.indexOf('precio_publico');
  const wholesaleIndex = headers.indexOf('precio_mayoreo');
  const updatedIndex = headers.indexOf('last_updated');
  const byId = new Map(changes.map((change) => [change.id, change]));
  const retainedRows = rows.slice(1).filter((row) => !deletedIds.has(row[idIndex]));
  retainedRows.forEach((row) => {
    const change = byId.get(row[idIndex]);
    if (!change) return;
    row[publicIndex] = String(change.retail);
    row[wholesaleIndex] = String(change.wholesale5 || change.retail);
    row[updatedIndex] = sourceVersion;
  });
  return `${[headers, ...retainedRows].map((row) => row.map(csvCell).join(',')).join('\n')}\n`;
}

function rebuildMasterCsv(websiteProducts, appProducts, sourceRowsById, source) {
  const rows = csvRows(fs.readFileSync(MASTER_FILE, 'utf8'));
  const headers = rows[0];
  const existingById = new Map(rows.slice(1).map((row) => [
    row[headers.indexOf('id')],
    Object.fromEntries(headers.map((header, index) => [header, row[index] || ''])),
  ]));
  const appById = new Map(appProducts.map((product) => [product.id, product]));
  const output = websiteProducts.map((website) => {
    const app = appById.get(website.id);
    const sourceRows = sourceRowsById.get(website.id) || [];
    const previous = existingById.get(website.id) || {};
    const placeholder = String(website.images?.[0] || '').includes('placeholder.svg');
    const values = {
      ...previous,
      id: website.id,
      producto_nombre: website.name,
      categoria: app?.categoria || website.category,
      modelo: app?.modelo || website.model,
      descripcion: website.description,
      precio_publico: String(app?.precioPublico || priceNumber(website.prices?.[0]?.price)),
      precio_mayoreo: String(app?.precioMayoreo || priceNumber(website.prices?.[1]?.price)),
      imagen_path: `/${String(website.images?.[0] || PLACEHOLDER_IMAGE).replace(/^\/+/, '')}`,
      video_path: website.videos?.[0] ? `/${String(website.videos[0]).replace(/^\/+/, '')}` : '',
      website_present: 'yes',
      app_present: 'yes',
      website_precio_publico: String(priceNumber(website.prices?.[0]?.price)),
      website_precio_mayoreo: String(priceNumber(website.prices?.[1]?.price)),
      app_precio_publico: String(app?.precioPublico || ''),
      app_precio_mayoreo: String(app?.precioMayoreo || ''),
      image_exists: placeholder ? 'placeholder_authorized' : 'yes',
      video_exists: website.videos?.length ? 'yes' : 'no',
      price_status: 'OK',
      category_status: 'OK',
      product_status: placeholder ? 'imagen_pendiente' : (previous.product_status || 'OK'),
      estado: 'Activo',
      source: [...new Set([
        ...String(previous.source || '').split('|').filter(Boolean),
        sourceRows.length ? sourcePriceReference(source, sourceRows) : source.sourceWorkbook,
      ])].join('|'),
      last_checked: TODAY,
    };
    return headers.map((header) => values[header] || '');
  });
  return `${[headers, ...output].map((row) => row.map(csvCell).join(',')).join('\n')}\n`;
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function productSeoName(product) {
  const quality = String(product.quality || '').toUpperCase();
  const label = quality.includes('SOFT OLED')
    ? 'Soft OLED'
    : quality.includes('HARD OLED')
      ? 'Hard OLED'
      : quality.includes('TIPO ORIGINAL') || quality.includes('ORIGINAL')
        ? 'Tipo Original'
        : quality.includes('INCELL')
          ? 'INCELL'
          : quality.includes('AMOLED')
            ? 'AMOLED'
            : quality.includes('OLED')
              ? 'OLED'
              : '';
  const name = String(product.name || '').trim().replace(/\s*\|\s*HAODE México.*$/i, '');
  if (!label || !/^pantalla\b/i.test(name) || name.toLowerCase().includes(label.toLowerCase())) return name;
  return `${name} ${label}`;
}

function genericProductPage(product) {
  const image = `/${String(product.images?.[0] || PLACEHOLDER_IMAGE).replace(/^\/+/, '')}`;
  const displayImage = image.replace(/\.(?:jpe?g|png)$/i, '.display.webp');
  const canonical = `https://haode.com.mx/producto/${product.id}/`;
  const retail = priceNumber(product.prices?.[0]?.price);
  const placeholder = image.includes('placeholder.svg');
  const seoName = productSeoName(product);
  const whatsapp = `https://wa.me/523326684296?text=${encodeURIComponent([
    'Hola HAODE México, quiero cotizar este producto:',
    `Producto: ${product.name}`,
    `Referencia web: ${product.id}`,
    'Cantidad:',
    'Ciudad:',
    '¿Me pueden confirmar stock en México, precio por cantidad, garantía local y envío?',
  ].join('\n'))}`;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${canonical}#product`,
    name: product.name,
    description: product.description,
    image: `https://haode.com.mx${image}`,
    url: canonical,
    brand: { '@type': 'Brand', name: product.brand || 'HAODE' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'MXN',
      price: String(retail),
      availability: 'https://schema.org/LimitedAvailability',
      url: canonical,
    },
  };
  return `<!DOCTYPE html>
<html lang="es-MX">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="${escapeHtml(product.description)}" />
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1" />
  <meta property="og:type" content="product" />
  <meta property="og:site_name" content="HAODE MÉXICO" />
  <meta property="og:title" content="${escapeHtml(seoName)} | HAODE México" />
  <meta property="og:description" content="${escapeHtml(product.description)}" />
  <meta property="og:image" content="https://haode.com.mx${image}" />
  <meta property="og:url" content="${canonical}" />
  <link rel="canonical" href="${canonical}" />
  <title>${escapeHtml(seoName)} | HAODE México</title>
  <link rel="icon" href="/assets/logo/favicon.png" type="image/png" />
  <link rel="stylesheet" href="/style.css?v=20260813-final-ui-seo" />
  <script type="application/ld+json">${JSON.stringify(schema)}</script>
  <script src="/analytics.js?v=20260813-ga4-conversions"></script>
</head>
<body class="product-detail-page conversion-reference-page">
  <header class="topbar catalog-topbar">
    <div class="wrap topbar-inner">
      <a class="brand" href="/" aria-label="HAODE MÉXICO"><img class="brand-logo" src="/assets/images/factory-store-wordmark.png" alt="HAODE Refacciones para Celular" width="200" height="58" /><span class="brand-copy"><strong>HAODE</strong><small>MÉXICO</small></span></a>
      <nav class="topnav" aria-label="Navegación principal"><a href="/">Inicio</a><a href="/productos/">Productos</a><a href="/app/">App</a><a href="/contacto/">Contacto</a></nav>
    </div>
  </header>
  <main class="detail-main">
    <div class="wrap detail-shell" data-product-detail>
      <div class="detail-top">
        <div><span class="detail-kicker" data-detail-brand>${escapeHtml(product.brand || 'HAODE')}</span><h1 class="detail-title" data-detail-title>${escapeHtml(product.name)}</h1><p class="catalog-intro" data-detail-subtitle>${escapeHtml(product.model)}</p><div class="detail-mobile-product-preview" data-detail-mobile-preview><img src="${displayImage}" alt="Imagen de ${escapeHtml(product.name)}" width="72" height="72" loading="eager" decoding="async" /><div><strong>Foto del producto</strong><small>Confirma stock en México y precio por cantidad por WhatsApp.</small></div></div><div class="detail-highlights" data-detail-highlights><span>Stock en México bajo confirmación</span><span>Precio por cantidad</span><span>WhatsApp privado</span></div></div>
        <a class="btn btn-secondary detail-back" data-detail-back href="/productos/">Volver al catálogo</a>
      </div>
      <div class="detail-grid">
        <section class="detail-visual" aria-label="Imagen del producto">
          <img class="detail-main-image" data-detail-main-image src="${displayImage}" alt="${escapeHtml(product.name)}" width="1000" height="1000" loading="eager" fetchpriority="high" decoding="async" />
${placeholder ? '          <p class="product-image-status" data-product-image-status>Imagen en actualización</p>\n' : ''}          <div class="detail-gallery-wrap"><h2>Galería</h2><div class="detail-gallery" data-detail-gallery></div></div>
          <div class="detail-video-wrap"><h2>Video</h2><div class="detail-videos" data-detail-videos></div></div>
        </section>
        <aside class="detail-info">
          <article class="detail-card"><p class="detail-meta" data-detail-quality>${escapeHtml(product.quality)}</p><p class="detail-description" data-detail-description>${escapeHtml(product.description)}</p><div><p class="detail-price">Precio publicado</p><p class="detail-price-note" data-detail-price>${escapeHtml(product.prices?.[0]?.price)}</p></div><div class="detail-buttons"><a class="btn btn-primary" data-detail-whatsapp href="${whatsapp}" target="_blank" rel="noopener noreferrer">Cotizar por WhatsApp</a><a class="btn btn-secondary" href="/app/">Abrir App HAODE</a></div></article>
          <article class="detail-card"><h2>Precios por cantidad</h2><table class="detail-price-table"><tbody data-detail-price-body>${product.prices.map((entry) => `<tr><th scope="row">${escapeHtml(entry.quantity)}</th><td>${escapeHtml(entry.price)}</td></tr>`).join('')}</tbody></table></article>
        </aside>
      </div>
      <section class="detail-related-section"><div class="section-head section-head-compact"><div><p class="section-kicker">Relacionado</p><h2>Productos relacionados</h2></div><p>Más opciones HAODE con cotización directa.</p></div><div class="product-page-grid shop-grid" data-related-products></div></section>
    </div>
  </main>
  <footer class="footer catalog-footer"><div class="wrap footer-inner"><small>© HAODE MÉXICO · Atención por WhatsApp · Envíos nacionales</small></div></footer>
  <a class="floating-cta" href="${whatsapp}" target="_blank" rel="noopener noreferrer">Cotizar por WhatsApp</a>
  <script src="/campaign-attribution.js?v=20260813-ga4-conversions"></script>
  <script src="/data/products.generated.js?v=20260725-catalog-complete"></script>
  <script src="/products.js?v=20260813-ga4-conversions"></script>
  <script src="/detail-header.js?v=20260725-catalog-complete"></script>
</body>
</html>
`;
}

function publishStaticProductRoutes(products) {
  const created = [];
  products.forEach((product) => {
    const directory = path.join(PRODUCT_DIR, product.id);
    const indexFile = path.join(directory, 'index.html');
    if (fs.existsSync(indexFile)) {
      const current = fs.readFileSync(indexFile, 'utf8');
      if (!current.includes('20260725-catalog-complete')) return;
    }
    fs.mkdirSync(directory, { recursive: true });
    fs.writeFileSync(indexFile, genericProductPage(product), 'utf8');
    created.push(product.id);
  });
  return created;
}

function updateSitemap(products) {
  let sitemap = fs.readFileSync(SITEMAP_FILE, 'utf8');
  sitemap = sitemap.replace(/\s*<url>[\s\S]*?<\/url>/g, (block) => {
    const redirects = [...REDIRECT_PRODUCT_IDS].some((id) => block.includes(`/producto/${id}/`));
    return redirects ? '' : block;
  });
  const additions = products
    .filter((product) => !REDIRECT_PRODUCT_IDS.has(product.id))
    .filter((product) => !sitemap.includes(`https://haode.com.mx/producto/${product.id}/`))
    .map((product) => `  <url>
    <loc>https://haode.com.mx/producto/${product.id}/</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`)
    .join('\n');
  if (additions) sitemap = sitemap.replace(/\s*<\/urlset>\s*$/, `\n${additions}\n</urlset>\n`);
  fs.writeFileSync(SITEMAP_FILE, sitemap, 'utf8');
}

function staticCanonicalSlug(text) {
  const match = text.match(/<link[^>]+rel=["']canonical["'][^>]+href=["'][^"']*\/producto\/([^/"']+)\/?["']/i)
    || text.match(/<link[^>]+href=["'][^"']*\/producto\/([^/"']+)\/?["'][^>]+rel=["']canonical["']/i);
  return match ? match[1] : '';
}

function pruneStaticProductRoutes(deletedIds) {
  if (!deletedIds.size || !fs.existsSync(PRODUCT_DIR)) return [];
  const explicitAliases = new Set(
    [...deletedIds].flatMap((id) => STATIC_ROUTE_ALIASES[id] || [])
  );
  const removedSlugs = [];

  fs.readdirSync(PRODUCT_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .forEach((entry) => {
      const slug = entry.name;
      const indexFile = path.join(PRODUCT_DIR, slug, 'index.html');
      const text = fs.existsSync(indexFile) ? fs.readFileSync(indexFile, 'utf8') : '';
      const canonicalSlug = staticCanonicalSlug(text);
      const shouldRemove = deletedIds.has(slug)
        || (canonicalSlug && deletedIds.has(canonicalSlug))
        || explicitAliases.has(slug);
      if (!shouldRemove) return;
      fs.rmSync(path.join(PRODUCT_DIR, slug), { recursive: true, force: true });
      removedSlugs.push(slug);
    });

  if (fs.existsSync(SITEMAP_FILE)) {
    const blockedSlugs = new Set([...deletedIds, ...removedSlugs, ...explicitAliases]);
    const sitemap = fs.readFileSync(SITEMAP_FILE, 'utf8');
    const nextSitemap = sitemap.replace(/\s*<url>[\s\S]*?<\/url>/g, (block) => {
      const blocked = [...blockedSlugs].some((slug) => block.includes(`/producto/${slug}/`));
      return blocked ? '' : block;
    });
    fs.writeFileSync(SITEMAP_FILE, nextSitemap.replace(/>\s*<url>/g, '>\n  <url>'), 'utf8');
  }

  return removedSlugs.sort();
}

function main() {
  const source = JSON.parse(fs.readFileSync(SOURCE_FILE, 'utf8'));
  const sourceRows = source.rows.map((row) => ({
    ...row,
    priceClass: priceClassFromSource(row),
    key: sourceKey(row),
  }));
  const byIdentity = new Map();
  sourceRows.forEach((row) => {
    const identity = sourceIdentity(row);
    if (!row.priceClass || !row.key) return;
    if (!byIdentity.has(identity)) byIdentity.set(identity, []);
    byIdentity.get(identity).push(row);
  });

  const { products: websiteProducts, buildText } = readWebsiteProducts();
  const appProducts = JSON.parse(fs.readFileSync(APP_FILE, 'utf8'));
  const report = {
    website: [],
    app: [],
    unmatchedWebsite: [],
    unmatchedApp: [],
    ambiguous: [],
    retained: [],
    deleted: [],
    unpublishedSourceRows: [],
    removedStaticRoutes: [],
    duplicateSourceRows: [],
    publishedProducts: [],
    createdStaticRoutes: [],
  };
  const masterChanges = new Map();
  const matchedById = new Map();
  const matchedIdByIdentity = new Map();
  const websiteDirectMatches = new Set();
  const usedSourceRows = new Set();

  function findRow(product, appProduct) {
    const identity = productIdentity(product, appProduct);
    if (!identity.priceClass || !identity.key) return null;
    const candidates = byIdentity.get(`${identity.priceClass}:${identity.key}`) || [];
    if (candidates.length > 1) {
      const exactDuplicates = candidates.every((row) => samePublicSourceRow(candidates[0], row));
      if (!exactDuplicates) {
        report.ambiguous.push({ id: product.id, identity, rows: candidates.map((row) => row.sourceRow) });
        return null;
      }
    }
    return candidates[0] || null;
  }

  function recordMatch(product, row) {
    matchedById.set(product.id, row);
    matchedIdByIdentity.set(sourceIdentity(row), product.id);
    (byIdentity.get(sourceIdentity(row)) || [row]).forEach((candidate) => {
      usedSourceRows.add(`${candidate.section}:${candidate.sourceRow}`);
    });
    masterChanges.set(product.id, {
      id: product.id,
      retail: row.prices.retail,
      wholesale5: row.prices.wholesale5,
    });
  }

  websiteProducts.forEach((product) => {
    const row = findRow(product, false);
    if (!row) {
      report.unmatchedWebsite.push(product.id);
      return;
    }
    const nextPrices = websitePrices(row);
    const before = JSON.stringify(product.prices || []);
    const after = JSON.stringify(nextPrices);
    product.prices = nextPrices;
    product.priceSource = `${source.sourceWorkbook} · ${source.sourceSheet} · fila ${row.sourceRow}`;
    if (before !== after) report.website.push({ id: product.id, row: row.sourceRow, prices: nextPrices });
    websiteDirectMatches.add(product.id);
    recordMatch(product, row);
  });

  appProducts.forEach((product) => {
    const row = findRow(product, true) || matchedById.get(product.id);
    if (!row) {
      report.unmatchedApp.push(product.id);
      return;
    }
    const retail = Number(row.prices.retail);
    const wholesale5 = Number(row.prices.wholesale5 || row.prices.retail);
    const tiers = appPriceTiers(row);
    const before = JSON.stringify({ retail: product.precioPublico, wholesale5: product.precioMayoreo, tiers: product.priceTiers || [] });
    product.precioPublico = retail;
    product.precioMayoreo = wholesale5;
    product.priceTiers = tiers;
    product.priceSource = `${source.sourceWorkbook} · ${source.sourceSheet} · fila ${row.sourceRow}`;
    const after = JSON.stringify({ retail, wholesale5, tiers });
    if (before !== after) report.app.push({ id: product.id, row: row.sourceRow, retail, wholesale5, tiers });
    recordMatch(product, row);
  });

  websiteProducts.forEach((product) => {
    if (websiteDirectMatches.has(product.id)) return;
    const row = matchedById.get(product.id);
    if (!row) return;
    const nextPrices = websitePrices(row);
    const before = JSON.stringify(product.prices || []);
    product.prices = nextPrices;
    product.priceSource = `${source.sourceWorkbook} · ${source.sourceSheet} · fila ${row.sourceRow}`;
    if (before !== JSON.stringify(nextPrices)) {
      report.website.push({ id: product.id, row: row.sourceRow, prices: nextPrices });
    }
    recordMatch(product, row);
  });

  const sourceRowsById = new Map();
  if (PUBLISH_UNLISTED) {
    const websiteById = new Map(websiteProducts.map((product) => [product.id, product]));
    const appById = new Map(appProducts.map((product) => [product.id, product]));
    const usedIds = new Set([...websiteById.keys(), ...appById.keys()]);
    let nextOrder = Math.max(0, ...appProducts.map((product) => Number(product.orden || 0))) + 10;

    byIdentity.forEach((rows, identity) => {
      if (!rows.length) return;
      const row = rows[0];
      const exactDuplicates = rows.every((candidate) => samePublicSourceRow(row, candidate));
      if (rows.length > 1 && !exactDuplicates) {
        report.ambiguous.push({ id: '', identity, rows: rows.map((candidate) => candidate.sourceRow) });
        return;
      }
      if (rows.length > 1) {
        report.duplicateSourceRows.push({
          identity,
          canonicalRow: row.sourceRow,
          duplicateRows: rows.slice(1).map((candidate) => candidate.sourceRow),
        });
      }

      let id = matchedIdByIdentity.get(identity);
      if (!id) {
        id = sourceProductId(row, usedIds);
        usedIds.add(id);
      }
      const existingWebsite = websiteById.get(id) || null;
      const existingApp = appById.get(id) || null;
      const website = makeWebsiteProduct(id, row, rows, source, existingWebsite, existingApp);
      const app = makeAppProduct(id, row, rows, source, existingApp, website, nextOrder);
      if (!existingApp) nextOrder += 10;
      websiteById.set(id, website);
      appById.set(id, app);
      recordMatch(website, row);
      sourceRowsById.set(id, rows);
      if (!existingWebsite || !existingApp) {
        report.publishedProducts.push({
          id,
          sourceRows: rows.map((candidate) => candidate.sourceRow),
          websiteCreated: !existingWebsite,
          appCreated: !existingApp,
          placeholder: website.images?.[0] === PLACEHOLDER_IMAGE,
        });
      }
    });

    websiteProducts.splice(0, websiteProducts.length, ...[...websiteById.values()]);
    appProducts.splice(0, appProducts.length, ...[...appById.values()]);
  } else {
    matchedById.forEach((row, id) => {
      sourceRowsById.set(id, byIdentity.get(sourceIdentity(row)) || [row]);
    });
  }

  if (report.ambiguous.length) {
    console.error(JSON.stringify(report, null, 2));
    throw new Error('Price sync stopped because ambiguous product matches were found.');
  }

  const allCatalogIds = new Set([...websiteProducts, ...appProducts].map((product) => product.id));
  const deletedIds = new Set(
    DELETE_UNLISTED
      ? [...allCatalogIds].filter((id) => !matchedById.has(id))
      : []
  );
  const retainedWebsiteProducts = websiteProducts
    .filter((product) => !deletedIds.has(product.id))
    .sort((left, right) => left.category.localeCompare(right.category) || left.id.localeCompare(right.id));
  const retainedAppProducts = appProducts
    .filter((product) => !deletedIds.has(product.id))
    .sort((left, right) => Number(left.orden || 9999) - Number(right.orden || 9999) || left.id.localeCompare(right.id));
  report.retained = [...matchedById.entries()]
    .map(([id, row]) => ({ id, section: row.section, sourceRow: row.sourceRow }))
    .sort((a, b) => a.id.localeCompare(b.id));
  report.deleted = [...deletedIds].sort().map((id) => ({
    id,
    website: websiteProducts.some((product) => product.id === id),
    app: appProducts.some((product) => product.id === id),
  }));
  report.unpublishedSourceRows = sourceRows
    .filter((row) => !usedSourceRows.has(`${row.section}:${row.sourceRow}`))
    .map((row) => ({
      section: row.section,
      sourceRow: row.sourceRow,
      model: row.model,
      product: row.product,
      quality: row.quality,
    }));

  const summary = {
    apply: APPLY,
    deleteUnlisted: DELETE_UNLISTED,
    publishUnlisted: PUBLISH_UNLISTED,
    sourceRows: sourceRows.length,
    uniqueSourceProducts: byIdentity.size,
    websiteProducts: websiteProducts.length,
    websiteMatched: retainedWebsiteProducts.length,
    websiteChanged: report.website.length,
    websiteDeleted: websiteProducts.length - retainedWebsiteProducts.length,
    appProducts: appProducts.length,
    appMatched: retainedAppProducts.length,
    appChanged: report.app.length,
    appDeleted: appProducts.length - retainedAppProducts.length,
    retainedSkus: matchedById.size,
    deletedSkus: deletedIds.size,
    unpublishedSourceRows: report.unpublishedSourceRows.length,
    removedStaticRoutes: 0,
    unmatchedWebsite: report.unmatchedWebsite.length,
    unmatchedApp: report.unmatchedApp.length,
    ambiguous: report.ambiguous.length,
    duplicateSourceRows: report.duplicateSourceRows.reduce((count, item) => count + item.duplicateRows.length, 0),
    publishedProducts: report.publishedProducts.length,
    createdStaticRoutes: 0,
  };

  if (APPLY) {
    fs.writeFileSync(WEBSITE_FILE, `window.HAODE_PRODUCTS_DATA = ${JSON.stringify(retainedWebsiteProducts, null, 2)};${buildText}`, 'utf8');
    fs.writeFileSync(APP_FILE, `${JSON.stringify(retainedAppProducts, null, 2)}\n`, 'utf8');
    fs.writeFileSync(MASTER_FILE, PUBLISH_UNLISTED
      ? rebuildMasterCsv(retainedWebsiteProducts, retainedAppProducts, sourceRowsById, source)
      : updateMasterCsv([...masterChanges.values()], deletedIds, source.sourceVersion || source.importedAt), 'utf8');
    if (DELETE_UNLISTED) {
      report.removedStaticRoutes = pruneStaticProductRoutes(deletedIds);
      summary.removedStaticRoutes = report.removedStaticRoutes.length;
    }
    if (PUBLISH_UNLISTED) {
      report.createdStaticRoutes = publishStaticProductRoutes(retainedWebsiteProducts);
      summary.createdStaticRoutes = report.createdStaticRoutes.length;
      updateSitemap(retainedWebsiteProducts);
    }
    const lines = [
      '# Customer Price Sync 2026-08',
      '',
      `- Source: ${source.sourceWorkbook} / ${source.sourceSheet}`,
      `- Approved source rows: ${summary.sourceRows}`,
      `- Unique approved products: ${summary.uniqueSourceProducts}`,
      `- Website matched: ${summary.websiteMatched}/${summary.websiteProducts}`,
      `- Website changed: ${summary.websiteChanged}`,
      `- Website deleted: ${summary.websiteDeleted}`,
      `- App matched: ${summary.appMatched}/${summary.appProducts}`,
      `- App changed: ${summary.appChanged}`,
      `- App deleted: ${summary.appDeleted}`,
      `- Retained SKU: ${summary.retainedSkus}`,
      `- Deleted SKU: ${summary.deletedSkus}`,
      `- Source rows not yet published: ${summary.unpublishedSourceRows}`,
      `- Newly aligned or published products: ${summary.publishedProducts}`,
      `- Duplicate source rows consolidated: ${summary.duplicateSourceRows}`,
      `- Static product routes created: ${summary.createdStaticRoutes}`,
      `- Static product routes removed: ${summary.removedStaticRoutes}`,
      `- Ambiguous matches: ${summary.ambiguous}`,
      '',
      '## Rules',
      '',
      '- Only exact model and quality matches were updated.',
      `- Products absent from the source list were ${DELETE_UNLISTED ? 'deleted from website, App and master data' : 'not created or priced'}.`,
      '- Empty source tiers were not invented.',
      '- Internal page IDs are references only and are not presented as official commercial SKUs.',
      '- Missing media uses the approved HAODE placeholder and is marked Imagen en actualización.',
      '- `landed_cost` was intentionally excluded from public website/App files.',
      '',
      '## Unmatched website products',
      '',
      ...report.unmatchedWebsite.map((id) => `- ${id}`),
      '',
      '## Unmatched App products',
      '',
      ...report.unmatchedApp.map((id) => `- ${id}`),
      '',
      '## Deleted SKU',
      '',
      ...(report.deleted.length
        ? report.deleted.map((item) => `- ${item.id} (website=${item.website}; app=${item.app})`)
        : ['- Ninguno']),
      '',
      '## Source rows not yet published',
      '',
      ...report.unpublishedSourceRows.map((row) => `- ${row.section} · fila ${row.sourceRow}: ${row.model || row.product} ${row.quality || ''}`.trim()),
      '',
      '## Duplicate source rows consolidated',
      '',
      ...(report.duplicateSourceRows.length
        ? report.duplicateSourceRows.map((item) => `- ${item.identity}: canonical row ${item.canonicalRow}; duplicate rows ${item.duplicateRows.join(', ')}`)
        : ['- Ninguno']),
      '',
      '## Newly aligned or published products',
      '',
      ...(report.publishedProducts.length
        ? report.publishedProducts.map((item) => `- ${item.id} · source rows ${item.sourceRows.join(', ')} · website=${item.websiteCreated} · app=${item.appCreated} · placeholder=${item.placeholder}`)
        : ['- Ninguno']),
      '',
      '## Removed static routes',
      '',
      ...(report.removedStaticRoutes.length
        ? report.removedStaticRoutes.map((slug) => `- /producto/${slug}/`)
        : ['- Ninguno']),
      '',
    ];
    fs.writeFileSync(REPORT_FILE, lines.join('\n'), 'utf8');
    fs.writeFileSync(REPORT_JSON_FILE, `${JSON.stringify({ summary, report }, null, 2)}\n`, 'utf8');
  }

  console.log(JSON.stringify(process.argv.includes('--summary-only') ? { summary } : { summary, report }, null, 2));
}

main();
