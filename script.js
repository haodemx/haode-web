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
    'Hola HAODE, quiero cotizar:',
    `Nombre: ${data.nombre || 'N/A'}`,
    `Producto: ${data.producto || 'N/A'}`,
    `Cantidad: ${data.cantidad || 'N/A'}`,
    `Ciudad: ${data.ciudad || 'N/A'}`,
  ];

  return lines.join('\n');
}

function openWhatsApp(message) {
  const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
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

document.addEventListener('DOMContentLoaded', attachHoverVideos);
document.addEventListener('DOMContentLoaded', loadDailyAdBanner);
})();
