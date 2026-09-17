import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(import.meta.dirname, '..');
const dataFile = path.join(root, 'data', 'products.generated.js');
const manifestFile = path.join(root, 'data', 'product-media-manifest.json');
const reportFile = path.join(root, 'docs', 'reports', 'real-product-media-step-3.md');
const apply = process.argv.includes('--apply');

function normalize(value) {
  return String(value || '').replace(/^\/+/, '');
}

function assetExists(assetPath) {
  return Boolean(assetPath) && fs.existsSync(path.join(root, normalize(assetPath)));
}

function directory(assetPath) {
  return path.posix.dirname(normalize(assetPath));
}

function readProducts() {
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(dataFile, 'utf8'), context);
  return context.window.HAODE_PRODUCTS_DATA || [];
}

function walk(directoryPath) {
  if (!fs.existsSync(directoryPath)) return [];
  return fs.readdirSync(directoryPath, { withFileTypes: true }).flatMap((entry) => {
    const next = path.join(directoryPath, entry.name);
    return entry.isDirectory() ? walk(next) : [next];
  });
}

function pngHasAlpha(filePath) {
  if (path.extname(filePath).toLowerCase() !== '.png') return false;
  const buffer = fs.readFileSync(filePath);
  return buffer.length > 25 && [4, 6].includes(buffer[25]);
}

function pngDimensions(buffer) {
  if (buffer.length < 24 || buffer.toString('ascii', 1, 4) !== 'PNG') return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function jpegDimensions(buffer) {
  let offset = 2;
  while (offset + 8 < buffer.length) {
    if (buffer[offset] !== 0xff) { offset += 1; continue; }
    const marker = buffer[offset + 1];
    offset += 2;
    if (marker === 0xd8 || marker === 0xd9) continue;
    if (marker === 0xda || offset + 2 > buffer.length) break;
    const length = buffer.readUInt16BE(offset);
    if (((marker >= 0xc0 && marker <= 0xc3) || (marker >= 0xc5 && marker <= 0xc7)) && offset + 7 < buffer.length) {
      return { width: buffer.readUInt16BE(offset + 5), height: buffer.readUInt16BE(offset + 3) };
    }
    if (length < 2) break;
    offset += length;
  }
  return null;
}

function webpDimensions(buffer) {
  if (buffer.length < 30 || buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WEBP') return null;
  if (buffer.toString('ascii', 12, 16) === 'VP8X') {
    const read24 = (offset) => buffer[offset] | (buffer[offset + 1] << 8) | (buffer[offset + 2] << 16);
    return { width: read24(24) + 1, height: read24(27) + 1 };
  }
  return null;
}

function dimensions(assetPath) {
  const filePath = path.join(root, normalize(assetPath));
  if (!fs.existsSync(filePath)) return null;
  const buffer = fs.readFileSync(filePath);
  return pngDimensions(buffer) || jpegDimensions(buffer) || webpDimensions(buffer);
}

const products = readProducts();
const productVideoFiles = walk(path.join(root, 'assets', 'products'))
  .filter((file) => /\.(?:mp4|mov|webm)$/i.test(file))
  .map((file) => path.relative(root, file).split(path.sep).join('/'));
const productIdsByMediaDirectory = new Map();
products.forEach((product) => {
  const mediaDirectory = directory(product.images?.[0]);
  if (!productIdsByMediaDirectory.has(mediaDirectory)) productIdsByMediaDirectory.set(mediaDirectory, []);
  productIdsByMediaDirectory.get(mediaDirectory).push(product.id);
});
const videoReferences = new Map();
products.forEach((product) => (product.videos || []).forEach((video) => {
  const normalized = normalize(video);
  if (!videoReferences.has(normalized)) videoReferences.set(normalized, []);
  videoReferences.get(normalized).push(product.id);
}));

function videoMatchStatus(product, video) {
  const normalized = normalize(video);
  const main = normalize(product.images?.[0]);
  const references = videoReferences.get(normalized) || [];
  if (!assetExists(normalized)) return 'UNMATCHED';
  if (references.length !== 1) return 'AMBIGUOUS';
  if (directory(normalized) !== directory(main)) return 'AMBIGUOUS';
  if (/(?:oled-diagnostica|series-video)/i.test(normalized)) return 'AMBIGUOUS';
  return 'UNIQUE_MATCH';
}

const records = products.map((product) => {
  const images = (product.images || []).map(normalize).filter(Boolean);
  const mainCandidate = images[0] || '';
  const mainReady = assetExists(mainCandidate) && !/placeholder/i.test(mainCandidate);
  const additionalImages = images.slice(1).filter(assetExists);
  const transparentImage = images.find((image) => {
    const filePath = path.join(root, image);
    return assetExists(image) && (/(?:transparent|cutout|recorte)/i.test(image) || pngHasAlpha(filePath));
  }) || null;
  const exactDirectoryVideos = (productIdsByMediaDirectory.get(directory(mainCandidate)) || []).length === 1
    ? productVideoFiles.filter((video) => directory(video) === directory(mainCandidate))
    : [];
  const candidateVideos = [...new Set([...(product.videos || []).map(normalize), ...exactDirectoryVideos])];
  const videoMatches = candidateVideos.map((video) => ({
    path: normalize(video),
    status: exactDirectoryVideos.includes(normalize(video)) ? 'UNIQUE_MATCH' : videoMatchStatus(product, video),
  }));
  const uniqueVideos = videoMatches.filter((video) => video.status === 'UNIQUE_MATCH');
  const ambiguousVideos = videoMatches.filter((video) => video.status === 'AMBIGUOUS');
  const unmatchedVideos = videoMatches.filter((video) => video.status === 'UNMATCHED');
  const videoTitle = `Prueba real — ${product.model} ${product.quality || ''}`.trim();

  return {
    productId: product.id,
    model: product.model,
    version: product.quality || '',
    mainImage: mainReady ? mainCandidate : null,
    additionalImages,
    transparentImage,
    testVideos: uniqueVideos.map((video) => ({ ...video, title: videoTitle })),
    ambiguousVideos,
    unmatchedVideos,
    videoPoster: uniqueVideos.length && mainReady ? mainCandidate : null,
    mediaSource: 'CURRENT_REPO_PUBLIC_ASSET',
    confidence: mainReady ? 'HIGH' : 'NONE',
    reviewStatus: mainReady ? 'EXISTING_PUBLIC_ASSET' : 'REAL_ASSET_REQUIRED',
    gates: {
      sourceConfirmed: mainReady,
      qcPass: mainReady,
      approvedForWeb: mainReady,
    },
  };
});

const referencedVideoPaths = new Set([...videoReferences.keys()]);
const matchedVideoPaths = new Set(records.flatMap((record) => record.testVideos.map((video) => video.path)));
const ambiguousVideoPaths = new Set(records.flatMap((record) => record.ambiguousVideos.map((video) => video.path)));
const unreferencedVideos = productVideoFiles.filter((video) => !matchedVideoPaths.has(video) && !ambiguousVideoPaths.has(video));
const ambiguousReferences = records.flatMap((record) => record.ambiguousVideos.map((video) => ({ productId: record.productId, ...video })));
const unmatchedReferences = records.flatMap((record) => record.unmatchedVideos.map((video) => ({ productId: record.productId, ...video })));
const lowResolutionAssets = records.flatMap((record) => [record.mainImage, ...record.additionalImages].filter(Boolean).map((asset) => ({
  productId: record.productId,
  path: asset,
  dimensions: dimensions(asset),
}))).filter((asset) => asset.dimensions && Math.min(asset.dimensions.width, asset.dimensions.height) < 600);
const foldables = records.filter((record) => /(?:flip|fold)/i.test(`${record.productId} ${record.model}`));

const summary = {
  productsTotal: records.length,
  mainImageReady: records.filter((record) => record.mainImage).length,
  additionalImagesReady: records.filter((record) => record.additionalImages.length).length,
  productsWithGallery: records.filter((record) => record.additionalImages.length || record.testVideos.length).length,
  productsWithVideo: records.filter((record) => record.testVideos.length).length,
  uniqueVideoMatch: records.reduce((total, record) => total + record.testVideos.length, 0),
  ambiguousVideo: ambiguousReferences.length,
  unmatchedVideo: unmatchedReferences.length + unreferencedVideos.length,
  videoPosterReady: records.filter((record) => record.videoPoster).length,
  foldableRealImageReady: foldables.filter((record) => record.mainImage).length,
  foldableRealAssetRequired: foldables.filter((record) => !record.mainImage).length,
};

const manifest = {
  schemaVersion: 1,
  matchingPolicy: 'STRICT_MODEL_AND_VERSION',
  sourcePolicy: 'REAL_HAODE_HL_HLA_ONLY_NO_GENERATED_SUBSTITUTES',
  summary,
  products: records,
  unreferencedVideos,
  lowResolutionAssets,
};

const missingMain = records.filter((record) => !record.mainImage);
const imageWithoutVideo = records.filter((record) => record.mainImage && !record.testVideos.length);
const foldableMissing = foldables.filter((record) => !record.mainImage);
const lines = [
  '# HAODE Website — Real Product Media Step 3',
  '',
  '## Coverage',
  '',
  ...Object.entries(summary).map(([key, value]) => `- ${key}: ${value}`),
  '',
  '## Gate',
  '',
  '- Only current public HAODE repository media is inventoried.',
  '- Video publication requires one product reference and the exact same product directory as its main image.',
  '- Shared OLED diagnostic and series videos are AMBIGUOUS and are not attached to product detail galleries.',
  '- Missing media remains REAL ASSET REQUIRED; no generated or substitute product media was added.',
  '',
  '## Missing main images',
  '',
  ...missingMain.map((record) => `- ${record.productId} | ${record.model} | ${record.version} | REAL ASSET REQUIRED`),
  '',
  '## Image ready, no unique video',
  '',
  ...imageWithoutVideo.map((record) => `- ${record.productId} | ${record.model} | ${record.version}`),
  '',
  '## Ambiguous video references',
  '',
  ...ambiguousReferences.map((item) => `- ${item.productId} | ${item.path} | AMBIGUOUS / REVIEW ONLY`),
  '',
  '## Unmatched video files',
  '',
  ...unreferencedVideos.map((video) => `- ${video} | UNMATCHED / DO NOT ATTACH`),
  '',
  '## Low-resolution image review',
  '',
  ...lowResolutionAssets.map((item) => `- ${item.productId} | ${item.path} | ${item.dimensions.width}x${item.dimensions.height}`),
  '',
  '## Foldables missing real images',
  '',
  ...foldableMissing.map((record) => `- ${record.productId} | ${record.model} | ${record.version} | REAL ASSET REQUIRED`),
  '',
];

if (apply) {
  fs.writeFileSync(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`);
  fs.writeFileSync(reportFile, `${lines.join('\n')}\n`);
  console.log(`Wrote ${path.relative(root, manifestFile)}`);
  console.log(`Wrote ${path.relative(root, reportFile)}`);
} else {
  console.log(JSON.stringify(summary, null, 2));
}
