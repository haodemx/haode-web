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

let auth;
let db;
let firebaseReady = false;
let currentProducts = [];

const sampleProducts = [
  {
    docId: "iphone-oled-sample",
    data: {
      categoria: "pantallas",
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
      categoria: "pantallas",
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
      categoria: "pantallas",
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
      categoria: "pantallas",
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

    showAdmin();
    await loadProducts();
    await seedSampleProductsIfEmpty();
  });
}

function showLogin() {
  loginPanel.hidden = false;
  adminPanel.hidden = true;
  logoutButton.hidden = true;
}

function showAdmin() {
  loginPanel.hidden = true;
  adminPanel.hidden = false;
  logoutButton.hidden = false;
}

function productFromForm() {
  const formData = new FormData(productForm);
  const id = String(formData.get("id") || "").trim();

  return {
    docId: String(formData.get("docId") || id).trim(),
    data: {
      id,
      categoria: String(formData.get("categoria") || "pantallas"),
      nombre: String(formData.get("nombre") || "").trim(),
      modelo: String(formData.get("modelo") || "").trim(),
      descripcion: String(formData.get("descripcion") || "").trim(),
      precioPublico: Number(formData.get("precioPublico") || 0),
      precioMayoreo: Number(formData.get("precioMayoreo") || 0),
      imagen: String(formData.get("imagen") || "").trim(),
      stock: String(formData.get("stock") || "Consultar").trim(),
      activo: formData.get("activo") === "on",
      orden: Number(formData.get("orden") || 9999),
      updatedAt: window.HAODE_FIREBASE.firestoreModule.serverTimestamp()
    }
  };
}

function fillForm(product) {
  productForm.elements.docId.value = product.docId || product.id;
  productForm.elements.id.value = product.id || "";
  productForm.elements.categoria.value = product.categoria || "pantallas";
  productForm.elements.nombre.value = product.nombre || "";
  productForm.elements.modelo.value = product.modelo || "";
  productForm.elements.descripcion.value = product.descripcion || "";
  productForm.elements.precioPublico.value = product.precioPublico ?? 0;
  productForm.elements.precioMayoreo.value = product.precioMayoreo ?? 0;
  productForm.elements.imagen.value = product.imagen || "";
  productForm.elements.stock.value = product.stock || "";
  productForm.elements.orden.value = product.orden ?? 9999;
  productForm.elements.activo.checked = product.activo !== false;
  formTitle.textContent = "Editar producto";
  setStatus(formStatus, "");
  productForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

function resetForm() {
  productForm.reset();
  productForm.elements.docId.value = "";
  productForm.elements.categoria.value = "pantallas";
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

  const { doc, serverTimestamp, writeBatch } = window.HAODE_FIREBASE.firestoreModule;
  const batch = writeBatch(db);

  sampleProducts.forEach((product) => {
    batch.set(doc(db, "products", product.docId), {
      ...product.data,
      updatedAt: serverTimestamp()
    }, { merge: true });
  });

  productList.innerHTML = '<div class="admin-card"><p>Creando productos de ejemplo...</p></div>';
  await batch.commit();
  await loadProducts();
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

  if (!docId || !data.id || !data.nombre || !data.modelo || !data.imagen) {
    setStatus(formStatus, "Completa ID, nombre, modelo e imagen.", "error");
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

setupFirebase().catch((error) => {
  configNotice.hidden = false;
  setStatus(loginStatus, `No se pudo cargar Firebase: ${error.message}`, "error");
});
