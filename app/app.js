import { firebaseConfig, isFirebaseConfigured } from "./firebase-config.js";

const WHATSAPP_NUMBER = "523326684296";
const PRODUCTS_JSON_URL = "/haode-web/app/products.json";

const categories = [
  { id: "Pantallas iPhone OLED", label: "iPhone OLED" },
  { id: "Pantallas iPhone INCELL", label: "iPhone INCELL" },
  { id: "Pantallas Samsung AMOLED", label: "Samsung AMOLED" },
  { id: "Pantallas Samsung INCELL", label: "Samsung INCELL" },
  { id: "Micas", label: "Micas" },
  { id: "Máquinas de Mica", label: "Máquinas de Mica" },
  { id: "Gafas AI", label: "Gafas AI" },
  { id: "Fundas", label: "Fundas" }
];

let products = [];

const state = {
  activeCategory: categories[0].id,
  priceMode: "public",
  searchQuery: "",
  cart: new Map(),
  dataSource: "Cargando"
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
const priceModeEl = document.querySelector("[data-price-mode]");
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

function normalizeProduct(product) {
  return {
    id: String(product.id || "").trim(),
    category: product.categoria || product.category || categories[0].id,
    name: product.nombre || product.name || "Producto HAODE",
    model: product.modelo || product.model || "Consultar modelo",
    description: product.descripcion || product.description || "",
    publicPrice: Number(product.precioPublico ?? product.publicPrice ?? 0),
    wholesalePrice: Number(product.precioMayoreo ?? product.wholesalePrice ?? 0),
    image: product.imagen || product.image || "/haode-web/assets/products/placeholder.svg",
    stock: normalizeStock(product.stock),
    active: product.activo !== false,
    order: Number(product.orden ?? product.order ?? 9999)
  };
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

async function loadFirestoreProducts() {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase no configurado");
  }

  const [{ initializeApp }, firestore] = await Promise.all([
    import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js"),
    import("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js")
  ]);
  const { getFirestore, collection, getDocs, query, where } = firestore;

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const productsQuery = query(
    collection(db, "products"),
    where("activo", "==", true)
  );
  const snapshot = await getDocs(productsQuery);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function loadLocalProducts() {
  const response = await fetch(PRODUCTS_JSON_URL, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`No se pudo cargar products.json: ${response.status}`);
  }

  return response.json();
}

async function loadProducts() {
  try {
    const firestoreProducts = await loadFirestoreProducts();
    if (!firestoreProducts.length) {
      throw new Error("Firestore sin productos activos");
    }
    if (!hasRealCatalog(firestoreProducts)) {
      throw new Error("Firestore sin catalogo HAODE real");
    }
    products = activeProducts(firestoreProducts);
    state.dataSource = "Firestore";
  } catch (error) {
    console.info("HAODE app usando products.json fallback:", error.message);
    const localProducts = await loadLocalProducts();
    products = activeProducts(localProducts);
    state.dataSource = "products.json";
  }

  if (!products.some((product) => product.category === state.activeCategory)) {
    state.activeCategory = products[0]?.category || categories[0].id;
  }
}

function priceFor(product) {
  return state.priceMode === "wholesale" ? product.wholesalePrice : product.publicPrice;
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

function productStockMarkup(product) {
  return `<span class="stock-badge stock-${product.stock.replace(" ", "-")}">${product.stock}</span>`;
}

function productCardHtml(product) {
  return `
    <article class="product-card">
      <div class="product-media">
        <img src="${product.image}" alt="${product.name}" loading="lazy" />
      </div>
      <div class="product-info">
        <div class="product-title-row">
          <h3>${product.name}</h3>
          ${productStockMarkup(product)}
        </div>
        <p class="model">Modelo: ${product.model}</p>
        <div class="price-lines">
          <span>Precio menudeo <strong>${formatPrice(product.publicPrice)}</strong></span>
          <span>Precio mayoreo <strong>${formatPrice(product.wholesalePrice)}</strong></span>
        </div>
        <div class="product-description" data-product-description="${product.id}" hidden>
          <p>${product.description || "Sin detalles adicionales disponibles."}</p>
        </div>
        <div class="product-actions">
          <button class="text-button" type="button" data-show-details="${product.id}">Ver detalles</button>
          <button class="outline-button" type="button" data-add-wholesale="${product.id}">Solicitar mayoreo</button>
          <button class="add-button" type="button" data-add-product="${product.id}">Agregar al carrito</button>
        </div>
      </div>
    </article>
  `;
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
  const visibleProducts = products.filter((product) => {
    const matchesCategory = query ? true : product.category === state.activeCategory;
    const matchesSearch = !query || [product.name, product.model, product.description]
      .concat(product.category)
      .some((value) => String(value || "").toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });

  productCountEl.textContent = `${visibleProducts.length} productos`;
  productGridEl.innerHTML = visibleProducts.length
    ? visibleProducts.map(productCardHtml).join("")
    : '<div class="empty-cart">No hay productos activos para esta busqueda.</div>';

  renderProductSections();
}

function getCartItems() {
  return Array.from(state.cart.entries()).map(([productId, quantity]) => ({
    product: products.find((item) => item.id === productId),
    quantity
  })).filter((item) => item.product);
}

function cartTotal() {
  return getCartItems().reduce((total, item) => total + priceFor(item.product) * item.quantity, 0);
}

function cartCount() {
  return getCartItems().reduce((total, item) => total + item.quantity, 0);
}

function buildWhatsappUrl() {
  const items = getCartItems();
  const priceLabel = state.priceMode === "wholesale" ? "mayoreo" : "publico";
  const clientName = (customerNameEl?.value || "").trim();
  const clientPhone = (customerPhoneEl?.value || "").trim();
  const clientCity = (customerCityEl?.value || "").trim();
  const clientComment = (customerCommentEl?.value || "").trim();
  const priceTypeLabel = state.priceMode === "wholesale" ? "Mayoreo" : "Menudeo";

  const lines = [
    "Hola HAODE, quiero hacer este pedido:",
    "",
    `Cliente: ${clientName || "Sin nombre"}`,
    `Telefono: ${clientPhone || "Sin telefono"}`,
    `Ciudad: ${clientCity || "Sin ciudad"}`,
    `Tipo de precio: ${priceTypeLabel}`,
    "",
    ...items.map((item) => {
      const subtotal = priceFor(item.product) * item.quantity;
      return `- ${item.product.name} | Modelo: ${item.product.model} | Cantidad: ${item.quantity} | Subtotal (${priceLabel}): ${formatPrice(subtotal)}`;
    }),
    "",
    `Total estimado (${priceTypeLabel.toLowerCase()}): ${formatPrice(cartTotal())}`,
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
      const subtotal = priceFor(item.product) * item.quantity;
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

function setPriceMode(priceMode) {
  state.priceMode = priceMode;
  priceModeEl.value = priceMode;
  renderCart();
}

function addProduct(productId, forcedMode = null) {
  if (forcedMode && state.priceMode !== forcedMode) {
    setPriceMode(forcedMode);
  }

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
    addProduct(addWholesaleButton.dataset.addWholesale, "wholesale");
    openCart();
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

priceModeEl.addEventListener("change", (event) => {
  state.priceMode = event.target.value;
  renderCart();
});

searchProductsEl.addEventListener("input", (event) => {
  state.searchQuery = event.target.value;
  renderProducts();
});

checkoutInputs.forEach((element) => {
  element.addEventListener("input", renderCart);
});

async function init() {
  renderCategories();
  productGridEl.innerHTML = '<div class="empty-cart">Cargando productos HAODE...</div>';
  renderCart();
  await loadProducts();
  renderCategories();
  renderProducts();
  renderCart();
}

init().catch((error) => {
  console.error("No se pudo iniciar HAODE app:", error);
  productGridEl.innerHTML = '<div class="empty-cart">No se pudieron cargar los productos. Intenta de nuevo por WhatsApp.</div>';
});
