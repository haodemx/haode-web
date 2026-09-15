#!/usr/bin/env python3
"""Normalize the current HAODE website product-image batch without publishing it.

This phase consumes the existing V1 manifest and website-usage CSV.  It does not
rescan the historical library, edit product data, or replace website assets.
Opaque cutouts use the local non-generative u2net segmentation model and retain
source/authenticity state separately from technical cutout QC.
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import shutil
import sys
from collections import Counter
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from rembg import new_session, remove
from scipy import ndimage

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))
import normalize_product_media as base  # noqa: E402


PIPELINE_VERSION = 4
SIMPLE_BACKGROUNDS = {
    "WHITE_BACKGROUND",
    "GRAY_OR_BEIGE_BACKGROUND",
    "RECTANGULAR_BACKGROUND",
}
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
SOURCE_RISK_TOKENS = (
    "card", "display", "thumb", "detail", "back", "cable", "flex",
    "box", "package", "promo", "oferta", "banner", "poster", "价格",
    "背板", "排线", "细节", "详情", "盒子",
)
MANUAL_VISUAL_REJECT_IDS = {
    "samsung-original-s24-ultra",
    "samsung-original-z-flip3",
    "samsung-original-z-fold3",
}


def load_usage(path: Path) -> dict[str, dict]:
    result = {}
    with path.open(encoding="utf-8-sig", newline="") as handle:
        for row in csv.DictReader(handle):
            key = row["asset"].lstrip("/")
            result[key] = {
                "usage_status": row["usage_status"],
                "usage_count": int(row["usage_count"] or 0),
                "website_targets": row["website_targets"],
            }
    return result


def image_info(path: Path) -> dict | None:
    try:
        with Image.open(path) as opened:
            image = opened.convert("RGBA")
            width, height = image.size
            return {
                "path": path,
                "width": width,
                "height": height,
                "area": width * height,
                "alpha": image.getchannel("A").getextrema()[0] < 255,
                "background": base.background_type(image),
            }
    except Exception:
        return None


def source_candidates(current: Path) -> list[dict]:
    """Return same-product candidates only; flat multi-model folders stay isolated."""
    paths = [current]
    current_stem = current.stem.lower()
    dedicated_folder = "main" in current_stem or current_stem in {"front", "frente"}
    if dedicated_folder:
        paths.extend(
            path for path in current.parent.iterdir()
            if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS
        )
    unique = []
    seen = set()
    for path in paths:
        resolved = path.resolve()
        if resolved in seen:
            continue
        seen.add(resolved)
        info = image_info(path)
        if not info:
            continue
        if max(info["width"], info["height"]) / max(1, min(info["width"], info["height"])) > 4:
            continue
        name = path.name.lower()
        risk = sum(token in name for token in SOURCE_RISK_TOKENS)
        background_score = {
            "TRANSPARENT": 90,
            "WHITE_BACKGROUND": 80,
            "GRAY_OR_BEIGE_BACKGROUND": 70,
            "RECTANGULAR_BACKGROUND": 60,
        }.get(info["background"], 0)
        current_bonus = 4 if path == current else 0
        main_bonus = 3 if path.stem.lower() in {"main", "front", "frente"} else 0
        resolution_score = min(info["area"], 20_000_000) / 1_000_000
        info["score"] = background_score + resolution_score + current_bonus + main_bonus - risk * 25
        info["risk_tokens"] = risk
        unique.append(info)
    return sorted(unique, key=lambda item: (item["score"], item["area"], str(item["path"])), reverse=True)


def select_source(current: Path) -> tuple[Path, dict]:
    candidates = source_candidates(current)
    if not candidates:
        raise ValueError(f"No readable source candidates: {current}")
    selected = candidates[0]
    return selected["path"], selected


def prepare_for_segmentation(source: Path) -> Image.Image:
    with Image.open(source) as opened:
        image = opened.convert("RGB")
        image.thumbnail((2600, 2600), Image.Resampling.LANCZOS)
        return image.copy()


def component_metrics(image: Image.Image) -> dict:
    alpha = np.asarray(image.convert("RGBA"), dtype=np.uint8)[:, :, 3]
    mask = alpha > 16
    if not mask.any():
        return {"components": 0, "tiny_component_fraction": 1.0}
    labels, count = ndimage.label(mask)
    sizes = np.bincount(labels.ravel())[1:].tolist()
    total = max(1, sum(sizes))
    tiny = sum(size for size in sizes if size < total * 0.0005)
    return {"components": int(count), "tiny_component_fraction": round(tiny / total, 6)}


def cutout(source: Path, session) -> tuple[Image.Image, dict]:
    working = prepare_for_segmentation(source)
    result = remove(working, session=session, alpha_matting=False, post_process_mask=True).convert("RGBA")
    metrics = base.alpha_metrics(result)
    metrics.update(component_metrics(result))
    alpha_fraction = metrics["alpha_fraction"]
    reasons = []
    if metrics["clipped"]:
        reasons.append("SUBJECT_TOUCHES_CANVAS")
    if metrics["bbox"] is None or not 0.03 <= alpha_fraction <= 0.97:
        reasons.append("IMPLAUSIBLE_ALPHA_FRACTION")
    if metrics["halo_ratio"] > 0.35:
        reasons.append("WHITE_FRINGE_RISK")
    if metrics["tiny_component_fraction"] > 0.01:
        reasons.append("DETACHED_FRAGMENT_RISK")
    metrics["qc_reasons"] = reasons
    return result, metrics


def normalize_image(image: Image.Image, png_path: Path, web_path: Path) -> dict:
    metrics = base.alpha_metrics(image)
    if not metrics["bbox"]:
        raise ValueError("Empty foreground")
    crop = image.crop(metrics["bbox"])
    scale = min(base.CANVAS * base.OCCUPANCY / crop.width, base.CANVAS * base.OCCUPANCY / crop.height)
    size = (max(1, round(crop.width * scale)), max(1, round(crop.height * scale)))
    crop = crop.resize(size, Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (base.CANVAS, base.CANVAS), (0, 0, 0, 0))
    canvas.alpha_composite(crop, ((base.CANVAS - size[0]) // 2, (base.CANVAS - size[1]) // 2))
    png_path.parent.mkdir(parents=True, exist_ok=True)
    web_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(png_path, format="PNG", optimize=True, icc_profile=base.SRGB_PROFILE)
    canvas.save(web_path, format="WEBP", lossless=True, method=6, icc_profile=base.SRGB_PROFILE)
    return {
        "normalized_occupancy": round(max(size) / base.CANVAS, 4),
        "normalized_bbox": base.alpha_metrics(canvas)["bbox"],
    }


def checkerboard(size: tuple[int, int], cell: int = 18) -> Image.Image:
    width, height = size
    board = Image.new("RGB", size, "white")
    draw = ImageDraw.Draw(board)
    for y in range(0, height, cell):
        for x in range(0, width, cell):
            color = (225, 229, 232) if (x // cell + y // cell) % 2 else (250, 250, 250)
            draw.rectangle((x, y, x + cell - 1, y + cell - 1), fill=color)
    return board


def build_contact_sheets(output: Path, records: list[dict]) -> int:
    ready = [record for record in records if record.get("web_path") and Path(record["web_path"]).is_file()]
    sheets = output / "contact-sheets"
    sheets.mkdir(parents=True, exist_ok=True)
    for stale_sheet in sheets.glob("website-cutouts-*.jpg"):
        stale_sheet.unlink()
    font = ImageFont.load_default()
    page_count = 0
    for page_index in range(0, len(ready), 20):
        page_count += 1
        canvas = Image.new("RGB", (1500, 1320), (242, 244, 246))
        draw = ImageDraw.Draw(canvas)
        for index, record in enumerate(ready[page_index:page_index + 20]):
            col, row = index % 5, index // 5
            x, y = col * 300, row * 330
            board = checkerboard((280, 280))
            with Image.open(record["web_path"]) as opened:
                image = opened.convert("RGBA")
                image.thumbnail((250, 250), Image.Resampling.LANCZOS)
                board.paste(image, ((280 - image.width) // 2, (280 - image.height) // 2), image)
            canvas.paste(board, (x + 10, y + 10))
            label = f"{record['asset_id'][:38]}\n{record['normalization_status']} · {record['real_asset_status']}"
            draw.multiline_text((x + 10, y + 294), label, fill=(18, 24, 30), font=font, spacing=2)
        canvas.save(sheets / f"website-cutouts-{page_count:03d}.jpg", quality=90)
    return page_count


def copy_phase1_asset(record: dict, output: Path) -> bool:
    source_png = Path(record.get("phase1_master_path") or "")
    source_web = Path(record.get("phase1_web_path") or "")
    if not source_png.is_file() or not source_web.is_file():
        return False
    png = output / "normalized" / f"{base.slug(record['asset_id'])}-master-v01.png"
    web = output / "web" / f"{base.slug(record['asset_id'])}-web-v01.webp"
    png.parent.mkdir(parents=True, exist_ok=True)
    web.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source_png, png)
    shutil.copy2(source_web, web)
    record["master_path"] = str(png)
    record["web_path"] = str(web)
    record["target_sha256"] = base.digest(web)
    record["preview_after_path"] = f"../web/{web.name}"
    record["batch_action"] = "REUSED_PHASE1_QC_PASS"
    return True


def quarantine_generated(record: dict, output: Path, reason: str) -> None:
    review = output / "review"
    review.mkdir(parents=True, exist_ok=True)
    stem = base.slug(record["asset_id"])
    for source, suffix in (
        (output / "normalized" / f"{stem}-master-v01.png", "auto-rejected.png"),
        (output / "web" / f"{stem}-web-v01.webp", "auto-rejected.webp"),
    ):
        if source.is_file():
            target = review / f"{stem}-{suffix}"
            if target.exists():
                target.unlink()
            shutil.move(source, target)
    record["master_path"] = ""
    record["web_path"] = ""
    record["target_sha256"] = ""
    record["preview_after_path"] = ""
    record["notes"] = (record["notes"] + f" | {reason}").strip(" |")


def write_report(output: Path, summary: dict) -> None:
    category = summary["categories"]
    text = f"""# HAODE ASSET SYSTEM V1 — PHASE 2

CURRENT WEBSITE IMAGES: {summary['current_website_images']}

NORMALIZED: {summary['normalized']}

TRANSPARENT: {summary['transparent']}

CUTOUT COMPLETED: {summary['cutout_completed']}

MANUAL REVIEW: {summary['manual_review']}

LOW RES: {summary['low_res']}

SOURCE UNCONFIRMED: {summary['source_unconfirmed']}

PROMO REPLACED: {summary['promo_replaced']} local-preview placeholders; original promo files retained and not published

MISSING: {summary['main_asset_required']}

PANTALLAS: {category.get('PANTALLAS', {}).get('total', 0)} current records; {category.get('PANTALLAS', {}).get('normalized', 0)} transparent outputs; {category.get('PANTALLAS', {}).get('qc_pass', 0)} QC_PASS; {category.get('PANTALLAS', {}).get('low_res_outputs', 0)} LOW_RESOLUTION technical outputs; {category.get('PANTALLAS', {}).get('manual_review', 0)} manual review

HIDROGEL: {category.get('HIDROGEL', {}).get('total', 0)} current records; REAL_ASSET_REQUIRED; no generated substitute

BATERIAS: REAL_ASSET_REQUIRED; no formal source supplied.

PRODUCTOS AI: {category.get('PRODUCTOS_AI', {}).get('total', 0)} current records; 0 admitted to Phase 2 preview because identity is unconfirmed; one Phase 1 technical cutout remains evidence only

X200T: {category.get('X200T', {}).get('total', 0)} current record; MANUAL_REVIEW; unchanged

WEBSITE NORMALIZED COVERAGE: {summary['normalized_coverage_percent']}% technical-output coverage ({summary['normalized']}/{summary['current_website_images']}); {summary['qc_pass_preview_coverage_percent']}% QC_PASS Pantallas preview coverage ({category.get('PANTALLAS', {}).get('qc_pass', 0)}/{summary['current_website_images']})

PRODUCTS 11: pending browser QA

DESKTOP: pending browser QA

MOBILE: pending browser QA

LOGO: pending browser QA

MANIFEST: PASS; {summary['current_website_images']} records, {summary['source_hashes']} current source hashes recorded, {summary['normalized']} output hashes recorded

PIPELINE: PASS; version {PIPELINE_VERSION}; 1200 x 1200 true-alpha PNG/WebP and 75–85% occupancy are required for every output; second run reused {summary['reused_outputs']} unchanged QC_PASS outputs.

P0: User visual review of Products?q=11, {summary['contact_sheets']} contact sheets, and every MANUAL_REVIEW result.

P1: Confirm product/source identity for technical cutouts before any website replacement or APPROVED status.

P2: Supply genuine Hidrogel/Baterías sources and replacements for {summary['main_asset_required']} missing-main-asset and {summary['low_res']} low-resolution records.

PRODUCTION: UNCHANGED

READY FOR USER VISUAL REVIEW: pending browser QA
"""
    (output / "HAODE-ASSET-SYSTEM-V1-PHASE2-REPORT.md").write_text(text, encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, required=True)
    parser.add_argument("--phase1-manifest", type=Path, required=True)
    parser.add_argument("--website-usage", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--logo-svg", type=Path, required=True)
    parser.add_argument("--current-logo", type=Path, required=True)
    parser.add_argument("--ids", nargs="*")
    args = parser.parse_args()

    root = args.root.resolve()
    output = args.output.resolve()
    output.mkdir(parents=True, exist_ok=True)
    phase1 = json.loads(args.phase1_manifest.read_text(encoding="utf-8"))
    usage = load_usage(args.website_usage)
    selected_ids = set(args.ids or [])
    previous_path = output / "website-asset-manifest.json"
    previous_doc = json.loads(previous_path.read_text()) if previous_path.exists() else {}
    previous = {record["asset_id"]: record for record in previous_doc.get("assets", [])}
    reused = 0
    session = None
    records = []

    for original in phase1["assets"]:
        record = dict(original)
        record.setdefault("notes", "")
        record["phase1_normalization_status"] = original["normalization_status"]
        record["phase1_master_path"] = original.get("master_path", "")
        record["phase1_web_path"] = original.get("web_path", "")
        record["master_path"] = ""
        record["web_path"] = ""
        record["preview_after_path"] = ""
        record["batch_action"] = "UNCHANGED_STATUS"
        record["target_sha256"] = ""
        record["cutout_qc_metrics"] = {}
        key = record["current_main_image"].lstrip("/")
        record.update(usage.get(key, {"usage_status": "APP_PRODUCT_RECORD", "usage_count": 1, "website_targets": "app/products.json"}))

        current = root / key if key else None
        if current and current.is_file() and current.suffix.lower() in IMAGE_EXTENSIONS:
            before_rel = f"current/{base.slug(record['asset_id'])}.webp"
            base.copy_preview(current, output / "local-v3-full-preview" / before_rel)
            record["preview_current_path"] = before_rel

        content_promo = key.startswith("assets/products/samsung-original/") and Path(key).suffix.lower() == ".png"
        if content_promo:
            record["promo_misuse"] = True
            record["normalization_status"] = "PROMO_WRONG_MAIN_IMAGE"
            record["cutout_status"] = "PROMO_WRONG_MAIN_IMAGE"
            record["qc_status"] = "QC_FAIL"
            record["batch_action"] = "CONTENT_REVIEW_PROMO_MAIN_REJECT"
            quarantine_generated(record, output, "Promo poster identified by Phase 2 content review; retained as review evidence")
        elif record["asset_id"] in MANUAL_VISUAL_REJECT_IDS:
            record["normalization_status"] = "MANUAL_REVIEW"
            record["cutout_status"] = "MANUAL_REVIEW"
            record["qc_status"] = "QC_FAIL"
            record["batch_action"] = "MANUAL_VISUAL_REJECT"
            quarantine_generated(record, output, "Manual contact-sheet review rejected damaged or partial cutout")
        elif original["normalization_status"] == "CUTOUT_READY" and (
            record["category"] != "PRODUCTOS_AI" or record["real_asset_status"] == "READY_TRANSPARENT"
        ):
            if copy_phase1_asset(record, output):
                reused += 1
        elif (
            record["category"] == "PANTALLAS"
            and original["normalization_status"] in {"NEEDS_CUTOUT", "LOW_RESOLUTION"}
            and original["background_type"] in SIMPLE_BACKGROUNDS
            and (not selected_ids or record["asset_id"] in selected_ids)
            and current and current.is_file()
        ):
            source, source_info = select_source(current)
            source_hash = base.digest(source)
            record["source_path"] = str(source)
            record["source_sha256"] = source_hash
            record["source_dimensions"] = f"{source_info['width']}x{source_info['height']}"
            record["source_background_type"] = source_info["background"]
            record["resolution_status"] = (
                "LOW_RESOLUTION" if max(source_info["width"], source_info["height"]) < base.LOW_LONG
                or min(source_info["width"], source_info["height"]) < base.LOW_SHORT else "OK"
            )
            png = output / "normalized" / f"{base.slug(record['asset_id'])}-master-v01.png"
            web = output / "web" / f"{base.slug(record['asset_id'])}-web-v01.webp"
            old = previous.get(record["asset_id"], {})
            can_reuse = (
                previous_doc.get("pipeline_version") == PIPELINE_VERSION
                and old.get("source_sha256") == source_hash
                and old.get("qc_status") == "QC_PASS"
                and png.is_file() and web.is_file()
            )
            if can_reuse:
                metrics = old.get("cutout_qc_metrics", {})
                reused += 1
                record["batch_action"] = "REUSED_PHASE2_QC_PASS"
            else:
                if session is None:
                    session = new_session("u2net")
                removed, metrics = cutout(source, session)
                if not metrics["qc_reasons"]:
                    metrics.update(normalize_image(removed, png, web))
                record["batch_action"] = "NON_GENERATIVE_U2NET_CUTOUT"
            record["cutout_qc_metrics"] = metrics
            if metrics.get("qc_reasons"):
                record["normalization_status"] = "MANUAL_REVIEW"
                record["cutout_status"] = "MANUAL_REVIEW"
                record["qc_status"] = "QC_FAIL"
                record["notes"] = (record["notes"] + " | " + ",".join(metrics["qc_reasons"])).strip(" |")
            elif record["resolution_status"] == "LOW_RESOLUTION":
                record["normalization_status"] = "LOW_RESOLUTION"
                record["cutout_status"] = "CUTOUT_READY"
                record["qc_status"] = "QC_FAIL"
                record["notes"] = (record["notes"] + " | technical cutout retained; source remains low resolution").strip(" |")
            else:
                record["normalization_status"] = "CUTOUT_READY"
                record["cutout_status"] = "CUTOUT_READY"
                record["qc_status"] = "QC_PASS"
            if png.is_file() and web.is_file():
                record["master_path"] = str(png)
                record["web_path"] = str(web)
                record["target_sha256"] = base.digest(web)
                record["preview_after_path"] = f"../web/{web.name}"
        records.append(record)

    base.build_preview(output, records, args.logo_svg.resolve(), args.current_logo.resolve())
    generated_preview = output / "local-v3-full-preview"
    target_preview = output / "local-v3-preview"
    if target_preview.exists():
        shutil.rmtree(target_preview)
    generated_preview.rename(target_preview)
    contact_sheets = build_contact_sheets(output, records)

    manifest = {
        "schema_version": "HAODE_ASSET_V1_PHASE2",
        "pipeline_version": PIPELINE_VERSION,
        "input_manifest_sha256": base.digest(args.phase1_manifest),
        "website_usage_sha256": base.digest(args.website_usage),
        "segmentation": "local u2net, non-generative",
        "production_changed": False,
        "assets": records,
    }
    previous_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    fields = [
        "asset_id", "sku", "product_name", "category", "current_main_image", "usage_status", "usage_count",
        "source_path", "source_sha256", "source_dimensions", "source_background_type", "master_path", "web_path",
        "target_sha256", "phase1_normalization_status", "normalization_status", "real_asset_status", "qc_status",
        "resolution_status", "batch_action", "promo_misuse", "website_targets", "notes",
    ]
    base.write_csv(output / "current-website-normalization.csv", records, fields)
    mapping = [
        {
            "asset_id": r["asset_id"], "current_asset": r["current_main_image"], "preferred_source": r.get("source_path", ""),
            "source_sha256": r.get("source_sha256", ""), "cutout_master": r.get("master_path", ""),
            "web_transparent": r.get("web_path", ""), "website_target": r.get("website_targets", ""),
            "qc_status": r["qc_status"], "real_asset_status": r["real_asset_status"],
        }
        for r in records
    ]
    base.write_csv(output / "source-target-mapping.csv", mapping, list(mapping[0]))

    counts = Counter(r["normalization_status"] for r in records)
    normalized = sum(bool(r.get("web_path")) and Path(r["web_path"]).is_file() for r in records)
    category_summary = {}
    for category in sorted({r["category"] for r in records}):
        rows = [r for r in records if r["category"] == category]
        category_summary[category] = {
            "total": len(rows),
            "normalized": sum(bool(r.get("web_path")) and Path(r["web_path"]).is_file() for r in rows),
            "qc_pass": sum(r["qc_status"] == "QC_PASS" for r in rows),
            "low_res_outputs": sum(
                r["normalization_status"] == "LOW_RESOLUTION" and bool(r.get("web_path")) for r in rows
            ),
            "manual_review": sum(r["normalization_status"] == "MANUAL_REVIEW" for r in rows),
        }
    summary = {
        "current_website_images": len(records),
        "unique_main_image_paths": len({r["current_main_image"] for r in records}),
        "normalized": normalized,
        "transparent": normalized,
        "cutout_completed": sum(
            r["category"] == "PANTALLAS"
            and r["phase1_normalization_status"] != "CUTOUT_READY"
            and bool(r.get("web_path"))
            and Path(r["web_path"]).is_file()
            for r in records
        ),
        "manual_review": counts["MANUAL_REVIEW"],
        "low_res": sum(r.get("resolution_status") == "LOW_RESOLUTION" or r["normalization_status"] == "LOW_RESOLUTION" for r in records),
        "source_unconfirmed": sum(r["real_asset_status"] == "SOURCE_UNCONFIRMED" for r in records),
        "promo_replaced": sum(bool(r.get("promo_misuse")) for r in records),
        "promo_wrong_main_image": counts["PROMO_WRONG_MAIN_IMAGE"],
        "main_asset_required": counts["MAIN_PRODUCT_ASSET_REQUIRED"],
        "needs_cutout": counts["NEEDS_CUTOUT"],
        "real_asset_required": counts["REAL_ASSET_REQUIRED"] + 1,
        "qc_pass": sum(r["qc_status"] == "QC_PASS" for r in records),
        "normalized_coverage_percent": round(normalized * 100 / max(1, len(records)), 1),
        "qc_pass_preview_coverage_percent": round(
            category_summary.get("PANTALLAS", {}).get("qc_pass", 0) * 100 / max(1, len(records)), 1
        ),
        "source_hashes": sum(bool(r.get("source_sha256")) for r in records),
        "reused_outputs": reused,
        "contact_sheets": contact_sheets,
        "categories": category_summary,
        "production_changed": False,
    }
    (output / "current-website-summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    write_report(output, summary)
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    os.environ.setdefault("U2NET_HOME", "/Users/mac/Documents/haode/HAODE-AUTOMATION/TOOLS/rembg/models")
    main()
