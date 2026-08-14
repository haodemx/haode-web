(function () {
const WHATSAPP_PHONE = '523326684296';
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
  return window.HaodeAnalytics?.event?.(eventName, params) === true;
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
    if (window.HaodeCampaign?.wasContactTracked?.(event)) return;

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

const HOME_HERO_SLIDES = [
  {
    src: '/assets/images/home-hero-carousel/iphone-incell.webp',
    label: 'iPhone INCELL',
    alt: 'Familia de pantallas iPhone INCELL HL con modelos disponibles',
  },
  {
    src: '/assets/images/home-hero-carousel/iphone-oled.webp',
    label: 'iPhone OLED',
    alt: 'Familia de pantallas iPhone OLED HL con modelos disponibles',
  },
  {
    src: '/assets/images/home-hero-carousel/samsung-incell.webp',
    label: 'Samsung INCELL',
    alt: 'Familia de pantallas Samsung INCELL HL con modelos disponibles',
  },
  {
    src: '/assets/images/home-hero-carousel/samsung-oled.webp',
    label: 'Samsung OLED',
    alt: 'Familia de pantallas Samsung OLED HAODE con modelos disponibles',
  },
  {
    src: '/assets/images/home-hero-carousel/samsung-original.webp',
    label: 'Samsung tipo original',
    alt: 'Familia de pantallas Samsung tipo original con modelos disponibles',
  },
  {
    src: '/assets/images/home-hero-carousel/iphone-oled-diagnostica.webp',
    label: 'iPhone OLED diagnóstica',
    alt: 'Familia de pantallas iPhone OLED diagnóstica con modelos disponibles',
  },
  {
    src: '/assets/images/home-hero-carousel/samsung-plegables-incell.webp',
    label: 'Samsung plegables INCELL',
    alt: 'Pantallas Samsung plegables INCELL Z Flip y Z Fold con modelos disponibles',
  },
];

function setupHomeHeroCarousels() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  document.querySelectorAll('[data-home-hero-carousel]').forEach((carousel) => {
    const image = carousel.querySelector('[data-home-hero-carousel-image]');
    const previous = carousel.querySelector('[data-home-hero-carousel-prev]');
    const next = carousel.querySelector('[data-home-hero-carousel-next]');
    const dots = carousel.querySelector('[data-home-hero-carousel-dots]');
    const status = carousel.querySelector('[data-home-hero-carousel-status]');
    if (!image || !previous || !next || !dots || !status) return;

    let activeIndex = 0;
    let timer = null;

    const dotButtons = HOME_HERO_SLIDES.map((slide, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', `Ver ${slide.label}`);
      dot.setAttribute('data-home-hero-carousel-dot', '');
      dot.addEventListener('click', () => showSlide(index, true));
      dots.append(dot);
      return dot;
    });

    const preloadFollowingSlide = () => {
      const following = new Image();
      following.src = HOME_HERO_SLIDES[(activeIndex + 1) % HOME_HERO_SLIDES.length].src;
    };

    const renderSlide = () => {
      const slide = HOME_HERO_SLIDES[activeIndex];
      carousel.style.setProperty('--home-carousel-image', `url("${slide.src}")`);
      image.src = slide.src;
      image.alt = slide.alt;
      status.textContent = `${slide.label} · ${activeIndex + 1} de ${HOME_HERO_SLIDES.length}`;
      dotButtons.forEach((dot, index) => {
        dot.setAttribute('aria-current', index === activeIndex ? 'true' : 'false');
      });
      preloadFollowingSlide();
    };

    const stopAutoplay = () => {
      window.clearInterval(timer);
      timer = null;
    };

    const startAutoplay = () => {
      stopAutoplay();
      if (reducedMotion.matches || document.hidden) return;
      timer = window.setInterval(() => showSlide(activeIndex + 1, false), 7000);
    };

    function showSlide(index, restartAutoplay) {
      activeIndex = (index + HOME_HERO_SLIDES.length) % HOME_HERO_SLIDES.length;
      renderSlide();
      if (restartAutoplay) startAutoplay();
    }

    previous.addEventListener('click', () => showSlide(activeIndex - 1, true));
    next.addEventListener('click', () => showSlide(activeIndex + 1, true));
    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);
    carousel.addEventListener('focusin', stopAutoplay);
    carousel.addEventListener('focusout', startAutoplay);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopAutoplay();
      else startAutoplay();
    });

    if (typeof reducedMotion.addEventListener === 'function') {
      reducedMotion.addEventListener('change', startAutoplay);
    }

    renderSlide();
    startAutoplay();
  });
}

function setupReferenceMenu() {
  const button = document.querySelector('[data-reference-menu-button]');
  const panel = document.querySelector('[data-reference-menu-panel]');
  if (!button || !panel) return;

  const mobile = window.matchMedia('(max-width: 760px)');

  const setOpen = (open, { restoreFocus = false } = {}) => {
    const shouldOpen = Boolean(open) && mobile.matches;
    button.setAttribute('aria-expanded', String(shouldOpen));
    panel.hidden = mobile.matches ? !shouldOpen : false;
    if (restoreFocus) button.focus();
  };

  const syncViewport = () => setOpen(false);

  button.addEventListener('click', () => {
    setOpen(button.getAttribute('aria-expanded') !== 'true');
  });

  panel.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('a')) setOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') {
      setOpen(false, { restoreFocus: true });
    }
  });

  if (typeof mobile.addEventListener === 'function') {
    mobile.addEventListener('change', syncViewport);
  } else {
    mobile.addListener(syncViewport);
  }

  syncViewport();
}

document.addEventListener('DOMContentLoaded', attachWhatsAppTracking);
document.addEventListener('DOMContentLoaded', attachHoverVideos);
document.addEventListener('DOMContentLoaded', loadDailyAdBanner);
document.addEventListener('DOMContentLoaded', setupHomeHeroCarousels);
document.addEventListener('DOMContentLoaded', setupReferenceMenu);
})();
