# HAODE Firestore Source Audit

日期：2026-06-05

审计范围：

- `funda-magnetica-17-pro-max`
- `funda-premium-17-pro-max`
- `iphone-oled-12-12pro`

本报告只审计，不创建 Firestore 文档，不修改产品数据。

## 1. Firestore collection 名称

Product Control Center 当前读取的 Firestore 路径：

```text
projects/haode-app/databases/(default)/documents/products
```

Firestore collection 名称：

```text
products
```

依据：`scripts/product-control-center.py` 中 `FIRESTORE_URL` 指向 `/documents/products`。

## 2. document id 核验结果

| SKU | Firestore collection | document id | 只读查询结果 | 结论 |
| --- | --- | --- | --- | --- |
| `funda-magnetica-17-pro-max` | `products` | `funda-magnetica-17-pro-max` | `404 NOT_FOUND` | Firestore 确实没有文档 |
| `funda-premium-17-pro-max` | `products` | `funda-premium-17-pro-max` | `200 OK` | Firestore 有文档 |
| `iphone-oled-12-12pro` | `products` | `iphone-oled-12-12pro` | `404 NOT_FOUND` | Firestore 确实没有文档 |

`funda-premium-17-pro-max` 当前 Firestore 字段核验：

| 字段 | 当前值 |
| --- | --- |
| `id` | `funda-premium-17-pro-max` |
| `categoria` | `Fundas` |
| `nombre` | `Funda Premium Aluminio` |
| `precioPublico` | `85` |
| `precioMayoreo` | `75` |

## 3. App 数据来源

Product Control Center 的 App 来源文件：

```text
app/products.json
```

三条 SKU 在 App 中都存在：

| SKU | App 来源 | App 状态 |
| --- | --- | --- |
| `funda-magnetica-17-pro-max` | `app/products.json` | 存在 |
| `funda-premium-17-pro-max` | `app/products.json` | 存在 |
| `iphone-oled-12-12pro` | `app/products.json` | 存在 |

## 4. 网站数据来源

Product Control Center 的网站来源文件：

```text
data/products.generated.js
```

三条 SKU 当前在网站主数据中都存在：

| SKU | 网站主数据来源 | 静态产品页 | 网站状态 |
| --- | --- | --- | --- |
| `funda-magnetica-17-pro-max` | `data/products.generated.js` | `producto/funda-magnetica-estilo-iphone-17-pro-max/index.html` | 存在 |
| `funda-premium-17-pro-max` | `data/products.generated.js` | `producto/funda-premium-aluminio-estilo-iphone-17-pro-max/index.html` | 存在 |
| `iphone-oled-12-12pro` | `data/products.generated.js` | `producto/iphone-oled-12-12pro/index.html` | 存在 |

## 5. 为什么 App 有产品，但系统仍判断 Firestore 缺失

Product Control Center 不是只检查“产品是否在任意平台出现”，而是分别检查每个 SKU 是否同时存在于以下来源：

- products-master
- Firestore `products`
- 网站 `data/products.generated.js`
- App `app/products.json`

因此：

- App 中存在，只能证明 App 数据源已有该 SKU。
- Firestore 缺失，是指同一个 document id 在 Firestore `products` collection 中不存在。
- App 存在不能自动代表 Firestore 存在。
- 网站存在也不能自动代表 Firestore 存在。

当前健康报告中的判断为：

```text
funda-magnetica-17-pro-max | 缺: firestore
iphone-oled-12-12pro | 缺: firestore
```

这与 Firestore 只读查询结果一致。

## 6. 最终结论

### `funda-magnetica-17-pro-max`

结论：A. Firestore 确实没有文档。

原因：App 和网站均存在，但 Firestore `products/funda-magnetica-17-pro-max` 返回 `404 NOT_FOUND`。

### `funda-premium-17-pro-max`

结论：Firestore 有文档，且当前不属于 Firestore 缺失。

原因：Firestore `products/funda-premium-17-pro-max` 返回 `200 OK`。如果旧报告曾判断该产品缺平台，缺口是网站来源，不是 Firestore。

### `iphone-oled-12-12pro`

结论：A. Firestore 确实没有文档。

原因：App 和网站均存在，但 Firestore `products/iphone-oled-12-12pro` 返回 `404 NOT_FOUND`。

## 7. 是否存在检测规则错误

本次审计没有发现 Firestore 缺失检测规则错误。

对 `funda-magnetica-17-pro-max` 和 `iphone-oled-12-12pro`，系统判断 Firestore 缺失是正确的。

对 `funda-premium-17-pro-max`，Firestore 文档存在，系统不应将其判断为 Firestore 缺失。
