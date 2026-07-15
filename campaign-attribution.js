(function attachHaodeCampaign(global) {
  const STORAGE_KEY = "haode-campaign-attribution-v1";

  function normalizeToken(value, fallback = "") {
    const normalized = String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 80);
    return normalized || fallback;
  }

  function readStored() {
    try {
      return JSON.parse(global.sessionStorage.getItem(STORAGE_KEY) || "{}");
    } catch {
      return {};
    }
  }

  function referrerSource() {
    try {
      const host = global.document.referrer ? new URL(global.document.referrer).hostname : "";
      if (/facebook|instagram/i.test(host)) return /instagram/i.test(host) ? "instagram" : "facebook";
      if (/tiktok/i.test(host)) return "tiktok";
      if (/google/i.test(host)) return "google";
    } catch {
      return "";
    }
    return "";
  }

  function capture({ channel = "haode_web" } = {}) {
    const params = new URLSearchParams(global.location.search);
    const stored = readStored();
    const hasIncomingCampaign = ["utm_source", "utm_medium", "utm_campaign", "utm_content"]
      .some((key) => params.has(key));
    const defaultMedium = channel === "haode_app" ? "owned_app" : "owned_web";

    const attribution = hasIncomingCampaign
      ? {
          source: normalizeToken(params.get("utm_source") || params.get("source"), channel),
          medium: normalizeToken(params.get("utm_medium"), defaultMedium),
          campaign: normalizeToken(params.get("utm_campaign")),
          content: normalizeToken(params.get("utm_content")),
          landingPage: global.location.pathname || "/"
        }
      : {
          source: normalizeToken(stored.source || referrerSource(), channel),
          medium: normalizeToken(stored.medium, defaultMedium),
          campaign: normalizeToken(stored.campaign),
          content: normalizeToken(stored.content),
          landingPage: String(stored.landingPage || global.location.pathname || "/").slice(0, 240)
        };

    try {
      global.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
    } catch {
      // Attribution must never block browsing or checkout.
    }
    return attribution;
  }

  function reference(attribution) {
    return [attribution?.source, attribution?.campaign, attribution?.content].filter(Boolean).join("/");
  }

  global.HaodeCampaign = Object.freeze({ capture, normalizeToken, reference });
})(window);
