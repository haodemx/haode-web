#!/usr/bin/env python3
"""Raise current-website main-image coverage without editing website code.

Batch 4 reuses the reviewed Phase 2 cutouts and Batch 3 approval registry.
It does not rescan historical roots, expand video matching, or write to source
media. Only an explicit visually reviewed set can pass the strict provenance,
identity, alpha, resolution, and main-image suitability gates below.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import shutil
import subprocess
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


LOW_LONG = 1000
LOW_SHORT = 600
EXPECTED_NEW_MAIN_IDS = {
    "iphone-incell-11",
    "iphone-incell-11pro",
    "iphone-incell-11promax",
    "iphone-incell-12-12pro",
    "iphone-incell-12mini",
    "iphone-incell-12promax",
    "iphone-incell-13",
    "iphone-incell-13mini",
    "iphone-incell-13pro",
    "iphone-incell-13promax",
    "iphone-incell-14",
    "iphone-incell-14plus",
    "iphone-incell-14pro",
    "iphone-incell-14promax",
    "iphone-incell-15",
    "iphone-incell-15plus",
    "iphone-incell-15pro",
    "iphone-incell-15promax",
    "iphone-incell-16",
    "iphone-incell-16plus",
    "iphone-incell-17",
    "iphone-incell-17air",
    "iphone-incell-x",
    "iphone-incell-xr",
    "iphone-incell-xs",
    "iphone-incell-xsmax",
    "iphone-oled-12-12pro",
    "samsung-incell-note-8",
    "samsung-incell-note-9",
    "samsung-incell-note-10",
    "samsung-incell-note-10-plus",
    "samsung-incell-note-20-ultra",
    "samsung-incell-s8",
    "samsung-incell-s8-plus",
    "samsung-incell-s9",
    "samsung-incell-s9-plus",
    "samsung-incell-s10",
    "samsung-incell-s10-plus",
    "samsung-incell-s20-fe",
    "samsung-incell-s20-plus",
    "samsung-incell-s20-ultra",
    "samsung-incell-s21",
    "samsung-incell-s21-ultra",
    "samsung-incell-s22-ultra",
    "samsung-incell-s24-ultra",
}


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(4 * 1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def copy_if_changed(source: Path, target: Path) -> str:
    target.parent.mkdir(parents=True, exist_ok=True)
    if target.is_file() and sha256(source) == sha256(target):
        return "REUSED"
    shutil.copy2(source, target)
    return "COPIED"


def write_if_changed(path: Path, data: bytes) -> str:
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.is_file() and path.read_bytes() == data:
        return "REUSED"
    path.write_bytes(data)
    return "WRITTEN"


def load_products(path: Path) -> list[dict]:
    text = path.read_text(encoding="utf-8")
    return json.loads(text[text.index("[") : text.rindex("]") + 1])


def normalized(value: str) -> str:
    return "".join(character.lower() for character in value if character.isalnum())


def parse_dimensions(value: str) -> tuple[int, int]:
    width, height = value.lower().split("x", 1)
    return int(width), int(height)


def source_dimensions(record: dict) -> tuple[int, int]:
    value = record.get("source_dimensions") or record.get("resolution") or "0x0"
    return parse_dimensions(value)


def resolution_ok(record: dict) -> bool:
    width, height = source_dimensions(record)
    return max(width, height) >= LOW_LONG and min(width, height) >= LOW_SHORT


def git_history(repo: Path, relative_path: str) -> list[dict]:
    result = subprocess.run(
        ["git", "log", "--all", "--format=%H%x09%ad%x09%s", "--date=short", "--", relative_path],
        cwd=repo,
        check=True,
        text=True,
        capture_output=True,
    )
    history = []
    for line in result.stdout.splitlines():
        commit, date, subject = line.split("\t", 2)
        history.append({"commit": commit, "date": date, "subject": subject})
    return history


def validate_alpha_output(path: Path) -> None:
    if not path.is_file():
        raise RuntimeError(f"Missing approved output: {path}")
    with Image.open(path) as image:
        if image.size != (1200, 1200):
            raise RuntimeError(f"Output is not 1200 x 1200: {path}")
        if "A" not in image.getbands():
            raise RuntimeError(f"Output has no alpha channel: {path}")
        if image.getchannel("A").getextrema() != (0, 255):
            raise RuntimeError(f"Output does not contain true transparency: {path}")


def write_csv(path: Path, rows: list[dict], fields: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def build_new_main_entries(
    repo: Path,
    products: list[dict],
    app_by_id: dict[str, dict],
    master_by_id: dict[str, dict],
    phase2_records: list[dict],
) -> list[dict]:
    product_by_id = {item["id"]: item for item in products}
    phase2_by_id = {item["asset_id"]: item for item in phase2_records}
    primary_parents: dict[str, set[str]] = defaultdict(set)
    for product in products:
        if product.get("images"):
            primary_parents[str(Path(product["images"][0]).parent)].add(product["id"])
    source_sha_identities: dict[str, set[str]] = defaultdict(set)
    for record in phase2_records:
        if record.get("source_sha256"):
            source_sha_identities[record["source_sha256"]].add(record["asset_id"])

    entries = []
    for sku in sorted(EXPECTED_NEW_MAIN_IDS):
        product = product_by_id[sku]
        app = app_by_id.get(sku, {})
        master = master_by_id.get(sku, {})
        record = phase2_by_id.get(sku, {})
        current_path = product["images"][0]
        current_source = (repo / current_path).resolve()
        source = Path(record.get("source_path") or "").resolve()
        master_output = Path(record.get("master_path") or "")
        web_output = Path(record.get("web_path") or "")
        master_model = normalized(master.get("modelo", ""))
        exact_primary_source = source == current_source
        unique_product_directory = (
            source.parent == current_source.parent
            and primary_parents[str(Path(current_path).parent)] == {sku}
        )
        checks = {
            "category": record.get("category") == "PANTALLAS",
            "phase2_qc": record.get("qc_status") == "QC_PASS",
            "resolution": resolution_ok(record),
            "not_promo": not record.get("promo_misuse"),
            "not_scene": not record.get("scene_misuse"),
            "website_app_primary": app.get("id") == sku and app.get("imagen", "").lstrip("/") == current_path,
            "master_primary": master.get("id") == sku and master.get("imagen_path", "").lstrip("/") == current_path,
            "model": normalized(product.get("model", "")) in master_model,
            "quality": normalized(product.get("quality", "")) in master_model,
            "catalog_presence": master.get("website_present") == "yes" and master.get("app_present") == "yes",
            "price_binding": bool(product.get("sourceRows")) and "Lista_de_Precios" in master.get("source", ""),
            "source_exists": source.is_file(),
            "source_binding": exact_primary_source or unique_product_directory,
            "unique_sha": source_sha_identities[record.get("source_sha256", "")] == {sku},
            "outputs": master_output.is_file() and web_output.is_file(),
        }
        failed = [name for name, passed in checks.items() if not passed]
        if failed:
            raise RuntimeError(f"Batch 4 gate failed for {sku}: {', '.join(failed)}")
        source_relative = str(source.relative_to(repo))
        source_history = git_history(repo, source_relative)
        primary_history = git_history(repo, current_path)
        if not source_history or not primary_history:
            raise RuntimeError(f"Missing Git provenance for {sku}")
        validate_alpha_output(master_output)
        validate_alpha_output(web_output)
        width, height = source_dimensions(record)
        entries.append(
            {
                "asset_id": f"product:{sku}:main:{record['source_sha256'][:12]}",
                "asset_type": "PRODUCT_CUTOUT",
                "media_role": "MAIN_IMAGE",
                "sku": sku,
                "sku_type": "canonical_website_product_id",
                "model": product["model"],
                "quality": product["quality"],
                "category": product["category"],
                "website_primary_path": current_path,
                "source_path": str(source),
                "source_sha256": record["source_sha256"],
                "source_dimensions": [width, height],
                "master_path": str(master_output),
                "master_sha256": sha256(master_output),
                "web_path": str(web_output),
                "web_sha256": sha256(web_output),
                "provenance_status": "CONFIRMED",
                "provenance_method": (
                    "CONFIRMED_BY_EXACT_PRIMARY_PROVENANCE"
                    if exact_primary_source
                    else "CONFIRMED_BY_UNIQUE_PRODUCT_DIRECTORY_PROVENANCE"
                ),
                "provenance_evidence": [
                    "Exact current product id/model/quality binding across website, App, master CSV, and price-list row",
                    (
                        "Source is the exact current primary asset"
                        if exact_primary_source
                        else "Source is a complete real-product view inside the one unique current-product media directory"
                    ),
                    f"Git history: source {len(source_history)} commit(s); primary binding {len(primary_history)} commit(s)",
                    "Source SHA maps to only this current product identity",
                    "Batch 4 visual review accepted the complete product view as main-image suitable",
                ],
                "git_history": source_history,
                "qc_status": "PASS",
                "approved_for_web": True,
            }
        )
    if {entry["sku"] for entry in entries} != EXPECTED_NEW_MAIN_IDS:
        raise RuntimeError("Batch 4 approved-main set changed")
    return entries


def classify_main_gaps(
    products: list[dict],
    main_ready: set[str],
    phase2_by_id: dict[str, dict],
    baseline_by_path: dict[str, dict],
) -> list[dict]:
    rows = []
    for product in products:
        if product["id"] in main_ready:
            continue
        phase = phase2_by_id.get(product["id"], {})
        primary_path = product.get("images", [""])[0] if product.get("images") else ""
        baseline = baseline_by_path.get(primary_path, {})
        category = product.get("category", "")
        if product["id"] == "x200t-cortadora-micas" or category in {"gafas-ai", "camaras-inteligentes"}:
            status = "MANUAL_REVIEW_MAIN"
            reason = "Protected white/glass/electronic product image; automatic approval is forbidden"
        elif Path(primary_path).name == "placeholder.svg":
            status = "MAIN_ASSET_REQUIRED"
            reason = "Current product uses a placeholder and has no exact confirmed real main image"
        elif category in {"fundas", "micas"}:
            status = "MAIN_ASSET_REQUIRED"
            reason = "No exact confirmed product-main source for the required product variant"
        elif (
            phase.get("resolution_status") == "LOW_RESOLUTION"
            or phase.get("normalization_status") == "LOW_RESOLUTION"
            or baseline.get("resolution_status") == "LOW_RESOLUTION"
        ):
            status = "LOW_RES_MAIN"
            reason = "Current main source remains below the real-detail resolution gate"
        elif not baseline and not phase:
            status = "MAIN_ASSET_REQUIRED"
            reason = "Current product has no audited real main-image source"
        elif phase.get("promo_misuse") or phase.get("scene_misuse"):
            status = "MAIN_ASSET_REQUIRED"
            reason = "Current primary is promo/scene media and no approved real product main was found"
        else:
            status = "MANUAL_REVIEW_MAIN"
            reason = "Identity conflict, shared model media, incomplete view, or cutout QC prevents automatic approval"
        rows.append(
            {
                "sku": product["id"],
                "model": product.get("model", ""),
                "quality": product.get("quality", ""),
                "category": category,
                "current_primary_path": primary_path,
                "status": status,
                "reason": reason,
            }
        )
    return rows


def make_contact_sheet(entries: list[dict], output: Path) -> None:
    columns, card_width, card_height = 5, 300, 330
    rows = (len(entries) + columns - 1) // columns
    canvas = Image.new("RGB", (columns * card_width, 64 + rows * card_height), "#11161c")
    draw = ImageDraw.Draw(canvas)
    font = ImageFont.load_default()
    draw.text((24, 22), "HAODE BATCH 4 — NEW APPROVED MAIN IMAGES", fill="#ff5a00", font=font)
    for index, entry in enumerate(entries):
        x = (index % columns) * card_width
        y = 64 + (index // columns) * card_height
        board = Image.new("RGB", (270, 250), "#eef1f3")
        with Image.open(entry["drop_web_path"]) as source:
            source = source.convert("RGBA")
            source.thumbnail((245, 225), Image.Resampling.LANCZOS)
            board.paste(source, ((270 - source.width) // 2, (250 - source.height) // 2), source)
        canvas.paste(board, (x + 15, y + 8))
        draw.text((x + 15, y + 270), entry["sku"][:44], fill="white", font=font)
        draw.text((x + 15, y + 292), "CONFIRMED / QC PASS / MAIN", fill="#80d890", font=font)
    output.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(output, quality=90)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo", type=Path, required=True)
    parser.add_argument("--batch1", type=Path, required=True)
    parser.add_argument("--phase2", type=Path, required=True)
    parser.add_argument("--batch3", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    repo = args.repo.resolve()
    output = args.output.resolve()
    output.mkdir(parents=True, exist_ok=True)
    drop = output / "WEBSITE-ASSET-DROP"
    products = load_products(repo / "data/products.generated.js")
    app_by_id = {item["id"]: item for item in json.loads((repo / "app/products.json").read_text())}
    with (repo / "docs/master-data/products-master.csv").open(encoding="utf-8-sig", newline="") as handle:
        master_by_id = {item["id"]: item for item in csv.DictReader(handle)}
    baseline = json.loads((args.batch1 / "asset-manifest.json").read_text())
    baseline_by_path = {item["path"]: item for item in baseline["assets"]}
    phase2 = json.loads((args.phase2 / "website-asset-manifest.json").read_text())
    phase2_records = phase2["assets"]
    phase2_by_id = {item["asset_id"]: item for item in phase2_records}
    previous_manifest = json.loads((args.batch3 / "WEBSITE-ASSET-DROP/product-media-manifest.json").read_text())
    previous_registry = json.loads((args.batch3 / "WEBSITE-ASSET-DROP/confirmed-assets.json").read_text())

    previous_images = previous_manifest["approved_product_images"]
    previous_main_skus = {item["sku"] for item in previous_images if item["media_role"] == "MAIN_IMAGE"}
    if len(previous_main_skus) != 23:
        raise RuntimeError(f"Expected 23 Batch 3 main-image products, got {len(previous_main_skus)}")
    new_mains = build_new_main_entries(repo, products, app_by_id, master_by_id, phase2_records)

    actions = Counter()
    carried_images = []
    for entry in previous_images:
        target_dir = drop / "images" / entry["sku"]
        if entry["media_role"] == "MAIN_IMAGE":
            master_name, web_name = "main-master-v01.png", "main-web-v01.webp"
        else:
            master_name = Path(entry["drop_master_path"]).name
            web_name = Path(entry["drop_web_path"]).name
        master_target = target_dir / master_name
        web_target = target_dir / web_name
        actions[copy_if_changed(Path(entry["drop_master_path"]), master_target)] += 1
        actions[copy_if_changed(Path(entry["drop_web_path"]), web_target)] += 1
        carried_images.append({**entry, "drop_master_path": str(master_target), "drop_web_path": str(web_target)})

    for entry in new_mains:
        target_dir = drop / "images" / entry["sku"]
        master_target = target_dir / "main-master-v01.png"
        web_target = target_dir / "main-web-v01.webp"
        actions[copy_if_changed(Path(entry["master_path"]), master_target)] += 1
        actions[copy_if_changed(Path(entry["web_path"]), web_target)] += 1
        entry["drop_master_path"] = str(master_target)
        entry["drop_web_path"] = str(web_target)

    approved_images = sorted(
        [*carried_images, *new_mains],
        key=lambda item: (item["sku"], item["media_role"] != "MAIN_IMAGE", item["asset_id"]),
    )
    main_ready = {item["sku"] for item in approved_images if item["media_role"] == "MAIN_IMAGE"}
    approved_products = {item["sku"] for item in approved_images}
    if len(main_ready) != 68 or len(approved_products) != 72:
        raise RuntimeError("Batch 4 coverage invariant changed")

    carried_videos = previous_manifest["approved_test_videos"]
    for video in carried_videos:
        for path_field, hash_field in (
            ("source_path", "source_sha256"),
            ("web_path", "web_sha256"),
            ("poster_path", "poster_sha256"),
        ):
            path = Path(video[path_field])
            if not path.is_file() or sha256(path) != video[hash_field]:
                raise RuntimeError(f"Batch 3 video maintenance failed: {path}")

    registry = {
        "schema_version": "HAODE_CONFIRMED_ASSETS_V1",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source_registries": [str(args.batch3 / "WEBSITE-ASSET-DROP/confirmed-assets.json")],
        "consumption_gate": {"provenance_status": "CONFIRMED", "qc_status": "PASS", "approved_for_web": True},
        "assets": [*previous_registry["assets"], *new_mains],
    }
    product_manifest = {
        "schema_version": "HAODE_PRODUCT_MEDIA_DROP_V1",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "current_website_products": len(products),
        "consumption_gate": {"provenance_status": "CONFIRMED", "qc_status": "PASS", "approved_for_web": True},
        "approved_product_images": approved_images,
        "approved_test_videos": carried_videos,
        "protected_states": previous_manifest["protected_states"],
        "website_code_modified": False,
        "production": "UNCHANGED",
    }
    write_if_changed(output / "confirmed-assets.json", (json.dumps(registry, ensure_ascii=False, indent=2) + "\n").encode())
    write_if_changed(drop / "confirmed-assets.json", (json.dumps(registry, ensure_ascii=False, indent=2) + "\n").encode())
    write_if_changed(drop / "product-media-manifest.json", (json.dumps(product_manifest, ensure_ascii=False, indent=2) + "\n").encode())

    gaps = classify_main_gaps(products, main_ready, phase2_by_id, baseline_by_path)
    gap_counts = Counter(item["status"] for item in gaps)
    write_csv(
        output / "main-image-gaps.csv",
        gaps,
        ["sku", "model", "quality", "category", "current_primary_path", "status", "reason"],
    )
    new_fields = [
        "asset_id", "sku", "model", "quality", "category", "website_primary_path", "source_path",
        "source_sha256", "source_dimensions", "master_path", "master_sha256", "web_path", "web_sha256",
        "provenance_status", "provenance_method", "qc_status", "approved_for_web", "drop_master_path", "drop_web_path",
    ]
    write_csv(output / "new-main-images.csv", new_mains, new_fields)
    with (output / "user-review-required.csv").open("w", encoding="utf-8-sig", newline="") as handle:
        csv.writer(handle).writerow(["asset_id", "reason"])

    prior_primary_low = {
        product["id"]
        for product in products
        if baseline_by_path.get(product.get("images", [""])[0], {}).get("resolution_status") == "LOW_RESOLUTION"
    }
    recovered_low_main = len(EXPECTED_NEW_MAIN_IDS & prior_primary_low)
    summary = {
        "current_website_products": len(products),
        "main_image_ready_before": len(previous_main_skus),
        "main_image_ready_after": len(main_ready),
        "main_image_coverage": round(len(main_ready) / len(products) * 100, 1),
        "approved_products": len(approved_products),
        "new_main_images": len(new_mains),
        "new_detail_images": 0,
        "detail_only_products_remaining": len(approved_products - main_ready),
        "pantallas": len(main_ready),
        "fundas": "REAL_ASSET_REQUIRED",
        "hidrogel": "TEXT_ONLY / SOURCE_UNCONFIRMED",
        "baterias": "REAL_ASSET_REQUIRED / NOT PUBLISHED",
        "productos_ai": "IMAGE MANUAL_REVIEW",
        "x200t": "IMAGE MANUAL_REVIEW",
        "low_res_main_recovered": recovered_low_main,
        "low_res_main_remaining": gap_counts["LOW_RES_MAIN"],
        "main_asset_required": gap_counts["MAIN_ASSET_REQUIRED"],
        "manual_review_main": gap_counts["MANUAL_REVIEW_MAIN"],
        "videos": f"MAINTAINED / PASS — {len(carried_videos)} unique strict matches",
        "user_review_required": 0,
        "website_asset_drop": str(drop),
        "copy_actions": dict(actions),
        "website_code_modified": False,
        "production": "UNCHANGED",
    }
    write_if_changed(output / "batch4-summary.json", (json.dumps(summary, ensure_ascii=False, indent=2) + "\n").encode())
    report = f"""# HAODE ASSET FACTORY — BATCH 4

CURRENT WEBSITE PRODUCTS: {summary['current_website_products']}

MAIN IMAGE READY BEFORE: {summary['main_image_ready_before']}

MAIN IMAGE READY AFTER: {summary['main_image_ready_after']}

MAIN IMAGE COVERAGE: {summary['main_image_ready_after']}/{summary['current_website_products']} ({summary['main_image_coverage']}%)

APPROVED PRODUCTS: {summary['approved_products']}

NEW MAIN IMAGES: {summary['new_main_images']}
NEW DETAIL IMAGES: {summary['new_detail_images']}
DETAIL-ONLY PRODUCTS REMAINING: {summary['detail_only_products_remaining']}

PANTALLAS: {summary['pantallas']} MAIN IMAGE READY
FUNDAS: {summary['fundas']}
HIDROGEL: {summary['hidrogel']}
BATERIAS: {summary['baterias']}
PRODUCTOS AI: {summary['productos_ai']}
X200T: {summary['x200t']}

LOW RES MAIN RECOVERED: {summary['low_res_main_recovered']}
LOW RES MAIN REMAINING: {summary['low_res_main_remaining']}

MAIN ASSET REQUIRED: {summary['main_asset_required']}
MANUAL REVIEW MAIN: {summary['manual_review_main']}

VIDEOS: {summary['videos']}

USER REVIEW REQUIRED: {summary['user_review_required']}

WEBSITE ASSET DROP: {summary['website_asset_drop']}

WEBSITE CODE MODIFIED: NO

PRODUCTION: UNCHANGED
"""
    write_if_changed(output / "HAODE-ASSET-FACTORY-BATCH-4.md", report.encode())
    make_contact_sheet(new_mains, output / "BATCH-4-NEW-MAIN-CONTACT-SHEET.jpg")
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
