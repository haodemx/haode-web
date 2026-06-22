# HAODE AI 智能眼镜产品审计

审计日期：2026-06-05

## 结论

- 老板确认应有 AI 智能眼镜数量：5 个
- 审计前 APP 实际 AI 智能眼镜数量：3 个（W630、G5、S1）
- 审计前确认缺失：G3、W610
- 修复后 APP 实际 AI 智能眼镜数量：5 个
- 修复后官网 Productos AI / Gafas AI 页面实际 AI 智能眼镜数量：5 个
- 未直接写入 Firestore；仅在本地生成待发布队列

## 应有产品

| 型号 | 状态 | 价格状态 |
| --- | --- | --- |
| S1 | 已存在 | Menudeo 1500 / Mayoreo 1200 |
| G3 | 已补齐 | Menudeo 1700 / Mayoreo 1300 |
| G5 | 已存在 | Menudeo 1800 / Mayoreo 1400 |
| W630 | 已存在 | Menudeo 1900 / Mayoreo 1600 |
| W610 | 已补齐 | Menudeo 1800 / Mayoreo 1500 |

## 缺失产品

| 产品 | 审计前状态 | 修复后状态 |
| --- | --- | --- |
| G3 | APP / products-master / products.generated.js 缺失；官网静态页已有 G3 详情和卡片 | 已补入 APP、products-master、products.generated.js、Firestore 待发布队列 |
| W610 | APP、官网、products-master、products.generated.js、详情页均缺失 | 已补入 APP、官网卡片、详情页、products-master、products.generated.js、sitemap、Firestore 待发布队列 |

## 重复产品

- 未发现 S1、G3、G5、W630、W610 的重复 APP 条目。
- G3 官网已有旧详情页 `ai-smart-glasses-aimb-g3.html`，本次未新增第二个 G3 详情页，避免重复页面。

## 官网状态

- `/ai-productos.html`：已显示 S1、G3、G5、W630、W610 五个 AI 智能眼镜卡片。
- `/ai-smart-glasses-aimb-g3.html`：已存在并可作为 G3 详情页。
- `/ai-smart-glasses-w610.html`：已新增 W610 详情页。
- `/sitemap.xml`：已新增 W610 详情页 URL。
- `/productos-ai.html` 与 `/productos-ai/index.html`：作为 Productos AI 总分类页存在，入口可进入 Gafas AI 页面。

## APP 状态

- APP 数据文件位于 sibling 项目：`/Users/mac/Documents/haode/app/products.json`。
- 修复后 Gafas AI 中包含 5 个目标产品：
  - `s1-ai-classic`
  - `haode-ai-g3-smart-glasses`
  - `aimb-g5-ai-sports`
  - `w630-ai-pro`
  - `haode-ai-w610-smart-glasses`
- 重点官网项目 `/Users/mac/Documents/haode/HAODE-WEBSITE/haode-web` 当前没有 `/app/products.json` 文件。

## 数据源状态

- `products-master.csv`：已补入 G3、W610。
- `products.generated.js`：两个网站副本均已补齐 5 个 AI 智能眼镜产品数据。
- `app/products.json`：已补入 G3、W610。
- Firestore / publish queue：存在于 `/Users/mac/Documents/haode/docs/reports/firestore-publish-queue.json`，已生成 G3、W610 待发布项；未直接线上写入。
- WhatsApp Catalog：当前为分类级数据，未发现单品级 G3/W610 条目；未自动上传 WhatsApp。

## 图片状态

| 产品 | 图片路径 | 状态 |
| --- | --- | --- |
| S1 | `/assets/products/productos-ai/s1-ai-classic/main.png` | 已存在 |
| G3 | `/assets/products/other/ai-smart-glasses-aimb-g3-main.jpeg` | 已存在，未误用 G5/W630 |
| G5 | `/assets/products/productos-ai/aimb-g5-ai-smart-glasses/main.jpg` | 已存在 |
| W630 | `/assets/products/productos-ai/w630-ai-smart-glasses/main.jpg` | 已存在 |
| W610 | `/assets/products/placeholder.svg` | 缺少真实确认图片，暂用占位图 |

## 价格状态

- G3：Menudeo 1700 / Mayoreo 1300，已按老板确认补入。
- W610：Menudeo 1800 / Mayoreo 1500，已按老板确认补入。
- 未修改其他产品价格。

## 验证结果

- APP fallback 数据中 Gafas AI 目标产品数量：5。
- 官网 Gafas AI 页面中目标产品数量：5。
- 搜索数据中 `G3` 可命中。
- 搜索数据中 `W610` 可命中。
- G3 详情页存在：`/ai-smart-glasses-aimb-g3.html`。
- W610 详情页存在：`/ai-smart-glasses-w610.html`。
- Firestore 未直接发布，仅生成本地待发布队列。
