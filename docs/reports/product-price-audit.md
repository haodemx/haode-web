# HAODE 产品价格审计报告

生成日期：2026-06-05

## 删除/停用的错误产品

- `iphone-oled-11pro`
- 网站详情页 `producto/iphone-oled-11pro/index.html` 已改为跳转到正确的 `iphone-incell-11pro`
- App 数据源已删除错误 OLED 记录
- 网站生成数据已删除错误 OLED 记录
- 主数据 CSV 已删除错误 OLED 记录
- 站点地图已删除错误 OLED URL

## 保留的正确产品

- `iphone-incell-11pro`
- `iphone-incell-11promax`
- `iphone-oled-11promax`

## 发现的其他异常产品

- 当前 `product-control` 仍保留 21 个价格不一致项，已写入 [product-health-report.md](/Users/mac/Documents/haode/docs/reports/product-health-report.md)
- 当前仍有 40 个视频缺失项，需要后续逐一补素材
- 当前仍有 14 个 App 漏发项，属于同步覆盖问题，不在本次改价范围

## 需要老板确认的产品

- `iphone-oled-13promax`，App 与网站价格不一致
- `iphone-incell-12promax`，App 与网站价格不一致
- `iphone-incell-14`，App 与网站价格不一致
- `iphone-incell-14plus`，App 与网站价格不一致
- `iphone-incell-15plus`，App 与网站价格不一致
- `samsung-incell-s20-plus`，App 与网站价格不一致
- `samsung-incell-s9-plus`，App 与网站价格不一致
- `iphone-oled-12mini`、`iphone-oled-13mini`、`iphone-oled-15plus`、`iphone-oled-16`、`iphone-oled-16plus`，目前在 App 中缺失
- `samsung-oled-note-9`、`samsung-oled-s20`、`samsung-oled-s20-ultra`、`samsung-oled-s21`、`samsung-oled-s21-plus`、`samsung-oled-s22-plus`、`samsung-oled-s23-plus`、`samsung-oled-s24-plus`、`samsung-oled-s9-plus`，目前在 App 中缺失

## Firestore 修改结果

- 已更新 `app/admin.js` 的同步逻辑，后续按 `products.json` 同步时会清理本地不存在的旧 Firestore 记录
- 当前 shell 环境没有可用的 Firestore 管理登录态，未能直接在此会话里向线上 Firestore 发起实时删除
- 错误产品的本地源已清理，后续只要用管理员账号执行一次同步，就会把 `iphone-oled-11pro` 从 Firestore 删除

## 网站/App 修改结果

- `app/products.json` 已删除错误 `iphone-oled-11pro`
- `data/products.generated.js` 已删除错误 `iphone-oled-11pro`
- `docs/master-data/products-master.csv` 已删除错误 `iphone-oled-11pro`
- `sitemap.xml` 已删除错误 URL
- 旧产品页已改成重定向，不再展示错误 OLED 内容

## 后续校验规则

1. 产品不存在于价格表，直接写入审计报告并停用
2. 分类错误，直接写入审计报告并停用
3. 价格不一致，禁止自动改价，只记录
4. 图片/视频缺失，禁止用其他型号替换，只记录
5. 重复产品，保留正确记录并删除重复项

