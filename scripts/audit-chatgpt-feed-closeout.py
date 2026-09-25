#!/usr/bin/env python3
import argparse
import hashlib
import json
import re
import unicodedata
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATEGORY_SHEETS = {
    'micas': '01 HIDROGEL',
    'iphone-incell': '03 IPHONE INCELL',
    'iphone-oled': '04 IPHONE OLED',
    'oled-diagnostica': '05 IPHONE DIAGNOSTICO',
    'samsung-incell': '06 SAMSUNG INCELL',
    'samsung-oled': '07 SAMSUNG OLED',
    'samsung-tipo-original': '08 SAMSUNG ORIGINAL',
}
TIER_NAMES = ('retail', 'wholesale', 'box', 'vip')
IMAGE_QC_OVERRIDES = {
    'iphone-incell-11-bolsa-protectora': (
        'QC_FAIL_PROMO_WRONG_MAIN_IMAGE',
        'The current file is a shared iPhone 11/XR promotion containing a price, stock and warranty claims; it is not a single-product main image.',
    ),
    'iphone-incell-xr-bolsa-protectora': (
        'QC_FAIL_PROMO_WRONG_MAIN_IMAGE',
        'The current file is a shared iPhone 11/XR promotion containing a price, stock and warranty claims; it is not a single-product main image.',
    ),
    'samsung-oled-note-20': (
        'QC_FAIL_WRONG_MODEL',
        'The image is byte-identical to samsung-incell-s23-ultra and visibly identifies SM-S23U, not Note 20.',
    ),
    'samsung-incell-note-10-lite': (
        'QC_FAIL_WRONG_MODEL',
        'The shared image visibly identifies SM-N10+; it does not verify Note 10 Lite.',
    ),
    'samsung-incell-note-20': (
        'QC_FAIL_WRONG_MODEL',
        'The shared image visibly identifies SM-N10+; it does not verify Note 20.',
    ),
    'samsung-incell-s10-lite': (
        'QC_FAIL_WRONG_MODEL',
        'The shared image visibly identifies SM-N10+; it does not verify S10 Lite.',
    ),
    'samsung-oled-s21-ultra': (
        'MANUAL_REVIEW_CROSS_QUALITY',
        'Byte-identical to the same-model Original listing; the photo does not independently prove the OLED quality tier.',
    ),
    'samsung-original-s21-ultra': (
        'MANUAL_REVIEW_CROSS_QUALITY',
        'Byte-identical to the same-model OLED listing; the photo does not independently prove the Original quality tier.',
    ),
    'samsung-oled-s22-ultra': (
        'MANUAL_REVIEW_CROSS_QUALITY',
        'Byte-identical to the same-model Original listing; the photo does not independently prove the OLED quality tier.',
    ),
    'samsung-original-s22-ultra': (
        'MANUAL_REVIEW_CROSS_QUALITY',
        'Byte-identical to the same-model OLED listing; the photo does not independently prove the Original quality tier.',
    ),
    'samsung-oled-s23-ultra': (
        'MANUAL_REVIEW_CROSS_QUALITY',
        'Byte-identical to the same-model Original listing; the photo does not independently prove the OLED quality tier.',
    ),
    'samsung-original-s23-ultra': (
        'MANUAL_REVIEW_CROSS_QUALITY',
        'Byte-identical to the same-model OLED listing; the photo does not independently prove the Original quality tier.',
    ),
    'haode-pantalla-oled-diagnostica-modelo-13': (
        'MANUAL_REVIEW_SHARED_SERIES',
        'The packaging names both iPhone 13 and 13 Pro; approval for reuse by both listings is not documented.',
    ),
    'haode-pantalla-oled-diagnostica-modelo-13-pro': (
        'MANUAL_REVIEW_SHARED_SERIES',
        'The packaging names both iPhone 13 and 13 Pro; approval for reuse by both listings is not documented.',
    ),
    'haode-pantalla-oled-diagnostica-modelo-14': (
        'MANUAL_REVIEW_SHARED_SERIES',
        'The packaging names both iPhone 14 and 14 Pro; approval for reuse by both listings is not documented.',
    ),
    'haode-pantalla-oled-diagnostica-modelo-14-pro': (
        'MANUAL_REVIEW_SHARED_SERIES',
        'The packaging names both iPhone 14 and 14 Pro; approval for reuse by both listings is not documented.',
    ),
}


def sha256(path):
    digest = hashlib.sha256()
    with path.open('rb') as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b''):
            digest.update(chunk)
    return digest.hexdigest()


def structured_pages_sha256(product_ids):
    digest = hashlib.sha256()
    for product_id in sorted(product_ids):
        page_hash = sha256(ROOT / 'producto' / product_id / 'index.html')
        digest.update(f'{product_id}\0{page_hash}\n'.encode('utf-8'))
    return digest.hexdigest()


def candidate_primary_assets_fingerprint(products, product_ids):
    by_id = {product['id']: product for product in products}
    product_ids = sorted(product_ids)
    digest = hashlib.sha256()
    existing_files = 0
    for product_id in product_ids:
        main = (by_id[product_id].get('images') or [None])[0]
        safe_path = isinstance(main, str) and not Path(main).is_absolute() and '..' not in Path(main).parts
        file_path = ROOT / main if safe_path else None
        exists = bool(file_path and file_path.is_file())
        file_hash = sha256(file_path) if exists else None
        existing_files += exists
        digest.update((json.dumps([product_id, main, exists, file_hash], ensure_ascii=False, separators=(',', ':')) + '\n').encode('utf-8'))
    return {'candidates': len(product_ids), 'existing_files': existing_files, 'sha256': digest.hexdigest()}


def normalize(value):
    text = unicodedata.normalize('NFKD', str(value or ''))
    text = ''.join(char for char in text if not unicodedata.combining(char)).lower()
    text = text.replace('＋', '+').replace('+', 'plus')
    text = re.sub(r'\b(?:iphone|samsung|modelo|pantalla|para)\b', ' ', text)
    return re.sub(r'[^a-z0-9]+', '', text)


def model_key(value):
    text = normalize(value)
    if 'x200t' in text:
        return 'x200t'
    aliases = {
        'note10plus': 'note10plus',
        'note10lite': 'note10lite',
        's20fe': 's20fe',
    }
    return aliases.get(text, text)


def quality_family(value):
    text = normalize(value)
    if 'equipo' in text:
        return 'equipment'
    if 'paquete50pzs' in text or 'contenido50pzs' in text:
        return 'pack_50'
    if 'diagnostico' in text or 'diagnotico' in text:
        return 'diagnostic_soft_oled' if 'soft' in text else 'diagnostic_hard_oled'
    if 'softoled' in text:
        return 'soft_oled'
    if 'hardoled' in text:
        return 'hard_oled'
    if 'tipooriginal' in text or text == 'originalcm':
        return 'original'
    if 'incell' in text and text.endswith('sm'):
        return 'incell_sm'
    if 'incellhdplus' in text:
        return 'incell_hd_plus'
    if 'incell' in text:
        return 'incell_fhd'
    if 'amoled' in text:
        return 'amoled_premium'
    if 'oledpremium' in text:
        return 'oled_premium'
    if 'oledconmarco' in text:
        return 'oled_with_frame'
    return text or 'unknown'


def parse_money(value):
    if isinstance(value, (int, float)):
        return round(float(value), 2)
    match = re.search(r'([0-9][0-9,]*(?:\.[0-9]+)?)', str(value or ''))
    return round(float(match.group(1).replace(',', '')), 2) if match else None


def feed_price_matches(feed_price, customer_retail):
    feed_price = feed_price or {}
    feed_amount = parse_money(feed_price.get('amount'))
    return bool(
        feed_amount is not None
        and feed_amount > 0
        and customer_retail is not None
        and customer_retail > 0
        and feed_price.get('currency') == 'MXN'
        and feed_amount == customer_retail
    )


def product_rows(workbook_path, include_internal=False):
    from openpyxl import load_workbook

    workbook = load_workbook(workbook_path, data_only=True, read_only=False)
    rows = []
    for worksheet in workbook.worksheets[1:]:
        for row_number in range(7, worksheet.max_row + 1):
            model = worksheet.cell(row_number, 1).value
            quality = worksheet.cell(row_number, 2).value
            brand = worksheet.cell(row_number, 3).value
            if not (model and quality and brand):
                continue
            row = {
                'sheet': worksheet.title,
                'row': row_number,
                'model': str(model).strip(),
                'model_key': model_key(model),
                'quality': str(quality).strip(),
                'quality_family': quality_family(quality),
                'brand': str(brand).strip(),
                'tiers': tuple(parse_money(worksheet.cell(row_number, column).value) for column in range(4, 8)),
            }
            if include_internal:
                row['cost'] = parse_money(worksheet.cell(row_number, 8).value)
                row['inventory'] = worksheet.cell(row_number, 9).value
            rows.append(row)
    return rows


def read_products():
    source = (ROOT / 'data/products.generated.js').read_text(encoding='utf-8')
    return json.loads(source[source.index('['):source.rindex(']') + 1])


def app_tiers(product):
    tiers = {
        'retail': parse_money(product.get('precioPublico')),
        'wholesale': parse_money(product.get('precioMayoreo')),
        'box': None,
        'vip': None,
    }
    for tier in product.get('priceTiers') or []:
        code = str(tier.get('code') or '').lower()
        if code in tiers:
            tiers[code] = parse_money(tier.get('price'))
    return tuple(tiers[name] for name in TIER_NAMES)


def site_tiers(product):
    by_label = {str(item.get('quantity') or '').lower(): parse_money(item.get('price')) for item in product.get('prices') or []}
    return (
        by_label.get('menudeo'),
        by_label.get('mayoreo'),
        by_label.get('caja'),
        next((value for label, value in by_label.items() if 'vip' in label), None),
    )


def product_json_ld(html):
    scripts = re.findall(r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>', html, re.I | re.S)
    for script in scripts:
        try:
            value = json.loads(script)
        except json.JSONDecodeError:
            continue
        candidates = value.get('@graph', []) if isinstance(value, dict) and '@graph' in value else [value]
        for candidate in candidates:
            types = candidate.get('@type') if isinstance(candidate, dict) else None
            if types == 'Product' or isinstance(types, list) and 'Product' in types:
                return candidate
    return None


def structured_tiers(product_id):
    html = (ROOT / 'producto' / product_id / 'index.html').read_text(encoding='utf-8')
    product = product_json_ld(html)
    if not product:
        return None
    offers = product.get('offers') or []
    if isinstance(offers, dict):
        offers = [offers]
    values = [parse_money(item.get('price')) for item in offers if isinstance(item, dict)]
    return tuple(values[:4]) if len(values) >= 4 else None


def mismatch_fields(left, right):
    if left is None or right is None:
        return list(TIER_NAMES)
    return [name for name, a, b in zip(TIER_NAMES, left, right) if a != b]


def commerce_difference_class(site_values, app_values, structured_values, source_values):
    if site_values == app_values == structured_values == source_values:
        return 'aligned'
    if site_values != app_values or site_values != structured_values:
        return 'public_surface_divergence'
    site_fields = mismatch_fields(site_values, source_values)
    if site_fields == ['vip']:
        return 'vip_only_policy_difference_do_not_export'
    return 'new_source_revision_requires_public_price_approval'


def choose_workbook_row(product, rows):
    candidates = [row for row in rows if row['sheet'] == CATEGORY_SHEETS[product['category']] and row['model_key'] == model_key(product.get('model'))]
    if len(candidates) == 1:
        return candidates[0]
    wanted = quality_family(product.get('quality'))
    exact = [row for row in candidates if row['quality_family'] == wanted]
    return exact[0] if len(exact) == 1 else None


def inventory_snapshot(sheet):
    return '2026-09-23' if sheet == '01 HIDROGEL' else '2026-09-14'


def image_metadata(path):
    from PIL import Image

    with Image.open(path) as image:
        return {'width': image.width, 'height': image.height, 'format': image.format, 'has_alpha': 'A' in image.getbands()}


def build_audit(customer_path, owner_path, expected_cost_confirmations, public_price_confirmed=False):
    feed = json.loads((ROOT / 'data/marketing/chatgpt-product-feed.json').read_text(encoding='utf-8'))
    products = read_products()
    product_by_id = {product['id']: product for product in products}
    app = json.loads((ROOT / 'app/products.json').read_text(encoding='utf-8'))
    app_by_id = {product['id']: product for product in app}
    customer_rows = product_rows(customer_path)
    owner_rows = product_rows(owner_path, include_internal=True)
    owner_by_coordinate = {(row['sheet'], row['row']): row for row in owner_rows}
    customer_hash = sha256(customer_path)
    owner_hash = sha256(owner_path)
    website_source_path = ROOT / 'data/products.generated.js'
    app_source_path = ROOT / 'app/products.json'
    feed_source_path = ROOT / 'data/marketing/chatgpt-product-feed.json'
    asset_qc_path = ROOT / 'data/marketing/chatgpt-feed-asset-qc.json'
    feed_product_ids = [item['id'] for item in feed['items']]
    primary_assets_fingerprint = candidate_primary_assets_fingerprint(products, feed_product_ids)

    approved_asset_path = ROOT / 'docs/reports/hydrogel-asset-owner-review-20260918.json'
    approved_manifest = json.loads(approved_asset_path.read_text(encoding='utf-8'))
    approved = {item['filePath']: item for item in approved_manifest['assets'] if item.get('sourceConfirmed') and item.get('qcPass') and item.get('approvedForWeb')}

    image_hash_to_ids = defaultdict(list)
    image_path_to_ids = defaultdict(list)
    image_records = {}
    for item in feed['items']:
        product = product_by_id[item['id']]
        main = (product.get('images') or [None])[0]
        if not isinstance(main, str) or not re.fullmatch(r'assets/products/[a-zA-Z0-9_./-]+\.(?:jpg|jpeg|png|webp)', main) or '..' in Path(main).parts or 'placeholder' in main.lower():
            continue
        relative = main
        file_path = ROOT / relative
        if not file_path.is_file():
            continue
        digest = sha256(file_path)
        image_hash_to_ids[digest].append(item['id'])
        image_path_to_ids[relative].append(item['id'])
        image_records[item['id']] = (relative, digest, image_metadata(file_path))

    duplicate_groups = []
    for digest, ids in sorted(image_hash_to_ids.items()):
        if len(ids) > 1:
            duplicate_groups.append({'sha256': digest, 'ids': sorted(ids), 'kind': 'exact_bytes'})

    rows = []
    mapped_coordinates = set()
    for feed_item in feed['items']:
        product = product_by_id[feed_item['id']]
        app_product = app_by_id.get(feed_item['id'])
        customer = choose_workbook_row(product, customer_rows)
        owner = owner_by_coordinate.get((customer['sheet'], customer['row'])) if customer else None
        if customer:
            mapped_coordinates.add((customer['sheet'], customer['row']))
        site_values = site_tiers(product)
        app_values = app_tiers(app_product) if app_product else None
        structured_values = structured_tiers(feed_item['id'])
        website_mismatch = mismatch_fields(site_values, customer['tiers'] if customer else None)
        app_mismatch = mismatch_fields(app_values, customer['tiers'] if customer else None)
        structured_mismatch = mismatch_fields(structured_values, customer['tiers'] if customer else None)
        quality_state = 'unmapped'
        if customer:
            site_family = quality_family(product.get('quality'))
            source_family = customer['quality_family']
            quality_state = 'exact_or_semantic_match' if site_family == source_family or (
                product['category'] == 'iphone-incell' and site_family == 'incell_fhd' and source_family in {'incell_fhd', 'incell_hd_plus'}
            ) else 'review_required'

        image = {
            'status': 'ASSET_MISSING',
            'approval': 'REAL_ASSET_REQUIRED',
            'qc_status': 'ASSET_MISSING',
            'qc_evidence': 'No verified public image path is present; an exact model-and-quality real product photo is required.',
        }
        if feed_item['id'] in image_records:
            relative, digest, metadata = image_records[feed_item['id']]
            approval = approved.get(relative)
            qc_status, qc_evidence = IMAGE_QC_OVERRIDES.get(feed_item['id'], (
                'QC_PASS_APPROVED_FOR_WEB' if approval and approval['sha256'] == digest else 'SOURCE_UNCONFIRMED',
                'Matches the owner-reviewed asset manifest.' if approval and approval['sha256'] == digest else 'A public file exists, but current source confirmation, QC pass and web approval evidence are incomplete.',
            ))
            image = {
                'status': 'existing_public_asset',
                'path': relative,
                'sha256': digest,
                **metadata,
                'approval': 'APPROVED_FOR_WEB' if approval and approval['sha256'] == digest else 'SOURCE_UNCONFIRMED',
                'qc_status': qc_status,
                'qc_evidence': qc_evidence,
                'shared_exact_bytes': len(image_hash_to_ids[digest]) > 1,
                'shared_path': len(image_path_to_ids[relative]) > 1,
            }

        feed_price = feed_item.get('price') or {}
        customer_retail = customer['tiers'][0] if customer else None
        feed_price_matches_customer = feed_price_matches(feed_price, customer_retail)

        rows.append({
            'id': feed_item['id'],
            'category': feed_item['category'],
            'model': product.get('model'),
            'quality': product.get('quality'),
            'official_sku_status': 'pending' if product.get('officialSkuPending') else 'existing_id_only',
            'customer_source': {'sheet': customer['sheet'], 'row': customer['row'], 'workbook_sha256': customer_hash} if customer else None,
            'owner_source': {'sheet': owner['sheet'], 'row': owner['row'], 'workbook_sha256': owner_hash} if owner else None,
            'model_mapping': 'exact' if customer else 'unmapped',
            'quality_mapping': quality_state,
            'currency': 'MXN' if customer else None,
            'unit': 'equipment' if feed_item['id'] == 'x200t-cortadora-micas' else 'pack_50' if feed_item['category'] == 'micas' else 'piece',
            'customer_owner_sales_tiers_match': bool(customer and owner and customer['tiers'] == owner['tiers']),
            'website_sales_tiers_match_customer': bool(customer and site_values == customer['tiers']),
            'app_sales_tiers_match_customer': bool(customer and app_values == customer['tiers']),
            'structured_data_tiers_match_customer': bool(customer and structured_values == customer['tiers']),
            'website_mismatch_fields': website_mismatch,
            'app_mismatch_fields': app_mismatch,
            'structured_data_mismatch_fields': structured_mismatch,
            'commerce_difference_class': commerce_difference_class(site_values, app_values, structured_values, customer['tiers'] if customer else None),
            'inventory_source': {
                'snapshot_date': inventory_snapshot(customer['sheet']) if customer else None,
                'current_live_verified': False,
                'feed_value': 'unknown',
            },
            'feed_price': 'confirmed_retail_mxn' if feed_price_matches_customer else 'customer_retail_mismatch',
            'feed_price_matches_customer': feed_price_matches_customer,
            'feed_availability': 'unknown',
            'platform_ready': False,
            'image': image,
        })

    excluded = []
    for source in customer_rows:
        coordinate = (source['sheet'], source['row'])
        if coordinate in mapped_coordinates:
            continue
        reason = 'category_not_in_feed_scope' if source['sheet'] == '02 PRODUCTOS AI' else 'no_matching_feed_candidate'
        excluded.append({
            'sheet': source['sheet'],
            'row': source['row'],
            'model': source['model'],
            'quality': source['quality'],
            'reason': reason,
        })

    owner_cost_checks = []
    for (sheet, key), expected in expected_cost_confirmations.items():
        match = next((row for row in owner_rows if row['sheet'] == sheet and row['model_key'] == key), None)
        owner_cost_checks.append({'sheet': sheet, 'model_key': key, 'confirmed_match': bool(match and match['cost'] == expected)})

    summary = {
        'feed_candidates': len(rows),
        'workbook_product_rows': len(customer_rows),
        'mapped_feed_rows': sum(row['model_mapping'] == 'exact' for row in rows),
        'unmapped_feed_rows': sum(row['model_mapping'] != 'exact' for row in rows),
        'workbook_rows_excluded_from_feed': len(excluded),
        'customer_owner_sales_tiers_match': sum(row['customer_owner_sales_tiers_match'] for row in rows),
        'website_sales_tiers_match_customer': sum(row['website_sales_tiers_match_customer'] for row in rows),
        'app_sales_tiers_match_customer': sum(row['app_sales_tiers_match_customer'] for row in rows),
        'structured_data_tiers_match_customer': sum(row['structured_data_tiers_match_customer'] for row in rows),
        'quality_mapping_review_required': sum(row['quality_mapping'] == 'review_required' for row in rows),
        'unit_currency_mapping_complete': sum(row['currency'] == 'MXN' and row['unit'] in {'piece', 'pack_50', 'equipment'} for row in rows),
        'feed_price_matches_customer': sum(row['feed_price_matches_customer'] for row in rows),
        'existing_public_images': sum(row['image']['status'] == 'existing_public_asset' for row in rows),
        'asset_missing': sum(row['image']['status'] == 'ASSET_MISSING' for row in rows),
        'feed_usable_images': sum(item['image_link'] is not None for item in feed['items']),
        'feed_image_blockers': sum(item['image_link'] is None for item in feed['items']),
        'approved_for_web_assets': sum(row['image']['approval'] == 'APPROVED_FOR_WEB' for row in rows),
        'source_unconfirmed_assets': sum(row['image']['approval'] == 'SOURCE_UNCONFIRMED' for row in rows),
        'asset_qc_fail': sum(row['image']['qc_status'].startswith('QC_FAIL_') for row in rows),
        'asset_manual_review': sum(row['image']['qc_status'].startswith('MANUAL_REVIEW_') for row in rows),
        'exact_duplicate_asset_groups': len(duplicate_groups),
        'platform_ready': sum(row['platform_ready'] for row in rows),
        'owner_confirmed_cost_checks': sum(item['confirmed_match'] for item in owner_cost_checks),
        'price_source_revision_review': sum(row['commerce_difference_class'] == 'new_source_revision_requires_public_price_approval' for row in rows),
        'vip_only_policy_difference': sum(row['commerce_difference_class'] == 'vip_only_policy_difference_do_not_export' for row in rows),
        'public_surface_divergence': sum(row['commerce_difference_class'] == 'public_surface_divergence' for row in rows),
    }
    price_gates_pass = bool(rows) and all(
        row['model_mapping'] == 'exact'
        and row['customer_owner_sales_tiers_match']
        and row['website_sales_tiers_match_customer']
        and row['app_sales_tiers_match_customer']
        and row['structured_data_tiers_match_customer']
        and row['feed_price_matches_customer']
        for row in rows
    )
    public_price_sync_confirmed = bool(public_price_confirmed and price_gates_pass)
    return {
        'schema_version': 2,
        'audit_date': '2026-09-24',
        'status': 'PUBLIC_PRICE_SYNC_CONFIRMED' if public_price_sync_confirmed else 'PUBLIC_PRICE_SYNC_NOT_CONFIRMED',
        'sources': {
            'customer_workbook': {
                'sha256': customer_hash,
                'product_rows': len(customer_rows),
                'confirmation': 'USER_CONFIRMED_PUBLIC_PRICE_SYNC' if public_price_confirmed else 'PUBLIC_PRICE_CONFIRMATION_REQUIRED',
                'public_price_tier_approved': public_price_sync_confirmed,
            },
            'owner_workbook': {'sha256': owner_hash, 'product_rows': len(owner_rows), 'private_values_exported': False},
            'website': {'path': 'data/products.generated.js', 'sha256': sha256(website_source_path)},
            'app': {'path': 'app/products.json', 'sha256': sha256(app_source_path)},
            'structured_data': {
                'path': 'producto/{id}/index.html',
                'product_pages': len(rows),
                'sha256': structured_pages_sha256(row['id'] for row in rows),
            },
            'feed': {'path': 'data/marketing/chatgpt-product-feed.json', 'sha256': sha256(feed_source_path)},
            'asset_qc_policy': {'path': 'data/marketing/chatgpt-feed-asset-qc.json', 'sha256': sha256(asset_qc_path)},
            'approved_asset_manifest': {'path': 'docs/reports/hydrogel-asset-owner-review-20260918.json', 'sha256': sha256(approved_asset_path)},
            'candidate_primary_assets': primary_assets_fingerprint,
        },
        'summary': summary,
        'owner_cost_confirmation_checks': owner_cost_checks,
        'excluded_workbook_rows': excluded,
        'exact_duplicate_asset_groups': duplicate_groups,
        'items': rows,
    }


def markdown(audit):
    summary = audit['summary']
    missing = [item for item in audit['items'] if item['image']['status'] == 'ASSET_MISSING']
    quality = [item for item in audit['items'] if item['quality_mapping'] == 'review_required']
    price_mismatch = [item for item in audit['items'] if not item['website_sales_tiers_match_customer'] or not item['app_sales_tiers_match_customer'] or not item['structured_data_tiers_match_customer']]
    image_findings = [item for item in audit['items'] if item['image']['qc_status'].startswith(('QC_FAIL_', 'MANUAL_REVIEW_'))]
    lines = [
        '# ChatGPT Feed 收尾审计（脱敏）', '',
        f"状态：**{audit['status']}**。本报告不包含成本、库存数量或任何价格数值；库存、图片和 Feed 就绪状态未开放。", '',
        '## 结论', '',
        f"- Feed 候选：{summary['feed_candidates']}；两份工作簿产品行：{summary['workbook_product_rows']}；逐项映射：{summary['mapped_feed_rows']}；未映射：{summary['unmapped_feed_rows']}。",
        f"- 工作簿有 {summary['workbook_rows_excluded_from_feed']} 行不属于 146 候选，保留为排除项，没有强行配对。",
        f"- 客户表与老板表四档销售价一致：{summary['customer_owner_sales_tiers_match']}/{summary['feed_candidates']}。",
        f"- 官网 / App / 结构化数据与 2026-09-24 客户表四档一致：{summary['website_sales_tiers_match_customer']} / {summary['app_sales_tiers_match_customer']} / {summary['structured_data_tiers_match_customer']}。",
        (f"- Feed Menudeo 价与客户表逐项一致：{summary['feed_price_matches_customer']}/{summary['feed_candidates']}；已满足确认门槛。"
         if audit['status'] == 'PUBLIC_PRICE_SYNC_CONFIRMED'
         else f"- Feed Menudeo 价与客户表逐项一致：{summary['feed_price_matches_customer']}/{summary['feed_candidates']}；未满足确认门槛，不得视为已批准。"),
        f"- 差异归类：{summary['price_source_revision_review']} 项仍有新价格来源版本差异；{summary['vip_only_policy_difference']} 项仅 VIP 档不同；跨公开表面自身不一致：{summary['public_surface_divergence']}。",
        f"- 现有公开图片：{summary['existing_public_images']}；缺图：{summary['asset_missing']}；具有当前审批证据：{summary['approved_for_web_assets']}；仅有公开路径、缺少标准化审批证据：{summary['source_unconfirmed_assets']}。",
        f"- 现有图片中明确 QC 失败：{summary['asset_qc_fail']}；需按系列/品质人工确认：{summary['asset_manual_review']}。这些状态不改变原公开文件，只阻止把它们视为可交付广告素材。",
        f"- Feed 允许保留的图片：{summary['feed_usable_images']}；图片阻塞：{summary['feed_image_blockers']}（14 项物理缺图 + 6 项 QC 拒绝）。",
        f"- Feed 已带确认的 Menudeo 价；availability=unknown、platform_ready=false；可上传：{summary['platform_ready']}。", '',
        '## 缺图与最小补拍需求', '',
        '以下均为现有产品 ID，不是已确认的官方 SKU；14 项的官方 SKU 仍为 pending。', '',
        '| 产品 ID | 型号 | 品质 | 最小补拍需求 |', '| --- | --- | --- | --- |',
    ]
    for item in missing:
        lines.append(f"| `{item['id']}` | {item['model']} | {item['quality']} | 同一产品、同一型号与同一品质的真实正面主图；完整产品入镜，文字/Logo/排线不遮挡，建议原图短边 ≥1200px；附包装或标签同框作为型号证据。 |")
    lines.extend(['', '## 品质映射需人工确认', ''])
    if quality:
        lines.extend(['| 产品 ID | 官网品质 | 来源位置 |', '| --- | --- | --- |'])
        for item in quality:
            source = item['customer_source']
            lines.append(f"| `{item['id']}` | {item['quality']} | {source['sheet']} 第 {source['row']} 行 |")
    else:
        lines.append('- 无。')
    lines.extend(['', '## 四方价格一致性差异（不含数值）', ''])
    lines.append(f"- 存在官网、App 或结构化数据与客户表不一致的候选：{len(price_mismatch)}。")
    lines.extend(['', '| 产品 ID | 分类 | 官网差异档 | App 差异档 | 结构化数据差异档 |', '| --- | --- | --- | --- | --- |'])
    for item in price_mismatch:
        lines.append(f"| `{item['id']}` | {item['commerce_difference_class']} | {', '.join(item['website_mismatch_fields']) or '-'} | {', '.join(item['app_mismatch_fields']) or '-'} | {', '.join(item['structured_data_mismatch_fields']) or '-'} |")
    lines.extend(['', '## 工作簿排除项', '', '| 来源位置 | 型号 | 品质 | 原因 |', '| --- | --- | --- | --- |'])
    for item in audit['excluded_workbook_rows']:
        lines.append(f"| {item['sheet']} 第 {item['row']} 行 | {item['model']} | {item['quality']} | {item['reason']} |")
    lines.extend(['', '## 素材 QC 边界', '',
        '- Hydrogel 四款与 X200T 的当前主图 SHA256 匹配 2026-09-18 Owner review，记录为 APPROVED_FOR_WEB。',
        '- 其他现有图片只证明官网文件存在；没有符合当前标准的 SOURCE_CONFIRMED + QC_PASS + APPROVED_FOR_WEB 清单，因此保持 SOURCE_UNCONFIRMED。',
        f"- 当前发现 {summary['exact_duplicate_asset_groups']} 个跨 SKU 完全相同字节组；逐图检查后，明确错误与人工复核项如下。", '',
        '| 产品 ID | QC 状态 | 证据 |', '| --- | --- | --- |',
    ])
    for item in image_findings:
        lines.append(f"| `{item['id']}` | {item['image']['qc_status']} | {item['image']['qc_evidence']} |")
    lines.extend(['',
        '## 外部状态', '',
        '- Feed 上传：NOT RUN。',
        '- 广告启用与花费：NOT RUN。',
        '- 生产价格发布：待本次部署后验证；库存/图片写入：NOT RUN。',
    ])
    return '\n'.join(lines) + '\n'


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--self-test', action='store_true')
    parser.add_argument('--customer', type=Path)
    parser.add_argument('--owner', type=Path)
    parser.add_argument('--private-cost-confirmations', type=Path)
    parser.add_argument('--public-price-confirmed', action='store_true')
    parser.add_argument('--json', default=ROOT / 'docs/chatgpt-ads/feed-closeout-audit.json', type=Path)
    parser.add_argument('--markdown', default=ROOT / 'docs/chatgpt-ads/feed-closeout-audit.md', type=Path)
    args = parser.parse_args()
    if args.self_test:
        source = (100, 90, 80, 70)
        assert commerce_difference_class(source, source, source, source) == 'aligned'
        assert commerce_difference_class((110, 90, 80, 70), (120, 90, 80, 70), (130, 90, 80, 70), source) == 'public_surface_divergence'
        assert commerce_difference_class((100, 90, 80, 75), (100, 90, 80, 75), (100, 90, 80, 75), source) == 'vip_only_policy_difference_do_not_export'
        assert commerce_difference_class((110, 90, 80, 70), (110, 90, 80, 70), (110, 90, 80, 70), source) == 'new_source_revision_requires_public_price_approval'
        assert feed_price_matches({'amount': 100, 'currency': 'MXN'}, 100)
        assert not feed_price_matches({'currency': 'MXN'}, None)
        assert not feed_price_matches({'amount': 100, 'currency': 'USD'}, 100)
        print('feed-closeout policy self-test: PASS')
        return
    if not args.customer or not args.owner or not args.private_cost_confirmations:
        parser.error('--customer, --owner and --private-cost-confirmations are required unless --self-test is used')
    private_checks = json.loads(args.private_cost_confirmations.read_text(encoding='utf-8'))
    expected_cost_confirmations = {
        (item['sheet'], item['model_key']): round(float(item['expected']), 2)
        for item in private_checks
    }
    audit = build_audit(args.customer, args.owner, expected_cost_confirmations, args.public_price_confirmed)
    args.json.write_text(json.dumps(audit, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    args.markdown.write_text(markdown(audit), encoding='utf-8')
    print(json.dumps(audit['summary'], ensure_ascii=False))


if __name__ == '__main__':
    main()
