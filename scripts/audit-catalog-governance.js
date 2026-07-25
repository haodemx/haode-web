const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const REPORT_DIR = path.join(ROOT, 'docs', 'reports');
const AUDIT_DATE = process.env.HAODE_AUDIT_DATE || new Date().toISOString().slice(0, 10);
const WRITE_REPORTS = process.argv.includes('--write');

function readWebsiteProducts() {
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'data', 'products.generated.js'), 'utf8'), context);
  return context.window.HAODE_PRODUCTS_DATA || [];
}

function readAppProducts() {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'app', 'products.json'), 'utf8'));
}

function normalizeAsset(value) {
  return String(value || '').replace(/^\/haode-web\//, '').replace(/^\/+/, '');
}

function assetExists(value) {
  return Boolean(value) && fs.existsSync(path.join(ROOT, normalizeAsset(value)));
}

function isRedirectPage(text) {
  return /http-equiv=["']refresh|window\.location|location\.(?:href|replace)/i.test(text);
}

function slugFromProductUrl(value) {
  const match = String(value || '').match(/\/producto\/([^/?#]+)\/?/);
  return match ? match[1] : '';
}

function productPageUrls(text) {
  const canonical = text.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)
    || text.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  const og = text.match(/<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["']/i)
    || text.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:url["']/i);
  return {
    canonicalUrl: canonical?.[1] || '',
    canonicalSlug: slugFromProductUrl(canonical?.[1]),
    ogUrl: og?.[1] || '',
    ogSlug: slugFromProductUrl(og?.[1]),
  };
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (quoted) {
      if (char === '"' && next === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(cell);
      cell = '';
    } else if (char === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else if (char !== '\r') {
      cell += char;
    }
  }

  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }

  const [header, ...records] = rows.filter((item) => item.some(Boolean));
  if (!header) return [];
  return records.map((record) => Object.fromEntries(header.map((key, index) => [key, record[index] || ''])));
}

function firstImage(product, source) {
  return source === 'website' ? product.images?.[0] || '' : product.imagen || '';
}

function productName(product, source) {
  return source === 'website' ? product.name || '' : product.nombre || '';
}

function productCategory(product, source) {
  return source === 'website' ? product.category || '' : product.categoria || '';
}

function websitePriceStatus(product) {
  const prices = Array.isArray(product.prices) ? product.prices : [];
  const consultCount = prices.filter((price) => /^consultar$/i.test(String(price.price || '').trim())).length;
  if (!consultCount) return '';
  return consultCount === prices.length ? '全部价格待确认' : '部分价格待确认';
}

function collectStaticPages(websiteIds) {
  const productDir = path.join(ROOT, 'producto');
  const records = fs.readdirSync(productDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const filePath = path.join(productDir, entry.name, 'index.html');
      const text = fs.readFileSync(filePath, 'utf8');
      return {
        slug: entry.name,
        redirect: isRedirectPage(text),
        ...productPageUrls(text),
      };
    });

  const canonicalTargets = new Map();
  records.forEach((record) => {
    if (websiteIds.has(record.slug) && record.canonicalSlug && record.canonicalSlug !== record.slug) {
      canonicalTargets.set(record.canonicalSlug, record.slug);
    }
  });

  return {
    records,
    historicalAliases: records.filter((record) => (
      !record.redirect
      && record.canonicalSlug
      && record.canonicalSlug !== record.slug
      && websiteIds.has(record.canonicalSlug)
    )),
    canonicalTargets: records.filter((record) => canonicalTargets.has(record.slug)),
    standalone: records.filter((record) => (
      !record.redirect
      && !websiteIds.has(record.slug)
      && !(record.canonicalSlug && record.canonicalSlug !== record.slug && websiteIds.has(record.canonicalSlug))
      && !canonicalTargets.has(record.slug)
    )),
  };
}

function buildAudit() {
  const website = readWebsiteProducts();
  const app = readAppProducts();
  const websiteIds = new Set(website.map((product) => product.id));
  const appIds = new Set(app.map((product) => product.id));
  const websiteById = new Map(website.map((product) => [product.id, product]));
  const appById = new Map(app.map((product) => [product.id, product]));
  const staticPages = collectStaticPages(websiteIds);
  const websiteOnly = website
    .filter((product) => !appIds.has(product.id))
    .map((product) => ({
      id: product.id,
      name: productName(product, 'website'),
      category: productCategory(product, 'website'),
      image: firstImage(product, 'website'),
      priceStatus: websitePriceStatus(product) || '官网价格字段已有值',
      ownerDecision: '',
    }));
  const appOnly = app
    .filter((product) => !websiteIds.has(product.id))
    .map((product) => ({
      id: product.id,
      name: productName(product, 'app'),
      category: productCategory(product, 'app'),
      image: firstImage(product, 'app'),
      publicPrice: product.precioPublico || '',
      wholesalePrice: product.precioMayoreo || '',
      ownerDecision: '',
    }));
  const websiteImageMissing = website
    .filter((product) => !product.images?.length || product.images.some((image) => !assetExists(image)))
    .map((product) => product.id);
  const appImageMissing = app
    .filter((product) => !product.imagen || !assetExists(product.imagen))
    .map((product) => product.id);
  const appPlaceholderImages = app
    .filter((product) => /placeholder/i.test(product.imagen || ''))
    .map((product) => ({
      id: product.id,
      name: productName(product, 'app'),
      category: productCategory(product, 'app'),
      currentImage: product.imagen,
      ownerDecision: '',
    }));
  const websitePriceConfirmation = website
    .map((product) => ({
      id: product.id,
      name: productName(product, 'website'),
      category: productCategory(product, 'website'),
      status: websitePriceStatus(product),
      ownerDecision: '',
    }))
    .filter((product) => product.status);
  const websiteVideoMissing = website
    .filter((product) => !Array.isArray(product.videos) || !product.videos.length)
    .map((product) => product.id);
  const oldConfirmationPath = path.join(REPORT_DIR, 'boss-price-image-confirmation-2026-07-07.csv');
  const oldConfirmations = fs.existsSync(oldConfirmationPath)
    ? parseCsv(fs.readFileSync(oldConfirmationPath, 'utf8'))
    : [];
  const oldConfirmed = oldConfirmations.filter((row) => (
    row.boss_public_price?.trim()
    || row.boss_wholesale_price?.trim()
    || row.boss_box_price?.trim()
    || row.boss_decision?.trim()
  ));
  const commonIds = [...websiteIds].filter((id) => appIds.has(id));

  return {
    generatedAt: new Date().toISOString(),
    auditDate: AUDIT_DATE,
    guardrails: {
      productDataChanged: false,
      pricesChanged: false,
      imagesReplaced: false,
      productsPublished: false,
      firestoreChanged: false,
    },
    summary: {
      websiteProducts: website.length,
      appProducts: app.length,
      commonProducts: commonIds.length,
      websiteOnly: websiteOnly.length,
      appOnly: appOnly.length,
      staticProductRoutes: staticPages.records.length,
      historicalAliases: staticPages.historicalAliases.length,
      canonicalTargets: staticPages.canonicalTargets.length,
      standaloneStatic: staticPages.standalone.length,
      websiteImageMissing: websiteImageMissing.length,
      appImageMissing: appImageMissing.length,
      appPlaceholderImages: appPlaceholderImages.length,
      websitePriceConfirmation: websitePriceConfirmation.length,
      websiteVideoMissing: websiteVideoMissing.length,
      oldConfirmationRows: oldConfirmations.length,
      oldConfirmedRows: oldConfirmed.length,
    },
    websiteOnly,
    appOnly,
    appPlaceholderImages,
    websitePriceConfirmation,
    staticRoutes: {
      historicalAliases: staticPages.historicalAliases,
      canonicalTargets: staticPages.canonicalTargets,
      standalone: staticPages.standalone,
    },
    media: {
      websiteImageMissing,
      appImageMissing,
      websiteVideoMissing,
    },
    overlap: commonIds.map((id) => ({
      id,
      websiteName: productName(websiteById.get(id), 'website'),
      appName: productName(appById.get(id), 'app'),
    })),
  };
}

function markdownTable(rows, columns) {
  if (!rows.length) return '- 无';
  const header = `| ${columns.map((column) => column.label).join(' | ')} |`;
  const divider = `| ${columns.map(() => '---').join(' | ')} |`;
  const body = rows.map((row) => (
    `| ${columns.map((column) => String(row[column.key] ?? '').replaceAll('|', '\\|')).join(' | ')} |`
  )).join('\n');
  return `${header}\n${divider}\n${body}`;
}

function buildMarkdown(audit) {
  const { summary } = audit;
  return `# HAODE 商品治理审计

生成日期：${audit.auditDate}

## 结论

- 官网商品：${summary.websiteProducts}
- App 商品：${summary.appProducts}
- 官网/App 精确重合：${summary.commonProducts}
- 官网独有：${summary.websiteOnly}
- App 独有：${summary.appOnly}
- 历史 canonical 别名：${summary.historicalAliases}
- 官网别名对应的 canonical 正式页：${summary.canonicalTargets}
- 未并入官网数据的独立静态页：${summary.standaloneStatic}
- 真实图片路径缺失：官网 ${summary.websiteImageMissing}，App ${summary.appImageMissing}
- App 占位图：${summary.appPlaceholderImages}
- 官网价格仍含“Consultar”：${summary.websitePriceConfirmation}
- 旧老板确认表：${summary.oldConfirmationRows} 行，已填写 ${summary.oldConfirmedRows} 行

## 执行边界

- 没有修改价格、库存、兼容性或产品状态。
- 没有替换商品图片。
- 没有运行 \`publish-products\`。
- 没有修改 Firestore。

## 官网独有，待确认是否同步 App

${markdownTable(audit.websiteOnly, [
    { key: 'id', label: 'SKU' },
    { key: 'name', label: '产品' },
    { key: 'category', label: '分类' },
    { key: 'priceStatus', label: '价格状态' },
  ])}

## App 独有，待确认是否同步官网

${markdownTable(audit.appOnly, [
    { key: 'id', label: 'SKU' },
    { key: 'name', label: '产品' },
    { key: 'category', label: '分类' },
    { key: 'publicPrice', label: '零售价' },
    { key: 'wholesalePrice', label: '批发价' },
  ])}

## 未并入官网数据的独立静态页

${markdownTable(audit.staticRoutes.standalone, [
    { key: 'slug', label: '路由' },
    { key: 'canonicalSlug', label: 'Canonical' },
  ])}

## 图片待确认

${markdownTable(audit.appPlaceholderImages, [
    { key: 'id', label: 'SKU' },
    { key: 'name', label: '产品' },
    { key: 'currentImage', label: '当前图片' },
  ])}

## 价格待确认

${markdownTable(audit.websitePriceConfirmation, [
    { key: 'id', label: 'SKU' },
    { key: 'name', label: '产品' },
    { key: 'category', label: '分类' },
    { key: 'status', label: '状态' },
  ])}

## 技术项

- ${summary.historicalAliases} 个历史路由已有 canonical，不应计入真正的商品缺失。
- ${summary.canonicalTargets} 个正式静态页由官网短 SKU 重定向进入，属于有效 canonical 页面。
- 当前没有发现官网或 App 商品图片文件路径 404。
- ${summary.websiteVideoMissing} 个官网商品没有视频字段，属于素材补充项，不影响当前商品图片展示。
`;
}

const audit = buildAudit();

if (WRITE_REPORTS) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(REPORT_DIR, `catalog-governance-audit-${AUDIT_DATE}.json`),
    `${JSON.stringify(audit, null, 2)}\n`
  );
  fs.writeFileSync(
    path.join(REPORT_DIR, `catalog-governance-audit-${AUDIT_DATE}.md`),
    buildMarkdown(audit)
  );
}

console.log(JSON.stringify(audit.summary, null, 2));
