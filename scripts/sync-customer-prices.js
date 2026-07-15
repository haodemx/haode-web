const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SOURCE_FILE = path.join(ROOT, 'data', 'customer-price-list-2026-07.json');
const WEBSITE_FILE = path.join(ROOT, 'data', 'products.generated.js');
const APP_FILE = path.join(ROOT, 'app', 'products.json');
const MASTER_FILE = path.join(ROOT, 'docs', 'master-data', 'products-master.csv');
const REPORT_FILE = path.join(ROOT, 'docs', 'reports', 'customer-price-sync-2026-07.md');
const APPLY = process.argv.includes('--apply');

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

  return {
    priceClass,
    key: modelKey(product.modelo || product.model || product.nombre || product.name),
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

function updateMasterCsv(changes) {
  const rows = csvRows(fs.readFileSync(MASTER_FILE, 'utf8'));
  const headers = rows[0];
  const idIndex = headers.indexOf('id');
  const publicIndex = headers.indexOf('precio_publico');
  const wholesaleIndex = headers.indexOf('precio_mayoreo');
  const updatedIndex = headers.indexOf('last_updated');
  const byId = new Map(changes.map((change) => [change.id, change]));
  rows.slice(1).forEach((row) => {
    const change = byId.get(row[idIndex]);
    if (!change) return;
    row[publicIndex] = String(change.retail);
    row[wholesaleIndex] = String(change.wholesale5 || change.retail);
    row[updatedIndex] = '2026-07-15';
  });
  return `${rows.map((row) => row.map(csvCell).join(',')).join('\n')}\n`;
}

function main() {
  const source = JSON.parse(fs.readFileSync(SOURCE_FILE, 'utf8'));
  const sourceRows = source.rows.map((row) => ({
    ...row,
    priceClass: priceClassFromSource(row),
    key: modelKey(row.model || row.product),
  }));
  const byIdentity = new Map();
  sourceRows.forEach((row) => {
    const identity = `${row.priceClass}:${row.key}`;
    if (!row.priceClass || !row.key) return;
    if (!byIdentity.has(identity)) byIdentity.set(identity, []);
    byIdentity.get(identity).push(row);
  });

  const { products: websiteProducts, buildText } = readWebsiteProducts();
  const appProducts = JSON.parse(fs.readFileSync(APP_FILE, 'utf8'));
  const report = { website: [], app: [], unmatchedWebsite: [], unmatchedApp: [], ambiguous: [] };
  const masterChanges = new Map();

  function findRow(product, appProduct) {
    const identity = productIdentity(product, appProduct);
    if (!identity.priceClass || !identity.key) return null;
    const candidates = byIdentity.get(`${identity.priceClass}:${identity.key}`) || [];
    if (candidates.length > 1) {
      report.ambiguous.push({ id: product.id, identity, rows: candidates.map((row) => row.sourceRow) });
      return null;
    }
    return candidates[0] || null;
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
    product.priceSource = `${source.sourceWorkbook} · Lista_Precios · fila ${row.sourceRow}`;
    if (before !== after) report.website.push({ id: product.id, row: row.sourceRow, prices: nextPrices });
    masterChanges.set(product.id, { id: product.id, retail: row.prices.retail, wholesale5: row.prices.wholesale5 });
  });

  appProducts.forEach((product) => {
    const row = findRow(product, true);
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
    product.priceSource = `${source.sourceWorkbook} · Lista_Precios · fila ${row.sourceRow}`;
    const after = JSON.stringify({ retail, wholesale5, tiers });
    if (before !== after) report.app.push({ id: product.id, row: row.sourceRow, retail, wholesale5, tiers });
    masterChanges.set(product.id, { id: product.id, retail, wholesale5 });
  });

  if (report.ambiguous.length) {
    console.error(JSON.stringify(report, null, 2));
    throw new Error('Price sync stopped because ambiguous product matches were found.');
  }

  const summary = {
    apply: APPLY,
    sourceRows: sourceRows.length,
    websiteProducts: websiteProducts.length,
    websiteMatched: websiteProducts.length - report.unmatchedWebsite.length,
    websiteChanged: report.website.length,
    appProducts: appProducts.length,
    appMatched: appProducts.length - report.unmatchedApp.length,
    appChanged: report.app.length,
    unmatchedWebsite: report.unmatchedWebsite.length,
    unmatchedApp: report.unmatchedApp.length,
    ambiguous: report.ambiguous.length,
  };

  if (APPLY) {
    fs.writeFileSync(WEBSITE_FILE, `window.HAODE_PRODUCTS_DATA = ${JSON.stringify(websiteProducts, null, 2)};${buildText}`, 'utf8');
    fs.writeFileSync(APP_FILE, `${JSON.stringify(appProducts, null, 2)}\n`, 'utf8');
    fs.writeFileSync(MASTER_FILE, updateMasterCsv([...masterChanges.values()]), 'utf8');
    const lines = [
      '# Customer Price Sync 2026-07',
      '',
      `- Source: ${source.sourceWorkbook} / Lista_Precios`,
      `- Website matched: ${summary.websiteMatched}/${summary.websiteProducts}`,
      `- Website changed: ${summary.websiteChanged}`,
      `- App matched: ${summary.appMatched}/${summary.appProducts}`,
      `- App changed: ${summary.appChanged}`,
      `- Ambiguous matches: ${summary.ambiguous}`,
      '',
      '## Rules',
      '',
      '- Only exact model and quality matches were updated.',
      '- Products absent from the source list were not created or priced.',
      '- Empty source tiers were not invented.',
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
    ];
    fs.writeFileSync(REPORT_FILE, lines.join('\n'), 'utf8');
  }

  console.log(JSON.stringify({ summary, report }, null, 2));
}

main();
