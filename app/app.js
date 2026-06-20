import { firebaseConfig, isFirebaseConfigured } from "./firebase-config.js";

const WHATSAPP_NUMBER = "523326684296";
const PRODUCTS_JSON_URL = "/haode-web/app/products.json";
const PROMO_JUNIO = true;
const PROMO_JUNIO_PRICES_URL = "/haode-web/app/promo-junio-prices.json";
const SERVICE_WORKER_URL = "/haode-web/service-worker.js";
const PLACEHOLDER_IMAGE = "/haode-web/assets/products/placeholder.svg";

let deferredInstallPrompt = null;
let products = [];

const categories = [
  { id: "Todos", label: "Todos", shortLabel: "Todo", group: "Todo", url: "/haode-web/app/#inicio", icon: "grid" },
  { id: "Pantallas iPhone OLED", label: "iPhone OLED", shortLabel: "Pantallas", group: "Pantallas", url: "/haode-web/categoria/iphone-oled/", icon: "screen" },
  { id: "Pantallas iPhone INCELL", label: "iPhone INCELL", shortLabel: "Pantallas", group: "Pantallas", url: "/haode-web/categoria/iphone-incell/", icon: "screen" },
  { id: "Pantallas Samsung OLED", label: "Samsung AMOLED", shortLabel: "Pantallas", group: "Pantallas", url: "/haode-web/categoria/samsung-oled/", icon: "screen" },
  { id: "Pantallas Samsung INCELL", label: "Samsung INCELL", shortLabel: "Pantallas", group: "Pantallas", url: "/haode-web/categoria/samsung-incell/", icon: "screen" },
  { id: "Pantallas Samsung Original", label: "Samsung TIPO ORIGINAL", shortLabel: "Pantallas", group: "Pantallas", url: "/haode-web/categoria/samsung-tipo-original/", icon: "screen" },
  { id: "Micas", label: "Micas", shortLabel: "Micas", group: "Micas", url: "/haode-web/categoria/micas/", icon: "layers" },
  { id: "Máquinas de Mica", label: "Máquinas de Mica", shortLabel: "Micas", group: "Micas", url: "/haode-web/categoria/maquinas-de-hidrogel/", icon: "machine" },
  { id: "Gafas AI", label: "Gafas AI", shortLabel: "AI", group: "AI", url: "/haode-web/categoria/gafas-inteligentes-ai/", icon: "spark" },
  { id: "Cámaras Inteligentes", label: "Cámaras AI", shortLabel: "AI", group: "AI", url: "/haode-web/categoria/camaras-inteligentes/", icon: "camera" },
  { id: "Fundas", label: "Fundas", shortLabel: "Fundas", group: "Fundas", url: "/haode-web/categoria/fundas/", icon: "case" }
];

const categoryAliases = {
  fundas: "Fundas",
  "Fundas y Accesorios": "Fundas",
  "Pantallas Samsung AMOLED": "Pantallas Samsung OLED"
};

const categorySearchAliases = {
  Fundas: "Fundas y Accesorios",
  "Pantallas Samsung Original": "Samsung TIPO ORIGINAL"
};

const categoryGroups = [
  {
    id: "Pantallas",
    title: "Pantallas",
    description: "iPhone, Samsung y calidades profesionales",
    categoryIds: ["Pantallas iPhone OLED", "Pantallas iPhone INCELL", "Pantallas Samsung OLED", "Pantallas Samsung INCELL", "Pantallas Samsung Original"],
    url: "/haode-web/categoria/pantallas/",
    icon: "screen"
  },
  {
    id: "Micas",
    title: "Micas",
    description: "Micas y máquinas para corte profesional",
    categoryIds: ["Micas", "Máquinas de Mica"],
    url: "/haode-web/categoria/micas/",
    icon: "layers"
  },
  {
    id: "AI",
    title: "AI",
    description: "Gafas, cámaras y accesorios inteligentes",
    categoryIds: ["Gafas AI", "Cámaras Inteligentes"],
    url: "/haode-web/categoria/productos-ai/",
    icon: "spark"
  },
  {
    id: "Fundas",
    title: "Fundas",
    description: "Fundas para venta rápida y mayoreo",
    categoryIds: ["Fundas"],
    url: "/haode-web/categoria/fundas/",
    icon: "case"
  },
  {
    id: "Accesorios",
    title: "Accesorios",
    description: "Refacciones y productos complementarios",
    categoryIds: ["Fundas", "Micas", "Gafas AI", "Cámaras Inteligentes"],
    url: "/haode-web/categoria/",
    icon: "grid"
  }
];

const state = {
  activeCategory: "Todos",
  activeGroup: "",
  searchQuery: "",
  sortMode: "featured",
  route: { name: "home" },
  cart: new Map(),
  promoPrices: new Map(),
  selectedGalleryIndex: 0,
  viewerIndex: 0,
  viewerStartX: 0,
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

const viewRootEl = document.querySelector("[data-view-root]");
const networkStateEl = document.querySelector("[data-network-state]");
const cartDrawerEl = document.querySelector("[data-cart-drawer]");
const cartItemsEl = document.querySelector("[data-cart-items]");
const cartTotalEl = document.querySelector("[data-cart-total]");
const whatsappLinkEl = document.querySelector("[data-whatsapp-link]");
const customerNameEl = document.querySelector("[data-customer-name]");
const customerPhoneEl = document.querySelector("[data-customer-phone]");
const customerCityEl = document.querySelector("[data-customer-city]");
const customerCommentEl = document.querySelector("[data-customer-comment]");
const checkoutInputs = [customerNameEl, customerPhoneEl, customerCityEl, customerCommentEl].filter(Boolean);
const cartCountEls = document.querySelectorAll("[data-cart-count], [data-cart-count-bottom]");

function iconSvg(name) {
  const icons = {
    grid: '<path d="M5 5h6v6H5V5Zm8 0h6v6h-6V5ZM5 13h6v6H5v-6Zm8 0h6v6h-6v-6Z"/>',
    screen: '<path d="M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M10 18h4"/>',
    layers: '<path d="m12 3 8 4.5-8 4.5-8-4.5L12 3Z"/><path d="m4 12 8 4.5 8-4.5"/><path d="m4 16.5 8 4.5 8-4.5"/>',
    machine: '<path d="M5 5h14v9H5V5Z"/><path d="M8 18h8M9 14v4m6-4v4M9 9h6"/>',
    spark: '<path d="M12 3 9.8 9.8 3 12l6.8 2.2L12 21l2.2-6.8L21 12l-6.8-2.2L12 3Z"/>',
    camera: '<path d="M5 7h3l1.5-2h5L16 7h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z"/><path d="M12 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>',
    case: '<path d="M8 3h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M11 18h2"/>',
    truck: '<path d="M3 6h11v9H3V6Zm11 3h4l3 3v3h-7V9Z"/><path d="M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/>',
    whatsapp: '<path d="M20 11.5a8 8 0 0 1-11.9 7L4 20l1.4-4.2A8 8 0 1 1 20 11.5Z"/><path d="M9 8.8c.2 3 2.2 5 5.2 5.5l1-1.1"/>',
    shield: '<path d="M12 3 5 6v5c0 4.6 3 8 7 10 4-2 7-5.4 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-5"/>'
  };

  return `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name] || icons.grid}</svg>`;
}

function isStandaloneMode() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function detectWebView() {
  const ua = window.navigator.userAgent || "";
  const params = new URLSearchParams(window.location.search);
  const isIos = /iphone|ipad|ipod/i.test(ua);
  const explicit = params.has("webview") || params.has("iosWebView") || params.get("mode") === "webview";
  const likelyWebView = isIos && !/safari/i.test(ua);

  document.body.classList.toggle("is-webview", explicit || likelyWebView || isStandaloneMode());
}

function setupPwaInstallPrompt() {
  const bannerEl = document.querySelector("[data-install-banner]");
  const titleEl = document.querySelector("[data-install-title]");
  const copyEl = document.querySelector("[data-install-copy]");
  const buttonEl = document.querySelector("[data-install-button]");

  if (!bannerEl || !titleEl || !copyEl || !buttonEl || isStandaloneMode() || document.body.classList.contains("is-webview")) {
    return;
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    bannerEl.hidden = false;
    titleEl.textContent = "Instalar App HAODE";
    copyEl.textContent = "Agrega HAODE a tu pantalla de inicio y abre el catálogo como app.";
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

function normalizeStock(stock) {
  const value = String(stock || "disponible").trim().toLowerCase();
  return ["bajo pedido", "agotado"].includes(value) ? value : "disponible";
}

function samsungQualityFor(category, model) {
  const text = `${category || ""} ${model || ""}`.toUpperCase();
  if (text.includes("TIPO ORIGINAL")) {
    return { label: "TIPO ORIGINAL", spec: "TIPO ORIGINAL CON MARCO" };
  }
  if (text.includes("AMOLED") || text.includes("OLED")) {
    return { label: "AMOLED", spec: "AMOLED CON MARCO" };
  }
  if (text.includes("INCELL")) {
    return { label: "INCELL", spec: "INCELL CON MARCO" };
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

function normalizeProduct(product) {
  const productDocId = String(product.docId || "").trim();
  const productId = String(product.id || "").trim();
  const rawCategory = product.categoria || product.category || categories[0].id;
  const category = categoryAliases[rawCategory] || rawCategory;
  const name = product.nombre || product.name || "Producto HAODE";
  const model = product.modelo || product.model || "Consultar modelo";
  const quality = samsungQualityFor(category, model);

  return {
    id: productId || productDocId,
    category,
    name,
    displayName: productDisplayName(name, category),
    model,
    quality,
    description: product.descripcion || product.description || "",
    publicPrice: Number(product.precioPublico ?? product.publicPrice ?? 0),
    appJunePrice: Number(product.precioAppJunio ?? product.appJunePrice ?? 0),
    wholesalePrice: Number(product.precioMayoreo ?? product.wholesalePrice ?? 0),
    priceTiers: normalizePriceTiers(product.priceTiers || product.quantityPricing || product.preciosPorCantidad),
    image: product.imagen || product.image || PLACEHOLDER_IMAGE,
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

function activeProducts(items) {
  return items
    .map(normalizeProduct)
    .filter((product) => product.id && product.active)
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, "es"));
}

async function loadFirestoreProducts(activeOnly = true) {
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
  const ref = collection(db, "products");
  const snapshot = await getDocs(activeOnly ? query(ref, where("activo", "==", true)) : ref);

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
  products = activeProducts(localProducts);

  try {
    const [allProducts, activeFirestoreProducts] = await Promise.all([
      loadFirestoreProducts(false),
      loadFirestoreProducts(true)
    ]);
    state.diagnostics.firestoreTotal = allProducts.length;
    state.diagnostics.firestoreActive = activeFirestoreProducts.length;
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
    fuente: "products.json"
  };
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
    return { unitPrice: promo.appPrice, label: "Precio APP Junio", promo };
  }

  if (product.appJunePrice > 0) {
    if (quantity >= 10) {
      return { unitPrice: product.wholesalePrice || product.appJunePrice, label: "Precio Mayoreo" };
    }
    return { unitPrice: product.appJunePrice, label: "Precio APP Junio" };
  }

  const matchingTier = product.priceTiers
    .filter((tier) => quantity >= tier.minQty && (tier.maxQty === null || quantity <= tier.maxQty))
    .pop();
  if (matchingTier) {
    return { unitPrice: matchingTier.price, label: matchingTier.label };
  }
  if (quantity >= 10) {
    return { unitPrice: product.wholesalePrice || product.publicPrice, label: "Precio mayoreo" };
  }
  return { unitPrice: product.publicPrice, label: "Precio menudeo" };
}

function priceFor(product, quantity = 1) {
  return priceRuleFor(product, quantity).unitPrice;
}

function formatPrice(value) {
  const number = Number(value) || 0;
  return number > 0 ? `${money.format(number)} MXN` : "Consultar por WhatsApp";
}

function priceLines(product) {
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
      <div class="price-lines">
        <span>Precio Mostrador <strong>${formatPrice(product.publicPrice)}</strong></span>
        <span class="promo-app-price">Precio APP Junio <strong>${formatPrice(product.appJunePrice)}</strong></span>
        <span>Precio Mayoreo <strong>${formatPrice(product.wholesalePrice)}</strong></span>
      </div>
    `;
  }
  if (promo) {
    return `
      <div class="price-lines">
        <span>Precio Mostrador <strong>${formatPrice(promo.publicPrice)}</strong></span>
        <span class="promo-app-price">Precio APP Junio <strong>${formatPrice(promo.appPrice)}</strong></span>
        <span class="price-note">Ahorro ${formatPrice(promo.savings)}</span>
      </div>
    `;
  }
  return `
    <div class="price-lines">
      <span>Precio menudeo <strong>${formatPrice(product.publicPrice)}</strong></span>
      <span>Precio mayoreo <strong>${formatPrice(product.wholesalePrice)}</strong></span>
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

function appProductUrl(product) {
  return `#producto/${encodeURIComponent(product.id)}`;
}

function categoryRouteUrl(categoryId) {
  return `#categoria/${encodeURIComponent(categoryId)}`;
}

function groupRouteUrl(groupId) {
  return `#grupo/${encodeURIComponent(groupId)}`;
}

function escapeAttr(value) {
  return String(value || "").replace(/"/g, "&quot;");
}

function productCardHtml(product, compact = false) {
  const label = product.quality?.label || product.category;
  return `
    <article class="product-card">
      <a class="product-media" href="${appProductUrl(product)}" aria-label="Ver ${escapeAttr(product.displayName)}">
        <img src="${product.image}" alt="${escapeAttr(product.name)}" loading="${compact ? "eager" : "lazy"}" decoding="async" onerror="this.src='${PLACEHOLDER_IMAGE}'" />
      </a>
      <div class="product-body">
        <span class="product-kicker">${label}</span>
        <h3>${product.displayName}</h3>
        <p class="model">Modelo: ${product.model}</p>
        ${priceLines(product)}
        <div class="product-actions">
          <a class="text-button" href="${appProductUrl(product)}">Detalles</a>
          <button class="add-button" type="button" data-add-product="${product.id}">Agregar</button>
        </div>
      </div>
    </article>
  `;
}

function getProductsForGroup(groupId) {
  const group = categoryGroups.find((item) => item.id === groupId);
  if (!group) {
    return products;
  }
  return products.filter((product) => group.categoryIds.includes(product.category));
}

function sortProducts(items) {
  const sorted = items.slice();
  if (state.sortMode === "price-asc") {
    return sorted.sort((a, b) => priceFor(a, 1) - priceFor(b, 1));
  }
  if (state.sortMode === "price-desc") {
    return sorted.sort((a, b) => priceFor(b, 1) - priceFor(a, 1));
  }
  if (state.sortMode === "name") {
    return sorted.sort((a, b) => a.displayName.localeCompare(b.displayName, "es"));
  }
  return sorted.sort((a, b) => a.order - b.order || a.displayName.localeCompare(b.displayName, "es"));
}

function visibleProducts() {
  const query = state.searchQuery.trim().toLowerCase();
  const queryTokens = query.split(/\s+/).filter(Boolean);
  const source = state.activeGroup ? getProductsForGroup(state.activeGroup) : products;
  const filtered = source.filter((product) => {
    const matchesCategory = state.activeCategory === "Todos" || product.category === state.activeCategory;
    const searchText = [
      product.name,
      product.displayName,
      product.model,
      product.quality?.label,
      product.quality?.spec,
      product.description,
      product.category,
      categorySearchAliases[product.category]
    ].map((value) => String(value || "").toLowerCase()).join(" ");
    const matchesSearch = !queryTokens.length || queryTokens.every((token) => searchText.includes(token));
    return matchesCategory && matchesSearch;
  });
  return sortProducts(filtered);
}

function countForCategoryIds(categoryIds) {
  return products.filter((product) => categoryIds.includes(product.category)).length;
}

function categoryCardsHtml() {
  return categoryGroups.map((group) => {
    const active = state.activeGroup === group.id ? " is-active" : "";
    return `
      <a class="category-card${active}" href="${group.url}" data-group-link="${group.id}" aria-label="Ver ${group.title}">
        ${iconSvg(group.icon)}
        <span>
          <strong>${group.title}</strong>
          <span>${countForCategoryIds(group.categoryIds)} productos</span>
        </span>
      </a>
    `;
  }).join("");
}

function categoryOptionsHtml() {
  return categories
    .filter((category) => category.id !== "Todos")
    .map((category) => `<option value="${category.id}"${state.activeCategory === category.id ? " selected" : ""}>${category.label}</option>`)
    .join("");
}

function renderHome() {
  state.route = { name: "home" };
  state.activeCategory = "Todos";
  state.activeGroup = "";
  const heroProduct = products.find((product) => product.id === "x200t-cortadora-micas") || products.find((product) => product.image) || {};
  const featuredProducts = [
    ...products.filter((product) => product.category === "Máquinas de Mica").slice(0, 1),
    ...products.filter((product) => product.category.includes("Pantallas")).slice(0, 5),
    ...products.filter((product) => product.category === "Fundas").slice(0, 2),
    ...products.filter((product) => product.category === "Gafas AI" || product.category === "Cámaras Inteligentes").slice(0, 2)
  ];
  const uniqueFeatured = Array.from(new Map(featuredProducts.map((product) => [product.id, product])).values()).slice(0, 10);

  viewRootEl.innerHTML = `
    <div class="page-stack">
      <section class="hero-banner">
        <div class="hero-copy">
          <h1>Pantallas y refacciones profesionales</h1>
          <p>Calidad premium para técnicos y negocios que exigen lo mejor.</p>
          <div class="hero-actions">
            <a class="primary-button" href="#catalogo">Ver productos</a>
            <a class="secondary-button" href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hola HAODE, quiero información de productos.")}" target="_blank" rel="noopener noreferrer">Pedir por WhatsApp</a>
          </div>
        </div>
        <div class="hero-media">
          <img src="${heroProduct.image || "/haode-web/assets/products/iphone-oled/main.jpg"}" alt="${escapeAttr(heroProduct.name || "Producto HAODE")}" loading="eager" decoding="async" />
        </div>
      </section>

      <section class="section-block" id="categorias">
        <div class="section-head">
          <div>
            <h2>Categorías</h2>
            <p>Entrada rápida al catálogo real de HAODE.</p>
          </div>
        </div>
        <div class="category-rail" data-category-rail>${categoryCardsHtml()}</div>
      </section>

      <section class="section-block" id="catalogo">
        <div class="section-head">
          <div>
            <h2>Productos destacados</h2>
            <p>Selección con datos reales de productos activos.</p>
          </div>
          <a class="text-button" href="#lista">Ver catálogo</a>
        </div>
        <div class="product-rail">
          ${uniqueFeatured.map((product) => productCardHtml(product, true)).join("")}
        </div>
      </section>

      ${premiumSelectionHtml()}

      <section class="trust-bar" aria-label="Confianza HAODE">
        ${benefitHtml("Stock en México", "grid")}
        ${benefitHtml("WhatsApp", "whatsapp")}
        ${benefitHtml("Calidad HAODE", "shield")}
        ${benefitHtml("Envío rápido", "truck")}
      </section>

      ${seoLinksHtml()}
    </div>
  `;
  updateNavigation();
}

function benefitHtml(title, icon) {
  return `
    <article class="trust-pill">
      ${iconSvg(icon)}
      <strong>${title}</strong>
    </article>
  `;
}

function premiumSelectionHtml() {
  const premiumItems = [
    {
      label: "Samsung TIPO ORIGINAL",
      product: products.find((product) => product.category === "Pantallas Samsung Original" && product.image)
    },
    {
      label: "iPhone OLED",
      product: products.find((product) => product.category === "Pantallas iPhone OLED" && product.image)
    },
    {
      label: "HAODE X200T",
      product: products.find((product) => product.id === "x200t-cortadora-micas")
    }
  ].filter((item) => item.product);

  if (!premiumItems.length) {
    return "";
  }

  return `
    <section class="premium-showcase" aria-labelledby="premium-showcase-title">
      <div class="premium-showcase-copy">
        <h2 id="premium-showcase-title">Selección premium HAODE</h2>
        <p>Refacciones seleccionadas, stock en México y pedidos rápidos por WhatsApp.</p>
      </div>
      <div class="premium-showcase-grid">
        ${premiumItems.slice(0, 3).map((item) => `
          <a class="premium-tile" href="${appProductUrl(item.product)}" aria-label="Ver ${escapeAttr(item.product.displayName)}">
            <span>${item.label}</span>
            <strong>${item.product.displayName}</strong>
            <img src="${item.product.image}" alt="${escapeAttr(item.product.name)}" loading="lazy" decoding="async" onerror="this.src='${PLACEHOLDER_IMAGE}'" />
          </a>
        `).join("")}
      </div>
    </section>
  `;
}

function renderList({ group = "", category = "Todos" } = {}) {
  state.route = { name: group ? "group" : "list", group, category };
  state.activeGroup = group;
  state.activeCategory = category || "Todos";
  const title = group
    ? categoryGroups.find((item) => item.id === group)?.title || "Categorías"
    : category === "Todos"
      ? "Productos"
      : categories.find((item) => item.id === category)?.label || category;
  const productsToShow = visibleProducts();
  if (window.HAODE_DIAGNOSTICS) {
    window.HAODE_DIAGNOSTICS.productosVisibles = productsToShow.length;
  }

  viewRootEl.innerHTML = `
    <div class="page-stack">
      <section class="list-title">
        <a class="back-link" href="#inicio">Volver al inicio</a>
        <div>
          <h1>${title}</h1>
          <p>${productsToShow.length} productos activos. Menudeo, Mayoreo y Precio APP cuando aplica.</p>
        </div>
      </section>

      <section class="section-block">
        <div class="category-rail" data-category-rail>${categoryCardsHtml()}</div>
      </section>

      <section class="toolbar" aria-label="Filtros de productos">
        <label class="search-box">
          <span>Buscar</span>
          <input type="search" data-search-products placeholder="iPhone 13, S23 Ultra, X200T..." value="${escapeAttr(state.searchQuery)}" autocomplete="off" />
        </label>
        <div class="filter-row">
          <select class="select-box" data-category-select aria-label="Filtrar por categoría">
            <option value="Todos"${state.activeCategory === "Todos" ? " selected" : ""}>Todas las categorías</option>
            ${categoryOptionsHtml()}
          </select>
          <select class="select-box" data-sort-select aria-label="Ordenar productos">
            <option value="featured"${state.sortMode === "featured" ? " selected" : ""}>Destacados</option>
            <option value="name"${state.sortMode === "name" ? " selected" : ""}>Nombre</option>
            <option value="price-asc"${state.sortMode === "price-asc" ? " selected" : ""}>Precio menor</option>
            <option value="price-desc"${state.sortMode === "price-desc" ? " selected" : ""}>Precio mayor</option>
          </select>
        </div>
      </section>

      <section class="section-block">
        <div class="product-grid" data-product-grid>
          ${productsToShow.length ? productsToShow.map(productCardHtml).join("") : emptyStateHtml("Sin resultados", "No encontramos productos activos con estos filtros.")}
        </div>
      </section>
    </div>
  `;
  updateNavigation();
}

function emptyStateHtml(title, copy) {
  return `<div class="empty-state"><strong>${title}</strong><span>${copy}</span></div>`;
}

function galleryImagesFor(product) {
  const images = [product.image];
  if (product.id === "x200t-cortadora-micas") {
    images.push("/haode-web/assets/products/home-cut-machine/x200t.jpg");
  }
  return Array.from(new Set(images.filter(Boolean)));
}

function isX200T(product) {
  return product?.id === "x200t-cortadora-micas";
}

function renderProductDetail(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product) {
    renderList();
    return;
  }
  state.route = { name: "product", productId };
  state.selectedGalleryIndex = Math.min(state.selectedGalleryIndex, galleryImagesFor(product).length - 1);
  const gallery = galleryImagesFor(product);
  const uniqueFrames = gallery;
  const has360 = isX200T(product) && uniqueFrames.length >= 3;
  const related = products
    .filter((item) => item.id !== product.id && item.category === product.category)
    .slice(0, 4);
  const officialUrl = productDetailUrl(product);
  const flagshipClass = isX200T(product) ? " is-flagship" : "";

  viewRootEl.innerHTML = `
    <div class="page-stack">
      <a class="back-link" href="#lista">Volver al catálogo</a>
      <section class="detail-layout${flagshipClass}">
        <div class="gallery-shell" data-product-gallery>
          ${has360 ? product360Html(product, uniqueFrames) : productGalleryHtml(product, gallery)}
        </div>

        <article class="detail-panel">
          <div class="detail-copy">
            <span class="stock-badge stock-${product.stock.replace(" ", "-")}">${product.stock}</span>
            <h1>${product.displayName}</h1>
            <p>${product.description || "Producto HAODE para técnicos, tiendas y mayoreo. Confirma detalles por WhatsApp."}</p>
          </div>
          ${priceStackHtml(product)}
          ${specGridHtml(product, has360, gallery.length)}
          <div class="detail-actions">
            ${officialUrl ? `<a class="outline-button" href="${officialUrl}">Página oficial</a>` : ""}
            <button class="text-button" type="button" data-share-product="${product.id}">Compartir</button>
          </div>
          <div class="sticky-actions">
            <button class="add-button" type="button" data-add-product="${product.id}">Agregar</button>
            <a class="whatsapp-outline" href="${singleProductWhatsappUrl(product)}" target="_blank" rel="noopener noreferrer">WhatsApp</a>
          </div>
        </article>
      </section>

      <section class="section-block">
        <div class="section-head">
          <div>
            <h2>Relacionados</h2>
            <p>Más productos de la misma categoría.</p>
          </div>
        </div>
        <div class="related-grid">
          ${related.length ? related.map(productCardHtml).join("") : emptyStateHtml("Sin relacionados", "No hay más productos activos en esta categoría.")}
        </div>
      </section>
    </div>
  `;
  updateNavigation();
}

function productGalleryHtml(product, images) {
  const selected = images[state.selectedGalleryIndex] || images[0] || PLACEHOLDER_IMAGE;
  return `
    <div class="gallery-stage">
      <img src="${selected}" alt="${escapeAttr(product.name)}" loading="eager" decoding="async" onerror="this.src='${product.image || PLACEHOLDER_IMAGE}'" />
    </div>
    ${thumbStripHtml(images, state.selectedGalleryIndex)}
  `;
}

function product360Html(product, frames) {
  const frame = frames[state.viewerIndex] || frames[0] || product.image;
  return `
    <div class="viewer-stage" data-viewer-stage tabindex="0" role="group" aria-label="Vista 360 de ${escapeAttr(product.name)}">
      <span class="viewer-badge">360°</span>
      <img src="${frame}" alt="${escapeAttr(product.name)} vista 360" data-viewer-image loading="eager" decoding="async" onerror="this.src='${product.image}'" />
      <span class="viewer-help">Desliza para ver 360°</span>
      <div class="viewer-controls">
        <button type="button" data-viewer-prev aria-label="Vista anterior">‹</button>
        <button type="button" data-viewer-next aria-label="Vista siguiente">›</button>
      </div>
    </div>
    ${thumbStripHtml(frames, state.viewerIndex, true)}
  `;
}

function thumbStripHtml(images, selectedIndex, viewer = false) {
  return `
    <div class="thumb-strip" aria-label="Miniaturas del producto">
      ${images.map((image, index) => `
        <button class="${index === selectedIndex ? "is-active" : ""}" type="button" ${viewer ? `data-viewer-frame="${index}"` : `data-gallery-image="${index}"`} aria-label="Ver imagen ${index + 1}">
          <img src="${image}" alt="" loading="lazy" decoding="async" />
        </button>
      `).join("")}
    </div>
  `;
}

function priceStackHtml(product) {
  const promo = promoPriceFor(product);
  if (promo) {
    return `
      <div class="price-stack">
        <span>Precio Mostrador <strong>${formatPrice(promo.publicPrice)}</strong></span>
        <span>Precio APP Junio <strong>${formatPrice(promo.appPrice)}</strong></span>
        <span>Ahorro <strong>${formatPrice(promo.savings)}</strong></span>
      </div>
    `;
  }
  return `
    <div class="price-stack">
      <span>Precio menudeo <strong>${formatPrice(product.publicPrice)}</strong></span>
      <span>Precio mayoreo <strong>${formatPrice(product.wholesalePrice)}</strong></span>
      ${product.priceTiers.map((tier) => {
        const range = tier.maxQty ? `${tier.minQty}-${tier.maxQty} pzs` : `${tier.minQty}+ pzs`;
        return `<span>${range} <strong>${formatPrice(tier.price)}</strong></span>`;
      }).join("")}
    </div>
  `;
}

function specGridHtml(product, has360, imageCount) {
  const specs = [
    ["Categoría", product.category],
    ["Modelo", product.model],
    ["Estado", product.stock],
    ["Pedido", "WhatsApp"],
    ["Vista", has360 ? "360°" : `${imageCount} imagen${imageCount === 1 ? "" : "es"}`],
    ["Calidad", product.quality?.spec || "HAODE profesional"]
  ];
  return `
    <div class="spec-grid">
      ${specs.map(([label, value]) => `
        <article>
          <span>${label}</span>
          <strong>${value}</strong>
        </article>
      `).join("")}
    </div>
  `;
}

function renderCartPage() {
  state.route = { name: "cart" };
  const items = getCartItems();
  const itemsMarkup = items.map((item) => {
    const priceRule = priceRuleFor(item.product, item.quantity);
    const subtotal = priceRule.unitPrice * item.quantity;
    return `
      <article class="cart-item">
        <img src="${item.product.image}" alt="${escapeAttr(item.product.name)}" loading="lazy" decoding="async" onerror="this.src='${PLACEHOLDER_IMAGE}'" />
        <div>
          <h3>${item.product.displayName}</h3>
          <p>${item.product.model}</p>
          <div class="cart-row">
            <div class="qty-control" aria-label="Cantidad de ${escapeAttr(item.product.name)}">
              <button type="button" data-decrease="${item.product.id}" aria-label="Reducir cantidad">-</button>
              <span>${item.quantity}</span>
              <button type="button" data-increase="${item.product.id}" aria-label="Aumentar cantidad">+</button>
            </div>
            <strong>${formatPrice(subtotal)}</strong>
          </div>
          <p>Precio aplicado: ${priceRule.label} · ${formatPrice(priceRule.unitPrice)} c/u</p>
          <div class="cart-row">
            <button class="remove-button" type="button" data-remove="${item.product.id}">Eliminar</button>
          </div>
        </div>
      </article>
    `;
  }).join("");
  viewRootEl.innerHTML = `
    <div class="page-stack">
      <section class="list-title">
        <a class="back-link" href="#lista">Continuar comprando</a>
        <div>
          <h1>Carrito</h1>
          <p>${items.length ? `${cartCount()} piezas listas para enviar por WhatsApp.` : "Tu carrito está vacío."}</p>
        </div>
      </section>
      <section class="cart-page-card">
        ${items.length ? `
          <div class="cart-items-page">${itemsMarkup}</div>
          <div class="cart-total">
            <span>Total estimado</span>
            <strong>${formatPrice(cartTotal())}</strong>
          </div>
          <div class="section-actions">
            <a class="text-button" href="#lista">Continuar comprando</a>
            <button class="primary-button" type="button" data-open-cart>Enviar por WhatsApp</button>
          </div>
        ` : emptyStateHtml("Carrito vacío", "Agrega productos para preparar tu pedido HAODE.")}
      </section>
    </div>
  `;
  updateNavigation();
}

function renderContact() {
  state.route = { name: "contact" };
  viewRootEl.innerHTML = `
    <div class="page-stack">
      <section class="contact-card">
        <h1>Contacto HAODE</h1>
        <p>Envía tu pedido o consulta por WhatsApp. El equipo HAODE confirma disponibilidad, precio final y envío.</p>
        <a class="whatsapp-button" href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hola HAODE, quiero información de productos.")}" target="_blank" rel="noopener noreferrer">Abrir WhatsApp</a>
      </section>
    </div>
  `;
  updateNavigation();
}

function seoLinksHtml() {
  const chips = [
    { label: "iPhone INCELL", href: "/haode-web/categoria/iphone-incell/", code: "IN" },
    { label: "iPhone OLED", href: "/haode-web/categoria/iphone-oled/", code: "OLED" },
    { label: "Samsung INCELL", href: "/haode-web/categoria/samsung-incell/", code: "SI" },
    { label: "Samsung OLED", href: "/haode-web/categoria/samsung-oled/", code: "SO" },
    { label: "Samsung TIPO ORIGINAL", href: "/haode-web/categoria/samsung-tipo-original/", code: "TO" },
    { label: "Micas", href: "/haode-web/categoria/micas/", code: "MI" },
    { label: "Productos AI", href: "/haode-web/categoria/productos-ai/", code: "AI" },
    { label: "Fundas", href: "/haode-web/categoria/fundas/", code: "FU" }
  ];

  return `
    <section class="app-explore-section" aria-label="Explorar categorías HAODE">
      <div>
        <h2>Explora por categoría</h2>
        <p>Catálogo profesional para técnicos y mayoristas en México.</p>
      </div>
      <div class="premium-chip-rail">
        ${chips.map((chip, index) => `
          <a class="premium-chip${index === 0 ? " is-featured" : ""}" href="${chip.href}">
            <span>${chip.code}</span>
            <strong>${chip.label}</strong>
          </a>
        `).join("")}
      </div>
    </section>
  `;
}

function parseRoute() {
  const hash = decodeURIComponent(window.location.hash || "#inicio");
  if (hash.startsWith("#producto/")) {
    return { name: "product", productId: hash.replace("#producto/", "") };
  }
  if (hash.startsWith("#categoria/")) {
    return { name: "list", category: hash.replace("#categoria/", "") || "Todos" };
  }
  if (hash.startsWith("#grupo/")) {
    return { name: "group", group: hash.replace("#grupo/", "") };
  }
  if (hash === "#lista" || hash === "#catalogo" || hash === "#categorias") {
    return { name: "list", category: "Todos" };
  }
  if (hash === "#carrito") {
    return { name: "cart" };
  }
  if (hash === "#contacto") {
    return { name: "contact" };
  }
  return { name: "home" };
}

function renderRoute() {
  const route = parseRoute();
  state.selectedGalleryIndex = 0;
  state.viewerIndex = 0;
  if (route.name === "product") {
    renderProductDetail(route.productId);
  } else if (route.name === "group") {
    renderList({ group: route.group, category: "Todos" });
  } else if (route.name === "list") {
    renderList({ category: route.category || "Todos" });
  } else if (route.name === "cart") {
    renderCartPage();
  } else if (route.name === "contact") {
    renderContact();
  } else {
    renderHome();
  }
}

function updateNavigation() {
  const routeName = state.route.name;
  document.querySelectorAll("[data-nav]").forEach((item) => {
    const nav = item.dataset.nav;
    item.classList.toggle("is-active", (
      (nav === "home" && routeName === "home") ||
      (nav === "categories" && ["list", "group", "product"].includes(routeName)) ||
      (nav === "cart" && routeName === "cart") ||
      (nav === "contact" && routeName === "contact")
    ));
  });
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

function singleProductWhatsappUrl(product) {
  const lines = [
    "Hola HAODE, quiero información de este producto:",
    "",
    `${product.name}`,
    `Modelo: ${product.model}`,
    `Precio menudeo: ${formatPrice(product.publicPrice)}`,
    `Precio mayoreo: ${formatPrice(product.wholesalePrice)}`,
    "",
    "Por favor confirma disponibilidad, compatibilidad y precio final."
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
    cartItemsEl.innerHTML = emptyStateHtml("Tu carrito está vacío", "Agrega productos para enviar el pedido por WhatsApp.");
    cartTotalEl.textContent = formatPrice(0);
    whatsappLinkEl.href = "#";
    whatsappLinkEl.classList.add("disabled");
    return;
  }

  cartItemsEl.innerHTML = items.map((item) => {
    const priceRule = priceRuleFor(item.product, item.quantity);
    const subtotal = priceRule.unitPrice * item.quantity;
    return `
      <article class="cart-item">
        <img src="${item.product.image}" alt="${escapeAttr(item.product.name)}" loading="lazy" decoding="async" onerror="this.src='${PLACEHOLDER_IMAGE}'" />
        <div>
          <h3>${item.product.displayName}</h3>
          <p>${item.product.model}</p>
          <div class="cart-row">
            <div class="qty-control" aria-label="Cantidad de ${escapeAttr(item.product.name)}">
              <button type="button" data-decrease="${item.product.id}" aria-label="Reducir cantidad">-</button>
              <span>${item.quantity}</span>
              <button type="button" data-increase="${item.product.id}" aria-label="Aumentar cantidad">+</button>
            </div>
            <strong>${formatPrice(subtotal)}</strong>
          </div>
          <p>Precio aplicado: ${priceRule.label} · ${formatPrice(priceRule.unitPrice)} c/u</p>
          <div class="cart-row">
            <button class="remove-button" type="button" data-remove="${item.product.id}">Eliminar</button>
          </div>
        </div>
      </article>
    `;
  }).join("");

  cartTotalEl.textContent = formatPrice(cartTotal());
  whatsappLinkEl.classList.toggle("disabled", !customerReady);
  whatsappLinkEl.href = customerReady ? buildWhatsappUrl() : "#";
}

function addProduct(productId) {
  state.cart.set(productId, (state.cart.get(productId) || 0) + 1);
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
  if (state.route.name === "cart") {
    renderCartPage();
  }
}

function removeProduct(productId) {
  state.cart.delete(productId);
  renderCart();
  if (state.route.name === "cart") {
    renderCartPage();
  }
}

function openCart() {
  cartDrawerEl.classList.add("open");
  cartDrawerEl.setAttribute("aria-hidden", "false");
  updateNavigation();
}

function closeCart() {
  cartDrawerEl.classList.remove("open");
  cartDrawerEl.setAttribute("aria-hidden", "true");
  updateNavigation();
}

function moveViewer(delta) {
  const product = products.find((item) => item.id === state.route.productId);
  if (!product) {
    return;
  }
  const frames = galleryImagesFor(product);
  state.viewerIndex = (state.viewerIndex + delta + frames.length) % frames.length;
  renderProductDetail(product.id);
}

function preloadAdjacentFrame(product) {
  const frames = galleryImagesFor(product);
  [state.viewerIndex - 1, state.viewerIndex + 1].forEach((rawIndex) => {
    const index = (rawIndex + frames.length) % frames.length;
    const image = new Image();
    image.src = frames[index];
  });
}

function handleDocumentClick(event) {
  const groupLink = event.target.closest("[data-group-link]");
  const addButton = event.target.closest("[data-add-product]");
  const increaseButton = event.target.closest("[data-increase]");
  const decreaseButton = event.target.closest("[data-decrease]");
  const removeButton = event.target.closest("[data-remove]");
  const openCartButton = event.target.closest("[data-open-cart]");
  const closeCartButton = event.target.closest("[data-close-cart]");
  const galleryButton = event.target.closest("[data-gallery-image]");
  const viewerFrameButton = event.target.closest("[data-viewer-frame]");
  const viewerPrevButton = event.target.closest("[data-viewer-prev]");
  const viewerNextButton = event.target.closest("[data-viewer-next]");
  const focusSearchButton = event.target.closest("[data-focus-search]");
  const shareProductButton = event.target.closest("[data-share-product]");

  if (groupLink) {
    event.preventDefault();
    window.location.hash = groupRouteUrl(groupLink.dataset.groupLink);
  }
  if (addButton) {
    addProduct(addButton.dataset.addProduct);
    openCart();
  }
  if (increaseButton) {
    changeQuantity(increaseButton.dataset.increase, 1);
  }
  if (decreaseButton) {
    changeQuantity(decreaseButton.dataset.decrease, -1);
  }
  if (removeButton) {
    removeProduct(removeButton.dataset.remove);
  }
  if (openCartButton) {
    openCart();
  }
  if (closeCartButton || event.target === cartDrawerEl) {
    closeCart();
  }
  if (galleryButton) {
    state.selectedGalleryIndex = Number(galleryButton.dataset.galleryImage) || 0;
    renderProductDetail(state.route.productId);
  }
  if (viewerFrameButton) {
    state.viewerIndex = Number(viewerFrameButton.dataset.viewerFrame) || 0;
    renderProductDetail(state.route.productId);
  }
  if (viewerPrevButton) {
    moveViewer(-1);
  }
  if (viewerNextButton) {
    moveViewer(1);
  }
  if (focusSearchButton) {
    if (state.route.name !== "list") {
      window.location.hash = "#lista";
      window.setTimeout(() => document.querySelector("[data-search-products]")?.focus(), 50);
    } else {
      document.querySelector("[data-search-products]")?.focus();
    }
  }
  if (shareProductButton) {
    const product = products.find((item) => item.id === shareProductButton.dataset.shareProduct);
    if (product && navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description || product.name,
        url: `${window.location.origin}${window.location.pathname}${appProductUrl(product)}`
      }).catch(() => {});
    }
  }
}

function handleDocumentInput(event) {
  const searchInput = event.target.closest("[data-search-products]");
  if (searchInput) {
    state.searchQuery = searchInput.value;
    renderList({ group: state.activeGroup, category: state.activeCategory });
    document.querySelector("[data-search-products]")?.focus();
  }
}

function handleDocumentChange(event) {
  const categorySelect = event.target.closest("[data-category-select]");
  const sortSelect = event.target.closest("[data-sort-select]");
  if (categorySelect) {
    window.location.hash = categorySelect.value === "Todos" ? "#lista" : categoryRouteUrl(categorySelect.value);
  }
  if (sortSelect) {
    state.sortMode = sortSelect.value;
    renderList({ group: state.activeGroup, category: state.activeCategory });
  }
}

function setupViewerGestures() {
  document.addEventListener("pointerdown", (event) => {
    const stage = event.target.closest("[data-viewer-stage]");
    if (!stage) {
      return;
    }
    state.viewerStartX = event.clientX;
    stage.setPointerCapture?.(event.pointerId);
  });

  document.addEventListener("pointerup", (event) => {
    const stage = event.target.closest("[data-viewer-stage]");
    if (!stage || !state.viewerStartX) {
      return;
    }
    const delta = event.clientX - state.viewerStartX;
    state.viewerStartX = 0;
    if (Math.abs(delta) > 28) {
      moveViewer(delta < 0 ? 1 : -1);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!event.target.closest("[data-viewer-stage]")) {
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveViewer(-1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      moveViewer(1);
    }
  });
}

function setupFormListeners() {
  checkoutInputs.forEach((element) => {
    element.addEventListener("input", renderCart);
  });
}

async function init() {
  detectWebView();
  setupPwaInstallPrompt();
  registerServiceWorker();
  setupFormListeners();
  setupViewerGestures();
  document.addEventListener("click", handleDocumentClick);
  document.addEventListener("input", handleDocumentInput);
  document.addEventListener("change", handleDocumentChange);
  window.addEventListener("hashchange", renderRoute);

  try {
    await loadProducts();
    await loadPromoPrices();
    renderRoute();
    renderCart();
  } catch (error) {
    console.error("No se pudo iniciar HAODE app:", error);
    networkStateEl.hidden = false;
    viewRootEl.innerHTML = emptyStateHtml("No se pudieron cargar los productos", "Intenta de nuevo o consulta por WhatsApp.");
  }

  const x200t = products.find((product) => product.id === "x200t-cortadora-micas");
  if (x200t) {
    preloadAdjacentFrame(x200t);
  }
}

init();
