# HAODE Website Rules

This repository follows:

- `/Users/mac/Documents/haode/AGENTS.md`
- `/Users/mac/Documents/haode/GUIDELINES.md`
- `/Users/mac/Documents/haode/HAODE_RULES.md`

Required website workflow:

1. Read existing structure first.
2. Make the smallest scoped change.
3. Verify desktop/mobile page effect when UI is affected.
4. Check links, assets, WhatsApp buttons, SEO paths, and 404 risk when relevant.
5. For any website or APP change, run `npm run build`.
6. For any website or APP change, run `npm run browser-test`.
7. If `browser-test` fails, do not commit or push unless the owner explicitly allows it.
8. Commit and push when feasible, in scope, and verification has passed.

## Product/App Sync Rule

- Every new product upload must update both the website product data and `app/products.json` in the same workflow.
- New product upload is never website-only and never app-only.
- Product upload validation must check website/app consistency before commit and push.

## Connected Skills

- Website/App: `superpowers`, `guidelines`, `karpathy-rules`, `code-review`, `testing-qa`, `devops-deploy`.
- Browser QA: `haode-browser-qa` is required for homepage, APP page, product card, product image, price display, quantity-price logic, cart, WhatsApp checkout, ofertas especiales, and GitHub Pages deployment verification.
- Live/external verification: `firecrawl` when needed.
- Workflow source: `/Users/mac/Documents/haode/HAODE-AUTOMATION/WORKFLOWS/WEBSITE_QA_WORKFLOW.md`.
- Guardrail: do not change website content, prices, categories, or images unless the task explicitly asks for it.

## Product/App Sync Enforcement

- Every new product upload must update website product data and `app/products.json` together.
- New product upload is never website-only.
- New product upload is never app-only.
- `app/products.json` is the current app product data path.
- If `app/products.json` cannot be found or updated, stop.
- If SKU, price, category, image, video policy, availability, or product claim is unclear, stop for owner confirmation.
- If all required data is available and validation passes, low-risk website/app sync work may commit and push automatically.
- Protected fields require owner confirmation: prices, images, videos, WhatsApp numbers, product names, specs, claims, categories, SKU, slug, availability, customer data, deleting files, brand, company data, and store address.

## Browser QA Enforcement

- QA reports must include build result, browser-test result, live URL check status, broken-image status, horizontal-overflow status, incorrect oferta product status, and whether follow-up fixes are needed.
- `Ofertas especiales` can display only owner-specified products.
- Do not auto-generate discount products.
- Do not randomly select promotion products from normal products.
- Do not restore demo promotion data.
