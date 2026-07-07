# HAODE 网站/App/Facebook/TikTok 检查与每日广告自动化方案

生成日期：2026-07-07  
工作分支：`audit/marketing-platform-automation-20260707`  
范围：官网 `haode.com.mx`、`/productos/`、`/app/`、公开 Facebook/TikTok 页面、每日广告生成 MVP。  
限制：未登录 Facebook/TikTok 后台；未写入 ERP；未 seed、migrate、reset；未自动发帖；未写入任何 API token。

## 1. 结论摘要

- 官网首页、`/productos/`、`/app/`、`robots.txt`、`sitemap.xml` 线上均可打开，状态 200。
- App 页面线上可以加载产品，不是完全失败；浏览器诊断显示 `productosActivos: 144`、`productosVisibles: 144`。
- App 当前前端最终使用 `products.json`，未成功并入 `erp public-stock.json`；本地验证时 public-stock 被 CORS 拦截，线上审计也显示数据源为 `products.json`。
- 官网和 App 发现旧 WhatsApp `332 668 4296 / 523326684296`，已统一为 `5645866014 / 525645866014`。
- Facebook 链接能打开到 `Display Celular HL Cdmx`，但公开资料仍显示旧品牌 HL 和旧电话 `3326684296`，需要老板用后台权限人工改。
- TikTok 链接 `https://www.tiktok.com/@haodemx` 移动端公开页可打开，账号说明为 `Pantallas • Accesorios.Herramientas Mayoreo y menudeo 🇲🇽 Envíos a todo México`；桌面端有 TikTok 反爬/403 噪音，但移动公开页可确认账号。
- 未发现 Google Play / App Store 假图标。
- 未发现官网/App 当前检查页面的坏图。
- 已实现安全 MVP：每日广告 JSON 草稿生成、官网/App banner 读取草稿展示、Facebook/TikTok/WhatsApp 文案生成字段、待发布状态 `draft`。

## 2. 截图与证据

线上审计截图：
- `output/marketing-platform-audit/screenshots/home-desktop.png`
- `output/marketing-platform-audit/screenshots/home-mobile.png`
- `output/marketing-platform-audit/screenshots/productos-desktop.png`
- `output/marketing-platform-audit/screenshots/app-desktop.png`
- `output/marketing-platform-audit/screenshots/app-mobile.png`
- `output/marketing-platform-audit/screenshots/facebook-desktop.png`
- `output/marketing-platform-audit/screenshots/facebook-mobile.png`
- `output/marketing-platform-audit/screenshots/tiktok-desktop.png`
- `output/marketing-platform-audit/screenshots/tiktok-mobile.png`

修复后本地截图：
- `output/marketing-platform-audit/screenshots/local-home-desktop.png`
- `output/marketing-platform-audit/screenshots/local-home-mobile.png`
- `output/marketing-platform-audit/screenshots/local-app-desktop.png`
- `output/marketing-platform-audit/screenshots/local-app-mobile.png`

机器可读结果：
- `output/marketing-platform-audit/live-audit-results.json`
- `output/marketing-platform-audit/local-verify-results.json`

## 3. 官网检查结果

检查 URL：
- `https://haode.com.mx/`
- `https://haode.com.mx/productos/`
- `https://haode.com.mx/app/`
- `https://haode.com.mx/#pantallas`
- `https://haode.com.mx/#productos-ai`
- `https://haode.com.mx/#micas`
- `https://haode.com.mx/#contacto`
- `https://haode.com.mx/robots.txt`
- `https://haode.com.mx/sitemap.xml`

结果：
- 首页 200，产品页 200，App 200，robots 200，sitemap 200。
- 首页和产品页 SEO title/description 基本合理，定位为 pantallas iPhone/Samsung、mayoreo、CDMX。
- `robots.txt` 指向 `https://haode.com.mx/sitemap.xml`，正常。
- 页面没有发现坏图。
- 手机端截图可打开，没有明显横向溢出证据。
- 首页旧 WhatsApp 已修复为 `5645866014`。
- 地址已统一为：`Eje Central Lázaro Cárdenas 87, Piso 2, Local 225, Colonia Centro, Centro, Cuauhtémoc, 06070 Ciudad de México, CDMX`。
- 首页 `/#pantallas`、`/#productos-ai`、`/#micas`、`/#contacto` 可返回 200，但首页本身没有这些锚点内容，实际产品入口在 `/productos/` 和 `/productos-ai/`；这是导航/SEO体验问题，不是打不开。
- 未发现 APP 二维码组件；当前是 PWA/install banner 逻辑，不是二维码安装路径。

## 4. App 检查结果

结果：
- `/app/` 线上 200。
- `app/products.json` 线上 200。
- `erp.haode.com.mx/public-stock.json` URL 本身 200。
- App 未出现实际的 “No se pudieron cargar los productos” 失败状态。
- App 线上诊断：`productosActivos: 144`、`productosVisibles: 144`、`fuente: products.json`。
- 分类入口可见：Pantallas、Micas、AI、Fundas、Accesorios。
- 购物车、数量调整、客户信息、WhatsApp 链接由 `npm run browser-test` 覆盖，测试通过。
- App 安装按钮是 PWA `beforeinstallprompt` 触发逻辑；没有显示假的 Google Play / App Store。
- App 下单 WhatsApp 已统一为 `525645866014`。
- 本地 App 访问 ERP public-stock 出现 CORS 拦截，但产品仍从 `products.json` 正常加载；这说明当前 App 对 ERP 库存是增强读取，不是下单阻断。

## 5. Facebook / TikTok 检查结果

Facebook：
- 官网链接：`https://www.facebook.com/cristi3an/`
- 公开页标题：`Display Celular HL Cdmx | Facebook`
- 状态：可打开到指定公开页。
- 问题：公开资料仍含旧品牌 `HL` 和旧电话 `3326684296`。
- 处理：网站仓库不能修改 Facebook 公开资料；需要老板进入 Page 后台改名称/简介/电话/地址/头像封面。

TikTok：
- 官网链接：`https://www.tiktok.com/@haodemx`
- 移动端公开页可确认账号 `haodemx`。
- 公开说明包含 pantallas、accesorios、herramientas、mayoreo/menudeo、envíos a México。
- 桌面端有 TikTok 反爬/403 控制台噪音；不等于链接错误。
- 未登录后台，无法确认近期内容完整列表、粉丝数据、后台资料。

## 6. P0 / P1 / P2 / P3

P0：
- 无。官网、产品页、App、社媒链接都没有发现完全打不开或跳到明显错误账号的问题。

P1：
- 已修复：官网/App/产品页旧 WhatsApp `332 668 4296 / 523326684296`。
- 已修复：产品页多个 WhatsApp chip 分流问题，统一为官方 WhatsApp + Tel。
- 已修复：App 下单 WhatsApp 号码统一。
- 已修复：App 产品描述里的 `HL CDMX 2026 06` 客户可见旧品牌来源文案，改为 HAODE。
- 待老板后台处理：Facebook 公开页仍显示 `Display Celular HL Cdmx` 和旧电话。

P2：
- App 前端读取 `erp public-stock.json` 未并入成功，当前 fallback 到 `products.json`；需要 ERP CORS/公开字段策略配合。
- 首页 `/#pantallas`、`/#productos-ai`、`/#micas`、`/#contacto` 是 200 但不是有效首页锚点，建议后续统一到真实产品/联系区锚点。
- sitemap/build 检查有既有 warnings：部分产品详情页 sitemap entry 缺失、部分视频字段缺失、部分 App/Web 产品未完全同步；本次未动价格/产品结构，不在 P0/P1 修复范围。
- Facebook/TikTok 近期内容与品牌统一需要后台或人工公开页复查。

P3：
- 后台“系统 -> 广告自动化”确认页尚未实现，只完成了安全 MVP 的 JSON 队列和前台 banner 读取。
- 自动图片生成/下载按钮尚未接入。
- 发布排期 UI 尚未接入。

## 7. 已修复内容

- 统一官网、产品页、App、分类页、详情页 WhatsApp 链接到 `https://wa.me/525645866014`。
- 统一客户可见电话为 `5645866014`。
- 官网页脚和联系页地址统一为老板指定地址。
- 移除产品页重复 WhatsApp chip，保留官方 WhatsApp 和 Tel。
- App 文案中旧 `HL CDMX 2026 06` 改为 HAODE 来源表述。
- 新增每日广告草稿：
  - `data/marketing/daily-ad-20260707.json`
  - `data/marketing/daily-ad-latest.json`
- 新增生成脚本：
  - `scripts/generate-daily-ad.mjs`
- 官网首页新增读取 `daily-ad-latest.json` 的每日广告 banner。
- App 首页新增读取 `daily-ad-latest.json` 的每日广告 banner。
- Service Worker 将 `data/marketing/daily-ad-*` 视为 fresh data，避免缓存旧广告。

## 8. 每日广告自动化 MVP 设计

第一阶段已实现：
- 每天生成一个 JSON 草稿。
- JSON 字段包含：
  - `date`
  - `main_category`
  - `main_product`
  - `sku`
  - `stock_location`
  - `stock_qty`
  - `headline_es`
  - `caption_facebook_es`
  - `caption_tiktok_es`
  - `caption_whatsapp_es`
  - `website_banner_title`
  - `website_banner_subtitle`
  - `app_banner_title`
  - `app_banner_subtitle`
  - `cta_whatsapp`
  - `image_prompt`
  - `status`
- 状态固定为 `draft`，不自动发布。
- 公开库存如果没有数量字段，`stock_qty` 写 `null`，不编造数量。
- 官网/App banner 只展示草稿主题和 WhatsApp CTA，不展示未经确认的折扣、库存数量或价格。

建议后续后台页面：
- 路径：系统 -> 广告自动化。
- 模块：
  - 今日主推产品
  - 自动生成文案
  - 自动生成图片占位
  - Facebook 文案
  - TikTok 文案
  - WhatsApp 文案
  - 官网 Banner 文案
  - APP Banner 文案
  - 老板确认按钮
  - 标记已发布
  - 复制文案
  - 下载图片
- 状态流转：
  - `draft` -> `approved` -> `published`
- 发布原则：
  - `draft` 只给老板看和前台测试。
  - `approved` 才能进入人工发布队列。
  - `published` 只记录手动已发布，不代表自动发帖。

## 9. 后续自动发帖要求

Facebook 自动发布需要：
- Meta Business。
- Facebook Page ID。
- Page Access Token。
- 长期 token。
- Graph API 权限。
- 发布审核。
- 不能把 token 写进代码或报告，必须走环境变量/密钥管理。

TikTok 自动发布需要：
- TikTok Developer App。
- Content Posting API 权限。
- 账号授权。
- 视频素材。
- 发布审核。
- 不能使用私人账号密码。

当前建议：不要进入真正自动发帖。先做“自动生成 + 老板确认 + 手动发布 + 标记已发布”。

## 10. 验证结果

已执行：
- `git diff --check`：通过。
- `npm run build`：通过，status PASS，errors 0；有既有 warnings。
- `npm run browser-test`：第一次因 macOS Chromium 权限失败，授权模式重跑通过，1 passed。
- `node scripts/generate-daily-ad.mjs`：沙箱内公网读取失败后 fallback；授权模式重跑成功读取公开库存并生成 JSON。
- 本地浏览器截图验证：官网/App banner 可见，旧号码不可见，目标号码可见，无坏图。

未执行：
- `npm run lint`：`package.json` 没有 lint script。
- `npm run test`：`package.json` 没有 test script；本项目实际浏览器测试为 `npm run browser-test`。

## 11. 下一步需要老板提供

- 是否允许后台实现“系统 -> 广告自动化”确认页。
- Facebook Page 后台授权人员，由老板人工修改公开资料里的 HL 旧品牌和旧电话。
- 是否要把 TikTok 简介统一成 HAODE 标准文案。
- 是否允许 ERP 配置 `public-stock.json` 的 CORS 给 `https://haode.com.mx`，让 App 能并入实时公开库存。
- 是否确认每日广告主推优先级：AI 产品、手机壳去库存、屏幕重点型号、MICA 热卖但不乱促销。
