# HAODE Marketing Admin 安全 MVP 方案

日期：2026-07-07

范围：`/admin/marketing-drafts/` 广告草稿确认页。

## 当前静态页面为什么不能直接公开部署

当前页面只是静态内部演示页，不能作为公开生产后台使用：

- 没有登录鉴权，任何知道 URL 的人都可能打开。
- 没有 Boss/Admin 角色权限，无法限制谁可以确认或驳回。
- 当前 `approve/reject` 只写入浏览器本地状态，不是可信审批记录。
- 没有服务端保存审批状态，也没有防篡改操作日志。
- 如果公开部署，容易让团队误以为“确认”已经具备真实后台审批能力。
- 页面虽然不接 Facebook/TikTok API，也不自动发帖，但公开暴露内部广告草稿仍有业务风险。

## 推荐方案

### 最安全：放进 HAODE ERP 老板后台

把广告草稿审批功能放入 HAODE ERP 老板后台，复用现有登录、角色权限和后台安全边界。

建议权限：

- `Boss`：可查看、确认、驳回、查看操作日志。
- `Admin`：可查看、确认、驳回、查看操作日志。
- 普通员工：最多只读，或完全不可见。

优点：

- 不需要在官网静态页里重新造鉴权。
- 可以复用现有用户、会话、角色和审计日志。
- 审批记录可以进入 ERP 数据库，便于追责和复盘。

### 次选：受保护 API + Boss/Admin 权限

如果短期不放进 ERP，也必须使用受保护 API：

- `/api/marketing-drafts/latest`：读取每日广告草稿。
- `/api/marketing-drafts/:id/approve`：Boss/Admin 确认。
- `/api/marketing-drafts/:id/reject`：Boss/Admin 驳回。
- `/api/marketing-drafts/:id/logs`：读取操作日志。

API 必须验证登录会话和角色权限。前端只负责展示，不能自己决定审批是否有效。

### 不推荐方案

不要使用这些方式当作安全方案：

- 纯前端密码框。
- 隐藏 URL。
- 把审批状态存在 `localStorage`。
- 把 token、密码、API key 写在前端代码或静态 JSON。
- 用静态页面直接模拟真实后台权限。

这些方式只能用于本地演示，不能用于老板审批或生产流程。

## 下一阶段功能设计

### 1. 读取每日广告 draft

数据来源可以继续使用每日广告草稿文件或由后端聚合：

- 标题
- 产品 SKU
- 产品名称
- 官网 banner 文案
- App banner 文案
- Facebook 文案
- TikTok 文案
- WhatsApp 文案
- 素材路径或下载链接
- 生成时间和来源

### 2. Boss/Admin 登录后确认或驳回

审批动作必须走后端：

- `approve`：确认可进入人工发布队列。
- `reject`：驳回并填写原因。
- `needs_edit`：需要修改文案或素材。

### 3. 保存审批状态

建议状态：

- `draft`
- `pending_review`
- `approved`
- `rejected`
- `needs_edit`
- `manually_published`

注意：`approved` 不代表已经自动发布，只代表老板允许使用。

### 4. 保存操作日志

每次操作必须记录：

- 谁操作：用户 ID、姓名、角色。
- 什么时候：服务端时间。
- 操作了哪条广告：draft ID、日期、SKU。
- 做了什么：确认、驳回、修改状态、复制素材。
- 备注：驳回原因或修改要求。

### 5. 仍然不自动发帖

下一阶段仍然不要自动发 Facebook/TikTok：

- 只提供复制文案。
- 只提供下载素材。
- 只记录人工发布状态。
- 不连接 Meta Graph API。
- 不连接 TikTok Content Posting API。
- 不保存社媒 token。

## 建议实施顺序

1. 在 HAODE ERP 老板后台新增 Marketing Drafts 页面。
2. 建立后端读取每日广告 draft 的接口。
3. 加 Boss/Admin 权限判断。
4. 加审批状态表和操作日志表。
5. 前端展示草稿、复制文案、下载素材。
6. 老板确认后人工发布，不自动发帖。
