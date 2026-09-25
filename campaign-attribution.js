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
        const hasAttribution = ["source", "medium", "campaign", "content", "term"]
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

  function referrerAttribution() {
    try {
      const host = global.document.referrer ? new URL(global.document.referrer).hostname.toLowerCase() : "";
      const referrerHost = host.replace(/^www\./, "").slice(0, 160);
      if (!host) return { source: "direct", medium: "none", referrerHost: "" };
      if (/(^|\.)(chatgpt\.com|chat\.openai\.com)$/i.test(host)) return { source: "chatgpt", medium: "ai_referral", referrerHost };
      if (/(^|\.)perplexity\.ai$/i.test(host)) return { source: "perplexity", medium: "ai_referral", referrerHost };
      if (/(^|\.)gemini\.google\.com$/i.test(host)) return { source: "gemini", medium: "ai_referral", referrerHost };
      if (/(^|\.)copilot\.microsoft\.com$/i.test(host)) return { source: "copilot", medium: "ai_referral", referrerHost };
      if (/(^|\.)claude\.ai$/i.test(host)) return { source: "claude", medium: "ai_referral", referrerHost };
      if (/google\./i.test(host)) return { source: "google", medium: "organic_search", referrerHost };
      if (/(^|\.)bing\.com$/i.test(host)) return { source: "bing", medium: "organic_search", referrerHost };
      if (/instagram/i.test(host)) return { source: "instagram", medium: "organic_social", referrerHost };
      if (/facebook|fb\.com/i.test(host)) return { source: "facebook", medium: "organic_social", referrerHost };
      if (/tiktok/i.test(host)) return { source: "tiktok", medium: "organic_social", referrerHost };
      if (/(^|\.)(x\.com|twitter\.com|linkedin\.com|youtube\.com|youtu\.be)$/i.test(host)) {
        return { source: normalizeToken(host.replace(/^www\./, ""), "social"), medium: "organic_social", referrerHost };
      }
      return { source: normalizeToken(host.replace(/^www\./, ""), "referral"), medium: "referral", referrerHost };
    } catch {
      return { source: "direct", medium: "none", referrerHost: "" };
    }
  }

  function capture({ channel = "haode_web" } = {}) {
    const params = new URLSearchParams(global.location.search);
    const stored = readStored();
    const hasIncomingCampaign = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]
      .some((key) => params.has(key));
    const incomingReferrer = referrerAttribution();
    const storedOrReferrerSource = normalizeToken(stored.source || incomingReferrer.source, "direct");
    const inferredMedium = normalizeToken(stored.medium || incomingReferrer.medium, "none");

    const attribution = hasIncomingCampaign
      ? {
          source: normalizeToken(params.get("utm_source") || params.get("source"), "direct"),
          medium: normalizeToken(params.get("utm_medium"), "campaign"),
          campaign: normalizeToken(params.get("utm_campaign")),
          content: normalizeToken(params.get("utm_content")),
          term: normalizeToken(params.get("utm_term")),
          landingPage: global.location.pathname || "/",
          entryChannel: normalizeToken(channel, "haode_web"),
          referrerHost: incomingReferrer.referrerHost,
          capturedAt: Date.now()
        }
      : {
          source: storedOrReferrerSource,
          medium: normalizeToken(stored.medium, inferredMedium),
          campaign: normalizeToken(stored.campaign),
          content: normalizeToken(stored.content),
          term: normalizeToken(stored.term),
          landingPage: String(stored.landingPage || global.location.pathname || "/").slice(0, 240),
          entryChannel: normalizeToken(stored.entryChannel || channel, "haode_web"),
          referrerHost: String(stored.referrerHost || incomingReferrer.referrerHost || "").slice(0, 160),
          capturedAt: Number(stored.capturedAt || Date.now())
        };

    storeAttribution(attribution);
    return attribution;
  }

  function reference(attribution) {
    return [attribution?.source, attribution?.campaign, attribution?.content].filter(Boolean).join("/");
  }

  function analyticsParameters(attribution) {
    return {
      attribution_source: attribution.source,
      attribution_medium: attribution.medium,
      attribution_campaign: attribution.campaign,
      attribution_content: attribution.content,
      landing_page: attribution.landingPage,
      campaign_reference: reference(attribution),
      entry_channel: attribution.entryChannel,
      referrer_host: attribution.referrerHost
    };
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
    const params = new URLSearchParams(global.location.search);
    const hasIncomingCampaign = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]
      .some((key) => params.has(key));
    const storedAttribution = readStored();
    if (!hasIncomingCampaign && !reference(storedAttribution)) return;
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
    if (link.closest?.(".c-nav-actions, header")) return "header";
    if (link.closest?.(".c-hero-actions")) return "home_hero";
    if (link.classList.contains("haode-hero-primary")) return "home_hero";
    if (link.matches?.(".floating-cta, .reference-sticky-whatsapp, .zay-floating, .haode-mobile-checkout-bar a")) return "floating";
    if (link.closest?.("footer")) return "footer";
    if ((global.location.pathname || "").startsWith("/contacto")) return "contacto";
    if ((global.location.pathname || "").startsWith("/tienda-oficial-hl-cdmx")) return "tienda";
    return "site_link";
  }

  function wasContactTracked(event) {
    return Boolean(event && contactTrackedEvents.has(event));
  }

  global.HaodeCampaign = Object.freeze({
    capture,
    normalizeToken,
    reference,
    analyticsParameters,
    decorateWhatsAppLink,
    contactArea,
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
    const tracked = global.HaodeAnalytics?.event?.("contact", {
      method: "whatsapp",
      ...analyticsParameters(attribution),
      page_path: global.location.pathname || "/",
      contact_area: contactArea(link)
    });
    if (tracked) {
      contactTrackedEvents.add(event);
    }
  }, true);

  global.document.addEventListener("click", (event) => {
    const link = event.target.closest?.('a[href^="/app/"], a[href*="haode.com.mx/app/"]');
    if (!link) return;
    const attribution = capture();
    global.HaodeAnalytics?.event?.("app_open", {
      ...analyticsParameters(attribution)
    });
  }, true);
})(window);
