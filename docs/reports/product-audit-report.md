# HAODE 产品图片与视频审计报告

生成日期：2026-06-04

## 审计范围

- iPhone INCELL
- iPhone OLED
- Samsung INCELL
- Samsung OLED
- Productos AI
- Micas
- Fundas

## 核心结论

1. 主屏幕产品数据库共检查 93 个产品。
2. `data/products.generated.js` 中未发现图片 404。
3. iPhone 16 / 16 Plus / 16 Pro / 16 Pro Max 的 INCELL 图片已重点复查，当前均使用对应型号目录图片。
4. `Accesorios AI` 已从占位图替换为项目内已有智能配件图。
5. `Traductores Inteligentes` 暂无确认产品图，仍保留占位图，禁止用其他产品图片冒充。

## 产品数量

- iPhone INCELL：31 个
- iPhone OLED：23 个
- Samsung INCELL：20 个
- Samsung OLED：19 个

## 重点产品复查

| 产品 | 当前状态 | 图片路径 |
| --- | --- | --- |
| iPhone 16 INCELL | 已确认对应型号 | `assets/products/iphone-incell/16/main.jpg` |
| iPhone 16 Plus INCELL | 已确认对应型号 | `assets/products/iphone-incell/16plus/main.jpg` |
| iPhone 16 Pro INCELL | 已确认对应型号 | `assets/products/iphone-incell/16pro/main.jpg` |
| iPhone 16 Pro Max INCELL | 已确认对应型号 | `assets/products/iphone-incell/16promax/main.jpg` |
| AIMB-G5 AI SPORTS | 已有图片 | `assets/products/productos-ai/aimb-g5-ai-smart-glasses/main.jpg` |
| Accesorios AI | 已替换占位图 | `assets/products/productos-ai/featured/smart-accessories-watch.jpg` |

## 待人工确认

| 项目 | 问题 | 建议 |
| --- | --- | --- |
| Traductores Inteligentes | 缺少确认图片 | 等老板提供真实产品图后再替换 |
| Samsung 部分图库 | 存在同型号图库重复图，未发现 404 | 后续按型号逐张确认是否需要补充更多角度 |
| iPhone 17 系列 INCELL | 目前有图片但属于未来型号，建议人工复核 | 确认是否为真实销售产品和真实图 |

## 缺失视频清单

以下产品当前没有确认视频，未使用其他型号视频代替：

- iphone-oled-16promax
- samsung-incell-note-10-plus
- samsung-incell-note-20-ultra
- samsung-incell-note-8
- samsung-incell-note-9
- samsung-incell-s20-ultra
- samsung-incell-s21
- samsung-incell-s21-ultra
- samsung-incell-s24-ultra
- samsung-incell-s8
- samsung-incell-s9
- samsung-incell-s9-plus
- samsung-oled-note-10
- samsung-oled-note-10-plus
- samsung-oled-note-20
- samsung-oled-note-20-ultra
- samsung-oled-note-9
- samsung-oled-s20
- samsung-oled-s20-ultra
- samsung-oled-s21
- samsung-oled-s21-plus
- samsung-oled-s22-plus
- samsung-oled-s23-plus
- samsung-oled-s24-plus
- samsung-oled-s9-plus
- iphone-incell-16e
- iphone-incell-16plus
- iphone-incell-16pro
- iphone-incell-16promax
- iphone-incell-17
- iphone-incell-17air
- iphone-incell-17pro
- iphone-incell-17promax

## 本次修复

- 替换 `Accesorios AI` 占位图：2 处。
- 复查 iPhone 16 INCELL 系列：4 个重点产品。
- 确认主产品数据图片路径无 404。

