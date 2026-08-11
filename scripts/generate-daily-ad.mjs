import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { buildCampaignCode, buildCampaignLinks } from "./campaign-links.mjs";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "data", "marketing");
const LATEST_PATH = path.join(OUT_DIR, "daily-ad-latest.json");
const PRODUCTS_PATH = path.join(ROOT, "app", "products.json");
export const ERP_PUBLIC_CATALOG_URL = "https://erp.haode.com.mx/api/public/catalog";
const WHATSAPP_NUMBER = "523326684296";
const APP_URL = "https://haode.com.mx/app/";

function formatDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

function normalizeCategory(value = "") {
  const text = String(value).trim();
  if (/funda/i.test(text)) return "Fundas";
  if (/mica/i.test(text)) return "Mica Hidrogel";
  if (/ai|gafas|camara|cámara|mouse/i.test(text)) return "Productos AI";
  if (/samsung/i.test(text)) return /original/i.test(text) ? "Samsung Tipo Original" : "Pantallas Samsung";
  if (/iphone/i.test(text)) return "Pantallas iPhone";
  return text || "Productos HAODE";
}

function themeForDate(date = new Date()) {
  const themes = [
    "Fundas Transformación 17 Pro",
    "Productos AI",
    "Pantallas iPhone",
    "Samsung Tipo Original",
    "Mica Hidrogel",
    "Promoción APP",
    "Stock real CDMX"
  ];
  return themes[date.getDay() % themes.length];
}

function rankProduct(product, theme) {
  const text = `${product.public_name_es || product.nombre || ""} ${product.category || product.categoria || ""}`.toLowerCase();
  let score = 0;
  if (/funda/.test(text)) score += theme.includes("Fundas") ? 80 : 25;
  if (/ai|gafas|camara|cámara|mouse/.test(text)) score += theme.includes("AI") ? 80 : 20;
  if (/iphone/.test(text)) score += theme.includes("iPhone") ? 80 : 15;
  if (/samsung/.test(text)) score += theme.includes("Samsung") ? 80 : 15;
  if (/mica|hidrogel/.test(text)) score += theme.includes("Mica") ? 70 : 10;
  if (/17|pro|max|premium|tipo original/.test(text)) score += 10;
  if (product.stock_status === "available" || product.stock === "disponible") score += 20;
  if (product.image_url || product.imagen) score += 4;
  return score;
}

async function loadJson(file) {
  return JSON.parse(await fs.readFile(file, "utf8"));
}

export async function loadPublicCatalog() {
  try {
    const response = await fetch(ERP_PUBLIC_CATALOG_URL, { signal: AbortSignal.timeout(12000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    return Array.isArray(payload) ? payload : Array.isArray(payload.products) ? payload.products : [];
  } catch (error) {
    console.warn(`No se pudo leer el catálogo público ERP: ${error.message}`);
    return [];
  }
}

export function chooseProduct(catalogRows, appProducts, theme) {
  const candidates = catalogRows.length
    ? catalogRows.filter((row) => row.sales_available === true && row.stock_status !== "out_of_stock" && Number(row.public_price_mxn) > 0)
    : appProducts.filter((row) => row.activo !== false);
  return candidates
    .map((product) => ({ product, score: rankProduct(product, theme) }))
    .sort((a, b) => b.score - a.score)
    .at(0)?.product || candidates[0] || {};
}

export function buildAd(product, date = new Date()) {
  const theme = themeForDate(date);
  const name = product.public_name_es || product.nombre || product.name || "Producto HAODE";
  const sku = product.sku || product.id || "";
  const category = normalizeCategory(product.category || product.categoria || theme);
  const stockQty = Number(product.stock_qty ?? product.stockQty ?? product.quantity ?? product.qty);
  const stockLocation = product.stock_location || product.stockLocation || "CDMX";
  const dateKey = formatDate(date);
  const campaignCode = buildCampaignCode({ dateKey, sku });
  const trackingLinks = buildCampaignLinks({ appUrl: APP_URL, campaign: campaignCode, productSku: sku });
  const ctaText = [
    "Hola HAODE México, quiero cotizar este producto:",
    `Producto: ${name}`,
    `SKU: ${sku || "N/A"}`,
    "Cantidad:",
    "Ciudad:",
    "¿Me confirman stock en México, precio por cantidad, garantía local y envío?",
  ].join("\n");
  const cta = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(ctaText)}`;

  return {
    date: dateKey,
    main_category: category,
    main_product: name,
    sku,
    stock_location: stockLocation,
    stock_qty: Number.isFinite(stockQty) ? stockQty : null,
    campaign_code: campaignCode,
    tracking_links: trackingLinks,
    headline_es: `${name} disponible para tiendas y técnicos en México`,
    caption_facebook_es: `HAODE México: ${name}. Atención para técnicos, tiendas y mayoreo en CDMX. Consulta disponibilidad y cotiza directo por WhatsApp.`,
    caption_tiktok_es: `${name} en HAODE México. Pantallas, micas, fundas y productos AI para técnicos y tiendas. Cotiza por WhatsApp.`,
    caption_whatsapp_es: `Hola, hoy en HAODE tenemos ${name}. Si necesitas cotizar para tienda, taller o mayoreo, escríbenos y confirmamos disponibilidad.`,
    website_banner_title: theme,
    website_banner_subtitle: `${name}. Stock y disponibilidad se confirman por WhatsApp.`,
    app_banner_title: `Hoy en HAODE: ${theme}`,
    app_banner_subtitle: `${name}. Agrega al carrito o consulta por WhatsApp.`,
    cta_website: trackingLinks.website,
    cta_app: trackingLinks.app,
    cta_whatsapp: cta,
    image_prompt: `Foto comercial limpia de ${name} para HAODE México, fondo claro, estilo mayorista profesional, sin precios visibles, formato 1080x1080 y 1080x1920.`,
    status: "draft"
  };
}

export async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const [appProducts, catalogRows] = await Promise.all([loadJson(PRODUCTS_PATH), loadPublicCatalog()]);
  const now = new Date();
  const theme = themeForDate(now);
  const product = chooseProduct(catalogRows, appProducts, theme);
  const ad = buildAd(product, now);
  const datedPath = path.join(OUT_DIR, `daily-ad-${ad.date}.json`);

  await fs.writeFile(datedPath, `${JSON.stringify(ad, null, 2)}\n`);
  await fs.writeFile(LATEST_PATH, `${JSON.stringify(ad, null, 2)}\n`);
  console.log(`Generated ${path.relative(ROOT, datedPath)} and ${path.relative(ROOT, LATEST_PATH)}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
