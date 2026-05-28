const WHATSAPP_PHONE = '523326684296';
const PLACEHOLDER_IMAGE = 'assets/products/placeholder.svg';

const QUANTITY_LABELS = ['1 pza', '5+ pzs', '100 pzs surtido', '100 pzs/modelo', 'Caja/modelo'];

const CATEGORY_META = {
  'iPhone INCELL': {
    brand: 'iPhone',
    title: 'iPhone INCELL',
    subtitle: 'Opciones de entrada para técnicos, talleres y clientes que buscan una buena relación precio-rendimiento.',
    image: 'assets/products/iphone-incell/main.jpg',
  },
  'iPhone OLED': {
    brand: 'iPhone',
    title: 'iPhone OLED',
    subtitle: 'Pantallas premium para un acabado visual superior y una experiencia más cercana al original.',
    image: 'assets/products/iphone-oled/main.jpg',
  },
  'Samsung INCELL': {
    brand: 'Samsung',
    title: 'Samsung INCELL',
    subtitle: 'Pantallas con marco para instalación rápida y compra por mayoreo en CDMX.',
    image: 'assets/products/samsung-incell/main.jpg',
  },
  'Samsung OLED': {
    brand: 'Samsung',
    title: 'Samsung OLED',
    subtitle: 'Pantallas de gama alta para modelos Galaxy con mejor calidad visual.',
    image: 'assets/products/samsung-oled/main.jpg',
  },
};

const PRODUCTS = [
  ...[
    ['iphone-incell-x', 'iPhone INCELL', 'Pantalla para iPhone X', 'INCELL FHD+', '200', [180, 175, 170, 165, 155]],
    ['iphone-incell-xs', 'iPhone INCELL', 'Pantalla para iPhone XS', 'INCELL FHD+', '200', [180, 175, 170, 165, 155]],
    ['iphone-incell-xr', 'iPhone INCELL', 'Pantalla para iPhone XR', 'INCELL FHD+', '200', [180, 175, 170, 165, 155]],
    ['iphone-incell-11', 'iPhone INCELL', 'Pantalla para iPhone 11', 'INCELL FHD+', '200', [180, 175, 170, 165, 155]],
    ['iphone-incell-11pro', 'iPhone INCELL', 'Pantalla para iPhone 11 Pro', 'INCELL FHD+ MOVE IC', '200', [200, 195, 190, 190, 185]],
    ['iphone-incell-11promax', 'iPhone INCELL', 'Pantalla para iPhone 11 Pro Max', 'INCELL FHD+ MOVE IC', '200', [220, 210, 200, 195, 190]],
    ['iphone-incell-12mini', 'iPhone INCELL', 'Pantalla para iPhone 12 mini', 'INCELL FHD+ MOVE IC', '230', [230, 220, 210, 200, 195]],
    ['iphone-incell-12promax', 'iPhone INCELL', 'Pantalla para iPhone 12 Pro Max', 'INCELL FHD+ MOVE IC', '250', [250, 240, 235, 230, 220]],
    ['iphone-incell-13mini', 'iPhone INCELL', 'Pantalla para iPhone 13 mini', 'INCELL FHD+ MOVE IC', '260', [260, 250, 245, 240, 235]],
    ['iphone-incell-13', 'iPhone INCELL', 'Pantalla para iPhone 13', 'INCELL FHD+ MOVE IC', '260', [250, 245, 240, 235, 230]],
    ['iphone-incell-13pro', 'iPhone INCELL', 'Pantalla para iPhone 13 Pro', 'INCELL FHD+ MOVE IC', '300', [300, 290, 285, 280, 275]],
    ['iphone-incell-13promax', 'iPhone INCELL', 'Pantalla para iPhone 13 Pro Max', 'INCELL FHD+ MOVE IC', '350', [350, 340, 335, 330, 325]],
    ['iphone-incell-14', 'iPhone INCELL', 'Pantalla para iPhone 14', 'INCELL FHD+ MOVE IC', '260', [260, 250, 245, 240, 230]],
    ['iphone-incell-14plus', 'iPhone INCELL', 'Pantalla para iPhone 14 Plus', 'INCELL FHD+ MOVE IC', '300', [300, 290, 280, 275, 265]],
    ['iphone-incell-14pro', 'iPhone INCELL', 'Pantalla para iPhone 14 Pro', 'INCELL FHD+ MOVE IC', '350', [350, 340, 330, 320, 310]],
    ['iphone-incell-14promax', 'iPhone INCELL', 'Pantalla para iPhone 14 Pro Max', 'INCELL FHD+ MOVE IC', '380', [380, 350, 340, 330, 310]],
    ['iphone-incell-15', 'iPhone INCELL', 'Pantalla para iPhone 15', 'INCELL FHD+ MOVE IC', '300', [300, 290, 285, 280, 275]],
  ].map(([id, category, name, quality, note, prices]) => createProduct({
    id,
    category,
    brand: CATEGORY_META[category].brand,
    name,
    quality,
    note: 'Consulta disponibilidad y mayoreo por WhatsApp.',
    prices,
    image: CATEGORY_META[category].image,
  })),

  ...[
    ['iphone-oled-xsmax', 'iPhone OLED', 'Pantalla para iPhone XS MAX', 'OLED PREMIUM MOVE IC', '580', [580, 570, 560, 550, 540]],
    ['iphone-oled-11promax', 'iPhone OLED', 'Pantalla para iPhone 11 Pro Max', 'OLED PREMIUM MOVE IC', '600', [600, 590, 580, 550, 535]],
    ['iphone-oled-12promax', 'iPhone OLED', 'Pantalla para iPhone 12 Pro Max', 'OLED PREMIUM MOVE IC', '850', [850, 830, 800, 750, 730]],
    ['iphone-oled-13', 'iPhone OLED', 'Pantalla para iPhone 13', 'OLED PREMIUM MOVE IC', '730', [730, 720, 710, 630, 600]],
    ['iphone-oled-13pro', 'iPhone OLED', 'Pantalla para iPhone 13 Pro', 'OLED PREMIUM MOVE IC', '800', [800, 780, 750, 730, 700]],
    ['iphone-oled-13promax', 'iPhone OLED', 'Pantalla para iPhone 13 Pro Max', 'OLED PREMIUM MOVE IC', '900', [900, 850, 800, 770, 750]],
    ['iphone-oled-14', 'iPhone OLED', 'Pantalla para iPhone 14', 'OLED PREMIUM MOVE IC', '700', [700, 680, 650, 630, 600]],
    ['iphone-oled-14plus', 'iPhone OLED', 'Pantalla para iPhone 14 Plus', 'OLED PREMIUM MOVE IC', '900', [900, 880, 850, 830, 800]],
    ['iphone-oled-14promax', 'iPhone OLED', 'Pantalla para iPhone 14 Pro Max', 'OLED PREMIUM MOVE IC', '1000', [1000, 950, 900, 850, 800]],
  ].map(([id, category, name, quality, note, prices]) => createProduct({
    id,
    category,
    brand: CATEGORY_META[category].brand,
    name,
    quality,
    note: 'Cotiza por WhatsApp y confirma compatibilidad con tu modelo.',
    prices,
    image: CATEGORY_META[category].image,
  })),

  ...[
    ['samsung-incell-s20', 'Samsung INCELL', 'Pantalla para Samsung S20', 'INCELL-HD+ CON MARCO', [500, 480, 460, 450, 440]],
    ['samsung-incell-s21', 'Samsung INCELL', 'Pantalla para Samsung S21', 'INCELL-HD+ CON MARCO', [800, 750, 700, 600, 550]],
    ['samsung-incell-s22ultra', 'Samsung INCELL', 'Pantalla para Samsung S22 Ultra', 'INCELL-HD+ CON MARCO', [800, 750, 700, 650, 600]],
    ['samsung-incell-s23ultra', 'Samsung INCELL', 'Pantalla para Samsung S23 Ultra', 'INCELL-HD+ CON MARCO', [700, 680, 650, 620, 600]],
    ['samsung-incell-s24ultra', 'Samsung INCELL', 'Pantalla para Samsung S24 Ultra', 'INCELL-HD+ CON MARCO', [1000, 950, 900, 850, 800]],
    ['samsung-incell-note20ultra', 'Samsung INCELL', 'Pantalla para Samsung Note 20 Ultra', 'INCELL-HD+ CON MARCO', [800, 780, 750, 700, 680]],
  ].map(([id, category, name, quality, prices]) => createProduct({
    id,
    category,
    brand: CATEGORY_META[category].brand,
    name,
    quality,
    note: 'Instalación rápida con marco y disponibilidad para mayoristas.',
    prices,
    image: CATEGORY_META[category].image,
  })),

  ...[
    ['samsung-oled-s20plus', 'Samsung OLED', 'Pantalla para Samsung S20 Plus', 'OLED PREMIUM C/M', [1100, 1050, 1000, 950, 900]],
    ['samsung-oled-s21ultra', 'Samsung OLED', 'Pantalla para Samsung S21 Ultra', 'OLED PREMIUM C/M', [1600, 1550, 1500, 1450, 1400]],
    ['samsung-oled-s22ultra', 'Samsung OLED', 'Pantalla para Samsung S22 Ultra', 'OLED PREMIUM C/M', [1750, 1700, 1650, 1550, 1500]],
    ['samsung-oled-s23ultra', 'Samsung OLED', 'Pantalla para Samsung S23 Ultra', 'OLED PREMIUM C/M', [1600, 1580, 1550, 1500, 1400]],
    ['samsung-oled-s24ultra', 'Samsung OLED', 'Pantalla para Samsung S24 Ultra', 'OLED PREMIUM C/M', [1800, 1750, 1700, 1650, 1600]],
    ['samsung-oled-s25ultra', 'Samsung OLED', 'Pantalla para Samsung S25 Ultra', 'OLED PREMIUM C/M', [2000, 1900, 1800, 1750, 1700]],
  ].map(([id, category, name, quality, prices]) => createProduct({
    id,
    category,
    brand: CATEGORY_META[category].brand,
    name,
    quality,
    note: 'Pantalla de gama alta para reemplazo premium.',
    prices,
    image: CATEGORY_META[category].image,
  })),
];

function createProduct({ id, category, brand, name, quality, note, prices, image }) {
  return {
    id,
    category,
    brand,
    name,
    quality,
    note,
    prices: buildPriceRows(prices),
    image,
    whatsappText: `Hola HAODE, quiero cotizar: ${name}`,
  };
}

function buildPriceRows(values) {
  return QUANTITY_LABELS.map((quantity, index) => ({
    quantity,
    price: formatPrice(values?.[index]),
  }));
}

function formatPrice(value) {
  if (value === null || value === undefined || value === '' || Number.isNaN(Number(value))) {
    return 'Consultar';
  }
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return 'Consultar';
  }
  return `$${numeric.toLocaleString('es-MX')} MXN`;
}

function buildWhatsAppUrl(message) {
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}

function createFilterButton(label, isActive = false) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `filter-chip${isActive ? ' is-active' : ''}`;
  button.textContent = label;
  button.dataset.filter = label;
  return button;
}

function createProductCard(product) {
  const article = document.createElement('article');
  article.className = 'shop-card';
  article.dataset.category = product.category;

  const media = document.createElement('div');
  media.className = 'shop-media';

  const image = document.createElement('img');
  image.src = product.image || PLACEHOLDER_IMAGE;
  image.alt = product.name;
  image.loading = 'lazy';
  image.decoding = 'async';
  image.onerror = () => {
    if (image.src !== PLACEHOLDER_IMAGE) {
      image.src = PLACEHOLDER_IMAGE;
    }
  };

  const brand = document.createElement('span');
  brand.className = 'shop-brand';
  brand.textContent = product.brand;

  media.append(image, brand);

  const content = document.createElement('div');
  content.className = 'shop-content';

  const title = document.createElement('h3');
  title.textContent = product.name;

  const quality = document.createElement('p');
  quality.className = 'shop-quality';
  quality.textContent = product.quality;

  const note = document.createElement('p');
  note.className = 'shop-note';
  note.textContent = product.note;

  const tableWrap = document.createElement('div');
  tableWrap.className = 'shop-price-wrap';

  const tableTitle = document.createElement('p');
  tableTitle.className = 'shop-price-title';
  tableTitle.textContent = 'Cantidad / Precio';

  const table = document.createElement('table');
  table.className = 'price-table';
  const tbody = document.createElement('tbody');

  product.prices.forEach(({ quantity, price }) => {
    const row = document.createElement('tr');
    const qty = document.createElement('th');
    qty.scope = 'row';
    qty.textContent = quantity;
    const value = document.createElement('td');
    value.textContent = price;
    row.append(qty, value);
    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  tableWrap.append(tableTitle, table);

  const cta = document.createElement('a');
  cta.className = 'btn btn-primary shop-cta';
  cta.href = buildWhatsAppUrl(product.whatsappText);
  cta.target = '_blank';
  cta.rel = 'noopener noreferrer';
  cta.textContent = 'Cotizar por WhatsApp';

  content.append(title, quality, note, tableWrap, cta);
  article.append(media, content);

  return article;
}

function renderCatalog() {
  const filterBar = document.querySelector('[data-product-filters]');
  const sectionsRoot = document.querySelector('[data-product-sections]');
  const priceNote = document.querySelector('[data-price-note]');
  if (!filterBar || !sectionsRoot) return;

  if (priceNote) {
    priceNote.textContent = 'Precios por cantidad en MXN. Consulta disponibilidad por WhatsApp para confirmar tu pedido.';
  }

  const categories = ['Todos', ...Object.keys(CATEGORY_META)];
  let activeFilter = 'Todos';

  function renderSections() {
    sectionsRoot.innerHTML = '';
    Object.entries(CATEGORY_META).forEach(([category, meta]) => {
      const categoryProducts = PRODUCTS.filter((product) => product.category === category);
      const section = document.createElement('section');
      section.className = 'catalog-section';
      section.dataset.category = category;

      if (activeFilter !== 'Todos' && activeFilter !== category) {
        section.hidden = true;
      }

      const head = document.createElement('div');
      head.className = 'catalog-section-head';

      const title = document.createElement('div');
      const kicker = document.createElement('p');
      kicker.className = 'section-kicker';
      kicker.textContent = meta.brand;
      const h2 = document.createElement('h2');
      h2.textContent = meta.title;
      const subtitle = document.createElement('p');
      subtitle.className = 'catalog-section-subtitle';
      subtitle.textContent = meta.subtitle;
      title.append(kicker, h2, subtitle);

      const count = document.createElement('p');
      count.className = 'catalog-count';
      count.textContent = `${categoryProducts.length} modelos`;

      head.append(title, count);

      const grid = document.createElement('div');
      grid.className = 'product-page-grid shop-grid';

      categoryProducts.forEach((product) => {
        grid.appendChild(createProductCard(product));
      });

      section.append(head, grid);
      sectionsRoot.appendChild(section);
    });
  }

  function setActiveFilter(nextFilter) {
    activeFilter = nextFilter;
    Array.from(filterBar.querySelectorAll('.filter-chip')).forEach((button) => {
      button.classList.toggle('is-active', button.dataset.filter === nextFilter);
    });

    Array.from(sectionsRoot.querySelectorAll('.catalog-section')).forEach((section) => {
      section.hidden = activeFilter !== 'Todos' && section.dataset.category !== activeFilter;
    });
  }

  filterBar.innerHTML = '';
  categories.forEach((category, index) => {
    const button = createFilterButton(category, index === 0);
    button.addEventListener('click', () => setActiveFilter(category));
    filterBar.appendChild(button);
  });

  renderSections();
  setActiveFilter('Todos');
}

document.addEventListener('DOMContentLoaded', renderCatalog);

window.HAODE_PRODUCTS = PRODUCTS;
