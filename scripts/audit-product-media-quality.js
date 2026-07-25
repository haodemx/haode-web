const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const REPORT_DIR = path.join(ROOT, 'docs', 'reports');
const AUDIT_DATE = process.env.HAODE_AUDIT_DATE || new Date().toISOString().slice(0, 10);
const WRITE_REPORTS = process.argv.includes('--write');
const SMALL_EDGE_REVIEW_PX = 600;
const LONG_EDGE_REVIEW_PX = 1000;
const LARGE_FILE_REVIEW_BYTES = 1.5 * 1024 * 1024;
const EXTREME_ASPECT_RATIO = 2.2;

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

function readUInt24LE(buffer, offset) {
  return buffer[offset] | (buffer[offset + 1] << 8) | (buffer[offset + 2] << 16);
}

function jpegDimensions(buffer) {
  let offset = 2;
  while (offset + 8 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = buffer[offset + 1];
    offset += 2;
    if (marker === 0xd8 || marker === 0xd9) continue;
    if (marker === 0xda) break;
    if (offset + 2 > buffer.length) break;
    const length = buffer.readUInt16BE(offset);
    const isSof = (
      (marker >= 0xc0 && marker <= 0xc3)
      || (marker >= 0xc5 && marker <= 0xc7)
      || (marker >= 0xc9 && marker <= 0xcb)
      || (marker >= 0xcd && marker <= 0xcf)
    );
    if (isSof && offset + 7 < buffer.length) {
      return {
        width: buffer.readUInt16BE(offset + 5),
        height: buffer.readUInt16BE(offset + 3),
      };
    }
    if (length < 2) break;
    offset += length;
  }
  return null;
}

function webpDimensions(buffer) {
  if (buffer.length < 30 || buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WEBP') {
    return null;
  }
  const type = buffer.toString('ascii', 12, 16);
  if (type === 'VP8X') {
    return {
      width: readUInt24LE(buffer, 24) + 1,
      height: readUInt24LE(buffer, 27) + 1,
    };
  }
  if (type === 'VP8 ') {
    const startCode = buffer.indexOf(Buffer.from([0x9d, 0x01, 0x2a]), 20);
    if (startCode < 0 || startCode + 7 > buffer.length) return null;
    return {
      width: buffer.readUInt16LE(startCode + 3) & 0x3fff,
      height: buffer.readUInt16LE(startCode + 5) & 0x3fff,
    };
  }
  if (type === 'VP8L' && buffer[20] === 0x2f) {
    const b1 = buffer[21];
    const b2 = buffer[22];
    const b3 = buffer[23];
    const b4 = buffer[24];
    return {
      width: 1 + (((b2 & 0x3f) << 8) | b1),
      height: 1 + (((b4 & 0x0f) << 10) | (b3 << 2) | ((b2 & 0xc0) >> 6)),
    };
  }
  return null;
}

function svgDimensions(buffer) {
  const text = buffer.toString('utf8');
  const width = text.match(/\bwidth=["']([\d.]+)(?:px)?["']/i);
  const height = text.match(/\bheight=["']([\d.]+)(?:px)?["']/i);
  if (width && height) {
    return { width: Math.round(Number(width[1])), height: Math.round(Number(height[1])) };
  }
  const viewBox = text.match(/\bviewBox=["'][\d.-]+\s+[\d.-]+\s+([\d.]+)\s+([\d.]+)["']/i);
  if (viewBox) {
    return { width: Math.round(Number(viewBox[1])), height: Math.round(Number(viewBox[2])) };
  }
  return null;
}

function contentType(buffer) {
  if (buffer.length >= 24 && buffer.toString('ascii', 1, 4) === 'PNG') return 'png';
  if (buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xd8) return 'jpeg';
  if (buffer.length >= 16 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
    return 'webp';
  }
  if (/^\s*(?:<\?xml[^>]*>\s*)?<svg\b/i.test(buffer.toString('utf8', 0, Math.min(buffer.length, 500)))) return 'svg';
  return 'unknown';
}

function imageDimensions(buffer, type) {
  if (type === 'png') {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }
  if (type === 'jpeg') return jpegDimensions(buffer);
  if (type === 'webp') return webpDimensions(buffer);
  if (type === 'svg') return svgDimensions(buffer);
  return null;
}

function extensionMatchesContent(extension, type) {
  if (extension === '.jpg' || extension === '.jpeg') return type === 'jpeg';
  return extension === `.${type}`;
}

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function assetRecord(assetPath) {
  const normalized = normalizeAsset(assetPath);
  const filePath = path.join(ROOT, normalized);
  if (!normalized || !fs.existsSync(filePath)) {
    return {
      path: normalized || String(assetPath || ''),
      exists: false,
      bytes: 0,
      extension: path.extname(normalized).toLowerCase(),
      width: null,
      height: null,
      hash: '',
    };
  }
  const buffer = fs.readFileSync(filePath);
  const extension = path.extname(normalized).toLowerCase();
  const detectedContentType = contentType(buffer);
  const dimensions = imageDimensions(buffer, detectedContentType);
  return {
    path: normalized,
    exists: true,
    bytes: buffer.length,
    extension,
    contentType: detectedContentType,
    extensionMatchesContent: extensionMatchesContent(extension, detectedContentType),
    width: dimensions?.width || null,
    height: dimensions?.height || null,
    hash: sha256(buffer),
  };
}

function productName(product, source) {
  return source === 'website' ? product.name || '' : product.nombre || '';
}

function collectReferences(website, app) {
  const references = [];
  website.forEach((product) => {
    (product.images || []).forEach((image, index) => {
      references.push({
        source: 'website',
        id: product.id,
        name: productName(product, 'website'),
        role: index === 0 ? 'primary' : `gallery-${index + 1}`,
        path: normalizeAsset(image),
      });
    });
  });
  app.forEach((product) => {
    references.push({
      source: 'app',
      id: product.id,
      name: productName(product, 'app'),
      role: 'primary',
      path: normalizeAsset(product.imagen),
    });
  });
  return references;
}

function groupBy(items, keyFn) {
  const groups = new Map();
  items.forEach((item) => {
    const key = keyFn(item);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  });
  return groups;
}

function table(rows, columns) {
  if (!rows.length) return '- 无';
  const header = `| ${columns.map((column) => column.label).join(' | ')} |`;
  const divider = `| ${columns.map(() => '---').join(' | ')} |`;
  const body = rows.map((row) => (
    `| ${columns.map((column) => String(column.value(row) ?? '').replaceAll('|', '\\|')).join(' | ')} |`
  )).join('\n');
  return `${header}\n${divider}\n${body}`;
}

function buildAudit() {
  const website = readWebsiteProducts();
  const app = readAppProducts();
  const references = collectReferences(website, app);
  const uniquePaths = [...new Set(references.map((reference) => reference.path))];
  const assets = uniquePaths.map(assetRecord);
  const assetByPath = new Map(assets.map((asset) => [asset.path, asset]));
  const primaryReferences = references.filter((reference) => reference.role === 'primary');
  const primaryAssets = [...groupBy(primaryReferences, (reference) => reference.path).entries()]
    .map(([assetPath, items]) => ({
      ...assetByPath.get(assetPath),
      skus: [...new Set(items.map((item) => item.id))],
      references: items.map((item) => ({
        source: item.source,
        id: item.id,
        name: item.name,
      })),
    }));

  const missing = primaryAssets.filter((item) => !item.exists);
  const unreadableDimensions = primaryAssets.filter((item) => item.exists && (!item.width || !item.height));
  const extensionContentMismatches = primaryAssets.filter((item) => item.exists && !item.extensionMatchesContent);
  const placeholderReferences = primaryAssets.filter((item) => /placeholder|pendiente/i.test(item.path));
  const smallEdgeReview = primaryAssets.filter((item) => (
    item.width && item.height && Math.min(item.width, item.height) < SMALL_EDGE_REVIEW_PX
  ));
  const longEdgeReview = primaryAssets.filter((item) => (
    item.width && item.height && Math.max(item.width, item.height) < LONG_EDGE_REVIEW_PX
  ));
  const largeFileReview = primaryAssets.filter((item) => item.bytes > LARGE_FILE_REVIEW_BYTES);
  const extremeAspectReview = primaryAssets.filter((item) => (
    item.width
    && item.height
    && Math.max(item.width / item.height, item.height / item.width) > EXTREME_ASPECT_RATIO
  ));

  const sharedPrimaryPaths = [...groupBy(primaryReferences, (item) => item.path).entries()]
    .map(([assetPath, items]) => {
      const skus = [...new Set(items.map((item) => item.id))];
      return {
        path: assetPath,
        skus,
        references: [...new Set(items.map((item) => `${item.source}:${item.id}`))],
      };
    })
    .filter((item) => item.skus.length > 1)
    .sort((a, b) => b.skus.length - a.skus.length);

  const exactDuplicateGroups = [...groupBy(assets.filter((asset) => asset.exists), (asset) => asset.hash).entries()]
    .map(([hash, items]) => ({
      hash,
      paths: [...new Set(items.map((item) => item.path))],
    }))
    .filter((item) => item.paths.length > 1)
    .sort((a, b) => b.paths.length - a.paths.length);

  const duplicatePrimaryAcrossSkuGroups = [...groupBy(primaryAssets.filter((asset) => asset.exists), (asset) => asset.hash).entries()]
    .map(([hash, items]) => ({
      hash,
      paths: [...new Set(items.map((item) => item.path))],
      skus: [...new Set(items.flatMap((item) => item.skus))],
    }))
    .filter((item) => item.skus.length > 1)
    .sort((a, b) => b.skus.length - a.skus.length);

  const websiteById = new Map(website.map((product) => [product.id, product]));
  const appById = new Map(app.map((product) => [product.id, product]));
  const commonIds = [...websiteById.keys()].filter((id) => appById.has(id));
  const crossSurface = commonIds.map((id) => {
    const websitePath = normalizeAsset(websiteById.get(id).images?.[0]);
    const appPath = normalizeAsset(appById.get(id).imagen);
    const websiteAsset = assetByPath.get(websitePath);
    const appAsset = assetByPath.get(appPath);
    let relationship = 'different-file';
    if (websitePath === appPath) relationship = 'same-path';
    else if (websiteAsset?.hash && websiteAsset.hash === appAsset?.hash) relationship = 'same-bytes-different-path';
    return {
      id,
      name: productName(websiteById.get(id), 'website'),
      websitePath,
      appPath,
      relationship,
    };
  });

  const formatCounts = assets.reduce((counts, asset) => {
    const key = asset.extension || '(无扩展名)';
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});

  return {
    generatedAt: new Date().toISOString(),
    auditDate: AUDIT_DATE,
    thresholds: {
      smallEdgeReviewPx: SMALL_EDGE_REVIEW_PX,
      longEdgeReviewPx: LONG_EDGE_REVIEW_PX,
      largeFileReviewBytes: LARGE_FILE_REVIEW_BYTES,
      extremeAspectRatio: EXTREME_ASPECT_RATIO,
      note: '阈值只用于技术复核，不代表图片错误，不触发自动替换。',
    },
    guardrails: {
      productDataChanged: false,
      imagesChanged: false,
      productsPublished: false,
      firestoreChanged: false,
    },
    summary: {
      websiteProducts: website.length,
      appProducts: app.length,
      allImageReferences: references.length,
      uniqueImageAssets: assets.length,
      primaryImageReferences: primaryReferences.length,
      uniquePrimaryImageAssets: primaryAssets.length,
      missingPrimaryAssets: missing.length,
      unreadablePrimaryDimensions: unreadableDimensions.length,
      extensionContentMismatchAssets: extensionContentMismatches.length,
      placeholderPrimaryAssets: placeholderReferences.length,
      smallEdgeReview: smallEdgeReview.length,
      longEdgeReview: longEdgeReview.length,
      largeFileReview: largeFileReview.length,
      extremeAspectReview: extremeAspectReview.length,
      sharedPrimaryPathGroups: sharedPrimaryPaths.length,
      exactDuplicateDifferentPathGroups: exactDuplicateGroups.length,
      duplicatePrimaryAcrossSkuGroups: duplicatePrimaryAcrossSkuGroups.length,
      commonProducts: commonIds.length,
      crossSurfaceSamePath: crossSurface.filter((item) => item.relationship === 'same-path').length,
      crossSurfaceSameBytesDifferentPath: crossSurface.filter((item) => item.relationship === 'same-bytes-different-path').length,
      crossSurfaceDifferentFile: crossSurface.filter((item) => item.relationship === 'different-file').length,
    },
    formatCounts,
    missing,
    unreadableDimensions,
    extensionContentMismatches,
    placeholderReferences,
    smallEdgeReview,
    longEdgeReview,
    largeFileReview,
    extremeAspectReview,
    sharedPrimaryPaths,
    exactDuplicateGroups,
    duplicatePrimaryAcrossSkuGroups,
    crossSurface,
    assets,
  };
}

function buildMarkdown(audit) {
  const { summary, thresholds } = audit;
  const crossSurfaceDifferent = audit.crossSurface.filter((item) => item.relationship === 'different-file');
  const sameBytesDifferentPath = audit.crossSurface.filter((item) => item.relationship === 'same-bytes-different-path');

  return `# HAODE 商品媒体质量审计

生成日期：${audit.auditDate}

## 结论

- 官网商品：${summary.websiteProducts}
- App 商品：${summary.appProducts}
- 图片引用：${summary.allImageReferences}，唯一图片文件：${summary.uniqueImageAssets}
- 主图引用：${summary.primaryImageReferences}，唯一主图文件：${summary.uniquePrimaryImageAssets}
- 主图路径缺失：${summary.missingPrimaryAssets}
- 主图尺寸无法读取：${summary.unreadablePrimaryDimensions}
- 扩展名与实际编码不一致：${summary.extensionContentMismatchAssets}
- 占位主图：${summary.placeholderPrimaryAssets}
- 同一 SKU 官网/App 主图完全相同路径：${summary.crossSurfaceSamePath}
- 同一 SKU 官网/App 不同路径但文件内容相同：${summary.crossSurfaceSameBytesDifferentPath}
- 同一 SKU 官网/App 主图文件不同，需视觉复核：${summary.crossSurfaceDifferentFile}
- 多个商品共用同一路径的主图组：${summary.sharedPrimaryPathGroups}
- 不同路径但文件内容完全相同的图片组：${summary.exactDuplicateDifferentPathGroups}
- 多个 SKU 主图内容完全相同的复核组：${summary.duplicatePrimaryAcrossSkuGroups}

## 执行边界

- 没有修改或替换图片。
- 没有修改商品数据、价格、库存或兼容性。
- 没有运行 \`publish-products\`。
- 没有修改 Firestore。
- 下列尺寸与体积阈值只用于技术复核，不代表图片错误。

## 复核阈值

- 短边小于 ${thresholds.smallEdgeReviewPx}px：${summary.smallEdgeReview} 个主图引用。
- 长边小于 ${thresholds.longEdgeReviewPx}px：${summary.longEdgeReview} 个主图引用。
- 文件大于 ${(thresholds.largeFileReviewBytes / 1024 / 1024).toFixed(1)}MB：${summary.largeFileReview} 个主图引用。
- 长宽比超过 ${thresholds.extremeAspectRatio}:1：${summary.extremeAspectReview} 个主图引用。

## 占位主图

${table(audit.placeholderReferences, [
    { label: '来源', value: (row) => row.references.map((item) => item.source).join(', ') },
    { label: 'SKU', value: (row) => row.skus.join(', ') },
    { label: '图片', value: (row) => row.path },
  ])}

## 扩展名与实际编码不一致

${table(audit.extensionContentMismatches, [
    { label: 'SKU', value: (row) => row.skus.join(', ') },
    { label: '扩展名', value: (row) => row.extension },
    { label: '实际编码', value: (row) => row.contentType },
    { label: '尺寸', value: (row) => `${row.width}x${row.height}` },
    { label: '图片', value: (row) => row.path },
  ])}

## 官网/App 主图文件不同

${table(crossSurfaceDifferent, [
    { label: 'SKU', value: (row) => row.id },
    { label: '产品', value: (row) => row.name },
    { label: '官网主图', value: (row) => row.websitePath },
    { label: 'App 主图', value: (row) => row.appPath },
  ])}

## 不同路径但内容相同

${table(sameBytesDifferentPath, [
    { label: 'SKU', value: (row) => row.id },
    { label: '官网主图', value: (row) => row.websitePath },
    { label: 'App 主图', value: (row) => row.appPath },
  ])}

## 多个商品共用同一主图路径

${table(audit.sharedPrimaryPaths, [
    { label: '图片', value: (row) => row.path },
    { label: 'SKU 数', value: (row) => row.skus.length },
    { label: 'SKU', value: (row) => row.skus.join(', ') },
  ])}

## 多个 SKU 主图内容完全相同

${table(audit.duplicatePrimaryAcrossSkuGroups, [
    { label: 'SKU 数', value: (row) => row.skus.length },
    { label: 'SKU', value: (row) => row.skus.join(', ') },
    { label: '图片路径', value: (row) => row.paths.join(', ') },
  ])}

## 短边低于复核阈值

${table(audit.smallEdgeReview, [
    { label: 'SKU', value: (row) => row.skus.join(', ') },
    { label: '尺寸', value: (row) => `${row.width}x${row.height}` },
    { label: '图片', value: (row) => row.path },
  ])}

## 大文件复核

${table(audit.largeFileReview, [
    { label: 'SKU', value: (row) => row.skus.join(', ') },
    { label: '大小', value: (row) => `${(row.bytes / 1024 / 1024).toFixed(2)}MB` },
    { label: '图片', value: (row) => row.path },
  ])}

## 技术说明

- 路径不同但哈希相同表示文件字节完全一致，可安全视为同一素材。
- 路径或哈希不同只表示文件不同，是否使用错误型号仍需人工看图确认。
- 共用主图可能是系列通用素材，不自动判错。
`;
}

const audit = buildAudit();

if (WRITE_REPORTS) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(REPORT_DIR, `product-media-quality-audit-${AUDIT_DATE}.json`),
    `${JSON.stringify(audit, null, 2)}\n`
  );
  fs.writeFileSync(
    path.join(REPORT_DIR, `product-media-quality-audit-${AUDIT_DATE}.md`),
    buildMarkdown(audit)
  );
}

console.log(JSON.stringify(audit.summary, null, 2));
