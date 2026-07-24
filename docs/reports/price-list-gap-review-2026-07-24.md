# HAODE 新价格表缺价 SKU 精确匹配检查

- 检查日期：2026-07-24
- 价格表：`HAODE Lista_de_Precios_HAODE_2026_Clientesxlsx.xlsx`
- 更正规则：`OLED PREMIUM`、`AMOLED PREMIUM`、`SOFT OLED PREMIUM` 都按 OLED 处理；只接受同型号 + 同质量类型；INCELL、DIAGNÓSTICO、TIPO ORIGINAL 不可替代 OLED PREMIUM / AMOLED PREMIUM。

## OLED PREMIUM 复核更正

老板已确认：`14 OLED PREMIUM` 这一类就是 OLED。按这个规则重新核对后：

- 当前已有 22 个 OLED 产品能在新价格表中找到精确 `OLED PREMIUM` / `AMOLED PREMIUM` 对应行。
- 这 22 个产品的网站 / 主数据价格已经与新价格表一致，未发现需要改价的差异。
- 其中 `iphone-oled-14` 对应 `iPhone!row 28 14 OLED PREMIUM`，当前价格 `700 / 680`，与新表一致。
- 下面 14 个缺价 SKU 仍然没有“同型号 + OLED PREMIUM / AMOLED PREMIUM”的精确行，所以继续保留待确认，不用近似行补价。

| SKU | 产品 | 需要质量 | 精确匹配 | 表内接近行 | 结论 |
| --- | --- | --- | --- | --- | --- |
| `iphone-oled-12mini` | Pantalla para iPhone 12 mini | OLED PREMIUM | 无 | iPhone fila 15 12mini INCELL FHD [230, 220, 210, 200, 195]; Lista_Precios fila 17 12mini INCELL FHD [230, 220, 210, 200, 195]; Lista_Precios fila 67 12MINI DIAGNOTICO HARD OLED [1300, 1250, 1200, 1150, 1050] | 不能补价：未见同型号 OLED PREMIUM 价格 |
| `iphone-oled-13mini` | Pantalla para iPhone 13 mini | OLED PREMIUM | 无 | 无 | 不能补价：未见同型号 OLED PREMIUM 价格 |
| `iphone-oled-15plus` | Pantalla para iPhone 15 Plus | OLED PREMIUM | 无 | Lista_Precios fila 78 15PLUS DIAGNOTICO  SOFT OLED [2000, 1950, 1900, 1850, 1700] | 不能补价：未见同型号 OLED PREMIUM 价格 |
| `iphone-oled-16` | Pantalla para iPhone 16 | OLED PREMIUM | 无 | iPhone fila 44 16 INCELL FHD [400, 380, 350, 330, 320]; Lista_Precios fila 46 16 INCELL FHD [400, 380, 350, 330, 320]; Lista_Precios fila 80 16 DIAGNOTICO  SOFT OLED [2000, 1950, 1900, 1850, 1700] | 不能补价：未见同型号 OLED PREMIUM 价格 |
| `iphone-oled-16plus` | Pantalla para iPhone 16 Plus | OLED PREMIUM | 无 | iPhone fila 47 16PLUS INCELL FHD [400, 380, 360, 350, 330]; Lista_Precios fila 49 16PLUS INCELL FHD [400, 380, 360, 350, 330]; Lista_Precios fila 83 16PLUS DIAGNOTICO  SOFT OLED [2500, 2450, 2400, 2350, 2200] | 不能补价：未见同型号 OLED PREMIUM 价格 |
| `samsung-oled-note-9` | Pantalla para Samsung Note 9 | OLED PREMIUM C/M | 无 | Samsung fila 43 NOTE 9 INCELL FHD [600, 570, 550, 520, 500]; Lista_Precios fila 130 NOTE 9 INCELL FHD C/M [500, 480, 470, 460, 450] | 不能补价：未见同型号 OLED PREMIUM C/M 价格 |
| `samsung-oled-s20` | Pantalla para Samsung S20 | OLED PREMIUM C/M | 无 | Samsung fila 12 S20 INCELL FHD [500, 480, 460, 450, 440] | 不能补价：未见同型号 OLED PREMIUM C/M 价格 |
| `samsung-oled-s20-ultra` | Pantalla para Samsung S20 Ultra | OLED PREMIUM C/M | 无 | Samsung fila 16 S20 Ultra INCELL FHD [650, 620, 600, 580, 560]; Lista_Precios fila 103 S20 Ultra INCELL FHD C/M [650, 620, 600, 580, 560] | 不能补价：未见同型号 OLED PREMIUM C/M 价格 |
| `samsung-oled-s21` | Pantalla para Samsung S21 | OLED PREMIUM C/M | 无 | Samsung fila 17 S21 INCELL FHD [800, 750, 700, 600, 550]; Lista_Precios fila 104 S21 INCELL FHD C/M [800, 750, 700, 600, 550] | 不能补价：未见同型号 OLED PREMIUM C/M 价格 |
| `samsung-oled-s21-plus` | Pantalla para Samsung S21 Plus | OLED PREMIUM C/M | 无 | Samsung fila 19 S21 PLUS INCELL FHD [450, 430, 420, 400, 385]; Lista_Precios fila 106 S21 PLUS INCELL FHD C/M [450, 430, 420, 400, 385] | 不能补价：未见同型号 OLED PREMIUM C/M 价格 |
| `samsung-oled-s22-plus` | Pantalla para Samsung S22 Plus | OLED PREMIUM C/M | 无 | Samsung fila 24 S22 PLUS INCELL FHD [600, 570, 550, 530, 500]; Samsung fila 25 S22 PLUS TIPO ORIGINAL C/M [1700, 1650, 1600, 1500, 1400]; Lista_Precios fila 111 S22 PLUS INCELL FHD C/M [500, 480, 470, 460, 450]; Lista_Precios fila 112 S22 PLUS TIPO ORIGINAL C/M [1700, 1650, 1600, 1500, 1400] | 不能补价：未见同型号 OLED PREMIUM C/M 价格 |
| `samsung-oled-s23-plus` | Pantalla para Samsung S23 Plus | OLED PREMIUM C/M | 无 | Samsung fila 30 S23 PLUS INCELL FHD [650, 630, 620, 600, 580]; Samsung fila 31 S23 PLUS TIPO ORIGINAL C/M [1800, 1700, 1650, 1600, 1500]; Lista_Precios fila 117 S23 PLUS INCELL FHD C/M [600, 580, 570, 560, 550]; Lista_Precios fila 118 S23 PLUS TIPO ORIGINAL C/M [1800, 1700, 1650, 1600, 1500] | 不能补价：未见同型号 OLED PREMIUM C/M 价格 |
| `samsung-oled-s24-plus` | Pantalla para Samsung S24 Plus | OLED PREMIUM C/M | 无 | Samsung fila 36 S24 PLUS INCELL FHD [1000, 950, 900, 850, 800]; Lista_Precios fila 123 S24 PLUS INCELL FHD C/M [700, 680, 670, 660, 650] | 不能补价：未见同型号 OLED PREMIUM C/M 价格 |
| `samsung-oled-s9-plus` | Pantalla para Samsung S9 Plus | OLED PREMIUM C/M | 无 | Samsung fila 7 S9 PLUS INCELL FHD [500, 450, 420, 400, 380]; Lista_Precios fila 93 S9 PLUS INCELL FHD C/M [370, 360, 350, 340, 330] | 不能补价：未见同型号 OLED PREMIUM C/M 价格 |

结论：14 个缺价 SKU 中，精确可补价数量为 0。其余继续保留 Consultar/待确认，不自动用近似行补价。
