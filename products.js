const WHATSAPP_PHONE = '523326684296';
const PLACEHOLDER_IMAGE = 'assets/products/placeholder.svg';

const CATEGORY_IMAGE_POOLS = {
  'iPhone INCELL': [
    'assets/products/iphone-incell/main.jpg',
    'assets/products/iphone-incell/gallery-01.jpg',
    'assets/products/iphone-incell/gallery-02.jpg',
    'assets/products/iphone-incell/gallery-03.jpg',
  ],
  'iPhone OLED': [
    'assets/products/iphone-oled/main.jpg',
    'assets/products/iphone-oled/gallery-01.jpg',
    'assets/products/iphone-oled/gallery-02.jpg',
    'assets/products/iphone-oled/gallery-03.jpg',
  ],
  'Samsung INCELL': [
    'assets/products/samsung-incell/main.jpg',
    'assets/products/samsung-incell/gallery-01.jpg',
    'assets/products/samsung-incell/gallery-02.jpg',
    'assets/products/samsung-incell/gallery-03.jpg',
  ],
  'Samsung OLED': [
    'assets/products/samsung-oled/main.jpg',
    'assets/products/samsung-oled/gallery-01.jpg',
    'assets/products/samsung-oled/gallery-02.jpg',
    'assets/products/samsung-oled/gallery-03.jpg',
  ],
};

const PRICE_TABLE = [
  ['1 pza', 'Consultar'],
  ['5+ pzs', 'Mayoreo'],
  ['100 pzs surtido', 'Precio especial'],
  ['Caja/modelo', 'Mejor precio'],
];

const PRODUCTS = [
  {
    id: 'iphone-incell-x',
    category: 'iPhone INCELL',
    brand: 'iPhone',
    name: 'Pantalla para iPhone X',
    quality: 'INCELL FHD',
    image: pickCategoryImage('iPhone INCELL', 0),
  },
  {
    id: 'iphone-incell-xr',
    category: 'iPhone INCELL',
    brand: 'iPhone',
    name: 'Pantalla para iPhone XR',
    quality: 'INCELL FHD',
    image: pickCategoryImage('iPhone INCELL', 1),
  },
  {
    id: 'iphone-incell-11',
    category: 'iPhone INCELL',
    brand: 'iPhone',
    name: 'Pantalla para iPhone 11',
    quality: 'INCELL FHD',
    image: pickCategoryImage('iPhone INCELL', 2),
  },
  {
    id: 'iphone-incell-12',
    category: 'iPhone INCELL',
    brand: 'iPhone',
    name: 'Pantalla para iPhone 12',
    quality: 'INCELL FHD',
    image: pickCategoryImage('iPhone INCELL', 3),
  },
  {
    id: 'iphone-incell-13',
    category: 'iPhone INCELL',
    brand: 'iPhone',
    name: 'Pantalla para iPhone 13',
    quality: 'INCELL FHD',
    image: pickCategoryImage('iPhone INCELL', 0),
  },
  {
    id: 'iphone-incell-14',
    category: 'iPhone INCELL',
    brand: 'iPhone',
    name: 'Pantalla para iPhone 14',
    quality: 'INCELL FHD',
    image: pickCategoryImage('iPhone INCELL', 1),
  },
  {
    id: 'iphone-oled-11pm',
    category: 'iPhone OLED',
    brand: 'iPhone',
    name: 'Pantalla para iPhone 11 Pro Max',
    quality: 'OLED PREMIUM',
    image: pickCategoryImage('iPhone OLED', 0),
  },
  {
    id: 'iphone-oled-12pm',
    category: 'iPhone OLED',
    brand: 'iPhone',
    name: 'Pantalla para iPhone 12 Pro Max',
    quality: 'OLED PREMIUM',
    image: pickCategoryImage('iPhone OLED', 1),
  },
  {
    id: 'iphone-oled-13pm',
    category: 'iPhone OLED',
    brand: 'iPhone',
    name: 'Pantalla para iPhone 13 Pro Max',
    quality: 'OLED PREMIUM',
    image: pickCategoryImage('iPhone OLED', 2),
  },
  {
    id: 'iphone-oled-14pm',
    category: 'iPhone OLED',
    brand: 'iPhone',
    name: 'Pantalla para iPhone 14 Pro Max',
    quality: 'OLED PREMIUM',
    image: pickCategoryImage('iPhone OLED', 3),
  },
  {
    id: 'iphone-oled-15pm',
    category: 'iPhone OLED',
    brand: 'iPhone',
    name: 'Pantalla para iPhone 15 Pro Max',
    quality: 'OLED PREMIUM',
    image: pickCategoryImage('iPhone OLED', 0),
  },
  {
    id: 'samsung-incell-a',
    category: 'Samsung INCELL',
    brand: 'Samsung',
    name: 'Pantalla para Samsung Serie A',
    quality: 'INCELL CON MARCO',
    image: pickCategoryImage('Samsung INCELL', 0),
  },
  {
    id: 'samsung-incell-s',
    category: 'Samsung INCELL',
    brand: 'Samsung',
    name: 'Pantalla para Samsung Serie S',
    quality: 'INCELL CON MARCO',
    image: pickCategoryImage('Samsung INCELL', 1),
  },
  {
    id: 'samsung-oled-s22u',
    category: 'Samsung OLED',
    brand: 'Samsung',
    name: 'Pantalla Samsung S22 Ultra',
    quality: 'OLED CON MARCO',
    image: pickCategoryImage('Samsung OLED', 0),
  },
  {
    id: 'samsung-oled-s23u',
    category: 'Samsung OLED',
    brand: 'Samsung',
    name: 'Pantalla Samsung S23 Ultra',
    quality: 'OLED CON MARCO',
    image: pickCategoryImage('Samsung OLED', 1),
  },
  {
    id: 'samsung-oled-s24u',
    category: 'Samsung OLED',
    brand: 'Samsung',
    name: 'Pantalla Samsung S24 Ultra',
    quality: 'OLED CON MARCO',
    image: pickCategoryImage('Samsung OLED', 2),
  },
  {
    id: 'samsung-oled-s25u',
    category: 'Samsung OLED',
    brand: 'Samsung',
    name: 'Pantalla Samsung S25 Ultra',
    quality: 'OLED CON MARCO',
    image: pickCategoryImage('Samsung OLED', 3),
  },
];

function pickCategoryImage(category, index) {
  const pool = CATEGORY_IMAGE_POOLS[category] || [];
  if (!pool.length) return PLACEHOLDER_IMAGE;
  return pool[index % pool.length] || PLACEHOLDER_IMAGE;
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

function createPriceTable() {
  const table = document.createElement('table');
  table.className = 'price-table';
  const tbody = document.createElement('tbody');

  PRICE_TABLE.forEach(([quantity, price]) => {
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
  return table;
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

  const priceWrap = document.createElement('div');
  priceWrap.className = 'shop-price-wrap';

  const priceTitle = document.createElement('p');
  priceTitle.className = 'shop-price-title';
  priceTitle.textContent = 'Cantidad / Precio';

  priceWrap.append(priceTitle, createPriceTable());

  const cta = document.createElement('a');
  cta.className = 'btn btn-primary shop-cta';
  cta.href = buildWhatsAppUrl(`Hola HAODE, quiero cotizar: ${product.name}`);
  cta.target = '_blank';
  cta.rel = 'noopener noreferrer';
  cta.textContent = 'Cotizar por WhatsApp';

  content.append(title, quality, priceWrap, cta);
  article.append(media, content);

  return article;
}

function renderShop() {
  const filterBar = document.querySelector('[data-product-filters]');
  const grid = document.querySelector('[data-product-grid]');
  if (!filterBar || !grid) return;

  const categories = ['Todos', ...new Set(PRODUCTS.map((product) => product.category))];
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
