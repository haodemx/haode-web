const WHATSAPP_NUMBER = "523326684296";

const categories = [
  { id: "pantallas", label: "Pantallas" },
  { id: "micas", label: "Micas" },
  { id: "gafas-ai", label: "Gafas AI" },
  { id: "fundas", label: "Fundas" }
];

const products = [
  {
    id: "iphone-11-incell",
    category: "pantallas",
    name: "Pantalla para iPhone 11",
    model: "iPhone 11 INCELL FHD",
    publicPrice: 180,
    wholesalePrice: 170,
    image: "/haode-web/assets/products/iphone-incell/11/main.jpg"
  },
  {
    id: "iphone-13-incell",
    category: "pantallas",
    name: "Pantalla para iPhone 13",
    model: "iPhone 13 INCELL FHD",
    publicPrice: 350,
    wholesalePrice: 320,
    image: "/haode-web/assets/products/iphone-incell/13/main.jpg"
  },
  {
    id: "samsung-s23-ultra-incell",
    category: "pantallas",
    name: "Pantalla Samsung S23 Ultra",
    model: "S23 Ultra INCELL",
    publicPrice: 800,
    wholesalePrice: 680,
    image: "/haode-web/assets/products/samsung-incell/s23-ultra/main.jpg"
  },
  {
    id: "micas-hd-clear",
    category: "micas",
    name: "Micas HD Clear",
    model: "Paquete 50 piezas",
    publicPrice: 450,
    wholesalePrice: 375,
    image: "/haode-web/assets/products/micas-hd-clear/main.png"
  },
  {
    id: "micas-mate",
    category: "micas",
    name: "Micas Mate",
    model: "Peliculas para corte",
    publicPrice: 450,
    wholesalePrice: 375,
    image: "/haode-web/assets/products/home-cut-machine/micas-mate.svg"
  },
  {
    id: "micas-privacidad",
    category: "micas",
    name: "Micas Privacidad",
    model: "Peliculas privacy",
    publicPrice: 500,
    wholesalePrice: 420,
    image: "/haode-web/assets/products/home-cut-machine/micas-privacidad.svg"
  },
  {
    id: "w630-ai-pro",
    category: "gafas-ai",
    name: "W630 AI PRO",
    model: "Gafas AI blancas",
    publicPrice: 1900,
    wholesalePrice: 1600,
    image: "/haode-web/assets/products/productos-ai/w630-ai-smart-glasses/main.jpg"
  },
  {
    id: "aimb-g5-ai-sports",
    category: "gafas-ai",
    name: "AIMB-G5 AI SPORTS",
    model: "Gafas AI deportivas",
    publicPrice: 1800,
    wholesalePrice: 1400,
    image: "/haode-web/assets/products/productos-ai/aimb-g5-ai-smart-glasses/main.jpg"
  },
  {
    id: "s1-ai-classic",
    category: "gafas-ai",
    name: "HAODE AI CLASSIC S1",
    model: "Gafas AI classic",
    publicPrice: 1500,
    wholesalePrice: 1200,
    image: "/haode-web/assets/products/productos-ai/s1-ai-classic/main.png"
  },
  {
    id: "funda-premium-17-pro-max",
    category: "fundas",
    name: "Funda Premium Aluminio",
    model: "Estilo iPhone 17 Pro Max",
    publicPrice: 85,
    wholesalePrice: 75,
    image: "/haode-web/assets/products/fundas/funda-premium-aluminio-estilo-iphone-17-pro-max/main.jpg"
  },
  {
    id: "funda-magnetica-17-pro-max",
    category: "fundas",
    name: "Funda Magnetica",
    model: "Estilo iPhone 17 Pro Max",
    publicPrice: 100,
    wholesalePrice: 90,
    image: "/haode-web/assets/products/fundas/funda-magnetica-estilo-iphone-17-pro-max/azul-silicon.jpg"
  }
];

const state = {
  activeCategory: categories[0].id,
  priceMode: "public",
  cart: new Map()
};

const money = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0
});

const categoryEl = document.querySelector("[data-categories]");
const productGridEl = document.querySelector("[data-product-grid]");
const productCountEl = document.querySelector("[data-product-count]");
const priceModeEl = document.querySelector("[data-price-mode]");
const cartDrawerEl = document.querySelector("[data-cart-drawer]");
const cartItemsEl = document.querySelector("[data-cart-items]");
const cartTotalEl = document.querySelector("[data-cart-total]");
const whatsappLinkEl = document.querySelector("[data-whatsapp-link]");
const cartCountEls = document.querySelectorAll("[data-cart-count], [data-cart-count-bottom]");

function priceFor(product) {
  return state.priceMode === "wholesale" ? product.wholesalePrice : product.publicPrice;
}

function formatPrice(value) {
  return `${money.format(value)} MXN`;
}

function renderCategories() {
  categoryEl.innerHTML = categories
    .map((category) => {
      const active = category.id === state.activeCategory ? " active" : "";
      return `<button class="${active}" type="button" data-category="${category.id}">${category.label}</button>`;
    })
    .join("");
}

function renderProducts() {
  const visibleProducts = products.filter((product) => product.category === state.activeCategory);

  productCountEl.textContent = `${visibleProducts.length} productos`;
  productGridEl.innerHTML = visibleProducts
    .map((product) => {
      return `
        <article class="product-card">
          <div class="product-media">
            <img src="${product.image}" alt="${product.name}" loading="lazy" />
          </div>
          <div class="product-info">
            <h3>${product.name}</h3>
            <p class="model">Modelo: ${product.model}</p>
            <div class="price-lines">
              <span>Precio publico <strong>${formatPrice(product.publicPrice)}</strong></span>
              <span>Precio mayoreo <strong>${formatPrice(product.wholesalePrice)}</strong></span>
            </div>
            <button class="add-button" type="button" data-add-product="${product.id}">Agregar</button>
          </div>
        </article>
      `;
    })
    .join("");
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
  const lines = [
    "Hola HAODE, quiero hacer este pedido:",
    "",
    ...items.map((item) => {
      const subtotal = priceFor(item.product) * item.quantity;
      return `- ${item.product.name} | Modelo: ${item.product.model} | Cantidad: ${item.quantity} | Subtotal ${priceLabel}: ${formatPrice(subtotal)}`;
    }),
    "",
    `Total estimado (${priceLabel}): ${formatPrice(cartTotal())}`,
    "",
    "Por favor confirma disponibilidad, precio final y envio. Entiendo que no hay pago en linea y se confirma por WhatsApp."
  ];

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
}

function renderCart() {
  const items = getCartItems();
  const totalItems = cartCount();

  cartCountEls.forEach((el) => {
    el.textContent = String(totalItems);
  });

  if (!items.length) {
    cartItemsEl.innerHTML = '<div class="empty-cart">Tu carrito esta vacio. Agrega productos para enviar el pedido por WhatsApp.</div>';
    cartTotalEl.textContent = formatPrice(0);
    whatsappLinkEl.href = "#";
    whatsappLinkEl.classList.add("disabled");
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
  whatsappLinkEl.href = buildWhatsappUrl();
  whatsappLinkEl.classList.remove("disabled");
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

renderCategories();
renderProducts();
renderCart();
