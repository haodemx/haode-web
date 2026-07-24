# HAODE 桌面素材补视频执行报告

日期：2026-07-24

## 结论

本轮扩大到整个 `/Users/mac/Desktop` 检索后，找到并补入 15 条可确认型号的视频。官网视频缺口从 48 降到 33。

## 本轮已补视频

| SKU | 来源 | 网站路径 |
| --- | --- | --- |
| `iphone-incell-16e` | `hl/墨西哥网站/HL苹果测试视频/16e.mp4` | `assets/products/iphone-incell/16e/video-01.mp4` |
| `iphone-incell-16plus` | `hl/墨西哥网站/HL苹果测试视频/16plus.mp4` | `assets/products/iphone-incell/16plus/video-01.mp4` |
| `iphone-incell-16pro` | `hl/墨西哥网站/HL苹果测试视频/16pro.mp4` | `assets/products/iphone-incell/16pro/video-01.mp4` |
| `iphone-incell-17promax` | `hl/17PM.mp4` | `assets/products/iphone-incell/17promax/video-01.mp4` |
| `samsung-incell-note-20-ultra` | `hl/墨西哥网站/三星视频/NOTE  20  ULTRA.mp4` | `assets/products/samsung-incell/note-20-ultra/video-01.mp4` |
| `samsung-incell-note-8` | `hl/墨西哥网站/三星视频/NOTE 8.mp4` | `assets/products/samsung-incell/note-8/video-01.mp4` |
| `samsung-incell-note-9` | `hl/墨西哥网站/三星视频/NOTE 9.mp4` | `assets/products/samsung-incell/note-9/video-01.mp4` |
| `samsung-incell-s20-ultra` | `hl/墨西哥网站/三星视频/s20u.mp4` | `assets/products/samsung-incell/s20-ultra/video-01.mp4` |
| `samsung-incell-s21` | `hl/墨西哥网站/三星视频/S21.mp4` | `assets/products/samsung-incell/s21/video-01.mp4` |
| `samsung-incell-s21-plus` | `hl/墨西哥网站/三星视频/s21+.mp4` | `assets/products/samsung-incell/s21-plus/video-01.mp4` |
| `samsung-incell-s22` | `hl/墨西哥网站/三星视频/s22.mp4` | `assets/products/samsung-incell/s22/video-01.mp4` |
| `samsung-incell-s22-plus` | `hl/墨西哥网站/三星视频/s22+.mp4` | `assets/products/samsung-incell/s22-plus/video-01.mp4` |
| `samsung-incell-s23` | `hl/墨西哥网站/三星视频/S23.mp4` | `assets/products/samsung-incell/s23/video-01.mp4` |
| `samsung-incell-s24` | `hl/墨西哥网站/三星视频/s24.mp4` | `assets/products/samsung-incell/s24/video-01.mp4` |
| `samsung-incell-s8` | `hl/墨西哥网站/三星视频/s8.mp4` | `assets/products/samsung-incell/s8/video-01.mp4` |

## 验证

- 新增 15 条视频全部可被 `ffprobe` 读取。
- 转码后合计约 23.5MB。
- 官网 `daily-website-audit`：图片缺失 0，SEO 问题 0，视频缺口 33。
- 产品数据差异审计：只变更 15 个 `videos` 字段，产品名称、价格、分类、描述均未改变。

## 仍不能直接补的原因

- Samsung OLED 缺的是 OLED 视频，不能用 Samsung INCELL 视频代替。
- iPhone 17 / 17 Air / 17 Pro 没有找到精确视频，不能用 17 Pro Max 代替。
- Samsung S21 FE / S21 Ultra / S23 Plus / S24 Plus / S24 Ultra 没有找到精确视频。
- Micas 和 AI 产品缺少对应产品视频，不能用其他 AI 型号或泛广告视频代替。

