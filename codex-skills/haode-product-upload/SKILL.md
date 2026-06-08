---
name: haode-product-upload
description: HAODE new product upload workflow. Use when a HAODE task explicitly includes new product preparation, product upload, new product page creation, product listing publication, website/app sync, or app/products.json updates after facts, prices, and assets are confirmed.
---

# HAODE Product Upload

New product upload requires confirmed:

- Spanish title.
- Spanish description.
- Category.
- Retail price.
- Wholesale price.
- SKU and slug.
- Product image.
- Product video policy: confirmed video, confirmed no-video, or confirmed report-only blocker.
- SEO keywords.
- WhatsApp order text and approved WhatsApp number.
- Availability and product claims.

Execution requirements:

- Confirm material source first.
- Match images to the exact product model.
- Match videos to the product model or confirmed series.
- Keep product list, category page, detail page, sitemap, and app data consistent.
- Update website product data and `app/products.json` in the same workflow.
- New product upload is never website-only and never app-only.
- If `app/products.json` is missing or cannot be updated, stop.
- Verify website/app product consistency before commit and push.
- If images are not confirmed, keep placeholders and report the blocker.

Forbidden actions:

- Do not change prices, images, videos, WhatsApp numbers, category, SKU, slug, availability, or product claims without owner confirmation.
- Do not commit or push a half-synced product upload.
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
