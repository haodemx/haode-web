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


## 2026-10-26 Schema 本地续查（覆盖本轮状态）

沿用原任务与隔离工作树，基线 b4fff2979ef5fada8bd09fb4e2288fd8036346bb；前两轮原 Master 验收历史保留。本轮使用项目 schema Skill，复现公开 ERP XR 描述中的旧价格仍回流到正文的问题，已保护已确认描述；运行时 Product 描述同步可见正文，Offer URL 使用正式产品路由。价格值、库存、图片与产品源未变。

PASS：Build；14 项定向浏览器测试；全量 385 PASS / 0 FAIL / 0 SKIP / 0 FLAKY；231 个本地构建 URL 200。231 页静态 JSON-LD 含 187 Product、204 BreadcrumbList、78 Organization，逐条已提供报价与源匹配，面包屑与组织标识检查通过。原始 b4 两个失败复现及修复后日志全部保留。未把可选评价、认证或库存属性补成虚假事实。

本地修复提交及当前唯一 Master 最终结论，以冻结证据目录 `HAODE-AUTOMATION/OUTPUT/WEBSITE/2026-10-26/acquisition-phase1/schema-audit/` 下 `SCHEMA_PACKET.json`、`Schema中文验收报告.md` 和 Master 当前轮验收凭据为准；此提交内的复核状态是提交时快照，不以历史验收替代新门。远端 CI、Google 在线验证器及候选生产效果 NOT RUN；独立 lint NOT CONFIGURED。本轮不推送、不建 PR、不合并、不部署。既有首页 XR $155 差异与三款 Samsung 真实素材审批仍未修改。


## 2026-10-26 已授权 XR 首页修正与开发分支 PR 交付

Owner 本轮明确授权：将标准 XR 首页卡片 Caja155→145、推送既有开发分支、创建 Draft PR 并运行真实远端 CI；不授权合并、部署或 ERP 生产价格/成本/库存写入。原 Master 对 e5859859 的 PASS/CLOSED 保留，不重开或创建重复验收任务；该历史验收不冒称覆盖新的价格展示提交。

准确对应：网站 iphone-incell-xr，ERP公开SKU IP-XR-INCELL-FHD；已确认工作簿2026-09-24、03 IPHONE INCELL第12行，质量INCELL FHD C/IC、Caja145。仅首页标准卡片一行改为145，Bolsa独立产品仍Caja135，原产品源/App/图片/其他配置价格不变。此前报告中的首页价差待授权描述为历史快照，本轮已获授权并修正候选；生产页面尚未部署。

新增6项浏览器回归：390/1440px × 空ERP/旧报价ERP/503，验证真实目录请求发生、标准首页/详情/JSON-LD145、Bolsa135与返回首页不回流。修复前390px旧ERP用例实际FAIL155≠145，修复后20项定向全PASS；原只读价格检查3PASS。当前Build PASS，全量391PASS/0FAIL/0SKIP/0FLAKY，231页Schema仍为187Product/204BreadcrumbList/78Organization且无错误。所有日志保留于本地xr-pr-delivery证据目录。

三款Samsung主图仍待真实SKU/等级/权利确认，0替换；不生成假实物。Google在线验证NOT RUN。原始e585独立验收证据、风险与回滚边界仍保留；当前提交/PR链接与远端真实CI结果以本轮后续冻结交付报告为准，此处为提交前的本地验证快照，不把CI启动当PASS。


## 2026-10-26 PR #110 非严重 Schema 提示事实核对

本轮任务类型：结构化数据事实核验及最小修复。基线为 d8d88837b8c8648e2808f08f02c09a27eddf6251；沿用原隔离工作树和 Draft PR #110，原 Master 的 PASS/CLOSED 不重开，本轮结果不冒称新的 Master 验收。

PASS：已批准的固定门店地址来自本工作树 AGENTS.md「固定门店地址 / Google Business Agent」及 docs/agents/GOOGLE_BUSINESS.md「固定门店地址」：Eje Central Lázaro Cárdenas 87, Piso 2, Local 225, Colonia Centro, Cuauhtémoc, 06070, Ciudad de México, México。231 个 canonical 页有 75 个现有 LocalBusiness；3 个已完整，72 个缺 streetAddress / postalCode。本次仅为后 72 个补这两个已批准字段，原 locality / region / country 保留。其中 1 个旧节点无 @id，通过同名 HAODE México、官网根 URL 与既有 CDMX 门店照片确认；未新建商家或新增 @id。

NOT CONFIGURED / 待确认：未发现经批准的门店整体 priceRange；既有 geo-seo 和首页技术合同也要求缺省。不能把个别 SKU 的 $145、价格最小/最大值或示例 $$ 当作门店整体价位。保留 Google 可选提示。XR 本地商家另有 telephone 非严重提示；当前公开销售 WhatsApp 不在本次核对中扩展为新门店语音服务承诺，保持原状。Product 的 review、aggregateRating、availability，以及 Merchant Listings 的库存/配送/退货等可选字段，缺乏对应批准数据时同样不补造。

独立于修改过程的 Git 语义复核 PASS：72 页仅新增地址两字段，其他 JSON-LD 完全一致；正文与非 Schema HTML 不变，Product、Offer、BreadcrumbList、Organization 未变；首页、商品 JS、产品源、App JSON、sitemap、Feed 均与基线逐字节相同。Feed 审计包含商品 HTML 全文哈希，因地址变更同步更新其 structured_data 指纹；未修改任何商品或私有数据。

当前本地验证 PASS：新地址合同先真实 FAIL（72 页不完整），修复后技术合同 17 PASS / 0 FAIL / 0 SKIP；Build PASS；使用原 4188 构建服务全量浏览器 391 PASS / 0 FAIL / 0 SKIP / 0 FLAKY；231 页原构建与源逐字节一致、HTTP 200、canonical 匹配、JSON-LD 可解析，75 个门店实体地址均完整。首次 Build 因全文审计指纹过期失败，更新指纹后复测通过；首次浏览器运行遗漏 BASE_URL 导致默认端口连接失败，已中止并以正确原服务重跑，未作为通过证据。

在线候选完整 XR HTML：Google Rich Results 检测 6 项有效内容，原组织 streetAddress / postalCode 缺失提示消除；单独 LocalBusiness 识别有效，仍有 priceRange / telephone 两项可选提示。Product 仍有效，Google 实际读取 Caja 145 MXN，6 项非严重提示为 review、aggregateRating、4 档 availability。Schema.org 为 6 项数据、0 错误 / 0 警告。Google 结果：https://search.google.com/test/rich-results/result?id=v6Lgf9vXwRqJ3CWKaPNcnw 。这些是完整候选代码验证，不是生产部署或 Google 搜索展示承诺。首页源码未变，其前轮完整 Google PASS 可按同文件哈希复用，未重复提交相同输入。

原始证据位于 HAODE-AUTOMATION/OUTPUT/WEBSITE/2026-10-26/acquisition-phase1/schema-remaining-facts/：ADDRESS_CHANGE_PROOF.json、SELF_REVIEW.json、LOCAL_231_SCHEMA_HTTP.json、address-contract-before.log、seo-technical-after.log、build.log、build-retest.log、browser.log、browser-retest.log 及 Google / Schema.org 原始截图与文本。此处为提交前本地验证快照，后续提交 SHA、推送和精确 HEAD 远端 CI 的最终结论以冻结交付回执及 PR 描述为准，不能用旧 d8d88837 CI 替代。

Samsung 三款真实图片继续待补，0 替换；Google 可选未知字段待真实资料。生产效果 NOT RUN，本轮不合并、不部署、不写 ERP。若回滚，仅 revert 本轮地址补齐提交并重新 Build / CI，不修改受保护业务数据。

实际 Skills：schema、superpowers、guidelines、karpathy-rules、haode-engineering、code-review、testing-qa，沿用既有产品事实与价格保护规则。未使用 Firecrawl / 生成媒体：无竞品抽取或图片制作；devops-deploy 未执行部署：本轮明确禁止。无新增依赖、无重复验收任务。
