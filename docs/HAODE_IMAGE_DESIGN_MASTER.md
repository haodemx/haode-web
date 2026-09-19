# HAODE Image Design Master

Status: `OWNER LOCKED`

Owner authority: These rules are mandatory and have highest priority for HAODE image production. Without explicit Owner authorization, they must not be deleted, weakened, rewritten as optional, bypassed through another AI workflow, or sacrificed for a more attractive result.

## 1. Scope and mandatory pre-read

Read this file before any HAODE task involving:

- images or image editing;
- price lists;
- product-family or product-line group images;
- website product media;
- advertising images, posters, social creatives, or promotional layouts.

This file controls real-product integrity, execution continuity, and delivery QC. `/Users/mac/Documents/haode/HAODE_ASSET_STANDARD.md` remains the technical authority for provenance, lifecycle, naming, manifests, and publication gates. When both apply, satisfy both; neither may be used to weaken the other.

## 2. Rule 1 — Real Product Asset Lock

All official HAODE product visuals must use verified real product materials first.

```text
PRODUCT LAYER = LOCKED REAL ASSET
DESIGN LAYER = EDITABLE
```

The real product shown in the source must remain the same real product in the final deliverable.

### Strictly forbidden

- AI-redrawing the product itself.
- AI-regenerating a real product.
- Drawing or generating a similar product from the source image.
- Changing packaging structure.
- Changing any logo on the packaging or product.
- Changing the model.
- Changing brand text.
- Changing original product or packaging text.
- Inventing details that the real product does not contain.
- Replacing a missing real product asset with an AI product.
- Regenerating the entire product image because layout or extraction is difficult.
- Using another model, similar product, supplier reference, scraped image, or generated approximation as a substitute for the required real asset.

### Allowed operations

Only operations that preserve the product's identity and structure are allowed:

- cutout and background removal;
- edge and fringe cleanup;
- scaling;
- cropping that does not remove or change product content;
- consistent visual proportion without stretching or deformation;
- slight perspective correction that does not change product structure;
- presentation shadow;
- lighting coordination that does not alter product color, text, or details;
- background design;
- composition and layout;
- informational typography outside the locked product layer.

### Missing real material

When required real product material is unavailable:

```text
STATUS = ASSET MISSING
```

Complete every independent part of the task, record exactly which real asset is missing and where it is required, and leave that product position unfilled or explicitly pending. Never generate a fake product to occupy the gap.

## 3. Rule 2 — Continuous Execution

When the task goal, product assets, data, design rules, and output requirements are clear, execute the task as one continuous workflow:

```text
READ RULES
-> FIND/USE REAL ASSETS
-> COMPLETE DESIGN
-> SELF-QC
-> FIX FAILURES
-> COMPLETE REMAINING WORK
-> FINAL QC
-> DELIVER RESULT
```

Do not stop after a single image, page, check, export, or other intermediate step to ask the Owner whether to continue. Do not repeat questions already answered. Complete the same batch in one continuous pass wherever possible.

## 4. Only allowed stop conditions

Pause and ask the Owner only when at least one of these conditions applies:

1. A real product asset required to complete the requested result is missing.
2. Two trusted real data sources conflict and available evidence cannot determine which is correct.
3. Two explicit Owner requirements conflict.
4. The next action involves production deployment, data deletion, permanent overwrite, permission changes, or another high-risk or irreversible operation not already authorized.
5. The Owner explicitly required a preview before continuation.

All safe, reversible, clear, and in-scope work must continue without an intermediate permission request. When one part is blocked, complete all independent work before reporting the blocker.

## 5. Mandatory image QC

Every formal image deliverable must pass all checks below before delivery:

| QC item | Required result | Verification question |
| --- | --- | --- |
| `REAL PRODUCT` | `PASS` | Is every represented product a verified real asset rather than a redraw, generation, imitation, or substitute? |
| `LOGO UNCHANGED` | `PASS` | Are all product, packaging, and brand logos unchanged? |
| `MODEL UNCHANGED` | `PASS` | Is the verified model identity unchanged? |
| `PACKAGING UNCHANGED` | `PASS` | Is packaging structure and appearance unchanged? |
| `PRODUCT TEXT UNCHANGED` | `PASS` | Is all original product and packaging text unchanged and undamaged? |
| `PRODUCT STRUCTURE UNCHANGED` | `PASS` | Are form, components, proportions, edges, and product details unchanged? |
| `PRICE / DATA CHECK` | `PASS` | Does every displayed price or factual value match a verified current source? |
| `LAYOUT QC` | `PASS` | Is the composition readable, unclipped, correctly aligned, and suitable for the required output size? |

If any item is `FAIL`, do not deliver. Correct the failure and run the full QC again. If a required item cannot be verified, treat it as not passed and do not label the deliverable final.

## 6. Enforcement and precedence

- The Owner lock applies to people, agents, scripts, Skills, plugins, image models, and external workflows.
- A generative-media tool may edit only the design layer; it may not recreate or reinterpret the locked product layer.
- Product accuracy takes precedence over visual polish, speed, convenience, layout difficulty, and missing-space completion.
- A preview, draft, local render, successful export, or technical validation does not override failed product-integrity QC.
- Publication and deployment remain separate authorization and verification gates.
- Any future instruction that appears to relax this file requires explicit Owner authorization identifying the exact rule to change.
