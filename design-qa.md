# HAODE APP Promociones Activas Carousel QA

Fecha: 2026-06-13

## Source visual truth path

- User brief and screenshot context for Promociones Activas carousel.
- Existing HAODE APP visual system: `/Users/mac/Documents/haode/app/`.

## Implementation screenshot path

- Desktop full page: `/private/tmp/haode-offers-carousel-desktop.png`
- Mobile full page: `/private/tmp/haode-offers-carousel-mobile.png`
- Desktop focused region: `/private/tmp/haode-offers-section-desktop.png`
- Mobile focused region: `/private/tmp/haode-offers-section-mobile.png`

## Viewport

- Desktop: 1440 x 1200
- Mobile: 390 x 1200

## State

- APP homepage.
- Promociones Activas / Ofertas especiales.
- Initial slide: Pantalla iPhone 14 FHD.
- Autoplay validated after 5 seconds.
- Manual controls validated: previous arrow, next arrow, and bottom dots.

## Full-view comparison evidence

The full-page screenshots confirm the offer module remains in the same homepage location and no other homepage module was moved or redesigned.

## Focused region comparison evidence

Focused screenshots confirm the offer carousel shows exactly one product card at a time. The card is centered, wider, image area is larger, product copy is readable, and the buttons keep normal proportions on desktop and mobile.

## Findings

- No P0/P1/P2 findings.
- P3 follow-up: mobile can keep the two buttons stacked when space is narrow; this is acceptable because neither button is squeezed or clipped.

## Patches made since previous QA pass

- Fixed the carousel order to start with Pantalla iPhone 14 FHD, then Pantalla iPhone 11 Pro FHD.
- Kept only the two owner-specified offer IDs in the active offer carousel.
- Enlarged and centered the single offer card.
- Increased offer image area and product text spacing.
- Preserved Agregar al carrito and Ver detalles controls.
- Added versioned APP CSS/JS URLs so browsers do not keep the previous two-card layout from PWA cache.
- Updated the service worker cache version to clear the old APP shell.
- Added a CSS guard so extra offer cards cannot appear side by side if stale markup is present.

## Final result

final result: passed
