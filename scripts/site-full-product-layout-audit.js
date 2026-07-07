const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const REPORT = path.join(ROOT, 'docs', 'reports', 'site-full-product-layout-audit-2026-07-07.md');
const MASTER_CSV = path.join(ROOT, 'docs', 'master-data', 'products-master.csv');
const WEBSITE_PRODUCTS = path.join(ROOT, 'data', 'products.generated.js');
const APP_PRODUCTS = path.join(ROOT, 'app', 'products.json');
const STATIC_DIR = path.join(ROOT, 'producto');
const SITEMAP = path.join(ROOT, 'sitemap.xml');

const PRICE_CONFIRMATION_REQUIRED = new Set([
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
]);

const PRICE_ANOMALY_REVIEW = new Set([
  'iphone-incell-12promax',
  'iphone-incell-14',
  'iphone-incell-14plus',
  'iphone-incell-15plus',
  'iphone-oled-13promax',
  'samsung-incell-s20-plus',
  'samsung-incell-s9-plus',
]);

const GENERIC_MAIN_IMAGES = new Set([
  'assets/products/iphone-incell/main.jpg',
  'assets/products/iphone-oled/main.jpg',
  'assets/products/samsung-incell/main.jpg',
  'assets/products/samsung-oled/main.jpg',
  'assets/products/oled-diagnostica/main.jpg',
  'assets/products/placeholder.svg',
  '/assets/products/placeholder.svg',
]);

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];
    if (ch === '"') {
      if (quoted && next === '"') {
        cell += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (ch === ',' && !quoted) {
      row.push(cell);
      cell = '';
    } else if ((ch === '\n' || ch === '\r') && !quoted) {
      if (ch === '\r' && next === '\n') i += 1;
      row.push(cell);
      if (row.some((value) => String(value).trim())) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += ch;
    }
  }
  if (cell || row.length) {
    row.push(cell);
    if (row.some((value) => String(value).trim())) rows.push(row);
  }
  const headers = (rows.shift() || []).map((header) => header.replace(/^\uFEFF/, '').trim());
  return rows.map((values) => Object.fromEntries(headers.map((header, index) => [header, String(values[index] || '').trim()])));
}

function readWebsiteProducts() {
  const text = fs.readFileSync(WEBSITE_PRODUCTS, 'utf8');
  return JSON.parse(text.slice(text.indexOf('['), text.lastIndexOf(']') + 1));
}

function money(value) {
  const text = String(value || '').trim();
  if (!text || /^consultar$/i.test(text)) return '';
  const numeric = text.replace(/[^0-9.]/g, '');
  if (!numeric) return '';
  const parsed = Number(numeric);
  return Number.isFinite(parsed) && parsed > 0 ? String(parsed) : '';
}

function normalizeAsset(value) {
  return String(value || '').replace(/^\/haode-web\//, '').replace(/^\/+/, '');
}

function existsAsset(value) {
  const normalized = normalizeAsset(value);
  return Boolean(normalized) && fs.existsSync(path.join(ROOT, normalized));
}

function rel(filePath) {
  return path.relative(ROOT, filePath);
}

function collectStaticSlugs() {
  if (!fs.existsSync(STATIC_DIR)) return [];
  return fs.readdirSync(STATIC_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(STATIC_DIR, entry.name, 'index.html')))
    .map((entry) => entry.name)
    .sort();
}

function priceRows(product) {
  return Array.isArray(product?.prices) ? product.prices.map((row) => ({
    quantity: row.quantity || '',
    price: row.price || '',
    value: money(row.price),
  })) : [];
}

function firstPrice(product) {
  return priceRows(product).find((row) => row.value)?.value || '';
}

function secondPrice(product) {
  return priceRows(product).filter((row) => row.value)[1]?.value || '';
}

function productImage(product) {
  return normalizeAsset((product?.images || [])[0]);
}

function table(items, columns) {
  const lines = [];
  lines.push(`| ${columns.map((c) => c.label).join(' | ')} |`);
  lines.push(`| ${columns.map(() => '---').join(' | ')} |`);
  if (!items.length) {
    lines.push(`| ${columns.map((_, index) => (index === 0 ? '无' : '')).join(' | ')} |`);
    return lines.join('\n');
  }
  items.forEach((item) => {
    lines.push(`| ${columns.map((c) => String(c.value(item) ?? '').replace(/\|/g, '\\|')).join(' | ')} |`);
  });
  return lines.join('\n');
}

function extractFooterAndLayoutFindings() {
  const files = ['index.html', 'productos.html', 'productos/index.html', 'app/index.html', 'contacto/index.html']
    .map((file) => path.join(ROOT, file))
    .filter(fs.existsSync);
  const findings = [];
  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    if (/Centro,\s*Centro/i.test(text)) findings.push(`${rel(file)}: 地址包含重复 Centro, Centro。`);
    if (/©\s*202[0-5]/.test(text)) findings.push(`${rel(file)}: 页脚年份不是 2026。`);
    if (!/assets\/logo\/logo\.png/.test(text)) findings.push(`${rel(file)}: 未确认使用官方 HAODE logo 路径。`);
  }
  const productText = fs.existsSync(path.join(ROOT, 'products.js')) ? fs.readFileSync(path.join(ROOT, 'products.js'), 'utf8') : '';
  if (!/id:\s*'pantallas'/.test(productText)) findings.push('products.js: 分类导航缺少 Pantallas 分组定义。');
  if (!/id:\s*'baterias'|Bater[ií]as/i.test(productText)) findings.push('products.js: 产品页未看到 Baterías 分类；如无真实产品，应标注 por cotización / próximamente。');
  if (!/Productos AI|productos-ai/i.test(productText)) findings.push('products.js: 需复核 Productos AI 导航显示。');
  if (!/Fundas|Micas/i.test(productText)) findings.push('products.js: 需复核 Fundas/Micas 导航显示。');
  return findings;
}

function main() {
  const masterRows = parseCsv(fs.readFileSync(MASTER_CSV, 'utf8')).filter((row) => row.id && row.estado !== 'Inactivo');
  const websiteProducts = readWebsiteProducts();
  const appProducts = JSON.parse(fs.readFileSync(APP_PRODUCTS, 'utf8'));
  const staticSlugs = collectStaticSlugs();
  const sitemapText = fs.existsSync(SITEMAP) ? fs.readFileSync(SITEMAP, 'utf8') : '';

  const websiteById = new Map(websiteProducts.map((product) => [product.id, product]));
  const appById = new Map(appProducts.map((product) => [product.id, product]));
  const masterById = new Map(masterRows.map((row) => [row.id, row]));
  const staticSet = new Set(staticSlugs);

  const websitePresentIssues = masterRows.filter((row) => {
    const value = String(row.website_present || '').toLowerCase();
    return !value || !value.includes('yes') || !websiteById.has(row.id) || !staticSet.has(row.id);
  }).map((row) => ({
    id: row.id,
    website_present: row.website_present || '(空)',
    generated: websiteById.has(row.id) ? 'yes' : 'no',
    static: staticSet.has(row.id) ? 'yes' : 'no',
  }));

  const appPresentIssues = masterRows.filter((row) => {
    const value = String(row.app_present || '').toLowerCase();
    return !value || !value.includes('yes') || !appById.has(row.id);
  }).map((row) => ({
    id: row.id,
    app_present: row.app_present || '(空)',
    app_json: appById.has(row.id) ? 'yes' : 'no',
  }));

  const priceMismatches = [];
  for (const row of masterRows) {
    const website = websiteById.get(row.id);
    const app = appById.get(row.id);
    const masterPublic = money(row.precio_publico);
    const masterWholesale = money(row.precio_mayoreo);
    const websitePublic = firstPrice(website);
    const websiteWholesale = secondPrice(website);
    const appPublic = money(app?.precioPublico);
    const appWholesale = money(app?.precioMayoreo);
    if ((website && masterPublic !== websitePublic) || (website && masterWholesale !== websiteWholesale) || (app && masterPublic !== appPublic) || (app && masterWholesale !== appWholesale)) {
      priceMismatches.push({
        id: row.id,
        master: `${masterPublic || 'Consultar'} / ${masterWholesale || 'Consultar'}`,
        website: `${websitePublic || 'Consultar'} / ${websiteWholesale || 'Consultar'}`,
        app: `${appPublic || 'Consultar'} / ${appWholesale || 'Consultar'}`,
      });
    }
  }

  const imageMissing = [];
  const placeholderImages = [];
  const videoMissing = [];
  const detailConsultarRisks = [];
  const jsonLdPriceRisks = [];
  for (const product of websiteProducts) {
    const images = product.images || [];
    const image = productImage(product);
    if (!images.length || !existsAsset(image)) imageMissing.push({ id: product.id, image: image || '(空)' });
    if (images.some((item) => GENERIC_MAIN_IMAGES.has(normalizeAsset(item)) || /placeholder|pendiente/i.test(String(item)))) {
      placeholderImages.push({ id: product.id, image: images.join(', ') });
    }
    if (!Array.isArray(product.videos) || product.videos.length === 0) videoMissing.push({ id: product.id, reason: 'data/products.generated.js videos 为空' });
    const file = path.join(STATIC_DIR, product.id, 'index.html');
    if (fs.existsSync(file)) {
      const text = fs.readFileSync(file, 'utf8');
      const hasRealPrice = priceRows(product).some((row) => row.value);
      if (hasRealPrice && /data-detail-price>Consultar<|<td>Consultar<\/td>/.test(text)) {
        detailConsultarRisks.push({ id: product.id, page: rel(file), price: priceRows(product).filter((row) => row.value).map((row) => `${row.quantity} ${row.price}`).join('; ') });
      }
      if (hasRealPrice && /"@type":\s*"Offer"[\s\S]*?"priceCurrency":\s*"MXN"(?![\s\S]{0,120}"price")/.test(text)) {
        jsonLdPriceRisks.push({ id: product.id, page: rel(file), publicPrice: firstPrice(product) || 'Consultar' });
      }
    }
  }

  const focusConfirmRows = [...PRICE_CONFIRMATION_REQUIRED].map((id) => {
    const row = masterById.get(id);
    const website = websiteById.get(id);
    const app = appById.get(id);
    return {
      id,
      master_public: row ? money(row.precio_publico) || '缺少/待确认' : 'Master 缺少',
      master_wholesale: row ? money(row.precio_mayoreo) || '缺少/待确认' : 'Master 缺少',
      website: website ? `${firstPrice(website) || 'Consultar'} / ${secondPrice(website) || 'Consultar'}` : '网站缺少',
      app: app ? `${money(app.precioPublico) || 'Consultar'} / ${money(app.precioMayoreo) || 'Consultar'}` : 'App 缺少',
      need: '老板确认公开价、批发价、是否允许上架',
    };
  });

  const anomalyRows = [...PRICE_ANOMALY_REVIEW].map((id) => {
    const row = masterById.get(id);
    const website = websiteById.get(id);
    const app = appById.get(id);
    const masterPair = row ? `${money(row.precio_publico) || 'Consultar'} / ${money(row.precio_mayoreo) || 'Consultar'}` : 'Master 缺少';
    const appPair = app ? `${money(app.precioPublico) || 'Consultar'} / ${money(app.precioMayoreo) || 'Consultar'}` : 'App 缺少';
    const websitePair = website ? `${firstPrice(website) || 'Consultar'} / ${secondPrice(website) || 'Consultar'}` : '网站缺少';
    const suggestion = row && app && masterPair === appPair && websitePair !== masterPair
      ? '可生成修复建议：Master/App 一致，网站不同；以 Master/App 为准，但需确认非促销价。'
      : '只记录，不建议自动改价。';
    return { id, master: masterPair, app: appPair, website: websitePair, suggestion };
  });

  const appJs = fs.existsSync(path.join(ROOT, 'app', 'app.js')) ? fs.readFileSync(path.join(ROOT, 'app', 'app.js'), 'utf8') : '';
  const serviceWorker = fs.existsSync(path.join(ROOT, 'service-worker.js')) ? fs.readFileSync(path.join(ROOT, 'service-worker.js'), 'utf8') : '';
  const appRisks = [];
  if (/const PRODUCTS_JSON_URL = "\/app\/products\.json"/.test(appJs)) appRisks.push('app/app.js 使用根路径 /app/products.json；haode.com.mx 正常，GitHub Pages /haode-web/app/ 路径存在加载风险。');
  if (/const SERVICE_WORKER_URL = "\/service-worker\.js"/.test(appJs)) appRisks.push('app/app.js 使用根路径 /service-worker.js；GitHub Pages 项目路径下注册 service worker 存在风险。');
  if (!/products\.json/.test(serviceWorker)) appRisks.push('service-worker.js 未预缓存 products.json，但 fetch 对 products.json 使用 network-first，旧数据风险较低。');

  const sitemapProducts = (sitemapText.match(/\/producto\/[^/]+\/?/g) || []).length;
  const layoutFindings = extractFooterAndLayoutFindings();

  const lines = [];
  lines.push('# HAODE 官网完整产品、价格、图片、APP 和版面审查报告');
  lines.push('');
  lines.push(`日期：2026-07-07`);
  lines.push(`审查路径：\`${ROOT}\``);
  lines.push('');
  lines.push('## 汇总');
  lines.push('');
  lines.push('| 指标 | 数量 |');
  lines.push('| --- | ---: |');
  lines.push(`| Master 产品总数 | ${masterRows.length} |`);
  lines.push(`| 网站产品总数 data/products.generated.js | ${websiteProducts.length} |`);
  lines.push(`| App 产品总数 app/products.json | ${appProducts.length} |`);
  lines.push(`| 静态详情页数量 producto/*/index.html | ${staticSlugs.length} |`);
  lines.push(`| sitemap 产品 URL 数量 | ${sitemapProducts} |`);
  lines.push('');
  lines.push('## website_present 为空或异常');
  lines.push(table(websitePresentIssues, [
    { label: 'SKU', value: (x) => x.id },
    { label: 'Master website_present', value: (x) => x.website_present },
    { label: '网站数据', value: (x) => x.generated },
    { label: '静态页', value: (x) => x.static },
  ]));
  lines.push('');
  lines.push('## app_present 为空或异常');
  lines.push(table(appPresentIssues, [
    { label: 'SKU', value: (x) => x.id },
    { label: 'Master app_present', value: (x) => x.app_present },
    { label: 'app/products.json', value: (x) => x.app_json },
  ]));
  lines.push('');
  lines.push('## 价格不一致产品');
  lines.push(table(priceMismatches, [
    { label: 'SKU', value: (x) => x.id },
    { label: 'Master 公开/批发', value: (x) => x.master },
    { label: '网站 公开/批发', value: (x) => x.website },
    { label: 'App 公开/批发', value: (x) => x.app },
  ]));
  lines.push('');
  lines.push('## 图片不存在产品');
  lines.push(table(imageMissing, [
    { label: 'SKU', value: (x) => x.id },
    { label: '图片路径', value: (x) => x.image },
  ]));
  lines.push('');
  lines.push('## 使用 placeholder / 通用图 / 待确认图的产品');
  lines.push(table(placeholderImages, [
    { label: 'SKU', value: (x) => x.id },
    { label: '图片路径', value: (x) => x.image },
  ]));
  lines.push('');
  lines.push('## 视频缺失产品');
  lines.push(table(videoMissing, [
    { label: 'SKU', value: (x) => x.id },
    { label: '原因', value: (x) => x.reason },
  ]));
  lines.push('');
  lines.push('## 产品详情页显示 Consultar 的风险');
  lines.push(table(detailConsultarRisks, [
    { label: 'SKU', value: (x) => x.id },
    { label: '页面', value: (x) => x.page },
    { label: '已有价格', value: (x) => x.price },
  ]));
  lines.push('');
  lines.push('## JSON-LD Product Offer 价格风险');
  lines.push(table(jsonLdPriceRisks, [
    { label: 'SKU', value: (x) => x.id },
    { label: '页面', value: (x) => x.page },
    { label: '公开价', value: (x) => x.publicPrice },
  ]));
  lines.push('');
  lines.push('## 14 个必须先核价产品');
  lines.push('不要自动上架、不要自动补价格。需要老板确认公开价、批发价、是否允许公开展示。');
  lines.push('');
  lines.push(table(focusConfirmRows, [
    { label: 'SKU', value: (x) => x.id },
    { label: 'Master 公开价', value: (x) => x.master_public },
    { label: 'Master 批发价', value: (x) => x.master_wholesale },
    { label: '网站', value: (x) => x.website },
    { label: 'App', value: (x) => x.app },
    { label: '需要确认', value: (x) => x.need },
  ]));
  lines.push('');
  lines.push('## 7 个价格异常重点核查产品');
  lines.push('本报告只生成建议，不盲目改价，不覆盖促销价。');
  lines.push('');
  lines.push(table(anomalyRows, [
    { label: 'SKU', value: (x) => x.id },
    { label: 'Master', value: (x) => x.master },
    { label: 'App', value: (x) => x.app },
    { label: '网站', value: (x) => x.website },
    { label: '建议', value: (x) => x.suggestion },
  ]));
  lines.push('');
  lines.push('## APP 页面产品加载风险');
  if (appRisks.length) appRisks.forEach((item) => lines.push(`- ${item}`));
  else lines.push('- 未发现明显加载风险。');
  lines.push('');
  lines.push('## 首页、产品页、APP 页、联系信息、页脚、分类导航版面问题');
  if (layoutFindings.length) layoutFindings.forEach((item) => lines.push(`- ${item}`));
  else lines.push('- 静态规则扫描未发现明显问题；仍需浏览器截图复核 390px、430px、768px、1440px。');
  lines.push('');
  lines.push('## 数据源检查范围');
  [
    MASTER_CSV,
    WEBSITE_PRODUCTS,
    APP_PRODUCTS,
    path.join(ROOT, 'products.js'),
    STATIC_DIR,
    path.join(ROOT, 'productos.html'),
    path.join(ROOT, 'app', 'index.html'),
    SITEMAP,
  ].forEach((file) => lines.push(`- \`${rel(file)}\``));
  lines.push('');
  lines.push('## 结论');
  lines.push('- Master、网站、App 当前不是完全同量同价：需要继续治理 Master 与已生成网站/App 数据。');
  lines.push('- 静态详情页首屏价格 fallback 是真实风险：有公开价格的产品不应在无 JS 或 JS 慢加载时显示 Consultar。');
  lines.push('- 图片缺失或疑似通用图只报告，不允许用其他型号图片替代。');
  lines.push('- APP 正常情况可从 app/products.json 加载产品；GitHub Pages 项目路径需要路径修复后再复测。');

  fs.mkdirSync(path.dirname(REPORT), { recursive: true });
  fs.writeFileSync(REPORT, `${lines.join('\n')}\n`, 'utf8');
  console.log(JSON.stringify({
    report: rel(REPORT),
    masterProducts: masterRows.length,
    websiteProducts: websiteProducts.length,
    appProducts: appProducts.length,
    priceMismatches: priceMismatches.length,
    imageMissing: imageMissing.length,
    placeholderImages: placeholderImages.length,
    videoMissing: videoMissing.length,
    detailConsultarRisks: detailConsultarRisks.length,
    appRisks: appRisks.length,
  }, null, 2));
}

main();
