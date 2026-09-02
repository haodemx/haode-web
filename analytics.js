(function attachHaodeAnalytics(global) {
  "use strict";

  const MEASUREMENT_ID = "G-22TCLJDXYS";
  const CONSENT_STORAGE_KEY = "haode-privacy-consent-v1";
  const CONSENT_VERSION = 1;
  const SAFE_ANALYTICS_QUERY_KEYS = new Set([
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "gclid",
    "dclid",
    "gbraid",
    "wbraid"
  ]);
  const dataLayer = global.dataLayer = global.dataLayer || [];

  if (typeof global.gtag !== "function") {
    global.gtag = function gtag() {
      dataLayer.push(arguments);
    };
  }

  function readStoredConsent() {
    try {
      const value = JSON.parse(global.localStorage.getItem(CONSENT_STORAGE_KEY) || "null");
      if (value?.version !== CONSENT_VERSION) return null;
      if (typeof value.analytics !== "boolean" || typeof value.advertising !== "boolean") return null;
      return { analytics: value.analytics, advertising: value.advertising };
    } catch {
      return null;
    }
  }

  function consentParameters(choice, waitForUpdate = false) {
    return {
      analytics_storage: choice.analytics ? "granted" : "denied",
      ad_storage: choice.advertising ? "granted" : "denied",
      ad_user_data: choice.advertising ? "granted" : "denied",
      ad_personalization: choice.advertising ? "granted" : "denied",
      personalization_storage: choice.advertising ? "granted" : "denied",
      functionality_storage: "granted",
      security_storage: "granted",
      ...(waitForUpdate ? { wait_for_update: 500 } : {})
    };
  }

  function isSensitiveQueryValue(value) {
    const raw = String(value || "").trim();
    const compactPhone = raw.replace(/[()+.\s-]/g, "");
    return /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(raw)
      || /^\d{10,15}$/.test(compactPhone);
  }

  function analyticsPageLocation() {
    try {
      const current = new URL(global.location.href);
      const safe = new URL(current.pathname, current.origin);
      const source = String(current.searchParams.get("utm_source") || "").toLowerCase();
      if (source === "haode_website" || source === "haode_app") return safe.toString();
      for (const key of SAFE_ANALYTICS_QUERY_KEYS) {
        let value = current.searchParams.get(key);
        if (!value || isSensitiveQueryValue(value)) continue;
        if (key === "utm_medium" && value.toLowerCase() === "organic_social") value = "social";
        safe.searchParams.set(key, value.slice(0, 160));
      }
      return safe.toString();
    } catch {
      return `${global.location.origin}${global.location.pathname}`;
    }
  }

  const storedConsent = readStoredConsent();
  let currentConsent = storedConsent || { analytics: false, advertising: false };

  // Consent defaults must be queued before the Google tag is loaded or configured.
  global.gtag("consent", "default", consentParameters(currentConsent, true));
  global.gtag("set", "ads_data_redaction", true);

  function ensureGoogleTagLoaded() {
    if (!currentConsent.analytics && !currentConsent.advertising) return;
    if (global.document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}"]`)) return;
    const loader = global.document.createElement("script");
    loader.async = true;
    loader.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    loader.setAttribute("data-haode-analytics-loader", "");
    global.document.head.appendChild(loader);
  }

  global.gtag("js", new Date());
  global.gtag("config", MEASUREMENT_ID, {
    allow_google_signals: false,
    allow_ad_personalization_signals: currentConsent.advertising,
    page_location: analyticsPageLocation()
  });
  ensureGoogleTagLoaded();

  function saveConsent(choice) {
    try {
      global.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({
        version: CONSENT_VERSION,
        analytics: choice.analytics,
        advertising: choice.advertising,
        updatedAt: new Date().toISOString()
      }));
    } catch {
      // Privacy controls must remain usable when storage is unavailable.
    }
  }

  function updateConsent(choice) {
    currentConsent = {
      analytics: Boolean(choice.analytics),
      advertising: Boolean(choice.advertising)
    };
    saveConsent(currentConsent);
    global.gtag("consent", "update", consentParameters(currentConsent));
    global.gtag("config", MEASUREMENT_ID, {
      allow_google_signals: false,
      allow_ad_personalization_signals: currentConsent.advertising,
      send_page_view: false
    });
    ensureGoogleTagLoaded();
    global.dispatchEvent(new CustomEvent("haode:privacy-consent", {
      detail: { ...currentConsent }
    }));
    return { ...currentConsent };
  }

  function ensureConsentStylesheet() {
    if (global.document.querySelector('link[data-haode-privacy-styles]')) return;
    const stylesheet = global.document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = "/privacy-consent.css?v=20260902-content-consistency";
    stylesheet.setAttribute("data-haode-privacy-styles", "");
    global.document.head.appendChild(stylesheet);
  }

  function mountPrivacyControls() {
    if (!global.document.body || global.document.querySelector("[data-haode-privacy-root]")) return;
    ensureConsentStylesheet();

    const root = global.document.createElement("div");
    root.setAttribute("data-haode-privacy-root", "");
    root.innerHTML = `
      <section class="haode-privacy-banner" data-haode-privacy-banner role="region" aria-labelledby="haode-privacy-title" aria-describedby="haode-privacy-copy" hidden>
        <div class="haode-privacy-banner-copy">
          <strong id="haode-privacy-title">Tu privacidad en HAODE</strong>
          <p id="haode-privacy-copy">Usamos almacenamiento necesario para el sitio. Con tu permiso, medimos visitas y campañas para mejorar la atención.</p>
        </div>
        <div class="haode-privacy-actions">
          <button type="button" class="haode-privacy-button haode-privacy-button-secondary" data-haode-consent-necessary>Solo necesarias</button>
          <button type="button" class="haode-privacy-button haode-privacy-button-secondary" data-haode-consent-settings>Configurar</button>
          <button type="button" class="haode-privacy-button haode-privacy-button-primary" data-haode-consent-all>Aceptar todas</button>
        </div>
      </section>

      <div class="haode-privacy-backdrop" data-haode-privacy-backdrop hidden>
        <section class="haode-privacy-dialog" data-haode-privacy-dialog role="dialog" aria-modal="true" aria-labelledby="haode-privacy-dialog-title" aria-describedby="haode-privacy-dialog-copy" tabindex="-1">
          <div class="haode-privacy-dialog-head">
            <div>
              <span>Preferencias</span>
              <h2 id="haode-privacy-dialog-title">Configura tu privacidad</h2>
            </div>
            <button type="button" class="haode-privacy-close" data-haode-consent-close aria-label="Cerrar preferencias">×</button>
          </div>
          <p id="haode-privacy-dialog-copy">Puedes cambiar esta selección en cualquier momento desde el botón Privacidad.</p>
          <label class="haode-privacy-option haode-privacy-option-required">
            <input type="checkbox" checked disabled />
            <span><strong>Necesarias</strong><small>Permiten funciones básicas y seguridad del sitio.</small></span>
          </label>
          <label class="haode-privacy-option">
            <input type="checkbox" data-haode-consent-analytics />
            <span><strong>Analítica</strong><small>Ayuda a entender visitas, búsquedas y uso del catálogo.</small></span>
          </label>
          <label class="haode-privacy-option">
            <input type="checkbox" data-haode-consent-advertising />
            <span><strong>Publicidad</strong><small>Permite medir campañas sin mostrar datos de formularios.</small></span>
          </label>
          <div class="haode-privacy-dialog-actions">
            <button type="button" class="haode-privacy-button haode-privacy-button-secondary" data-haode-consent-dialog-necessary>Solo necesarias</button>
            <button type="button" class="haode-privacy-button haode-privacy-button-primary" data-haode-consent-save>Guardar selección</button>
          </div>
        </section>
      </div>

      <button type="button" class="haode-privacy-manage" data-haode-consent-manage aria-label="Cambiar preferencias de privacidad" title="Privacidad" hidden>Privacidad</button>
    `;
    global.document.body.appendChild(root);
    if (global.document.querySelector(".bottom-nav")) {
      root.classList.add("haode-privacy-has-bottom-nav");
    }
    if (global.document.querySelector(".reference-sticky-whatsapp")) {
      root.classList.add("haode-privacy-has-sticky-whatsapp");
    }

    const banner = root.querySelector("[data-haode-privacy-banner]");
    const backdrop = root.querySelector("[data-haode-privacy-backdrop]");
    const dialog = root.querySelector("[data-haode-privacy-dialog]");
    const analyticsInput = root.querySelector("[data-haode-consent-analytics]");
    const advertisingInput = root.querySelector("[data-haode-consent-advertising]");
    const manageButton = root.querySelector("[data-haode-consent-manage]");
    let previousFocus = null;

    function showBanner() {
      backdrop.hidden = true;
      banner.hidden = false;
      manageButton.hidden = true;
    }

    function hideChoiceSurfaces() {
      banner.hidden = true;
      backdrop.hidden = true;
      manageButton.hidden = false;
    }

    function openDialog() {
      previousFocus = global.document.activeElement;
      analyticsInput.checked = currentConsent.analytics;
      advertisingInput.checked = currentConsent.advertising;
      banner.hidden = true;
      manageButton.hidden = true;
      backdrop.hidden = false;
      global.requestAnimationFrame(() => dialog.focus());
    }

    function closeDialog() {
      backdrop.hidden = true;
      if (readStoredConsent()) {
        manageButton.hidden = false;
      } else {
        banner.hidden = false;
      }
      previousFocus?.focus?.();
    }

    function choose(choice) {
      updateConsent(choice);
      hideChoiceSurfaces();
      manageButton.focus();
    }

    root.querySelector("[data-haode-consent-necessary]").addEventListener("click", () => choose({ analytics: false, advertising: false }));
    root.querySelector("[data-haode-consent-all]").addEventListener("click", () => choose({ analytics: true, advertising: true }));
    root.querySelector("[data-haode-consent-settings]").addEventListener("click", openDialog);
    root.querySelector("[data-haode-consent-manage]").addEventListener("click", openDialog);
    root.querySelector("[data-haode-consent-close]").addEventListener("click", closeDialog);
    root.querySelector("[data-haode-consent-dialog-necessary]").addEventListener("click", () => choose({ analytics: false, advertising: false }));
    root.querySelector("[data-haode-consent-save]").addEventListener("click", () => choose({
      analytics: analyticsInput.checked,
      advertising: advertisingInput.checked
    }));
    backdrop.addEventListener("click", (event) => {
      if (event.target === backdrop) closeDialog();
    });
    dialog.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDialog();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(dialog.querySelectorAll('button:not([disabled]), input:not([disabled])'));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && global.document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && global.document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    if (storedConsent) {
      hideChoiceSurfaces();
    } else {
      showBanner();
    }
  }

  if (global.document.readyState === "loading") {
    global.document.addEventListener("DOMContentLoaded", mountPrivacyControls, { once: true });
  } else {
    mountPrivacyControls();
  }

  global.HaodeAnalytics = Object.freeze({
    measurementId: MEASUREMENT_ID,
    event(name, parameters = {}) {
      if (!currentConsent.analytics) return false;
      global.gtag("event", name, parameters);
      return true;
    }
  });

  global.HaodePrivacy = Object.freeze({
    getConsent() {
      return { ...currentConsent };
    },
    updateConsent
  });
})(window);
