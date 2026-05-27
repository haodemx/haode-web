const WHATSAPP_PHONE = '523326684296';
const PRICE_TEXT = 'Precio de mayoreo disponible';

const PRODUCT_MAIN_IMAGES = {
  'iPhone INCELL': 'assets/products/iphone-incell/main.jpg',
  'iPhone OLED': 'assets/products/iphone-oled/main.jpg',
  'Samsung INCELL': 'assets/products/samsung-incell/main.jpg',
  'Samsung OLED': 'assets/products/samsung-oled/main.jpg',
};

const PRODUCT_GALLERY_IMAGES = {
  'iPhone INCELL': [
    'assets/products/iphone-incell/gallery-01.jpg',
    'assets/products/iphone-incell/gallery-02.jpg',
    'assets/products/iphone-incell/gallery-03.jpg',
  ],
  'iPhone OLED': [
    'assets/products/iphone-oled/gallery-01.jpg',
    'assets/products/iphone-oled/gallery-02.jpg',
    'assets/products/iphone-oled/gallery-03.jpg',
  ],
  'Samsung INCELL': [
    'assets/products/samsung-incell/gallery-01.jpg',
    'assets/products/samsung-incell/gallery-02.jpg',
    'assets/products/samsung-incell/gallery-03.jpg',
  ],
  'Samsung OLED': [
    'assets/products/samsung-oled/gallery-01.jpg',
    'assets/products/samsung-oled/gallery-02.jpg',
    'assets/products/samsung-oled/gallery-03.jpg',
  ],
};

const HAODE_PRODUCTS = [
  {
    id: 'iphone-incell-fhd',
    category: 'iPhone INCELL',
    name: 'iPhone INCELL FHD',
    description: 'Pantalla para el mercado mexicano con respuesta estable y rotación rápida para mayoristas.',
    priceText: PRICE_TEXT,
    image: PRODUCT_MAIN_IMAGES['iPhone INCELL'],
    whatsappText: 'Hola HAODE, quiero cotizar:\nProducto: iPhone INCELL FHD\nCantidad:\nCiudad:',
  },
  {
    id: 'iphone-oled-premium',
    category: 'iPhone OLED',
    name: 'iPhone OLED Premium',
    description: 'Acabado premium para clientes que buscan mejor brillo, color y una presentación más alta.',
    priceText: PRICE_TEXT,
    image: PRODUCT_MAIN_IMAGES['iPhone OLED'],
    whatsappText: 'Hola HAODE, quiero cotizar:\nProducto: iPhone OLED Premium\nCantidad:\nCiudad:',
  },
  {
    id: 'samsung-incell-con-marco',
    category: 'Samsung INCELL',
    name: 'Samsung INCELL con marco',
    description: 'Opción confiable para negocios de reparación y reventa con flujo rápido de inventario.',
    priceText: PRICE_TEXT,
    image: PRODUCT_MAIN_IMAGES['Samsung INCELL'],
    whatsappText: 'Hola HAODE, quiero cotizar:\nProducto: Samsung INCELL con marco\nCantidad:\nCiudad:',
  },
  {
    id: 'samsung-oled-con-marco',
    category: 'Samsung OLED',
    name: 'Samsung OLED con marco',
    description: 'Pantalla de nivel premium para clientes que priorizan calidad visual y mayor valor percibido.',
    priceText: PRICE_TEXT,
    image: PRODUCT_MAIN_IMAGES['Samsung OLED'],
    whatsappText: 'Hola HAODE, quiero cotizar:\nProducto: Samsung OLED con marco\nCantidad:\nCiudad:',
  },
];

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

function createCatalogCard(product) {
  const article = document.createElement('article');
  article.className = 'catalog-card';
  article.dataset.category = product.category;

  const image = document.createElement('div');
  image.className = 'catalog-image';
  image.style.background = `linear-gradient(180deg, rgba(255, 122, 24, 0.28), rgba(20, 20, 26, 0.95)), url('${product.image}') center/cover no-repeat`;
  image.setAttribute('aria-hidden', 'true');

  const content = document.createElement('div');
  content.className = 'catalog-content';

  const title = document.createElement('h3');
  title.textContent = product.name;

  const category = document.createElement('p');
  category.className = 'catalog-category';
  category.textContent = product.category;

  const description = document.createElement('p');
  description.textContent = product.description;

  const price = document.createElement('p');
  price.className = 'catalog-price';
  price.textContent = product.priceText;

  const link = document.createElement('a');
  link.className = 'btn btn-primary';
  link.href = buildWhatsAppUrl(product.whatsappText);
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = 'Consultar por WhatsApp';

  content.append(title, category, description, price, link);
  article.append(image, content);

  return article;
}

function createGalleryCard(category, images) {
  const article = document.createElement('article');
  article.className = 'gallery-card';

  const heading = document.createElement('div');
  heading.className = 'gallery-card-head';

  const title = document.createElement('h3');
  title.textContent = category;

  const label = document.createElement('span');
  label.textContent = 'Galería';

  heading.append(title, label);

  const imageGrid = document.createElement('div');
  imageGrid.className = 'gallery-image-grid';

  const visibleImages = images.filter(Boolean).slice(0, 3);
  if (visibleImages.length === 0) {
    const placeholder = document.createElement('div');
    placeholder.className = 'gallery-placeholder';
    placeholder.textContent = 'Sin imágenes disponibles';
    imageGrid.appendChild(placeholder);
  } else {
    visibleImages.forEach((src, index) => {
      const figure = document.createElement('figure');
      figure.className = `gallery-shot${index === 0 ? ' is-main' : ''}`;

      const image = document.createElement('img');
      image.src = src;
      image.alt = `${category} imagen ${index + 1}`;
      image.loading = 'lazy';

      figure.appendChild(image);
      imageGrid.appendChild(figure);
    });
  }

  article.append(heading, imageGrid);
  return article;
}

function renderProductsPage() {
  const filterBar = document.querySelector('[data-product-filters]');
  const grid = document.querySelector('[data-product-grid]');
  const galleryGrid = document.querySelector('[data-product-gallery]');
  if (!filterBar || !grid) return;

  const categories = ['Todos', ...new Set(HAODE_PRODUCTS.map((product) => product.category))];
  let activeFilter = 'Todos';

  function renderCards() {
    grid.innerHTML = '';
    const filteredProducts = activeFilter === 'Todos'
      ? HAODE_PRODUCTS
      : HAODE_PRODUCTS.filter((product) => product.category === activeFilter);

    filteredProducts.forEach((product) => {
      grid.appendChild(createCatalogCard(product));
    });
  }

  function renderGallery() {
    if (!galleryGrid) return;
    galleryGrid.innerHTML = '';

    Object.entries(PRODUCT_GALLERY_IMAGES).forEach(([category, images]) => {
      galleryGrid.appendChild(createGalleryCard(category, images));
    });
  }

  function setActiveFilter(nextFilter) {
    activeFilter = nextFilter;
    Array.from(filterBar.querySelectorAll('.filter-chip')).forEach((button) => {
      button.classList.toggle('is-active', button.dataset.filter === nextFilter);
    });
    renderCards();
  }

  filterBar.innerHTML = '';
  categories.forEach((category, index) => {
    const button = createFilterButton(category, index === 0);
    button.addEventListener('click', () => setActiveFilter(category));
    filterBar.appendChild(button);
  });

  renderCards();
  renderGallery();
}

document.addEventListener('DOMContentLoaded', renderProductsPage);

window.HAODE_PRODUCTS = HAODE_PRODUCTS;
