(function attachHaodeConversions(global) {
  'use strict';
  if (global.HaodeConversions) return;
  const EVENTS = new Set(['ViewProduct', 'WhatsAppClick', 'Lead', 'Purchase']);
  const STORAGE_KEY = 'haode-conversions-v1';
  const TTL = 30 * 60 * 1000;
  const MAX_EVENTS = 100;
  const layer = [];
  const seen = new Map();
  const clicks = new WeakSet();
  const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  let attribution = {};
  let viewKey = '';
  let viewSequence = 0;

  function consented() {
    const consent = global.HaodePrivacy?.getConsent?.();
    return consent?.analytics === true && consent?.advertising === true;
  }

  function token(value) {
    if (typeof value !== 'string' || value.length > 100) return '';
    if (!/^[a-zA-Z0-9_-]+$/.test(value) || /\d{10,}/.test(value.replace(/[-_]/g, ''))) return '';
    return value;
  }

  function safePath(value) {
    return typeof value === 'string' && /^\/[a-zA-Z0-9/_-]*(?:\.html)?$/.test(value) && !/\d{10,}/.test(value.replace(/[-_]/g, ''))
      ? value.slice(0, 240) : '/';
  }

  function clear() {
    layer.length = 0;
    seen.clear();
    attribution = {};
    try { global.sessionStorage.removeItem(STORAGE_KEY); } catch { /* Storage is optional. */ }
  }

  function restore() {
    if (!consented()) return clear();
    try {
      const stored = JSON.parse(global.sessionStorage.getItem(STORAGE_KEY) || '{}');
      if (Number.isFinite(stored.saved_at) && Date.now() - stored.saved_at >= 0 && Date.now() - stored.saved_at < TTL) {
        for (const key of UTM_KEYS) if (token(stored.attribution?.[key])) attribution[key] = token(stored.attribution[key]);
        if (token(stored.attribution?.source)) attribution.source = token(stored.attribution.source);
        attribution.landing_page = safePath(stored.attribution?.landing_page);
        for (const [key, time] of Array.isArray(stored.seen) ? stored.seen.slice(-MAX_EVENTS) : []) {
          if (/^Lead:[a-f0-9-]{36}$/.test(key) && Number.isFinite(time) && Date.now() - time >= 0 && Date.now() - time < TTL) seen.set(key, time);
        }
      }
    } catch { /* Corrupt or disabled storage does not affect browsing. */ }
  }

  function save() {
    if (!consented()) return;
    try {
      global.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
        saved_at: Date.now(), attribution,
        seen: [...seen].filter(([key]) => key.startsWith('Lead:')).slice(-MAX_EVENTS)
      }));
    } catch { /* Storage is optional. */ }
  }

  function capture() {
    if (!consented()) return {};
    const params = new URLSearchParams(global.location.search);
    if (UTM_KEYS.some(key => params.has(key))) {
      attribution = { landing_page: safePath(global.location.pathname) };
      for (const key of UTM_KEYS) if (token(params.get(key))) attribution[key] = token(params.get(key));
    }
    if (!attribution.source) {
      let referrer = '';
      try {
        const host = new URL(global.document.referrer).hostname;
        if (host === 'chatgpt.com' || host === 'chat.openai.com') referrer = 'chatgpt';
      } catch { /* No referrer. */ }
      attribution.source = attribution.utm_source || referrer || 'haode_web';
    }
    attribution.landing_page ||= safePath(global.location.pathname);
    save();
    return { ...attribution };
  }

  function track(name, parameters = {}) {
    if (!EVENTS.has(name)) return { accepted: false, reason: 'event_not_allowed' };
    // No online payment confirmation exists in this website. Neither a quote nor a lead is a purchase.
    if (name === 'Purchase') return { accepted: false, reason: 'purchase_not_configured' };
    if (!consented()) return { accepted: false, reason: 'consent_required' };
    if (!parameters || typeof parameters !== 'object') return { accepted: false, reason: 'invalid_parameters' };
    const productId = token(parameters.product_id);
    let key;
    const safe = {};
    if (name === 'ViewProduct') {
      if (!productId) return { accepted: false, reason: 'product_required' };
      safe.product_id = productId;
      key = `ViewProduct:${viewSequence}:${productId}`;
    } else if (name === 'WhatsAppClick') {
      safe.contact_area = ['product', 'cart', 'header', 'site_link'].includes(parameters.contact_area) ? parameters.contact_area : 'site_link';
      if (productId) safe.product_id = productId;
      key = `WhatsAppClick:${safe.contact_area}:${productId}`;
    } else {
      // Accept only the caller's opaque request UUID, never customer data or the ERP order number.
      if (parameters.lead_registered !== true || typeof parameters.request_id !== 'string' || !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(parameters.request_id || '')) {
        return { accepted: false, reason: 'registered_lead_required' };
      }
      safe.lead_registered = true;
      key = `Lead:${parameters.request_id.toLowerCase()}`;
    }
    const now = Date.now();
    const limit = name === 'WhatsAppClick' ? 1500 : TTL;
    if (seen.has(key) && now - seen.get(key) < limit) return { accepted: false, reason: 'duplicate' };
    for (const [oldKey, time] of seen) if (now - time >= TTL) seen.delete(oldKey);
    if (seen.size >= MAX_EVENTS) seen.delete(seen.keys().next().value);
    seen.set(key, now);
    const event = Object.freeze({
      event: name,
      event_id: name === 'Lead' ? `lead_${parameters.request_id.toLowerCase()}` : global.crypto.randomUUID(),
      occurred_at: new Date(now).toISOString(),
      page_path: safePath(global.location.pathname),
      ...capture(),
      ...safe
    });
    layer.push(event);
    if (layer.length > MAX_EVENTS) layer.shift();
    save();
    // Deliberately local. There is no Pixel ID, SDK, API key or network transport in this module.
    global.dispatchEvent(new CustomEvent('haode:conversion', { detail: event }));
    return { accepted: true, event };
  }

  function viewProduct(productId) {
    if (!productId) { viewKey = ''; return { accepted: false, reason: 'product_required' }; }
    const currentKey = `${global.location.pathname}${global.location.hash}:${productId}`;
    if (currentKey !== viewKey) { viewKey = currentKey; viewSequence += 1; }
    return track('ViewProduct', { product_id: productId });
  }

  global.HaodeConversions = Object.freeze({
    track, viewProduct,
    getEvents: () => layer.map(event => ({ ...event })),
    status: Object.freeze({ ViewProduct: 'IMPLEMENTED', WhatsAppClick: 'IMPLEMENTED', Lead: 'IMPLEMENTED', Purchase: 'NOT CONFIGURED', transport: 'NOT CONFIGURED' })
  });
  restore();
  if (consented()) capture();
  global.addEventListener('haode:privacy-consent', () => {
    if (!consented()) clear();
    else {
      capture();
      if (global.HaodeConversionProductId) viewProduct(global.HaodeConversionProductId);
    }
  });
  global.document.addEventListener('click', event => {
    const link = event.target.closest?.('a[href]');
    if (!link || link.classList.contains('disabled') || link.getAttribute('aria-disabled') === 'true') return;
    let url;
    try { url = new URL(link.href, global.location.href); } catch { return; }
    if (url.protocol !== 'https:' || !['wa.me', 'api.whatsapp.com', 'web.whatsapp.com'].includes(url.hostname)) return;
    if (clicks.has(event)) return;
    clicks.add(event);
    const area = link.hasAttribute('data-whatsapp-link') ? 'cart'
      : link.hasAttribute('data-product-whatsapp') || link.hasAttribute('data-detail-whatsapp') ? 'product'
      : link.hasAttribute('data-detail-header-whatsapp') ? 'header' : 'site_link';
    const productId = link.getAttribute('data-product-whatsapp') || (area === 'product' ? global.HaodeConversionProductId : undefined);
    track('WhatsAppClick', { contact_area: area, product_id: productId });
  }, true);
  if (global.HaodeConversionProductId) viewProduct(global.HaodeConversionProductId);
})(window);
