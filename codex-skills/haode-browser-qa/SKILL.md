---
name: haode-browser-qa
description: Use for HAODE website and app browser testing, post-deploy verification, cart validation, image checks, mobile QA, and GitHub Pages app path checks.
---

# HAODE Browser QA

Use this skill for HAODE website and APP page browser testing, post-deploy verification, shopping cart validation, image checks, and mobile QA.

## Trigger Conditions

- Homepage changes.
- APP page changes.
- Product card changes.
- Product image changes.
- Price display changes.
- Price logic changes.
- Quantity-price logic changes.
- Cart changes.
- WhatsApp checkout changes.
- Homepage banner or ofertas especiales changes.
- GitHub Pages deployment verification.

## Required Workflow

1. Read `AGENTS.md`, `GUIDELINES.md`, and `HAODE_RULES.md`.
2. Run `npm run build`.
3. Run `npm run browser-test`.
4. If a test fails, report the screenshot path or exact error reason.
5. If `browser-test` fails, do not commit or push unless the owner explicitly allows it.
6. Fix the scoped issue and rerun the failing check.
7. Finish with a QA report in Chinese.

## Required QA Report

- Build result.
- Browser-test result.
- Whether the live URL was checked.
- Whether broken images exist.
- Whether horizontal overflow exists.
- Whether incorrect oferta products exist.
- Whether follow-up fixes are needed.

## Key Checks

- Do not use incorrect product images.
- Do not change prices without owner confirmation.
- `Ofertas especiales` only shows owner-specified products.
- Do not auto-generate discount products.
- Do not randomly choose promotion products from normal products.
- Do not restore demo promotion data.
- Product cards show only menudeo / mayoreo price lines unless the current confirmed promotion requires another label.
- Cart applies price by quantity.
- WhatsApp order message uses the correct applied price.
- GitHub Pages path `/haode-web/app/` works.
- Images do not show obvious broken-image failures.
- Mobile viewport does not horizontally overflow.
- Cart quantity changes after `Agregar al carrito`.

## Commands

```bash
npm run build
npm run browser-test
BASE_URL=http://localhost:8000/haode-web/app/ npm run haode:app-qa
```

## Guardrails

- Do not modify product data during QA unless the task explicitly asks for a scoped repair.
- Do not modify prices.
- Do not replace product images.
- Do not redesign UI while testing.
- Do not commit unrelated business changes.
