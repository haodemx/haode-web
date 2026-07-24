const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MASTER_CSV = path.join(ROOT, 'docs', 'master-data', 'products-master.csv');
const APP_PRODUCTS = path.join(ROOT, 'app', 'products.json');
const WEBSITE_PRODUCTS = path.join(ROOT, 'data', 'products.generated.js');
const FIRESTORE_QUEUE = path.join(ROOT, 'docs', 'reports', 'firestore-publish-queue.json');

const CATEGORY_TO_WEBSITE = {
  'Pantallas iPhone INCELL': 'iphone-incell',
  'Pantallas iPhone OLED': 'iphone-oled',
  'Pantallas OLED Diagnóstica': 'oled-diagnostica',
  'Pantallas Samsung INCELL': 'samsung-incell',
  'Pantallas Samsung OLED': 'samsung-oled',
  'Pantallas Samsung Original': 'samsung-tipo-original',
  'Samsung TIPO ORIGINAL': 'samsung-tipo-original',
  'Gafas AI': 'gafas-ai',
  'Productos AI': 'gafas-ai',
  'Cámaras Inteligentes': 'camaras-inteligentes',
  'Camaras Inteligentes': 'camaras-inteligentes',
  'Cámaras Digitales': 'camaras-inteligentes',
  'Camaras Digitales': 'camaras-inteligentes',
  'Micas': 'micas',
  'Máquinas de Mica': 'maquinas-de-mica',
  'Maquinas de Mica': 'maquinas-de-mica',
  'Fundas': 'fundas',
};

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(cell);
      cell = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') index += 1;
      row.push(cell);
      if (row.some((value) => String(value).trim())) rows.push(row);
      row = [];
      cell = '';
      continue;
    }

    cell += char;
  }

  if (cell || row.length) {
    row.push(cell);
    if (row.some((value) => String(value).trim())) rows.push(row);
  }

  if (!rows.length) return [];
  const headers = rows[0].map((header) => String(header || '').replace(/^\uFEFF/, '').trim());
  return rows.slice(1).map((values) => {
    const item = {};
    headers.forEach((header, index) => {
      item[header] = String(values[index] || '').trim();
    });
    return item;
  });
}

function normalizeMoney(value) {
  const text = String(value || '').trim();
  if (!text) return '';
  const numeric = text.replace(/[^0-9.]/g, '');
  if (!numeric) return '';
  const parsed = Number(numeric);
  if (!Number.isFinite(parsed)) return '';
  return Number.isInteger(parsed) ? String(parsed) : String(parsed);
}

function toNumber(value) {
  const money = normalizeMoney(value);
  return money ? Number(money) : 0;
}

function isActive(row) {
  return String(row.estado || '').trim().toLowerCase() !== 'inactivo';
}

function isIgnored(row) {
  const status = `${row.product_status || ''} ${row.source || ''}`.toLowerCase();
  return status.includes('ignored_by_product_control=true') || status.includes('historical=true');
}

function readMasterProducts() {
  const rows = parseCsv(fs.readFileSync(MASTER_CSV, 'utf8'));
  return rows.filter((row) => row.id && isActive(row) && !isIgnored(row));
}

function publicAssetPath(value) {
  const text = String(value || '').trim();
  if (!text) return '';
  return text.startsWith('/') ? text.replace(/^\/haode-web\//, '/') : `/${text.replace(/^\/+/, '')}`;
}

function websiteAssetPath(value) {
  const text = String(value || '').trim();
  if (!text) return '';
  return text.replace(/^\/haode-web\//, '').replace(/^\/+/, '');
}

function inferBrand(row) {
  const category = row.categoria || '';
  if (category.includes('OLED Diagnóstica')) return 'HAODE';
  if (category.includes('iPhone')) return 'iPhone';
  if (category.includes('Samsung')) return 'Samsung';
  return 'HAODE';
}

function websiteCategory(row) {
  return CATEGORY_TO_WEBSITE[row.categoria] || row.categoria || 'otros';
}

function firestoreProduct(row, order) {
  return {
    id: row.id,
    categoria: row.categoria,
    nombre: row.producto_nombre,
    modelo: row.modelo,
    descripcion: row.descripcion,
    precioPublico: toNumber(row.precio_publico),
    precioMayoreo: toNumber(row.precio_mayoreo),
    imagen: publicAssetPath(row.imagen_path),
    stock: 'disponible',
    activo: true,
    orden: order,
  };
}

function appProduct(row, order) {
  return firestoreProduct(row, order);
}

function websiteProduct(row) {
  const publicPrice = normalizeMoney(row.precio_publico);
  const wholesalePrice = normalizeMoney(row.precio_mayoreo);
  const images = [websiteAssetPath(row.imagen_path)].filter(Boolean);
  const videos = [websiteAssetPath(row.video_path)].filter(Boolean);

  return {
    id: row.id,
    category: websiteCategory(row),
    brand: inferBrand(row),
    model: row.modelo,
    name: row.producto_nombre,
    quality: row.modelo,
    images,
    videos,
    prices: [
      { quantity: '1 pza', price: publicPrice ? `$${publicPrice} MXN` : 'Consultar' },
      { quantity: '5+ pzs', price: wholesalePrice ? `$${wholesalePrice} MXN` : 'Consultar' },
    ],
    priceSource: 'docs/master-data/products-master.csv',
    whatsappText: `Hola HAODE, quiero cotizar: ${row.producto_nombre}`,
    description: row.descripcion || `${row.producto_nombre} para mayoreo y menudeo en México.`,
  };
}

function writeWebsiteProducts(products) {
  const build = {
    generatedAt: new Date().toISOString(),
    source: 'docs/master-data/products-master.csv',
  };
  const content = `window.HAODE_PRODUCTS_DATA = ${JSON.stringify(products, null, 2)};\nwindow.HAODE_PRODUCTS_BUILD = ${JSON.stringify(build, null, 2)};\n`;
  fs.writeFileSync(WEBSITE_PRODUCTS, content, 'utf8');
}

function readWebsiteProducts() {
  const text = fs.readFileSync(WEBSITE_PRODUCTS, 'utf8');
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start < 0 || end < start) return [];
  return JSON.parse(text.slice(start, end + 1));
}

function makeFirestoreFields(product) {
  const fields = {};
  Object.entries(product).forEach(([key, value]) => {
    if (typeof value === 'boolean') fields[key] = { booleanValue: value };
    else if (typeof value === 'number') fields[key] = { integerValue: String(value) };
    else fields[key] = { stringValue: String(value || '') };
  });
  return fields;
}

function normalizeFirestoreDoc(doc) {
  const fields = doc.fields || {};
  const valueOf = (value) => {
    if (!value) return '';
    if ('stringValue' in value) return value.stringValue;
    if ('integerValue' in value) return Number(value.integerValue);
    if ('doubleValue' in value) return Number(value.doubleValue);
    if ('booleanValue' in value) return Boolean(value.booleanValue);
    return '';
  };
  const product = {};
  Object.entries(fields).forEach(([key, value]) => {
    product[key] = valueOf(value);
  });
  product.docId = doc.name ? doc.name.split('/').pop() : product.id;
  product.id = product.id || product.docId;
  return product;
}

function diffProduct(current, target) {
  if (!current) return { exists: { before: false, after: true } };
  const diff = {};
  ['id', 'categoria', 'nombre', 'modelo', 'descripcion', 'precioPublico', 'precioMayoreo', 'imagen', 'stock', 'activo', 'orden'].forEach((key) => {
    if (String(current[key] ?? '') !== String(target[key] ?? '')) {
      diff[key] = { before: current[key] ?? '', after: target[key] ?? '' };
    }
  });
  return diff;
}

module.exports = {
  ROOT,
  MASTER_CSV,
  APP_PRODUCTS,
  WEBSITE_PRODUCTS,
  FIRESTORE_QUEUE,
  readMasterProducts,
  appProduct,
  firestoreProduct,
  websiteProduct,
  writeWebsiteProducts,
  readWebsiteProducts,
  makeFirestoreFields,
  normalizeFirestoreDoc,
  diffProduct,
  normalizeMoney,
  websiteCategory,
};
