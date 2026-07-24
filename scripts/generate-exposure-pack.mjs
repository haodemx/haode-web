import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { buildCampaignCode, buildCampaignLinks } from "./campaign-links.mjs";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "data", "marketing");
const REPORT_DIR = path.join(ROOT, "docs", "reports");
const APP_URL = "https://haode.com.mx/app/";

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
    route: "#grupo/Fundas",
    channels: ["whatsapp", "instagram", "facebook"],
    headline: "Fundas para rotación rápida en tienda",
    caption: "Fundas HAODE para tiendas y técnicos en México. Ideales para venta rápida y pedidos por WhatsApp. Consulta modelos disponibles y cantidades antes de confirmar.",
    whatsapp: "Hoy empujamos fundas HAODE. Publica el video o foto confirmada, manda clientes a la APP y pide que coticen por WhatsApp con modelo y cantidad."
  },
  {
    day: 2,
    focus: "Pantallas iPhone",
    sku: "pantallas_iphone_mayoreo",
    route: "#grupo/Pantallas",
    channels: ["instagram", "facebook", "tiktok", "whatsapp"],
    headline: "Pantallas iPhone para técnicos y mayoreo",
    caption: "Pantallas iPhone HAODE para talleres, técnicos y distribuidores. Revisa el catálogo, elige modelo y cotiza por WhatsApp para confirmar disponibilidad y precio final.",
    whatsapp: "Publica pantallas iPhone con prueba o empaque real. No pongas precio si no está confirmado en la imagen. Manda a la APP para cotizar."
  },
  {
    day: 3,
    focus: "Samsung INCELL",
    sku: "samsung_incell_con_marco",
    route: "#categoria/Pantallas%20Samsung%20INCELL",
    channels: ["facebook", "whatsapp"],
    headline: "Samsung INCELL con marco para reparación",
    caption: "Pantallas Samsung INCELL HAODE para reparación celular. Atención para talleres y compras de mayoreo en México. Cotiza el modelo exacto por WhatsApp.",
    whatsapp: "En Facebook funciona mejor preguntar por modelo: S8, S21, S22, S23, S24. No mezcles INCELL con OLED en el texto."
  },
  {
    day: 4,
    focus: "Máquinas de Mica",
    sku: "x200t_cortadora_micas",
    route: "#producto/x200t-cortadora-micas",
    channels: ["google_business", "facebook", "whatsapp"],
    headline: "Cortadora de micas para tiendas",
    caption: "HAODE X200T para tiendas que venden micas y accesorios. Consulta disponibilidad, detalles del producto y condiciones por WhatsApp.",
    whatsapp: "Este post es para clientes de ticket alto. Pide que pregunten por X200T y ciudad para seguimiento."
  },
  {
    day: 5,
    focus: "Productos AI",
    sku: "productos_ai_haode",
    route: "#grupo/AI",
    channels: ["instagram", "tiktok", "whatsapp"],
    headline: "Productos AI para vender en tienda",
    caption: "Productos AI HAODE para tiendas y clientes que buscan novedades: gafas, cámaras y gadgets inteligentes. Consulta modelos disponibles por WhatsApp.",
    whatsapp: "Usa solo videos confirmados del producto real. El objetivo es atraer curiosos y después pasar cotización por WhatsApp."
  },
  {
    day: 6,
    focus: "Catálogo App",
    sku: "app_catalogo_haode",
    route: "#lista",
    channels: ["whatsapp", "facebook", "instagram"],
    headline: "Catálogo HAODE desde el celular",
    caption: "Abre la APP HAODE, arma tu pedido y envíalo por WhatsApp. Pensado para técnicos, tiendas y distribuidores que compran en México.",
    whatsapp: "Manda este enlace a clientes que preguntan muchos modelos. Que agreguen productos al carrito y envíen pedido por WhatsApp."
  },
  {
    day: 7,
    focus: "Distribuidores",
    sku: "distribuidores_haode",
    route: "#contacto",
    channels: ["google_business", "facebook", "whatsapp"],
    headline: "HAODE para técnicos, talleres y distribuidores",
    caption: "HAODE México atiende técnicos, talleres, tiendas y distribuidores. Revisa el catálogo y cotiza por WhatsApp con modelo, cantidad y ciudad.",
    whatsapp: "Cierre semanal: enfoca en captar distribuidores. Pide nombre, ciudad, giro del negocio y productos que más compra."
  }
];

function itemWithLinks(item, dateKey) {
  const campaign = buildCampaignCode({ dateKey, sku: item.sku });
  const trackingLinks = buildCampaignLinks({
    appUrl: `${APP_URL}${item.route}`,
    campaign,
    productSku: item.sku
  });
  return { ...item, campaign, tracking_links: trackingLinks };
}

function renderMarkdown(pack) {
  const lines = [
    "# HAODE 曝光启动包",
    "",
    `日期：${dashedDate(pack.date)}`,
    "",
    "## 结论",
    "",
    "本包用于员工手动发布，不会自动发 Facebook、TikTok、Instagram、Google Business 或 WhatsApp。所有链接都带 UTM，客户进入 App 后下单或打开 WhatsApp 时会保留来源参考。",
    "",
    "## 使用规则",
    "",
    "- 客户可见文案直接复制西语内容。",
    "- 不要自行加价格、库存、保修或限时优惠。",
    "- 图片/视频必须用已确认产品素材。",
    "- WhatsApp Estado 只发状态，不群发、不私信、不广播。",
    "- 每天发布后把平台、链接、客户询问数量回填给老板。",
    "",
    "## 7 天发布安排",
    ""
  ];

  for (const item of pack.items) {
    lines.push(`### Day ${item.day} - ${item.focus}`);
    lines.push("");
    lines.push(`- 推广编号：\`${item.campaign}\``);
    lines.push(`- 主标题：${item.headline}`);
    lines.push(`- 员工提示：${item.whatsapp}`);
    lines.push("- 西语文案：");
    lines.push("");
    lines.push("```text");
    lines.push(item.caption);
    lines.push("```");
    lines.push("");
    lines.push("| 平台 | 链接 |");
    lines.push("| --- | --- |");
    for (const channel of item.channels) {
      lines.push(`| ${channel} | ${item.tracking_links[channel]} |`);
    }
    lines.push("");
  }

  lines.push("## 老板每天看什么");
  lines.push("");
  lines.push("- 每个平台发了几条。");
  lines.push("- 每个平台带来几个 WhatsApp 咨询。");
  lines.push("- 哪个推广编号出现在客户消息里。");
  lines.push("- 哪类产品有人问，但网站/App还没有足够素材。");
  lines.push("");
  return `${lines.join("\n")}\n`;
}

export function buildExposurePack(dateKey = formatDateKey()) {
  return {
    date: dateKey,
    app_url: APP_URL,
    items: campaignItems.map((item) => itemWithLinks(item, dateKey))
  };
}

export async function writeExposurePack(dateKey = parseDateArg()) {
  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.mkdir(REPORT_DIR, { recursive: true });
  const pack = buildExposurePack(dateKey);
  const jsonPath = path.join(OUT_DIR, `exposure-pack-${dateKey}.json`);
  const reportPath = path.join(REPORT_DIR, `exposure-launch-pack-${dashedDate(dateKey)}.md`);
  await fs.writeFile(jsonPath, `${JSON.stringify(pack, null, 2)}\n`);
  await fs.writeFile(reportPath, renderMarkdown(pack));
  return { jsonPath, reportPath, pack };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = await writeExposurePack();
  console.log(`Generated ${path.relative(ROOT, result.jsonPath)} and ${path.relative(ROOT, result.reportPath)}`);
}
