# HAODE 产品主数据中心

此目录是 HAODE AUTOPILOT V1 的产品主数据中心。

## 主文件

- `products-master.csv`

## 字段

- `producto_nombre`: 产品名称
- `categoria`: 产品分类
- `precio_publico`: 零售价
- `precio_mayoreo`: 批发价
- `imagen_path`: 图片路径
- `video_path`: 视频路径
- `estado`: Activo / Inactivo

## 读取原则

- 网站、APP、Firestore 同步流程以后应以此文件作为运营主数据基准。
- 当前 V1 不改变线上 APP 的 Firebase 优先读取逻辑，避免影响现有 GitHub Pages 和 Firestore。
- 价格、产品名称、品牌信息禁止自动修改，必须由老板确认。
