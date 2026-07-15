const CHANNELS = Object.freeze({
  website: { source: "haode_website", medium: "owned_web", content: "website_banner" },
  app: { source: "haode_app", medium: "owned_app", content: "app_banner" },
  facebook: { source: "facebook", medium: "organic_social" },
  instagram: { source: "instagram", medium: "organic_social" },
  tiktok: { source: "tiktok", medium: "organic_social" },
  google_business: { source: "google_business", medium: "organic" },
  whatsapp: { source: "whatsapp", medium: "referral" }
});

export function normalizeTrackingToken(value, fallback = "") {
  const normalized = String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80);
  return normalized || fallback;
}

export function buildCampaignCode({ dateKey, sku }) {
  const date = normalizeTrackingToken(dateKey, "undated");
  const product = normalizeTrackingToken(sku, "catalog");
  return `daily_${date}_${product}`;
}

export function buildCampaignLinks({ appUrl, campaign, productSku }) {
  const campaignCode = normalizeTrackingToken(campaign, "haode_catalog");
  const productContent = normalizeTrackingToken(productSku, "catalog");

  return Object.fromEntries(Object.entries(CHANNELS).map(([channel, attribution]) => {
    const url = new URL(appUrl);
    url.searchParams.set("utm_source", attribution.source);
    url.searchParams.set("utm_medium", attribution.medium);
    url.searchParams.set("utm_campaign", campaignCode);
    url.searchParams.set("utm_content", attribution.content || productContent);
    return [channel, url.toString()];
  }));
}
