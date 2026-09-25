# ChatGPT Feed 收尾审计（脱敏）

状态：**PUBLIC_PRICE_SYNC_CONFIRMED**。本报告不包含成本、库存数量或任何价格数值；库存、图片和 Feed 就绪状态未开放。

## 结论

- Feed 候选：146；两份工作簿产品行：156；逐项映射：146；未映射：0。
- 工作簿有 10 行不属于 146 候选，保留为排除项，没有强行配对。
- 客户表与老板表四档销售价一致：146/146。
- 官网 / App / 结构化数据与 2026-09-24 客户表四档一致：146 / 146 / 146。
- Feed Menudeo 价与客户表逐项一致：146/146；已满足确认门槛。
- 差异归类：0 项仍有新价格来源版本差异；0 项仅 VIP 档不同；跨公开表面自身不一致：0。
- 现有公开图片：132；缺图：14；具有当前审批证据：5；仅有公开路径、缺少标准化审批证据：127。
- 现有图片中明确 QC 失败：6；需按系列/品质人工确认：10。这些状态不改变原公开文件，只阻止把它们视为可交付广告素材。
- Feed 允许保留的图片：126；图片阻塞：20（14 项物理缺图 + 6 项 QC 拒绝）。
- Feed 已带确认的 Menudeo 价；availability=unknown、platform_ready=false；可上传：0。

## 缺图与最小补拍需求

以下均为现有产品 ID，不是已确认的官方 SKU；14 项的官方 SKU 仍为 pending。

| 产品 ID | 型号 | 品质 | 最小补拍需求 |
| --- | --- | --- | --- |
| `iphone-incell-17e` | iPhone 17E | INCELL FHD | 同一产品、同一型号与同一品质的真实正面主图；完整产品入镜，文字/Logo/排线不遮挡，建议原图短边 ≥1200px；附包装或标签同框作为型号证据。 |
| `iphone-oled-16e` | iPhone 16E | OLED PREMIUM | 同一产品、同一型号与同一品质的真实正面主图；完整产品入镜，文字/Logo/排线不遮挡，建议原图短边 ≥1200px；附包装或标签同框作为型号证据。 |
| `iphone-oled-soft-14` | iPhone 14 | SOFT OLED PREMIUM | 同一产品、同一型号与同一品质的真实正面主图；完整产品入镜，文字/Logo/排线不遮挡，建议原图短边 ≥1200px；附包装或标签同框作为型号证据。 |
| `iphone-oled-soft-14-plus` | iPhone 14 plus | SOFT OLED PREMIUM | 同一产品、同一型号与同一品质的真实正面主图；完整产品入镜，文字/Logo/排线不遮挡，建议原图短边 ≥1200px；附包装或标签同框作为型号证据。 |
| `iphone-oled-soft-15pro` | iPhone 15PRO | SOFT OLED PREMIUM | 同一产品、同一型号与同一品质的真实正面主图；完整产品入镜，文字/Logo/排线不遮挡，建议原图短边 ≥1200px；附包装或标签同框作为型号证据。 |
| `oled-diagnostica-12mini-hard` | iPhone 12MINI | DIAGNOTICO HARD OLED | 同一产品、同一型号与同一品质的真实正面主图；完整产品入镜，文字/Logo/排线不遮挡，建议原图短边 ≥1200px；附包装或标签同框作为型号证据。 |
| `oled-diagnostica-16e-soft` | iPhone 16E | DIAGNOTICO  SOFT OLED | 同一产品、同一型号与同一品质的真实正面主图；完整产品入镜，文字/Logo/排线不遮挡，建议原图短边 ≥1200px；附包装或标签同框作为型号证据。 |
| `samsung-incell-s20-4g` | S20 4G | INCELL FHD C/M | 同一产品、同一型号与同一品质的真实正面主图；完整产品入镜，文字/Logo/排线不遮挡，建议原图短边 ≥1200px；附包装或标签同框作为型号证据。 |
| `samsung-incell-s20-5g` | S20 5G | INCELL FHD C/M | 同一产品、同一型号与同一品质的真实正面主图；完整产品入镜，文字/Logo/排线不遮挡，建议原图短边 ≥1200px；附包装或标签同框作为型号证据。 |
| `samsung-incell-z-flip3` | Z FLIP3 | INCELL S/M | 同一产品、同一型号与同一品质的真实正面主图；完整产品入镜，文字/Logo/排线不遮挡，建议原图短边 ≥1200px；附包装或标签同框作为型号证据。 |
| `samsung-incell-z-flip4` | Z FLIP4 | INCELL S/M | 同一产品、同一型号与同一品质的真实正面主图；完整产品入镜，文字/Logo/排线不遮挡，建议原图短边 ≥1200px；附包装或标签同框作为型号证据。 |
| `samsung-incell-z-flip5` | Z FLIP5 | INCELL S/M | 同一产品、同一型号与同一品质的真实正面主图；完整产品入镜，文字/Logo/排线不遮挡，建议原图短边 ≥1200px；附包装或标签同框作为型号证据。 |
| `samsung-incell-z-flip6` | Z FLIP6 | INCELL S/M | 同一产品、同一型号与同一品质的真实正面主图；完整产品入镜，文字/Logo/排线不遮挡，建议原图短边 ≥1200px；附包装或标签同框作为型号证据。 |
| `samsung-original-note-20-ultra` | NOTE 20 Ultra | TIPO ORIGINAL C/M | 同一产品、同一型号与同一品质的真实正面主图；完整产品入镜，文字/Logo/排线不遮挡，建议原图短边 ≥1200px；附包装或标签同框作为型号证据。 |

## 品质映射需人工确认

| 产品 ID | 官网品质 | 来源位置 |
| --- | --- | --- |
| `haode-pantalla-oled-diagnostica-modelo-11-pro-max` | OLED Diagnóstica · Tamaño original | 05 IPHONE DIAGNOSTICO 第 8 行 |
| `haode-pantalla-oled-diagnostica-modelo-12-12-pro` | OLED Diagnóstica · Tamaño original | 05 IPHONE DIAGNOSTICO 第 9 行 |
| `haode-pantalla-oled-diagnostica-modelo-12-pro-max` | OLED Diagnóstica · Tamaño original | 05 IPHONE DIAGNOSTICO 第 10 行 |
| `haode-pantalla-oled-diagnostica-modelo-13` | OLED Diagnóstica · Tamaño original | 05 IPHONE DIAGNOSTICO 第 12 行 |
| `haode-pantalla-oled-diagnostica-modelo-13-pro` | OLED Diagnóstica · Tamaño original | 05 IPHONE DIAGNOSTICO 第 13 行 |
| `haode-pantalla-oled-diagnostica-modelo-13-pro-max` | OLED Diagnóstica · Tamaño original | 05 IPHONE DIAGNOSTICO 第 14 行 |
| `haode-pantalla-oled-diagnostica-modelo-14` | OLED Diagnóstica · Tamaño original | 05 IPHONE DIAGNOSTICO 第 15 行 |
| `haode-pantalla-oled-diagnostica-modelo-14-plus` | OLED Diagnóstica · Tamaño original | 05 IPHONE DIAGNOSTICO 第 18 行 |
| `haode-pantalla-oled-diagnostica-modelo-14-pro` | OLED Diagnóstica · Tamaño original | 05 IPHONE DIAGNOSTICO 第 16 行 |
| `haode-pantalla-oled-diagnostica-modelo-14-pro-max` | OLED Diagnóstica · Tamaño original | 05 IPHONE DIAGNOSTICO 第 17 行 |
| `haode-pantalla-oled-diagnostica-modelo-15` | OLED Diagnóstica · Tamaño original | 05 IPHONE DIAGNOSTICO 第 19 行 |
| `haode-pantalla-oled-diagnostica-modelo-15-plus` | OLED Diagnóstica · Tamaño original | 05 IPHONE DIAGNOSTICO 第 22 行 |
| `haode-pantalla-oled-diagnostica-modelo-15-pro` | OLED Diagnóstica · Tamaño original | 05 IPHONE DIAGNOSTICO 第 20 行 |
| `haode-pantalla-oled-diagnostica-modelo-15-pro-max` | OLED Diagnóstica · Tamaño original | 05 IPHONE DIAGNOSTICO 第 21 行 |
| `haode-pantalla-oled-diagnostica-modelo-16` | OLED Diagnóstica · Tamaño original | 05 IPHONE DIAGNOSTICO 第 24 行 |
| `haode-pantalla-oled-diagnostica-modelo-16-plus` | OLED Diagnóstica · Tamaño original | 05 IPHONE DIAGNOSTICO 第 27 行 |
| `haode-pantalla-oled-diagnostica-modelo-16-pro` | OLED Diagnóstica · Tamaño original | 05 IPHONE DIAGNOSTICO 第 25 行 |
| `haode-pantalla-oled-diagnostica-modelo-16-pro-max` | OLED Diagnóstica · Tamaño original | 05 IPHONE DIAGNOSTICO 第 26 行 |
| `haode-pantalla-oled-diagnostica-modelo-17` | OLED Diagnóstica · Tamaño original | 05 IPHONE DIAGNOSTICO 第 28 行 |
| `haode-pantalla-oled-diagnostica-modelo-17-pro` | OLED Diagnóstica · Tamaño original | 05 IPHONE DIAGNOSTICO 第 29 行 |
| `haode-pantalla-oled-diagnostica-modelo-17-pro-max` | OLED Diagnóstica · Tamaño original | 05 IPHONE DIAGNOSTICO 第 30 行 |
| `haode-pantalla-oled-diagnostica-modelo-xs-max` | OLED Diagnóstica · Tamaño original | 05 IPHONE DIAGNOSTICO 第 7 行 |
| `iphone-oled-14pro` | OLED PREMIUM | 04 IPHONE OLED 第 18 行 |
| `iphone-oled-15` | OLED PREMIUM | 04 IPHONE OLED 第 20 行 |
| `samsung-oled-note-10` | OLED CON MARCO | 07 SAMSUNG OLED 第 13 行 |
| `samsung-oled-note-20` | OLED CON MARCO | 07 SAMSUNG OLED 第 14 行 |
| `samsung-oled-note-20-ultra` | OLED CON MARCO | 07 SAMSUNG OLED 第 15 行 |
| `samsung-oled-s20-plus` | OLED CON MARCO | 07 SAMSUNG OLED 第 7 行 |
| `samsung-oled-s21-ultra` | OLED CON MARCO | 07 SAMSUNG OLED 第 8 行 |
| `samsung-oled-s22-ultra` | OLED CON MARCO | 07 SAMSUNG OLED 第 9 行 |
| `samsung-oled-s23-ultra` | OLED CON MARCO | 07 SAMSUNG OLED 第 10 行 |
| `samsung-oled-s24-ultra` | OLED CON MARCO | 07 SAMSUNG OLED 第 11 行 |
| `samsung-oled-s25-ultra` | OLED CON MARCO | 07 SAMSUNG OLED 第 12 行 |
| `x200t-cortadora-micas` | Mayor cantidad, menor precio. | 01 HIDROGEL 第 7 行 |

## 四方价格一致性差异（不含数值）

- 存在官网、App 或结构化数据与客户表不一致的候选：0。

| 产品 ID | 分类 | 官网差异档 | App 差异档 | 结构化数据差异档 |
| --- | --- | --- | --- | --- |

## 工作簿排除项

| 来源位置 | 型号 | 品质 | 原因 |
| --- | --- | --- | --- |
| 02 PRODUCTOS AI 第 7 行 | Gafas AI G5 | LENTE AI | category_not_in_feed_scope |
| 02 PRODUCTOS AI 第 8 行 | Gafas AI W630 | LENTE AI | category_not_in_feed_scope |
| 02 PRODUCTOS AI 第 9 行 | Gafas AI W610 | LENTE AI | category_not_in_feed_scope |
| 02 PRODUCTOS AI 第 10 行 | Gafas AI G3 | LENTE AI | category_not_in_feed_scope |
| 02 PRODUCTOS AI 第 11 行 | Gafas AI M89 | LENTE AI | category_not_in_feed_scope |
| 02 PRODUCTOS AI 第 12 行 | Gafas AI M08 13MP | LENTE AI | category_not_in_feed_scope |
| 02 PRODUCTOS AI 第 13 行 | Gafas AI M95 | LENTE AI | category_not_in_feed_scope |
| 03 IPHONE INCELL 第 8 行 | X Bolsa Protectora | INCELL FHD C/IC | no_matching_feed_candidate |
| 03 IPHONE INCELL 第 10 行 | Xs Bolsa Protectora | INCELL FHD C/IC | no_matching_feed_candidate |
| 08 SAMSUNG ORIGINAL 第 14 行 | S26 Ultra | TIPO ORIGINAL C/M | no_matching_feed_candidate |

## 素材 QC 边界

- Hydrogel 四款与 X200T 的当前主图 SHA256 匹配 2026-09-18 Owner review，记录为 APPROVED_FOR_WEB。
- 其他现有图片只证明官网文件存在；没有符合当前标准的 SOURCE_CONFIRMED + QC_PASS + APPROVED_FOR_WEB 清单，因此保持 SOURCE_UNCONFIRMED。
- 当前发现 8 个跨 SKU 完全相同字节组；逐图检查后，明确错误与人工复核项如下。

| 产品 ID | QC 状态 | 证据 |
| --- | --- | --- |
| `haode-pantalla-oled-diagnostica-modelo-13` | MANUAL_REVIEW_SHARED_SERIES | The packaging names both iPhone 13 and 13 Pro; approval for reuse by both listings is not documented. |
| `haode-pantalla-oled-diagnostica-modelo-13-pro` | MANUAL_REVIEW_SHARED_SERIES | The packaging names both iPhone 13 and 13 Pro; approval for reuse by both listings is not documented. |
| `haode-pantalla-oled-diagnostica-modelo-14` | MANUAL_REVIEW_SHARED_SERIES | The packaging names both iPhone 14 and 14 Pro; approval for reuse by both listings is not documented. |
| `haode-pantalla-oled-diagnostica-modelo-14-pro` | MANUAL_REVIEW_SHARED_SERIES | The packaging names both iPhone 14 and 14 Pro; approval for reuse by both listings is not documented. |
| `iphone-incell-11-bolsa-protectora` | QC_FAIL_PROMO_WRONG_MAIN_IMAGE | The current file is a shared iPhone 11/XR promotion containing a price, stock and warranty claims; it is not a single-product main image. |
| `iphone-incell-xr-bolsa-protectora` | QC_FAIL_PROMO_WRONG_MAIN_IMAGE | The current file is a shared iPhone 11/XR promotion containing a price, stock and warranty claims; it is not a single-product main image. |
| `samsung-incell-note-10-lite` | QC_FAIL_WRONG_MODEL | The shared image visibly identifies SM-N10+; it does not verify Note 10 Lite. |
| `samsung-incell-note-20` | QC_FAIL_WRONG_MODEL | The shared image visibly identifies SM-N10+; it does not verify Note 20. |
| `samsung-incell-s10-lite` | QC_FAIL_WRONG_MODEL | The shared image visibly identifies SM-N10+; it does not verify S10 Lite. |
| `samsung-oled-note-20` | QC_FAIL_WRONG_MODEL | The image is byte-identical to samsung-incell-s23-ultra and visibly identifies SM-S23U, not Note 20. |
| `samsung-oled-s21-ultra` | MANUAL_REVIEW_CROSS_QUALITY | Byte-identical to the same-model Original listing; the photo does not independently prove the OLED quality tier. |
| `samsung-oled-s22-ultra` | MANUAL_REVIEW_CROSS_QUALITY | Byte-identical to the same-model Original listing; the photo does not independently prove the OLED quality tier. |
| `samsung-oled-s23-ultra` | MANUAL_REVIEW_CROSS_QUALITY | Byte-identical to the same-model Original listing; the photo does not independently prove the OLED quality tier. |
| `samsung-original-s21-ultra` | MANUAL_REVIEW_CROSS_QUALITY | Byte-identical to the same-model OLED listing; the photo does not independently prove the Original quality tier. |
| `samsung-original-s22-ultra` | MANUAL_REVIEW_CROSS_QUALITY | Byte-identical to the same-model OLED listing; the photo does not independently prove the Original quality tier. |
| `samsung-original-s23-ultra` | MANUAL_REVIEW_CROSS_QUALITY | Byte-identical to the same-model OLED listing; the photo does not independently prove the Original quality tier. |

## 外部状态

- Feed 上传：NOT RUN。
- 广告启用与花费：NOT RUN。
- 生产价格发布：待本次部署后验证；库存/图片写入：NOT RUN。
