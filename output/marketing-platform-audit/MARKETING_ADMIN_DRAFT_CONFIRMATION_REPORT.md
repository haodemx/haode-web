# HAODE 广告自动化后台确认页报告

生成日期：2026-07-07
分支：`audit/marketing-platform-automation-20260707`
页面地址：`/admin/marketing-drafts/`
数据源：`/data/marketing/daily-ad-latest.json`

## 1. 本阶段目标

新增一个内部广告草稿确认页，用于老板查看每日广告草稿、复制文案、演示确认/驳回状态。
本阶段不接 Facebook/TikTok API，不自动发帖，不部署线上，不合并 main。

## 2. 新增页面功能

页面显示：
- 今日广告标题。
- 主推产品。
- SKU。
- 分类。
- Stock/位置说明。
- Facebook 文案。
- TikTok 文案。
- WhatsApp 文案。
- 官网 banner / App banner 文案。
- 图片/素材提示词。
- 目标平台：官网 banner、App、Facebook、TikTok。
- 文件状态：`draft`。
- 本地演示状态：approved / rejected。

按钮：
- `Aprobar / 确认`：只更新当前浏览器 localStorage 和页面状态。
- `Rechazar / 驳回`：只更新当前浏览器 localStorage 和页面状态。
- `Copiar texto / 复制文案`：复制对应文案；剪贴板权限失败时自动 fallback。

安全提示：
- 页面顶部明确显示：当前只是广告草稿，不会自动发 Facebook/TikTok，发布前必须由老板人工确认。
- 规则区明确说明：不连接 Meta Graph API、不连接 TikTok Content Posting API、不保存 token 或密码。

## 3. 修改文件

新增：
- `admin/marketing-drafts/index.html`
- `admin/marketing-drafts/marketing-drafts.css`
- `admin/marketing-drafts/marketing-drafts.js`
- `output/marketing-platform-audit/marketing-admin-verify.mjs`
- `output/marketing-platform-audit/marketing-admin-verify-results.json`
- `output/marketing-platform-audit/screenshots/marketing-admin-drafts-local.png`
- `output/marketing-platform-audit/MARKETING_ADMIN_DRAFT_CONFIRMATION_REPORT.md`

未修改：
- App 产品加载逻辑。
- WhatsApp 下单逻辑。
- sitemap。
- robots。
- Facebook/TikTok API 或 token。
- ERP 数据库、库存、订单、客户、价格数据。

## 4. 验证结果

后台页本地验证：
- URL：`http://127.0.0.1:8001/admin/marketing-drafts/`
- HTTP：200
- 成功读取 `daily-ad-latest.json`
- 显示产品：`Pantalla iPhone 17 AIR INCELL FHD`
- 显示状态：`draft`
- 禁止自动发帖提示：通过
- Facebook/TikTok/WhatsApp/Banner 文案加载：通过
- Aprobar / Rechazar 状态演示：通过
- Copy fallback：通过
- token 泄漏扫描：未发现 `access_token`、`Page Access Token`、`sk-`
- 截图：`output/marketing-platform-audit/screenshots/marketing-admin-drafts-local.png`

项目验证：
- `git diff --check`：通过
- `npm run build`：通过，errors 0；仍有既有 warnings
- `npm run browser-test`：通过，1 passed

## 5. 风险与限制

- 当前页面是静态内部页，没有真实登录保护；若上线，需要配合站点访问控制或放在只给内部人员知道的路径。
- `Aprobar / Rechazar` 只保存在当前浏览器 localStorage，不会写回 JSON 文件，不是正式审批记录。
- `Copiar texto` 在某些浏览器/权限环境下可能需要用户手动允许剪贴板；已提供 fallback。
- 真实发布仍需老板人工复制到 Facebook/TikTok 或后续接入正式 API 权限。

## 6. 下一步建议

1. 给后台页加简单访问控制或放到受保护的部署路径。
2. 增加正式审批数据文件，例如 `data/marketing/review-log.json`，但必须先确认是否允许前端以外的写入流程。
3. 增加图片生成/下载流程，但不要自动上传社媒。
4. 后续如接 Meta/TikTok API，必须走环境变量/密钥管理，不得写 token 到代码或报告。
