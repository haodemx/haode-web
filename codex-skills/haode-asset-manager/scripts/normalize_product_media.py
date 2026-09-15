#!/usr/bin/env python3
"""Build an idempotent product-level HAODE asset manifest and local preview.

The command never edits source assets or website product data. It normalizes only
existing true-alpha product images and routes every uncertain/opaque source to a
review state.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import html
import json
import re
import shutil
from collections import Counter, defaultdict
from pathlib import Path

import numpy as np
from PIL import Image, ImageCms


CANVAS = 1200
OCCUPANCY = 0.82
PIPELINE_VERSION = 2
SRGB_PROFILE = ImageCms.ImageCmsProfile(ImageCms.createProfile("sRGB")).tobytes()
LOW_LONG = 1000
LOW_SHORT = 600
PROMO_TOKENS = ("promo", "oferta", "price", "precio", "ya-llegaron", "llegaron", "poster", "banner")
SCENE_TOKENS = ("scene", "working", "installation", "tienda", "factory", "store", "technician")
DETAIL_TOKENS = ("gallery", "thumb", "card", "display", "box", "package", "detail", "back", "cable", "flex", "盒子", "背板", "排线", "细节", "详情")
STATUS_VOCABULARY = {
    "READY_TRANSPARENT", "NEEDS_CUTOUT", "CUTOUT_READY", "PROMO_WRONG_MAIN_IMAGE",
    "SCENE_WRONG_MAIN_IMAGE", "LOW_RESOLUTION", "SOURCE_UNCONFIRMED", "MANUAL_REVIEW",
    "MAIN_PRODUCT_ASSET_REQUIRED", "REAL_ASSET_REQUIRED", "QC_PASS", "QC_FAIL",
}
CONFIRMED_REAL_ALPHA_IDS = {"iphone-incell-16"}


def digest(path: Path) -> str:
    value = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            value.update(chunk)
    return value.hexdigest()


def slug(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-") or "asset"


def category_code(category_name: str, asset_id: str) -> str:
    text = category_name.lower().strip()
    if "x200t" in asset_id.lower():
        return "X200T"
    if text == "micas" or "hidrogel" in text:
        return "HIDROGEL"
    if "gafas ai" in text or "cámaras inteligentes" in text or "camara inteligente" in text or "ai-smart" in text:
        return "PRODUCTOS_AI"
    if "funda" in text:
        return "FUNDAS"
    if "bater" in text:
        return "BATERIAS"
    if "pantalla" in text or "oled" in text or "incell" in text:
        return "PANTALLAS"
    return "OTHER"


def alpha_metrics(image: Image.Image) -> dict:
    rgba = np.asarray(image.convert("RGBA"), dtype=np.uint8)
    alpha = rgba[:, :, 3]
    mask = alpha > 8
    if not mask.any():
        return {"bbox": None, "clipped": True, "halo_ratio": 1.0, "alpha_fraction": 1.0}
    ys, xs = np.where(mask)
    bbox = (int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1)
    clipped = bbox[0] == 0 or bbox[1] == 0 or bbox[2] == image.width or bbox[3] == image.height
    semi = (alpha > 8) & (alpha < 247)
    pale = np.all(rgba[:, :, :3] > 238, axis=2)
    halo_ratio = float((semi & pale).sum() / max(1, semi.sum()))
    return {
        "bbox": bbox,
        "clipped": bool(clipped),
        "halo_ratio": round(halo_ratio, 6),
        "alpha_fraction": round(float(np.mean(alpha < 250)), 6),
    }


def background_type(image: Image.Image) -> str:
    rgba = np.asarray(image.convert("RGBA"), dtype=np.uint8)
    if rgba[:, :, 3].min() < 255:
        return "TRANSPARENT"
    rgb = rgba[:, :, :3]
    edge = np.concatenate((rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1])).astype(np.int16)
    chroma = edge.max(axis=1) - edge.min(axis=1)
    white = np.mean(np.all(edge >= 242, axis=1) & (chroma < 16))
    gray = np.mean((edge.mean(axis=1) >= 155) & (edge.mean(axis=1) < 242) & (chroma < 18))
    if white >= 0.65:
        return "WHITE_BACKGROUND"
    if gray >= 0.65:
        return "GRAY_OR_BEIGE_BACKGROUND"
    if float(edge.std(axis=0).mean()) < 22:
        return "RECTANGULAR_BACKGROUND"
    return "OPAQUE_COMPLEX_OR_SCENE"


def normalize_alpha(source: Path, png_path: Path, web_path: Path) -> dict:
    with Image.open(source) as opened:
        image = opened.convert("RGBA")
        metrics = alpha_metrics(image)
        if not metrics["bbox"]:
            raise ValueError("empty alpha content")
        crop = image.crop(metrics["bbox"])
        scale = min(CANVAS * OCCUPANCY / crop.width, CANVAS * OCCUPANCY / crop.height)
        size = (max(1, round(crop.width * scale)), max(1, round(crop.height * scale)))
        crop = crop.resize(size, Image.Resampling.LANCZOS)
        canvas = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
        canvas.alpha_composite(crop, ((CANVAS - size[0]) // 2, (CANVAS - size[1]) // 2))
        png_path.parent.mkdir(parents=True, exist_ok=True)
        web_path.parent.mkdir(parents=True, exist_ok=True)
        canvas.save(png_path, format="PNG", optimize=True, icc_profile=SRGB_PROFILE)
        canvas.save(web_path, format="WEBP", lossless=True, method=6, icc_profile=SRGB_PROFILE)
        final = alpha_metrics(canvas)
        return {**metrics, "normalized_bbox": final["bbox"], "normalized_occupancy": round(max(size) / CANVAS, 4)}


def copy_preview(source: Path, target: Path) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as opened:
        image = opened.convert("RGBA")
        image.thumbnail((900, 900), Image.Resampling.LANCZOS)
        image.save(target, format="WEBP", quality=86, method=6)


def preferred_alpha_source(current: Path) -> Path | None:
    """Return only a same-product-directory alpha candidate; never cross models."""
    candidates = []
    for path in current.parent.iterdir():
        if not path.is_file() or path.suffix.lower() not in {".png", ".webp"}:
            continue
        try:
            with Image.open(path) as opened:
                image = opened.convert("RGBA")
                width, height = image.size
                if image.getchannel("A").getextrema()[0] == 255:
                    continue
                if max(width, height) < LOW_LONG or min(width, height) < LOW_SHORT:
                    continue
                risk = sum(token in path.name.lower() for token in DETAIL_TOKENS)
                main_bonus = 2 if path.stem.lower() in {"main", "front", "frente"} else 0
                candidates.append((main_bonus - risk, width * height, path))
        except Exception:
            continue
    if not candidates:
        return None
    candidates.sort(key=lambda item: (item[0], item[1], item[2].name), reverse=True)
    return candidates[0][2]


def write_csv(path: Path, rows: list[dict], fields: list[str]) -> None:
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def build_preview(output: Path, records: list[dict], logo_svg: Path, current_logo: Path) -> None:
    preview = output / "local-v3-full-preview"
    preview.mkdir(parents=True, exist_ok=True)
    shutil.copy2(logo_svg, preview / "haode-logo-official.svg")
    copy_preview(current_logo, preview / "haode-logo-before.webp")
    payload = json.dumps(records, ensure_ascii=False).replace("</", "<\\/")
    page = f"""<!doctype html><html lang='es-MX'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'>
<title>HAODE V3 Asset Preview</title><style>
:root{{--orange:#ff5a14;--ink:#111820;--muted:#65707b;--line:#d9dee5;--stage:#eef2f4;--logo-desktop:184px;--logo-mobile:128px;--logo-footer:200px;--logo-compact:96px}}*{{box-sizing:border-box}}body{{margin:0;font-family:Arial,sans-serif;color:var(--ink);background:#f5f7f8}}header{{height:78px;display:flex;align-items:center;justify-content:space-between;padding:0 5vw;background:white;border-bottom:1px solid var(--line);position:sticky;top:0;z-index:5}}header img{{width:var(--logo-desktop);height:58px;object-fit:contain}}nav{{display:flex;gap:18px;font-weight:800}}nav a{{color:inherit;text-decoration:none}}main{{width:min(1320px,94vw);margin:auto;padding:42px 0}}.hero{{display:grid;grid-template-columns:1.1fr .9fr;gap:30px;align-items:center;min-height:520px}}h1{{font-size:clamp(46px,7vw,92px);line-height:.92;margin:0}}.eyebrow,.status{{color:var(--orange);font-weight:900;letter-spacing:.08em}}.hero-stage,.media{{background:radial-gradient(circle at 50% 10%,#fff 0,#e8edf0 72%);border:1px solid var(--line);display:grid;place-items:center}}.hero-stage{{min-height:440px}}.hero-stage img{{width:88%;height:390px;object-fit:contain}}.toolbar{{display:flex;gap:12px;position:sticky;top:78px;background:#f5f7f8;padding:15px 0;z-index:4}}input{{width:min(520px,100%);padding:15px;border:1px solid #aeb7bf;font-size:17px}}.grid{{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}}.card{{background:white;border:1px solid var(--line);min-width:0;display:flex;flex-direction:column}}.media{{aspect-ratio:1/1;min-height:0;padding:10%;position:relative}}.media img{{width:100%;height:100%;object-fit:contain;object-position:center}}.badge{{position:absolute;left:8px;top:8px;max-width:calc(100% - 16px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;background:#111d;color:white;padding:5px 7px;font-size:10px}}.body{{padding:15px;display:grid;gap:7px;min-width:0}}.body h2{{font-size:17px;line-height:1.2;margin:0;min-height:41px;overflow-wrap:anywhere}}.body p{{font-size:12px;color:var(--muted);margin:0;overflow-wrap:anywhere}}.placeholder{{width:100%;height:100%;display:grid;place-items:center;text-align:center;border:1px dashed #94a0aa;color:#59636d;padding:20px;overflow-wrap:anywhere}}footer{{margin-top:50px;padding:38px 5vw;background:#111820;color:white;display:flex;justify-content:space-between;align-items:center}}footer img{{width:var(--logo-footer);height:auto}}.before header img{{width:200px;object-fit:contain}}.before .media{{padding:0}}.before .media img{{width:100%;height:100%}}.detail{{grid-template-columns:1fr 1fr}}.detail .card:first-child{{grid-column:span 2}}@media(max-width:800px){{header{{height:72px;padding:0 16px}}header img{{width:var(--logo-mobile)}}nav a:not(:last-child){{display:none}}main{{width:calc(100% - 28px);padding-top:26px}}.hero{{grid-template-columns:1fr;min-height:0}}.hero-stage{{min-height:300px}}.grid{{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}}.media{{padding:8%}}.body{{padding:11px}}.body h2{{font-size:14px}}footer{{align-items:flex-start;gap:24px;flex-direction:column}}}}
</style></head><body><header><img id='logo' src='haode-logo-official.svg' alt='HAODE Calidad Profesional'><nav><a href='?view=home'>Inicio</a><a href='?view=products'>Productos</a><a href='?view=film'>Hidrogel</a><a href='?view=ai'>AI</a><a href='?view=x200t'>X200T</a></nav></header><main><div id='app'></div></main><footer><img src='haode-logo-official.svg' alt='HAODE'><span>LOCAL ASSET PREVIEW · NO PRODUCCIÓN</span></footer>
<script id='data' type='application/json'>{payload}</script><script>
const items=JSON.parse(document.querySelector('#data').textContent);const q=new URLSearchParams(location.search);const view=q.get('view')||'home';const mode=q.get('mode')||'after';const search=q.get('search')||'';if(mode==='before'){{document.body.classList.add('before');logo.src='haode-logo-before.webp';document.querySelector('footer img').src='haode-logo-before.webp'}}
const esc=s=>String(s||'').replace(/[&<>\"]/g,c=>({{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}}[c]));
function img(r){{const src=mode==='before'?r.preview_current_path:r.preview_after_path;return src?`<img src="${{esc(src)}}" alt="${{esc(r.product_name)}}">`:`<div class="placeholder"><b>${{esc(r.normalization_status)}}</b><br>真实素材未安全标准化</div>`}}
function card(r){{const status=mode==='before'?(r.phase1_normalization_status||r.normalization_status):r.normalization_status;return `<article class='card'><div class='media'>${{img(r)}}<span class='badge'>${{esc(status)}}</span></div><div class='body'><h2>${{esc(r.product_name)}}</h2><p>${{esc(r.sku)}} · ${{esc(r.category)}}</p><p>${{esc(r.qc_status)}} · ${{esc(r.real_asset_status)}}</p></div></article>`}}
function filter(term,cat=''){{term=term.toLowerCase();return items.filter(r=>(!cat||r.category===cat)&&(`${{r.sku}} ${{r.product_name}} ${{r.category}}`).toLowerCase().includes(term))}}let content='';
if(view==='home'){{const hero=items.find(r=>r.preview_after_path)||items[0];content=`<section class='hero'><div><p class='eyebrow'>LABORATORY EDITORIAL · ASSET V1</p><h1>Producto real. Fondo transparente.</h1><p>Vista local para revisar escala, alpha y procedencia sin modificar producción.</p></div><div class='hero-stage'>${{img(hero)}}</div></section><h2>Prioridad de normalización</h2><section class='grid'>${{items.slice(0,8).map(card).join('')}}</section>`}}else{{let cat=view==='film'?'HIDROGEL':view==='ai'?'PRODUCTOS_AI':view==='x200t'?'X200T':'';let rows=filter(search,cat);if(view==='detail')rows=items.slice(0,1);content=`<p class='eyebrow'>${{esc(view.toUpperCase())}} · ${{rows.length}} REGISTROS</p><h1 style='font-size:52px;margin-bottom:22px'>HAODE Media Review</h1><div class='toolbar'><input id='search' value='${{esc(search)}}' placeholder='11, Samsung, OLED, INCELL, Fold, Flip'></div><section class='grid ${{view==='detail'?'detail':''}}'>${{rows.map(card).join('')}}</section>`}}app.innerHTML=content;const input=document.querySelector('#search');if(input)input.addEventListener('change',()=>{{q.set('search',input.value);location.search=q}});
</script></body></html>"""
    (preview / "index.html").write_text(page, encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--logo-svg", type=Path, required=True)
    parser.add_argument("--current-logo", type=Path, required=True)
    parser.add_argument("--prior-audit", type=Path)
    args = parser.parse_args()
    root, output = args.root.resolve(), args.output.resolve()
    output.mkdir(parents=True, exist_ok=True)
    products = json.loads((root / "app/products.json").read_text(encoding="utf-8"))
    old_manifest_path = output / "asset-manifest.json"
    old_document = json.loads(old_manifest_path.read_text()) if old_manifest_path.exists() else {}
    old_pipeline_version = old_document.get("pipeline_version")
    old = {r["asset_id"]: r for r in old_document.get("assets", [])}
    records, reused = [], 0
    for product in products:
        asset_id = product.get("id") or product.get("sku") or f"record-{len(records)+1}"
        category = category_code(product.get("categoria", ""), asset_id)
        current_ref = product.get("imagen") or product.get("image") or ""
        source = root / current_ref.lstrip("/") if current_ref else None
        exists = bool(source and source.is_file() and source.suffix.lower() != ".svg")
        record = {
            "asset_id": asset_id, "sku": product.get("sku") or asset_id,
            "product_name": product.get("nombre") or product.get("name") or asset_id,
            "category": category, "current_main_image": current_ref,
            "current_image_hash": "", "source_path": str(source) if source else "", "source_sha256": "",
            "master_path": "", "web_path": "", "asset_type": "TYPE_A_PRODUCT_MAIN",
            "background_type": "MISSING", "alpha": False, "resolution": "UNVERIFIED",
            "real_asset_status": "SOURCE_UNCONFIRMED", "cutout_status": "MAIN_PRODUCT_ASSET_REQUIRED",
            "normalization_status": "MAIN_PRODUCT_ASSET_REQUIRED", "qc_status": "QC_FAIL",
            "website_usage": ["app/products.json", current_ref] if current_ref else ["app/products.json"],
            "promo_misuse": False, "scene_misuse": False, "web_target": f"assets/products-normalized/{slug(asset_id)}.webp",
            "preview_current_path": "", "preview_after_path": "", "notes": [],
        }
        record["promo_misuse"] = bool(product.get("offerImage") and product.get("offerImage") == current_ref)
        if category == "BATERIAS":
            record.update(real_asset_status="REAL_ASSET_REQUIRED", cutout_status="REAL_ASSET_REQUIRED", normalization_status="REAL_ASSET_REQUIRED")
        elif category == "HIDROGEL" and asset_id != "x200t-cortadora-micas":
            record.update(real_asset_status="REAL_ASSET_REQUIRED", cutout_status="REAL_ASSET_REQUIRED", normalization_status="REAL_ASSET_REQUIRED")
            record["notes"].append("Transparent or translucent film identity requires product-level confirmation")
        elif not exists or "placeholder" in current_ref.lower():
            record["notes"].append("No non-placeholder main image file")
        else:
            current_hash = digest(source)
            record["current_image_hash"] = current_hash
            before_rel = f"current/{slug(asset_id)}.webp"
            copy_preview(source, output / "local-v3-full-preview" / before_rel)
            record["preview_current_path"] = before_rel
            with Image.open(source) as opened:
                image = opened.convert("RGBA")
                width, height = image.size
                record["resolution"] = f"{width}x{height}"
                record["background_type"] = background_type(image)
                record["alpha"] = image.getchannel("A").getextrema()[0] < 255
                low = max(width, height) < LOW_LONG or min(width, height) < LOW_SHORT
                path_text = current_ref.lower()
                record["promo_misuse"] = record["promo_misuse"] or any(t in path_text for t in PROMO_TOKENS)
                record["scene_misuse"] = any(t in path_text for t in SCENE_TOKENS)
                prior = args.prior_audit.resolve() if args.prior_audit else None
                prior_lk030 = prior / "local-v3-preview/cutouts/productos-ai-lk030-cutout-v01.png" if prior else None
                prior_x200t = prior / "local-v3-preview/cutouts/x200t-cutout-v01.png" if prior else None
                if category == "X200T":
                    record.update(cutout_status="MANUAL_REVIEW", normalization_status="MANUAL_REVIEW")
                    record["notes"].append("Known automatic segmentation damage: white body/display connection loss")
                    if prior_x200t and prior_x200t.is_file():
                        review_rel = "review/x200t-auto-rejected.webp"
                        copy_preview(prior_x200t, output / "local-v3-full-preview" / review_rel)
                        record["preview_after_path"] = review_rel
                elif record["promo_misuse"]:
                    record.update(cutout_status="PROMO_WRONG_MAIN_IMAGE", normalization_status="PROMO_WRONG_MAIN_IMAGE")
                elif record["scene_misuse"]:
                    record.update(cutout_status="SCENE_WRONG_MAIN_IMAGE", normalization_status="SCENE_WRONG_MAIN_IMAGE")
                else:
                    if asset_id == "lk-030-mini-camara-retro-digital" and prior_lk030 and prior_lk030.is_file():
                        candidate = prior_lk030
                        record["notes"].append("Reused deterministic LK030 cutout from prior audit")
                    else:
                        candidate = source if record["alpha"] else preferred_alpha_source(source)
                    if candidate:
                        source = candidate
                        record["source_path"] = str(source)
                        source_hash = digest(source)
                        record["source_sha256"] = source_hash
                        with Image.open(source) as selected:
                            selected_image = selected.convert("RGBA")
                            source_width, source_height = selected_image.size
                            record["resolution"] = f"{source_width}x{source_height}"
                            record["alpha"] = True
                            metrics = alpha_metrics(selected_image)
                        if candidate.parent == (root / current_ref.lstrip("/")).parent:
                            record["notes"].append(f"same-directory alpha candidate: {candidate.name}")
                    else:
                        source_hash = current_hash
                        record["source_sha256"] = source_hash
                        metrics = None
                    if candidate and (metrics["clipped"] or metrics["halo_ratio"] > 0.35):
                        record["notes"].append(f"halo_ratio={metrics['halo_ratio']}")
                        record.update(cutout_status="MANUAL_REVIEW", normalization_status="MANUAL_REVIEW")
                    elif candidate:
                        record["notes"].append(f"halo_ratio={metrics['halo_ratio']}")
                        png_rel = f"normalized/{slug(asset_id)}-master-v01.png"
                        web_rel = f"normalized/{slug(asset_id)}-web-v01.webp"
                        png_path, web_path = output / png_rel, output / web_rel
                        previous = old.get(asset_id, {})
                        if (old_pipeline_version == PIPELINE_VERSION and previous.get("source_sha256") == source_hash
                                and png_path.exists() and web_path.exists()):
                            reused += 1
                        else:
                            normalize_alpha(source, png_path, web_path)
                        record.update(master_path=str(png_path), web_path=str(web_path), cutout_status="CUTOUT_READY",
                                      normalization_status="CUTOUT_READY", qc_status="QC_PASS", preview_after_path=f"../{web_rel}")
                        if asset_id in CONFIRMED_REAL_ALPHA_IDS:
                            record["real_asset_status"] = "READY_TRANSPARENT"
                    elif low:
                        record.update(cutout_status="LOW_RESOLUTION", normalization_status="LOW_RESOLUTION")
                    else:
                        record.update(cutout_status="NEEDS_CUTOUT", normalization_status="NEEDS_CUTOUT")
        record["notes"] = " | ".join(record["notes"])
        records.append(record)

    promo_assets = [{"asset_id": f"promo-{p.get('id','unknown')}", "product_id": p.get("id", ""),
                     "asset_type": "TYPE_C_PROMO_ADVERTISEMENT", "path": p.get("offerImage", ""),
                     "main_image_path": p.get("imagen", ""), "main_image_misuse": p.get("offerImage") == p.get("imagen")}
                    for p in products if p.get("offerImage")]
    manifest = {
        "schema_version": "HAODE_ASSET_V1", "pipeline_version": PIPELINE_VERSION, "canvas": [CANVAS, CANVAS],
        "generated_from": str(root / "app/products.json"), "production_changed": False,
        "allowed_statuses": sorted(STATUS_VOCABULARY), "assets": records,
        "category_gaps": [{"category": "BATERIAS", "status": "REAL_ASSET_REQUIRED"}],
        "promo_assets": promo_assets,
    }
    old_manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    fields = ["asset_id", "sku", "product_name", "category", "current_main_image", "current_image_hash",
              "source_path", "source_sha256", "master_path", "web_path", "asset_type", "background_type",
              "alpha", "resolution", "promo_misuse", "scene_misuse", "cutout_status", "normalization_status",
              "real_asset_status", "qc_status", "web_target", "notes"]
    write_csv(output / "product-main-image-audit.csv", records, fields)
    write_csv(output / "promo-assets-audit.csv", promo_assets,
              ["asset_id", "product_id", "asset_type", "path", "main_image_path", "main_image_misuse"])
    preferred = [{"asset_id": r["asset_id"], "source_path": r["source_path"], "source_sha256": r["source_sha256"],
                  "status": r["real_asset_status"], "reason": r["notes"]}
                 for r in records if r["normalization_status"] == "CUTOUT_READY"]
    write_csv(output / "preferred-raw-sources.csv", preferred,
              ["asset_id", "source_path", "source_sha256", "status", "reason"])
    build_preview(output, records, args.logo_svg.resolve(), args.current_logo.resolve())
    counts = Counter(r["normalization_status"] for r in records)
    summary = {"total_product_records": len(records), "unique_main_images": len({r["current_main_image"] for r in records}),
               "statuses": dict(sorted(counts.items())), "already_transparent": sum(bool(r["alpha"]) for r in records),
               "cutout_completed": sum(r["normalization_status"] == "CUTOUT_READY" for r in records),
               "qc_pass": sum(r["qc_status"] == "QC_PASS" for r in records),
               "source_unconfirmed": sum(r["real_asset_status"] == "SOURCE_UNCONFIRMED" for r in records),
               "real_asset_required": sum(r["real_asset_status"] == "REAL_ASSET_REQUIRED" for r in records) + 1,
               "promo_wrong_main_image": sum(bool(r["promo_misuse"]) for r in records),
               "promo_replaced_in_local_preview": sum(bool(r["promo_misuse"]) for r in records),
               "scene_wrong_main_image": sum(bool(r["scene_misuse"]) for r in records), "promo_assets_preserved": len(promo_assets),
               "reused_outputs": reused, "production_changed": False}
    (output / "normalization-summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
