import { firebaseConfig, isFirebaseConfigured } from "./firebase-config.js";

const WHATSAPP_NUMBER = "523326684296";
const PRODUCTS_JSON_URL = "/haode-web/app/products.json";
const PROMO_JUNIO = true;
const PROMO_JUNIO_PRICES_URL = "/haode-web/app/promo-junio-prices.json";
const SERVICE_WORKER_URL = "/haode-web/service-worker.js";

let deferredInstallPrompt = null;

function isStandaloneMode() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function setupPwaInstallPrompt() {
  const bannerEl = document.querySelector("[data-install-banner]");
  const titleEl = document.querySelector("[data-install-title]");
  const copyEl = document.querySelector("[data-install-copy]");
  const buttonEl = document.querySelector("[data-install-button]");

  if (!bannerEl || !titleEl || !copyEl || !buttonEl || isStandaloneMode()) {
    return;
  }

  const ua = window.navigator.userAgent || "";
  const isIos = /iphone|ipad|ipod/i.test(ua);

  if (isIos) {
    bannerEl.hidden = false;
    bannerEl.classList.add("ios");
    titleEl.textContent = "Safari → Compartir → Agregar a pantalla de inicio";
    copyEl.textContent = "Instala HAODE desde Safari para abrirlo como app en tu iPhone.";
    return;
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    bannerEl.hidden = false;
    titleEl.textContent = "Instalar App HAODE";
    copyEl.textContent = "Agrega HAODE a tu pantalla de inicio y abre el catalogo como app.";
  });

  buttonEl.addEventListener("click", async () => {
    if (!deferredInstallPrompt) {
      return;
    }

    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    bannerEl.hidden = true;
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    bannerEl.hidden = true;
  });
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker.register(SERVICE_WORKER_URL, { scope: "/haode-web/" })
      .catch((error) => {
        console.info("HAODE PWA no pudo registrar service worker:", error.message);
      });
  });
}

setupPwaInstallPrompt();
registerServiceWorker();

const categories = [
  { id: "Todos", label: "Todos" },
  { id: "Pantallas iPhone OLED", label: "iPhone OLED" },
  { id: "Pantallas iPhone INCELL", label: "iPhone INCELL" },
  { id: "Pantallas Samsung OLED", label: "Samsung AMOLED" },
  { id: "Pantallas Samsung INCELL", label: "Samsung INCELL" },
  { id: "Pantallas Samsung Original", label: "Samsung TIPO ORIGINAL" },
  { id: "Micas", label: "Micas" },
  { id: "Máquinas de Mica", label: "Máquinas de Mica" },
  { id: "Gafas AI", label: "Gafas AI" },
  { id: "Cámaras Inteligentes", label: "Cámaras AI" },
  { id: "Fundas", label: "Fundas" }
];

const categoryAliases = {
  fundas: "Fundas",
  "Fundas y Accesorios": "Fundas",
  "Pantallas Samsung AMOLED": "Pantallas Samsung OLED"
};

const categorySearchAliases = {
  Fundas: "Fundas y Accesorios"
};

const heroShowcaseItems = [
  {
    title: "Pantallas iPhone",
    subtitle: "OLED / INCELL / Diagnóstico",
    image: "/haode-web/assets/products/iphone-oled/main.jpg",
    badge: "Más vendido",
    targetSearch: "Pantallas iPhone"
  },
  {
    title: "Samsung TIPO ORIGINAL",
    subtitle: "Con marco · Calidad 1:1",
    image: "/haode-web/assets/products/samsung-original/s24-ultra/main.png",
    badge: "Calidad 1:1",
    targetCategory: "Pantallas Samsung Original"
  },
  {
    title: "Micas profesionales",
    subtitle: "HD / Matte / Privacidad · Corte profesional",
    image: "/haode-web/assets/products/home-cut-machine/x200t.jpg",
    badge: "Mayoreo",
    targetCategory: "Micas"
  },
  {
    title: "Productos AI",
    subtitle: "Gafas inteligentes y cámaras digitales",
    image: "/haode-web/assets/products/productos-ai/lk-007-camara-digital-4k/main.png",
    badge: "Nuevo",
    targetCategory: "Cámaras Inteligentes"
  },
  {
    title: "Fundas para iPhone",
    subtitle: "Estilo 17 Pro Max · Mayoreo disponible",
    image: "/haode-web/assets/products/fundas/funda-premium-aluminio-estilo-iphone-17-pro-max/main.jpg",
    badge: "Disponible",
    targetCategory: "Fundas"
  }
];

const requiredAiGlassesIds = [
  "s1-ai-classic",
  "aimb-g5-ai-sports",
  "haode-ai-g3-smart-glasses",
  "w630-ai-pro",
  "haode-ai-w610-smart-glasses"
];
const clearanceOfferIds = ["iphone-incell-14", "iphone-incell-11pro"];

let products = [];

const state = {
  activeCategory: categories[0].id,
  searchQuery: "",
  cart: new Map(),
  activeShowcaseIndex: 0,
  showcaseTimer: null,
  activeOfferIndex: 0,
  offerTimer: null,
  dataSource: "Cargando",
  promoPrices: new Map(),
  diagnostics: {
    firestoreTotal: null,
    firestoreActive: null,
    normalizedTotal: 0
  }
};

const money = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0
});

const categoryEl = document.querySelector("[data-categories]");
const productGridEl = document.querySelector("[data-product-grid]");
const latestGridEl = document.querySelector("[data-latest-products]");
const featuredGridEl = document.querySelector("[data-featured-products]");
const latestSectionEl = document.querySelector("[data-latest-section]");
const featuredSectionEl = document.querySelector("[data-featured-section]");
const productCountEl = document.querySelector("[data-product-count]");
const totalProductsEl = document.querySelector("[data-total-products]");
const searchProductsEl = document.querySelector("[data-search-products]");
const cartDrawerEl = document.querySelector("[data-cart-drawer]");
const cartItemsEl = document.querySelector("[data-cart-items]");
const cartTotalEl = document.querySelector("[data-cart-total]");
const whatsappLinkEl = document.querySelector("[data-whatsapp-link]");
const customerNameEl = document.querySelector("[data-customer-name]");
const customerPhoneEl = document.querySelector("[data-customer-phone]");
const customerCityEl = document.querySelector("[data-customer-city]");
const customerCommentEl = document.querySelector("[data-customer-comment]");
const cartCountEls = document.querySelectorAll("[data-cart-count], [data-cart-count-bottom]");
const checkoutInputs = [customerNameEl, customerPhoneEl, customerCityEl, customerCommentEl];
const offersTrackEl = document.querySelector("[data-offers-track]");
const offerDotsEl = document.querySelector("[data-offer-dots]");
const offerCarouselEl = document.querySelector("[data-offer-carousel]");
const heroShowcaseEl = document.querySelector("[data-hero-showcase]");
const showcaseTrackEl = document.querySelector("[data-showcase-track]");
const showcaseDotsEl = document.querySelector("[data-showcase-dots]");

function samsungQualityFor(category, model) {
  const text = `${category || ""} ${model || ""}`.toUpperCase();

  if (text.includes("TIPO ORIGINAL")) {
    return {
      label: "TIPO ORIGINAL",
      spec: "TIPO ORIGINAL CON MARCO"
    };
  }

  if (text.includes("AMOLED") || text.includes("OLED")) {
    return {
      label: "AMOLED",
      spec: "AMOLED CON MARCO"
    };
  }

  if (text.includes("INCELL")) {
    return {
      label: "INCELL",
      spec: "INCELL CON MARCO"
    };
  }

  return null;
}

function productDisplayName(name, category) {
  const normalizedName = String(name || "Producto HAODE").replace(/\s+/g, " ").trim();

  if (!String(category || "").includes("Pantallas Samsung")) {
    return normalizedName;
  }

  return normalizedName
    .replace(/^Pantalla\s+para\s+Samsung\b/i, "Pantalla Samsung")
    .replace(/\s+(TIPO\s+ORIGINAL|AMOLED|OLED|INCELL)\s+CON\s+MARCO\b/gi, "")
    .trim();
}

function normalizeProduct(product) {
  const productDocId = String(product.docId || "").trim();
  const productId = String(product.id || "").trim();
  const rawCategory = product.categoria || product.category || categories[0].id;
  const name = product.nombre || product.name || "Producto HAODE";
  const model = product.modelo || product.model || "Consultar modelo";
  const quality = samsungQualityFor(categoryAliases[rawCategory] || rawCategory, model);

  return {
    id: productId || productDocId,
    category: categoryAliases[rawCategory] || rawCategory,
    name,
    displayName: productDisplayName(name, categoryAliases[rawCategory] || rawCategory),
    model,
    quality,
    description: product.descripcion || product.description || "",
    publicPrice: Number(product.precioPublico ?? product.publicPrice ?? 0),
    appJunePrice: Number(product.precioAppJunio ?? product.appJunePrice ?? 0),
    wholesalePrice: Number(product.precioMayoreo ?? product.wholesalePrice ?? 0),
    priceTiers: normalizePriceTiers(product.priceTiers || product.quantityPricing || product.preciosPorCantidad),
    image: product.imagen || product.image || "/haode-web/assets/products/placeholder.svg",
    stock: normalizeStock(product.stock),
    active: product.activo !== false,
    order: Number(product.orden ?? product.order ?? 9999),
    specialOffer: product.specialOffer === true,
    offerActive: product.offerActive !== false,
    originalPrice: Number(product.originalPrice ?? 0),
    discountPrice: Number(product.discountPrice ?? 0),
    discountPercent: Number(product.discountPercent ?? 0),
    offerBadge: product.offerBadge || "",
    offerTitle: product.offerTitle || "",
    offerSubtitle: product.offerSubtitle || "",
    offerPromoLabel: product.offerPromoLabel || "",
    offerDisplayPrice: product.offerDisplayPrice || "",
    offerDisplayNote: product.offerDisplayNote || "",
    offerImage: product.offerImage || "",
    offerSort: Number(product.offerSort ?? product.orden ?? product.order ?? 9999),
    offerStartDate: product.offerStartDate || "",
    offerEndDate: product.offerEndDate || ""
  };
}

function normalizePriceTiers(tiers) {
  if (!Array.isArray(tiers)) {
    return [];
  }

  return tiers
    .map((tier) => ({
      minQty: Number(tier.minQty ?? tier.minQuantity ?? tier.cantidadMinima ?? tier.min ?? 0),
      maxQty: tier.maxQty === null || tier.maxQty === undefined
        ? null
        : Number(tier.maxQty ?? tier.maxQuantity ?? tier.cantidadMaxima ?? tier.max),
      price: Number(tier.price ?? tier.precio ?? tier.unitPrice ?? tier.precioUnitario ?? 0),
      label: tier.label || tier.nombre || "Precio por cantidad"
    }))
    .filter((tier) => tier.minQty > 0 && tier.price > 0)
    .sort((a, b) => a.minQty - b.minQty);
}

function normalizeStock(stock) {
  const value = String(stock || "disponible").trim().toLowerCase();

  if (value === "bajo pedido" || value === "agotado") {
    return value;
  }

  return "disponible";
}

function activeProducts(items) {
  return items
    .map(normalizeProduct)
    .filter((product) => product.id && product.active)
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, "es"));
}

function hasRealCatalog(items) {
  const categoryIds = new Set(categories.map((category) => category.id));
  return items.some((product) => categoryIds.has(product.categoria || product.category));
}

function missingRequiredAiGlasses(items) {
  const ids = new Set(items.map((product) => product.id));
  return requiredAiGlassesIds.filter((id) => !ids.has(id));
}

function withRequiredAiGlasses(primaryItems, localItems) {
  const productsById = new Map(primaryItems.map((product) => [product.id, product]));
  const localById = new Map(localItems.map((product) => [product.id, product]));

  for (const id of requiredAiGlassesIds) {
    if (!productsById.has(id) && localById.has(id)) {
      productsById.set(id, localById.get(id));
    }
  }

  return Array.from(productsById.values())
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, "es"));
}

async function loadFirestoreProducts() {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase no configurado");
  }

  const [{ getApp, getApps, initializeApp }, firestore] = await Promise.all([
    import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js"),
    import("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js")
  ]);
  const { getFirestore, collection, getDocs, query, where } = firestore;

  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const productsQuery = query(
    collection(db, "products"),
    where("activo", "==", true)
  );
  const snapshot = await getDocs(productsQuery);
  return snapshot.docs.map((doc) => ({
    docId: doc.id,
    ...doc.data(),
    id: doc.data().id || doc.id
  }));
}

async function loadAllFirestoreProducts() {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase no configurado");
  }

  const [{ getApp, getApps, initializeApp }, firestore] = await Promise.all([
    import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js"),
    import("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js")
  ]);
  const { getFirestore, collection, getDocs } = firestore;

  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const snapshot = await getDocs(collection(db, "products"));
  return snapshot.docs.map((doc) => ({
    docId: doc.id,
    ...doc.data(),
    id: doc.data().id || doc.id
  }));
}

async function loadLocalProducts() {
  const response = await fetch(PRODUCTS_JSON_URL, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`No se pudo cargar products.json: ${response.status}`);
  }

  return response.json();
}

async function loadProducts() {
  const localProducts = await loadLocalProducts();
  const normalizedLocalProducts = activeProducts(localProducts);
  products = normalizedLocalProducts;
  state.dataSource = "products.json";

  try {
    try {
      const allProducts = await loadAllFirestoreProducts();
      state.diagnostics.firestoreTotal = allProducts.length;
    } catch {
      state.diagnostics.firestoreTotal = null;
    }

    const firestoreProducts = await loadFirestoreProducts();
    state.diagnostics.firestoreActive = firestoreProducts.length;
  } catch (error) {
    console.info("HAODE app usando products.json:", error.message);
    state.diagnostics.firestoreTotal = null;
    state.diagnostics.firestoreActive = null;
  }

  state.diagnostics.normalizedTotal = products.length;
  window.HAODE_DIAGNOSTICS = {
    firestoreTotal: state.diagnostics.firestoreTotal,
    firestoreActivo: state.diagnostics.firestoreActive,
    productosActivos: state.diagnostics.normalizedTotal,
    productosVisibles: Math.max(products.length, 0),
    fuente: state.dataSource
  };

  if (state.activeCategory !== "Todos" && !products.some((product) => product.category === state.activeCategory)) {
    state.activeCategory = products[0]?.category || categories[0].id;
  }
}

async function loadPromoPrices() {
  state.promoPrices = new Map();

  if (!PROMO_JUNIO) {
    return;
  }

  try {
    const response = await fetch(PROMO_JUNIO_PRICES_URL, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`No se pudo cargar promo junio: ${response.status}`);
    }

    const data = await response.json();
    state.promoPrices = new Map(
      Object.entries(data)
        .map(([id, price]) => [
          id,
          {
            publicPrice: Number(price.precioMostrador ?? 0),
            appPrice: Number(price.precioAppJunio ?? 0),
            source: price.source || ""
          }
        ])
        .filter(([, price]) => price.publicPrice > 0 && price.appPrice > 0)
    );
  } catch (error) {
    console.info("HAODE app sin promoción junio:", error.message);
    state.promoPrices = new Map();
  }
}

function promoPriceFor(product) {
  if (!PROMO_JUNIO || !product?.id) {
    return null;
  }

  const promo = state.promoPrices.get(product.id);
  if (!promo) {
    return null;
  }

  const publicPrice = promo.publicPrice || product.publicPrice;
  const appPrice = promo.appPrice || product.wholesalePrice || product.publicPrice;

  if (!publicPrice || !appPrice) {
    return null;
  }

  return {
    publicPrice,
    appPrice,
    savings: Math.max(publicPrice - appPrice, 0),
    source: promo.source
  };
}

function priceRuleFor(product, quantity = 1) {
  const promo = promoPriceFor(product);

  if (promo) {
    return {
      unitPrice: promo.appPrice,
      label: "Precio APP Junio",
      promo
    };
  }

  if (product.appJunePrice > 0) {
    if (quantity >= 10) {
      return {
        unitPrice: product.wholesalePrice || product.appJunePrice,
        label: "Precio Mayoreo"
      };
    }

    return {
      unitPrice: product.appJunePrice,
      label: "Precio APP Junio"
    };
  }

  const matchingTier = product.priceTiers
    .filter((tier) => quantity >= tier.minQty && (tier.maxQty === null || quantity <= tier.maxQty))
    .pop();

  if (matchingTier) {
    return {
      unitPrice: matchingTier.price,
      label: matchingTier.label
    };
  }

  if (quantity >= 10) {
    return {
      unitPrice: product.wholesalePrice || product.publicPrice,
      label: "Precio mayoreo"
    };
  }

  return {
    unitPrice: product.publicPrice,
    label: "Precio menudeo"
  };
}

function priceFor(product, quantity = 1) {
  return priceRuleFor(product, quantity).unitPrice;
}

function formatPrice(value) {
  return `${money.format(Number(value) || 0)} MXN`;
}

function renderCategories() {
  categoryEl.innerHTML = categories
    .map((category) => {
      const active = category.id === state.activeCategory ? " active" : "";
      return `<button class="${active}" type="button" data-category="${category.id}">${category.label}</button>`;
    })
    .join("");
}

function heroShowcaseCardHtml(item) {
  const targetAttr = item.targetCategory
    ? `data-showcase-category="${item.targetCategory}"`
    : `data-showcase-search="${item.targetSearch || item.title}"`;

  return `
    <article class="hero-showcase-card">
      <div class="hero-showcase-media">
        <img src="${item.image}" alt="${item.title}" loading="eager" />
      </div>
      <div class="hero-showcase-info">
        <span class="hero-showcase-badge">${item.badge}</span>
        <h3>${item.title}</h3>
        <p>${item.subtitle}</p>
        <button class="hero-showcase-button" type="button" ${targetAttr}>Ver productos</button>
      </div>
    </article>
  `;
}

function renderHeroShowcase() {
  if (!showcaseTrackEl || !showcaseDotsEl || !heroShowcaseItems.length) {
    return;
  }

  if (state.activeShowcaseIndex >= heroShowcaseItems.length) {
    state.activeShowcaseIndex = 0;
  }

  heroShowcaseEl?.classList.toggle("hero-showcase-single", heroShowcaseItems.length === 1);
  showcaseTrackEl.innerHTML = heroShowcaseCardHtml(heroShowcaseItems[state.activeShowcaseIndex]);
  showcaseDotsEl.innerHTML = heroShowcaseItems
    .map((item, index) => {
      const active = index === state.activeShowcaseIndex ? " active" : "";
      return `<button class="${active}" type="button" data-showcase-dot="${index}" aria-label="Ver ${item.title}"></button>`;
    })
    .join("");
}

function moveHeroShowcase(delta) {
  if (!heroShowcaseItems.length) {
    return;
  }

  state.activeShowcaseIndex = (state.activeShowcaseIndex + delta + heroShowcaseItems.length) % heroShowcaseItems.length;
  renderHeroShowcase();
}

function startHeroShowcaseAutoplay() {
  window.clearInterval(state.showcaseTimer);
  if (heroShowcaseItems.length <= 1) {
    return;
  }

  state.showcaseTimer = window.setInterval(() => moveHeroShowcase(1), 3000);
}

function filterShowcaseProducts({ category, search }) {
  if (category && categories.some((item) => item.id === category)) {
    state.activeCategory = category;
    state.searchQuery = "";
  } else {
    state.activeCategory = "Todos";
    state.searchQuery = search || category || "";
  }

  searchProductsEl.value = state.searchQuery;
  renderCategories();
  renderProducts();
  document.querySelector("[data-product-grid]")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function productStockMarkup(product) {
  return `<span class="stock-badge stock-${product.stock.replace(" ", "-")}">${product.stock}</span>`;
}

function productPriceMarkup(product) {
  const promo = promoPriceFor(product);

  if (product.category === "Micas") {
    return `
      <div class="price-lines">
        <span>Paquete 50 pzs <strong>${formatPrice(product.publicPrice)}</strong></span>
        <span>Mayoreo desde <strong>${formatPrice(product.wholesalePrice)}</strong></span>
      </div>
    `;
  }

  if (product.appJunePrice > 0) {
    return `
      <div class="price-lines app-june-price-lines">
        <span>Precio Mostrador <strong>${formatPrice(product.publicPrice)}</strong></span>
        <span class="promo-app-price">Precio APP Junio <strong>${formatPrice(product.appJunePrice)}</strong></span>
        <span>Precio Mayoreo <strong>${formatPrice(product.wholesalePrice)}</strong></span>
      </div>
    `;
  }

  if (!promo) {
    return `
      <div class="price-lines">
        <span>Precio menudeo <strong>${formatPrice(product.publicPrice)}</strong></span>
        <span>Precio mayoreo <strong>${formatPrice(product.wholesalePrice)}</strong></span>
      </div>
    `;
  }

  return `
    <div class="price-lines promo-price-lines">
      <span>Precio Mostrador: <strong>${formatPrice(promo.publicPrice)}</strong></span>
      <span class="promo-app-price">Precio APP Junio: <strong>${formatPrice(promo.appPrice)}</strong></span>
      <span class="promo-savings">AHORRAS <strong>${formatPrice(promo.savings)}</strong></span>
    </div>
  `;
}

function productDetailUrl(product) {
  const detailUrls = {
    "samsung-original-z-flip7": "/haode-web/productos/samsung-z-flip7/",
    "samsung-original-z-fold3": "/haode-web/productos/samsung-z-fold3/",
    "samsung-original-z-fold4": "/haode-web/productos/samsung-z-fold4/",
    "samsung-original-z-fold5": "/haode-web/productos/samsung-z-fold5/",
    "samsung-original-z-fold6": "/haode-web/productos/samsung-z-fold6/"
  };

  return detailUrls[product.id] || "";
}

function productCardHtml(product) {
  const qualityMarkup = product.quality
    ? `
        <div class="quality-row" aria-label="Calidad de pantalla">
          <span class="quality-badge">${product.quality.label}</span>
          <span class="quality-spec">${product.quality.spec}</span>
        </div>
      `
    : "";
  const detailUrl = productDetailUrl(product);
  const detailAction = detailUrl
    ? `<a class="text-button" href="${detailUrl}">Ver detalles</a>`
    : `<button class="text-button" type="button" data-show-details="${product.id}">Ver detalles</button>`;

  return `
    <article class="product-card">
      <div class="product-media">
        <img src="${product.image}" alt="${product.name}" loading="lazy" />
      </div>
      <div class="product-info">
        <div class="product-title-row">
          <h3>${product.displayName}</h3>
          ${productStockMarkup(product)}
        </div>
        ${qualityMarkup}
        <p class="model">Modelo: ${product.model}</p>
        ${productPriceMarkup(product)}
        <div class="product-description" data-product-description="${product.id}" hidden>
          <p>${product.description || "Sin detalles adicionales disponibles."}</p>
          ${product.priceTiers.length ? priceTiersMarkup(product) : ""}
        </div>
        <div class="product-actions">
          ${detailAction}
          <button class="outline-button" type="button" data-add-wholesale="${product.id}">Solicitar mayoreo</button>
          <button class="add-button" type="button" data-add-product="${product.id}">Agregar al carrito</button>
        </div>
      </div>
    </article>
  `;
}

function priceTiersMarkup(product) {
  return `
    <div class="detail-tiers">
      <strong>Precios por cantidad</strong>
      ${product.priceTiers.map((tier) => {
        const range = tier.maxQty ? `${tier.minQty} - ${tier.maxQty} piezas` : `${tier.minQty}+ piezas`;
        return `<span>${range}: ${formatPrice(tier.price)} · ${tier.label}</span>`;
      }).join("")}
    </div>
  `;
}

function activeOffers() {
  const today = new Date();

  return products.filter((product) => {
    if (!clearanceOfferIds.includes(product.id)) {
      return false;
    }

    if (!product.specialOffer || product.offerActive === false || (!product.discountPrice && !product.offerDisplayPrice)) {
      return false;
    }

    const startsAt = product.offerStartDate ? new Date(product.offerStartDate) : null;
    const endsAt = product.offerEndDate ? new Date(product.offerEndDate) : null;

    return (!startsAt || startsAt <= today) && (!endsAt || endsAt >= today);
  }).sort((a, b) => clearanceOfferIds.indexOf(a.id) - clearanceOfferIds.indexOf(b.id));
}

function offerCardHtml(product) {
  const originalPrice = product.originalPrice || product.publicPrice;
  const badge = product.offerBadge || (product.discountPercent ? `-${product.discountPercent}%` : "Oferta");
  const offerImage = product.offerImage || product.image;
  const offerTitle = product.offerTitle || product.displayName;
  const offerSubtitle = product.offerSubtitle || product.model;
  const priceMarkup = product.offerDisplayPrice
    ? `
        ${product.offerPromoLabel ? `<span class="offer-promo-label">${product.offerPromoLabel}</span>` : ""}
        <strong class="offer-display-price">${product.offerDisplayPrice}</strong>
        ${product.offerDisplayNote ? `<p class="offer-display-note">${product.offerDisplayNote}</p>` : ""}
      `
    : `
        <div class="offer-prices">
          <del>${formatPrice(originalPrice)}</del>
          <strong>${formatPrice(product.discountPrice)}</strong>
        </div>
      `;

  return `
    <article class="offer-card${product.offerDisplayPrice ? " featured-offer-card" : ""}" data-focus-product="${product.id}">
      <div class="offer-media">
        <img src="${offerImage}" alt="${offerTitle}" loading="lazy" />
        <span>${badge}</span>
      </div>
      <div class="offer-info">
        <h3>${offerTitle}</h3>
        <p>${offerSubtitle}</p>
        ${priceMarkup}
        <div class="offer-actions">
          <button class="add-button" type="button" data-add-product="${product.id}">Agregar al carrito</button>
          <button class="text-button" type="button" data-focus-product="${product.id}">Ver detalles</button>
        </div>
      </div>
    </article>
  `;
}

function renderOffers() {
  if (!offersTrackEl || !offerDotsEl) {
    return;
  }

  const offers = activeOffers();
  offerCarouselEl?.classList.toggle("offers-empty", !offers.length);
  offerCarouselEl?.classList.toggle("offers-single", offers.length === 1);

  if (!offers.length) {
    offersTrackEl.innerHTML = `
      <div class="offers-empty-state">
        <strong>Proximamente nuevas ofertas especiales.</strong>
        <span>Estamos preparando promociones seleccionadas para ti.</span>
      </div>
    `;
    offerDotsEl.innerHTML = "";
    return;
  }

  if (state.activeOfferIndex >= offers.length) {
    state.activeOfferIndex = 0;
  }

  offersTrackEl.innerHTML = offerCardHtml(offers[state.activeOfferIndex]);
  offerDotsEl.innerHTML = offers
    .map((offer, index) => {
      const active = index === state.activeOfferIndex ? " active" : "";
      return `<button class="${active}" type="button" data-offer-dot="${index}" aria-label="Ver oferta ${index + 1}"></button>`;
    })
    .join("");
}

function moveOffer(delta) {
  const offers = activeOffers();
  if (!offers.length) {
    return;
  }

  state.activeOfferIndex = (state.activeOfferIndex + delta + offers.length) % offers.length;
  renderOffers();
}

function startOfferAutoplay() {
  window.clearInterval(state.offerTimer);
  if (activeOffers().length <= 1) {
    return;
  }
  state.offerTimer = window.setInterval(() => moveOffer(1), 5000);
}

function focusProduct(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product) {
    return;
  }

  state.activeCategory = "Todos";
  state.searchQuery = product.displayName || product.name;
  searchProductsEl.value = state.searchQuery;
  renderCategories();
  renderProducts();
  document.querySelector("[data-product-grid]")?.scrollIntoView({ behavior: "smooth", block: "start" });
  const detailsEl = document.querySelector(`[data-product-description="${productId}"]`);
  const detailButton = document.querySelector(`[data-show-details="${productId}"]`);
  if (detailsEl && detailButton) {
    detailsEl.removeAttribute("hidden");
    detailButton.textContent = "Ocultar detalles";
  }
}

function renderProductSections() {
  const query = state.searchQuery.trim().toLowerCase();
  const latestProducts = products
    .slice()
    .sort((a, b) => b.order - a.order || b.id.localeCompare(a.id))
    .slice(0, 8);
  const featuredScreens = products
    .filter((product) => product.category.includes("Pantallas"))
    .sort((a, b) => a.order - b.order)
    .slice(0, 4);
  const featuredAi = products
    .filter((product) => product.category === "Gafas AI")
    .slice(0, 1);
  const featuredMachine = products
    .filter((product) => product.category === "Máquinas de Mica")
    .slice(0, 1);
  const featuredCase = products
    .filter((product) => product.category === "Fundas")
    .slice(0, 1);

  const featuredProducts = [...featuredAi, ...featuredMachine, ...featuredCase, ...featuredScreens];
  const uniqueProducts = new Map();
  featuredProducts.forEach((product) => uniqueProducts.set(product.id, product));

  const hideSection = Boolean(query);
  latestSectionEl.hidden = hideSection;
  featuredSectionEl.hidden = hideSection;

  if (!query) {
    latestGridEl.innerHTML = latestProducts.length
      ? latestProducts.map(productCardHtml).join("")
      : '<div class="empty-cart">Aún no hay lanzamientos nuevos.</div>';
    featuredGridEl.innerHTML = uniqueProducts.size
      ? Array.from(uniqueProducts.values()).map(productCardHtml).join("")
      : '<div class="empty-cart">Aún no hay destacados activos.</div>';
  }
}

function renderProducts() {
  const query = state.searchQuery.trim().toLowerCase();
  const queryTokens = query.split(/\s+/).filter(Boolean);
  const visibleProducts = products.filter((product) => {
    const matchesCategory = query || state.activeCategory === "Todos" ? true : product.category === state.activeCategory;
    const searchText = [
      product.name,
      product.displayName,
      product.model,
      product.quality?.label,
      product.quality?.spec,
      product.description,
      product.category,
      categorySearchAliases[product.category]
    ]
      .map((value) => String(value || "").toLowerCase())
      .join(" ");
    const matchesSearch = !queryTokens.length || queryTokens.every((token) => searchText.includes(token));
    return matchesCategory && matchesSearch;
  });

  productCountEl.textContent = `${visibleProducts.length} productos`;
  if (totalProductsEl) {
    totalProductsEl.textContent = `Total productos: ${products.length}`;
  }
  if (window.HAODE_DIAGNOSTICS) {
    window.HAODE_DIAGNOSTICS.productosVisibles = visibleProducts.length;
  }
  productGridEl.innerHTML = visibleProducts.length
    ? visibleProducts.map(productCardHtml).join("")
    : '<div class="empty-cart">No hay productos activos para esta busqueda.</div>';

  renderProductSections();
  renderOffers();
}

function getCartItems() {
  return Array.from(state.cart.entries()).map(([productId, quantity]) => ({
    product: products.find((item) => item.id === productId),
    quantity
  })).filter((item) => item.product);
}

function cartTotal() {
  return getCartItems().reduce((total, item) => total + priceFor(item.product, item.quantity) * item.quantity, 0);
}

function cartCount() {
  return getCartItems().reduce((total, item) => total + item.quantity, 0);
}

function buildWhatsappUrl() {
  const items = getCartItems();
  const clientName = (customerNameEl?.value || "").trim();
  const clientPhone = (customerPhoneEl?.value || "").trim();
  const clientCity = (customerCityEl?.value || "").trim();
  const clientComment = (customerCommentEl?.value || "").trim();

  const lines = [
    "Hola HAODE, quiero hacer este pedido:",
    "",
    `Cliente: ${clientName || "Sin nombre"}`,
    `Telefono: ${clientPhone || "Sin telefono"}`,
    `Ciudad: ${clientCity || "Sin ciudad"}`,
    `Tipo de precio: ${PROMO_JUNIO ? "Precio APP Junio" : "automatico por cantidad"}`,
    "",
    ...items.map((item) => {
      const priceRule = priceRuleFor(item.product, item.quantity);
      const subtotal = priceRule.unitPrice * item.quantity;
      return `- ${item.product.name} | Modelo: ${item.product.model} | Cantidad: ${item.quantity} | Precio aplicado: ${priceRule.label} ${formatPrice(priceRule.unitPrice)} | Subtotal: ${formatPrice(subtotal)}`;
    }),
    "",
    `Total estimado: ${formatPrice(cartTotal())}`,
    "",
    `Comentario: ${clientComment || "Sin comentario"}`,
    "",
    "Por favor confirma disponibilidad, precio final y envio. Entiendo que no hay pago en linea y se confirma por WhatsApp."
  ];

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
}

function renderCart() {
  const items = getCartItems();
  const totalItems = cartCount();
  const customerReady = [
    (customerNameEl?.value || "").trim(),
    (customerPhoneEl?.value || "").trim(),
    (customerCityEl?.value || "").trim()
  ].every(Boolean);

  cartCountEls.forEach((el) => {
    el.textContent = String(totalItems);
  });

  if (!items.length) {
    cartItemsEl.innerHTML = '<div class="empty-cart">Tu carrito esta vacio. Agrega productos para enviar el pedido por WhatsApp.</div>';
    cartTotalEl.textContent = formatPrice(0);
    whatsappLinkEl.href = "#";
    whatsappLinkEl.classList.add("disabled");
    whatsappLinkEl.classList.remove("expanded");
    return;
  }

  cartItemsEl.innerHTML = items
    .map((item) => {
      const priceRule = priceRuleFor(item.product, item.quantity);
      const subtotal = priceRule.unitPrice * item.quantity;
      return `
        <article class="cart-item">
          <img src="${item.product.image}" alt="${item.product.name}" loading="lazy" />
          <div>
            <h3>${item.product.name}</h3>
            <p>${item.product.model}</p>
            <div class="cart-row">
              <div class="qty-control" aria-label="Cantidad">
                <button type="button" data-decrease="${item.product.id}">-</button>
                <span>${item.quantity}</span>
                <button type="button" data-increase="${item.product.id}">+</button>
              </div>
              <strong>${formatPrice(subtotal)}</strong>
            </div>
            <p class="applied-price">Precio aplicado: ${priceRule.label} · ${formatPrice(priceRule.unitPrice)} c/u</p>
            <div class="cart-row">
              <button class="remove-button" type="button" data-remove="${item.product.id}">Eliminar</button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  cartTotalEl.textContent = formatPrice(cartTotal());

  whatsappLinkEl.classList.toggle("disabled", !customerReady);
  whatsappLinkEl.href = customerReady ? buildWhatsappUrl() : "#";
  whatsappLinkEl.classList.toggle("expanded", customerReady);
}

function addProduct(productId) {
  state.cart.set(productId, (state.cart.get(productId) || 0) + 1);
  renderCart();
}

function addWholesaleProduct(productId) {
  state.cart.set(productId, Math.max(state.cart.get(productId) || 0, 10));
  renderCart();
}

function changeQuantity(productId, delta) {
  const nextQuantity = (state.cart.get(productId) || 0) + delta;

  if (nextQuantity <= 0) {
    state.cart.delete(productId);
  } else {
    state.cart.set(productId, nextQuantity);
  }

  renderCart();
}

function openCart() {
  cartDrawerEl.classList.add("open");
  cartDrawerEl.setAttribute("aria-hidden", "false");
}

function closeCart() {
  cartDrawerEl.classList.remove("open");
  cartDrawerEl.setAttribute("aria-hidden", "true");
}

document.addEventListener("click", (event) => {
  const categoryButton = event.target.closest("[data-category]");
  const addButton = event.target.closest("[data-add-product]");
  const addWholesaleButton = event.target.closest("[data-add-wholesale]");
  const detailButton = event.target.closest("[data-show-details]");
  const increaseButton = event.target.closest("[data-increase]");
  const decreaseButton = event.target.closest("[data-decrease]");
  const removeButton = event.target.closest("[data-remove]");
  const openCartButton = event.target.closest("[data-open-cart]");
  const closeCartButton = event.target.closest("[data-close-cart]");
  const offerPrevButton = event.target.closest("[data-offer-prev]");
  const offerNextButton = event.target.closest("[data-offer-next]");
  const offerDotButton = event.target.closest("[data-offer-dot]");
  const focusProductButton = event.target.closest("[data-focus-product]");
  const showcasePrevButton = event.target.closest("[data-showcase-prev]");
  const showcaseNextButton = event.target.closest("[data-showcase-next]");
  const showcaseDotButton = event.target.closest("[data-showcase-dot]");
  const showcaseCategoryButton = event.target.closest("[data-showcase-category]");
  const showcaseSearchButton = event.target.closest("[data-showcase-search]");

  if (categoryButton) {
    state.activeCategory = categoryButton.dataset.category;
    renderCategories();
    renderProducts();
  }

  if (addButton) {
    addProduct(addButton.dataset.addProduct);
    openCart();
  }

  if (addWholesaleButton) {
    addWholesaleProduct(addWholesaleButton.dataset.addWholesale);
    openCart();
  }

  if (offerPrevButton) {
    moveOffer(-1);
    startOfferAutoplay();
  }

  if (offerNextButton) {
    moveOffer(1);
    startOfferAutoplay();
  }

  if (offerDotButton) {
    state.activeOfferIndex = Number(offerDotButton.dataset.offerDot) || 0;
    renderOffers();
    startOfferAutoplay();
  }

  if (showcasePrevButton) {
    moveHeroShowcase(-1);
    startHeroShowcaseAutoplay();
  }

  if (showcaseNextButton) {
    moveHeroShowcase(1);
    startHeroShowcaseAutoplay();
  }

  if (showcaseDotButton) {
    state.activeShowcaseIndex = Number(showcaseDotButton.dataset.showcaseDot) || 0;
    renderHeroShowcase();
    startHeroShowcaseAutoplay();
  }

  if (showcaseCategoryButton) {
    filterShowcaseProducts({ category: showcaseCategoryButton.dataset.showcaseCategory });
  }

  if (showcaseSearchButton) {
    filterShowcaseProducts({ search: showcaseSearchButton.dataset.showcaseSearch });
  }

  if (focusProductButton && !event.target.closest("[data-add-product]")) {
    focusProduct(focusProductButton.dataset.focusProduct);
  }

  if (detailButton) {
    const productId = detailButton.dataset.showDetails;
    const detailsEl = document.querySelector(`[data-product-description="${productId}"]`);
    const isHidden = detailsEl?.hasAttribute("hidden");
    if (detailsEl) {
      if (isHidden) {
        detailsEl.removeAttribute("hidden");
        detailButton.textContent = "Ocultar detalles";
      } else {
        detailsEl.setAttribute("hidden", "true");
        detailButton.textContent = "Ver detalles";
      }
    }
  }

  if (increaseButton) {
    changeQuantity(increaseButton.dataset.increase, 1);
  }

  if (decreaseButton) {
    changeQuantity(decreaseButton.dataset.decrease, -1);
  }

  if (removeButton) {
    state.cart.delete(removeButton.dataset.remove);
    renderCart();
  }

  if (openCartButton) {
    openCart();
  }

  if (closeCartButton || event.target === cartDrawerEl) {
    closeCart();
  }
});

searchProductsEl.addEventListener("input", (event) => {
  state.searchQuery = event.target.value;
  renderProducts();
});

offerCarouselEl?.addEventListener("mouseenter", () => window.clearInterval(state.offerTimer));
offerCarouselEl?.addEventListener("mouseleave", startOfferAutoplay);
heroShowcaseEl?.addEventListener("mouseenter", () => window.clearInterval(state.showcaseTimer));
heroShowcaseEl?.addEventListener("mouseleave", startHeroShowcaseAutoplay);

checkoutInputs.forEach((element) => {
  element.addEventListener("input", renderCart);
});

async function init() {
  renderHeroShowcase();
  startHeroShowcaseAutoplay();
  renderCategories();
  productGridEl.innerHTML = '<div class="empty-cart">Cargando productos HAODE...</div>';
  renderCart();
  await loadProducts();
  await loadPromoPrices();
  renderCategories();
  renderProducts();
  startOfferAutoplay();
  renderCart();
}

init().catch((error) => {
  console.error("No se pudo iniciar HAODE app:", error);
  productGridEl.innerHTML = '<div class="empty-cart">No se pudieron cargar los productos. Intenta de nuevo por WhatsApp.</div>';
});
