#!/usr/bin/env python3
"""Incremental, non-publishing HAODE/HLA asset-factory batch.

The factory imports the immutable Phase 1 inventory, scans only configured
historical roots and INBOX, reuses unchanged metadata/hashes, separates
technical cutout quality from provenance approval, and emits a website handoff
containing only records that pass all three publication gates.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import html
import json
import math
import os
import re
import shutil
import subprocess
import sys
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageOps

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))
import audit_assets as audit  # noqa: E402
import normalize_product_media as normalizer  # noqa: E402
import normalize_website_batch as batch  # noqa: E402


SCHEMA_VERSION = "HAODE_ASSET_FACTORY_V1"
PIPELINE_VERSION = 2
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".tif", ".tiff", ".bmp", ".heic"}
VIDEO_EXTENSIONS = {".mp4", ".mov", ".m4v", ".avi", ".webm"}
MEDIA_EXTENSIONS = IMAGE_EXTENSIONS | VIDEO_EXTENSIONS
SIMPLE_BACKGROUNDS = {
    "WHITE_BACKGROUND_LIKELY",
    "GRAY_BACKGROUND_LIKELY",
    "UNIFORM_RECTANGULAR_BACKGROUND_LIKELY",
}
PROMO_TOKENS = (
    "promo", "oferta", "sale", "banner", "poster", "facebook", "instagram",
    "whatsapp", "ya llegaron", "precio", "publicidad", "anuncio", "促销", "海报",
)
SCENE_TOKENS = (
    "scene", "escena", "working", "installation", "instalacion", "factory", "fabrica",
    "tienda", "store", "warehouse", "exhibition", "expo", "technician", "tecnico", "工厂", "展会",
)
PRODUCT_CATEGORY_CODES = {
    "01-PANTALLAS", "02-HIDROGEL", "03-BATERIAS", "04-PRODUCTOS-AI", "05-FUNDAS", "06-X200T",
}


def digest(path: Path) -> str:
    value = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(4 * 1024 * 1024), b""):
            value.update(chunk)
    return value.hexdigest()


def slug(value: str) -> str:
    text = value.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text).strip("-")
    return text[:90] or "asset"


def category_for(value: str) -> str:
    text = value.lower()
    if any(token in text for token in ("promo", "oferta", "banner", "poster", "facebook", "publicidad", "促销", "海报")):
        return "09-PROMO"
    if any(token in text for token in ("funda", "case", "carcasa", "手机套")):
        return "05-FUNDAS"
    if "x200t" in text or "cut-machine" in text:
        return "06-X200T"
    if any(token in text for token in ("productos-ai", "smart-glass", "smart glass", "ai-glass", "ai glass", "ai-camera", "ai camera", "productos ai")):
        return "04-PRODUCTOS-AI"
    if any(token in text for token in ("bateria", "battery", "电池")):
        return "03-BATERIAS"
    if any(token in text for token in ("hidrogel", "micas", "mica-", "protector-pantalla", "水凝膜")):
        return "02-HIDROGEL"
    if any(token in text for token in ("pantalla", "display", "screen", "oled", "incell", "lcd", "三星屏", "苹果屏")):
        return "01-PANTALLAS"
    if any(token in text for token in ("factory", "fabrica", "warehouse", "工厂")):
        return "08-FACTORY"
    if any(token in text for token in ("tienda", "store", "local 225", "店铺")):
        return "07-TIENDA"
    if any(token in text for token in ("logo", "brand", "favicon", "marca")):
        return "00-BRAND"
    return "99-ARCHIVE"


def asset_type_for(value: str, category: str) -> str:
    text = value.lower()
    if any(token in text for token in PROMO_TOKENS) or category == "09-PROMO":
        return "PROMO"
    if any(token in text for token in SCENE_TOKENS) or category in {"07-TIENDA", "08-FACTORY"}:
        return "SCENE"
    if category == "00-BRAND":
        return "BRAND"
    if category in PRODUCT_CATEGORY_CODES:
        return "PRODUCT"
    return "REVIEW"


def source_scope(path: Path, baseline_root: Path, inbox: Path) -> str:
    try:
        path.relative_to(inbox)
        return "INBOX"
    except ValueError:
        pass
    try:
        path.relative_to(baseline_root)
        return "CURRENT_V3_BASELINE"
    except ValueError:
        pass
    text = str(path).lower()
    if "haode素材库" in text:
        return "LOCAL_LEGACY_LIBRARY"
    return "HISTORICAL_MASTER_LIBRARY"


def product_signature(value: str) -> str:
    text = value.lower().replace("pro max", "promax").replace("pro-max", "promax").replace("pro_max", "promax")
    compact = re.sub(r"[^a-z0-9/]+", "-", text)
    if "x200t" in compact:
        return "x200t"
    direct = re.search(r"(?:w630|w610|g3|g5|m02|lk-?030)", compact)
    if direct:
        return direct.group(0).replace("-", "")
    iphone = re.search(
        r"iphone(?:-(?:incell|oled|original|pantalla|screen))*[/_-]+"
        r"(17(?:-?(?:air|plus|pro|promax))?|16e|16(?:-?(?:plus|pro|promax))?|15(?:-?(?:plus|pro|promax))?|"
        r"14(?:-?(?:plus|pro|promax))?|13(?:-?(?:mini|pro|promax))?|12(?:-?(?:mini|pro|promax))?|"
        r"11(?:-?(?:pro|promax))?|xs-?max|xs|xr|x|8-?plus|8|7-?plus|7|6s-?plus|6s|6-?plus|6)",
        compact,
    )
    if iphone:
        return f"iphone-{iphone.group(1).replace('-', '')}"
    samsung = re.search(
        r"(?:samsung(?:-(?:incell|oled|original|pantalla|screen))*[/_-]+)?"
        r"((?:s|a|m)[0-9]{1,2}(?:-?(?:plus|ultra|fe|lite))?|note-?[0-9]{1,2}(?:-?(?:plus|ultra|lite))?|"
        r"z-?(?:fold|flip)-?[0-9])(?:[^0-9]|$)",
        compact,
    )
    if samsung:
        return f"samsung-{samsung.group(1).replace('-', '')}"
    return ""


def provenance(record: dict) -> tuple[str, str]:
    path = record["path"].lower()
    if record["asset_type"] == "BRAND" and "haode-master-assets/00-brand/haode/" in path:
        return "CONFIRMED", "Canonical official HAODE brand master"
    if record["asset_type"] == "PROMO":
        return "UNCONFIRMED", "Promo retained separately; never product main"
    if record["source_scope"] == "CURRENT_V3_BASELINE" and record.get("usage_status") == "REFERENCED" and record["product_signature"]:
        return "HIGH_CONFIDENCE", "Structured V3 product path plus active reference; owner confirmation still required"
    if record["source_scope"] in {"HISTORICAL_MASTER_LIBRARY", "LOCAL_LEGACY_LIBRARY"} and record["product_signature"]:
        return "HIGH_CONFIDENCE", "Historical HAODE/HLA library path plus model token; owner confirmation still required"
    if record["product_signature"]:
        return "UNCONFIRMED", "Model token detected without sufficient confirmation evidence"
    return "UNCONFIRMED", "No exact product identity evidence"


def image_metadata(path: Path) -> dict:
    metrics = audit.image_metrics(path)
    width, height = int(metrics["width"]), int(metrics["height"])
    metrics["resolution_status"] = (
        "LOW_RESOLUTION" if max(width, height) < audit.LOW_RES_LONG_EDGE or min(width, height) < audit.LOW_RES_SHORT_EDGE else "OK"
    )
    metrics["duration_seconds"] = ""
    metrics["video_codec"] = ""
    metrics["audio_codec"] = ""
    return metrics


def video_metadata(path: Path) -> dict:
    command = [
        "ffprobe", "-v", "error", "-show_entries",
        "format=duration:stream=codec_type,codec_name,width,height,r_frame_rate",
        "-of", "json", str(path),
    ]
    result = subprocess.run(command, check=False, capture_output=True, text=True, timeout=30)
    if result.returncode:
        raise ValueError(result.stderr.strip() or "ffprobe failed")
    data = json.loads(result.stdout)
    video = next((item for item in data.get("streams", []) if item.get("codec_type") == "video"), {})
    audio_stream = next((item for item in data.get("streams", []) if item.get("codec_type") == "audio"), {})
    width, height = int(video.get("width") or 0), int(video.get("height") or 0)
    return {
        "width": width,
        "height": height,
        "mode": "VIDEO",
        "true_alpha": False,
        "transparent_fraction": 0,
        "background_class": "VIDEO_NOT_APPLICABLE",
        "border_white_fraction": "",
        "border_gray_fraction": "",
        "border_mean_rgb": "",
        "border_std": "",
        "mean_rgb": "",
        "ahash": "",
        "dhash": "",
        "resolution_status": "OK" if width and height else "UNVERIFIED",
        "duration_seconds": round(float(data.get("format", {}).get("duration") or 0), 3),
        "video_codec": video.get("codec_name", ""),
        "audio_codec": audio_stream.get("codec_name", ""),
    }


def cached_or_scan(path: Path, previous: dict, known_hash: str = "") -> dict:
    stat = path.stat()
    key = str(path)
    old = previous.get(key, {})
    if old.get("bytes") == stat.st_size and old.get("mtime_ns") == stat.st_mtime_ns and old.get("sha256"):
        return {name: old.get(name, "") for name in (
            "sha256", "width", "height", "mode", "true_alpha", "transparent_fraction", "background_class",
            "border_white_fraction", "border_gray_fraction", "border_mean_rgb", "border_std", "mean_rgb", "ahash", "dhash",
            "resolution_status", "duration_seconds", "video_codec", "audio_codec", "read_status", "review_status",
        )}
    record = {"sha256": known_hash or digest(path), "read_status": "OK", "review_status": ""}
    try:
        record.update(video_metadata(path) if path.suffix.lower() in VIDEO_EXTENSIONS else image_metadata(path))
    except Exception as error:
        record.update({
            "width": "", "height": "", "mode": "", "true_alpha": False, "transparent_fraction": 0,
            "background_class": "UNREADABLE", "border_white_fraction": "", "border_gray_fraction": "",
            "border_mean_rgb": "", "border_std": "", "mean_rgb": "", "ahash": "", "dhash": "",
            "resolution_status": "UNVERIFIED", "duration_seconds": "", "video_codec": "", "audio_codec": "",
            "read_status": "ERROR", "review_status": str(error),
        })
    return record


def import_baseline(path: Path, root: Path) -> list[dict]:
    records = []
    with path.open(encoding="utf-8-sig", newline="") as handle:
        for row in csv.DictReader(handle):
            source = root / row["path"]
            record = dict(row)
            for field in ("bytes", "width", "height", "usage_count"):
                record[field] = int(record[field]) if record.get(field) else 0
            record["true_alpha"] = record.get("true_alpha") == "True"
            record["absolute_path"] = str(source)
            record["kind"] = "image"
            record["mtime_ns"] = source.stat().st_mtime_ns if source.is_file() else 0
            record["source_scope"] = "CURRENT_V3_BASELINE"
            record["category"] = row["category_suggestion"]
            record["asset_type"] = {"TYPE_A_PRODUCT_CUTOUT": "PRODUCT", "TYPE_B_REAL_SCENE": "SCENE"}.get(row["type_suggestion"], "REVIEW")
            record["product_signature"] = product_signature(row["path"])
            record["duration_seconds"] = ""
            record["video_codec"] = ""
            record["audio_codec"] = ""
            records.append(record)
    return records


def load_known_hashes(path: Path | None, root: Path) -> dict[str, str]:
    if not path or not path.is_file():
        return {}
    data = json.loads(path.read_text())
    return {str(root / item["relativePath"]): item.get("sha256") or "" for item in data.get("files", [])}


def scan_roots(roots: list[Path], baseline_root: Path, inbox: Path, previous: dict, known: dict[str, str]) -> list[dict]:
    records = []
    seen = set()
    for root in roots:
        if not root.is_dir():
            continue
        for path in sorted(root.rglob("*"), key=lambda item: str(item)):
            try:
                if path.is_symlink() or not path.is_file() or path.suffix.lower() not in MEDIA_EXTENSIONS:
                    continue
                resolved = path.resolve()
                if resolved in seen:
                    continue
                seen.add(resolved)
                stat = path.stat()
                category = category_for(str(path))
                asset_type = asset_type_for(str(path), category)
                record = {
                    "path": str(path), "absolute_path": str(path), "bytes": stat.st_size,
                    "mtime_ns": stat.st_mtime_ns, "extension": path.suffix.lower(),
                    "kind": "video" if path.suffix.lower() in VIDEO_EXTENSIONS else "image",
                    "source_scope": source_scope(path, baseline_root, inbox), "category": category,
                    "asset_type": asset_type, "product_signature": product_signature(str(path)),
                    "usage_status": "NOT_WEBSITE_SCANNED", "usage_count": 0, "website_targets": "",
                    "suggested_filename": "", "state_suggestion": "SOURCE_LIBRARY",
                }
                record.update(cached_or_scan(path, previous, known.get(str(path), "")))
                records.append(record)
            except (OSError, PermissionError) as error:
                records.append({
                    "path": str(path), "absolute_path": str(path), "bytes": 0, "mtime_ns": 0,
                    "extension": path.suffix.lower(), "kind": "unknown", "source_scope": "SCAN_ERROR",
                    "category": "99-ARCHIVE", "asset_type": "REVIEW", "product_signature": "",
                    "usage_status": "NOT_WEBSITE_SCANNED", "usage_count": 0, "website_targets": "",
                    "sha256": "", "read_status": "ERROR", "review_status": str(error),
                })
    return records


def enrich_provenance(records: list[dict]) -> None:
    for record in records:
        status, evidence = provenance(record)
        record["source_status"] = status
        record["provenance_evidence"] = evidence
    by_hash = defaultdict(list)
    for record in records:
        if record.get("sha256"):
            by_hash[record["sha256"]].append(record)
    for group in by_hash.values():
        signatures = {item["product_signature"] for item in group if item.get("product_signature")}
        categories = {item["category"] for item in group if item["category"] in PRODUCT_CATEGORY_CODES}
        if len(signatures) > 1 or len(categories) > 1:
            for item in group:
                if item["asset_type"] == "PRODUCT":
                    item["source_status"] = "AMBIGUOUS"
                    item["provenance_evidence"] = "Exact bytes appear under conflicting product/category identities"
        elif any(item["source_status"] == "HIGH_CONFIDENCE" for item in group):
            for item in group:
                if item["source_status"] == "UNCONFIRMED" and item["asset_type"] == "PRODUCT":
                    item["source_status"] = "HIGH_CONFIDENCE"
                    item["provenance_evidence"] = "Exact SHA256 chain to a structured HAODE/HLA product source"


def score_preferred(record: dict) -> tuple:
    provenance_score = {"CONFIRMED": 4, "HIGH_CONFIDENCE": 3, "UNCONFIRMED": 2, "AMBIGUOUS": 1, "REJECTED": 0}.get(record["source_status"], 0)
    state_score = 2 if record.get("resolution_status") == "OK" else 0
    alpha_score = 1 if record.get("true_alpha") else 0
    scope_score = {"INBOX": 4, "HISTORICAL_MASTER_LIBRARY": 3, "LOCAL_LEGACY_LIBRARY": 2, "CURRENT_V3_BASELINE": 1}.get(record["source_scope"], 0)
    pixels = int(record.get("width") or 0) * int(record.get("height") or 0)
    return provenance_score, state_score, alpha_score, scope_score, pixels, int(record.get("bytes") or 0), record["path"]


def assign_duplicate_state(records: list[dict]) -> tuple[list[dict], dict[str, dict]]:
    by_hash = defaultdict(list)
    for record in records:
        if record.get("sha256"):
            by_hash[record["sha256"]].append(record)
    rows, preferred = [], {}
    for sha, group in by_hash.items():
        winner = max(group, key=score_preferred)
        preferred[sha] = winner
        for item in group:
            item["duplicate_state"] = "PREFERRED_SOURCE" if item is winner else "DUPLICATE"
            item["preferred_source_path"] = winner["absolute_path"]
        if len(group) > 1:
            rows.append({
                "sha256": sha, "count": len(group), "preferred_source": winner["absolute_path"],
                "members": " | ".join(item["absolute_path"] for item in group),
            })
    return rows, preferred


def similarity_rows(records: list[dict], limit_per_bucket: int = 1200) -> list[dict]:
    buckets = defaultdict(list)
    for item in records:
        if item.get("kind") != "image" or not item.get("ahash") or not item.get("width") or not item.get("height"):
            continue
        ratio = round(float(item["width"]) / max(1, float(item["height"])), 1)
        buckets[(item["category"], ratio, int(item["ahash"][:2], 16) // 32)].append(item)
    result = []
    seen = set()
    for group in buckets.values():
        if len(group) > limit_per_bucket:
            group = sorted(group, key=score_preferred, reverse=True)[:limit_per_bucket]
        for index, left in enumerate(group):
            for right in group[index + 1:]:
                if left["sha256"] == right["sha256"]:
                    continue
                pair = tuple(sorted((left["absolute_path"], right["absolute_path"])))
                if pair in seen:
                    continue
                ad = audit.hamming(int(left["ahash"], 16), int(right["ahash"], 16))
                if ad > 2:
                    continue
                dd = audit.hamming(int(left["dhash"], 16), int(right["dhash"], 16))
                if dd > 3:
                    continue
                try:
                    rgb_left = np.array([int(value) for value in str(left["mean_rgb"]).split("/")])
                    rgb_right = np.array([int(value) for value in str(right["mean_rgb"]).split("/")])
                    color = float(np.linalg.norm(rgb_left - rgb_right))
                except (TypeError, ValueError):
                    continue
                if color > 12:
                    continue
                seen.add(pair)
                result.append({
                    "path_a": left["absolute_path"], "path_b": right["absolute_path"],
                    "distance": f"a:{ad};d:{dd};rgb:{color:.1f}",
                    "same_product_signature": bool(left["product_signature"] and left["product_signature"] == right["product_signature"]),
                    "higher_resolution": max((left, right), key=lambda item: int(item.get("width") or 0) * int(item.get("height") or 0))["absolute_path"],
                    "review": "HIGH_RES_SOURCE_CANDIDATE" if left["product_signature"] and left["product_signature"] == right["product_signature"] else "VISUAL_REVIEW_REQUIRED",
                })
    return result


def low_resolution_recovery(records: list[dict], similarities: list[dict]) -> list[dict]:
    by_path = {item["absolute_path"]: item for item in records}
    recovered = {}
    for pair in similarities:
        if not pair["same_product_signature"]:
            continue
        left, right = by_path[pair["path_a"]], by_path[pair["path_b"]]
        for low, high in ((left, right), (right, left)):
            if low.get("resolution_status") != "LOW_RESOLUTION" or high.get("resolution_status") != "OK":
                continue
            if low["source_status"] == "AMBIGUOUS" or high["source_status"] == "AMBIGUOUS":
                continue
            high_pixels = int(high.get("width") or 0) * int(high.get("height") or 0)
            current = recovered.get(low["absolute_path"])
            if current and current["candidate_pixels"] >= high_pixels:
                continue
            recovered[low["absolute_path"]] = {
                "low_resolution_source": low["absolute_path"],
                "low_dimensions": f"{low.get('width')}x{low.get('height')}",
                "high_resolution_candidate": high["absolute_path"],
                "high_dimensions": f"{high.get('width')}x{high.get('height')}",
                "product_signature": low["product_signature"],
                "similarity_distance": pair["distance"],
                "candidate_pixels": high_pixels,
                "status": "HIGH_CONFIDENCE_REPLACEMENT_CANDIDATE",
                "action": "REVIEW_IDENTITY_BEFORE_PREFERRED_SOURCE_CHANGE",
            }
    for low_path, candidate in recovered.items():
        by_path[low_path]["high_res_candidate_path"] = candidate["high_resolution_candidate"]
    return sorted(recovered.values(), key=lambda row: (row["product_signature"], row["low_resolution_source"]))


def load_phase2_outputs(path: Path | None) -> dict[str, dict]:
    if not path or not path.is_file():
        return {}
    document = json.loads(path.read_text())
    result = {}
    for record in document.get("assets", []):
        if record.get("source_sha256") and record.get("web_path") and Path(record["web_path"]).is_file():
            result[record["source_sha256"]] = record
    return result


def normalize_existing_alpha(source: Path, png: Path, web: Path) -> dict:
    with Image.open(source) as opened:
        image = opened.convert("RGBA")
    metrics = normalizer.alpha_metrics(image)
    reasons = []
    if metrics["clipped"]:
        reasons.append("SUBJECT_TOUCHES_CANVAS")
    if not metrics["bbox"]:
        reasons.append("EMPTY_ALPHA")
    if metrics["halo_ratio"] > 0.35:
        reasons.append("WHITE_FRINGE_RISK")
    reasons.extend(alpha_shape_reasons(image))
    metrics["qc_reasons"] = reasons
    if not reasons:
        metrics.update(batch.normalize_image(image, png, web))
    return metrics


def alpha_shape_reasons(image: Image.Image) -> list[str]:
    alpha = np.asarray(image.convert("RGBA"), dtype=np.uint8)[:, :, 3] > 16
    points = np.argwhere(alpha)
    if not len(points):
        return ["EMPTY_ALPHA"]
    y0, x0 = points.min(axis=0)
    y1, x1 = points.max(axis=0) + 1
    region = alpha[y0:y1, x0:x1]
    fill_ratio = float(region.mean())
    inset_y = max(2, int(region.shape[0] * 0.06))
    inset_x = max(2, int(region.shape[1] * 0.06))
    corners = (
        region[:inset_y, :inset_x], region[:inset_y, -inset_x:],
        region[-inset_y:, :inset_x], region[-inset_y:, -inset_x:],
    )
    corner_fill = min(float(corner.mean()) for corner in corners)
    if fill_ratio > 0.93 and corner_fill > 0.75:
        return ["RECTANGULAR_BACKGROUND_RETAINED"]
    return []


def process_cutouts(records: list[dict], preferred: dict[str, dict], phase2: dict, output: Path, limit: int) -> int:
    session = None
    processed = 0
    reusable = {}
    for record in records:
        record.update({
            "cutout_status": "NOT_APPLICABLE", "qc_status": "NOT_RUN", "master_path": "", "web_path": "",
            "target_sha256": "", "approved_for_web": False, "processing_action": "CLASSIFY_ONLY", "qc_metrics": {},
        })
        if record["kind"] != "image" or record["asset_type"] != "PRODUCT":
            continue
        if record["category"] == "03-BATERIAS":
            record["cutout_status"] = "REAL_ASSET_REQUIRED"
            record["qc_status"] = "NOT_RUN"
            continue
        if record["category"] in {"02-HIDROGEL", "06-X200T"}:
            record["cutout_status"] = "MANUAL_REVIEW"
            record["qc_status"] = "NOT_RUN"
            continue
        if record["duplicate_state"] != "PREFERRED_SOURCE":
            record["cutout_status"] = "DUPLICATE"
            continue
        source = Path(record["absolute_path"])
        stem = f"{slug(record['category'].split('-', 1)[-1])}-{slug(record['product_signature'] or source.stem)}-{record['sha256'][:12]}"
        png = output / "CUTOUT-DRAFT" / f"{stem}-master-v01.png"
        web = output / "WEB-DRAFT" / f"{stem}-web-v01.webp"
        cached = phase2.get(record["sha256"])
        if cached and cached.get("factory_cached_action") == "REUSED_FACTORY_QC_FAIL":
            metrics = cached.get("qc_metrics") or {}
            record["processing_action"] = "REUSED_FACTORY_QC_FAIL"
        elif cached and Path(cached.get("master_path") or "").is_file() and Path(cached.get("web_path") or "").is_file():
            png.parent.mkdir(parents=True, exist_ok=True)
            web.parent.mkdir(parents=True, exist_ok=True)
            if not png.is_file() or digest(png) != digest(Path(cached["master_path"])):
                shutil.copy2(cached["master_path"], png)
            if not web.is_file() or digest(web) != digest(Path(cached["web_path"])):
                shutil.copy2(cached["web_path"], web)
            metrics = cached.get("cutout_qc_metrics") or cached.get("qc_metrics") or {}
            record["processing_action"] = cached.get("factory_cached_action", "REUSED_PHASE2_OUTPUT")
        elif record.get("true_alpha"):
            old = reusable.get(record["sha256"])
            if old and Path(old["master_path"]).is_file() and Path(old["web_path"]).is_file():
                png, web, metrics = Path(old["master_path"]), Path(old["web_path"]), old["qc_metrics"]
                record["processing_action"] = "REUSED_FACTORY_OUTPUT"
            else:
                png.parent.mkdir(parents=True, exist_ok=True)
                web.parent.mkdir(parents=True, exist_ok=True)
                metrics = normalize_existing_alpha(source, png, web)
                record["processing_action"] = "NORMALIZED_EXISTING_ALPHA"
                processed += 1
        elif record.get("background_class") in SIMPLE_BACKGROUNDS and record.get("resolution_status") == "OK" and record["category"] == "01-PANTALLAS":
            if limit and processed >= limit:
                record["cutout_status"] = "QUEUED"
                record["qc_status"] = "NOT_RUN"
                continue
            png.parent.mkdir(parents=True, exist_ok=True)
            web.parent.mkdir(parents=True, exist_ok=True)
            prior = reusable.get(record["sha256"])
            if prior and Path(prior["master_path"]).is_file() and Path(prior["web_path"]).is_file():
                png, web, metrics = Path(prior["master_path"]), Path(prior["web_path"]), prior["qc_metrics"]
                record["processing_action"] = "REUSED_FACTORY_OUTPUT"
            else:
                if session is None:
                    session = batch.new_session("u2net")
                removed, metrics = batch.cutout(source, session)
                metrics["qc_reasons"] = list(dict.fromkeys(
                    [*metrics.get("qc_reasons", []), *alpha_shape_reasons(removed)]
                ))
                if not metrics.get("qc_reasons"):
                    metrics.update(batch.normalize_image(removed, png, web))
                record["processing_action"] = "NON_GENERATIVE_U2NET_CUTOUT"
                processed += 1
        elif record.get("resolution_status") == "LOW_RESOLUTION":
            record["cutout_status"] = "LOW_RESOLUTION"
            record["qc_status"] = "QC_FAIL"
            continue
        else:
            record["cutout_status"] = "MANUAL_REVIEW"
            record["qc_status"] = "NOT_RUN"
            continue
        reasons = list(metrics.get("qc_reasons", []))
        candidate_for_shape = png if png.is_file() else None
        if candidate_for_shape:
            with Image.open(candidate_for_shape) as opened:
                reasons = list(dict.fromkeys([*reasons, *alpha_shape_reasons(opened)]))
            metrics["qc_reasons"] = reasons
        record["qc_metrics"] = metrics
        if reasons:
            record["cutout_status"] = "MANUAL_REVIEW"
            record["qc_status"] = "QC_FAIL"
        elif record.get("resolution_status") == "LOW_RESOLUTION":
            record["cutout_status"] = "LOW_RESOLUTION"
            record["qc_status"] = "QC_FAIL"
        else:
            record["cutout_status"] = "CUTOUT_READY"
            record["qc_status"] = "QC_PASS"
            record["master_path"] = str(png)
            record["web_path"] = str(web)
            record["target_sha256"] = digest(web)
            reusable[record["sha256"]] = record
            record["approved_for_web"] = record["source_status"] == "CONFIRMED"
    return processed


def write_csv(path: Path, rows: list[dict], fields: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def contact_sheet(records: list[dict], output: Path, predicate, title: str, limit: int = 80) -> None:
    chosen = [item for item in records if predicate(item) and Path(item.get("absolute_path", "")).is_file()][:limit]
    cols, tile_w, tile_h = 5, 270, 260
    rows_count = max(1, math.ceil(len(chosen) / cols))
    canvas = Image.new("RGB", (cols * tile_w, 60 + rows_count * tile_h), (20, 26, 32))
    draw, font = ImageDraw.Draw(canvas), ImageFont.load_default()
    draw.text((18, 20), f"{title} ({len(chosen)})", fill="white", font=font)
    for index, record in enumerate(chosen):
        x, y = (index % cols) * tile_w, 60 + (index // cols) * tile_h
        board = batch.checkerboard((250, 200))
        candidate = Path(record.get("web_path") or record["absolute_path"])
        try:
            with Image.open(candidate) as opened:
                image = ImageOps.exif_transpose(opened).convert("RGBA")
                image.thumbnail((230, 180), Image.Resampling.LANCZOS)
                board.paste(image, ((250 - image.width) // 2, (200 - image.height) // 2), image)
        except Exception:
            ImageDraw.Draw(board).text((70, 90), "UNREADABLE", fill="red", font=font)
        canvas.paste(board, (x + 10, y + 5))
        label = f"{Path(record['absolute_path']).name[:32]}\n{record['category']} · {record['source_status']}\n{record['cutout_status']}"
        draw.multiline_text((x + 10, y + 210), label, fill="white", font=font, spacing=2)
    output.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(output, quality=90)


def build_user_review(queue: list[dict], output: Path) -> None:
    review = output / "USER-REVIEW"
    assets = review / "assets"
    assets.mkdir(parents=True, exist_ok=True)
    expected = set()
    cards = []
    for index, record in enumerate(queue, start=1):
        source = Path(record.get("web_path") or record["absolute_path"])
        preview_name = f"{index:02d}-{record.get('sha256', '')[:12]}.webp"
        expected.add(preview_name)
        preview = assets / preview_name
        try:
            with Image.open(source) as opened:
                image = ImageOps.exif_transpose(opened).convert("RGBA")
                image.thumbnail((720, 720), Image.Resampling.LANCZOS)
                image.save(preview, format="WEBP", lossless=True, method=6)
            media = f'<img src="assets/{html.escape(preview_name)}" alt="review asset">'
        except Exception:
            media = '<div class="missing">PREVIEW UNAVAILABLE</div>'
        cards.append(f"""
<article><div class="media">{media}</div><div class="body">
<span>{html.escape(record['category'])}</span><h2>{html.escape(Path(record['absolute_path']).name)}</h2>
<p><b>来源：</b>{html.escape(record['source_status'])}</p>
<p><b>处理：</b>{html.escape(record['cutout_status'])} / {html.escape(record['qc_status'])}</p>
<p><b>证据：</b>{html.escape(record['provenance_evidence'])}</p>
<code>{html.escape(record['absolute_path'])}</code>
</div></article>""")
    for stale in assets.glob("*.webp"):
        if stale.name not in expected:
            stale.unlink()
    page = f"""<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>HAODE Asset Factory — User Review</title><style>
*{{box-sizing:border-box}}body{{margin:0;background:#eef1f4;color:#121820;font:15px/1.5 Arial,sans-serif}}header{{padding:32px 5vw;background:#121820;color:white}}header b{{color:#ff5a14}}main{{width:min(1320px,92vw);margin:32px auto;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}}article{{background:white;border:1px solid #cfd6dc;min-width:0}}.media{{aspect-ratio:1;display:grid;place-items:center;padding:8%;background-color:#fff;background-image:linear-gradient(45deg,#e1e5e8 25%,transparent 25%),linear-gradient(-45deg,#e1e5e8 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e1e5e8 75%),linear-gradient(-45deg,transparent 75%,#e1e5e8 75%);background-size:24px 24px;background-position:0 0,0 12px,12px -12px,-12px 0}}.media img{{max-width:100%;max-height:100%;object-fit:contain}}.body{{padding:18px}}span{{color:#ff5a14;font-weight:800}}h2{{font-size:18px;overflow-wrap:anywhere}}p{{margin:6px 0}}code{{display:block;margin-top:12px;font-size:11px;overflow-wrap:anywhere;color:#56616b}}.missing{{color:#a32626;font-weight:bold}}@media(max-width:800px){{main{{grid-template-columns:1fr}}}}
</style></head><body><header><b>HAODE ASSET FACTORY</b><h1>USER REVIEW REQUIRED · {len(queue)}</h1><p>这里只列出优先决策；未确认素材不会进入网站交接。</p></header><main>{''.join(cards)}</main></body></html>"""
    (review / "index.html").write_text(page, encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--baseline-inventory", type=Path, required=True)
    parser.add_argument("--baseline-root", type=Path, required=True)
    parser.add_argument("--source-root", type=Path, action="append", default=[])
    parser.add_argument("--inbox", type=Path, required=True)
    parser.add_argument("--historical-scan", type=Path)
    parser.add_argument("--phase2-manifest", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--cutout-limit", type=int, default=0)
    args = parser.parse_args()

    output = args.output.resolve()
    output.mkdir(parents=True, exist_ok=True)
    previous_path = output / "asset-manifest.json"
    previous_doc = json.loads(previous_path.read_text()) if previous_path.is_file() else {}
    previous = {item["absolute_path"]: item for item in previous_doc.get("assets", [])}
    historical_root = args.source_root[0].resolve() if args.source_root else Path("/")
    known = load_known_hashes(args.historical_scan, historical_root)

    records = import_baseline(args.baseline_inventory.resolve(), args.baseline_root.resolve())
    baseline_paths = {Path(item["absolute_path"]).resolve() for item in records}
    scanned = scan_roots(
        [path.resolve() for path in args.source_root] + [args.inbox.resolve()],
        args.baseline_root.resolve(), args.inbox.resolve(), previous, known,
    )
    records.extend(item for item in scanned if Path(item["absolute_path"]).resolve() not in baseline_paths)
    enrich_provenance(records)
    duplicates, preferred = assign_duplicate_state(records)
    similarities = similarity_rows(records)
    low_res_recovery = low_resolution_recovery(records, similarities)
    phase2 = load_phase2_outputs(args.phase2_manifest)
    for old in previous_doc.get("assets", []):
        if old.get("sha256") and old.get("qc_status") == "QC_PASS" and old.get("master_path") and old.get("web_path"):
            cached = dict(old)
            cached["factory_cached_action"] = "REUSED_FACTORY_QC_PASS"
            phase2.setdefault(old["sha256"], cached)
        elif old.get("sha256") and old.get("qc_status") == "QC_FAIL" and old.get("qc_metrics"):
            cached = dict(old)
            cached["factory_cached_action"] = "REUSED_FACTORY_QC_FAIL"
            phase2.setdefault(old["sha256"], cached)
    processed = process_cutouts(records, preferred, phase2, output, args.cutout_limit)

    user_review = [item for item in records if item["asset_type"] == "PRODUCT" and (
        item["source_status"] == "AMBIGUOUS" or item["cutout_status"] == "MANUAL_REVIEW"
    )]
    user_review.sort(key=lambda item: (
        item["category"] != "06-X200T", item["source_status"] != "AMBIGUOUS", -int(item.get("usage_count") or 0), item["path"]
    ))
    user_review_queue, review_keys = [], set()
    for item in user_review:
        key = item.get("sha256") or f"{item['category']}:{item.get('product_signature')}:{item['absolute_path']}"
        if key in review_keys:
            continue
        review_keys.add(key)
        user_review_queue.append(item)
        if len(user_review_queue) == 12:
            break
    handoff = [item for item in records if item.get("approved_for_web") and item.get("qc_status") == "QC_PASS" and item.get("source_status") == "CONFIRMED"]

    fields = [
        "path", "absolute_path", "sha256", "bytes", "mtime_ns", "extension", "kind", "width", "height", "mode",
        "duration_seconds", "video_codec", "audio_codec", "true_alpha", "transparent_fraction", "background_class",
        "ahash", "dhash", "mean_rgb", "category", "asset_type", "source_scope", "product_signature", "source_status",
        "provenance_evidence", "duplicate_state", "preferred_source_path", "resolution_status", "cutout_status", "qc_status",
        "master_path", "web_path", "target_sha256", "approved_for_web", "processing_action", "usage_status", "usage_count",
        "website_targets", "high_res_candidate_path", "read_status", "review_status",
    ]
    write_csv(output / "inventory.csv", records, fields)
    write_csv(output / "duplicates.csv", duplicates, ["sha256", "count", "preferred_source", "members"])
    write_csv(output / "similarity-groups.csv", similarities, ["path_a", "path_b", "distance", "same_product_signature", "higher_resolution", "review"])
    write_csv(
        output / "low-resolution-recovery.csv", low_res_recovery,
        ["low_resolution_source", "low_dimensions", "high_resolution_candidate", "high_dimensions", "product_signature",
         "similarity_distance", "status", "action"],
    )
    write_csv(output / "user-review-required.csv", user_review_queue, fields)
    write_csv(output / "approved-web-assets.csv", handoff, fields)
    write_csv(output / "video-inventory.csv", [item for item in records if item["kind"] == "video"], fields)
    write_csv(output / "preferred-sources.csv", list(preferred.values()), fields)

    contact_sheet(records, output / "contact-sheets" / "cutout-ready.jpg", lambda item: item.get("qc_status") == "QC_PASS", "QC PASS technical cutouts")
    contact_sheet(records, output / "contact-sheets" / "manual-review.jpg", lambda item: item.get("cutout_status") == "MANUAL_REVIEW", "Manual review priority")
    contact_sheet(records, output / "contact-sheets" / "promo.jpg", lambda item: item.get("asset_type") == "PROMO", "Promo kept separate")
    build_user_review(user_review_queue, output)

    categories = {}
    for category in ("01-PANTALLAS", "02-HIDROGEL", "03-BATERIAS", "04-PRODUCTOS-AI", "06-X200T", "05-FUNDAS"):
        group = [item for item in records if item["category"] == category]
        categories[category] = {
            "total": len(group), "source_confirmed": sum(item["source_status"] == "CONFIRMED" for item in group),
            "source_high_confidence": sum(item["source_status"] == "HIGH_CONFIDENCE" for item in group),
            "cutout_ready": sum(item["cutout_status"] == "CUTOUT_READY" for item in group),
            "qc_pass": sum(item["qc_status"] == "QC_PASS" for item in group),
            "manual_review": sum(item["cutout_status"] == "MANUAL_REVIEW" for item in group),
            "low_res": sum(item["resolution_status"] == "LOW_RESOLUTION" for item in group),
        }
    summary = {
        "generated_at": datetime.now(timezone.utc).isoformat(), "schema_version": SCHEMA_VERSION,
        "pipeline_version": PIPELINE_VERSION, "baseline_assets": 711, "total_assets": len(records),
        "images": sum(item["kind"] == "image" for item in records), "videos": sum(item["kind"] == "video" for item in records),
        "source_confirmed": sum(item["source_status"] == "CONFIRMED" for item in records),
        "source_high_confidence": sum(item["source_status"] == "HIGH_CONFIDENCE" for item in records),
        "source_unconfirmed": sum(item["source_status"] == "UNCONFIRMED" for item in records),
        "source_ambiguous": sum(item["source_status"] == "AMBIGUOUS" for item in records),
        "cutout_ready": sum(item["cutout_status"] == "CUTOUT_READY" for item in records),
        "qc_pass": sum(item["qc_status"] == "QC_PASS" for item in records),
        "manual_review": sum(item["cutout_status"] == "MANUAL_REVIEW" for item in records),
        "low_res": sum(item["resolution_status"] == "LOW_RESOLUTION" for item in records),
        "missing": sum(item["cutout_status"] == "REAL_ASSET_REQUIRED" for item in records) + 1,
        "duplicate_groups": len(duplicates), "similar_candidates": len(similarities),
        "low_res_recovery_candidates": len(low_res_recovery),
        "new_approved_web_assets": len(handoff), "user_review_required": len(user_review_queue),
        "user_review_backlog": len(user_review), "processed_this_run": processed,
        "inbox_assets": sum(item["source_scope"] == "INBOX" for item in records),
        "read_errors": sum(item.get("read_status") == "ERROR" for item in records),
        "categories": categories, "website_code_modified": False, "production": "UNCHANGED",
    }
    summary["source_not_confirmed_total"] = (
        summary["source_unconfirmed"]
        + summary["source_high_confidence"]
        + summary["source_ambiguous"]
    )
    manifest = {
        "schema_version": SCHEMA_VERSION, "pipeline_version": PIPELINE_VERSION,
        "standard": "/Users/mac/Documents/haode/HAODE_ASSET_STANDARD.md",
        "publication_gate": ["SOURCE_CONFIRMED", "QC_PASS", "APPROVED_FOR_WEB"],
        "production_changed": False, "summary": summary, "assets": records,
    }
    previous_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (output / "factory-summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    report = f"""# HAODE ASSET FACTORY — BATCH 1

TOTAL ASSETS: {summary['total_assets']} (Phase 1 baseline: 711)
SOURCE CONFIRMED: {summary['source_confirmed']}
SOURCE UNCONFIRMED: {summary['source_not_confirmed_total']} (UNCONFIRMED: {summary['source_unconfirmed']}; HIGH_CONFIDENCE pending owner confirmation: {summary['source_high_confidence']}; AMBIGUOUS: {summary['source_ambiguous']})
CUTOUT READY: {summary['cutout_ready']}
QC PASS: {summary['qc_pass']}
MANUAL REVIEW: {summary['manual_review']}
LOW RES: {summary['low_res']}
LOW RES RECOVERY CANDIDATES: {summary['low_res_recovery_candidates']}
MISSING: {summary['missing']}
DUPLICATE GROUPS: {summary['duplicate_groups']}

PANTALLAS: {json.dumps(categories['01-PANTALLAS'], ensure_ascii=False)}
HIDROGEL: {json.dumps(categories['02-HIDROGEL'], ensure_ascii=False)}
BATERIAS: REAL_ASSET_REQUIRED; {json.dumps(categories['03-BATERIAS'], ensure_ascii=False)}
PRODUCTOS AI: {json.dumps(categories['04-PRODUCTOS-AI'], ensure_ascii=False)}
X200T: {json.dumps(categories['06-X200T'], ensure_ascii=False)}
FUNDAS: {json.dumps(categories['05-FUNDAS'], ensure_ascii=False)}

NEW APPROVED WEB ASSETS: {summary['new_approved_web_assets']}
USER REVIEW REQUIRED: {summary['user_review_required']} prioritized rows (backlog: {summary['user_review_backlog']})

WEBSITE CODE MODIFIED: NO

PRODUCTION: UNCHANGED
"""
    (output / "HAODE-ASSET-FACTORY-BATCH-1.md").write_text(report, encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    os.environ.setdefault("U2NET_HOME", "/Users/mac/Documents/haode/HAODE-AUTOMATION/TOOLS/rembg/models")
    raise SystemExit(main())
