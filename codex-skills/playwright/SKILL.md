---
name: playwright
description: Use when HAODE website QA needs browser automation, local preview checks, mobile viewport checks, broken link scans, screenshot verification, or regression evidence without changing product data, prices, images, videos, or customer-facing content.
---

# HAODE Playwright QA

Use this skill for conservative browser QA on HAODE website work.

Trigger conditions:
- Local preview, Browser, Chrome, or Playwright checks are requested.
- Mobile viewport, desktop viewport, screenshot, broken link, console error, or visual regression evidence is needed.
- GitHub Pages readiness needs browser-level proof.

Owner-confirmation stop conditions:
- Stop before changing prices, product facts, product names, SKU, slug, categories, availability, WhatsApp numbers, images, videos, claims, brand, company data, or store address.
- Stop if QA finds a product data mismatch that requires protected-field edits.
- Stop if required assets or product details are unclear.

Workflow:
1. Identify the exact changed pages or routes before opening a browser.
2. Prefer local preview for unpublished work; verify live pages only when deployment checking is in scope.
3. Check desktop and mobile viewport behavior.
4. Capture screenshots or page evidence for visual regressions.
5. Check key links for 404s and broken navigation.
6. Check console errors only as evidence; do not rewrite unrelated code.
7. Report failing routes, viewport, screenshot path, and suspected source file.

Forbidden actions:
- Do not modify product data, prices, images, videos, WhatsApp numbers, or customer-facing copy.
- Do not invent product claims, promotions, stock, warranty, or service scope.
- Do not auto-fix protected fields without owner confirmation.
- Do not commit or push product/page content changes from QA alone.
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
