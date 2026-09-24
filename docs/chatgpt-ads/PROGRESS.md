# 项目 B 执行记录

- 任务类型：官网公开 feed / 广告准备 / 转化追踪。
- 所有权：仅本 worktree；长期工作区、ERP、Owner Agent、Automation、CRM 不写入。
- 基线：262994f53eaace6dd28ebc0f19176a3fc280c4aa。
- 分支：feat/chatgpt-ads-feed-tracking-20260924。
- 验收：确定性公开 feed 与缺失语义；四事件白名单/同意/去重/UTM；三组西语广告与现有页面；build、browser-test、桌面/移动、独立 review；scoped commit/push；不部署。
- 顺序：检查公开来源与规则 → feed/广告包 → tracking → 自动化/浏览器 → review/修正 → 交付。
- 当前：实现、最终测试及独立审查全部通过；进入已授权功能分支提交推送。
- 技能：项目 code-review/testing-qa/devops-deploy（仅核对功能分支）；worktree haode-browser-qa/product-control-center/price-confirmation；guidelines/karpathy-rules 使用已安装全局来源（项目与 worktree 均无对应副本）；superpowers 使用已安装 verification-before-completion/requesting-code-review。未安装/复制技能。
- 初始风险：基线公开价格是静态列表，库存 ask_stock；不将它们推断为实时可售。无付款完成信号，Purchase NOT CONFIGURED。平台入驻/计费/上传/投放均未授权。

## 实施与检查进展

- 已生成 146 条候选，132 原公开主图/14 缺图；全部 price null、库存 unknown、platform_ready false。
- 官网公开源/ERP 公开接口/278 URL 核对完毕；投放字段与当前公开来源零差异，MICA HD 仅非输出画廊差异。
- 新 tracking、成功 Lead 桥与纯平台映射已实现；Purchase 和外部发送未配置。
- 首轮独立审查发现四项 P2，已修复并补回归：电话分隔符、点击商品归属、非详情上下文、晚加载 Lead。
- 最终单元16/16；完整build 81/81；完整browser198/198；双尺寸6张图视觉通过。
- 追加三项P2已修复：早期WhatsApp捕获、feed嵌套私密对象、映射严格类型；18项专题浏览器通过。
- node_modules 为已安装依赖的本地只读使用链接，.gitignore 明确排除，不纳入交付。
- 恢复点：独立复审PASS（Laplace，33个哈希匹配），仅本任务清单stage/commit/feature push；不合并、不部署。
