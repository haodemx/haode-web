# HAODE Website Guidelines

Follow the shared HAODE guidelines:

- `/Users/mac/Documents/haode/GUIDELINES.md`
- `/Users/mac/Documents/haode/HAODE_RULES.md`

Website-specific defaults:

- Customer-facing text must be Spanish.
- Inspect current HTML, CSS, JS, product data, routes, and assets before edits.
- Preserve GitHub Pages-compatible paths.
- Verify changed pages locally and, when published, verify live pages.
- After any website or APP change, run `npm run build` and `npm run browser-test`.
- If `browser-test` fails, do not commit or push unless the owner explicitly allows it.
- Do not change prices, delete products, or replace images without confirmation.
- Every new product upload must update both website product data and `app/products.json` in the same workflow.
- New product upload is never website-only and never app-only.

## Directory Skill Binding

- Default Skills: `superpowers`, `guidelines`, `karpathy-rules`, `code-review`, `testing-qa`, `devops-deploy`.
- Use `haode-browser-qa` for homepage, APP page, product card, product image, price display, quantity-price logic, cart, WhatsApp checkout, ofertas especiales, and GitHub Pages deployment verification.
- Add `firecrawl` only for live/external page extraction or verification.
- Use `HAODE-AUTOMATION/WORKFLOWS/WEBSITE_QA_WORKFLOW.md` for website QA and deployment checks.
- Use product-upload and marketing Skills only when a website task explicitly includes new product preparation or marketing output.
- Product upload verification must include website/app product consistency before commit or push.

## Product/App Sync Guardrail

- Every new product upload must update website product data and `app/products.json` together.
- New product upload is never website-only.
- New product upload is never app-only.
- `app/products.json` is the current app product data path.
- If `app/products.json` cannot be found or updated, stop.
- If SKU, price, category, image, video policy, availability, or product claim is unclear, stop for owner confirmation.
- If all required data is available and validation passes, low-risk website/app sync work may commit and push automatically.
- Protected fields require owner confirmation: prices, images, videos, WhatsApp numbers, product names, specs, claims, categories, SKU, slug, availability, customer data, deleting files, brand, company data, and store address.

## Browser QA Gate

- Website or APP changes must pass `npm run build`.
- Website or APP changes must pass `npm run browser-test`.
- QA reports must state whether build passed, browser-test passed, the live URL was checked, broken images exist, horizontal overflow exists, incorrect oferta products exist, and follow-up fixes are needed.
- `Ofertas especiales` may show only owner-specified products.
- Do not auto-generate discount products.
- Do not randomly choose promotion products from the normal catalog.
- Do not restore demo promotion data.
