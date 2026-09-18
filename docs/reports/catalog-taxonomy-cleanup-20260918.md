# HAODE catalog taxonomy cleanup — 2026-09-18

Scope: local candidate only. Product identity, IDs, routes, media mappings, prices, inventory, ERP and SEO remain unchanged.

## Before: raw product categories

| Raw category | Products |
| --- | ---: |
| samsung-incell | 37 |
| iphone-incell | 34 |
| oled-diagnostica | 24 |
| iphone-oled | 20 |
| celulares-samsung | 18 |
| samsung-tipo-original | 17 |
| fundas | 9 |
| gafas-ai | 9 |
| samsung-oled | 9 |
| micas | 5 |
| camaras-inteligentes | 4 |
| **Total** | **186** |

The former customer navigation mixed brand and technology at the same level: iPhone INCELL, iPhone OLED, Samsung INCELL, Samsung AMOLED and Plegables.

## After: customer-facing hierarchy

| Primary category | Product family | Products | Attribute filters |
| --- | --- | ---: | --- |
| Pantallas | iPhone | 78 | Modelo, Tecnología, Calidad / versión |
| Pantallas | Samsung | 50 | Modelo, Tecnología, Calidad / versión |
| Pantallas | Foldables | 13 | Modelo, Tecnología, Calidad / versión |
| Hidrogel | Películas de hidrogel | 4 | HD Clear, Matte, Privacy HD, Privacy Matte |
| Hidrogel | Máquinas de corte | 1 | X200T |
| Productos AI | Gafas AI | 9 | Published model and version |

Pantallas technology distribution after assigning every screen to one mutually exclusive family:

| Family | Technology | Products |
| --- | --- | ---: |
| iPhone | INCELL | 34 |
| iPhone | OLED | 20 |
| iPhone | OLED diagnóstica | 24 |
| Samsung | INCELL | 33 |
| Samsung | OLED | 9 |
| Samsung | Tipo original | 8 |
| Foldables | INCELL | 4 |
| Foldables | Tipo original | 9 |

## Products outside the three confirmed primary categories

These products remain in the complete catalog, global search and original detail routes. They are not deleted or forced into Productos AI.

| Existing group | Products | Status |
| --- | ---: | --- |
| celulares-samsung | 18 | Published Samsung phones; outside the confirmed screen/hydrogel/AI hierarchy |
| fundas | 9 | Published cases; outside the confirmed three-primary-category hierarchy |
| camaras-inteligentes | 4 | Classification pending; not automatically labeled as AI |
| **Total outside confirmed hierarchy** | **31** | Searchable and linked |

Products with an empty raw category: **0**.

## Media-stage rule

- Product-card stage: 1:1.
- Shared light HAODE background.
- Ten-percent safe padding around every asset.
- `object-fit: contain`; no stretching and no crop.
- The original confirmed image path remains unchanged.

## Verification

- Build and public-package verification: PASS.
- Catalog cleanup and affected-route tests: 24/24 PASS.
- Full browser run: 252/257 PASS. One compact-header check was transient under parallel load and passed immediately in isolated reproduction. Four product-detail visual snapshots fail identically on the unchanged production base commit, so they are pre-existing baseline drift and are not caused by this candidate.
- Production deployment: NOT RUN. This candidate is waiting for owner visual approval.
