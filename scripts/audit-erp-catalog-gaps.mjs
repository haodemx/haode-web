import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_CATALOG_URL = 'https://erp.haode.com.mx/api/public/catalog';

function normalizeCatalog(payload) {
  if (Array.isArray(payload)) return payload;
  return Array.isArray(payload?.products) ? payload.products : [];
}

export function auditCatalog(payload) {
  const products = normalizeCatalog(payload);
  const skuCounts = new Map();

  products.forEach((product) => {
    const sku = String(product.sku || '').trim();
    if (sku) skuCounts.set(sku, (skuCounts.get(sku) || 0) + 1);
  });

  const select = (predicate) => products.filter(predicate).map((product) => ({
    sku: product.sku || '',
    name: product.public_name_es || '',
    category: product.category || '',
    salesAvailable: product.sales_available === true,
    stockStatus: product.stock_status || '',
  }));

  return {
    generatedAt: new Date().toISOString(),
    total: products.length,
    salesAvailable: products.filter((product) => product.sales_available === true).length,
    pricePending: select((product) => !Number(product.public_price_mxn) || product.price_status === 'PRICE_PENDING'),
    missingImage: select((product) => !String(product.image_url || '').trim()),
    outOfStock: select((product) => product.stock_status === 'out_of_stock'),
    unavailable: select((product) => product.sales_available !== true),
    duplicateSkus: [...skuCounts.entries()]
      .filter(([, count]) => count > 1)
      .map(([sku, count]) => ({ sku, count })),
  };
}

export function formatMarkdown(report, source) {
  const section = (title, rows) => {
    const body = rows.length
      ? rows.map((row) => `| ${row.sku} | ${row.name} | ${row.category} | ${row.stockStatus || '-'} |`).join('\n')
      : '| - | Sin pendientes | - | - |';
    return `## ${title}\n\n| SKU | Producto | Categoría | Inventario |\n|---|---|---|---|\n${body}`;
  };

  return [
    '# Auditoría del catálogo ERP',
    '',
    `- Fuente: ${source}`,
    `- Generado: ${report.generatedAt}`,
    `- Productos: ${report.total}`,
    `- Disponibles para venta: ${report.salesAvailable}`,
    `- Precios pendientes: ${report.pricePending.length}`,
    `- Imágenes pendientes: ${report.missingImage.length}`,
    `- Agotados: ${report.outOfStock.length}`,
    `- No disponibles para venta: ${report.unavailable.length}`,
    `- SKU duplicados: ${report.duplicateSkus.length}`,
    '',
    section('Imágenes pendientes', report.missingImage),
    '',
    section('Precios pendientes', report.pricePending),
    '',
    section('Productos no disponibles', report.unavailable),
    '',
    '## SKU duplicados',
    '',
    report.duplicateSkus.length
      ? report.duplicateSkus.map((row) => `- ${row.sku}: ${row.count}`).join('\n')
      : '- Sin duplicados.',
    '',
  ].join('\n');
}

async function main() {
  const outputIndex = process.argv.indexOf('--output');
  const outputPath = outputIndex >= 0 ? process.argv[outputIndex + 1] : '';
  const source = process.env.ERP_PUBLIC_CATALOG_URL || DEFAULT_CATALOG_URL;
  const response = await fetch(source, { headers: { accept: 'application/json' } });
  if (!response.ok) throw new Error(`Catálogo ERP ${response.status}`);

  const report = auditCatalog(await response.json());
  const markdown = formatMarkdown(report, source);
  if (outputPath) {
    const resolved = path.resolve(outputPath);
    await fs.mkdir(path.dirname(resolved), { recursive: true });
    await fs.writeFile(resolved, markdown, 'utf8');
    console.log(`Auditoría guardada: ${resolved}`);
  } else {
    console.log(markdown);
  }

  if (report.duplicateSkus.length) process.exitCode = 1;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(`No se pudo auditar el catálogo ERP: ${error.message}`);
    process.exitCode = 1;
  });
}
