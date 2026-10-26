# HAODE 官网获客一期：隔离候选交付（2026-10-26，America/Mexico_City）

本地实现与验证完成；这份候选没有合并或部署。Samsung 是本轮重点，iPhone、水凝膜与设备作为并列业务入口；已有 AI 眼镜、相机和其他商品保留。价格、库存、图片、联系方式、ERP 业务数据未改。

## 版本与授权

- 官网仓库：`git@github.com:haodemx/haode-web.git`。原目录 `seo-step-continuation` 有其他修改，未切换、清理或覆盖。
- 隔离分支：`feat/website-acquisition-iphone-samsung-hydrogel`；源基线 `41419154c049c04918dab66cfe06bad270e66165`，与开始时远端 main 一致。
- 仅只读审计、隔离修改、本地验证及可审核提交。本轮无 main 合并、生产部署、生产写入、客户消息、上传或付费。
- 控制面：`HAODE-WEB-ACQUISITION-PHASE1-20261026`，当前 Worker 唯一认领；独立 Master 验收单列，不以自审代替。

## 阶段 0：当前基线

| 部分 | 核查结论 | 本轮处理 |
|---|---|---|
| 首页 | 已存在但需要优化 | 增加三条并列获客入口；移除水凝膜“所有型号”概括 |
| iPhone 分类与型号 | 已存在且可访问；跨质量查找需优化 | 批发页按实际型号归组，保留 Pro/Pro Max/组合型号及包装版本 |
| Samsung S/Ultra/Note | 已存在但需要优化 | 34 个型号、50 条真实参考，按型号显示实际质量选择 |
| Z Flip/Z Fold | 已存在但需要优化 | 单独 9 个代际型号、13 条参考，排除直板屏 |
| 水凝膜批发 | 已存在且验证通过 | 复用已验四款耗材、X200T 与询价；不重复开发 |
| OEM | 已存在且 HTTP 可访问 | 首页直达既有 OEM 页面；不增加未确认规格与 MOQ |
| X200T | 已存在且验证通过 | 保留原价格与询盘流程 |
| 联系/WhatsApp | 已存在，详情来源信息需补齐 | 详情询价增加产品 canonical；新索引询价携产品/参考/质量/产品页/来源页 |
| robots/canonical/sitemap | 当前 231/231 线上 URL HTTP 200；源码 canonical 231/231 匹配 | 无证据缺陷，不重写 URL 或 sitemap |
| GA4/GSC | 已配置且只读数据可用 | 复用当天 28 天数据，另存采集 90 天 |
| Google 实际索引/GBP 后台 | 本轮没有登录核查 | NOT RUN；HTTP 200 不等于已索引，代码含关联不等于 GBP 审核通过 |
| ERP | 公共只读端点单独检查；业务记录不读取/写入 | 本地询盘回执测试使用隔离响应；不测试真实生产提交 |

证据目录：`HAODE-AUTOMATION/OUTPUT/WEBSITE/2026-10-26/acquisition-phase1/`。`live-baseline.json`、`sitemap-audit.json`、`erp-readonly-check.json` 分开记录公开读取。

## 实际修改

- `index.html`：iPhone、Samsung 高端屏、水凝膜/设备三条并列入口；折叠屏和 OEM 直达；保留原 AI 产品展示。水凝膜改为具体型号需确认。
- 三个现有批发页：静态可抓取型号目录，渐进增强搜索、系列筛选、无结果提示、重置。禁用 JavaScript 仍可查看质量并询价。
- Samsung 示例：S24 Ultra 有 INCELL FHD C/M、1:1 AMOLED PREMIUM C/M、TIPO ORIGINAL C/M 三条；S24 只有其实际 INCELL 条目。不会把候选质量集合套给全部型号。
- iPhone 目录同时复用 INCELL、OLED、OLED Diagnóstica 原参考。不把名称归组当作不同 SKU 可替代的证明。
- `products.js`：现有详情询价增加准确产品页面 URL，原数量/质量/来源机制复用。
- 新目录生成器接入既有 SEO 刷新入口，Build 检查生成页与当前产品源一致，避免手工索引漂移。
- 保留原 Title、Meta、canonical、结构化数据与 FAQ 的正确部分；没有批量造页面或增加 SEO 插件。

## 价格与素材差异：只报告

`product-price-audit.json`：186 个商品的已命名静态价格/schema 对照没有发现差异；现有客户价契约同时验证网站/App。

首页发现一处独立差异：`iphone-incell-xr` 首页显示“Caja $155 MXN”，当前产品源 Caja 为 `$145 MXN`。这是普通 XR，不是 Bolsa Protectora。**未修改任何一端**；需要 Owner 确认应采用的首页档位/金额后才能修复。其他带价首页卡片检查通过。

Note 10 Lite、Note 20、S10 Lite 的既有主图使用系列通用素材，型号专属素材为 `ASSET MISSING`。本轮不替换图片，也不生成冒充真实产品的图。

## 搜索与转化数据

28 天复用 2026-10-26 11:10 CDMX 的既有只读 API 采集，周期 2026-09-28—2026-10-25；90 天本轮独立采集，周期 2026-07-28—2026-10-25。二者范围重叠，不作环比。

| 指标 | 28 天 | 90 天 | 口径 |
|---|---:|---:|---|
| GSC 点击 | 130 | 357 | property 总计，不用 query 样本求和 |
| GSC 曝光 | 3,366 | 8,138 | 真实 API 来源 |
| CTR | 3.86% | 4.39% | 点击/曝光 |
| 平均排名 | 8.84 | 9.22 | GSC 平均值 |
| GA4 自然搜索 sessions | 32 | 162 | 访问次数，不是人数 |
| 自然搜索互动 sessions | 22 | 106 | 现有报告定义 |
| 自然搜索浏览 | 98 | 461 | screenPageViews |
| WhatsApp 联系事件 | 35 | 133 | 旧 contact/generate_lead 口径，非发送/成交 |
| 明确 iPhone 页面联系事件 | 9 | 28 | 按路径归类 |
| 明确 Samsung 直板屏页面 | 2 | 10 | 按路径归类 |
| 明确折叠屏页面 | 1 | 1 | 独立归类 |
| 明确水凝膜/X200T 页面 | 3 | 8 | 按路径归类 |
| 其他或无法分配业务线 | 20 | 86 | 含 App/首页等，不强行归因 |

高曝光查询与落地页见 `search-opportunities.json`：例如“refacciones para celulares”28 天查询页样本 29 曝光/2 点击；“refacciones para celulares mayoreo”24/2。Samsung OLED 分类 157 曝光/1 点击，水凝膜机器分类 210/3。样本不能冒充关键词搜索量，不能由低 CTR 直接推断原因或销售效果。

28 天自定义事件有 ViewProduct 56、WhatsAppClick 34、Lead 1；90 天分别 59、36、1。原 contact、generate_lead 与这些新事件代表重叠旅程，**不能相加**。90 天旧 whatsapp_click 仍有 34，保留历史口径差异。

GA4 有 Lead 事件不证明线索有效或实际成交；有效线索、员工跟进、成交闭环没有本轮可核验证据，标 NOT RUN。网站真实 Purchase 上报为 NOT CONFIGURED；不把点击、报价回执或 GA4 keyEvents 当销售收入。

90 天自然搜索首次取数因本地 Python 模块搜索路径缺失失败；原失败日志保留。补入现有脚本目录后，只重新读取失败的 GA4 自然搜索报告，成功 23 行，见 `analytics-90/ga4-organic-recovery.json`。原生成周报保留其失败状态，最终以恢复文件补充，未重新采集全部来源，也未修改 Google/OAuth 配置。

## 验证与限制

- PASS：新增 5 项 Node 契约；初版 6 项浏览器交互及最终新增首页覆盖；最终完整浏览器回归 **371/371**。
- PASS：`npm run build`；修复询价文案漏项后全构建通过，最终首页变化后的 Build 再通过。`build-final.log` 为最终完整构建证据。
- PASS：最终生成目录/公开包 8 项测试、JS 语法、`git diff --check`；仅末尾空白规范化后重建公开包，不重复无关全套。
- PASS：桌面/手机、空结果、重置、禁 JS、质量不串型号、完整询价、同意/拒绝分析、单点击 contact 一次、点击不产生 Lead/Purchase、原 App 与水凝膜等回归。
- PASS：保护文件与基线相同：产品源、App 产品数据、价格主文件、sitemap、三套原分析脚本。客户隐私、聊天文本没有进入新增分析参数；未增加第二套埋点。
- PASS：线上 231 个 sitemap URL HTTP；主要页面 HTTP/标签基线；本地媒体/移动端原浏览器检查。当前部署仍是旧版本，此候选线上效果 NOT RUN。
- 性能：新 CSS/JS 很小，无新增产品图片；gzip 测量首页 7,257→7,559B，Samsung 批发页 3,083→5,882B，iPhone 3,025→6,931B，折叠 2,992→4,339B。原性能浏览器回归通过；没有声称真实用户 CWV 或排名已提升。
- Lint：NOT CONFIGURED（项目无独立 lint script），执行现有 Build/Node 语法与契约检查。
- 独立 Master 验收：待独立记录，不能用本地自审替代；远端 exact-HEAD CI 未运行。

## 自审与交付边界

需求轴：型号、质量、来源询价、三条业务入口、折叠独立、iPhone 与水凝膜保留、技术 SEO 与分析口径均有对应证据。未确认的质量性能、素材、业务成交和正式价格未擅自处理。

安全/标准轴：改动集中于现有页面和可维护生成器；不改受保护产品数据，不覆盖其他窗口，不产生真实 ERP 测试单，不发送 WhatsApp，不调用付费模型。

任务类型：官网 SEO/获客体验开发与只读分析。实际 Skills：superpowers、guidelines、karpathy-rules、haode-engineering、seo-audit、code-review、testing-qa、haode-browser-qa、haode-product-control-center、copywriting、cro、product-marketing（已有产品事实/定位核查）。devops-deploy 只读取既有推送目标规则；本轮不启用部署。Firecrawl、生成媒体、额外 GEO 工具未使用：没有竞品抽取或新素材任务，也无需增加工具。

建议下一阶段：Owner 确认 XR 首页档位差异；补三款真实型号素材；独立验收精确候选后另走远端 CI/PR 与生产发布授权。上线后再观察完整周期的型号询价和有效线索，不把一期技术交付当作销售增长证明。
