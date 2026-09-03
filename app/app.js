import { firebaseConfig, isFirebaseConfigured } from "./firebase-config.js";

const WHATSAPP_NUMBER = "523326684296";
const APP_BASE_PATH = (() => {
  const marker = "/app/";
  const index = window.location.pathname.indexOf(marker);
  return index > 0 ? window.location.pathname.slice(0, index) : "";
})();
const sitePath = (path) => `${APP_BASE_PATH}${path}`;
const PRODUCTS_JSON_URL = sitePath("/app/products.json");
const ERP_PUBLIC_CATALOG_URL = "https://erp.haode.com.mx/api/public/catalog";
const ERP_PUBLIC_STOCK_URL = "https://erp.haode.com.mx/public-stock.json";
const ERP_WEB_ORDER_URL = "https://erp.haode.com.mx/api/public/web-orders";
const DAILY_AD_URL = sitePath("/data/marketing/daily-ad-latest.json");
const SERVICE_WORKER_URL = sitePath("/service-worker.js");
const SERVICE_WORKER_SCOPE = `${APP_BASE_PATH || ""}/`;
const PLACEHOLDER_IMAGE = sitePath("/assets/products/placeholder.svg");
const OPTIMIZED_CARD_IMAGE_BY_PATH = {
  "/assets/logo/logo.png": sitePath("/assets/logo/logo-display.webp"),
  "/assets/products/iphone-oled/main.jpg": sitePath("/assets/products/iphone-oled/main-card.webp"),
  "/assets/img/home-hero-iphone-collage.png": sitePath("/assets/img/home-hero-iphone-collage-card.webp"),
  "/assets/promotions/iphone-11-pro-fhd/factory-promo.png": sitePath("/assets/promotions/iphone-11-pro-fhd/factory-promo-card.webp"),
  "/assets/promotions/iphone-14-fhd/factory-promo.png": sitePath("/assets/promotions/iphone-14-fhd/factory-promo-card.webp"),
  "/assets/products/iphone-incell/main.jpg": sitePath("/assets/products/iphone-incell/main-card.webp"),
  "/assets/products/samsung-incell/main.jpg": sitePath("/assets/products/samsung-incell/main-card.webp"),
  "/assets/products/iphone-incell/xr/main.jpg": sitePath("/assets/products/iphone-incell/xr/main-card.webp"),
  "/assets/products/iphone-oled/11promax/main.jpg": sitePath("/assets/products/iphone-oled/11promax/main-card.webp"),
  "/assets/products/iphone-oled/12-12pro/main.jpg": sitePath("/assets/products/iphone-oled/12-12pro/main-card.webp"),
  "/assets/products/iphone-oled/12promax/main.jpg": sitePath("/assets/products/iphone-oled/12promax/main-card.webp"),
  "/assets/products/iphone-oled/13/main.jpg": sitePath("/assets/products/iphone-oled/13/main-card.webp"),
  "/assets/products/iphone-oled/13pro/main.jpg": sitePath("/assets/products/iphone-oled/13pro/main-card.webp"),
  "/assets/products/iphone-incell/11-bolsa-protectora/main.jpg": sitePath("/assets/products/iphone-incell/11-bolsa-protectora/main-card.webp"),
  "/assets/products/iphone-incell/xr-bolsa-protectora/main.jpg": sitePath("/assets/products/iphone-incell/xr-bolsa-protectora/main-card.webp"),
  "/assets/products/samsung-original/z-flip5/main.png": sitePath("/assets/products/samsung-original/z-flip5/main-card.webp"),
  "/assets/products/samsung-incell/s24/main.png": sitePath("/assets/products/samsung-incell/s24/main-thumb.webp"),
  "/assets/products/micas/hd/main.png": sitePath("/assets/products/micas/hd/main-thumb.webp")
};
const OPTIMIZED_DETAIL_IMAGE_BY_PATH = {
  ...OPTIMIZED_CARD_IMAGE_BY_PATH,
  "/assets/products/micas/hd/main.png": sitePath("/assets/products/micas/hd/main-hero.webp")
};
const EXTERNAL_CATALOG_TIMEOUT_MS = 3000;
const EXTERNAL_DIAGNOSTICS_TIMEOUT_MS = 3000;
const ERP_LOCAL_PRODUCT_ID_BY_SKU = {
  "AI-GAFAS-G3": "haode-ai-g3-smart-glasses",
  "MICA-X200T": "x200t-cortadora-micas"
};

let deferredInstallPrompt = null;
let products = [];

const categories = [
  { id: "Todos", label: "Todos", shortLabel: "Todo", group: "Todo", url: "/app/#inicio", icon: "grid" },
  { id: "Pantallas iPhone OLED", label: "iPhone OLED", shortLabel: "Pantallas", group: "Pantallas", url: "/categoria/iphone-oled/", icon: "screen" },
  { id: "Pantallas iPhone INCELL", label: "iPhone INCELL", shortLabel: "Pantallas", group: "Pantallas", url: "/categoria/iphone-incell/", icon: "screen" },
  { id: "Pantallas OLED Diagnóstica", label: "OLED Diagnóstica", shortLabel: "Pantallas", group: "Pantallas", url: "/categoria/oled-diagnostica/", icon: "screen" },
  { id: "Pantallas Samsung OLED", label: "Samsung AMOLED", shortLabel: "Pantallas", group: "Pantallas", url: "/categoria/samsung-oled/", icon: "screen" },
  { id: "Pantallas Samsung INCELL", label: "Samsung INCELL", shortLabel: "Pantallas", group: "Pantallas", url: "/categoria/samsung-incell/", icon: "screen" },
  { id: "Pantallas Samsung Original", label: "Samsung TIPO ORIGINAL", shortLabel: "Pantallas", group: "Pantallas", url: "/categoria/samsung-tipo-original/", icon: "screen" },
  { id: "Celulares Samsung", label: "Celulares Samsung", shortLabel: "Celulares", group: "Celulares", url: "/categoria/celulares-samsung/", icon: "phone" },
  { id: "Micas", label: "Micas", shortLabel: "Micas", group: "Micas", url: "/categoria/micas/", icon: "layers" },
  { id: "Máquinas de Mica", label: "Máquinas de Mica", shortLabel: "Micas", group: "Micas", url: "/categoria/maquinas-de-hidrogel/", icon: "machine" },
  { id: "Gafas AI", label: "Gafas AI", shortLabel: "AI", group: "AI", url: "/categoria/gafas-inteligentes-ai/", icon: "spark" },
  { id: "Cámaras Inteligentes", label: "Cámaras AI", shortLabel: "AI", group: "AI", url: "/categoria/camaras-inteligentes/", icon: "camera" },
  { id: "Fundas", label: "Fundas", shortLabel: "Fundas", group: "Fundas", url: "/categoria/fundas/", icon: "case" }
];

const categoryAliases = {
  fundas: "Fundas",
  "Fundas y Accesorios": "Fundas",
  "Pantallas Samsung AMOLED": "Pantallas Samsung OLED",
  "OLED Diagnóstica": "Pantallas OLED Diagnóstica"
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
    categoryIds: ["Pantallas iPhone OLED", "Pantallas iPhone INCELL", "Pantallas OLED Diagnóstica", "Pantallas Samsung OLED", "Pantallas Samsung INCELL", "Pantallas Samsung Original"],
    url: "/categoria/pantallas/",
    icon: "screen"
  },
  {
    id: "Micas",
    title: "Micas",
    description: "Micas y máquinas para corte profesional",
    categoryIds: ["Micas", "Máquinas de Mica"],
    url: "/categoria/micas/",
    icon: "layers"
  },
  {
    id: "Celulares",
    title: "Celulares",
    description: "Samsung de oferta con estado bajo confirmación",
    categoryIds: ["Celulares Samsung"],
    url: "/categoria/celulares-samsung/",
    icon: "phone"
  },
  {
    id: "AI",
    title: "AI",
    description: "Gafas, cámaras y accesorios inteligentes",
    categoryIds: ["Gafas AI", "Cámaras Inteligentes"],
    url: "/categoria/productos-ai/",
    icon: "spark"
  },
  {
    id: "Fundas",
    title: "Fundas",
    description: "Fundas para venta rápida y mayoreo",
    categoryIds: ["Fundas"],
    url: "/categoria/fundas/",
    icon: "case"
  },
  {
    id: "Accesorios",
    title: "Accesorios",
    description: "Refacciones y productos complementarios",
    categoryIds: ["Fundas", "Micas", "Gafas AI", "Cámaras Inteligentes"],
    url: "/categoria/",
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
  dailyAd: null,
  selectedGalleryIndex: 0,
  viewerIndex: 0,
  viewerStartX: 0,
  attribution: {},
  orderRequestId: "",
  orderSubmitting: false,
  lastTrackedProductViewId: "",
  diagnostics: {
    firestoreTotal: null,
    firestoreActive: null,
    normalizedTotal: 0,
    erpStockItems: 0,
    erpStockLoaded: false
  }
};

const money = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0
});

const viewRootEl = document.querySelector("[data-view-root]");
const networkStateEl = document.querySelector("[data-network-state]");
const appStatusEl = document.querySelector("[data-app-status]");
const cartDrawerEl = document.querySelector("[data-cart-drawer]");
const cartPanelEl = cartDrawerEl?.querySelector(".cart-panel");
const cartItemsEl = document.querySelector("[data-cart-items]");
const cartTotalEl = document.querySelector("[data-cart-total]");
const whatsappLinkEl = document.querySelector("[data-whatsapp-link]");
const customerNameEl = document.querySelector("[data-customer-name]");
const customerPhoneEl = document.querySelector("[data-customer-phone]");
const customerCityEl = document.querySelector("[data-customer-city]");
const customerCommentEl = document.querySelector("[data-customer-comment]");
const checkoutInputs = [customerNameEl, customerPhoneEl, customerCityEl, customerCommentEl].filter(Boolean);
const cartCountEls = document.querySelectorAll("[data-cart-count], [data-cart-count-bottom]");
let cartTriggerEl = null;

const CART_FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])'
].join(",");

function announceAppStatus(message) {
  if (appStatusEl) {
    appStatusEl.textContent = message;
  }
}

function updateSearchStatus(query, count) {
  const cleanQuery = String(query || "").trim();
  if (!cleanQuery) {
    announceAppStatus("");
    return;
  }
  announceAppStatus(count === 1
    ? `1 producto encontrado para "${cleanQuery}".`
    : `${count} productos encontrados para "${cleanQuery}".`);
}

function iconSvg(name) {
  const icons = {
    grid: '<path d="M5 5h6v6H5V5Zm8 0h6v6h-6V5ZM5 13h6v6H5v-6Zm8 0h6v6h-6v-6Z"/>',
    screen: '<path d="M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M10 18h4"/>',
    layers: '<path d="m12 3 8 4.5-8 4.5-8-4.5L12 3Z"/><path d="m4 12 8 4.5 8-4.5"/><path d="m4 16.5 8 4.5 8-4.5"/>',
    machine: '<path d="M5 5h14v9H5V5Z"/><path d="M8 18h8M9 14v4m6-4v4M9 9h6"/>',
    spark: '<path d="M12 3 9.8 9.8 3 12l6.8 2.2L12 21l2.2-6.8L21 12l-6.8-2.2L12 3Z"/>',
    camera: '<path d="M5 7h3l1.5-2h5L16 7h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z"/><path d="M12 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>',
    case: '<path d="M8 3h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M11 18h2"/>',
    phone: '<path d="M8 3h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M10 6h4M11 18h2"/>',
    truck: '<path d="M3 6h11v9H3V6Zm11 3h4l3 3v3h-7V9Z"/><path d="M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/>',
    whatsapp: '<path d="M20 11.5a8 8 0 0 1-11.9 7L4 20l1.4-4.2A8 8 0 1 1 20 11.5Z"/><path d="M9 8.8c.2 3 2.2 5 5.2 5.5l1-1.1"/>',
    shield: '<path d="M12 3 5 6v5c0 4.6 3 8 7 10 4-2 7-5.4 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-5"/>'
  };

  return `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name] || icons.grid}</svg>`;
}

function isStandaloneMode() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function appChannel() {
  return /HAODEAndroidApp/i.test(window.navigator.userAgent || "") || document.body.classList.contains("is-webview") ? "haode_app" : "haode_web";
}

function normalizeAttributionToken(value, fallback = "") {
  const raw = String(value || "").trim();
  const compactPhone = raw.replace(/[()+.\s-]/g, "");
  if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(raw) || /^\d{10,15}$/.test(compactPhone)) {
    return fallback;
  }
  const normalized = raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80);
  return normalized || fallback;
}

function trafficAttribution() {
  if (window.HaodeCampaign) {
    return window.HaodeCampaign.capture({ channel: appChannel() });
  }
  const params = new URLSearchParams(window.location.search);
  const canPersist = window.HaodePrivacy?.getConsent?.().analytics === true;
  let stored = {};
  try {
    if (canPersist) {
      stored = JSON.parse(window.sessionStorage.getItem("haode-attribution") || "{}");
    } else {
      window.sessionStorage.removeItem("haode-attribution");
    }
  } catch {
    stored = {};
  }
  const referrerHost = (() => {
    try {
      return document.referrer ? new URL(document.referrer).hostname : "";
    } catch {
      return "";
    }
  })();
  const detectedSource = /facebook|instagram/i.test(referrerHost)
    ? "facebook"
    : /tiktok/i.test(referrerHost)
      ? "tiktok"
      : /google/i.test(referrerHost)
        ? "google"
        : "";
  const attribution = {
    source: normalizeAttributionToken(params.get("utm_source") || params.get("source") || stored.source || detectedSource, appChannel()),
    medium: normalizeAttributionToken(params.get("utm_medium") || stored.medium, appChannel() === "haode_app" ? "app" : "website"),
    campaign: normalizeAttributionToken(params.get("utm_campaign") || stored.campaign),
    content: normalizeAttributionToken(params.get("utm_content") || stored.content),
    landingPage: stored.landingPage || window.location.pathname || "/"
  };
  if (canPersist) {
    try {
      window.sessionStorage.setItem("haode-attribution", JSON.stringify(attribution));
    } catch {
      // Attribution must never block the App in restricted storage contexts.
    }
  }
  return attribution;
}

function trackGrowthEvent(name, parameters = {}) {
  return window.HaodeAnalytics?.event?.(name, parameters) === true;
}

function ga4Item(product, quantity = 1) {
  return {
    item_id: product.sku || product.reference || product.id,
    item_name: product.name,
    item_brand: "HAODE",
    item_category: product.category || "",
    item_variant: product.model || "",
    price: Number(priceFor(product, quantity)) || 0,
    quantity
  };
}

function ga4CartItems() {
  return getCartItems().map(({ product, quantity }) => ga4Item(product, quantity));
}

function trackProductView(product) {
  if (!product || state.lastTrackedProductViewId === product.id) return false;
  const tracked = trackGrowthEvent("view_item", {
    currency: "MXN",
    value: Number(priceFor(product, 1)) || 0,
    items: [ga4Item(product, 1)]
  });
  if (tracked) state.lastTrackedProductViewId = product.id;
  return tracked;
}

function attributionReference(attribution = state.attribution) {
  if (window.HaodeCampaign?.reference) {
    return window.HaodeCampaign.reference(attribution) || appChannel();
  }
  return [attribution?.source, attribution?.campaign, attribution?.content].filter(Boolean).join("/") || appChannel();
}

function checkoutRequestId() {
  if (!state.orderRequestId) {
    state.orderRequestId = window.crypto?.randomUUID?.() || `web-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
  return state.orderRequestId;
}

function resetCheckoutRequest() {
  state.orderRequestId = "";
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
    navigator.serviceWorker.register(SERVICE_WORKER_URL, { scope: SERVICE_WORKER_SCOPE })
      .catch((error) => {
        console.info("HAODE PWA no pudo registrar service worker:", error.message);
      });
  });
}

function normalizeStock(stock) {
  const value = String(stock || "disponible").trim().toLowerCase();
  const map = {
    available: "disponible",
    disponible: "disponible",
    low_stock: "bajo inventario",
    "bajo inventario": "bajo inventario",
    "bajo pedido": "bajo inventario",
    out_of_stock: "agotado",
    agotado: "agotado",
    "agotado temporalmente": "agotado",
    ask_stock: "consultar inventario",
    "consultar inventario": "consultar inventario",
    "consultar disponibilidad": "consultar inventario"
  };
  return map[value] || "disponible";
}

function samsungQualityFor(category, model) {
  const text = `${category || ""} ${model || ""}`.toUpperCase();
  if (text.includes("OLED DIAGN")) {
    return { label: "OLED Diagnóstica", spec: "Calidad profesional HAODE" };
  }
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
      code: tier.code || "",
      minQty: Number(tier.minQty ?? tier.minQuantity ?? tier.min_quantity ?? tier.cantidadMinima ?? tier.min ?? 0),
      maxQty: tier.maxQty === null || tier.maxQty === undefined
        ? null
        : Number(tier.maxQty ?? tier.maxQuantity ?? tier.cantidadMaxima ?? tier.max),
      price: Number(tier.price ?? tier.precio ?? tier.unitPrice ?? tier.unit_price_mxn ?? tier.precioUnitario ?? 0),
      label: tier.label || tier.label_es || tier.nombre || "Precio por cantidad",
      scope: tier.scope || "single_product",
      autoApply: tier.autoApply !== false && (tier.scope || "single_product") !== "box_model"
    }))
    .filter((tier) => tier.code !== "RETAIL" && tier.minQty > 0 && tier.price > 0)
    .sort((a, b) => a.minQty - b.minQty);
}

function normalizeProduct(product) {
  const productDocId = String(product.docId || "").trim();
  const productId = String(product.id || "").trim();
  const rawCategory = product.categoria || product.category || categories[0].id;
  const category = categoryAliases[rawCategory] || rawCategory;
  const name = product.nombre || product.name || product.public_name_es || "Producto HAODE";
  const model = product.modelo || product.model || "Consultar modelo";
  const qualityText = product.calidad || product.quality || "";
  const quality = samsungQualityFor(category, `${model} ${qualityText}`) || (qualityText ? { label: qualityText, spec: qualityText } : null);
  const publicPrice = Number(product.precioPublico ?? product.publicPrice ?? product.public_price_mxn ?? 0);
  const officialSkuPending = product.officialSkuPending === true;
  const reference = product.sku || product.SKU || productId || productDocId;
  const image = product.imagen || product.image || product.image_url || PLACEHOLDER_IMAGE;

  return {
    id: productId || productDocId,
    sku: officialSkuPending ? "" : reference,
    reference,
    officialSkuPending,
    internalId: product.internalId === true,
    category,
    name,
    displayName: productDisplayName(name, category),
    model,
    quality,
    description: product.descripcion || product.description || product.description_es || "",
    publicPrice,
    wholesalePrice: Number(product.precioMayoreo ?? product.wholesalePrice ?? 0),
    priceTiers: normalizePriceTiers(product.priceTiers || product.public_price_tiers || product.quantityPricing || product.preciosPorCantidad),
    image,
    usesPlaceholder: String(image).includes("placeholder.svg"),
    stock: normalizeStock(product.stock || product.stock_status || product.stock_label),
    salesAvailable: product.sales_available !== false && publicPrice > 0,
    erpStockStatus: product.erpStockStatus || product.stock_status || "",
    erpStockLabel: product.erpStockLabel || product.stock_label || "",
    erpStockUpdatedAt: product.erpStockUpdatedAt || product.updated_at || "",
    erpCatalogSource: product.erpCatalogSource === true,
    priceSource: product.priceSource || "",
    active: product.activo !== false,
    order: Number(product.orden ?? product.order ?? 9999),
    specialOffer: product.specialOffer === true,
    localOnly: product.localOnly === true,
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

function stockKey(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function catalogQualityKey(value) {
  const text = String(typeof value === "object" ? value?.label || value?.spec || "" : value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  if (text.includes("diagn")) {
    if (text.includes("hard")) return "diagnostico-hard";
    if (text.includes("soft")) return "diagnostico-soft";
    return "diagnostico";
  }
  if (text.includes("incell")) return "incell";
  if (text.includes("original")) return "original";
  if (text.includes("hard") && text.includes("oled")) return "oled-hard";
  if (text.includes("soft") && text.includes("oled")) return "oled-soft";
  if (text.includes("premium") && (text.includes("oled") || text.includes("amoled"))) return "oled-premium";
  if (text.includes("amoled")) return "amoled";
  if (text.includes("oled")) return "oled";
  if (text.includes("lcd")) return "lcd";
  return "";
}

function catalogScreenFamily(product) {
  const text = `${product.category || product.categoria || ""} ${product.name || product.nombre || product.public_name_es || ""}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  if (!/(pantalla|display|incell|oled|amoled|diagnost|lcd)/.test(text)) return "";
  if (text.includes("iphone")) return "iphone";
  if (text.includes("samsung")) return "samsung";
  if (text.includes("motorola")) return "motorola";
  return "";
}

function catalogModelKey(product) {
  return String(product.model || product.modelo || product.public_name_es || product.name || product.nombre || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/pro max/g, "promax")
    .replace(/\+/g, "plus")
    .replace(/\b(pantalla|display|para|modelo|haode|apple|iphone|samsung|motorola)\b/g, " ")
    .replace(/\b(incell|fhd|oled|amoled|premium|diagnostico|diagnostica|hard|soft|tipo|original|con marco|lcd)\b/g, " ")
    .replace(/[^a-z0-9]+/g, "");
}

function catalogIdentityKey(product) {
  const family = catalogScreenFamily(product);
  const model = catalogModelKey(product);
  const explicitQuality = typeof product.quality === "object"
    ? `${product.quality?.label || ""} ${product.quality?.spec || ""}`
    : product.quality || product.calidad || "";
  const quality = catalogQualityKey(`${explicitQuality} ${product.model || product.modelo || ""} ${product.category || product.categoria || ""}`);
  return family && model && quality ? `${family}|${model}|${quality}` : "";
}

function hasAuthoritativeCustomerPrices(product) {
  const source = String(product?.priceSource || "");
  return source.includes("Lista_de_Precios_HAODE_2026_Clientesxlsx.xlsx")
    || source.includes("Lista_de_Precios_HAODE_20260721.pdf")
    || source.includes("HAODE_Lista_de_Precios_2026_Clientes_LIMPIA.xlsx");
}

function stockClassName(value) {
  return String(value || "consultar inventario")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "consultar-inventario";
}

function timeoutError(label, timeoutMs) {
  return new Error(`${label} tardó más de ${Math.round(timeoutMs / 1000)}s`);
}

function withTimeout(promise, timeoutMs, label) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = window.setTimeout(() => reject(timeoutError(label, timeoutMs)), timeoutMs);
  });
  return Promise.race([promise, timeout]).finally(() => window.clearTimeout(timeoutId));
}

async function fetchJsonWithTimeout(url, options = {}, timeoutMs = EXTERNAL_CATALOG_TIMEOUT_MS, label = "Solicitud") {
  const controller = typeof AbortController === "function" ? new AbortController() : null;
  const requestOptions = { ...options };
  let timeoutId;

  if (controller) {
    requestOptions.signal = controller.signal;
    timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
  }

  try {
    const response = await fetch(url, requestOptions);
    if (!response.ok) throw new Error(`${label} ${response.status}`);
    return response.json();
  } catch (error) {
    if (error.name === "AbortError") {
      throw timeoutError(label, timeoutMs);
    }
    throw error;
  } finally {
    if (timeoutId) window.clearTimeout(timeoutId);
  }
}

async function loadErpPublicStock() {
  try {
    const rows = await fetchJsonWithTimeout(
      `${ERP_PUBLIC_STOCK_URL}?v=${Date.now()}`,
      { cache: "no-store", mode: "cors" },
      EXTERNAL_CATALOG_TIMEOUT_MS,
      "ERP stock"
    );
    return Array.isArray(rows) ? rows : [];
  } catch (error) {
    console.info("HAODE app sin inventario ERP:", error.message);
    return [];
  }
}

function erpCategory(row) {
  const text = `${row.category || ""} ${row.quality || ""} ${row.public_name_es || ""}`.toUpperCase();
  if (text.includes("DIAGN")) return "Pantallas OLED Diagnóstica";
  if (text.includes("IPHONE") && text.includes("INCELL")) return "Pantallas iPhone INCELL";
  if (text.includes("IPHONE") && (text.includes("OLED") || text.includes("PANTALLA"))) return "Pantallas iPhone OLED";
  if (text.includes("SAMSUNG") && (text.includes("TIPO ORIGINAL") || text.includes("ORIGINAL"))) return "Pantallas Samsung Original";
  if (text.includes("SAMSUNG") && text.includes("INCELL")) return "Pantallas Samsung INCELL";
  if (text.includes("SAMSUNG") && (text.includes("OLED") || text.includes("AMOLED") || text.includes("PANTALLA"))) return "Pantallas Samsung OLED";
  if (text.includes("MICA")) return "Micas";
  if (text.includes("FUNDA")) return "Fundas";
  if (text.includes("GAFAS") || text.includes("LENTES") || text.includes("AI")) return "Gafas AI";
  if (text.includes("CAMARA")) return "Cámaras Inteligentes";
  return row.category || "Otros";
}

function erpCatalogProduct(row, order = 9999) {
  const retailTier = (row.public_price_tiers || []).find((tier) => tier.code === "RETAIL");
  const wholesaleTier = (row.public_price_tiers || []).find((tier) => tier.code === "WHOLESALE_5");
  return normalizeProduct({
    id: row.slug || String(row.sku || "").toLowerCase(),
    sku: row.sku,
    categoria: erpCategory(row),
    nombre: row.public_name_es,
    modelo: row.model,
    calidad: row.quality,
    descripcion: row.description_es,
    precioPublico: row.public_price_mxn ?? retailTier?.unit_price_mxn ?? 0,
    precioMayoreo: wholesaleTier?.unit_price_mxn ?? 0,
    priceTiers: row.public_price_tiers,
    imagen: safeImageSrc(row.image_url, PLACEHOLDER_IMAGE),
    stock: row.stock_status,
    sales_available: row.sales_available,
    activo: true,
    orden: order,
    erpStockLabel: row.stock_label,
    erpStockStatus: row.stock_status,
    erpStockUpdatedAt: row.updated_at,
    erpCatalogSource: true
  });
}

async function loadErpPublicCatalog() {
  try {
    const payload = await fetchJsonWithTimeout(
      `${ERP_PUBLIC_CATALOG_URL}?v=${Date.now()}`,
      { cache: "no-store", mode: "cors" },
      EXTERNAL_CATALOG_TIMEOUT_MS,
      "ERP catalog"
    );
    return Array.isArray(payload) ? payload : Array.isArray(payload.products) ? payload.products : [];
  } catch (error) {
    console.info("HAODE app usando catálogo local:", error.message);
    return [];
  }
}

function mergeErpCatalog(localProducts, catalogRows) {
  if (!catalogRows.length) return localProducts;
  const localCatalog = localProducts.map((product) => ({ ...product }));
  const result = [];
  const usedLocalIndexes = new Set();
  const bySku = new Map(localCatalog.map((product, index) => [stockKey(product.sku), index]).filter(([key]) => key));
  const byId = new Map(localCatalog.map((product, index) => [stockKey(product.id), index]).filter(([key]) => key));
  const byName = new Map(localCatalog.map((product, index) => [stockKey(product.name), index]).filter(([key]) => key));
  const identityCandidates = new Map();
  localCatalog.forEach((product, index) => {
    const key = catalogIdentityKey(product);
    if (!key) return;
    const matches = identityCandidates.get(key) || [];
    matches.push(index);
    identityCandidates.set(key, matches);
  });
  catalogRows.forEach((row) => {
    const identityMatches = identityCandidates.get(catalogIdentityKey(row)) || [];
    const identityIndex = identityMatches.length === 1 ? identityMatches[0] : undefined;
    const candidateIndex = bySku.get(stockKey(row.sku))
      ?? byId.get(stockKey(ERP_LOCAL_PRODUCT_ID_BY_SKU[row.sku]))
      ?? byName.get(stockKey(row.public_name_es))
      ?? identityIndex;
    const index = candidateIndex !== undefined && !usedLocalIndexes.has(candidateIndex) ? candidateIndex : undefined;
    // The approved local price list is the public allowlist; ERP may only enrich exact matches.
    if (index === undefined) return;
    const incoming = erpCatalogProduct(row, localCatalog[index].order);
    usedLocalIndexes.add(index);
    const current = localCatalog[index];
    const hasAuthoritativeLocalPrices = hasAuthoritativeCustomerPrices(current);
    const mergedTiers = hasAuthoritativeLocalPrices
      ? current.priceTiers
      : incoming.priceTiers;
    result.push({
      ...current,
      sku: incoming.sku || current.sku,
      name: incoming.name || current.name,
      displayName: incoming.displayName || current.displayName,
      model: incoming.model || current.model,
      quality: incoming.quality || current.quality,
      description: incoming.description || current.description,
      publicPrice: hasAuthoritativeLocalPrices ? current.publicPrice : incoming.publicPrice,
      wholesalePrice: hasAuthoritativeLocalPrices ? current.wholesalePrice : incoming.wholesalePrice,
      priceTiers: mergedTiers,
      priceSource: current.priceSource,
      image: safeImageSrc(row.image_url, current.image),
      stock: incoming.stock,
      salesAvailable: incoming.salesAvailable,
      erpStockStatus: row.stock_status || "",
      erpStockLabel: row.stock_label || "",
      erpStockUpdatedAt: row.updated_at || "",
      erpCatalogSource: true
    });
  });

  localCatalog.forEach((product, index) => {
    if (!usedLocalIndexes.has(index)) {
      result.push(product);
    }
  });

  return result.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, "es"));
}

function applyErpStock(localProducts, stockRows) {
  if (!stockRows.length) return localProducts;
  const bySku = new Map();
  const byName = new Map();
  stockRows.forEach((row) => {
    if (row.sku) bySku.set(stockKey(row.sku), row);
    if (row.public_name_es) byName.set(stockKey(row.public_name_es), row);
  });
  return localProducts.map((product) => {
    const match = bySku.get(stockKey(product.sku)) || bySku.get(stockKey(product.id)) || byName.get(stockKey(product.name)) || byName.get(stockKey(product.displayName));
    if (!match) return product;
    return {
      ...product,
      sku: match.sku || product.sku,
      stock: normalizeStock(match.stock_status || match.stock_label),
      erpStockStatus: match.stock_status || "",
      erpStockLabel: match.stock_label || "",
      erpStockUpdatedAt: match.updated_at || ""
    };
  });
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

function updateProductDiagnostics(source = "products.json") {
  window.HAODE_DIAGNOSTICS = {
    firestoreTotal: state.diagnostics.firestoreTotal,
    firestoreActivo: state.diagnostics.firestoreActive,
    productosActivos: state.diagnostics.normalizedTotal,
    productosVisibles: Math.max(products.length, 0),
    fuente: source,
    erpStockItems: state.diagnostics.erpStockItems
  };
}

async function refreshProductsFromExternal(normalizedProducts) {
  const erpCatalogRows = await loadErpPublicCatalog();
  const erpStockRows = erpCatalogRows.length ? [] : await loadErpPublicStock();
  if (erpCatalogRows.length || erpStockRows.length) {
    products = erpCatalogRows.length
      ? mergeErpCatalog(normalizedProducts, erpCatalogRows)
      : applyErpStock(normalizedProducts, erpStockRows);
  }

  state.diagnostics.normalizedTotal = products.length;
  state.diagnostics.erpStockItems = erpCatalogRows.length || erpStockRows.length;
  state.diagnostics.erpStockLoaded = state.diagnostics.erpStockItems > 0;

  updateProductDiagnostics(
    erpCatalogRows.length
      ? "erp public catalog 2.0 + products.json"
      : state.diagnostics.erpStockLoaded
        ? "products.json + erp public-stock.json"
        : "products.json"
  );
  return Boolean(erpCatalogRows.length || erpStockRows.length);
}

async function refreshFirestoreDiagnostics() {
  try {
    const [allProducts, activeFirestoreProducts] = await withTimeout(Promise.all([
      loadFirestoreProducts(false),
      loadFirestoreProducts(true)
    ]), EXTERNAL_DIAGNOSTICS_TIMEOUT_MS, "Firestore");
    state.diagnostics.firestoreTotal = allProducts.length;
    state.diagnostics.firestoreActive = activeFirestoreProducts.length;
  } catch (error) {
    console.info("HAODE app usando products.json:", error.message);
    state.diagnostics.firestoreTotal = null;
    state.diagnostics.firestoreActive = null;
  }
  updateProductDiagnostics(window.HAODE_DIAGNOSTICS?.fuente || "products.json");
}

async function loadProducts() {
  const localProducts = await loadLocalProducts();
  const normalizedProducts = activeProducts(localProducts);
  products = normalizedProducts;
  state.diagnostics.normalizedTotal = products.length;
  state.diagnostics.erpStockItems = 0;
  state.diagnostics.erpStockLoaded = false;
  updateProductDiagnostics("products.json");
  return normalizedProducts;
}

function afterFirstPaint(callback, delayMs = 0) {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => window.setTimeout(callback, delayMs));
  });
}

function scheduleBackgroundRefresh(normalizedProducts) {
  afterFirstPaint(() => {
    Promise.all([
      loadDailyAd(),
      refreshProductsFromExternal(normalizedProducts)
    ]).then(([dailyAdChanged, externalCatalogChanged]) => {
      if (!dailyAdChanged && !externalCatalogChanged) return;
      if (state.route.name !== "home" || dailyAdChanged) {
        renderRoute();
      }
      renderCart();
    }).catch((error) => {
      console.info("HAODE app no pudo actualizar datos secundarios:", error.message);
    });
  }, 1500);

  window.setTimeout(() => {
    const runDiagnostics = () => refreshFirestoreDiagnostics().catch((error) => {
      console.info("HAODE app no pudo completar diagnóstico Firestore:", error.message);
    });
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(runDiagnostics, { timeout: 4000 });
    } else {
      runDiagnostics();
    }
  }, 10000);
}

async function loadDailyAd() {
  state.dailyAd = null;
  try {
    const response = await fetch(DAILY_AD_URL, { cache: "no-store" });
    if (!response.ok) {
      return false;
    }
    const data = await response.json();
    if (data && data.status === "draft") {
      state.dailyAd = data;
      return true;
    }
  } catch (error) {
    console.info("HAODE app sin banner diario:", error.message);
  }
  return false;
}

function priceRuleFor(product, quantity = 1) {
  const orderQuantity = Math.max(quantity, cartCount());
  const matchingTier = product.priceTiers
    .filter((tier) => {
      if (tier.autoApply === false) return false;
      const applicableQuantity = tier.scope === "mixed_order" ? orderQuantity : quantity;
      return applicableQuantity >= tier.minQty && (tier.maxQty === null || applicableQuantity <= tier.maxQty);
    })
    .pop();
  if (matchingTier) {
    return { unitPrice: matchingTier.price, label: matchingTier.label };
  }
  if (quantity >= 10) {
    if (product.category === "Pantallas OLED Diagnóstica" && !product.wholesalePrice) {
      return { unitPrice: product.publicPrice, label: "Precio menudeo" };
    }
    return { unitPrice: product.wholesalePrice || product.publicPrice, label: "Precio mayoreo" };
  }
  return { unitPrice: product.publicPrice, label: "Precio menudeo" };
}

function priceFor(product, quantity = 1) {
  return priceRuleFor(product, quantity).unitPrice;
}

function formatPrice(value) {
  const number = Number(value) || 0;
  return number > 0 ? `${money.format(number)} MXN` : "Cotizar por WhatsApp";
}

function priceLines(product) {
  if (product.category === "Micas") {
    return `
      <div class="price-lines">
        <span>Paquete 50 pzs <strong>${formatPrice(product.publicPrice)}</strong></span>
        <span>Mayoreo desde <strong>${formatPrice(product.wholesalePrice)}</strong></span>
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

function cardPriceHtml(product) {
  if (product.salesAvailable) return priceLines(product);
  return `
    <div class="price-lines pending-price-note">
      <span>Precio pendiente de confirmación</span>
      <strong>Cotizar por WhatsApp</strong>
    </div>
  `;
}

function productDetailUrl(product) {
  const detailUrls = {
    "aimb-g5-ai-sports": "/ai-smart-glasses-aimb-g5.html",
    "haode-ai-g3-smart-glasses": "/ai-smart-glasses-aimb-g3.html",
    "haode-ai-w610-smart-glasses": "/ai-smart-glasses-w610.html",
    "s1-ai-classic": "/ai-smart-glasses-s1.html",
    "samsung-original-z-flip7": "/productos/samsung-z-flip7/",
    "samsung-original-z-fold3": "/productos/samsung-z-fold3/",
    "samsung-original-z-fold4": "/productos/samsung-z-fold4/",
    "samsung-original-z-fold5": "/productos/samsung-z-fold5/",
    "samsung-original-z-fold6": "/productos/samsung-z-fold6/",
    "w630-ai-pro": "/ai-smart-glasses-w630.html",
    "x200t-cortadora-micas": "/producto/x200t-cortadora-micas/"
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
  return String(value || "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function escapeHtml(value) {
  return escapeAttr(value);
}

function safeImageSrc(value, fallback = PLACEHOLDER_IMAGE) {
  const image = String(value || "").trim();
  if (!image || /[\u0000-\u001f\u007f"'<>`\\]/.test(image)) return fallback;
  if (image.startsWith("/") && !image.startsWith("//")) return image;
  try {
    const url = new URL(image);
    const erpOrigin = new URL(ERP_PUBLIC_CATALOG_URL).origin;
    if (url.protocol === "https:" && (url.origin === window.location.origin || url.origin === erpOrigin)) {
      return url.href;
    }
  } catch {
    // Invalid or untrusted catalog image URLs fall back to an approved local asset.
  }
  return fallback;
}

function normalizedLocalAssetPath(value) {
  const image = String(value || "").trim();
  if (!image) return "";
  if (/^https?:\/\//i.test(image)) {
    try {
      const url = new URL(image);
      return url.origin === window.location.origin ? url.pathname : "";
    } catch {
      return "";
    }
  }
  if (APP_BASE_PATH && image.startsWith(`${APP_BASE_PATH}/assets/`)) {
    return image.slice(APP_BASE_PATH.length);
  }
  return image.startsWith("/assets/") ? image : "";
}

function optimizedImageSrcset(value, variant = "card") {
  const imagePath = normalizedLocalAssetPath(value);
  const imageMap = variant === "detail" ? OPTIMIZED_DETAIL_IMAGE_BY_PATH : OPTIMIZED_CARD_IMAGE_BY_PATH;
  const optimized = imageMap[imagePath];
  return optimized ? ` srcset="${escapeAttr(optimized)}"` : "";
}

function productCardHtml(product, compact = false) {
  const label = product.quality?.label || product.category;
  const productUrl = escapeAttr(appProductUrl(product));
  const productId = escapeAttr(product.id);
  return `
    <article class="product-card">
      <a class="product-media" href="${productUrl}" aria-label="Ver ${escapeAttr(product.displayName || product.name)}">
        <img src="${escapeAttr(safeImageSrc(product.image))}"${optimizedImageSrcset(product.image)} alt="${escapeAttr(product.name)}" width="640" height="640" loading="${compact ? "eager" : "lazy"}" decoding="async" onerror="this.removeAttribute('srcset');this.src='${escapeAttr(PLACEHOLDER_IMAGE)}'" />
        ${product.usesPlaceholder ? '<span class="product-image-status">Imagen en actualización</span>' : ""}
      </a>
      <div class="product-body">
        <span class="product-kicker">${escapeHtml(label)}</span>
        <h3>${escapeHtml(product.displayName)}</h3>
        <span class="stock-badge stock-${stockClassName(product.stock)}">${escapeHtml(product.erpStockLabel || product.stock)}</span>
        <div class="app-card-badges" aria-label="Ventajas de compra">
          <span>Stock México</span>
          <span>Precio por cantidad</span>
          <span>WhatsApp privado</span>
        </div>
        <div class="app-card-b2b-strip">
          <strong>Lista grande por WhatsApp</strong>
          <span>Confirma stock, garantía local y precio final antes de preparar el pedido.</span>
        </div>
        <p class="model">Modelo: ${escapeHtml(product.model)}</p>
        ${cardPriceHtml(product)}
        <div class="product-actions">
          <a class="text-button" href="${productUrl}">Detalles</a>
          ${product.salesAvailable
            ? `<button class="add-button" type="button" data-add-product="${productId}">Agregar</button>`
            : `<a class="add-button product-consult-button" href="${escapeAttr(singleProductWhatsappUrl(product))}" data-product-whatsapp="${productId}" target="_blank" rel="noopener noreferrer">Consultar</a>`}
        </div>
      </div>
    </article>
  `;
}

function homeProductRowHtml(product) {
  const label = product.quality?.label || product.category;
  const productId = escapeAttr(product.id);
  return `
    <article class="product-card app-home-product-card">
      <a class="app-home-product-media" href="${escapeAttr(appProductUrl(product))}" aria-label="Ver ${escapeAttr(product.displayName || product.name)}">
        <img src="${escapeAttr(safeImageSrc(product.image))}"${optimizedImageSrcset(product.image)} alt="${escapeAttr(product.name)}" width="700" height="620" loading="eager" decoding="async" onerror="this.removeAttribute('srcset');this.src='${escapeAttr(PLACEHOLDER_IMAGE)}'" />
        ${product.usesPlaceholder ? '<span class="product-image-status">Imagen en actualización</span>' : ""}
      </a>
      <div class="app-home-product-copy">
        <span class="product-kicker">${escapeHtml(label)}</span>
        <h3>${escapeHtml(product.displayName)}</h3>
        <p>${product.officialSkuPending ? "Referencia" : "SKU"}: ${escapeAttr(product.sku || product.reference || product.model || product.id)}</p>
        <span class="stock-badge stock-${stockClassName(product.stock)}">${escapeHtml(product.erpStockLabel || product.stock)}</span>
      </div>
      <button class="app-row-add" type="button" data-add-product="${productId}" aria-label="Agregar" ${product.salesAvailable ? "" : "disabled"}>${product.salesAvailable ? "+" : "?"}</button>
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
      <a class="category-card${active}" href="${group.url}" data-group-link="${group.id}">
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

function largeListWhatsappMessage(source = "App") {
  return [
    "Hola HAODE México, quiero cotizar una lista grande por WhatsApp.",
    "Modelos:",
    "Cantidades:",
    "Ciudad:",
    `Origen: ${source}.`,
    "¿Me confirman stock en México, precio por cantidad, garantía local y envío?"
  ].join("\n");
}

function appBulkPanelHtml({ label = "Pedido por cantidad", title, copy, ctaText = "Enviar lista por WhatsApp", message, openCart = false }) {
  const whatsappMessage = message || largeListWhatsappMessage("App panel");
  const ctaHtml = openCart
    ? `<button class="whatsapp-button app-bulk-cta" type="button" data-open-cart>${escapeHtml(ctaText)}</button>`
    : `<a class="whatsapp-button app-bulk-cta" href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}" target="_blank" rel="noopener noreferrer">${escapeHtml(ctaText)}</a>`;
  return `
    <section class="app-bulk-panel" aria-label="Compra por WhatsApp">
      <div class="app-bulk-copy">
        <span>${escapeHtml(label)}</span>
        <h2>${escapeHtml(title)}</h2>
        <p>${escapeHtml(copy)}</p>
      </div>
      ${ctaHtml}
    </section>
  `;
}

function renderHome() {
  state.route = { name: "home" };
  state.activeCategory = "Todos";
  state.activeGroup = "";
  const featuredProducts = [
    ...products.filter((product) => product.category.includes("Pantallas")).slice(0, 5),
    ...products.filter((product) => product.category === "Micas").slice(0, 1),
    ...products.filter((product) => product.category === "Máquinas de Mica").slice(0, 1),
    ...products.filter((product) => product.category === "Fundas").slice(0, 2),
    ...products.filter((product) => product.category === "Gafas AI" || product.category === "Cámaras Inteligentes").slice(0, 2)
  ];
  const uniqueFeatured = Array.from(new Map(featuredProducts.map((product) => [product.id, product])).values()).slice(0, 10);
  const promoProducts = products
    .filter((product) => product.offerActive && (product.specialOffer || product.offerDisplayPrice))
    .slice(0, 4);

  viewRootEl.innerHTML = `
    <div class="page-stack">
      <section class="app-procurement-hero app-home-board">
        <div class="app-home-intro">
          <span class="hero-badge">HAODE México · Catálogo profesional</span>
          <h1>Encuentra tu refacción.</h1>
          <p>Catálogo y pedido para talleres. Confirma modelo, versión, cantidad y disponibilidad antes de comprar.</p>
          <button class="app-quick-search" type="button" data-focus-search>
            <span>Buscar por SKU o modelo</span>
            <strong>Buscar</strong>
          </button>
        </div>

        <div class="category-rail app-home-categories" data-category-rail>${categoryCardsHtml()}</div>

        <div class="app-hero-actions">
          <a class="whatsapp-button" href="${largeListWhatsappUrl("App inicio")}" target="_blank" rel="noopener noreferrer">Enviar lista por WhatsApp</a>
          <a class="outline-button" href="#lista">Ver catálogo</a>
        </div>

        <div class="app-stock-strip" aria-label="Ventajas HAODE">
          <span><strong>Stock en México</strong><small>Disponibilidad por confirmar</small></span>
          <span><strong>Precio por cantidad</strong><small>Mayoreo privado</small></span>
          <span><strong>Calidad revisada</strong><small>Pantallas y refacciones</small></span>
          <span><strong>WhatsApp privado</strong><small>Lista grande</small></span>
        </div>

        <section class="app-home-featured" aria-labelledby="app-featured-title">
          <div class="app-home-section-head">
            <h2 id="app-featured-title">Productos destacados</h2>
            <a href="#lista">Ver todos</a>
          </div>
          <div class="app-home-product-list">
            ${uniqueFeatured.slice(0, 4).map(homeProductRowHtml).join("")}
          </div>
        </section>

        <div class="hero-alert" aria-label="Aviso para compras grandes">
          <strong>¿Cantidad grande?</strong>
          <span>WhatsApp privado: HAODE confirma stock, precio final y envío.</span>
        </div>
        <div class="hero-proof" aria-label="Beneficios HAODE">
          <span>Fábrica directa</span>
          <span>Inventario México</span>
          <span>Calidad revisada</span>
          <span>Precio por cantidad</span>
        </div>
      </section>

      ${dailyAdBannerHtml()}

      ${promotionsSectionHtml(promoProducts)}

      ${appOrderSectionHtml()}

      <section class="section-block" id="catalogo">
        <div class="section-head">
          <div>
            <h2>Catálogo activo</h2>
            <p>Selección activa para agregar al carrito y mandar lista por WhatsApp.</p>
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
        ${benefitHtml("Envío por confirmar", "truck")}
      </section>

      ${seoLinksHtml()}
    </div>
  `;
  updateNavigation();
}

function promotionsSectionHtml(promoProducts) {
  if (!promoProducts.length) {
    return "";
  }

  return `
    <section class="promo-panel" aria-labelledby="promo-panel-title">
      <div class="section-head">
        <div>
          <h2 id="promo-panel-title">Promociones activas</h2>
          <p>Precios visibles desde datos confirmados. HAODE confirma disponibilidad por WhatsApp.</p>
        </div>
        <a class="text-button" href="#lista">Ver todo</a>
      </div>
      <div class="promo-grid">
        ${promoProducts.map((product) => promoCardHtml(product)).join("")}
      </div>
    </section>
  `;
}

function dailyAdBannerHtml() {
  const ad = state.dailyAd;
  if (!ad) {
    return "";
  }
  const title = ad.app_banner_title || ad.website_banner_title || "Hoy en HAODE";
  const subtitle = ad.app_banner_subtitle || ad.website_banner_subtitle || "Consulta disponibilidad por WhatsApp.";
  const cta = ad.cta_app || ad.cta_whatsapp || largeListWhatsappUrl("App publicidad diaria");

  return `
    <section class="daily-ad-card" aria-label="Promoción diaria HAODE">
      <span>Publicidad diaria</span>
      <div>
        <h2>${escapeAttr(title)}</h2>
        <p>${escapeAttr(subtitle)}</p>
      </div>
      <a class="secondary-button" href="${escapeAttr(cta)}" target="_blank" rel="noopener noreferrer">Cotizar por WhatsApp</a>
    </section>
  `;
}

function promoCardHtml(product) {
  const displayPrice = product.offerDisplayPrice || formatPrice(product.publicPrice);
  const media = product.offerImage || product.image;
  return `
    <a class="promo-card" href="${escapeAttr(appProductUrl(product))}">
      <span class="promo-label">Promoción</span>
      <img src="${escapeAttr(safeImageSrc(media))}"${optimizedImageSrcset(media)} alt="${escapeAttr(product.name)}" width="640" height="640" loading="lazy" decoding="async" onerror="this.removeAttribute('srcset');this.src='${escapeAttr(PLACEHOLDER_IMAGE)}'" />
      <strong>${escapeHtml(product.displayName)}</strong>
      <span class="promo-price">${escapeHtml(displayPrice)}</span>
    </a>
  `;
}

function appOrderSectionHtml() {
  return `
    <section class="app-order-panel" aria-labelledby="app-order-title">
      <div class="app-order-copy">
        <span>Pedido de taller</span>
        <h2 id="app-order-title">Arma tu lista y la revisamos por WhatsApp</h2>
        <p>Para cantidades grandes, manda la lista completa. HAODE confirma stock, precio final, garantía local y envío antes de cerrar pedido.</p>
      </div>
      <div class="app-order-steps" aria-label="Flujo de pedido">
        <article>
          ${iconSvg("screen")}
          <strong>Busca modelo</strong>
          <span>iPhone Pro Max, Samsung Ultra, OLED, AMOLED, micas y más.</span>
        </article>
        <article>
          ${iconSvg("grid")}
          <strong>Agrega piezas</strong>
          <span>El carrito calcula el total estimado sin pago en línea.</span>
        </article>
        <article>
          ${iconSvg("whatsapp")}
          <strong>WhatsApp privado</strong>
          <span>Atención directa para mayoreo, volumen y pedidos recurrentes.</span>
        </article>
      </div>
    </section>
  `;
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
        <p>Pantallas premium seleccionadas, stock en México bajo confirmación y pedidos por WhatsApp.</p>
      </div>
      <div class="premium-showcase-grid">
        ${premiumItems.slice(0, 3).map((item) => `
          <a class="premium-tile" href="${escapeAttr(appProductUrl(item.product))}">
            <span>${escapeHtml(item.label)}</span>
            <strong>${escapeHtml(item.product.displayName)}</strong>
            <img src="${escapeAttr(safeImageSrc(item.product.image))}"${optimizedImageSrcset(item.product.image)} alt="${escapeAttr(item.product.name)}" width="640" height="640" loading="lazy" decoding="async" onerror="this.removeAttribute('srcset');this.src='${escapeAttr(PLACEHOLDER_IMAGE)}'" />
          </a>
        `).join("")}
      </div>
    </section>
  `;
}

function renderList({ group = "", category = "Todos" } = {}) {
  const activeSearchInput = document.activeElement?.matches?.("[data-search-products]")
    ? document.activeElement
    : null;
  const searchFocusState = activeSearchInput
    ? {
      start: activeSearchInput.selectionStart ?? activeSearchInput.value.length,
      end: activeSearchInput.selectionEnd ?? activeSearchInput.value.length,
      direction: activeSearchInput.selectionDirection || "none"
    }
    : null;
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
  const noResultsHtml = productsToShow.length ? "" : listEmptyStateHtml(title);
  const isSearchEmpty = !productsToShow.length && Boolean(state.searchQuery.trim());

  viewRootEl.innerHTML = `
    <div class="page-stack">
      <section class="list-title">
        <a class="back-link" href="#inicio">Volver al inicio</a>
        <div>
          <h1>${escapeHtml(title)}</h1>
          <p>${productsToShow.length} productos activos. Menudeo, mayoreo y precios por cantidad cuando aplica.</p>
        </div>
      </section>

      <section class="toolbar" aria-label="Filtros de productos">
        <label class="search-box">
          <span>Buscar</span>
          <input type="search" data-search-products placeholder="iPhone 13, S23 Ultra, X200T..." value="${escapeAttr(state.searchQuery)}" autocomplete="off" />
        </label>
        ${isSearchEmpty ? noResultsHtml : ""}
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

      ${appBulkPanelHtml({
        title: "Compra muchas piezas por WhatsApp",
        copy: "Busca modelos, agrega cantidades y manda una lista completa. Un asesor confirma disponibilidad, precio final y envío por WhatsApp.",
        ctaText: "Enviar lista",
        message: `Hola HAODE México, quiero cotizar una lista grande de ${title}.`
      })}

      <section class="app-path-strip" aria-label="Compra profesional HAODE">
        <span><strong>Stock en México</strong> salida rápida</span>
        <span><strong>Garantía local</strong> calidad revisada</span>
        <span><strong>WhatsApp privado</strong> listas grandes</span>
      </section>

      <section class="section-block">
        <div class="category-rail app-list-categories" data-category-rail>${categoryCardsHtml()}</div>
      </section>

      ${!isSearchEmpty ? noResultsHtml : ""}

      <section class="section-block">
        <div class="product-grid" data-product-grid>
          ${productsToShow.length ? productsToShow.map((product, index) => productCardHtml(product, index < 6)).join("") : ""}
        </div>
      </section>
    </div>
  `;
  updateNavigation();
  updateSearchStatus(state.searchQuery, productsToShow.length);
  if (searchFocusState) {
    const nextSearchInput = document.querySelector("[data-search-products]");
    nextSearchInput?.focus({ preventScroll: true });
    nextSearchInput?.setSelectionRange(
      searchFocusState.start,
      searchFocusState.end,
      searchFocusState.direction
    );
  }
}

function emptyStateHtml(title, copy) {
  return `<div class="empty-state"><strong>${escapeHtml(title)}</strong><span>${escapeHtml(copy)}</span></div>`;
}

function appLoadErrorHtml() {
  return `
    <section class="app-load-error" role="alert">
      <span>No se pudo abrir el catálogo</span>
      <h1>Revisa tu conexión e intenta de nuevo</h1>
      <p>También puedes enviar el modelo o SKU por WhatsApp. Un asesor confirma disponibilidad y precio final.</p>
      <div>
        <button type="button" data-retry-app>Reintentar</button>
        <a href="${largeListWhatsappUrl('App error de carga')}" target="_blank" rel="noopener noreferrer">Cotizar por WhatsApp</a>
      </div>
    </section>
  `;
}

function listEmptyStateHtml(title) {
  const query = state.searchQuery.trim();
  const message = query
    ? [
      `Hola HAODE México, busqué "${query}" en la App y quiero cotizar por WhatsApp.`,
      `Modelo/SKU: ${query}`,
      "Cantidad:",
      "Ciudad:",
      "¿Me confirman stock en México, precio por cantidad, garantía local y envío?"
    ].join("\n")
    : [
      `Hola HAODE México, quiero cotizar una lista de ${title} por WhatsApp.`,
      "Modelos:",
      "Cantidades:",
      "Ciudad:",
      "¿Me confirman stock en México, precio por cantidad, garantía local y envío?"
    ].join("\n");
  return `
    <div class="empty-state empty-state-whatsapp${query ? " search-empty-whatsapp" : ""}">
      <strong>Sin resultados</strong>
      <span>No encontramos productos activos con estos filtros. Envía el modelo exacto o una lista grande por WhatsApp y un asesor confirma stock, precio por cantidad, garantía local y envío.</span>
      <a class="whatsapp-button" href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}" target="_blank" rel="noopener noreferrer">Enviar búsqueda por WhatsApp</a>
    </div>
  `;
}

function largeListWhatsappUrl(source = "App") {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(largeListWhatsappMessage(source))}`;
}

function cartEmptyWhatsappHtml() {
  return `
    <div class="empty-state empty-state-whatsapp cart-empty-whatsapp">
      <strong>¿Tienes una lista grande?</strong>
      <span>No necesitas agregar pieza por pieza. Envía modelos, cantidades y ciudad por WhatsApp privado.</span>
      <a class="whatsapp-button" href="${largeListWhatsappUrl("App carrito vacío")}" target="_blank" rel="noopener noreferrer">Enviar lista grande por WhatsApp</a>
    </div>
  `;
}

function galleryImagesFor(product) {
  const images = [product.image];
  if (product.id === "x200t-cortadora-micas") {
    images.push("/assets/products/home-cut-machine/x200t.jpg");
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
  trackProductView(product);
  state.selectedGalleryIndex = Math.min(state.selectedGalleryIndex, galleryImagesFor(product).length - 1);
  const gallery = galleryImagesFor(product);
  const uniqueFrames = gallery;
  const has360 = isX200T(product) && uniqueFrames.length >= 3;
  const related = products
    .filter((item) => item.id !== product.id && item.category === product.category)
    .slice(0, 4);
  const officialUrl = productDetailUrl(product);
  const flagshipClass = isX200T(product) ? " is-flagship" : "";
  const productIdAttr = escapeAttr(product.id);

  viewRootEl.innerHTML = `
    <div class="page-stack">
      <a class="back-link" href="#lista">Volver al catálogo</a>
      ${detailConversionStripHtml()}
      <section class="detail-layout${flagshipClass}">
        <div class="gallery-shell" data-product-gallery>
          ${has360 ? product360Html(product, uniqueFrames) : productGalleryHtml(product, gallery)}
        </div>

        <article class="detail-panel">
          <div class="detail-copy">
            <span class="stock-badge stock-${stockClassName(product.stock)}">${escapeHtml(product.erpStockLabel || product.stock)}</span>
            <h1>${escapeHtml(product.displayName)}</h1>
            <p>${escapeHtml(product.description || "Producto HAODE para técnicos, tiendas y mayoreo. Confirma detalles por WhatsApp.")}</p>
          </div>
          ${priceStackHtml(product)}
          <div class="sticky-actions">
            <button class="add-button" type="button" data-add-product="${productIdAttr}" ${product.salesAvailable ? "" : "disabled"}>${product.salesAvailable ? "Agregar" : "Precio pendiente"}</button>
            <a class="whatsapp-outline" href="${escapeAttr(singleProductWhatsappUrl(product))}" data-product-whatsapp="${productIdAttr}" data-detail-whatsapp target="_blank" rel="noopener noreferrer">Cotizar por WhatsApp</a>
          </div>
          ${specGridHtml(product, has360, gallery.length)}
          <div class="detail-whatsapp-note">
            <strong>Lista grande por WhatsApp</strong>
            <span>Envía lista grande por WhatsApp. HAODE confirma stock, precio final, garantía local y envío antes de cerrar el pedido.</span>
          </div>
          <div class="detail-actions">
            ${officialUrl ? `<a class="outline-button" href="${escapeAttr(officialUrl)}">Página oficial</a>` : ""}
            <button class="text-button" type="button" data-share-product="${productIdAttr}">Compartir</button>
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
          ${related.length ? related.map((product) => productCardHtml(product, true)).join("") : emptyStateHtml("Sin relacionados", "No hay más productos activos en esta categoría.")}
        </div>
      </section>
    </div>
  `;
  updateNavigation();
}

function detailConversionStripHtml() {
  return `
    <div class="detail-conversion-strip" aria-label="Ventajas para cotizar este producto">
      <span><strong>Stock en México</strong><small>Bajo confirmación</small></span>
      <span><strong>Precio por cantidad</strong><small>Mayoreo privado</small></span>
      <span><strong>Calidad revisada</strong><small>Para talleres</small></span>
      <span><strong>WhatsApp privado</strong><small>Envía lista grande</small></span>
    </div>
  `;
}

function productGalleryHtml(product, images) {
  const selected = images[state.selectedGalleryIndex] || images[0] || PLACEHOLDER_IMAGE;
  return `
    <div class="gallery-stage">
      ${isX200T(product) ? '<span class="gallery-badge">Galería de producto</span>' : ""}
      <img src="${escapeAttr(safeImageSrc(selected))}"${optimizedImageSrcset(selected, "detail")} alt="${escapeAttr(product.name)}" width="960" height="960" loading="eager" decoding="async" onerror="this.removeAttribute('srcset');this.src='${escapeAttr(PLACEHOLDER_IMAGE)}'" />
      ${product.usesPlaceholder ? '<span class="product-image-status">Imagen en actualización</span>' : ""}
    </div>
    ${thumbStripHtml(images, state.selectedGalleryIndex)}
  `;
}

function product360Html(product, frames) {
  const frame = frames[state.viewerIndex] || frames[0] || product.image;
  return `
    <div class="viewer-stage" data-viewer-stage tabindex="0" role="group" aria-label="Vista 360 de ${escapeAttr(product.name)}">
      <span class="viewer-badge">360°</span>
      <img src="${escapeAttr(safeImageSrc(frame))}"${optimizedImageSrcset(frame, "detail")} alt="${escapeAttr(product.name)} vista 360" width="960" height="960" data-viewer-image loading="eager" decoding="async" onerror="this.removeAttribute('srcset');this.src='${escapeAttr(PLACEHOLDER_IMAGE)}'" />
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
          <img src="${escapeAttr(safeImageSrc(image))}"${optimizedImageSrcset(image)} alt="" width="160" height="160" loading="lazy" decoding="async" />
        </button>
      `).join("")}
    </div>
  `;
}

function priceStackHtml(product) {
  if (product.priceTiers.length) {
    return `
      <div class="price-stack">
        <span>Precio menudeo <strong>${formatPrice(product.publicPrice)}</strong></span>
        ${product.priceTiers.map((tier) => `<span>${escapeHtml(tier.label)}${tier.autoApply ? "" : " · confirmar por WhatsApp"} <strong>${formatPrice(tier.price)}</strong></span>`).join("")}
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
          <span>${escapeHtml(label)}</span>
          <strong>${escapeHtml(value)}</strong>
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
    const productIdAttr = escapeAttr(item.product.id);
    return `
      <article class="cart-item">
        <img src="${escapeAttr(safeImageSrc(item.product.image))}"${optimizedImageSrcset(item.product.image)} alt="${escapeAttr(item.product.name)}" width="240" height="240" loading="eager" decoding="async" onerror="this.removeAttribute('srcset');this.src='${escapeAttr(PLACEHOLDER_IMAGE)}'" />
        <div>
          <h3>${escapeHtml(item.product.displayName)}</h3>
          <p>${escapeHtml(item.product.model)}</p>
          <div class="cart-row">
            <div class="qty-control" aria-label="Cantidad de ${escapeAttr(item.product.name)}">
              <button type="button" data-decrease="${productIdAttr}" aria-label="Reducir cantidad">-</button>
              <span>${item.quantity}</span>
              <button type="button" data-increase="${productIdAttr}" aria-label="Aumentar cantidad">+</button>
            </div>
            <strong>${formatPrice(subtotal)}</strong>
          </div>
          <p>Precio aplicado: ${escapeHtml(priceRule.label)} · ${formatPrice(priceRule.unitPrice)} c/u</p>
          <div class="cart-row">
            <button class="remove-button" type="button" data-remove="${productIdAttr}">Eliminar</button>
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
      <section class="app-path-strip" aria-label="Confirmación de pedido HAODE">
        <span><strong>Total estimado</strong> sin pago en línea</span>
        <span><strong>Precio final</strong> confirmado por asesor</span>
        <span><strong>Envío</strong> a todo México</span>
      </section>
      ${items.length ? appBulkPanelHtml({
        label: "Lista lista para revisar",
        title: "Envía este carrito por WhatsApp privado",
        copy: "Abre el resumen con tus productos, deja nombre, WhatsApp y ciudad, y envía la lista completa a un asesor. No hay pago en línea.",
        ctaText: "Revisar carrito por WhatsApp",
        openCart: true
      }) : appBulkPanelHtml({
        label: "Sin carrito perfecto",
        title: "Envía tu lista grande por WhatsApp",
        copy: "Para pedidos de muchas piezas, manda modelos, cantidades y ciudad. HAODE confirma stock, garantía local, precio final y envío.",
        ctaText: "Enviar lista por WhatsApp",
        message: largeListWhatsappMessage("App carrito")
      })}
      ${items.length ? `
        <section class="cart-page-card">
          <div class="cart-items-page">${itemsMarkup}</div>
          <div class="cart-total">
            <span>Total estimado</span>
            <strong>${formatPrice(cartTotal())}</strong>
          </div>
          <div class="section-actions">
            <a class="text-button" href="#lista">Continuar comprando</a>
            <button class="primary-button" type="button" data-open-cart>Enviar por WhatsApp</button>
          </div>
        </section>
      ` : ""}
    </div>
  `;
  updateNavigation();
}

function renderContact() {
  state.route = { name: "contact" };
  viewRootEl.innerHTML = `
    <div class="page-stack">
      <section class="contact-card app-contact-board">
        <h1>Contacto HAODE</h1>
        <p>Envía tu lista grande, modelos, cantidades y ciudad. HAODE confirma disponibilidad, precio final y envío por WhatsApp privado.</p>
        ${detailConversionStripHtml()}
        <a class="whatsapp-button" href="${largeListWhatsappUrl("App contacto")}" target="_blank" rel="noopener noreferrer">Enviar lista por WhatsApp</a>
      </section>
      <section class="app-contact-details" aria-labelledby="app-contact-details-title">
        <div>
          <span class="app-contact-kicker">Atención de fábrica</span>
          <h2 id="app-contact-details-title">Prepara tu cotización</h2>
          <p>Incluye estos datos para recibir una respuesta más clara por WhatsApp.</p>
        </div>
        <div class="app-contact-detail-grid">
          <article>
            <span>1</span>
            <strong>Modelo o SKU</strong>
            <small>Escribe la referencia exacta.</small>
          </article>
          <article>
            <span>2</span>
            <strong>Cantidad</strong>
            <small>Indica piezas por modelo.</small>
          </article>
          <article>
            <span>3</span>
            <strong>Ciudad</strong>
            <small>Para revisar la entrega.</small>
          </article>
        </div>
        <address class="app-contact-address">
          <strong>HAODE México · CDMX</strong>
          <span>Eje Central Lázaro Cárdenas 87, Piso 2, Local 225, Colonia Centro, Cuauhtémoc, 06070 Ciudad de México.</span>
        </address>
        <div class="app-contact-actions">
          <a class="outline-button" href="#lista">Ver catálogo</a>
          <a class="text-button" href="/">Abrir sitio web</a>
        </div>
      </section>
    </div>
  `;
  updateNavigation();
}

function seoLinksHtml() {
  const chips = [
    { label: "iPhone INCELL", href: "/categoria/iphone-incell/", code: "IN" },
    { label: "iPhone OLED", href: "/categoria/iphone-oled/", code: "OLED" },
    { label: "Samsung INCELL", href: "/categoria/samsung-incell/", code: "SI" },
    { label: "Samsung OLED", href: "/categoria/samsung-oled/", code: "SO" },
    { label: "Samsung TIPO ORIGINAL", href: "/categoria/samsung-tipo-original/", code: "TO" },
    { label: "Micas", href: "/categoria/micas/", code: "MI" },
    { label: "Productos AI", href: "/categoria/productos-ai/", code: "AI" },
    { label: "Fundas", href: "/categoria/fundas/", code: "FU" }
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

function resetRouteScroll() {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  window.requestAnimationFrame(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  });
}

function focusProductSearch(attempt = 0) {
  const searchInput = document.querySelector("[data-search-products]");
  if (!searchInput) {
    if (attempt < 6) {
      window.setTimeout(() => focusProductSearch(attempt + 1), 80);
    }
    return;
  }

  searchInput.scrollIntoView({ block: "center", behavior: "auto" });
  searchInput.focus({ preventScroll: true });
  const focused = document.activeElement === searchInput;
  if (attempt < 6) {
    window.setTimeout(() => {
      const currentSearchInput = document.querySelector("[data-search-products]");
      if (
        currentSearchInput
        && document.activeElement !== currentSearchInput
        && (currentSearchInput !== searchInput || !focused)
      ) {
        focusProductSearch(attempt + 1);
      }
    }, 80);
  }
}

function renderRoute({ resetScroll = false } = {}) {
  const route = parseRoute();
  if (route.name !== "product") state.lastTrackedProductViewId = "";
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
  if (resetScroll) {
    resetRouteScroll();
  }
}

function updateNavigation() {
  const routeName = state.route.name;
  document.body.dataset.route = routeName;
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

function whatsappBaseUrl() {
  return `https://wa.me/${WHATSAPP_NUMBER}`;
}

function buildWhatsappUrl() {
  const items = getCartItems();
  const clientName = (customerNameEl?.value || "").trim();
  const clientPhone = (customerPhoneEl?.value || "").trim();
  const clientCity = (customerCityEl?.value || "").trim();
  const clientComment = (customerCommentEl?.value || "").trim();
  const lines = [
    "Hola HAODE México, quiero hacer este pedido:",
    "",
    `Cliente: ${clientName || "Sin nombre"}`,
    `Telefono: ${clientPhone || "Sin telefono"}`,
    `Ciudad: ${clientCity || "Sin ciudad"}`,
    "Tipo de precio: automatico por cantidad",
    "",
    ...items.map((item) => {
      const priceRule = priceRuleFor(item.product, item.quantity);
      const subtotal = priceRule.unitPrice * item.quantity;
      const referenceLabel = item.product.officialSkuPending ? "Referencia web" : "SKU";
      return `- ${item.product.name} | ${referenceLabel}: ${item.product.sku || item.product.reference || item.product.id} | Modelo: ${item.product.model} | Cantidad: ${item.quantity} | Precio aplicado: ${priceRule.label} ${formatPrice(priceRule.unitPrice)} | Subtotal: ${formatPrice(subtotal)}`;
    }),
    "",
    `Total estimado: ${formatPrice(cartTotal())}`,
    "",
    `Comentario: ${clientComment || "Sin comentario"}`,
    `Origen: ${state.attribution.source || appChannel()}`,
    `Referencia: ${attributionReference()}`,
    "",
    "Por favor confirma stock en México, precio por cantidad, garantía local y envío. Entiendo que no hay pago en línea y se confirma por WhatsApp."
  ];
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
}

function webOrderPayload() {
  const items = getCartItems();
  const clientName = (customerNameEl?.value || "").trim();
  const clientPhone = (customerPhoneEl?.value || "").trim();
  const clientCity = (customerCityEl?.value || "").trim();
  const clientComment = (customerCommentEl?.value || "").trim();
  return {
    customer_name: clientName,
    whatsapp: clientPhone,
    phone: clientPhone,
    product_sku: items[0]?.product?.sku || items[0]?.product?.reference || items[0]?.product?.id || "",
    product_name: items[0]?.product?.name || "",
    quantity: items[0]?.quantity || 1,
    message: [clientCity ? `Ciudad: ${clientCity}` : "", clientComment].filter(Boolean).join(" | "),
    delivery_method: "whatsapp",
    source: appChannel(),
    utm_source: state.attribution.source,
    utm_medium: state.attribution.medium,
    utm_campaign: state.attribution.campaign,
    utm_content: state.attribution.content,
    landing_page: state.attribution.landingPage,
    client_request_id: checkoutRequestId(),
    total: cartTotal(),
    items: items.map((item) => {
      const priceRule = priceRuleFor(item.product, item.quantity);
      return {
        product_sku: item.product.sku || item.product.reference || item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: priceRule.unitPrice
      };
    }),
    website: ""
  };
}

async function submitWebOrder() {
  const payload = webOrderPayload();
  if (!payload.customer_name || !payload.whatsapp || !payload.items.length) return null;
  try {
    const response = await fetch(ERP_WEB_ORDER_URL, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json", "Idempotency-Key": payload.client_request_id },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error(`ERP web order ${response.status}`);
    const result = await response.json();
    trackGrowthEvent("generate_lead", {
      currency: "MXN",
      value: payload.total,
      source: state.attribution.source,
      lead_registered: Boolean(result.order_number),
      items: ga4CartItems()
    });
    return result;
  } catch (error) {
    console.info("HAODE app no pudo registrar pedido ERP:", error.message);
    return null;
  }
}

function singleProductWhatsappUrl(product) {
  const referenceLabel = product.officialSkuPending ? "Referencia web" : "SKU";
  const lines = [
    "Hola HAODE México, quiero cotizar este producto:",
    "",
    `${product.name}`,
    `${referenceLabel}: ${product.sku || product.reference || product.id}`,
    `Modelo: ${product.model}`,
    `Precio menudeo: ${formatPrice(product.publicPrice)}`,
    `Precio mayoreo: ${formatPrice(product.wholesalePrice)}`,
    "",
    `Origen: ${state.attribution.source || appChannel()}`,
    `Referencia: ${attributionReference()}`,
    "Por favor confirma stock en México, compatibilidad, precio por cantidad, garantía local y envío."
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
    const cartTrigger = el.closest("[data-open-cart]");
    if (cartTrigger?.classList.contains("cart-action")) {
      cartTrigger.setAttribute("aria-label", `Abrir carrito, ${totalItems} ${totalItems === 1 ? "producto" : "productos"}`);
    }
  });

  cartDrawerEl?.classList.toggle("cart-drawer-empty", !items.length);

  if (!items.length) {
    cartItemsEl.innerHTML = cartEmptyWhatsappHtml();
    cartTotalEl.textContent = formatPrice(0);
    whatsappLinkEl.href = "#";
    whatsappLinkEl.textContent = "Agrega productos para pedido";
    whatsappLinkEl.classList.add("disabled");
    return;
  }

  cartItemsEl.innerHTML = items.map((item) => {
    const priceRule = priceRuleFor(item.product, item.quantity);
    const subtotal = priceRule.unitPrice * item.quantity;
    const productIdAttr = escapeAttr(item.product.id);
    return `
      <article class="cart-item">
        <img src="${escapeAttr(safeImageSrc(item.product.image))}"${optimizedImageSrcset(item.product.image)} alt="${escapeAttr(item.product.name)}" width="240" height="240" loading="eager" decoding="async" onerror="this.removeAttribute('srcset');this.src='${escapeAttr(PLACEHOLDER_IMAGE)}'" />
        <div>
          <h3>${escapeHtml(item.product.displayName)}</h3>
          <p>${escapeHtml(item.product.model)}</p>
          <div class="cart-row">
            <div class="qty-control" aria-label="Cantidad de ${escapeAttr(item.product.name)}">
              <button type="button" data-decrease="${productIdAttr}" aria-label="Reducir cantidad">-</button>
              <span>${item.quantity}</span>
              <button type="button" data-increase="${productIdAttr}" aria-label="Aumentar cantidad">+</button>
            </div>
            <strong>${formatPrice(subtotal)}</strong>
          </div>
          <p>Precio aplicado: ${escapeHtml(priceRule.label)} · ${formatPrice(priceRule.unitPrice)} c/u</p>
          <div class="cart-row">
            <button class="remove-button" type="button" data-remove="${productIdAttr}">Eliminar</button>
          </div>
        </div>
      </article>
    `;
  }).join("");

  cartTotalEl.textContent = formatPrice(cartTotal());
  whatsappLinkEl.classList.toggle("disabled", !customerReady);
  // Keep customer details out of the DOM URL so analytics cannot collect them.
  whatsappLinkEl.href = customerReady ? whatsappBaseUrl() : "#";
  whatsappLinkEl.textContent = customerReady ? "Enviar lista por WhatsApp" : "Completa datos para WhatsApp";
}

function addProduct(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product?.salesAvailable) return;
  resetCheckoutRequest();
  state.cart.set(productId, (state.cart.get(productId) || 0) + 1);
  const item = ga4Item(product, 1);
  trackGrowthEvent("add_to_cart", { currency: "MXN", value: item.price, items: [item] });
  renderCart();
}

function changeQuantity(productId, delta) {
  resetCheckoutRequest();
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
  resetCheckoutRequest();
  state.cart.delete(productId);
  renderCart();
  if (state.route.name === "cart") {
    renderCartPage();
  }
}

function openCart() {
  const wasClosed = !cartDrawerEl.classList.contains("open");
  if (wasClosed) {
    cartTriggerEl = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const items = ga4CartItems();
    if (items.length) {
      trackGrowthEvent("view_cart", {
        currency: "MXN",
        value: cartTotal(),
        items
      });
    }
  }
  cartDrawerEl.classList.add("open");
  cartDrawerEl.setAttribute("aria-hidden", "false");
  document.body.classList.add("cart-open");
  updateNavigation();
  window.requestAnimationFrame(() => {
    cartDrawerEl.querySelector("[data-close-cart]")?.focus({ preventScroll: true });
  });
}

function closeCart() {
  const trigger = cartTriggerEl;
  const wasOpen = cartDrawerEl.classList.contains("open");
  cartDrawerEl.classList.remove("open");
  cartDrawerEl.setAttribute("aria-hidden", "true");
  document.body.classList.remove("cart-open");
  cartTriggerEl = null;
  updateNavigation();
  if (wasOpen && trigger?.isConnected) {
    window.requestAnimationFrame(() => trigger.focus({ preventScroll: true }));
  }
}

function cartFocusableElements() {
  if (!cartPanelEl) return [];
  return Array.from(cartPanelEl.querySelectorAll(CART_FOCUSABLE_SELECTOR))
    .filter((element) => element.getClientRects().length > 0);
}

function handleCartKeydown(event) {
  if (!cartDrawerEl.classList.contains("open")) return;
  if (event.key === "Escape") {
    event.preventDefault();
    closeCart();
    return;
  }
  if (event.key !== "Tab") return;

  const focusable = cartFocusableElements();
  if (!focusable.length) {
    event.preventDefault();
    return;
  }
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement;
  if (event.shiftKey && (active === first || !cartPanelEl.contains(active))) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && (active === last || !cartPanelEl.contains(active))) {
    event.preventDefault();
    first.focus();
  }
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

async function handleDocumentClick(event) {
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
  const productWhatsappLink = event.target.closest("[data-product-whatsapp]");
  const retryAppButton = event.target.closest("[data-retry-app]");

  if (retryAppButton) {
    window.location.reload();
    return;
  }
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
  const whatsappOrderLink = event.target.closest("[data-whatsapp-link]");
  if (whatsappOrderLink) {
    event.preventDefault();
    if (whatsappOrderLink.classList.contains("disabled") || state.orderSubmitting) return;
    const url = buildWhatsappUrl();
    state.orderSubmitting = true;
    trackGrowthEvent("begin_checkout", {
      currency: "MXN",
      value: cartTotal(),
      source: state.attribution.source,
      items: ga4CartItems()
    });
    window.open(url, "_blank", "noopener,noreferrer");
    await submitWebOrder();
    state.orderSubmitting = false;
  }
  if (productWhatsappLink) {
    const product = products.find((item) => item.id === productWhatsappLink.dataset.productWhatsapp);
    if (product && !window.HaodeCampaign?.wasContactTracked?.(event)) {
      trackGrowthEvent("contact", { method: "whatsapp", item_id: product.sku, source: state.attribution.source });
    }
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
      focusProductSearch();
    } else {
      focusProductSearch();
    }
  }
  if (shareProductButton) {
    const product = products.find((item) => item.id === shareProductButton.dataset.shareProduct);
    if (product) {
      const shareUrl = `${window.location.origin}${window.location.pathname}${appProductUrl(product)}`;
      if (typeof navigator.share === "function") {
        try {
          await navigator.share({
            title: product.name,
            text: product.description || product.name,
            url: shareUrl
          });
        } catch (error) {
          if (error?.name !== "AbortError") {
            announceAppStatus("No se pudo compartir el producto.");
          }
        }
      } else {
        try {
          if (typeof navigator.clipboard?.writeText !== "function") throw new Error("Clipboard unavailable");
          await navigator.clipboard.writeText(shareUrl);
          announceAppStatus("Enlace del producto copiado.");
        } catch (error) {
          announceAppStatus("Copia el enlace del producto mostrado.");
          window.prompt("Copia este enlace del producto:", shareUrl);
        }
      }
    }
  }
}

function handleDocumentInput(event) {
  const searchInput = event.target.closest("[data-search-products]");
  if (searchInput) {
    state.searchQuery = searchInput.value;
    renderList({ group: state.activeGroup, category: state.activeCategory });
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
  state.attribution = trafficAttribution();
  setupPwaInstallPrompt();
  registerServiceWorker();
  setupFormListeners();
  setupViewerGestures();
  document.addEventListener("keydown", handleCartKeydown);
  document.addEventListener("click", handleDocumentClick);
  document.addEventListener("input", handleDocumentInput);
  document.addEventListener("change", handleDocumentChange);
  window.addEventListener("hashchange", () => renderRoute({ resetScroll: true }));
  window.addEventListener("haode:privacy-consent", (event) => {
    state.attribution = trafficAttribution();
    if (event.detail?.analytics && state.route.name === "product") {
      state.lastTrackedProductViewId = "";
      trackProductView(products.find((product) => product.id === state.route.productId));
    }
  });

  try {
    const normalizedProducts = await loadProducts();
    renderRoute({ resetScroll: true });
    renderCart();
    scheduleBackgroundRefresh(normalizedProducts);
  } catch (error) {
    console.error("No se pudo iniciar HAODE app:", error);
    networkStateEl.hidden = false;
    viewRootEl.innerHTML = appLoadErrorHtml();
  }

  const x200t = products.find((product) => product.id === "x200t-cortadora-micas");
  if (x200t) {
    preloadAdjacentFrame(x200t);
  }
}

init();
