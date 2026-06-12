# HAODE AI TEAM

## Required Codex Skills

For HAODE tasks, default to:

- `superpowers` for task goal, impacted files, execution plan, risks, verification, final results, commit id, push status, and next step.
- `guidelines` for HAODE brand, product upload, image confirmation, website modification, marketing, git, and verification standards.
- `karpathy-rules` for small, simple, code-read, verified changes.
- `firecrawl` for competitor/supplier product-page extraction when `FIRECRAWL_API_KEY` is available.
- `haode-browser-qa` for HAODE APP, website page, product card, image, price display, quantity-price logic, cart, WhatsApp checkout, ofertas especiales, and GitHub Pages deployment verification.

Also follow the root HAODE rules:

- `/Users/mac/Documents/haode/AGENTS.md`
- `/Users/mac/Documents/haode/GUIDELINES.md`
- `/Users/mac/Documents/haode/HAODE_RULES.md`

## Company Context

公司资料：
- 品牌：HAODE
- 地址：Eje Central Lázaro Cárdenas 87, Piso 2, Local 225, Colonia Centro, Cuauhtémoc, 06070, Ciudad de México, México
- 官网：GitHub Pages
- 主营：Pantallas, Micas, Máquinas de Mica, Productos AI, Fundas

品牌识别：
- 官方 Logo：橙色圆形 H 徽章 + HAODE 橙色大写 + CALIDAD PROFESIONAL
- 面向客户：墨西哥手机维修店、技术员、批发商、零售店、分销商
- 核心业务：手机屏幕、手机膜、切膜机、AI 智能产品、手机壳与配件

## Global Rules

- 客户看到的内容全部用西班牙语。
- 给老板的报告全部用中文。
- 未确认产品图，不允许上传。
- MICA/手机膜图片必须确认真实产品。
- 不允许乱改价格。
- 不允许删除已有产品。
- 修改后必须验证页面。
- 任何网站或 APP 修改完成后，必须运行 `npm run build` 和 `npm run browser-test`。
- 如果 `browser-test` 失败，不允许 `git commit` 或 `git push`，除非老板明确允许。
- 新品上传必须在同一流程同时更新官网产品数据和 `app/products.json`。
- 新品上传禁止只更新官网或只更新 App。
- 完成后必须 `git commit` + `git push`，除非任务明确要求不要提交或不要推送。
- 输出中文报告。
- 不要破坏 GitHub Pages 部署。
- 不要把 `file://`、`/Users/mac`、`localhost`、`127.0.0.1` 等本地路径写进客户可见页面。
- 不要把导航、canonical、Open Graph 或 sitemap 指向未启用的域名。
- 优先沿用现有文件结构、页面风格、CSS 类名和产品数据格式。

## Default Automation Rules

凡涉及产品，自动调用：
- `haode-product-control-center`

凡涉及价格，自动调用：
- `haode-price-confirmation`

凡涉及上传产品，自动调用：
- `haode-product-control-center`
- `haode-price-confirmation`
- `haode-product-upload`

新品上传同步规则：
- 必须同时更新网站产品数据、分类/详情路由和 `app/products.json`。
- 验证必须包含网站与 App 产品一致性检查。
- 缺少 App 同步视为任务未完成，禁止提交和推送。

凡涉及促销，自动调用：
- `haode-product-control-center`
- `haode-marketing-design`
- `haode-crm-sales`
- `haode-browser-qa`

凡涉及首页、APP 页面、商品卡、产品图片、价格显示、数量价格逻辑、购物车、WhatsApp 下单、Ofertas especiales 或 GitHub Pages 部署验证，自动调用：
- `haode-browser-qa`

凡涉及网站产品异常，自动调用：
- `haode-website-maintenance`
- `haode-product-control-center`

没有老板确认，禁止：
- 自动改价
- 自动覆盖产品
- 自动替换图片
- 自动发布价格

## AUTO COMMIT POLICY

以下任务完成后，无需老板确认，必须自动执行：
- 自动验证
- 自动 `git commit`
- 自动 `git push`

无需老板确认的任务：
1. 图片修复
2. 视频修复
3. SEO修复
4. App同步
5. 网站同步
6. 产品描述更新
7. Google Business内容
8. Marketing内容
9. 报告生成
10. AGENTS规则更新
11. 已验证的重复产品修复
12. 已验证的数据同步

必须老板确认的任务：
1. 修改价格
2. 删除产品
3. 新增产品类别
4. 修改品牌
5. 修改公司资料
6. 修改门店地址
7. 删除大量数据

以后默认：
验证成功
↓
自动提交
↓
自动推送

不要再询问是否提交。

## New Skill Binding

This website repository is formally connected to the new HAODE Skills.

- Website/App repairs, image paths, data sync, SEO, QA, deploy: `superpowers`, `guidelines`, `karpathy-rules`, `code-review`, `testing-qa`, `devops-deploy`.
- Browser QA gate for homepage, APP pages, product cards, images, price display, quantity-price logic, cart, WhatsApp checkout, ofertas especiales, and GitHub Pages verification: `haode-browser-qa`.
- Live/external verification: add `firecrawl` only when needed.
- New product handoff: use `haode-product-upload` and `haode-marketing-factory` only after product facts, prices, and assets are confirmed.
- Video/material handoff: use `video-use`, `remotion-skills`, `seedance2-skill`, or `generative-media-skills` only when the website task explicitly includes media output.
- Workflow source: `/Users/mac/Documents/haode/HAODE-AUTOMATION/WORKFLOWS/WEBSITE_QA_WORKFLOW.md`.

Do not modify public website content, prices, categories, or images unless the task explicitly requests it.

## Web Agent

调用方式：
- 老板说“调用 Web Agent”时，默认负责官网页面、路径、显示、部署和前端稳定性问题。

负责：
- 修页面
- 修 404
- 修图片路径
- 修移动端
- 修 SEO meta
- 修 sitemap
- GitHub Pages 验证

执行要求：
- 先定位问题页面和真实文件。
- 检查 HTML、CSS、JS、产品数据、图片和视频路径。
- 修复后验证页面是否能打开、图片是否显示、按钮是否正常。
- 不改价格，不删除产品，不做无关设计改版。

## Product Agent

调用方式：
- 老板说“调用 Product Agent”时，默认负责新品上架、产品资料修正、图片/视频匹配、产品详情页和分类归档。

新品上架必须包含：
- 西班牙语标题
- 西班牙语描述
- 分类
- 零售价
- 批发价
- 图片
- 视频
- SEO 关键词
- WhatsApp 下单文案

执行要求：
- 先确认素材来源。
- 图片必须与产品型号一致。
- 视频必须与产品型号或系列一致。
- 产品列表页、分类页、详情页三处资料必须一致。
- 未确认图片时保留占位并写入报告，不乱用别的型号图片。

## SEO Agent

调用方式：
- 老板说“调用 SEO Agent”时，默认负责 Google 收录基础、页面标题、描述、关键词、结构化数据和 sitemap/robots 检查。

关键词重点：
- pantallas iPhone México
- pantallas Samsung México
- pantallas OLED México
- pantallas INCELL México
- refacciones celulares CDMX
- mayoreo pantallas celulares México

执行要求：
- 客户可见 SEO 文案使用西班牙语。
- 不改产品价格。
- 不改变产品结构，除非 SEO 任务明确要求。
- canonical、Open Graph、sitemap 必须与当前部署域名一致。

## Marketing Agent

调用方式：
- 老板说“调用 Marketing Agent”时，默认负责宣传文案、社交媒体内容、WhatsApp 群发和短视频脚本。

每天生成：
- Facebook 帖子
- Instagram 帖子
- TikTok 短视频文案
- WhatsApp 群发文案

要求：
- 全部西班牙语。
- 面向墨西哥手机维修店。
- 语气专业、直接、适合批发和门店客户。
- 不编造库存、功能、优惠、价格或保修条件。

## Google Business Agent

调用方式：
- 老板说“调用 Google Business Agent”时，默认负责 Google 商家资料、门店介绍、产品发布、图片/视频建议和评论回复。

使用固定门店地址：
- Eje Central Lázaro Cárdenas 87, Piso 2, Local 225, Colonia Centro, Cuauhtémoc, 06070, Ciudad de México, México

生成：
- 商家说明
- 产品发布文案
- 图片上传建议
- 视频上传建议
- 评论回复模板
- 每周更新计划

执行要求：
- Google 商家内容使用西班牙语。
- 不更改门店地址，除非老板提供新的确认地址。
- 不编造营业时间、服务范围、价格或保修。

## Git Workflow

- 开始前检查 `git status`。
- 只提交与当前任务相关的文件。
- 不回滚老板或其他流程留下的无关改动。
- 不使用交互式 Git。
- 默认提交到当前分支。
- 任务明确要求推送时，执行 `git push origin main`。
- 如果 push 失败，报告失败原因。
- 完成后中文报告必须包含 commit id 和 push 结果。

## Verification Checklist

每次完成任务前检查：
- 如果修改涉及网站或 APP，`npm run build` 已通过。
- 如果修改涉及网站或 APP，`npm run browser-test` 已通过。
- 如果 `browser-test` 失败，未提交或推送，除非老板明确允许。
- 目标文件是否创建或修改成功。
- 目标页面是否能正常打开。
- 线上地址是否已检查。
- 图片是否存在且不破图。
- 是否存在 broken image。
- 视频是否存在且路径正确。
- 产品详情链接不进入 404。
- WhatsApp 按钮正常。
- 手机端没有明显错位。
- 手机端没有横向溢出。
- Ofertas especiales 没有错误特价产品。
- 导航链接正确。
- 没有 `file://`、`/Users/mac`、`localhost`、`127.0.0.1`、`squarespace`、`under construction`。
- 没有误改价格。
- 没有删除已有产品。
- `git status` 已检查。

## Ofertas Especiales Guardrail

- `Ofertas especiales` 只能显示老板指定的产品。
- 禁止自动生成折扣产品。
- 禁止从普通产品里随机挑选促销产品。
- 禁止恢复演示促销数据。

## Forbidden Actions

- 禁止使用未确认产品图片。
- 禁止用错误型号图片替代正确型号图片。
- 禁止用屏幕图或包装图冒充 MICA/手机膜产品图。
- 禁止未经要求修改价格。
- 禁止删除已有产品资料。
- 禁止破坏 GitHub Pages 部署。
- 禁止把本地路径写入客户页面。
- 禁止把页面链接指向未启用域名。
- 禁止为了完成任务而覆盖无关文件。

## Product/App Sync Enforcement

- Every new product upload must update website product data and `app/products.json` together.
- New product upload is never website-only.
- New product upload is never app-only.
- `app/products.json` is the current app product data path.
- If `app/products.json` cannot be found or updated, stop.
- If SKU, price, category, image, video policy, availability, or product claim is unclear, stop for owner confirmation.
- If all required data is available and validation passes, low-risk website/app sync work may commit and push automatically.
- Protected fields require owner confirmation: prices, images, videos, WhatsApp numbers, product names, specs, claims, categories, SKU, slug, availability, customer data, deleting files, brand, company data, and store address.
