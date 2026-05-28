const WHATSAPP_PHONE = '523326684296';
const PLACEHOLDER_IMAGE = 'assets/products/placeholder.svg';

const CATEGORY_MAIN_IMAGES = {
  'iPhone INCELL': 'assets/products/iphone-incell/main.jpg',
  'iPhone OLED': 'assets/products/iphone-oled/main.jpg',
  'Samsung INCELL': 'assets/products/samsung-incell/main.jpg',
  'Samsung OLED': 'assets/products/samsung-oled/main.jpg',
};

const PRODUCTS = [
  {
    id: 'iphone-incell-x',
    category: 'iPhone INCELL',
    brand: 'iPhone',
    name: 'Pantalla para iPhone X',
    description: 'INCELL FHD',
    priceText: 'Precio mayoreo: $175 MXN',
  },
  {
    id: 'iphone-incell-xr',
    category: 'iPhone INCELL',
    brand: 'iPhone',
    name: 'Pantalla para iPhone XR',
    description: 'INCELL FHD',
    priceText: 'Precio mayoreo: $175 MXN',
  },
  {
    id: 'iphone-incell-11',
    category: 'iPhone INCELL',
    brand: 'iPhone',
    name: 'Pantalla para iPhone 11',
    description: 'INCELL FHD',
    priceText: 'Precio mayoreo: $175 MXN',
  },
  {
    id: 'iphone-incell-12',
    category: 'iPhone INCELL',
    brand: 'iPhone',
    name: 'Pantalla para iPhone 12',
    description: 'INCELL FHD',
    priceText: 'Precio mayoreo: $210 MXN',
  },
  {
    id: 'iphone-incell-13',
    category: 'iPhone INCELL',
    brand: 'iPhone',
    name: 'Pantalla para iPhone 13',
    description: 'INCELL FHD',
    priceText: 'Precio mayoreo: $245 MXN',
  },
  {
    id: 'iphone-incell-14',
    category: 'iPhone INCELL',
    brand: 'iPhone',
    name: 'Pantalla para iPhone 14',
    description: 'INCELL FHD',
    priceText: 'Precio mayoreo: $250 MXN',
  },
  {
    id: 'iphone-oled-11pm',
    category: 'iPhone OLED',
    brand: 'iPhone',
    name: 'Pantalla para iPhone 11 Pro Max',
    description: 'OLED PREMIUM',
    priceText: 'Precio mayoreo: $590 MXN',
  },
  {
    id: 'iphone-oled-12pm',
    category: 'iPhone OLED',
    brand: 'iPhone',
    name: 'Pantalla para iPhone 12 Pro Max',
    description: 'OLED PREMIUM',
    priceText: 'Precio mayoreo: $830 MXN',
  },
  {
    id: 'iphone-oled-13pm',
    category: 'iPhone OLED',
    brand: 'iPhone',
    name: 'Pantalla para iPhone 13 Pro Max',
    description: 'OLED PREMIUM',
    priceText: 'Precio mayoreo: $850 MXN',
  },
  {
    id: 'iphone-oled-14pm',
    category: 'iPhone OLED',
    brand: 'iPhone',
    name: 'Pantalla para iPhone 14 Pro Max',
    description: 'OLED PREMIUM',
    priceText: 'Precio mayoreo: $950 MXN',
  },
  {
    id: 'iphone-oled-15pm',
    category: 'iPhone OLED',
    brand: 'iPhone',
    name: 'Pantalla para iPhone 15 Pro Max',
    description: 'OLED PREMIUM',
    priceText: 'Precio mayoreo: $1,100 MXN',
  },
  {
    id: 'samsung-incell-s20',
    category: 'Samsung INCELL',
    brand: 'Samsung',
    name: 'Pantalla para Samsung S20',
    description: 'INCELL CON MARCO',
    priceText: 'Precio mayoreo: $480 MXN',
  },
  {
    id: 'samsung-incell-s21',
    category: 'Samsung INCELL',
    brand: 'Samsung',
    name: 'Pantalla para Samsung S21',
    description: 'INCELL CON MARCO',
    priceText: 'Precio mayoreo: $750 MXN',
  },
  {
    id: 'samsung-incell-s22',
    category: 'Samsung INCELL',
    brand: 'Samsung',
    name: 'Pantalla para Samsung S22 Ultra',
    description: 'INCELL CON MARCO',
    priceText: 'Precio mayoreo: $550 MXN',
  },
  {
    id: 'samsung-incell-s23',
    category: 'Samsung INCELL',
    brand: 'Samsung',
    name: 'Pantalla para Samsung S23 Ultra',
    description: 'INCELL CON MARCO',
    priceText: 'Precio mayoreo: $630 MXN',
  },
  {
    id: 'samsung-incell-s24',
    category: 'Samsung INCELL',
    brand: 'Samsung',
    name: 'Pantalla para Samsung S24 Ultra',
    description: 'INCELL CON MARCO',
    priceText: 'Precio mayoreo: $950 MXN',
  },
  {
    id: 'samsung-oled-s22u',
    category: 'Samsung OLED',
    brand: 'Samsung',
    name: 'Pantalla para Samsung S22 Ultra',
    description: 'OLED PREMIUM CON MARCO',
    priceText: 'Precio mayoreo: $1,700 MXN',
  },
  {
    id: 'samsung-oled-s23u',
    category: 'Samsung OLED',
    brand: 'Samsung',
    name: 'Pantalla para Samsung S23 Ultra',
    description: 'OLED PREMIUM CON MARCO',
    priceText: 'Precio mayoreo: $1,580 MXN',
  },
  {
    id: 'samsung-oled-s24u',
    category: 'Samsung OLED',
    brand: 'Samsung',
    name: 'Pantalla para Samsung S24 Ultra',
    description: 'OLED PREMIUM CON MARCO',
    priceText: 'Precio mayoreo: $1,750 MXN',
  },
  {
    id: 'samsung-oled-s25u',
    category: 'Samsung OLED',
    brand: 'Samsung',
    name: 'Pantalla para Samsung S25 Ultra',
    description: 'OLED PREMIUM CON MARCO',
    priceText: 'Precio mayoreo: $1,900 MXN',
  },
];

function getMainImage(category) {
  return CATEGORY_MAIN_IMAGES[category] || PLACEHOLDER_IMAGE;
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
  image.src = product.image || getMainImage(product.category) || PLACEHOLDER_IMAGE;
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
  quality.textContent = product.description;

  const price = document.createElement('p');
  price.className = 'shop-price';
  price.textContent = product.priceText || 'Precio de mayoreo disponible';

  const cta = document.createElement('a');
  cta.className = 'btn btn-primary shop-cta';
  cta.href = buildWhatsAppUrl(product.whatsappText || `Hola HAODE, quiero cotizar: ${product.name}`);
  cta.target = '_blank';
  cta.rel = 'noopener noreferrer';
  cta.textContent = 'Cotizar por WhatsApp';

  content.append(title, quality, price, cta);
  article.append(media, content);

  return article;
}

function renderShop() {
  const filterBar = document.querySelector('[data-product-filters]');
  const grid = document.querySelector('[data-product-grid]');
  const priceNote = document.querySelector('[data-price-note]');
  if (!filterBar || !grid) return;

  if (priceNote) {
    priceNote.textContent = 'Precios actualizados según HL CDMX 2026 MAYO · consulta disponibilidad por WhatsApp.';
  }

  const categories = ['Todos', 'iPhone INCELL', 'iPhone OLED', 'Samsung INCELL', 'Samsung OLED'];
  let activeFilter = 'Todos';

  function renderCards() {
    grid.innerHTML = '';
    const visibleProducts = activeFilter === 'Todos'
      ? PRODUCTS
      : PRODUCTS.filter((product) => product.category === activeFilter);

    visibleProducts.forEach((product) => {
      grid.appendChild(createProductCard(product));
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
}

document.addEventListener('DOMContentLoaded', renderShop);

window.HAODE_PRODUCTS = PRODUCTS;
