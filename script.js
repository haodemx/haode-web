(function () {
const WHATSAPP_PHONE = '525645866014';
const SERVICE_WORKER_URL = '/service-worker.js';

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker.register(SERVICE_WORKER_URL, { scope: '/' })
      .catch((error) => {
        console.info('HAODE PWA no pudo registrar service worker:', error.message);
      });
  });
}

registerServiceWorker();

function displayText(value) {
  return String(value || '').trim();
}

async function loadDailyAdBanner() {
  const banner = document.querySelector('[data-daily-ad]');
  if (!banner) return;

  try {
    const response = await fetch('/data/marketing/daily-ad-latest.json', { cache: 'no-store' });
    if (!response.ok) return;
    const ad = await response.json();
    if (!ad || ad.status !== 'draft') return;

    const title = banner.querySelector('[data-daily-ad-title]');
    const subtitle = banner.querySelector('[data-daily-ad-subtitle]');
    const cta = banner.querySelector('[data-daily-ad-cta]');
    if (title) title.textContent = displayText(ad.website_banner_title || ad.main_category || 'Producto destacado');
    if (subtitle) subtitle.textContent = displayText(ad.website_banner_subtitle || ad.headline_es || 'Consulta disponibilidad por WhatsApp.');
    if (cta && (ad.cta_website || ad.cta_whatsapp)) cta.href = ad.cta_website || ad.cta_whatsapp;
    banner.hidden = false;
  } catch (error) {
    console.info('HAODE banner diario no disponible:', error.message);
  }
}

function buildWhatsAppMessage(data) {
  const lines = [
    'Hola HAODE México, quiero cotizar por WhatsApp:',
    `Nombre: ${data.nombre || 'N/A'}`,
    `Modelo/SKU: ${data.producto || 'N/A'}`,
    `Cantidad: ${data.cantidad || 'N/A'}`,
    `Ciudad: ${data.ciudad || 'N/A'}`,
    '¿Me pueden confirmar stock en México, precio por cantidad, garantía local y envío?',
  ];

  return lines.join('\n');
}

function openWhatsApp(message) {
  const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
  trackWhatsAppContact({ contact_area: 'quote_form' });
  window.open(url, '_blank', 'noopener,noreferrer');
}

function trafficSource() {
  if (window.HaodeCampaign) return window.HaodeCampaign.capture({ channel: 'haode_web' }).source;

  const params = new URLSearchParams(window.location.search);
  let storedSource = '';
  try {
    storedSource = sessionStorage.getItem('haode_traffic_source') || '';
  } catch {
    storedSource = '';
  }

  const source = params.get('utm_source') || storedSource || 'website';
  try {
    sessionStorage.setItem('haode_traffic_source', source);
  } catch {
    // Analytics attribution must never block the contact flow.
  }
  return source;
}

function trackWebsiteEvent(eventName, params = {}) {
  if (typeof window.gtag === 'function') window.gtag('event', eventName, params);
}

function trackWhatsAppContact(params = {}) {
  trackWebsiteEvent('contact', {
    method: 'whatsapp',
    source: trafficSource(),
    page_path: window.location.pathname || '/',
    ...params,
  });
}

function attachQuoteForm(form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const data = {
      nombre: String(formData.get('nombre') || '').trim(),
      producto: String(formData.get('producto') || '').trim(),
      cantidad: String(formData.get('cantidad') || '').trim(),
      ciudad: String(formData.get('ciudad') || '').trim(),
    };

    openWhatsApp(buildWhatsAppMessage(data));
  });
}

document.querySelectorAll('[data-quote-form]').forEach(attachQuoteForm);

function attachWhatsAppTracking() {
  if (document.querySelector('script[src*="products.js"]')) return;

  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    const whatsappLink = event.target.closest('a[href*="wa.me"], a[href*="api.whatsapp.com"]');
    if (!whatsappLink) return;

    trackWhatsAppContact({
      contact_area: whatsappLink.hasAttribute('data-daily-ad-cta') ? 'daily_ad_banner' : 'site_link',
      link_text: displayText(whatsappLink.textContent).slice(0, 80),
    });
  });
}

function attachHoverVideos() {
  document.querySelectorAll('[data-hover-video-card]').forEach((card) => {
    const video = card.querySelector('video');
    if (!video) return;

    const playVideo = () => {
      if (video.readyState >= 1) {
        video.play().catch(() => {});
      } else {
        video.addEventListener('loadeddata', () => video.play().catch(() => {}), { once: true });
      }
    };

    const resetVideo = () => {
      video.pause();
      video.currentTime = 0;
    };

    card.addEventListener('mouseenter', playVideo);
    card.addEventListener('mouseleave', resetVideo);
    card.addEventListener('focusin', playVideo);
    card.addEventListener('focusout', resetVideo);
  });
}

document.addEventListener('DOMContentLoaded', attachWhatsAppTracking);
document.addEventListener('DOMContentLoaded', attachHoverVideos);
document.addEventListener('DOMContentLoaded', loadDailyAdBanner);
})();
