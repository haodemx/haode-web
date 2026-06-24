const WHATSAPP_PHONE = '523326684296';
const PLACEHOLDER_IMAGE = 'assets/products/placeholder.svg';
const QUANTITY_LABELS = ['1 pza', '5+ pzs', '100 pzs surtido', '100 pzs/modelo', 'Caja/modelo'];

const CATEGORY_META = {
  'iphone-incell': {
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
  'iphone-oled': {
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
  'samsung-incell': {
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
  'samsung-oled': {
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
  'oled-diagnostica': {
    brand: 'HAODE',
    title: 'OLED Diagnóstica',
    subtitle: 'Pantallas OLED HAODE Diagnóstica para reparación profesional de teléfonos móviles.',
    mainImage: 'assets/products/placeholder.svg',
    galleryImages: [],
  },
  'gafas-ai': {
    brand: 'HAODE',
    title: 'Gafas AI',
    subtitle: 'Productos inteligentes HAODE para venta en tienda, técnicos y mayoreo.',
    mainImage: 'assets/products/productos-ai/aimb-g5-ai-smart-glasses/main.jpg',
    galleryImages: [],
  },
  'camaras-inteligentes': {
    brand: 'HAODE',
    title: 'Cámaras Inteligentes',
    subtitle: 'Cámaras digitales y cámaras inteligentes para contenido, viajes, regalos y venta en tienda.',
    mainImage: 'assets/products/productos-ai/lk-007-camara-digital-4k/main.png',
    galleryImages: [
      'assets/products/productos-ai/lk-007-camara-digital-4k/gallery-01.png',
      'assets/products/productos-ai/lk-007-camara-digital-4k/gallery-02.png',
      'assets/products/productos-ai/lk-007-camara-digital-4k/gallery-03.png',
    ],
  },
  micas: {
    brand: 'HAODE',
    title: 'Micas',
    subtitle: 'Micas para protección celular en mostrador y mayoreo.',
    mainImage: 'assets/products/micas/hd/main.png',
    galleryImages: [],
  },
  'maquinas-de-mica': {
    brand: 'HAODE',
    title: 'Máquinas de Mica',
    subtitle: 'Máquinas y herramientas para corte profesional de micas.',
    mainImage: 'assets/products/cut-machine/x200t/main.jpg',
    galleryImages: [],
  },
  fundas: {
    brand: 'HAODE',
    title: 'Fundas',
    subtitle: 'Fundas y accesorios para venta rápida en tienda.',
    mainImage: 'assets/products/fundas/funda-premium-aluminio-plus/main.webp',
    galleryImages: [],
  },
};

const CATEGORY_SLUGS = Object.keys(CATEGORY_META);
const CATEGORY_ALIASES = {
  all: 'all',
  todos: 'all',
  'iPhone INCELL': 'iphone-incell',
  'iPhone OLED': 'iphone-oled',
  'Samsung INCELL': 'samsung-incell',
  'Samsung OLED': 'samsung-oled',
  'Pantallas OLED Diagnóstica': 'oled-diagnostica',
  'OLED Diagnóstica': 'oled-diagnostica',
  'Gafas AI': 'gafas-ai',
  'Productos AI': 'camaras-inteligentes',
  'Cámaras Inteligentes': 'camaras-inteligentes',
  'Camaras Inteligentes': 'camaras-inteligentes',
  'Micas': 'micas',
  'Máquinas de Mica': 'maquinas-de-mica',
  'Maquinas de Mica': 'maquinas-de-mica',
  'Fundas': 'fundas',
  'iphone-incell': 'iphone-incell',
  'iphone-oled': 'iphone-oled',
  'samsung-incell': 'samsung-incell',
  'samsung-oled': 'samsung-oled',
  'oled-diagnostica': 'oled-diagnostica',
  'gafas-ai': 'gafas-ai',
  'camaras-inteligentes': 'camaras-inteligentes',
  micas: 'micas',
  'maquinas-de-mica': 'maquinas-de-mica',
  fundas: 'fundas',
};

const SAMSUNG_TIPO_ORIGINAL_MODEL_CARDS = [
  {
    title: 'Pantalla para Samsung S21 Ultra TIPO ORIGINAL CON MARCO',
    image: 'assets/products/samsung-original/s21-ultra/main.jpg',
    searchText: 'Samsung S21 Ultra TIPO ORIGINAL CON MARCO pantalla original app',
  },
  {
    title: 'Pantalla para Samsung S22 Plus TIPO ORIGINAL CON MARCO',
    image: 'assets/products/samsung-original/s22-plus/main.png',
    searchText: 'Samsung S22 Plus S22+ TIPO ORIGINAL CON MARCO pantalla original app',
  },
  {
    title: 'Pantalla para Samsung S22 Ultra TIPO ORIGINAL CON MARCO',
    image: 'assets/products/samsung-original/s22-ultra/main.jpg',
    searchText: 'Samsung S22 Ultra TIPO ORIGINAL CON MARCO pantalla original app',
  },
  {
    title: 'Pantalla para Samsung S23 Plus TIPO ORIGINAL CON MARCO',
    image: 'assets/products/samsung-original/s23-plus/main.png',
    searchText: 'Samsung S23 Plus S23+ TIPO ORIGINAL CON MARCO pantalla original app',
  },
  {
    title: 'Pantalla para Samsung S23 Ultra TIPO ORIGINAL CON MARCO',
    image: 'assets/products/samsung-original/s23-ultra/main.jpg',
    searchText: 'Samsung S23 Ultra TIPO ORIGINAL CON MARCO pantalla original app',
  },
  {
    title: 'Pantalla para Samsung S24 Ultra TIPO ORIGINAL CON MARCO',
    image: 'assets/products/samsung-original/s24-ultra/main.png',
    searchText: 'Samsung S24 Ultra TIPO ORIGINAL CON MARCO pantalla original app',
  },
  {
    title: 'Pantalla para Samsung S25 Ultra TIPO ORIGINAL CON MARCO',
    image: 'assets/products/samsung-original/s25-ultra/main.png',
    searchText: 'Samsung S25 Ultra TIPO ORIGINAL CON MARCO pantalla original app',
  },
  {
    title: 'Pantalla para Samsung Note 20 Ultra TIPO ORIGINAL CON MARCO',
    image: PLACEHOLDER_IMAGE,
    searchText: 'Samsung Note 20 Ultra TIPO ORIGINAL CON MARCO pantalla original app',
  },
  {
    title: 'Pantalla para Samsung Z Flip3 TIPO ORIGINAL CON MARCO',
    image: 'assets/products/samsung-original/z-flip3/main.png',
    searchText: 'Samsung Z Flip3 Z Flip 3 TIPO ORIGINAL CON MARCO pantalla plegable flip original app',
  },
  {
    title: 'Pantalla para Samsung Z Flip4 TIPO ORIGINAL CON MARCO',
    image: 'assets/products/samsung-original/z-flip4/main.png',
    searchText: 'Samsung Z Flip4 Z Flip 4 TIPO ORIGINAL CON MARCO pantalla plegable flip original app',
  },
  {
    title: 'Pantalla para Samsung Z Flip5 TIPO ORIGINAL CON MARCO',
    image: 'assets/products/samsung-original/z-flip5/main.png',
    searchText: 'Samsung Z Flip5 Z Flip 5 TIPO ORIGINAL CON MARCO pantalla plegable flip original app',
  },
  {
    title: 'Pantalla para Samsung Z Flip6 TIPO ORIGINAL CON MARCO',
    image: 'assets/products/samsung-original/z-flip6/main.png',
    searchText: 'Samsung Z Flip6 Z Flip 6 TIPO ORIGINAL CON MARCO pantalla plegable flip original app',
  },
  {
    title: 'Pantalla Samsung Z Flip7 TIPO ORIGINAL CON MARCO',
    image: 'assets/products/samsung-original/z-flip7/main.png',
    href: '/productos/samsung-z-flip7/',
    cta: 'Ver Pantalla Samsung Z Flip7',
    searchText: 'Samsung Z Flip7 Z Flip 7 TIPO ORIGINAL CON MARCO pantalla plegable flip original categoria producto',
  },
  {
    title: 'Pantalla Samsung Z Fold3 TIPO ORIGINAL CON MARCO',
    image: 'assets/products/samsung-original/z-fold3/main.png',
    href: '/productos/samsung-z-fold3/',
    cta: 'Ver Pantalla Samsung Z Fold3',
    searchText: 'Samsung Z Fold3 Z Fold 3 TIPO ORIGINAL CON MARCO pantalla plegable fold original categoria producto',
  },
  {
    title: 'Pantalla Samsung Z Fold4 TIPO ORIGINAL CON MARCO',
    image: 'assets/products/samsung-original/z-fold4/main.png',
    href: '/productos/samsung-z-fold4/',
    cta: 'Ver Pantalla Samsung Z Fold4',
    searchText: 'Samsung Z Fold4 Z Fold 4 TIPO ORIGINAL CON MARCO pantalla plegable fold original categoria producto',
  },
  {
    title: 'Pantalla Samsung Z Fold5 TIPO ORIGINAL CON MARCO',
    image: 'assets/products/samsung-original/z-fold5/main.png',
    href: '/productos/samsung-z-fold5/',
    cta: 'Ver Pantalla Samsung Z Fold5',
    searchText: 'Samsung Z Fold5 Z Fold 5 TIPO ORIGINAL CON MARCO pantalla plegable fold original categoria producto',
  },
  {
    title: 'Pantalla Samsung Z Fold6 TIPO ORIGINAL CON MARCO',
    image: 'assets/products/samsung-original/z-fold6/main.png',
    href: '/productos/samsung-z-fold6/',
    cta: 'Ver Pantalla Samsung Z Fold6',
    searchText: 'Samsung Z Fold6 Z Fold 6 TIPO ORIGINAL CON MARCO pantalla plegable fold original categoria producto',
  },
].map((card) => ({
  eyebrow: 'Samsung TIPO ORIGINAL',
  text: 'Modelo bajo pedido con marco para técnicos y tiendas de reparación.',
  href: '/app/',
  cta: 'Ver en HAODE APP',
  filterId: 'samsung-tipo-original',
  ...card,
}));

const FUNDAS_MICAS_FILTERS = [
  { id: 'all', label: 'Todas' },
  { id: 'fundas', label: 'Fundas' },
  { id: 'micas', label: 'Micas' },
  { id: 'maquinas-de-hidrogel', label: 'Máquinas de hidrogel' },
  { id: 'estilo-iphone-17-pro-max', label: 'Estilo iPhone 17 Pro Max' },
  { id: 'aluminio', label: 'Aluminio' },
  { id: 'privacy', label: 'Privacy' },
  { id: 'matte', label: 'Matte' },
  { id: 'hd', label: 'HD' },
];

const PRODUCTOS_AI_FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'gafas-ai', label: 'Gafas AI' },
  { id: 'camaras-inteligentes', label: 'Cámaras inteligentes' },
];

const CATALOG_GROUPS = [
  {
    id: 'pantallas',
    kicker: 'Pantallas',
    title: 'Pantallas',
    subtitle: 'Familias de pantalla para técnicos y distribuidores, organizadas por tipo y modelo.',
    categories: ['iphone-incell', 'iphone-oled', 'samsung-incell', 'samsung-oled', 'oled-diagnostica'],
    featureCards: [
      ...SAMSUNG_TIPO_ORIGINAL_MODEL_CARDS,
      {
        title: 'Samsung AMOLED',
        eyebrow: 'Pantallas Samsung',
        text: 'Consulta líneas Samsung AMOLED y opciones compatibles con tu pedido.',
        image: 'assets/products/samsung-oled/s24-ultra/main.jpg',
        href: 'https://wa.me/523326684296?text=Hola%20HAODE%2C%20quiero%20cotizar%20pantallas%20Samsung%20AMOLED',
        cta: 'Cotizar AMOLED',
        external: true,
        filterId: 'samsung-amoled',
        searchText: 'Samsung AMOLED pantalla amoled oled galaxy premium cotizacion',
      },
    ],
  },
  {
    id: 'baterias',
    kicker: 'Baterías',
    title: 'Baterías',
    subtitle: 'Consulta modelos, capacidad y disponibilidad por WhatsApp.',
    categories: [],
    featureCards: [
      {
        title: 'Original',
        eyebrow: 'Baterías por cotización',
        text: 'Indica modelo y cantidad para confirmar disponibilidad.',
        image: PLACEHOLDER_IMAGE,
        href: 'https://wa.me/523326684296?text=Hola%2C%20quiero%20cotizar%20bater%C3%ADas.%20%C2%BFMe%20pueden%20confirmar%20modelos%20y%20disponibilidad%3F',
        cta: 'Cotizar por WhatsApp',
        external: true,
      },
      {
        title: 'Alta capacidad',
        eyebrow: 'Baterías por cotización',
        text: 'Consulta opciones por modelo antes de confirmar pedido.',
        image: PLACEHOLDER_IMAGE,
        href: 'https://wa.me/523326684296?text=Hola%2C%20quiero%20cotizar%20bater%C3%ADas.%20%C2%BFMe%20pueden%20confirmar%20modelos%20y%20disponibilidad%3F',
        cta: 'Cotizar por WhatsApp',
        external: true,
      },
      {
        title: 'Sin mensaje',
        eyebrow: 'Baterías por cotización',
        text: 'Confirma compatibilidad y disponibilidad por WhatsApp.',
        image: PLACEHOLDER_IMAGE,
        href: 'https://wa.me/523326684296?text=Hola%2C%20quiero%20cotizar%20bater%C3%ADas.%20%C2%BFMe%20pueden%20confirmar%20modelos%20y%20disponibilidad%3F',
        cta: 'Cotizar por WhatsApp',
        external: true,
      },
      {
        title: 'iPhone',
        eyebrow: 'Baterías por cotización',
        text: 'Comparte modelo exacto para revisar opciones disponibles.',
        image: PLACEHOLDER_IMAGE,
        href: 'https://wa.me/523326684296?text=Hola%2C%20quiero%20cotizar%20bater%C3%ADas.%20%C2%BFMe%20pueden%20confirmar%20modelos%20y%20disponibilidad%3F',
        cta: 'Cotizar por WhatsApp',
        external: true,
      },
      {
        title: 'Samsung',
        eyebrow: 'Baterías por cotización',
        text: 'Envíanos modelo y cantidad para preparar la cotización.',
        image: PLACEHOLDER_IMAGE,
        href: 'https://wa.me/523326684296?text=Hola%2C%20quiero%20cotizar%20bater%C3%ADas.%20%C2%BFMe%20pueden%20confirmar%20modelos%20y%20disponibilidad%3F',
        cta: 'Cotizar por WhatsApp',
        external: true,
      },
    ],
    empty: {
      title: 'Baterías disponibles por cotización',
      text: 'Consulta modelos, capacidad y disponibilidad por WhatsApp.',
      cta: 'Cotizar baterías por WhatsApp',
      href: 'https://wa.me/523326684296?text=Hola%2C%20quiero%20cotizar%20bater%C3%ADas.%20%C2%BFMe%20pueden%20confirmar%20modelos%20y%20disponibilidad%3F',
    },
  },
  {
    id: 'fundas-micas',
    kicker: 'Protección',
    title: 'Fundas / Micas',
    subtitle: 'Fundas, micas y soluciones de corte se muestran aquí como una sección independiente.',
    categories: ['fundas', 'micas'],
    controls: {
      label: 'Buscar funda o mica',
      placeholder: 'Buscar funda, mica o modelo: 13 Pro, 14 Pro Max, 16 Pro, privacy, matte...',
      filters: FUNDAS_MICAS_FILTERS,
      empty: {
        title: 'No encontramos ese producto en Fundas / Micas.',
        text: 'Escríbenos por WhatsApp y te confirmamos disponibilidad.',
        cta: 'Consultar por WhatsApp',
        href: 'https://wa.me/523326684296?text=Hola%20HAODE%2C%20busco%20una%20funda%20o%20mica%20y%20quiero%20confirmar%20disponibilidad',
      },
    },
    featureCards: [
      {
        title: 'Máquinas de Hidrogel',
        eyebrow: 'Micas',
        text: 'Máquinas de corte, micas y consumibles para tiendas y técnicos.',
        image: 'assets/products/cut-machine/x200t/main.jpg',
        href: '/categoria/maquinas-de-hidrogel/',
        cta: 'Ver máquinas',
        filterId: 'maquinas-de-hidrogel',
        searchText: 'maquinas de hidrogel maquinas de mica corte profesional micas consumibles x200t',
      },
    ],
  },
  {
    id: 'productos-ai',
    kicker: 'Productos AI',
    title: 'Productos AI',
    subtitle: 'AI glasses, cámaras inteligentes y productos electrónicos para venta en tienda.',
    categories: ['gafas-ai', 'camaras-inteligentes'],
    controls: {
      label: 'Buscar producto AI',
      placeholder: 'Buscar producto AI: G5, W630, S1, cámara, LK-007...',
      filters: PRODUCTOS_AI_FILTERS,
      empty: {
        title: 'No encontramos ese producto AI.',
        text: 'Escríbenos por WhatsApp y te confirmamos disponibilidad.',
        cta: 'Consultar por WhatsApp',
        href: 'https://wa.me/523326684296?text=Hola%20HAODE%2C%20busco%20un%20producto%20AI%20y%20quiero%20confirmar%20disponibilidad',
      },
    },
  },
];

const PANTALLAS_FILTERS = [
  { id: 'all', label: 'Todas las pantallas' },
  { id: 'iphone-incell', label: 'iPhone INCELL' },
  { id: 'iphone-oled', label: 'iPhone OLED' },
  { id: 'samsung-incell', label: 'Samsung INCELL' },
  { id: 'samsung-oled', label: 'Samsung OLED' },
  { id: 'samsung-tipo-original', label: 'Samsung TIPO ORIGINAL' },
  { id: 'samsung-amoled', label: 'Samsung AMOLED' },
  { id: 'oled-diagnostica', label: 'iPhone OLED Diagnóstica' },
];

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

const IPHONE_OLED_MEDIA = {
  'iphone-xs-max-oled': {
    mainImage: 'assets/products/iphone-oled/xsmax/main.jpg',
    galleryImages: [
      'assets/products/iphone-oled/xsmax/gallery-01.jpg',
      'assets/products/iphone-oled/xsmax/gallery-02.jpg',
    ],
    videos: ['assets/products/iphone-oled/xsmax/video-01.mp4'],
  },
  'iphone-11-pro-max-oled': {
    mainImage: 'assets/products/iphone-oled/11promax/main.jpg',
    galleryImages: [
      'assets/products/iphone-oled/11promax/gallery-01.jpg',
      'assets/products/iphone-oled/11promax/gallery-02.jpg',
    ],
    videos: ['assets/products/iphone-oled/11promax/video-01.mp4'],
  },
  'iphone-12-pro-max-oled': {
    mainImage: 'assets/products/iphone-oled/12promax/main.jpg',
    galleryImages: [
      'assets/products/iphone-oled/12promax/gallery-01.jpg',
      'assets/products/iphone-oled/12promax/gallery-02.jpg',
    ],
    videos: ['assets/products/iphone-oled/12promax/video-01.mp4'],
  },
  'iphone-13-oled': {
    mainImage: 'assets/products/iphone-oled/13/main.jpg',
    galleryImages: [
      'assets/products/iphone-oled/13/gallery-01.jpg',
      'assets/products/iphone-oled/13/gallery-02.jpg',
    ],
    videos: ['assets/products/iphone-oled/13/video-01.mp4'],
  },
  'iphone-13-pro-oled': {
    mainImage: 'assets/products/iphone-oled/13pro/main.jpg',
    galleryImages: [
      'assets/products/iphone-oled/13pro/gallery-01.jpg',
      'assets/products/iphone-oled/13pro/gallery-02.jpg',
    ],
    videos: ['assets/products/iphone-oled/13pro/video-01.mp4'],
  },
  'iphone-13-pro-max-oled': {
    mainImage: 'assets/products/iphone-oled/13promax/main.jpg',
    galleryImages: [
      'assets/products/iphone-oled/13promax/gallery-01.jpg',
      'assets/products/iphone-oled/13promax/gallery-02.jpg',
    ],
    videos: ['assets/products/iphone-oled/13promax/video-01.mp4'],
  },
  'iphone-14-oled': {
    mainImage: 'assets/products/iphone-oled/14/main.jpg',
    galleryImages: [
      'assets/products/iphone-oled/14/gallery-01.jpg',
      'assets/products/iphone-oled/14/gallery-02.jpg',
    ],
    videos: ['assets/products/iphone-oled/14/video-01.mp4'],
  },
  'iphone-14-plus-oled': {
    mainImage: 'assets/products/iphone-oled/14plus/main.jpg',
    galleryImages: [
      'assets/products/iphone-oled/14plus/gallery-01.jpg',
      'assets/products/iphone-oled/14plus/gallery-02.jpg',
    ],
    videos: ['assets/products/iphone-oled/14plus/video-01.mp4'],
  },
  'iphone-14-pro-max-oled': {
    mainImage: 'assets/products/iphone-oled/14promax/main.jpg',
    galleryImages: [
      'assets/products/iphone-oled/14promax/gallery-01.jpg',
      'assets/products/iphone-oled/14promax/gallery-02.jpg',
    ],
    videos: ['assets/products/iphone-oled/14promax/video-01.mp4'],
  },
};

const SAMSUNG_INCELL_MEDIA = {
  'samsung-s20-incell': {
    mainImage: 'assets/products/samsung-incell/s20/main.jpg',
    galleryImages: [
      'assets/products/samsung-incell/s20/gallery-01.jpg',
      'assets/products/samsung-incell/s20/gallery-02.jpg',
    ],
    videos: ['assets/products/samsung-incell/s20/video-01.mp4'],
  },
  'samsung-s21-incell': {
    mainImage: 'assets/products/samsung-incell/s21/main.jpg',
    galleryImages: [
      'assets/products/samsung-incell/s21/gallery-01.jpg',
      'assets/products/samsung-incell/s21/gallery-02.jpg',
    ],
    videos: [],
  },
  'samsung-s22-ultra-incell': {
    mainImage: 'assets/products/samsung-incell/s22-ultra/main.jpg',
    galleryImages: [
      'assets/products/samsung-incell/s22-ultra/gallery-01.jpg',
      'assets/products/samsung-incell/s22-ultra/gallery-02.jpg',
    ],
    videos: ['assets/products/samsung-incell/s22-ultra/video-01.mp4'],
  },
  'samsung-s23-ultra-incell': {
    mainImage: 'assets/products/samsung-incell/s23-ultra/main.jpg',
    galleryImages: [
      'assets/products/samsung-incell/s23-ultra/gallery-01.jpg',
      'assets/products/samsung-incell/s23-ultra/gallery-02.jpg',
    ],
    videos: ['assets/products/samsung-incell/s23-ultra/video-01.mp4'],
  },
  'samsung-s24-ultra-incell': {
    mainImage: 'assets/products/samsung-incell/s24-ultra/main.jpg',
    galleryImages: [],
    videos: [],
  },
  'samsung-note-20-ultra-incell': {
    mainImage: 'assets/products/samsung-incell/note-20-ultra/main.jpg',
    galleryImages: [
      'assets/products/samsung-incell/note-20-ultra/gallery-01.jpg',
      'assets/products/samsung-incell/note-20-ultra/gallery-02.jpg',
    ],
    videos: [],
  },
};

const SAMSUNG_OLED_MEDIA = {
  'samsung-s20-plus-oled': {
    mainImage: 'assets/products/samsung-oled/s20-plus/main.jpg',
    galleryImages: [
      'assets/products/samsung-oled/s20-plus/gallery-01.jpg',
      'assets/products/samsung-oled/s20-plus/gallery-02.jpg',
    ],
    videos: ['assets/products/samsung-oled/s20-plus/video-01.mp4'],
  },
  'samsung-s21-ultra-oled': {
    mainImage: 'assets/products/samsung-oled/s21-ultra/main.jpg',
    galleryImages: [
      'assets/products/samsung-oled/s21-ultra/gallery-01.jpg',
      'assets/products/samsung-oled/s21-ultra/gallery-02.jpg',
    ],
    videos: ['assets/products/samsung-oled/s21-ultra/video-01.mp4'],
  },
  'samsung-s22-ultra-oled': {
    mainImage: 'assets/products/samsung-oled/s22-ultra/main.jpg',
    galleryImages: [
      'assets/products/samsung-oled/s22-ultra/gallery-01.jpg',
      'assets/products/samsung-oled/s22-ultra/gallery-02.jpg',
    ],
    videos: ['assets/products/samsung-oled/s22-ultra/video-01.mp4'],
  },
  'samsung-s23-ultra-oled': {
    mainImage: 'assets/products/samsung-oled/s23-ultra/main.jpg',
    galleryImages: [
      'assets/products/samsung-oled/s23-ultra/gallery-01.jpg',
      'assets/products/samsung-oled/s23-ultra/gallery-02.jpg',
    ],
    videos: ['assets/products/samsung-oled/s23-ultra/video-01.mp4'],
  },
  'samsung-s24-ultra-oled': {
    mainImage: 'assets/products/samsung-oled/s24-ultra/main.jpg',
    galleryImages: [
      'assets/products/samsung-oled/s24-ultra/gallery-01.jpg',
      'assets/products/samsung-oled/s24-ultra/gallery-02.jpg',
    ],
    videos: ['assets/products/samsung-oled/s24-ultra/video-01.mp4'],
  },
  'samsung-s25-ultra-oled': {
    mainImage: 'assets/products/samsung-oled/s25-ultra/main.jpg',
    galleryImages: [
      'assets/products/samsung-oled/s25-ultra/gallery-01.jpg',
      'assets/products/samsung-oled/s25-ultra/gallery-02.jpg',
    ],
    videos: ['assets/products/samsung-oled/s25-ultra/video-01.mp4'],
  },
};

const CATEGORY_MEDIA = {
  'iphone-incell': IPHONE_INCELL_MEDIA,
  'iphone-oled': IPHONE_OLED_MEDIA,
  'samsung-incell': SAMSUNG_INCELL_MEDIA,
  'samsung-oled': SAMSUNG_OLED_MEDIA,
};

const PRODUCT_DEFINITIONS = [
  {
    id: 'iphone-x-incell',
    category: 'iphone-incell',
    name: 'Pantalla para iPhone X',
    quality: 'INCELL FHD+',
    prices: [180, 175, 170, 165, 155],
    description: 'Reemplazo INCELL para talleres que buscan una opción confiable con precio competitivo.',
  },
  {
    id: 'iphone-xs-incell',
    category: 'iphone-incell',
    name: 'Pantalla para iPhone XS',
    quality: 'INCELL FHD+',
    prices: [180, 175, 170, 165, 155],
    description: 'Pantalla INCELL pensada para reparación rápida y venta por mayoreo.',
  },
  {
    id: 'iphone-xr-incell',
    category: 'iphone-incell',
    name: 'Pantalla para iPhone XR',
    quality: 'INCELL FHD+',
    prices: [180, 175, 170, 165, 155],
    description: 'Opción práctica para técnicos con buena respuesta táctil y compatibilidad estable.',
  },
  {
    id: 'iphone-11-incell',
    category: 'iphone-incell',
    name: 'Pantalla para iPhone 11',
    quality: 'INCELL FHD+',
    prices: [180, 175, 170, 165, 155],
    description: 'Pantalla para iPhone 11 con foco en instalación sencilla y buen margen de mayoreo.',
  },
  {
    id: 'iphone-11-pro-incell',
    category: 'iphone-incell',
    name: 'Pantalla para iPhone 11 Pro',
    quality: 'INCELL FHD+ MOVE IC',
    prices: [200, 195, 190, 190, 185],
    description: 'Opción INCELL para iPhone 11 Pro con disponibilidad para pedidos de taller.',
  },
  {
    id: 'iphone-11-pro-max-incell',
    category: 'iphone-incell',
    name: 'Pantalla para iPhone 11 Pro Max',
    quality: 'INCELL FHD+ MOVE IC',
    prices: [220, 210, 200, 195, 190],
    description: 'Producto de rotación alta para clientes que buscan precio de entrada y buen inventario.',
  },
  {
    id: 'iphone-12-mini-incell',
    category: 'iphone-incell',
    name: 'Pantalla para iPhone 12 mini',
    quality: 'INCELL FHD+ MOVE IC',
    prices: [230, 220, 210, 200, 195],
    description: 'Repuesto compacto para reparación ágil y venta por pieza o mayoreo.',
  },
  {
    id: 'iphone-12-pro-max-incell',
    category: 'iphone-incell',
    name: 'Pantalla para iPhone 12 Pro Max',
    quality: 'INCELL FHD+ MOVE IC',
    prices: [250, 240, 235, 230, 220],
    description: 'Pantalla INCELL para 12 Pro Max con foco en stock local en CDMX.',
  },
  {
    id: 'iphone-13-mini-incell',
    category: 'iphone-incell',
    name: 'Pantalla para iPhone 13 mini',
    quality: 'INCELL FHD+ MOVE IC',
    prices: [260, 250, 245, 240, 235],
    description: 'Pantalla para 13 mini con precio competitivo para talleres y distribuidores.',
  },
  {
    id: 'iphone-13-incell',
    category: 'iphone-incell',
    name: 'Pantalla para iPhone 13',
    quality: 'INCELL FHD+ MOVE IC',
    prices: [250, 245, 240, 235, 230],
    description: 'Modelo de alta demanda con una tabla clara de compra por cantidad.',
  },
  {
    id: 'iphone-13-pro-incell',
    category: 'iphone-incell',
    name: 'Pantalla para iPhone 13 Pro',
    quality: 'INCELL FHD+ MOVE IC',
    prices: [300, 290, 285, 280, 275],
    description: 'Pantalla INCELL para 13 Pro con enfoque en reventa y reparación profesional.',
  },
  {
    id: 'iphone-13-pro-max-incell',
    category: 'iphone-incell',
    name: 'Pantalla para iPhone 13 Pro Max',
    quality: 'INCELL FHD+ MOVE IC',
    prices: [350, 340, 335, 330, 325],
    description: 'Una de las referencias más fuertes de mayoreo para clientes de CDMX.',
  },
  {
    id: 'iphone-14-incell',
    category: 'iphone-incell',
    name: 'Pantalla para iPhone 14',
    quality: 'INCELL FHD+ MOVE IC',
    prices: [260, 250, 245, 240, 230],
    description: 'Pantalla estable para reparaciones rápidas con disponibilidad para mayoreo.',
  },
  {
    id: 'iphone-14-plus-incell',
    category: 'iphone-incell',
    name: 'Pantalla para iPhone 14 Plus',
    quality: 'INCELL FHD+ MOVE IC',
    prices: [300, 290, 280, 275, 265],
    description: 'Opción para 14 Plus con precio escalonado por cantidad.',
  },
  {
    id: 'iphone-14-pro-incell',
    category: 'iphone-incell',
    name: 'Pantalla para iPhone 14 Pro',
    quality: 'INCELL FHD+ MOVE IC',
    prices: [350, 340, 330, 320, 310],
    description: 'Pantalla para 14 Pro con precio por volumen disponible para mayoristas.',
  },
  {
    id: 'iphone-14-pro-max-incell',
    category: 'iphone-incell',
    name: 'Pantalla para iPhone 14 Pro Max',
    quality: 'INCELL FHD+ MOVE IC',
    prices: [380, 350, 340, 330, 310],
    description: 'Modelo fuerte para talleres que requieren rotación constante.',
  },
  {
    id: 'iphone-15-incell',
    category: 'iphone-incell',
    name: 'Pantalla para iPhone 15',
    quality: 'INCELL FHD+ MOVE IC',
    prices: [300, 290, 285, 280, 275],
    description: 'Referencia reciente para stock activo y cotización directa por WhatsApp.',
  },
  {
    id: 'iphone-xs-max-oled',
    category: 'iphone-oled',
    name: 'Pantalla para iPhone XS MAX',
    quality: 'OLED PREMIUM MOVE IC',
    prices: [320, 297.6, 281.6, null, null],
    description: 'Pantalla OLED premium para clientes que buscan mejor calidad visual.',
  },
  {
    id: 'iphone-11-pro-max-oled',
    category: 'iphone-oled',
    name: 'Pantalla para iPhone 11 Pro Max',
    quality: 'OLED PREMIUM MOVE IC',
    prices: [680, 632.4, 598.4, null, null],
    description: 'OLED premium con una tabla clara para venta por pieza o por volumen.',
  },
  {
    id: 'iphone-12-pro-max-oled',
    category: 'iphone-oled',
    name: 'Pantalla para iPhone 12 Pro Max',
    quality: 'OLED PREMIUM MOVE IC',
    prices: [950, 883.5, 836, null, null],
    description: 'Una de las referencias OLED más consultadas en CDMX.',
  },
  {
    id: 'iphone-13-oled',
    category: 'iphone-oled',
    name: 'Pantalla para iPhone 13',
    quality: 'OLED PREMIUM MOVE IC',
    prices: [780, 725.4, 686.4, null, null],
    description: 'Pantalla OLED con disponibilidad para técnicos y distribuidores.',
  },
  {
    id: 'iphone-13-pro-oled',
    category: 'iphone-oled',
    name: 'Pantalla para iPhone 13 Pro',
    quality: 'OLED PREMIUM MOVE IC',
    prices: [920, 855.6, 809.6, null, null],
    description: 'Opción premium para reparación con mejor respuesta visual.',
  },
  {
    id: 'iphone-13-pro-max-oled',
    category: 'iphone-oled',
    name: 'Pantalla para iPhone 13 Pro Max',
    quality: 'OLED PREMIUM MOVE IC',
    prices: [1100, 1023, 968, null, null],
    description: 'Alta rotación para compras por mayoreo en CDMX y envío nacional.',
  },
  {
    id: 'iphone-14-oled',
    category: 'iphone-oled',
    name: 'Pantalla para iPhone 14',
    quality: 'OLED PREMIUM MOVE IC',
    prices: [750, 697.5, 660, null, null],
    description: 'Pantalla OLED pensada para clientes que piden mejor acabado.',
  },
  {
    id: 'iphone-14-plus-oled',
    category: 'iphone-oled',
    name: 'Pantalla para iPhone 14 Plus',
    quality: 'OLED PREMIUM MOVE IC',
    prices: [1000, 930, 880, null, null],
    description: 'Referencia premium para 14 Plus con compra por volumen.',
  },
  {
    id: 'iphone-14-pro-max-oled',
    category: 'iphone-oled',
    name: 'Pantalla para iPhone 14 Pro Max',
    quality: 'OLED PREMIUM MOVE IC',
    prices: [1600, 1488, 1408, null, null],
    description: 'Pantalla premium para 14 Pro Max con precios escalonados por cantidad.',
  },
  {
    id: 'samsung-s20-incell',
    category: 'samsung-incell',
    name: 'Pantalla para Samsung S20',
    quality: 'INCELL-HD+ CON MARCO',
    prices: [520, 483.6, 457.6, null, null],
    description: 'Producto Samsung con marco para instalación rápida.',
  },
  {
    id: 'samsung-s21-incell',
    category: 'samsung-incell',
    name: 'Pantalla para Samsung S21',
    quality: 'INCELL-HD+ CON MARCO',
    prices: [550, 511.5, 484, null, null],
    description: 'Pantalla con marco para talleres y reventa en CDMX.',
  },
  {
    id: 'samsung-s22-ultra-incell',
    category: 'samsung-incell',
    name: 'Pantalla para Samsung S22 Ultra',
    quality: 'INCELL-HD+ CON MARCO',
    prices: [null, null, null, null, null],
    description: 'Opción INCELL para S22 Ultra con compra sencilla por WhatsApp.',
  },
  {
    id: 'samsung-s23-ultra-incell',
    category: 'samsung-incell',
    name: 'Pantalla para Samsung S23 Ultra',
    quality: 'INCELL-HD+ CON MARCO',
    prices: [null, null, null, null, null],
    description: 'Pantalla Samsung con marco enfocada en mayoreo y stock local.',
  },
  {
    id: 'samsung-s24-ultra-incell',
    category: 'samsung-incell',
    name: 'Pantalla para Samsung S24 Ultra',
    quality: 'INCELL-HD+ CON MARCO',
    prices: [null, null, null, null, null],
    description: 'Producto de gama alta para rotación en talleres y distribuidores.',
  },
  {
    id: 'samsung-note-20-ultra-incell',
    category: 'samsung-incell',
    name: 'Pantalla para Samsung Note 20 Ultra',
    quality: 'INCELL-HD+ CON MARCO',
    prices: [null, null, null, null, null],
    description: 'Pantalla Note 20 Ultra con disponibilidad para cotización inmediata.',
  },
  {
    id: 'samsung-s20-plus-oled',
    category: 'samsung-oled',
    name: 'Pantalla para Samsung S20 Plus',
    quality: 'OLED PREMIUM C/M',
    prices: [1200, 1116, 1056, null, null],
    description: 'Pantalla OLED premium para S20 Plus con enfoque profesional.',
  },
  {
    id: 'samsung-s21-ultra-oled',
    category: 'samsung-oled',
    name: 'Pantalla para Samsung S21 Ultra',
    quality: 'OLED PREMIUM C/M',
    prices: [1650, 1534.5, 1452, null, null],
    description: 'Gama alta con tabla de precios por cantidad para distribuidores.',
  },
  {
    id: 'samsung-s22-ultra-oled',
    category: 'samsung-oled',
    name: 'Pantalla para Samsung S22 Ultra',
    quality: 'OLED PREMIUM C/M',
    prices: [1600, 1488, 1408, null, null],
    description: 'Una de las referencias premium más consultadas en Samsung.',
  },
  {
    id: 'samsung-s23-ultra-oled',
    category: 'samsung-oled',
    name: 'Pantalla para Samsung S23 Ultra',
    quality: 'OLED PREMIUM C/M',
    prices: [1650, 1534.5, 1452, null, null],
    description: 'Pantalla premium para un acabado cercano al original.',
  },
  {
    id: 'samsung-s24-ultra-oled',
    category: 'samsung-oled',
    name: 'Pantalla para Samsung S24 Ultra',
    quality: 'OLED PREMIUM C/M',
    prices: [1950, 1813.5, 1716, null, null],
    description: 'Producto premium con foco en mayoreo y atención a distribuidores.',
  },
  {
    id: 'samsung-s25-ultra-oled',
    category: 'samsung-oled',
    name: 'Pantalla para Samsung S25 Ultra',
    quality: 'OLED PREMIUM C/M',
    prices: [2200, 2046, 1936, null, null],
    description: 'Pantalla OLED premium para S25 Ultra con compra por cantidad.',
  },
];

function buildPriceTable(values) {
  return QUANTITY_LABELS.map((quantity, index) => {
    const entry = Array.isArray(values) ? values[index] : undefined;
    const rawPrice = entry && typeof entry === 'object' && 'price' in entry ? entry.price : entry;
    const rowQuantity = entry && typeof entry === 'object' && entry.quantity ? entry.quantity : quantity;
    return {
      quantity: rowQuantity,
      price: formatPrice(rawPrice),
    };
  });
}

function formatPrice(value) {
  if (value === null || value === undefined || value === '' || Number.isNaN(Number(value))) {
    if (typeof value === 'string') {
      const text = value.trim();
      if (!text || /consultar/i.test(text)) return 'Consultar';
      if (/^\$/.test(text)) return /MXN/i.test(text) ? text : `${text} MXN`;
      return text;
    }
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

const SITE_ORIGIN = 'https://haode.com.mx';
const SITE_BASE_PATH = '';

function buildSiteUrl(pathname = '') {
  const cleanPath = String(pathname || '').replace(/^\/+/, '');
  return `${SITE_BASE_PATH}/${cleanPath}`;
}

function buildAbsoluteSiteUrl(pathname = '') {
  const cleanPath = String(pathname || '').replace(/^\/+/, '');
  return `${SITE_ORIGIN}/${cleanPath}`;
}

function buildAssetUrl(pathname = '') {
  const rawPath = String(pathname || '').trim();
  if (!rawPath) return `${SITE_BASE_PATH}/assets/products/placeholder.svg`;
  if (/^(?:https?:)?\/\//.test(rawPath) || rawPath.startsWith('/')) return rawPath;
  return `${SITE_BASE_PATH}/${rawPath.replace(/^\/+/, '')}`;
}

function compactPhoneRouteSegment(segment) {
  const normalized = String(segment || '').trim().toLowerCase();
  if (!normalized) return '';
  if (normalized === 'xs-max') return 'xsmax';
  return normalized
    .replace(/-pro-max/g, 'promax')
    .replace(/-pro/g, 'pro')
    .replace(/-plus/g, 'plus')
    .replace(/-mini/g, 'mini')
    .replace(/-/g, '');
}

function resolveProductIdFromRoute(routeSlug) {
  const normalized = String(routeSlug || '').trim().replace(/^\/+|\/+$/g, '').toLowerCase();
  if (!normalized) return null;
  if (PRODUCT_BY_ID.has(normalized)) return normalized;
  const routeAliases = {
    'iphone-incell-12': 'iphone-incell-12-12pro',
    'iphone-incell-12pro': 'iphone-incell-12-12pro',
    'iphone-incell-12-pro': 'iphone-incell-12-12pro',
  };
  if (routeAliases[normalized]) return routeAliases[normalized];

  const incellMatch = normalized.match(/^iphone-(.+)-incell$/);
  if (incellMatch) return `iphone-incell-${compactPhoneRouteSegment(incellMatch[1])}`;

  const oledMatch = normalized.match(/^iphone-(.+)-oled$/);
  if (oledMatch) return `iphone-oled-${compactPhoneRouteSegment(oledMatch[1])}`;

  return normalized;
}

function getPublicProductRouteSlug(productId) {
  return String(productId || '').trim();
}

function setMetaContent(selector, content) {
  const el = document.querySelector(selector);
  if (el) el.setAttribute('content', content);
}

function setCanonicalUrl(url) {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = url;
}

function getProductUrl(productId) {
  return buildSiteUrl(`producto/${encodeURIComponent(getPublicProductRouteSlug(productId))}/`);
}

function productMetaKeywords(product) {
  if (product.category === 'oled-diagnostica') {
    return [
      `${product.brand} ${product.model}`,
      'OLED Diagnóstica HAODE',
      'pantallas OLED México',
      'refacciones celulares México',
      'pantallas para reparación profesional',
      'pantallas para técnicos',
      'pantallas para distribuidores',
    ].join(', ');
  }
  return [
    `${product.brand} ${product.model}`,
    product.category,
    'pantallas iPhone México',
    'pantallas Samsung OLED México',
    'pantallas INCELL México',
    'pantallas mayoreo CDMX',
    'refacciones celulares México',
    'pantallas para reparación celular',
    'pantallas para técnicos',
    'pantallas para distribuidores',
  ].join(', ');
}

function getCategoryHash(category) {
  const categorySlug = normalizeCategory(category);
  if (categorySlug === 'all') return '';
  return `#${categorySlug}`;
}

function getCategoryFromHash(hash) {
  const normalizedHash = String(hash || '').replace(/^#/, '').toLowerCase();
  if (!normalizedHash) return 'all';
  return CATEGORY_SLUGS.includes(normalizedHash) ? normalizedHash : 'all';
}

function normalizeCategory(category) {
  return CATEGORY_ALIASES[category] || CATEGORY_ALIASES[String(category || '').trim()] || 'all';
}

function createProduct(definition) {
  const category = normalizeCategory(definition.category);
  const categoryMeta = CATEGORY_META[category];
  const categoryMedia = CATEGORY_MEDIA[category]?.[definition.id] || null;
  const mediaImages = Array.isArray(definition.images) && definition.images.length ? definition.images.filter(Boolean) : null;
  const priceTable = buildPriceTable(definition.prices || definition.priceTable);
  const mainImage = definition.mainImage || mediaImages?.[0] || categoryMedia?.mainImage || categoryMeta.mainImage || PLACEHOLDER_IMAGE;
  const galleryImages = definition.galleryImages || (mediaImages ? mediaImages.slice(1) : null) || categoryMedia?.galleryImages || categoryMeta.galleryImages || [];
  const name = definition.name || `Pantalla para ${definition.model || definition.title || definition.id}`;
  return {
    id: definition.id,
    brand: definition.brand || categoryMeta.brand,
    category,
    model: definition.model || name,
    name,
    quality: definition.quality,
    mainImage,
    galleryImages: Array.from(new Set((galleryImages || []).filter(Boolean).filter((src) => src !== mainImage))),
    videos: definition.videos || categoryMedia?.videos || [],
    priceTable,
    description: definition.description || `${name} para mayoreo y menudeo en México.`,
    whatsappText: definition.whatsappText || `Hola HAODE, quiero cotizar: ${name}`,
    lowestPriceText: buildLowestPriceText(priceTable),
  };
}

const GENERATED_PRODUCT_DEFINITIONS = Array.isArray(window.HAODE_PRODUCTS_DATA) && window.HAODE_PRODUCTS_DATA.length
  ? window.HAODE_PRODUCTS_DATA
  : null;
const PRODUCT_SOURCE = GENERATED_PRODUCT_DEFINITIONS || PRODUCT_DEFINITIONS;
const PRODUCTS = PRODUCT_SOURCE.map(createProduct);
const PRODUCT_BY_ID = new Map(PRODUCTS.map((product) => [product.id, product]));

function createFilterButton(category, isActive = false) {
  const meta = CATEGORY_META[category];
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `filter-chip${isActive ? ' is-active' : ''}`;
  button.textContent = category === 'all' ? 'Todos' : meta.title;
  button.dataset.category = category;
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
  image.src = buildAssetUrl(product.mainImage || PLACEHOLDER_IMAGE);
  image.alt = product.name;
  image.loading = 'lazy';
  image.decoding = 'async';
  image.onerror = () => {
    const fallback = buildAssetUrl(PLACEHOLDER_IMAGE);
    if (image.src !== fallback) image.src = fallback;
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

  const priceTable = document.createElement('table');
  priceTable.className = 'price-table';
  priceTable.setAttribute('aria-label', `Precios por cantidad de ${product.name}`);

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  const quantityHead = document.createElement('th');
  quantityHead.scope = 'col';
  quantityHead.textContent = 'Cantidad';
  const priceHead = document.createElement('th');
  priceHead.scope = 'col';
  priceHead.textContent = 'Precio';
  headerRow.append(quantityHead, priceHead);
  thead.appendChild(headerRow);

  const tbody = document.createElement('tbody');
  product.priceTable.forEach((row) => {
    const tr = document.createElement('tr');
    const quantity = document.createElement('th');
    quantity.scope = 'row';
    quantity.textContent = row.quantity;
    const price = document.createElement('td');
    price.textContent = row.price;
    tr.append(quantity, price);
    tbody.appendChild(tr);
  });
  priceTable.append(thead, tbody);

  const note = document.createElement('p');
  note.className = 'shop-note';
  note.textContent = 'Precios por cantidad. Caja es el mejor precio publicado; más volumen se cotiza por WhatsApp.';

  priceWrap.append(priceTable, note);

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
  details.textContent = 'Ver producto';

  actions.append(details, whatsapp);
  content.append(title, quality, priceWrap, actions);

  article.append(overlay, media, content);
  return article;
}

function getRelatedProducts(product, limit = 3) {
  const sameCategory = PRODUCTS.filter((item) => item.category === product.category && item.id !== product.id);
  const fallback = PRODUCTS.filter((item) => item.id !== product.id && item.category !== product.category);
  return [...sameCategory, ...fallback].slice(0, limit);
}

function createZoomModal() {
  let modal = document.querySelector('[data-detail-zoom-modal]');
  if (modal) return modal;

  modal = document.createElement('div');
  modal.className = 'detail-zoom-modal';
  modal.hidden = true;
  modal.setAttribute('data-detail-zoom-modal', '');
  modal.innerHTML = `
    <div class="detail-zoom-frame" role="dialog" aria-modal="true" aria-label="Vista ampliada de imagen">
      <button type="button" class="detail-zoom-close" aria-label="Cerrar ampliación">×</button>
      <img alt="" />
    </div>
  `;

  const frame = modal.querySelector('img');
  const closeButton = modal.querySelector('.detail-zoom-close');

  const closeModal = () => {
    modal.hidden = true;
    document.body.style.overflow = '';
    frame.src = '';
    frame.alt = '';
  };

  closeButton.addEventListener('click', closeModal);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modal.hidden) {
      closeModal();
    }
  });

  modal._open = (src, alt) => {
    frame.src = src;
    frame.alt = alt || '';
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
  };
  modal._close = closeModal;

  document.body.appendChild(modal);
  return modal;
}

function attachZoom(imageEl, src, alt) {
  if (!imageEl) return;
  imageEl.tabIndex = 0;
  imageEl.setAttribute('role', 'button');
  imageEl.setAttribute('aria-label', `Ampliar imagen de ${alt}`);
  imageEl.addEventListener('click', () => {
    createZoomModal()._open(src, alt);
  });
  imageEl.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      createZoomModal()._open(src, alt);
    }
  });
}

function normalizeCatalogSearchText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[-_/]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildCatalogSearchIndex(parts) {
  const source = Array.isArray(parts) ? parts.filter(Boolean).join(' ') : String(parts || '');
  const normalized = normalizeCatalogSearchText(source);
  const compact = normalized.replace(/\s+/g, '');
  return `${normalized} ${compact}`.trim();
}

function buildCatalogSearchText(product, meta) {
  return buildCatalogSearchIndex([
    product.name,
    product.model,
    product.brand,
    product.category,
    product.quality,
    product.description,
    meta?.title,
    meta?.subtitle,
  ].filter(Boolean).join(' '));
}

function renderCatalogPage() {
  const sectionsRoot = document.querySelector('[data-product-sections]');
  const priceNote = document.querySelector('[data-price-note]');
  if (!sectionsRoot) return;

  if (priceNote) {
    priceNote.textContent = 'Precios por cantidad en MXN. Consulta disponibilidad por WhatsApp para confirmar tu pedido.';
  }

  function createCatalogFeatureCard(card) {
    const article = document.createElement('article');
    article.className = 'shop-card catalog-feature-card';
    if (card.filterId) {
      article.dataset.catalogFeature = 'true';
      article.dataset.catalogFilter = card.filterId;
      article.dataset.catalogSearch = buildCatalogSearchIndex([
        card.title,
        card.eyebrow,
        card.text,
        card.cta,
        card.searchText,
      ].filter(Boolean).join(' '));
    }
    if (card.filterId) {
      article.dataset.pantallasFeature = 'true';
      article.dataset.pantallasFilter = card.filterId;
      article.dataset.pantallasSearch = buildCatalogSearchIndex([
        card.title,
        card.eyebrow,
        card.text,
        card.cta,
        card.searchText,
      ].filter(Boolean).join(' '));
    }

    const link = document.createElement('a');
    link.className = 'shop-card-link';
    link.href = card.href;
    link.setAttribute('aria-label', card.cta || card.title);
    if (card.external) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }

    const media = document.createElement('div');
    media.className = 'shop-media';

    const image = document.createElement('img');
    image.src = buildAssetUrl(card.image || PLACEHOLDER_IMAGE);
    image.alt = card.title;
    image.loading = 'lazy';
    image.decoding = 'async';

    const brand = document.createElement('span');
    brand.className = 'shop-brand';
    brand.textContent = card.eyebrow || 'HAODE';

    media.append(image, brand);

    const content = document.createElement('div');
    content.className = 'shop-content';

    const title = document.createElement('h3');
    title.textContent = card.title;

    const text = document.createElement('p');
    text.className = 'shop-quality';
    text.textContent = card.text;

    const actions = document.createElement('div');
    actions.className = 'shop-actions';

    const cta = document.createElement('a');
    cta.className = 'btn btn-secondary shop-details';
    cta.href = card.href;
    cta.textContent = card.cta || 'Ver productos';
    if (card.external) {
      cta.target = '_blank';
      cta.rel = 'noopener noreferrer';
    }

    actions.appendChild(cta);
    content.append(title, text, actions);
    article.append(link, media, content);
    return article;
  }

  function createCatalogControls(group) {
    const controls = document.createElement('div');
    controls.className = 'pantallas-tools';
    controls.dataset.catalogTools = group.id;

    const searchWrap = document.createElement('label');
    searchWrap.className = 'pantallas-search';

    const searchLabel = document.createElement('span');
    searchLabel.textContent = group.controls.label;

    const input = document.createElement('input');
    input.type = 'search';
    input.autocomplete = 'off';
    input.placeholder = group.controls.placeholder;
    input.dataset.catalogSearchInput = group.id;

    searchWrap.append(searchLabel, input);

    const chips = document.createElement('div');
    chips.className = 'pantallas-filter-chips';
    chips.setAttribute('aria-label', `Filtrar ${group.title}`);

    group.controls.filters.forEach((filter, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `filter-chip${index === 0 ? ' is-active' : ''}`;
      button.textContent = filter.label;
      button.dataset.catalogFilterButton = filter.id;
      if (index === 0) button.setAttribute('aria-pressed', 'true');
      chips.appendChild(button);
    });

    const result = document.createElement('p');
    result.className = 'pantallas-result-count';
    result.dataset.catalogResultCount = group.id;
    result.textContent = group.title;

    controls.append(searchWrap, chips, result);
    return controls;
  }

  function createPantallasControls() {
    const controls = document.createElement('div');
    controls.className = 'pantallas-tools';
    controls.setAttribute('data-pantallas-tools', '');

    const searchWrap = document.createElement('label');
    searchWrap.className = 'pantallas-search';

    const searchLabel = document.createElement('span');
    searchLabel.textContent = 'Buscar pantalla';

    const input = document.createElement('input');
    input.type = 'search';
    input.autocomplete = 'off';
    input.placeholder = 'Buscar modelo: iPhone 11, 12 Pro, S22 Ultra, A54, Note 20, Fold, Flip...';
    input.setAttribute('data-pantallas-search-input', '');

    searchWrap.append(searchLabel, input);

    const chips = document.createElement('div');
    chips.className = 'pantallas-filter-chips';
    chips.setAttribute('aria-label', 'Filtrar por tipo de pantalla');

    PANTALLAS_FILTERS.forEach((filter, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `filter-chip${index === 0 ? ' is-active' : ''}`;
      button.textContent = filter.label;
      button.dataset.pantallasFilterButton = filter.id;
      if (index === 0) button.setAttribute('aria-pressed', 'true');
      chips.appendChild(button);
    });

    const result = document.createElement('p');
    result.className = 'pantallas-result-count';
    result.setAttribute('data-pantallas-result-count', '');
    result.textContent = 'Todas las pantallas';

    controls.append(searchWrap, chips, result);
    return controls;
  }

  function createCatalogEmptyCard(empty) {
    const article = document.createElement('article');
    article.className = 'catalog-empty-card';

    const title = document.createElement('h3');
    title.textContent = empty.title;

    const text = document.createElement('p');
    text.textContent = empty.text;

    const link = document.createElement('a');
    link.className = 'btn btn-primary';
    link.href = empty.href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = empty.cta;

    article.append(title, text, link);
    return article;
  }

  function createPantallasEmptyCard() {
    const article = createCatalogEmptyCard({
      title: 'No encontramos ese modelo en Pantallas.',
      text: 'Escríbenos por WhatsApp y te confirmamos disponibilidad.',
      cta: 'Consultar por WhatsApp',
      href: 'https://wa.me/523326684296?text=Hola%20HAODE%2C%20busco%20una%20pantalla%20y%20quiero%20confirmar%20disponibilidad',
    });
    article.classList.add('pantallas-empty-state');
    article.hidden = true;
    article.setAttribute('data-pantallas-empty', '');
    return article;
  }

  function createCatalogSearchEmptyCard(group) {
    const article = createCatalogEmptyCard(group.controls.empty);
    article.classList.add('pantallas-empty-state');
    article.hidden = true;
    article.dataset.catalogEmpty = group.id;
    return article;
  }

  function getFundasMicasFilterTags(product) {
    const search = normalizeCatalogSearchText([
      product.name,
      product.model,
      product.category,
      product.quality,
      product.description,
    ].join(' '));
    const tags = new Set([product.category]);
    if (search.includes('aluminio')) tags.add('aluminio');
    if (search.includes('17 pro max')) tags.add('estilo-iphone-17-pro-max');
    if (search.includes('privacidad') || search.includes('privacy')) tags.add('privacy');
    if (search.includes('matte') || search.includes('mate')) tags.add('matte');
    if (search.includes('hd')) tags.add('hd');
    return Array.from(tags).join(' ');
  }

  function getProductosAiFilterTags(product) {
    const tags = new Set([product.category]);
    if (product.category === 'gafas-ai') tags.add('gafas-ai');
    if (product.category === 'camaras-inteligentes') tags.add('camaras-inteligentes');
    return Array.from(tags).join(' ');
  }

  function getCatalogFilterTags(product, groupId) {
    if (groupId === 'fundas-micas') return getFundasMicasFilterTags(product);
    if (groupId === 'productos-ai') return getProductosAiFilterTags(product);
    return product.category;
  }

  function renderCategoryBlock(category, products, groupId = '') {
    const meta = CATEGORY_META[category];
    if (!meta || !products.length) return null;

    const block = document.createElement('section');
    block.className = 'catalog-category-block';
    block.id = category;
    block.dataset.category = category;

    const titleWrap = document.createElement('div');
    titleWrap.className = 'catalog-category-head';
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
    count.textContent = `${products.length} modelos`;

    const grid = document.createElement('div');
    grid.className = 'product-page-grid shop-grid';

    products.forEach((product) => {
      const productCard = createProductCard(product);
      const filterTags = getCatalogFilterTags(product, groupId);
      productCard.dataset.catalogCard = 'true';
      productCard.dataset.catalogFilter = category;
      productCard.dataset.catalogTags = filterTags;
      productCard.dataset.catalogSearch = buildCatalogSearchIndex([
        buildCatalogSearchText(product, meta),
        filterTags,
      ]);
      productCard.dataset.pantallasCard = 'true';
      productCard.dataset.pantallasFilter = category;
      productCard.dataset.pantallasSearch = buildCatalogSearchText(product, meta);
      grid.appendChild(productCard);
    });

    block.append(titleWrap, count, grid);
    return block;
  }

  function renderCatalogGroup(group) {
    const section = document.createElement('section');
    section.className = 'catalog-section';
    section.id = group.id;
    section.dataset.catalogGroup = group.id;

    const head = document.createElement('div');
    head.className = 'catalog-section-head';

    const titleWrap = document.createElement('div');
    const kicker = document.createElement('p');
    kicker.className = 'section-kicker';
    kicker.textContent = group.kicker;
    const heading = document.createElement('h2');
    heading.textContent = group.title;
    const subtitle = document.createElement('p');
    subtitle.className = 'catalog-section-subtitle';
    subtitle.textContent = group.subtitle;
    titleWrap.append(kicker, heading, subtitle);

    const count = document.createElement('p');
    count.className = 'catalog-count';
    const productCount = group.categories.reduce((sum, category) => sum + PRODUCTS.filter((product) => product.category === category).length, 0);
    count.textContent = productCount ? `${productCount} modelos` : 'Cotización directa';

    head.append(titleWrap, count);
    section.appendChild(head);

    if (group.id === 'pantallas') {
      section.appendChild(createPantallasControls());
    } else if (group.controls) {
      section.appendChild(createCatalogControls(group));
    }

    group.categories.forEach((categorySlug) => {
      const block = renderCategoryBlock(categorySlug, PRODUCTS.filter((product) => product.category === categorySlug), group.id);
      if (block) section.appendChild(block);
    });

    if (Array.isArray(group.featureCards) && group.featureCards.length) {
      const featureGrid = document.createElement('div');
      featureGrid.className = 'product-page-grid shop-grid catalog-feature-grid';
      if (group.id === 'pantallas') {
        featureGrid.dataset.pantallasFeatureGrid = 'true';
      }
      if (group.controls) {
        featureGrid.dataset.catalogFeatureGrid = group.id;
      }
      group.featureCards.forEach((card) => featureGrid.appendChild(createCatalogFeatureCard(card)));
      section.appendChild(featureGrid);
    }

    if (group.empty) {
      section.appendChild(createCatalogEmptyCard(group.empty));
    }

    if (group.id === 'pantallas') {
      section.appendChild(createPantallasEmptyCard());
      attachPantallasFilters(section);
    } else if (group.controls) {
      section.appendChild(createCatalogSearchEmptyCard(group));
      attachCatalogFilters(section, group);
    }

    sectionsRoot.appendChild(section);
  }

  function attachCatalogFilters(section, group) {
    const searchInput = section.querySelector('[data-catalog-search-input]');
    const buttons = Array.from(section.querySelectorAll('[data-catalog-filter-button]'));
    const resultCount = section.querySelector('[data-catalog-result-count]');
    const sectionCount = section.querySelector('.catalog-section-head .catalog-count');
    const emptyState = section.querySelector('[data-catalog-empty]');
    const state = {
      activeType: 'all',
      query: '',
    };

    const setVisible = (element, isVisible) => {
      if (!element) return;
      element.hidden = !isVisible;
      element.style.display = isVisible ? '' : 'none';
      element.setAttribute('aria-hidden', String(!isVisible));
    };

    const matchesActiveFilter = (element) => {
      if (state.activeType === 'all') return true;
      const tags = `${element.dataset.catalogFilter || ''} ${element.dataset.catalogTags || ''}`.split(/\s+/).filter(Boolean);
      return tags.includes(state.activeType);
    };

    const matchesSearch = (element) => {
      if (!state.query) return true;
      const compactQuery = state.query.replace(/\s+/g, '');
      const searchText = element.dataset.catalogSearch || '';
      return searchText.includes(state.query) || searchText.includes(compactQuery);
    };

    const applyFilter = () => {
      state.query = normalizeCatalogSearchText(searchInput?.value || '');
      let visibleResults = 0;

      section.querySelectorAll('.catalog-category-block').forEach((block) => {
        let visibleInBlock = 0;
        block.querySelectorAll('[data-catalog-card]').forEach((card) => {
          const isVisible = matchesActiveFilter(card) && matchesSearch(card);
          setVisible(card, isVisible);
          if (isVisible) {
            visibleInBlock += 1;
            visibleResults += 1;
          }
        });
        setVisible(block, visibleInBlock > 0);
        const blockCount = block.querySelector('.catalog-count');
        if (blockCount) blockCount.textContent = visibleInBlock ? `${visibleInBlock} modelos` : 'Sin resultados';
      });

      let visibleFeatures = 0;
      section.querySelectorAll('[data-catalog-feature]').forEach((card) => {
        const isVisible = matchesActiveFilter(card) && matchesSearch(card);
        setVisible(card, isVisible);
        if (isVisible) {
          visibleFeatures += 1;
          visibleResults += 1;
        }
      });

      setVisible(section.querySelector('[data-catalog-feature-grid]'), visibleFeatures > 0);
      setVisible(emptyState, visibleResults === 0);
      if (resultCount) {
        const filterLabel = group.controls.filters.find((filter) => filter.id === state.activeType)?.label || group.title;
        const suffix = state.query ? ` para "${searchInput.value.trim()}"` : '';
        resultCount.textContent = `${visibleResults} resultados en ${filterLabel}${suffix}`;
      }
      if (sectionCount) {
        sectionCount.textContent = visibleResults ? `${visibleResults} resultados` : 'Cotización directa';
      }
    };

    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        state.activeType = button.dataset.catalogFilterButton || 'all';
        buttons.forEach((item) => {
          const isActive = item === button;
          item.classList.toggle('is-active', isActive);
          item.setAttribute('aria-pressed', String(isActive));
        });
        applyFilter();
      });
    });

    searchInput?.addEventListener('input', applyFilter);
    applyFilter();
  }

  function attachPantallasFilters(section) {
    const searchInput = section.querySelector('[data-pantallas-search-input]');
    const buttons = Array.from(section.querySelectorAll('[data-pantallas-filter-button]'));
    const resultCount = section.querySelector('[data-pantallas-result-count]');
    const sectionCount = section.querySelector('.catalog-section-head .catalog-count');
    const emptyState = section.querySelector('[data-pantallas-empty]');
    const pantallasState = {
      activeType: 'all',
      query: '',
    };

    const setVisible = (element, isVisible) => {
      if (!element) return;
      element.hidden = !isVisible;
      element.style.display = isVisible ? '' : 'none';
      element.setAttribute('aria-hidden', String(!isVisible));
    };

    const applyFilter = () => {
      pantallasState.query = normalizeCatalogSearchText(searchInput?.value || '');
      const compactQuery = pantallasState.query.replace(/\s+/g, '');
      let visibleResults = 0;
      let visibleProducts = 0;

      section.querySelectorAll('.catalog-category-block').forEach((block) => {
        let visibleInBlock = 0;
        block.querySelectorAll('[data-pantallas-card]').forEach((card) => {
          const matchesFilter = pantallasState.activeType === 'all' || card.dataset.pantallasFilter === pantallasState.activeType;
          const searchText = card.dataset.pantallasSearch || '';
          const matchesQuery = !pantallasState.query || searchText.includes(pantallasState.query) || searchText.includes(compactQuery);
          const isVisible = matchesFilter && matchesQuery;
          setVisible(card, isVisible);
          if (isVisible) {
            visibleInBlock += 1;
            visibleResults += 1;
            visibleProducts += 1;
          }
        });
        setVisible(block, visibleInBlock > 0);
        const blockCount = block.querySelector('.catalog-count');
        if (blockCount) blockCount.textContent = visibleInBlock ? `${visibleInBlock} modelos` : 'Sin resultados';
      });

      let visibleFeatures = 0;
      section.querySelectorAll('[data-pantallas-feature]').forEach((card) => {
        const matchesFilter = pantallasState.activeType === 'all' || card.dataset.pantallasFilter === pantallasState.activeType;
        const searchText = card.dataset.pantallasSearch || '';
        const matchesQuery = !pantallasState.query || searchText.includes(pantallasState.query) || searchText.includes(compactQuery);
        const isVisible = matchesFilter && matchesQuery;
        setVisible(card, isVisible);
        if (isVisible) {
          visibleFeatures += 1;
          visibleResults += 1;
          visibleProducts += 1;
        }
      });

      setVisible(section.querySelector('[data-pantallas-feature-grid]'), visibleFeatures > 0);
      setVisible(emptyState, visibleResults === 0);
      if (resultCount) {
        const filterLabel = PANTALLAS_FILTERS.find((filter) => filter.id === pantallasState.activeType)?.label || 'Pantallas';
        const suffix = pantallasState.query ? ` para "${searchInput.value.trim()}"` : '';
        resultCount.textContent = `${visibleResults} resultados en ${filterLabel}${suffix}`;
      }
      if (sectionCount) {
        sectionCount.textContent = visibleProducts ? `${visibleProducts} modelos` : 'Cotización directa';
      }
    };

    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        pantallasState.activeType = button.dataset.pantallasFilterButton || 'all';
        buttons.forEach((item) => {
          const isActive = item === button;
          item.classList.toggle('is-active', isActive);
          item.setAttribute('aria-pressed', String(isActive));
        });
        applyFilter();
      });
    });

    searchInput?.addEventListener('input', applyFilter);
    applyFilter();
  }

  sectionsRoot.innerHTML = '';
  CATALOG_GROUPS.forEach(renderCatalogGroup);

  document.querySelectorAll('[data-catalog-group-count]').forEach((el) => {
    const group = CATALOG_GROUPS.find((item) => item.id === el.dataset.catalogGroupCount);
    if (!group) return;
    const count = group.categories.reduce((sum, category) => sum + PRODUCTS.filter((product) => product.category === category).length, 0);
    el.textContent = count ? `${count} modelos` : 'Cotización';
  });
}

function renderProductDetailPage() {
  const page = document.querySelector('[data-product-detail]');
  if (!page) return;

  const params = new URLSearchParams(window.location.search);
  const pathMatch = window.location.pathname.match(/\/producto\/([^/]+)\/?$/);
  const routeSlug = params.get('id') || (pathMatch ? decodeURIComponent(pathMatch[1]) : null);
  const id = routeSlug ? resolveProductIdFromRoute(routeSlug) : null;
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
        <a class="btn btn-primary" href="${buildSiteUrl('productos/')}">Volver al catálogo</a>
      </div>
    `;
    return;
  }

  document.title = `${product.name} | HAODE México`;
  const detailUrl = buildAbsoluteSiteUrl(`producto/${encodeURIComponent(getPublicProductRouteSlug(product.id))}/`);
  const metaDescription = `${product.name} en HAODE México. ${product.description}`;
  const metaKeywords = productMetaKeywords(product);

  setCanonicalUrl(detailUrl);
  setMetaContent('meta[name="description"]', metaDescription);
  setMetaContent('meta[name="keywords"]', metaKeywords);
  setMetaContent('meta[property="og:title"]', `${product.name} | HAODE México`);
  setMetaContent('meta[property="og:description"]', metaDescription);
  setMetaContent('meta[property="og:image"]', new URL(buildAssetUrl(product.mainImage || PLACEHOLDER_IMAGE), `${SITE_ORIGIN}/`).href);
  setMetaContent('meta[property="og:url"]', detailUrl);
  setMetaContent('meta[name="twitter:card"]', 'summary_large_image');

  if (titleEl) titleEl.textContent = product.name;
  if (subtitleEl) subtitleEl.textContent = CATEGORY_META[product.category].title;
  if (brandEl) brandEl.textContent = product.brand;
  if (qualityEl) qualityEl.textContent = product.quality;
  if (descriptionEl) descriptionEl.textContent = product.description;
  if (mainImageEl) {
    mainImageEl.src = buildAssetUrl(product.mainImage || PLACEHOLDER_IMAGE);
    mainImageEl.alt = product.name;
    mainImageEl.decoding = 'async';
    mainImageEl.onerror = () => {
      const fallback = buildAssetUrl(PLACEHOLDER_IMAGE);
      if (mainImageEl.src !== fallback) mainImageEl.src = fallback;
    };
    attachZoom(mainImageEl, new URL(buildAssetUrl(product.mainImage || PLACEHOLDER_IMAGE), `${SITE_ORIGIN}/`).href, product.name);
  }

  if (priceEl) priceEl.textContent = product.lowestPriceText || 'Consultar';

  if (whatsappLink) {
    whatsappLink.href = buildWhatsAppUrl(product.whatsappText);
  }

  if (backLink) {
    backLink.href = buildSiteUrl('productos/');
  }

  if (galleryEl) {
    galleryEl.innerHTML = '';
    const galleryImages = [...new Set((product.galleryImages || []).filter(Boolean))];
    galleryImages.slice(0, 4).forEach((src, index) => {
      const img = document.createElement('img');
      img.src = buildAssetUrl(src);
      img.alt = `${product.name} foto ${index + 1}`;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.onerror = () => {
        const fallback = buildAssetUrl(PLACEHOLDER_IMAGE);
        if (img.src !== fallback) img.src = fallback;
      };
      attachZoom(img, new URL(buildAssetUrl(src), `${SITE_ORIGIN}/`).href, `${product.name} foto ${index + 1}`);
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
        frame.autoplay = true;
        frame.muted = true;
        frame.loop = true;
        frame.preload = 'metadata';
        frame.src = buildAssetUrl(video);
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

  const relatedRoot = page.querySelector('[data-related-products]');
  if (relatedRoot) {
    relatedRoot.innerHTML = '';
    getRelatedProducts(product).forEach((item) => {
      relatedRoot.appendChild(createProductCard(item));
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderCatalogPage();
  renderProductDetailPage();
});

window.HAODE_PRODUCTS = PRODUCTS;
window.HAODE_GET_PRODUCT = (id) => PRODUCT_BY_ID.get(id);
