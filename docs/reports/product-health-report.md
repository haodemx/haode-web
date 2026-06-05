# HAODE Product Control System 健康报告

生成日期：2026-06-05

## 系统目标

防止网站和 APP 出现：

- 图片错误
- 图片缺失
- 视频缺失
- 价格错误
- 产品漏发
- 分类错误

## 唯一主数据源

- 主数据文件：`docs/master-data/products-master.csv`
- 网站数据源：`data/products.generated.js`
- APP 数据源：`app/products.json`

说明：价格只做比对和报告，禁止自动修改。

## 总体统计

| 指标 | 当前值 | 目标 |
| --- | ---: | ---: |
| Master 产品总数 | 102 | 与网站/APP一致 |
| 网站数据源产品数 | 93 | 逐步并入 Master |
| 网站实际展示覆盖数 | 102 | 102 |
| APP 产品数 | 88 | 102 |
| 图片存在率 | 100.0% | 99%+ |
| 视频存在率 | 60.8% | 99%+ |
| 价格一致率 | 79.4% | 99%+ |
| 分类一致率 | 100.0% | 99%+ |
| 网站发布完整率 | 100.0% | 99%+ |
| APP 发布完整率 | 86.3% | 99%+ |
| 当前产品准确率 | 79.4% | 99%+ |

## 异常汇总

| 异常类型 | 数量 | 自动处理策略 |
| --- | ---: | --- |
| 图片缺失/路径不存在 | 0 | 允许自动修复路径，不允许乱换图 |
| 视频缺失/路径不存在 | 40 | 允许自动修复路径，缺素材则报告 |
| 价格不一致 | 21 | 禁止自动修改价格 |
| 分类不一致 | 0 | 允许自动修复分类 |
| 网站漏发 | 0 | 允许补页面/补路径 |
| APP 漏发 | 14 | 允许生成同步建议，不直接改价 |

## 产品漏发

### 网站缺失
- 无

### APP 缺失
- id: iphone-oled-12mini | producto_nombre: Pantalla para iPhone 12 mini | categoria: Pantallas iPhone OLED
- id: iphone-oled-13mini | producto_nombre: Pantalla para iPhone 13 mini | categoria: Pantallas iPhone OLED
- id: iphone-oled-15plus | producto_nombre: Pantalla para iPhone 15 Plus | categoria: Pantallas iPhone OLED
- id: iphone-oled-16 | producto_nombre: Pantalla para iPhone 16 | categoria: Pantallas iPhone OLED
- id: iphone-oled-16plus | producto_nombre: Pantalla para iPhone 16 Plus | categoria: Pantallas iPhone OLED
- id: samsung-oled-note-9 | producto_nombre: Pantalla para Samsung Note 9 | categoria: Pantallas Samsung OLED
- id: samsung-oled-s20 | producto_nombre: Pantalla para Samsung S20 | categoria: Pantallas Samsung OLED
- id: samsung-oled-s20-ultra | producto_nombre: Pantalla para Samsung S20 Ultra | categoria: Pantallas Samsung OLED
- id: samsung-oled-s21 | producto_nombre: Pantalla para Samsung S21 | categoria: Pantallas Samsung OLED
- id: samsung-oled-s21-plus | producto_nombre: Pantalla para Samsung S21 Plus | categoria: Pantallas Samsung OLED
- id: samsung-oled-s22-plus | producto_nombre: Pantalla para Samsung S22 Plus | categoria: Pantallas Samsung OLED
- id: samsung-oled-s23-plus | producto_nombre: Pantalla para Samsung S23 Plus | categoria: Pantallas Samsung OLED
- id: samsung-oled-s24-plus | producto_nombre: Pantalla para Samsung S24 Plus | categoria: Pantallas Samsung OLED
- id: samsung-oled-s9-plus | producto_nombre: Pantalla para Samsung S9 Plus | categoria: Pantallas Samsung OLED

## 图片异常

- 无

## 视频异常

- id: aimb-g5-ai-sports | producto_nombre: AIMB-G5 AI SPORTS | video_path: 空
- id: iphone-incell-16e | producto_nombre: Pantalla para iPhone 16e | video_path: 空
- id: iphone-incell-16plus | producto_nombre: Pantalla para iPhone 16 Plus | video_path: 空
- id: iphone-incell-16pro | producto_nombre: Pantalla para iPhone 16 Pro | video_path: 空
- id: iphone-incell-16promax | producto_nombre: Pantalla para iPhone 16 Pro Max | video_path: 空
- id: iphone-incell-17 | producto_nombre: Pantalla para iPhone 17 | video_path: 空
- id: iphone-incell-17air | producto_nombre: Pantalla para iPhone 17 Air | video_path: 空
- id: iphone-incell-17pro | producto_nombre: Pantalla para iPhone 17 Pro | video_path: 空
- id: iphone-incell-17promax | producto_nombre: Pantalla para iPhone 17 Pro Max | video_path: 空
- id: iphone-oled-16promax | producto_nombre: Pantalla para iPhone 16 Pro Max Soft OLED | video_path: 空
- id: micas-hd-clear-50 | producto_nombre: Micas HD Clear | video_path: 空
- id: micas-mate-corte | producto_nombre: Micas Mate | video_path: 空
- id: micas-privacidad-corte | producto_nombre: Micas Privacidad | video_path: 空
- id: s1-ai-classic | producto_nombre: HAODE AI CLASSIC S1 | video_path: 空
- id: samsung-incell-note-10-plus | producto_nombre: Pantalla para Samsung Note 10 Plus | video_path: 空
- id: samsung-incell-note-20-ultra | producto_nombre: Pantalla para Samsung Note 20 Ultra | video_path: 空
- id: samsung-incell-note-8 | producto_nombre: Pantalla para Samsung Note 8 | video_path: 空
- id: samsung-incell-note-9 | producto_nombre: Pantalla para Samsung Note 9 | video_path: 空
- id: samsung-incell-s20-ultra | producto_nombre: Pantalla para Samsung S20 Ultra | video_path: 空
- id: samsung-incell-s21 | producto_nombre: Pantalla para Samsung S21 | video_path: 空
- id: samsung-incell-s21-ultra | producto_nombre: Pantalla para Samsung S21 Ultra | video_path: 空
- id: samsung-incell-s24-ultra | producto_nombre: Pantalla para Samsung S24 Ultra | video_path: 空
- id: samsung-incell-s8 | producto_nombre: Pantalla para Samsung S8 | video_path: 空
- id: samsung-incell-s9 | producto_nombre: Pantalla para Samsung S9 | video_path: 空
- id: samsung-incell-s9-plus | producto_nombre: Pantalla para Samsung S9 Plus | video_path: 空
- id: samsung-oled-note-10 | producto_nombre: Pantalla para Samsung Note 10 | video_path: 空
- id: samsung-oled-note-10-plus | producto_nombre: Pantalla para Samsung Note 10 Plus | video_path: 空
- id: samsung-oled-note-20 | producto_nombre: Pantalla para Samsung Note 20 | video_path: 空
- id: samsung-oled-note-20-ultra | producto_nombre: Pantalla para Samsung Note 20 Ultra | video_path: 空
- id: samsung-oled-note-9 | producto_nombre: Pantalla para Samsung Note 9 | video_path: 空
- id: samsung-oled-s20 | producto_nombre: Pantalla para Samsung S20 | video_path: 空
- id: samsung-oled-s20-ultra | producto_nombre: Pantalla para Samsung S20 Ultra | video_path: 空
- id: samsung-oled-s21 | producto_nombre: Pantalla para Samsung S21 | video_path: 空
- id: samsung-oled-s21-plus | producto_nombre: Pantalla para Samsung S21 Plus | video_path: 空
- id: samsung-oled-s22-plus | producto_nombre: Pantalla para Samsung S22 Plus | video_path: 空
- id: samsung-oled-s23-plus | producto_nombre: Pantalla para Samsung S23 Plus | video_path: 空
- id: samsung-oled-s24-plus | producto_nombre: Pantalla para Samsung S24 Plus | video_path: 空
- id: samsung-oled-s9-plus | producto_nombre: Pantalla para Samsung S9 Plus | video_path: 空
- id: w630-ai-pro | producto_nombre: W630 AI PRO | video_path: 空
- id: x200t-cortadora-micas | producto_nombre: HAODE X200T Cortadora Inteligente de Micas | video_path: 空

## 价格异常

- id: iphone-incell-12promax | producto_nombre: Pantalla para iPhone 12 Pro Max | precio_publico: 250 | precio_mayoreo: 240 | website_precio_publico: 220 | website_precio_mayoreo: 210 | app_precio_publico: 250 | app_precio_mayoreo: 240
- id: iphone-incell-14 | producto_nombre: Pantalla para iPhone 14 | precio_publico: 260 | precio_mayoreo: 250 | website_precio_publico: 800 | website_precio_mayoreo: 750 | app_precio_publico: 260 | app_precio_mayoreo: 250
- id: iphone-incell-14plus | producto_nombre: Pantalla para iPhone 14 Plus | precio_publico: 300 | precio_mayoreo: 290 | website_precio_publico: 800 | website_precio_mayoreo: 750 | app_precio_publico: 300 | app_precio_mayoreo: 290
- id: iphone-incell-15plus | producto_nombre: Pantalla para iPhone 15 Plus | precio_publico: 330 | precio_mayoreo: 310 | website_precio_publico: 300 | website_precio_mayoreo: 290 | app_precio_publico: 330 | app_precio_mayoreo: 310
- id: iphone-oled-12mini | producto_nombre: Pantalla para iPhone 12 mini | precio_publico: 空 | precio_mayoreo: 空 | website_precio_publico: 空 | website_precio_mayoreo: 空 | app_precio_publico: 空 | app_precio_mayoreo: 空
- id: iphone-oled-13mini | producto_nombre: Pantalla para iPhone 13 mini | precio_publico: 空 | precio_mayoreo: 空 | website_precio_publico: 空 | website_precio_mayoreo: 空 | app_precio_publico: 空 | app_precio_mayoreo: 空
- id: iphone-oled-13promax | producto_nombre: Pantalla para iPhone 13 Pro Max | precio_publico: 900 | precio_mayoreo: 850 | website_precio_publico: 600 | website_precio_mayoreo: 590 | app_precio_publico: 900 | app_precio_mayoreo: 850
- id: iphone-oled-15plus | producto_nombre: Pantalla para iPhone 15 Plus | precio_publico: 空 | precio_mayoreo: 空 | website_precio_publico: 空 | website_precio_mayoreo: 空 | app_precio_publico: 空 | app_precio_mayoreo: 空
- id: iphone-oled-16 | producto_nombre: Pantalla para iPhone 16 | precio_publico: 空 | precio_mayoreo: 空 | website_precio_publico: 空 | website_precio_mayoreo: 空 | app_precio_publico: 空 | app_precio_mayoreo: 空
- id: iphone-oled-16plus | producto_nombre: Pantalla para iPhone 16 Plus | precio_publico: 空 | precio_mayoreo: 空 | website_precio_publico: 空 | website_precio_mayoreo: 空 | app_precio_publico: 空 | app_precio_mayoreo: 空
- id: samsung-incell-s20-plus | producto_nombre: Pantalla para Samsung S20 Plus | precio_publico: 550 | precio_mayoreo: 520 | website_precio_publico: 500 | website_precio_mayoreo: 480 | app_precio_publico: 550 | app_precio_mayoreo: 520
- id: samsung-incell-s9-plus | producto_nombre: Pantalla para Samsung S9 Plus | precio_publico: 500 | precio_mayoreo: 450 | website_precio_publico: 450 | website_precio_mayoreo: 430 | app_precio_publico: 500 | app_precio_mayoreo: 450
- id: samsung-oled-note-9 | producto_nombre: Pantalla para Samsung Note 9 | precio_publico: 空 | precio_mayoreo: 空 | website_precio_publico: 空 | website_precio_mayoreo: 空 | app_precio_publico: 空 | app_precio_mayoreo: 空
- id: samsung-oled-s20 | producto_nombre: Pantalla para Samsung S20 | precio_publico: 空 | precio_mayoreo: 空 | website_precio_publico: 空 | website_precio_mayoreo: 空 | app_precio_publico: 空 | app_precio_mayoreo: 空
- id: samsung-oled-s20-ultra | producto_nombre: Pantalla para Samsung S20 Ultra | precio_publico: 空 | precio_mayoreo: 空 | website_precio_publico: 空 | website_precio_mayoreo: 空 | app_precio_publico: 空 | app_precio_mayoreo: 空
- id: samsung-oled-s21 | producto_nombre: Pantalla para Samsung S21 | precio_publico: 空 | precio_mayoreo: 空 | website_precio_publico: 空 | website_precio_mayoreo: 空 | app_precio_publico: 空 | app_precio_mayoreo: 空
- id: samsung-oled-s21-plus | producto_nombre: Pantalla para Samsung S21 Plus | precio_publico: 空 | precio_mayoreo: 空 | website_precio_publico: 空 | website_precio_mayoreo: 空 | app_precio_publico: 空 | app_precio_mayoreo: 空
- id: samsung-oled-s22-plus | producto_nombre: Pantalla para Samsung S22 Plus | precio_publico: 空 | precio_mayoreo: 空 | website_precio_publico: 空 | website_precio_mayoreo: 空 | app_precio_publico: 空 | app_precio_mayoreo: 空
- id: samsung-oled-s23-plus | producto_nombre: Pantalla para Samsung S23 Plus | precio_publico: 空 | precio_mayoreo: 空 | website_precio_publico: 空 | website_precio_mayoreo: 空 | app_precio_publico: 空 | app_precio_mayoreo: 空
- id: samsung-oled-s24-plus | producto_nombre: Pantalla para Samsung S24 Plus | precio_publico: 空 | precio_mayoreo: 空 | website_precio_publico: 空 | website_precio_mayoreo: 空 | app_precio_publico: 空 | app_precio_mayoreo: 空
- id: samsung-oled-s9-plus | producto_nombre: Pantalla para Samsung S9 Plus | precio_publico: 空 | precio_mayoreo: 空 | website_precio_publico: 空 | website_precio_mayoreo: 空 | app_precio_publico: 空 | app_precio_mayoreo: 空

## 分类异常

- 无

## 自动比对机制

每次修改网站或 APP 后执行：

```bash
npm run product-control
```

该命令会自动：

1. 读取 `products-master.csv`
2. 比对网站产品数据
3. 比对 APP 产品数据
4. 检查图片文件是否存在
5. 检查视频文件是否存在
6. 检查产品是否漏发
7. 生成本报告

## 禁止事项

- 禁止自动修改价格。
- 禁止使用其他型号图片代替。
- 禁止用占位图冒充真实产品图。
- 禁止删除已有产品。

## 允许自动修复

- 图片路径错误。
- 视频路径错误。
- 分类字段错误。
- 漏发页面的结构性补齐。
