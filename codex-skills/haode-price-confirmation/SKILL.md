---
name: haode-price-confirmation
description: HAODE price guardrail. Use automatically for any HAODE task involving retail price, wholesale price, discounts, promotions, product uploads, product edits, app/products.json, website/app sync, or price publication.
---

# HAODE Price Confirmation

Before any price-related change:

- Identify every affected price field and customer-visible price.
- Include website product data and `app/products.json` when product sync or upload is involved.
- Confirm whether the user explicitly requested the price change.
- Require boss confirmation for price modifications or price publication.
- Do not infer prices from competitors, suppliers, old files, images, screenshots, OCR, or marketing text.
- Do not silently normalize, recalculate, round, or migrate prices.

Stop conditions:

- Missing retail price or wholesale price for a real product upload.
- Price mismatch between website data and `app/products.json`.
- Any unclear discount, promotion, or price display.

If the task is not allowed to change prices, verify the diff does not alter prices.
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
