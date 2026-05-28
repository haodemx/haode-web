const WHATSAPP_PHONE = '523326684296';
const PLACEHOLDER_IMAGE = 'assets/products/placeholder.svg';
const QUANTITY_LABELS = ['1 pza', '5+ pzs', '100 pzs surtido', '100 pzs/modelo', 'Caja/modelo'];

const CATEGORY_META = {
  'iPhone INCELL': {
    brand: 'iPhone',
    title: 'iPhone INCELL',
    subtitle: 'Opciones de entrada para técnicos, talleres y clientes que buscan una buena relación precio-rendimiento.',
    mainImage: 'assets/products/iphone-incell/main.jpg',
    galleryImages: [
      'assets/products/iphone-incell/gallery-01.jpg',
      'assets/products/iphone-incell/gallery-02.jpg',
      'assets/products/iphone-incell/gallery-03.jpg',
    ],
  },
  'iPhone OLED': {
    brand: 'iPhone',
    title: 'iPhone OLED',
    subtitle: 'Pantallas premium para un acabado visual superior y una experiencia más cercana al original.',
    mainImage: 'assets/products/iphone-oled/main.jpg',
    galleryImages: [
      'assets/products/iphone-oled/gallery-01.jpg',
      'assets/products/iphone-oled/gallery-02.jpg',
      'assets/products/iphone-oled/gallery-03.jpg',
    ],
  },
  'Samsung INCELL': {
    brand: 'Samsung',
    title: 'Samsung INCELL',
    subtitle: 'Pantallas con marco para instalación rápida y compra por mayoreo en CDMX.',
    mainImage: 'assets/products/samsung-incell/main.jpg',
    galleryImages: [
      'assets/products/samsung-incell/gallery-01.jpg',
      'assets/products/samsung-incell/gallery-02.jpg',
      'assets/products/samsung-incell/gallery-03.jpg',
    ],
  },
  'Samsung OLED': {
    brand: 'Samsung',
    title: 'Samsung OLED',
    subtitle: 'Pantallas de gama alta para modelos Galaxy con mejor calidad visual.',
    mainImage: 'assets/products/samsung-oled/main.jpg',
    galleryImages: [
      'assets/products/samsung-oled/gallery-01.jpg',
      'assets/products/samsung-oled/gallery-02.jpg',
      'assets/products/samsung-oled/gallery-03.jpg',
    ],
  },
};

// iPhone INCELL cover art is sourced from each model folder's main.jpg.
const IPHONE_INCELL_MEDIA = {
  "iphone-x-incell": {
    "mainImage": "assets/products/iphone-incell/x/main.jpg",
    "galleryImages": [
      "assets/products/iphone-incell/x/gallery-01.jpg",
      "assets/products/iphone-incell/x/gallery-02.jpg",
      "assets/products/iphone-incell/x/gallery-03.jpg"
    ],
    "videos": [
      "assets/products/iphone-incell/x/video-01.mp4"
    ]
  },
  "iphone-xs-incell": {
    "mainImage": "assets/products/iphone-incell/xs/main.jpg",
    "galleryImages": [
      "assets/products/iphone-incell/xs/gallery-01.jpg",
      "assets/products/iphone-incell/xs/gallery-02.jpg",
      "assets/products/iphone-incell/xs/gallery-03.jpg"
    ],
    "videos": [
      "assets/products/iphone-incell/xs/video-01.mp4"
    ]
  },
  "iphone-xr-incell": {
    "mainImage": "assets/products/iphone-incell/xr/main.jpg",
    "galleryImages": [
      "assets/products/iphone-incell/xr/gallery-01.jpg",
      "assets/products/iphone-incell/xr/gallery-02.jpg",
      "assets/products/iphone-incell/xr/gallery-03.jpg"
    ],
    "videos": [
      "assets/products/iphone-incell/xr/video-01.mp4"
    ]
  },
  "iphone-11-incell": {
    "mainImage": "assets/products/iphone-incell/11/main.jpg",
    "galleryImages": [
      "assets/products/iphone-incell/11/gallery-01.jpg",
      "assets/products/iphone-incell/11/gallery-02.jpg",
      "assets/products/iphone-incell/11/gallery-03.jpg"
    ],
    "videos": [
      "assets/products/iphone-incell/11/video-01.mp4",
      "assets/products/iphone-incell/11/video-02.mp4"
    ]
  },
  "iphone-11-pro-incell": {
    "mainImage": "assets/products/iphone-incell/11pro/main.jpg",
    "galleryImages": [
      "assets/products/iphone-incell/11pro/gallery-01.jpg",
      "assets/products/iphone-incell/11pro/gallery-02.jpg",
      "assets/products/iphone-incell/11pro/gallery-03.jpg"
    ],
    "videos": [
      "assets/products/iphone-incell/11pro/video-01.mp4",
      "assets/products/iphone-incell/11pro/video-02.mp4"
    ]
  },
  "iphone-11-pro-max-incell": {
    "mainImage": "assets/products/iphone-incell/11promax/main.jpg",
    "galleryImages": [
      "assets/products/iphone-incell/11promax/gallery-01.jpg",
      "assets/products/iphone-incell/11promax/gallery-02.jpg",
      "assets/products/iphone-incell/11promax/gallery-03.jpg"
    ],
    "videos": [
      "assets/products/iphone-incell/11promax/video-01.mp4"
    ]
  },
  "iphone-12-mini-incell": {
    "mainImage": "assets/products/iphone-incell/12mini/main.jpg",
    "galleryImages": [
      "assets/products/iphone-incell/12mini/gallery-01.jpg",
      "assets/products/iphone-incell/12mini/gallery-02.jpg",
      "assets/products/iphone-incell/12mini/gallery-03.jpg"
    ],
    "videos": [
      "assets/products/iphone-incell/12mini/video-01.mp4"
    ]
  },
  "iphone-12-pro-max-incell": {
    "mainImage": "assets/products/iphone-incell/12promax/main.jpg",
    "galleryImages": [
      "assets/products/iphone-incell/12promax/gallery-01.jpg",
      "assets/products/iphone-incell/12promax/gallery-02.jpg",
      "assets/products/iphone-incell/12promax/gallery-03.jpg"
    ],
    "videos": [
      "assets/products/iphone-incell/12promax/video-01.mp4"
    ]
  },
  "iphone-13-mini-incell": {
    "mainImage": "assets/products/iphone-incell/13mini/main.jpg",
    "galleryImages": [
      "assets/products/iphone-incell/13mini/gallery-01.jpg",
      "assets/products/iphone-incell/13mini/gallery-02.jpg",
      "assets/products/iphone-incell/13mini/gallery-03.jpg"
    ],
    "videos": [
      "assets/products/iphone-incell/13mini/video-01.mp4"
    ]
  },
  "iphone-13-incell": {
    "mainImage": "assets/products/iphone-incell/13/main.jpg",
    "galleryImages": [
      "assets/products/iphone-incell/13/gallery-01.jpg",
      "assets/products/iphone-incell/13/gallery-02.jpg",
      "assets/products/iphone-incell/13/gallery-03.jpg"
    ],
    "videos": [
      "assets/products/iphone-incell/13/video-01.mp4"
    ]
  },
  "iphone-13-pro-incell": {
    "mainImage": "assets/products/iphone-incell/13pro/main.jpg",
    "galleryImages": [
      "assets/products/iphone-incell/13pro/gallery-01.jpg",
      "assets/products/iphone-incell/13pro/gallery-02.jpg"
    ],
    "videos": [
      "assets/products/iphone-incell/13pro/video-01.mp4"
    ]
  },
  "iphone-13-pro-max-incell": {
    "mainImage": "assets/products/iphone-incell/13promax/main.jpg",
    "galleryImages": [
      "assets/products/iphone-incell/13promax/gallery-01.jpg",
      "assets/products/iphone-incell/13promax/gallery-02.jpg"
    ],
    "videos": [
      "assets/products/iphone-incell/13promax/video-01.mp4"
    ]
  },
  "iphone-14-incell": {
    "mainImage": "assets/products/iphone-incell/14/main.jpg",
    "galleryImages": [
      "assets/products/iphone-incell/14/gallery-01.jpg",
      "assets/products/iphone-incell/14/gallery-02.jpg",
      "assets/products/iphone-incell/14/gallery-03.jpg"
    ],
    "videos": [
      "assets/products/iphone-incell/14/video-01.mp4"
    ]
  },
  "iphone-14-plus-incell": {
    "mainImage": "assets/products/iphone-incell/14plus/main.jpg",
    "galleryImages": [
      "assets/products/iphone-incell/14plus/gallery-01.jpg",
      "assets/products/iphone-incell/14plus/gallery-02.jpg",
      "assets/products/iphone-incell/14plus/gallery-03.jpg"
    ],
    "videos": [
      "assets/products/iphone-incell/14plus/video-01.mp4"
    ]
  },
  "iphone-14-pro-incell": {
    "mainImage": "assets/products/iphone-incell/14pro/main.jpg",
    "galleryImages": [
      "assets/products/iphone-incell/14pro/gallery-01.jpg",
      "assets/products/iphone-incell/14pro/gallery-02.jpg"
    ],
    "videos": [
      "assets/products/iphone-incell/14pro/video-01.mp4"
    ]
  },
  "iphone-14-pro-max-incell": {
    "mainImage": "assets/products/iphone-incell/14promax/main.jpg",
    "galleryImages": [
      "assets/products/iphone-incell/14promax/gallery-01.jpg",
      "assets/products/iphone-incell/14promax/gallery-02.jpg"
    ],
    "videos": [
      "assets/products/iphone-incell/14promax/video-01.mp4"
    ]
  },
  "iphone-15-incell": {
    "mainImage": "assets/products/iphone-incell/15/main.jpg",
    "galleryImages": [
      "assets/products/iphone-incell/15/gallery-01.jpg",
      "assets/products/iphone-incell/15/gallery-02.jpg"
    ],
    "videos": [
      "assets/products/iphone-incell/15/video-01.mp4"
    ]
  }
};

const PRODUCT_DEFINITIONS = [
  {
    id: 'iphone-x-incell',
    category: 'iPhone INCELL',
    name: 'Pantalla para iPhone X',
    quality: 'INCELL FHD+',
    prices: [180, 175, 170, 165, 155],
    description: 'Reemplazo INCELL para talleres que buscan una opción confiable con precio competitivo.',
  },
  {
    id: 'iphone-xs-incell',
    category: 'iPhone INCELL',
    name: 'Pantalla para iPhone XS',
    quality: 'INCELL FHD+',
    prices: [180, 175, 170, 165, 155],
    description: 'Pantalla INCELL pensada para reparación rápida y venta por mayoreo.',
  },
  {
    id: 'iphone-xr-incell',
    category: 'iPhone INCELL',
    name: 'Pantalla para iPhone XR',
    quality: 'INCELL FHD+',
    prices: [180, 175, 170, 165, 155],
    description: 'Opción práctica para técnicos con buena respuesta táctil y compatibilidad estable.',
  },
  {
    id: 'iphone-11-incell',
    category: 'iPhone INCELL',
    name: 'Pantalla para iPhone 11',
    quality: 'INCELL FHD+',
    prices: [180, 175, 170, 165, 155],
    description: 'Pantalla para iPhone 11 con foco en instalación sencilla y buen margen de mayoreo.',
  },
  {
    id: 'iphone-11-pro-incell',
    category: 'iPhone INCELL',
    name: 'Pantalla para iPhone 11 Pro',
    quality: 'INCELL FHD+ MOVE IC',
    prices: [200, 195, 190, 190, 185],
    description: 'Opción INCELL para iPhone 11 Pro con disponibilidad para pedidos de taller.',
  },
  {
    id: 'iphone-11-pro-max-incell',
    category: 'iPhone INCELL',
    name: 'Pantalla para iPhone 11 Pro Max',
    quality: 'INCELL FHD+ MOVE IC',
    prices: [220, 210, 200, 195, 190],
    description: 'Producto de rotación alta para clientes que buscan precio de entrada y buen inventario.',
  },
  {
    id: 'iphone-12-mini-incell',
    category: 'iPhone INCELL',
    name: 'Pantalla para iPhone 12 mini',
    quality: 'INCELL FHD+ MOVE IC',
    prices: [230, 220, 210, 200, 195],
    description: 'Repuesto compacto para reparación ágil y venta por pieza o mayoreo.',
  },
  {
    id: 'iphone-12-pro-max-incell',
    category: 'iPhone INCELL',
    name: 'Pantalla para iPhone 12 Pro Max',
    quality: 'INCELL FHD+ MOVE IC',
    prices: [250, 240, 235, 230, 220],
    description: 'Pantalla INCELL para 12 Pro Max con foco en stock local en CDMX.',
  },
  {
    id: 'iphone-13-mini-incell',
    category: 'iPhone INCELL',
    name: 'Pantalla para iPhone 13 mini',
    quality: 'INCELL FHD+ MOVE IC',
    prices: [260, 250, 245, 240, 235],
    description: 'Pantalla para 13 mini con precio competitivo para talleres y distribuidores.',
  },
  {
    id: 'iphone-13-incell',
    category: 'iPhone INCELL',
    name: 'Pantalla para iPhone 13',
    quality: 'INCELL FHD+ MOVE IC',
    prices: [250, 245, 240, 235, 230],
    description: 'Modelo de alta demanda con una tabla clara de compra por cantidad.',
  },
  {
    id: 'iphone-13-pro-incell',
    category: 'iPhone INCELL',
    name: 'Pantalla para iPhone 13 Pro',
    quality: 'INCELL FHD+ MOVE IC',
    prices: [300, 290, 285, 280, 275],
    description: 'Pantalla INCELL para 13 Pro con enfoque en reventa y reparación profesional.',
  },
  {
    id: 'iphone-13-pro-max-incell',
    category: 'iPhone INCELL',
    name: 'Pantalla para iPhone 13 Pro Max',
    quality: 'INCELL FHD+ MOVE IC',
    prices: [350, 340, 335, 330, 325],
    description: 'Una de las referencias más fuertes de mayoreo para clientes de CDMX.',
  },
  {
    id: 'iphone-14-incell',
    category: 'iPhone INCELL',
    name: 'Pantalla para iPhone 14',
    quality: 'INCELL FHD+ MOVE IC',
    prices: [260, 250, 245, 240, 230],
    description: 'Pantalla estable para reparaciones rápidas con disponibilidad para mayoreo.',
  },
  {
    id: 'iphone-14-plus-incell',
    category: 'iPhone INCELL',
    name: 'Pantalla para iPhone 14 Plus',
    quality: 'INCELL FHD+ MOVE IC',
    prices: [300, 290, 280, 275, 265],
    description: 'Opción para 14 Plus con precio escalonado por cantidad.',
  },
  {
    id: 'iphone-14-pro-incell',
    category: 'iPhone INCELL',
    name: 'Pantalla para iPhone 14 Pro',
    quality: 'INCELL FHD+ MOVE IC',
    prices: [350, 340, 330, 320, 310],
    description: 'Pantalla para 14 Pro con precio por volumen disponible para mayoristas.',
  },
  {
    id: 'iphone-14-pro-max-incell',
    category: 'iPhone INCELL',
    name: 'Pantalla para iPhone 14 Pro Max',
    quality: 'INCELL FHD+ MOVE IC',
    prices: [380, 350, 340, 330, 310],
    description: 'Modelo fuerte para talleres que requieren rotación constante.',
  },
  {
    id: 'iphone-15-incell',
    category: 'iPhone INCELL',
    name: 'Pantalla para iPhone 15',
    quality: 'INCELL FHD+ MOVE IC',
    prices: [300, 290, 285, 280, 275],
    description: 'Referencia reciente para stock activo y cotización directa por WhatsApp.',
  },
  {
    id: 'iphone-xs-max-oled',
    category: 'iPhone OLED',
    name: 'Pantalla para iPhone XS MAX',
    quality: 'OLED PREMIUM MOVE IC',
    prices: [580, 570, 560, 550, 540],
    description: 'Pantalla OLED premium para clientes que buscan mejor calidad visual.',
  },
  {
    id: 'iphone-11-pro-max-oled',
    category: 'iPhone OLED',
    name: 'Pantalla para iPhone 11 Pro Max',
    quality: 'OLED PREMIUM MOVE IC',
    prices: [600, 590, 580, 550, 535],
    description: 'OLED premium con una tabla clara para venta por pieza o por volumen.',
  },
  {
    id: 'iphone-12-pro-max-oled',
    category: 'iPhone OLED',
    name: 'Pantalla para iPhone 12 Pro Max',
    quality: 'OLED PREMIUM MOVE IC',
    prices: [850, 830, 800, 750, 730],
    description: 'Una de las referencias OLED más consultadas en CDMX.',
  },
  {
    id: 'iphone-13-oled',
    category: 'iPhone OLED',
    name: 'Pantalla para iPhone 13',
    quality: 'OLED PREMIUM MOVE IC',
    prices: [730, 720, 710, 630, 600],
    description: 'Pantalla OLED con disponibilidad para técnicos y distribuidores.',
  },
  {
    id: 'iphone-13-pro-oled',
    category: 'iPhone OLED',
    name: 'Pantalla para iPhone 13 Pro',
    quality: 'OLED PREMIUM MOVE IC',
    prices: [800, 780, 750, 730, 700],
    description: 'Opción premium para reparación con mejor respuesta visual.',
  },
  {
    id: 'iphone-13-pro-max-oled',
    category: 'iPhone OLED',
    name: 'Pantalla para iPhone 13 Pro Max',
    quality: 'OLED PREMIUM MOVE IC',
    prices: [900, 850, 800, 770, 750],
    description: 'Alta rotación para compras por mayoreo en CDMX y envío nacional.',
  },
  {
    id: 'iphone-14-oled',
    category: 'iPhone OLED',
    name: 'Pantalla para iPhone 14',
    quality: 'OLED PREMIUM MOVE IC',
    prices: [700, 680, 650, 630, 600],
    description: 'Pantalla OLED pensada para clientes que piden mejor acabado.',
  },
  {
    id: 'iphone-14-plus-oled',
    category: 'iPhone OLED',
    name: 'Pantalla para iPhone 14 Plus',
    quality: 'OLED PREMIUM MOVE IC',
    prices: [900, 880, 850, 830, 800],
    description: 'Referencia premium para 14 Plus con compra por volumen.',
  },
  {
    id: 'iphone-14-pro-max-oled',
    category: 'iPhone OLED',
    name: 'Pantalla para iPhone 14 Pro Max',
    quality: 'OLED PREMIUM MOVE IC',
    prices: [1000, 950, 900, 850, 800],
    description: 'Pantalla premium para 14 Pro Max con precios escalonados por cantidad.',
  },
  {
    id: 'samsung-s20-incell',
    category: 'Samsung INCELL',
    name: 'Pantalla para Samsung S20',
    quality: 'INCELL-HD+ CON MARCO',
    prices: [500, 480, 460, 450, 440],
    description: 'Producto Samsung con marco para instalación rápida.',
  },
  {
    id: 'samsung-s21-incell',
    category: 'Samsung INCELL',
    name: 'Pantalla para Samsung S21',
    quality: 'INCELL-HD+ CON MARCO',
    prices: [800, 750, 700, 600, 550],
    description: 'Pantalla con marco para talleres y reventa en CDMX.',
  },
  {
    id: 'samsung-s22-ultra-incell',
    category: 'Samsung INCELL',
    name: 'Pantalla para Samsung S22 Ultra',
    quality: 'INCELL-HD+ CON MARCO',
    prices: [800, 750, 700, 650, 600],
    description: 'Opción INCELL para S22 Ultra con compra sencilla por WhatsApp.',
  },
  {
    id: 'samsung-s23-ultra-incell',
    category: 'Samsung INCELL',
    name: 'Pantalla para Samsung S23 Ultra',
    quality: 'INCELL-HD+ CON MARCO',
    prices: [700, 680, 650, 620, 600],
    description: 'Pantalla Samsung con marco enfocada en mayoreo y stock local.',
  },
  {
    id: 'samsung-s24-ultra-incell',
    category: 'Samsung INCELL',
    name: 'Pantalla para Samsung S24 Ultra',
    quality: 'INCELL-HD+ CON MARCO',
    prices: [1000, 950, 900, 850, 800],
    description: 'Producto de gama alta para rotación en talleres y distribuidores.',
  },
  {
    id: 'samsung-note-20-ultra-incell',
    category: 'Samsung INCELL',
    name: 'Pantalla para Samsung Note 20 Ultra',
    quality: 'INCELL-HD+ CON MARCO',
    prices: [800, 780, 750, 700, 680],
    description: 'Pantalla Note 20 Ultra con disponibilidad para cotización inmediata.',
  },
  {
    id: 'samsung-s20-plus-oled',
    category: 'Samsung OLED',
    name: 'Pantalla para Samsung S20 Plus',
    quality: 'OLED PREMIUM C/M',
    prices: [1100, 1050, 1000, 950, 900],
    description: 'Pantalla OLED premium para S20 Plus con enfoque profesional.',
  },
  {
    id: 'samsung-s21-ultra-oled',
    category: 'Samsung OLED',
    name: 'Pantalla para Samsung S21 Ultra',
    quality: 'OLED PREMIUM C/M',
    prices: [1600, 1550, 1500, 1450, 1400],
    description: 'Gama alta con tabla de precios por cantidad para distribuidores.',
  },
  {
    id: 'samsung-s22-ultra-oled',
    category: 'Samsung OLED',
    name: 'Pantalla para Samsung S22 Ultra',
    quality: 'OLED PREMIUM C/M',
    prices: [1750, 1700, 1650, 1550, 1500],
    description: 'Una de las referencias premium más consultadas en Samsung.',
  },
  {
    id: 'samsung-s23-ultra-oled',
    category: 'Samsung OLED',
    name: 'Pantalla para Samsung S23 Ultra',
    quality: 'OLED PREMIUM C/M',
    prices: [1600, 1580, 1550, 1500, 1400],
    description: 'Pantalla premium para un acabado cercano al original.',
  },
  {
    id: 'samsung-s24-ultra-oled',
    category: 'Samsung OLED',
    name: 'Pantalla para Samsung S24 Ultra',
    quality: 'OLED PREMIUM C/M',
    prices: [1800, 1750, 1700, 1650, 1600],
    description: 'Producto premium con foco en mayoreo y atención a distribuidores.',
  },
  {
    id: 'samsung-s25-ultra-oled',
    category: 'Samsung OLED',
    name: 'Pantalla para Samsung S25 Ultra',
    quality: 'OLED PREMIUM C/M',
    prices: [2000, 1900, 1800, 1750, 1700],
    description: 'Pantalla OLED premium para S25 Ultra con compra por cantidad.',
  },
];

function buildPriceTable(values) {
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

function buildLowestPriceText(priceTable) {
  const numericValues = priceTable
    .map((row) => Number(String(row.price).replace(/[^\d.-]/g, '')))
    .filter((value) => Number.isFinite(value) && value > 0);
  if (!numericValues.length) {
    return 'Consultar';
  }
  return `Desde $${Math.min(...numericValues).toLocaleString('es-MX')} MXN`;
}

function buildWhatsAppUrl(message) {
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}

function getProductUrl(productId) {
  return `producto.html?id=${encodeURIComponent(productId)}`;
}

function createProduct(definition) {
  const categoryMeta = CATEGORY_META[definition.category];
  const categoryMedia = definition.category === 'iPhone INCELL' ? IPHONE_INCELL_MEDIA[definition.id] : null;
  const priceTable = buildPriceTable(definition.prices);
  const mainImage = definition.mainImage || categoryMedia?.mainImage || categoryMeta.mainImage;
  const galleryImages = definition.galleryImages || categoryMedia?.galleryImages || categoryMeta.galleryImages;
  return {
    id: definition.id,
    brand: categoryMeta.brand,
    category: definition.category,
    name: definition.name,
    quality: definition.quality,
    mainImage,
    galleryImages: [mainImage, ...(galleryImages || [])].filter(Boolean),
    videos: definition.videos || categoryMedia?.videos || [],
    priceTable,
    description: definition.description,
    whatsappText: `Hola HAODE, quiero cotizar: ${definition.name}`,
    lowestPriceText: buildLowestPriceText(priceTable),
  };
}

const PRODUCTS = PRODUCT_DEFINITIONS.map(createProduct);
const PRODUCT_BY_ID = new Map(PRODUCTS.map((product) => [product.id, product]));

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

  const overlay = document.createElement('a');
  overlay.className = 'shop-card-link';
  overlay.href = getProductUrl(product.id);
  overlay.setAttribute('aria-label', `Ver detalles de ${product.name}`);

  const media = document.createElement('div');
  media.className = 'shop-media';

  const image = document.createElement('img');
  image.src = product.mainImage || PLACEHOLDER_IMAGE;
  image.alt = product.name;
  image.loading = 'lazy';
  image.decoding = 'async';
  image.onerror = () => {
    if (image.src !== PLACEHOLDER_IMAGE) image.src = PLACEHOLDER_IMAGE;
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

  const price = document.createElement('p');
  price.className = 'shop-price';
  price.textContent = product.lowestPriceText || 'Consultar';

  const actions = document.createElement('div');
  actions.className = 'shop-actions';

  const whatsapp = document.createElement('a');
  whatsapp.className = 'btn btn-primary shop-cta';
  whatsapp.href = buildWhatsAppUrl(product.whatsappText);
  whatsapp.target = '_blank';
  whatsapp.rel = 'noopener noreferrer';
  whatsapp.textContent = 'Cotizar por WhatsApp';

  const details = document.createElement('a');
  details.className = 'btn btn-secondary shop-details';
  details.href = getProductUrl(product.id);
  details.textContent = 'Ver detalles';

  actions.append(whatsapp, details);
  content.append(title, quality, price, actions);

  article.append(overlay, media, content);
  return article;
}

function renderCatalogPage() {
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

      const head = document.createElement('div');
      head.className = 'catalog-section-head';

      const titleWrap = document.createElement('div');
      const kicker = document.createElement('p');
      kicker.className = 'section-kicker';
      kicker.textContent = meta.brand;
      const heading = document.createElement('h2');
      heading.textContent = meta.title;
      const subtitle = document.createElement('p');
      subtitle.className = 'catalog-section-subtitle';
      subtitle.textContent = meta.subtitle;
      titleWrap.append(kicker, heading, subtitle);

      const count = document.createElement('p');
      count.className = 'catalog-count';
      count.textContent = `${categoryProducts.length} modelos`;

      head.append(titleWrap, count);

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

function renderProductDetailPage() {
  const page = document.querySelector('[data-product-detail]');
  if (!page) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const product = PRODUCT_BY_ID.get(id);

  const titleEl = page.querySelector('[data-detail-title]');
  const subtitleEl = page.querySelector('[data-detail-subtitle]');
  const brandEl = page.querySelector('[data-detail-brand]');
  const qualityEl = page.querySelector('[data-detail-quality]');
  const descriptionEl = page.querySelector('[data-detail-description]');
  const mainImageEl = page.querySelector('[data-detail-main-image]');
  const galleryEl = page.querySelector('[data-detail-gallery]');
  const videosEl = page.querySelector('[data-detail-videos]');
  const priceEl = page.querySelector('[data-detail-price]');
  const tableBody = page.querySelector('[data-detail-price-body]');
  const whatsappLink = page.querySelector('[data-detail-whatsapp]');
  const backLink = page.querySelector('[data-detail-back]');

  if (!product) {
    page.innerHTML = `
      <div class="detail-empty">
        <p class="section-kicker">Producto no encontrado</p>
        <h1>No pudimos abrir este producto</h1>
        <p>Regresa al catálogo para elegir otra pantalla HAODE.</p>
        <a class="btn btn-primary" href="productos.html">Volver al catálogo</a>
      </div>
    `;
    return;
  }

  document.title = `${product.name} | HAODE México`;

  if (titleEl) titleEl.textContent = product.name;
  if (subtitleEl) subtitleEl.textContent = CATEGORY_META[product.category].title;
  if (brandEl) brandEl.textContent = product.brand;
  if (qualityEl) qualityEl.textContent = product.quality;
  if (descriptionEl) descriptionEl.textContent = product.description;
  if (mainImageEl) {
    mainImageEl.src = product.mainImage || PLACEHOLDER_IMAGE;
    mainImageEl.alt = product.name;
    mainImageEl.onerror = () => {
      if (mainImageEl.src !== PLACEHOLDER_IMAGE) mainImageEl.src = PLACEHOLDER_IMAGE;
    };
  }

  if (priceEl) priceEl.textContent = product.lowestPriceText || 'Consultar';

  if (whatsappLink) {
    whatsappLink.href = buildWhatsAppUrl(product.whatsappText);
  }

  if (backLink) {
    backLink.href = 'productos.html';
  }

  if (galleryEl) {
    galleryEl.innerHTML = '';
    const galleryImages = [...new Set([product.mainImage, ...product.galleryImages].filter(Boolean))];
    galleryImages.slice(0, 4).forEach((src, index) => {
      const img = document.createElement('img');
      img.src = src;
      img.alt = `${product.name} foto ${index + 1}`;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.onerror = () => {
        if (img.src !== PLACEHOLDER_IMAGE) img.src = PLACEHOLDER_IMAGE;
      };
      galleryEl.appendChild(img);
    });

    if (!galleryEl.children.length) {
      const empty = document.createElement('div');
      empty.className = 'detail-empty-note';
      empty.textContent = 'Más fotos y videos próximamente.';
      galleryEl.appendChild(empty);
    }
  }

  if (videosEl) {
    videosEl.innerHTML = '';
    if (product.videos && product.videos.length) {
      product.videos.forEach((video) => {
        const frame = document.createElement('video');
        frame.controls = true;
        frame.playsInline = true;
        frame.src = video;
        videosEl.appendChild(frame);
      });
    } else {
      const empty = document.createElement('div');
      empty.className = 'detail-empty-note';
      empty.textContent = 'Más fotos y videos próximamente.';
      videosEl.appendChild(empty);
    }
  }

  if (tableBody) {
    tableBody.innerHTML = '';
    product.priceTable.forEach((row) => {
      const tr = document.createElement('tr');
      const qty = document.createElement('th');
      qty.scope = 'row';
      qty.textContent = row.quantity;
      const price = document.createElement('td');
      price.textContent = row.price;
      tr.append(qty, price);
      tableBody.appendChild(tr);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderCatalogPage();
  renderProductDetailPage();
});

window.HAODE_PRODUCTS = PRODUCTS;
window.HAODE_GET_PRODUCT = (id) => PRODUCT_BY_ID.get(id);
