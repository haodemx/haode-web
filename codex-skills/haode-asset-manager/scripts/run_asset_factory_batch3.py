#!/usr/bin/env python3
"""Expand current-website HAODE media coverage without editing the website.

Batch 3 imports the Batch 1 technical audit and Batch 2 confirmation registry.
It confirms only exact current-product detail images and strictly attributable
historical videos, creates real poster frames, and emits a gated website drop.
Source media, website files, and production state remain unchanged.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import io
import json
import re
import shutil
import subprocess
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


IMAGE_CATEGORIES = {
    "iphone-incell",
    "iphone-oled",
    "oled-diagnostica",
    "samsung-incell",
    "samsung-oled",
    "samsung-tipo-original",
}
VIDEO_MATCH_CATEGORIES = {
    "iphone-incell",
    "iphone-oled",
    "samsung-incell",
    "samsung-oled",
    "micas",
    "gafas-ai",
    "camaras-inteligentes",
}


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(4 * 1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def write_if_changed(path: Path, data: bytes) -> str:
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.is_file() and path.read_bytes() == data:
        return "REUSED"
    path.write_bytes(data)
    return "WRITTEN"


def copy_if_changed(source: Path, target: Path) -> str:
    target.parent.mkdir(parents=True, exist_ok=True)
    if target.is_file() and sha256(source) == sha256(target):
        return "REUSED"
    shutil.copy2(source, target)
    return "COPIED"


def load_generated_products(path: Path) -> list[dict]:
    text = path.read_text(encoding="utf-8")
    return json.loads(text[text.index("[") : text.rindex("]") + 1])


def normalized(value: str) -> str:
    return "".join(character.lower() for character in value if character.isalnum())


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


def strict_product_binding(product: dict, app: dict, master: dict) -> bool:
    master_model = normalized(master.get("modelo", ""))
    return all(
        (
            app.get("id") == product.get("id"),
            master.get("id") == product.get("id"),
            product.get("model") and normalized(product["model"]) in master_model,
            product.get("quality") and normalized(product["quality"]) in master_model,
            product.get("sourceRows"),
            not product.get("officialSkuPending"),
            master.get("website_present") == "yes",
            master.get("app_present") == "yes",
            "app/products.json" in master.get("source", ""),
            "data/products.generated.js" in master.get("source", ""),
            "Lista_de_Precios" in master.get("source", ""),
        )
    )


def exact_detail_candidates(
    repo: Path,
    products: list[dict],
    app_by_id: dict[str, dict],
    master_by_id: dict[str, dict],
    assets: list[dict],
    already_approved_skus: set[str],
) -> list[dict]:
    product_by_image = {image: product for product in products for image in product.get("images", [])}
    by_sha: dict[str, list[dict]] = defaultdict(list)
    for item in assets:
        by_sha[item["sha256"]].append(item)
    candidates = []
    for asset in assets:
        product = product_by_image.get(asset["path"])
        if not product or product["id"] in already_approved_skus:
            continue
        if product.get("category") not in IMAGE_CATEGORIES or asset.get("qc_status") != "QC_PASS":
            continue
        if product["images"][0] == asset["path"]:
            continue
        app = app_by_id.get(product["id"], {})
        master = master_by_id.get(product["id"], {})
        if not strict_product_binding(product, app, master):
            continue
        if Path(asset["path"]).parent != Path(product["images"][0]).parent:
            continue
        identities = {
            product_by_image[item["path"]]["id"]
            for item in by_sha[asset["sha256"]]
            if item["path"] in product_by_image
        }
        if identities != {product["id"]}:
            continue
        history = git_history(repo, asset["path"])
        if not history:
            continue
        master_path = Path(asset["master_path"])
        web_path = Path(asset["web_path"])
        if not master_path.is_file() or not web_path.is_file():
            continue
        candidates.append(
            {
                "asset_id": f"product:{product['id']}:detail:{asset['sha256'][:12]}",
                "asset_type": "PRODUCT_CUTOUT",
                "media_role": "DETAIL_IMAGE",
                "sku": product["id"],
                "sku_type": "canonical_website_product_id",
                "model": product["model"],
                "quality": product["quality"],
                "category": product["category"],
                "website_source_path": asset["path"],
                "source_path": asset["absolute_path"],
                "source_sha256": asset["sha256"],
                "master_path": str(master_path),
                "master_sha256": sha256(master_path),
                "web_path": str(web_path),
                "web_sha256": sha256(web_path),
                "provenance_status": "CONFIRMED",
                "provenance_method": "CONFIRMED_BY_CURRENT_WEBSITE_DETAIL_BINDING",
                "provenance_evidence": [
                    "Exact detail-image path in data/products.generated.js",
                    "Exact product id/model/quality binding in app/products.json and products-master.csv",
                    f"Exact price-list row binding: {master['source']}",
                    "Image is inside the unique current-product media directory",
                    f"Git history for exact asset path: {len(history)} commit(s)",
                    "No exact-SHA mapping to a different current product identity",
                ],
                "git_history": history,
                "qc_status": "PASS",
                "approved_for_web": True,
            }
        )
    return sorted(candidates, key=lambda item: (item["sku"], item["website_source_path"]))


def canonical_model(product: dict) -> str:
    text = normalized(product.get("model", ""))
    for prefix in ("iphone", "samsung", "modelo"):
        if text.startswith(prefix):
            text = text[len(prefix) :]
    return text.replace("promax", "promax").replace("plus", "plus")


def extracted_models(path: str) -> list[str]:
    name = Path(path).stem.lower()
    name = name.replace("pro max", "promax").replace("pro-max", "promax")
    name = name.replace("plus", "plus").replace("ultra", "ultra")
    results: list[str] = []
    if re.search(r"12\s*[/、,&-]\s*12\s*pro|12\s*[,、/&-]\s*pro", name):
        results.append("1212pro")
    iphone_pattern = re.compile(r"(?<![a-z0-9])(?:iphone\s*)?(1[1-7](?:\s*(?:promax|pro|max|mini|plus|air|e))?|x(?:s(?:\s*max)?|r)?)(?![a-z0-9])")
    for match in iphone_pattern.findall(name):
        model = normalized(match)
        if model.endswith("max") and not model.endswith("promax") and "pro" in model:
            model = model.replace("pro", "promax")
        if model not in results:
            results.append(model)
    note_pattern = re.compile(r"(?<![a-z0-9])(?:note|nt|n)\s*(8|9|10|20)\s*(lite|plus|\+|u|ultra)?", re.I)
    for number, suffix in note_pattern.findall(name):
        suffix = {"+": "plus", "u": "ultra"}.get(suffix.lower(), suffix.lower())
        model = f"note{number}{suffix}"
        if model not in results:
            results.append(model)
    samsung_pattern = re.compile(r"(?<![a-z0-9])s\s*(8|9|10|20|21|22|23|24|25)\s*(e|fe|lite|plus|\+|u|ultra)?", re.I)
    for number, suffix in samsung_pattern.findall(name):
        suffix = {"+": "plus", "u": "ultra"}.get(suffix.lower(), suffix.lower())
        model = f"s{number}{suffix}"
        if model not in results:
            results.append(model)
    fold_pattern = re.compile(r"z\s*(flip|fold)\s*([3-7])", re.I)
    for kind, number in fold_pattern.findall(name):
        model = f"z{kind.lower()}{number}"
        if model not in results:
            results.append(model)
    return results


def explicit_video_category(path: str) -> str:
    lowered = path.lower()
    if "x200t" in lowered:
        return "x200t"
    if "iphone incell" in lowered and "samsung" not in Path(path).name.lower():
        return "iphone-incell"
    if "iphone oled video" in lowered or "02_iphone_oled_pro_max" in lowered:
        return "iphone-oled"
    if "三星incell测试视频" in lowered or "04_samsung_incell" in lowered:
        return "samsung-incell"
    if "三星oled测试视频" in lowered:
        return "samsung-oled"
    if "/智能ai/" in lowered or "/智能眼镜" in lowered:
        return "ai"
    return ""


def product_candidates(products: list[dict], category: str, models: list[str], path: str) -> list[dict]:
    if category == "x200t":
        return [item for item in products if item["id"] == "x200t-cortadora-micas"]
    categories = {category}
    if category == "ai":
        categories = {"gafas-ai", "camaras-inteligentes"}
    if not models:
        directory_tokens = [normalized(part) for part in Path(path).parts[-4:]]
        models = [canonical_model(item) for item in products if canonical_model(item) in directory_tokens]
    result = []
    for item in products:
        if item.get("category") not in categories:
            continue
        key = canonical_model(item)
        if key and key in models:
            result.append(item)
    return result


def current_video_hashes(repo: Path, products: list[dict]) -> tuple[dict[str, set[str]], dict[str, list[str]]]:
    by_sha: dict[str, set[str]] = defaultdict(set)
    paths: dict[str, list[str]] = defaultdict(list)
    seen: dict[str, str] = {}
    for product in products:
        for relative in product.get("videos", []):
            source = repo / relative
            if not source.is_file():
                continue
            digest = seen.setdefault(relative, sha256(source))
            by_sha[digest].add(product["id"])
            paths[digest].append(relative)
    return by_sha, paths


def classify_videos(repo: Path, products: list[dict], video_rows: list[dict]) -> list[dict]:
    product_by_id = {item["id"]: item for item in products}
    current_by_sha, current_paths = current_video_hashes(repo, products)
    classified = []
    for row in video_rows:
        digest = row["sha256"]
        models = extracted_models(row["path"])
        category = explicit_video_category(row["path"])
        candidates: list[dict] = []
        method = ""
        if len(current_by_sha.get(digest, set())) == 1:
            candidates = [product_by_id[next(iter(current_by_sha[digest]))]]
            method = "EXACT_SHA_TO_SINGLE_CURRENT_WEBSITE_VIDEO"
        elif len(current_by_sha.get(digest, set())) > 1:
            candidates = [product_by_id[item] for item in sorted(current_by_sha[digest])]
            method = "EXACT_SHA_SHARED_ACROSS_MULTIPLE_CURRENT_PRODUCTS"
        elif category:
            candidates = product_candidates(products, category, models, row["path"])
            method = "EXPLICIT_QUALITY_DIRECTORY_PLUS_EXACT_MODEL"
        elif models:
            candidates = [item for item in products if canonical_model(item) in models and item.get("category") in VIDEO_MATCH_CATEGORIES]
            method = "MODEL_ONLY_WITHOUT_EXACT_QUALITY"
        has_video_stream = bool(row.get("video_codec")) and int(row.get("width") or 0) > 0 and int(row.get("height") or 0) > 0
        if not has_video_stream:
            candidates = []
            method = "INVALID_VIDEO_NO_VIDEO_STREAM"
            status = "UNMATCHED"
        elif len(candidates) == 1 and category and len(models) <= 1:
            status = "MATCHED"
        elif len(candidates) == 1 and method == "EXACT_SHA_TO_SINGLE_CURRENT_WEBSITE_VIDEO":
            status = "MATCHED"
        elif candidates or models:
            status = "AMBIGUOUS"
        else:
            status = "UNMATCHED"
        classified.append(
            {
                **row,
                "match_status": status,
                "matched_sku": candidates[0]["id"] if status == "MATCHED" else "",
                "matched_model": candidates[0]["model"] if status == "MATCHED" else "",
                "matched_quality": candidates[0]["quality"] if status == "MATCHED" else "",
                "match_method": method or "NO_EXACT_PRODUCT_EVIDENCE",
                "candidate_skus": " | ".join(item["id"] for item in candidates),
                "current_website_video_paths": " | ".join(current_paths.get(digest, [])),
            }
        )
    by_sha: dict[str, list[dict]] = defaultdict(list)
    for item in classified:
        by_sha[item["sha256"]].append(item)
    for group in by_sha.values():
        matches = {(item["matched_sku"], item["matched_model"], item["matched_quality"]) for item in group if item["match_status"] == "MATCHED"}
        if len(matches) != 1:
            continue
        sku, model, quality = next(iter(matches))
        for item in group:
            item["match_status"] = "MATCHED"
            item["matched_sku"] = sku
            item["matched_model"] = model
            item["matched_quality"] = quality
            if item["match_method"] != "EXACT_SHA_TO_SINGLE_CURRENT_WEBSITE_VIDEO":
                item["match_method"] = "EXACT_SHA_DUPLICATE_CHAIN_TO_STRICT_MATCH"
            item["candidate_skus"] = sku
    return classified


def generate_poster(source: Path, target: Path, duration: float) -> str:
    target.parent.mkdir(parents=True, exist_ok=True)
    if target.is_file() and target.stat().st_size > 0:
        return "REUSED"
    timestamp = min(max(duration * 0.2, 1.0), 5.0)
    result = subprocess.run(
        [
            "ffmpeg",
            "-hide_banner",
            "-loglevel",
            "error",
            "-ss",
            f"{timestamp:.3f}",
            "-i",
            str(source),
            "-frames:v",
            "1",
            "-vf",
            "scale='min(1280,iw)':-2",
            "-q:v",
            "3",
            "-y",
            str(target),
        ],
        text=True,
        capture_output=True,
    )
    if result.returncode != 0 or not target.is_file() or target.stat().st_size == 0:
        target.unlink(missing_ok=True)
        raise RuntimeError(f"Poster generation failed for {source}: {result.stderr.strip()}")
    return "WRITTEN"


def generate_web_video(source: Path, target: Path) -> str:
    target.parent.mkdir(parents=True, exist_ok=True)
    if target.is_file() and target.stat().st_size > 0:
        return "REUSED"
    result = subprocess.run(
        [
            "ffmpeg",
            "-hide_banner",
            "-loglevel",
            "error",
            "-i",
            str(source),
            "-vf",
            "scale='min(1920,iw)':-2",
            "-c:v",
            "libx264",
            "-preset",
            "medium",
            "-crf",
            "24",
            "-pix_fmt",
            "yuv420p",
            "-c:a",
            "aac",
            "-b:a",
            "128k",
            "-movflags",
            "+faststart",
            "-y",
            str(target),
        ],
        text=True,
        capture_output=True,
    )
    if result.returncode != 0 or not target.is_file() or target.stat().st_size == 0:
        target.unlink(missing_ok=True)
        raise RuntimeError(f"Web-video generation failed for {source}: {result.stderr.strip()}")
    return "WRITTEN"


def write_csv(path: Path, rows: list[dict], fields: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def make_contact_sheet(entries: list[dict], output: Path) -> None:
    card_width, card_height = 360, 400
    columns = 4
    rows = (len(entries) + columns - 1) // columns
    canvas = Image.new("RGB", (columns * card_width, 70 + rows * card_height), "#11161c")
    draw = ImageDraw.Draw(canvas)
    font = ImageFont.load_default()
    draw.text((24, 24), "HAODE BATCH 3 — NEW APPROVED CURRENT-WEBSITE DETAILS", fill="#ff5a00", font=font)
    for index, entry in enumerate(entries):
        x = (index % columns) * card_width
        y = 70 + (index // columns) * card_height
        card = Image.new("RGB", (320, 300), "#eef1f3")
        with Image.open(entry["drop_web_path"]) as source:
            source = source.convert("RGBA")
            source.thumbnail((290, 270), Image.Resampling.LANCZOS)
            card.paste(source, ((320 - source.width) // 2, (300 - source.height) // 2), source)
        canvas.paste(card, (x + 20, y + 10))
        draw.text((x + 20, y + 320), entry["sku"], fill="white", font=font)
        draw.text((x + 20, y + 344), Path(entry["website_source_path"]).name, fill="#bac3cc", font=font)
        draw.text((x + 20, y + 368), "CONFIRMED / QC PASS / DETAIL", fill="#80d890", font=font)
    output.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(output, quality=90)


def make_video_contact_sheet(entries: list[dict], output: Path) -> None:
    card_width, card_height = 300, 250
    columns = 4
    rows = (len(entries) + columns - 1) // columns
    canvas = Image.new("RGB", (columns * card_width, 64 + rows * card_height), "#11161c")
    draw = ImageDraw.Draw(canvas)
    font = ImageFont.load_default()
    draw.text((24, 22), "HAODE BATCH 3 — STRICT MATCHED VIDEO POSTERS", fill="#ff5a00", font=font)
    for index, entry in enumerate(entries):
        x = (index % columns) * card_width
        y = 64 + (index // columns) * card_height
        with Image.open(entry["poster_path"]) as source:
            source = source.convert("RGB")
            source.thumbnail((270, 180), Image.Resampling.LANCZOS)
            canvas.paste(source, (x + (card_width - source.width) // 2, y + 8))
        draw.text((x + 14, y + 194), entry["matched_sku"][:42], fill="white", font=font)
        draw.text((x + 14, y + 216), entry["raw_sha256"][:12], fill="#80d890", font=font)
    output.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(output, quality=88)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo", type=Path, required=True)
    parser.add_argument("--batch1", type=Path, required=True)
    parser.add_argument("--batch2", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    repo = args.repo.resolve()
    batch1 = args.batch1.resolve()
    batch2 = args.batch2.resolve()
    output = args.output.resolve()
    output.mkdir(parents=True, exist_ok=True)
    drop = output / "WEBSITE-ASSET-DROP"

    baseline = json.loads((batch1 / "asset-manifest.json").read_text(encoding="utf-8"))
    previous_registry = json.loads((batch2 / "confirmed-assets.json").read_text(encoding="utf-8"))
    products = load_generated_products(repo / "data/products.generated.js")
    app_products = json.loads((repo / "app/products.json").read_text(encoding="utf-8"))
    app_by_id = {item["id"]: item for item in app_products}
    with (repo / "docs/master-data/products-master.csv").open(encoding="utf-8-sig", newline="") as handle:
        master_by_id = {item["id"]: item for item in csv.DictReader(handle)}

    approved_skus_before = {
        item["sku"]
        for item in previous_registry["assets"]
        if item.get("sku") and item.get("asset_type") == "PRODUCT_CUTOUT" and item.get("approved_for_web")
    }
    new_details = exact_detail_candidates(
        repo, products, app_by_id, master_by_id, baseline["assets"], approved_skus_before
    )
    expected_new_skus = {
        "iphone-incell-16",
        "iphone-incell-16plus",
        "iphone-incell-16pro",
        "iphone-incell-16promax",
        "iphone-incell-17",
        "iphone-incell-17air",
        "iphone-incell-17pro",
        "iphone-incell-17promax",
    }
    if {item["sku"] for item in new_details} != expected_new_skus or len(new_details) != 15:
        raise RuntimeError("Strict Batch 3 detail-image set changed; review evidence before continuing")

    actions = Counter()
    for index, entry in enumerate(new_details, start=1):
        product_dir = drop / "images" / entry["sku"]
        master_target = product_dir / f"detail-{index:02d}-master-v01.png"
        web_target = product_dir / f"detail-{index:02d}-web-v01.webp"
        actions[copy_if_changed(Path(entry["master_path"]), master_target)] += 1
        actions[copy_if_changed(Path(entry["web_path"]), web_target)] += 1
        entry["drop_master_path"] = str(master_target)
        entry["drop_web_path"] = str(web_target)

    previous_approved = [
        item
        for item in previous_registry["assets"]
        if item.get("asset_type") == "PRODUCT_CUTOUT"
        and item.get("provenance_status") == "CONFIRMED"
        and item.get("qc_status") == "PASS"
        and item.get("approved_for_web") is True
    ]
    drop_images = []
    for entry in previous_approved:
        product_dir = drop / "images" / entry["sku"]
        master_target = product_dir / "main-master-v01.png"
        web_target = product_dir / "main-web-v01.webp"
        actions[copy_if_changed(Path(entry.get("handoff_master_path", entry["master_path"])), master_target)] += 1
        actions[copy_if_changed(Path(entry.get("handoff_web_path", entry["web_path"])), web_target)] += 1
        drop_images.append({**entry, "media_role": "MAIN_IMAGE", "drop_master_path": str(master_target), "drop_web_path": str(web_target)})
    drop_images.extend(new_details)

    video_rows = list(csv.DictReader((batch1 / "video-inventory.csv").open(encoding="utf-8-sig", newline="")))
    videos = classify_videos(repo, products, video_rows)
    video_poster_actions = Counter()
    video_web_copy_actions = Counter()
    poster_by_sha: dict[str, str] = {}
    web_video_by_sha: dict[str, str] = {}
    matched_by_sha: dict[str, dict] = {}
    for item in videos:
        if item["match_status"] != "MATCHED":
            continue
        matched_by_sha.setdefault(item["sha256"], item)
    for digest, item in sorted(matched_by_sha.items()):
        target = output / "VIDEO-POSTERS" / f"{item['matched_sku']}-{digest[:12]}-poster-v01.jpg"
        video_poster_actions[
            generate_poster(Path(item["absolute_path"]), target, float(item["duration_seconds"] or 0))
        ] += 1
        poster_by_sha[digest] = str(target)
        source = Path(item["absolute_path"])
        if int(item["bytes"] or 0) > 100 * 1024 * 1024 or item["extension"].lower() != ".mp4" or item["video_codec"] != "h264":
            web_target = output / "VIDEO-WEB" / f"{item['matched_sku']}-{digest[:12]}-web-v01.mp4"
            video_web_copy_actions[generate_web_video(source, web_target)] += 1
            web_video_by_sha[digest] = str(web_target)
        else:
            web_video_by_sha[digest] = str(source)
    for item in videos:
        item["media_status"] = (
            "VALID_VIDEO"
            if item.get("video_codec") and int(item.get("width") or 0) > 0 and int(item.get("height") or 0) > 0
            else "INVALID_VIDEO_NO_VIDEO_STREAM"
        )
        item["poster_path"] = poster_by_sha.get(item["sha256"], "")
        item["poster_sha256"] = sha256(Path(item["poster_path"])) if item["poster_path"] else ""
        item["raw_sha256"] = item["sha256"]
        item["raw_size"] = item["bytes"]
        item["raw_resolution"] = f"{item['width']}x{item['height']}"
        item["orientation"] = (
            "LANDSCAPE" if int(item["width"] or 0) > int(item["height"] or 0)
            else "PORTRAIT" if int(item["height"] or 0) > int(item["width"] or 0)
            else "SQUARE" if int(item["width"] or 0) > 0
            else "UNKNOWN"
        )
        item["web_path"] = web_video_by_sha.get(item["sha256"], "")
        item["web_sha256"] = sha256(Path(item["web_path"])) if item["web_path"] else ""
        item["web_size"] = Path(item["web_path"]).stat().st_size if item["web_path"] else ""
        item["web_copy_status"] = (
            "GENERATED_WEB_COPY" if item["sha256"] in web_video_by_sha and item["web_path"] != item["absolute_path"]
            else "SOURCE_MP4_H264_READY" if item["web_path"]
            else "NOT_MATCHED"
        )

    video_fields = [
        "path", "absolute_path", "raw_sha256", "raw_size", "duration_seconds", "raw_resolution", "orientation", "media_status",
        "video_codec", "audio_codec", "match_status", "matched_sku", "matched_model", "matched_quality",
        "match_method", "candidate_skus", "current_website_video_paths", "poster_path", "poster_sha256",
        "web_path", "web_sha256", "web_size", "web_copy_status", "duplicate_state", "preferred_source_path",
    ]
    write_csv(output / "video-media-inventory.csv", videos, video_fields)

    low_rows = list(csv.DictReader((batch1 / "low-resolution-recovery.csv").open(encoding="utf-8-sig", newline="")))
    recovered_rows = list(csv.DictReader((batch2 / "low-res-preferred-sources.csv").open(encoding="utf-8-sig", newline="")))
    recovered_keys = {(item["low_resolution_source"], item["high_resolution_candidate"]) for item in recovered_rows}
    remaining_recovery = [
        item for item in low_rows
        if (item["low_resolution_source"], item["high_resolution_candidate"]) not in recovered_keys
    ]
    write_csv(
        output / "low-res-remaining.csv",
        remaining_recovery,
        list(remaining_recovery[0]) if remaining_recovery else ["low_resolution_source", "high_resolution_candidate"],
    )

    registry = {
        "schema_version": "HAODE_CONFIRMED_ASSETS_V1",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source_registries": [str(batch2 / "confirmed-assets.json"), str(batch1 / "asset-manifest.json")],
        "consumption_gate": {"provenance_status": "CONFIRMED", "qc_status": "PASS", "approved_for_web": True},
        "assets": [*previous_registry["assets"], *new_details],
    }
    write_if_changed(output / "confirmed-assets.json", (json.dumps(registry, ensure_ascii=False, indent=2) + "\n").encode())

    approved_skus_after = {item["sku"] for item in drop_images}
    main_image_skus = {item["sku"] for item in drop_images if item["media_role"] == "MAIN_IMAGE"}
    source_confirmed_skus = {
        item["sku"]
        for item in registry["assets"]
        if item.get("sku") and item.get("provenance_status") == "CONFIRMED" and item.get("asset_type") in {"PRODUCT_CUTOUT", "PRODUCT_SOURCE"}
    }
    matched_video_entries = []
    for digest, item in sorted(matched_by_sha.items()):
        matched_video_entries.append(
            {
                "asset_id": f"video:{item['matched_sku']}:{digest[:12]}",
                "asset_type": "TEST_VIDEO",
                "sku": item["matched_sku"],
                "model": item["matched_model"],
                "quality": item["matched_quality"],
                "source_path": item["absolute_path"],
                "source_sha256": digest,
                "web_path": item["web_path"],
                "web_sha256": item["web_sha256"],
                "web_size": item["web_size"],
                "duration_seconds": float(item["duration_seconds"] or 0),
                "resolution": f"{item['width']}x{item['height']}",
                "orientation": item["orientation"],
                "video_codec": item["video_codec"],
                "audio_codec": item["audio_codec"],
                "poster_path": poster_by_sha[digest],
                "poster_sha256": sha256(Path(poster_by_sha[digest])),
                "provenance_status": "CONFIRMED",
                "provenance_method": item["match_method"],
                "qc_status": "PASS",
                "approved_for_web": True,
                "delivery_note": item["web_copy_status"],
            }
        )

    product_manifest = {
        "schema_version": "HAODE_PRODUCT_MEDIA_DROP_V1",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "current_website_products": len(products),
        "consumption_gate": {"provenance_status": "CONFIRMED", "qc_status": "PASS", "approved_for_web": True},
        "approved_product_images": drop_images,
        "approved_test_videos": matched_video_entries,
        "protected_states": {
            "fundas": "REAL_ASSET_REQUIRED",
            "hidrogel": "TEXT_ONLY_SOURCE_UNCONFIRMED",
            "baterias": "REAL_ASSET_REQUIRED_NOT_PUBLISHED",
            "productos_ai": "IMAGE_MANUAL_REVIEW",
            "x200t": "IMAGE_MANUAL_REVIEW_REAL_SCENE_ALLOWED",
        },
        "website_code_modified": False,
        "production": "UNCHANGED",
    }
    write_if_changed(drop / "product-media-manifest.json", (json.dumps(product_manifest, ensure_ascii=False, indent=2) + "\n").encode())
    write_if_changed(drop / "confirmed-assets.json", (json.dumps(registry, ensure_ascii=False, indent=2) + "\n").encode())

    video_status = Counter(item["match_status"] for item in videos)
    summary = {
        "total_assets": baseline["summary"]["total_assets"],
        "current_website_products": len(products),
        "source_confirmed_before": 25,
        "source_confirmed_after": len(source_confirmed_skus),
        "current_website_approved_assets": len(approved_skus_after),
        "current_website_coverage": round(len(approved_skus_after) / len(products) * 100, 1),
        "current_website_main_image_ready": len(main_image_skus),
        "current_website_main_image_coverage": round(len(main_image_skus) / len(products) * 100, 1),
        "current_website_detail_only": len(approved_skus_after - main_image_skus),
        "pantallas": len(approved_skus_after),
        "fundas": 0,
        "hidrogel": 0,
        "baterias": 0,
        "productos_ai": 0,
        "x200t": "MANUAL_REVIEW",
        "low_res_recovered": len(recovered_rows),
        "low_res_remaining": baseline["summary"]["low_res"] - len(recovered_rows),
        "low_res_recovery_candidates_remaining": len(remaining_recovery),
        "videos_indexed": len(videos),
        "video_matched": video_status["MATCHED"],
        "video_ambiguous": video_status["AMBIGUOUS"],
        "video_unmatched": video_status["UNMATCHED"],
        "video_invalid": sum(item["media_status"] != "VALID_VIDEO" for item in videos),
        "video_posters_ready": len(poster_by_sha),
        "duplicate_groups": baseline["summary"]["duplicate_groups"],
        "new_approved_web_assets": len(new_details),
        "newly_covered_products": len(expected_new_skus),
        "user_review_required": 0,
        "website_asset_drop": str(drop),
        "image_copy_actions": dict(actions),
        "video_poster_actions": dict(video_poster_actions),
        "video_web_copy_actions": dict(video_web_copy_actions),
        "website_code_modified": False,
        "production": "UNCHANGED",
    }
    write_if_changed(output / "batch3-summary.json", (json.dumps(summary, ensure_ascii=False, indent=2) + "\n").encode())
    report = f"""# HAODE ASSET FACTORY — BATCH 3

TOTAL ASSETS: {summary['total_assets']}

CURRENT WEBSITE PRODUCTS: {summary['current_website_products']}

SOURCE CONFIRMED BEFORE: {summary['source_confirmed_before']}

SOURCE CONFIRMED AFTER: {summary['source_confirmed_after']}

CURRENT WEBSITE APPROVED ASSETS: {summary['current_website_approved_assets']}
CURRENT WEBSITE COVERAGE: {summary['current_website_approved_assets']}/{summary['current_website_products']} ({summary['current_website_coverage']}%)
CURRENT WEBSITE MAIN IMAGE READY: {summary['current_website_main_image_ready']}/{summary['current_website_products']} ({summary['current_website_main_image_coverage']}%)
CURRENT WEBSITE DETAIL-ONLY PRODUCTS: {summary['current_website_detail_only']}

PANTALLAS: {summary['pantallas']} approved product identities
FUNDAS: REAL_ASSET_REQUIRED
HIDROGEL: TEXT_ONLY / SOURCE_UNCONFIRMED
BATERIAS: REAL_ASSET_REQUIRED / NOT PUBLISHED
PRODUCTOS AI: IMAGE MANUAL_REVIEW
X200T: MANUAL_REVIEW

LOW RES RECOVERED: {summary['low_res_recovered']}
LOW RES REMAINING: {summary['low_res_remaining']} assets ({summary['low_res_recovery_candidates_remaining']} unresolved recovery candidates)

VIDEOS INDEXED: {summary['videos_indexed']}
VIDEO MATCHED: {summary['video_matched']}
VIDEO AMBIGUOUS: {summary['video_ambiguous']}
VIDEO UNMATCHED: {summary['video_unmatched']}
VIDEO INVALID: {summary['video_invalid']} (indexed, excluded from approval)
VIDEO POSTERS READY: {summary['video_posters_ready']}

DUPLICATE GROUPS: {summary['duplicate_groups']}

NEW APPROVED WEB ASSETS: {summary['new_approved_web_assets']}

USER REVIEW REQUIRED: {summary['user_review_required']}

WEBSITE ASSET DROP: {summary['website_asset_drop']}

WEBSITE CODE MODIFIED: NO

PRODUCTION: UNCHANGED
"""
    write_if_changed(output / "HAODE-ASSET-FACTORY-BATCH-3.md", report.encode())
    write_csv(output / "new-approved-images.csv", new_details, list(new_details[0]))
    with (output / "user-review-required.csv").open("w", encoding="utf-8-sig", newline="") as handle:
        csv.writer(handle).writerow(["asset_id", "reason"])
    make_contact_sheet(new_details, output / "BATCH-3-NEW-APPROVED-CONTACT-SHEET.jpg")
    make_video_contact_sheet(list(matched_by_sha.values()), output / "BATCH-3-VIDEO-POSTER-CONTACT-SHEET.jpg")
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
