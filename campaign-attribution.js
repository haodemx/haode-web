(function attachHaodeCampaign(global) {
  const STORAGE_KEY = "haode-campaign-attribution-v1";
  const LEGACY_APP_STORAGE_KEY = "haode-attribution";
  const MAX_ATTRIBUTION_AGE_MS = 30 * 24 * 60 * 60 * 1000;
  const contactTrackedEvents = new WeakSet();

  function normalizeToken(value, fallback = "") {
    const raw = String(value || "").trim();
    const compactPhone = raw.replace(/[()+.\s-]/g, "");
    if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(raw) || /^\d{10,15}$/.test(compactPhone)) {
      return fallback;
    }
    const normalized = raw
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 80);
    return normalized || fallback;
  }

  function hasAnalyticsConsent() {
    return global.HaodePrivacy?.getConsent?.().analytics === true;
  }

  function clearStoredAttribution() {
    for (const storage of [global.sessionStorage, global.localStorage]) {
      try {
        storage.removeItem(STORAGE_KEY);
        storage.removeItem(LEGACY_APP_STORAGE_KEY);
      } catch {
        // Privacy cleanup must remain safe in restricted browser contexts.
      }
    }
  }

  function readStored() {
    if (!hasAnalyticsConsent()) return {};
    for (const storage of [global.sessionStorage, global.localStorage]) {
      try {
        const stored = JSON.parse(storage.getItem(STORAGE_KEY) || "{}");
        const capturedAt = Number(stored.capturedAt || 0);
        const hasAttribution = ["source", "medium", "campaign", "content"]
          .some((key) => Boolean(stored[key]));
        if (hasAttribution && (!capturedAt || Date.now() - capturedAt <= MAX_ATTRIBUTION_AGE_MS)) {
          return stored;
        }
      } catch {
        // Storage may be unavailable in private browsing or restricted contexts.
      }
    }
    return {};
  }

  function storeAttribution(attribution) {
    if (!hasAnalyticsConsent()) return;
    for (const storage of [global.sessionStorage, global.localStorage]) {
      try {
        storage.setItem(STORAGE_KEY, JSON.stringify(attribution));
      } catch {
        // Attribution must never block browsing or checkout.
      }
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
    const storedOrReferrerSource = normalizeToken(stored.source || referrerSource(), channel);
    const inferredMedium = storedOrReferrerSource === "google"
      ? "organic_search"
      : ["facebook", "instagram", "tiktok"].includes(storedOrReferrerSource)
        ? "referral"
        : defaultMedium;

    const attribution = hasIncomingCampaign
      ? {
          source: normalizeToken(params.get("utm_source") || params.get("source"), channel),
          medium: normalizeToken(params.get("utm_medium"), defaultMedium),
          campaign: normalizeToken(params.get("utm_campaign")),
          content: normalizeToken(params.get("utm_content")),
          landingPage: global.location.pathname || "/",
          capturedAt: Date.now()
        }
      : {
          source: storedOrReferrerSource,
          medium: normalizeToken(stored.medium, inferredMedium),
          campaign: normalizeToken(stored.campaign),
          content: normalizeToken(stored.content),
          landingPage: String(stored.landingPage || global.location.pathname || "/").slice(0, 240),
          capturedAt: Number(stored.capturedAt || Date.now())
        };

    storeAttribution(attribution);
    return attribution;
  }

  function reference(attribution) {
    return [attribution?.source, attribution?.campaign, attribution?.content].filter(Boolean).join("/");
  }

  function decorateWhatsAppLink(link, attribution = capture()) {
    if (!link?.href) return link;
    try {
      const url = new URL(link.href, global.location.origin);
      if (url.hostname !== "wa.me" && !url.hostname.endsWith(".whatsapp.com")) return link;
      const text = url.searchParams.get("text") || "";
      const campaignReference = reference(attribution);
      if (campaignReference) {
        const originLine = `Origen: ${campaignReference}`;
        const decoratedText = /(^|\n)Origen:[^\n]*/i.test(text)
          ? text.replace(/(^|\n)Origen:[^\n]*/i, `$1${originLine}`)
          : `${text}${text ? "\n" : ""}${originLine}`;
        url.searchParams.set("text", decoratedText);
        link.href = url.toString();
      }
    } catch {
      // Tracking decoration must never block the WhatsApp action.
    }
    return link;
  }

  function decorateCurrentPage() {
    const attribution = capture();
    global.document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp.com"]').forEach((link) => {
      decorateWhatsAppLink(link, attribution);
    });
  }

  function contactArea(link) {
    if (link.dataset.contactArea) return link.dataset.contactArea;
    if (link.hasAttribute("data-daily-ad-cta")) return "daily_ad_banner";
    if (link.hasAttribute("data-whatsapp-link")) return "cart";
    if (link.hasAttribute("data-product-whatsapp") || link.hasAttribute("data-detail-whatsapp")) return "product";
    if (link.hasAttribute("data-detail-header-whatsapp")) return "header";
    if (link.classList.contains("floating-cta")) return "floating_cta";
    return "site_link";
  }

  function wasContactTracked(event) {
    return Boolean(event && contactTrackedEvents.has(event));
  }

  global.HaodeCampaign = Object.freeze({
    capture,
    normalizeToken,
    reference,
    decorateWhatsAppLink,
    wasContactTracked
  });

  if (!hasAnalyticsConsent()) clearStoredAttribution();
  global.addEventListener("haode:privacy-consent", (event) => {
    if (event.detail?.analytics) {
      capture();
    } else {
      clearStoredAttribution();
    }
  });

  if (global.document.readyState === "loading") {
    global.document.addEventListener("DOMContentLoaded", decorateCurrentPage);
  } else {
    decorateCurrentPage();
  }

  global.document.addEventListener("click", (event) => {
    const link = event.target.closest?.('a[href*="wa.me"], a[href*="whatsapp.com"]');
    if (!link) return;
    const attribution = capture();
    decorateWhatsAppLink(link, attribution);
    if (typeof global.gtag === "function") {
      const sharedParameters = {
        source: attribution.source,
        medium: attribution.medium,
        campaign: attribution.campaign,
        content: attribution.content,
        landing_page: attribution.landingPage,
        page_path: global.location.pathname || "/",
        campaign_reference: reference(attribution),
        contact_area: contactArea(link)
      };
      global.gtag("event", "whatsapp_click", {
        ...sharedParameters
      });
      global.gtag("event", "contact", {
        method: "whatsapp",
        ...sharedParameters
      });
      contactTrackedEvents.add(event);
    }
  }, true);

  global.document.addEventListener("click", (event) => {
    const link = event.target.closest?.('a[href^="/app/"], a[href*="haode.com.mx/app/"]');
    if (!link || typeof global.gtag !== "function") return;
    const attribution = capture();
    global.gtag("event", "app_open", {
      source: attribution.source,
      medium: attribution.medium,
      campaign: attribution.campaign,
      content: attribution.content,
      landing_page: attribution.landingPage,
      campaign_reference: reference(attribution)
    });
  }, true);
})(window);
