import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const ORIGIN = 'https://haode.com.mx';
export const OUTPUT = 'data/marketing/chatgpt-product-feed.json';
const SOURCE = 'data/products.generated.js';
const READINESS_SOURCE = 'data/marketing/product-feed-readiness-input.json';
const PLATFORM_TARGETS = new Set(['google_merchant', 'meta_catalog', 'chatgpt_ads']);
const INVENTORY_FRESHNESS_SLA_HOURS = 24;
const PRIORITY = new Set(['iphone-incell', 'iphone-oled', 'samsung-incell', 'samsung-oled', 'samsung-tipo-original', 'oled-diagnostica', 'micas']);
const PRICE_POLICY = 'Consultar por WhatsApp; no se publica un precio sin confirmación vigente.';
const AVAILABILITY_POLICY = 'unknown no significa disponible ni agotado.';
const hash = value => crypto.createHash('sha256').update(value).digest('hex');

export function readPublicProducts(root = ROOT) {
  const text = fs.readFileSync(path.join(root, SOURCE), 'utf8');
  if (!text.startsWith('window.HAODE_PRODUCTS_DATA = [')) throw new Error('Unexpected public product source');
  return JSON.parse(text.slice(text.indexOf('['), text.lastIndexOf(']') + 1));
}

export function readReadiness(root = ROOT) {
  const value = JSON.parse(fs.readFileSync(path.join(root, READINESS_SOURCE), 'utf8'));
  if (value?.schema_version !== 1 || value?.status !== 'OWNER_VERIFICATION_REQUIRED' || !value.products || Array.isArray(value.products) || typeof value.products !== 'object') {
    throw new Error('Invalid feed readiness input');
  }
  return value;
}

function verifiedReadiness(record, hasImage, now) {
  if (!record || !hasImage || record.approval_status !== 'owner_verified' || record.platform_registration_status !== 'verified' || record.image_approved !== true) return null;
  if (typeof record.sku !== 'string' || !/^[A-Z0-9][A-Z0-9._-]{1,79}$/.test(record.sku)) return null;
  if (typeof record.brand !== 'string' || !record.brand.trim() || record.brand.length > 80) return null;
  if (!Number.isFinite(record.price) || record.price <= 0 || record.currency !== 'MXN') return null;
  if (!Number.isSafeInteger(record.inventory_quantity) || record.inventory_quantity < 0) return null;
  if (!['in_stock', 'out_of_stock', 'preorder', 'backorder'].includes(record.availability)) return null;
  if (record.availability === 'in_stock' && record.inventory_quantity < 1) return null;
  if (record.availability === 'out_of_stock' && record.inventory_quantity !== 0) return null;
  const inventoryCheckedAt = Date.parse(record.inventory_checked_at);
  const approvedAt = Date.parse(record.approved_at);
  if (!Number.isFinite(inventoryCheckedAt) || !Number.isFinite(approvedAt)) return null;
  if (inventoryCheckedAt > now.getTime() || approvedAt > now.getTime() || now.getTime() - inventoryCheckedAt > INVENTORY_FRESHNESS_SLA_HOURS * 60 * 60 * 1000) return null;
  if (typeof record.approved_by !== 'string' || !record.approved_by.trim() || record.approved_by.length > 80) return null;
  if (!Array.isArray(record.platform_targets) || !record.platform_targets.length || record.platform_targets.some(target => !PLATFORM_TARGETS.has(target)) || new Set(record.platform_targets).size !== record.platform_targets.length) return null;
  if (!Array.isArray(record.evidence_refs) || !record.evidence_refs.length || record.evidence_refs.some(ref => typeof ref !== 'string' || !ref.trim() || ref.length > 240)) return null;
  return record;
}

export function buildFeed(products = readPublicProducts(), root = ROOT, readiness = readReadiness(root), now = new Date()) {
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
    const verified = verifiedReadiness(readiness.products[p.id], hasImage, now);
    const blockers = verified ? [] : [
      'sku_mapping_required',
      'confirmed_current_price_required',
      'currency_required',
      'inventory_verification_required',
      'availability_verification_required',
      'ads_feed_registration_required',
      'brand_mapping_review_required',
      ...(hasImage ? ['ads_asset_approval_required'] : ['confirmed_product_image_required'])
    ];
    return {
      id: p.id,
      sku: verified?.sku ?? null,
      sku_status: verified ? 'erp_verified' : 'not_erp_reconciled',
      title: p.name,
      description: `${p.name}. Consulta modelo exacto, cantidad y ciudad por WhatsApp para confirmar precio y disponibilidad.`,
      brand: verified?.brand ?? null,
      brand_status: verified ? 'owner_verified' : 'mapping_required',
      link,
      image_link: hasImage ? `${ORIGIN}/${main}` : null,
      image_approval_status: verified ? 'owner_verified' : hasImage ? 'approval_required' : 'asset_missing',
      availability: verified?.availability ?? 'unknown',
      price: verified?.price ?? null,
      currency: verified?.currency ?? null,
      price_status: verified ? 'current_verified' : 'quote_required',
      inventory_quantity: verified?.inventory_quantity ?? null,
      inventory_status: verified ? 'erp_verified' : 'not_live_verified',
      inventory_checked_at: verified?.inventory_checked_at ?? null,
      availability_status: verified ? 'erp_verified' : 'not_live_verified',
      image_status: hasImage ? 'existing_public_asset' : 'asset_missing',
      category: p.category,
      priority_group: p.id === 'x200t-cortadora-micas' ? 'X200T' : p.category === 'micas' ? 'Hydrogel' : 'Pantallas',
      source: {
        catalog: SOURCE,
        product_id: p.id,
        image_sha256: hasImage ? hash(fs.readFileSync(path.join(root, main))) : null,
        readiness_manifest: READINESS_SOURCE,
        approval_status: verified?.approval_status ?? null,
        approved_by: verified?.approved_by ?? null,
        approved_at: verified?.approved_at ?? null,
        evidence_refs: verified?.evidence_refs ?? []
      },
      platform_targets: verified?.platform_targets ?? [],
      platform_target_status: verified ? 'registration_verified' : 'not_registered',
      platform_ready: Boolean(verified),
      blockers
    };
  }).sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  const publicProjection = items.map(({ source, ...item }) => item);
  return {
    schema_version: 2,
    status: 'LOCAL_PREPARED_NOT_UPLOAD_READY',
    source: SOURCE,
    readiness_source: READINESS_SOURCE,
    content_sha256: hash(JSON.stringify(publicProjection)),
    price_policy: PRICE_POLICY,
    availability_policy: AVAILABILITY_POLICY,
    inventory_freshness_sla_hours: INVENTORY_FRESHNESS_SLA_HOURS,
    readiness_summary: {
      candidates: items.length,
      platform_ready: items.filter(item => item.platform_ready).length,
      missing_images: items.filter(item => !item.image_link).length
    },
    items
  };
}

function exactKeys(value, keys) {
  if (!value || typeof value !== 'object' || Array.isArray(value)
    || Object.keys(value).sort().join(',') !== [...keys].sort().join(',')) throw new Error('Unexpected feed fields');
}

export function validateFeed(feed) {
  exactKeys(feed, ['schema_version', 'status', 'source', 'readiness_source', 'content_sha256', 'price_policy', 'availability_policy', 'inventory_freshness_sla_hours', 'readiness_summary', 'items']);
  if (feed.schema_version !== 2 || feed.status !== 'LOCAL_PREPARED_NOT_UPLOAD_READY' || !Array.isArray(feed.items)) throw new Error('Invalid feed envelope');
  if (feed.source !== SOURCE || typeof feed.content_sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(feed.content_sha256)) throw new Error('Invalid provenance');
  if (feed.readiness_source !== READINESS_SOURCE) throw new Error('Invalid readiness provenance');
  exactKeys(feed.readiness_summary, ['candidates', 'platform_ready', 'missing_images']);
  if (feed.price_policy !== PRICE_POLICY || feed.availability_policy !== AVAILABILITY_POLICY || feed.inventory_freshness_sla_hours !== INVENTORY_FRESHNESS_SLA_HOURS) throw new Error('Invalid policy');
  const seen = new Set();
  for (const row of feed.items) {
    exactKeys(row, ['id', 'sku', 'sku_status', 'title', 'description', 'brand', 'brand_status', 'link', 'image_link', 'image_approval_status', 'availability', 'price', 'currency', 'price_status', 'inventory_quantity', 'inventory_status', 'inventory_checked_at', 'availability_status', 'image_status', 'category', 'priority_group', 'source', 'platform_targets', 'platform_target_status', 'platform_ready', 'blockers']);
    exactKeys(row.source, ['catalog', 'product_id', 'image_sha256', 'readiness_manifest', 'approval_status', 'approved_by', 'approved_at', 'evidence_refs']);
    if (row.source.catalog !== SOURCE || row.source.product_id !== row.id || row.source.readiness_manifest !== READINESS_SOURCE) throw new Error('Invalid row provenance');
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
    } else if (row.image_status !== 'asset_missing' || row.source.image_sha256 !== null) throw new Error('Missing image semantics');
    if (row.title.length > 150 || row.description.length > 5000) throw new Error('Text too long');
    if (row.platform_ready) {
      if (!row.sku || !row.brand || !Number.isFinite(row.price) || row.price <= 0 || row.currency !== 'MXN' || !Number.isSafeInteger(row.inventory_quantity) || row.inventory_quantity < 0) throw new Error('Invalid verified commerce data');
      if (!['in_stock', 'out_of_stock', 'preorder', 'backorder'].includes(row.availability) || row.sku_status !== 'erp_verified' || row.brand_status !== 'owner_verified' || row.price_status !== 'current_verified' || row.inventory_status !== 'erp_verified' || row.availability_status !== 'erp_verified' || row.image_approval_status !== 'owner_verified' || row.platform_target_status !== 'registration_verified') throw new Error('Invalid verified status');
      if (!Array.isArray(row.platform_targets) || !row.platform_targets.length || row.platform_targets.some(target => !PLATFORM_TARGETS.has(target)) || row.blockers.length) throw new Error('Invalid ready gates');
      if (row.source.approval_status !== 'owner_verified' || !row.source.approved_by || !row.source.approved_at || !row.source.evidence_refs.length) throw new Error('Missing approval provenance');
    } else {
      if (row.sku !== null || row.brand !== null || row.price !== null || row.currency !== null || row.inventory_quantity !== null || row.inventory_checked_at !== null || row.availability !== 'unknown') throw new Error('Unverified commerce claim');
      const requiredBlockers = ['sku_mapping_required', 'confirmed_current_price_required', 'currency_required', 'inventory_verification_required', 'availability_verification_required', 'ads_feed_registration_required', 'brand_mapping_review_required', row.image_link ? 'ads_asset_approval_required' : 'confirmed_product_image_required'];
      if (!Array.isArray(row.blockers) || row.blockers.length !== requiredBlockers.length || row.blockers.some((value, index) => value !== requiredBlockers[index])) throw new Error('Invalid platform gates');
      if (row.platform_targets.length || row.source.evidence_refs.length) throw new Error('Unverified platform data');
    }
    if (!PRIORITY.has(row.category)) throw new Error('Invalid category');
  }
  if (feed.readiness_summary.candidates !== feed.items.length || feed.readiness_summary.platform_ready !== feed.items.filter(item => item.platform_ready).length || feed.readiness_summary.missing_images !== feed.items.filter(item => !item.image_link).length) throw new Error('Invalid readiness summary');
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
