---
name: haode-product-validator
description: HAODE product validation gate. Use before commit for product uploads, product edits, product route fixes, sitemap updates, asset checks, WhatsApp text checks, and website/app product sync validation.
---

# HAODE Product Validator

Use this skill before committing HAODE product-related work.

Validate:

- Duplicate SKU.
- Duplicate slug.
- Missing retail or wholesale price fields.
- Missing main image path.
- Empty video field as report-only unless the owner confirms video is required.
- Product data without a static product route.
- Static product route without matching product data.
- Missing sitemap entry for a real product route.
- Website/app product mismatch in `app/products.json`.
- WhatsApp order text exists and does not change the approved WhatsApp number.

Required workflow:

1. Identify the product data files, static route files, sitemap, image paths, video fields, and `app/products.json`.
2. Run duplicate checks for SKU and slug.
3. Verify price fields are present without changing values.
4. Verify asset paths exist; report missing video separately when video is not confirmed required.
5. Verify route, sitemap, website data, and app data are aligned.
6. Review diff for protected fields before commit.

Stop conditions:

- Duplicate SKU or slug.
- Missing required price field.
- Missing main image for a real product launch.
- Website/app mismatch.
- Product data and route mismatch.
- Unclear SKU, slug, category, price, image, video policy, product claim, or availability.

Forbidden actions:

- Do not infer product facts to satisfy validation.
- Do not change prices, images, videos, WhatsApp numbers, or product claims without owner confirmation.

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
