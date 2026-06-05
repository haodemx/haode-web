# HAODE 每周自动巡检任务

## 巡检频率

每周执行 1 次，建议周一上午。

## 巡检范围

- 首页
- Productos
- Productos AI
- Micas
- Fundas
- `categoria/*`
- `producto/*`

## 检查项目

0. 执行产品控制系统：

```bash
npm run product-control
```

1. 缺图
2. 错图
3. 占位图
4. 图片 404
5. 视频 404
6. 视频超过 15MB
7. 缺少价格
8. 缺少批发价
9. 缺少 SEO title
10. 缺少 meta description
11. 错误域名
12. 本地路径
13. 旧词 `Películas`
14. Google Business 待更新内容

## 禁止事项

- 不确认图片时，不允许替换。
- 不允许乱改价格。
- 不允许删除已有产品。
- 不允许使用 `haodemexico.com`，除非老板明确恢复自定义域名。
- 不允许使用 `file://`、`Users/mac`、`localhost` 等本地路径作为客户可见链接。

## 输出报告

每周生成：

`docs/reports/weekly-audit-YYYY-MM-DD.md`

报告必须包含：

- `docs/reports/product-health-report.md` 中的异常摘要
- 本周发现的问题
- 已修复的问题
- 待老板确认的问题
- 是否需要补图片
- 是否需要补视频
- 是否建议推送
