const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const WEBSITE_PRODUCTS = path.join(ROOT, 'data', 'products.generated.js');
const PRODUCT_DIR = path.join(ROOT, 'producto');

const PROTECTED_PRICE_SKUS = new Set([
  'iphone-oled-12mini',
  'iphone-oled-13mini',
  'iphone-oled-15plus',
  'iphone-oled-16',
  'iphone-oled-16plus',
  'samsung-oled-note-9',
  'samsung-oled-s20',
  'samsung-oled-s20-ultra',
  'samsung-oled-s21',
  'samsung-oled-s21-plus',
  'samsung-oled-s22-plus',
  'samsung-oled-s23-plus',
  'samsung-oled-s24-plus',
  'samsung-oled-s9-plus',
  'iphone-incell-12promax',
  'iphone-incell-14',
  'iphone-incell-14plus',
  'iphone-incell-15plus',
  'iphone-oled-13promax',
  'samsung-incell-s20-plus',
  'samsung-incell-s9-plus',
]);

const APPROVED_TIERED_PRICE_PAGES = new Map([
  ['mica-hd', { unitLabel: 'paquete de 50 pzs', unitText: 'paquete de 50 piezas' }],
  ['mica-matte', { unitLabel: 'paquete de 50 pzs', unitText: 'paquete de 50 piezas' }],
  ['mica-privacidad-hd', { unitLabel: 'paquete de 50 pzs', unitText: 'paquete de 50 piezas' }],
  ['mica-privacidad-matte', { unitLabel: 'paquete de 50 pzs', unitText: 'paquete de 50 piezas' }],
  ['x200t-cortadora-micas', { unitLabel: 'equipo X200T', unitText: 'equipo X200T' }],
]);

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

function lowestPriceText(rows) {
  const values = rows
    .map((row) => Number(row.value))
    .filter((value) => Number.isFinite(value) && value > 0);
  if (!values.length) return 'Consultar';
  const lowest = Math.min(...values);
  return `$${lowest.toLocaleString('es-MX')} MXN`;
}

function firstPublicPrice(rows) {
  return rows.find((row) => row.value)?.value || '';
}

function priceTableHtml(rows) {
  const safeRows = rows.length ? rows : [{ quantity: '1 pza', price: 'Consultar' }];
  return safeRows.map((row) => `                <tr>
                  <th scope="row">${escapeHtml(row.quantity)}</th>
                  <td>${escapeHtml(row.price)}</td>
                </tr>`).join('\n');
}

function approvedPriceTableHtml(rows) {
  const labels = ['Precio público', 'Mayoreo 5+', 'Volumen 10+'];
  return rows.slice(0, 3).map((row, index) => `                <tr>
                  <th scope="row">${labels[index]}</th>
                  <td>${escapeHtml(row.price)}</td>
                </tr>`).join('\n');
}

function replaceOfferPrice(text, publicPrice) {
  return text.replace(/"offers":\s*\{[^{}]*\}/g, (offerBlock) => {
    let seenPrice = false;
    let next = offerBlock.replace(
      /(\s*)"price":\s*(?:"[^"]*"|-?\d+(?:\.\d+)?)(,?)/g,
      (match, spacing, comma) => {
        if (seenPrice || !publicPrice) return '';
        seenPrice = true;
        return `${spacing}"price": "${publicPrice}"${comma}`;
      }
    );
    if (!seenPrice && publicPrice && /"priceCurrency":\s*"MXN"/.test(next)) {
      next = next.replace(/("priceCurrency":\s*"MXN",?)/, `$1\n          "price": "${publicPrice}",`);
    }
    return next.replace(/,(\s*)}$/, '$1}');
  });
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

function replacePriceHeading(text, label) {
  return text.replace(
    /<h2>Precios? por (?:volumen|cantidad)<\/h2>(?:\s*<p>Precios por [^<]+\.<\/p>)?/,
    `<h2>Precios por volumen</h2>\n              <p>Precios por ${escapeHtml(label)}.</p>`
  );
}

function tieredOffers(product, rows, config) {
  const pageUrl = `https://haode.com.mx/producto/${product.id}/`;
  const quantityRanges = [
    { minValue: 1, maxValue: 4 },
    { minValue: 5, maxValue: 9 },
    { minValue: 10 },
  ];
  const names = ['Precio público', 'Mayoreo 5+', 'Volumen 10+'];
  return rows.slice(0, 3).map((row, index) => ({
    '@type': 'Offer',
    name: names[index],
    url: pageUrl,
    priceCurrency: 'MXN',
    price: row.value,
    eligibleQuantity: {
      '@type': 'QuantitativeValue',
      ...quantityRanges[index],
      unitText: config.unitText,
    },
    priceSpecification: {
      '@type': 'UnitPriceSpecification',
      priceCurrency: 'MXN',
      price: row.value,
      referenceQuantity: {
        '@type': 'QuantitativeValue',
        value: 1,
        unitText: config.unitText,
      },
    },
  }));
}

function replaceProductOffers(text, product, rows, config) {
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
    productNode.offers = tieredOffers(product, rows, config);
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
  const skippedProtected = [];
  const skippedNoPrice = [];
  const missingPage = [];

  for (const product of products) {
    const file = path.join(PRODUCT_DIR, product.id, 'index.html');
    if (!fs.existsSync(file)) {
      missingPage.push(product.id);
      continue;
    }

    const priceSource = String(product.priceSource || '');
    const hasApprovedCustomerPrice = priceSource.includes('Lista_de_Precios_HAODE_2026_Clientesxlsx.xlsx')
      || priceSource.includes('HAODE_Lista_de_Precios_2026_Clientes_LIMPIA.xlsx');
    if (PROTECTED_PRICE_SKUS.has(product.id) && !hasApprovedCustomerPrice) {
      skippedProtected.push(product.id);
      continue;
    }

    const rows = priceRows(product);
    const publicPrice = firstPublicPrice(rows);
    if (!publicPrice) {
      skippedNoPrice.push(product.id);
      continue;
    }

    let text = fs.readFileSync(file, 'utf8');
    const original = text;
    const approvedTier = APPROVED_TIERED_PRICE_PAGES.get(product.id);
    if (approvedTier && rows.length >= 3) {
      const publicPriceText = `$${Number(publicPrice).toLocaleString('es-MX')} MXN`;
      text = replacePriceNote(text, `Precio público: ${publicPriceText}`);
      text = replacePriceHeading(text, approvedTier.unitLabel);
      text = replacePriceTable(text, approvedPriceTableHtml(rows));
      text = replaceProductOffers(text, product, rows, approvedTier);
    } else {
      const lowest = lowestPriceText(rows);
      text = replacePriceNote(text, lowest);
      text = replacePriceTable(text, priceTableHtml(rows));
      text = replaceOfferPrice(text, publicPrice);
    }

    if (text !== original) {
      fs.writeFileSync(file, text, 'utf8');
      updated.push(product.id);
    }
  }

  console.log(JSON.stringify({
    updated: updated.length,
    skippedProtected: skippedProtected.length,
    skippedNoPrice: skippedNoPrice.length,
    missingPage: missingPage.length,
    updatedSkus: updated,
    skippedProtected,
  }, null, 2));
}

main();
