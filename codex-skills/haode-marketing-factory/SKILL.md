---
name: haode-marketing-factory
description: HAODE product marketing handoff workflow. Use after product facts, prices, assets, video policy, availability, and website/app product sync are confirmed when creating launch materials or campaign variants.
---

# HAODE Marketing Factory

Use only after product facts, prices, assets, video policy, availability, and website/app product sync are confirmed.

Produce Spanish customer-facing marketing materials such as:

- Facebook post copy.
- Instagram post copy.
- TikTok short-video script.
- WhatsApp broadcast copy.
- Product launch text.

Rules:

- Keep claims tied to confirmed product facts.
- Do not invent inventory, functions, discounts, prices, warranty, delivery terms, service scope, or availability.
- Keep tone professional and direct for Mexico repair and wholesale customers.
- Do not change WhatsApp numbers.
- Stop if product data is half-synced between website data and `app/products.json`.

Verification:

- Confirm no protected product facts were changed.
- Confirm price-sensitive claims match approved prices.
- Confirm image/video usage is confirmed when marketing output references product media.
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
