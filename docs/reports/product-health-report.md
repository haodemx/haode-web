# HAODE Product Control Center 健康报告

生成日期：2026-06-05

## 数据来源

| 来源 | 产品数 |
| --- | ---: |
| products-master 当前 CSV | 101 |
| 当前最新价格表 | 54 |
| Firestore | 94 |
| 网站 | 103 |
| App | 96 |

## 核心指标

| 指标 | 当前值 |
| --- | ---: |
| 产品总数 | 110 |
| 主库总数 | 161 |
| 已忽略历史产品 | 51 |
| 缺产品数量 | 23 |
| 重复产品数量 | 0 |
| 价格异常数量 | 7 |
| 分类异常数量 | 0 |
| 图片完整率 | 100.0% |
| 视频完整率 | 55.5% |

## 每日自动比对范围

- `data/products-master.xlsx`
- Firestore `products`
- 网站 `data/products.generated.js`
- App `app/products.json`

## 监控口径

- `historical=true` / `ignored_by_product_control=true` 的产品保留在主库。
- 这些产品不删除、不上传、不改价格。
- 这些产品不计入缺产品、图片缺失、视频缺失、价格异常和完整率统计。
- 当前忽略对象：6 月价格表派生的 `pantallas-iphone-...` SKU，共 51 个。

## 自动验证规则

以后任何产品修改完成后，必须运行：

```bash
npm run product-control-center
npm run product-validate
```

验证必须覆盖：

- Firestore 是否存在该产品
- 网站是否存在该产品
- App 是否存在该产品
- 三方价格是否一致
- 三方分类是否一致
- 图片路径是否存在
- 视频路径是否存在或明确标记缺素材

## 缺产品

- aimb-g5-ai-sports | AIMB-G5 AI SPORTS | Gafas AI deportivas | 缺: website
- funda-magnetica-17-pro-max | Funda Magnetica | Estilo iPhone 17 Pro Max | 缺: firestore
- iphone-oled-12-12pro | Pantalla para iPhone 12 / 12 Pro | iPhone 12 / 12 Pro OLED PREMIUM | 缺: firestore
- iphone-oled-12mini | Pantalla para iPhone 12 mini | iPhone 12 mini OLED PREMIUM | 缺: firestore, app
- iphone-oled-13mini | Pantalla para iPhone 13 mini | iPhone 13 mini OLED PREMIUM | 缺: firestore, app
- iphone-oled-15plus | Pantalla para iPhone 15 Plus | iPhone 15 Plus OLED PREMIUM | 缺: firestore, app
- iphone-oled-16 | Pantalla para iPhone 16 | iPhone 16 OLED PREMIUM | 缺: firestore, app
- iphone-oled-16plus | Pantalla para iPhone 16 Plus | iPhone 16 Plus OLED PREMIUM | 缺: firestore, app
- micas-hd-clear-50 | Micas HD Clear | Paquete 50 piezas | 缺: website
- micas-mate-corte | Micas Mate | Peliculas para corte | 缺: website
- micas-privacidad-corte | Micas Privacidad | Peliculas privacy | 缺: website
- s1-ai-classic | HAODE AI CLASSIC S1 | Gafas AI classic | 缺: website
- samsung-oled-note-9 | Pantalla para Samsung Note 9 | Samsung Note 9 OLED CON MARCO | 缺: firestore, app
- samsung-oled-s20 | Pantalla para Samsung S20 | Samsung S20 OLED CON MARCO | 缺: firestore, app
- samsung-oled-s20-ultra | Pantalla para Samsung S20 Ultra | Samsung S20 Ultra OLED CON MARCO | 缺: firestore, app
- samsung-oled-s21 | Pantalla para Samsung S21 | Samsung S21 OLED CON MARCO | 缺: firestore, app
- samsung-oled-s21-plus | Pantalla para Samsung S21 Plus | Samsung S21 Plus OLED CON MARCO | 缺: firestore, app
- samsung-oled-s22-plus | Pantalla para Samsung S22 Plus | Samsung S22 Plus OLED CON MARCO | 缺: firestore, app
- samsung-oled-s23-plus | Pantalla para Samsung S23 Plus | Samsung S23 Plus OLED CON MARCO | 缺: firestore, app
- samsung-oled-s24-plus | Pantalla para Samsung S24 Plus | Samsung S24 Plus OLED CON MARCO | 缺: firestore, app
- samsung-oled-s9-plus | Pantalla para Samsung S9 Plus | Samsung S9 Plus OLED CON MARCO | 缺: firestore, app
- w630-ai-pro | W630 AI PRO | Gafas AI blancas | 缺: website
- x200t-cortadora-micas | HAODE X200T Cortadora Inteligente de Micas | X200T | 缺: website

## 价格异常

- iphone-incell-12promax | Pantalla para iPhone 12 Pro Max | iPhone 12 Pro Max INCELL FHD
- iphone-incell-14 | Pantalla para iPhone 14 | iPhone 14 INCELL FHD
- iphone-incell-14plus | Pantalla para iPhone 14 Plus | iPhone 14 Plus INCELL FHD
- iphone-incell-15plus | Pantalla para iPhone 15 Plus | iPhone 15 Plus INCELL FHD
- iphone-oled-13promax | Pantalla para iPhone 13 Pro Max | iPhone 13 Pro Max OLED PREMIUM
- samsung-incell-s20-plus | Pantalla para Samsung S20 Plus | Samsung S20 Plus INCELL CON MARCO
- samsung-incell-s9-plus | Pantalla para Samsung S9 Plus | Samsung S9 Plus INCELL CON MARCO

## 分类异常

- 无

## 图片缺失

- 无

## 视频缺失

- aimb-g5-ai-sports | AIMB-G5 AI SPORTS | Gafas AI deportivas
- iphone-incell-16e | Pantalla para iPhone 16e | iPhone 16e INCELL FHD
- iphone-incell-16plus | Pantalla para iPhone 16 Plus | iPhone 16 Plus INCELL FHD
- iphone-incell-16pro | Pantalla para iPhone 16 Pro | iPhone 16 Pro INCELL FHD
- iphone-incell-16promax | Pantalla para iPhone 16 Pro Max | iPhone 16 Pro Max INCELL FHD
- iphone-incell-17 | Pantalla para iPhone 17 | iPhone 17 INCELL FHD
- iphone-incell-17air | Pantalla para iPhone 17 Air | iPhone 17 Air INCELL FHD
- iphone-incell-17pro | Pantalla para iPhone 17 Pro | iPhone 17 Pro INCELL FHD
- iphone-incell-17promax | Pantalla para iPhone 17 Pro Max | iPhone 17 Pro Max INCELL FHD
- iphone-oled-16promax | Pantalla para iPhone 16 Pro Max Soft OLED | iPhone 16 Pro Max SOFT OLED PREMIUM MOVE IC
- micas-hd-clear-50 | Micas HD Clear | Paquete 50 piezas
- micas-mate-corte | Micas Mate | Peliculas para corte
- micas-privacidad-corte | Micas Privacidad | Peliculas privacy
- s1-ai-classic | HAODE AI CLASSIC S1 | Gafas AI classic
- samsung-incell-note-10-plus | Pantalla para Samsung Note 10 Plus | Samsung Note 10 Plus INCELL CON MARCO
- samsung-incell-note-20-ultra | Pantalla para Samsung Note 20 Ultra | Samsung Note 20 Ultra INCELL CON MARCO
- samsung-incell-note-8 | Pantalla para Samsung Note 8 | Samsung Note 8 INCELL CON MARCO
- samsung-incell-note-9 | Pantalla para Samsung Note 9 | Samsung Note 9 INCELL CON MARCO
- samsung-incell-s20-ultra | Pantalla para Samsung S20 Ultra | Samsung S20 Ultra INCELL CON MARCO
- samsung-incell-s21 | Pantalla para Samsung S21 | Samsung S21 INCELL CON MARCO
- samsung-incell-s21-ultra | Pantalla para Samsung S21 Ultra | Samsung S21 Ultra INCELL CON MARCO
- samsung-incell-s24-ultra | Pantalla para Samsung S24 Ultra | Samsung S24 Ultra INCELL CON MARCO
- samsung-incell-s8 | Pantalla para Samsung S8 | Samsung S8 INCELL CON MARCO
- samsung-incell-s9 | Pantalla para Samsung S9 | Samsung S9 INCELL CON MARCO
- samsung-incell-s9-plus | Pantalla para Samsung S9 Plus | Samsung S9 Plus INCELL CON MARCO
- samsung-oled-note-10 | Pantalla para Samsung Note 10 | Samsung Note 10 OLED CON MARCO
- samsung-oled-note-10-plus | Pantalla para Samsung Note 10 Plus | Samsung Note 10 Plus OLED CON MARCO
- samsung-oled-note-20 | Pantalla para Samsung Note 20 | Samsung Note 20 OLED CON MARCO
- samsung-oled-note-20-ultra | Pantalla para Samsung Note 20 Ultra | Samsung Note 20 Ultra OLED CON MARCO
- samsung-oled-note-9 | Pantalla para Samsung Note 9 | Samsung Note 9 OLED CON MARCO
- 其余 19 条见 `data/products-master.xlsx` 的 exceptions 工作表
