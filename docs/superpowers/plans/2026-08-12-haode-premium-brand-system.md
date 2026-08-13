# HAODE Premium Brand System Implementation Plan

> **For agentic workers:** Execute task-by-task in this branch. Do not change product data, prices, confirmed media, or business logic. Do not deploy until every release gate is green.

**Goal:** Ship one premium, reusable HAODE visual system across the public website and customer App, verify the full commerce path, and deploy the tested commit.

**Architecture:** Preserve the current static HTML/CSS/JavaScript and App data architecture. Introduce a final shared token/component layer, refactor the core page-family markup only where hierarchy requires it, and reuse the same selectors/templates across generated category and product pages. Keep behavior modules and catalog data sources unchanged.

**Tech Stack:** Static HTML/CSS/JavaScript, Node.js contract tests, Playwright, GitHub Pages.

## Global constraints

- Customer copy is Mexican Spanish; owner handoff is Chinese.
- Use existing confirmed HAODE assets only.
- No product, pricing, stock, compatibility, warranty, route, attribution, consent, or cart-logic changes.
- ERP is out of scope.
- Work from the isolated `ui/premium-brand-system-20260812` branch.
- Push and deploy only after the full local release gate passes.

---

### Task 1: Record the baseline and protect business contracts

**Files:**
- Create: `docs/superpowers/specs/2026-08-12-haode-premium-brand-system.md`
- Create: `docs/superpowers/plans/2026-08-12-haode-premium-brand-system.md`
- Test: existing `tests/**/*.spec.js` and `tests/**/*.test.mjs`

- [x] Check branch, current `origin/main`, worktree cleanliness, and deploy workflow.
- [x] Install exact locked dependencies with `npm ci`.
- [x] Run the full static build gate and record a green baseline.
- [x] Start the required local server and run the browser baseline against it.
- [x] Complete the indexed UI acceptance baseline at all supported widths.
- [x] Capture representative baseline screenshots for comparison.

### Task 2: Add a stable brand-system contract

**Files:**
- Create: `tests/premium-brand-system-contract.test.mjs`
- Modify: `package.json`
- Test: `tests/premium-brand-system-contract.test.mjs`

- [x] Add failing assertions for the shared premium tokens, no decorative gradients/glass/glow in the final core layers, focus ring, reduced motion, target sizes, and consistent public/App brand roles.
- [x] Assert the approved homepage, catalog, product-detail, and App hooks remain present.
- [x] Add `test:premium-brand-system` to `package.json` and include it in `haode:check` only after it passes.
- [x] Verify the new contract fails for the intended missing system and no unrelated reason.

### Task 3: Implement the website brand foundation

**Files:**
- Modify: `style.css`
- Modify only if required: `index.html`
- Test: `tests/premium-brand-system-contract.test.mjs`
- Test: `tests/homepage-human-design-contract.test.mjs`

- [x] Add one final named HAODE premium brand layer with shared tokens, type roles, layout width, focus behavior, and reduced-motion behavior.
- [x] Restyle the public header, homepage hero, proof, category paths, product rail, quote panel, and footer without changing verified content.
- [x] Remove decorative gradients and excessive shadow/radius treatment from core public surfaces.
- [x] Keep the seven-family carousel, site search, mobile menu, privacy control, and WhatsApp behavior intact.
- [x] Validate desktop and mobile homepage screenshots before expanding to page families.

### Task 4: Unify catalog, category, product, and trust templates

**Files:**
- Modify: `style.css`
- Modify only when semantics require it: `productos/index.html`, `producto/index.html`, `categoria/category-page.js`, and shared trust/SEO templates.
- Test: catalog, category, product, conversion, pricing, image, SEO, privacy, and overflow suites.

- [x] Apply shared header, layout, section, card, search, input, action, and footer roles to every website page family.
- [x] Standardize product media ratios, price hierarchy, badge density, and action layout while preserving their exact values and links.
- [x] Verify long names, narrow screens, and generated category/product templates.
- [x] Verify legal, contact, distributor, warranty, and high-intent SEO pages remain readable and conversion-safe.

### Task 5: Implement the App brand foundation

**Files:**
- Modify: `app/app.css`
- Modify only if required: `app/index.html`, `app/app.js`
- Test: App interaction, conversion, price, cart, attribution, XSS, error, and responsive suites.

- [x] Map App tokens to the public brand roles and remove conflicting decorative layers.
- [x] Refine App header, home hero, search, category paths, product cards, detail, cart, contact, and bottom navigation.
- [x] Preserve hash routes, local fallback catalog, ERP behavior, focus trap, search caret, price-by-quantity, and WhatsApp checkout.
- [x] Check 360 and 390 widths, safe-area padding, broken images, and last-content visibility.

### Task 6: Visual review and focused repair

**Files:**
- Modify only in-scope files above when a verified defect is found.
- Create untracked screenshots under `output/playwright/`.

- [x] Capture homepage, catalog, representative category, standard product, special product, App home, App product, and App cart at desktop/mobile sizes as applicable.
- [x] Inspect hierarchy, typography, alignment, media treatment, action prominence, clipping, overlap, and visual consistency.
- [x] Run the UI/UX checklist for contrast, touch targets, focus, reduced motion, responsive layout, and loading stability.
- [x] Fix only evidence-backed defects and rerun the affected checks.

### Task 7: Complete code and browser verification

**Files:**
- Test all changed files and every existing release contract.

- [x] Run `npm run test:premium-brand-system`.
- [x] Run `npm run build`.
- [x] Run `BASE_URL=http://127.0.0.1:4173 npm run browser-test`.
- [x] Run `BASE_URL=http://127.0.0.1:4173 npm run audit:ui-acceptance`.
- [x] Run representative App QA and live-verifier unit contracts.
- [x] Run `git diff --check`, inspect the complete diff, and verify no product-data or image-map files changed.
- [x] Perform the required scoped code review and resolve every validated blocking finding.

### Task 8: Commit, deploy, and verify production

**Files:**
- Commit only the specification, plan, brand contract, package script, and scoped website/App implementation files.

- [x] Fetch `origin` again and reconcile any new upstream changes without force or unrelated overwrites.
- [ ] Commit the reviewed release with a descriptive HAODE UI message.
- [ ] Push the task branch, then fast-forward the verified commit to `origin/main` as permitted by the owner.
- [ ] Wait for the exact GitHub Pages deployment workflow to succeed.
- [ ] Verify the deployed commit, GitHub Pages URL, custom domain homepage, catalog, representative category/product, App path, sitemap, search, images, cart, and WhatsApp flow.
- [ ] Deliver the Chinese owner report with branch, commit, files, test evidence, deployment, blockers, and next action.
