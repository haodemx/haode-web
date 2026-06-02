(function () {
  const WHATSAPP_PHONE = '523326684296';

  function toAssetPath(imagePath) {
    if (!imagePath) return '/haode-web/assets/products/placeholder.svg';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('//')) {
      return imagePath;
    }
    if (imagePath.startsWith('/')) {
      return imagePath;
    }
    return `/haode-web/${imagePath.replace(/^\/+/, '')}`;
  }

  function buildWhatsappUrl(item) {
    const text = item.whatsappText || `Hola HAODE, quiero cotizar: ${item.name || item.model || 'producto'}`;
    return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`;
  }

  function buildProductCard(item) {
    const article = document.createElement('article');
    article.className = 'new-product-card';

    const image = item.images && item.images.length ? item.images[0] : 'assets/products/placeholder.svg';

    const detailHref = `/haode-web/producto/${item.id}/`;

    article.innerHTML = `
      <div class="new-product-visual">
        <img src="${toAssetPath(image)}" alt="${item.name || item.model || 'Producto'}" loading="lazy" />
        <span class="new-arrival-tag">ACTIVO</span>
      </div>
      <div class="new-product-content">
        <h3>${item.name || item.model || 'Producto HAODE'}</h3>
        <p>${item.description || 'Consulta disponibilidad por WhatsApp.'}</p>
        <p class="new-arrival-note">${item.quality || ''}${item.priceText ? ` · ${item.priceText}` : ''}</p>
        <div class="new-product-actions">
          <a class="btn btn-secondary" href="${detailHref}">Ver detalles</a>
          <a class="btn btn-primary" href="${buildWhatsappUrl(item)}" target="_blank" rel="noopener noreferrer">Consultar por WhatsApp</a>
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
  }

  document.addEventListener('DOMContentLoaded', renderCategoryProducts);
})();
