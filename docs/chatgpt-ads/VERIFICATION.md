# 项目 B 验证记录 — 2026-09-24

任务类型：HAODE 官网公开候选 feed / 广告准备 / 转化追踪。仅独立功能分支交付，不合并 main、不部署、不投放。

## 验收状态

| 验收项 | 状态 | 当前证据 |
| --- | --- | --- |
| 确定性候选 feed / 正确缺失语义 / 防私密字段混入 | PASS | 146 条、132 条原公开主图、14 缺图；全部 price=null、availability=unknown、platform_ready=false；重排源数据输出一致 |
| 本次单元测试 | PASS | 16/16；包含嵌套对象、标量类型、电话分隔符、同意、去重、映射与 Purchase 拒绝 |
| 完整 build | PASS | npm run build 退出0；17 组、81 项单元测试、0失败；产品同步及质量检查通过 |
| 完整浏览器 | PASS | BASE_URL=http://127.0.0.1:4187 npm run browser-test 退出0；198/198，31.0秒 |
| 本次浏览器回归 | PASS | 18/18，包含同意/撤回、成功/空/失败登记、晚加载 Lead/WhatsApp、产品归属、UTM跨页、三页双尺寸 |
| 公开链接/素材只读审计 | PASS | 278 唯一 URL 全部 HTTP200；候选投放字段与当前官网公开源0差异 |
| sitemap、canonical 与抽样 | PASS | 227 路由均HTTP200、canonical一致、无重复；10个抽样产品、38媒体通过 |
| 桌面与移动视觉 | PASS | 三页1280px/390px共6图；两页修正图文重叠和logo，断言桌面184px/移动128px；图片未替换 |
| 独立代码复审 | PASS | 审查员 Laplace，2026-09-24最终确认；33个实现/保护源/证据哈希一致，原4项P2及追加3项P2已关闭，无剩余阻塞 |
| 真实支付/Purchase | NOT CONFIGURED | 没有可信支付完成信号，未伪造Purchase、金额或ROAS |
| Pixel/Conversions API/Ads Manager真实收件 | NOT CONFIGURED | 仅本地事件与纯映射；无SDK、Pixel ID、密钥或外部传输 |
| Feed平台上传资格 | BLOCKED | 0条可直接上传；需真实获批价格、品牌映射、14缺图、广告素材审批及账户/市场/格式确认 |
| 合并main、生产部署、广告上传/发布、Billing | NOT RUN | 不在本次授权范围 |

## 审查修复与测试隔离

独立审查发现并已修复：电话分隔符过滤漏洞、相关商品点击错绑、离开详情残留上下文、脚本晚加载漏Lead；追加修复早期WhatsApp丢失、feed嵌套对象校验不足、映射器隐式类型转换。非阻塞logo断言建议也已落实。

最初完整浏览器测试的两个失败已诊断：一项是隔离真实GA/库存域名导致测试收集DNS错误，增加精确模拟响应且保留断言；另一项是既有campaign脚本异步加载导致产品询价UTM缺失，已补URL净化fallback。最终198项全部通过，没有跳过测试或削弱断言。

浏览器测试以本地站点运行，真实ERP/WhatsApp/Google/OpenAI域名在测试进程隔离；订单登记仅使用模拟响应。未以真实生产业务写入验证。Chromium因沙箱启动限制使用获准的本机启动；没有绕过业务审批。

运行环境：macOS，Node26.7，Playwright1.60；CI配置Node24，远端结果在代码推送后单独记录。没有把本机通过冒充CI或生产验证。

## 证据和所有权

- `verification-manifest.json`：实现、受保护源文件和本地截图/日志SHA256。
- `public-source-audit.json`：2026-09-24T20:42:03Z线上只读快照；官网186，两个ERP公开接口各252。MICA HD仅非导出画廊差异，候选输出字段零差异。
- `local-qa.json`：227路由、10抽样、38媒体原始检查。
- 本地 `artifacts/chatgpt-ads/`：完整日志及6张截图，已忽略，不将截图或node_modules纳入Git交付；路径可在当前worktree查看。
- `data/products.generated.js`、`app/products.json`、`assets/`、`producto/`、`sitemap.xml`相对基线无变更。长期工作区、ERP、CRM、Owner Agent与Automation未写入。
- 远端main只读快照54d7e29e9aae9a00896148a8bfa854ecb0a06827已比指定基线前进，且涉及同名文件；本任务未合并、重置或强推。未来整合需独立处理差异并重新验证。

交付提交与远端SHA在最终交付报告给出。功能分支推送不触发当前仅main触发的Pages发布条件。请勿将本报告的本地准备状态视作真实广告资格或投放成功。
