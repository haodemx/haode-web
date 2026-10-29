# M08 Product.image 修复与发布验收

日期：2026-10-29，America/Mexico_City。任务类型：经批准的单商品Schema纠错及发布。基线main/生产：7de7c69293ea73a325150e43dfa3d30a8bf3cf08。原Master保持CLOSED，本次是Owner明确授权的专项修复，不另建Master。

## 变更与边界

M08（网站参考gafas-ai-gafas-ai-m08，Owner已确认对应13MP）无已批准真实产品照片。只删除该商品静态及运行时Product.image；复用现有mediaSafeHtml生成保护，价格页面重新生成和SEO刷新都会删除该字段。运行时同时清理旧缓存HTML残留的占位image，ERP成功刷新或不可用均不恢复。

保留可见中性占位、OG/Twitter现状、型号质量描述、四档1000/945/870/845 MXN、原报价字段范围及主销售号。不改商品源、App、ERP、图片文件、其他产品或功能。官网询价原本不含金额；App原本含零售/批发两档，不能把四档都嵌入询价作为本次通过结论。正式ERP SKU映射不扩展。

## 富结果限制

移除字段符合真实资料状态，Schema.org的Product仍可解析；没有真实产品图片时，Google Merchant listing不满足image必需项，预期出现缺image的严重资格提示。这是Owner批准的真实限制，不是部署失败或工具故障。不为消除提示补造图片、库存、评价、认证、运费或退换货承诺。Product snippet是否仍有效及其他非严重提示以本次实际在线结果为准，不预先承诺。

官方要求：https://developers.google.com/search/docs/appearance/structured-data/merchant-listing 。技术验证通过不保证真实收录、富结果展示或成交。

## 验证与原始证据

原始证据目录：HAODE-AUTOMATION/OUTPUT/WEBSITE/2026-10-29/m08-schema-image-fix/ 。首次修复前unit-FIRST.log保留3项预期失败，修复后M08+原Samsung MEDIA-01共8项通过；完整Build通过，浏览器定向4项通过。全量浏览器首轮456项通过，但Playwright同时导入的历史node:test检查暴露一条过期素材文案正则（基线已有，非本次UI回归）。保留v3-media-FIRST.log及BASELINE_STALE_TEST.json；只把该正则改为已有批准的MEDIA-01条件文案，并纳入Build强制检查，不改界面/放宽身份约束。独立增量审查已初步通过；最终Build/浏览器、准确HEAD CI、产物及部署/生产在线结果由同目录最终回执记录，未采集前均不冒称PASS。

data/products.generated.js、app/products.json、客户价格主数据、app/app.js及sitemap的SHA256与基线完全相同，UNCHANGED_BUSINESS_DATA.json留证。不存在ERP生产写入、真实消息/订单或统计事件测试。

设计检测器dark-glow提示经核对为本次JSON-LD编辑的无关样式误报：此HTML无shadow/glow声明，未改CSS；仅为M08单页保留ignore-value例外，不关闭全局检测。页面效果仍执行手机/桌面回归。

## 发布及恢复

只允许本分支准确候选经Build、浏览器、独立增量审查、Push/PR CI及传输产物核验后正常合并。沿用main现有Pages自动工作流；不手动重复触发。合并前重查main仍为上述基线、无冲突及额外提交，出现变更先重新审查。

严重故障触发：错误价格、主要入口/询价不可用、严重浏览器错误、生产包偏离批准版本。不得整包恢复基线而把已知M08占位Product.image重新上线；针对实际故障在正常修复分支产生最小前向恢复候选，必须保留本次image缺省、新表价格、ERP保护和Samsung中性图片，经相应门槛再发布。无安全恢复候选时停止有风险的恢复并报告，不reset/force-push，不改ERP。保留原生产版本和本次产物用于比对，原版本不是可直接回退的安全包。

上线后检查正式域名M08 HTML+products.js与实际main内容逐字节绑定；静态/动态image缺省；手机/桌面官网/App四档、真实公共ERP读取、询价实际字段；231个sitemap页面HTTP/canonical与JSON-LD可解析；Google/Schema.org新抓取。PWA联网更新走现有network-first，离线旧缓存不是新发布版本证明。

## Skills

使用schema、superpowers、guidelines、karpathy-rules、code-review、testing-qa、haode-browser-qa、haode-product-control-center、haode-website-maintenance、haode-engineering、requesting-code-review独立增量审查及devops-deploy。未用Firecrawl/Jev/生成媒体：无竞品取图、复杂升级调查或素材制作需求。原Master不重开。
