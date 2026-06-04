# HAODE AUTOPILOT 报告 - 2026-06-04

## CEO Agent 总结

今日目标：保持网站与 APP 数据正确，提高曝光、询盘和订单。

今日结论：
- APP 本地 `products.json` 数据健康：88 个产品，88 个 active，8 个分类，字段完整。
- Firestore 当前数据健康：87 个产品，87 个 active，8 个分类。
- Firebase 测试产品已清除：当前 Seed 产品数量为 0。
- 重点价格已确认：`iphone-oled-13promax` 当前 Firestore 价格为 Menudeo 900 / Mayoreo 850。
- 今天不建议继续改价格或产品图，避免误动真实运营数据。
- 今天应把曝光重点放在 OLED / INCELL 屏幕现货询盘、批发客户 WhatsApp 成交、AI 产品引流三件事。

## 自动调用 Agent

### Web Agent

检查内容：
- `robots.txt` 存在并允许收录。
- `sitemap.xml` 存在，当前指向 GitHub Pages。
- 后台功能已具备：同步修正价格、删除测试产品、统计卡刷新。

风险：
- 当前工作区有其它未提交的视频和页面改动，本次未触碰。
- GitHub Pages 有时存在发布缓存延迟，后台按钮上线后可能需要等待几分钟刷新。

### Product Agent

检查内容：
- `products.json` 无 Seed 产品。
- Firestore 无 Seed 产品。
- `iPhone 13 Pro Max OLED` 价格已同步为 900 / 850。

建议：
- 如真实库存型号确认为 MOVE IC，后续可把 APP 型号从 `iPhone 13 Pro Max OLED PREMIUM` 统一为 `iPhone 13 Pro Max OLED PREMIUM MOVE IC`。
- 先不要新增 Excel 缺失的 16 个型号，除非确认库存和图片。

### SEO Agent

今日重点关键词：
- pantallas iPhone OLED Mexico
- pantallas iPhone 13 Pro Max OLED
- pantallas INCELL mayoreo CDMX
- refacciones celulares CDMX
- pantallas celulares para tecnicos

建议动作：
- 今日社交内容标题集中使用 `Pantallas OLED e INCELL para tecnicos en CDMX`。
- Google Business 今日发一条屏幕类 Post，带 WhatsApp 咨询导向。

### Marketing Agent

#### Facebook 发文

Pantallas OLED e INCELL para tecnicos en CDMX.

Si reparas celulares y necesitas revisar modelos disponibles para iPhone o Samsung, en HAODE te ayudamos a cotizar por WhatsApp.

Tenemos opciones para menudeo y mayoreo, con atencion directa para talleres, tiendas y distribuidores.

Modelos destacados para consultar hoy:
- iPhone OLED
- iPhone INCELL
- Samsung AMOLED
- Samsung INCELL

Pregunta por tu modelo y cantidad.

WhatsApp: 55 2668 4296
HAODE - Eje Central 87, Piso 2, Local 225, CDMX

#### Instagram 发文

Pantallas para reparacion celular en CDMX.

OLED, INCELL y AMOLED para tecnicos, tiendas y mayoristas.

Escribenos por WhatsApp con:
1. Modelo
2. Cantidad
3. Ciudad

Te cotizamos directo.

#HAODE #PantallasCelulares #RefaccionesCelulares #CDMX #TecnicosCelulares #MayoreoCelulares

#### TikTok 短视频脚本

Escena 1:
Texto en pantalla: "¿Buscas pantallas para reparacion?"

Escena 2:
Mostrar pantallas iPhone / Samsung.
Voz: "En HAODE tenemos opciones OLED, INCELL y AMOLED para tecnicos y tiendas."

Escena 3:
Mostrar WhatsApp / catalogo APP.
Voz: "Consulta modelo, precio de menudeo o mayoreo por WhatsApp."

Escena 4:
Texto final: "HAODE CDMX - Refacciones para celular"

CTA:
"Manda tu modelo por WhatsApp y te cotizamos."

#### WhatsApp 群发

Hola, buen dia.

En HAODE ya puedes consultar pantallas para iPhone y Samsung por modelo.

Tenemos opciones:
- OLED
- INCELL
- AMOLED
- Menudeo y mayoreo

Si necesitas cotizacion, mandanos:
1. Modelo
2. Cantidad
3. Ciudad

Te respondemos directo por WhatsApp.

HAODE CDMX
Eje Central 87, Piso 2, Local 225

### Google Business Agent

#### Google Post

Pantallas para celular en CDMX

En HAODE atendemos a tecnicos, talleres, tiendas y distribuidores que buscan refacciones para reparacion celular.

Consulta disponibilidad de pantallas iPhone OLED, iPhone INCELL, Samsung AMOLED y Samsung INCELL. Atencion por WhatsApp para menudeo y mayoreo.

Visitanos en Eje Central Lazaro Cardenas 87, Piso 2, Local 225, Colonia Centro, CDMX.

Boton recomendado: Llamar o Enviar mensaje.

## Acciones Ejecutadas Hoy

- Se verifico estado de `products.json`.
- Se verifico estado de Firestore.
- Se confirmo que los 4 productos Seed ya no estan en Firestore.
- Se confirmo que `iPhone 13 Pro Max OLED` ya tiene precio Firestore correcto: 900 / 850.
- Se genero paquete de contenido para Facebook, Instagram, TikTok, WhatsApp y Google Business.

## Prioridad Para Manana

1. Confirmar si `iPhone 13 Pro Max OLED PREMIUM` debe renombrarse a `OLED PREMIUM MOVE IC`.
2. Revisar los 16 modelos que Excel tiene pero APP no tiene, empezando por los que tengan stock real.
3. Publicar el Google Post y el WhatsApp grupal.
4. Subir un video corto de pantalla OLED con CTA a WhatsApp.
5. Revisar si las paginas de categoria muestran precios Firestore actualizados igual que APP.
