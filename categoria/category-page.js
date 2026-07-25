(function () {
  const WHATSAPP_PHONE = '525645866014';

  function toAssetPath(imagePath) {
    if (!imagePath) return '/assets/products/placeholder.svg';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('//')) {
      return imagePath;
    }
    if (imagePath.startsWith('/')) {
      return imagePath;
    }
    return `/${imagePath.replace(/^\/+/, '')}`;
  }

  function buildWhatsappUrl(item) {
    const text = item.whatsappText || `Hola HAODE, quiero cotizar: ${item.name || item.model || 'producto'}`;
    return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`;
  }

  function formatPrice(price) {
    return String(price || '').replace(/\$(\d+)\s*MXN/i, (_, amount) => `$${Number(amount).toLocaleString('es-MX')} MXN`);
  }

  function priceRowsFor(item) {
    if (item.priceText) {
      return `<p class="new-arrival-note">${item.priceText}</p>`;
    }
    if (!Array.isArray(item.prices) || !item.prices.length) return '';
    const rows = item.prices.map((price) => {
      const quantity = price.quantity || 'Precio';
      return `<span><b>${quantity}</b><strong>${formatPrice(price.price)}</strong></span>`;
    }).join('');
    return `<div class="new-arrival-price-grid" aria-label="Precios">${rows}</div>`;
  }

  function categoryLabel(category) {
    const labels = {
      'iphone-incell': 'iPhone INCELL',
      'iphone-oled': 'iPhone OLED',
      'samsung-incell': 'Samsung INCELL',
      'samsung-oled': 'Samsung OLED',
      'samsung-tipo-original': 'Samsung TIPO ORIGINAL',
      fundas: 'Fundas',
      micas: 'Micas',
      'maquinas-de-hidrogel': 'Máquinas de hidrogel',
      'productos-ai': 'Productos AI',
      'gafas-ai': 'Gafas AI',
      'camaras-inteligentes': 'Cámaras inteligentes',
    };
    if (labels[category]) return labels[category];
    return String(category || 'producto')
      .split('-')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  function renderCategoryConversionPanel(root, category, count) {
    const existing = document.querySelector('[data-category-whatsapp-panel]');
    if (existing) existing.remove();

    const label = categoryLabel(category);
    const panel = document.createElement('aside');
    panel.className = 'category-whatsapp-panel';
    panel.setAttribute('data-category-whatsapp-panel', '');
    panel.innerHTML = `
      <div class="category-whatsapp-grid">
        <span class="category-whatsapp-mark" aria-hidden="true">W</span>
        <div>
          <p>Compra por cantidad</p>
          <h2>Envía tu lista de ${label} por WhatsApp</h2>
          <span>${count} modelos visibles. Confirmamos disponibilidad, precio final y envío antes de preparar el pedido.</span>
        </div>
      </div>
      <a class="btn btn-primary category-whatsapp-cta" href="${buildWhatsappUrl({ name: `lista de ${label}` })}" target="_blank" rel="noopener noreferrer">Enviar lista por WhatsApp</a>
    `;
    root.insertAdjacentElement('afterend', panel);
  }

  function buildProductCard(item) {
    const article = document.createElement('article');
    article.className = 'new-product-card';

    const image = item.images && item.images.length ? item.images[0] : 'assets/products/placeholder.svg';
    const priceRows = priceRowsFor(item);

    const detailHref = `/producto/${item.id}/`;

    article.innerHTML = `
      <div class="new-product-visual">
        <img src="${toAssetPath(image)}" alt="${item.name || item.model || 'Producto'}" loading="lazy" decoding="async" />
        <span class="new-arrival-tag">ACTIVO</span>
      </div>
      <div class="new-product-content">
        <h3>${item.name || item.model || 'Producto HAODE'}</h3>
        <div class="new-product-badges" aria-label="Ventajas HAODE">
          <span>Stock en México</span>
          <span>Precio por cantidad</span>
          <span>WhatsApp privado</span>
        </div>
        <p>${item.description || 'Producto HAODE México con atención por WhatsApp para técnicos, talleres y distribuidores. Confirma disponibilidad actual, modelo y cantidad antes de comprar.'}</p>
        <p class="new-arrival-note">${item.quality || ''}</p>
        ${priceRows}
        <div class="new-product-actions">
          <a class="btn btn-secondary" href="${detailHref}">Ver detalles</a>
          <a class="btn btn-primary category-whatsapp-primary" href="${buildWhatsappUrl(item)}" target="_blank" rel="noopener noreferrer">Enviar lista por WhatsApp</a>
        </div>
      </div>
    `;

    return article;
  }

  function renderCategoryProducts() {
    const root = document.querySelector('[data-category-products]');
    if (!root || !window.HAODE_PRODUCTS_DATA) return;

    const category = document.body.dataset.category;
    const products = window.HAODE_PRODUCTS_DATA.filter((item) => item.category === category);

    root.innerHTML = '';

    if (!products.length) {
      const empty = document.createElement('div');
      empty.className = 'contact-whatsapp-panel';
      empty.innerHTML = '<h2>Sin productos por ahora</h2><p>Estamos preparando nuevos modelos para esta categoría.</p>';
      root.appendChild(empty);
      return;
    }

    for (const item of products) {
      root.appendChild(buildProductCard(item));
    }

    renderCategoryConversionPanel(root, category, products.length);
  }

  document.addEventListener('DOMContentLoaded', renderCategoryProducts);
})();
