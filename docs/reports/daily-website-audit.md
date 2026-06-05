# HAODE 官网每日审计报告

生成日期：2026-06-05

## 审计范围

- HTML 页面：174
- 网站产品数据：93
- 检查项：404 页面、站内死链接、空白页面、分类页、首页按钮、产品封面图、图片路径、视频路径、title、meta description、Open Graph、JSON-LD、sitemap.xml、robots.txt。

## 发现的问题

- SEO: categoria/camaras-inteligentes/index.html: JSON-LD 缺失
- SEO: categoria/gafas-inteligentes-ai/index.html: JSON-LD 缺失
- SEO: categoria/index.html: JSON-LD 缺失
- SEO: categoria/iphone-incell/index.html: JSON-LD 缺失
- SEO: categoria/iphone-oled/index.html: JSON-LD 缺失
- SEO: categoria/maquinas-de-hidrogel/index.html: JSON-LD 缺失
- SEO: categoria/pantallas/index.html: JSON-LD 缺失
- SEO: categoria/samsung-incell/index.html: JSON-LD 缺失
- SEO: categoria/samsung-oled/index.html: JSON-LD 缺失
- SEO: distribuidores/index.html: og:title 缺失
- SEO: distribuidores/index.html: og:description 缺失
- SEO: distribuidores/index.html: og:image 缺失
- SEO: distribuidores/index.html: JSON-LD 缺失
- SEO: micas/index.html: og:title 缺失
- SEO: micas/index.html: og:description 缺失
- SEO: micas/index.html: og:image 缺失
- SEO: micas/index.html: JSON-LD 缺失
- SEO: productos-ai.html: JSON-LD 缺失
- SEO: productos-ai/index.html: JSON-LD 缺失
- 产品视频缺失: iphone-oled-16promax | Pantalla para iPhone 16 Pro Max Soft OLED | 空
- 产品视频缺失: samsung-incell-note-10-plus | Pantalla para Samsung Note 10 Plus | 空
- 产品视频缺失: samsung-incell-note-20-ultra | Pantalla para Samsung Note 20 Ultra | 空
- 产品视频缺失: samsung-incell-note-8 | Pantalla para Samsung Note 8 | 空
- 产品视频缺失: samsung-incell-note-9 | Pantalla para Samsung Note 9 | 空
- 产品视频缺失: samsung-incell-s20-ultra | Pantalla para Samsung S20 Ultra | 空
- 产品视频缺失: samsung-incell-s21 | Pantalla para Samsung S21 | 空
- 产品视频缺失: samsung-incell-s21-ultra | Pantalla para Samsung S21 Ultra | 空
- 产品视频缺失: samsung-incell-s24-ultra | Pantalla para Samsung S24 Ultra | 空
- 产品视频缺失: samsung-incell-s8 | Pantalla para Samsung S8 | 空
- 产品视频缺失: samsung-incell-s9 | Pantalla para Samsung S9 | 空
- 产品视频缺失: samsung-incell-s9-plus | Pantalla para Samsung S9 Plus | 空
- 产品视频缺失: samsung-oled-note-10 | Pantalla para Samsung Note 10 | 空
- 产品视频缺失: samsung-oled-note-10-plus | Pantalla para Samsung Note 10 Plus | 空
- 产品视频缺失: samsung-oled-note-20 | Pantalla para Samsung Note 20 | 空
- 产品视频缺失: samsung-oled-note-20-ultra | Pantalla para Samsung Note 20 Ultra | 空
- 产品视频缺失: samsung-oled-note-9 | Pantalla para Samsung Note 9 | 空
- 产品视频缺失: samsung-oled-s20 | Pantalla para Samsung S20 | 空
- 产品视频缺失: samsung-oled-s20-ultra | Pantalla para Samsung S20 Ultra | 空
- 产品视频缺失: samsung-oled-s21 | Pantalla para Samsung S21 | 空
- 产品视频缺失: samsung-oled-s21-plus | Pantalla para Samsung S21 Plus | 空
- 产品视频缺失: samsung-oled-s22-plus | Pantalla para Samsung S22 Plus | 空
- 产品视频缺失: samsung-oled-s23-plus | Pantalla para Samsung S23 Plus | 空
- 产品视频缺失: samsung-oled-s24-plus | Pantalla para Samsung S24 Plus | 空
- 产品视频缺失: samsung-oled-s9-plus | Pantalla para Samsung S9 Plus | 空
- 产品视频缺失: iphone-incell-16e | Pantalla para iPhone 16e | 空
- 产品视频缺失: iphone-incell-16plus | Pantalla para iPhone 16 Plus | 空
- 产品视频缺失: iphone-incell-16pro | Pantalla para iPhone 16 Pro | 空
- 产品视频缺失: iphone-incell-16promax | Pantalla para iPhone 16 Pro Max | 空
- 产品视频缺失: iphone-incell-17 | Pantalla para iPhone 17 | 空
- 产品视频缺失: iphone-incell-17air | Pantalla para iPhone 17 Air | 空
- 产品视频缺失: iphone-incell-17pro | Pantalla para iPhone 17 Pro | 空
- 产品视频缺失: iphone-incell-17promax | Pantalla para iPhone 17 Pro Max | 空

## 已修复内容

- 修复 `scripts/test-catalog-filters.js`：移除过期的 86 个产品硬编码，改为根据当前产品数据动态计算分类数量。
- 新增 `scripts/daily-website-audit.js`：可重复生成每日网站审计报告。

## 未修复内容

- 仍有 33 个产品视频为空或缺失，因缺少已确认视频素材，本次只记录不替换。
- 仍有 19 个 SEO 标签/JSON-LD 问题需要逐页补齐。
- 价格异常、APP 漏发等产品控制项不在本次自动修复范围，避免误改价格或误删产品。

## 缺图清单

- 无

## Google Business 西班牙语发文

Hoy en HAODE México tenemos opciones para técnicos y tiendas de reparación: pantallas para iPhone y Samsung, micas, máquina de corte y productos AI. Estamos en Eje Central 87, piso 2, local 225, Centro CDMX. Escríbenos por WhatsApp para confirmar disponibilidad antes de venir.

## Facebook 发文

¿Buscas refacciones para reparación celular en CDMX? En HAODE trabajamos pantallas iPhone/Samsung, micas y accesorios para técnicos, tiendas y distribuidores. Mándanos el modelo por WhatsApp y te ayudamos a confirmar disponibilidad.

## Instagram 发文

Pantallas, micas y accesorios para reparación celular en Centro CDMX. Envíanos tu modelo por WhatsApp y cotizamos para menudeo o mayoreo. #HAODEMexico #ReparacionCelular #CDMX #PantallasCelulares

## 明日建议

- 优先补齐产品视频素材：从缺视频清单开始，确认型号后再上传，不使用其他型号视频代替。
- 分批补齐仍缺的 Open Graph image / JSON-LD 页面，先处理首页、核心分类页和高访问产品页。
- 继续执行 `npm run product-control` 和 `node scripts/daily-website-audit.js`，把新增产品数量变化纳入每日检查。
