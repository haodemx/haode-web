(() => {
  const headerInner = document.querySelector('.catalog-topbar .topbar-inner');
  if (!headerInner) return;

  const nav = headerInner.querySelector('.topnav');
  if (nav) {
    const links = [
      ['Inicio', '/'],
      ['Pantallas', '/productos/'],
      ['Micas', '/categoria/micas/'],
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
  }

  const sourceWhatsapp = document.querySelector(
    '[data-detail-whatsapp], .detail-quick-whatsapp, .detail-static-top-whatsapp, a[href*="wa.me"]'
  );
  const whatsappHref = sourceWhatsapp?.getAttribute('href')
    || 'https://wa.me/525645866014?text=Hola%20HAODE%20M%C3%A9xico%2C%20quiero%20cotizar%20un%20producto.';

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
  app.setAttribute('aria-label', 'Comprar en la APP HAODE');
  app.innerHTML = '<span class="detail-header-mark" aria-hidden="true">A</span><span>Comprar en APP</span>';

  actions.append(whatsapp, app);
  headerInner.appendChild(actions);
})();
