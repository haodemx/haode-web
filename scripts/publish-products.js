const fs = require('fs');
const path = require('path');
const https = require('https');
const {
  ROOT,
  APP_PRODUCTS,
  WEBSITE_PRODUCTS,
  FIRESTORE_QUEUE,
  readMasterProducts,
  appProduct,
  firestoreProduct,
  websiteProduct,
  writeWebsiteProducts,
  makeFirestoreFields,
  normalizeFirestoreDoc,
  diffProduct,
} = require('./product-transformers');

const FIRESTORE_LIST_URL = 'https://firestore.googleapis.com/v1/projects/haode-app/databases/(default)/documents/products?key=AIzaSyDSDQVR_spJjvJxIpLa4k6tqoDoRhTfpPw&pageSize=500';
const FIRESTORE_DOC_URL = 'https://firestore.googleapis.com/v1/projects/haode-app/databases/(default)/documents/products';
const REPORT = path.join(ROOT, 'docs', 'reports', 'product-publish-report.md');

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function backupFile(filePath, backupRoot) {
  if (!fs.existsSync(filePath)) return null;
  const target = path.join(backupRoot, path.basename(filePath));
  ensureDir(target);
  fs.copyFileSync(filePath, target);
  return target;
}

function requestJson(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        let parsed = {};
        try {
          parsed = data ? JSON.parse(data) : {};
        } catch {
          parsed = { raw: data };
        }
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ statusCode: res.statusCode, body: parsed });
        } else {
          const error = new Error(parsed?.error?.message || `HTTP ${res.statusCode}`);
          error.statusCode = res.statusCode;
          error.body = parsed;
          reject(error);
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function readFirestore() {
  const response = await requestJson(FIRESTORE_LIST_URL);
  return (response.body.documents || []).map(normalizeFirestoreDoc);
}

async function writeFirestoreProduct(product, accessToken) {
  const body = JSON.stringify({ fields: makeFirestoreFields(product) });
  return requestJson(`${FIRESTORE_DOC_URL}/${encodeURIComponent(product.id)}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  }, body);
}

function validateMasterRows(rows) {
  const blocked = [];
  const seen = new Set();
  rows.forEach((row) => {
    const requiredFields = ['id', 'producto_nombre', 'categoria', 'modelo', 'precio_publico', 'imagen_path', 'estado'];
    if (!String(row.categoria || '').includes('OLED Diagnóstica')) requiredFields.push('precio_mayoreo');
    const missing = requiredFields
      .filter((field) => !String(row[field] || '').trim());
    if (missing.length) blocked.push({ sku: row.id || '(sin id)', reason: `Campos faltantes: ${missing.join(', ')}` });
    if (seen.has(row.id)) blocked.push({ sku: row.id, reason: 'SKU duplicado en products-master.csv' });
    seen.add(row.id);
  });
  return blocked;
}

function writeReport({ rows, backups, queue, firestoreStatus, blocked }) {
  const lines = [];
  lines.push('# HAODE Product Publish Report');
  lines.push('');
  lines.push(`Fecha: ${new Date().toISOString()}`);
  lines.push('');
  lines.push('| Métrica | Valor |');
  lines.push('| --- | ---: |');
  lines.push(`| Productos leídos desde master | ${rows.length} |`);
  lines.push(`| Bloqueos de master | ${blocked.length} |`);
  lines.push(`| Entradas en cola Firestore | ${queue.length} |`);
  lines.push('');
  lines.push('## Resultado Firestore');
  lines.push('');
  lines.push(`- Estado: ${firestoreStatus}`);
  lines.push(`- Cola: \`docs/reports/firestore-publish-queue.json\``);
  lines.push('');
  lines.push('## Backups');
  lines.push('');
  backups.forEach((backup) => lines.push(`- \`${path.relative(ROOT, backup)}\``));
  if (!backups.length) lines.push('- Sin backups');
  lines.push('');
  lines.push('## Bloqueos');
  if (blocked.length) {
    blocked.forEach((item) => lines.push(`- ${item.sku}: ${item.reason}`));
  } else {
    lines.push('- Ninguno');
  }
  lines.push('');
  lines.push('## Cola Firestore');
  if (queue.length) {
    queue.slice(0, 50).forEach((item) => lines.push(`- ${item.operation}: ${item.sku} (${item.reason})`));
    if (queue.length > 50) lines.push(`- ... ${queue.length - 50} más en la cola JSON`);
  } else {
    lines.push('- Sin pendientes');
  }
  ensureDir(REPORT);
  fs.writeFileSync(REPORT, `${lines.join('\n')}\n`, 'utf8');
}

async function main() {
  const rows = readMasterProducts();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupRoot = path.join(ROOT, 'data', 'backups', 'product-pipeline', timestamp);
  const backups = [
    backupFile(APP_PRODUCTS, backupRoot),
    backupFile(WEBSITE_PRODUCTS, backupRoot),
  ].filter(Boolean);

  const blocked = validateMasterRows(rows);
  if (blocked.length) {
    ensureDir(FIRESTORE_QUEUE);
    fs.writeFileSync(FIRESTORE_QUEUE, '[]\n', 'utf8');
    writeReport({ rows, backups, queue: [], firestoreStatus: 'BLOCKED_MASTER_VALIDATION', blocked });
    console.error(JSON.stringify({ status: 'BLOCKED', blocked: blocked.length, report: path.relative(ROOT, REPORT) }, null, 2));
    process.exit(1);
  }

  const appProducts = rows.map(appProduct);
  const websiteProducts = rows.map(websiteProduct);
  ensureDir(APP_PRODUCTS);
  fs.writeFileSync(APP_PRODUCTS, `${JSON.stringify(appProducts, null, 2)}\n`, 'utf8');
  writeWebsiteProducts(websiteProducts);

  let firestoreProducts = [];
  let firestoreStatus = 'READ_OK_WRITE_QUEUED_NO_TOKEN';
  try {
    firestoreProducts = await readFirestore();
  } catch (error) {
    firestoreStatus = `READ_FAILED_${error.statusCode || 'NETWORK'}`;
  }

  const currentById = new Map(firestoreProducts.map((product) => [product.id, product]));
  const queue = [];
  const token = process.env.FIRESTORE_ACCESS_TOKEN || '';

  for (const [index, row] of rows.entries()) {
    const target = firestoreProduct(row, index + 100);
    const current = currentById.get(target.id);
    const diff = diffProduct(current, target);
    if (!Object.keys(diff).length) continue;

    const queueItem = {
      sku: target.id,
      docId: target.id,
      operation: current ? 'update' : 'create',
      target,
      current: current || null,
      diff,
      reason: token ? 'pending_write' : 'missing_firestore_write_token',
      generatedAt: new Date().toISOString(),
    };

    if (token) {
      try {
        await writeFirestoreProduct(target, token);
        firestoreStatus = 'PUBLISHED_WITH_TOKEN';
        continue;
      } catch (error) {
        queueItem.reason = `firestore_write_failed_${error.statusCode || 'network'}`;
      }
    }
    queue.push(queueItem);
  }

  ensureDir(FIRESTORE_QUEUE);
  fs.writeFileSync(FIRESTORE_QUEUE, `${JSON.stringify(queue, null, 2)}\n`, 'utf8');
  writeReport({ rows, backups, queue, firestoreStatus, blocked });

  const status = queue.length ? 'QUEUED' : 'PUBLISHED';
  console.log(JSON.stringify({
    status,
    products: rows.length,
    app: path.relative(ROOT, APP_PRODUCTS),
    website: path.relative(ROOT, WEBSITE_PRODUCTS),
    firestoreStatus,
    queue: path.relative(ROOT, FIRESTORE_QUEUE),
    queued: queue.length,
    report: path.relative(ROOT, REPORT),
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
