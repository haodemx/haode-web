# HAODE 缺产品 75 项分类分析

日期：2026-06-05

## 分析范围

依据：

- `data/products-master.xlsx`
- `docs/reports/product-health-report.md`

本次只分析，不修复、不创建产品、不删除产品、不修改价格。

## CEO 结论

不要补 75 个。

Product Control Center 的“缺产品”含义是：某个产品缺 Firestore / 网站 / App 任意一端，不等于真实业务缺货，也不等于 75 个都应该上传。

这 75 个里：

- 真正优先补：3 个
- 可考虑补视频或允许无视频上线：7 个
- 先核价，不要直接上传：14 个
- 历史遗留 / 价格表派生 SKU：51 个，应该忽略或从监控口径清理
- 当前明确应删除：0 个

## A-F 分类统计

| 分类 | 数量 | 老板动作 |
| --- | ---: | --- |
| A. 应该存在但未上传产品 | 3 | 真正优先补 |
| B. 已停卖产品 | 0 | 没有证据，不删除 |
| C. 历史遗留产品 | 51 | 不补，建议忽略或从监控口径清理 |
| D. 图片缺失导致未上线产品 | 0 主因 | 51 条历史遗留同时缺图，但不应按新品补图 |
| E. 视频缺失导致未上线产品 | 7 | 可补视频，或明确允许无视频上线 |
| F. 价格异常产品 | 14 个缺产品内价格需核对；另有 7 个官方价格异常 | 先核价，不自动修改 |

说明：

- C 与 D 有重叠：51 个历史遗留 SKU 同时缺图，但不能因此直接补图上线。
- F 分两层：14 个属于 75 个缺产品里的核价阻塞；另有 7 个是 Product Control Center 官方价格异常清单。

## A. 应该存在但未上传产品

数量：3

这 3 个有价格、有素材，属于低风险补平台项。

| SKU | 产品 | 缺失平台 | CEO 判断 |
| --- | --- | --- | --- |
| `funda-magnetica-17-pro-max` | Funda Magnetica | Firestore + website | 可补 |
| `funda-premium-17-pro-max` | Funda Premium Aluminio | website | 可补 |
| `iphone-oled-12-12pro` | Pantalla para iPhone 12 / 12 Pro | Firestore | 可补 |

结论：

- 这 3 个是真正第一批需要补的产品。
- 本报告不执行补齐，只给老板决策。

## B. 已停卖产品

数量：0

当前文件没有明确停卖证据。

结论：

- 不删除。
- 不下架。
- 不标记停卖。

## C. 历史遗留产品

数量：51

这些产品主要是 `pantallas-iphone-...` 开头的价格表派生 SKU。

特征：

- Firestore 缺失
- 网站缺失
- App 缺失
- 图片缺失
- 视频缺失
- 多数是价格表行项目，不是已经运营中的商品页

### 按分类统计

| 分类 | 数量 |
| --- | ---: |
| Pantallas iPhone INCELL | 32 |
| Pantallas iPhone OLED | 19 |

结论：

- 不上传。
- 不补素材。
- 不删除线上产品，因为它们基本还不是线上产品。
- 建议后续从 Product Control Center 的 exceptions 监控口径中加入 ignore / alias 映射，减少噪音。

## D. 图片缺失导致未上线产品

数量：0 主因

说明：

- 确实有 51 条历史 SKU 同时缺图片。
- 但这些不是“只要补图片就应该上线”的产品。
- 它们的主因是历史遗留 / 价格表派生 SKU，而不是单纯图片缺失。

结论：

- 不因为缺图就启动补图。
- 先忽略，除非老板决定把 6 月价格表行项目全部商品化。

## E. 视频缺失导致未上线产品

数量：7

这些产品已经有一定业务基础，但缺 website 或视频状态影响上线判断。

| SKU | 产品 | CEO 判断 |
| --- | --- | --- |
| `aimb-g5-ai-sports` | AIMB-G5 AI SPORTS | 先补视频，或允许无视频上线 |
| `micas-hd-clear-50` | Micas HD Clear | 先补视频，或允许无视频上线 |
| `micas-mate-corte` | Micas Mate | 先补视频，或允许无视频上线 |
| `micas-privacidad-corte` | Micas Privacidad | 先补视频，或允许无视频上线 |
| `s1-ai-classic` | HAODE AI CLASSIC S1 | 先补视频，或允许无视频上线 |
| `w630-ai-pro` | W630 AI PRO | 先补视频，或允许无视频上线 |
| `x200t-cortadora-micas` | HAODE X200T Cortadora Inteligente de Micas | 先补视频，或允许无视频上线 |

结论：

- 视频缺失不一定要阻止上线。
- 如果老板允许“无视频也可上线”，这 7 个可进入第二批补网站。
- 如果视频是核心卖点，则先补视频再上线。

## F. 价格异常产品

### 75 个缺产品内：先核价，不要上传

数量：14

这些产品缺 Firestore / App，但价格空缺或不可靠，直接上传会把错误价格带到 App / Firestore。

| 分类 | SKU |
| --- | --- |
| iPhone OLED | `iphone-oled-12mini` |
| iPhone OLED | `iphone-oled-13mini` |
| iPhone OLED | `iphone-oled-15plus` |
| iPhone OLED | `iphone-oled-16` |
| iPhone OLED | `iphone-oled-16plus` |
| Samsung OLED | `samsung-oled-note-9` |
| Samsung OLED | `samsung-oled-s20` |
| Samsung OLED | `samsung-oled-s20-ultra` |
| Samsung OLED | `samsung-oled-s21` |
| Samsung OLED | `samsung-oled-s21-plus` |
| Samsung OLED | `samsung-oled-s22-plus` |
| Samsung OLED | `samsung-oled-s23-plus` |
| Samsung OLED | `samsung-oled-s24-plus` |
| Samsung OLED | `samsung-oled-s9-plus` |

结论：

- 这 14 个不要直接补。
- 先确认价格和库存，再决定是否上传。

### 官方价格异常清单

数量：7

这些不是 75 个缺产品里的主缺口，但会影响三方一致性。

| SKU | 产品 | 当前判断 |
| --- | --- | --- |
| `iphone-incell-12promax` | Pantalla para iPhone 12 Pro Max | 网站价偏旧 |
| `iphone-incell-14` | Pantalla para iPhone 14 | 网站价明显异常 |
| `iphone-incell-14plus` | Pantalla para iPhone 14 Plus | 网站价明显异常 |
| `iphone-incell-15plus` | Pantalla para iPhone 15 Plus | 网站价偏旧 |
| `iphone-oled-13promax` | Pantalla para iPhone 13 Pro Max | 网站价偏旧或 Master 新价大幅调整 |
| `samsung-incell-s20-plus` | Pantalla para Samsung S20 Plus | 网站价偏旧 |
| `samsung-incell-s9-plus` | Pantalla para Samsung S9 Plus | 网站价偏旧 |

结论：

- 不自动改价。
- 必须老板确认以 Master/App 为准，还是以网站当前价格为准。

## 老板决策

### 哪些真正需要补

第一批真正需要补：3 个

- `funda-magnetica-17-pro-max`
- `funda-premium-17-pro-max`
- `iphone-oled-12-12pro`

第二批可考虑补：7 个

- `aimb-g5-ai-sports`
- `micas-hd-clear-50`
- `micas-mate-corte`
- `micas-privacidad-corte`
- `s1-ai-classic`
- `w630-ai-pro`
- `x200t-cortadora-micas`

但第二批要先决定：补视频，还是允许无视频上线。

### 哪些应该删除

当前应该删除：0 个

原因：

- 没有明确停卖证据。
- 没有明确重复产品。
- 51 个历史 SKU 是监控噪音，不是线上产品，不需要删除线上数据。

### 哪些应该忽略

应该忽略：51 个

这些 `pantallas-iphone-...` SKU 是价格表派生 / 历史遗留项，不应作为当前要补的产品。

## 优先级

【优先级1】

补 A 的 3 个低风险平台缺口：

- `funda-magnetica-17-pro-max`
- `funda-premium-17-pro-max`
- `iphone-oled-12-12pro`

【优先级2】

决定 E 的 7 个是否允许无视频上线。

- 如果允许：进入网站补齐。
- 如果不允许：先补视频素材。

【优先级3】

处理 F：

- 14 个缺产品内的价格/库存先核对。
- 7 个官方价格异常等老板确认后再改。
- 51 个历史遗留 SKU 先忽略，后续优化 Product Control Center 的 ignore / alias 规则。
