---
name: haode-product-control-center
description: HAODE product data control workflow. Use automatically for HAODE tasks involving products, anomalies, descriptions, category/detail/list consistency, SKU/slug validation, image/video matching, website/app sync, duplicate fixes, or app/products.json.
---

# HAODE Product Control Center

For product-related work:

1. Identify product source data, list pages, category pages, detail pages, static routes, sitemap, images, videos, and `app/products.json`.
2. Confirm product model names, SKU, slug, category placement, availability, and product claims.
3. Keep product list, category page, detail page, sitemap, and app information consistent.
4. Preserve existing products unless the task explicitly requires a confirmed change.
5. Keep placeholders when product images are not confirmed.
6. Report any unconfirmed product facts, images, or video matches.
7. For every new product upload, require website product data and `app/products.json` to be updated together.
8. Treat website-only or app-only product uploads as incomplete and block commit/push until synchronized.
9. Stop if `app/products.json` is missing during product upload or product sync work.

Validation:

- Check duplicate SKU and duplicate slug.
- Check required price fields exist without changing values.
- Check product data has a matching static route and real product routes have product data.
- Check website/app product consistency.

Do not change prices, delete products, replace images or videos, change WhatsApp numbers, or publish unconfirmed product facts without required confirmation.
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
