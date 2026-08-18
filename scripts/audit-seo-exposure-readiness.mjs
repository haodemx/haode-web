import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { buildExposurePack } from "./generate-exposure-pack.mjs";

const ROOT = process.cwd();
const SITE_URL = "https://haode.com.mx";
const REPORT_DIR = path.join(ROOT, "docs", "reports");
const OUT_DIR = path.join(ROOT, "data", "marketing");

export const SEO_PRIORITY_PAGES = Object.freeze([
  {
    priority: "P0",
    intent: "refacciones para celular mayoreo mexico",
    url: "https://haode.com.mx/refacciones-celulares-mayoreo-mexico/",
    audience: "Talleres, tiendas y distribuidores",
    cta: "Enviar lista por WhatsApp",
    requiredInExposurePack: true
  },
  {
    priority: "P0",
    intent: "pantallas samsung mayoreo mexico",
    url: "https://haode.com.mx/pantallas-samsung-mayoreo-mexico/",
    audience: "Tecnicos, talleres y distribuidores",
    cta: "Cotizar modelo y cantidad",
    requiredInExposurePack: true
  },
  {
    priority: "P0",
    intent: "pantallas iphone mayoreo mexico",
    url: "https://haode.com.mx/pantallas-iphone-mayoreo-mexico/",
    audience: "Tecnicos, talleres y distribuidores",
    cta: "Elegir calidad y cotizar",
    requiredInExposurePack: true
  },
  {
    priority: "P0",
    intent: "pantallas iphone 11 xr mayoreo",
    url: "https://haode.com.mx/pantallas-iphone-11-xr-mayoreo/",
    audience: "Tecnicos y talleres",
    cta: "Comparar version y cotizar",
    requiredInExposurePack: true
  },
  {
    priority: "P0",
    intent: "pantallas premium iphone samsung fabrica",
    url: "https://haode.com.mx/pantallas-premium-iphone-samsung-fabrica/",
    audience: "Talleres y compradores de volumen",
    cta: "Enviar lista por WhatsApp",
    requiredInExposurePack: true
  },
  {
    priority: "P0",
    intent: "fundas para celular mayoreo",
    url: "https://haode.com.mx/fundas-celular-mayoreo-mexico/",
    audience: "Tiendas y distribuidores",
    cta: "Ver catalogo y cotizar cantidad",
    requiredInExposurePack: true
  },
  {
    priority: "P1",
    intent: "pantallas iphone incell mexico",
    url: "https://haode.com.mx/pantallas-iphone-incell-mayoreo-mexico/",
    audience: "Tecnicos y talleres",
    cta: "Elegir modelo y cotizar",
    requiredInExposurePack: true
  },
  {
    priority: "P1",
    intent: "pantallas iphone oled mexico",
    url: "https://haode.com.mx/pantallas-iphone-oled-mayoreo-mexico/",
    audience: "Tecnicos y talleres",
    cta: "Elegir modelo y cotizar",
    requiredInExposurePack: true
  },
  {
    priority: "P1",
    intent: "pantallas samsung incell mexico",
    url: "https://haode.com.mx/pantallas-samsung-incell-mayoreo-mexico/",
    audience: "Tecnicos y talleres",
    cta: "Elegir modelo y cotizar",
    requiredInExposurePack: true
  },
  {
    priority: "P1",
    intent: "pantallas samsung z flip z fold original mexico",
    url: "https://haode.com.mx/pantallas-samsung-zflip-zfold-original-mexico/",
    audience: "Tecnicos y talleres",
    cta: "Confirmar modelo, version y cantidad",
    requiredInExposurePack: true
  },
  {
    priority: "P1",
    intent: "micas hidrogel mayoreo mexico",
    url: "https://haode.com.mx/micas-hidrogel-mayoreo-mexico/",
    audience: "Tiendas de accesorios",
    cta: "Consultar producto y ciudad",
    requiredInExposurePack: true
  },
  {
    priority: "P1",
    intent: "productos ai para tienda mexico",
    url: "https://haode.com.mx/productos-ai/",
    audience: "Tiendas y revendedores",
    cta: "Consultar modelos disponibles",
    requiredInExposurePack: true
  },
  {
    priority: "P1",
    intent: "distribuidor refacciones celular mexico",
    url: "https://haode.com.mx/distribuidores/",
    audience: "Distribuidores y compradores recurrentes",
    cta: "Enviar ciudad y volumen mensual",
    requiredInExposurePack: true
  }
]);

function dashedDate(dateKey) {
  return `${dateKey.slice(0, 4)}-${dateKey.slice(4, 6)}-${dateKey.slice(6, 8)}`;
}

function formatDateKey(date = new Date()) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
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

function csvCell(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function renderPriorityCsv(rows) {
  const columns = [
    "priority",
    "search_intent_es",
    "landing_url",
    "target_audience",
    "primary_cta",
    "page_status",
    "sitemap_status",
    "tracking_status",
    "exposure_pack_status",
    "gsc_index_status",
    "impressions_28d",
    "clicks_28d",
    "qualified_whatsapp_leads_14d",
    "orders_paid_14d",
    "revenue_mxn_14d",
    "owner_notes"
  ];
  return [
    columns.join(","),
    ...rows.map((row) => columns.map((column) => csvCell(row[column])).join(","))
  ].join("\n") + "\n";
}

function localPathForUrl(url) {
  const parsed = new URL(url);
  if (parsed.origin !== SITE_URL) {
    return null;
  }
  const pathname = decodeURIComponent(parsed.pathname);
  if (pathname === "/") return path.join(ROOT, "index.html");
  if (pathname.endsWith("/")) {
    return path.join(ROOT, pathname.slice(1), "index.html");
  }
  return path.join(ROOT, pathname.slice(1));
}

function read(relativePath) {
  return fsSync.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function sitemapLocs() {
  return new Set([...read("sitemap.xml").matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((match) => match[1]));
}

function pageSignals(page, locs) {
  const file = localPathForUrl(page.url);
  const exists = Boolean(file && fsSync.existsSync(file));
  const html = exists ? fsSync.readFileSync(file, "utf8") : "";
  const hasSitemap = locs.has(page.url);
  const canonicalOk = html.includes(`<link rel="canonical" href="${page.url}"`);
  const indexable = /<meta name=["']robots["'] content=["']index,follow/i.test(html);
  const hasWhatsApp = /wa\.me\/(?:523326684296|525645866014)|whatsapp\.com/i.test(html);
  const hasTrackedCta = /utm_source=|campaign-attribution\.js/i.test(html);
  const hasAttributionScript = html.includes("campaign-attribution.js");
  const hasStructuredData = /type=["']application\/ld\+json["']/i.test(html);
  const failures = [];

  if (!exists) failures.push("missing_page_file");
  if (exists && !canonicalOk) failures.push("missing_or_wrong_canonical");
  if (exists && !indexable) failures.push("not_index_follow");
  if (!hasSitemap) failures.push("missing_sitemap");
  if (exists && !hasWhatsApp) failures.push("missing_whatsapp_cta");
  if (exists && !hasTrackedCta) failures.push("missing_tracking_cta_or_script");
  if (exists && !hasAttributionScript) failures.push("missing_campaign_attribution_script");
  if (exists && !hasStructuredData) failures.push("missing_json_ld");

  return {
    exists,
    hasSitemap,
    canonicalOk,
    indexable,
    hasWhatsApp,
    hasTrackedCta,
    hasAttributionScript,
    hasStructuredData,
    failures
  };
}

function exposureCoverage(pack) {
  const urls = new Set();
  for (const row of pack.execution_rows) {
    try {
      const url = new URL(row.landing_url);
      url.search = "";
      url.hash = "";
      urls.add(url.toString());
    } catch {
      // Bad URLs are caught by link tests; keep this audit focused.
    }
  }
  return urls;
}

function pageStatus(signals) {
  return signals.exists && signals.canonicalOk && signals.indexable && signals.hasWhatsApp
    ? "ready"
    : "needs_fix";
}

function trackingStatus(signals) {
  return signals.hasTrackedCta && signals.hasAttributionScript ? "ready" : "needs_fix";
}

function exposureStatus(page, coverage) {
  if (!page.requiredInExposurePack) return "not_required";
  return coverage.has(page.url) ? "covered" : "missing";
}

function renderMarkdown(report) {
  const p0Failures = report.rows.filter((row) => row.priority === "P0" && row.issue_count > 0);
  const p1Failures = report.rows.filter((row) => row.priority === "P1" && row.issue_count > 0);
  const covered = report.rows.filter((row) => row.exposure_pack_status === "covered").length;
  const lines = [
    "# HAODE SEO 与曝光入口审计",
    "",
    `日期：${report.date}`,
    "",
    "## 【任务结论】",
    "",
    report.summary.total_issues === 0
      ? "现有 SEO 落地页和 14 天曝光执行包已打通：页面可收录、进入 sitemap、带 WhatsApp/UTM 入口，并且曝光包会使用这些落地页，不是重复建页面。"
      : "现有 SEO 基础已存在，但仍有页面、归因或曝光包覆盖缺口；先修 P0，再处理 P1。",
    "",
    "## 【这次和前两天不同】",
    "",
    "- 前两天做的是页面、sitemap、UTM 和基础曝光包。",
    "- 这次做的是闭环检查：员工发出去的链接是否真的落到这些 SEO 页面，客户点 WhatsApp 时来源是否能保留。",
    "- 不新增相似薄页面；只把已经有商业价值的入口接到执行包和回填表。",
    "",
    "## 【审计结果】",
    "",
    `- 检查重点入口：${report.rows.length} 个。`,
    `- 已进入曝光包：${covered} 个。`,
    `- P0 缺口：${p0Failures.length} 个。`,
    `- P1 缺口：${p1Failures.length} 个。`,
    `- 14 天任务：${report.exposure_pack.items} 天，${report.exposure_pack.execution_rows} 条渠道任务。`,
    "",
    "| 优先级 | 页面 | 页面 | Sitemap | 追踪 | 曝光包 | 问题 |",
    "| --- | --- | --- | --- | --- | --- | --- |"
  ];

  for (const row of report.rows) {
    const issueText = row.issues.length ? row.issues.join(", ") : "-";
    lines.push(`| ${row.priority} | ${row.landing_url} | ${row.page_status} | ${row.sitemap_status} | ${row.tracking_status} | ${row.exposure_pack_status} | ${issueText} |`);
  }

  lines.push("");
  lines.push("## 【员工每天怎么用】");
  lines.push("");
  lines.push("- 使用当天 `exposure-launch-pack` 里的平台文案和 UTM 链接。");
  lines.push("- 发布后在 `sales-growth-scorecard` 回填发布链接、有效 WhatsApp 咨询、报价、成交和 ERP 实收。");
  lines.push("- 不要自己加价格、库存、保修或限时优惠。");
  lines.push("- WhatsApp Estado 只发状态，不私聊、不群发、不广播。");
  lines.push("");
  lines.push("## 【输出文件】");
  lines.push("");
  lines.push(`- 优先页面回填表：\`${path.relative(ROOT, report.files.priorityCsv)}\``);
  lines.push(`- 曝光执行包：\`data/marketing/exposure-pack-${report.date_key}.json\``);
  lines.push(`- 员工回填表：\`data/marketing/sales-growth-scorecard-${report.date_key}.csv\``);
  return `${lines.join("\n")}\n`;
}

export function auditSeoExposureReadiness(dateKey = formatDateKey()) {
  const locs = sitemapLocs();
  const pack = buildExposurePack(dateKey);
  const coverage = exposureCoverage(pack);
  const rows = SEO_PRIORITY_PAGES.map((page) => {
    const signals = pageSignals(page, locs);
    const exposure_pack_status = exposureStatus(page, coverage);
    const issues = [...signals.failures];
    if (exposure_pack_status === "missing") issues.push("missing_exposure_pack_link");
    return {
      priority: page.priority,
      search_intent_es: page.intent,
      landing_url: page.url,
      target_audience: page.audience,
      primary_cta: page.cta,
      page_status: pageStatus(signals),
      sitemap_status: signals.hasSitemap ? "ready" : "missing",
      tracking_status: trackingStatus(signals),
      exposure_pack_status,
      gsc_index_status: "",
      impressions_28d: "",
      clicks_28d: "",
      qualified_whatsapp_leads_14d: "",
      orders_paid_14d: "",
      revenue_mxn_14d: "",
      owner_notes: "",
      issue_count: issues.length,
      issues
    };
  });
  return {
    date_key: dateKey,
    date: dashedDate(dateKey),
    rows,
    exposure_pack: {
      items: pack.items.length,
      execution_rows: pack.execution_rows.length,
      covered_urls: [...coverage].sort()
    },
    summary: {
      total_issues: rows.reduce((total, row) => total + row.issue_count, 0),
      p0_issues: rows.filter((row) => row.priority === "P0").reduce((total, row) => total + row.issue_count, 0),
      p1_issues: rows.filter((row) => row.priority === "P1").reduce((total, row) => total + row.issue_count, 0)
    }
  };
}

export async function writeSeoExposureReadiness(dateKey = parseDateArg()) {
  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.mkdir(REPORT_DIR, { recursive: true });
  const report = auditSeoExposureReadiness(dateKey);
  const priorityCsv = path.join(OUT_DIR, `seo-priority-pages-${dateKey}.csv`);
  const jsonPath = path.join(REPORT_DIR, `seo-exposure-readiness-${dateKey}.json`);
  const markdownPath = path.join(REPORT_DIR, `seo-exposure-readiness-${dashedDate(dateKey)}.md`);
  report.files = { priorityCsv, jsonPath, markdownPath };
  await fs.writeFile(priorityCsv, renderPriorityCsv(report.rows));
  await fs.writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  await fs.writeFile(markdownPath, renderMarkdown(report));
  return report;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const report = await writeSeoExposureReadiness();
  console.log([
    `SEO exposure readiness ${report.date}`,
    `issues=${report.summary.total_issues}`,
    `priorityCsv=${path.relative(ROOT, report.files.priorityCsv)}`,
    `report=${path.relative(ROOT, report.files.markdownPath)}`
  ].join("\n"));
  if (report.summary.total_issues > 0) {
    process.exitCode = 1;
  }
}
