import assert from "node:assert/strict";
import test from "node:test";

import {
  buildCampaignCode,
  buildCampaignLinks,
  normalizeTrackingToken
} from "../scripts/campaign-links.mjs";
import { buildExposurePack } from "../scripts/generate-exposure-pack.mjs";

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

test("keeps app hash routes when adding tracking parameters", () => {
  const links = buildCampaignLinks({
    appUrl: "https://haode.com.mx/app/#grupo/Fundas",
    campaign: "daily_20260724_fundas",
    productSku: "fundas"
  });

  const instagram = new URL(links.instagram);
  assert.equal(instagram.pathname, "/app/");
  assert.equal(instagram.hash, "#grupo/Fundas");
  assert.equal(instagram.searchParams.get("utm_source"), "instagram");
  assert.equal(instagram.searchParams.get("utm_campaign"), "daily_20260724_fundas");
});

test("builds a 14-day organic launch pack with tracked App and SEO landing links", () => {
  const pack = buildExposurePack("20260725");
  assert.equal(pack.items.length, 14);
  const wholesale = pack.items.find((item) => item.focus === "Mayoreo México");
  const phones = pack.items.find((item) => item.focus === "Celulares Samsung");
  assert.equal(new URL(wholesale.tracking_links.google_business).pathname, "/refacciones-celulares-mayoreo-mexico/");
  assert.equal(new URL(wholesale.tracking_links.google_business).searchParams.get("utm_source"), "google_business");
  assert.equal(new URL(phones.tracking_links.facebook).hash, "#categoria/Celulares%20Samsung");
});
