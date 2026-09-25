# HAODE ChatGPT Ads、公开候选 Feed 与转化追踪

状态：**本地准备；未配置外部 Ads Manager；未发布、未花费。** 本目录保存项目 B 的交付合同。候选 feed 不是平台合规上传文件，不可把本次生成成功当作平台接入成功。

2026-09-24 收尾复核见 `feed-closeout-audit.md` / `feed-closeout-audit.json`：146 个候选与客户版、老板版工作簿逐项映射；156 行中明确排除 10 行，没有扩充 feed。官网、App、结构化数据已 146/146 与当前客户版四档销售层级一致；14 项物理缺图，另有 6 项现有主图明确 QC 失败并被候选 feed 拒绝，因此 feed 只保留 126 条图片链接、图片阻塞共 20 项。Menudeo 价已进入本地候选 feed，库存、网站图片和平台状态没有改动。

用户确认 2026-09-24 客户版为本次新价格来源。官网、App 与结构化数据同步四档销售价；本地候选 feed 只导出 Menudeo 价。Mayoreo、Caja、VIP 继续作为人工报价档，不触发自动折扣；审计报告保持脱敏，不列出具体价格数值。

## 范围与数据流

本线仅改变官网广告/feed/tracking、测试与交付说明。复用落地页另用独立 ad-landing.css 修正两页桌面图片与文字重叠和 Logo 尺寸，不替换图片或文案。未修改 ERP、Owner Agent、CRM、Automation 或长期 checkout；没有改变产品源、价格、库存、图片、保修、兼容性、联系方式。基础版本是 `262994f53eaace6dd28ebc0f19176a3fc280c4aa`；目标功能分支为 `feat/chatgpt-ads-feed-tracking-20260924`。

```text
官网公开 data/products.generated.js + 已存在 canonical 产品页 + sitemap + 原公开主图路径
  → 确定性生成器（白名单字段，不读取私密 ERP）
  → data/marketing/chatgpt-product-feed.json（候选，不能直接上传）
  → 未来人工完成价格/素材/品牌/地区/账户 gate
  → 按账户已注册格式生成和校验平台上传文件（本次未执行）

真实页面/产品渲染/WhatsApp 点击/现有 ERP 登记成功回调
  → 同时取得 analytics 与 advertising 同意
  → 本地 HaodeConversions API、haode:conversion 事件
  → 纯字段映射函数（准备）
  → 未来已授权 Pixel 或服务端 Conversions API（本次未配置）
```

公开数据路径审计见 `public-source-audit.json`。官网公开源有 186 个产品。现有页面与 App 还读取 `https://erp.haode.com.mx/api/public/catalog`、`https://erp.haode.com.mx/public-stock.json`，当前两者各 252 条；这些接口用于只读字段/可用性审计，**没有成为本 feed 的导出源**。私密 ERP 库存、成本、供应商、客户、财务和订单数据不读取、不导出。

公开 catalog 字段包括 `sku/slug/public_name_es/brand/category/quality/model/description_es/image_url/public_price_mxn/public_price_tiers/price_status/sales_available/stock_status/stock_label/pickup_available/delivery_available/updated_at`。这些字段存在不等于所有值可以公开承诺。官网的 `priceSource/sourceRows` 等来源细节不进入候选投放数据。

## 候选 feed 合同

- 生成：`npm run feed:chatgpt`；校验：`npm run test:chatgpt-ads`。收尾审计契约另由 `npm run test:chatgpt-feed-closeout` 校验。无网络依赖，无 ERP 认证参数。
- 146 条：Pantallas 141、Hydrogel 4、X200T 1。其余公开品类不在本次优先 feed 中。
- `id` 使用现有官网产品 id，排序稳定，不使用 SKU 猜测、行号、价格或随机值构造身份。
- `title` 原样取现有公开名称；`description` 是名称加询价指引，不复制旧描述里可能嵌入的静态价格或承诺。
- `link` 为现有 canonical `/producto/{id}/`，必须同时存在于 sitemap。
- 官网源有 132 条原公开主图路径与本地 SHA256，14 条物理缺图。逐图 QC 明确拒绝其中 6 条错型号/促销主图，因此生成的 feed 为 126 条 `existing_public_asset`、14 条 `asset_missing`、6 条 `asset_rejected`。无替代图、无重绘、无素材上传；原站使用证明与新广告素材审批是不同状态。
- 所有候选使用 2026-09-24 客户表确认的 Menudeo 价，格式为 `{amount, currency: "MXN"}`，`price_status:confirmed_retail_2026-09-24`。Mayoreo、Caja、VIP 不进入该单价字段。
- 所有 `availability:unknown`、`availability_status:not_live_verified`；未知不表示在售或售罄。静态 `ask_stock`、App 的旧 `disponible` 标记、接口可用都不构成实时库存承诺。
- 所有 `platform_ready:false`。平台直接上传准备好：**0 条**。价格门槛已解除；仍有实时库存、品牌映射、广告素材审批和账户注册门槛。iPhone/Samsung 可能表示适配对象，不能自动当作原厂制造商品牌。
- `candidate-feed.schema.json` 是 HAODE 本地合同；`validateFeed` 与测试校验身份、字段和缺失语义。它不是 OpenAI 官方 schema。

公开可访问性审计共 278 个唯一页面/主图链接，全部 HTTP 200。官网源与基线有一处画廊数组差异：MICA HD 的画廊图已移除，主图未变；候选 feed 不导出画廊。审计只是当时的快照，投放前必须重新验证价格、素材与链接。

## OpenAI 字段映射与外部门槛

2026-09-24 查阅官方文档：[产品文件规范](https://developers.openai.com/commerce/specs/file-upload/products)、[Ads Product Feeds](https://developers.openai.com/ads/product-feeds)。以下是本地映射计划，不是已注册或可接受的上传证明。

| 本地候选字段 | OpenAI 标准格式 | 经平台确认的 Google 兼容格式 | 当前处理 |
| --- | --- | --- | --- |
| id | item_id | id | 使用现有官网 id |
| title / description | 同名 | 同名 | 来自公开名称及询价指引 |
| link | url | link | 原 canonical |
| image_link | image_url | image_link | 缺图为空；投放前素材批准 |
| price | price | price | 已确认 Menudeo MXN；外部格式待账户注册后转换 |
| availability | availability | availability | 本地 unknown；兼容格式不可用 unknown |
| category / priority_group | 仅已注册的 ads_metadata 键 | 仅已支持列 | 不自创平台 targeting 字段 |
| 品牌/销售方 | brand / seller_name | brand / 注册商户名称 | 品牌语义人工核实；销售方 HAODE |

标准 OpenAI 格式可表达未知库存，但售价是必填货币值；Google 兼容格式的库存枚举不同。格式、广告资格、MX 市场和 MXN 币种必须通过当前账户注册确认。没有用国家字段、文件扩展名或资格 flag 代替接入批准。当前不产生伪合规 CSV，也不调用上传/Delta API。

## 转化 API 与事件状态

入口由现有 `analytics.js` 加载 `conversion-tracking.js`，使用当前 `HaodePrivacy` 选择，默认拒绝。**必须 analytics=true 且 advertising=true 才记录广告转化。** 不加载 OpenAI SDK、不创建 Pixel、不发送广告数据，也不把新转化队列混入已有 GA4 队列。

| 事件 | 本地状态 | 触发证据 | 平台映射准备 |
| --- | --- | --- | --- |
| ViewProduct | IMPLEMENTED | 官网已解析的产品详情 / App 产品渲染；重渲染去重 | contents_viewed / contents |
| WhatsAppClick | IMPLEMENTED | 已启用的真实 WhatsApp 链接点击；商品卡取所点商品 | custom / whatsapp_click |
| Lead | IMPLEMENTED | 现有 web-orders 请求 HTTP 成功且返回订单登记标识；使用请求 UUID | lead_created / customer_action |
| Purchase | NOT CONFIGURED | 官网无支付完成信号；API 明确拒绝任何 Purchase 调用 | 不生成映射载荷 |
| 外部传输 | NOT CONFIGURED | 无 Pixel ID、SDK、转换 API key 或 transport | scripts/chatgpt-event-mapping.mjs 为纯函数 PREPARED |

用 `window.HaodeConversions.getEvents()` 查看本页本地事件，订阅 `haode:conversion`；`track()` 返回 `{accepted,reason}` 或 `{accepted,event}`。不把调用成功当成 Ads Manager 接收成功。

载荷白名单：`event/event_id/occurred_at/page_path/product_id/contact_area/lead_registered/source/utm_source/utm_medium/utm_campaign/utm_content/utm_term/landing_page`。不含手机号、姓名、表单、聊天文字、完整 WhatsApp URL、ERP 订单号或估算金额。UTM 为最多 100 位 ASCII 字母数字、下划线、短横线；邮箱、电话形态、空白及其他内容省略，禁止在 UTM 中放客户个人信息。归因只在同意后保存到 sessionStorage，30 分钟失效；新 UTM 覆盖旧 campaign，跨同源页面保留，撤回同意清空该队列和保存值。未知/拒绝状态不会积压后重放。

ViewProduct 同一详情重渲染去重，离开详情清理上下文，返回详情是新访问；WhatsApp 同一商品/位置 1.5 秒去重；Lead 同一请求 UUID 在同一会话存储窗口内去重。队列和去重记录各有 100 条上限。存储不可用时退化为本页内存，跨刷新去重不可保证。脚本晚加载时，仅已同时同意的成功 Lead 和早期 WhatsApp 点击暂存在内存（合计最多 100）；脚本就绪后交付，期间撤回会丢弃。缓冲仅保存允许的事件参数，归因在本页模块就绪时净化读取；离开页面或脚本始终失败时内存事件会丢失。网络或脚本加载失败不会阻断询价，该事件无外部送达保证。

官方事件名及形状参考：[Supported Events](https://developers.openai.com/ads/supported-events)、[Measurement Pixel](https://developers.openai.com/ads/measurement-pixel)、[Conversion Measurement](https://help.openai.com/en/articles/20001409-conversion-measurement)。未来接入先设置平台 consent=false，再按用户同意启用；不能启用自动高级匹配或上传个人数据而绕过本合同。Pixel 与服务端使用同一 `event_id`，不把本地 30 分钟防重复冒充服务端永久幂等。

## 跨仓库接口合同：Purchase 保持未配置

现有 `POST https://erp.haode.com.mx/api/public/web-orders` 是询价/订单登记，不是付款。购物车总额是估算，WhatsApp 打开或已返回 `order_number` 只能证明登记，不能证明成交。

未来由拥有 ERP/支付系统权限的独立任务提供受验证的服务端事件：

- 必须是实际受信订单状态从未付款变为付款成功，校验商户、订单、币种、真实已付金额和支付回调签名；不相信浏览器的 `paid=true`。
- 使用数据库唯一事件键做幂等，回调重试及浏览器/服务端渠道共享安全不含 PII 的 `event_id`。
- 合同数据为 `event_id`, `occurred_at`, `product_ids`, `amount_minor`, `currency`, 允许的归因字段及同意证据；缺金额/币种/支付成功证据时拒绝发送，不补 0。
- 金额单位必须明确为 MXN 最小货币单位；不得改变财税、退款或财务规则。
- 当前不存在本仓库付款 webhook 或 Purchase HTTP endpoint；本次只交付合同，未修改 ERP 或新增假接口。

## 三组广告包与落地页

可编辑机器包：`data/marketing/chatgpt-launch-pack.json`，每组 3 标题、2 描述、3 context hints、一个准确 landing/UTM。context hints 仅为策划提示，需在账户中核实支持方式，不声称是 API 字段。

| 组 | 首选标题 | 首选描述 | 落地页 |
| --- | --- | --- | --- |
| Pantallas para técnicos | Pantallas para técnicos | Consulta pantallas para iPhone y Samsung. Envía modelo, versión, cantidad y ciudad por WhatsApp. | /pantallas-premium-iphone-samsung-fabrica/ |
| Hydrogel Mayoreo | Hidrogel para tu tienda | Consulta micas HD, matte y privacidad. Confirma presentación, cantidad y disponibilidad por WhatsApp. | /micas-hidrogel-mayoreo-mexico/ |
| Proveedor para tienda de reparación | Proveedor para tu taller | Pantallas, micas y accesorios para tu negocio. Envía tu lista de modelos, cantidades y ciudad. | /refacciones-celulares-mayoreo-mexico/ |

所有 URL 使用 `utm_source=chatgpt&utm_medium=paid`，campaign 分别 `haode_pilot_pantallas/haode_pilot_hydrogel/haode_pilot_proveedor`，content 分别 `tecnicos_v1/mayoreo_v1/taller_v1`，term 分别 `pantallas/hidrogel/refacciones`。沿用页面已有 WhatsApp CTA，不改变号码。Hydrogel 不是折扣活动；没有虚构优惠、库存、性能、保修或合作身份。

## 小额试投前检查表

当前 **不具备立即真实试投条件**。本地页面/候选数据/事件准备完成也不代替以下人工 gate：

- [ ] Owner 在当前 Ads Manager 核实账户身份、所属主体、国家资格与权限。
- [ ] 核实 MX 目标地区、MXN、素材格式、context hints/定向和 feed 格式支持。
- [ ] 确认需要普通链接广告还是商品 feed 广告；商品 feed 必须补齐获批当前价格、品牌语义和素材审核，未知库存按允许格式表达。
- [ ] 完成域名/数据源/Pixel 配置与隐私告知审核；外部测试需单独授权；在 Ads Manager 验证实际收件、去重和匹配状态。
- [ ] 确认 Billing、付款方式、实际币种、预算总额、每日上限、起止日期、停止条件与花费授权。这里不预填任何预算或卡片信息。
- [ ] 由 Owner 批准广告文案、准确 URL 与受众；首次上线按功能分支正式发布流程再跑当前检查和线上验证。
- [ ] 公开投放必须单独明确授权。不得将 push/PR 当作部署、广告发布或授权扣款。
- [ ] 没有支付成功集成时只选择经过验证的 Lead/WhatsApp 指标，不使用 Purchase 或虚构 ROAS。

## 验证与恢复

运行记录在 `PROGRESS.md`，最终证据见 `VERIFICATION.md`。`local-qa.json` 记录 227 条 sitemap 以及十个随机产品和媒体检查；`public-source-audit.json` 记录线上只读快照。浏览器测试对真实 ERP/WhatsApp/广告服务阻断，订单回调用模拟响应；实际生产下单/付款从未用于测试。浏览器配置的隔离不等于用户已授权真实发送。

恢复时先核实 worktree 的 branch/HEAD/status；运行 `npm run build`、`BASE_URL=<本地地址> npm run browser-test`，通过后只暂存本任务清单。推送仅使用 `HEAD:refs/heads/feat/chatgpt-ads-feed-tracking-20260924`，禁止 main 合并或部署。

## 技能与外部副作用

实际采用：guidelines、karpathy-rules、code-review、testing-qa、haode-browser-qa、产品控制/价格保护、superpowers 交付验证与独立代码审查、copywriting/product-marketing 的事实与文案原则；devops-deploy 只做目标核对。项目本地缺失的前三个核心入口已按当前目录和全局已安装来源核对，未安装、复制、迁移或改配置。

未采用 Firecrawl（无竞品/供应商抽取）、图像/视频生成（没有素材制作）、ERP/CRM 写入技能（无对应所有权）、广告账户连接器（没有外部配置/投放授权）。

消息发送：未执行。广告/客户资料上传：未执行。广告公开发布：未执行。部署：未执行。生产业务写入：未执行。功能分支 Git push 是已授权代码交付，状态另报，不等于上述动作。
