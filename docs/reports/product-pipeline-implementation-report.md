# HAODE Product Publish Pipeline V1 实施报告

日期：2026-06-05

## 实施目标

建立 HAODE Product Publish Pipeline V1：

```text
docs/master-data/products-master.csv
↓
npm run publish-products
↓
Firestore / App / 网站
↓
npm run verify-products
```

安全边界：

- 不自动修改价格
- 不删除产品
- 不改品牌信息
- 不改门店信息
- Firestore 无权限时不强行写入
- 保留原 `app/products.json` 和 `data/products.generated.js` 备份

## 已新增命令

```bash
npm run publish-products
npm run verify-products
```

## 已新增文件

| 文件 | 作用 |
| --- | --- |
| `scripts/product-transformers.js` | 统一 master CSV 到 Firestore / App / 网站的字段映射 |
| `scripts/publish-products.js` | 从 `products-master.csv` 发布，生成 App/网站数据，或生成 Firestore 待发布队列 |
| `scripts/verify-products.js` | 验证 master / App / 网站 / Firestore 一致性 |
| `docs/reports/firestore-publish-queue.json` | Firestore 无权限或未发布时的队列文件 |
| `docs/reports/product-publish-report.md` | publish-products 执行报告 |
| `docs/reports/product-verify-report.md` | verify-products 执行报告 |
| `docs/reports/product-pipeline-implementation-report.md` | 本实施报告 |

## 已修改文件

| 文件 | 修改内容 |
| --- | --- |
| `package.json` | 新增 `publish-products`、`verify-products` 命令 |
| `products.js` | 增加 `Gafas AI`、`Micas`、`Máquinas de Mica`、`Fundas` 分类识别，避免 master 生成多分类网站数据后页面崩溃 |

## 备份结果

已保留原始文件备份：

```text
data/backups/product-pipeline/2026-06-05T21-05-07-738Z/products.json
data/backups/product-pipeline/2026-06-05T21-05-07-738Z/products.generated.js
```

## publish-products 执行结果

命令：

```bash
npm run publish-products
```

结果：

```text
BLOCKED
```

原因：

`products-master.csv` 中有 14 个产品缺少 V1 必填价格字段：

- `iphone-oled-12mini`
- `iphone-oled-13mini`
- `iphone-oled-15plus`
- `iphone-oled-16`
- `iphone-oled-16plus`
- `samsung-oled-note-9`
- `samsung-oled-s20`
- `samsung-oled-s20-ultra`
- `samsung-oled-s21`
- `samsung-oled-s21-plus`
- `samsung-oled-s22-plus`
- `samsung-oled-s23-plus`
- `samsung-oled-s24-plus`
- `samsung-oled-s9-plus`

安全判断：

```text
没有价格不能发布；不能自动补价；不能用 Consultar 冒充老板确认价格。
```

因此本次 `publish-products` 没有覆盖生成新的 `app/products.json` / `data/products.generated.js`，也没有同步 Firestore。

详细报告：

```text
docs/reports/product-publish-report.md
```

## verify-products 执行结果

命令：

```bash
npm run verify-products
```

结果：

```text
BLOCKED
```

统计：

| 指标 | 数量 |
| --- | ---: |
| Master 产品数 | 101 |
| 一致性问题 | 52 |
| Firestore 队列条目 | 0 |

主要失败原因：

- 14 个缺价格产品没有进入 App / Firestore
- `funda-magnetica-17-pro-max` 缺 Firestore 文档
- `iphone-oled-12-12pro` 缺 Firestore 文档
- 7 个价格异常仍存在网站价格与 master 不一致
- 部分 AI / Micas / Fundas 产品当前网站 generated 数据缺失

详细报告：

```text
docs/reports/product-verify-report.md
```

## Firestore 同步结果

Firestore 本次未同步。

原因：

1. `publish-products` 在 master 预检阶段被 14 个缺价格产品阻止。
2. 当前环境没有提供 Firestore 写入凭证。
3. 安全规则要求无权限时不能强行写入。

待发布队列：

```text
docs/reports/firestore-publish-queue.json
```

当前队列为空，因为本次发布在 master 预检阶段已被阻止，尚未进入 Firestore 差异发布阶段。

## 当前结论

V1 管线已经建立：

```text
products-master.csv
↓
publish-products
↓
verify-products
```

但首次执行未通过发布闸门。

最大阻塞项：

```text
products-master.csv 中 14 个产品缺少价格。
```

下一步必须先由老板确认这些产品价格，或者在 master 中将其标记为不参与发布，再重新运行：

```bash
npm run publish-products
npm run verify-products
```
