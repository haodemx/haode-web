# HAODE 官网获客一期：发布准备与回滚操作计划

日期：2026-10-26，America/Mexico_City。仓库 haodemx/haode-web；原 Draft PR #110；原工作树 website-acquisition-phase1-20261026。本文件是发布操作计划，不是合并或部署授权。最终候选 SHA、CI 和完整中文结论以本轮冻结回执及 PR 当前审查说明为准，不能用旧 SHA 的 PASS 替代。

**当前发布判断：B — NOT READY。** 技术门槛与真实商品素材门槛分开记录。三款 Samsung 详情仍把已知错型号系列图当具体商品照片，需完成下述素材处置后再申请批准。原 Master 对 e5859859 的 PASS/CLOSED 保留；本轮为独立增量核验，不重开、不新建 Master/PR。

## 当前候选与本轮修复

进入本轮的候选是 43639af4b3a79090d9b1b995bc553921fb0c4422；main 为 41419154c049c04918dab66cfe06bad270e66165，PR 为 Draft、可合并。原准确 HEAD 的 Push40419150954、PR40419156509 已实际成功，保留为历史输入匹配的证据。

本轮确认并修复一个生成器问题：全量 SEO 刷新原拟重写19项，其中会把X200T机器的分类/面包屑改成Micas耗材，并覆盖五个已审核页面。生成器现在保护 mica-hd、mica-matte、mica-privacidad-hd、mica-privacidad-matte、x200t-cortadora-micas 的已审核文案/分类；商品和价格同步仍走原流程。新合同先真实FAIL后PASS；独立只读 --apply 模拟确认五页不拟写，屏幕刷新CLI保持兼容。其余14项全量刷新差异未应用，不属于本轮业务批准。

修复只改生成器与测试，另附本计划及回滚事实补丁。没有改当前公开页面、产品源、App数据、价格、库存、图片、电话、部署配置或依赖；发布包中的客户文件与进入本轮的43639af4相同。新提交仍须跑真实准确 HEAD CI，不以这一等价性省略远端门槛。

## 已核对的业务与限制

- Samsung直板34型号/50参考、折叠9型号/13参考；iPhone36型号/78参考。141条目录引用逐一绑定既有产品ID、质量、详情及询价来源；没有把内部参考伪称厂商SKU。当前公开ERP GET身份字段能核对三款待补Samsung及XR准确SKU；价格权威仍为批准工作簿，不能拿ERP较旧报价改价。
- 批准客户源156行中152个既有匹配：官网/App价格及质量一致。XR标准Caja145、Bolsa独立135；ERP旧价格/质量/描述回流保护保留。未改其他型号价格。
- 四款水凝膜为 Paquete50pzs，X200T为Equipo；不把机器当50片耗材。HD Clear、Matte、Privacy HD、Privacy Matte、OEM及AI眼镜/相机入口和隔离询价测试保留。
- 主号沿用已合并PR33的+52 33 2668 4296，首页/联系页/tel/WhatsApp/Organization/LocalBusiness/ContactPoint一致；没有新增其他号码或接听承诺。
- 231个sitemap页的HTTP、Title、Description、canonical、robots、JSON-LD检查；230页有静态H1，App为既有SPA，静态无H1、渲染后H1通过App测试，不能称App已静态预渲染。
- Google完整XR代码验证有效，电话提示已消除，LocalBusiness余priceRange可选提示；Schema.org0错误/0警告。Google代码测试不等于生产动态抓取或真实搜索展示。priceRange无获批整体价位，继续NOT CONFIGURED；不编造库存、星级、评价、认证、配送/退货承诺。
- GA4同意后单次WhatsApp点击只记一组相应事件，拒绝同意不发；contact与WhatsAppClick不能加总为两条线索，Lead与generate_lead也不能重复加总。只有接口确认的询价登记才有lead_registered；并非员工核实有效线索。Purchase当前NOT CONFIGURED，点击不能当成交或营业额。

## 唯一尚未解决的发布质量阻塞：MEDIA-01

| 网站ID | 公开ERP SKU | 质量 | 当前主图 |
|---|---|---|---|
| samsung-incell-note-10-lite | SS-NOTE10-LITE-INCELL-FHD | INCELL FHD C/M | assets/products/samsung-incell/main.jpg，运行时display.webp |
| samsung-incell-note-20 | SS-NOTE-20-INCELL-FHD | INCELL FHD C/M | 同一系列图 |
| samsung-incell-s10-lite | SS-S10-LITE-INCELL-FHD | INCELL FHD C/M | 同一系列图 |

现有 data/marketing/chatgpt-feed-asset-qc.json 对三项均为QC_FAIL_WRONG_MODEL。独立390/1440px共6次观察：图片可见，alt为具体型号，手机写Foto del producto，没有可见“该型号实拍待确认”。所以不能只把它列作无影响素材待办；虽是既有问题，本PR新目录会增加这些页面的访问。

只读图库文件名检索找到Note10/Note20 OLED及视频，但没有可确认属于这些INCELL FHD C/M SKU的批准素材；OLED、Ultra、Note10和Note10Lite不能互相代用。没有生成、拷贝、上传或替换产品素材。

老板需确定其中一种处置后继续依赖步骤：

1. 提供并确认三款准确SKU/等级/使用权的真实素材；完成同一SKU的主图、卡片、手机预览、放大、App、OG及Product图像核对。
2. 批准中性待补策略：使用既有非实物占位，西语明确“Foto específica de este modelo pendiente de confirmar”；不得把系列图或logo当该商品实拍。同步主图/手机预览/卡片/放大/App/OG；未有真实产品图前不发布冒充具体产品图的Product图像，应暂停相应富结果资格并标NOT CONFIGURED。商品、价格、型号入口保留，价格/库存不改。

该方案目前仅准备，未改受保护的产品图片或客户展示。依据 codex-skills/haode-product-control-center/SKILL.md 的Owner确认要求及HAODE_IMAGE_DESIGN_MASTER的ASSET MISSING规则；不能未经确认用别型号、抓取图或AI图填补。确定处置后需要针对性失败/通过证据、完整Build/浏览器/准确HEAD CI及独立增量复核；不重开原Master。

## 真实生产版本、构建与部署

- 当前生产：41419154c049c04918dab66cfe06bad270e66165。GitHub Pages deployment7295560064为success，主分支运行40073098134的六个jobs实际成功；9个线上关键文件与该Git提交逐字节一致。此结论证明版本绑定，不声称基线没有既有业务缺陷。
- Pages使用workflow，CNAME haode.com.mx，HTTPS enforced。唯一实际链路为 .github/workflows/haode-check.yml：haode-check → critical-business-gate → verify-transferred-artifact → package-pages → deploy-pages → live-verify。后三项只允许push到main；workflow_dispatch不会因此自动发布。当前不调用任何发布动作。
- 构建输出_site，通过public-site-files.json白名单和.public-package.json文件级哈希；当前1199个客户文件。`.public-package.json`在线HTTP404，不能拿该隐藏文件做线上版本承诺；用Actions部署SHA、传递校验和线上关键文件哈希共同核实。
- 原候选43639af4发布包ID12696928077，压缩包digest sha256:794c61d47d15e32483add0d600a3df09b4a9de055e24011a2e746209e2e1f249，保留到2027-01-24T23:21:06Z。本轮修复后会有新HEAD产物ID/digest，必须以最终回执的新记录为准，不能把旧artifact改名当新验证。
- 稳定生产备份包ID12551897558，名称haode-public-site-41419154c049c04918dab66cfe06bad270e66165，digest sha256:c00713b8f6cd2dd0bd42b1e5a2d06d3880fdf0b286017ea78d5c275fd3bed396，保留到2027-01-22T07:10:32Z。原产物传递及生产验证成功；本轮未为重复验包下载约487MB压缩包重算digest。到期前需在单独授权下备份，不能假定永久可恢复。
- 本PR所有待入main提交均属当前任务；发布时按实际新HEAD再次检查main增量/冲突和其他合并，不能把此快照用作未来授权。没有数据库迁移。网站仅GET公开ERP目录/库存刷新，询价登记接口是既有业务路径；本轮所有浏览器POST均被隔离拦截，不写真实订单。
- 可识别私钥/token模式与公开包禁止文件检查无发现；这是有范围的检查，不是完整渗透测试。没有新依赖、CNAME、service-worker或部署权限配置变更。

## 发布前最后冻结与上线验收（均待以后授权执行）

正式合并前：解决MEDIA-01，确认新准确HEAD/独立增量结果；fetch main和开发分支，确认没有他人新提交；重新核验指定SHA的Build/技术合同/391或届时实际套件数量、价格/质量/隐私、231页和发布包传递结果。记录Owner批准的SHA、合并方式、main实际发布SHA、产物ID/digest、部署人、时间和回滚保留期限。PR仍保持Draft，未获明确新授权不改Ready、不合并、不部署。

上线后必须在无缓存新会话及已安装PWA的旧会话各查桌面1440px/手机390px：

- 首页三条入口、Samsung高端屏及折叠入口、iPhone、OEM、原AI商品正常；型号质量选择、空态、重置、无横向溢出/遮挡。
- XR首页/详情/App/Product Caja145，Bolsa独立135；模拟旧ERP仅在隔离测试环境，生产只读，不发送真实消息/订单。
- 四款50片耗材和X200T设备页面、包装单位及命名不混；批准素材/待补状态在所有表面一致。
- 主号+52 33 2668 4296；解码WhatsApp链接含准确产品、质量、详情URL和来源；实际打开消息发送不属于自动验收步骤。
- 231页HTTP200、canonical、robots、Title/Description/H1、sitemap一致；Google代表性完整页面无严重Schema错误；未知可选字段继续缺省。
- 同意后单次contact/WhatsAppClick对应、拒绝不发、无PII/聊天文本泄漏、点击不记Purchase；正式DebugView仅在Owner允许且不给真实客户数据时使用。
- 全部关键JS/CSS/media无404；部署SHA、包manifest与Owner批准提交匹配；不把CI启动或Pages accepted当发布成功。缓存未传播时不能宣布上线验收PASS。

Pages现有线上响应cache-control为短期缓存，按实际headers复核，不承诺固定传播分钟数。service-worker对HTML、products.js、App脚本和商品数据走network-first，离线可返回旧缓存；新acquisition目录JS/CSS文件为带版本的新URL。上线/回滚均查普通刷新与PWA旧缓存，不清除真实客户本地购物车或同意设置。站点地图由构建包交付；若提交GSC重抓需另有对应权限，不自动改robots或搜索账号。

## 可执行回滚方案（本次不执行）

回滚触发：错误型号/串价、145或135失配、主询价路径失效、严重移动遮挡、隐私泄漏/重复成交事件、意外ERP真实写入、关键页面5xx/404，或发布产物与批准SHA不符。遇隐私/交易风险先暂停受影响入口并联系唯一发布负责人；该角色为建议，未代老板指派人员。

默认是“恢复已部署基线结构，保留已批准业务事实”的普通Git提交。**直接恢复旧414包会恢复首页155及移除ERP保护，不作为默认回滚**；若必须紧急原包恢复，Owner需明确批准该业务影响与临时客户处置，不能由自动化决定。

本目录 acquisition-phase1-approved-facts-rollback.patch 以414为基底保留XR145、已批准ERP价格/质量/描述保护、canonical询价和门店地址/主号，并同步商品页全文审计的唯一派生指纹（不改业务数据）；仅做git apply --cached --check，使用独立临时index，原工作树/index未改。未来实际回滚构建/部署NOT RUN。新批准素材或其他业务事实变化后，发布前必须重新冻结此补丁，不能套旧补丁撤销新批准照片。

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
