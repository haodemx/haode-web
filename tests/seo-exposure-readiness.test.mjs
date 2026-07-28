import assert from "node:assert/strict";
import { test } from "node:test";

import {
  SEO_PRIORITY_PAGES,
  auditSeoExposureReadiness
} from "../scripts/audit-seo-exposure-readiness.mjs";

test("priority SEO pages are ready for employee exposure and WhatsApp attribution", () => {
  const report = auditSeoExposureReadiness("20260728");

  assert.equal(report.summary.total_issues, 0, JSON.stringify(report.rows.filter((row) => row.issues.length), null, 2));
  assert.equal(report.rows.length, SEO_PRIORITY_PAGES.length);
  assert.equal(report.exposure_pack.items, 14);
  assert.equal(report.exposure_pack.execution_rows, 42);

  for (const row of report.rows) {
    assert.equal(row.page_status, "ready", row.landing_url);
    assert.equal(row.sitemap_status, "ready", row.landing_url);
    assert.equal(row.tracking_status, "ready", row.landing_url);
    assert.equal(row.exposure_pack_status, "covered", row.landing_url);
  }
});
