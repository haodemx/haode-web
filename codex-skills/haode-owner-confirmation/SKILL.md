---
name: haode-owner-confirmation
description: HAODE owner confirmation collector. Use when product, price, WhatsApp, image, video, SKU, slug, category, claim, availability, manual-only, or protected business fields are uncertain.
---

# HAODE Owner Confirmation

Use this skill to collect blockers that require boss or owner confirmation.

Require owner confirmation for:

- Price uncertainty or any price change.
- WhatsApp number uncertainty or WhatsApp number change.
- Product image uncertainty, replacement, or unconfirmed MICA/phone-film image.
- Product video uncertainty, reuse, replacement, or "no video required" decision.
- SKU, slug, category, product name, or spec uncertainty.
- Product claim, availability, warranty, stock, discount, delivery, or service-scope uncertainty.
- Manual-only items.
- Safe auto-fix later items that should not block unrelated low-risk work.
- Deleting files, deleting products, major structural rewrites, brand changes, company data changes, or store address changes.

Workflow:

1. Separate confirmed facts from uncertain items.
2. List protected blockers clearly in Chinese for the boss.
3. Continue only with unrelated low-risk changes if they do not touch protected fields.
4. Stop before commit/push when protected uncertainty affects the changed files.

Forbidden actions:

- Do not infer confirmation from old files, supplier pages, competitor pages, images, or marketing copy.
- Do not publish protected fields while waiting for confirmation.

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
