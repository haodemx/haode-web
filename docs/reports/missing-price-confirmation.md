# HAODE 缺价产品确认表

日期：2026-06-05

依据：

- `docs/reports/product-publish-report.md`
- `docs/reports/product-verify-report.md`
- `docs/master-data/products-master.csv`
- 当前最新价格表：`/Users/mac/Desktop/haode产品素材/HL CDMX 2026 06xlsx.xlsx`

本报告只做价格缺口审计：

- 不自动填写价格
- 不发布产品
- 不修改 Firestore
- 不修改网站/App 数据

## 结论

阻止 `npm run publish-products` 的产品共 14 个。

这 14 个产品全部同时缺少：

```text
precio_publico
precio_mayoreo
```

其中：

- 14 个都不能从当前最新价格表做精确价格回填。
- iPhone OLED mini/plus/16 部分只能找到 INCELL 价格或 OLED 空价格行，不能用于发布。
- Samsung OLED 这批缺价产品没有可靠精确价格；旧数据库候选多数为 `Consultar` 或近似型号，不能用于自动回填。

## 缺价产品明细

| SKU | 产品名称 | 分类 | 缺少字段 | 最新价格表匹配情况 | 建议价格来源 |
| --- | --- | --- | --- | --- | --- |
| `iphone-oled-12mini` | Pantalla para iPhone 12 mini | Pantallas iPhone OLED | `precio_publico`, `precio_mayoreo` | 不能精确匹配；仅有 12mini INCELL 或 OLED 空价行 | 向 HL/供应商补 OLED 12 mini 价格 |
| `iphone-oled-13mini` | Pantalla para iPhone 13 mini | Pantallas iPhone OLED | `precio_publico`, `precio_mayoreo` | 不能精确匹配；仅有 13 mini INCELL 或 OLED 空价行 | 向 HL/供应商补 OLED 13 mini 价格 |
| `iphone-oled-15plus` | Pantalla para iPhone 15 Plus | Pantallas iPhone OLED | `precio_publico`, `precio_mayoreo` | 不能精确匹配；仅有 15 Plus INCELL 或 OLED 空价行 | 向 HL/供应商补 OLED 15 Plus 价格 |
| `iphone-oled-16` | Pantalla para iPhone 16 | Pantallas iPhone OLED | `precio_publico`, `precio_mayoreo` | 不能精确匹配；相邻 16E/16Pro/16ProMax 不可套用 | 向 HL/供应商补 iPhone 16 OLED 精确型号价格 |
| `iphone-oled-16plus` | Pantalla para iPhone 16 Plus | Pantallas iPhone OLED | `precio_publico`, `precio_mayoreo` | 不能精确匹配；仅有 16PLUS INCELL 或 OLED 空价行 | 向 HL/供应商补 OLED 16 Plus 价格 |
| `samsung-oled-note-9` | Pantalla para Samsung Note 9 | Pantallas Samsung OLED | `precio_publico`, `precio_mayoreo` | 不能精确匹配；数据库候选也为 `Consultar` | Samsung OLED 供应商价表 |
| `samsung-oled-s20` | Pantalla para Samsung S20 | Pantallas Samsung OLED | `precio_publico`, `precio_mayoreo` | 不能精确匹配；不要套用 S20 INCELL 或 S20 Plus | Samsung OLED 供应商价表 |
| `samsung-oled-s20-ultra` | Pantalla para Samsung S20 Ultra | Pantallas Samsung OLED | `precio_publico`, `precio_mayoreo` | 不能精确匹配；数据库候选也为 `Consultar` | Samsung OLED 供应商价表 |
| `samsung-oled-s21` | Pantalla para Samsung S21 | Pantallas Samsung OLED | `precio_publico`, `precio_mayoreo` | 不能精确匹配；不要套用 S21 INCELL 或 S21 Ultra | Samsung OLED 供应商价表 |
| `samsung-oled-s21-plus` | Pantalla para Samsung S21 Plus | Pantallas Samsung OLED | `precio_publico`, `precio_mayoreo` | 不能精确匹配；数据库候选也为 `Consultar` | Samsung OLED 供应商价表 |
| `samsung-oled-s22-plus` | Pantalla para Samsung S22 Plus | Pantallas Samsung OLED | `precio_publico`, `precio_mayoreo` | 不能精确匹配；近似/其他型号只能参考，不能替代 | Samsung OLED 供应商价表，老板确认 |
| `samsung-oled-s23-plus` | Pantalla para Samsung S23 Plus | Pantallas Samsung OLED | `precio_publico`, `precio_mayoreo` | 不能精确匹配；近似/其他型号只能参考，不能替代 | Samsung OLED 供应商价表，老板确认 |
| `samsung-oled-s24-plus` | Pantalla para Samsung S24 Plus | Pantallas Samsung OLED | `precio_publico`, `precio_mayoreo` | 不能精确匹配；不要套用 S24 Plus INCELL | Samsung OLED 供应商价表 |
| `samsung-oled-s9-plus` | Pantalla para Samsung S9 Plus | Pantallas Samsung OLED | `precio_publico`, `precio_mayoreo` | 不能精确匹配；数据库候选也为 `Consultar` | Samsung OLED 供应商价表 |

## 给老板确认的价格表

请老板只填写确认价格，不需要改系统。

| SKU | 产品名称 | 分类 | 建议参考 | 老板确认零售价 | 老板确认批发价 |
| --- | --- | --- | --- | ---: | ---: |
| `iphone-oled-12mini` | Pantalla para iPhone 12 mini | Pantallas iPhone OLED | 不能用 INCELL；需 OLED 精确价 |  |  |
| `iphone-oled-13mini` | Pantalla para iPhone 13 mini | Pantallas iPhone OLED | 不能用 INCELL；需 OLED 精确价 |  |  |
| `iphone-oled-15plus` | Pantalla para iPhone 15 Plus | Pantallas iPhone OLED | 不能用 INCELL；需 OLED 精确价 |  |  |
| `iphone-oled-16` | Pantalla para iPhone 16 | Pantallas iPhone OLED | 相邻型号不可套用；需精确价 |  |  |
| `iphone-oled-16plus` | Pantalla para iPhone 16 Plus | Pantallas iPhone OLED | 不能用 INCELL；需 OLED 精确价 |  |  |
| `samsung-oled-note-9` | Pantalla para Samsung Note 9 | Pantallas Samsung OLED | 数据库候选为 Consultar |  |  |
| `samsung-oled-s20` | Pantalla para Samsung S20 | Pantallas Samsung OLED | 不套用 INCELL/Plus |  |  |
| `samsung-oled-s20-ultra` | Pantalla para Samsung S20 Ultra | Pantallas Samsung OLED | 数据库候选为 Consultar |  |  |
| `samsung-oled-s21` | Pantalla para Samsung S21 | Pantallas Samsung OLED | 不套用 INCELL/Ultra |  |  |
| `samsung-oled-s21-plus` | Pantalla para Samsung S21 Plus | Pantallas Samsung OLED | 数据库候选为 Consultar |  |  |
| `samsung-oled-s22-plus` | Pantalla para Samsung S22 Plus | Pantallas Samsung OLED | 需 Samsung OLED 供应商确认 |  |  |
| `samsung-oled-s23-plus` | Pantalla para Samsung S23 Plus | Pantallas Samsung OLED | 需 Samsung OLED 供应商确认 |  |  |
| `samsung-oled-s24-plus` | Pantalla para Samsung S24 Plus | Pantallas Samsung OLED | 不套用 INCELL |  |  |
| `samsung-oled-s9-plus` | Pantalla para Samsung S9 Plus | Pantallas Samsung OLED | 数据库候选为 Consultar |  |  |

## 建议

优先确认：

1. 先确认 5 个 iPhone OLED 缺价产品是否继续销售。
2. 再向 Samsung OLED 供应商确认 9 个 Samsung OLED 缺价产品。

原因：这 14 个都没有可直接发布的精确价格。任何近似型号、INCELL 价格或 `Consultar` 都不能自动写入 `products-master.csv`。
