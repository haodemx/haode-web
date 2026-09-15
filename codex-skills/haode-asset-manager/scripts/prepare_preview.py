#!/usr/bin/env python3
"""Prepare deterministic, local-only HAODE cutout candidates and V3 comparison preview."""

from __future__ import annotations

import argparse
import json
import shutil
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps


def connected_background_alpha(image: Image.Image, tolerance: float) -> tuple[Image.Image, dict]:
    rgba = np.asarray(image.convert("RGBA"), dtype=np.uint8).copy()
    rgb = rgba[:, :, :3].astype(np.int16)
    height, width = rgb.shape[:2]
    edge = np.concatenate((rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]))
    background = np.median(edge, axis=0)
    distance = np.sqrt(np.sum((rgb - background) ** 2, axis=2))
    candidate = distance <= tolerance
    visited = np.zeros((height, width), dtype=bool)
    queue: deque[tuple[int, int]] = deque()
    for x in range(width):
        if candidate[0, x]: queue.append((0, x))
        if candidate[height - 1, x]: queue.append((height - 1, x))
    for y in range(height):
        if candidate[y, 0]: queue.append((y, 0))
        if candidate[y, width - 1]: queue.append((y, width - 1))
    while queue:
        y, x = queue.popleft()
        if visited[y, x] or not candidate[y, x]:
            continue
        visited[y, x] = True
        if y: queue.append((y - 1, x))
        if y + 1 < height: queue.append((y + 1, x))
        if x: queue.append((y, x - 1))
        if x + 1 < width: queue.append((y, x + 1))
    alpha = np.where(visited, 0, 255).astype(np.uint8)
    # One-pixel deterministic feather only at the outside edge.
    alpha_image = Image.fromarray(alpha, "L").filter(ImageFilter.GaussianBlur(0.65))
    rgba[:, :, 3] = np.asarray(alpha_image)
    output = Image.fromarray(rgba, "RGBA")
    return output, {
        "background_rgb": [int(value) for value in background],
        "tolerance": tolerance,
        "removed_fraction": round(float(np.mean(visited)), 6),
        "method": "border-connected RGB-distance segmentation",
    }


def normalized_canvas(image: Image.Image, size: int = 1600, occupancy: float = 0.80) -> tuple[Image.Image, dict]:
    alpha = image.getchannel("A")
    bbox = alpha.getbbox()
    if not bbox:
        raise ValueError("empty alpha result")
    subject = image.crop(bbox)
    target = int(size * occupancy)
    scale = min(target / subject.width, target / subject.height)
    resized = subject.resize((max(1, round(subject.width * scale)), max(1, round(subject.height * scale))), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    x = (size - resized.width) // 2
    y = (size - resized.height) // 2
    canvas.alpha_composite(resized, (x, y))
    return canvas, {"source_bbox": list(bbox), "canvas": [size, size],
                    "subject_size": [resized.width, resized.height],
                    "occupancy_long_edge": round(max(resized.width, resized.height) / size, 4)}


def checker_preview(image: Image.Image, label: str) -> Image.Image:
    canvas = Image.new("RGB", (720, 780), "white")
    draw = ImageDraw.Draw(canvas)
    for y in range(0, 720, 24):
        for x in range(0, 720, 24):
            if (x // 24 + y // 24) % 2:
                draw.rectangle((x, y, x + 23, y + 23), fill="#d8dce2")
    display = image.copy()
    display.thumbnail((680, 680), Image.Resampling.LANCZOS)
    canvas.paste(display, ((720 - display.width) // 2, (720 - display.height) // 2), display)
    draw.rectangle((0, 720, 720, 780), fill="#111820")
    draw.text((18, 742), label, fill="white", font=ImageFont.load_default())
    return canvas


def save_candidate(source: Path, png: Path, webp: Path, tolerance: float | None, label: str) -> dict:
    with Image.open(source) as opened:
        base = opened.convert("RGBA")
    if tolerance is None:
        candidate = base
        segmentation = {"method": "existing true alpha retained", "removed_fraction": round(float(np.mean(np.asarray(base)[:, :, 3] < 255)), 6)}
    else:
        candidate, segmentation = connected_background_alpha(base, tolerance)
    normalized, layout = normalized_canvas(candidate)
    png.parent.mkdir(parents=True, exist_ok=True)
    normalized.save(png, optimize=True)
    normalized.save(webp, format="WEBP", lossless=True, method=6)
    checker_preview(normalized, label).save(png.with_name(png.stem + "-checker.jpg"), quality=90)
    return {"source": str(source), "cutout_master": str(png), "web_transparent": str(webp),
            "segmentation": segmentation, "layout": layout, "status": "MANUAL_REVIEW" if tolerance is not None else "CUTOUT_READY_EXISTING_ALPHA"}


def build_html(output: Path, records: dict) -> None:
    cards = [
        ("Pantallas", "before/pantallas-iphone-16.jpg", "cutouts/pantallas-iphone-16-web-v01.webp", records["pantallas"]["status"]),
        ("Productos AI", "before/productos-ai-lk030.jpeg", "cutouts/productos-ai-lk030-web-v01.webp", records["productos_ai"]["status"]),
        ("X200T", "before/x200t.jpg", "cutouts/x200t-web-v01.webp", records["x200t"]["status"]),
    ]
    card_html = "".join(f'''<article><header><span>{name}</span><b>{status}</b></header><div class="pair"><figure class="before"><img src="{before}"><figcaption>BEFORE · OPAQUE</figcaption></figure><figure class="after"><img src="{after}"><figcaption>AFTER · TRANSPARENT</figcaption></figure></div></article>''' for name, before, after, status in cards)
    html = f'''<!doctype html><html lang="zh"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>HAODE V3 Asset Preview</title><style>
*{{box-sizing:border-box}}body{{margin:0;color:#eff7fb;background:#071117;font-family:Inter,system-ui,sans-serif}}main{{max-width:1240px;margin:auto;padding:56px 28px 90px}}.eyebrow{{color:#ff6c2f;letter-spacing:.18em;font-weight:800}}h1{{font-size:clamp(38px,6vw,74px);margin:10px 0 12px;line-height:.95}}.lead{{color:#98aab5;max-width:760px}}article{{margin-top:38px;border:1px solid #23343d;background:linear-gradient(145deg,#0c1b23,#081219);padding:20px;border-radius:18px}}header{{display:flex;justify-content:space-between;gap:16px;align-items:center;margin-bottom:16px}}header span{{font-size:24px;font-weight:800}}header b{{font-size:11px;color:#ffb28f;letter-spacing:.08em}}.pair{{display:grid;grid-template-columns:1fr 1fr;gap:16px}}figure{{margin:0;min-height:360px;border-radius:12px;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden}}figure:before{{content:"";position:absolute;inset:0;background:radial-gradient(circle at 55% 42%,rgba(88,174,184,.23),transparent 32%),linear-gradient(135deg,#12252e,#091218 70%)}}figure img{{position:relative;max-width:86%;max-height:330px;object-fit:contain}}.before img{{background:white}}figcaption{{position:absolute;left:14px;bottom:12px;padding:6px 9px;background:#061016d9;border:1px solid #2d424d;border-radius:6px;font-size:11px;letter-spacing:.09em}}.requirements{{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:36px}}.requirements div{{padding:22px;border:1px dashed #52616a;color:#c8d3d8;border-radius:14px}}.requirements b{{display:block;color:#ff7140;margin-bottom:8px}}@media(max-width:700px){{main{{padding:34px 16px}}.pair,.requirements{{grid-template-columns:1fr}}figure{{min-height:300px}}figure img{{max-height:270px}}header{{align-items:flex-start;flex-direction:column}}}}
</style></head><body><main><div class="eyebrow">HAODE · LABORATORY EDITORIAL</div><h1>V3 ASSET<br>TRANSPARENCY TEST</h1><p class="lead">本地审阅页。透明产品直接融入页面背景；所有自动分割结果仍需全尺寸人工检查，不构成发布批准。</p>{card_html}<section class="requirements"><div><b>HIDROGEL</b>REAL ASSET REQUIRED · 当前无已批准透明真实产品主图。</div><div><b>BATERÍAS</b>REAL ASSET REQUIRED · V3 当前未发现产品资产目录。</div></section></main></body></html>'''
    (output / "index.html").write_text(html, encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()
    root, output = args.root.resolve(), args.output.resolve()
    (output / "before").mkdir(parents=True, exist_ok=True)
    shutil.copy2(root / "assets/products/iphone-incell/16/main.jpg", output / "before/pantallas-iphone-16.jpg")
    shutil.copy2(root / "assets/products/productos-ai/lk-030-mini-camara-retro-digital/main-red-hd.jpeg", output / "before/productos-ai-lk030.jpeg")
    shutil.copy2(root / "assets/products/cut-machine/x200t/main.jpg", output / "before/x200t.jpg")
    records = {
        "pantallas": save_candidate(root / "assets/products/iphone-incell/16/16   5.png", output / "cutouts/pantallas-iphone-16-cutout-v01.png", output / "cutouts/pantallas-iphone-16-web-v01.webp", None, "Pantallas · existing alpha"),
        "productos_ai": save_candidate(root / "assets/products/productos-ai/lk-030-mini-camara-retro-digital/main-red-hd.jpeg", output / "cutouts/productos-ai-lk030-cutout-v01.png", output / "cutouts/productos-ai-lk030-web-v01.webp", 38, "Productos AI · deterministic candidate · MANUAL REVIEW"),
        "x200t": save_candidate(root / "assets/products/cut-machine/x200t/main.jpg", output / "cutouts/x200t-cutout-v01.png", output / "cutouts/x200t-web-v01.webp", 58, "X200T · deterministic candidate · MANUAL REVIEW"),
    }
    build_html(output, records)
    (output / "conversion-results.json").write_text(json.dumps(records, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(records, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
