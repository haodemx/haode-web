# HAODE 老板确认价格与图片清单

日期：2026-07-07
分支：`fix/public-product-sync-safe-20260707`
依据：`docs/reports/product-price-listing-audit-2026-07-07.md`、`docs/reports/product-sync-safe-fix-report-2026-07-07.md`、当前 `products.js` / `data/products.generated.js` / `app/products.json` / `sitemap.xml`。

## 重要边界

- 本文件只整理给老板确认，不改价、不补价、不上架、不发布。
- 不要猜价格，不要用 Excel 价格自动覆盖，不要从相似型号推算。
- 老板未确认前禁止运行 `publish-products`。
- 图片未确认前，不要用网上图片、AI 生成图、通用图或其他型号图替代。
- 价格与图片确认后，再进入下一轮 `publish-products` 或产品同步修复。

## 1. 14 个缺价 SKU

| slug | 产品名称 | 分类 | 当前官网显示 | 当前 App 显示 | 是否有详情页 | 是否在 sitemap | 当前图片路径 | 缺少哪些价格字段 | 老板填写 precio público | 老板填写 precio mayorista | 老板填写 precio caja / 5pcs / 10pcs / 100pcs | 备注 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| iphone-oled-12mini | Pantalla para iPhone 12 mini | Pantallas iPhone OLED | Consultar / Consultar | App缺少 / 无价格 | 是 | 是 | assets/products/iphone-oled/12mini/main.jpg | precio público、precio mayorista、precio caja/5pcs/10pcs/100pcs 或备注 | 待填写 | 待填写 | 待填写 | Excel 仅参考：未匹配；老板未确认前禁止 publish-products |
| iphone-oled-13mini | Pantalla para iPhone 13 mini | Pantallas iPhone OLED | Consultar / Consultar | App缺少 / 无价格 | 是 | 是 | assets/products/iphone-oled/13mini/main.jpg | precio público、precio mayorista、precio caja/5pcs/10pcs/100pcs 或备注 | 待填写 | 待填写 | 待填写 | Excel 仅参考：近似参考 730 / 720 (iPhone 13 OLED PREMIUM)；老板未确认前禁止 publish-products |
| iphone-oled-15plus | Pantalla para iPhone 15 Plus | Pantallas iPhone OLED | Consultar / Consultar | App缺少 / 无价格 | 是 | 是 | assets/products/iphone-oled/15plus/main.jpg | precio público、precio mayorista、precio caja/5pcs/10pcs/100pcs 或备注 | 待填写 | 待填写 | 待填写 | Excel 仅参考：近似参考 1200 / 1150 (iPhone 15 SOFT OLED PREMIUM)；老板未确认前禁止 publish-products |
| iphone-oled-16 | Pantalla para iPhone 16 | Pantallas iPhone OLED | Consultar / Consultar | App缺少 / 无价格 | 是 | 是 | assets/products/iphone-oled/16/main.jpg | precio público、precio mayorista、precio caja/5pcs/10pcs/100pcs 或备注 | 待填写 | 待填写 | 待填写 | Excel 仅参考：未匹配；老板未确认前禁止 publish-products |
| iphone-oled-16plus | Pantalla para iPhone 16 Plus | Pantallas iPhone OLED | Consultar / Consultar | App缺少 / 无价格 | 是 | 是 | assets/products/iphone-oled/16plus/main.jpg | precio público、precio mayorista、precio caja/5pcs/10pcs/100pcs 或备注 | 待填写 | 待填写 | 待填写 | Excel 仅参考：未匹配；老板未确认前禁止 publish-products |
| samsung-oled-note-9 | Pantalla para Samsung Note 9 | Pantallas Samsung OLED | Consultar / Consultar | App缺少 / 无价格 | 是 | 是 | assets/products/samsung-oled/note-9/main.jpg | precio público、precio mayorista、precio caja/5pcs/10pcs/100pcs 或备注 | 待填写 | 待填写 | 待填写 | Excel 仅参考：未匹配；老板未确认前禁止 publish-products |
| samsung-oled-s20 | Pantalla para Samsung S20 | Pantallas Samsung OLED | Consultar / Consultar | App缺少 / 无价格 | 是 | 是 | assets/products/samsung-oled/s20/main.jpg | precio público、precio mayorista、precio caja/5pcs/10pcs/100pcs 或备注 | 待填写 | 待填写 | 待填写 | Excel 仅参考：近似参考 1100 / 1050 (Samsung S20 PLUS OLED PREMIUM)；老板未确认前禁止 publish-products |
| samsung-oled-s20-ultra | Pantalla para Samsung S20 Ultra | Pantallas Samsung OLED | Consultar / Consultar | App缺少 / 无价格 | 是 | 是 | assets/products/samsung-oled/s20-ultra/main.jpg | precio público、precio mayorista、precio caja/5pcs/10pcs/100pcs 或备注 | 待填写 | 待填写 | 待填写 | Excel 仅参考：未匹配；老板未确认前禁止 publish-products |
| samsung-oled-s21 | Pantalla para Samsung S21 | Pantallas Samsung OLED | Consultar / Consultar | App缺少 / 无价格 | 是 | 是 | assets/products/samsung-oled/s21/main.jpg | precio público、precio mayorista、precio caja/5pcs/10pcs/100pcs 或备注 | 待填写 | 待填写 | 待填写 | Excel 仅参考：近似参考 1600 / 1550 (Samsung S21 Ultra OLED PREMIUM)；老板未确认前禁止 publish-products |
| samsung-oled-s21-plus | Pantalla para Samsung S21 Plus | Pantallas Samsung OLED | Consultar / Consultar | App缺少 / 无价格 | 是 | 是 | assets/products/samsung-oled/s21-plus/main.jpg | precio público、precio mayorista、precio caja/5pcs/10pcs/100pcs 或备注 | 待填写 | 待填写 | 待填写 | Excel 仅参考：未匹配；老板未确认前禁止 publish-products |
| samsung-oled-s22-plus | Pantalla para Samsung S22 Plus | Pantallas Samsung OLED | Consultar / Consultar | App缺少 / 无价格 | 是 | 是 | assets/products/samsung-oled/s22-plus/main.jpg | precio público、precio mayorista、precio caja/5pcs/10pcs/100pcs 或备注 | 待填写 | 待填写 | 待填写 | Excel 仅参考：未匹配；老板未确认前禁止 publish-products |
| samsung-oled-s23-plus | Pantalla para Samsung S23 Plus | Pantallas Samsung OLED | Consultar / Consultar | App缺少 / 无价格 | 是 | 是 | assets/products/samsung-oled/s23-plus/main.jpg | precio público、precio mayorista、precio caja/5pcs/10pcs/100pcs 或备注 | 待填写 | 待填写 | 待填写 | Excel 仅参考：未匹配；老板未确认前禁止 publish-products |
| samsung-oled-s24-plus | Pantalla para Samsung S24 Plus | Pantallas Samsung OLED | Consultar / Consultar | App缺少 / 无价格 | 是 | 是 | assets/products/samsung-oled/s24-plus/main.jpg | precio público、precio mayorista、precio caja/5pcs/10pcs/100pcs 或备注 | 待填写 | 待填写 | 待填写 | Excel 仅参考：未匹配；老板未确认前禁止 publish-products |
| samsung-oled-s9-plus | Pantalla para Samsung S9 Plus | Pantallas Samsung OLED | Consultar / Consultar | App缺少 / 无价格 | 是 | 是 | assets/products/samsung-oled/s9-plus/main.jpg | precio público、precio mayorista、precio caja/5pcs/10pcs/100pcs 或备注 | 待填写 | 待填写 | 待填写 | Excel 仅参考：未匹配；老板未确认前禁止 publish-products |

## 2. 7 个价格异常 SKU

| slug | 产品名称 | 分类 | 官网当前价格 | App 当前价格 | Master / Excel 参考价格 | 差异金额 | 差异百分比 | 是否可能是促销价 | 是否当前公开显示 | 建议处理方式 | 老板确认栏 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| iphone-incell-12promax | Pantalla para iPhone 12 Pro Max | Pantallas iPhone INCELL | 220 / 210 | 250 / 240 | Master 250 / 240；Excel 近似参考 250 / 240 (iPhone 12PRO MAX INCELL FHD) | -30 | -12.0% | 待老板确认是否促销价 | 是 | 老板选择：保持当前价格 / 改成 Master-App 价格 / 改成老板确认价格 / 暂时下架或改 Consultar | 待老板确认 |
| iphone-incell-14 | Pantalla para iPhone 14 | Pantallas iPhone INCELL | 800 / 750 | 260 / 250 | Master 260 / 250；Excel 近似参考 260 / 250 (iPhone 14 INCELL FHD) | 540 | 207.7% | App 有促销字段；仍需老板确认是否促销价 | 是 | 老板选择：保持当前价格 / 改成 Master-App 价格 / 改成老板确认价格 / 暂时下架或改 Consultar | 待老板确认 |
| iphone-incell-14plus | Pantalla para iPhone 14 Plus | Pantallas iPhone INCELL | 800 / 750 | 300 / 290 | Master 300 / 290；Excel 近似参考 300 / 290 (iPhone 14 plus INCELL FHD) | 500 | 166.7% | 待老板确认是否促销价 | 是 | 老板选择：保持当前价格 / 改成 Master-App 价格 / 改成老板确认价格 / 暂时下架或改 Consultar | 待老板确认 |
| iphone-incell-15plus | Pantalla para iPhone 15 Plus | Pantallas iPhone INCELL | 300 / 290 | 330 / 310 | Master 330 / 310；Excel 近似参考 330 / 310 (iPhone 15 plus INCELL FHD) | -30 | -9.1% | 待老板确认是否促销价 | 是 | 老板选择：保持当前价格 / 改成 Master-App 价格 / 改成老板确认价格 / 暂时下架或改 Consultar | 待老板确认 |
| iphone-oled-13promax | Pantalla para iPhone 13 Pro Max | Pantallas iPhone OLED | 600 / 590 | 900 / 850 | Master 900 / 850；Excel 近似参考 900 / 850 (iPhone 13PRO MAX OLED PREMIUM) | -300 | -33.3% | 待老板确认是否促销价 | 是 | 老板选择：保持当前价格 / 改成 Master-App 价格 / 改成老板确认价格 / 暂时下架或改 Consultar | 待老板确认 |
| samsung-incell-s20-plus | Pantalla para Samsung S20 Plus | Pantallas Samsung INCELL | 500 / 480 | 550 / 520 | Master 550 / 520；Excel 近似参考 550 / 520 (Samsung S20 PLUS INCELL FHD) | -50 | -9.1% | 待老板确认是否促销价 | 是 | 老板选择：保持当前价格 / 改成 Master-App 价格 / 改成老板确认价格 / 暂时下架或改 Consultar | 待老板确认 |
| samsung-incell-s9-plus | Pantalla para Samsung S9 Plus | Pantallas Samsung INCELL | 450 / 430 | 500 / 450 | Master 500 / 450；Excel 近似参考 500 / 450 (Samsung S9 PLUS INCELL FHD) | -50 | -10.0% | 待老板确认是否促销价 | 是 | 老板选择：保持当前价格 / 改成 Master-App 价格 / 改成老板确认价格 / 暂时下架或改 Consultar | 待老板确认 |

## 3. 4 个图片问题

| slug | 产品名称 | 分类 | 当前图片路径 | 问题类型 | 影响页面 | 是否有可用真实图片 | 需要老板提供什么图片 | 建议处理方式 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| samsung-incell-note-10-lite | Pantalla para Samsung Note 10 Lite | Pantallas Samsung INCELL | /assets/products/samsung-incell/main.jpg | placeholder / 通用图 / 待确认图 | App / 官网待上架 | 否 | 需要该型号真实产品主图，必要时补分类页/App/详情页可用图；不能使用网图、AI图或相似型号图 | 老板补真实图片后再决定是否上架/替换 |
| samsung-incell-note-20 | Pantalla para Samsung Note 20 | Pantallas Samsung INCELL | /assets/products/samsung-incell/main.jpg | placeholder / 通用图 / 待确认图 | App / 官网待上架 | 否 | 需要该型号真实产品主图，必要时补分类页/App/详情页可用图；不能使用网图、AI图或相似型号图 | 老板补真实图片后再决定是否上架/替换 |
| samsung-incell-s10-lite | Pantalla para Samsung S10 Lite | Pantallas Samsung INCELL | /assets/products/samsung-incell/main.jpg | placeholder / 通用图 / 待确认图 | App / 官网待上架 | 否 | 需要该型号真实产品主图，必要时补分类页/App/详情页可用图；不能使用网图、AI图或相似型号图 | 老板补真实图片后再决定是否上架/替换 |
| samsung-original-note-20-ultra | Pantalla para Samsung Note 20 Ultra | Pantallas Samsung Original | /assets/products/placeholder.svg | placeholder / 通用图 / 待确认图 | App / 官网待上架 | 否 | 需要该型号真实产品主图，必要时补分类页/App/详情页可用图；不能使用网图、AI图或相似型号图 | 老板补真实图片后再决定是否上架/替换 |

## 4. 20 个未修漏上架 / 路由同步缺口

| slug | 产品名称 | 分类 | 问题类型 | 为什么本轮未修 | 是否因为缺价 | 是否因为价格异常 | 是否因为缺图 | 是否因为计划中产品 | 是否需要老板确认 | 下一步建议 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| samsung-incell-note-10-lite | Pantalla para Samsung Note 10 Lite | Pantallas Samsung INCELL | App有，官网产品数据/详情页/sitemap缺少 | App有，官网缺少；图片待确认 | 否 | 否 | 是 | 否 | 是 | 老板确认价格/图片/分类后，下一轮再安全上架；本轮禁止自动上架 |
| samsung-incell-note-20 | Pantalla para Samsung Note 20 | Pantallas Samsung INCELL | App有，官网产品数据/详情页/sitemap缺少 | App有，官网缺少；图片待确认 | 否 | 否 | 是 | 否 | 是 | 老板确认价格/图片/分类后，下一轮再安全上架；本轮禁止自动上架 |
| samsung-incell-s10-lite | Pantalla para Samsung S10 Lite | Pantallas Samsung INCELL | App有，官网产品数据/详情页/sitemap缺少 | App有，官网缺少；图片待确认 | 否 | 否 | 是 | 否 | 是 | 老板确认价格/图片/分类后，下一轮再安全上架；本轮禁止自动上架 |
| samsung-original-note-20-ultra | Pantalla para Samsung Note 20 Ultra | Pantallas Samsung Original | App有，官网产品数据/详情页/sitemap缺少 | App有，官网缺少；图片待确认 | 否 | 否 | 是 | 否 | 是 | 老板确认价格/图片/分类后，下一轮再安全上架；本轮禁止自动上架 |
| samsung-original-s21-ultra | Pantalla para Samsung S21 Ultra | Pantallas Samsung Original | App有，官网产品数据/详情页/sitemap缺少 | App有，官网缺少；Samsung Original 新上架需确认 | 否 | 否 | 待确认 | 否 | 是 | 老板确认价格/图片/分类后，下一轮再安全上架；本轮禁止自动上架 |
| samsung-original-s22-plus | Pantalla para Samsung S22 Plus | Pantallas Samsung Original | App有，官网产品数据/详情页/sitemap缺少 | App有，官网缺少；Samsung Original 新上架需确认 | 否 | 否 | 待确认 | 否 | 是 | 老板确认价格/图片/分类后，下一轮再安全上架；本轮禁止自动上架 |
| samsung-original-s22-ultra | Pantalla para Samsung S22 Ultra | Pantallas Samsung Original | App有，官网产品数据/详情页/sitemap缺少 | App有，官网缺少；Samsung Original 新上架需确认 | 否 | 否 | 待确认 | 否 | 是 | 老板确认价格/图片/分类后，下一轮再安全上架；本轮禁止自动上架 |
| samsung-original-s23-plus | Pantalla para Samsung S23 Plus | Pantallas Samsung Original | App有，官网产品数据/详情页/sitemap缺少 | App有，官网缺少；Samsung Original 新上架需确认 | 否 | 否 | 待确认 | 否 | 是 | 老板确认价格/图片/分类后，下一轮再安全上架；本轮禁止自动上架 |
| samsung-original-s23-ultra | Pantalla para Samsung S23 Ultra | Pantallas Samsung Original | App有，官网产品数据/详情页/sitemap缺少 | App有，官网缺少；Samsung Original 新上架需确认 | 否 | 否 | 待确认 | 否 | 是 | 老板确认价格/图片/分类后，下一轮再安全上架；本轮禁止自动上架 |
| samsung-original-s24-ultra | Pantalla para Samsung S24 Ultra | Pantallas Samsung Original | App有，官网产品数据/详情页/sitemap缺少 | App有，官网缺少；Samsung Original 新上架需确认 | 否 | 否 | 待确认 | 否 | 是 | 老板确认价格/图片/分类后，下一轮再安全上架；本轮禁止自动上架 |
| samsung-original-s25-ultra | Pantalla para Samsung S25 Ultra | Pantallas Samsung Original | App有，官网产品数据/详情页/sitemap缺少 | App有，官网缺少；Samsung Original 新上架需确认 | 否 | 否 | 待确认 | 否 | 是 | 老板确认价格/图片/分类后，下一轮再安全上架；本轮禁止自动上架 |
| samsung-original-z-flip3 | Pantalla para Samsung Z Flip3 | Pantallas Samsung Original | App有，官网产品数据/详情页/sitemap缺少 | App有，官网缺少；Z Flip 系列新上架需确认 | 否 | 否 | 待确认 | 否 | 是 | 老板确认价格/图片/分类后，下一轮再安全上架；本轮禁止自动上架 |
| samsung-original-z-flip4 | Pantalla para Samsung Z Flip4 | Pantallas Samsung Original | App有，官网产品数据/详情页/sitemap缺少 | App有，官网缺少；Z Flip 系列新上架需确认 | 否 | 否 | 待确认 | 否 | 是 | 老板确认价格/图片/分类后，下一轮再安全上架；本轮禁止自动上架 |
| samsung-original-z-flip5 | Pantalla para Samsung Z Flip5 | Pantallas Samsung Original | App有，官网产品数据/详情页/sitemap缺少 | App有，官网缺少；Z Flip 系列新上架需确认 | 否 | 否 | 待确认 | 否 | 是 | 老板确认价格/图片/分类后，下一轮再安全上架；本轮禁止自动上架 |
| samsung-original-z-flip6 | Pantalla para Samsung Z Flip6 | Pantallas Samsung Original | App有，官网产品数据/详情页/sitemap缺少 | App有，官网缺少；Z Flip 系列新上架需确认 | 否 | 否 | 待确认 | 否 | 是 | 老板确认价格/图片/分类后，下一轮再安全上架；本轮禁止自动上架 |
| samsung-original-z-flip7 | Pantalla Samsung Z Flip7 | Pantallas Samsung Original | App有，官网产品数据/详情页/sitemap缺少 | App有，官网缺少；Z Flip 系列新上架需确认 | 否 | 否 | 待确认 | 否 | 是 | 老板确认价格/图片/分类后，下一轮再安全上架；本轮禁止自动上架 |
| samsung-original-z-fold3 | Pantalla Samsung Z Fold3 | Pantallas Samsung Original | App有，官网产品数据/详情页/sitemap缺少 | App有，官网缺少；Z Fold 系列新上架需确认 | 否 | 否 | 待确认 | 否 | 是 | 老板确认价格/图片/分类后，下一轮再安全上架；本轮禁止自动上架 |
| samsung-original-z-fold4 | Pantalla Samsung Z Fold4 | Pantallas Samsung Original | App有，官网产品数据/详情页/sitemap缺少 | App有，官网缺少；Z Fold 系列新上架需确认 | 否 | 否 | 待确认 | 否 | 是 | 老板确认价格/图片/分类后，下一轮再安全上架；本轮禁止自动上架 |
| samsung-original-z-fold5 | Pantalla Samsung Z Fold5 | Pantallas Samsung Original | App有，官网产品数据/详情页/sitemap缺少 | App有，官网缺少；Z Fold 系列新上架需确认 | 否 | 否 | 待确认 | 否 | 是 | 老板确认价格/图片/分类后，下一轮再安全上架；本轮禁止自动上架 |
| samsung-original-z-fold6 | Pantalla Samsung Z Fold6 | Pantallas Samsung Original | App有，官网产品数据/详情页/sitemap缺少 | App有，官网缺少；Z Fold 系列新上架需确认 | 否 | 否 | 待确认 | 否 | 是 | 老板确认价格/图片/分类后，下一轮再安全上架；本轮禁止自动上架 |

## 5. 42 个未修 App / 官网不一致

| slug | 产品名称 | 不一致类型 | App 当前值 | 官网当前值 | 为什么本轮未修 | 是否需要老板确认 | 是否可下一轮安全修复 | 是否必须等价格/图片确认 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| funda-premium-aluminio-plus | Funda Premium Aluminio Plus | App缺少 | 无 | 85 / 75 | 官网有，App缺少；是否需要加入 App 需业务确认 | 是 | 老板确认后可修 | 否/需确认是否要进 App |
| iphone-incell-12promax | Pantalla para iPhone 12 Pro Max | 价格 | 250 / 240 | 220 / 210 | 公开价/批发价不一致 | 是 | 否 | 是 |
| iphone-incell-14 | Pantalla para iPhone 14 | 价格 | 260 / 250 | 800 / 750 | 公开价/批发价不一致 | 是 | 否 | 是 |
| iphone-incell-14plus | Pantalla para iPhone 14 Plus | 价格 | 300 / 290 | 800 / 750 | 公开价/批发价不一致 | 是 | 否 | 是 |
| iphone-incell-15plus | Pantalla para iPhone 15 Plus | 价格 | 330 / 310 | 300 / 290 | 公开价/批发价不一致 | 是 | 否 | 是 |
| iphone-oled-13promax | Pantalla para iPhone 13 Pro Max | 价格 | 900 / 850 | 600 / 590 | 公开价/批发价不一致 | 是 | 否 | 是 |
| samsung-incell-s20-plus | Pantalla para Samsung S20 Plus | 价格 | 550 / 520 | 500 / 480 | 公开价/批发价不一致 | 是 | 否 | 是 |
| samsung-incell-s9-plus | Pantalla para Samsung S9 Plus | 价格 | 500 / 450 | 450 / 430 | 公开价/批发价不一致 | 是 | 否 | 是 |
| iphone-oled-12mini | Pantalla para iPhone 12 mini | App缺少/缺价 | 无 | Consultar / Consultar | 官网为 Consultar，App 缺少 | 是 | 否 | 是 |
| iphone-oled-13mini | Pantalla para iPhone 13 mini | App缺少/缺价 | 无 | Consultar / Consultar | 官网为 Consultar，App 缺少 | 是 | 否 | 是 |
| iphone-oled-15plus | Pantalla para iPhone 15 Plus | App缺少/缺价 | 无 | Consultar / Consultar | 官网为 Consultar，App 缺少 | 是 | 否 | 是 |
| iphone-oled-16 | Pantalla para iPhone 16 | App缺少/缺价 | 无 | Consultar / Consultar | 官网为 Consultar，App 缺少 | 是 | 否 | 是 |
| iphone-oled-16plus | Pantalla para iPhone 16 Plus | App缺少/缺价 | 无 | Consultar / Consultar | 官网为 Consultar，App 缺少 | 是 | 否 | 是 |
| samsung-oled-note-9 | Pantalla para Samsung Note 9 | App缺少/缺价 | 无 | Consultar / Consultar | 官网为 Consultar，App 缺少 | 是 | 否 | 是 |
| samsung-oled-s20 | Pantalla para Samsung S20 | App缺少/缺价 | 无 | Consultar / Consultar | 官网为 Consultar，App 缺少 | 是 | 否 | 是 |
| samsung-oled-s20-ultra | Pantalla para Samsung S20 Ultra | App缺少/缺价 | 无 | Consultar / Consultar | 官网为 Consultar，App 缺少 | 是 | 否 | 是 |
| samsung-oled-s21 | Pantalla para Samsung S21 | App缺少/缺价 | 无 | Consultar / Consultar | 官网为 Consultar，App 缺少 | 是 | 否 | 是 |
| samsung-oled-s21-plus | Pantalla para Samsung S21 Plus | App缺少/缺价 | 无 | Consultar / Consultar | 官网为 Consultar，App 缺少 | 是 | 否 | 是 |
| samsung-oled-s22-plus | Pantalla para Samsung S22 Plus | App缺少/缺价 | 无 | Consultar / Consultar | 官网为 Consultar，App 缺少 | 是 | 否 | 是 |
| samsung-oled-s23-plus | Pantalla para Samsung S23 Plus | App缺少/缺价 | 无 | Consultar / Consultar | 官网为 Consultar，App 缺少 | 是 | 否 | 是 |
| samsung-oled-s24-plus | Pantalla para Samsung S24 Plus | App缺少/缺价 | 无 | Consultar / Consultar | 官网为 Consultar，App 缺少 | 是 | 否 | 是 |
| samsung-oled-s9-plus | Pantalla para Samsung S9 Plus | App缺少/缺价 | 无 | Consultar / Consultar | 官网为 Consultar，App 缺少 | 是 | 否 | 是 |
| samsung-incell-note-10-lite | Pantalla para Samsung Note 10 Lite | 图片/路由 | 750 / 720 | 无 | App有，官网缺少，且图片待确认 | 是 | 否 | 是 |
| samsung-incell-note-20 | Pantalla para Samsung Note 20 | 图片/路由 | 650 / 620 | 无 | App有，官网缺少，且图片待确认 | 是 | 否 | 是 |
| samsung-incell-s10-lite | Pantalla para Samsung S10 Lite | 图片/路由 | 450 / 420 | 无 | App有，官网缺少，且图片待确认 | 是 | 否 | 是 |
| samsung-original-note-20-ultra | Pantalla para Samsung Note 20 Ultra | 图片/路由 | 3500 / 3400 | 无 | App有，官网缺少，且图片待确认 | 是 | 否 | 是 |
| samsung-original-s21-ultra | Pantalla para Samsung S21 Ultra | 路由/详情页/sitemap | 2500 / 2400 | 无 | App有，官网缺少；Samsung Original 新上架需确认 | 是 | 否 | 是 |
| samsung-original-s22-plus | Pantalla para Samsung S22 Plus | 路由/详情页/sitemap | 1700 / 1650 | 无 | App有，官网缺少；Samsung Original 新上架需确认 | 是 | 否 | 是 |
| samsung-original-s22-ultra | Pantalla para Samsung S22 Ultra | 路由/详情页/sitemap | 3000 / 2900 | 无 | App有，官网缺少；Samsung Original 新上架需确认 | 是 | 否 | 是 |
| samsung-original-s23-plus | Pantalla para Samsung S23 Plus | 路由/详情页/sitemap | 1800 / 1700 | 无 | App有，官网缺少；Samsung Original 新上架需确认 | 是 | 否 | 是 |
| samsung-original-s23-ultra | Pantalla para Samsung S23 Ultra | 路由/详情页/sitemap | 3300 / 3200 | 无 | App有，官网缺少；Samsung Original 新上架需确认 | 是 | 否 | 是 |
| samsung-original-s24-ultra | Pantalla para Samsung S24 Ultra | 路由/详情页/sitemap | 3500 / 3400 | 无 | App有，官网缺少；Samsung Original 新上架需确认 | 是 | 否 | 是 |
| samsung-original-s25-ultra | Pantalla para Samsung S25 Ultra | 路由/详情页/sitemap | 3700 / 3600 | 无 | App有，官网缺少；Samsung Original 新上架需确认 | 是 | 否 | 是 |
| samsung-original-z-flip3 | Pantalla para Samsung Z Flip3 | 路由/详情页/sitemap | 3300 / 3200 | 无 | App有，官网缺少；Z Flip 系列新上架需确认 | 是 | 否 | 是 |
| samsung-original-z-flip4 | Pantalla para Samsung Z Flip4 | 路由/详情页/sitemap | 3600 / 3500 | 无 | App有，官网缺少；Z Flip 系列新上架需确认 | 是 | 否 | 是 |
| samsung-original-z-flip5 | Pantalla para Samsung Z Flip5 | 路由/详情页/sitemap | 4000 / 3900 | 无 | App有，官网缺少；Z Flip 系列新上架需确认 | 是 | 否 | 是 |
| samsung-original-z-flip6 | Pantalla para Samsung Z Flip6 | 路由/详情页/sitemap | 4500 / 4400 | 无 | App有，官网缺少；Z Flip 系列新上架需确认 | 是 | 否 | 是 |
| samsung-original-z-flip7 | Pantalla Samsung Z Flip7 | 路由/详情页/sitemap | 5800 / 5500 | 无 | App有，官网缺少；Z Flip 系列新上架需确认 | 是 | 否 | 是 |
| samsung-original-z-fold3 | Pantalla Samsung Z Fold3 | 路由/详情页/sitemap | 4500 / 4300 | 无 | App有，官网缺少；Z Fold 系列新上架需确认 | 是 | 否 | 是 |
| samsung-original-z-fold4 | Pantalla Samsung Z Fold4 | 路由/详情页/sitemap | 6000 / 5800 | 无 | App有，官网缺少；Z Fold 系列新上架需确认 | 是 | 否 | 是 |
| samsung-original-z-fold5 | Pantalla Samsung Z Fold5 | 路由/详情页/sitemap | 7500 / 7300 | 无 | App有，官网缺少；Z Fold 系列新上架需确认 | 是 | 否 | 是 |
| samsung-original-z-fold6 | Pantalla Samsung Z Fold6 | 路由/详情页/sitemap | 9800 / 9600 | 无 | App有，官网缺少；Z Fold 系列新上架需确认 | 是 | 否 | 是 |

## 6. 本轮确认

- 未进入 ERP。
- 未改数据库。
- 未部署线上。
- 未运行 `publish-products`。
- 未强行运行 `build-products`。
- 未自动改价格。
- 未自动补图片。
- 未自动上架缺价产品。
- 生成 CSV：`docs/reports/boss-price-image-confirmation-2026-07-07.csv`。
