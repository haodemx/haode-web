---
name: haode-marketing-design
description: HAODE promotion and marketing design workflow. Use for promotions, campaign visuals, social posts, WhatsApp broadcast copy, marketing assets, product marketing content, or launch copy that depends on confirmed product facts.
---

# HAODE Marketing Design

Marketing content rules:

- Write customer-facing content in Spanish.
- Target Mexico phone repair stores and wholesale/store customers.
- Use a professional, direct tone.
- Do not invent stock, features, discounts, prices, warranties, promotion terms, availability, delivery terms, or service scope.
- Use confirmed product facts and confirmed images only.
- Respect HAODE brand identity.
- Do not change WhatsApp numbers.

Before publishing product or promotion content:

1. Confirm product facts, prices, images, video policy, and availability.
2. Coordinate with product control for product consistency.
3. Coordinate with price confirmation for price-sensitive claims.
4. Use owner confirmation for uncertain claims or protected fields.

Auto-push:

- Low-risk marketing copy files may commit and push automatically only after protected facts are unchanged or confirmed.
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
