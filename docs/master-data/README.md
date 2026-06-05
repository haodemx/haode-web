# HAODE Product Control System

此目录是 HAODE 的唯一产品主数据中心，用于防止网站和 APP 出现错图、缺图、缺视频、价格错误、产品漏发和分类错误。

## 主文件

- `products-master.csv`

## 字段

- `id`: 产品唯一编号
- `producto_nombre`: 产品名称
- `categoria`: 产品分类
- `modelo`: 产品型号
- `descripcion`: 产品描述
- `precio_publico`: 零售价
- `precio_mayoreo`: 批发价
- `imagen_path`: 图片路径
- `video_path`: 视频路径
- `website_present`: 网站是否存在
- `app_present`: APP 是否存在
- `image_exists`: 图片文件是否存在
- `video_exists`: 视频文件是否存在
- `price_status`: 价格是否一致
- `category_status`: 分类是否一致
- `product_status`: 产品健康状态
- `estado`: Activo / Inactivo

## 读取原则

- 网站、APP、Firestore 同步流程以后应以此文件作为运营主数据基准。
- 当前 V1 不改变线上 APP 的 Firebase 优先读取逻辑，避免影响现有 GitHub Pages 和 Firestore。
- 价格、产品名称、品牌信息禁止自动修改，必须由老板确认。

## 自动比对命令

每次修改网站或 APP 后执行：

```bash
npm run product-control
```

该命令会自动更新：

- `docs/master-data/products-master.csv`
- `docs/reports/product-health-report.md`

## 自动修复边界

允许自动修复：

- 图片路径
- 视频路径
- 分类字段

禁止自动修复：

- 价格
- 产品名称
- 未确认图片
- 删除产品
