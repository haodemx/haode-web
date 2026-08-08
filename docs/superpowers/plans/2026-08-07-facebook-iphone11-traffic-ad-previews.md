# Facebook iPhone 11 Traffic Ad Previews Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce three locally reviewable Facebook square-ad previews for the verified iPhone 11 Bolsa Protectora product and its HAODE App landing page.

**Architecture:** Use the confirmed website product image and official HAODE logo as high-fidelity image references in three separate built-in image-generation calls. Keep final previews local under the dated HAODE AI media output folder, then visually reject any output that changes the product, price condition, brand, or required Spanish copy.

**Tech Stack:** Built-in image generation, local image inspection, HAODE website product assets, Markdown handoff files.

## Global Constraints

- Generate exactly three `1080 × 1080`-style square preview concepts.
- Use `assets/products/iphone-incell/11-bolsa-protectora/main.jpg` as the confirmed product reference.
- Use `assets/logo/logo.png` as the confirmed HAODE logo reference.
- Advertise `DESDE $140 MXN / PIEZA` only with `PRECIO CAJA/MODELO` visible beside it.
- Do not claim stock, warranty terms, urgency, discount percentage, free shipping, or online payment.
- Do not modify website code, prices, product data, or live accounts.
- Do not publish, schedule, message customers, or spend ad budget.

---

### Task 1: Prepare verified campaign inputs

**Files:**
- Read: `assets/products/iphone-incell/11-bolsa-protectora/main.jpg`
- Read: `assets/logo/logo.png`
- Create: `/Users/mac/Documents/haode/HAODE-AUTOMATION/OUTPUT/AI_MEDIA/2026-08-07/facebook-iphone11-140-previews/campaign-brief.md`

**Interfaces:**
- Consumes: confirmed local product and logo assets plus the approved landing URL.
- Produces: one exact-copy campaign brief used by all three image prompts.

- [ ] **Step 1: Confirm both input assets are readable images**

Run `file` on both source paths and inspect both images at original detail.

- [ ] **Step 2: Write the local campaign brief**

Include the five required Spanish lines, three visual concepts, landing URL, source paths, and prohibited claims from the design spec.

- [ ] **Step 3: Validate the brief**

Search for `$140`, `PRECIO CAJA/MODELO`, the exact product id, the landing URL, and an explicit `no publicar` statement. Expected: every item is present.

### Task 2: Generate the three square preview concepts

**Files:**
- Create: `/Users/mac/Documents/haode/HAODE-AUTOMATION/OUTPUT/AI_MEDIA/2026-08-07/facebook-iphone11-140-previews/facebook-iphone11-140-concept-a.png`
- Create: `/Users/mac/Documents/haode/HAODE-AUTOMATION/OUTPUT/AI_MEDIA/2026-08-07/facebook-iphone11-140-previews/facebook-iphone11-140-concept-b.png`
- Create: `/Users/mac/Documents/haode/HAODE-AUTOMATION/OUTPUT/AI_MEDIA/2026-08-07/facebook-iphone11-140-previews/facebook-iphone11-140-concept-c.png`

**Interfaces:**
- Consumes: the two confirmed reference images and exact-copy campaign brief.
- Produces: three independent, locally saved preview candidates.

- [ ] **Step 1: Generate Concept A**

Use case `ads-marketing`; request a clean orange, white, and dark-navy HAODE B2B conversion layout with the product center-right, logo upper-left, price dominant, and CTA at the bottom. Require the five approved Spanish lines verbatim and forbid unsupported claims.

- [ ] **Step 2: Generate Concept B**

Use case `ads-marketing`; request a product-first dark-navy premium composition with restrained orange light, credible repair-shop positioning, the same exact copy, and no extra product claims.

- [ ] **Step 3: Generate Concept C**

Use case `ads-marketing`; request an energetic orange-and-blue price-first composition with `$140` dominant and `PRECIO CAJA/MODELO` immediately adjacent, while preserving the confirmed iPhone 11 product.

- [ ] **Step 4: Persist all generated previews**

Copy each accepted built-in output into its exact final workspace path without overwriting the source product or logo files.

### Task 3: Visual QA and owner handoff

**Files:**
- Inspect: the three final PNG preview files.
- Create: `/Users/mac/Documents/haode/HAODE-AUTOMATION/OUTPUT/AI_MEDIA/2026-08-07/facebook-iphone11-140-previews/owner-review-zh.md`

**Interfaces:**
- Consumes: three saved preview candidates.
- Produces: owner-facing comparison and a clear statement that nothing was published.

- [ ] **Step 1: Inspect every preview at original detail**

Reject any image where the product is no longer iPhone 11 Bolsa Protectora, the HAODE logo is distorted, Spanish is misspelled, `$140` lacks the box/model condition, or an unsupported claim appears.

- [ ] **Step 2: Regenerate only failed concepts once**

Use a targeted correction prompt that preserves all accepted areas and changes only the failed text, logo, or product-fidelity issue.

- [ ] **Step 3: Record the owner comparison**

For A, B, and C, record the visual style, expected Facebook use, QA result, saved path, landing URL, and `发布状态：未发布`.

- [ ] **Step 4: Verify the final handoff**

Expected: three readable square PNG files, one campaign brief, one Chinese owner review, no website changes, and no external publishing activity.
