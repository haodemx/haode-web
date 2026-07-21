# HAODE 当前价格表对照 SEO/产品数据审计 - 2026-07-21

## 任务结论

已按 `HAODE Lista_de_Precios_HAODE_20260721.pdf` 提取价格表并对照官网/APP 数据。本轮只生成确认表和审计报告，未修改官网/APP 价格、库存、产品图片或产品主数据。

结论：现在最影响 SEO 和转化的不是 meta 标签，而是价格表、官网产品数据、APP 价格和结构化数据之间存在不一致；如果直接发布，会让 Google 产品结构化数据、商品详情页和 WhatsApp 报价出现不同价格。

## 输入来源

- PDF：`HAODE Lista_de_Precios_HAODE_20260721.pdf`
- PDF 页数：3
- 提取到价格行：189
- 视觉抽查：第 1 页 iPhone、第 2 页 Samsung、第 3 页 MICA/Fundas/AI/Cámaras/Oferta 表格均可读。

## 对照结果

| 项目 | 数量 |
| --- | ---: |
| 官网产品数 | 139 |
| APP 产品数 | 145 |
| 官网匹配到价格表 | 123 |
| APP 匹配到价格表 | 143 |
| 官网价格与 PDF 不同 | 43 |
| 官网产品未匹配到 PDF 行 | 16 |
| APP 价格与 PDF 不同 | 45 |
| APP 产品未匹配到 PDF 行 | 2 |
| 官网/APP 同 SKU 价格不同 | 7 |
| PDF 有但官网/APP 未匹配 | 46 |

## P0 需要先看

P0 表示最先需要老板确认的项目：价格明显错位、或会直接影响 APP 报价。P0/P1 都没有自动改价，只有老板在确认表里写 `同步PDF` 后才进入同步步骤。

| SKU | 当前官网/APP | PDF 价格 | 问题 |
| --- | --- | --- | --- |
| `iphone-incell-16e` | $300 MXN / $280 MXN | $400 MXN / $380 MXN | app_price_mismatch |
| `iphone-incell-14` | $800 MXN / $750 MXN / $700 MXN / $600 MXN / $550 MXN | $260 MXN / $250 MXN / $245 MXN / $240 MXN / $230 MXN | web_price_mismatch |
| `iphone-incell-14plus` | $800 MXN / $750 MXN / $700 MXN / $600 MXN / $550 MXN | $300 MXN / $290 MXN / $280 MXN / $275 MXN / $265 MXN | web_price_mismatch |

## SEO 影响

- 产品详情页和 JSON-LD `Offer` 会被搜索引擎读取；价格不一致会影响 Google 对商品页的信任度。
- APP、官网、静态详情页价格不一致，会让客户从 Google 进入后看到不同报价，降低询盘转化。
- 价格表里出现但官网/APP 没有明确产品页的项目，不能直接做 SEO 页面；必须先确认图片、型号、分类和是否上架。
- 在价格同步确认前，不建议把具体价格写进 SEO meta description；继续使用“consulta por WhatsApp”更稳。

## 已输出文件

- 老板版确认表：`docs/reports/price-list-sync-confirmation-2026-07-21.xlsx`
- 可筛选确认 CSV：`docs/reports/price-list-sync-confirmation-2026-07-21.csv`
- PDF 提取原始表：`docs/reports/current-price-list-extracted-2026-07-21.csv`

## 老板确认方式

在确认表 `需要确认` 工作表里填写 `boss_decision`：

- `同步PDF`：按 PDF 价格同步官网和 APP。
- `保持当前`：不按 PDF 改，保留现有线上价格。
- `不上架`：PDF 有该行，但暂不做官网/APP 产品页。
- `人工复核`：型号、分类或价格需要人工再看。

## 明确未做

- 未修改任何价格。
- 未修改任何库存。
- 未新增或删除产品。
- 未替换图片。
- 未运行 `publish-products`。
- 未运行会重写产品数据的 `build-products`。

## 下一步建议

先处理 P0 和 P1：老板确认后，再同步 `data/products.generated.js`、`app/products.json`、静态产品页 JSON-LD/价格显示，并重新跑 build、browser-test、SEO 扫描。
