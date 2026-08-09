# HAODE Homepage Human Design Specification

## Objective

Refine the HAODE Mexico homepage into a focused repair-supply storefront that feels operated by a real CDMX supplier, while preserving every verified commercial fact, product, price, route, tracking contract, and purchase flow.

## Approved direction

The homepage uses the spatial thesis “HAODE Repair Supply System”: one strong supplier statement, one primary WhatsApp quote action, a secondary catalog search, visible product photography, and a compact operational path from identifying a part to confirming a quote.

The visual language remains HAODE: orange, ink, white, steel gray, the official wordmark, real store/warehouse/product imagery, and practical Mexican-Spanish copy. It removes the current generic marketplace feel created by dense entrance walls, repeated rounded cards, faux metrics, decorative UI noise, and competing calls to action.

## Audience and primary job

- Primary audience: mobile-phone repair technicians, workshops, resellers, and wholesale buyers in Mexico.
- Primary job: send model/SKU, version, quantity, and city to HAODE by WhatsApp for confirmation.
- Secondary job: search or browse the official catalog without leaving the public website.

## Information hierarchy

1. Header: official wordmark, at most five primary navigation choices, one WhatsApp action, APP as a secondary utility.
2. Hero: “Fábrica directa para talleres” plus the product range and confirmation conditions; primary WhatsApp action; secondary catalog search; real HAODE inventory photograph.
3. Supply paths: four scannable routes covering screens, protection, workshop equipment, and the full catalog. Existing category and SEO URLs remain discoverable in a subordinate index.
4. Proof: real CDMX storefront/warehouse images and the exact quote checklist; no invented testimonials or performance metrics.
5. Featured products: all current product names, prices, links, and images remain unchanged. The fake previous/next buttons are removed; the list becomes an honest responsive rail/grid.
6. Quote process and official information: condensed into operational sections with the same verified facts.
7. Footer: retains contact, legal, social, navigation, and conversion links.

## Interaction and accessibility contract

- Add a keyboard-visible skip link targeting `#main-content`.
- Keep the homepage search action `/productos/` and query parameter `q`.
- The daily promotion container uses `aria-live="polite"` and `aria-atomic="true"`.
- Mobile navigation is controlled by a real button with `aria-controls` and synchronized `aria-expanded`; Escape closes it.
- Every interactive target is at least 44 by 44 CSS pixels on touch widths.
- Sticky WhatsApp respects `env(safe-area-inset-bottom)` and does not cover the privacy preference control.
- Motion is disabled for users who prefer reduced motion.
- Below-the-fold images use lazy loading and async decoding.
- Focus indicators are visible; hover is not the only feedback.
- The page has no horizontal overflow at 320, 390, 768, or 1440 CSS pixels.

## Content and data constraints

- Customer-facing copy remains Mexican Spanish.
- Do not invent or alter product specifications, compatibility, stock, warranty, delivery time, claims, or prices.
- Preserve the approved iPhone 11 and XR prices exactly as currently published.
- Preserve all canonical, Open Graph, JSON-LD, sitemap, category, product, legal, WhatsApp, APP, and GEO routes.
- Preserve consent-aware analytics and campaign attribution entrypoints.
- Use only existing verified HAODE image assets; no new supplier or AI-generated product imagery.
- Preserve the strings required by current conversion tests, including “Fábrica directa para talleres”, “Stock en México”, and “WhatsApp”.

## Visual constraints

- Use one display role and one text role from a robust local/system stack; do not add a remote font dependency.
- Use orange for HAODE emphasis, green only for WhatsApp, ink for hierarchy, and neutral paper/steel surfaces.
- Avoid gradients, glass effects, decorative glow, floating pill clusters, excessive rounding, fake dashboards, and repetitive equal-weight cards.
- Prefer straight rules, editorial spacing, real photography, asymmetry, and dense-but-readable workshop/catalog cues.
- Main body copy is at least 16px on ordinary reading surfaces and constrained to a readable line length.

## Acceptance criteria

- Contract test confirms the hierarchy, accessible navigation, daily-ad live region, lazy images, and absence of fake carousel controls.
- Existing full build and data-integrity checks pass with zero errors.
- Focused Playwright tests pass for search, homepage conversion, privacy, and responsive layout.
- Desktop and mobile screenshots show no overlap, clipped content, or horizontal scroll.
- All changed local asset references and critical links resolve.
- Production deployment is a fast-forward of current `origin/main`, GitHub Pages completes successfully, and both the GitHub Pages URL and `https://haode.com.mx/` serve the deployed homepage.
