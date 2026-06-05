# HAODE Product Control Center 最终优先级清单

日期：2026-06-05

## 分析依据

- `docs/reports/product-control-fix-round-2.md`
- `data/products-master.xlsx`
- `docs/reports/product-health-report.md`

本报告只生成优先级清单，不修复、不上传、不改价格。

## 总览

当前 Product Control Center Round 2 后：

- 真实缺产品：24 个
- 价格异常：7 个
- 重复产品：0 个
- 图片完整率：100.0%
- 视频完整率：55.5%

## 优先级1：必须本周补齐 / 确认

数量：10

其中 3 个是低风险平台补齐，7 个是价格异常确认。价格异常不自动修改，但必须本周确认，因为已上线价格不一致会直接影响客户报价。

### 1A. 必须本周补齐

| SKU | 产品名称 | 分类 | 当前状态 | 需要补齐 |
| --- | --- | --- | --- | --- |
| `funda-magnetica-17-pro-max` | Funda Magnetica | Fundas | 缺平台 | Firestore + website |
| `funda-premium-17-pro-max` | Funda Premium Aluminio | Fundas | 缺平台 | website |
| `iphone-oled-12-12pro` | Pantalla para iPhone 12 / 12 Pro | Pantallas iPhone OLED | 缺平台 | Firestore |

老板判断：

- 这 3 个是真正应该补的产品。
- 本周可以优先处理。

### 1B. 必须本周确认价格

| SKU | 产品名称 | 分类 | Master/App 价格 | 当前状态 | 处理建议 |
| --- | --- | --- | ---: | --- | --- |
| `iphone-incell-12promax` | Pantalla para iPhone 12 Pro Max | Pantallas iPhone INCELL | 250 / 240 | 价格异常 | 老板确认后统一 |
| `iphone-incell-14` | Pantalla para iPhone 14 | Pantallas iPhone INCELL | 260 / 250 | 价格异常 | 老板确认后统一 |
| `iphone-incell-14plus` | Pantalla para iPhone 14 Plus | Pantallas iPhone INCELL | 300 / 290 | 价格异常 | 老板确认后统一 |
| `iphone-incell-15plus` | Pantalla para iPhone 15 Plus | Pantallas iPhone INCELL | 330 / 310 | 价格异常 | 老板确认后统一 |
| `iphone-oled-13promax` | Pantalla para iPhone 13 Pro Max | Pantallas iPhone OLED | 900 / 850 | 价格异常 | 老板确认后统一 |
| `samsung-incell-s20-plus` | Pantalla para Samsung S20 Plus | Pantallas Samsung INCELL | 550 / 520 | 价格异常 | 老板确认后统一 |
| `samsung-incell-s9-plus` | Pantalla para Samsung S9 Plus | Pantallas Samsung INCELL | 500 / 450 | 价格异常 / 视频缺失 | 先核价，视频后补 |

## 优先级2：有时间再补

数量：7

这些产品主要缺 website，同时存在视频缺失。是否上线取决于老板是否允许“无视频也可上线”。

| SKU | 产品名称 | 分类 | 当前状态 | 建议 |
| --- | --- | --- | --- | --- |
| `aimb-g5-ai-sports` | AIMB-G5 AI SPORTS | Gafas AI | 缺平台 / 视频缺失 | 先补视频，或允许无视频上线 |
| `micas-hd-clear-50` | Micas HD Clear | Micas | 缺平台 / 视频缺失 | 先补视频，或允许无视频上线 |
| `micas-mate-corte` | Micas Mate | Micas | 缺平台 / 视频缺失 | 先补视频，或允许无视频上线 |
| `micas-privacidad-corte` | Micas Privacidad | Micas | 缺平台 / 视频缺失 | 先补视频，或允许无视频上线 |
| `s1-ai-classic` | HAODE AI CLASSIC S1 | Gafas AI | 缺平台 / 视频缺失 | 先补视频，或允许无视频上线 |
| `w630-ai-pro` | W630 AI PRO | Gafas AI | 缺平台 / 视频缺失 | 先补视频，或允许无视频上线 |
| `x200t-cortadora-micas` | HAODE X200T Cortadora Inteligente de Micas | Máquinas de Mica | 缺平台 / 视频缺失 | 先补视频，或允许无视频上线 |

老板判断：

- 有时间再补。
- 如果视频不是强制要求，可以第二批补 website。
- 如果视频是核心卖点，先补视频素材。

## 优先级3：暂时忽略

数量：14

这些产品缺 Firestore / App，但价格或库存状态需要先确认。不要直接上传。

| SKU | 产品名称 | 分类 | 当前状态 | 原因 |
| --- | --- | --- | --- | --- |
| `iphone-oled-12mini` | Pantalla para iPhone 12 mini | Pantallas iPhone OLED | 缺平台 | 先核价 / 库存 |
| `iphone-oled-13mini` | Pantalla para iPhone 13 mini | Pantallas iPhone OLED | 缺平台 | 先核价 / 库存 |
| `iphone-oled-15plus` | Pantalla para iPhone 15 Plus | Pantallas iPhone OLED | 缺平台 | 先核价 / 库存 |
| `iphone-oled-16` | Pantalla para iPhone 16 | Pantallas iPhone OLED | 缺平台 | 先核价 / 库存 |
| `iphone-oled-16plus` | Pantalla para iPhone 16 Plus | Pantallas iPhone OLED | 缺平台 | 先核价 / 库存 |
| `samsung-oled-note-9` | Pantalla para Samsung Note 9 | Pantallas Samsung OLED | 缺平台 / 视频缺失 | 先核价 / 库存 |
| `samsung-oled-s20` | Pantalla para Samsung S20 | Pantallas Samsung OLED | 缺平台 / 视频缺失 | 先核价 / 库存 |
| `samsung-oled-s20-ultra` | Pantalla para Samsung S20 Ultra | Pantallas Samsung OLED | 缺平台 / 视频缺失 | 先核价 / 库存 |
| `samsung-oled-s21` | Pantalla para Samsung S21 | Pantallas Samsung OLED | 缺平台 / 视频缺失 | 先核价 / 库存 |
| `samsung-oled-s21-plus` | Pantalla para Samsung S21 Plus | Pantallas Samsung OLED | 缺平台 / 视频缺失 | 先核价 / 库存 |
| `samsung-oled-s22-plus` | Pantalla para Samsung S22 Plus | Pantallas Samsung OLED | 缺平台 / 视频缺失 | 先核价 / 库存 |
| `samsung-oled-s23-plus` | Pantalla para Samsung S23 Plus | Pantallas Samsung OLED | 缺平台 / 视频缺失 | 先核价 / 库存 |
| `samsung-oled-s24-plus` | Pantalla para Samsung S24 Plus | Pantallas Samsung OLED | 缺平台 / 视频缺失 | 先核价 / 库存 |
| `samsung-oled-s9-plus` | Pantalla para Samsung S9 Plus | Pantallas Samsung OLED | 缺平台 / 视频缺失 | 先核价 / 库存 |

老板判断:

- 暂时忽略，不上传。
- 先确认价格、库存、是否真的要上架。

## 7 个价格异常完整名单

这些不属于“上传产品”任务，属于价格一致性任务。按老板规则，不自动修改价格，但列入优先级1确认。

| SKU | 产品名称 | 分类 | 当前状态 | 处理建议 |
| --- | --- | --- | --- | --- |
| `iphone-incell-12promax` | Pantalla para iPhone 12 Pro Max | Pantallas iPhone INCELL | 价格异常 | 等老板确认 |
| `iphone-incell-14` | Pantalla para iPhone 14 | Pantallas iPhone INCELL | 价格异常 | 等老板确认 |
| `iphone-incell-14plus` | Pantalla para iPhone 14 Plus | Pantallas iPhone INCELL | 价格异常 | 等老板确认 |
| `iphone-incell-15plus` | Pantalla para iPhone 15 Plus | Pantallas iPhone INCELL | 价格异常 | 等老板确认 |
| `iphone-oled-13promax` | Pantalla para iPhone 13 Pro Max | Pantallas iPhone OLED | 价格异常 | 等老板确认 |
| `samsung-incell-s20-plus` | Pantalla para Samsung S20 Plus | Pantallas Samsung INCELL | 价格异常 | 等老板确认 |
| `samsung-incell-s9-plus` | Pantalla para Samsung S9 Plus | Pantallas Samsung INCELL | 价格异常 / 视频缺失 | 等老板确认 |

## 最终建议

【优先级1】

本周处理 10 个：

- `funda-magnetica-17-pro-max`
- `funda-premium-17-pro-max`
- `iphone-oled-12-12pro`
- 7 个价格异常先由老板确认，不自动改价

【优先级2】

有时间再处理 7 个缺 website / 缺视频产品。先决定是否允许无视频上线。

【优先级3】

14 个缺平台但需要核价/库存的产品暂时忽略，不上传。7 个价格异常只等老板确认，不自动改价。
