import assert from "node:assert/strict";
import test from "node:test";

import {
  buildCampaignCode,
  buildCampaignLinks,
  normalizeTrackingToken
} from "../scripts/campaign-links.mjs";

test("normalizes campaign codes without leaking arbitrary text", () => {
  assert.equal(normalizeTrackingToken(" Pantalla iPhone 14 Pro "), "pantalla_iphone_14_pro");
  assert.equal(normalizeTrackingToken("../../Campaña verano"), "campana_verano");
});

test("builds one campaign code and channel-specific app links", () => {
  const campaign = buildCampaignCode({ dateKey: "20260715", sku: "IP-14-INCELL-FHD" });
  const links = buildCampaignLinks({
    appUrl: "https://haode.com.mx/app/",
    campaign,
    productSku: "IP-14-INCELL-FHD"
  });

  assert.equal(campaign, "daily_20260715_ip_14_incell_fhd");
  assert.deepEqual(Object.keys(links), [
    "website",
    "app",
    "facebook",
    "instagram",
    "tiktok",
    "google_business",
    "whatsapp"
  ]);

  const facebook = new URL(links.facebook);
  assert.equal(facebook.searchParams.get("utm_source"), "facebook");
  assert.equal(facebook.searchParams.get("utm_medium"), "organic_social");
  assert.equal(facebook.searchParams.get("utm_campaign"), campaign);
  assert.equal(facebook.searchParams.get("utm_content"), "ip_14_incell_fhd");

  const app = new URL(links.app);
  assert.equal(app.searchParams.get("utm_source"), "haode_app");
  assert.equal(app.searchParams.get("utm_medium"), "owned_app");
});
