# HAODE 产品同步低风险修复计划

日期：2026-07-07
分支：`fix/public-product-sync-safe-20260707`
依据报告：`docs/reports/product-price-listing-audit-2026-07-07.md`

## 执行边界

本轮只做低风险产品同步修复：不进入 ERP，不改数据库，不部署线上，不运行 `publish-products`，不强行 `build-products`，不自动改价格，不自动补价，不自动上架缺价产品。

## A. 可以本轮直接修复

满足条件：已有明确公开价与批发价；不属于 14 个缺价 SKU；不属于 7 个异常价 SKU；主图存在且不在 4 个图片问题中；已有官网或 App/Master 安全数据；问题属于路由、canonical、sitemap 覆盖、分类 slug 或 App 官方页链接。

| slug | 安全依据 | 本轮处理 |
| --- | --- | --- |
| `aimb-g5-ai-sports` | Master+App+官网均存在，价格一致，图片存在；当前 `producto/<slug>/` 是 noindex 重定向到 canonical 公开页 | 不把 noindex 重定向页加入 sitemap；改为让验证脚本识别 canonical 已被 sitemap 覆盖，并在 App 详情页直连 canonical 公开页 |
| `funda-magnetica-17-pro-max` | Master+App+官网均存在，价格一致，图片存在；当前 `producto/<slug>/` 是 noindex 重定向到 canonical 公开页 | 不把 noindex 重定向页加入 sitemap；改为让验证脚本识别 canonical 已被 sitemap 覆盖，并在 App 详情页直连 canonical 公开页 |
| `funda-premium-17-pro-max` | Master+App+官网均存在，价格一致，图片存在；当前 `producto/<slug>/` 是 noindex 重定向到 canonical 公开页 | 不把 noindex 重定向页加入 sitemap；改为让验证脚本识别 canonical 已被 sitemap 覆盖，并在 App 详情页直连 canonical 公开页 |
| `haode-ai-g3-smart-glasses` | Master+App+官网均存在，价格一致，图片存在；当前 `producto/<slug>/` 是 noindex 重定向到 canonical 公开页 | 不把 noindex 重定向页加入 sitemap；改为让验证脚本识别 canonical 已被 sitemap 覆盖，并在 App 详情页直连 canonical 公开页 |
| `haode-ai-w610-smart-glasses` | Master+App+官网均存在，价格一致，图片存在；当前 `producto/<slug>/` 是 noindex 重定向到 canonical 公开页 | 不把 noindex 重定向页加入 sitemap；改为让验证脚本识别 canonical 已被 sitemap 覆盖，并在 App 详情页直连 canonical 公开页 |
| `s1-ai-classic` | Master+App+官网均存在，价格一致，图片存在；当前 `producto/<slug>/` 是 noindex 重定向到 canonical 公开页 | 不把 noindex 重定向页加入 sitemap；改为让验证脚本识别 canonical 已被 sitemap 覆盖，并在 App 详情页直连 canonical 公开页 |
| `w630-ai-pro` | Master+App+官网均存在，价格一致，图片存在；当前 `producto/<slug>/` 是 noindex 重定向到 canonical 公开页 | 不把 noindex 重定向页加入 sitemap；改为让验证脚本识别 canonical 已被 sitemap 覆盖，并在 App 详情页直连 canonical 公开页 |
| `x200t-cortadora-micas` | App/Master 有价格和图片，已有公开静态页 `producto/x200t-cortadora-inteligente-de-micas/`，但官网产品数据缺 SKU | 只给 App 详情页增加“Página oficial”到现有静态页；不新增官网产品数据，不视为完整上架 |
| `gafas-ai` 分类 slug | 官网产品数据使用 `gafas-ai`，现有公开分类是 `categoria/gafas-inteligentes-ai/` | 新增 `categoria/gafas-ai/` noindex 重定向到 canonical 分类页，补齐内部 slug |

## B. 不能本轮修复，必须老板确认

这些产品涉及缺价、异常价、促销风险或价格来源冲突，本轮完全不改价格、不改 fallback、不改 JSON-LD price。

| 类型 | SKU |
| --- | --- |
| 14 个缺价 SKU | `iphone-oled-12mini`, `iphone-oled-13mini`, `iphone-oled-15plus`, `iphone-oled-16`, `iphone-oled-16plus`, `samsung-oled-note-9`, `samsung-oled-s20`, `samsung-oled-s20-ultra`, `samsung-oled-s21`, `samsung-oled-s21-plus`, `samsung-oled-s22-plus`, `samsung-oled-s23-plus`, `samsung-oled-s24-plus`, `samsung-oled-s9-plus` |
| 7 个异常价 SKU | `iphone-incell-12promax`, `iphone-incell-14`, `iphone-incell-14plus`, `iphone-incell-15plus`, `iphone-oled-13promax`, `samsung-incell-s20-plus`, `samsung-incell-s9-plus` |

## C. 不能本轮上架，必须补图

| slug | 原因 | 本轮处理 |
| --- | --- | --- |
| `samsung-incell-note-10-lite` | App 图片是 placeholder / 通用图 / 待确认图 | 不替换，不上架官网；等老板提供真实图片 |
| `samsung-incell-note-20` | App 图片是 placeholder / 通用图 / 待确认图 | 不替换，不上架官网；等老板提供真实图片 |
| `samsung-incell-s10-lite` | App 图片是 placeholder / 通用图 / 待确认图 | 不替换，不上架官网；等老板提供真实图片 |
| `samsung-original-note-20-ultra` | App 图片是 placeholder / 通用图 / 待确认图 | 不替换，不上架官网；等老板提供真实图片 |

## D. 暂时只记录，不处理

| 范围 | 原因 |
| --- | --- |
| Samsung Original / Z Flip / Z Fold 等 App-only 产品 | App 有价格，但官网没有产品数据和完整详情页；属于新增官网上架动作，本轮不自动创建 |
| 电池类 / 计划中产品 | 未见正式公开目录或需要业务确认 |
| 需要 ERP 库存或数据库确认的产品 | ERP/POS 正在维修，本轮禁止进入 ERP |

## 本轮预计修复内容

- 更新 `scripts/validate-products-sync.js`：redirect 产品如果 canonical URL 已在 sitemap，视为 sitemap 已覆盖，避免把 noindex 重定向页误报为缺 sitemap。
- 新增 `categoria/gafas-ai/index.html`：noindex 重定向到 `categoria/gafas-inteligentes-ai/`。
- 更新 `app/app.js`：给已有 canonical 公开页的安全产品补“Página oficial”链接。
- 生成本计划和最终修复报告。

## 本轮明确不做

- 不修改任何产品真实价格。
- 不用 Excel 价格覆盖官网/App/Master。
- 不补 14 个缺价 SKU。
- 不处理 7 个异常价 SKU。
- 不替换图片，不上传图片。
- 不新增官网产品数据，不新增 App 产品。
- 不运行 `publish-products`。
