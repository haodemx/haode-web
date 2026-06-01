# Reporte Fix de enlaces y素材 iPhone INCELL

## Resumen
- Total enlaces iPhone INCELL verificados: **31**
- Total 404 en enlaces de detalle: **0**
- Estrategia de enlace: `categoria/category-page.js` usa `producto.html?id=<id>` para `iphone-incell`.

## 修复前 404 链接（旧路由）
- Formato anterior: `/haode-web/producto/<id>/`
- 该格式对 iPhone INCELL 多型号会进入 404。

## 修复后正确链接（新路由）
- Formato actual: `/haode-web/producto.html?id=<id>`

## 新增/补齐型号与素材映射（来自苹果系列文件夹）
- `16` → `iPhone 16` → `assets/products/iphone-incell/16/`
- `16e` → `iPhone 16e` → `assets/products/iphone-incell/16e/`
- `16Plus` → `iPhone 16 Plus` → `assets/products/iphone-incell/16plus/`
- `16Pro` → `iPhone 16 Pro` → `assets/products/iphone-incell/16pro/`
- `16ProMax` → `iPhone 16 Pro Max` → `assets/products/iphone-incell/16promax/`
- `17` → `iPhone 17` → `assets/products/iphone-incell/17/`
- `17air` → `iPhone 17 Air` → `assets/products/iphone-incell/17air/`
- `17pro` → `iPhone 17 Pro` → `assets/products/iphone-incell/17pro/`
- `17promax` → `iPhone 17 Pro Max` → `assets/products/iphone-incell/17promax/`

## 每个型号对应的实际详情页文件
- 所有 iPhone INCELL 型号详情页均走：`/Users/mac/Documents/haode/haode-web/producto.html`
- 通过 `?id=<modelo>` 动态加载对应型号，不再走不存在目录。

## 是否新增 index.html
- 否

## 是否修改分类页 href
- 是（`categoria/category-page.js`）

## NEED_CONFIRMATION
- `iPhone 17e`：未在素材目录发现 `17e` 文件夹，未创建该型号，避免乱配图。

## 当前结果
- iPhone INCELL 分类页：可打开
- 每个 iPhone INCELL 详情链接：返回 200
- 已补齐型号主图：均为真实图片（非占位图）
- 仍有 404：无
