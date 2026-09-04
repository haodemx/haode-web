# HAODE iPhone / Samsung 全系列屏幕 SEO・GEO 交付

日期：2026-09-04。基线：origin/main cf0d04b7。任务分支：seo/iphone-samsung-20260904。

本报告证明本地内容、代码和验收结果，不证明已上线、Google 已重新抓取或排名提高。交付提交与推送结果见本任务最终回复。老板“全面做到最好”的偏好已按要求记录；不把它解释为可编造产品功能或绕过生产发布确认。

## 实际完成范围

- 141 个已有屏幕型号页：iPhone INCELL 34、iPhone OLED 20、OLED Diagnóstica 24、Samsung INCELL 37、Samsung OLED 9、Samsung TIPO ORIGINAL 17。
- 18 个已有入口：7 个品牌／品质分类、屏幕总入口、8 个采购专题、premium 品质指南、官方 GEO 信息页。
- Samsung Z Flip / Z Fold 已计入 TIPO ORIGINAL，不重复计数；18 个三星整机条目不在本轮屏幕范围内。
- 没有新增城市页、关键词变体页、SKU 或产品分类；保留所有原 URL。
- 完整的 159 行页面／主词／辅助词／品质／标题映射见 [关键词表](iphone-samsung-seo-keywords-20260904.csv)。这些是基于目录和搜索意图的候选词，不是有搜索量或竞争度数据支持的排名预测。

## 修改结果

| 项目 | 完成内容 |
| --- | --- |
| 品质一致 | 75 个静态品质字段与目录对齐，其中 25 个 OLED 页面原先误显示 INCELL；不是改了产品本身的品质 |
| 诊断屏关键词 | 分类采用 pantallas diagnóstico para iPhone；22 个原先仅写 Modelo 的标题补全 iPhone；24 个诊断屏标题在页面加载后保留明确型号语境 |
| 元数据 | 159 页标题在本轮范围内唯一，description 与社交预览一致；清除跨品牌旧 meta keywords，未把它当作排名主要因素 |
| 型号页正文 | 具体型号、目录品质、参考 ID、购买核对项；按 INCELL、OLED、诊断、Samsung 及折叠屏区分说明，替换原重复购买模板 |
| 分类与采购 | 分类可直接进入该类已发布型号；采购页说明如何按型号／版本／数量提交清单，不复制分类页主用途 |
| 结构化信息 | Product 名称和描述与对应页面一致；诊断屏 FAQ 与可见问答逐条一致；未添加评星、销量或未经确认的库存状态 |
| 内链 | 型号返回分类及采购页；相邻型号标明仅为查询选项而非兼容替代；新增的静态链接全部落到 sitemap 中的有效 canonical 页 |
| 移动端 | 修正目标页浅色信息条的白字低对比度，压缩屏幕总入口手机首屏留白；没有全站改版 |
| 可维护性 | 接入现有 SEO 生成器的屏幕限定模式；重复运行无变化；构建检查可拦截重新生成造成的字段／标题回退 |

分类主词分工：iPhone INCELL、iPhone OLED、pantallas diagnóstico para iPhone、Samsung INCELL、Samsung OLED、Samsung tipo original con marco、Samsung Z Flip y Z Fold。采购页增加 mayoreo 和清单采购场景；型号页按“pantalla + 品牌 + 型号 + 已发布品质”组织。

`diagnosticables`、`autoprogramables`、`sin trasplante`、`sin mensaje` 是需要区分的搜索表达，不作为全线功能承诺。现有内容明确区分“诊断屏配件”与“进入 iPhone 诊断模式”。True Tone、iOS 配对、移植 IC、指纹、刷新率及 Service Pack 等仍须按具体 SKU 取得资料或实测。

## 验收记录

| 验收项 | 状态 | 证据 |
| --- | --- | --- |
| 屏幕内容生成重复运行 | passed | `node scripts/refresh-seo-pages.mjs --screens` 返回 SEO pages are current |
| 全部 159 页标题、描述、canonical、OG、sitemap、单一 H1 | passed | screen-seo 自动检查；描述 60–165 字符；非 noindex |
| 141 页品质与目录、Product schema 一致 | passed | 对全部目标 HTML 校验；无未经确认的 Offer availability |
| 全部新增静态内链 | passed | 目标文件存在且对应 sitemap canonical URL |
| 静态测试全集 | passed | `node --test tests/*.test.mjs`：119 passed，0 failed |
| 构建与产品同步 | passed | `npm run build`；quality-check 扫描319文件／292 HTML，0 errors、0 warnings |
| 浏览器全集 | passed | 本地 BASE_URL 指向独立工作副本；230 passed；已修复首轮标题匹配和手机首屏问题后重跑 |
| 六个系列手机端实际渲染 | passed | iPhone 11、16 Pro Max Hard OLED、13 Pro诊断屏、Samsung S8、Note10 OLED、Z Fold3：标题／品质可见、询价入口存在、360px无横向溢出 |
| 11个主要分类与专题桌面抽查 | passed | 1440px：无横向溢出、无已加载首屏破图；不等于逐张确认商品图片内容 |
| 受保护数据 | passed | data/、app/、assets/未修改；141页 Product schema 除名称／描述外与基线一致，图片来源与WhatsApp电话号码未变 |
| Google实时指标 | not verified | 2026-09-04 10:32:04 -06:00 的只读诊断：reauthorization_required，refresh token过期或撤销；缺失数据不记为0 |
| 本地ERP实时接口 | not verified | 手工抽查时ERP不允许本地来源的跨域请求，页面使用静态目录回退；不据此声称生产ERP异常或实时库存验证通过 |
| 生产新版、重新抓取、排名和AI引用 | not verified | 本轮未合并main或部署；代码通过不代表这些结果 |

构建仍输出历史 alias 和部分视频字段缺失的报告项；它们不是本轮新增，也没有被隐藏或通过删除断言消除。未擅自补产品视频或替换素材。

## 仍需完成的外部环节

1. 确认生产发布后，按现有发布流程合并并部署本分支，再逐项检查线上 HTML、渲染标题、样式、canonical 和 URL 可达性。不要把分支推送当作上线。
2. 恢复 Google 只读 OAuth。需账号拥有者完成浏览器授权；现有恢复入口是自动化目录中的 `npm run google:readonly-oauth`。不输出或传递 token。
3. 授权恢复后，核查墨西哥地区的查询／页面表现、URL 检查、Google选用canonical与最近抓取时间，再决定重点页是否需要请求重新抓取。上线前没有提交 sitemap 或索引请求。
4. 建立诊断屏逐SKU证据表：设备型号、iOS版本、是否需移植IC、配对步骤、提示信息、True Tone、测试日期和真实安装视频。获得确认后补充到相应型号页，不能用竞品或整机规格替代。
5. 补充经过确认的原创安装／测试素材、真实业务资料和客户反馈；检查商家资料与官网的一致性。任何上传、商家发布或客户信息使用都需相应授权。
6. 在重新抓取且数据完整后比较等长窗口，按品牌／品质／型号分组看曝光、点击、询价和可核实的AI引用；未取得数据前不频繁重写，也不承诺排名。

Google 官方说明：传统 SEO、清晰技术结构、可引用且有实际价值的内容仍是生成式搜索的基础，不需要为每种同义词另建页面，也不能保证收录或展示；`llms.txt` 不是 Google 的排名提升手段。本轮没有把增加这种文件当作成效。[Google生成式搜索指南](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)

结构化数据应忠实反映可见页面与真实产品信息；通过语法检查不保证获得特殊展示。[Google结构化数据政策](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)

## 后续维护

- 屏幕优化限定执行：`npm run seo:refresh-screens`。
- 修改相关目录或生成页面后先执行上述命令，再执行 `npm run build` 和本地完整 `npm run browser-test`。
- 新型号／实际品质改变应先同步官方产品资料，再更新关键词表；不得在SEO脚本里虚构事实。
- 价格、SKU、库存、图片、联系方式及已确认的特殊版本继续由原资料来源管理。
