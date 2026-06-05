# HAODE Product Control Center 修复报告 Round 2

日期：2026-06-05

## 目标

清理 Product Control Center 的监控口径，让“缺产品数量”只保留真正需要处理的产品。

本轮严格遵守：

- 不上传产品
- 不创建产品
- 不删除产品
- 不修改价格
- 不修改网站显示
- 不改网站结构
- 只调整 Product Control Center 的监控逻辑

## 执行内容

已将 51 个历史遗留 / 价格表派生 SKU 标记为：

- `historical=true`
- `ignored_by_product_control=true`

标记位置：

- `data/products-master.xlsx` 的 `ignored-by-product-control` 工作表
- `products-master` 主表的状态列显示：`ignored_by_product_control=true / historical=true`

识别规则：

- SKU 以 `pantallas-iphone-` 开头
- 分类为 `Pantallas iPhone INCELL` 或 `Pantallas iPhone OLED`
- Firestore / 网站 / App 三端都没有上线
- 属于 6 月价格表派生 SKU

这些产品保留在主库中，但不再计入：

- 缺产品数量
- 图片缺失数量
- 视频缺失数量
- 价格异常数量
- 图片完整率
- 视频完整率

## 重新运行结果

已重新运行：

```bash
npm run product-control-center
npm run product-validate
```

最新统计：

| 指标 | Round 1 | Round 2 |
| --- | ---: | ---: |
| 主库总数 | 161 | 161 |
| 监控产品总数 | 161 | 110 |
| 已忽略历史产品 | 0 | 51 |
| 真正缺产品数量 | 75 | 24 |
| 重复产品数量 | 0 | 0 |
| 价格异常数量 | 7 | 7 |
| 图片完整率 | 68.3% | 100.0% |
| 视频完整率 | 37.9% | 55.5% |

## 剩余真正缺产品

当前剩余 24 个缺产品，全部保留在监控口径中。

它们包括：

- 3 个低风险应补平台产品
- 7 个缺网站且受视频策略影响的产品
- 14 个需要先核价的产品

## 验证结果

`npm run product-control-center`：通过。

`npm run product-validate`：仍失败。

失败原因：

- 剩余 24 个真实缺平台产品仍未处理。
- 7 个价格异常仍未老板确认，不能自动改价。
- 视频完整率仍为 55.5%，说明视频素材仍需后续策略处理。

## 本轮修改文件

- `scripts/product-control-center.py`
- `data/products-master.xlsx`
- `docs/reports/product-health-report.md`
- `docs/reports/product-control-fix-round-2.md`

## 结论

Round 2 已完成监控口径清理。

现在 Product Health 的缺产品统计不再被 51 个历史遗留 SKU 污染，后续可以聚焦真正需要处理的 24 个产品。

下一轮建议：

1. 先补 3 个低风险平台缺口。
2. 再决定 7 个缺视频产品是否允许无视频上线。
3. 14 个价格/库存不确定产品先核价，不直接上传。
