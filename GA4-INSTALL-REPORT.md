# GA4-INSTALL-REPORT

Measurement ID: `G-22TCLJDXYS`

## 接入方式

- 使用 Google 官方 `gtag.js` 代码。
- 代码放在每个目标 HTML 页面 `</head>` 之前。
- 未修改产品内容、价格、图片、SEO canonical 或 sitemap。

## 修改文件列表

- `categoria/camaras-inteligentes/index.html`
- `categoria/gafas-inteligentes-ai/index.html`
- `categoria/index.html`
- `categoria/iphone-incell/index.html`
- `categoria/iphone-oled/index.html`
- `categoria/maquinas-de-hidrogel/index.html`
- `categoria/pantallas/index.html`
- `categoria/productos-ai/index.html`
- `categoria/samsung-incell/index.html`
- `categoria/samsung-oled/index.html`
- `garantia/index.html`
- `garantia.html`
- `index.html`
- `producto/funda-magnetica-estilo-iphone-17-pro-max/index.html`
- `producto/funda-premium-aluminio-estilo-iphone-17-pro-max/index.html`
- `producto/index.html`
- `producto/iphone-11-incell/index.html`
- `producto/iphone-11-pro-incell/index.html`
- `producto/iphone-11-pro-max-incell/index.html`
- `producto/iphone-11-pro-max-oled/index.html`
- `producto/iphone-12-mini-incell/index.html`
- `producto/iphone-12-pro-max-incell/index.html`
- `producto/iphone-12-pro-max-oled/index.html`
- `producto/iphone-13-incell/index.html`
- `producto/iphone-13-mini-incell/index.html`
- `producto/iphone-13-oled/index.html`
- `producto/iphone-13-pro-incell/index.html`
- `producto/iphone-13-pro-max-incell/index.html`
- `producto/iphone-13-pro-max-oled/index.html`
- `producto/iphone-13-pro-oled/index.html`
- `producto/iphone-14-incell/index.html`
- `producto/iphone-14-oled/index.html`
- `producto/iphone-14-plus-incell/index.html`
- `producto/iphone-14-plus-oled/index.html`
- `producto/iphone-14-pro-incell/index.html`
- `producto/iphone-14-pro-max-incell/index.html`
- `producto/iphone-14-pro-max-oled/index.html`
- `producto/iphone-15-incell/index.html`
- `producto/iphone-oled-11/index.html`
- `producto/iphone-oled-11pro/index.html`
- `producto/iphone-oled-11promax/index.html`
- `producto/iphone-oled-12-12pro/index.html`
- `producto/iphone-oled-12mini/index.html`
- `producto/iphone-oled-12pro/index.html`
- `producto/iphone-oled-12promax/index.html`
- `producto/iphone-oled-13/index.html`
- `producto/iphone-oled-13mini/index.html`
- `producto/iphone-oled-13pro/index.html`
- `producto/iphone-oled-13promax/index.html`
- `producto/iphone-oled-14/index.html`
- `producto/iphone-oled-14plus/index.html`
- `producto/iphone-oled-14pro/index.html`
- `producto/iphone-oled-14promax/index.html`
- `producto/iphone-oled-15/index.html`
- `producto/iphone-oled-15plus/index.html`
- `producto/iphone-oled-15promax/index.html`
- `producto/iphone-oled-16/index.html`
- `producto/iphone-oled-16plus/index.html`
- `producto/iphone-oled-16pro/index.html`
- `producto/iphone-oled-16promax/index.html`
- `producto/iphone-oled-x/index.html`
- `producto/iphone-oled-xsmax/index.html`
- `producto/iphone-x-incell/index.html`
- `producto/iphone-xr-incell/index.html`
- `producto/iphone-xs-incell/index.html`
- `producto/iphone-xs-max-oled/index.html`
- `producto/lk-030-mini-camara-retro-digital/index.html`
- `producto/lk-032-camara-inteligente-con-gimbal/index.html`
- `producto/samsung-note-20-ultra-incell/index.html`
- `producto/samsung-s20-incell/index.html`
- `producto/samsung-s20-plus-oled/index.html`
- `producto/samsung-s21-incell/index.html`
- `producto/samsung-s21-ultra-oled/index.html`
- `producto/samsung-s22-ultra-incell/index.html`
- `producto/samsung-s22-ultra-oled/index.html`
- `producto/samsung-s23-ultra-incell/index.html`
- `producto/samsung-s23-ultra-oled/index.html`
- `producto/samsung-s24-ultra-incell/index.html`
- `producto/samsung-s24-ultra-oled/index.html`
- `producto/samsung-s25-ultra-oled/index.html`
- `producto/x200t-cortadora-inteligente-de-micas/index.html`
- `producto.html`
- `productos/index.html`
- `productos.html`

## 接入页面数量

- 本次扫描目标页面：84
- 本次新增 GA4 页面：84
- 原本已存在 GA4 页面：0
- 未找到 `</head>` 的页面：0

## 是否发现重复 GA4

未发现重复 GA4。每个目标页面均只有 1 个 `gtag.js` script 和 1 个 `gtag config`。

## 如何验证实时数据

1. 打开 Google Analytics。
2. 进入对应 GA4 属性。
3. 打开 `Informes` / `Reports` -> `Tiempo real` / `Realtime`。
4. 在浏览器打开 `https://haode.com.mx/`。
5. 等待 10 到 60 秒，Realtime 中应出现 1 个来自当前城市/设备的访问。
6. 再打开一个产品详情页，例如 `https://haode.com.mx/producto/iphone-11-incell/`，确认 Realtime 的页面路径变化。

## 验证结果

- 本地代码检查：通过。
- 重复代码检查：通过。
- 线上实时数据：需要 push 并等待 GitHub Pages 部署后，在 GA4 Realtime 手动确认。
