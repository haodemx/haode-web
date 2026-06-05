# HAODE 视频优化报告

生成日期：2026-06-04

## 目标

将首页、分类页、产品页中超过 15MB 的 MP4 视频压缩为更适合 GitHub Pages 的 H264 MP4，保持原引用路径。

## 处理结果

- 压缩视频数量：25 个
- 首页视频：1 个
- iPhone OLED 产品视频：24 个
- 压缩前超过 15MB 的 MP4：25 个
- 压缩后超过 15MB 的 MP4：0 个

## 重点优化

| 文件 | 原体积 | 新体积 |
| --- | ---: | ---: |
| `assets/videos/showcase/showcase-02.mp4` | 约 39MB | 约 1.1MB |
| `assets/products/iphone-oled/13promax/video-01.mp4` | 约 88MB | 约 2.8MB |
| `assets/products/iphone-oled/16/video-01.mp4` | 约 75MB | 约 1.8MB |
| `assets/products/iphone-oled/16plus/video-01.mp4` | 约 63MB | 约 1.3MB |
| `assets/products/iphone-oled/14/video-01.mp4` | 约 59MB | 约 2.1MB |

## 备份

原视频已备份到：

`_backup/original-videos-20260604/`

该目录已在 `.gitignore` 中，不会进入 GitHub Pages artifact。

## 当前体积

- `assets` 当前约 1.0GB。
- 仍偏大，主要原因是部分图片文件体积较大，不是本次视频优化范围。

## 建议下一步

1. 下一轮单独压缩大于 8MB 的 PNG/JPG。
2. 优先处理 iPhone INCELL 16/17 系列大图。
3. 保留每个产品 1 张主图 + 3 到 5 张图库图，避免 GitHub Pages 体积反弹。

