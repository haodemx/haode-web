# HAODE Data Architecture Audit

日期：2026-06-05

审计目标：搞清楚 HAODE 当前产品数据流。

本报告只审计架构，不修改数据，不创建产品，不修改价格。

## 1. 当前实际架构图

### 当前真实状态

```text
docs/master-data/products-master.csv
        ↓
Product Control Center 合并审计
        ↓
data/products-master.xlsx
docs/reports/product-health-report.md

Firestore products collection  ───────→  App 优先读取
                                          ↓ 如果失败 / 无有效产品
app/products.json              ───────→  App fallback 读取

data/products.generated.js     ───────→  网站产品列表 / 产品页
products.js                    ───────→  网站渲染逻辑
```

### 不是当前实际状态的理想链路

```text
products-master
↓
Firestore
↓
App
↓
网站
```

这条链路目前还没有完整实现。

## 2. 网站产品来源

网站当前主要读取：

```text
data/products.generated.js
products.js
```

证据：

- `productos.html` 加载 `/haode-web/data/products.generated.js` 和 `/haode-web/products.js`
- `producto.html` 加载 `/haode-web/data/products.generated.js` 和 `/haode-web/products.js`
- `products.js` 优先使用 `window.HAODE_PRODUCTS_DATA`

当前判断：

- 网站不是直接从 Firestore 读取产品。
- 网站也不是直接从 `products-master.xlsx` 读取产品。
- 网站使用的是本地生成 JS 数据。

## 3. App 产品来源

App 当前有两套读取逻辑：

```text
Firestore products collection
↓ 如果成功且有真实目录
App 使用 Firestore

如果 Firestore 失败 / 无有效产品
↓
App fallback 使用 app/products.json
```

证据：

- `app/app.js` 中 `loadFirestoreProducts()` 读取 Firestore `products`
- `app/app.js` 中 `loadLocalProducts()` 读取 `/haode-web/app/products.json`
- `app/app.js` 中 fallback 日志为 `HAODE app usando products.json fallback`
- `app/products.json` 请求使用 `cache: "no-store"`

当前判断：

- App 不是只依赖 Firestore。
- App 能显示本地 JSON 中存在、但 Firestore 不存在的产品。
- 这就是 App 和 Firestore 出现分叉的直接原因。

## 4. Firestore 产品来源

Firestore 当前项目：

```text
projectId: haode-app
collection: products
```

证据：

- `app/firebase-config.js` 中 `projectId` 是 `haode-app`
- `app/app.js` 查询 `collection(db, "products")`
- `app/admin.js` 后台读写 `collection(db, "products")`
- `scripts/product-control-center.py` 的 Firestore REST 地址指向 `/documents/products`
- `firestore.rules` 中规则为 `match /products/{productId}`

当前判断：

- Firestore 是 App 的优先在线来源。
- Firestore 不是网站当前的直接来源。
- Firestore 也不是由 `products-master.xlsx` 自动生成。

## 5. products-master.xlsx 的作用

当前文件：

```text
data/products-master.xlsx
```

工作表：

- `products-master`
- `daily-check`
- `exceptions`
- `ignored-by-product-control`
- `sources`

当前判断：

- `products-master.xlsx` 是 Product Control Center 生成的审计/控制工作簿。
- 它汇总价格表、Firestore、网站数据、App JSON、既有 master CSV。
- 它不是当前 App 的线上读取源。
- 它不是当前网站的线上读取源。
- 它目前还没有自动发布到 Firestore。

## 6. 是否存在本地 JSON

存在。

```text
app/products.json
```

作用：

- App 的 fallback 产品库。
- Admin 后台可从它导入或同步到 Firestore。
- 当前不是由 `products-master.xlsx` 自动生成。

结论：

```text
存在本地 JSON，而且它正在影响 App 显示。
```

## 7. 是否存在缓存数据

### 代码层缓存

Product Control Center 预留了 Firestore 本地导出缓存路径：

```text
data/firestore-products.json
```

但当前文件列表未发现该文件。

脚本逻辑是：

```text
如果 data/firestore-products.json 存在 → 读取缓存
否则 → 实时读取 Firestore
```

### 浏览器 / App 读取缓存

App 读取 `app/products.json` 时使用：

```text
cache: "no-store"
```

Admin 后台读取 `app/products.json` 时也使用：

```text
cache: "no-store"
```

结论：

- 当前没有发现 `data/firestore-products.json` 本地缓存文件。
- App 产品出现不是浏览器缓存造成的。
- App 产品出现来自真实存在的 `app/products.json` fallback。

## 8. 是否存在多个产品库

存在，而且是当前最大架构风险。

当前至少有这些产品库 / 产品源：

| 来源 | 文件 / 系统 | 当前角色 |
| --- | --- | --- |
| 运营主数据 CSV | `docs/master-data/products-master.csv` | 名义主数据 / V1 控制源 |
| 审计工作簿 | `data/products-master.xlsx` | Product Control Center 汇总结果 |
| App 本地 JSON | `app/products.json` | App fallback 产品库 |
| 网站生成 JS | `data/products.generated.js` | 网站产品数据 |
| 网站旧逻辑库 | `products.js` | 网站产品渲染与旧定义 fallback |
| Firestore | `haode-app/products` | App 优先在线来源 |
| 最新价格表 | 本机价格表文件 | Product Control Center 输入源 |

结论：

```text
HAODE 当前不是单一主数据架构，而是多产品库并存。
```

## 9. 哪个才是真正主数据源

### 名义上的主数据源

```text
docs/master-data/products-master.csv
```

原因：

- `docs/master-data/README.md` 明确写它是“唯一产品主数据中心”。
- 读取原则写明网站、APP、Firestore 同步流程以后应以此文件作为运营主数据基准。

### 当前实际运行中的主数据源

不是一个，而是分裂状态：

| 场景 | 实际来源 |
| --- | --- |
| App 在线优先 | Firestore `products` |
| App fallback | `app/products.json` |
| 网站 | `data/products.generated.js` |
| 产品健康审计 | `data/products-master.xlsx` / Product Control Center 合并结果 |

CEO 结论：

```text
名义主数据源是 docs/master-data/products-master.csv。
实际线上运行没有单一主数据源。
```

## 10. 为什么 App 有产品，但 Firestore 没有

审计对象：

- `funda-magnetica-17-pro-max`
- `iphone-oled-12-12pro`

### 实际原因

这两个产品存在于：

```text
app/products.json
data/products.generated.js
```

但不存在于：

```text
Firestore products collection
```

根据 `docs/reports/firestore-source-audit.md`：

| SKU | App | 网站 | Firestore |
| --- | --- | --- | --- |
| `funda-magnetica-17-pro-max` | 存在 | 存在 | `404 NOT_FOUND` |
| `iphone-oled-12-12pro` | 存在 | 存在 | `404 NOT_FOUND` |

所以 App 能显示它们的原因是：

```text
App fallback 到 app/products.json。
```

不是因为 Firestore 有文档。

最终判断：

```text
Firestore 缺失判断正确。
App 出现产品，是因为 App 本地 JSON 与 Firestore 分叉。
```

## 11. 要实现 products-master → Firestore → App → 网站 还缺什么

目标架构：

```text
products-master
↓
Firestore
↓
App
↓
网站
```

当前缺口：

| 缺口 | 当前状态 | 需要补齐 |
| --- | --- | --- |
| Master 到 Firestore 同步 | 不存在完整自动同步 | 建立 `products-master` → Firestore 发布脚本 |
| Firestore 写权限 | 只有管理员可写 | 使用管理员账号 / 服务端凭证 / CI secret |
| App 数据统一 | App 有 Firestore + JSON fallback | 明确 fallback 是否保留，若保留必须由 master 自动生成 |
| 网站数据统一 | 网站读 `data/products.generated.js` | 由 Firestore/master 自动生成网站数据，或网站改为读 Firestore |
| 自动验证 | Product Control Center 已有验证 | 发布后强制验证 Firestore / App / 网站一致 |
| 价格审批 | 价格异常不能自动改 | 建立老板确认后才发布的价格审批规则 |
| 冲突处理 | 多库可能同 SKU 不同价/分类 | 建立 SKU/documentId 映射和冲突处理规则 |
| 缓存策略 | App JSON no-store，网站 JS 有版本参数 | 发布时自动更新版本号或生成文件时间戳 |

## 12. CEO 最终结论

### A. 当前实际架构

```text
名义主数据：
docs/master-data/products-master.csv

审计汇总：
data/products-master.xlsx

App：
Firestore products 优先
app/products.json fallback

网站：
data/products.generated.js
products.js 渲染

Firestore：
haode-app/products
```

### B. 真正主数据源

当前没有真正统一执行的单一主数据源。

名义主数据源是：

```text
docs/master-data/products-master.csv
```

但当前实际运行仍是：

```text
Firestore + app/products.json + data/products.generated.js 多源并存
```

### C. 两个产品为什么 App 有但 Firestore 没有

因为它们存在于 `app/products.json`，App 可以 fallback 到本地 JSON；但 Firestore `products/{documentId}` 返回 `404 NOT_FOUND`。

### D. 要实现目标链路还缺什么

最核心缺口是：

```text
products-master → Firestore 的受控发布机制
```

其次是：

```text
Firestore → App → 网站 的统一读取 / 生成机制
```

在这两个机制补齐前，HAODE 产品数据仍会继续出现“App 有、Firestore 没有、网站又是另一套数据”的分叉问题。
