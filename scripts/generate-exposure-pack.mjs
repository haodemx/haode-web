import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { buildCampaignCode, buildCampaignLinks } from "./campaign-links.mjs";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "data", "marketing");
const REPORT_DIR = path.join(ROOT, "docs", "reports");
const APP_URL = "https://haode.com.mx/app/";
const CHANNEL_TIMES = Object.freeze({
  google_business: "09:30",
  facebook: "10:30",
  instagram: "13:00",
  tiktok: "16:00",
  whatsapp: "18:00"
});
const CHANNEL_LABELS = Object.freeze({
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
  google_business: "Google Business",
  whatsapp: "WhatsApp Estado"
});

function formatDateKey(date = new Date()) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("");
}

function dashedDate(dateKey) {
  return `${dateKey.slice(0, 4)}-${dateKey.slice(4, 6)}-${dateKey.slice(6, 8)}`;
}

function offsetDateKey(dateKey, days) {
  const date = new Date(Date.UTC(
    Number(dateKey.slice(0, 4)),
    Number(dateKey.slice(4, 6)) - 1,
    Number(dateKey.slice(6, 8))
  ));
  date.setUTCDate(date.getUTCDate() + days);
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0")
  ].join("");
}

function parseDateArg(argv = process.argv) {
  const raw = argv.find((arg) => arg.startsWith("--date="))?.split("=").at(1);
  if (!raw) return formatDateKey();
  const normalized = raw.replace(/[^0-9]/g, "");
  if (!/^\d{8}$/.test(normalized)) {
    throw new Error("Use --date=YYYYMMDD");
  }
  return normalized;
}

const campaignItems = [
  {
    day: 1,
    focus: "Fundas",
    sku: "fundas_rotacion_rapida",
    url: "https://haode.com.mx/fundas-celular-mayoreo-mexico/",
    channels: ["whatsapp", "instagram", "facebook"],
    media: "assets/images/home-categories/fundas-accesorios.jpg",
    headline: "Fundas para rotación rápida en tienda",
    caption: "Fundas HAODE para tiendas y técnicos en México. Ideales para venta rápida y pedidos por WhatsApp. Consulta modelos disponibles y cantidades antes de confirmar.",
    whatsapp: "Hoy empujamos fundas HAODE. Publica el video o foto confirmada, manda clientes a la APP y pide que coticen por WhatsApp con modelo y cantidad."
  },
  {
    day: 2,
    focus: "iPhone INCELL",
    sku: "iphone_incell_mayoreo",
    url: "https://haode.com.mx/pantallas-iphone-incell-mayoreo-mexico/",
    channels: ["instagram", "facebook", "tiktok", "whatsapp"],
    media: "assets/products/iphone-incell/main.jpg",
    headline: "Pantallas iPhone INCELL para técnicos y mayoreo",
    caption: "Pantallas iPhone INCELL HAODE para talleres, técnicos y distribuidores. Revisa la página, elige modelo y cotiza por WhatsApp para confirmar disponibilidad y precio final.",
    whatsapp: "Publica pantallas iPhone INCELL con prueba o empaque real. No pongas precio si no está confirmado en la imagen. Manda a la página dedicada para cotizar."
  },
  {
    day: 2,
    focus: "iPhone mayoreo",
    sku: "iphone_mayoreo",
    url: "https://haode.com.mx/pantallas-iphone-mayoreo-mexico/",
    channels: ["instagram", "facebook", "whatsapp"],
    media: "assets/products/iphone-incell/main.jpg",
    headline: "Pantallas iPhone de mayoreo",
    caption: "Reúne INCELL y OLED en una sola entrada. Selecciona calidad y modelo, luego cotiza por WhatsApp para confirmar disponibilidad y precio por cantidad.",
    whatsapp: "Este post es para consultas de mayoreo general de iPhone. Pide siempre modelo, calidad, cantidad y ciudad para no mezclar líneas."
  },
  {
    day: 3,
    focus: "Samsung INCELL",
    sku: "samsung_incell_con_marco",
    url: "https://haode.com.mx/pantallas-samsung-incell-mayoreo-mexico/",
    channels: ["facebook", "whatsapp"],
    media: "assets/products/samsung-incell/main.jpg",
    headline: "Samsung INCELL con marco para reparación",
    caption: "Pantallas Samsung INCELL HAODE para reparación celular. Atención para talleres y compras de mayoreo en México. Cotiza el modelo exacto por WhatsApp.",
    whatsapp: "En Facebook funciona mejor preguntar por modelo: S8, S21, S22, S23, S24. No mezcles INCELL con OLED en el texto."
  },
  {
    day: 4,
    focus: "Micas de hidrogel",
    sku: "x200t_cortadora_micas",
    url: "https://haode.com.mx/micas-hidrogel-mayoreo-mexico/",
    channels: ["google_business", "facebook", "whatsapp"],
    media: "assets/products/cut-machine/x200t/main.jpg",
    headline: "Micas de hidrogel para tiendas y técnicos",
    caption: "Micas de hidrogel HAODE para tiendas, técnicos y distribuidores. Consulta el producto publicado y confirma cantidad, ciudad y condiciones por WhatsApp.",
    whatsapp: "Este post es para consultas de micas de hidrogel. Pide producto, cantidad y ciudad para dar seguimiento."
  },
  {
    day: 5,
    focus: "Gafas inteligentes AI",
    sku: "gafas_inteligentes_ai",
    url: "https://haode.com.mx/categoria/gafas-inteligentes-ai/",
    channels: ["instagram", "tiktok", "whatsapp"],
    media: "assets/products/productos-ai/w630-ai-smart-glasses/main.jpg",
    headline: "Gafas inteligentes AI para tu catálogo",
    caption: "Consulta los modelos de gafas inteligentes AI publicados por HAODE. Confirma versión, cantidad, ciudad y funciones del modelo por WhatsApp antes de cotizar.",
    whatsapp: "Usa solo material del modelo real confirmado. Pide modelo, versión, cantidad y ciudad antes de pasar la cotización."
  },
  {
    day: 6,
    focus: "Catálogo App",
    sku: "app_catalogo_haode",
    route: "#lista",
    channels: ["whatsapp", "facebook", "instagram"],
    media: "assets/images/factory-store-hero-products.png",
    headline: "Catálogo HAODE desde el celular",
    caption: "Abre la APP HAODE, arma tu pedido y envíalo por WhatsApp. Pensado para técnicos, tiendas y distribuidores que compran en México.",
    whatsapp: "Manda este enlace a clientes que preguntan muchos modelos. Que agreguen productos al carrito y envíen pedido por WhatsApp."
  },
  {
    day: 7,
    focus: "Distribuidores",
    sku: "distribuidores_haode",
    url: "https://haode.com.mx/distribuidores/",
    channels: ["google_business", "facebook", "whatsapp"],
    media: "assets/images/factory-store-storefront.png",
    headline: "HAODE para técnicos, talleres y distribuidores",
    caption: "HAODE México atiende técnicos, talleres, tiendas y distribuidores. Revisa el catálogo y cotiza por WhatsApp con modelo, cantidad y ciudad.",
    whatsapp: "Cierre semanal: enfoca en captar distribuidores. Pide nombre, ciudad, giro del negocio y productos que más compra."
  },
  {
    day: 8,
    focus: "Mayoreo México",
    sku: "refacciones_mayoreo_mexico",
    url: "https://haode.com.mx/refacciones-celulares-mayoreo-mexico/",
    channels: ["google_business", "facebook", "whatsapp"],
    media: "assets/images/factory-store-warehouse.png",
    headline: "Refacciones para celular de mayoreo en México",
    caption: "HAODE México atiende técnicos, talleres, tiendas y distribuidores. Envía modelos, cantidades y ciudad para confirmar disponibilidad, precio final y envío.",
    whatsapp: "Usa una foto confirmada de la tienda o almacén. El objetivo es captar listas completas, no preguntas de un solo modelo."
  },
  {
    day: 9,
    focus: "Samsung OLED",
    sku: "samsung_oled_mayoreo",
    route: "#categoria/Pantallas%20Samsung%20OLED",
    channels: ["instagram", "facebook", "whatsapp"],
    media: "assets/products/samsung-oled/main.jpg",
    headline: "Samsung OLED para técnicos y talleres",
    caption: "Pantallas Samsung OLED HAODE para reparación profesional. Consulta modelo exacto, cantidad y ciudad para confirmar disponibilidad y precio final.",
    whatsapp: "Publica solo una imagen real confirmada de Samsung OLED. No mezcles precios ni calidad INCELL en la misma pieza."
  },
  {
    day: 10,
    focus: "Samsung TIPO ORIGINAL",
    sku: "samsung_tipo_original",
    url: "https://haode.com.mx/pantallas-samsung-zflip-zfold-original-mexico/",
    channels: ["facebook", "google_business", "whatsapp"],
    media: "assets/images/factory-store-hero-products.png",
    headline: "Samsung Z Flip y Z Fold TIPO ORIGINAL",
    caption: "Modelos Samsung TIPO ORIGINAL para técnicos y tiendas. Consulta Z Flip y Z Fold con disponibilidad bajo confirmación.",
    whatsapp: "Pide modelo exacto, versión y cantidad. No afirmes compatibilidad ni stock antes de revisar la respuesta del asesor."
  },
  {
    day: 11,
    focus: "iPhone OLED",
    sku: "iphone_oled_mayoreo",
    url: "https://haode.com.mx/pantallas-iphone-oled-mayoreo-mexico/",
    channels: ["facebook", "instagram", "whatsapp"],
    media: "assets/products/iphone-oled/main.jpg",
    headline: "Pantallas iPhone OLED para compra profesional",
    caption: "Pantallas iPhone OLED HAODE para técnicos, talleres y distribuidores. Confirma modelo, calidad, cantidad y ciudad por WhatsApp antes de comprar.",
    whatsapp: "Publica solo imagen confirmada de iPhone OLED. Pide modelo exacto, calidad, cantidad y ciudad."
  },
  {
    day: 12,
    focus: "iPhone 11 y XR",
    sku: "iphone_11_xr_mayoreo",
    url: "https://haode.com.mx/pantallas-iphone-11-xr-mayoreo/",
    channels: ["facebook", "instagram", "whatsapp"],
    media: "assets/products/iphone-incell/11/main.jpg",
    headline: "Pantallas iPhone 11 y XR para mayoreo",
    caption: "Compara iPhone 11 y XR por versión y cantidad en HAODE México. Confirma modelo, versión, disponibilidad y envío por WhatsApp.",
    whatsapp: "Usa la página dedicada para no confundir versión estándar y Bolsa Protectora."
  },
  {
    day: 13,
    focus: "Pantallas Samsung mayoreo",
    sku: "pantallas_samsung_mayoreo_mexico",
    url: "https://haode.com.mx/pantallas-samsung-mayoreo-mexico/",
    channels: ["google_business", "facebook", "whatsapp"],
    media: "assets/images/factory-store-warehouse.png",
    headline: "Pantallas Samsung de mayoreo en México",
    caption: "INCELL, OLED y TIPO ORIGINAL para Galaxy S, Note, Ultra, Z Flip y Z Fold. Cotiza modelo, calidad, cantidad y ciudad.",
    whatsapp: "Esta publicación dirige a una página que separa las calidades. Pide al cliente que indique cuál necesita."
  },
  {
    day: 14,
    focus: "Pantallas premium",
    sku: "pantallas_premium_iphone_samsung",
    url: "https://haode.com.mx/pantallas-premium-iphone-samsung-fabrica/",
    channels: ["whatsapp", "facebook", "instagram"],
    media: "assets/img/home-hero-iphone-collage.png",
    headline: "Pantallas premium iPhone y Samsung para talleres",
    caption: "Pantallas premium HAODE para técnicos, talleres y compradores de volumen. Envía modelo, calidad, cantidad y ciudad para confirmar disponibilidad y precio final.",
    whatsapp: "Cierra el ciclo con la página premium. Revisa qué campaña produjo más consultas calificadas antes de repetir."
  }
];

function hashtagsFor(item) {
  const focusTag = item.focus
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "")
    .slice(0, 32);
  return [
    "#HAODE",
    "#RefaccionesParaCelular",
    "#TalleresMexico",
    "#MayoreoMexico",
    focusTag ? `#${focusTag}` : ""
  ].filter(Boolean).join(" ");
}

function channelCopy(item, channel, link) {
  const hashtags = hashtagsFor(item);
  const catalogCta = `Consulta el catálogo y cotiza por WhatsApp: ${link}`;
  if (channel === "facebook") {
    return `¿Buscas ${item.focus.toLowerCase()} para tu taller o tienda?\n\n${item.caption}\n\n${catalogCta}\n\n${hashtags}`;
  }
  if (channel === "instagram") {
    return `${item.headline}\n\n${item.caption}\n\nGuarda esta publicación y envía modelo, cantidad y ciudad para cotizar.\n${link}\n\n${hashtags}`;
  }
  if (channel === "tiktok") {
    return `${item.headline}\n${item.caption}\n\nCatálogo HAODE: ${link}\n\n${hashtags}`;
  }
  if (channel === "google_business") {
    return `${item.headline}\n\n${item.caption}\n\nAtención a talleres, tiendas y distribuidores en México. ${catalogCta}`;
  }
  return `*${item.headline}*\n${item.caption}\n\nVer catálogo: ${link}\nEnvía modelo, cantidad y ciudad para cotizar.`;
}

function mediaType(mediaPath) {
  return /\.(mp4|mov|webm)$/i.test(mediaPath) ? "video" : "image";
}

function itemWithLinks(item, dateKey) {
  if (!fsSync.existsSync(path.join(ROOT, item.media))) {
    throw new Error(`Missing campaign media: ${item.media}`);
  }
  const publishDate = offsetDateKey(dateKey, item.day - 1);
  const campaign = buildCampaignCode({ dateKey: publishDate, sku: item.sku });
  const trackingLinks = buildCampaignLinks({
    appUrl: item.url || `${APP_URL}${item.route}`,
    campaign,
    productSku: item.sku
  });
  const channels = [...item.channels]
    .sort((left, right) => CHANNEL_TIMES[left].localeCompare(CHANNEL_TIMES[right]));
  const channelCopies = Object.fromEntries(
    channels.map((channel) => [channel, channelCopy(item, channel, trackingLinks[channel])])
  );
  return {
    ...item,
    channels,
    publish_date: dashedDate(publishDate),
    publish_times: Object.fromEntries(channels.map((channel) => [channel, CHANNEL_TIMES[channel]])),
    campaign,
    media_asset: {
      path: item.media,
      type: mediaType(item.media),
      status: "website_published"
    },
    channel_copy: channelCopies,
    tracking_links: trackingLinks
  };
}

function executionRows(items) {
  return items.flatMap((item) => item.channels.map((channel) => ({
    date: item.publish_date,
    planned_time: item.publish_times[channel],
    channel,
    campaign_code: item.campaign,
    focus: item.focus,
    media_asset: item.media_asset.path,
    landing_url: item.tracking_links[channel],
    publish_status: "pending",
    published_url: "",
    qualified_whatsapp_leads: "",
    quotes_sent: "",
    orders_paid: "",
    revenue_mxn: "",
    median_first_response_minutes: "",
    owner_notes: ""
  })));
}

function csvCell(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function renderExecutionCsv(rows) {
  const columns = [
    "date",
    "planned_time",
    "channel",
    "campaign_code",
    "focus",
    "media_asset",
    "landing_url",
    "publish_status",
    "published_url",
    "qualified_whatsapp_leads",
    "quotes_sent",
    "orders_paid",
    "revenue_mxn",
    "median_first_response_minutes",
    "owner_notes"
  ];
  return [
    columns.join(","),
    ...rows.map((row) => columns.map((column) => csvCell(row[column])).join(","))
  ].join("\n") + "\n";
}

function renderMarkdown(pack) {
  const lines = [
    "# HAODE 曝光启动包",
    "",
    `执行周期：${dashedDate(pack.date)} 至 ${pack.items.at(-1).publish_date}`,
    "",
    "## 结论",
    "",
    `本包共 ${pack.items.length} 天、${pack.execution_rows.length} 个渠道任务，用于员工手动发布，不会自动发 Facebook、TikTok、Instagram、Google Business 或 WhatsApp。所有链接都带 UTM，客户进入 App 后下单或打开 WhatsApp 时会保留来源参考。`,
    "",
    "## 使用规则",
    "",
    "- 客户可见文案直接复制西语内容。",
    "- 不要自行加价格、库存、保修或限时优惠。",
    "- 每条任务已绑定网站当前公开使用的素材；若员工换图，替换素材仍需老板确认。",
    "- WhatsApp Estado 只发状态，不群发、不私信、不广播。",
    "- 每天发布后把平台、链接、客户询问数量回填给老板。",
    "",
    "## 14 天发布安排",
    ""
  ];

  for (const item of pack.items) {
    lines.push(`### Day ${item.day} - ${item.focus}`);
    lines.push("");
    lines.push(`- 发布日期：${item.publish_date}`);
    lines.push(`- 推广编号：\`${item.campaign}\``);
    lines.push(`- 主标题：${item.headline}`);
    lines.push(`- 现有素材：\`${item.media_asset.path}\`（${item.media_asset.type}）`);
    lines.push(`- 员工提示：${item.whatsapp}`);
    lines.push("");
    lines.push("| 平台 | 时间 | UTM 链接 |");
    lines.push("| --- | --- | --- |");
    for (const channel of item.channels) {
      lines.push(`| ${CHANNEL_LABELS[channel]} | ${item.publish_times[channel]} | ${item.tracking_links[channel]} |`);
    }
    lines.push("");
    for (const channel of item.channels) {
      lines.push(`#### ${CHANNEL_LABELS[channel]} 西语文案`);
      lines.push("");
      lines.push("```text");
      lines.push(item.channel_copy[channel]);
      lines.push("```");
      lines.push("");
    }
  }

  lines.push("## 老板每天看什么");
  lines.push("");
  lines.push("- 每个平台发了几条。");
  lines.push("- 每个平台带来几个 WhatsApp 咨询。");
  lines.push("- 哪个推广编号出现在客户消息里。");
  lines.push("- 哪类产品有人问，但网站/App还没有足够素材。");
  return `${lines.join("\n")}\n`;
}

export function buildExposurePack(dateKey = formatDateKey()) {
  const items = campaignItems.map((item) => itemWithLinks(item, dateKey));
  return {
    date: dateKey,
    app_url: APP_URL,
    items,
    execution_rows: executionRows(items)
  };
}

export async function writeExposurePack(dateKey = parseDateArg()) {
  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.mkdir(REPORT_DIR, { recursive: true });
  const pack = buildExposurePack(dateKey);
  const jsonPath = path.join(OUT_DIR, `exposure-pack-${dateKey}.json`);
  const reportPath = path.join(REPORT_DIR, `exposure-launch-pack-${dashedDate(dateKey)}.md`);
  const scorecardPath = path.join(OUT_DIR, `sales-growth-scorecard-${dateKey}.csv`);
  await fs.writeFile(jsonPath, `${JSON.stringify(pack, null, 2)}\n`);
  await fs.writeFile(reportPath, renderMarkdown(pack));
  await fs.writeFile(scorecardPath, renderExecutionCsv(pack.execution_rows));
  return { jsonPath, reportPath, scorecardPath, pack };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = await writeExposurePack();
  console.log([
    `Generated ${path.relative(ROOT, result.jsonPath)}`,
    path.relative(ROOT, result.reportPath),
    path.relative(ROOT, result.scorecardPath)
  ].join(", "));
}
