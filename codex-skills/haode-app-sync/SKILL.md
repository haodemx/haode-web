---
name: haode-app-sync
description: HAODE website/app product synchronization guardrail. Use for new product uploads, product sync, app/products.json updates, or any HAODE task where website product data must match the app catalog.
---

# HAODE App Sync

Use this skill whenever a HAODE task creates, uploads, synchronizes, or validates product data across the website and app.

Core rules:

- New product upload is never website-only.
- New product upload is never app-only.
- Treat `app/products.json` as the current app product data path.
- Keep `app/products.json` synchronized with website product data in the same workflow.
- If `app/products.json` is missing, stop and report the blocker.
- If SKU, price, category, image, video requirement, product claim, or availability is unclear, stop and ask owner confirmation.

Required workflow:

1. Locate website product data, product route files, sitemap entries, assets, and `app/products.json`.
2. Compare the website product record with the app product record before editing.
3. Apply product sync changes only when all protected fields are confirmed.
4. Verify website/app product equality for SKU, slug, title, category, prices, image path, video policy, route, and availability.
5. Block commit and push if website/app product data is incomplete or mismatched.

Forbidden actions:

- Do not modify prices without owner confirmation.
- Do not replace product images or videos without owner confirmation.
- Do not publish unclear claims, specs, availability, or category placement.
- Do not continue if the app product data path cannot be found or updated.

Auto-push:

- Low-risk website/app sync fixes may commit and push automatically only after validation passes and no protected field changed.

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
