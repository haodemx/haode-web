# HAODE APP 价格数据审计报告

- 价格表：`HL CDMX 2026 MAYO.xlsx`
- 生成时间：2026-06-04 16:55:38
- 价格映射：`precioPublico = MENEUDEO`，`precioMayoreo = MAYOREO 5pzs`
- 本次未写入 Firestore：需要管理员认证；已读取 Firestore 用于对比。

## 汇总

- Excel 屏幕价格行：96
- APP 产品总数：88
- APP 屏幕产品数：79
- 已修正本地 app/products.json 价格：78
- 与 Excel 已一致：0
- APP 有但 Excel 未明确匹配：1
- Excel 有但 APP 缺少型号：16
- Firestore 当前产品数：91

## 已修正价格明细

| 产品型号 | 当前 APP 价格(修正前) | 价格表价格 | 差异 | 建议修正 | 风险等级 |
|---|---:|---:|---|---|---|
| iPhone 11 Pro Max OLED PREMIUM | 600 / 580 | 600 / 590 | Mayoreo 580 → 590 | 按 Excel 更新 app/products.json | 低 |
| iPhone 12 / 12 Pro OLED PREMIUM | 650 / 630 | 650 / 640 | Mayoreo 630 → 640 | 按 Excel 更新 app/products.json | 低 |
| iPhone 12 Pro OLED PREMIUM | 650 / 630 | 650 / 640 | Mayoreo 630 → 640 | 按 Excel 更新 app/products.json | 低 |
| iPhone 12 Pro Max OLED PREMIUM | 850 / 800 | 850 / 830 | Mayoreo 800 → 830 | 按 Excel 更新 app/products.json | 低 |
| iPhone 13 OLED PREMIUM | 730 / 710 | 730 / 720 | Mayoreo 710 → 720 | 按 Excel 更新 app/products.json | 低 |
| iPhone 13 Pro OLED PREMIUM | 800 / 750 | 800 / 780 | Mayoreo 750 → 780 | 按 Excel 更新 app/products.json | 低 |
| iPhone 13 Pro Max OLED PREMIUM | 600 / 580 | 900 / 850 | Publico 600 → 900; Mayoreo 580 → 850 | 按 Excel 更新 app/products.json | 高 |
| iPhone 14 OLED PREMIUM | 700 / 650 | 700 / 680 | Mayoreo 650 → 680 | 按 Excel 更新 app/products.json | 低 |
| iPhone 14 Plus OLED PREMIUM | 900 / 850 | 900 / 880 | Mayoreo 850 → 880 | 按 Excel 更新 app/products.json | 低 |
| iPhone 14 Pro OLED PREMIUM | 1200 / 1100 | 1200 / 1150 | Mayoreo 1100 → 1150 | APP 标为 OLED，但 Excel 仅找到 SOFT OLED 对应行，需确认命名 | 中 |
| iPhone 14 Pro Max OLED PREMIUM | 1000 / 900 | 1000 / 950 | Mayoreo 900 → 950 | 按 Excel 更新 app/products.json | 中 |
| iPhone 15 OLED PREMIUM | 1200 / 1100 | 1200 / 1150 | Mayoreo 1100 → 1150 | APP 标为 OLED，但 Excel 仅找到 SOFT OLED 对应行，需确认命名 | 中 |
| iPhone 15 Pro Max OLED PREMIUM | 1200 / 1000 | 1200 / 1100 | Mayoreo 1000 → 1100 | 按 Excel 更新 app/products.json | 中 |
| iPhone 16 Pro OLED PREMIUM | 1500 / 1400 | 1500 / 1450 | Mayoreo 1400 → 1450 | 按 Excel 更新 app/products.json | 中 |
| iPhone 16 Pro Max SOFT OLED PREMIUM MOVE IC | 2000 / 1900 | 2000 / 1950 | Mayoreo 1900 → 1950 | 按 Excel 更新 app/products.json | 中 |
| iPhone XS Max OLED PREMIUM | 580 / 560 | 580 / 570 | Mayoreo 560 → 570 | 按 Excel 更新 app/products.json | 低 |
| iPhone 16 Pro Max OLED PREMIUM MOVE IC | 1600 / 1500 | 1600 / 1550 | Mayoreo 1500 → 1550 | 按 Excel 更新 app/products.json | 中 |
| iPhone 11 INCELL FHD | 180 / 170 | 180 / 175 | Mayoreo 170 → 175 | 按 Excel 更新 app/products.json | 低 |
| iPhone 11 Pro INCELL FHD | 200 / 190 | 200 / 195 | Mayoreo 190 → 195 | 按 Excel 更新 app/products.json | 低 |
| iPhone 11 Pro Max INCELL FHD | 220 / 200 | 220 / 210 | Mayoreo 200 → 210 | 按 Excel 更新 app/products.json | 低 |
| iPhone 12 / 12 Pro INCELL FHD | 220 / 200 | 220 / 210 | Mayoreo 200 → 210 | 按 Excel 更新 app/products.json | 低 |
| iPhone 12 mini INCELL FHD | 230 / 210 | 230 / 220 | Mayoreo 210 → 220 | 按 Excel 更新 app/products.json | 低 |
| iPhone 12 Pro Max INCELL FHD | 220 / 200 | 250 / 240 | Publico 220 → 250; Mayoreo 200 → 240 | 按 Excel 更新 app/products.json | 低 |
| iPhone 13 INCELL FHD | 250 / 240 | 250 / 245 | Mayoreo 240 → 245 | 按 Excel 更新 app/products.json | 低 |
| iPhone 13 mini INCELL FHD | 260 / 245 | 260 / 250 | Mayoreo 245 → 250 | 按 Excel 更新 app/products.json | 低 |
| iPhone 13 Pro INCELL FHD | 300 / 285 | 300 / 290 | Mayoreo 285 → 290 | 按 Excel 更新 app/products.json | 低 |
| iPhone 13 Pro Max INCELL FHD | 350 / 335 | 350 / 340 | Mayoreo 335 → 340 | 按 Excel 更新 app/products.json | 低 |
| iPhone 14 INCELL FHD | 800 / 700 | 260 / 250 | Publico 800 → 260; Mayoreo 700 → 250 | 按 Excel 更新 app/products.json | 高 |
| iPhone 14 Plus INCELL FHD | 800 / 700 | 300 / 290 | Publico 800 → 300; Mayoreo 700 → 290 | 按 Excel 更新 app/products.json | 高 |
| iPhone 14 Pro INCELL FHD | 350 / 330 | 350 / 340 | Mayoreo 330 → 340 | 按 Excel 更新 app/products.json | 低 |
| iPhone 14 Pro Max INCELL FHD | 380 / 340 | 380 / 350 | Mayoreo 340 → 350 | 按 Excel 更新 app/products.json | 低 |
| iPhone 15 INCELL FHD | 300 / 285 | 300 / 290 | Mayoreo 285 → 290 | 按 Excel 更新 app/products.json | 低 |
| iPhone 15 Plus INCELL FHD | 300 / 285 | 330 / 310 | Publico 300 → 330; Mayoreo 285 → 310 | 按 Excel 更新 app/products.json | 低 |
| iPhone 15 Pro INCELL FHD | 350 / 335 | 350 / 340 | Mayoreo 335 → 340 | 按 Excel 更新 app/products.json | 低 |
| iPhone 15 Pro Max INCELL FHD | 400 / 370 | 400 / 380 | Mayoreo 370 → 380 | 按 Excel 更新 app/products.json | 低 |
| iPhone 16 INCELL FHD | 400 / 350 | 400 / 380 | Mayoreo 350 → 380 | 按 Excel 更新 app/products.json | 低 |
| iPhone X INCELL FHD | 180 / 170 | 180 / 175 | Mayoreo 170 → 175 | 按 Excel 更新 app/products.json | 低 |
| iPhone XR INCELL FHD | 180 / 170 | 180 / 175 | Mayoreo 170 → 175 | 按 Excel 更新 app/products.json | 低 |
| iPhone XS INCELL FHD | 180 / 170 | 180 / 175 | Mayoreo 170 → 175 | 按 Excel 更新 app/products.json | 低 |
| iPhone XS Max INCELL FHD | 200 / 185 | 200 / 190 | Mayoreo 185 → 190 | 按 Excel 更新 app/products.json | 低 |
| iPhone 16e INCELL FHD | 300 / 275 | 300 / 280 | Mayoreo 275 → 280 | 按 Excel 更新 app/products.json | 低 |
| iPhone 16 Plus INCELL FHD | 400 / 360 | 400 / 380 | Mayoreo 360 → 380 | 按 Excel 更新 app/products.json | 低 |
| iPhone 16 Pro INCELL FHD | 700 / 660 | 700 / 680 | Mayoreo 660 → 680 | 按 Excel 更新 app/products.json | 低 |
| iPhone 16 Pro Max INCELL FHD | 750 / 700 | 750 / 730 | Mayoreo 700 → 730 | 按 Excel 更新 app/products.json | 低 |
| iPhone 17 INCELL FHD | 1000 / 920 | 1000 / 950 | Mayoreo 920 → 950 | 按 Excel 更新 app/products.json | 低 |
| iPhone 17 Air INCELL FHD | 2500 / 2300 | 2500 / 2400 | Mayoreo 2300 → 2400 | 按 Excel 更新 app/products.json | 中 |
| iPhone 17 Pro INCELL FHD | 850 / 755 | 850 / 800 | Mayoreo 755 → 800 | 按 Excel 更新 app/products.json | 低 |
| iPhone 17 Pro Max INCELL FHD | 900 / 805 | 900 / 850 | Mayoreo 805 → 850 | 按 Excel 更新 app/products.json | 低 |
| Samsung Note 10 OLED CON MARCO | 1500 / 1300 | 1500 / 1400 | Mayoreo 1300 → 1400 | 按 Excel 更新 app/products.json | 中 |
| Samsung Note 10 Plus OLED CON MARCO | 1000 / 900 | 1000 / 950 | Mayoreo 900 → 950 | 按 Excel 更新 app/products.json | 中 |
| Samsung Note 20 OLED CON MARCO | 1200 / 1000 | 1200 / 1100 | Mayoreo 1000 → 1100 | 按 Excel 更新 app/products.json | 中 |
| Samsung Note 20 Ultra OLED CON MARCO | 1500 / 1400 | 1500 / 1450 | Mayoreo 1400 → 1450 | 按 Excel 更新 app/products.json | 中 |
| Samsung S20 Plus OLED CON MARCO | 1100 / 1000 | 1100 / 1050 | Mayoreo 1000 → 1050 | 按 Excel 更新 app/products.json | 中 |
| Samsung S21 Ultra OLED CON MARCO | 1600 / 1500 | 1600 / 1550 | Mayoreo 1500 → 1550 | 按 Excel 更新 app/products.json | 中 |
| Samsung S22 Ultra OLED CON MARCO | 1750 / 1650 | 1750 / 1700 | Mayoreo 1650 → 1700 | 按 Excel 更新 app/products.json | 中 |
| Samsung S23 Ultra OLED CON MARCO | 1600 / 1550 | 1600 / 1580 | Mayoreo 1550 → 1580 | 按 Excel 更新 app/products.json | 低 |
| Samsung S24 Ultra OLED CON MARCO | 1800 / 1700 | 1800 / 1750 | Mayoreo 1700 → 1750 | 按 Excel 更新 app/products.json | 中 |
| Samsung S25 Ultra OLED CON MARCO | 2000 / 1800 | 2000 / 1900 | Mayoreo 1800 → 1900 | 按 Excel 更新 app/products.json | 中 |
| Samsung Note 10 INCELL CON MARCO | 650 / 580 | 650 / 600 | Mayoreo 580 → 600 | 按 Excel 更新 app/products.json | 低 |
| Samsung Note 10 Plus INCELL CON MARCO | 650 / 580 | 650 / 600 | Mayoreo 580 → 600 | 按 Excel 更新 app/products.json | 低 |
| Samsung Note 20 Ultra INCELL CON MARCO | 800 / 750 | 800 / 780 | Mayoreo 750 → 780 | 按 Excel 更新 app/products.json | 低 |
| Samsung Note 8 INCELL CON MARCO | 600 / 550 | 600 / 570 | Mayoreo 550 → 570 | 按 Excel 更新 app/products.json | 低 |
| Samsung Note 9 INCELL CON MARCO | 600 / 550 | 600 / 570 | Mayoreo 550 → 570 | 按 Excel 更新 app/products.json | 低 |
| Samsung S10 INCELL CON MARCO | 500 / 450 | 500 / 470 | Mayoreo 450 → 470 | 按 Excel 更新 app/products.json | 低 |
| Samsung S10 Plus INCELL CON MARCO | 500 / 450 | 500 / 470 | Mayoreo 450 → 470 | 按 Excel 更新 app/products.json | 低 |
| Samsung S20 INCELL CON MARCO | 500 / 460 | 500 / 480 | Mayoreo 460 → 480 | 按 Excel 更新 app/products.json | 低 |
| Samsung S20 FE INCELL CON MARCO | 350 / 320 | 350 / 330 | Mayoreo 320 → 330 | 按 Excel 更新 app/products.json | 低 |
| Samsung S20 Plus INCELL CON MARCO | 500 / 460 | 550 / 520 | Publico 500 → 550; Mayoreo 460 → 520 | 按 Excel 更新 app/products.json | 中 |
| Samsung S20 Ultra INCELL CON MARCO | 650 / 600 | 650 / 620 | Mayoreo 600 → 620 | 按 Excel 更新 app/products.json | 低 |
| Samsung S21 INCELL CON MARCO | 800 / 700 | 800 / 750 | Mayoreo 700 → 750 | 按 Excel 更新 app/products.json | 中 |
| Samsung S21 Ultra INCELL CON MARCO | 600 / 530 | 600 / 550 | Mayoreo 530 → 550 | 按 Excel 更新 app/products.json | 低 |
| Samsung S22 Ultra INCELL CON MARCO | 800 / 700 | 800 / 750 | Mayoreo 700 → 750 | 按 Excel 更新 app/products.json | 中 |
| Samsung S23 Ultra INCELL CON MARCO | 700 / 650 | 700 / 680 | Mayoreo 650 → 680 | 按 Excel 更新 app/products.json | 低 |
| Samsung S24 Ultra INCELL CON MARCO | 1000 / 900 | 1000 / 950 | Mayoreo 900 → 950 | 按 Excel 更新 app/products.json | 中 |
| Samsung S8 INCELL CON MARCO | 450 / 400 | 450 / 430 | Mayoreo 400 → 430 | 按 Excel 更新 app/products.json | 低 |
| Samsung S8 Plus INCELL CON MARCO | 450 / 400 | 450 / 430 | Mayoreo 400 → 430 | 按 Excel 更新 app/products.json | 低 |
| Samsung S9 INCELL CON MARCO | 450 / 400 | 450 / 430 | Mayoreo 400 → 430 | 按 Excel 更新 app/products.json | 低 |
| Samsung S9 Plus INCELL CON MARCO | 450 / 400 | 500 / 450 | Publico 450 → 500; Mayoreo 400 → 450 | 按 Excel 更新 app/products.json | 中 |

## APP 有但 Excel 未明确匹配

| 产品型号 | 当前 APP 价格 | 价格表价格 | 差异 | 建议修正 | 风险等级 |
|---|---:|---:|---|---|---|
| iPhone 11 Pro OLED PREMIUM | 200 / 190 | 未匹配 | OLED|11PRO | Excel 没有找到明确型号/类型对应行，暂不改价 | 中 |

## Excel 有但 APP 缺少型号

| 产品型号 | 当前 APP 价格 | 价格表价格 | 差异 | 建议修正 | 风险等级 |
|---|---:|---:|---|---|---|
| OLED XS | 未上传 | 185 / 180 | APP 缺少该型号 | 建议确认库存和图片后新增产品，图片未确认前留空/占位 | 中 |
| OLED_SOFT 15PRO | 未上传 | 1300 / 1250 | APP 缺少该型号 | 建议确认库存和图片后新增产品，图片未确认前留空/占位 | 中 |
| OLED 16E | 未上传 | 750 / 720 | APP 缺少该型号 | 建议确认库存和图片后新增产品，图片未确认前留空/占位 | 中 |
| INCELL 17E | 未上传 | 1000 / 950 | APP 缺少该型号 | 建议确认库存和图片后新增产品，图片未确认前留空/占位 | 中 |
| INCELL S10E | 未上传 | 800 / 780 | APP 缺少该型号 | 建议确认库存和图片后新增产品，图片未确认前留空/占位 | 低 |
| INCELL S10 LITE | 未上传 | 450 / 420 | APP 缺少该型号 | 建议确认库存和图片后新增产品，图片未确认前留空/占位 | 低 |
| INCELL S21 FE | 未上传 | 400 / 380 | APP 缺少该型号 | 建议确认库存和图片后新增产品，图片未确认前留空/占位 | 低 |
| INCELL S21 PLUS | 未上传 | 450 / 430 | APP 缺少该型号 | 建议确认库存和图片后新增产品，图片未确认前留空/占位 | 中 |
| INCELL S22 | 未上传 | 600 / 550 | APP 缺少该型号 | 建议确认库存和图片后新增产品，图片未确认前留空/占位 | 中 |
| INCELL S22 PLUS | 未上传 | 600 / 570 | APP 缺少该型号 | 建议确认库存和图片后新增产品，图片未确认前留空/占位 | 中 |
| INCELL S23 | 未上传 | 650 / 630 | APP 缺少该型号 | 建议确认库存和图片后新增产品，图片未确认前留空/占位 | 低 |
| INCELL S23 PLUS | 未上传 | 650 / 630 | APP 缺少该型号 | 建议确认库存和图片后新增产品，图片未确认前留空/占位 | 中 |
| INCELL S24 | 未上传 | 1000 / 950 | APP 缺少该型号 | 建议确认库存和图片后新增产品，图片未确认前留空/占位 | 低 |
| INCELL S24 PLUS | 未上传 | 1000 / 950 | APP 缺少该型号 | 建议确认库存和图片后新增产品，图片未确认前留空/占位 | 低 |
| INCELL NOTE10 LITE | 未上传 | 750 / 720 | APP 缺少该型号 | 建议确认库存和图片后新增产品，图片未确认前留空/占位 | 低 |
| INCELL NOTE 20 | 未上传 | 650 / 620 | APP 缺少该型号 | 建议确认库存和图片后新增产品，图片未确认前留空/占位 | 中 |

## 图片路径明显风险

- 未发现按路径规则明显不对应的屏幕图片。

## Firestore 同步提醒

- 本报告已读取 Firestore，但没有管理员认证，不能直接覆盖线上 Firestore。
- 由于 `/app/` 优先读取 Firestore，线上价格要完全生效，需要后台按本报告同步 Firestore，或提供管理员认证后再执行写入。
- 本次已先修正 `app/products.json`，作为 fallback 和后续导入 Firestore 的基准。
