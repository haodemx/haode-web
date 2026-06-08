---
name: creative-production
description: Use when HAODE needs marketing banners, product launch visuals, social content, campaign creative, Remotion video planning, or design handoff while avoiding unsupported product claims and protected-field changes.
---

# HAODE Creative Production

Use this skill for HAODE marketing and visual-production planning.

Trigger conditions:
- The task asks for marketing banners, social posts, product launch visuals, campaign concepts, visual handoff, or Remotion video planning.
- The work needs Spanish customer-facing copy or Chinese boss reports.
- Creative output depends on confirmed product facts, prices, assets, or campaign scope.

Owner-confirmation stop conditions:
- Stop if price, discount, product claim, availability, warranty, stock, image, video, SKU, category, WhatsApp number, brand, company data, or store address is unclear.
- Stop if requested creative requires unconfirmed product images or videos.
- Stop if a promotion, guarantee, or feature is not explicitly confirmed.

Workflow:
1. Confirm the product facts, target audience, channel, format, and approved assets.
2. Keep customer-facing copy in Spanish and boss reports in Chinese.
3. Use existing HAODE brand identity: orange circular H badge, orange uppercase HAODE, CALIDAD PROFESIONAL.
4. For Remotion planning, define scenes, timing, captions, asset needs, and verification steps before production.
5. Note missing confirmations as blockers rather than filling gaps.

Forbidden actions:
- Do not invent stock, features, prices, discounts, warranties, delivery promises, or service scope.
- Do not replace or upload product images or videos without owner confirmation.
- Do not change product data, prices, website page content, or WhatsApp numbers.
- Do not publish creative that conflicts with confirmed HAODE product data.
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
