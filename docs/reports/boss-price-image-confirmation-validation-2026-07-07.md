# HAODE 老板价格与图片确认 CSV 校验报告

日期：2026-07-07
分支：`fix/public-product-sync-safe-20260707`
校验文件：`docs/reports/boss-price-image-confirmation-2026-07-07.csv`

## 1. 总结

| 指标 | 数量 |
| --- | ---: |
| CSV 总行数 | 87 |
| 已确认行数 | 0 |
| 未确认行数 | 87 |
| 可进入下一轮修复的行数 | 0 |
| 仍需老板补充的行数 | 87 |
| 冲突或风险项数量 | 7 |

## 2. 按 type 分类统计

| type | 行数 |
| --- | --- |
| missing_price | 14 |
| abnormal_price | 7 |
| image_needed | 4 |
| listing_sync_pending | 20 |
| app_web_mismatch_pending | 42 |

## 3. 老板填写字段统计

| 字段 | 已填写行数 |
| --- | --- |
| boss_public_price | 0 |
| boss_wholesale_price | 0 |
| boss_box_price | 0 |
| boss_decision | 0 |
| note | 87 |

说明：当前 CSV 的 `note` 字段均为上一轮生成的提醒文本，不能视为老板确认；本轮以 `boss_decision` 和老板价格字段作为确认依据。

## 4. 可进入下一轮修复的产品表

当前没有可进入下一轮修复的行。

## 5. 仍需老板补充的产品表

| slug | type | 缺少什么 | 建议老板怎么填 |
| --- | --- | --- | --- |
| iphone-oled-12mini | missing_price | 缺少 boss_decision | 填写 approve_price / change_to_boss_price / do_not_publish，并填写公开价、批发价、箱价或备注 |
| iphone-oled-13mini | missing_price | 缺少 boss_decision | 填写 approve_price / change_to_boss_price / do_not_publish，并填写公开价、批发价、箱价或备注 |
| iphone-oled-15plus | missing_price | 缺少 boss_decision | 填写 approve_price / change_to_boss_price / do_not_publish，并填写公开价、批发价、箱价或备注 |
| iphone-oled-16 | missing_price | 缺少 boss_decision | 填写 approve_price / change_to_boss_price / do_not_publish，并填写公开价、批发价、箱价或备注 |
| iphone-oled-16plus | missing_price | 缺少 boss_decision | 填写 approve_price / change_to_boss_price / do_not_publish，并填写公开价、批发价、箱价或备注 |
| samsung-oled-note-9 | missing_price | 缺少 boss_decision | 填写 approve_price / change_to_boss_price / do_not_publish，并填写公开价、批发价、箱价或备注 |
| samsung-oled-s20 | missing_price | 缺少 boss_decision | 填写 approve_price / change_to_boss_price / do_not_publish，并填写公开价、批发价、箱价或备注 |
| samsung-oled-s20-ultra | missing_price | 缺少 boss_decision | 填写 approve_price / change_to_boss_price / do_not_publish，并填写公开价、批发价、箱价或备注 |
| samsung-oled-s21 | missing_price | 缺少 boss_decision | 填写 approve_price / change_to_boss_price / do_not_publish，并填写公开价、批发价、箱价或备注 |
| samsung-oled-s21-plus | missing_price | 缺少 boss_decision | 填写 approve_price / change_to_boss_price / do_not_publish，并填写公开价、批发价、箱价或备注 |
| samsung-oled-s22-plus | missing_price | 缺少 boss_decision | 填写 approve_price / change_to_boss_price / do_not_publish，并填写公开价、批发价、箱价或备注 |
| samsung-oled-s23-plus | missing_price | 缺少 boss_decision | 填写 approve_price / change_to_boss_price / do_not_publish，并填写公开价、批发价、箱价或备注 |
| samsung-oled-s24-plus | missing_price | 缺少 boss_decision | 填写 approve_price / change_to_boss_price / do_not_publish，并填写公开价、批发价、箱价或备注 |
| samsung-oled-s9-plus | missing_price | 缺少 boss_decision | 填写 approve_price / change_to_boss_price / do_not_publish，并填写公开价、批发价、箱价或备注 |
| iphone-incell-12promax | abnormal_price | 缺少 boss_decision | 填写 keep_current / change_to_boss_price / hide_or_consultar / do_not_publish |
| iphone-incell-14 | abnormal_price | 缺少 boss_decision | 填写 keep_current / change_to_boss_price / hide_or_consultar / do_not_publish |
| iphone-incell-14plus | abnormal_price | 缺少 boss_decision | 填写 keep_current / change_to_boss_price / hide_or_consultar / do_not_publish |
| iphone-incell-15plus | abnormal_price | 缺少 boss_decision | 填写 keep_current / change_to_boss_price / hide_or_consultar / do_not_publish |
| iphone-oled-13promax | abnormal_price | 缺少 boss_decision | 填写 keep_current / change_to_boss_price / hide_or_consultar / do_not_publish |
| samsung-incell-s20-plus | abnormal_price | 缺少 boss_decision | 填写 keep_current / change_to_boss_price / hide_or_consultar / do_not_publish |
| samsung-incell-s9-plus | abnormal_price | 缺少 boss_decision | 填写 keep_current / change_to_boss_price / hide_or_consultar / do_not_publish |
| samsung-incell-note-10-lite | image_needed | 缺少 boss_decision | 填写真实图片来源，或填写 do_not_publish / hold 并说明暂不上架 |
| samsung-incell-note-20 | image_needed | 缺少 boss_decision | 填写真实图片来源，或填写 do_not_publish / hold 并说明暂不上架 |
| samsung-incell-s10-lite | image_needed | 缺少 boss_decision | 填写真实图片来源，或填写 do_not_publish / hold 并说明暂不上架 |
| samsung-original-note-20-ultra | image_needed | 缺少 boss_decision | 填写真实图片来源，或填写 do_not_publish / hold 并说明暂不上架 |
| samsung-incell-note-10-lite | listing_sync_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| samsung-incell-note-20 | listing_sync_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| samsung-incell-s10-lite | listing_sync_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| samsung-original-note-20-ultra | listing_sync_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| samsung-original-s21-ultra | listing_sync_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| samsung-original-s22-plus | listing_sync_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| samsung-original-s22-ultra | listing_sync_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| samsung-original-s23-plus | listing_sync_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| samsung-original-s23-ultra | listing_sync_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| samsung-original-s24-ultra | listing_sync_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| samsung-original-s25-ultra | listing_sync_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| samsung-original-z-flip3 | listing_sync_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| samsung-original-z-flip4 | listing_sync_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| samsung-original-z-flip5 | listing_sync_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| samsung-original-z-flip6 | listing_sync_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| samsung-original-z-flip7 | listing_sync_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| samsung-original-z-fold3 | listing_sync_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| samsung-original-z-fold4 | listing_sync_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| samsung-original-z-fold5 | listing_sync_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| samsung-original-z-fold6 | listing_sync_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| funda-premium-aluminio-plus | app_web_mismatch_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| iphone-incell-12promax | app_web_mismatch_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| iphone-incell-14 | app_web_mismatch_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| iphone-incell-14plus | app_web_mismatch_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| iphone-incell-15plus | app_web_mismatch_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| iphone-oled-13promax | app_web_mismatch_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| samsung-incell-s20-plus | app_web_mismatch_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| samsung-incell-s9-plus | app_web_mismatch_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| iphone-oled-12mini | app_web_mismatch_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| iphone-oled-13mini | app_web_mismatch_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| iphone-oled-15plus | app_web_mismatch_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| iphone-oled-16 | app_web_mismatch_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| iphone-oled-16plus | app_web_mismatch_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| samsung-oled-note-9 | app_web_mismatch_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| samsung-oled-s20 | app_web_mismatch_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| samsung-oled-s20-ultra | app_web_mismatch_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| samsung-oled-s21 | app_web_mismatch_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| samsung-oled-s21-plus | app_web_mismatch_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| samsung-oled-s22-plus | app_web_mismatch_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| samsung-oled-s23-plus | app_web_mismatch_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| samsung-oled-s24-plus | app_web_mismatch_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| samsung-oled-s9-plus | app_web_mismatch_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| samsung-incell-note-10-lite | app_web_mismatch_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| samsung-incell-note-20 | app_web_mismatch_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| samsung-incell-s10-lite | app_web_mismatch_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| samsung-original-note-20-ultra | app_web_mismatch_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| samsung-original-s21-ultra | app_web_mismatch_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| samsung-original-s22-plus | app_web_mismatch_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| samsung-original-s22-ultra | app_web_mismatch_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| samsung-original-s23-plus | app_web_mismatch_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| samsung-original-s23-ultra | app_web_mismatch_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| samsung-original-s24-ultra | app_web_mismatch_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| samsung-original-s25-ultra | app_web_mismatch_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| samsung-original-z-flip3 | app_web_mismatch_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| samsung-original-z-flip4 | app_web_mismatch_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| samsung-original-z-flip5 | app_web_mismatch_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| samsung-original-z-flip6 | app_web_mismatch_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| samsung-original-z-flip7 | app_web_mismatch_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| samsung-original-z-fold3 | app_web_mismatch_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| samsung-original-z-fold4 | app_web_mismatch_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| samsung-original-z-fold5 | app_web_mismatch_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |
| samsung-original-z-fold6 | app_web_mismatch_pending | 缺少 boss_decision | 填写是否进入下一轮修复、暂缓或不发布 |

## 6. 冲突或风险项

| slug | type | 风险类型 | 当前决策 | 说明 |
| --- | --- | --- | --- | --- |
| iphone-incell-12promax | abnormal_price | 价格异常/疑似促销价需确认 | 未填写 | 官网/App/Master 差异 -30，-12.0% |
| iphone-incell-14 | abnormal_price | 价格异常/疑似促销价需确认 | 未填写 | 官网/App/Master 差异 540，207.7% |
| iphone-incell-14plus | abnormal_price | 价格异常/疑似促销价需确认 | 未填写 | 官网/App/Master 差异 500，166.7% |
| iphone-incell-15plus | abnormal_price | 价格异常/疑似促销价需确认 | 未填写 | 官网/App/Master 差异 -30，-9.1% |
| iphone-oled-13promax | abnormal_price | 价格异常/疑似促销价需确认 | 未填写 | 官网/App/Master 差异 -300，-33.3% |
| samsung-incell-s20-plus | abnormal_price | 价格异常/疑似促销价需确认 | 未填写 | 官网/App/Master 差异 -50，-9.1% |
| samsung-incell-s9-plus | abnormal_price | 价格异常/疑似促销价需确认 | 未填写 | 官网/App/Master 差异 -50，-10.0% |

## 7. 重点校验结论

- 14 个 `missing_price`：当前全部缺少 `boss_decision`，不能运行 `publish-products`。
- 7 个 `abnormal_price`：当前全部未明确写 `keep_current` / `change_to_boss_price` / `hide_or_consultar` / `do_not_publish`，不能改价。
- 4 个 `image_needed`：当前全部未填写真实图片来源或处理决定，不能替换图片或上架。
- 当前没有发现已填写价格字段中的 0、NaN、undefined 或文字无数字问题，因为老板价格字段均为空。
- 当前没有发现同一 slug 的已填写决策冲突，因为所有 `boss_decision` 均为空。
- 7 个异常价 SKU 仍保留促销价风险提醒，必须老板确认后再处理。

## 8. 本轮明确没有执行

- 本轮没有改价格。
- 本轮没有上架产品。
- 本轮没有替换图片。
- 本轮没有运行 `publish-products`。
- 本轮没有部署线上。
- 本轮没有进入 ERP。
- 本轮没有改数据库。
- 本轮没有接 Facebook/TikTok API。
