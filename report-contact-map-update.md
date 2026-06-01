# Reporte de actualización de Contacto y mapa

Fecha: 2026-06-01

## 修改文件列表
- `contacto/index.html`
- `style.css`

## 添加的地址
Eje Central Lázaro Cárdenas 87, piso 2, local 225,  
Colonia Centro, Centro, Cuauhtémoc,  
06070 Centro, CDMX, México

## 添加的营业时间
- Lunes a sábado: 10:00 – 18:00
- Domingo: Cerrado

## Google Maps 链接
- Botón “Abrir en Google Maps”:
  `https://www.google.com/maps/search/?api=1&query=Eje%20Central%20L%C3%A1zaro%20C%C3%A1rdenas%2087%20piso%202%20local%20225%20Centro%20Cuauht%C3%A9moc%2006070%20CDMX`
- Mapa embebido (iframe):
  `https://www.google.com/maps?q=Eje%20Central%20L%C3%A1zaro%20C%C3%A1rdenas%2087%20piso%202%20local%20225%20Centro%20Cuauht%C3%A9moc%2006070%20CDMX%20M%C3%A9xico&output=embed`

## 是否添加 LocalBusiness JSON-LD
是。已在 `contacto/index.html` 加入 LocalBusiness 结构化数据，包含：
- `name`
- `address`
- `openingHours`
- `areaServed`
- `url`
- 以及项目中已有的 `telephone`、`email`、`logo`

## 是否发现缺失 WhatsApp / Email
- WhatsApp: 未缺失（使用现有号码 `+52 3326684296`）
- Email: 未缺失（沿用现有 `correo@haode.mx`）

## 本地验证结果
- Contacto 页面结构已更新为：
  - Desktop: 左侧门店信息 / 右侧地图
  - Mobile: 上方门店信息 / 下方地图（300px）
- 扫描 `contacto/index.html`、首页、全部分类页资源引用：
  - 缺失资源引用: `0`
  - 未新增图片 404
  - 未新增页面 404
