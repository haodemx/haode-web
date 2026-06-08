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
5. Commit and push when feasible and in scope.

## Product/App Sync Rule

- Every new product upload must update both the website product data and `app/products.json` in the same workflow.
- New product upload is never website-only and never app-only.
- Product upload validation must check website/app consistency before commit and push.

## Connected Skills

- Website/App: `superpowers`, `guidelines`, `karpathy-rules`, `code-review`, `testing-qa`, `devops-deploy`.
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
