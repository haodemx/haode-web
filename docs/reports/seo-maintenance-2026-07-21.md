# HAODE SEO 维护报告 - 2026-07-21

## 任务结论

本轮已完成官网代码侧 SEO 基础维护：meta description、Open Graph、Twitter Card、JSON-LD、sitemap 覆盖和 lastmod 已统一整理。Google Search Console 的提交和索引请求仍需要登录 GSC 后人工执行，不能由本地代码直接完成。

## 本轮已完成

- 产品详情页 meta description 改为短描述，避免把完整产品长文案塞进搜索摘要。
- 静态页面补齐 Twitter Card 关键标签：`twitter:card`、`twitter:title`、`twitter:description`、`twitter:image`。
- 产品页和普通页面补齐或整理 JSON-LD，减少缺结构化数据的问题。
- `sitemap.xml` 按 canonical URL 重新生成，当前包含 176 个 URL，`lastmod` 更新为 `2026-07-21`。
- 新增 `npm run seo-maintenance`，以后可重复执行同类维护；已确认重复执行不会继续改文件。
- 修正 sitemap 检查逻辑：旧别名产品页如果 canonical 已被 sitemap 覆盖，不再误报缺 sitemap。

## 明确未改

- 未改产品主数据。
- 未改价格。
- 未改库存。
- 未替换产品图片。
- 未上传新图片。
- 未运行 `publish-products`。
- 未运行会重写产品数据的 `build-products`。

## GSC 待提交清单

先在 Google Search Console 确认 sitemap：

- `https://haode.com.mx/sitemap.xml`

优先请求索引的 URL：

| 优先级 | URL | 原因 |
| --- | --- | --- |
| P1 | `https://haode.com.mx/` | 首页，主入口 |
| P1 | `https://haode.com.mx/app/` | APP 目录入口 |
| P1 | `https://haode.com.mx/productos/` | 产品总入口 |
| P1 | `https://haode.com.mx/categoria/iphone-incell/` | iPhone INCELL 主分类 |
| P1 | `https://haode.com.mx/categoria/iphone-oled/` | iPhone OLED 主分类 |
| P1 | `https://haode.com.mx/categoria/samsung-incell/` | Samsung INCELL 主分类 |
| P1 | `https://haode.com.mx/categoria/samsung-oled/` | Samsung OLED 主分类 |
| P1 | `https://haode.com.mx/categoria/samsung-tipo-original/` | Samsung TIPO ORIGINAL 主分类 |
| P1 | `https://haode.com.mx/categoria/micas/` | Micas 主分类 |
| P1 | `https://haode.com.mx/categoria/productos-ai/` | Productos AI 主分类 |
| P2 | `https://haode.com.mx/categoria/samsung-plegables/` | Samsung plegables 分类 |
| P2 | `https://haode.com.mx/productos/samsung-z-flip7/` | 新品/重点产品 |
| P2 | `https://haode.com.mx/productos/samsung-z-fold6/` | 新品/重点产品 |
| P2 | `https://haode.com.mx/categoria/oled-diagnostica/` | OLED Diagnostica 分类 |
| P2 | `https://haode.com.mx/producto/iphone-incell-11/` | 代表性 iPhone 产品页 |
| P2 | `https://haode.com.mx/producto/samsung-incell-s24-ultra/` | 代表性 Samsung 产品页 |
| P2 | `https://haode.com.mx/producto/mica-hd/` | 代表性 MICA 产品页 |

## GSC 操作步骤

1. 打开 Google Search Console，选择 `haode.com.mx` 属性。
2. 在 Sitemaps 中提交或重新确认 `https://haode.com.mx/sitemap.xml`。
3. 用 URL 检查工具逐个检查上面的 P1 URL。
4. 如果实时测试通过，点击请求编入索引。
5. P1 完成后再处理 P2。
6. 不要在 GSC 里标记“已收录”，除非 GSC 显示 Google 已索引。

## 本地验证结果

- `npm run seo-maintenance`：通过，第二次重复执行 `htmlChanged: 0`。
- SEO 专项扫描：通过；公开 SEO 页面无缺 title、无缺/过短/过长 description、无 canonical 域名错误、无缺 OG image、无缺 Twitter meta、无缺/无效 JSON-LD；sitemap 无重复 URL。
- `git diff --check`：通过。
- `npm run build`：通过；`validate-products-sync` 无错误，`haode-quality-check` 无错误。
- `npm run browser-test`：通过，1 项 Playwright 检查通过。
- 产品主数据文件未变化：`data/products.generated.js`、`app/products.json`、`docs/master-data/products-master.csv`。

## 剩余风险

- Google 收录速度不可由代码保证，提交后通常还需要等待 Google 抓取。
- GSC 需要账号权限，本地无法替代登录后的提交动作。
- 如果本分支未合并到 Pages 发布分支，线上不会立即使用本轮 SEO 文件。
