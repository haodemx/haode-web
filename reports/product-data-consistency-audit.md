# HAODE Product Data Consistency Audit

?????2026-06-08

## Scope

- Compared `data/products.generated.js`, `products.js`, `producto/` static pages, `sitemap.xml`, and `categoria/` pages.
- Checked product IDs, SKU / slug mismatches, public product routes, static slugs, redirect pages, titles, categories, WhatsApp links, price table formats, and sitemap product URLs.
- Report only. No product data, prices, product images, videos, WhatsApp numbers, product pages, or sitemap entries were modified.

## Summary

- Source products in `data/products.generated.js`: 109
- Final products loaded through `products.js`: 109
- Static product route files under `producto/*/index.html`: 159
- Product URLs in `sitemap.xml`: 109
- Product data exists but public static page missing: 0
- Static non-redirect pages that do not resolve to product data: 7
- Static/redirect product slugs that do not resolve to product data: 9
- SKU / slug route inconsistencies: 82
- Title inconsistencies: 3
- Category link inconsistencies: 0
- WhatsApp link inconsistencies: 134
- Price table anomalies: 74
- Sitemap final-product omissions: 7
- Sitemap product URL extras/unresolved: 7
- Suspicious redirect pages: 17

## Duplicate Checks

| Type | Value | Count |
| --- | --- | --- |
| None found |  |  |

## Product Data Exists But Static Page Missing

| SKU | Product title | Category | Expected static page |
| --- | --- | --- | --- |
| None found |  |  |  |

## Static Page Exists But Product Data Missing

| Slug | File | Title | Canonical |
| --- | --- | --- | --- |
| funda-magnetica-estilo-iphone-17-pro-max | producto/funda-magnetica-estilo-iphone-17-pro-max/index.html | Funda Magnética Estilo iPhone 17 Pro Max | https://haode.com.mx/producto/funda-magnetica-estilo-iphone-17-pro-max/ |
| funda-premium-aluminio-estilo-iphone-17-pro-max | producto/funda-premium-aluminio-estilo-iphone-17-pro-max/index.html | Funda Premium Aluminio Estilo iPhone 17 Pro Max | https://haode.com.mx/producto/funda-premium-aluminio-estilo-iphone-17-pro-max/ |
| iphone-oled-11 | producto/iphone-oled-11/index.html | Pantalla para iPhone 11 \| HAODE México | https://haode.com.mx/producto/iphone-oled-11/ |
| iphone-oled-x | producto/iphone-oled-x/index.html | Pantalla para iPhone X \| HAODE México | https://haode.com.mx/producto/iphone-oled-x/ |
| lk-030-mini-camara-retro-digital | producto/lk-030-mini-camara-retro-digital/index.html | LK-030 Mini Cámara Retro Digital \| HAODE México | https://haode.com.mx/producto/lk-030-mini-camara-retro-digital/ |
| lk-032-camara-inteligente-con-gimbal | producto/lk-032-camara-inteligente-con-gimbal/index.html | LK-032 Cámara Inteligente con Gimbal \| HAODE México | https://haode.com.mx/producto/lk-032-camara-inteligente-con-gimbal/ |
| x200t-cortadora-inteligente-de-micas | producto/x200t-cortadora-inteligente-de-micas/index.html | HAODE X200T Cortadora Inteligente de Micas \| HAODE México | https://haode.com.mx/producto/x200t-cortadora-inteligente-de-micas/ |

## Static Or Redirect Slugs Not Resolving To Product Data

| Slug | File | Page type | Target/canonical |
| --- | --- | --- | --- |
| funda-magnetica-estilo-iphone-17-pro-max | producto/funda-magnetica-estilo-iphone-17-pro-max/index.html | static | https://haode.com.mx/producto/funda-magnetica-estilo-iphone-17-pro-max/ |
| funda-premium-aluminio-estilo-iphone-17-pro-max | producto/funda-premium-aluminio-estilo-iphone-17-pro-max/index.html | static | https://haode.com.mx/producto/funda-premium-aluminio-estilo-iphone-17-pro-max/ |
| index.html | producto/index.html | redirect | /productos/ |
| iphone-oled-11 | producto/iphone-oled-11/index.html | static | https://haode.com.mx/producto/iphone-oled-11/ |
| iphone-oled-11pro | producto/iphone-oled-11pro/index.html | redirect | /producto/iphone-incell-11pro/ |
| iphone-oled-x | producto/iphone-oled-x/index.html | static | https://haode.com.mx/producto/iphone-oled-x/ |
| lk-030-mini-camara-retro-digital | producto/lk-030-mini-camara-retro-digital/index.html | static | https://haode.com.mx/producto/lk-030-mini-camara-retro-digital/ |
| lk-032-camara-inteligente-con-gimbal | producto/lk-032-camara-inteligente-con-gimbal/index.html | static | https://haode.com.mx/producto/lk-032-camara-inteligente-con-gimbal/ |
| x200t-cortadora-inteligente-de-micas | producto/x200t-cortadora-inteligente-de-micas/index.html | static | https://haode.com.mx/producto/x200t-cortadora-inteligente-de-micas/ |

## SKU / Slug Route Inconsistencies

| Static slug | Resolved SKU | File | Issue |
| --- | --- | --- | --- |
| iphone-11-incell | iphone-incell-11 | producto/iphone-11-incell/index.html | Legacy/static alias resolves to product data but is not the public product ID route. |
| iphone-11-incell | iphone-incell-11 | producto/iphone-11-incell/index.html | OG URL slug is iphone-11-incell |
| iphone-11-pro-incell | iphone-incell-11pro | producto/iphone-11-pro-incell/index.html | Legacy/static alias resolves to product data but is not the public product ID route. |
| iphone-11-pro-incell | iphone-incell-11pro | producto/iphone-11-pro-incell/index.html | OG URL slug is iphone-11-pro-incell |
| iphone-11-pro-max-incell | iphone-incell-11promax | producto/iphone-11-pro-max-incell/index.html | Legacy/static alias resolves to product data but is not the public product ID route. |
| iphone-11-pro-max-incell | iphone-incell-11promax | producto/iphone-11-pro-max-incell/index.html | OG URL slug is iphone-11-pro-max-incell |
| iphone-11-pro-max-oled | iphone-oled-11promax | producto/iphone-11-pro-max-oled/index.html | Legacy/static alias resolves to product data but is not the public product ID route. |
| iphone-11-pro-max-oled | iphone-oled-11promax | producto/iphone-11-pro-max-oled/index.html | OG URL slug is iphone-11-pro-max-oled |
| iphone-12-mini-incell | iphone-incell-12mini | producto/iphone-12-mini-incell/index.html | Legacy/static alias resolves to product data but is not the public product ID route. |
| iphone-12-mini-incell | iphone-incell-12mini | producto/iphone-12-mini-incell/index.html | OG URL slug is iphone-12-mini-incell |
| iphone-12-pro-max-incell | iphone-incell-12promax | producto/iphone-12-pro-max-incell/index.html | Legacy/static alias resolves to product data but is not the public product ID route. |
| iphone-12-pro-max-incell | iphone-incell-12promax | producto/iphone-12-pro-max-incell/index.html | OG URL slug is iphone-12-pro-max-incell |
| iphone-12-pro-max-oled | iphone-oled-12promax | producto/iphone-12-pro-max-oled/index.html | Legacy/static alias resolves to product data but is not the public product ID route. |
| iphone-12-pro-max-oled | iphone-oled-12promax | producto/iphone-12-pro-max-oled/index.html | OG URL slug is iphone-12-pro-max-oled |
| iphone-13-incell | iphone-incell-13 | producto/iphone-13-incell/index.html | Legacy/static alias resolves to product data but is not the public product ID route. |
| iphone-13-incell | iphone-incell-13 | producto/iphone-13-incell/index.html | OG URL slug is iphone-13-incell |
| iphone-13-mini-incell | iphone-incell-13mini | producto/iphone-13-mini-incell/index.html | Legacy/static alias resolves to product data but is not the public product ID route. |
| iphone-13-mini-incell | iphone-incell-13mini | producto/iphone-13-mini-incell/index.html | OG URL slug is iphone-13-mini-incell |
| iphone-13-oled | iphone-oled-13 | producto/iphone-13-oled/index.html | Legacy/static alias resolves to product data but is not the public product ID route. |
| iphone-13-oled | iphone-oled-13 | producto/iphone-13-oled/index.html | OG URL slug is iphone-13-oled |
| iphone-13-pro-incell | iphone-incell-13pro | producto/iphone-13-pro-incell/index.html | Legacy/static alias resolves to product data but is not the public product ID route. |
| iphone-13-pro-incell | iphone-incell-13pro | producto/iphone-13-pro-incell/index.html | OG URL slug is iphone-13-pro-incell |
| iphone-13-pro-max-incell | iphone-incell-13promax | producto/iphone-13-pro-max-incell/index.html | Legacy/static alias resolves to product data but is not the public product ID route. |
| iphone-13-pro-max-incell | iphone-incell-13promax | producto/iphone-13-pro-max-incell/index.html | OG URL slug is iphone-13-pro-max-incell |
| iphone-13-pro-max-oled | iphone-oled-13promax | producto/iphone-13-pro-max-oled/index.html | Legacy/static alias resolves to product data but is not the public product ID route. |
| iphone-13-pro-max-oled | iphone-oled-13promax | producto/iphone-13-pro-max-oled/index.html | OG URL slug is iphone-13-pro-max-oled |
| iphone-13-pro-oled | iphone-oled-13pro | producto/iphone-13-pro-oled/index.html | Legacy/static alias resolves to product data but is not the public product ID route. |
| iphone-13-pro-oled | iphone-oled-13pro | producto/iphone-13-pro-oled/index.html | OG URL slug is iphone-13-pro-oled |
| iphone-14-incell | iphone-incell-14 | producto/iphone-14-incell/index.html | Legacy/static alias resolves to product data but is not the public product ID route. |
| iphone-14-incell | iphone-incell-14 | producto/iphone-14-incell/index.html | OG URL slug is iphone-14-incell |
| iphone-14-oled | iphone-oled-14 | producto/iphone-14-oled/index.html | Legacy/static alias resolves to product data but is not the public product ID route. |
| iphone-14-oled | iphone-oled-14 | producto/iphone-14-oled/index.html | OG URL slug is iphone-14-oled |
| iphone-14-plus-incell | iphone-incell-14plus | producto/iphone-14-plus-incell/index.html | Legacy/static alias resolves to product data but is not the public product ID route. |
| iphone-14-plus-incell | iphone-incell-14plus | producto/iphone-14-plus-incell/index.html | OG URL slug is iphone-14-plus-incell |
| iphone-14-plus-oled | iphone-oled-14plus | producto/iphone-14-plus-oled/index.html | Legacy/static alias resolves to product data but is not the public product ID route. |
| iphone-14-plus-oled | iphone-oled-14plus | producto/iphone-14-plus-oled/index.html | OG URL slug is iphone-14-plus-oled |
| iphone-14-pro-incell | iphone-incell-14pro | producto/iphone-14-pro-incell/index.html | Legacy/static alias resolves to product data but is not the public product ID route. |
| iphone-14-pro-incell | iphone-incell-14pro | producto/iphone-14-pro-incell/index.html | OG URL slug is iphone-14-pro-incell |
| iphone-14-pro-max-incell | iphone-incell-14promax | producto/iphone-14-pro-max-incell/index.html | Legacy/static alias resolves to product data but is not the public product ID route. |
| iphone-14-pro-max-incell | iphone-incell-14promax | producto/iphone-14-pro-max-incell/index.html | OG URL slug is iphone-14-pro-max-incell |
| iphone-14-pro-max-oled | iphone-oled-14promax | producto/iphone-14-pro-max-oled/index.html | Legacy/static alias resolves to product data but is not the public product ID route. |
| iphone-14-pro-max-oled | iphone-oled-14promax | producto/iphone-14-pro-max-oled/index.html | OG URL slug is iphone-14-pro-max-oled |
| iphone-15-incell | iphone-incell-15 | producto/iphone-15-incell/index.html | Legacy/static alias resolves to product data but is not the public product ID route. |
| iphone-15-incell | iphone-incell-15 | producto/iphone-15-incell/index.html | OG URL slug is iphone-15-incell |
| iphone-incell-12 | iphone-incell-12-12pro | producto/iphone-incell-12/index.html | Legacy/static alias resolves to product data but is not the public product ID route. |
| iphone-incell-12 | iphone-incell-12-12pro | producto/iphone-incell-12/index.html | Canonical slug is iphone-incell-12 |
| iphone-incell-12-pro | iphone-incell-12-12pro | producto/iphone-incell-12-pro/index.html | Legacy/static alias resolves to product data but is not the public product ID route. |
| iphone-incell-12-pro | iphone-incell-12-12pro | producto/iphone-incell-12-pro/index.html | Canonical slug is iphone-incell-12-pro |
| iphone-incell-12pro | iphone-incell-12-12pro | producto/iphone-incell-12pro/index.html | Legacy/static alias resolves to product data but is not the public product ID route. |
| iphone-incell-12pro | iphone-incell-12-12pro | producto/iphone-incell-12pro/index.html | Canonical slug is iphone-incell-12pro |
| iphone-x-incell | iphone-incell-x | producto/iphone-x-incell/index.html | Legacy/static alias resolves to product data but is not the public product ID route. |
| iphone-x-incell | iphone-incell-x | producto/iphone-x-incell/index.html | OG URL slug is iphone-x-incell |
| iphone-xr-incell | iphone-incell-xr | producto/iphone-xr-incell/index.html | Legacy/static alias resolves to product data but is not the public product ID route. |
| iphone-xr-incell | iphone-incell-xr | producto/iphone-xr-incell/index.html | OG URL slug is iphone-xr-incell |
| iphone-xs-incell | iphone-incell-xs | producto/iphone-xs-incell/index.html | Legacy/static alias resolves to product data but is not the public product ID route. |
| iphone-xs-incell | iphone-incell-xs | producto/iphone-xs-incell/index.html | OG URL slug is iphone-xs-incell |
| iphone-xs-max-oled | iphone-oled-xsmax | producto/iphone-xs-max-oled/index.html | Legacy/static alias resolves to product data but is not the public product ID route. |
| iphone-xs-max-oled | iphone-oled-xsmax | producto/iphone-xs-max-oled/index.html | OG URL slug is iphone-xs-max-oled |
| samsung-note-20-ultra-incell | samsung-incell-note-20-ultra | producto/samsung-note-20-ultra-incell/index.html | Legacy/static alias resolves to product data but is not the public product ID route. |
| samsung-note-20-ultra-incell | samsung-incell-note-20-ultra | producto/samsung-note-20-ultra-incell/index.html | OG URL slug is samsung-note-20-ultra-incell |
| samsung-s20-incell | samsung-incell-s20 | producto/samsung-s20-incell/index.html | Legacy/static alias resolves to product data but is not the public product ID route. |
| samsung-s20-incell | samsung-incell-s20 | producto/samsung-s20-incell/index.html | OG URL slug is samsung-s20-incell |
| samsung-s20-plus-oled | samsung-oled-s20-plus | producto/samsung-s20-plus-oled/index.html | Legacy/static alias resolves to product data but is not the public product ID route. |
| samsung-s20-plus-oled | samsung-oled-s20-plus | producto/samsung-s20-plus-oled/index.html | OG URL slug is samsung-s20-plus-oled |
| samsung-s21-incell | samsung-incell-s21 | producto/samsung-s21-incell/index.html | Legacy/static alias resolves to product data but is not the public product ID route. |
| samsung-s21-incell | samsung-incell-s21 | producto/samsung-s21-incell/index.html | OG URL slug is samsung-s21-incell |
| samsung-s21-ultra-oled | samsung-oled-s21-ultra | producto/samsung-s21-ultra-oled/index.html | Legacy/static alias resolves to product data but is not the public product ID route. |
| samsung-s21-ultra-oled | samsung-oled-s21-ultra | producto/samsung-s21-ultra-oled/index.html | OG URL slug is samsung-s21-ultra-oled |
| samsung-s22-ultra-incell | samsung-incell-s22-ultra | producto/samsung-s22-ultra-incell/index.html | Legacy/static alias resolves to product data but is not the public product ID route. |
| samsung-s22-ultra-incell | samsung-incell-s22-ultra | producto/samsung-s22-ultra-incell/index.html | OG URL slug is samsung-s22-ultra-incell |
| samsung-s22-ultra-oled | samsung-oled-s22-ultra | producto/samsung-s22-ultra-oled/index.html | Legacy/static alias resolves to product data but is not the public product ID route. |
| samsung-s22-ultra-oled | samsung-oled-s22-ultra | producto/samsung-s22-ultra-oled/index.html | OG URL slug is samsung-s22-ultra-oled |
| samsung-s23-ultra-incell | samsung-incell-s23-ultra | producto/samsung-s23-ultra-incell/index.html | Legacy/static alias resolves to product data but is not the public product ID route. |
| samsung-s23-ultra-incell | samsung-incell-s23-ultra | producto/samsung-s23-ultra-incell/index.html | OG URL slug is samsung-s23-ultra-incell |
| samsung-s23-ultra-oled | samsung-oled-s23-ultra | producto/samsung-s23-ultra-oled/index.html | Legacy/static alias resolves to product data but is not the public product ID route. |
| samsung-s23-ultra-oled | samsung-oled-s23-ultra | producto/samsung-s23-ultra-oled/index.html | OG URL slug is samsung-s23-ultra-oled |
| samsung-s24-ultra-incell | samsung-incell-s24-ultra | producto/samsung-s24-ultra-incell/index.html | Legacy/static alias resolves to product data but is not the public product ID route. |
| samsung-s24-ultra-incell | samsung-incell-s24-ultra | producto/samsung-s24-ultra-incell/index.html | OG URL slug is samsung-s24-ultra-incell |
| samsung-s24-ultra-oled | samsung-oled-s24-ultra | producto/samsung-s24-ultra-oled/index.html | Legacy/static alias resolves to product data but is not the public product ID route. |
| samsung-s24-ultra-oled | samsung-oled-s24-ultra | producto/samsung-s24-ultra-oled/index.html | OG URL slug is samsung-s24-ultra-oled |
| samsung-s25-ultra-oled | samsung-oled-s25-ultra | producto/samsung-s25-ultra-oled/index.html | Legacy/static alias resolves to product data but is not the public product ID route. |
| samsung-s25-ultra-oled | samsung-oled-s25-ultra | producto/samsung-s25-ultra-oled/index.html | OG URL slug is samsung-s25-ultra-oled |

## Title Inconsistencies

| Resolved SKU | Static slug | Product data title | Static page title | File |
| --- | --- | --- | --- | --- |
| iphone-incell-12-12pro | iphone-incell-12 | Pantalla para iPhone 12 / 12 Pro | Pantalla HAODE México \| Detalle de producto en CDMX | producto/iphone-incell-12/index.html |
| iphone-incell-12-12pro | iphone-incell-12-pro | Pantalla para iPhone 12 / 12 Pro | Pantalla HAODE México \| Detalle de producto en CDMX | producto/iphone-incell-12-pro/index.html |
| iphone-incell-12-12pro | iphone-incell-12pro | Pantalla para iPhone 12 / 12 Pro | Pantalla HAODE México \| Detalle de producto en CDMX | producto/iphone-incell-12pro/index.html |

## Category Inconsistencies

| Category page | Product slug | Resolved SKU | Product data category | Expected category |
| --- | --- | --- | --- | --- |
| None found |  |  |  |  |

## WhatsApp Link Inconsistencies

| Resolved SKU | Static slug | Issue | File |
| --- | --- | --- | --- |
| funda-premium-aluminio-plus | funda-premium-aluminio-plus | Text mismatch: ${encodeURIComponent(text)}`; | producto/funda-premium-aluminio-plus/index.html |
| iphone-incell-11 | iphone-11-incell | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-11-incell/index.html |
| iphone-incell-11pro | iphone-11-pro-incell | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-11-pro-incell/index.html |
| iphone-incell-11promax | iphone-11-pro-max-incell | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-11-pro-max-incell/index.html |
| iphone-oled-11promax | iphone-11-pro-max-oled | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-11-pro-max-oled/index.html |
| iphone-incell-12mini | iphone-12-mini-incell | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-12-mini-incell/index.html |
| iphone-incell-12promax | iphone-12-pro-max-incell | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-12-pro-max-incell/index.html |
| iphone-oled-12promax | iphone-12-pro-max-oled | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-12-pro-max-oled/index.html |
| iphone-incell-13 | iphone-13-incell | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-13-incell/index.html |
| iphone-incell-13mini | iphone-13-mini-incell | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-13-mini-incell/index.html |
| iphone-oled-13 | iphone-13-oled | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-13-oled/index.html |
| iphone-incell-13pro | iphone-13-pro-incell | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-13-pro-incell/index.html |
| iphone-incell-13promax | iphone-13-pro-max-incell | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-13-pro-max-incell/index.html |
| iphone-oled-13promax | iphone-13-pro-max-oled | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-13-pro-max-oled/index.html |
| iphone-oled-13pro | iphone-13-pro-oled | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-13-pro-oled/index.html |
| iphone-incell-14 | iphone-14-incell | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-14-incell/index.html |
| iphone-oled-14 | iphone-14-oled | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-14-oled/index.html |
| iphone-incell-14plus | iphone-14-plus-incell | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-14-plus-incell/index.html |
| iphone-oled-14plus | iphone-14-plus-oled | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-14-plus-oled/index.html |
| iphone-incell-14pro | iphone-14-pro-incell | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-14-pro-incell/index.html |
| iphone-incell-14promax | iphone-14-pro-max-incell | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-14-pro-max-incell/index.html |
| iphone-oled-14promax | iphone-14-pro-max-oled | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-14-pro-max-oled/index.html |
| iphone-incell-15 | iphone-15-incell | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-15-incell/index.html |
| iphone-incell-11 | iphone-incell-11 | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-incell-11/index.html |
| iphone-incell-11pro | iphone-incell-11pro | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-incell-11pro/index.html |
| iphone-incell-11promax | iphone-incell-11promax | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-incell-11promax/index.html |
| iphone-incell-12-12pro | iphone-incell-12 | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-incell-12/index.html |
| iphone-incell-12-12pro | iphone-incell-12-12pro | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-incell-12-12pro/index.html |
| iphone-incell-12-12pro | iphone-incell-12-pro | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-incell-12-pro/index.html |
| iphone-incell-12mini | iphone-incell-12mini | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-incell-12mini/index.html |
| iphone-incell-12-12pro | iphone-incell-12pro | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-incell-12pro/index.html |
| iphone-incell-12promax | iphone-incell-12promax | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-incell-12promax/index.html |
| iphone-incell-13 | iphone-incell-13 | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-incell-13/index.html |
| iphone-incell-13mini | iphone-incell-13mini | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-incell-13mini/index.html |
| iphone-incell-13pro | iphone-incell-13pro | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-incell-13pro/index.html |
| iphone-incell-13promax | iphone-incell-13promax | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-incell-13promax/index.html |
| iphone-incell-14 | iphone-incell-14 | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-incell-14/index.html |
| iphone-incell-14plus | iphone-incell-14plus | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-incell-14plus/index.html |
| iphone-incell-14pro | iphone-incell-14pro | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-incell-14pro/index.html |
| iphone-incell-14promax | iphone-incell-14promax | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-incell-14promax/index.html |
| iphone-incell-15 | iphone-incell-15 | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-incell-15/index.html |
| iphone-incell-15plus | iphone-incell-15plus | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-incell-15plus/index.html |
| iphone-incell-15pro | iphone-incell-15pro | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-incell-15pro/index.html |
| iphone-incell-15promax | iphone-incell-15promax | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-incell-15promax/index.html |
| iphone-incell-16 | iphone-incell-16 | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-incell-16/index.html |
| iphone-incell-16e | iphone-incell-16e | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-incell-16e/index.html |
| iphone-incell-16plus | iphone-incell-16plus | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-incell-16plus/index.html |
| iphone-incell-16pro | iphone-incell-16pro | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-incell-16pro/index.html |
| iphone-incell-16promax | iphone-incell-16promax | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-incell-16promax/index.html |
| iphone-incell-17 | iphone-incell-17 | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-incell-17/index.html |
| iphone-incell-17air | iphone-incell-17air | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-incell-17air/index.html |
| iphone-incell-17pro | iphone-incell-17pro | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-incell-17pro/index.html |
| iphone-incell-17promax | iphone-incell-17promax | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-incell-17promax/index.html |
| iphone-incell-x | iphone-incell-x | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-incell-x/index.html |
| iphone-incell-xr | iphone-incell-xr | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-incell-xr/index.html |
| iphone-incell-xs | iphone-incell-xs | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-incell-xs/index.html |
| iphone-incell-xsmax | iphone-incell-xsmax | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-incell-xsmax/index.html |
| iphone-oled-11promax | iphone-oled-11promax | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-oled-11promax/index.html |
| iphone-oled-12-12pro | iphone-oled-12-12pro | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-oled-12-12pro/index.html |
| iphone-oled-12mini | iphone-oled-12mini | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-oled-12mini/index.html |
| iphone-oled-12pro | iphone-oled-12pro | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-oled-12pro/index.html |
| iphone-oled-12promax | iphone-oled-12promax | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-oled-12promax/index.html |
| iphone-oled-13 | iphone-oled-13 | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-oled-13/index.html |
| iphone-oled-13mini | iphone-oled-13mini | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-oled-13mini/index.html |
| iphone-oled-13pro | iphone-oled-13pro | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-oled-13pro/index.html |
| iphone-oled-13promax | iphone-oled-13promax | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-oled-13promax/index.html |
| iphone-oled-14 | iphone-oled-14 | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-oled-14/index.html |
| iphone-oled-14plus | iphone-oled-14plus | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-oled-14plus/index.html |
| iphone-oled-14pro | iphone-oled-14pro | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-oled-14pro/index.html |
| iphone-oled-14promax | iphone-oled-14promax | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-oled-14promax/index.html |
| iphone-oled-15 | iphone-oled-15 | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-oled-15/index.html |
| iphone-oled-15plus | iphone-oled-15plus | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-oled-15plus/index.html |
| iphone-oled-15promax | iphone-oled-15promax | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-oled-15promax/index.html |
| iphone-oled-16 | iphone-oled-16 | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-oled-16/index.html |
| iphone-oled-16plus | iphone-oled-16plus | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-oled-16plus/index.html |
| iphone-oled-16pro | iphone-oled-16pro | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-oled-16pro/index.html |
| iphone-oled-16promax | iphone-oled-16promax | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-oled-16promax/index.html |
| iphone-oled-16promax-hard | iphone-oled-16promax-hard | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-oled-16promax-hard/index.html |
| iphone-oled-xsmax | iphone-oled-xsmax | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-oled-xsmax/index.html |
| iphone-incell-x | iphone-x-incell | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-x-incell/index.html |
| iphone-incell-xr | iphone-xr-incell | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-xr-incell/index.html |
| iphone-incell-xs | iphone-xs-incell | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-xs-incell/index.html |
| iphone-oled-xsmax | iphone-xs-max-oled | Text mismatch: Hola HAODE, quiero cotizar | producto/iphone-xs-max-oled/index.html |
| samsung-incell-note-10 | samsung-incell-note-10 | Text mismatch: Hola HAODE, quiero cotizar | producto/samsung-incell-note-10/index.html |
| samsung-incell-note-10-plus | samsung-incell-note-10-plus | Text mismatch: Hola HAODE, quiero cotizar | producto/samsung-incell-note-10-plus/index.html |
| samsung-incell-note-20-ultra | samsung-incell-note-20-ultra | Text mismatch: Hola HAODE, quiero cotizar | producto/samsung-incell-note-20-ultra/index.html |
| samsung-incell-note-8 | samsung-incell-note-8 | Text mismatch: Hola HAODE, quiero cotizar | producto/samsung-incell-note-8/index.html |
| samsung-incell-note-9 | samsung-incell-note-9 | Text mismatch: Hola HAODE, quiero cotizar | producto/samsung-incell-note-9/index.html |
| samsung-incell-s10 | samsung-incell-s10 | Text mismatch: Hola HAODE, quiero cotizar | producto/samsung-incell-s10/index.html |
| samsung-incell-s10-plus | samsung-incell-s10-plus | Text mismatch: Hola HAODE, quiero cotizar | producto/samsung-incell-s10-plus/index.html |
| samsung-incell-s20 | samsung-incell-s20 | Text mismatch: Hola HAODE, quiero cotizar | producto/samsung-incell-s20/index.html |
| samsung-incell-s20-fe | samsung-incell-s20-fe | Text mismatch: Hola HAODE, quiero cotizar | producto/samsung-incell-s20-fe/index.html |
| samsung-incell-s20-plus | samsung-incell-s20-plus | Text mismatch: Hola HAODE, quiero cotizar | producto/samsung-incell-s20-plus/index.html |
| samsung-incell-s20-ultra | samsung-incell-s20-ultra | Text mismatch: Hola HAODE, quiero cotizar | producto/samsung-incell-s20-ultra/index.html |
| samsung-incell-s21 | samsung-incell-s21 | Text mismatch: Hola HAODE, quiero cotizar | producto/samsung-incell-s21/index.html |
| samsung-incell-s21-ultra | samsung-incell-s21-ultra | Text mismatch: Hola HAODE, quiero cotizar | producto/samsung-incell-s21-ultra/index.html |
| samsung-incell-s22-ultra | samsung-incell-s22-ultra | Text mismatch: Hola HAODE, quiero cotizar | producto/samsung-incell-s22-ultra/index.html |
| samsung-incell-s23-ultra | samsung-incell-s23-ultra | Text mismatch: Hola HAODE, quiero cotizar | producto/samsung-incell-s23-ultra/index.html |
| samsung-incell-s24-ultra | samsung-incell-s24-ultra | Text mismatch: Hola HAODE, quiero cotizar | producto/samsung-incell-s24-ultra/index.html |
| samsung-incell-s8 | samsung-incell-s8 | Text mismatch: Hola HAODE, quiero cotizar | producto/samsung-incell-s8/index.html |
| samsung-incell-s8-plus | samsung-incell-s8-plus | Text mismatch: Hola HAODE, quiero cotizar | producto/samsung-incell-s8-plus/index.html |
| samsung-incell-s9 | samsung-incell-s9 | Text mismatch: Hola HAODE, quiero cotizar | producto/samsung-incell-s9/index.html |
| samsung-incell-s9-plus | samsung-incell-s9-plus | Text mismatch: Hola HAODE, quiero cotizar | producto/samsung-incell-s9-plus/index.html |
| samsung-incell-note-20-ultra | samsung-note-20-ultra-incell | Text mismatch: Hola HAODE, quiero cotizar | producto/samsung-note-20-ultra-incell/index.html |
| samsung-oled-note-10 | samsung-oled-note-10 | Text mismatch: Hola HAODE, quiero cotizar | producto/samsung-oled-note-10/index.html |
| samsung-oled-note-10-plus | samsung-oled-note-10-plus | Text mismatch: Hola HAODE, quiero cotizar | producto/samsung-oled-note-10-plus/index.html |
| samsung-oled-note-20 | samsung-oled-note-20 | Text mismatch: Hola HAODE, quiero cotizar | producto/samsung-oled-note-20/index.html |
| samsung-oled-note-20-ultra | samsung-oled-note-20-ultra | Text mismatch: Hola HAODE, quiero cotizar | producto/samsung-oled-note-20-ultra/index.html |
| samsung-oled-note-9 | samsung-oled-note-9 | Text mismatch: Hola HAODE, quiero cotizar | producto/samsung-oled-note-9/index.html |
| samsung-oled-s20 | samsung-oled-s20 | Text mismatch: Hola HAODE, quiero cotizar | producto/samsung-oled-s20/index.html |
| samsung-oled-s20-plus | samsung-oled-s20-plus | Text mismatch: Hola HAODE, quiero cotizar | producto/samsung-oled-s20-plus/index.html |
| samsung-oled-s20-ultra | samsung-oled-s20-ultra | Text mismatch: Hola HAODE, quiero cotizar | producto/samsung-oled-s20-ultra/index.html |
| samsung-oled-s21 | samsung-oled-s21 | Text mismatch: Hola HAODE, quiero cotizar | producto/samsung-oled-s21/index.html |
| samsung-oled-s21-plus | samsung-oled-s21-plus | Text mismatch: Hola HAODE, quiero cotizar | producto/samsung-oled-s21-plus/index.html |
| samsung-oled-s21-ultra | samsung-oled-s21-ultra | Text mismatch: Hola HAODE, quiero cotizar | producto/samsung-oled-s21-ultra/index.html |
| samsung-oled-s22-plus | samsung-oled-s22-plus | Text mismatch: Hola HAODE, quiero cotizar | producto/samsung-oled-s22-plus/index.html |
| samsung-oled-s22-ultra | samsung-oled-s22-ultra | Text mismatch: Hola HAODE, quiero cotizar | producto/samsung-oled-s22-ultra/index.html |
| samsung-oled-s23-plus | samsung-oled-s23-plus | Text mismatch: Hola HAODE, quiero cotizar | producto/samsung-oled-s23-plus/index.html |
| samsung-oled-s23-ultra | samsung-oled-s23-ultra | Text mismatch: Hola HAODE, quiero cotizar | producto/samsung-oled-s23-ultra/index.html |
| samsung-oled-s24-plus | samsung-oled-s24-plus | Text mismatch: Hola HAODE, quiero cotizar | producto/samsung-oled-s24-plus/index.html |
| samsung-oled-s24-ultra | samsung-oled-s24-ultra | Text mismatch: Hola HAODE, quiero cotizar | producto/samsung-oled-s24-ultra/index.html |
| samsung-oled-s25-ultra | samsung-oled-s25-ultra | Text mismatch: Hola HAODE, quiero cotizar | producto/samsung-oled-s25-ultra/index.html |
| samsung-oled-s9-plus | samsung-oled-s9-plus | Text mismatch: Hola HAODE, quiero cotizar | producto/samsung-oled-s9-plus/index.html |
| samsung-incell-s20 | samsung-s20-incell | Text mismatch: Hola HAODE, quiero cotizar | producto/samsung-s20-incell/index.html |
| samsung-oled-s20-plus | samsung-s20-plus-oled | Text mismatch: Hola HAODE, quiero cotizar | producto/samsung-s20-plus-oled/index.html |
| samsung-incell-s21 | samsung-s21-incell | Text mismatch: Hola HAODE, quiero cotizar | producto/samsung-s21-incell/index.html |
| samsung-oled-s21-ultra | samsung-s21-ultra-oled | Text mismatch: Hola HAODE, quiero cotizar | producto/samsung-s21-ultra-oled/index.html |
| samsung-incell-s22-ultra | samsung-s22-ultra-incell | Text mismatch: Hola HAODE, quiero cotizar | producto/samsung-s22-ultra-incell/index.html |
| samsung-oled-s22-ultra | samsung-s22-ultra-oled | Text mismatch: Hola HAODE, quiero cotizar | producto/samsung-s22-ultra-oled/index.html |
| samsung-incell-s23-ultra | samsung-s23-ultra-incell | Text mismatch: Hola HAODE, quiero cotizar | producto/samsung-s23-ultra-incell/index.html |
| samsung-oled-s23-ultra | samsung-s23-ultra-oled | Text mismatch: Hola HAODE, quiero cotizar | producto/samsung-s23-ultra-oled/index.html |
| samsung-incell-s24-ultra | samsung-s24-ultra-incell | Text mismatch: Hola HAODE, quiero cotizar | producto/samsung-s24-ultra-incell/index.html |
| samsung-oled-s24-ultra | samsung-s24-ultra-oled | Text mismatch: Hola HAODE, quiero cotizar | producto/samsung-s24-ultra-oled/index.html |
| samsung-oled-s25-ultra | samsung-s25-ultra-oled | Text mismatch: Hola HAODE, quiero cotizar | producto/samsung-s25-ultra-oled/index.html |

## Price Anomalies

| SKU | Product title | Issue |
| --- | --- | --- |
| funda-premium-aluminio-plus | Funda Premium Aluminio Plus | Price format anomaly: 100 pzs surtido = Consultar |
| funda-premium-aluminio-plus | Funda Premium Aluminio Plus | Price format anomaly: 100 pzs/modelo = Consultar |
| funda-premium-aluminio-plus | Funda Premium Aluminio Plus | Price format anomaly: Caja/modelo = Consultar |
| iphone-oled-12mini | Pantalla para iPhone 12 mini | Price format anomaly: 1 pza = Consultar |
| iphone-oled-12mini | Pantalla para iPhone 12 mini | Price format anomaly: 5+ pzs = Consultar |
| iphone-oled-12mini | Pantalla para iPhone 12 mini | Price format anomaly: 100 pzs surtido = Consultar |
| iphone-oled-12mini | Pantalla para iPhone 12 mini | Price format anomaly: 100 pzs/modelo = Consultar |
| iphone-oled-12mini | Pantalla para iPhone 12 mini | Price format anomaly: Caja/modelo = Consultar |
| iphone-oled-13mini | Pantalla para iPhone 13 mini | Price format anomaly: 1 pza = Consultar |
| iphone-oled-13mini | Pantalla para iPhone 13 mini | Price format anomaly: 5+ pzs = Consultar |
| iphone-oled-13mini | Pantalla para iPhone 13 mini | Price format anomaly: 100 pzs surtido = Consultar |
| iphone-oled-13mini | Pantalla para iPhone 13 mini | Price format anomaly: 100 pzs/modelo = Consultar |
| iphone-oled-13mini | Pantalla para iPhone 13 mini | Price format anomaly: Caja/modelo = Consultar |
| iphone-oled-15plus | Pantalla para iPhone 15 Plus | Price format anomaly: 1 pza = Consultar |
| iphone-oled-15plus | Pantalla para iPhone 15 Plus | Price format anomaly: 5+ pzs = Consultar |
| iphone-oled-15plus | Pantalla para iPhone 15 Plus | Price format anomaly: 100 pzs surtido = Consultar |
| iphone-oled-15plus | Pantalla para iPhone 15 Plus | Price format anomaly: 100 pzs/modelo = Consultar |
| iphone-oled-15plus | Pantalla para iPhone 15 Plus | Price format anomaly: Caja/modelo = Consultar |
| iphone-oled-16 | Pantalla para iPhone 16 | Price format anomaly: 1 pza = Consultar |
| iphone-oled-16 | Pantalla para iPhone 16 | Price format anomaly: 5+ pzs = Consultar |
| iphone-oled-16 | Pantalla para iPhone 16 | Price format anomaly: 100 pzs surtido = Consultar |
| iphone-oled-16 | Pantalla para iPhone 16 | Price format anomaly: 100 pzs/modelo = Consultar |
| iphone-oled-16 | Pantalla para iPhone 16 | Price format anomaly: Caja/modelo = Consultar |
| iphone-oled-16plus | Pantalla para iPhone 16 Plus | Price format anomaly: 1 pza = Consultar |
| iphone-oled-16plus | Pantalla para iPhone 16 Plus | Price format anomaly: 5+ pzs = Consultar |
| iphone-oled-16plus | Pantalla para iPhone 16 Plus | Price format anomaly: 100 pzs surtido = Consultar |
| iphone-oled-16plus | Pantalla para iPhone 16 Plus | Price format anomaly: 100 pzs/modelo = Consultar |
| iphone-oled-16plus | Pantalla para iPhone 16 Plus | Price format anomaly: Caja/modelo = Consultar |
| samsung-oled-note-10-plus | Pantalla para Samsung Note 10 Plus | Price format anomaly: Caja/modelo = Consultar |
| samsung-oled-note-9 | Pantalla para Samsung Note 9 | Price format anomaly: 1 pza = Consultar |
| samsung-oled-note-9 | Pantalla para Samsung Note 9 | Price format anomaly: 5+ pzs = Consultar |
| samsung-oled-note-9 | Pantalla para Samsung Note 9 | Price format anomaly: 100 pzs surtido = Consultar |
| samsung-oled-note-9 | Pantalla para Samsung Note 9 | Price format anomaly: 100 pzs/modelo = Consultar |
| samsung-oled-note-9 | Pantalla para Samsung Note 9 | Price format anomaly: Caja/modelo = Consultar |
| samsung-oled-s20 | Pantalla para Samsung S20 | Price format anomaly: 1 pza = Consultar |
| samsung-oled-s20 | Pantalla para Samsung S20 | Price format anomaly: 5+ pzs = Consultar |
| samsung-oled-s20 | Pantalla para Samsung S20 | Price format anomaly: 100 pzs surtido = Consultar |
| samsung-oled-s20 | Pantalla para Samsung S20 | Price format anomaly: 100 pzs/modelo = Consultar |
| samsung-oled-s20 | Pantalla para Samsung S20 | Price format anomaly: Caja/modelo = Consultar |
| samsung-oled-s20-ultra | Pantalla para Samsung S20 Ultra | Price format anomaly: 1 pza = Consultar |
| samsung-oled-s20-ultra | Pantalla para Samsung S20 Ultra | Price format anomaly: 5+ pzs = Consultar |
| samsung-oled-s20-ultra | Pantalla para Samsung S20 Ultra | Price format anomaly: 100 pzs surtido = Consultar |
| samsung-oled-s20-ultra | Pantalla para Samsung S20 Ultra | Price format anomaly: 100 pzs/modelo = Consultar |
| samsung-oled-s20-ultra | Pantalla para Samsung S20 Ultra | Price format anomaly: Caja/modelo = Consultar |
| samsung-oled-s21 | Pantalla para Samsung S21 | Price format anomaly: 1 pza = Consultar |
| samsung-oled-s21 | Pantalla para Samsung S21 | Price format anomaly: 5+ pzs = Consultar |
| samsung-oled-s21 | Pantalla para Samsung S21 | Price format anomaly: 100 pzs surtido = Consultar |
| samsung-oled-s21 | Pantalla para Samsung S21 | Price format anomaly: 100 pzs/modelo = Consultar |
| samsung-oled-s21 | Pantalla para Samsung S21 | Price format anomaly: Caja/modelo = Consultar |
| samsung-oled-s21-plus | Pantalla para Samsung S21 Plus | Price format anomaly: 1 pza = Consultar |
| samsung-oled-s21-plus | Pantalla para Samsung S21 Plus | Price format anomaly: 5+ pzs = Consultar |
| samsung-oled-s21-plus | Pantalla para Samsung S21 Plus | Price format anomaly: 100 pzs surtido = Consultar |
| samsung-oled-s21-plus | Pantalla para Samsung S21 Plus | Price format anomaly: 100 pzs/modelo = Consultar |
| samsung-oled-s21-plus | Pantalla para Samsung S21 Plus | Price format anomaly: Caja/modelo = Consultar |
| samsung-oled-s22-plus | Pantalla para Samsung S22 Plus | Price format anomaly: 1 pza = Consultar |
| samsung-oled-s22-plus | Pantalla para Samsung S22 Plus | Price format anomaly: 5+ pzs = Consultar |
| samsung-oled-s22-plus | Pantalla para Samsung S22 Plus | Price format anomaly: 100 pzs surtido = Consultar |
| samsung-oled-s22-plus | Pantalla para Samsung S22 Plus | Price format anomaly: 100 pzs/modelo = Consultar |
| samsung-oled-s22-plus | Pantalla para Samsung S22 Plus | Price format anomaly: Caja/modelo = Consultar |
| samsung-oled-s23-plus | Pantalla para Samsung S23 Plus | Price format anomaly: 1 pza = Consultar |
| samsung-oled-s23-plus | Pantalla para Samsung S23 Plus | Price format anomaly: 5+ pzs = Consultar |
| samsung-oled-s23-plus | Pantalla para Samsung S23 Plus | Price format anomaly: 100 pzs surtido = Consultar |
| samsung-oled-s23-plus | Pantalla para Samsung S23 Plus | Price format anomaly: 100 pzs/modelo = Consultar |
| samsung-oled-s23-plus | Pantalla para Samsung S23 Plus | Price format anomaly: Caja/modelo = Consultar |
| samsung-oled-s24-plus | Pantalla para Samsung S24 Plus | Price format anomaly: 1 pza = Consultar |
| samsung-oled-s24-plus | Pantalla para Samsung S24 Plus | Price format anomaly: 5+ pzs = Consultar |
| samsung-oled-s24-plus | Pantalla para Samsung S24 Plus | Price format anomaly: 100 pzs surtido = Consultar |
| samsung-oled-s24-plus | Pantalla para Samsung S24 Plus | Price format anomaly: 100 pzs/modelo = Consultar |
| samsung-oled-s24-plus | Pantalla para Samsung S24 Plus | Price format anomaly: Caja/modelo = Consultar |
| samsung-oled-s9-plus | Pantalla para Samsung S9 Plus | Price format anomaly: 1 pza = Consultar |
| samsung-oled-s9-plus | Pantalla para Samsung S9 Plus | Price format anomaly: 5+ pzs = Consultar |
| samsung-oled-s9-plus | Pantalla para Samsung S9 Plus | Price format anomaly: 100 pzs surtido = Consultar |
| samsung-oled-s9-plus | Pantalla para Samsung S9 Plus | Price format anomaly: 100 pzs/modelo = Consultar |
| samsung-oled-s9-plus | Pantalla para Samsung S9 Plus | Price format anomaly: Caja/modelo = Consultar |

## Sitemap Product Page Inconsistencies

### Final products missing from sitemap

| SKU | Product title | Category | Expected URL |
| --- | --- | --- | --- |
| funda-premium-17-pro-max | Funda Premium Aluminio | fundas | https://haode.com.mx/producto/funda-premium-17-pro-max/ |
| funda-magnetica-17-pro-max | Funda Magnetica | fundas | https://haode.com.mx/producto/funda-magnetica-17-pro-max/ |
| haode-ai-g3-smart-glasses | Gafas Inteligentes AI G3 | gafas-ai | https://haode.com.mx/producto/haode-ai-g3-smart-glasses/ |
| haode-ai-w610-smart-glasses | Gafas Inteligentes AI W610 | gafas-ai | https://haode.com.mx/producto/haode-ai-w610-smart-glasses/ |
| s1-ai-classic | HAODE AI CLASSIC S1 | gafas-ai | https://haode.com.mx/producto/s1-ai-classic/ |
| aimb-g5-ai-sports | AIMB-G5 AI SPORTS | gafas-ai | https://haode.com.mx/producto/aimb-g5-ai-sports/ |
| w630-ai-pro | W630 AI PRO | gafas-ai | https://haode.com.mx/producto/w630-ai-pro/ |

### Sitemap product URLs that do not resolve to final product data

| Slug | URL | Static file status |
| --- | --- | --- |
| funda-magnetica-estilo-iphone-17-pro-max | https://haode.com.mx/producto/funda-magnetica-estilo-iphone-17-pro-max/ | file exists |
| funda-premium-aluminio-estilo-iphone-17-pro-max | https://haode.com.mx/producto/funda-premium-aluminio-estilo-iphone-17-pro-max/ | file exists |
| iphone-oled-11 | https://haode.com.mx/producto/iphone-oled-11/ | file exists |
| iphone-oled-x | https://haode.com.mx/producto/iphone-oled-x/ | file exists |
| lk-030-mini-camara-retro-digital | https://haode.com.mx/producto/lk-030-mini-camara-retro-digital/ | file exists |
| lk-032-camara-inteligente-con-gimbal | https://haode.com.mx/producto/lk-032-camara-inteligente-con-gimbal/ | file exists |
| x200t-cortadora-inteligente-de-micas | https://haode.com.mx/producto/x200t-cortadora-inteligente-de-micas/ | file exists |

### Sitemap product URLs whose static target file is missing

| Slug | URL |
| --- | --- |
| None found |  |

## Category Page Product Link Inconsistencies

| Category page | Product slug | Issue |
| --- | --- | --- |
| categoria/camaras-inteligentes/index.html | lk-032-camara-inteligente-con-gimbal | target does not resolve to product data |
| categoria/camaras-inteligentes/index.html | lk-030-mini-camara-retro-digital | target does not resolve to product data |
| categoria/camaras-inteligentes/index.html | lk-032-camara-inteligente-con-gimbal | target does not resolve to product data |
| categoria/camaras-inteligentes/index.html | lk-030-mini-camara-retro-digital | target does not resolve to product data |
| categoria/fundas/index.html | funda-premium-aluminio-estilo-iphone-17-pro-max | target does not resolve to product data |
| categoria/fundas/index.html | funda-magnetica-estilo-iphone-17-pro-max | target does not resolve to product data |
| categoria/maquinas-de-hidrogel/index.html | x200t-cortadora-inteligente-de-micas | target does not resolve to product data |
| categoria/maquinas-de-hidrogel/index.html | x200t-cortadora-inteligente-de-micas | target does not resolve to product data |

## Redirect Page Audit

### Expected legacy redirect pages missing

| Expected legacy slug | Target SKU | Expected file |
| --- | --- | --- |
| None found |  |  |

### Existing redirect pages with suspicious targets

| Redirect slug | File | Target | Target file status | Target data status |
| --- | --- | --- | --- | --- |
| aimb-g5-ai-sports | producto/aimb-g5-ai-sports/index.html | ../../ai-smart-glasses-aimb-g5.html | target file missing | target does not resolve to product data |
| funda-magnetica-17-pro-max | producto/funda-magnetica-17-pro-max/index.html | ../funda-magnetica-estilo-iphone-17-pro-max/ | target file missing | target does not resolve to product data |
| funda-premium-17-pro-max | producto/funda-premium-17-pro-max/index.html | ../funda-premium-aluminio-estilo-iphone-17-pro-max/ | target file missing | target does not resolve to product data |
| haode-ai-g3-smart-glasses | producto/haode-ai-g3-smart-glasses/index.html | ../../ai-smart-glasses-aimb-g3.html | target file missing | target does not resolve to product data |
| haode-ai-w610-smart-glasses | producto/haode-ai-w610-smart-glasses/index.html | ../../ai-smart-glasses-w610.html | target file missing | target does not resolve to product data |
| index.html | producto/index.html | /productos/ | target file missing | target does not resolve to product data |
| s1-ai-classic | producto/s1-ai-classic/index.html | ../../ai-smart-glasses-s1.html | target file missing | target does not resolve to product data |
| samsung-incell-s10e | producto/samsung-incell-s10e/index.html | /producto.html?id=samsung-incell-s10e | target file missing | target does not resolve to product data |
| samsung-incell-s21-fe | producto/samsung-incell-s21-fe/index.html | /producto.html?id=samsung-incell-s21-fe | target file missing | target does not resolve to product data |
| samsung-incell-s21-plus | producto/samsung-incell-s21-plus/index.html | /producto.html?id=samsung-incell-s21-plus | target file missing | target does not resolve to product data |
| samsung-incell-s22 | producto/samsung-incell-s22/index.html | /producto.html?id=samsung-incell-s22 | target file missing | target does not resolve to product data |
| samsung-incell-s22-plus | producto/samsung-incell-s22-plus/index.html | /producto.html?id=samsung-incell-s22-plus | target file missing | target does not resolve to product data |
| samsung-incell-s23 | producto/samsung-incell-s23/index.html | /producto.html?id=samsung-incell-s23 | target file missing | target does not resolve to product data |
| samsung-incell-s23-plus | producto/samsung-incell-s23-plus/index.html | /producto.html?id=samsung-incell-s23-plus | target file missing | target does not resolve to product data |
| samsung-incell-s24 | producto/samsung-incell-s24/index.html | /producto.html?id=samsung-incell-s24 | target file missing | target does not resolve to product data |
| samsung-incell-s24-plus | producto/samsung-incell-s24-plus/index.html | /producto.html?id=samsung-incell-s24-plus | target file missing | target does not resolve to product data |
| w630-ai-pro | producto/w630-ai-pro/index.html | ../../ai-smart-glasses-w630.html | target file missing | target does not resolve to product data |

## Manual Review Notes

- Any price anomaly in this report is audit-only and must not be auto-corrected without owner confirmation.
- Legacy product route aliases should remain redirect/stub pages unless a separate routing cleanup is explicitly approved.
- WhatsApp number/text changes require owner approval; this report only identifies mismatches.
- Sitemap or redirect corrections should be handled in a separate low-risk batch only when the target is obvious and verification passes.
