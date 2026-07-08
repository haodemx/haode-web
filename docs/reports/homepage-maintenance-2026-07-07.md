# HAODE 官网首页检修记录 - 2026-07-07

## 基本信息

- 项目：HAODE 官网
- 仓库：`haode-web`
- 分支：`fix/public-product-sync-safe-20260707`
- 线上域名：`https://haode.com.mx/`
- 检修范围：首页 hero、daily-ad banner、首页分类卡片布局
- 非检修范围：产品数据、价格、产品图片、SEO 结构、额外视觉改版

## 今天发现的问题

2026-07-07 检修后，线上首页首屏版面出现异常：

- hero 右侧主图视觉过大，右侧区域占比偏重。
- desktop 首屏高度被撑高，左侧文字区显得空白明显。
- 新增 daily-ad banner 后，底部分类卡片被推得过低。
- mobile 页面 hero 区过高，分类卡片进入视口过晚。
- 需要确认并避免横向滚动风险。

## 原因 commit

- `e503b9e Add HAODE marketing audit and daily ad draft flow`

该提交涉及首页和样式相关文件：

- `index.html`
- `style.css`
- `script.js`
- `app/app.css`
- `app/app.js`

主要原因：

- 新增 `reference-daily-ad` banner 后，banner 高度和顶部间距偏大，把分类卡片下推。
- 当前首页 hero 使用 `44% / 56%` 左右栏比例，右栏更宽。
- hero 主图卡片宽度为 `min(620px, 96%)`，缺少明确最大高度限制。
- mobile 下 hero 文案、按钮、卖点和主图叠加后整体高度偏高。

## 修复 commit

- `474547d Ajustar layout hero homepage HAODE`

修复策略：

- 只做 `style.css` 局部 CSS 修复。
- 不回滚整页、不重写首页结构。
- 不修改产品数据、不修改价格、不替换图片。
- 不改 SEO meta、canonical、Open Graph、sitemap。

## 修改文件

- `style.css`

主要修改：

- 将首页 hero desktop 双栏改为更均衡的 `1fr / 1fr`。
- 将 hero 主图卡片从 `min(620px, 96%)` 收敛到 `min(560px, 92%)`。
- 为 hero 主图卡片和图片增加 desktop `max-height: 214px`。
- 压缩 daily-ad banner 的 `margin`、`padding`、标题字号和阴影。
- mobile 下压缩 hero 文案间距、按钮间距、卖点条高度。
- mobile 下限制 hero 主图最大高度为 `128px`。
- 保持 `overflow-x` 防护，确认无横向滚动。

## 验证结果

本地验证：

- `npm run build`：PASS
- `npm run browser-test`：PASS
- `git diff --check`：PASS

本地 desktop 布局测量：

- 页面宽度：`scrollWidth 1440` / `clientWidth 1440`
- hero：高度 `277px`
- hero 主图卡片：约 `559 x 213px`
- daily-ad banner：顶部 `343px`，高度 `88px`
- 分类卡片：顶部 `439px`
- 横向滚动：无

本地 mobile 布局测量：

- 页面宽度：`scrollWidth 390` / `clientWidth 390`
- hero：高度 `553px`
- hero 主图卡片：约 `366 x 128px`
- daily-ad banner：顶部 `626px`，高度 `150px`
- 分类卡片：顶部 `784px`
- 横向滚动：无

线上验证：

- `https://haode.com.mx/` 返回 `HTTP/2 200`
- 线上 HTML 已包含 `reference-daily-ad`
- 线上 CSS 已包含修复后的 hero 双栏、主图最大高度和 mobile 限制
- desktop live 验证：hero 主图、daily-ad banner、分类卡片显示正常，无横向滚动
- mobile live 验证：hero 主图、daily-ad banner、分类卡片显示正常，无横向滚动

线上 live 测量结果：

- desktop：
  - hero 高度：`277px`
  - hero 主图卡片：约 `559 x 213px`
  - daily-ad banner：顶部 `343px`，高度 `88px`
  - 分类卡片：顶部 `439px`
  - 横向滚动：无
- mobile：
  - hero 高度：`553px`
  - hero 主图卡片：约 `366 x 128px`
  - daily-ad banner：顶部 `626px`，高度 `150px`
  - 分类卡片：顶部 `784px`
  - 横向滚动：无

## 线上部署状态

- 当前分支：`fix/public-product-sync-safe-20260707`
- 当前分支远端：`origin/fix/public-product-sync-safe-20260707`
- Pages 发布分支：`main`
- `origin/main`：`474547d`
- `origin/fix/public-product-sync-safe-20260707`：`474547d`
- GitHub Pages source：`main /`
- GitHub Pages 状态：`built`
- 线上域名：`https://haode.com.mx/`
- 部署结果：已完成并验证通过

## 后续注意事项

- 首页新增 banner、活动条、APP 入口或推广模块时，必须同步检查 desktop 和 mobile 首屏高度。
- hero 右侧主图必须保留最大高度限制，避免图片按宽度放大后撑高首屏。
- 首页双栏比例不要让右栏明显大于左栏，除非重新做完整视觉验证。
- daily-ad banner 应保持紧凑，不要再次使用大 padding 或大标题字号。
- 分类卡片必须在首屏或接近首屏的位置出现，避免被新增模块挤压过低。
- 每次首页 CSS 变更后至少验证：
  - desktop 首页
  - mobile 首页
  - 横向滚动
  - hero 主图
  - daily-ad banner
  - 分类卡片
- 不要在首页布局检修中顺手修改产品数据、价格、产品图片或 SEO 结构。
