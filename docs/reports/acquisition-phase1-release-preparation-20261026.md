# HAODE 官网获客一期：发布准备与回滚操作计划

日期：2026-10-26，America/Mexico_City。仓库 haodemx/haode-web；原 Draft PR #110；原工作树 website-acquisition-phase1-20261026。本文件是发布操作计划，不是合并或部署授权。最终候选 SHA、CI 和完整中文结论以本轮冻结回执及 PR 当前审查说明为准，不能用旧 SHA 的 PASS 替代。

本轮按 Owner 专项授权完成 MEDIA-01 中性待补处置。原 Master 对 e5859859 的 PASS/CLOSED 保留；这是原 PR 的增量核验，不重开、不新建 Master/PR。最终 A/B 结论以推送后 PR 当前准确 HEAD 的 CI、独立审查及冻结回执为准。本文件不预报尚未运行的远端结果。

## 当前候选与本轮修复

进入本轮基准为 b3f95217ea63a4feebb8e31dde8bbfa6f003e22a；fetch 后 main 仍为 41419154c049c04918dab66cfe06bad270e66165，开发远端没有他人新增提交。PR #110 保持 Draft。

本轮只撤下三个获批 INCELL SKU 的错型号系列图，使用既有 assets/products/placeholder.svg，并显示准确说明：**Foto específica de este modelo pendiente de confirmar.** 官网主图、手机预览、分类卡片、目录卡片、放大、App 详情/卡片/购物车一致；不把占位当产品实拍，三页 OG/Twitter 图片及 Product.image 缺省。

创建商品、价格同步的既有商品保留分支及补建页面、SEO 刷新均执行同一三 ID 策略。官网/App ERP 刷新拒绝覆盖三款图片，并按已确认 SKU 精确映射，避免 Note 20 同名跨质量匹配。修复通用 producto.html 大写 ID 解析后手机提示不一致。独立审查发现的手机静态旧 src/srcset、回滚测试 fixture 依赖遗漏也已修复；不改价格、库存、原图文件或其他商品图片。

五个已审核水凝膜/X200T页面的 SEO 保护保留。没有应用其他14项全量 SEO 文案差异，没有修改生产配置、依赖或 ERP 业务数据。本轮完整本地 Build、浏览器及回滚证据见后述增量报告；远端须读取新准确 HEAD 的实际结果。

## 已核对的业务与限制

- Samsung直板34型号/50参考、折叠9型号/13参考；iPhone36型号/78参考。141条目录引用逐一绑定既有产品ID、质量、详情及询价来源；没有把内部参考伪称厂商SKU。当前公开ERP GET身份字段能核对三款待补Samsung及XR准确SKU；价格权威仍为批准工作簿，不能拿ERP较旧报价改价。
- 批准客户源156行中152个既有匹配：官网/App价格及质量一致。XR标准Caja145、Bolsa独立135；ERP旧价格/质量/描述回流保护保留。未改其他型号价格。
- 四款水凝膜为 Paquete50pzs，X200T为Equipo；不把机器当50片耗材。HD Clear、Matte、Privacy HD、Privacy Matte、OEM及AI眼镜/相机入口和隔离询价测试保留。
- 主号沿用已合并PR33的+52 33 2668 4296，首页/联系页/tel/WhatsApp/Organization/LocalBusiness/ContactPoint一致；没有新增其他号码或接听承诺。
- 231个sitemap页的HTTP、Title、Description、canonical、robots、JSON-LD检查；230页有静态H1，App为既有SPA，静态无H1、渲染后H1通过App测试，不能称App已静态预渲染。
- Google完整XR代码验证有效，电话提示已消除，LocalBusiness余priceRange可选提示；Schema.org0错误/0警告。Google代码测试不等于生产动态抓取或真实搜索展示。priceRange无获批整体价位，继续NOT CONFIGURED；不编造库存、星级、评价、认证、配送/退货承诺。
- GA4同意后单次WhatsApp点击只记一组相应事件，拒绝同意不发；contact与WhatsAppClick不能加总为两条线索，Lead与generate_lead也不能重复加总。只有接口确认的询价登记才有lead_registered；并非员工核实有效线索。Purchase当前NOT CONFIGURED，点击不能当成交或营业额。

## MEDIA-01：中性展示已修复，真实照片仍待补

| 网站 ID | 已确认 ERP SKU | 质量 | 当前展示 |
|---|---|---|---|
| samsung-incell-note-10-lite | SS-NOTE10-LITE-INCELL-FHD | INCELL FHD C/M | 既有中性占位及明确待补说明 |
| samsung-incell-note-20 | SS-NOTE-20-INCELL-FHD | INCELL FHD C/M | 同上 |
| samsung-incell-s10-lite | SS-S10-LITE-INCELL-FHD | INCELL FHD C/M | 同上 |

原 QC_FAIL_WRONG_MODEL 记录和被拒系列图留作历史证据，没有改成图片批准。仅这三个 SKU 的公开映射改变；真实准确照片为 ASSET MISSING，未来需按 SKU、质量及使用权单独批准。没有使用网络替图、AI 实物图或其他质量图片。

三个 Product 保留真实名称、描述、Offer 和价格，但省略 image。依据 Google 官方要求：[Merchant listing](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing) 必须有实际产品图片，因此三款此项能力为 **NOT CONFIGURED**，不能称完整 Merchant listing 无严重提示；[Product snippet](https://developers.google.com/search/docs/appearance/structured-data/product-snippet) 的必要名称及 offers 仍在，实际展示由 Google 决定。缺图不影响普通索引及询价。Schema.org 语法/页面事实检查与 Google 图片资格分别记录；不造库存、评价、认证、退货或配送承诺补齐提示。

本轮Google完整Note 20代码在线验证：[实际结果](https://search.google.com/test/rich-results/result?id=JfdjYIwyClLl4qKQQ9pMbQ)显示Product摘要1项有效、BreadcrumbList1项有效；Merchant listing1项无效，唯一严重项为image缺失，另12项非严重的库存/配送/退货字段缺省。同一完整HTML的Schema.org在线结果为2项数据、0错误、0警告。此为候选HTML代码模式，不是线上已部署验证；另外两款本轮做本地完整Schema/价格一致性核验，未逐一重复在线提交。

本轮本地检查包括原3×390/1440六场景、通用大小写 ID、ERP 错图回流、价格同步旧源回流、分类/官网/App/放大和手机可见性。完整 Build、浏览器实际数量与结果、231页、152价质、独立审查及准确 HEAD CI 以原 PR 的最新冻结回执为准；旧报告 B 是历史问题状态，不代表本轮处置完成后的结论。

## 真实生产版本、构建与部署

- 当前生产：41419154c049c04918dab66cfe06bad270e66165。GitHub Pages deployment7295560064为success，主分支运行40073098134的六个jobs实际成功；9个线上关键文件与该Git提交逐字节一致。此结论证明版本绑定，不声称基线没有既有业务缺陷。
- Pages使用workflow，CNAME haode.com.mx，HTTPS enforced。唯一实际链路为 .github/workflows/haode-check.yml：haode-check → critical-business-gate → verify-transferred-artifact → package-pages → deploy-pages → live-verify。后三项只允许push到main；workflow_dispatch不会因此自动发布。当前不调用任何发布动作。
- 构建输出_site，通过public-site-files.json白名单和.public-package.json文件级哈希；当前1199个客户文件，加完整性manifest合计1200个文件。`.public-package.json`在线HTTP404，不能拿该隐藏文件做线上版本承诺；用Actions部署SHA、传递校验和线上关键文件哈希共同核实。
- 原候选43639af4发布包ID12696928077，压缩包digest sha256:794c61d47d15e32483add0d600a3df09b4a9de055e24011a2e746209e2e1f249，保留到2027-01-24T23:21:06Z。本轮修复后会有新HEAD产物ID/digest，必须以最终回执的新记录为准，不能把旧artifact改名当新验证。
- 稳定生产备份包ID12551897558，名称haode-public-site-41419154c049c04918dab66cfe06bad270e66165，digest sha256:c00713b8f6cd2dd0bd42b1e5a2d06d3880fdf0b286017ea78d5c275fd3bed396，保留到2027-01-22T07:10:32Z。原产物传递及生产验证成功；本轮未为重复验包下载约487MB压缩包重算digest。到期前需在单独授权下备份，不能假定永久可恢复。
- 本PR所有待入main提交均属当前任务；发布时按实际新HEAD再次检查main增量/冲突和其他合并，不能把此快照用作未来授权。没有数据库迁移。网站仅GET公开ERP目录/库存刷新，询价登记接口是既有业务路径；本轮所有浏览器POST均被隔离拦截，不写真实订单。
- 可识别私钥/token模式与公开包禁止文件检查无发现；这是有范围的检查，不是完整渗透测试。没有新依赖、CNAME、service-worker或部署权限配置变更。

## 发布前最后冻结与上线验收（均待以后授权执行）

正式合并前：确认MEDIA-01本轮增量结果与准确HEAD；fetch main和开发分支，确认没有他人新提交；重新核验指定SHA的Build/技术合同/届时实际套件数量、价格/质量/隐私、231页和发布包传递结果。记录Owner批准的SHA、合并方式、main实际发布SHA、产物ID/digest、部署人、时间和回滚保留期限。PR仍保持Draft，未获明确新授权不改Ready、不合并、不部署。

上线后必须在无缓存新会话及已安装PWA的旧会话各查桌面1440px/手机390px：

- 首页三条入口、Samsung高端屏及折叠入口、iPhone、OEM、原AI商品正常；型号质量选择、空态、重置、无横向溢出/遮挡。
- XR首页/详情/App/Product Caja145，Bolsa独立135；模拟旧ERP仅在隔离测试环境，生产只读，不发送真实消息/订单。
- 四款50片耗材和X200T设备页面、包装单位及命名不混；批准素材/待补状态在所有表面一致。
- 主号+52 33 2668 4296；解码WhatsApp链接含准确产品、质量、详情URL和来源；实际打开消息发送不属于自动验收步骤。
- 231页HTTP200、canonical、robots、Title/Description/H1、sitemap一致；Google代表性完整页面须无未处置的新严重问题；本轮三款已批准缺图页明确记录Merchant listing缺image的预期资格暂停，不能宣称它们无严重提示；未知可选字段继续缺省。
- 同意后单次contact/WhatsAppClick对应、拒绝不发、无PII/聊天文本泄漏、点击不记Purchase；正式DebugView仅在Owner允许且不给真实客户数据时使用。
- 全部关键JS/CSS/media无404；部署SHA、包manifest与Owner批准提交匹配；不把CI启动或Pages accepted当发布成功。缓存未传播时不能宣布上线验收PASS。

Pages现有线上响应cache-control为短期缓存，按实际headers复核，不承诺固定传播分钟数。service-worker对HTML、products.js、App脚本和商品数据走network-first，离线可返回旧缓存；新acquisition目录JS/CSS文件为带版本的新URL。上线/回滚均查普通刷新与PWA旧缓存，不清除真实客户本地购物车或同意设置。站点地图由构建包交付；若提交GSC重抓需另有对应权限，不自动改robots或搜索账号。

## 可执行回滚方案（本次不执行）

回滚触发：错误型号/串价、145或135失配、主询价路径失效、严重移动遮挡、隐私泄漏/重复成交事件、意外ERP真实写入、关键页面5xx/404，或发布产物与批准SHA不符。遇隐私/交易风险先暂停受影响入口并联系唯一发布负责人；该角色为建议，未代老板指派人员。

默认是“恢复已部署基线结构，保留已批准业务事实”的普通Git提交。**直接恢复旧414包会恢复首页155、三款已知错图并移除ERP保护，不作为默认回滚**；若必须紧急原包恢复，Owner需明确批准该业务影响与临时客户处置，不能由自动化决定。

本目录 acquisition-phase1-approved-facts-rollback.patch 以414为基底保留XR145、已批准ERP价格/质量/描述保护、canonical询价、门店地址/主号及本轮三款中性待补策略。保留官网/App/分类卡片、ERP精确SKU映射、生成器和价格同步防回流；包含沙盒测试对新策略文件的复制依赖。按回滚树重新计算官网/App/146页/素材四个派生指纹并保留历史拒绝证据。独立临时index完成 git apply --cached --check 及实际 cached apply；原工作树/index不受影响。未来实际回滚完整构建/部署为 NOT RUN，须在下一次明确授权后先执行。新批准真实照片或其他业务事实变化后必须重新冻结补丁，不能恢复已知错图或XR155。

以后Owner明确授权回滚时，在专用隔离分支执行，先保存补丁到回退不会删除的临时目录：

```sh
# 仅未来授权后执行；变量必须由实际发布记录填写，不预填未知merge SHA。
task_release_sha=<实际已部署且批准的发布提交>
task_release_merge=<本PR实际合入main的提交>
task_rollback_patch=<隔离工作目录中的绝对补丁路径>
git show "$task_release_sha:docs/reports/acquisition-phase1-approved-facts-rollback.patch" > "$task_rollback_patch"
# 先fetch、检查main后续提交和工作区，建立专用rollback分支，不切换其他窗口。
# 普通两父merge：git revert --no-commit -m 1 "$task_release_merge"
# squash/rebase单父提交：git revert --no-commit "$task_release_merge"（多提交需按实际范围逐一审查）
git apply --index --check "$task_rollback_patch"
git apply --index "$task_rollback_patch"
# 冲突/新业务事实不匹配时停止并人工审查，禁止force/reset/盲目覆盖。
# 复核145/135、ERP保护、图片批准状态、地址主号、隐私及所有受影响功能。
npm run build
BASE_URL=<隔离构建服务URL> npm run browser-test
# 验证通过才普通commit/push，按未来明确授权走rollback PR、准确HEAD CI及Owner批准合并/部署。
```

回滚新提交不与旧414完整树相同；必须记录新回滚SHA、产物和Owner批准。新main正常push走完整既有发布链；若该链故障，不伪称workflow_dispatch会发布，另报需要批准的修复。回滚后执行与上线相同的版本/HTTP/价格/模型/联系方式/隐私/缓存清单，确认生产实际恢复才关闭事故，不重写共享历史。

## 上线后7天/28天观察计划

T0为以后真实发布并验收通过的时间；本次尚无T0，不创建新定时任务。按来源时区取完整自然日，排除发布当天的部分流量。D+7与D+28先生成观察稿，数据完整后补齐；GSC查询日期按PT，GA4按属性报告时区（正式T0前核对，当前未重新查属性时区），不得把两种自然日强行拼成同一日。

来源：GSC sc-domain:haode.com.mx；GA4属性540043966，沿用既有只读OAuth/API路径；员工CRM/ERP以经核实的登记和成交凭据为准。本轮不重拉API、不改OAuth、不新设自动化。现有28天基线为2026-09-28至10-25：GSC130点击/3366展示，GA4自然32sessions；contact34与WhatsAppClick34是同一点击口径的两个事件，不相加；generate_lead1是登记确认，不代表1条员工有效线索或成交。原Master重算记录及原始API文件保留，不能把这份历史数据称为上线后结果。

| 指标 | 口径 | 7天/28天比较 |
|---|---|---|
| Samsung自然点击/展示/CTR/位置 | Samsung主入口、折叠、相关分类和商品页；页面与查询维度分别导出，不加总不同维度重复值 | 对齐前7天同星期及前28天，必要时分手机/桌面 |
| iPhone自然点击 | iPhone总目录、INCELL/OLED/诊断分类及商品页 | 同上，标准/Pro/Max/包装版本不合并成同SKU |
| 水凝膜自然点击 | 水凝膜/OEM、四耗材、X200T及机器分类，设备/耗材另分组 | 同上，记录低量波动，不能因一周无点击重复改文案 |
| WhatsApp询价点击 | 以contact为报表主计数，WhatsAppClick作一致性核对；按product_id/页面/来源分组 | 不与Lead、generate_lead相加，不当有效线索 |
| 经核实有效线索 | 员工去重登记、有实际型号/数量需求和后续记录；用内部request_id关联，报表不放姓名电话聊天 | 缺员工证据写不可验证，不填0或按点击估算 |
| 实际成交 | 真实业务订单/收款或最终确认凭据；区分草稿、询价、取消、退款 | 无可核实数据写NOT CONFIGURED/不可用，不推算成交额 |

Google Analytics数据可能24–48小时处理且后续变化；GSC查询可能只返高位行且低量查询被限制，缺失不补0。每次报告记录取数时间、来源/失败原因、精确起止日和比较期、行数、过滤条件、来源时区、去重规则、数据修订及员工核实状态。CTR用总点击/总展示重算，位置按展示加权；不相加不同维度导出的合计。发布与增长的因果不从短期波动直接推断。

参考：Google Search Analytics API https://developers.google.com/webmaster-tools/v1/searchanalytics/query ；GA4数据新鲜度 https://support.google.com/analytics/answer/11198161 。

## 本轮增量交付记录

任务类型：网站发布准备/已批准素材展示纠错。实际使用 superpowers、guidelines、karpathy-rules、schema、code-review、testing-qa、haode-engineering 及原浏览器 QA 工作流；requesting-code-review 仅派发只读增量审查，原 Master 不变。未使用 imagegen/Firecrawl（不生成或外采产品图），未执行 devops-deploy（今晚无部署授权）。

证据在原一期输出目录的 media01-closeout，含 red/green 原始日志、完整 Build、浏览器最终原始结果、231页 HTTP/SEO/Schema、152源价质比对、独立增量/回滚复核、准确 HEAD Push/PR CI 与产物 ID/digest/传递完整性回执。最终中文报告及 PR 当前说明绑定实际提交 SHA。没有把历史 PASS 自动当作新提交验证，也没有把 CI 启动当 PASS。
