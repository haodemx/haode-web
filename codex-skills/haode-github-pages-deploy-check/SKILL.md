---
name: haode-github-pages-deploy-check
description: HAODE GitHub Pages deployment readiness check. Use after commit/push, before final report, or for website QA involving origin/main sync, public page availability, sitemap, canonical URLs, and forbidden string scans.
---

# HAODE GitHub Pages Deploy Check

Use this skill after HAODE website commits and pushes, or before reporting deployment readiness.

Validate:

- Local `main` is synchronized with `origin/main`.
- Key local pages return 200 or open successfully.
- Customer-facing pages do not contain forbidden strings: `file://`, `localhost`, `127.0.0.1`, `/Users/mac`, `squarespace`, `under construction`.
- Sitemap URLs match the active GitHub Pages deployment.
- Canonical and Open Graph URLs do not point to local paths or inactive domains.
- GitHub Pages-compatible paths are preserved.

Required workflow:

1. Run `git status --short --branch`.
2. Confirm branch and upstream sync after commit and push.
3. Verify key pages locally.
4. Scan customer-facing files for forbidden strings.
5. Check sitemap and canonical URL consistency.
6. Report deployment readiness and any blockers in Chinese.

Forbidden actions:

- Do not rewrite deployment paths broadly unless the task explicitly requires it.
- Do not point canonical, OG, navigation, or sitemap to unverified domains.

Auto-push:

- If checks pass and the task is low-risk, push to `origin main` according to HAODE policy.

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
