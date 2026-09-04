# HAODE 网站体检与小范围修复 · 2026-09-04

## 检查范围

本次以上线版本 9104c5bb 为基线，按统计范围、GA4、Google 收录、性能、询价流程、SEO/GEO、本地信任入口依次核验。没有更改产品数据、价格、图片、联系方式、库存或订单规则。

## 已验证的事实

- 线上 sitemap 的228页全部HTTP 200，与批准版本逐页一致；canonical无错配、无noindex、标题和描述无重复、无静态孤立页。首页至各页深度分布为0层1页、1层34页、2层192页、3层1页。
- 311个静态媒体和脚本URL全部可访问，无HTTP混合资源。HTTP及www入口均最终转至https://haode.com.mx/。
- GA4只读API可用；2026-08-07至2026-09-03观察窗口只有haode.com.mx主机。contact为49次事件、33名用户；whatsapp_click为18次旧事件，最后出现于8月13日，不能把67个关键事件当作67次独立咨询。没有发现后台eventCreateRules；当前浏览器测试每次联系只发一个contact。
- 9项线上GA4及隐私测试通过。Google上报及订单提交在测试中被拦截，没有发送业务消息、订单或测试转化到生产。
- Google站点地图读取记录截至9月1日、无错误。6个核心屏幕分类只读复检中，Samsung INCELL/OLED已收录，iPhone INCELL/OLED、诊断屏、Samsung TIPO ORIGINAL为已发现尚未收录。与Google已经重抓取新版不是同一结论。

## 本次修复

- 首页品牌区小字/按钮、分类卡片、面包屑和桌面导航CTA的颜色对比度。
- 共享APP入口辅助阅读名称与可见文字匹配；占位产品图入口保留“Imagen en actualización”说明。
- App加载区建立独立布局上下文并预留至少一屏空间，防止加载内容撑开时把已出现的目录整体推走。线上旧版桌面CLS两次0.809；修复后本地手机0、桌面0.056。最终结论仍需上线复测，不能把本地未压缩资源的速度分数与CDN分数直接比较。
- 自动化目录中的周报扫描已排除嵌套工作副本、依赖与测试输出；并说明联系事件不等于去重客户、已发送消息或成交数。自动化目录不是本网站Git仓库，这些改动不包含在网站提交里。

## 性能与未完成项

Lighthouse 13.4.1独立顺序运行。上线旧版手机：首页90、App96–97、诊断屏96、Samsung INCELL83–85、OLED85–87、TIPO ORIGINAL100、iPhone14 INCELL81。桌面App两次76、CLS0.809，为本次重点修复对象。并非全站性能均达标。

- Samsung INCELL/OLED分类及样本产品页的手机加载仍需下一轮针对渲染阻塞与CSS体积做受控实验，不应反复改关键词。
- Google真实用户CrUX/PSI界面因浏览器安全策略不可用，未验证；不能把Lighthouse等同真实用户Core Web Vitals。
- GEO只验证站内可引用信息、公开检索与GA4 AI引荐（22次会话）；未独立运行Gemini/Perplexity等多平台回答测试，也不把访问量当作AI提及率。
- 门店与联系页公开地址、电话一致；当前地图按钮是地址搜索链接，不是已核验的商家Place ID。商家后台/归属/审核/评论状态未验证，未更改营业时间、地址或账号权限。
- HTTPS可用；响应中未见HSTS/CSP，作为托管层加固建议，不代表已发现可利用漏洞。未做渗透测试。
- 模板结构化数据解析与现有合同测试可核验；没有完成Google Rich Results Test的逐页官方富结果验收。

## 验收边界

本次提交前实际通过：npm run build、122项Node测试、230项完整浏览器测试、git diff --check。自动化修复通过6项Python测试和周报不可用数据回归测试。

目标是提高统计可信度和真实访问体验，不追求虚构的整站总分。站内技术检查通过不保证Google收录或排名。旧报告和当前线上证据分开保存；发布工作流成功、线上文件一致及复测完成后才报告已上线。

本轮实际使用：guidelines、superpowers、karpathy-rules、seo-audit、code-review、testing-qa、haode-browser-qa、playwright、devops-deploy及haode-web-release-verify。未使用Firecrawl（无竞品/供应商提取），未安装新技能或扩大账号权限。
