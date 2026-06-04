# HAODE AI 团队第一次总检查报告

检查日期：2026-06-04

调用角色：CEO Agent

读取文件：
- `AGENTS.md`
- `docs/HAODE-AI-TEAM-USAGE.md`
- `docs/agents/*.md`
- `docs/tasks/*.md`

## 一、今日最重要 5 件事

1. 立即修复 `iPhone 16 INCELL` 主图错误。
   当前文件 `assets/products/iphone-incell/16/main.jpg` 实际显示的是 iPhone 11 图，不符合 iPhone 16 产品。这个问题会影响产品列表、iPhone INCELL 分类页、产品详情页和客户判断。

2. 检查 `Productos AI` 页面仍在使用占位图的分类。
   `productos-ai.html` 中 `Traductores Inteligentes` 和 `Accesorios AI` 仍引用 `assets/products/placeholder.svg`。这不是 404，但会降低转化率，建议 Product Agent 后续用确认素材替换。

3. 统一 Micas / Máquinas 页面里的旧用词。
   当前 `micas.html`、`categoria/maquinas-de-hidrogel/index.html`、`producto/x200t-cortadora-inteligente-de-micas/index.html` 中仍有 `películas` 相关表达。建议 Web Agent 或 SEO Agent 后续统一为更适合墨西哥维修行业的 `Micas`。

4. 检查首页视频体积和加载速度。
   `assets/videos/showcase/showcase-02.mp4` 约 41MB，首页加载可能偏重。建议 Web Agent 后续压缩到更适合 GitHub Pages 和手机端的大小。

5. 做一次关键页面真实浏览器验证。
   文件层扫描未发现客户页面残留 `file://`、`/Users/mac`、`localhost`、`haodemexico.com`、`squarespace`、`under construction`、`Imagen no disponible`，但仍建议今天用浏览器检查：首页、productos、productos-ai、micas、iPhone INCELL 分类页、iPhone 16 详情页。

## 二、当前官网最重要问题

- 最严重问题：`iPhone 16 INCELL` 图片与型号不对应。
- 中等问题：`Productos AI` 两个分类仍使用占位图。
- 中等问题：部分 Micas 文案仍有旧词 `películas`。
- 中等问题：首页视频文件偏大，可能影响手机端加载。
- 轻微问题：sitemap 中同时存在 `.html` 页面和目录型页面，后续 SEO Agent 可做一致性整理。

## 三、产品图片/视频是否还有缺失

本次只做检查，不改网站。

已确认：
- `assets/products/placeholder.svg` 存在。
- `assets/products/productos-ai/aimb-g5-ai-smart-glasses/main.jpg` 存在。
- `assets/products/iphone-incell/16/main.jpg` 存在，但图片内容错误。
- 客户可见 HTML / JS 里未发现明显图片 404。

需要后续确认：
- `iPhone 16 INCELL` 正确素材需要从 `HAODE产品素材 -> iphone incell -> 苹果系列 -> iPhone 16` 恢复。
- `Traductores Inteligentes` 和 `Accesorios AI` 是否有确认图片。
- 首页视频 `iPhone OLED Premium` 和 `Samsung OLED con marco` 是否与当前素材完全对应，建议下次用浏览器逐个播放确认。

## 四、首页和分类页是否正常

文件层检查结果：
- 首页 `index.html` 存在。
- `productos.html` 存在。
- `productos-ai.html` 存在。
- `micas.html` 存在。
- `categoria/` 下共有 10 个 `index.html`。
- `producto/` 下共有 142 个产品详情页。

当前判断：
- 页面文件结构基本正常。
- 没有发现目录型分类页缺失。
- 需要浏览器复查手机端显示和首页视频加载。

## 五、SEO 是否还有明显缺口

当前状态：
- `robots.txt` 已指向 `https://haodemx.github.io/haode-web/sitemap.xml`。
- `sitemap.xml` 存在并包含首页、productos、productos-ai、分类页和大量产品详情页。

明显缺口：
- Micas 相关页面还有 `películas` 用词，建议统一到 `Micas`。
- sitemap 中有部分 `.html` URL 和目录 URL 混用，后续可以统一。
- 不建议今天大改 SEO，因为今天最高优先级是图片和转化问题。

## 六、Google Business 今天应该发什么

建议主题：手机屏幕现货与门店服务。

建议发布方向：
- 强调 HAODE 位于 CDMX。
- 强调 Pantallas、Micas、Productos AI 可供技术员和维修店咨询。
- 不显示具体价格。
- 配图优先使用门店、真实产品、屏幕库存或新品 AI 产品图。

建议西班牙语文案主题：
- `Stock local en CDMX para técnicos y tiendas de reparación. En HAODE manejamos pantallas, micas, máquinas de mica, productos AI y fundas. Cotiza por WhatsApp y consulta disponibilidad.`

## 七、Marketing Agent 今天应该生成什么内容

建议今日宣传主题：`Pantallas para técnicos y distribuidores en CDMX`

建议生成：
- Facebook 帖子：强调 Pantallas iPhone / Samsung，面向维修店。
- Instagram 帖子：用产品图展示 `Stock local en CDMX`。
- TikTok 短视频文案：展示屏幕测试、包装、发货、门店现货。
- WhatsApp 群发文案：提醒客户可咨询 Pantallas、Micas、Productos AI 和 Fundas。

不建议今天生成：
- 明确价格促销内容。
- 未确认库存承诺。
- 未确认图片的新产品宣传。

## 八、每个 Agent 下一步任务

CEO Agent：
- 安排今天只做稳定和转化优先任务，不开启新产品大上架。

Web Agent：
- 用浏览器检查首页、productos、productos-ai、micas、categoria/iphone-incell、producto/iphone-incell-16。
- 检查首页视频加载速度。
- 后续压缩 `showcase-02.mp4`。

Product Agent：
- 修复 `iPhone 16 INCELL` 正确主图。
- 复查 iPhone 16 的列表页、分类页、详情页三处一致。
- 检查 Productos AI 的占位图是否有确认素材。

SEO Agent：
- 后续统一 Micas 页面里 `películas` 旧词。
- 检查 sitemap URL 是否需要统一目录型路径。

Marketing Agent：
- 生成今天的 Facebook、Instagram、TikTok、WhatsApp 文案。
- 主题围绕 `Pantallas para técnicos y distribuidores en CDMX`。

Google Business Agent：
- 生成今天 Google 商家更新。
- 主题围绕 `Stock local en CDMX` 和 `Pantallas / Micas / Productos AI`。

## 九、哪些任务适合今天做

- 修复 `iPhone 16 INCELL` 图片。
- 替换 Productos AI 中仍使用占位图的分类图片，但必须先确认素材。
- 浏览器验证首页、分类页和产品页。
- 生成今天营销文案和 Google Business 更新。
- 压缩首页过大的视频。

## 十、哪些任务暂时不要做

- 不要新增产品。
- 不要改价格。
- 不要删除产品资料。
- 不要切换自定义域名。
- 不要大改 SEO。
- 不要重做首页整体设计。
- 不要使用未确认图片替换产品图。

## 十一、是否需要修改官网

需要。

建议今天优先修改：
- `iPhone 16 INCELL` 错误图片。
- `Productos AI` 占位图。
- Micas 旧用词。

本次任务只生成报告，未修改官网页面。
