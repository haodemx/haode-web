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
    const existingText = item.whatsappText || '';
    const productName = item.name || item.model || 'producto';
    const text = /stock en M[eé]xico/i.test(existingText) && /precio por cantidad/i.test(existingText) && /garant[ií]a local/i.test(existingText)
      ? existingText
      : [
        'Hola HAODE México, quiero cotizar este producto:',
        `Producto: ${productName}`,
        `SKU: ${item.sku || item.id || 'N/A'}`,
        'Cantidad:',
        'Ciudad:',
        '¿Me confirman stock en México, precio por cantidad, garantía local y envío?',
      ].join('\n');
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
        <span class="new-arrival-tag">SKU ${item.sku || item.id || 'HAODE'}</span>
      </div>
      <div class="new-product-content">
        <h3>${item.name || item.model || 'Producto HAODE'}</h3>
        <div class="new-product-badges" aria-label="Ventajas HAODE">
          <span>Stock en México</span>
          <span>Precio por cantidad</span>
          <span>WhatsApp privado</span>
        </div>
        <div class="new-product-b2b-strip">
          <strong>Lista grande por WhatsApp</strong>
          <span>Confirma stock, garantía local y precio final antes del pedido.</span>
        </div>
        <p>${item.description || 'Producto HAODE México con atención por WhatsApp para técnicos, talleres y distribuidores. Confirma disponibilidad actual, modelo y cantidad antes de comprar.'}</p>
        <p class="new-arrival-note">${item.quality || ''}</p>
        ${priceRows}
        <div class="new-product-actions">
          <a class="btn btn-secondary" href="${detailHref}">Ver detalles</a>
          <a class="btn btn-primary category-whatsapp-primary" href="${buildWhatsappUrl(item)}" target="_blank" rel="noopener noreferrer">Cotizar modelo por WhatsApp</a>
        </div>
      </div>
    `;

    return article;
  }

  function productMatchesQuery(item, query) {
    const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (!tokens.length) return true;
    const searchText = [
      item.name,
      item.model,
      item.sku,
      item.id,
      item.quality,
      item.description,
    ].map((value) => String(value || '').toLowerCase()).join(' ');
    return tokens.every((token) => searchText.includes(token));
  }

  function renderNoMatches(root, category, query) {
    const label = categoryLabel(category);
    const empty = document.createElement('div');
    empty.className = 'category-search-empty';
    empty.setAttribute('data-category-search-empty', '');

    const title = document.createElement('strong');
    title.textContent = `Sin resultados para "${query}"`;

    const copy = document.createElement('span');
    copy.textContent = 'Revisa el modelo o envía el SKU por WhatsApp para confirmar disponibilidad.';

    const actions = document.createElement('div');
    actions.className = 'category-search-empty-actions';

    const clear = document.createElement('button');
    clear.type = 'button';
    clear.textContent = 'Ver todos';
    clear.setAttribute('data-clear-category-search', '');

    const whatsapp = document.createElement('a');
    whatsapp.href = buildWhatsappUrl({ name: `${label}: ${query}`, sku: query });
    whatsapp.target = '_blank';
    whatsapp.rel = 'noopener noreferrer';
    whatsapp.textContent = 'Enviar búsqueda por WhatsApp';

    actions.append(clear, whatsapp);
    empty.append(title, copy, actions);
    root.appendChild(empty);
  }

  function createCategoryToolbar(root, category, products, render) {
    const existing = document.querySelector('[data-category-search-toolbar]');
    if (existing) return existing;

    const toolbar = document.createElement('div');
    toolbar.className = 'category-search-toolbar';
    toolbar.setAttribute('data-category-search-toolbar', '');
    toolbar.innerHTML = `
      <label>
        <span>Buscar por modelo o SKU</span>
        <input type="search" inputmode="search" autocomplete="off" placeholder="Ej. iPhone 14 Pro, S24 Ultra o SKU" data-category-search />
      </label>
      <div>
        <strong data-category-search-count>${products.length} modelos</strong>
        <span>${categoryLabel(category)}</span>
      </div>
    `;

    root.insertAdjacentElement('beforebegin', toolbar);

    const input = toolbar.querySelector('[data-category-search]');
    input.addEventListener('input', () => render(input.value));
    root.addEventListener('click', (event) => {
      if (!event.target.closest('[data-clear-category-search]')) return;
      input.value = '';
      render('');
      input.focus();
    });

    return toolbar;
  }

  function prioritizeProducts(root) {
    const sectionShell = root.closest('.section-shell');
    const sectionHead = sectionShell?.querySelector(':scope > .section-head');
    if (!sectionShell || !sectionHead || sectionHead.nextElementSibling === root) return;
    sectionHead.insertAdjacentElement('afterend', root);
  }

  function renderCategoryProducts() {
    const root = document.querySelector('[data-category-products]');
    if (!root || !window.HAODE_PRODUCTS_DATA) return;

    prioritizeProducts(root);

    const category = document.body.dataset.category;
    const products = window.HAODE_PRODUCTS_DATA.filter((item) => item.category === category);

    if (!products.length) {
      root.innerHTML = '';
      const empty = document.createElement('div');
      empty.className = 'contact-whatsapp-panel';
      empty.innerHTML = '<h2>Sin productos por ahora</h2><p>Estamos preparando nuevos modelos para esta categoría.</p>';
      root.appendChild(empty);
      return;
    }

    let toolbar;
    const render = (rawQuery = '') => {
      const query = rawQuery.trim();
      const visibleProducts = products.filter((item) => productMatchesQuery(item, query));

      root.innerHTML = '';
      if (visibleProducts.length) {
        for (const item of visibleProducts) {
          root.appendChild(buildProductCard(item));
        }
      } else {
        renderNoMatches(root, category, query);
      }

      toolbar?.querySelector('[data-category-search-count]').replaceChildren(
        document.createTextNode(`${visibleProducts.length} de ${products.length} modelos`)
      );
      renderCategoryConversionPanel(root, category, visibleProducts.length);
    };

    toolbar = createCategoryToolbar(root, category, products, render);
    render('');
  }

  document.addEventListener('DOMContentLoaded', renderCategoryProducts);
})();
