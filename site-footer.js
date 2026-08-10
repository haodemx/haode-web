(() => {
  const ensureScript = (src, match) => {
    if (document.querySelector(`script[src*="${match}"]`)) return;
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    document.head.appendChild(script);
  };

  ensureScript('/analytics.js?v=20260726-growth-phase37', '/analytics.js');
  ensureScript('/campaign-attribution.js?v=20260726-growth-phase37', '/campaign-attribution.js');

  if (document.querySelector('[data-site-sales-footer]')) return;

  document.querySelectorAll('footer').forEach((existingFooter) => existingFooter.remove());

  const footer = document.createElement('footer');
  footer.className = 'site-sales-footer';
  footer.setAttribute('data-site-sales-footer', '');
  footer.innerHTML = `
    <div class="wrap site-sales-footer-grid">
      <div class="site-sales-footer-brand">
        <a href="/" aria-label="HAODE México">
          <strong>HAODE</strong>
          <span>REFACCIONES PARA CELULAR</span>
        </a>
        <p>Fábrica directa para técnicos, talleres y distribuidores en México.</p>
        <div class="site-sales-footer-proof" aria-label="Ventajas HAODE">
          <span>Stock en México bajo confirmación</span>
          <span>Garantía local</span>
          <span>Precio por cantidad</span>
        </div>
      </div>
      <nav class="site-sales-footer-nav" aria-label="Comprar en HAODE">
        <p>Comprar</p>
        <a href="/productos/">Pantallas</a>
        <a href="/micas.html">Micas</a>
        <a href="/categoria/maquinas-de-hidrogel/">Máquinas</a>
        <a href="/categoria/fundas/">Fundas</a>
        <a href="/categoria/celulares-samsung/">Celulares Samsung</a>
      </nav>
      <nav class="site-sales-footer-nav" aria-label="Atención HAODE">
        <p>Atención</p>
        <a href="/garantia/">Garantía local</a>
        <a href="/contacto/">Contacto</a>
        <a href="/distribuidores/">Distribuidores</a>
        <a href="/refacciones-celulares-mayoreo-mexico/">Mayoreo México</a>
      </nav>
      <div class="site-sales-footer-contact">
        <p>Lista grande o pedido de mayoreo</p>
        <strong>Atención privada por WhatsApp</strong>
        <span>Envía modelos, cantidades y ciudad. Confirmamos disponibilidad y precio final antes del pedido.</span>
        <div class="site-sales-footer-actions">
          <a class="site-sales-footer-whatsapp" href="https://wa.me/523326684296?text=Hola%20HAODE%20M%C3%A9xico%2C%20quiero%20enviar%20una%20lista%20de%20productos.%0AModelos%3A%0ACantidades%3A%0ACiudad%3A" target="_blank" rel="noopener noreferrer">
            <span aria-hidden="true">W</span>
            Enviar lista
          </a>
          <a class="site-sales-footer-app" href="/app/">
            <span aria-hidden="true">A</span>
            Comprar en APP
          </a>
        </div>
      </div>
    </div>
    <div class="site-sales-footer-bottom">
      <div class="wrap">
        <span>HAODE México</span>
        <span>Inventario y condiciones sujetos a confirmación.</span>
      </div>
    </div>
  `;

  document.body.appendChild(footer);

  const currentPath = window.location.pathname.replace(/\/index\.html$/, '/');
  document.querySelectorAll('.topnav a, .reference-nav a').forEach((link) => {
    const linkPath = new URL(link.href, window.location.origin).pathname;
    const isHome = linkPath === '/' && currentPath === '/';
    const isSection = linkPath !== '/' && currentPath.startsWith(linkPath);
    if (isHome || isSection) {
      link.classList.add('is-active');
      link.setAttribute('aria-current', 'page');
    }
  });
})();
