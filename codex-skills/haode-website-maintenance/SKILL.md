---
name: haode-website-maintenance
description: HAODE website maintenance workflow. Use for product anomalies, page repairs, 404 fixes, image/video path fixes, mobile fixes, SEO meta repairs, sitemap fixes, app sync checks, GitHub Pages verification, or frontend stability issues.
---

# HAODE Website Maintenance

For website maintenance:

1. Locate the affected page and the real source file.
2. Inspect HTML, CSS, JavaScript, product data, static routes, sitemap, `app/products.json`, images, and video paths as relevant.
3. Make the smallest scoped fix.
4. Avoid unrelated redesigns or customer-facing content changes.
5. Verify pages open, images display, and buttons work.
6. Check mobile layout when UI is affected.
7. Preserve GitHub Pages deployment behavior.
8. For product upload or product sync work, verify website product data and `app/products.json` are updated together.

Required checks:

- Run local verification appropriate to changed files.
- Run `git diff --check`.
- Run `git diff --stat`.
- Scan changed customer-facing files for forbidden local strings when relevant.

Do not change prices, delete products, replace images or videos, change WhatsApp numbers, or alter product facts unless explicitly requested and confirmed.
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
