# HAODE 员工网站/App同步流程

## 目标

员工在 ERP 里提交网站/App维护内容、引流记录和同步包。网站仓库只接收通过安全校验的同步包，自动生成维护队列、引流记录和报告。

## 员工流程

1. 在 ERP 的“网站/App维护中心”新增内容草稿或引流记录。
2. 老板或经理审核草稿。
3. 状态改成 `ready_to_sync` 后，生成网站/App同步包。
4. 下载同步包 JSON。
5. 在网站仓库执行：

```bash
npm run maintenance:erp-sync -- --file=/path/to/sync-package.json --apply
```

6. 检查生成的报告：`docs/reports/erp-maintenance-sync-report.md`。
7. 验证通过后提交、推送，让 GitHub Pages 发布。

## 自动化能做什么

- 接收 ERP 同步包。
- 检查安全边界。
- 写入 `data/maintenance/erp-maintenance-sync.json`。
- 写入 `data/marketing/erp-maintenance-tracking.json`。
- 生成中文同步报告。
- 统计询盘、报价、订单和销售额记录。

## 不能自动做什么

- 不能自动改价格。
- 不能自动改库存。
- 不能自动改 SKU。
- 不能自动删除产品。
- 不能自动替换未确认产品图片。
- 不能自动修改 WhatsApp 号码。

这些字段必须老板确认后再走单独的产品同步流程。
