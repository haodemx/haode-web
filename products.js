const WHATSAPP_PHONE = '523326684296';

const HAODE_PRODUCTS = [
  {
    id: 'iphone-incell-fhd',
    category: 'iPhone INCELL',
    name: 'iPhone INCELL FHD',
    description: 'Pantalla para el mercado mexicano con respuesta estable y rotación rápida para mayoristas.',
    priceText: 'Precio de mayoreo disponible',
    image: 'assets/products/iphone-incell/iphone-incell-01.jpg',
    whatsappText: 'Hola HAODE, quiero cotizar:\nProducto: iPhone INCELL FHD\nCantidad:\nCiudad:',
  },
  {
    id: 'iphone-oled-premium',
    category: 'iPhone OLED',
    name: 'iPhone OLED Premium',
    description: 'Acabado premium para clientes que buscan mejor brillo, color y una presentación más alta.',
    priceText: 'Precio de mayoreo disponible',
    image: 'assets/products/iphone-oled/iphone-oled-01.jpg',
    whatsappText: 'Hola HAODE, quiero cotizar:\nProducto: iPhone OLED Premium\nCantidad:\nCiudad:',
  },
  {
    id: 'samsung-incell-con-marco',
    category: 'Samsung INCELL',
    name: 'Samsung INCELL con marco',
    description: 'Opción confiable para negocios de reparación y reventa con flujo rápido de inventario.',
    priceText: 'Precio de mayoreo disponible',
    image: 'assets/products/samsung-incell/samsung-incell-01.jpg',
    whatsappText: 'Hola HAODE, quiero cotizar:\nProducto: Samsung INCELL con marco\nCantidad:\nCiudad:',
  },
  {
    id: 'samsung-oled-con-marco',
    category: 'Samsung OLED',
    name: 'Samsung OLED con marco',
    description: 'Pantalla de nivel premium para clientes que priorizan calidad visual y mayor valor percibido.',
    priceText: 'Precio de mayoreo disponible',
    image: 'assets/products/samsung-oled/samsung-oled-01.jpg',
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

function renderProductsPage() {
  const filterBar = document.querySelector('[data-product-filters]');
  const grid = document.querySelector('[data-product-grid]');
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

document.addEventListener('DOMContentLoaded', renderProductsPage);

window.HAODE_PRODUCTS = HAODE_PRODUCTS;
