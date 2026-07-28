import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

import { applyMaintenanceSyncPackage, buildMaintenanceSync, SCHEMA_VERSION } from "../scripts/apply-erp-maintenance-package.mjs";

function packageFixture(overrides = {}) {
  return {
    schema_version: SCHEMA_VERSION,
    package_no: "SYNC-000001",
    status: "generated",
    created_at: "2026-07-28T00:00:00.000Z",
    generated_by_name: "Boss",
    safeguards: {
      no_auto_price_change: true,
      no_auto_stock_change: true,
      no_auto_sku_change: true,
      no_auto_delete_product: true,
      owner_review_required_for_protected_fields: true
    },
    content_drafts: [
      {
        id: 1,
        draft_no: "WC-000001",
        type: "homepage",
        channel: "website",
        target_ref: "home",
        target_path: "index.html",
        title: "Fabrica directa para talleres",
        body: "Stock en Mexico, garantia local y precio por cantidad.",
        cta: "Enviar lista por WhatsApp",
        status: "ready_to_sync",
        risk_level: "normal",
        submitted_by_name: "Empleado 1",
        reviewed_by_name: "Boss"
      },
      {
        id: 2,
        draft_no: "WC-000002",
        type: "seo",
        channel: "website",
        target_ref: "iphone-incell",
        target_path: "categoria/iphone-incell/index.html",
        title: "Pantallas iPhone INCELL",
        body: "Borrador aprobado, aun no listo.",
        status: "approved",
        risk_level: "normal"
      }
    ],
    tracking_links: [
      {
        id: 1,
        tracking_no: "UTM-000001",
        channel: "facebook",
        campaign: "iphone_incell_talleres",
        utm_url: "https://haode.com.mx/app/?utm_source=facebook&utm_medium=organic_social&utm_campaign=iphone_incell_talleres",
        content_theme: "iPhone INCELL",
        inquiries: 8,
        quotes: 4,
        orders: 2,
        revenue_mxn: 1500,
        status: "active",
        owner: "Empleado 2"
      }
    ],
    ...overrides
  };
}

test("builds a safe maintenance sync package summary", () => {
  const result = buildMaintenanceSync(packageFixture());
  assert.equal(result.ok, true);
  assert.equal(result.counts.content_drafts, 2);
  assert.equal(result.counts.ready_drafts, 1);
  assert.equal(result.counts.tracking_links, 1);
  assert.equal(result.counts.orders, 2);
  assert.equal(result.ready_drafts[0].draft_no, "WC-000001");
});

test("blocks packages that try to carry protected product updates", () => {
  const result = buildMaintenanceSync(packageFixture({
    product_updates: [{ sku: "IP-11-INCELL-FHD", price: 180 }]
  }));
  assert.equal(result.ok, false);
  assert.ok(result.blocked_reasons.some((reason) => reason.includes("product_updates")));
});

test("applies safe package into maintenance and marketing data files", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "haode-web-sync-"));
  const input = path.join(root, "sync-package.json");
  await fs.writeFile(input, JSON.stringify(packageFixture(), null, 2), "utf8");

  const { result, writtenFiles } = await applyMaintenanceSyncPackage({ root, filePath: input, apply: true });

  assert.equal(result.ok, true);
  assert.deepEqual(writtenFiles.sort(), [
    "data/maintenance/erp-maintenance-sync.json",
    "data/marketing/erp-maintenance-tracking.json",
    "docs/reports/erp-maintenance-sync-report.md"
  ].sort());

  const saved = JSON.parse(await fs.readFile(path.join(root, "data/maintenance/erp-maintenance-sync.json"), "utf8"));
  assert.equal(saved.source_package.package_no, "SYNC-000001");
  assert.equal(saved.ready_drafts.length, 1);
});
