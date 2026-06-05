# HAODE Product Control Center 健康报告

生成日期：2026-06-05

## 数据来源

| 来源 | 产品数 |
| --- | ---: |
| products-master 当前 CSV | 101 |
| 当前最新价格表 | 54 |
| Firestore | 94 |
| 网站 | 101 |
| App | 96 |

## 核心指标

| 指标 | 当前值 |
| --- | ---: |
| 产品总数 | 161 |
| 缺产品数量 | 75 |
| 重复产品数量 | 0 |
| 价格异常数量 | 7 |
| 分类异常数量 | 0 |
| 图片完整率 | 68.3% |
| 视频完整率 | 37.9% |

## 每日自动比对范围

- `data/products-master.xlsx`
- Firestore `products`
- 网站 `data/products.generated.js`
- App `app/products.json`

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
- funda-magnetica-17-pro-max | Funda Magnetica | Estilo iPhone 17 Pro Max | 缺: firestore, website
- funda-premium-17-pro-max | Funda Premium Aluminio | Estilo iPhone 17 Pro Max | 缺: website
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
- pantallas-iphone-incell-iphone-x-pantalla-para-iphone-x | Pantalla para iPhone X | X | 缺: firestore, website, app
- pantallas-iphone-incell-iphone-xs-pantalla-para-iphone-xs | Pantalla para iPhone XS | XS | 缺: firestore, website, app
- pantallas-iphone-oled-iphone-xs-pantalla-para-iphone-xs | Pantalla para iPhone XS | XS | 缺: firestore, website, app
- pantallas-iphone-incell-iphone-xr-pantalla-para-iphone-xr | Pantalla para iPhone XR | XR | 缺: firestore, website, app
- pantallas-iphone-incell-iphone-11-pantalla-para-iphone-11 | Pantalla para iPhone 11 | 11 | 缺: firestore, website, app
- pantallas-iphone-oled-iphone-11-pantalla-para-iphone-11 | Pantalla para iPhone 11 | 11 | 缺: firestore, website, app
- 其余 45 条见 `data/products-master.xlsx` 的 exceptions 工作表

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

- pantallas-iphone-incell-iphone-x-pantalla-para-iphone-x | Pantalla para iPhone X | X
- pantallas-iphone-incell-iphone-xs-pantalla-para-iphone-xs | Pantalla para iPhone XS | XS
- pantallas-iphone-oled-iphone-xs-pantalla-para-iphone-xs | Pantalla para iPhone XS | XS
- pantallas-iphone-incell-iphone-xr-pantalla-para-iphone-xr | Pantalla para iPhone XR | XR
- pantallas-iphone-incell-iphone-11-pantalla-para-iphone-11 | Pantalla para iPhone 11 | 11
- pantallas-iphone-oled-iphone-11-pantalla-para-iphone-11 | Pantalla para iPhone 11 | 11
- pantallas-iphone-incell-iphone-11pro-pantalla-para-iphone-11pro | Pantalla para iPhone 11PRO | 11PRO
- pantallas-iphone-incell-iphone-xs-max-pantalla-para-iphone-xs-max | Pantalla para iPhone XS MAX | XS MAX
- pantallas-iphone-oled-iphone-xs-max-pantalla-para-iphone-xs-max | Pantalla para iPhone XS MAX | XS MAX
- pantallas-iphone-incell-iphone-11pro-max-pantalla-para-iphone-11pro-max | Pantalla para iPhone 11PRO MAX | 11PRO MAX
- pantallas-iphone-oled-iphone-11pro-max-pantalla-para-iphone-11pro-max | Pantalla para iPhone 11PRO MAX | 11PRO MAX
- pantallas-iphone-incell-iphone-12mini-pantalla-para-iphone-12mini | Pantalla para iPhone 12mini | 12mini
- pantallas-iphone-incell-iphone-12-12pro-pantalla-para-iphone-12-12pro | Pantalla para iPhone 12/12PRO | 12/12PRO
- pantallas-iphone-oled-iphone-12-12pro-pantalla-para-iphone-12-12pro | Pantalla para iPhone 12/12PRO | 12/12PRO
- pantallas-iphone-incell-iphone-12pro-max-pantalla-para-iphone-12pro-max | Pantalla para iPhone 12PRO MAX | 12PRO MAX
- pantallas-iphone-oled-iphone-12pro-max-pantalla-para-iphone-12pro-max | Pantalla para iPhone 12PRO MAX | 12PRO MAX
- pantallas-iphone-incell-iphone-13-mini-pantalla-para-iphone-13-mini | Pantalla para iPhone 13 mini | 13 mini
- pantallas-iphone-incell-iphone-13-pantalla-para-iphone-13 | Pantalla para iPhone 13 | 13
- pantallas-iphone-oled-iphone-13-pantalla-para-iphone-13 | Pantalla para iPhone 13 | 13
- pantallas-iphone-incell-iphone-13pro-pantalla-para-iphone-13pro | Pantalla para iPhone 13PRO | 13PRO
- pantallas-iphone-oled-iphone-13pro-pantalla-para-iphone-13pro | Pantalla para iPhone 13PRO | 13PRO
- pantallas-iphone-incell-iphone-13pro-max-pantalla-para-iphone-13pro-max | Pantalla para iPhone 13PRO MAX | 13PRO MAX
- pantallas-iphone-oled-iphone-13pro-max-pantalla-para-iphone-13pro-max | Pantalla para iPhone 13PRO MAX | 13PRO MAX
- pantallas-iphone-incell-iphone-14-pantalla-para-iphone-14 | Pantalla para iPhone 14 | 14
- pantallas-iphone-oled-iphone-14-pantalla-para-iphone-14 | Pantalla para iPhone 14 | 14
- pantallas-iphone-incell-iphone-14-plus-pantalla-para-iphone-14-plus | Pantalla para iPhone 14 plus | 14 plus
- pantallas-iphone-oled-iphone-14-plus-pantalla-para-iphone-14-plus | Pantalla para iPhone 14 plus | 14 plus
- pantallas-iphone-incell-iphone-14pro-pantalla-para-iphone-14pro | Pantalla para iPhone 14PRO | 14PRO
- pantallas-iphone-oled-iphone-14pro-pantalla-para-iphone-14pro | Pantalla para iPhone 14PRO | 14PRO
- pantallas-iphone-incell-iphone-14pro-max-pantalla-para-iphone-14pro-max | Pantalla para iPhone 14PRO MAX | 14PRO MAX
- 其余 21 条见 `data/products-master.xlsx` 的 exceptions 工作表

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
- 其余 70 条见 `data/products-master.xlsx` 的 exceptions 工作表
