# HAODE factory-store UI QA

Fecha: 2026-07-24

## Source visual truth path

- User-selected reference image: desktop HAODE factory-store homepage plus mobile APP screen.
- Target direction: fábrica directa para talleres, stock en México, garantía local, bajo precio, cotización privada por WhatsApp.

## Implementation screenshot path

- Website desktop: `home-desktop.png`
- Website mobile: `home-mobile.png`
- APP mobile home: `app-mobile-home.png`
- APP mobile list: `app-mobile-list.png`
- APP mobile detail: `app-mobile-detail.png`
- APP mobile cart: `app-mobile-cart.png`

## Viewport

- Desktop: 1440 x 1040
- Mobile: 390 x 844

## State

- Website homepage first screen.
- APP homepage after local catalog fallback has rendered products.
- APP product list, product detail, and cart route.

## Comparison evidence

- Website now uses the reference structure: brand/store header, stock and workshop support cues, separate category nav, large factory-direct headline, search, wholesale WhatsApp prompt, category strip, and bottom WhatsApp band.
- APP home now uses the reference flow: HAODE top bar, stock strip, search, compact category shortcuts, green WhatsApp list CTA, and compact product rows.
- Main APP purchase path is unified with stock/warranty/WhatsApp strips on list and cart, plus a workshop WhatsApp note on detail.

## Findings

- No P0/P1/P2 findings in the checked screenshots.
- Remaining P3 polish: website mobile header is functional but less close to the supplied mobile APP mock than the APP screen itself.

## Verification summary

- No horizontal overflow on checked desktop/mobile viewports.
- No local 404 responses from checked website and APP routes.
- APP local preview shows expected ERP CORS fallback in development, then renders local catalog data correctly.

## Final result

final result: passed
