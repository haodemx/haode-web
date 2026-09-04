(() => {
  const ensureScript = (src, match) => {
    if (document.querySelector(`script[src*="${match}"]`)) return;
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    document.head.appendChild(script);
  };

  ensureScript('/analytics.js?v=20260813-ga4-conversions', '/analytics.js');
  ensureScript('/campaign-attribution.js?v=20260813-ga4-conversions', '/campaign-attribution.js');

  if (document.body.classList.contains('product-detail-page')) {
    document.body.classList.add('conversion-reference-page');
  }

  const headerInner = document.querySelector('.catalog-topbar .topbar-inner');
  if (!headerInner) return;

  const brandLogo = headerInner.querySelector('.brand-logo');
  if (brandLogo) {
    brandLogo.src = '/assets/images/factory-store-wordmark.png';
    brandLogo.alt = 'HAODE Refacciones para Celular';
    brandLogo.width = 200;
    brandLogo.height = 58;
  }

  const nav = headerInner.querySelector('.topnav');
  if (nav) {
    const links = [
      ['Inicio', '/'],
      ['Pantallas', '/productos/'],
      ['Micas', '/micas.html'],
      ['Máquinas', '/categoria/maquinas-de-hidrogel/'],
      ['Fundas', '/categoria/fundas/'],
      ['Garantía', '/garantia/'],
    ];
    nav.replaceChildren(...links.map(([label, href]) => {
      const link = document.createElement('a');
      link.href = href;
      link.textContent = label;
      return link;
    }));
    nav.setAttribute('data-detail-nav', '');

    const currentPath = window.location.pathname.replace(/\/index\.html$/, '/');
    nav.querySelectorAll('a').forEach((link) => {
      const linkPath = new URL(link.href, window.location.origin).pathname;
      const isHome = linkPath === '/' && currentPath === '/';
      const isSection = linkPath !== '/' && currentPath.startsWith(linkPath);
      if (isHome || isSection) {
        link.classList.add('is-active');
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  const sourceWhatsapp = document.querySelector(
    '[data-detail-whatsapp], .detail-quick-whatsapp, .detail-static-top-whatsapp, a[href*="wa.me"]'
  );
  const whatsappHref = sourceWhatsapp?.getAttribute('href')
    || 'https://wa.me/523326684296?text=Hola%20HAODE%20M%C3%A9xico%2C%20quiero%20cotizar%20un%20producto.';

  if (headerInner.querySelector('[data-detail-header-actions]')) return;

  const actions = document.createElement('div');
  actions.className = 'detail-header-actions';
  actions.setAttribute('data-detail-header-actions', '');

  const whatsapp = document.createElement('a');
  whatsapp.className = 'detail-header-action detail-header-whatsapp';
  whatsapp.setAttribute('data-detail-header-whatsapp', '');
  whatsapp.href = whatsappHref;
  whatsapp.target = '_blank';
  whatsapp.rel = 'noopener noreferrer';
  whatsapp.setAttribute('aria-label', 'Cotizar por WhatsApp privado');
  whatsapp.innerHTML = '<span class="detail-header-mark" aria-hidden="true">W</span><span>WhatsApp privado</span>';

  const app = document.createElement('a');
  app.className = 'detail-header-action detail-header-app';
  app.setAttribute('data-detail-header-app', '');
  app.href = '/app/';
  app.setAttribute('aria-label', 'Comprar en APP HAODE');
  app.innerHTML = '<span class="detail-header-mark" aria-hidden="true">A</span><span>Comprar en APP</span>';

  actions.append(whatsapp, app);
  headerInner.appendChild(actions);

  if (!document.querySelector('[data-site-sales-footer], script[src*="/site-footer.js"]')) {
    const footerScript = document.createElement('script');
    footerScript.src = '/site-footer.js?v=20260813-final-ui-seo';
    footerScript.defer = true;
    document.body.appendChild(footerScript);
  }
})();
