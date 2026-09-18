# HAODE Pantallas quality architecture and footer restore — 2026-09-18

Scope: local candidate only. No ERP, product, price, inventory, SEO, hero or header changes. Production deployment was not run.

## Real Pantallas data audit

### iPhone — 78 SKU

| Customer group | Real catalog detail | SKU |
| --- | --- | ---: |
| INCELL FHD | `INCELL FHD` | 34 |
| OLED | OLED Premium | 16 |
| OLED | Soft OLED Premium | 4 |
| Diagnóstico OLED | Tamaño original | 22 |
| Diagnóstico OLED | Hard OLED | 1 |
| Diagnóstico OLED | Soft OLED | 1 |
| Original | No current iPhone Original SKU | 0 |

The two `MOVE IC` OLED records remain within their real Premium/Soft groups and retain their exact published quality fields on the product cards and filters.

### iPhone Original source-of-truth verification

The production ERP public catalog generated at `2026-09-18T18:06:51.039Z` contains 252 products. A field-level check of SKU, slug, public name, category, quality and model found zero iPhone records named `Original`, `Tipo Original`, `Original C/M`, `OEM`, `Original Screen` or `Pantalla Original`. The July and August approved customer price imports likewise contain zero iPhone Original rows, and repository history contains no published iPhone Original catalog record. The local ERP database mirror contains no product rows, so it was not treated as evidence of absence or presence.

Conclusion: iPhone Original is a real business line but is not currently recorded in the available ERP/public website source data. This remains a `DATA GAP`; no SKU or customer-facing count was invented. The current import classifier has no dedicated iPhone Original category and would need an explicit mapping when verified SKUs are added.

### Samsung, excluding foldables — 50 SKU

| Customer group | Real catalog detail | SKU |
| --- | --- | ---: |
| INCELL | `INCELL CON MARCO` | 28 |
| INCELL | `INCELL FHD C/M` | 5 |
| AMOLED / OLED | `OLED CON MARCO` | 9 |
| TIPO ORIGINAL | `TIPO ORIGINAL C/M` | 8 |

All 50 current non-foldable Samsung records are con marco. No non-foldable Samsung sin marco option is exposed.

### Foldables — 13 SKU

| Series | Model | SKU |
| --- | --- | ---: |
| Z Flip | Z Flip 3 | 2 |
| Z Flip | Z Flip 4 | 2 |
| Z Flip | Z Flip 5 | 2 |
| Z Flip | Z Flip 6 | 2 |
| Z Flip | Z Flip 7 | 1 |
| Z Fold | Z Fold 3 | 1 |
| Z Fold | Z Fold 4 | 1 |
| Z Fold | Z Fold 5 | 1 |
| Z Fold | Z Fold 6 | 1 |

Foldable frame data remains exact: four INCELL S/M records and nine original/tipo original C/M records.

## Footer sources restored

The URLs are reused from the existing structured data and the previously approved production footer history (`80d3f08e`). No placeholder or platform-home link was added.

| Platform | URL |
| --- | --- |
| Facebook | https://www.facebook.com/haodemx |
| Instagram | https://www.instagram.com/cristi3an/ |
| TikTok | https://www.tiktok.com/@haodemx |
| YouTube | https://www.youtube.com/@haodemx |

The address and hours match the current official-store route: Eje Central Lázaro Cárdenas 87, Piso 2, Local 225, Centro, CDMX; Monday–Saturday 10:00–18:00; Sunday closed.

The Instagram footer decision was revalidated against current integrations. Postiz has two enabled standalone connections (`cristi3an` and `haodemx`), and neither was removed. The current direct Instagram API credential identifies `cristi3an` as the BUSINESS account named `HAODE México Pantallas`; the configured Meta page `haodemx` currently has no linked Instagram Business account. The approved channel register also marks `@cristi3an` as the confirmed HAODE public Instagram. Therefore the website footer remains `https://www.instagram.com/cristi3an/`.

## Verification

- Build and controlled public package: PASS.
- Targeted quality, footer and existing Zay behavior tests: 47/47 PASS (41 feature/regression checks plus 6 shared-footer compatibility checks).
- Complete browser gate: 261/261 PASS locally on the final candidate. Two timing-sensitive checks were synchronized with the real rendered state: product cards must have non-zero layout dimensions before their exact stage assertions run, and the store hero waits for the asynchronously injected approved stylesheet before measuring its position. Assertions, coverage and screenshot thresholds were not weakened. The four product-detail snapshots were reviewed after owner accepted the visual structure: the current render contains the restored footer and correctly loaded approved related-product images that the stale baselines captured as blank. All four macOS baselines were regenerated at 390, 430, 768 and 1440. The corresponding Linux renders were then captured by the exact GitHub CI environment, downloaded and reviewed individually before replacing the Linux baselines; no macOS screenshot was renamed as a Linux baseline and the comparison threshold remains unchanged.
- Runtime audit at 1440 and 390 across homepage, Pantallas, iPhone, Samsung and Foldables: 0 broken images, 0 horizontal overflow and 0 page/console errors.
- Production deployment: NOT RUN.
