# HAODE Premium Brand System Specification

## Objective

Upgrade the public HAODE website and customer App from a collection of individually refined pages into one premium, trustworthy Mexican wholesale brand experience. The work must make the business feel established and intentional without changing verified commerce data, product media, routes, or operational logic.

This is a brand-system release, not another one-off UI audit. Future design skills may suggest improvements, but the production interface changes again only when a measured customer or business problem justifies it.

## Approved scope

- Public homepage, catalog, category, product-detail, trust/contact, legal, and high-intent SEO page families.
- Customer App home, catalog, category/group, product-detail, cart, and contact surfaces.
- Shared design tokens, typography, spacing, buttons, cards, navigation, content width, focus states, and responsive behavior.
- Responsive visual proof and browser regression coverage before deployment.
- Production deployment after every required gate is green.

ERP is excluded. Its interface serves staff workflows and needs a separate efficiency-led design brief.

## Audience and brand position

- Primary users: repair technicians, workshops, resellers, and wholesale buyers in Mexico.
- Primary job: find the right model, understand the available customer price tiers, and request confirmation by WhatsApp.
- Brand position: a direct, professional, operationally credible screen and mobile-parts supplier with stock in Mexico.
- Desired impression: premium industrial editorial — assured, structured, product-led, and human.
- Undesired impression: generic marketplace, playful consumer app, AI-generated landing page, decorative dashboard, or luxury fashion site.

## Visual direction

### Selected direction: Premium Industrial Editorial

The selected system takes the strongest parts of the existing Style Refero direction and makes them consistent across every page family:

- Warm paper and clean white surfaces instead of tinted panels everywhere.
- Deep ink for structure, HAODE orange for brand and conversion emphasis, and green only for WhatsApp.
- Strong editorial headlines with compact operational labels.
- Square-to-soft corners, precise rules, restrained shadows, and purposeful whitespace.
- Real product and HAODE location imagery already approved in the repository.
- One dominant action per section and a clear path from discovery to quote.

### Alternatives considered

1. Dark technology showroom: visually dramatic but too close to a consumer electronics campaign and less effective for a large working catalog.
2. Bright marketplace: familiar and dense but reinforces the current low-cost marketplace impression.
3. Premium Industrial Editorial: selected because it supports trust, mobile scanning, wholesale density, and HAODE's factory-direct position without inventing luxury claims.

## Design system

### Color roles

- Ink `#111111`: headings, navigation, dark brand surfaces.
- Paper `#F3F3F1`: page background and quiet section separation.
- Surface `#FFFFFF`: cards, inputs, and product media.
- Steel `#E2DED6`: rules and component boundaries.
- Muted ink `#625F59`: secondary copy with accessible contrast.
- HAODE orange `#FF5A0A`: brand accent and primary non-WhatsApp actions.
- Deep orange `#C9360C`: accessible orange text and hover states.
- WhatsApp green `#12A854`: WhatsApp actions only.
- Focus ring `#005FCC`: keyboard focus visibility independent of brand color.

No decorative gradients, glass effects, glow, or multi-color card systems are part of the final language.

### Typography

- Use local/system fonts only; no remote font dependency.
- Display role: Arial Black / Arial Narrow / system sans fallback, used sparingly for brand headlines.
- Body role: system UI stack for Mexican-Spanish clarity and fast rendering.
- Headings use tight but non-colliding line height; ordinary body copy is at least 16px on reading surfaces.
- Labels may use uppercase only when short and letter-spaced; paragraphs remain sentence case.

### Spacing and geometry

- Base spacing rhythm: 4, 8, 12, 16, 24, 32, 48, 72.
- Shared public content width: 1216px maximum with responsive side gutters.
- Primary controls: 48px on commerce surfaces; never below 44px on touch layouts.
- Radius roles: 0/4px for rules and utility elements, 8px for inputs/buttons, 12px for major media; no arbitrary pills except status chips.
- Shadows indicate elevation only; borders and spacing carry most hierarchy.

### Shared components

- `BrandHeader`: official transparent wordmark, five or fewer primary paths, visible App and WhatsApp actions, accessible mobile menu.
- `EditorialHero`: one strong supplier statement, real media, one primary quote action, secondary catalog search or browse action.
- `TrustStrip`: concise verified proof, not invented metrics or testimonials.
- `CategoryIndex`: product-led category paths with real images and clear labels.
- `ProductCard`: media, model/name, confirmed price tiers, and separate detail/WhatsApp actions.
- `QuotePanel`: checklist for model/SKU, quantity, and city using existing WhatsApp templates.
- `AppShell`: compact brand header, fast search, working catalog, persistent but non-obstructive mobile navigation.
- `BrandFooter`: official identity, verified contact and social links, legal and catalog routes.

## Page-family behavior

### Homepage

- Keep the approved seven-family product carousel and all verified text/data contracts.
- Increase hierarchy and breathing room while keeping product families visible in the first screen.
- Consolidate proof and browse paths; avoid repeated equal-weight panels.
- Make homepage, catalog, and App feel like one brand system.

### Catalog and categories

- Search and product discovery remain first-class.
- Product lists use consistent media ratios, typography, price hierarchy, and actions.
- Dense inventories remain efficient; premium quality comes from consistency, not excessive empty space.

### Product detail

- Product media, product identity, confirmed price tiers, and quote action define the first screen.
- Long model and bundle names must wrap without breaking layout.
- Never simulate unavailable 360-degree media or replace confirmed images.

### Customer App

- Preserve hash routes, ERP fallback behavior, cart pricing logic, campaign attribution, and WhatsApp checkout.
- Align visual tokens and product-card behavior with the website while retaining a mobile-native compact shell.
- Keep cart and bottom navigation clear of safe areas and customer content.

### Trust, legal, and SEO pages

- Apply the same header, typography, section rhythm, and quote language.
- Preserve all canonical metadata, structured data, verified content, and crawlable static headings.

## Interaction, accessibility, and performance contract

- Visible keyboard focus on every interactive element.
- Correct labels, expanded state, focus return, and Escape behavior for menus and cart drawers.
- Minimum 44px touch targets and no horizontal document overflow at 320, 360, 390, 768, 1440, or 1920 CSS pixels.
- Text contrast meets WCAG AA; orange text uses the darker role where needed.
- Hover never moves layout; reduced-motion preference disables nonessential movement.
- Images keep explicit dimensions, lazy loading below the fold, and valid fallbacks.
- No new remote font, animation, icon, or image dependency.
- Content and primary actions remain available without animation completion.

## Data and business guardrails

- Do not change or invent prices, stock, specifications, compatibility, warranty, delivery time, availability, discount, or promotion products.
- Do not add unapproved product images or change confirmed product-media mapping.
- Do not change category membership, customer price logic, cart math, WhatsApp message data, campaign attribution, analytics consent, SEO routes, or ERP integration.
- Preserve the official HAODE logo and verified social/contact data.
- Customer-facing language remains Mexican Spanish.

## Acceptance and release gates

1. Static design and data contract suite passes.
2. Complete Playwright browser suite passes against the local branch.
3. UI acceptance audit passes every indexed page at 360, 390, 768, and 1440 widths, plus representative 1920 checks.
4. Desktop and mobile screenshots for homepage, catalog, product detail, and App are visually inspected.
5. Broken-image, horizontal-overflow, cart, price-tier, search, WhatsApp, keyboard, privacy, analytics, and campaign-attribution checks are green.
6. `git diff --check`, branch review, and scoped code review are clean.
7. The branch is fast-forward compatible with current `origin/main`.
8. GitHub Pages deployment completes for the exact commit.
9. The GitHub Pages URL and `https://haode.com.mx/` pass live smoke and sitemap verification.

If any required gate fails, deployment stops until the scoped issue is fixed and the gate is rerun.
