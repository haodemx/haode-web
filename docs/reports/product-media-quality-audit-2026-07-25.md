# HAODE 商品媒体质量审计

生成日期：2026-07-25

## 结论

- 官网商品：140
- App 商品：147
- 图片引用：481，唯一图片文件：351
- 主图引用：287，唯一主图文件：157
- 主图路径缺失：0
- 主图尺寸无法读取：0
- 扩展名与实际编码不一致：0
- 占位主图：1
- 同一 SKU 官网/App 主图完全相同路径：126
- 同一 SKU 官网/App 不同路径但文件内容相同：0
- 同一 SKU 官网/App 主图文件不同，需视觉复核：0
- 多个商品共用同一路径的主图组：3
- 不同路径但文件内容完全相同的图片组：70
- 多个 SKU 主图内容完全相同的复核组：9

## 执行边界

- 没有修改或替换图片。
- 没有修改商品数据、价格、库存或兼容性。
- 没有运行 `publish-products`。
- 没有修改 Firestore。
- 下列尺寸与体积阈值只用于技术复核，不代表图片错误。

## 复核阈值

- 短边小于 600px：22 个主图引用。
- 长边小于 1000px：37 个主图引用。
- 文件大于 1.5MB：30 个主图引用。
- 长宽比超过 2.2:1：0 个主图引用。

## 占位主图

| 来源 | SKU | 图片 |
| --- | --- | --- |
| app | samsung-original-note-20-ultra | assets/products/placeholder.svg |

## 扩展名与实际编码不一致

- 无

## 官网/App 主图文件不同

- 无

## 不同路径但内容相同

- 无

## 多个商品共用同一主图路径

| 图片 | SKU 数 | SKU |
| --- | --- | --- |
| assets/products/samsung-incell/main.jpg | 3 | samsung-incell-s10-lite, samsung-incell-note-10-lite, samsung-incell-note-20 |
| assets/products/oled-diagnostica/13-13-pro.png | 2 | haode-pantalla-oled-diagnostica-modelo-13, haode-pantalla-oled-diagnostica-modelo-13-pro |
| assets/products/oled-diagnostica/14-14-pro.png | 2 | haode-pantalla-oled-diagnostica-modelo-14, haode-pantalla-oled-diagnostica-modelo-14-pro |

## 多个 SKU 主图内容完全相同

| SKU 数 | SKU | 图片路径 |
| --- | --- | --- |
| 3 | samsung-incell-s10-lite, samsung-incell-note-10-lite, samsung-incell-note-20 | assets/products/samsung-incell/main.jpg |
| 2 | iphone-incell-11-bolsa-protectora, iphone-incell-xr-bolsa-protectora | assets/products/iphone-incell/11-bolsa-protectora/main.jpg, assets/products/iphone-incell/xr-bolsa-protectora/main.jpg |
| 2 | iphone-oled-12-12pro, iphone-oled-12pro | assets/products/iphone-oled/12-12pro/main.jpg, assets/products/iphone-oled/12pro/main.jpg |
| 2 | samsung-incell-s23-ultra, samsung-oled-note-20 | assets/products/samsung-incell/s23-ultra/main.jpg, assets/products/samsung-oled/note-20/main.jpg |
| 2 | samsung-oled-s21-ultra, samsung-original-s21-ultra | assets/products/samsung-oled/s21-ultra/main.jpg, assets/products/samsung-original/s21-ultra/main.jpg |
| 2 | samsung-oled-s22-ultra, samsung-original-s22-ultra | assets/products/samsung-oled/s22-ultra/main.jpg, assets/products/samsung-original/s22-ultra/main.jpg |
| 2 | samsung-oled-s23-ultra, samsung-original-s23-ultra | assets/products/samsung-oled/s23-ultra/main.jpg, assets/products/samsung-original/s23-ultra/main.jpg |
| 2 | haode-pantalla-oled-diagnostica-modelo-13, haode-pantalla-oled-diagnostica-modelo-13-pro | assets/products/oled-diagnostica/13-13-pro.png |
| 2 | haode-pantalla-oled-diagnostica-modelo-14, haode-pantalla-oled-diagnostica-modelo-14-pro | assets/products/oled-diagnostica/14-14-pro.png |

## 短边低于复核阈值

| SKU | 尺寸 | 图片 |
| --- | --- | --- |
| samsung-incell-s10e | 343x343 | assets/products/samsung-incell/s10e/main.jpg |
| samsung-oled-note-10 | 464x502 | assets/products/samsung-oled/note-10/main.jpg |
| samsung-oled-note-10-plus | 469x487 | assets/products/samsung-oled/note-10-plus/main.jpg |
| samsung-oled-note-20-ultra | 438x465 | assets/products/samsung-oled/note-20-ultra/main.jpg |
| samsung-oled-note-9 | 461x491 | assets/products/samsung-oled/note-9/main.jpg |
| samsung-oled-s20 | 478x482 | assets/products/samsung-oled/s20/main.jpg |
| samsung-oled-s20-plus | 439x489 | assets/products/samsung-oled/s20-plus/main.jpg |
| samsung-oled-s20-ultra | 455x492 | assets/products/samsung-oled/s20-ultra/main.jpg |
| samsung-oled-s21 | 466x472 | assets/products/samsung-oled/s21/main.jpg |
| samsung-oled-s21-plus | 461x493 | assets/products/samsung-oled/s21-plus/main.jpg |
| samsung-oled-s21-ultra | 460x491 | assets/products/samsung-oled/s21-ultra/main.jpg |
| samsung-oled-s22-plus | 462x492 | assets/products/samsung-oled/s22-plus/main.jpg |
| samsung-oled-s22-ultra | 470x481 | assets/products/samsung-oled/s22-ultra/main.jpg |
| samsung-oled-s23-plus | 455x500 | assets/products/samsung-oled/s23-plus/main.jpg |
| samsung-oled-s23-ultra | 467x492 | assets/products/samsung-oled/s23-ultra/main.jpg |
| samsung-oled-s24-plus | 456x479 | assets/products/samsung-oled/s24-plus/main.jpg |
| samsung-oled-s24-ultra | 472x496 | assets/products/samsung-oled/s24-ultra/main.jpg |
| samsung-oled-s25-ultra | 478x498 | assets/products/samsung-oled/s25-ultra/main.jpg |
| samsung-oled-s9-plus | 470x496 | assets/products/samsung-oled/s9-plus/main.jpg |
| samsung-original-s21-ultra | 460x491 | assets/products/samsung-original/s21-ultra/main.jpg |
| samsung-original-s22-ultra | 470x481 | assets/products/samsung-original/s22-ultra/main.jpg |
| samsung-original-s23-ultra | 467x492 | assets/products/samsung-original/s23-ultra/main.jpg |

## 大文件复核

| SKU | 大小 | 图片 |
| --- | --- | --- |
| mica-hd | 1.87MB | assets/products/micas/hd/main.png |
| mica-privacidad-matte | 1.57MB | assets/products/micas/privacidad-matte/main.png |
| lk-007-camara-digital-4k | 2.12MB | assets/products/productos-ai/lk-007-camara-digital-4k/main.png |
| lk-018-camara-accion-hd | 1.77MB | assets/products/productos-ai/lk-018-camara-accion-hd/main.png |
| haode-pantalla-oled-diagnostica-modelo-xs-max | 1.58MB | assets/products/oled-diagnostica/xs-max.png |
| haode-pantalla-oled-diagnostica-modelo-11-pro-max | 1.72MB | assets/products/oled-diagnostica/11-pro-max.png |
| haode-pantalla-oled-diagnostica-modelo-13, haode-pantalla-oled-diagnostica-modelo-13-pro | 1.52MB | assets/products/oled-diagnostica/13-13-pro.png |
| haode-pantalla-oled-diagnostica-modelo-13-pro-max | 1.58MB | assets/products/oled-diagnostica/13-pro-max.png |
| haode-pantalla-oled-diagnostica-modelo-14, haode-pantalla-oled-diagnostica-modelo-14-pro | 1.61MB | assets/products/oled-diagnostica/14-14-pro.png |
| haode-pantalla-oled-diagnostica-modelo-14-pro-max | 1.55MB | assets/products/oled-diagnostica/14-pro-max.png |
| haode-pantalla-oled-diagnostica-modelo-14-plus | 1.54MB | assets/products/oled-diagnostica/14-plus.png |
| haode-pantalla-oled-diagnostica-modelo-15 | 1.62MB | assets/products/oled-diagnostica/15.png |
| haode-pantalla-oled-diagnostica-modelo-15-pro | 1.56MB | assets/products/oled-diagnostica/15-pro.png |
| haode-pantalla-oled-diagnostica-modelo-15-plus | 1.57MB | assets/products/oled-diagnostica/15-plus.png |
| haode-pantalla-oled-diagnostica-modelo-16 | 1.52MB | assets/products/oled-diagnostica/16.png |
| haode-pantalla-oled-diagnostica-modelo-16-pro | 1.56MB | assets/products/oled-diagnostica/16-pro.png |
| haode-pantalla-oled-diagnostica-modelo-17 | 1.56MB | assets/products/oled-diagnostica/17.png |
| samsung-original-s22-plus | 1.83MB | assets/products/samsung-original/s22-plus/main.png |
| samsung-original-s23-plus | 1.69MB | assets/products/samsung-original/s23-plus/main.png |
| samsung-original-s24-ultra | 1.96MB | assets/products/samsung-original/s24-ultra/main.png |
| samsung-original-s25-ultra | 1.77MB | assets/products/samsung-original/s25-ultra/main.png |
| samsung-original-z-flip3 | 1.75MB | assets/products/samsung-original/z-flip3/main.png |
| samsung-original-z-flip4 | 1.63MB | assets/products/samsung-original/z-flip4/main.png |
| samsung-original-z-flip5 | 1.86MB | assets/products/samsung-original/z-flip5/main.png |
| samsung-original-z-flip6 | 1.60MB | assets/products/samsung-original/z-flip6/main.png |
| samsung-original-z-flip7 | 2.00MB | assets/products/samsung-original/z-flip7/main.png |
| samsung-original-z-fold3 | 1.65MB | assets/products/samsung-original/z-fold3/main.png |
| samsung-original-z-fold4 | 1.78MB | assets/products/samsung-original/z-fold4/main.png |
| samsung-original-z-fold5 | 1.80MB | assets/products/samsung-original/z-fold5/main.png |
| samsung-original-z-fold6 | 1.55MB | assets/products/samsung-original/z-fold6/main.png |

## 技术说明

- 路径不同但哈希相同表示文件字节完全一致，可安全视为同一素材。
- 路径或哈希不同只表示文件不同，是否使用错误型号仍需人工看图确认。
- 共用主图可能是系列通用素材，不自动判错。
