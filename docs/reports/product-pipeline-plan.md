# HAODE Product Publish Pipeline Plan

日期：2026-06-05

目标：建立唯一产品发布链路。

本报告只做架构设计，不修改产品数据，不发布产品，不修改价格。

## 1. 当前架构

当前 HAODE 产品数据不是单一链路，而是多产品库并存。

```text
docs/master-data/products-master.csv
  ↓
Product Control Center 审计
  ↓
data/products-master.xlsx
docs/reports/product-health-report.md

Firestore products collection
  ↓
App 优先读取

app/products.json
  ↓
App fallback 读取

data/products.generated.js
  ↓
网站产品列表 / 产品页

products.js
  ↓
网站渲染逻辑
```

当前问题：

- `products-master.csv` 名义上是主数据，但还没有成为实际发布源。
- `app/products.json` 仍是 App fallback 产品库，可能与 Firestore 分叉。
- `data/products.generated.js` 是网站产品数据，当前可被手工改动。
- Firestore、App JSON、网站 generated JS、products-master 之间没有统一发布闸门。
- 现有 `product-control-center` 是审计工具，不是发布工具。
- 现有 `build-products` 是网站生成工具，不是 master 驱动的统一发布管线。

## 2. 新架构

目标最终链路：

```text
docs/master-data/products-master.csv
  ↓
npm run publish-products
  ↓
Firestore products collection
  ↓
App
  ↓
网站
```

实际落地建议：

```text
products-master.csv
  ↓
publish-products
  ├─ 生成 app/products.json
  ├─ 生成 data/products.generated.js
  ├─ 有权限：同步 Firestore
  └─ 无权限：生成待发布队列
       ↓
verify-products
  └─ 验证 master / Firestore / App / 网站一致
```

CEO 判断：

- `products-master.csv` 是唯一人工维护入口。
- Firestore 是线上发布状态。
- `app/products.json` 不再手工维护，只作为自动生成的 App fallback 快照。
- `data/products.generated.js` 不再手工维护，只作为自动生成的网站数据文件。

## 3. publish-products 设计

新增命令：

```bash
npm run publish-products
```

执行内容：

1. 读取 `docs/master-data/products-master.csv`
2. 校验必填字段：
   - `id`
   - `producto_nombre`
   - `categoria`
   - `modelo`
   - `precio_publico`
   - `precio_mayoreo`
   - `imagen_path`
   - `estado`
3. 只纳入 `estado=Activo` 且未标记 historical / ignored 的产品。
4. 生成 App fallback 文件：

```text
app/products.json
```

5. 生成网站数据文件：

```text
data/products.generated.js
```

6. 尝试同步 Firestore：

```text
project: haode-app
collection: products
document id: products-master.csv 的 id
```

7. 如果 Firestore 有写权限：

```text
create / update products/{id}
```

8. 如果 Firestore 无写权限：

```text
data/publish-queue/products-pending.json
docs/reports/product-publish-report.md
```

9. 不自动删除 Firestore 多余产品，只生成待删除候选清单。

### Firestore 无权限时的待发布队列

建议文件：

```text
data/publish-queue/products-pending.json
```

队列字段：

| 字段 | 说明 |
| --- | --- |
| `sku` | 产品 SKU |
| `docId` | 目标 Firestore document id |
| `operation` | `create` / `update` / `skip` / `delete-candidate` |
| `target` | 准备写入 Firestore 的完整字段 |
| `current` | 当前 Firestore 旧值；如果不存在则为空 |
| `diff` | 字段差异 |
| `reason` | 入队原因，例如 `permission_denied` |
| `generatedAt` | 队列生成时间 |

原则：

- 无权限不能假装发布成功。
- 无权限也不能静默失败。
- 必须生成老板/管理员可执行的待发布队列。

## 4. verify-products 设计

新增命令：

```bash
npm run verify-products
```

验证对象：

- `docs/master-data/products-master.csv`
- Firestore `products`
- `app/products.json`
- `data/products.generated.js`

验证内容：

| 检查项 | 规则 |
| --- | --- |
| SKU 存在性 | master、Firestore、App、网站必须一致 |
| 分类 | `categoria` / `category` 必须一致 |
| 型号 | `modelo` / `model` 必须一致 |
| 产品名称 | `producto_nombre` / `nombre` / `name` 必须一致 |
| 零售价 | `precio_publico` / `precioPublico` / 网站第一价格必须一致 |
| 批发价 | `precio_mayoreo` / `precioMayoreo` / 网站第二价格必须一致 |
| 图片 | 主图路径必须存在 |
| 视频 | 有视频路径则必须存在；无视频必须明确标记 |
| 状态 | `estado=Activo` 应对应 Firestore/App `activo=true` |
| 多余产品 | Firestore 有、master 没有的产品进入 delete candidate，不自动删除 |

输出状态：

| 状态 | 含义 |
| --- | --- |
| `PASS` | 四端一致，可以上线 |
| `QUEUED` | 本地产物已生成，但 Firestore 无权限，已生成待发布队列 |
| `BLOCKED` | 存在价格缺失、图片缺失、SKU 冲突、危险删除、字段无法映射 |

建议输出文件：

```text
docs/reports/product-verify-report.md
```

## 5. 需要修改文件

### 新增文件

| 文件 | 作用 |
| --- | --- |
| `scripts/product-transformers.js` | 统一字段映射：CSV → Firestore / App JSON / Website JS |
| `scripts/publish-products.js` | 执行发布：生成 App JSON、网站数据、同步 Firestore或生成队列 |
| `scripts/verify-products.js` | 验证 master / Firestore / App / 网站一致 |
| `data/publish-queue/products-pending.json` | 无 Firestore 权限时的待发布队列 |
| `docs/reports/product-publish-report.md` | 每次发布结果报告 |
| `docs/reports/product-verify-report.md` | 每次验证结果报告 |

### 修改文件

| 文件 | 修改目标 |
| --- | --- |
| `package.json` | 新增 `publish-products` 和 `verify-products` |
| `docs/master-data/README.md` | 明确 `products-master.csv` 是唯一人工维护入口 |
| `scripts/product-control-center.py` | 继续做健康审计，但把 App/网站文件视为生成产物 |
| `scripts/build-products.js` | 逐步降级为素材辅助工具，不再独立决定线上产品 |
| `app/admin.js` | 后台导入 `products.json` 降级为历史工具，未来改为处理待发布队列 |
| `app/app.js` | 保留 fallback，但注明 `app/products.json` 由 pipeline 生成 |
| `data/products.generated.js` | 不再手工维护，由 pipeline 生成 |
| `app/products.json` | 不再手工维护，由 pipeline 生成 |

## 6. 字段映射规则

### products-master.csv → Firestore

| CSV 字段 | Firestore 字段 |
| --- | --- |
| `id` | `id` |
| `categoria` | `categoria` |
| `producto_nombre` | `nombre` |
| `modelo` | `modelo` |
| `descripcion` | `descripcion` |
| `precio_publico` | `precioPublico` |
| `precio_mayoreo` | `precioMayoreo` |
| `imagen_path` | `imagen` |
| `estado` | `activo` |

### products-master.csv → app/products.json

| CSV 字段 | App JSON 字段 |
| --- | --- |
| `id` | `id` |
| `categoria` | `categoria` |
| `producto_nombre` | `nombre` |
| `modelo` | `modelo` |
| `descripcion` | `descripcion` |
| `precio_publico` | `precioPublico` |
| `precio_mayoreo` | `precioMayoreo` |
| `imagen_path` | `imagen` |
| `estado` | `activo` |

### products-master.csv → data/products.generated.js

| CSV 字段 | 网站字段 |
| --- | --- |
| `id` | `id` |
| `categoria` | `category` |
| `producto_nombre` | `name` |
| `modelo` | `model` |
| `imagen_path` | `images[0]` |
| `video_path` | `videos[0]` |
| `precio_publico` | `prices[0].price` |
| `precio_mayoreo` | `prices[1].price` |
| `descripcion` | `description` |

## 7. 风险

### 风险 1：价格被错误覆盖

风险最高。

规则：

- 价格缺失时禁止发布。
- 价格异常时禁止自动修复。
- 老板未确认的价格禁止写入 Firestore。

### 风险 2：误删 Firestore 产品

规则：

- Firestore 有、master 没有的产品不自动删除。
- 只进入 `delete-candidate` 队列。
- 删除必须老板或管理员确认。

### 风险 3：字段映射不一致

当前 App 和网站字段不同：

- App 使用 `nombre`、`precioPublico`、`precioMayoreo`、`imagen`
- 网站使用 `name`、`prices`、`images`、`videos`

规则：

- 必须集中到 `scripts/product-transformers.js`
- 禁止每个脚本各自写一套转换逻辑

### 风险 4：Firestore 权限不足

当前 Firestore 写入需要管理员权限。

规则：

- 无权限时生成待发布队列。
- 不能把本地生成成功当作 Firestore 发布成功。
- 发布报告必须明确 `PUBLISHED` 或 `QUEUED`。

### 风险 5：网站从 generated JS 读取，无法实时跟 Firestore

保守策略：

- 第一阶段网站继续读 `data/products.generated.js`
- 该文件由 pipeline 生成
- 等管线稳定后，再考虑网站直接读 Firestore 或静态构建时拉 Firestore

## 8. 实施步骤

### 第 1 阶段：冻结主数据原则

目标：

- `products-master.csv` 是唯一人工维护入口。
- 停止手工维护 `app/products.json`。
- 停止手工维护 `data/products.generated.js`。

输出：

- 更新 README / 维护规则。
- 标注 JSON 和 generated JS 为自动生成产物。

### 第 2 阶段：建立字段转换器

目标：

- 新增 `scripts/product-transformers.js`
- 统一 CSV → Firestore / App / Website 的字段映射。

输出：

- 一个标准产品对象。
- 三个目标平台对象。

### 第 3 阶段：建立 publish-products

目标：

- 新增 `scripts/publish-products.js`
- 新增 `npm run publish-products`

执行：

- 读取 `products-master.csv`
- 生成 `app/products.json`
- 生成 `data/products.generated.js`
- 有权限则同步 Firestore
- 无权限则生成 `data/publish-queue/products-pending.json`
- 生成 `docs/reports/product-publish-report.md`

### 第 4 阶段：建立 verify-products

目标：

- 新增 `scripts/verify-products.js`
- 新增 `npm run verify-products`

执行：

- 比对 products-master / Firestore / App / 网站
- 输出 `PASS` / `QUEUED` / `BLOCKED`
- 生成 `docs/reports/product-verify-report.md`

### 第 5 阶段：后台接入待发布队列

目标：

- `app/admin.js` 不再从 `products.json` 当作主入口导入。
- Admin 后台可以读取待发布队列。
- 管理员确认后执行 Firestore create/update。

### 第 6 阶段：上线流程固化

标准流程：

```bash
npm run publish-products
npm run verify-products
```

上线规则：

- `PASS` 才允许上线。
- `QUEUED` 表示本地文件生成完成，但 Firestore 还未同步，不能宣称三方一致。
- `BLOCKED` 必须先处理阻塞项。

## 9. 最终 CEO 结论

当前 HAODE 是：

```text
多产品库审计系统
```

目标应升级为：

```text
products-master.csv 驱动的产品发布系统
```

最关键的改变：

- `products-master.csv` 成为唯一主数据源。
- `app/products.json` 降级为自动生成的 App fallback 快照。
- `data/products.generated.js` 降级为自动生成的网站快照。
- Firestore 成为线上发布状态。
- `publish-products` 负责发布。
- `verify-products` 负责阻止分叉。

一句话：

```text
以后不再修三份产品库；只维护 products-master.csv，再由 Pipeline 统一发布和验证。
```
