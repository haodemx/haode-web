---
name: haode-asset-manager
description: Audit, map, validate, inventory, and prepare local previews for HAODE product and real-scene assets without publishing or approving uncertain products.
---

# HAODE Asset Manager

Use this skill for HAODE product images and videos.

Before acting, read `/Users/mac/Documents/haode/HAODE_ASSET_STANDARD.md`. It is the single authoritative asset standard. Do not create or apply a parallel standard.

Rules:

- Never reuse another product video unless the owner confirms.
- Never replace product images without owner confirmation.
- Check that every referenced product image and video path exists.
- Require a main product image for a real product launch.
- Allow "no video" only if the owner explicitly marks video as not required.
- For MICA and phone-film products, images must be confirmed real product images.

Required workflow:

1. Scan the scoped material roots without changing source files.
2. Record SHA256 and detect exact duplicates.
3. Detect perceptually similar images as review candidates, never as identity proof.
4. Record dimensions and flag low resolution.
5. Check true alpha and likely white, gray, beige, or rectangular backgrounds.
6. Suggest product/category and TYPE A/TYPE B/TYPE C/TYPE D mappings without inventing uncertain models.
7. Suggest canonical filenames without renaming RAW files.
8. Query website/App/ERP usage and distinguish referenced, unused, and missing paths.
9. Report missing real assets and transparent-cutout status.
10. Generate local contact sheets/previews and a machine-readable inventory.
11. Update `asset-manifest.json`; keep authenticity, cutout, normalization, and QC as separate fields.
12. Normalize only safe true-alpha sources to the 1200 x 1200 PNG master and transparent WebP standard.
13. For conversions, preserve RAW and use deterministic removal first; mark damaged edges, glass, flex cables, labels, logos, packaging text, or uncertain results `MANUAL_REVIEW`.
14. Run alpha-edge QC for halo/fringe, clipping, missing thin parts, white-object holes, and transparent/translucent loss signals.
15. Prepare the local V3 preview and browser-check desktop, mobile, full catalog, and required search terms.
16. Never publish, deploy, replace production assets, or mark an uncertain product/model `APPROVED`.

The repeatable file audit is `scripts/audit_assets.py`. Product-record normalization and manifest generation use `scripts/normalize_product_media.py`; browser evidence uses `scripts/capture_asset_preview.mjs`. All reports are technical evidence only; background classification, similarity, or a clean cutout do not prove product identity or approval.

Phase 2 website-first work uses `scripts/normalize_website_batch.py` with the existing V1 manifest and `website-usage.csv`; it must not rerun the historical-library audit. It may apply the local non-generative u2net model only to current Pantallas records with white, gray, beige, or uniform rectangular backgrounds. Source selection stays inside the exact product folder, prefers a higher-resolution simple-background source, and records source and target SHA256. Complex scenes, Promo main-image misuse, Hidrogel, Baterías, X200T, and uncertain AI products remain in their protected review states. Use `scripts/capture_website_batch_preview.mjs` for the six Phase 2 desktop/mobile screenshots and search QA.

Asset Factory batches use `scripts/run_asset_factory.py`. Import the Phase 1 inventory instead of rebuilding it, scan only configured historical/source roots plus `/Users/mac/Documents/haode/HAODE-MASTER-ASSETS/INBOX`, and preserve every source byte. The factory may create technical drafts and review evidence but must emit `approved-web-assets.csv` only for records satisfying `SOURCE_CONFIRMED + QC_PASS + APPROVED_FOR_WEB`. It never edits website pages, CSS, product data, SEO, deployment, or production state. Limit the owner queue to prioritized decisions; retain the larger technical backlog in the manifest.

Batch 2 provenance resolution uses `scripts/resolve_provenance_batch2.py` with the imported Batch 1 manifest. Promote a product source only when website, App, master CSV, price-list binding, exact asset path, Git history, and duplicate-chain identity agree. The generated `confirmed-assets.json` is the machine-readable approval registry; website consumers must enforce `provenance_status=CONFIRMED + qc_status=PASS + approved_for_web=true`. `MANUAL_REVIEW`, `LOW_RESOLUTION`, `REAL_ASSET_REQUIRED`, and rejected promo composites stay outside the homepage handoff.

Batch 3 current-website coverage uses `scripts/run_asset_factory_batch3.py`. It may approve a detail image only when the exact current website path, unique product media directory, App/master model and quality, price-list row, Git history, QC pass, and SHA identity all agree. Video matching requires either an exact SHA chain to one current product or an explicit quality directory plus one exact model; model-only and shared-series videos remain `AMBIGUOUS`. Generate poster frames from the real matched video and keep raw videos outside the Git website drop.

Runtime notes:

- Use the existing Pillow/NumPy runtime at `/Users/mac/Documents/haode/HAODE-AUTOMATION/TOOLS/rembg/.venv/bin/python`; do not install another image stack merely to run this workflow.
- `normalize_product_media.py` requires `--root`, `--output`, `--logo-svg`, and `--current-logo`; pass `--prior-audit` only to reuse a previously reviewed deterministic draft.
- Run the normalization command twice during final QA. The second run must report every unchanged cutout under `reused_outputs`.
- Run `capture_asset_preview.mjs PREVIEW_DIR SCREENSHOT_DIR` after the final manifest. It uses the installed local Google Chrome and fails on broken images or horizontal overflow.

Forbidden actions:

- Do not use packaging or screen images as MICA/phone-film product images unless confirmed.
- Do not replace assets to make validation pass.
- Do not publish a real product launch without confirmed main image.

Auto-push:

- Low-risk path corrections may commit and push automatically after asset existence checks pass and no product identity changed.

## Trigger Conditions

- Use when the task matches this skill description or HAODE rules explicitly name this workflow.
- Use when the task may touch HAODE website, app, product, SEO, QA, deployment, marketing, assets, or protected business data.

## Owner-Confirmation Stop Conditions

- Stop before changing prices, product facts, product names, SKU, slug, categories, availability, WhatsApp numbers, images, videos, claims, brand, company data, store address, customer data, or deleting files unless the owner explicitly confirms.
- Stop when required product/app sync data is missing, unclear, or conflicts across website data and app/products.json.
## Repository Mirror Guardrails

### Trigger Conditions

- Use when the task matches this skill description or HAODE rules explicitly name this workflow.
- Use when the task may touch HAODE website, app, product, SEO, QA, deployment, marketing, assets, or protected business data.

### Forbidden Actions

- Do not modify product data, prices, images, videos, WhatsApp numbers, customer-facing website pages, product claims, brand, company data, store address, or customer data unless the task explicitly requires it and owner confirmation exists for protected fields.
- Do not delete products, replace assets, invent product facts, invent promotions, or rewrite unrelated files to complete a task.

### Owner-Confirmation Stop Conditions

- Stop before changing prices, product facts, product names, SKU, slug, categories, availability, WhatsApp numbers, images, videos, claims, brand, company data, store address, customer data, or deleting files unless the owner explicitly confirms.
- Stop when required product/app sync data is missing, unclear, or conflicts across website product data and app/products.json.

### Verification Requirements

- Verify target rule or skill files were created or updated successfully.
- Run scoped checks before commit, including description length, required guardrail sections, `git diff --check`, `git diff --stat`, and `git status --short --branch`.
- Confirm no product data, prices, images, videos, WhatsApp numbers, product claims, or customer-facing website pages changed unless explicitly requested.

### Website/App Sync Rule

- For every new product upload or product sync task, website product data and `app/products.json` must be updated together.
- New product upload is never website-only and never app-only.
- `app/products.json` is the app product data path.
