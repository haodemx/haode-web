---
name: haode-seo-quality-gate
description: HAODE SEO validation gate. Use before push for SEO fixes, sitemap/canonical work, product pages, landing pages, GitHub Pages readiness, JSON-LD checks, and customer-visible metadata validation.
---

# HAODE SEO Quality Gate

Use this skill before pushing HAODE SEO or page metadata changes.

Validate:

- Page title exists and matches confirmed page purpose.
- Meta description exists and does not invent claims.
- Canonical URL exists and points to the active deployment domain/path.
- Open Graph tags exist where relevant and do not point to local or inactive URLs.
- JSON-LD exists where relevant and parses as valid JSON.
- Sitemap includes intended public pages and excludes local paths.
- Redirect and noindex semantics on stub pages are preserved.

Required workflow:

1. Locate the affected HTML, sitemap, robots, canonical, OG, and JSON-LD blocks.
2. Parse JSON-LD with a real parser when JSON-LD changed.
3. Search customer-facing files for forbidden local or inactive strings.
4. Verify no product facts, claims, prices, availability, warranties, or business facts were invented.
5. Run `git diff --check` before commit and push.

Forbidden actions:

- Do not change product facts without owner confirmation.
- Do not invent SEO claims, stock, discounts, warranties, business hours, or service scope.
- Do not alter redirect or noindex behavior unless the task explicitly requires it.

Auto-push:

- Low-risk SEO metadata fixes may commit and push automatically after checks pass and protected facts are unchanged.

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
