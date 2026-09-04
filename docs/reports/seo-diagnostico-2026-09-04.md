# iPhone 诊断屏 SEO / GEO 优化与后续事项

日期：2026-09-04。任务类型：现有分类页 SEO/GEO 优化，不新增产品或类别。

## 已完成

- 主词：`pantallas diagnóstico para iPhone`；自然覆盖 `pantallas diagnosticables para iPhone`。来源为老板确认的墨西哥客户叫法及提供的搜索截图，不宣称已取得搜索量数据。
- 沿用 `/categoria/oled-diagnostica/`，更新标题、描述、H1、社交摘要和 CollectionPage；保留 canonical、产品分类键和原有产品卡。
- 增加静态购买指引、3 个已有型号详情入口、可见面包屑及 4 组 FAQ；FAQPage 与可见问答逐字一致。
- 解释本页是屏幕配件目录，不是手机诊断模式教程；不把 autoprogramables、sin trasplante、sin mensaje de aviso、True Tone 当成全系列承诺。
- 从 iPhone OLED 分类及官方 AI 信息页加入明确内链。没有为同义词新建重复落地页。
- 未改产品名称、SKU、价格、库存、图片、WhatsApp 号码、产品/App 数据，也未重写此前观察中的 Samsung OLED、App、hydrogel 或 XR 页面。

## 验收证据

| 项目 | 状态 | 证据 |
| --- | --- | --- |
| 关键词、canonical、内链、声明边界 | passed | `npm run test:target-seo-geo` 7/7，其中新增 3 项诊断屏检查 |
| 构建与现有静态检查 | passed | `npm run build` 退出 0；质量检查 errors=0、warnings=0。产品同步中的历史别名仍为既有 report-only 通知 |
| 完整本地浏览器回归 | passed | `BASE_URL=http://127.0.0.1:4173 npm run browser-test -- --workers=4 --reporter=line`：180/180 |
| sitemap URL | passed | 本地逐个请求 227 个网址，全部 HTTP 200 |
| 诊断屏实际渲染 | passed | 浏览器渲染 24 张目录产品卡、4 组 FAQ、CollectionPage/BreadcrumbList/FAQPage；无已加载破图 |
| 手机布局 | passed | 390×844，横向溢出 0；已检查截图 |
| 搜索空状态 | passed | 输入不存在型号后产品卡为 0，有清除/询价入口，购买指引和 4 组 FAQ 保留 |
| 生产抓取基础 | passed | 当前线上 robots 允许公开路径；目标页 index,follow、自指 canonical；线上 sitemap 含该 URL |
| Google 收录、排名、曝光、AI 引用 | not verified | 当日 10:03 的诊断记录为 `reauthorization_required`，不能把缺失数据当作 0 |
| Google Rich Results Test / Schema Validator | not verified | 已做本地 JSON 解析、可见内容匹配和浏览器渲染验证，未运行外部验证器 |
| 新版生产页面 | not verified | 本次不部署，线上仍为旧标题 |

首次未指定 BASE_URL 的浏览器回归混用了线上与不同本地默认端口，出现版本差异后停止。上表只将明确指定本地地址的完整重跑记为通过。

## 下一步优先级

1. **发布前核对版本和联系号码。** 当前工作分支的号码为 `525645866014`，2026-09-04 实时读取的线上诊断屏页为 `523326684296`。本任务保留原分支号码，不能用旧分支整页覆盖生产页；经授权集成时仅合入本次内容/测试差异，并保留生产确认的联系方式。不要整分支覆盖当前生产版本。
2. **恢复 Google 只读授权。** 老板完成 Google 登录/授权；再用 Search Console URL 检查核实收录、Google 选择的 canonical、最近抓取和渲染情况。授权失效不代表网站未收录。检查发布状态不等于已授权修改 Google Cloud 设置。
3. **授权上线后建立关键词基线。** 按 Mexico + 目标 URL 查看 `pantallas diagnostico iphone`、`pantallas diagnóstico para iPhone`、`pantallas diagnosticables iphone` 的曝光、点击、CTR、平均位置；比较相同长度、数据完整且包含重新抓取的窗口。不要承诺几天上首页，也不要每天因未上榜重复改标题。
4. **补真实技术证据。** 由店员/产品负责人提供具体 SKU、屏幕版本、iPhone 型号、iOS 版本、安装/编程条件及实测图片或视频，确认是否支持免移植、无提示、True Tone 等。确认后再丰富对应产品页，不复制竞争对手结论。
5. **外部曝光需单独授权。** 真实实测内容可用于品牌社交账号、Google 商家资料及客户教学，指向同一分类 URL；本次未发送、上传、发布或提交 sitemap。

## GEO 边界与依据

GEO 重点是可抓取的有用正文、明确实体/产品边界和真实证据，不是特殊标签或保证被 AI 推荐。Google 表明 AI 搜索沿用基础 SEO 要求，没有必需的特殊 schema；FAQPage 的加入不等于取得富结果或 AI 引用。

- [Google：AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- [Google：General structured data guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)

使用：superpowers、guidelines、karpathy-rules、seo-audit、schema、code-review、testing-qa、haode-browser-qa、playwright；copywriting 用于最终文案复核。未使用 devops-deploy（未授权部署）、firecrawl（未抽取竞品/供应商页面）、媒体制作或外部发布技能。

代码修改、分支提交/推送、生产部署和 Google 效果是四种独立状态；最终提交及推送结果以本次任务交付为准。无关报告和用户工作区改动保持原样。
