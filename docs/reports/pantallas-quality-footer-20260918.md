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

## Verification

- Build and controlled public package: PASS.
- Targeted quality, footer and existing Zay behavior tests: 47/47 PASS (41 feature/regression checks plus 6 shared-footer compatibility checks).
- Complete browser gate: 249/261 PASS on the first exact-candidate run. The six shared-footer failures were corrected and passed on the targeted rerun. Two unrelated checks passed when rerun and were not reproducible. The remaining four product-detail visual snapshots differ because the restored footer changes full-page height at 390, 430, 768 and 1440; baselines were intentionally not accepted before owner visual approval.
- Runtime audit at 1440 and 390 across homepage, Pantallas, iPhone, Samsung and Foldables: 0 broken images, 0 horizontal overflow and 0 page/console errors.
- Production deployment: NOT RUN.
