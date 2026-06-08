---
name: haode-batch-maintenance-orchestrator
description: HAODE batch maintenance orchestrator. Use for multi-file website/app repair batches, low-risk sync work, SEO or asset path batches, validation batches, commit/push automation, and protected-field stop decisions.
---

# HAODE Batch Maintenance Orchestrator

Use this skill to run HAODE maintenance batches without asking step by step.

Allowed low-risk batches:

- Verified website/app sync repairs that do not change protected product facts.
- SEO metadata repairs that do not invent claims.
- Asset path checks or path repairs with confirmed matching assets.
- Sitemap, robots, canonical, route, or 404 repairs that preserve deployment behavior.
- Rule and skill documentation updates.

Protected items must stop:

- Prices.
- Images.
- Videos.
- Product names.
- Specs.
- WhatsApp number.
- Customer data.
- Deleting files.
- Uncertain claims.
- Large structural rewrites.

Every batch must run:

1. `git status --short --branch`.
2. Local verification appropriate to the touched files.
3. `git diff --check`.
4. `git diff --stat`.
5. Commit only scoped files if checks pass.
6. Push if checks pass and HAODE policy allows auto-push.

Forbidden actions:

- Do not combine unrelated risky changes into a low-risk batch.
- Do not bypass owner confirmation for protected fields.
- Do not leave product upload half-synced between website data and `app/products.json`.

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
