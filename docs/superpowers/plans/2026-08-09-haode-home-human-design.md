# HAODE Homepage Human Design Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine the HAODE Mexico homepage into a focused, accessible repair-supply storefront and deploy it without changing verified commerce data or routes.

**Architecture:** Keep the existing static-site architecture and production data sources. Add one static contract test, reshape only the homepage HTML, add one final homepage-scoped CSS layer, and extend the shared JavaScript only for accessible mobile-menu state; all existing catalog, analytics, and SEO behavior remains intact.

**Tech Stack:** Static HTML/CSS/JavaScript, Node.js built-in test runner, Playwright, GitHub Pages.

## Global Constraints

- Customer-facing copy remains Mexican Spanish.
- Product names, prices, stock statements, images, compatibility, warranty language, WhatsApp templates, and URLs must not be invented or changed.
- Keep `/productos/?q=` as the public search destination.
- Keep canonical, Open Graph, JSON-LD, sitemap, consent analytics, and campaign attribution contracts intact.
- Use existing repository assets only; add no remote font or image dependency.
- Deployment must be a non-force fast-forward from the latest `origin/main`.

---

### Task 1: Homepage Design Contract

**Files:**
- Create: `tests/homepage-human-design-contract.test.mjs`
- Modify: `package.json`
- Test: `tests/homepage-human-design-contract.test.mjs`

**Interfaces:**
- Consumes: static `index.html` markup.
- Produces: `npm run test:homepage-human-design`, a deterministic acceptance gate for the new hierarchy and accessibility contract.

- [ ] **Step 1: Write the failing static contract test**

  Assert all of the following: `#main-content` and `.reference-skip-link` exist; the primary navigation has no more than five direct links; the hero contains one primary WhatsApp link and the existing catalog-search form; the menu control is a button with `aria-controls` and `aria-expanded`; daily promotion uses `aria-live="polite"`; all below-fold content images declare lazy loading; and `.reference-round-arrow` controls are absent.

- [ ] **Step 2: Run the test to verify the current homepage fails**

  Run `npm run test:homepage-human-design` and require failures for the missing skip link, oversized navigation, checkbox menu, missing live region, non-lazy images, and fake carousel controls.

- [ ] **Step 3: Add the script entry only**

  Add `"test:homepage-human-design": "node --test tests/homepage-human-design-contract.test.mjs"` to `package.json`; do not add it to the full build until the contract passes.

- [ ] **Step 4: Commit the executable contract together with the implementation after it turns green**

  Stage only the new test, package script, homepage implementation, and design documents.

### Task 2: Semantic Homepage Distillation

**Files:**
- Modify: `index.html`
- Test: `tests/homepage-human-design-contract.test.mjs`

**Interfaces:**
- Consumes: current verified HAODE copy, URLs, product cards, prices, images, and structured data.
- Produces: `#main-content`, `#primary-navigation`, `[data-reference-menu-button]`, `[data-reference-menu-panel]`, `.haode-hero-primary`, `.haode-supply-paths`, and an arrow-free `.reference-product-track`.

- [ ] **Step 1: Add semantic access and navigation controls**

  Add the skip link; replace the checkbox/label menu with a button whose initial state is `aria-expanded="false"`; reduce direct navigation choices to Inicio, Catálogo, Pantallas, Taller, and Contacto while leaving all removed destinations available in the body/footer.

- [ ] **Step 2: Establish a single hero action**

  Keep the exact H1 phrase “Fábrica directa para talleres”, introduce one primary WhatsApp quote link using the existing approved URL template, and retain the public catalog search as the secondary action.

- [ ] **Step 3: Consolidate browsing paths and proof**

  Present four primary supply paths, keep all existing SEO route links in a subordinate discoverable index, and use existing storefront/warehouse photographs for operational proof.

- [ ] **Step 4: Remove false product controls and lazy-load below-fold media**

  Remove both `.reference-round-arrow` buttons, preserve every featured product card unchanged, and add `loading="lazy" decoding="async"` to below-fold content images that currently omit them.

- [ ] **Step 5: Turn the contract green**

  Run `npm run test:homepage-human-design` and require all assertions to pass.

### Task 3: Scoped Visual System and Mobile Behavior

**Files:**
- Modify: `style.css`
- Modify: `script.js`
- Test: `tests/homepage-human-design-contract.test.mjs`
- Test: `tests/homepage-site-search.spec.js`
- Test: `tests/conversion-critical-pages-phase16.spec.js`
- Test: `tests/privacy-consent.spec.js`

**Interfaces:**
- Consumes: the selectors produced by Task 2 and the existing `loadDailyAd`, analytics, and search behavior.
- Produces: `setupReferenceMenu(): void`, a final `HAODE homepage human-design refinement` CSS layer scoped to `body.home-page-reference`.

- [ ] **Step 1: Implement accessible mobile-menu state**

  Add `setupReferenceMenu()` to toggle `hidden` and `aria-expanded`, close on Escape, and reset correctly when moving above the mobile breakpoint. Invoke it after DOM readiness without altering existing analytics or search behavior.

- [ ] **Step 2: Add the homepage-scoped visual layer**

  Append a single named CSS section that establishes the ink/paper/orange/steel palette, editorial spacing, asymmetric hero, four supply paths, honest product rail, visible focus states, and restrained borders with no gradients or decorative shadows.

- [ ] **Step 3: Add responsive and safety behavior**

  At 760px and below, keep 44px targets, convert the hero and proof areas to one column, expose the real menu button, reserve bottom space for privacy and WhatsApp controls, and include `env(safe-area-inset-bottom)`.

- [ ] **Step 4: Add reduced-motion behavior**

  Under `@media (prefers-reduced-motion: reduce)`, disable smooth scrolling, transitions, and animations for the homepage.

- [ ] **Step 5: Run focused browser verification**

  Start the static local server and run `homepage-site-search.spec.js`, the homepage case of `conversion-critical-pages-phase16.spec.js`, and `privacy-consent.spec.js`. Require zero failures.

### Task 4: Review, Release, and Live Verification

**Files:**
- Modify only files already listed when review finds an in-scope defect.
- Create local QA screenshots under `output/playwright/` and do not commit them.

**Interfaces:**
- Consumes: completed task branch and current `origin/main`.
- Produces: one reviewed commit deployed to GitHub Pages and verified on the custom domain.

- [ ] **Step 1: Run mechanical and guideline review**

  Fetch the current Web Interface Guidelines, run the Impeccable detector once on `index.html`, inspect the diff for HTML/CSS/JS regressions, and fix only validated in-scope findings.

- [ ] **Step 2: Capture and inspect responsive screenshots**

  Capture full-page desktop 1440×900 and mobile 390×844 screenshots; visually inspect them and verify no overlap among the sticky WhatsApp action, content, and privacy control.

- [ ] **Step 3: Run complete verification**

  Run `npm run test:homepage-human-design`, focused Playwright checks, `npm run build`, local link/asset checks, and `git diff --check`. Require zero failures.

- [ ] **Step 4: Commit the task branch**

  Commit only the specification, plan, contract test, `package.json`, `index.html`, `style.css`, and `script.js` with message `feat: refine HAODE homepage supply experience`.

- [ ] **Step 5: Deploy without rewriting history**

  Fetch `origin`, require `origin/main` to be an ancestor of the task commit, push the task commit to `origin/main` without force, and wait for the matching GitHub Pages workflow to finish successfully.

- [ ] **Step 6: Verify production**

  Verify the exact deployed commit, `https://haodemx.github.io/haode-web/`, `https://haode.com.mx/`, homepage canonical/search/WhatsApp behavior, representative category and product pages, and `sitemap.xml`.
