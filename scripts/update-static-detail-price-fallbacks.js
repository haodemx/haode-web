const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const WEBSITE_PRODUCTS = path.join(ROOT, 'data', 'products.generated.js');
const PRODUCT_DIR = path.join(ROOT, 'producto');

function readWebsiteProducts() {
  const text = fs.readFileSync(WEBSITE_PRODUCTS, 'utf8');
  return JSON.parse(text.slice(text.indexOf('['), text.lastIndexOf(']') + 1));
}

function money(value) {
  const text = String(value || '').trim();
  if (!text || /^consultar$/i.test(text)) return '';
  const numeric = text.replace(/[^0-9.]/g, '');
  const parsed = Number(numeric);
  return Number.isFinite(parsed) && parsed > 0 ? String(parsed) : '';
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function priceRows(product) {
  return Array.isArray(product.prices)
    ? product.prices.map((row) => ({
      quantity: row.quantity || '',
      price: row.price || 'Consultar',
      value: money(row.price),
    }))
    : [];
}

function firstPublicPrice(rows) {
  return rows.find((row) => row.value)?.value || '';
}

function priceTableHtml(rows) {
  const safeRows = rows.length ? rows : [{ quantity: 'Menudeo', price: 'Consultar' }];
  return safeRows.map((row) => `                <tr>
                  <th scope="row">${escapeHtml(row.quantity)}</th>
                  <td>${escapeHtml(row.price)}</td>
                </tr>`).join('\n');
}

function hasApprovedCustomerPrice(product) {
  const priceSource = String(product?.priceSource || '');
  return priceSource.includes('HAODE_Lista_de_Precios_2026-09-24.xlsx');
}

function isScreenProduct(product) {
  return /^(?:iphone-|samsung-|oled-diagnostica$)/.test(String(product?.category || ''));
}

function updateStaticPage(file, product, rows) {
  let text = fs.readFileSync(file, 'utf8');
  const original = text;
  const publicPrice = firstPublicPrice(rows);
  const retailPriceText = `$${Number(publicPrice).toLocaleString('es-MX')} MXN`;
  text = replacePriceNote(text, `Menudeo: ${retailPriceText}`);
  text = replacePriceHeading(text);
  text = replacePriceTable(text, priceTableHtml(rows));
  text = replaceProductOffers(text, product, rows);
  text = replaceProductQuality(text, product);
  if (isScreenProduct(product)) text = replaceProductDescription(text, product);

  if (text === original) return false;
  fs.writeFileSync(file, text, 'utf8');
  return true;
}

function updateStaticInventoryCopy(file) {
  const original = fs.readFileSync(file, 'utf8');
  const text = original
    .replace(/Pantalla con stock local en CDMX\./g, 'Pantalla con inventario por confirmar en ERP.')
    .replace(/<span>Stock en México bajo confirmación<\/span>/g, '<span>Inventario ERP por confirmar</span>')
    .replace(/Confirma stock en México y precio por cantidad por WhatsApp\./g, 'Confirma inventario ERP y precio por cantidad por WhatsApp.')
    .replace(/<strong>Stock en México<\/strong><small>Disponibilidad bajo confirmación<\/small>/g, '<strong>Inventario ERP</strong><small>Disponibilidad bajo confirmación</small>');
  if (text === original) return false;
  fs.writeFileSync(file, text, 'utf8');
  return true;
}

function replaceProductQuality(text, product) {
  const quality = escapeHtml(product.quality || '');
  if (!quality) return text;
  return text
    .replace(
      /<p class="detail-meta" data-detail-quality>.*?<\/p>/,
      `<p class="detail-meta" data-detail-quality>${quality}</p>`
    )
    .replace(/La calidad registrada es [^;]+;/g, `La calidad registrada es ${quality};`);
}

function replaceProductDescription(text, product) {
  const description = escapeHtml(product.description || '');
  if (!description) return text;
  return text.replace(
    /<p class="detail-description" data-detail-description>.*?<\/p>/,
    `<p class="detail-description" data-detail-description>${description}</p>`
  );
}

function replacePriceNote(text, lowest) {
  return text.split('\n').map((line) => {
    if (!line.includes('data-detail-price')) return line;
    return line.replace(
      /<p class="detail-price-note" data-detail-price>.*?<\/p>/,
      `<p class="detail-price-note" data-detail-price>${escapeHtml(lowest)}</p>`
    );
  }).join('\n');
}

function replacePriceHeading(text) {
  return text.replace(
    /<h2>Precios? por (?:volumen|cantidad)<\/h2>(?:\s*<p>Precios por [^<]+\.<\/p>)?/,
    '<h2>Niveles de precio</h2>\n              <p>Mayoreo, Caja y VIP se confirman por WhatsApp; no se aplican automáticamente por cantidad.</p>'
  );
}

function namedOffers(product, rows) {
  const pageUrl = `https://haode.com.mx/producto/${product.id}/`;
  return rows.map((row) => ({
    '@type': 'Offer',
    name: row.quantity,
    url: pageUrl,
    priceCurrency: 'MXN',
    price: row.value,
  }));
}

function replaceProductOffers(text, product, rows) {
  return text.replace(/<script([^>]*type=["']application\/ld\+json["'][^>]*)>([\s\S]*?)<\/script>/gi, (full, attrs, jsonText) => {
    let data;
    try {
      data = JSON.parse(jsonText);
    } catch {
      return full;
    }

    const nodes = Array.isArray(data?.['@graph']) ? data['@graph'] : [data];
    const productNode = nodes.find((node) => node?.['@type'] === 'Product');
    if (!productNode) return full;
    productNode.offers = namedOffers(product, rows);
    return `<script${attrs}>${JSON.stringify(data, null, 2)}\n    </script>`;
  });
}

function replacePriceTable(text, table) {
  const start = text.indexOf('<tbody data-detail-price-body>');
  if (start < 0) return text;
  const end = text.indexOf('</tbody>', start);
  if (end < 0) return text;
  const before = text.slice(0, start);
  const after = text.slice(end + '</tbody>'.length);
  return `${before}<tbody data-detail-price-body>\n${table}\n              </tbody>${after}`;
}

function main() {
  const products = readWebsiteProducts();
  const updated = [];
  const skippedUnmatchedSource = [];
  const skippedNoPrice = [];
  const missingPage = [];
  const updatedAliases = [];
  const inventoryCopyUpdated = [];
  const processedFiles = new Set();
  const productsById = new Map(products.map((product) => [product.id, product]));

  for (const product of products) {
    const file = path.join(PRODUCT_DIR, product.id, 'index.html');
    if (!fs.existsSync(file)) {
      missingPage.push(product.id);
      continue;
    }
    processedFiles.add(file);
    if (updateStaticInventoryCopy(file)) inventoryCopyUpdated.push(product.id);

    if (!hasApprovedCustomerPrice(product)) {
      skippedUnmatchedSource.push(product.id);
      continue;
    }

    const rows = priceRows(product);
    const publicPrice = firstPublicPrice(rows);
    if (!publicPrice) {
      skippedNoPrice.push(product.id);
      continue;
    }

    if (updateStaticPage(file, product, rows)) {
      updated.push(product.id);
    }
  }

  for (const entry of fs.readdirSync(PRODUCT_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const file = path.join(PRODUCT_DIR, entry.name, 'index.html');
    if (processedFiles.has(file) || !fs.existsSync(file)) continue;

    const text = fs.readFileSync(file, 'utf8');
    const canonicalMatch = text.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']https:\/\/haode\.com\.mx\/producto\/([^/"']+)\/?["']/i)
      || text.match(/<link[^>]+href=["']https:\/\/haode\.com\.mx\/producto\/([^/"']+)\/?["'][^>]+rel=["']canonical["']/i);
    if (!canonicalMatch) continue;

    if (updateStaticInventoryCopy(file)) inventoryCopyUpdated.push(entry.name);

    const product = productsById.get(canonicalMatch[1]);
    if (!product || !hasApprovedCustomerPrice(product)) continue;
    const rows = priceRows(product);
    if (!firstPublicPrice(rows)) continue;
    if (updateStaticPage(file, product, rows)) updatedAliases.push(entry.name);
  }

  console.log(JSON.stringify({
    updated: updated.length,
    skippedUnmatchedSource: skippedUnmatchedSource.length,
    skippedNoPrice: skippedNoPrice.length,
    missingPage: missingPage.length,
    updatedAliases: updatedAliases.length,
    inventoryCopyUpdated: inventoryCopyUpdated.length,
    updatedSkus: updated,
    skippedUnmatchedSource,
    updatedAliasRoutes: updatedAliases,
    inventoryCopyUpdatedRoutes: inventoryCopyUpdated,
  }, null, 2));
}

main();
