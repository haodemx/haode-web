#!/usr/bin/env python3
"""Read-only HAODE V3 asset audit and contact-sheet generator."""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import math
import re
from collections import defaultdict
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageOps


IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif"}
TEXT_EXTENSIONS = {".html", ".css", ".js", ".mjs", ".json", ".xml"}
LOW_RES_LONG_EDGE = 1000
LOW_RES_SHORT_EDGE = 600
ASSET_REFERENCE = re.compile(r"/?assets/[A-Za-z0-9_./+()@%\-]+\.(?:png|jpe?g|webp|gif|avif|svg)", re.I)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def category_for(relative: str) -> str:
    value = relative.lower()
    if "funda" in value:
        return "05-FUNDAS"
    if "x200t" in value or "cut-machine" in value:
        return "06-X200T"
    if "productos-ai" in value or "ai-" in value:
        return "04-PRODUCTOS-AI"
    if "bater" in value:
        return "03-BATERIAS"
    if any(token in value for token in ("micas", "hidrogel")):
        return "02-HIDROGEL"
    if any(token in value for token in ("iphone-", "samsung-", "oled", "incell", "pantalla")):
        return "01-PANTALLAS"
    if any(token in value for token in ("factory", "warehouse", "fabrica")):
        return "08-FACTORY"
    if any(token in value for token in ("store", "tienda", "storefront")):
        return "07-TIENDA"
    if "logo" in value or "/icons/" in value:
        return "00-BRAND"
    return "99-ARCHIVE"


def type_suggestion(relative: str) -> str:
    value = relative.lower()
    if category_for(relative) in {"07-TIENDA", "08-FACTORY"}:
        return "TYPE_B_REAL_SCENE"
    if "/products/" in f"/{value}" and not any(token in value for token in ("scene", "working", "installation")):
        return "TYPE_A_PRODUCT_CUTOUT"
    return "REVIEW"


def state_suggestion(relative: str) -> str:
    name = Path(relative).name.lower()
    if "display" in name or "thumb" in name or "card" in name:
        return "WEB"
    if "scene" in name or "gallery" in name:
        return "SCENE_OR_GALLERY_REVIEW"
    return "CURRENT_WEBSITE_ASSET"


def suggested_name(relative: str, category: str, asset_type: str, suffix: str) -> str:
    stem = Path(relative).stem.lower()
    stem = re.sub(r"[^a-z0-9]+", "-", stem).strip("-") or "asset"
    parent = Path(relative).parent.name.lower()
    parent = re.sub(r"[^a-z0-9]+", "-", parent).strip("-") or "unknown"
    category_slug = category.split("-", 1)[-1].lower()
    state = "scene" if asset_type == "TYPE_B_REAL_SCENE" else "cutout"
    return f"haode-{category_slug}-{parent}-{stem}-{state}-v01{suffix.lower()}"


def ahash(image: Image.Image) -> int:
    sample = ImageOps.grayscale(image).resize((8, 8), Image.Resampling.LANCZOS)
    values = np.asarray(sample, dtype=np.float32)
    bits = values >= values.mean()
    result = 0
    for bit in bits.flatten():
        result = (result << 1) | int(bit)
    return result


def dhash(image: Image.Image) -> int:
    sample = ImageOps.grayscale(image).resize((9, 8), Image.Resampling.LANCZOS)
    values = np.asarray(sample, dtype=np.int16)
    bits = values[:, 1:] >= values[:, :-1]
    result = 0
    for bit in bits.flatten():
        result = (result << 1) | int(bit)
    return result


def hamming(a: int, b: int) -> int:
    return (a ^ b).bit_count()


def image_metrics(path: Path) -> dict:
    with Image.open(path) as opened:
        opened.load()
        image = opened.convert("RGBA")
        width, height = image.size
        rgba = np.asarray(image, dtype=np.uint8)
        alpha = rgba[:, :, 3]
        true_alpha = bool(alpha.min() < 255)
        transparent_fraction = float(np.mean(alpha < 250))
        border_px = max(1, min(width, height) // 30)
        rgb = rgba[:, :, :3]
        border = np.concatenate(
            [rgb[:border_px].reshape(-1, 3), rgb[-border_px:].reshape(-1, 3),
             rgb[:, :border_px].reshape(-1, 3), rgb[:, -border_px:].reshape(-1, 3)]
        ).astype(np.int16)
        chroma = border.max(axis=1) - border.min(axis=1)
        white = np.all(border >= 245, axis=1) & (chroma <= 12)
        gray = (border.mean(axis=1) >= 165) & (border.mean(axis=1) < 245) & (chroma <= 15)
        border_mean = border.mean(axis=0)
        border_std = float(np.mean(border.std(axis=0)))
        white_fraction = float(white.mean())
        gray_fraction = float(gray.mean())
        if true_alpha:
            background = "TRANSPARENT"
        elif white_fraction >= 0.70:
            background = "WHITE_BACKGROUND_LIKELY"
        elif gray_fraction >= 0.70:
            background = "GRAY_BACKGROUND_LIKELY"
        elif border_std <= 18:
            background = "UNIFORM_RECTANGULAR_BACKGROUND_LIKELY"
        else:
            background = "OPAQUE_SCENE_OR_COMPLEX_BACKGROUND"
        return {
            "width": width,
            "height": height,
            "mode": opened.mode,
            "true_alpha": true_alpha,
            "transparent_fraction": round(transparent_fraction, 6),
            "background_class": background,
            "border_white_fraction": round(white_fraction, 6),
            "border_gray_fraction": round(gray_fraction, 6),
            "border_mean_rgb": "/".join(str(int(round(x))) for x in border_mean),
            "border_std": round(border_std, 3),
            "ahash": f"{ahash(image):016x}",
            "dhash": f"{dhash(image):016x}",
            "mean_rgb": "/".join(str(int(round(x))) for x in rgb.reshape(-1, 3).mean(axis=0)),
        }


def collect_usage(root: Path) -> tuple[dict[str, list[str]], list[dict]]:
    usage: dict[str, set[str]] = defaultdict(set)
    missing_refs: list[dict] = []
    ignored = {"node_modules", ".git", "_site", ".playwright-cli", "docs", "tests", "codex-skills", "backups", "marketing"}
    for path in root.rglob("*"):
        if not path.is_file() or path.suffix.lower() not in TEXT_EXTENSIONS:
            continue
        relative_parts = path.relative_to(root).parts
        if ignored.intersection(relative_parts) or path.stat().st_size > 6 * 1024 * 1024:
            continue
        try:
            text = path.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue
        page = path.relative_to(root).as_posix()
        for match in ASSET_REFERENCE.finditer(text):
            relative = match.group(0).lstrip("/")
            usage[relative].add(page)
            if not (root / relative).exists():
                missing_refs.append({"kind": "BROKEN_REFERENCE", "asset": relative, "website_target": page,
                                     "status": "REAL_ASSET_REQUIRED", "note": "Referenced file does not exist"})
    return {key: sorted(value) for key, value in usage.items()}, missing_refs


def write_csv(path: Path, rows: list[dict], fields: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def make_contact_sheet(root: Path, rows: list[dict], output: Path, title: str, limit: int = 120) -> None:
    selected = rows[:limit]
    tile_w, tile_h = 240, 220
    cols = 4
    rows_count = max(1, math.ceil(len(selected) / cols))
    canvas = Image.new("RGB", (cols * tile_w, 70 + rows_count * tile_h), "#121820")
    draw = ImageDraw.Draw(canvas)
    font = ImageFont.load_default()
    draw.text((18, 18), f"{title} ({len(rows)})", fill="white", font=font)
    for index, item in enumerate(selected):
        x = (index % cols) * tile_w
        y = 70 + (index // cols) * tile_h
        checker = Image.new("RGB", (210, 160), "white")
        cdraw = ImageDraw.Draw(checker)
        for cy in range(0, 160, 16):
            for cx in range(0, 210, 16):
                if (cx // 16 + cy // 16) % 2:
                    cdraw.rectangle((cx, cy, cx + 15, cy + 15), fill="#d9d9d9")
        try:
            with Image.open(root / item["path"]) as opened:
                image = opened.convert("RGBA")
                image.thumbnail((200, 150), Image.Resampling.LANCZOS)
                checker.paste(image, ((210 - image.width) // 2, (160 - image.height) // 2), image)
        except Exception:
            cdraw.text((8, 70), "UNREADABLE", fill="red", font=font)
        canvas.paste(checker, (x + 15, y + 5))
        label = item["path"][-38:]
        draw.text((x + 15, y + 170), label, fill="white", font=font)
        draw.text((x + 15, y + 187), item.get("background_class", ""), fill="#7fd7ff", font=font)
    output.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(output, quality=88)


def audit(root: Path, output: Path) -> dict:
    usage, missing = collect_usage(root)
    assets: list[dict] = []
    for path in sorted((root / "assets").rglob("*")):
        if not path.is_file() or path.suffix.lower() not in IMAGE_EXTENSIONS:
            continue
        relative = path.relative_to(root).as_posix()
        category = category_for(relative)
        asset_type = type_suggestion(relative)
        record = {
            "path": relative,
            "sha256": sha256(path),
            "bytes": path.stat().st_size,
            "extension": path.suffix.lower(),
            "category_suggestion": category,
            "type_suggestion": asset_type,
            "state_suggestion": state_suggestion(relative),
            "suggested_filename": suggested_name(relative, category, asset_type, path.suffix),
            "usage_count": len(usage.get(relative, [])),
            "usage_status": "REFERENCED" if usage.get(relative) else "UNUSED",
            "website_targets": " | ".join(usage.get(relative, [])),
            "read_status": "OK",
            "review_status": "",
        }
        try:
            record.update(image_metrics(path))
        except Exception as error:
            record.update({"width": "", "height": "", "mode": "", "true_alpha": False,
                           "transparent_fraction": 0, "background_class": "UNREADABLE",
                           "border_white_fraction": "", "border_gray_fraction": "", "border_mean_rgb": "",
                           "border_std": "", "ahash": "", "dhash": "", "mean_rgb": "",
                           "read_status": "ERROR", "review_status": str(error)})
        if record["width"] and (max(record["width"], record["height"]) < LOW_RES_LONG_EDGE
                                or min(record["width"], record["height"]) < LOW_RES_SHORT_EDGE):
            record["resolution_status"] = "LOW_RESOLUTION"
        else:
            record["resolution_status"] = "OK" if record["width"] else "UNVERIFIED"
        if asset_type == "TYPE_A_PRODUCT_CUTOUT":
            if record["true_alpha"]:
                record["cutout_status"] = "TRANSPARENT_TECHNICAL_REVIEW"
            elif record["background_class"] in {"WHITE_BACKGROUND_LIKELY", "GRAY_BACKGROUND_LIKELY",
                                                 "UNIFORM_RECTANGULAR_BACKGROUND_LIKELY"}:
                record["cutout_status"] = "CUTOUT_REQUIRED"
            else:
                record["cutout_status"] = "REAL_SCENE_OR_MANUAL_REVIEW"
        else:
            record["cutout_status"] = "NOT_APPLICABLE_OR_REVIEW"
        assets.append(record)

    hash_groups: dict[str, list[dict]] = defaultdict(list)
    for item in assets:
        hash_groups[item["sha256"]].append(item)
    duplicate_rows: list[dict] = []
    for digest, group in hash_groups.items():
        if len(group) > 1:
            paths = " | ".join(item["path"] for item in group)
            duplicate_rows.append({"duplicate_type": "EXACT_SHA256", "sha256": digest, "distance": 0,
                                   "path_a": group[0]["path"], "path_b": paths, "review": "EXACT_DUPLICATE"})

    hashed = [item for item in assets if item.get("ahash") and
              (item["usage_count"] > 0 or Path(item["path"]).name.lower().startswith("main"))]
    buckets: dict[tuple[str, int, int], list[dict]] = defaultdict(list)
    for item in hashed:
        ratio_bucket = round((item["width"] / item["height"]), 1)
        buckets[(item["category_suggestion"], ratio_bucket, int(item["ahash"][:2], 16) // 32)].append(item)
    exact_pairs = {tuple(sorted((row["path_a"], part))) for row in duplicate_rows for part in row["path_b"].split(" | ")}
    for group in buckets.values():
        for i, left in enumerate(group):
            for right in group[i + 1:]:
                pair = tuple(sorted((left["path"], right["path"])))
                if pair in exact_pairs:
                    continue
                distance = hamming(int(left["ahash"], 16), int(right["ahash"], 16))
                d_distance = hamming(int(left["dhash"], 16), int(right["dhash"], 16))
                left_rgb = np.array([int(value) for value in left["mean_rgb"].split("/")])
                right_rgb = np.array([int(value) for value in right["mean_rgb"].split("/")])
                color_distance = float(np.linalg.norm(left_rgb - right_rgb))
                if distance <= 2 and d_distance <= 3 and color_distance <= 12:
                    duplicate_rows.append({"duplicate_type": "SIMILAR_AHASH_CANDIDATE", "sha256": "",
                                           "distance": f"a:{distance};d:{d_distance};rgb:{color_distance:.1f}",
                                           "path_a": left["path"], "path_b": right["path"],
                                           "review": "VISUAL_REVIEW_REQUIRED"})

    required_categories = {
        "PANTALLAS": "01-PANTALLAS", "HIDROGEL": "02-HIDROGEL", "BATERIAS": "03-BATERIAS",
        "PRODUCTOS_AI": "04-PRODUCTOS-AI", "X200T": "06-X200T",
    }
    for label, category in required_categories.items():
        members = [item for item in assets if item["category_suggestion"] == category and item["usage_count"] > 0]
        ready = [item for item in members if item["true_alpha"] and item["resolution_status"] == "OK"]
        if not members:
            missing.append({"kind": "CATEGORY_REAL_ASSET", "asset": label, "website_target": "V3",
                            "status": "REAL_ASSET_REQUIRED", "note": "No referenced asset found for category"})
        elif not ready:
            missing.append({"kind": "TRANSPARENT_CUTOUT", "asset": label, "website_target": "V3",
                            "status": "REAL_ASSET_REQUIRED", "note": "No referenced transparent, adequate-resolution cutout"})

    fields = ["path", "sha256", "bytes", "extension", "width", "height", "mode", "true_alpha",
              "transparent_fraction", "background_class", "border_white_fraction", "border_gray_fraction",
              "border_mean_rgb", "border_std", "mean_rgb", "ahash", "dhash",
              "category_suggestion", "type_suggestion", "state_suggestion",
              "resolution_status", "cutout_status", "usage_count", "usage_status", "website_targets",
              "suggested_filename", "read_status", "review_status"]
    write_csv(output / "inventory.csv", assets, fields)
    transparent = [item for item in assets if item["true_alpha"]]
    opaque_products = [item for item in assets if item["type_suggestion"] == "TYPE_A_PRODUCT_CUTOUT" and not item["true_alpha"]]
    low_res = [item for item in assets if item["resolution_status"] == "LOW_RESOLUTION"]
    write_csv(output / "transparent-assets.csv", transparent, fields)
    write_csv(output / "opaque-product-assets.csv", opaque_products, fields)
    write_csv(output / "low-resolution.csv", low_res, fields)
    write_csv(output / "duplicates.csv", duplicate_rows,
              ["duplicate_type", "sha256", "distance", "path_a", "path_b", "review"])
    write_csv(output / "missing-assets.csv", missing, ["kind", "asset", "website_target", "status", "note"])
    usage_rows = [{"asset": item["path"], "usage_status": item["usage_status"], "usage_count": item["usage_count"],
                   "website_targets": item["website_targets"]} for item in assets]
    write_csv(output / "website-usage.csv", usage_rows,
              ["asset", "usage_status", "usage_count", "website_targets"])
    mapping_rows = [{"current_path": item["path"], "category_target": item["category_suggestion"],
                     "state_target": item["state_suggestion"], "suggested_filename": item["suggested_filename"],
                     "action": "MAP_ONLY_DO_NOT_MOVE"} for item in assets]
    write_csv(output / "directory-mapping.csv", mapping_rows,
              ["current_path", "category_target", "state_target", "suggested_filename", "action"])
    make_contact_sheet(root, transparent, output / "preview" / "transparent-contact-sheet.jpg", "Transparent assets")
    priority_opaque = sorted(opaque_products, key=lambda item: (-item["usage_count"], item["path"]))
    make_contact_sheet(root, priority_opaque, output / "preview" / "opaque-product-contact-sheet.jpg", "Opaque product assets")

    summary = {
        "root": str(root), "total_assets": len(assets), "transparent": len(transparent),
        "opaque_product_images": len(opaque_products),
        "exact_duplicate_groups": sum(row["duplicate_type"] == "EXACT_SHA256" for row in duplicate_rows),
        "similar_candidates": sum(row["duplicate_type"] == "SIMILAR_AHASH_CANDIDATE" for row in duplicate_rows),
        "low_resolution": len(low_res), "unused": sum(item["usage_status"] == "UNUSED" for item in assets),
        "missing_rows": len(missing), "production_changed": False,
        "method": {"exact": "SHA256", "similar": "average hash <= 2 and difference hash <= 3 and mean RGB distance <= 12, same category/aspect bucket",
                   "alpha": "decoded alpha channel contains values below 255",
                   "background": "edge pixel color/chroma heuristic; technical review signal only"},
    }
    (output / "summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return summary


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    summary = audit(args.root.resolve(), args.output.resolve())
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
