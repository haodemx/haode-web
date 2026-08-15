# HAODE SEO Trust and Performance Remediation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Close the confirmed HAODE structured-data trust gap, preserve the currently passing SEO/GA4/GEO foundation, and then improve measurable mobile search performance without inventing product facts.

**Architecture:** Keep the static HTML/CSS/JavaScript and existing catalog generators. Extend the existing SEO refresh pipeline and technical contract so legacy and future public Product JSON-LD cannot publish unconfirmed availability. Treat performance and metadata as separate, evidence-gated batches after the trust contract is green.

**Tech Stack:** Static HTML/CSS/JavaScript, Node.js test runner, Playwright, Lighthouse, GitHub Pages.

---

### Task 1: Establish the Current Baseline

**Files:**
- Verify: `sitemap.xml`
- Verify: `tests/seo-technical-contract.test.mjs`
- Verify: `scripts/haode-quality-check.js`
- Verify: `package.json`

- [x] Fetch `origin/main` and create isolated branch `fix/seo-trust-performance-20260815`.
- [x] Run `npm install`.
- [x] Run `npm run build` and record the zero-error quality baseline.
- [x] Start a local static server and run `BASE_URL=http://127.0.0.1:4173 npm run browser-test`.
- [x] Classify every `InStock` occurrence by sitemap, canonical, and noindex status.

### Task 2: Add a Full-Site Structured-Data Trust Contract

**Files:**
- Modify: `tests/seo-technical-contract.test.mjs`
- Test: `tests/seo-technical-contract.test.mjs`

- [x] Add a sitemap-path resolver for static HTML routes.
- [x] Add a test covering every sitemap page with Product JSON-LD, not a fixed SKU allowlist.
- [x] Assert that Product offers omit availability unless a future verified source is explicitly introduced.
- [x] Run `npm run test:seo-technical` and confirm the new test fails against the historical pages.

### Task 3: Normalize Legacy Product Schema Through the Existing SEO Refresh

**Files:**
- Modify: `scripts/refresh-seo-pages.mjs`
- Modify: public HTML files containing unconfirmed Product availability
- Modify: `scripts/haode-quality-check.js`
- Test: `tests/seo-technical-contract.test.mjs`

- [x] Add a JSON-LD-aware transform that removes only unconfirmed Product `offers.availability`.
- [x] Merge this transform into the existing SEO refresh change set so title/H1/alias changes cannot overwrite it.
- [x] Extend the quality checker to report unconfirmed Product availability as an error.
- [x] Run `npm run seo:refresh-pages` to normalize the historical public pages.
- [x] Parse all changed JSON-LD and run the technical test plus quality checker.

### Task 4: Re-measure Mobile Performance Before Editing UI

**Files:**
- Verify: `index.html`
- Verify: `style.css`
- Verify: `script.js`
- Verify: homepage hero media under `assets/`

- [x] Capture a fresh mobile Lighthouse baseline against the live production page.
- [x] Identify the actual LCP element and main-thread contributor.
- [x] Make no UI/performance change unless the live result reproduces a material problem.
- [x] No performance edit required: live mobile score 99, LCP 2.1 s, TBT 0 ms, CLS 0.001.

### Task 5: Metadata, H1, Alt, and Social Preview Batch

**Files:**
- Verify/Modify: only sitemap pages confirmed by the current audit
- Test: `tests/seo-technical-contract.test.mjs`
- Test: `scripts/haode-quality-check.js`

- [x] Recalculate title and description outliers from current `origin/main`.
- [x] Verify homepage, category, GEO landing, and high-intent product pages have unique metadata.
- [x] Preserve current crawlable H1s; the App renders exactly one route-appropriate H1 after load.
- [x] Confirm every sitemap image has alt text; leave optional Twitter Card gaps as non-ranking P2 work.

### Task 6: Full Verification and Delivery

**Files:**
- Verify: all changed files

- [x] Run `npm run build`.
- [x] Run `BASE_URL=http://127.0.0.1:4173 npm run browser-test`.
- [x] Run `git diff --check` and inspect the full diff for protected-field changes.
- [x] Perform the repository code-review checklist.
- [ ] Commit and push the task branch after every required gate passes.
- [ ] Do not merge or deploy production without explicit authorization.

### Task 7: Display HL Follow-On

**Files:**
- Separate plan and repository/access scope for `https://displayhl.com.mx/`.

- [ ] Start only after the HAODE branch is verified and handed off.
- [ ] Audit indexability, GA4/GSC access, WordPress templates, H1/meta/schema, GEO content, and performance.
- [ ] Keep Display HL implementation and deployment separate from HAODE.
