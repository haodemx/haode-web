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
5. Check true alpha and likely white, gray, or rectangular backgrounds.
6. Suggest product/category and TYPE A/TYPE B mappings without inventing uncertain models.
7. Suggest canonical filenames without renaming RAW files.
8. Query website/App/ERP usage and distinguish referenced, unused, and missing paths.
9. Report missing real assets and transparent-cutout status.
10. Generate local contact sheets/previews and a machine-readable inventory.
11. For conversions, preserve RAW and use deterministic removal first; mark damaged edges, glass, flex cables, labels, logos, packaging text, or uncertain results `MANUAL_REVIEW`.
12. Never publish, deploy, replace production assets, or mark an uncertain product/model `APPROVED`.

The repeatable V3 audit implementation is `scripts/audit_assets.py`. Its reports are technical evidence only; background classification and similarity scores do not prove product identity or approval.

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
