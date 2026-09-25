import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const ORIGIN = 'https://haode.com.mx';
export const OUTPUT = 'data/marketing/chatgpt-product-feed.json';
const SOURCE = 'data/products.generated.js';
const ASSET_QC_SOURCE = 'data/marketing/chatgpt-feed-asset-qc.json';
const PRIORITY = new Set(['iphone-incell', 'iphone-oled', 'samsung-incell', 'samsung-oled', 'samsung-tipo-original', 'oled-diagnostica', 'micas']);
const PRICE_POLICY = 'Consultar por WhatsApp; no se publica un precio sin confirmación vigente.';
const AVAILABILITY_POLICY = 'unknown no significa disponible ni agotado.';
const hash = value => crypto.createHash('sha256').update(value).digest('hex');

export function readPublicProducts(root = ROOT) {
  const text = fs.readFileSync(path.join(root, SOURCE), 'utf8');
  if (!text.startsWith('window.HAODE_PRODUCTS_DATA = [')) throw new Error('Unexpected public product source');
  return JSON.parse(text.slice(text.indexOf('['), text.lastIndexOf(']') + 1));
}

export function readAssetQc(root = ROOT) {
  const policy = JSON.parse(fs.readFileSync(path.join(root, ASSET_QC_SOURCE), 'utf8'));
  if (policy.schema_version !== 1 || policy.status !== 'LOCAL_QC_POLICY' || !policy.items || Array.isArray(policy.items)) {
    throw new Error('Invalid asset QC policy');
  }
  for (const [id, status] of Object.entries(policy.items)) {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(id) || !/^QC_FAIL_/.test(status)) throw new Error(`Invalid asset QC entry: ${id}`);
  }
  return policy.items;
}

export function buildFeed(products = readPublicProducts(), root = ROOT, assetQc = readAssetQc(root)) {
  const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
  const seen = new Set();
  const items = products.filter(p => PRIORITY.has(p.category)).map(p => {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(p.id) || seen.has(p.id)) throw new Error(`Invalid/duplicate id: ${p.id}`);
    seen.add(p.id);
    if (!p.name?.trim()) throw new Error(`Missing title: ${p.id}`);
    const link = `${ORIGIN}/producto/${p.id}/`;
    const html = fs.readFileSync(path.join(root, 'producto', p.id, 'index.html'), 'utf8');
    if (!html.includes(`rel="canonical" href="${link}"`) || !sitemap.includes(`<loc>${link}</loc>`)) {
      throw new Error(`Noncanonical public route: ${p.id}`);
    }
    const main = p.images?.[0];
    // Only the exact already-used public image is a candidate; never substitute galleries or series imagery.
    const hasImage = typeof main === 'string' && /^assets\/products\/[a-zA-Z0-9_./-]+\.(jpg|jpeg|png|webp)$/.test(main)
      && !main.split('/').includes('..') && !/placeholder/i.test(main)
      && html.includes(main) && fs.existsSync(path.join(root, main));
    // A recorded QC failure remains rejected even if the bad file later disappears;
    // clearing the policy requires new exact-model approval evidence.
    const rejectedImage = Object.hasOwn(assetQc, p.id);
    const usableImage = hasImage && !rejectedImage;
    return {
      id: p.id,
      title: p.name,
      description: `${p.name}. Consulta modelo exacto, cantidad y ciudad por WhatsApp para confirmar precio y disponibilidad.`,
      link,
      image_link: usableImage ? `${ORIGIN}/${main}` : null,
      availability: 'unknown',
      price: null,
      price_status: 'quote_required',
      availability_status: 'not_live_verified',
      image_status: rejectedImage ? 'asset_rejected' : usableImage ? 'existing_public_asset' : 'asset_missing',
      category: p.category,
      priority_group: p.id === 'x200t-cortadora-micas' ? 'X200T' : p.category === 'micas' ? 'Hydrogel' : 'Pantallas',
      source: {
        catalog: SOURCE,
        product_id: p.id,
        image_sha256: usableImage ? hash(fs.readFileSync(path.join(root, main))) : null
      },
      platform_ready: false,
      blockers: ['confirmed_current_price_required', 'ads_feed_registration_required', 'brand_mapping_review_required',
        ...(usableImage ? ['ads_asset_approval_required'] : ['confirmed_product_image_required']),
        ...(rejectedImage ? ['asset_qc_failed'] : [])]
    };
  }).sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  const publicProjection = items.map(({ source, ...item }) => item);
  return {
    schema_version: 1,
    status: 'LOCAL_PREPARED_NOT_UPLOAD_READY',
    source: SOURCE,
    content_sha256: hash(JSON.stringify(publicProjection)),
    price_policy: PRICE_POLICY,
    availability_policy: AVAILABILITY_POLICY,
    items
  };
}

function exactKeys(value, keys) {
  if (!value || typeof value !== 'object' || Array.isArray(value)
    || Object.keys(value).sort().join(',') !== [...keys].sort().join(',')) throw new Error('Unexpected feed fields');
}

export function validateFeed(feed, assetQc = readAssetQc()) {
  exactKeys(feed, ['schema_version', 'status', 'source', 'content_sha256', 'price_policy', 'availability_policy', 'items']);
  if (feed.schema_version !== 1 || feed.status !== 'LOCAL_PREPARED_NOT_UPLOAD_READY' || !Array.isArray(feed.items)) throw new Error('Invalid feed envelope');
  if (feed.source !== SOURCE || typeof feed.content_sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(feed.content_sha256)) throw new Error('Invalid provenance');
  if (feed.price_policy !== PRICE_POLICY || feed.availability_policy !== AVAILABILITY_POLICY) throw new Error('Invalid policy');
  const seen = new Set();
  for (const row of feed.items) {
    exactKeys(row, ['id', 'title', 'description', 'link', 'image_link', 'availability', 'price', 'price_status', 'availability_status', 'image_status', 'category', 'priority_group', 'source', 'platform_ready', 'blockers']);
    exactKeys(row.source, ['catalog', 'product_id', 'image_sha256']);
    if (row.source.catalog !== SOURCE || row.source.product_id !== row.id) throw new Error('Invalid row provenance');
    if (!['Pantallas', 'Hydrogel', 'X200T'].includes(row.priority_group)) throw new Error('Invalid priority group');
    if (typeof row.id !== 'string' || !/^[a-z0-9][a-z0-9-]*$/.test(row.id) || seen.has(row.id)) throw new Error('Invalid/duplicate id');
    seen.add(row.id);
    for (const key of ['title', 'description', 'category', 'priority_group']) if (typeof row[key] !== 'string' || !row[key].trim()) throw new Error(`Missing ${key}`);
    if (row.link !== `${ORIGIN}/producto/${row.id}/`) throw new Error('Invalid product URL');
    if (row.image_link !== null) {
      if (typeof row.image_link !== 'string') throw new Error('Invalid image type');
      const url = new URL(row.image_link);
      if (url.origin !== ORIGIN || url.href !== row.image_link || url.search || url.hash || !/^\/assets\/products\/[a-zA-Z0-9_./-]+\.(jpg|jpeg|png|webp)$/.test(url.pathname)) throw new Error('Nonpublic image');
      if (row.image_status !== 'existing_public_asset' || typeof row.source.image_sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(row.source.image_sha256)) throw new Error('Invalid image provenance');
    } else if (!['asset_missing', 'asset_rejected'].includes(row.image_status) || row.source.image_sha256 !== null) throw new Error('Missing image semantics');
    if (row.title.length > 150 || row.description.length > 5000) throw new Error('Text too long');
    if (row.price !== null || row.availability !== 'unknown' || row.platform_ready !== false) throw new Error('Unverified commerce claim');
    if (row.price_status !== 'quote_required' || row.availability_status !== 'not_live_verified') throw new Error('Missing data semantics');
    const qcRejected = Object.hasOwn(assetQc, row.id);
    if (qcRejected !== (row.image_status === 'asset_rejected')) throw new Error('Asset QC policy mismatch');
    const requiredBlockers = ['confirmed_current_price_required', 'ads_feed_registration_required', 'brand_mapping_review_required', row.image_link ? 'ads_asset_approval_required' : 'confirmed_product_image_required', ...(qcRejected ? ['asset_qc_failed'] : [])];
    if (!Array.isArray(row.blockers) || row.blockers.length !== requiredBlockers.length || row.blockers.some((value, index) => value !== requiredBlockers[index])) throw new Error('Invalid platform gates');
    if (!PRIORITY.has(row.category)) throw new Error('Invalid category');
  }
  return true;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const feed = buildFeed();
  validateFeed(feed);
  const serialized = `${JSON.stringify(feed, null, 2)}\n`;
  if (process.argv.includes('--check')) {
    if (fs.readFileSync(path.join(ROOT, OUTPUT), 'utf8') !== serialized) throw new Error('Feed stale; run npm run feed:chatgpt');
  } else {
    fs.writeFileSync(path.join(ROOT, OUTPUT), serialized);
  }
  console.log(JSON.stringify({ count: feed.items.length, groups: Object.fromEntries(['Pantallas', 'Hydrogel', 'X200T'].map(g => [g, feed.items.filter(p => p.priority_group === g).length])), missingImages: feed.items.filter(p => !p.image_link).length, uploadReady: feed.items.filter(p => p.platform_ready).length }));
}
