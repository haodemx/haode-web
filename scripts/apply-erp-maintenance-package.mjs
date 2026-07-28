import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const SCHEMA_VERSION = "haode-web-app-sync-v1";

const REQUIRED_SAFEGUARDS = Object.freeze([
  "no_auto_price_change",
  "no_auto_stock_change",
  "no_auto_sku_change",
  "no_auto_delete_product",
  "owner_review_required_for_protected_fields"
]);

const READY_STATUSES = new Set(["ready_to_sync", "synced"]);
const PACKAGE_STATUSES = new Set(["generated", "applied", "verified"]);
const TRACKING_STATUSES = new Set(["active", "paused", "finished"]);
const ALLOWED_DRAFT_STATUSES = new Set(["approved", "in_progress", "ready_to_sync", "synced"]);
const LOCAL_PATH_PATTERN = /\b(?:file:\/\/|\/Users\/mac|localhost|127\.0\.0\.1|0\.0\.0\.0)\b/i;

function normalizeText(value, maxLength = 2000) {
  return String(value ?? "").trim().slice(0, maxLength);
}

function normalizeNumber(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
}

function readArgs(argv = process.argv.slice(2)) {
  const args = new Map();
  argv.forEach((arg) => {
    if (arg === "--apply") args.set("apply", true);
    if (arg === "--dry-run") args.set("dryRun", true);
    if (arg.startsWith("--file=")) args.set("file", arg.slice("--file=".length));
    if (arg.startsWith("--root=")) args.set("root", arg.slice("--root=".length));
  });
  return args;
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

function hasLocalPath(value) {
  if (typeof value === "string") return LOCAL_PATH_PATTERN.test(value);
  if (Array.isArray(value)) return value.some(hasLocalPath);
  if (value && typeof value === "object") return Object.values(value).some(hasLocalPath);
  return false;
}

function validateSafeguards(syncPackage, issues) {
  if (syncPackage.schema_version !== SCHEMA_VERSION) {
    issues.push(`schema_version debe ser ${SCHEMA_VERSION}`);
  }

  const safeguards = syncPackage.safeguards || {};
  REQUIRED_SAFEGUARDS.forEach((key) => {
    if (safeguards[key] !== true) issues.push(`falta safeguard ${key}`);
  });
}

function validateProtectedMutations(syncPackage, issues) {
  const protectedBlocks = [
    "product_updates",
    "website_products",
    "app_products",
    "price_updates",
    "stock_updates",
    "sku_updates",
    "delete_products",
    "image_replacements",
    "whatsapp_updates"
  ];

  protectedBlocks.forEach((key) => {
    const value = syncPackage[key];
    if (Array.isArray(value) && value.length) issues.push(`bloque protegido no permitido: ${key}`);
    if (value && typeof value === "object" && !Array.isArray(value) && Object.keys(value).length) {
      issues.push(`bloque protegido no permitido: ${key}`);
    }
  });
}

function validatePackage(syncPackage) {
  const issues = [];
  validateSafeguards(syncPackage, issues);
  validateProtectedMutations(syncPackage, issues);

  if (hasLocalPath(syncPackage)) {
    issues.push("el paquete contiene rutas locales o URLs de desarrollo");
  }

  const status = normalizeText(syncPackage.status || "generated");
  if (status && !PACKAGE_STATUSES.has(status)) {
    issues.push(`estado de paquete no permitido: ${status}`);
  }

  const drafts = Array.isArray(syncPackage.content_drafts) ? syncPackage.content_drafts : [];
  drafts.forEach((draft) => {
    const draftStatus = normalizeText(draft.status || "");
    if (!ALLOWED_DRAFT_STATUSES.has(draftStatus)) {
      issues.push(`borrador ${draft.draft_no || draft.id || "(sin id)"} tiene estado no publicable: ${draftStatus || "vacio"}`);
    }
  });

  const tracking = Array.isArray(syncPackage.tracking_links) ? syncPackage.tracking_links : [];
  tracking.forEach((record) => {
    const recordStatus = normalizeText(record.status || "active");
    if (!TRACKING_STATUSES.has(recordStatus)) {
      issues.push(`tracking ${record.tracking_no || record.id || "(sin id)"} tiene estado invalido: ${recordStatus}`);
    }
  });

  return issues;
}

function sanitizeDraft(draft) {
  return {
    id: Number(draft.id || 0),
    draft_no: normalizeText(draft.draft_no, 40),
    type: normalizeText(draft.type, 40),
    channel: normalizeText(draft.channel, 40),
    target_ref: normalizeText(draft.target_ref, 160),
    target_path: normalizeText(draft.target_path, 240),
    title: normalizeText(draft.title, 220),
    body: normalizeText(draft.body, 3000),
    cta: normalizeText(draft.cta, 180),
    asset_url: normalizeText(draft.asset_url, 300),
    status: normalizeText(draft.status, 40),
    risk_level: normalizeText(draft.risk_level, 40),
    submitted_by_name: normalizeText(draft.submitted_by_name, 120),
    reviewed_by_name: normalizeText(draft.reviewed_by_name, 120),
    updated_at: normalizeText(draft.updated_at, 60)
  };
}

function sanitizeTracking(record) {
  return {
    id: Number(record.id || 0),
    tracking_no: normalizeText(record.tracking_no, 40),
    channel: normalizeText(record.channel, 40),
    campaign: normalizeText(record.campaign, 160),
    utm_url: normalizeText(record.utm_url, 500),
    content_theme: normalizeText(record.content_theme, 240),
    inquiries: normalizeNumber(record.inquiries),
    quotes: normalizeNumber(record.quotes),
    orders: normalizeNumber(record.orders),
    revenue_mxn: normalizeNumber(record.revenue_mxn),
    status: normalizeText(record.status || "active", 40),
    owner: normalizeText(record.owner, 120),
    updated_at: normalizeText(record.updated_at, 60)
  };
}

export function buildMaintenanceSync(syncPackage) {
  const issues = validatePackage(syncPackage);
  const drafts = (Array.isArray(syncPackage.content_drafts) ? syncPackage.content_drafts : []).map(sanitizeDraft);
  const tracking = (Array.isArray(syncPackage.tracking_links) ? syncPackage.tracking_links : []).map(sanitizeTracking);
  const readyDrafts = drafts.filter((draft) => READY_STATUSES.has(draft.status));
  const pendingDrafts = drafts.filter((draft) => !READY_STATUSES.has(draft.status));
  const generatedAt = new Date().toISOString();

  return {
    ok: issues.length === 0,
    generated_at: generatedAt,
    source_package: {
      package_no: normalizeText(syncPackage.package_no, 60),
      package_id: Number(syncPackage.package_id || syncPackage.id || 0),
      status: normalizeText(syncPackage.status || "generated", 40),
      created_at: normalizeText(syncPackage.created_at, 60),
      generated_by_name: normalizeText(syncPackage.generated_by_name, 120)
    },
    safeguards: Object.fromEntries(REQUIRED_SAFEGUARDS.map((key) => [key, syncPackage.safeguards?.[key] === true])),
    counts: {
      content_drafts: drafts.length,
      ready_drafts: readyDrafts.length,
      pending_drafts: pendingDrafts.length,
      tracking_links: tracking.length,
      inquiries: tracking.reduce((sum, record) => sum + record.inquiries, 0),
      quotes: tracking.reduce((sum, record) => sum + record.quotes, 0),
      orders: tracking.reduce((sum, record) => sum + record.orders, 0),
      revenue_mxn: tracking.reduce((sum, record) => sum + record.revenue_mxn, 0)
    },
    ready_drafts: readyDrafts,
    pending_drafts: pendingDrafts,
    tracking,
    blocked_reasons: issues
  };
}

function renderReport(syncResult, writtenFiles = []) {
  const lines = [];
  lines.push("# ERP 网站/App 同步包报告");
  lines.push("");
  lines.push(`生成时间: ${syncResult.generated_at}`);
  lines.push(`同步包: ${syncResult.source_package.package_no || "-"}`);
  lines.push(`状态: ${syncResult.ok ? "PASS" : "BLOCKED"}`);
  lines.push("");
  lines.push("## 统计");
  lines.push("");
  lines.push(`- 内容草稿: ${syncResult.counts.content_drafts}`);
  lines.push(`- 待发布/已同步草稿: ${syncResult.counts.ready_drafts}`);
  lines.push(`- 引流记录: ${syncResult.counts.tracking_links}`);
  lines.push(`- 询盘/报价/订单: ${syncResult.counts.inquiries}/${syncResult.counts.quotes}/${syncResult.counts.orders}`);
  lines.push(`- 销售额记录: ${syncResult.counts.revenue_mxn} MXN`);
  lines.push("");
  lines.push("## 安全边界");
  lines.push("");
  lines.push("- 不自动改价格。");
  lines.push("- 不自动改库存。");
  lines.push("- 不自动改 SKU。");
  lines.push("- 不自动删除产品。");
  lines.push("- 受保护字段必须老板确认。");
  lines.push("");
  lines.push("## 阻塞");
  if (syncResult.blocked_reasons.length) {
    syncResult.blocked_reasons.forEach((reason) => lines.push(`- ${reason}`));
  } else {
    lines.push("- 无");
  }
  lines.push("");
  lines.push("## 已写入文件");
  if (writtenFiles.length) {
    writtenFiles.forEach((filePath) => lines.push(`- \`${filePath}\``));
  } else {
    lines.push("- dry-run 未写入文件");
  }
  lines.push("");
  lines.push("## 员工下一步");
  lines.push("");
  lines.push("1. 只发布状态为 ready_to_sync 或 synced 的内容。");
  lines.push("2. 价格、库存、SKU、图片和删除产品仍然不能在这里直接改。");
  lines.push("3. 发布后把询盘、报价、订单和销售额回填 ERP 引流记录。");
  lines.push("");
  return `${lines.join("\n")}\n`;
}

async function ensureDir(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

async function writeJson(filePath, value) {
  await ensureDir(filePath);
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function writeText(filePath, text) {
  await ensureDir(filePath);
  await fs.writeFile(filePath, text, "utf8");
}

export async function applyMaintenanceSyncPackage({ root = process.cwd(), filePath, apply = false }) {
  if (!filePath) throw new Error("Use --file=/ruta/al/sync-package.json");
  const absoluteFile = path.resolve(root, filePath);
  const syncPackage = await readJson(absoluteFile);
  const result = buildMaintenanceSync(syncPackage);

  const syncOut = path.join(root, "data", "maintenance", "erp-maintenance-sync.json");
  const trackingOut = path.join(root, "data", "marketing", "erp-maintenance-tracking.json");
  const reportOut = path.join(root, "docs", "reports", "erp-maintenance-sync-report.md");
  const writtenFiles = [];

  if (apply && result.ok) {
    await writeJson(syncOut, result);
    writtenFiles.push(path.relative(root, syncOut));
    await writeJson(trackingOut, {
      generated_at: result.generated_at,
      source_package: result.source_package,
      tracking: result.tracking,
      totals: {
        inquiries: result.counts.inquiries,
        quotes: result.counts.quotes,
        orders: result.counts.orders,
        revenue_mxn: result.counts.revenue_mxn
      }
    });
    writtenFiles.push(path.relative(root, trackingOut));
  }

  if (apply) {
    await writeText(reportOut, renderReport(result, writtenFiles));
    writtenFiles.push(path.relative(root, reportOut));
  }

  return { result, writtenFiles };
}

async function main() {
  const args = readArgs();
  const root = path.resolve(args.get("root") || process.cwd());
  const filePath = args.get("file");
  const apply = args.get("apply") === true && args.get("dryRun") !== true;
  const { result, writtenFiles } = await applyMaintenanceSyncPackage({ root, filePath, apply });
  console.log(JSON.stringify({
    status: result.ok ? (apply ? "APPLIED" : "DRY_RUN_OK") : "BLOCKED",
    package_no: result.source_package.package_no,
    counts: result.counts,
    blocked_reasons: result.blocked_reasons,
    written_files: writtenFiles
  }, null, 2));
  if (!result.ok) process.exit(1);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
