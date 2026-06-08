---
name: haode-asset-manager
description: HAODE product asset guardrail. Use for product images, videos, image path repairs, video path repairs, media validation, new product launches, and any task that could replace or reuse product assets.
---

# HAODE Asset Manager

Use this skill for HAODE product images and videos.

Rules:

- Never reuse another product video unless the owner confirms.
- Never replace product images without owner confirmation.
- Check that every referenced product image and video path exists.
- Require a main product image for a real product launch.
- Allow "no video" only if the owner explicitly marks video as not required.
- For MICA and phone-film products, images must be confirmed real product images.

Required workflow:

1. Identify all affected image and video fields.
2. Confirm whether the task is a path repair, validation, or asset replacement.
3. Verify asset files exist at the referenced paths.
4. Verify images and videos match the exact product model or confirmed series.
5. Report missing or uncertain assets instead of substituting another product asset.

Forbidden actions:

- Do not use packaging or screen images as MICA/phone-film product images unless confirmed.
- Do not replace assets to make validation pass.
- Do not publish a real product launch without confirmed main image.

Auto-push:

- Low-risk path corrections may commit and push automatically after asset existence checks pass and no product identity changed.

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
