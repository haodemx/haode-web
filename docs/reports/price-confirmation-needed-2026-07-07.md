# HAODE 价格确认清单

日期：2026-07-07

来源：
- `docs/reports/site-full-product-layout-audit-2026-07-07.md`
- `docs/master-data/products-master.csv`
- `data/products.generated.js`
- `app/products.json`

## 重要规则

- 未确认前不要运行 `publish-products`。
- 不要用猜测价格自动补价。
- 不要把促销价覆盖成普通价。
- 价格确认后，再进入下一轮 `publish-products`。
- 本文件只用于老板确认价格，不代表已经改价、上架或发布。

## A. 仍需老板确认价格的 14 个产品

这些产品当前在官网产品数据中存在，但价格为 `Consultar`；`app/products.json` 当前没有这些 SKU。老板确认前，不要自动上架到 App，不要自动补价格。

| slug | 当前分类 | 当前公开页是否显示价格 | app/products.json 是否有价格 | 建议老板填写的字段 |
| --- | --- | --- | --- | --- |
| iphone-oled-12mini | Pantallas iPhone OLED | 不显示真实价格，显示 `Consultar` | 无，App 缺少该 SKU | `precio_publico`、`precio_mayoreo`、`caja` 或备注 |
| iphone-oled-13mini | Pantallas iPhone OLED | 不显示真实价格，显示 `Consultar` | 无，App 缺少该 SKU | `precio_publico`、`precio_mayoreo`、`caja` 或备注 |
| iphone-oled-15plus | Pantallas iPhone OLED | 不显示真实价格，显示 `Consultar` | 无，App 缺少该 SKU | `precio_publico`、`precio_mayoreo`、`caja` 或备注 |
| iphone-oled-16 | Pantallas iPhone OLED | 不显示真实价格，显示 `Consultar` | 无，App 缺少该 SKU | `precio_publico`、`precio_mayoreo`、`caja` 或备注 |
| iphone-oled-16plus | Pantallas iPhone OLED | 不显示真实价格，显示 `Consultar` | 无，App 缺少该 SKU | `precio_publico`、`precio_mayoreo`、`caja` 或备注 |
| samsung-oled-note-9 | Pantallas Samsung OLED | 不显示真实价格，显示 `Consultar` | 无，App 缺少该 SKU | `precio_publico`、`precio_mayoreo`、`caja` 或备注 |
| samsung-oled-s20 | Pantallas Samsung OLED | 不显示真实价格，显示 `Consultar` | 无，App 缺少该 SKU | `precio_publico`、`precio_mayoreo`、`caja` 或备注 |
| samsung-oled-s20-ultra | Pantallas Samsung OLED | 不显示真实价格，显示 `Consultar` | 无，App 缺少该 SKU | `precio_publico`、`precio_mayoreo`、`caja` 或备注 |
| samsung-oled-s21 | Pantallas Samsung OLED | 不显示真实价格，显示 `Consultar` | 无，App 缺少该 SKU | `precio_publico`、`precio_mayoreo`、`caja` 或备注 |
| samsung-oled-s21-plus | Pantallas Samsung OLED | 不显示真实价格，显示 `Consultar` | 无，App 缺少该 SKU | `precio_publico`、`precio_mayoreo`、`caja` 或备注 |
| samsung-oled-s22-plus | Pantallas Samsung OLED | 不显示真实价格，显示 `Consultar` | 无，App 缺少该 SKU | `precio_publico`、`precio_mayoreo`、`caja` 或备注 |
| samsung-oled-s23-plus | Pantallas Samsung OLED | 不显示真实价格，显示 `Consultar` | 无，App 缺少该 SKU | `precio_publico`、`precio_mayoreo`、`caja` 或备注 |
| samsung-oled-s24-plus | Pantallas Samsung OLED | 不显示真实价格，显示 `Consultar` | 无，App 缺少该 SKU | `precio_publico`、`precio_mayoreo`、`caja` 或备注 |
| samsung-oled-s9-plus | Pantallas Samsung OLED | 不显示真实价格，显示 `Consultar` | 无，App 缺少该 SKU | `precio_publico`、`precio_mayoreo`、`caja` 或备注 |

## B. 价格异常但未改价的 7 个产品

这些 SKU 的 Master 和 App 价格一致，但官网 `data/products.generated.js` 当前价格不一致。本轮未改价，只列出差异，等待老板确认是否按 Master/App 修正。

| slug | 当前官网价格 | 当前 App/Master 价格 | 差异金额 | 是否可能是促销价 | 建议处理方式 |
| --- | --- | --- | --- | --- | --- |
| iphone-incell-12promax | 公开 `$220` / 批发 `$210` | 公开 `$250` / 批发 `$240` | 官网低 `$30` / `$30` | 可能是旧价或促销价，但未确认 | 等老板确认；若不是促销价，改成 Master/App |
| iphone-incell-14 | 公开 `$800` / 批发 `$750` | 公开 `$260` / 批发 `$250` | 官网高 `$540` / `$500` | App 有 specialOffer 字段，但官网普通价明显偏高，不像促销价 | 等老板确认；保留促销字段，普通价确认后改成 Master/App |
| iphone-incell-14plus | 公开 `$800` / 批发 `$750` | 公开 `$300` / 批发 `$290` | 官网高 `$500` / `$460` | 不像促销价，疑似匹配到错误价格行 | 等老板确认；确认后改成 Master/App |
| iphone-incell-15plus | 公开 `$300` / 批发 `$290` | 公开 `$330` / 批发 `$310` | 官网低 `$30` / `$20` | 可能是旧价或促销价，但未确认 | 等老板确认；若不是促销价，改成 Master/App |
| iphone-oled-13promax | 公开 `$600` / 批发 `$590` | 公开 `$900` / 批发 `$850` | 官网低 `$300` / `$260` | 可能是旧价或错误匹配，需确认 | 等老板确认；确认后改成 Master/App |
| samsung-incell-s20-plus | 公开 `$500` / 批发 `$480` | 公开 `$550` / 批发 `$520` | 官网低 `$50` / `$40` | 可能是旧价或促销价，但未确认 | 等老板确认；若不是促销价，改成 Master/App |
| samsung-incell-s9-plus | 公开 `$450` / 批发 `$430` | 公开 `$500` / 批发 `$450` | 官网低 `$50` / `$20` | 可能是旧价或促销价，但未确认 | 等老板确认；若不是促销价，改成 Master/App |

## 下一步建议

1. 老板先确认 A 表 14 个产品的公开价、批发价、箱价或备注。
2. 老板再确认 B 表 7 个产品是否保留当前官网价，还是改成 Master/App 价格。
3. 确认完成后，再进入下一轮数据同步。
4. 下一轮同步前先更新 `docs/master-data/products-master.csv`，再运行 `publish-products`。
