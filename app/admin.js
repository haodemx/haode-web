import { firebaseAdminEmails, firebaseConfig, isFirebaseConfigured } from "./firebase-config.js";

const loginPanel = document.querySelector("[data-login-panel]");
const adminPanel = document.querySelector("[data-admin-panel]");
const configNotice = document.querySelector("[data-config-notice]");
const loginForm = document.querySelector("[data-login-form]");
const loginStatus = document.querySelector("[data-login-status]");
const logoutButton = document.querySelector("[data-logout]");
const productForm = document.querySelector("[data-product-form]");
const formTitle = document.querySelector("[data-form-title]");
const formStatus = document.querySelector("[data-form-status]");
const productList = document.querySelector("[data-admin-products]");
const refreshButton = document.querySelector("[data-refresh]");
const newProductButton = document.querySelector("[data-new-product]");
const adminEmailEl = document.querySelector("[data-admin-email]");
const adminStatus = document.querySelector("[data-admin-status]");
const syncSamplesButton = document.querySelector("[data-sync-samples]");
const importJsonButton = document.querySelector("[data-import-json]");
const importRealButton = document.querySelector("[data-import-real]");
const bulkActiveButton = document.querySelector("[data-bulk-active]");
const bulkInactiveButton = document.querySelector("[data-bulk-inactive]");

let auth;
let db;
let firebaseReady = false;
let currentProducts = [];
const defaultCategory = "Pantallas iPhone OLED";

const sampleProducts = [
  {
    docId: "iphone-oled-sample",
    data: {
      id: "iphone-oled-sample",
      categoria: "Pantallas iPhone OLED",
      nombre: "iPhone OLED",
      modelo: "Serie iPhone OLED",
      descripcion: "Pantalla OLED para modelos iPhone seleccionados. Producto de ejemplo para iniciar Firestore.",
      precioPublico: 850,
      precioMayoreo: 720,
      imagen: "/haode-web/assets/products/iphone-oled/main.jpg",
      stock: "disponible",
      activo: true,
      orden: 1
    }
  },
  {
    docId: "iphone-incell-sample",
    data: {
      id: "iphone-incell-sample",
      categoria: "Pantallas iPhone INCELL",
      nombre: "iPhone INCELL",
      modelo: "Serie iPhone INCELL FHD",
      descripcion: "Pantalla INCELL para reparacion y mayoreo. Producto de ejemplo para iniciar Firestore.",
      precioPublico: 350,
      precioMayoreo: 300,
      imagen: "/haode-web/assets/products/iphone-incell/main.jpg",
      stock: "disponible",
      activo: true,
      orden: 2
    }
  },
  {
    docId: "samsung-amoled-sample",
    data: {
      id: "samsung-amoled-sample",
      categoria: "Pantallas Samsung AMOLED",
      nombre: "Samsung AMOLED",
      modelo: "Serie Samsung AMOLED",
      descripcion: "Pantalla AMOLED Samsung para talleres y distribuidores. Producto de ejemplo para iniciar Firestore.",
      precioPublico: 1200,
      precioMayoreo: 980,
      imagen: "/haode-web/assets/products/samsung-oled/main.jpg",
      stock: "disponible",
      activo: true,
      orden: 3
    }
  },
  {
    docId: "samsung-incell-sample",
    data: {
      id: "samsung-incell-sample",
      categoria: "Pantallas Samsung INCELL",
      nombre: "Samsung INCELL",
      modelo: "Serie Samsung INCELL",
      descripcion: "Pantalla Samsung INCELL para rotacion de taller. Producto de ejemplo para iniciar Firestore.",
      precioPublico: 650,
      precioMayoreo: 560,
      imagen: "/haode-web/assets/products/samsung-incell/main.jpg",
      stock: "disponible",
      activo: true,
      orden: 4
    }
  }
];

function setStatus(element, message, type = "") {
  element.textContent = message;
  element.className = `status-text ${type}`.trim();
}

function normalizeKey(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeStock(stock) {
  const value = String(stock || "disponible").trim().toLowerCase();

  if (value === "bajo pedido" || value === "agotado") {
    return value;
  }

  return "disponible";
}

function productJsonToFirestore(product, fallbackOrder) {
  return {
    id: String(product.id || "").trim(),
    categoria: product.categoria || product.category || defaultCategory,
    nombre: product.nombre || product.name || "Producto HAODE",
    modelo: product.modelo || product.model || "Consultar modelo",
    descripcion: product.descripcion || product.description || "",
    precioPublico: Number(product.precioPublico ?? product.publicPrice ?? 0),
    precioMayoreo: Number(product.precioMayoreo ?? product.wholesalePrice ?? 0),
    imagen: product.imagen || product.image || "/haode-web/assets/products/placeholder.svg",
    stock: normalizeStock(product.stock),
    activo: product.activo !== false,
    orden: Number(product.orden ?? product.order ?? fallbackOrder)
  };
}

function isAllowedAdmin(user) {
  return Boolean(user?.email && firebaseAdminEmails.includes(user.email));
}

async function setupFirebase() {
  if (!isFirebaseConfigured()) {
    configNotice.hidden = false;
    setStatus(loginStatus, "Firebase no esta configurado. Completa firebase-config.js.", "error");
    return;
  }

  const [{ initializeApp }, authModule, firestoreModule] = await Promise.all([
    import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js"),
    import("https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js"),
    import("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js")
  ]);

  const app = initializeApp(firebaseConfig);
  auth = authModule.getAuth(app);
  db = firestoreModule.getFirestore(app);
  window.HAODE_FIREBASE = { authModule, firestoreModule };
  firebaseReady = true;

  authModule.onAuthStateChanged(auth, async (user) => {
    if (!user) {
      showLogin();
      return;
    }

    if (!isAllowedAdmin(user)) {
      setStatus(loginStatus, `El correo ${user.email} no esta en la lista de administradores.`, "error");
      await authModule.signOut(auth);
      showLogin();
      return;
    }

    showAdmin(user);
    await loadProducts();
    await seedSampleProductsIfEmpty();
  });
}

function showLogin() {
  loginPanel.hidden = false;
  adminPanel.hidden = true;
  logoutButton.hidden = true;
  adminEmailEl.textContent = "Administrador";
}

function showAdmin(user) {
  loginPanel.hidden = true;
  adminPanel.hidden = false;
  logoutButton.hidden = false;
  adminEmailEl.textContent = user?.email || "Administrador";
}

function productFromForm() {
  const formData = new FormData(productForm);
  const id = String(formData.get("id") || "").trim();

  return {
    docId: String(formData.get("docId") || id).trim(),
    data: {
      id,
      categoria: String(formData.get("categoria") || defaultCategory),
      nombre: String(formData.get("nombre") || "").trim(),
      modelo: String(formData.get("modelo") || "").trim(),
      descripcion: String(formData.get("descripcion") || "").trim(),
      precioPublico: Number(formData.get("precioPublico") || 0),
      precioMayoreo: Number(formData.get("precioMayoreo") || 0),
      imagen: String(formData.get("imagen") || "").trim(),
      stock: normalizeStock(formData.get("stock")),
      activo: formData.get("activo") === "on",
      orden: Number(formData.get("orden") || 9999),
      updatedAt: window.HAODE_FIREBASE.firestoreModule.serverTimestamp()
    }
  };
}

function fillForm(product) {
  productForm.elements.docId.value = product.docId || product.id;
  productForm.elements.id.value = product.id || "";
  productForm.elements.categoria.value = product.categoria || defaultCategory;
  productForm.elements.nombre.value = product.nombre || "";
  productForm.elements.modelo.value = product.modelo || "";
  productForm.elements.descripcion.value = product.descripcion || "";
  productForm.elements.precioPublico.value = product.precioPublico ?? 0;
  productForm.elements.precioMayoreo.value = product.precioMayoreo ?? 0;
  productForm.elements.imagen.value = product.imagen || "";
  productForm.elements.stock.value = normalizeStock(product.stock);
  productForm.elements.orden.value = product.orden ?? 9999;
  productForm.elements.activo.checked = product.activo !== false;
  formTitle.textContent = "Editar producto";
  setStatus(formStatus, "");
  productForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

function resetForm() {
  productForm.reset();
  productForm.elements.docId.value = "";
  productForm.elements.categoria.value = defaultCategory;
  productForm.elements.activo.checked = true;
  productForm.elements.orden.value = "100";
  formTitle.textContent = "Nuevo producto";
  setStatus(formStatus, "");
}

function renderProducts() {
  if (!currentProducts.length) {
    productList.innerHTML = '<div class="admin-card"><p>No hay productos en Firestore.</p></div>';
    return;
  }

  productList.innerHTML = currentProducts.map((product) => {
    const activeClass = product.activo === false ? " off" : "";
    const activeLabel = product.activo === false ? "Inactivo" : "Activo";

    return `
      <article class="admin-card">
        <div class="admin-card-main">
          <img src="${product.imagen || "/haode-web/assets/products/placeholder.svg"}" alt="${product.nombre || "Producto"}" loading="lazy" />
          <div>
            <h3>${product.nombre || "Producto sin nombre"}</h3>
            <p>${product.modelo || "Sin modelo"}</p>
            <p>Publico: $${product.precioPublico || 0} MXN · Mayoreo: $${product.precioMayoreo || 0} MXN</p>
          </div>
        </div>
        <div class="tag-row">
          <span class="tag">${product.categoria || "sin categoria"}</span>
          <span class="tag${activeClass}">${activeLabel}</span>
          <span class="tag">${product.stock || "stock sin definir"}</span>
          <span class="tag">Orden ${product.orden ?? 9999}</span>
        </div>
        <div class="action-row">
          <button class="secondary-button" type="button" data-edit="${product.docId}">Editar</button>
          <button class="secondary-button" type="button" data-toggle="${product.docId}">${product.activo === false ? "Subir" : "Bajar"}</button>
        </div>
      </article>
    `;
  }).join("");
}

async function loadProducts() {
  if (!firebaseReady) {
    return;
  }

  const { collection, getDocs, orderBy, query } = window.HAODE_FIREBASE.firestoreModule;
  productList.innerHTML = '<div class="admin-card"><p>Cargando productos...</p></div>';

  const snapshot = await getDocs(query(collection(db, "products"), orderBy("orden", "asc")));
  currentProducts = snapshot.docs.map((doc) => ({ docId: doc.id, ...doc.data() }));
  renderProducts();
}

async function seedSampleProductsIfEmpty() {
  if (currentProducts.length) {
    return;
  }

  await syncSampleProducts();
}

async function syncSampleProducts() {
  const { doc, serverTimestamp, writeBatch } = window.HAODE_FIREBASE.firestoreModule;
  const batch = writeBatch(db);

  sampleProducts.forEach((product) => {
    batch.set(doc(db, "products", product.docId), {
      ...product.data,
      updatedAt: serverTimestamp()
    }, { merge: true });
  });

  setStatus(adminStatus, "Sincronizando productos de ejemplo...");
  await batch.commit();
  await loadProducts();
  setStatus(adminStatus, "Productos de ejemplo sincronizados.", "ok");
}

async function importProductsJson() {
  const { doc, serverTimestamp, writeBatch } = window.HAODE_FIREBASE.firestoreModule;
  const response = await fetch("/haode-web/app/products.json", { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`No se pudo leer products.json: ${response.status}`);
  }

  const localProducts = await response.json();
  const existingIds = new Set(currentProducts.map((product) => normalizeKey(product.id || product.docId)));
  const existingDocIds = new Set(currentProducts.map((product) => normalizeKey(product.docId)));
  const existingKeys = new Set(currentProducts.map((product) => `${normalizeKey(product.categoria)}|${normalizeKey(product.modelo)}`));
  const batch = writeBatch(db);
  let imported = 0;
  let skipped = 0;

  localProducts.forEach((product, index) => {
    const data = productJsonToFirestore(product, index + 100);
    const idKey = normalizeKey(data.id);
    const productKey = `${normalizeKey(data.categoria)}|${normalizeKey(data.modelo)}`;

    if (!data.id || existingIds.has(idKey) || existingDocIds.has(idKey) || existingKeys.has(productKey)) {
      skipped += 1;
      return;
    }

    existingIds.add(idKey);
    existingDocIds.add(idKey);
    existingKeys.add(productKey);
    imported += 1;
    batch.set(doc(db, "products", data.id), {
      ...data,
      updatedAt: serverTimestamp()
    }, { merge: true });
  });

  if (!imported) {
    setStatus(adminStatus, `No hay productos nuevos para importar. Omitidos: ${skipped}.`, "ok");
    return;
  }

  setStatus(adminStatus, `Importando ${imported} productos...`);
  await batch.commit();
  await loadProducts();
  setStatus(adminStatus, `${imported} productos importados desde products.json. Omitidos: ${skipped}.`, "ok");
}

async function importRealHaodeProducts() {
  setStatus(adminStatus, "Importando catalogo real HAODE...");
  await importProductsJson();
}

async function setAllProductsActive(active) {
  if (!currentProducts.length) {
    setStatus(adminStatus, "No hay productos para actualizar.", "error");
    return;
  }

  const { doc, serverTimestamp, writeBatch } = window.HAODE_FIREBASE.firestoreModule;
  const batch = writeBatch(db);

  currentProducts.forEach((product) => {
    batch.update(doc(db, "products", product.docId), {
      activo: active,
      updatedAt: serverTimestamp()
    });
  });

  setStatus(adminStatus, active ? "Subiendo productos..." : "Bajando productos...");
  await batch.commit();
  await loadProducts();
  setStatus(adminStatus, active ? "Productos subidos." : "Productos bajados.", "ok");
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!firebaseReady) {
    setStatus(loginStatus, "Firebase no esta configurado.", "error");
    return;
  }

  const { signInWithEmailAndPassword } = window.HAODE_FIREBASE.authModule;
  const formData = new FormData(loginForm);

  try {
    setStatus(loginStatus, "Entrando...");
    await signInWithEmailAndPassword(auth, formData.get("email"), formData.get("password"));
  } catch (error) {
    setStatus(loginStatus, `No se pudo iniciar sesion: ${error.message}`, "error");
  }
});

logoutButton.addEventListener("click", async () => {
  await window.HAODE_FIREBASE.authModule.signOut(auth);
});

productForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const { doc, setDoc } = window.HAODE_FIREBASE.firestoreModule;
  const { docId, data } = productFromForm();

  if (!docId || !data.id || !data.nombre || !data.modelo) {
    setStatus(formStatus, "Completa ID, nombre y modelo.", "error");
    return;
  }

  try {
    setStatus(formStatus, "Guardando...");
    await setDoc(doc(db, "products", docId), data, { merge: true });
    setStatus(formStatus, "Producto guardado.", "ok");
    await loadProducts();
  } catch (error) {
    setStatus(formStatus, `No se pudo guardar: ${error.message}`, "error");
  }
});

productList.addEventListener("click", async (event) => {
  const editButton = event.target.closest("[data-edit]");
  const toggleButton = event.target.closest("[data-toggle]");

  if (editButton) {
    const product = currentProducts.find((item) => item.docId === editButton.dataset.edit);
    if (product) {
      fillForm(product);
    }
  }

  if (toggleButton) {
    const { doc, updateDoc } = window.HAODE_FIREBASE.firestoreModule;
    const product = currentProducts.find((item) => item.docId === toggleButton.dataset.toggle);
    if (product) {
      await updateDoc(doc(db, "products", product.docId), {
        activo: product.activo === false,
        updatedAt: window.HAODE_FIREBASE.firestoreModule.serverTimestamp()
      });
      await loadProducts();
    }
  }
});

refreshButton.addEventListener("click", loadProducts);
newProductButton.addEventListener("click", resetForm);
syncSamplesButton.addEventListener("click", async () => {
  try {
    await syncSampleProducts();
  } catch (error) {
    setStatus(adminStatus, `No se pudo sincronizar: ${error.message}`, "error");
  }
});
importJsonButton.addEventListener("click", async () => {
  try {
    await importProductsJson();
  } catch (error) {
    setStatus(adminStatus, `No se pudo importar: ${error.message}`, "error");
  }
});
importRealButton.addEventListener("click", async () => {
  try {
    await importRealHaodeProducts();
  } catch (error) {
    setStatus(adminStatus, `No se pudo importar catalogo HAODE: ${error.message}`, "error");
  }
});
bulkActiveButton.addEventListener("click", async () => {
  try {
    await setAllProductsActive(true);
  } catch (error) {
    setStatus(adminStatus, `No se pudo subir: ${error.message}`, "error");
  }
});
bulkInactiveButton.addEventListener("click", async () => {
  try {
    await setAllProductsActive(false);
  } catch (error) {
    setStatus(adminStatus, `No se pudo bajar: ${error.message}`, "error");
  }
});

setupFirebase().catch((error) => {
  configNotice.hidden = false;
  setStatus(loginStatus, `No se pudo cargar Firebase: ${error.message}`, "error");
});
