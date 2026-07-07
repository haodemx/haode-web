# HAODE 官网/App 产品、价格、上架与图片审查报告

日期：2026-07-07
分支：`audit/product-price-listing-check-20260707`
参考价格表：`/Users/mac/Desktop/Lista_de_Precios_HAODE_2026_可改价格.xlsx`
范围：只读审查官网/App 产品数据、详情页、分类页、sitemap、JSON-LD、图片路径与本地页面加载。

## 1. 总结

| 指标 | 数量 |
| --- | --- |
| Master 产品总数 | 130 |
| 官网产品数据总数 data/products.generated.js | 139 |
| 官网可见产品数 | 139 |
| App 产品总数 app/products.json | 145 |
| App 可见产品数 | 144 |
| 静态详情页数量 producto/*/index.html | 189 |
| sitemap 产品链接数量 | 137 |
| Excel 参考价格行数 | 130 |
| 疑似漏上架/路由缺口数量 | 28 |
| 价格问题数量 | 79 |
| 图片问题数量 | 4 |
| 分类问题数量 | 0 |
| App 与官网不一致数量 | 50 |

本轮没有改价、没有补价、没有上架、没有发布、没有部署，也没有运行 `publish-products` 或强制重建产品数据。Excel 只作为参考价格源，不作为自动覆盖依据。

## 2. 数据源与历史重点

- 已读取项目规则、历史审查报告、`output/marketing-platform-audit` 相关报告、Master、官网、App、详情页、sitemap、robots 与 Excel 价格表。
- 历史重点仍成立：14 个缺价 SKU 需要老板确认；7 个价格异常 SKU 上轮未改价；`verify-products` 可能因既有 Firestore/队列/价格差异返回 `QUEUED`。
- sitemap admin 页面：未发现；公开页面 admin 入口：未发现。

## 3. 分类覆盖检查

| 分类 | 官网数据数量 | 状态 |
| --- | --- | --- |
| iPhone INCELL | 31 | 有公开/数据产品 |
| iPhone OLED | 22 | 有公开/数据产品 |
| iPhone OLED Diagnóstico / 免诊断 | 22 | 有公开/数据产品 |
| iPhone Original | 0 | 未见完整公开目录或计划中 |
| Samsung INCELL | 29 | 有公开/数据产品 |
| Samsung OLED / AMOLED | 19 | 有公开/数据产品 |
| Samsung TIPO ORIGINAL | 0 | 未见完整公开目录或计划中 |
| Samsung Z Flip 系列 | 0 | 未见完整公开目录或计划中 |
| Samsung Z Fold 系列 | 0 | 未见完整公开目录或计划中 |
| MICA / 手机膜 | 4 | 有公开/数据产品 |
| 切膜机 HAODE X200T | 0 | 未见完整公开目录或计划中 |
| Productos AI | 9 | 有公开/数据产品 |
| Fundas / 手机壳 | 3 | 有公开/数据产品 |
| 电池 | 0 | 未见完整公开目录或计划中 |

## 4. 漏上架产品 / 路由同步缺口表

| slug | 产品名称 | 来源文件 | 应属分类 | 官网分类页是否出现 | App是否出现 | 详情页是否存在 | sitemap是否包含 | 是否建议上架 | 上架前要求 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| aimb-g5-ai-sports | AIMB-G5 AI SPORTS | Master+App+Website | productos-ai | 是 | 是 | 是 | 否 | 建议补齐详情页/sitemap | 需确认数据来源与图片 |
| funda-magnetica-17-pro-max | Funda Magnetica | Master+App+Website | fundas | 是 | 是 | 是 | 否 | 建议补齐详情页/sitemap | 需确认数据来源与图片 |
| funda-premium-17-pro-max | Funda Premium Aluminio | Master+App+Website | fundas | 是 | 是 | 是 | 否 | 建议补齐详情页/sitemap | 需确认数据来源与图片 |
| haode-ai-g3-smart-glasses | Gafas Inteligentes AI G3 | Master+App+Website | productos-ai | 是 | 是 | 是 | 否 | 建议补齐详情页/sitemap | 需确认数据来源与图片 |
| haode-ai-w610-smart-glasses | Gafas Inteligentes AI W610 | Master+App+Website | productos-ai | 是 | 是 | 是 | 否 | 建议补齐详情页/sitemap | 需确认数据来源与图片 |
| s1-ai-classic | HAODE AI CLASSIC S1 | Master+App+Website | productos-ai | 是 | 是 | 是 | 否 | 建议补齐详情页/sitemap | 需确认数据来源与图片 |
| samsung-incell-note-10-lite | Pantalla para Samsung Note 10 Lite | App | samsung-incell | 否 | 是 | 否 | 否 | 建议补齐官网数据 | 需确认数据来源与图片 |
| samsung-incell-note-20 | Pantalla para Samsung Note 20 | App | samsung-incell | 否 | 是 | 否 | 否 | 建议补齐官网数据 | 需确认数据来源与图片 |
| samsung-incell-s10-lite | Pantalla para Samsung S10 Lite | App | samsung-incell | 否 | 是 | 否 | 否 | 建议补齐官网数据 | 需确认数据来源与图片 |
| samsung-original-note-20-ultra | Pantalla para Samsung Note 20 Ultra | App | Pantallas Samsung Original | 否 | 是 | 否 | 否 | 建议补齐官网数据 | 需确认数据来源与图片 |
| samsung-original-s21-ultra | Pantalla para Samsung S21 Ultra | App | Pantallas Samsung Original | 否 | 是 | 否 | 否 | 建议补齐官网数据 | 需确认数据来源与图片 |
| samsung-original-s22-plus | Pantalla para Samsung S22 Plus | App | Pantallas Samsung Original | 否 | 是 | 否 | 否 | 建议补齐官网数据 | 需确认数据来源与图片 |
| samsung-original-s22-ultra | Pantalla para Samsung S22 Ultra | App | Pantallas Samsung Original | 否 | 是 | 否 | 否 | 建议补齐官网数据 | 需确认数据来源与图片 |
| samsung-original-s23-plus | Pantalla para Samsung S23 Plus | App | Pantallas Samsung Original | 否 | 是 | 否 | 否 | 建议补齐官网数据 | 需确认数据来源与图片 |
| samsung-original-s23-ultra | Pantalla para Samsung S23 Ultra | App | Pantallas Samsung Original | 否 | 是 | 否 | 否 | 建议补齐官网数据 | 需确认数据来源与图片 |
| samsung-original-s24-ultra | Pantalla para Samsung S24 Ultra | App | Pantallas Samsung Original | 否 | 是 | 否 | 否 | 建议补齐官网数据 | 需确认数据来源与图片 |
| samsung-original-s25-ultra | Pantalla para Samsung S25 Ultra | App | Pantallas Samsung Original | 否 | 是 | 否 | 否 | 建议补齐官网数据 | 需确认数据来源与图片 |
| samsung-original-z-flip3 | Pantalla para Samsung Z Flip3 | App | samsung-z-flip | 否 | 是 | 否 | 否 | 建议补齐官网数据 | 需确认数据来源与图片 |
| samsung-original-z-flip4 | Pantalla para Samsung Z Flip4 | App | samsung-z-flip | 否 | 是 | 否 | 否 | 建议补齐官网数据 | 需确认数据来源与图片 |
| samsung-original-z-flip5 | Pantalla para Samsung Z Flip5 | App | samsung-z-flip | 否 | 是 | 否 | 否 | 建议补齐官网数据 | 需确认数据来源与图片 |
| samsung-original-z-flip6 | Pantalla para Samsung Z Flip6 | App | samsung-z-flip | 否 | 是 | 否 | 否 | 建议补齐官网数据 | 需确认数据来源与图片 |
| samsung-original-z-flip7 | Pantalla Samsung Z Flip7 | App | samsung-z-flip | 否 | 是 | 否 | 否 | 建议补齐官网数据 | 需确认数据来源与图片 |
| samsung-original-z-fold3 | Pantalla Samsung Z Fold3 | App | samsung-z-fold | 否 | 是 | 否 | 否 | 建议补齐官网数据 | 需确认数据来源与图片 |
| samsung-original-z-fold4 | Pantalla Samsung Z Fold4 | App | samsung-z-fold | 否 | 是 | 否 | 否 | 建议补齐官网数据 | 需确认数据来源与图片 |
| samsung-original-z-fold5 | Pantalla Samsung Z Fold5 | App | samsung-z-fold | 否 | 是 | 否 | 否 | 建议补齐官网数据 | 需确认数据来源与图片 |
| samsung-original-z-fold6 | Pantalla Samsung Z Fold6 | App | samsung-z-fold | 否 | 是 | 否 | 否 | 建议补齐官网数据 | 需确认数据来源与图片 |
| w630-ai-pro | W630 AI PRO | Master+App+Website | productos-ai | 是 | 是 | 是 | 否 | 建议补齐详情页/sitemap | 需确认数据来源与图片 |
| x200t-cortadora-micas | HAODE X200T Cortadora Inteligente de Micas | Master+App | maquinas-de-mica | 否 | 是 | 否 | 否 | 建议补齐官网数据 | 需确认数据来源与图片 |

## 5. 价格错误 / 价格不一致表

| slug | 产品名称 | 分类 | 官网价格 | App价格 | Master价格 | Excel参考价 | JSON-LD价格 | 当前页面显示 | 差异金额 | 问题类型 | 促销风险 | 建议处理方式 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| aimb-g5-ai-sports | AIMB-G5 AI SPORTS | Gafas AI | 1800 / 1400 | 1800 / 1400 | 1800 / 1400 | 近似参考 1500 / 1200 (AI Gafas AI ai) | 无 | 未识别价格 | 0 | 官网/Excel参考价不一致 | 未见明确促销字段 | 保持，人工确认后再改 |
| funda-magnetica-17-pro-max | Funda Magnetica | Fundas | 100 / 90 | 100 / 90 | 100 / 90 | 未匹配 | 无 | 未识别价格 | 0 | 官网/Excel参考价不一致 | 未见明确促销字段 | 保持，人工确认后再改 |
| funda-premium-17-pro-max | Funda Premium Aluminio | Fundas | 85 / 75 | 85 / 75 | 85 / 75 | 未匹配 | 无 | 未识别价格 | 0 | 官网/Excel参考价不一致 | 未见明确促销字段 | 保持，人工确认后再改 |
| haode-pantalla-oled-diagnostica-modelo-12-12-pro | HAODE Pantalla OLED Diagnóstica - Modelo 12 / 12 Pro | Pantallas OLED Diagnóstica | 1000 / 950 | 1000 / 950 | 1000 / 950 | 近似参考 650 / 640 (iPhone 12/12PRO OLED PREMIUM) | 1000 MXN | $1000, $800, $850, $900, $950 MXN | 0 | 官网/Excel参考价不一致 | 未见明确促销字段 | 保持，人工确认后再改 |
| haode-pantalla-oled-diagnostica-modelo-12-pro-max | HAODE Pantalla OLED Diagnóstica - Modelo 12 Pro Max | Pantallas OLED Diagnóstica | 1200 / 1050 | 1200 / 1050 | 1200 / 1050 | 近似参考 850 / 830 (iPhone 12PRO MAX OLED PREMIUM) | 1200 MXN | $1000, $1050, $1100, $1200 MXN | 0 | 官网/Excel参考价不一致 | 未见明确促销字段 | 保持，人工确认后再改 |
| haode-pantalla-oled-diagnostica-modelo-13 | HAODE Pantalla OLED Diagnóstica - Modelo 13 | Pantallas OLED Diagnóstica | 1200 / 1050 | 1200 / 1050 | 1200 / 1050 | 近似参考 730 / 720 (iPhone 13 OLED PREMIUM) | 1200 MXN | $1000, $1050, $1100, $1200 MXN | 0 | 官网/Excel参考价不一致 | 未见明确促销字段 | 保持，人工确认后再改 |
| haode-pantalla-oled-diagnostica-modelo-13-pro | HAODE Pantalla OLED Diagnóstica - Modelo 13 Pro | Pantallas OLED Diagnóstica | 1300 / 1250 | 1300 / 1250 | 1300 / 1250 | 近似参考 800 / 780 (iPhone 13PRO OLED PREMIUM) | 1300 MXN | $1050, $1150, $1200, $1250, $1300 MXN | 0 | 官网/Excel参考价不一致 | 未见明确促销字段 | 保持，人工确认后再改 |
| haode-pantalla-oled-diagnostica-modelo-13-pro-max | HAODE Pantalla OLED Diagnóstica - Modelo 13 Pro Max | Pantallas OLED Diagnóstica | 1400 / 1350 | 1400 / 1350 | 1400 / 1350 | 近似参考 900 / 850 (iPhone 13PRO MAX OLED PREMIUM) | 1400 MXN | $1200, $1250, $1300, $1350, $1400 MXN | 0 | 官网/Excel参考价不一致 | 未见明确促销字段 | 保持，人工确认后再改 |
| haode-pantalla-oled-diagnostica-modelo-14 | HAODE Pantalla OLED Diagnóstica - Modelo 14 | Pantallas OLED Diagnóstica | 1300 / 1250 | 1300 / 1250 | 1300 / 1250 | 近似参考 700 / 680 (iPhone 14 OLED PREMIUM) | 1300 MXN | $1050, $1150, $1200, $1250, $1300 MXN | 0 | 官网/Excel参考价不一致 | 未见明确促销字段 | 保持，人工确认后再改 |
| haode-pantalla-oled-diagnostica-modelo-14-plus | HAODE Pantalla OLED Diagnóstica - Modelo 14 Plus | Pantallas OLED Diagnóstica | 1500 / 1450 | 1500 / 1450 | 1500 / 1450 | 近似参考 900 / 880 (iPhone 14 plus OLED PREMIUM) | 1500 MXN | $1250, $1350, $1400, $1450, $1500 MXN | 0 | 官网/Excel参考价不一致 | 未见明确促销字段 | 保持，人工确认后再改 |
| haode-pantalla-oled-diagnostica-modelo-14-pro | HAODE Pantalla OLED Diagnóstica - Modelo 14 Pro | Pantallas OLED Diagnóstica | 1500 / 1450 | 1500 / 1450 | 1500 / 1450 | 近似参考 1200 / 1150 (iPhone 14PRO SOFT OLED PREMIUM) | 1500 MXN | $1250, $1350, $1400, $1450, $1500 MXN | 0 | 官网/Excel参考价不一致 | 未见明确促销字段 | 保持，人工确认后再改 |
| haode-pantalla-oled-diagnostica-modelo-14-pro-max | HAODE Pantalla OLED Diagnóstica - Modelo 14 Pro Max | Pantallas OLED Diagnóstica | 1600 / 1550 | 1600 / 1550 | 1600 / 1550 | 近似参考 1000 / 950 (iPhone 14PRO MAX OLED PREMIUM) | 1600 MXN | $1400, $1450, $1500, $1550, $1600 MXN | 0 | 官网/Excel参考价不一致 | 未见明确促销字段 | 保持，人工确认后再改 |
| haode-pantalla-oled-diagnostica-modelo-15 | HAODE Pantalla OLED Diagnóstica - Modelo 15 | Pantallas OLED Diagnóstica | 1600 / 1550 | 1600 / 1550 | 1600 / 1550 | 近似参考 1200 / 1150 (iPhone 15 SOFT OLED PREMIUM) | 1600 MXN | $1300, $1450, $1500, $1550, $1600 MXN | 0 | 官网/Excel参考价不一致 | 未见明确促销字段 | 保持，人工确认后再改 |
| haode-pantalla-oled-diagnostica-modelo-15-plus | HAODE Pantalla OLED Diagnóstica - Modelo 15 Plus | Pantallas OLED Diagnóstica | 2000 / 1950 | 2000 / 1950 | 2000 / 1950 | 近似参考 1200 / 1150 (iPhone 15 SOFT OLED PREMIUM) | 2000 MXN | $1700, $1850, $1900, $1950, $2000 MXN | 0 | 官网/Excel参考价不一致 | 未见明确促销字段 | 保持，人工确认后再改 |
| haode-pantalla-oled-diagnostica-modelo-15-pro | HAODE Pantalla OLED Diagnóstica - Modelo 15 Pro | Pantallas OLED Diagnóstica | 1700 / 1650 | 1700 / 1650 | 1700 / 1650 | 近似参考 1300 / 1250 (iPhone 15PRO SOFT OLED PREMIUM) | 1700 MXN | $1500, $1550, $1600, $1650, $1700 MXN | 0 | 官网/Excel参考价不一致 | 未见明确促销字段 | 保持，人工确认后再改 |
| haode-pantalla-oled-diagnostica-modelo-15-pro-max | HAODE Pantalla OLED Diagnóstica - Modelo 15 Pro Max | Pantallas OLED Diagnóstica | 2000 / 1950 | 2000 / 1950 | 2000 / 1950 | 近似参考 1200 / 1100 (iPhone 15PRO MAX OLED PREMIUM) | 2000 MXN | $1700, $1850, $1900, $1950, $2000 MXN | 0 | 官网/Excel参考价不一致 | 未见明确促销字段 | 保持，人工确认后再改 |
| haode-pantalla-oled-diagnostica-modelo-16 | HAODE Pantalla OLED Diagnóstica - Modelo 16 | Pantallas OLED Diagnóstica | 2000 / 1950 | 2000 / 1950 | 2000 / 1950 | 未匹配 | 2000 MXN | $1700, $1850, $1900, $1950, $2000 MXN | 0 | 官网/Excel参考价不一致 | 未见明确促销字段 | 保持，人工确认后再改 |
| haode-pantalla-oled-diagnostica-modelo-16-plus | HAODE Pantalla OLED Diagnóstica - Modelo 16 Plus | Pantallas OLED Diagnóstica | 2500 / 2450 | 2500 / 2450 | 2500 / 2450 | 未匹配 | 2500 MXN | $2200, $2350, $2400, $2450, $2500 MXN | 0 | 官网/Excel参考价不一致 | 未见明确促销字段 | 保持，人工确认后再改 |
| haode-pantalla-oled-diagnostica-modelo-16-pro | HAODE Pantalla OLED Diagnóstica - Modelo 16 Pro | Pantallas OLED Diagnóstica | 2300 / 2250 | 2300 / 2250 | 2300 / 2250 | 近似参考 1500 / 1450 (iPhone 16PRO OLED PREMIUM) | 2300 MXN | $2000, $2150, $2200, $2250, $2300 MXN | 0 | 官网/Excel参考价不一致 | 未见明确促销字段 | 保持，人工确认后再改 |
| haode-pantalla-oled-diagnostica-modelo-16-pro-max | HAODE Pantalla OLED Diagnóstica - Modelo 16 Pro Max | Pantallas OLED Diagnóstica | 2500 / 2450 | 2500 / 2450 | 2500 / 2450 | 近似参考 1600 / 1550 (iPhone 16 PROMAX OLED PREMIUM) | 2500 MXN | $2300, $2350, $2400, $2450, $2500 MXN | 0 | 官网/Excel参考价不一致 | 未见明确促销字段 | 保持，人工确认后再改 |
| haode-pantalla-oled-diagnostica-modelo-17 | HAODE Pantalla OLED Diagnóstica - Modelo 17 | Pantallas OLED Diagnóstica | 2500 / 2450 | 2500 / 2450 | 2500 / 2450 | 未匹配 | 2500 MXN | $2300, $2350, $2400, $2450, $2500 MXN | 0 | 官网/Excel参考价不一致 | 未见明确促销字段 | 保持，人工确认后再改 |
| haode-pantalla-oled-diagnostica-modelo-17-pro | HAODE Pantalla OLED Diagnóstica - Modelo 17 Pro | Pantallas OLED Diagnóstica | 2700 / 2650 | 2700 / 2650 | 2700 / 2650 | 未匹配 | 2700 MXN | $2500, $2550, $2600, $2650, $2700 MXN | 0 | 官网/Excel参考价不一致 | 未见明确促销字段 | 保持，人工确认后再改 |
| haode-pantalla-oled-diagnostica-modelo-17-pro-max | HAODE Pantalla OLED Diagnóstica - Modelo 17 Pro Max | Pantallas OLED Diagnóstica | 3000 / 2950 | 3000 / 2950 | 3000 / 2950 | 未匹配 | 3000 MXN | $2700, $2850, $2900, $2950, $3000 MXN | 0 | 官网/Excel参考价不一致 | 未见明确促销字段 | 保持，人工确认后再改 |
| haode-pantalla-oled-diagnostica-modelo-xs-max | HAODE Pantalla OLED Diagnóstica - Modelo XS Max | Pantallas OLED Diagnóstica | 1000 / 950 | 1000 / 950 | 1000 / 950 | 近似参考 580 / 570 (iPhone XS MAX OLED PREMIUM) | 1000 MXN | $1000, $800, $850, $900, $950 MXN | 0 | 官网/Excel参考价不一致 | 未见明确促销字段 | 保持，人工确认后再改 |
| iphone-incell-11pro | Pantalla para iPhone 11 Pro | Pantallas iPhone INCELL | 200 / 195 | 200 / 195 | 200 / 195 | 近似参考 200 / 195 (iPhone 11PRO INCELL FHD) | 200 MXN | $185, $190, $195, $200 MXN | 0 | 官网/Excel参考价不一致 | App有促销字段 | 保持，人工确认后再改 |
| iphone-incell-11promax | Pantalla para iPhone 11 Pro Max | Pantallas iPhone INCELL | 220 / 210 | 220 / 210 | 220 / 210 | 近似参考 220 / 210 (iPhone 11PRO MAX INCELL FHD) | 220 MXN | $190, $195, $200, $210, $220 MXN | 0 | 官网/Excel参考价不一致 | 未见明确促销字段 | 保持，人工确认后再改 |
| iphone-incell-12promax | Pantalla para iPhone 12 Pro Max | Pantallas iPhone INCELL | 220 / 210 | 250 / 240 | 250 / 240 | 近似参考 250 / 240 (iPhone 12PRO MAX INCELL FHD) | (无price) MXN | Consultar | -30 | 官网/App公开价不一致；官网/App批发价不一致；官网/Master公开价不一致；官网/Master批发价不一致；详情页可能只显示 Consultar；JSON-LD price 缺失或不等于官网公开价；官网/Excel参考价不一致 | 需确认是否促销价 | 未改价；Master/App/Excel 需一起确认，避免覆盖促销价 |
| iphone-incell-13pro | Pantalla para iPhone 13 Pro | Pantallas iPhone INCELL | 300 / 290 | 300 / 290 | 300 / 290 | 近似参考 300 / 290 (iPhone 13PRO INCELL FHD) | 300 MXN | $275, $280, $285, $290, $300 MXN | 0 | 官网/Excel参考价不一致 | 未见明确促销字段 | 保持，人工确认后再改 |
| iphone-incell-13promax | Pantalla para iPhone 13 Pro Max | Pantallas iPhone INCELL | 350 / 340 | 350 / 340 | 350 / 340 | 近似参考 350 / 340 (iPhone 13PRO MAX INCELL FHD) | 350 MXN | $325, $330, $335, $340, $350 MXN | 0 | 官网/Excel参考价不一致 | 未见明确促销字段 | 保持，人工确认后再改 |
| iphone-incell-14 | Pantalla para iPhone 14 | Pantallas iPhone INCELL | 800 / 750 | 260 / 250 | 260 / 250 | 近似参考 260 / 250 (iPhone 14 INCELL FHD) | (无price) MXN | Consultar | 540 | 官网/App公开价不一致；官网/App批发价不一致；官网/Master公开价不一致；官网/Master批发价不一致；详情页可能只显示 Consultar；JSON-LD price 缺失或不等于官网公开价；官网/Excel参考价不一致 | App有促销字段 | 未改价；Master/App/Excel 需一起确认，避免覆盖促销价 |
| iphone-incell-14plus | Pantalla para iPhone 14 Plus | Pantallas iPhone INCELL | 800 / 750 | 300 / 290 | 300 / 290 | 近似参考 300 / 290 (iPhone 14 plus INCELL FHD) | (无price) MXN | Consultar | 500 | 官网/App公开价不一致；官网/App批发价不一致；官网/Master公开价不一致；官网/Master批发价不一致；详情页可能只显示 Consultar；JSON-LD price 缺失或不等于官网公开价；官网/Excel参考价不一致 | 需确认是否促销价 | 未改价；Master/App/Excel 需一起确认，避免覆盖促销价 |
| iphone-incell-14pro | Pantalla para iPhone 14 Pro | Pantallas iPhone INCELL | 350 / 340 | 350 / 340 | 350 / 340 | 近似参考 350 / 340 (iPhone 14PRO INCELL FHD) | 350 MXN | $310, $320, $330, $340, $350 MXN | 0 | 官网/Excel参考价不一致 | 未见明确促销字段 | 保持，人工确认后再改 |
| iphone-incell-14promax | Pantalla para iPhone 14 Pro Max | Pantallas iPhone INCELL | 380 / 350 | 380 / 350 | 380 / 350 | 近似参考 380 / 350 (iPhone 14PRO MAX INCELL FHD) | 380 MXN | $310, $330, $340, $350, $380 MXN | 0 | 官网/Excel参考价不一致 | 未见明确促销字段 | 保持，人工确认后再改 |
| iphone-incell-15plus | Pantalla para iPhone 15 Plus | Pantallas iPhone INCELL | 300 / 290 | 330 / 310 | 330 / 310 | 近似参考 330 / 310 (iPhone 15 plus INCELL FHD) | (无price) MXN | Consultar | -30 | 官网/App公开价不一致；官网/App批发价不一致；官网/Master公开价不一致；官网/Master批发价不一致；详情页可能只显示 Consultar；JSON-LD price 缺失或不等于官网公开价 | 需确认是否促销价 | 未改价；Master/App/Excel 需一起确认，避免覆盖促销价 |
| iphone-incell-15pro | Pantalla para iPhone 15 Pro | Pantallas iPhone INCELL | 350 / 340 | 350 / 340 | 350 / 340 | 近似参考 350 / 340 (iPhone 15PRO INCELL FHD) | 350 MXN | $320, $330, $335, $340, $350 MXN | 0 | 官网/Excel参考价不一致 | 未见明确促销字段 | 保持，人工确认后再改 |
| iphone-incell-15promax | Pantalla para iPhone 15 Pro Max | Pantallas iPhone INCELL | 400 / 380 | 400 / 380 | 400 / 380 | 近似参考 400 / 380 (iPhone 15PRO MAX INCELL FHD) | 400 MXN | $330, $350, $370, $380, $400 MXN | 0 | 官网/Excel参考价不一致 | 未见明确促销字段 | 保持，人工确认后再改 |
| iphone-incell-16e | Pantalla para iPhone 16e | Pantallas iPhone INCELL | 300 / 280 | 300 / 280 | 300 / 280 | 近似参考 300 / 280 (iPhone 16E INCELL FHD) | 300 MXN | $260, $270, $275, $280, $300 MXN | 0 | 官网/Excel参考价不一致 | 未见明确促销字段 | 保持，人工确认后再改 |
| iphone-incell-16pro | Pantalla para iPhone 16 Pro | Pantallas iPhone INCELL | 700 / 680 | 700 / 680 | 700 / 680 | 近似参考 700 / 680 (iPhone 16PRO INCELL FHD) | 700 MXN | $620, $650, $660, $680, $700 MXN | 0 | 官网/Excel参考价不一致 | 未见明确促销字段 | 保持，人工确认后再改 |
| iphone-incell-16promax | Pantalla para iPhone 16 Pro Max | Pantallas iPhone INCELL | 750 / 730 | 750 / 730 | 750 / 730 | 近似参考 750 / 730 (iPhone 16 PROMAX INCELL FHD) | 750 MXN | $650, $680, $700, $730, $750 MXN | 0 | 官网/Excel参考价不一致 | 未见明确促销字段 | 保持，人工确认后再改 |
| iphone-incell-17air | Pantalla para iPhone 17 Air | Pantallas iPhone INCELL | 2500 / 2400 | 2500 / 2400 | 2500 / 2400 | 近似参考 2500 / 2400 (iPhone 17 AIR INCELL FHD) | 2500 MXN | $2100, $2200, $2300, $2400, $2500 MXN | 0 | 官网/Excel参考价不一致 | 未见明确促销字段 | 保持，人工确认后再改 |
| iphone-incell-17pro | Pantalla para iPhone 17 Pro | Pantallas iPhone INCELL | 850 / 800 | 850 / 800 | 850 / 800 | 近似参考 850 / 800 (iPhone 17PRO INCELL FHD) | 850 MXN | $700, $750, $755, $800, $850 MXN | 0 | 官网/Excel参考价不一致 | 未见明确促销字段 | 保持，人工确认后再改 |
| iphone-incell-17promax | Pantalla para iPhone 17 Pro Max | Pantallas iPhone INCELL | 900 / 850 | 900 / 850 | 900 / 850 | 近似参考 900 / 850 (iPhone 17 PROMAX INCELL FHD) | 900 MXN | $750, $800, $805, $850, $900 MXN | 0 | 官网/Excel参考价不一致 | 未见明确促销字段 | 保持，人工确认后再改 |
| iphone-incell-xsmax | Pantalla para iPhone XS Max | Pantallas iPhone INCELL | 200 / 190 | 200 / 190 | 200 / 190 | 近似参考 200 / 190 (iPhone XS MAX INCELL FHD) | 200 MXN | $175, $180, $185, $190, $200 MXN | 0 | 官网/Excel参考价不一致 | 未见明确促销字段 | 保持，人工确认后再改 |
| iphone-oled-12mini | Pantalla para iPhone 12 mini | Pantallas iPhone OLED | Consultar / Consultar | 无 / 无 | 无 / 无 | 未匹配 | 无 | Consultar |  | 待老板确认；官网缺价/Consultar；Master缺价 | 未见明确促销字段 | 禁止发布，先请老板确认 precio público / precio mayorista / caja 或备注 |
| iphone-oled-13mini | Pantalla para iPhone 13 mini | Pantallas iPhone OLED | Consultar / Consultar | 无 / 无 | 无 / 无 | 近似参考 730 / 720 (iPhone 13 OLED PREMIUM) | 无 | Consultar |  | 待老板确认；官网缺价/Consultar；Master缺价 | 未见明确促销字段 | 禁止发布，先请老板确认 precio público / precio mayorista / caja 或备注 |
| iphone-oled-13pro | Pantalla para iPhone 13 Pro | Pantallas iPhone OLED | 800 / 780 | 800 / 780 | 800 / 780 | 近似参考 800 / 780 (iPhone 13PRO OLED PREMIUM) | 800 MXN | $700, $730, $750, $780, $800 MXN | 0 | 官网/Excel参考价不一致 | 未见明确促销字段 | 保持，人工确认后再改 |
| iphone-oled-13promax | Pantalla para iPhone 13 Pro Max | Pantallas iPhone OLED | 600 / 590 | 900 / 850 | 900 / 850 | 近似参考 900 / 850 (iPhone 13PRO MAX OLED PREMIUM) | 600 MXN | Consultar | -300 | 官网/App公开价不一致；官网/App批发价不一致；官网/Master公开价不一致；官网/Master批发价不一致；详情页可能只显示 Consultar；官网/Excel参考价不一致 | 需确认是否促销价 | 未改价；Master/App/Excel 需一起确认，避免覆盖促销价 |
| iphone-oled-14plus | Pantalla para iPhone 14 Plus | Pantallas iPhone OLED | 900 / 880 | 900 / 880 | 900 / 880 | 近似参考 900 / 880 (iPhone 14 plus OLED PREMIUM) | 900 MXN | $800, $830, $850, $880, $900 MXN | 0 | 官网/Excel参考价不一致 | 未见明确促销字段 | 保持，人工确认后再改 |
| iphone-oled-14pro | Pantalla para iPhone 14 Pro | Pantallas iPhone OLED | 1200 / 1150 | 1200 / 1150 | 1200 / 1150 | 近似参考 1200 / 1150 (iPhone 14PRO SOFT OLED PREMIUM) | 1200 MXN | $1000, $1050, $1100, $1150, $1200 MXN | 0 | 官网/Excel参考价不一致 | 未见明确促销字段 | 保持，人工确认后再改 |
| iphone-oled-14promax | Pantalla para iPhone 14 Pro Max | Pantallas iPhone OLED | 1000 / 950 | 1000 / 950 | 1000 / 950 | 近似参考 1000 / 950 (iPhone 14PRO MAX OLED PREMIUM) | 1000 MXN | $1000, $800, $850, $900, $950 MXN | 0 | 官网/Excel参考价不一致 | 未见明确促销字段 | 保持，人工确认后再改 |
| iphone-oled-15plus | Pantalla para iPhone 15 Plus | Pantallas iPhone OLED | Consultar / Consultar | 无 / 无 | 无 / 无 | 近似参考 1200 / 1150 (iPhone 15 SOFT OLED PREMIUM) | 无 | Consultar |  | 待老板确认；官网缺价/Consultar；Master缺价 | 未见明确促销字段 | 禁止发布，先请老板确认 precio público / precio mayorista / caja 或备注 |
| iphone-oled-16 | Pantalla para iPhone 16 | Pantallas iPhone OLED | Consultar / Consultar | 无 / 无 | 无 / 无 | 未匹配 | 无 | Consultar |  | 待老板确认；官网缺价/Consultar；Master缺价 | 未见明确促销字段 | 禁止发布，先请老板确认 precio público / precio mayorista / caja 或备注 |
| iphone-oled-16plus | Pantalla para iPhone 16 Plus | Pantallas iPhone OLED | Consultar / Consultar | 无 / 无 | 无 / 无 | 未匹配 | 无 | Consultar |  | 待老板确认；官网缺价/Consultar；Master缺价 | 未见明确促销字段 | 禁止发布，先请老板确认 precio público / precio mayorista / caja 或备注 |
| iphone-oled-16promax | Pantalla para iPhone 16 Pro Max Soft OLED | Pantallas iPhone OLED | 2000 / 1950 | 2000 / 1950 | 2000 / 1950 | 近似参考 1600 / 1550 (iPhone 16 PROMAX OLED PREMIUM) | 2000 MXN | $1800, $1850, $1900, $1950, $2000 MXN | 0 | 官网/Excel参考价不一致 | 未见明确促销字段 | 保持，人工确认后再改 |
| iphone-oled-16promax-hard | Pantalla para iPhone 16 Pro Max Hard OLED | Pantallas iPhone OLED | 1600 / 1550 | 1600 / 1550 | 1600 / 1550 | 近似参考 1600 / 1550 (iPhone 16 PROMAX OLED PREMIUM) | 1600 MXN | $1400, $1450, $1500, $1550, $1600 MXN | 0 | 官网/Excel参考价不一致 | 未见明确促销字段 | 保持，人工确认后再改 |
| iphone-oled-xsmax | Pantalla para iPhone XS Max | Pantallas iPhone OLED | 580 / 570 | 580 / 570 | 580 / 570 | 近似参考 580 / 570 (iPhone XS MAX OLED PREMIUM) | 580 MXN | $540, $550, $560, $570, $580 MXN | 0 | 官网/Excel参考价不一致 | 未见明确促销字段 | 保持，人工确认后再改 |
| samsung-incell-note-20-ultra | Pantalla para Samsung Note 20 Ultra | Pantallas Samsung INCELL | 800 / 780 | 800 / 780 | 800 / 780 | 近似参考 800 / 780 (Samsung NOTE 20 Ultra INCELL FHD) | 800 MXN | $680, $700, $750, $780, $800 MXN | 0 | 官网/Excel参考价不一致 | 未见明确促销字段 | 保持，人工确认后再改 |
| samsung-incell-s10e | Pantalla para Samsung S10E | Pantallas Samsung INCELL | 800 / 780 | 800 / 780 | 无 / 无 | 近似参考 800 / 780 (Samsung S10E INCELL FHD) | 无 | 未识别价格 | 0 | 官网/Excel参考价不一致 | 未见明确促销字段 | 保持，人工确认后再改 |
| samsung-incell-s20-fe | Pantalla para Samsung S20 FE | Pantallas Samsung INCELL | 350 / 330 | 350 / 330 | 350 / 330 | 近似参考 350 / 330 (Samsung S20FE INCELL FHD) | 350 MXN | $290, $300, $320, $330, $350 MXN | 0 | 官网/Excel参考价不一致 | 未见明确促销字段 | 保持，人工确认后再改 |
| samsung-incell-s20-plus | Pantalla para Samsung S20 Plus | Pantallas Samsung INCELL | 500 / 480 | 550 / 520 | 550 / 520 | 近似参考 550 / 520 (Samsung S20 PLUS INCELL FHD) | (无price) MXN | Consultar | -50 | 官网/App公开价不一致；官网/App批发价不一致；官网/Master公开价不一致；官网/Master批发价不一致；详情页可能只显示 Consultar；JSON-LD price 缺失或不等于官网公开价 | 需确认是否促销价 | 未改价；Master/App/Excel 需一起确认，避免覆盖促销价 |
| samsung-incell-s20-ultra | Pantalla para Samsung S20 Ultra | Pantallas Samsung INCELL | 650 / 620 | 650 / 620 | 650 / 620 | 近似参考 650 / 620 (Samsung S20 Ultra INCELL FHD) | 650 MXN | $560, $580, $600, $620, $650 MXN | 0 | 官网/Excel参考价不一致 | 未见明确促销字段 | 保持，人工确认后再改 |
| samsung-incell-s21-fe | Pantalla para Samsung S21 FE | Pantallas Samsung INCELL | 400 / 380 | 400 / 380 | 无 / 无 | 近似参考 400 / 380 (Samsung S21 FE INCELL FHD) | 无 | 未识别价格 | 0 | 官网/Excel参考价不一致 | 未见明确促销字段 | 保持，人工确认后再改 |
| samsung-incell-s21-plus | Pantalla para Samsung S21 Plus | Pantallas Samsung INCELL | 450 / 430 | 450 / 430 | 无 / 无 | 近似参考 450 / 430 (Samsung S21 PLUS INCELL FHD) | 无 | 未识别价格 | 0 | 官网/Excel参考价不一致 | 未见明确促销字段 | 保持，人工确认后再改 |
| samsung-incell-s21-ultra | Pantalla para Samsung S21 Ultra | Pantallas Samsung INCELL | 600 / 550 | 600 / 550 | 600 / 550 | 近似参考 600 / 550 (Samsung S21 Ultra INCELL FHD) | 600 MXN | $480, $500, $530, $550, $600 MXN | 0 | 官网/Excel参考价不一致 | 未见明确促销字段 | 保持，人工确认后再改 |
| samsung-incell-s22-ultra | Pantalla para Samsung S22 Ultra | Pantallas Samsung INCELL | 800 / 750 | 800 / 750 | 800 / 750 | 近似参考 800 / 750 (Samsung S22 Ultra INCELL FHD) | 800 MXN | $600, $650, $700, $750, $800 MXN | 0 | 官网/Excel参考价不一致 | 未见明确促销字段 | 保持，人工确认后再改 |
| samsung-incell-s23-ultra | Pantalla para Samsung S23 Ultra | Pantallas Samsung INCELL | 700 / 680 | 700 / 680 | 700 / 680 | 近似参考 700 / 680 (Samsung S23 Ultra INCELL FHD) | 700 MXN | $600, $620, $650, $680, $700 MXN | 0 | 官网/Excel参考价不一致 | 未见明确促销字段 | 保持，人工确认后再改 |
| samsung-incell-s9-plus | Pantalla para Samsung S9 Plus | Pantallas Samsung INCELL | 450 / 430 | 500 / 450 | 500 / 450 | 近似参考 500 / 450 (Samsung S9 PLUS INCELL FHD) | (无price) MXN | Consultar | -50 | 官网/App公开价不一致；官网/App批发价不一致；官网/Master公开价不一致；官网/Master批发价不一致；详情页可能只显示 Consultar；JSON-LD price 缺失或不等于官网公开价 | 需确认是否促销价 | 未改价；Master/App/Excel 需一起确认，避免覆盖促销价 |
| samsung-oled-note-10-plus | Pantalla para Samsung Note 10 Plus | Pantallas Samsung OLED | 1000 / 950 | 1000 / 950 | 1000 / 950 | 近似参考 1000 / 950 (Samsung NOTE 10+ OLED PREMIUM) | 1000 MXN | $1000, $880, $900, $950 MXN + Consultar | 0 | 官网/Excel参考价不一致 | 未见明确促销字段 | 保持，人工确认后再改 |
| samsung-oled-note-20-ultra | Pantalla para Samsung Note 20 Ultra | Pantallas Samsung OLED | 1500 / 1450 | 1500 / 1450 | 1500 / 1450 | 近似参考 1500 / 1450 (Samsung NOTE 20 Ultra OLED PREMIUM) | 1500 MXN | $1350, $1370, $1400, $1450, $1500 MXN | 0 | 官网/Excel参考价不一致 | 未见明确促销字段 | 保持，人工确认后再改 |
| samsung-oled-note-9 | Pantalla para Samsung Note 9 | Pantallas Samsung OLED | Consultar / Consultar | 无 / 无 | 无 / 无 | 未匹配 | (无price) MXN | Consultar |  | 待老板确认；官网缺价/Consultar；Master缺价 | 未见明确促销字段 | 禁止发布，先请老板确认 precio público / precio mayorista / caja 或备注 |
| samsung-oled-s20 | Pantalla para Samsung S20 | Pantallas Samsung OLED | Consultar / Consultar | 无 / 无 | 无 / 无 | 近似参考 1100 / 1050 (Samsung S20 PLUS OLED PREMIUM) | (无price) MXN | Consultar |  | 待老板确认；官网缺价/Consultar；Master缺价 | 未见明确促销字段 | 禁止发布，先请老板确认 precio público / precio mayorista / caja 或备注 |
| samsung-oled-s20-ultra | Pantalla para Samsung S20 Ultra | Pantallas Samsung OLED | Consultar / Consultar | 无 / 无 | 无 / 无 | 未匹配 | (无price) MXN | Consultar |  | 待老板确认；官网缺价/Consultar；Master缺价 | 未见明确促销字段 | 禁止发布，先请老板确认 precio público / precio mayorista / caja 或备注 |
| samsung-oled-s21 | Pantalla para Samsung S21 | Pantallas Samsung OLED | Consultar / Consultar | 无 / 无 | 无 / 无 | 近似参考 1600 / 1550 (Samsung S21 Ultra OLED PREMIUM) | (无price) MXN | Consultar |  | 待老板确认；官网缺价/Consultar；Master缺价 | 未见明确促销字段 | 禁止发布，先请老板确认 precio público / precio mayorista / caja 或备注 |
| samsung-oled-s21-plus | Pantalla para Samsung S21 Plus | Pantallas Samsung OLED | Consultar / Consultar | 无 / 无 | 无 / 无 | 未匹配 | (无price) MXN | Consultar |  | 待老板确认；官网缺价/Consultar；Master缺价 | 未见明确促销字段 | 禁止发布，先请老板确认 precio público / precio mayorista / caja 或备注 |
| samsung-oled-s22-plus | Pantalla para Samsung S22 Plus | Pantallas Samsung OLED | Consultar / Consultar | 无 / 无 | 无 / 无 | 未匹配 | (无price) MXN | Consultar |  | 待老板确认；官网缺价/Consultar；Master缺价 | 未见明确促销字段 | 禁止发布，先请老板确认 precio público / precio mayorista / caja 或备注 |
| samsung-oled-s23-plus | Pantalla para Samsung S23 Plus | Pantallas Samsung OLED | Consultar / Consultar | 无 / 无 | 无 / 无 | 未匹配 | (无price) MXN | Consultar |  | 待老板确认；官网缺价/Consultar；Master缺价 | 未见明确促销字段 | 禁止发布，先请老板确认 precio público / precio mayorista / caja 或备注 |
| samsung-oled-s24-plus | Pantalla para Samsung S24 Plus | Pantallas Samsung OLED | Consultar / Consultar | 无 / 无 | 无 / 无 | 未匹配 | (无price) MXN | Consultar |  | 待老板确认；官网缺价/Consultar；Master缺价 | 未见明确促销字段 | 禁止发布，先请老板确认 precio público / precio mayorista / caja 或备注 |
| samsung-oled-s9-plus | Pantalla para Samsung S9 Plus | Pantallas Samsung OLED | Consultar / Consultar | 无 / 无 | 无 / 无 | 未匹配 | (无price) MXN | Consultar |  | 待老板确认；官网缺价/Consultar；Master缺价 | 未见明确促销字段 | 禁止发布，先请老板确认 precio público / precio mayorista / caja 或备注 |
| w630-ai-pro | W630 AI PRO | Gafas AI | 1900 / 1600 | 1900 / 1600 | 1900 / 1600 | 近似参考 1500 / 1200 (AI Gafas AI ai) | 无 | 未识别价格 | 0 | 官网/Excel参考价不一致 | 未见明确促销字段 | 保持，人工确认后再改 |

## 6. 仍需老板确认价格的 14 个产品

| slug | 产品名称 | 当前分类 | 当前公开页是否显示价格 | app/products.json 是否有价格 | Excel参考价 | 建议老板填写字段 | 状态 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| iphone-oled-12mini | Pantalla para iPhone 12 mini | Pantallas iPhone OLED | Consultar / Consultar | App缺少 | 未匹配 | precio público / precio mayorista / caja 或备注 | 仍需老板确认，未确认前不要 publish-products |
| iphone-oled-13mini | Pantalla para iPhone 13 mini | Pantallas iPhone OLED | Consultar / Consultar | App缺少 | 近似参考 730 / 720 (iPhone 13 OLED PREMIUM) | precio público / precio mayorista / caja 或备注 | 仍需老板确认，未确认前不要 publish-products |
| iphone-oled-15plus | Pantalla para iPhone 15 Plus | Pantallas iPhone OLED | Consultar / Consultar | App缺少 | 近似参考 1200 / 1150 (iPhone 15 SOFT OLED PREMIUM) | precio público / precio mayorista / caja 或备注 | 仍需老板确认，未确认前不要 publish-products |
| iphone-oled-16 | Pantalla para iPhone 16 | Pantallas iPhone OLED | Consultar / Consultar | App缺少 | 未匹配 | precio público / precio mayorista / caja 或备注 | 仍需老板确认，未确认前不要 publish-products |
| iphone-oled-16plus | Pantalla para iPhone 16 Plus | Pantallas iPhone OLED | Consultar / Consultar | App缺少 | 未匹配 | precio público / precio mayorista / caja 或备注 | 仍需老板确认，未确认前不要 publish-products |
| samsung-oled-note-9 | Pantalla para Samsung Note 9 | Pantallas Samsung OLED | Consultar / Consultar | App缺少 | 未匹配 | precio público / precio mayorista / caja 或备注 | 仍需老板确认，未确认前不要 publish-products |
| samsung-oled-s20 | Pantalla para Samsung S20 | Pantallas Samsung OLED | Consultar / Consultar | App缺少 | 近似参考 1100 / 1050 (Samsung S20 PLUS OLED PREMIUM) | precio público / precio mayorista / caja 或备注 | 仍需老板确认，未确认前不要 publish-products |
| samsung-oled-s20-ultra | Pantalla para Samsung S20 Ultra | Pantallas Samsung OLED | Consultar / Consultar | App缺少 | 未匹配 | precio público / precio mayorista / caja 或备注 | 仍需老板确认，未确认前不要 publish-products |
| samsung-oled-s21 | Pantalla para Samsung S21 | Pantallas Samsung OLED | Consultar / Consultar | App缺少 | 近似参考 1600 / 1550 (Samsung S21 Ultra OLED PREMIUM) | precio público / precio mayorista / caja 或备注 | 仍需老板确认，未确认前不要 publish-products |
| samsung-oled-s21-plus | Pantalla para Samsung S21 Plus | Pantallas Samsung OLED | Consultar / Consultar | App缺少 | 未匹配 | precio público / precio mayorista / caja 或备注 | 仍需老板确认，未确认前不要 publish-products |
| samsung-oled-s22-plus | Pantalla para Samsung S22 Plus | Pantallas Samsung OLED | Consultar / Consultar | App缺少 | 未匹配 | precio público / precio mayorista / caja 或备注 | 仍需老板确认，未确认前不要 publish-products |
| samsung-oled-s23-plus | Pantalla para Samsung S23 Plus | Pantallas Samsung OLED | Consultar / Consultar | App缺少 | 未匹配 | precio público / precio mayorista / caja 或备注 | 仍需老板确认，未确认前不要 publish-products |
| samsung-oled-s24-plus | Pantalla para Samsung S24 Plus | Pantallas Samsung OLED | Consultar / Consultar | App缺少 | 未匹配 | precio público / precio mayorista / caja 或备注 | 仍需老板确认，未确认前不要 publish-products |
| samsung-oled-s9-plus | Pantalla para Samsung S9 Plus | Pantallas Samsung OLED | Consultar / Consultar | App缺少 | 未匹配 | precio público / precio mayorista / caja 或备注 | 仍需老板确认，未确认前不要 publish-products |

## 7. 7 个价格异常但未改价产品

| slug | 产品名称 | 当前官网价格 | 当前 App/Master/Excel 价格 | 差异金额 | 是否可能促销价 | 建议处理方式 |
| --- | --- | --- | --- | --- | --- | --- |
| iphone-incell-12promax | Pantalla para iPhone 12 Pro Max | 220 / 210 | App 250 / 240；Master 250 / 240；Excel 近似参考 250 / 240 (iPhone 12PRO MAX INCELL FHD)| -30 | 未发现明确促销字段，但需老板确认是否促销价 | 未改价；若确认非促销，可按 Master/App/Excel 交叉结果修复 |
| iphone-incell-14 | Pantalla para iPhone 14 | 800 / 750 | App 260 / 250；Master 260 / 250；Excel 近似参考 260 / 250 (iPhone 14 INCELL FHD)| 540 | 未发现明确促销字段，但需老板确认是否促销价 | 未改价；若确认非促销，可按 Master/App/Excel 交叉结果修复 |
| iphone-incell-14plus | Pantalla para iPhone 14 Plus | 800 / 750 | App 300 / 290；Master 300 / 290；Excel 近似参考 300 / 290 (iPhone 14 plus INCELL FHD)| 500 | 未发现明确促销字段，但需老板确认是否促销价 | 未改价；若确认非促销，可按 Master/App/Excel 交叉结果修复 |
| iphone-incell-15plus | Pantalla para iPhone 15 Plus | 300 / 290 | App 330 / 310；Master 330 / 310；Excel 近似参考 330 / 310 (iPhone 15 plus INCELL FHD)| -30 | 未发现明确促销字段，但需老板确认是否促销价 | 未改价；若确认非促销，可按 Master/App/Excel 交叉结果修复 |
| iphone-oled-13promax | Pantalla para iPhone 13 Pro Max | 600 / 590 | App 900 / 850；Master 900 / 850；Excel 近似参考 900 / 850 (iPhone 13PRO MAX OLED PREMIUM)| -300 | 未发现明确促销字段，但需老板确认是否促销价 | 未改价；若确认非促销，可按 Master/App/Excel 交叉结果修复 |
| samsung-incell-s20-plus | Pantalla para Samsung S20 Plus | 500 / 480 | App 550 / 520；Master 550 / 520；Excel 近似参考 550 / 520 (Samsung S20 PLUS INCELL FHD)| -50 | 未发现明确促销字段，但需老板确认是否促销价 | 未改价；若确认非促销，可按 Master/App/Excel 交叉结果修复 |
| samsung-incell-s9-plus | Pantalla para Samsung S9 Plus | 450 / 430 | App 500 / 450；Master 500 / 450；Excel 近似参考 500 / 450 (Samsung S9 PLUS INCELL FHD)| -50 | 未发现明确促销字段，但需老板确认是否促销价 | 未改价；若确认非促销，可按 Master/App/Excel 交叉结果修复 |

## 8. JSON-LD 与详情页价格风险

- 有公开价格的产品应在 JSON-LD Product Offer 中写 `price` 且 `priceCurrency=MXN`；未确认价格产品不应乱写 price。
- 静态详情页无 JS / JS 慢加载 fallback 不应把有价格产品显示成 `Consultar`。

| slug | 产品名称 | 官网价格 | JSON-LD价格 | 当前页面显示 | 问题类型 | 建议 |
| --- | --- | --- | --- | --- | --- | --- |
| iphone-incell-12promax | Pantalla para iPhone 12 Pro Max | 220 / 210 | (无price) MXN | Consultar | 官网/App公开价不一致；官网/App批发价不一致；官网/Master公开价不一致；官网/Master批发价不一致；详情页可能只显示 Consultar；JSON-LD price 缺失或不等于官网公开价；官网/Excel参考价不一致 | 未改价；Master/App/Excel 需一起确认，避免覆盖促销价 |
| iphone-incell-14 | Pantalla para iPhone 14 | 800 / 750 | (无price) MXN | Consultar | 官网/App公开价不一致；官网/App批发价不一致；官网/Master公开价不一致；官网/Master批发价不一致；详情页可能只显示 Consultar；JSON-LD price 缺失或不等于官网公开价；官网/Excel参考价不一致 | 未改价；Master/App/Excel 需一起确认，避免覆盖促销价 |
| iphone-incell-14plus | Pantalla para iPhone 14 Plus | 800 / 750 | (无price) MXN | Consultar | 官网/App公开价不一致；官网/App批发价不一致；官网/Master公开价不一致；官网/Master批发价不一致；详情页可能只显示 Consultar；JSON-LD price 缺失或不等于官网公开价；官网/Excel参考价不一致 | 未改价；Master/App/Excel 需一起确认，避免覆盖促销价 |
| iphone-incell-15plus | Pantalla para iPhone 15 Plus | 300 / 290 | (无price) MXN | Consultar | 官网/App公开价不一致；官网/App批发价不一致；官网/Master公开价不一致；官网/Master批发价不一致；详情页可能只显示 Consultar；JSON-LD price 缺失或不等于官网公开价 | 未改价；Master/App/Excel 需一起确认，避免覆盖促销价 |
| iphone-oled-13promax | Pantalla para iPhone 13 Pro Max | 600 / 590 | 600 MXN | Consultar | 官网/App公开价不一致；官网/App批发价不一致；官网/Master公开价不一致；官网/Master批发价不一致；详情页可能只显示 Consultar；官网/Excel参考价不一致 | 未改价；Master/App/Excel 需一起确认，避免覆盖促销价 |
| samsung-incell-s20-plus | Pantalla para Samsung S20 Plus | 500 / 480 | (无price) MXN | Consultar | 官网/App公开价不一致；官网/App批发价不一致；官网/Master公开价不一致；官网/Master批发价不一致；详情页可能只显示 Consultar；JSON-LD price 缺失或不等于官网公开价 | 未改价；Master/App/Excel 需一起确认，避免覆盖促销价 |
| samsung-incell-s9-plus | Pantalla para Samsung S9 Plus | 450 / 430 | (无price) MXN | Consultar | 官网/App公开价不一致；官网/App批发价不一致；官网/Master公开价不一致；官网/Master批发价不一致；详情页可能只显示 Consultar；JSON-LD price 缺失或不等于官网公开价 | 未改价；Master/App/Excel 需一起确认，避免覆盖促销价 |

## 9. 图片问题表

| slug | 产品名称 | 当前图片路径 | 问题类型 | 页面位置 | 建议处理方式 |
| --- | --- | --- | --- | --- | --- |
| samsung-incell-note-10-lite | Pantalla para Samsung Note 10 Lite | /assets/products/samsung-incell/main.jpg | placeholder/通用图/待确认图 | App图片 | 只报告，需确认真实图片后再替换 |
| samsung-incell-note-20 | Pantalla para Samsung Note 20 | /assets/products/samsung-incell/main.jpg | placeholder/通用图/待确认图 | App图片 | 只报告，需确认真实图片后再替换 |
| samsung-incell-s10-lite | Pantalla para Samsung S10 Lite | /assets/products/samsung-incell/main.jpg | placeholder/通用图/待确认图 | App图片 | 只报告，需确认真实图片后再替换 |
| samsung-original-note-20-ultra | Pantalla para Samsung Note 20 Ultra | /assets/products/placeholder.svg | placeholder/通用图/待确认图 | App图片 | 只报告，需确认真实图片后再替换 |

## 10. 分类问题表

| slug | 产品名称 | Master分类 | 官网分类 | App分类 | 问题 | 建议 |
| --- | --- | --- | --- | --- | --- | --- |
| 无 |  |  |  |  |  |  |

## 11. App 与官网不一致表

| slug | 产品名称 | 官网 | App | 差异 |
| --- | --- | --- | --- | --- |
| aimb-g5-ai-sports | AIMB-G5 AI SPORTS | gafas-ai 1800 | Gafas AI 1800 | sitemap缺少 |
| funda-magnetica-17-pro-max | Funda Magnetica | fundas 100 | Fundas 100 | sitemap缺少 |
| funda-premium-17-pro-max | Funda Premium Aluminio | fundas 85 | Fundas 85 | sitemap缺少 |
| funda-premium-aluminio-plus | Funda Premium Aluminio Plus | fundas 85 | 无 | 官网有，App缺少 |
| haode-ai-g3-smart-glasses | Gafas Inteligentes AI G3 | gafas-ai 1700 | Gafas AI 1700 | sitemap缺少 |
| haode-ai-w610-smart-glasses | Gafas Inteligentes AI W610 | gafas-ai 1800 | Gafas AI 1800 | sitemap缺少 |
| iphone-incell-12promax | Pantalla para iPhone 12 Pro Max | iphone-incell 220 | Pantallas iPhone INCELL 250 | 公开价不一致；批发价不一致 |
| iphone-incell-14 | Pantalla para iPhone 14 | iphone-incell 800 | Pantallas iPhone INCELL 260 | 公开价不一致；批发价不一致 |
| iphone-incell-14plus | Pantalla para iPhone 14 Plus | iphone-incell 800 | Pantallas iPhone INCELL 300 | 公开价不一致；批发价不一致 |
| iphone-incell-15plus | Pantalla para iPhone 15 Plus | iphone-incell 300 | Pantallas iPhone INCELL 330 | 公开价不一致；批发价不一致 |
| iphone-oled-12mini | Pantalla para iPhone 12 mini | iphone-oled Consultar | 无 | 官网有，App缺少 |
| iphone-oled-13mini | Pantalla para iPhone 13 mini | iphone-oled Consultar | 无 | 官网有，App缺少 |
| iphone-oled-13promax | Pantalla para iPhone 13 Pro Max | iphone-oled 600 | Pantallas iPhone OLED 900 | 公开价不一致；批发价不一致 |
| iphone-oled-15plus | Pantalla para iPhone 15 Plus | iphone-oled Consultar | 无 | 官网有，App缺少 |
| iphone-oled-16 | Pantalla para iPhone 16 | iphone-oled Consultar | 无 | 官网有，App缺少 |
| iphone-oled-16plus | Pantalla para iPhone 16 Plus | iphone-oled Consultar | 无 | 官网有，App缺少 |
| s1-ai-classic | HAODE AI CLASSIC S1 | gafas-ai 1500 | Gafas AI 1500 | sitemap缺少 |
| samsung-incell-note-10-lite | Pantalla para Samsung Note 10 Lite | 无 | Pantallas Samsung INCELL 750 | App有，官网缺少 |
| samsung-incell-note-20 | Pantalla para Samsung Note 20 | 无 | Pantallas Samsung INCELL 650 | App有，官网缺少 |
| samsung-incell-s10-lite | Pantalla para Samsung S10 Lite | 无 | Pantallas Samsung INCELL 450 | App有，官网缺少 |
| samsung-incell-s20-plus | Pantalla para Samsung S20 Plus | samsung-incell 500 | Pantallas Samsung INCELL 550 | 公开价不一致；批发价不一致 |
| samsung-incell-s9-plus | Pantalla para Samsung S9 Plus | samsung-incell 450 | Pantallas Samsung INCELL 500 | 公开价不一致；批发价不一致 |
| samsung-oled-note-9 | Pantalla para Samsung Note 9 | samsung-oled Consultar | 无 | 官网有，App缺少 |
| samsung-oled-s20 | Pantalla para Samsung S20 | samsung-oled Consultar | 无 | 官网有，App缺少 |
| samsung-oled-s20-ultra | Pantalla para Samsung S20 Ultra | samsung-oled Consultar | 无 | 官网有，App缺少 |
| samsung-oled-s21 | Pantalla para Samsung S21 | samsung-oled Consultar | 无 | 官网有，App缺少 |
| samsung-oled-s21-plus | Pantalla para Samsung S21 Plus | samsung-oled Consultar | 无 | 官网有，App缺少 |
| samsung-oled-s22-plus | Pantalla para Samsung S22 Plus | samsung-oled Consultar | 无 | 官网有，App缺少 |
| samsung-oled-s23-plus | Pantalla para Samsung S23 Plus | samsung-oled Consultar | 无 | 官网有，App缺少 |
| samsung-oled-s24-plus | Pantalla para Samsung S24 Plus | samsung-oled Consultar | 无 | 官网有，App缺少 |
| samsung-oled-s9-plus | Pantalla para Samsung S9 Plus | samsung-oled Consultar | 无 | 官网有，App缺少 |
| samsung-original-note-20-ultra | Pantalla para Samsung Note 20 Ultra | 无 | Pantallas Samsung Original 3500 | App有，官网缺少 |
| samsung-original-s21-ultra | Pantalla para Samsung S21 Ultra | 无 | Pantallas Samsung Original 2500 | App有，官网缺少 |
| samsung-original-s22-plus | Pantalla para Samsung S22 Plus | 无 | Pantallas Samsung Original 1700 | App有，官网缺少 |
| samsung-original-s22-ultra | Pantalla para Samsung S22 Ultra | 无 | Pantallas Samsung Original 3000 | App有，官网缺少 |
| samsung-original-s23-plus | Pantalla para Samsung S23 Plus | 无 | Pantallas Samsung Original 1800 | App有，官网缺少 |
| samsung-original-s23-ultra | Pantalla para Samsung S23 Ultra | 无 | Pantallas Samsung Original 3300 | App有，官网缺少 |
| samsung-original-s24-ultra | Pantalla para Samsung S24 Ultra | 无 | Pantallas Samsung Original 3500 | App有，官网缺少 |
| samsung-original-s25-ultra | Pantalla para Samsung S25 Ultra | 无 | Pantallas Samsung Original 3700 | App有，官网缺少 |
| samsung-original-z-flip3 | Pantalla para Samsung Z Flip3 | 无 | Pantallas Samsung Original 3300 | App有，官网缺少 |
| samsung-original-z-flip4 | Pantalla para Samsung Z Flip4 | 无 | Pantallas Samsung Original 3600 | App有，官网缺少 |
| samsung-original-z-flip5 | Pantalla para Samsung Z Flip5 | 无 | Pantallas Samsung Original 4000 | App有，官网缺少 |
| samsung-original-z-flip6 | Pantalla para Samsung Z Flip6 | 无 | Pantallas Samsung Original 4500 | App有，官网缺少 |
| samsung-original-z-flip7 | Pantalla Samsung Z Flip7 | 无 | Pantallas Samsung Original 5800 | App有，官网缺少 |
| samsung-original-z-fold3 | Pantalla Samsung Z Fold3 | 无 | Pantallas Samsung Original 4500 | App有，官网缺少 |
| samsung-original-z-fold4 | Pantalla Samsung Z Fold4 | 无 | Pantallas Samsung Original 6000 | App有，官网缺少 |
| samsung-original-z-fold5 | Pantalla Samsung Z Fold5 | 无 | Pantallas Samsung Original 7500 | App有，官网缺少 |
| samsung-original-z-fold6 | Pantalla Samsung Z Fold6 | 无 | Pantallas Samsung Original 9800 | App有，官网缺少 |
| w630-ai-pro | W630 AI PRO | gafas-ai 1900 | Gafas AI 1900 | sitemap缺少 |
| x200t-cortadora-micas | HAODE X200T Cortadora Inteligente de Micas | 无 | Máquinas de Mica 6800 | App有，官网缺少 |

## 12. 浏览器验证结果

- 本地静态服务抽查 11 个页面：`/`、`/productos/`、`/app/`、`/categoria/iphone-incell/`、`/categoria/iphone-oled/`、`/categoria/samsung-incell/`、`/categoria/samsung-oled/`、`/producto/iphone-incell-14/`，以及 390px 移动端首页、产品页、App。
- 结果：全部 HTTP 200；未发现横向溢出；未发现坏图；未发现 admin 入口；未发现内部 draft 广告自动显示。
- `/app/` 正常加载 `app/products.json`，诊断显示 `fuente=products.json`、`productosActivos=144`、`productosVisibles=144`。本轮拦截 ERP stock 请求，避免触碰 ERP。
- WhatsApp：抽查页面均使用目标号码 `5645866014 / 525645866014`，未发现旧号码。
- 地址：抽查页面可见 `Eje Central Lázaro Cárdenas 87, Piso 2, Local 225`；未发现 `Centro, Centro` 重复。
- 页脚年份：抽查文件未发现 `© 2020-2025` 旧年份。

## 13. 验证命令记录

- `git status --short`：仅新增本报告文件。
- `git diff --check`：通过。
- `npm run build`：通过；`validate-products-sync` 为 PASS，保留既有 139 warning / 92 report-only；`haode-quality-check` 为 PASS，保留既有 sitemap/canonical warning。
- `npm run browser-test`：通过，1 个 Playwright APP QA 测试通过。
- `npm run verify-products`：返回 `QUEUED`，130 个 Master 产品、84 个问题、Firestore queueCount=2；这是既有数据/Firestore/价格差异阻塞，本轮不修、不发布。
- `npm run product-check --if-present`：项目未定义脚本，无输出。
- `npm run check-products --if-present`：项目未定义脚本，无输出。
- 未运行：`publish-products`；未强行运行需要外部 `HAODE_SOURCE_ROOTS` 的产品重建。

## 14. 下一步建议

- 可以直接修复：详情页/sitemap/category 路由同步、JSON-LD 缺 price 且官网已有公开价的展示 bug、公开页面旧 WhatsApp/地址/年份等低风险展示问题。
- 必须老板确认价格：14 个缺价 SKU；7 个价格异常 SKU 需确认是否促销价，再决定是否以 Master/App/Excel 为准。
- 必须补真实图片：图片问题表中缺失、placeholder、通用图、混图风险项；不能用网图或其他型号图替代。
- 暂时不要上架：缺价格、缺真实主图、分类归属不明或 Master/App/官网不一致的 SKU。
- 价格确认后再进入下一轮 `publish-products`；未确认前不要运行。
