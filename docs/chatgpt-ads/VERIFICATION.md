# 项目 B 当前集成验证 — 2026-09-24

任务类型：HAODE 官网公开候选 Feed、广告准备与本地转化追踪。当前只交付功能分支和审查证据，不合并、不部署、不投放。

## 收尾审计验收

| 验收项 | 状态 | 当前证据 |
| --- | --- | --- |
| 工作簿到 Feed 映射 | PASS | 156 行中 146 行逐项映射、0 未映射、10 行明确排除；没有强行扩充 Feed |
| 销售层级来源一致性 | PASS | 客户版与老板版 146/146 一致；报告只输出布尔结果和差异档位，不输出价格数值 |
| 公开四方一致性 | FAIL | 官网 / App / 结构化数据各 73/146 与客户版一致；70 项为新来源版本差异、2 项仅 VIP 档不同、1 项三个公开表面彼此数值不一致；均不自动覆盖 |
| 型号与品质映射 | PARTIAL | 型号 146/146；品质 112/146 语义匹配，34 项需人工确认 |
| 库存时效 | BLOCKED | 现有来源为历史快照，不是当前实时库存；Feed 保持 unknown |
| 图片候选 | PARTIAL | 官网源 132 条公开路径、14 条物理缺图；Feed 拒绝 6 条明确错误主图，最终保留 126 条图片链接、图片阻塞 20 项 |
| 图片来源与 QC | FAIL | 5 项有完整审批证据；6 项明确错型号/促销主图且已在 feed 失败关闭；10 项跨品质或系列共图待人工确认；其余公开文件缺标准化审批链 |
| Feed 就绪 | BLOCKED | 146/146 仍为 price=null、availability=unknown、platform_ready=false；可上传 0 |
| 专项回归 | PASS | Feed/追踪/收尾审计 24/24；含同档不同值分类、QC 源图消失/placeholder/unsafe 失败关闭、公开数据与 146 个候选主图物理文件 SHA256 新鲜度门禁 |
| 完整浏览器 | PASS | exact head `f1a5055b` 的 push 与 pull_request 两次独立 CI 均实际运行 336 项并全部通过；本地仍保留 335/336 与更早 334/336 的失败记录，见下方“本地抖动记录”，不以单用例重跑替代全量证据 |
| CI | PASS | push run `36071149616` 与 pull_request run `36071196216` 均对应 `f1a5055b5c0b0b4b83965b0a0a95a8945d0da0d7`；`haode-check`、`critical-business-gate`、`verify-transferred-artifact` 全部通过 |
| 生产与外部动作 | NOT RUN | 未改公开价格/库存/图片，未上传、未发布、未投放、未部署 |

机器可读证据：`feed-closeout-audit.json`；可读报告：`feed-closeout-audit.md`；契约测试：`npm run test:chatgpt-feed-closeout`。

### exact-head CI 浏览器证据

- [push run 36071149616](https://github.com/haodemx/haode-web/actions/runs/36071149616)：Ubuntu 24.04、Node 24.21.0、Chrome for Testing 148.0.7778.96 / Playwright Chromium v1223；完整浏览器 `336 passed (2.3m)`，2 workers。
- [pull_request run 36071196216](https://github.com/haodemx/haode-web/actions/runs/36071196216)：同一运行环境；完整浏览器 `336 passed (2.0m)`，2 workers。
- 两轮均先通过 13 项购买路径检查和 1 项构建产物检查，再运行完整 336 项；两轮均上传 1197 文件的浏览器测试后公开产物并通过传递完整性校验。

### 本地抖动记录

- 提交前最新本地完整运行是 335/336；唯一失败为未修改的 Z Fold6 首屏布局测量，随后该用例单独重跑 1/1 通过。更早一轮为 334/336，两个不同的未修改布局用例也分别单跑通过。
- 当前证据只支持“本地并行负载或环境敏感的布局测量抖动”这一假设，尚不足以确认唯一根因；因此保留原始本地失败，不将单跑结果记为本地 336/336。
- exact head 在相同 2 workers 配置的独立 CI 环境连续两次 336/336，且本任务没有修改 UI、布局或相关浏览器测试，因此未为不稳定假设弱化断言、增加超时或改动无关 UI。

## 历史集成基线验收（PR #91 前置阶段，仅作来源基线）

| 验收项 | 状态 | 当前证据 |
| --- | --- | --- |
| 仓库与基线 | PASS | `haodemx/haode-web`；从 `origin/main` `54d7e29e` 建立隔离分支 |
| 避免重复修改 | PASS | 识别 PR #90 与现有工作树；只移植任务提交 `79c47a88`，未合并其 300+ 文件历史差异 |
| 候选 Feed | PASS | 146 条；132 条原公开主图、14 条缺图；全部价格 null、库存 unknown、平台就绪 false |
| 隐私与转化 | PASS | 仅双方同意后记录；敏感参数拒绝；撤回清空；点击和 Lead 去重；重放/忽略响应不记新 Lead |
| 付款事件 | NOT CONFIGURED | 没有可信付款完成信号；`Purchase` 明确拒绝，不生成金额或 ROAS |
| 平台传输 | NOT CONFIGURED | 无 Pixel ID、SDK、API 密钥或外部发送；只有本地事件与纯映射 |
| 专项单元 | PASS | 16/16 |
| 专项浏览器 | PASS | 18/18；三页 1280px/390px、同意/撤回、成功/空/失败登记及晚加载事件 |
| 完整构建 | PASS | `npm run build` 退出 0；质量检查 325 个源文件、0 错误、0 警告；公开包 1197 文件完整性通过 |
| 完整浏览器 | PASS | 当时的历史基线运行：`BASE_URL=http://127.0.0.1:4173 npm run browser-test`，336/336，46.3 秒；不是本轮提交前本地结果 |
| 公共依赖 | PASS | `ad-landing.css` 与 `conversion-tracking.js` 已纳入受控公开包并有契约测试 |
| Feed 上传资格 | BLOCKED | 0 条可直接上传；缺批准价格/库存/品牌映射、14 张确认图及平台审批 |
| CI | NOT RUN | 此行仅描述 PR #91 前置阶段；本轮 exact-head CI 状态以上方收尾审计为准 |
| 合并、部署、上传、投放、付费 | NOT RUN | 不在当前授权范围 |

## 集成中发现并修复

- 旧任务分支建立在较早基线上；冲突解决时保留当前 `main` 的 GA4、价格、SEO 和页面结构。
- 成功 Lead 桥接最初破坏既有 GA4 源码契约，并在隔离 VM 中因 `window` 不存在返回 null；改为在既有 GA4 记录后通过可选的 `globalThis.window` 调用。
- 新样式和追踪脚本最初未进入受控公开包；补充白名单和契约测试。
- 落地页测试仍查找旧头部 `.brand-logo`；适配当前 V3 头部标识并保持桌面/移动 logo 尺寸断言，没有删除或弱化布局检查。

## 来源快照

来源任务曾完成 278 个公开 URL、227 条路由/canonical、10 个产品和 38 个媒体的只读审计，并在旧分支记录独立复审。对应 JSON/哈希文件保留为 PR #90 来源快照；它们不是当前分支的 CI、部署或线上投放证明。
