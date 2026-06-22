const fs = require('fs');
const path = require('path');
const https = require('https');
const {
  ROOT,
  APP_PRODUCTS,
  FIRESTORE_QUEUE,
  readMasterProducts,
  readWebsiteProducts,
  normalizeFirestoreDoc,
  normalizeMoney,
  websiteCategory,
} = require('./product-transformers');

const FIRESTORE_LIST_URL = 'https://firestore.googleapis.com/v1/projects/haode-app/databases/(default)/documents/products?key=AIzaSyDSDQVR_spJjvJxIpLa4k6tqoDoRhTfpPw&pageSize=500';
const REPORT = path.join(ROOT, 'docs', 'reports', 'product-verify-report.md');

function requestJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          if (res.statusCode >= 200 && res.statusCode < 300) resolve(parsed);
          else {
            const error = new Error(parsed?.error?.message || `HTTP ${res.statusCode}`);
            error.statusCode = res.statusCode;
            reject(error);
          }
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

async function readFirestore() {
  const body = await requestJson(FIRESTORE_LIST_URL);
  return (body.documents || []).map(normalizeFirestoreDoc);
}

function byId(items, getId = (item) => item.id) {
  return new Map(items.map((item) => [getId(item), item]).filter(([id]) => id));
}

function websitePrice(product, index) {
  const price = product?.prices?.[index]?.price || '';
  return normalizeMoney(price);
}

function masterImage(row) {
  const value = row.imagen_path || '';
  return value.startsWith('/') ? value : `/${value.replace(/^\/+/, '')}`;
}

function websiteImage(row) {
  return String(row.imagen_path || '').replace(/^\/haode-web\//, '').replace(/^\/+/, '');
}

function existsAsset(filePath) {
  if (!filePath) return false;
  const normalized = filePath.replace(/^\/haode-web\//, '').replace(/^\/+/, '');
  return fs.existsSync(path.join(ROOT, normalized));
}

function addIssue(issues, type, sku, detail) {
  issues.push({ type, sku, detail });
}

function writeReport({ status, masterRows, issues, firestoreReadStatus, queueCount }) {
  const lines = [];
  lines.push('# HAODE Product Verify Report');
  lines.push('');
  lines.push(`Fecha: ${new Date().toISOString()}`);
  lines.push('');
  lines.push('| Métrica | Valor |');
  lines.push('| --- | ---: |');
  lines.push(`| Estado | ${status} |`);
  lines.push(`| Productos master | ${masterRows.length} |`);
  lines.push(`| Incidencias | ${issues.length} |`);
  lines.push(`| Entradas en cola Firestore | ${queueCount} |`);
  lines.push('');
  lines.push('## Firestore');
  lines.push('');
  lines.push(`- Lectura: ${firestoreReadStatus}`);
  lines.push(`- Cola: \`docs/reports/firestore-publish-queue.json\``);
  lines.push('');
  lines.push('## Incidencias');
  if (issues.length) {
    issues.slice(0, 200).forEach((issue) => {
      lines.push(`- ${issue.type} | ${issue.sku}: ${issue.detail}`);
    });
    if (issues.length > 200) lines.push(`- ... ${issues.length - 200} más`);
  } else {
    lines.push('- Ninguna');
  }
  fs.mkdirSync(path.dirname(REPORT), { recursive: true });
  fs.writeFileSync(REPORT, `${lines.join('\n')}\n`, 'utf8');
}

async function main() {
  const masterRows = readMasterProducts();
  const appProducts = JSON.parse(fs.readFileSync(APP_PRODUCTS, 'utf8'));
  const websiteProducts = readWebsiteProducts();
  let firestoreProducts = [];
  let firestoreReadStatus = 'OK';
  try {
    firestoreProducts = await readFirestore();
  } catch (error) {
    firestoreReadStatus = `FAILED_${error.statusCode || 'NETWORK'}`;
  }

  const appById = byId(appProducts);
  const websiteById = byId(websiteProducts);
  const firestoreById = byId(firestoreProducts);
  const issues = [];

  masterRows.forEach((row) => {
    const sku = row.id;
    const app = appById.get(sku);
    const website = websiteById.get(sku);
    const firestore = firestoreById.get(sku);

    if (!app) addIssue(issues, 'APP_MISSING', sku, 'app/products.json 缺少该 SKU');
    if (!website) addIssue(issues, 'WEBSITE_MISSING', sku, 'data/products.generated.js 缺少该 SKU');
    if (!firestore) addIssue(issues, 'FIRESTORE_MISSING', sku, 'Firestore products collection 缺少该 document');

    if (app) {
      if (app.nombre !== row.producto_nombre) addIssue(issues, 'APP_NAME_MISMATCH', sku, `${app.nombre} != ${row.producto_nombre}`);
      if (app.categoria !== row.categoria) addIssue(issues, 'APP_CATEGORY_MISMATCH', sku, `${app.categoria} != ${row.categoria}`);
      if (String(app.precioPublico) !== normalizeMoney(row.precio_publico)) addIssue(issues, 'APP_PUBLIC_PRICE_MISMATCH', sku, `${app.precioPublico} != ${row.precio_publico}`);
      if (String(app.precioMayoreo) !== normalizeMoney(row.precio_mayoreo)) addIssue(issues, 'APP_WHOLESALE_PRICE_MISMATCH', sku, `${app.precioMayoreo} != ${row.precio_mayoreo}`);
      if (app.imagen !== masterImage(row)) addIssue(issues, 'APP_IMAGE_MISMATCH', sku, `${app.imagen} != ${masterImage(row)}`);
    }

    if (website) {
      if (website.name !== row.producto_nombre) addIssue(issues, 'WEBSITE_NAME_MISMATCH', sku, `${website.name} != ${row.producto_nombre}`);
      if (website.category !== websiteCategory(row)) addIssue(issues, 'WEBSITE_CATEGORY_MISMATCH', sku, `${website.category} != ${websiteCategory(row)}`);
      if (websitePrice(website, 0) !== normalizeMoney(row.precio_publico)) addIssue(issues, 'WEBSITE_PUBLIC_PRICE_MISMATCH', sku, `${websitePrice(website, 0)} != ${row.precio_publico}`);
      if (websitePrice(website, 1) !== normalizeMoney(row.precio_mayoreo)) addIssue(issues, 'WEBSITE_WHOLESALE_PRICE_MISMATCH', sku, `${websitePrice(website, 1)} != ${row.precio_mayoreo}`);
      if ((website.images || [])[0] !== websiteImage(row)) addIssue(issues, 'WEBSITE_IMAGE_MISMATCH', sku, `${(website.images || [])[0]} != ${websiteImage(row)}`);
    }

    if (firestore) {
      if (firestore.nombre !== row.producto_nombre) addIssue(issues, 'FIRESTORE_NAME_MISMATCH', sku, `${firestore.nombre} != ${row.producto_nombre}`);
      if (firestore.categoria !== row.categoria) addIssue(issues, 'FIRESTORE_CATEGORY_MISMATCH', sku, `${firestore.categoria} != ${row.categoria}`);
      if (String(firestore.precioPublico) !== normalizeMoney(row.precio_publico)) addIssue(issues, 'FIRESTORE_PUBLIC_PRICE_MISMATCH', sku, `${firestore.precioPublico} != ${row.precio_publico}`);
      if (String(firestore.precioMayoreo) !== normalizeMoney(row.precio_mayoreo)) addIssue(issues, 'FIRESTORE_WHOLESALE_PRICE_MISMATCH', sku, `${firestore.precioMayoreo} != ${row.precio_mayoreo}`);
    }

    if (!existsAsset(row.imagen_path)) addIssue(issues, 'IMAGE_MISSING', sku, row.imagen_path || 'sin imagen_path');
    if (row.video_path && !existsAsset(row.video_path)) addIssue(issues, 'VIDEO_MISSING', sku, row.video_path);
  });

  let queueCount = 0;
  if (fs.existsSync(FIRESTORE_QUEUE)) {
    queueCount = JSON.parse(fs.readFileSync(FIRESTORE_QUEUE, 'utf8')).length;
  }

  const status = issues.length ? (queueCount ? 'QUEUED' : 'BLOCKED') : 'PASS';
  writeReport({ status, masterRows, issues, firestoreReadStatus, queueCount });
  console.log(JSON.stringify({ status, products: masterRows.length, issues: issues.length, queueCount, report: path.relative(ROOT, REPORT) }, null, 2));
  if (status !== 'PASS') process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
