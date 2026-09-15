# HAODE V3 safe transplant matrix

Production base: `be2f1437312f0a9540ac6c03d6596d80a2d19125`

Approved visual reference: `929d0141d71208f39cf3bd7cacf04cfdd81e023e`

| File / area | Production version | V3 version | Decision | Reason | Risk |
| --- | --- | --- | --- | --- | --- |
| Global visual tokens and editorial layout | Current `style.css` remains authoritative for non-V3 routes | `v3-screen-atlas.css` + `v3-screen-atlas-fixes.css` | Transplant V3 files as an isolated layer | Preserves the locked Laboratory Editorial system without rewriting production CSS | Low; isolated by `.v3-atlas` / `.v3-lab` |
| Hero and laboratory imagery | Current production hero assets remain available | Approved `v3-lab-hero.png` and `v3-lab-environment.png` | Add the two approved assets unchanged | Exact visual-reference assets are required for fidelity | Low; additive assets only |
| Header / navigation / footer | Current routes and destinations | V3 DOM shell | Use V3 shell with current production destinations and existing official logo | Preserves route behavior while restoring approved visual hierarchy | Medium; browser regression required |
| Home | Current metadata, analytics and production scripts | V3 home DOM renderer and Laboratory Editorial hero | Keep production `<head>` and data scripts; enable V3 renderer through page marker | Separates production SEO/business logic from presentation | Medium; verify search and CTA behavior |
| Products catalog | Current generated catalog and product count | V3 catalogue presentation and filtering | Render V3 cards from current `HAODE_PRODUCTS_DATA` | Prevents SKU, price, image and route regression | Medium; compare counts/routes |
| Product detail / flow | Current dynamic detail data, ERP overlays and WhatsApp flow | V3 shell, configurator hierarchy and styling | Port only V3 enhancement hooks into current `products.js` | Retains production product logic and adds approved interaction layout | Medium-high; targeted detail tests required |
| Hidrogel / Micas | Current published product data and routes | V3 editorial page; home placeholder contract | Keep current product data; retain `REAL ASSET REQUIRED` only where V3 intentionally lacks approved photography | No invented or AI-generated real-product asset | Medium; real-asset audit required |
| Baterias | No confirmed production catalog page in the reference branch | Approved placeholder route and page | Add V3 placeholder page with no SKU, price or image claims | Preserves the explicit real-asset boundary | Low |
| Productos AI / Novedades / Contacto | Current production data, contact facts and route behavior | V3 presentation | Enable V3 renderer but source product/contact facts from current production | Keeps production truth while restoring the visual language | Medium |
| APP | Current `app/` implementation | V3 only links to APP | Preserve production APP files unchanged | APP behavior is production-owned | Low |
| WhatsApp | Current number, attribution and product-specific templates | V3 visual CTA surfaces | Preserve current detail WhatsApp logic; V3 generic CTA uses the approved HAODE number/template | Avoids business-flow regression | Medium; URL/parameter audit required |
| SEO / schema / sitemap / robots / redirects / analytics | Current production versions | Older V3 branch versions | Keep production versions; add only new placeholder routes to sitemap if validated | Current production contains newer SEO and infrastructure work | Low-medium; exact audit required |
| Build / deployment | Current production workflow and public-site packaging | V3 branch predates production changes | Keep production pipeline unchanged | No release-workflow regression and no deployment in this task | Low |
| Tests | Current production suite | V3 visual contract tests | Add/adapt V3 tests while preserving all production tests | Requires both production regression and V3 fidelity evidence | Medium; full suite required |

Implementation order: global layer → shell → home/hero → catalog → detail flow → film/mica → X200T → secondary routes → mobile → footer/CTA.
