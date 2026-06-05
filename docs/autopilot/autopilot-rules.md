# HAODE AUTOPILOT V1 规则

## 目标

让老板不再负责网站与 APP 的日常细节管理，由系统自动维护：
- 网站
- App
- 产品数据
- 图片
- 视频
- SEO

## 产品主数据中心

- 主数据文件：`docs/master-data/products-master.csv`
- 当前生成来源：`app/products.json`
- 以后网站、APP、Firestore 同步流程应优先以主数据中心为基准。
- V1 不直接改变线上运行读取顺序，避免破坏 Firebase、Firestore、APP 和 GitHub Pages。

## 允许自动修复

- 图片路径错误
- 视频路径错误
- SEO 缺失
- 分类缺失
- sitemap 失效链接

## 禁止自动修改

- 价格
- 产品名称
- 品牌信息
- 删除产品
- 删除数据

## 必须报告老板确认

- 价格表与系统价格不一致
- 产品名称需要统一
- 产品重复但无法确认保留哪一个
- 找不到真实产品图片或视频素材
