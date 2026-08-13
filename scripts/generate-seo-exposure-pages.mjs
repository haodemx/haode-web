import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const SITE_URL = "https://haode.com.mx";
const WHATSAPP = "523326684296";

const pages = [
  {
    slug: "pantallas-iphone-incell-mayoreo-mexico",
    title: "Pantallas iPhone INCELL de mayoreo en Mexico | HAODE",
    meta: "Pantallas iPhone INCELL de mayoreo en Mexico para tecnicos y talleres. Confirma modelo, cantidad, disponibilidad y precio por WhatsApp con HAODE.",
    ogImage: "/assets/products/iphone-incell/main.jpg",
    kicker: "iPhone INCELL",
    h1: "Pantallas iPhone INCELL de mayoreo",
    hero: "Entrada directa para talleres que compran modelos iPhone de alta rotacion. Separa version, cantidad y ciudad para confirmar disponibilidad, precio aplicable y envio.",
    campaign: "iphone_incell_mayoreo",
    appPath: "/app/?utm_source=seo&utm_medium=organic&utm_campaign=iphone_incell_mayoreo&utm_content=landing_cta#categoria/Pantallas%20iPhone%20INCELL",
    whatsappPrompt: "Hola HAODE Mexico, quiero cotizar pantallas iPhone INCELL.\nModelos:\nCantidad:\nCiudad:\n¿Me pueden confirmar disponibilidad, precio por cantidad y envio?",
    proof: ["iPhone X a 17", "INCELL por modelo", "Cotizacion por cantidad"],
    cards: [
      ["Modelos de rotacion", "iPhone 11, XR, 12, 13, 14, 15 y 16 se consultan por modelo exacto.", "/categoria/iphone-incell/"],
      ["Lista grande", "Para surtido, envia varios modelos y cantidades en una sola lista.", "/app/#lista"],
      ["Evita errores", "Confirma si necesitas version estandar, Pro, Pro Max o variantes especiales.", "/pantallas-iphone-11-xr-mayoreo/"]
    ],
    faq: [
      ["¿HAODE vende pantallas iPhone INCELL para mayoreo?", "Si. HAODE publica pantallas iPhone INCELL para talleres, tiendas y distribuidores. La disponibilidad y el precio final se confirman por WhatsApp."],
      ["¿Como cotizo varios modelos?", "Envia modelo, version, cantidad y ciudad. Si compras surtido, manda la lista completa para revisar la escala aplicable."],
      ["¿La pagina confirma stock exacto?", "No. La pagina ayuda a elegir la linea correcta; el stock y el envio se confirman antes de cerrar el pedido."]
    ]
  },
  {
    slug: "pantallas-iphone-oled-mayoreo-mexico",
    title: "Pantallas iPhone OLED de mayoreo en Mexico | HAODE",
    meta: "Pantallas iPhone OLED de mayoreo en Mexico para modelos Pro y Pro Max. Consulta calidad, cantidad, disponibilidad y precio por WhatsApp.",
    ogImage: "/assets/products/iphone-oled/main.jpg",
    kicker: "iPhone OLED",
    h1: "Pantallas iPhone OLED para compra profesional",
    hero: "Pagina para clientes que buscan lineas OLED para iPhone. Antes de comprar, confirma modelo, calidad, cantidad y ciudad para evitar diferencias entre versiones.",
    campaign: "iphone_oled_mayoreo",
    appPath: "/app/?utm_source=seo&utm_medium=organic&utm_campaign=iphone_oled_mayoreo&utm_content=landing_cta#categoria/Pantallas%20iPhone%20OLED",
    whatsappPrompt: "Hola HAODE Mexico, quiero cotizar pantallas iPhone OLED.\nModelos:\nCalidad:\nCantidad:\nCiudad:\n¿Me pueden confirmar disponibilidad, precio por cantidad y envio?",
    proof: ["OLED por modelo", "Pro y Pro Max", "Confirmacion por WhatsApp"],
    cards: [
      ["Modelos premium", "Consulta lineas OLED para iPhone Pro, Pro Max y modelos compatibles publicados.", "/categoria/iphone-oled/"],
      ["Comparar con INCELL", "Si el cliente busca precio o rotacion, revisa tambien la linea INCELL.", "/pantallas-iphone-incell-mayoreo-mexico/"],
      ["Pedido por lista", "Usa la App para armar varias referencias y enviarlas por WhatsApp.", "/app/#lista"]
    ],
    faq: [
      ["¿Que debo confirmar antes de comprar iPhone OLED?", "Modelo exacto, calidad, cantidad, disponibilidad, precio final y ciudad de envio."],
      ["¿HAODE confirma compatibilidad automaticamente?", "No. La compatibilidad se revisa por modelo y version antes de cerrar el pedido."],
      ["¿Puedo mandar una lista completa?", "Si. Para mayoreo, es mejor enviar todos los modelos y cantidades juntos por WhatsApp."]
    ]
  },
  {
    slug: "pantallas-samsung-incell-mayoreo-mexico",
    title: "Pantallas Samsung INCELL de mayoreo en Mexico | HAODE",
    meta: "Pantallas Samsung INCELL de mayoreo en Mexico para Galaxy S, Note y Plus. Cotiza modelo, cantidad, disponibilidad y envio por WhatsApp.",
    ogImage: "/assets/products/samsung-incell/main.jpg",
    kicker: "Samsung INCELL",
    h1: "Pantallas Samsung INCELL de mayoreo",
    hero: "Entrada para talleres que compran Galaxy INCELL por modelo. Separa Samsung INCELL de OLED y TIPO ORIGINAL antes de cotizar.",
    campaign: "samsung_incell_mayoreo",
    appPath: "/app/?utm_source=seo&utm_medium=organic&utm_campaign=samsung_incell_mayoreo&utm_content=landing_cta#categoria/Pantallas%20Samsung%20INCELL",
    whatsappPrompt: "Hola HAODE Mexico, quiero cotizar pantallas Samsung INCELL.\nModelos Galaxy:\nCantidad:\nCiudad:\n¿Me pueden confirmar disponibilidad, precio por cantidad y envio?",
    proof: ["Galaxy S y Note", "INCELL separado", "Lista por modelo"],
    cards: [
      ["Galaxy S", "Consulta modelos S8, S9, S10, S20, S21, S22, S23 y S24 segun publicacion.", "/categoria/samsung-incell/"],
      ["Galaxy Note", "Revisa modelos Note publicados y confirma si necesitas version Plus o Ultra.", "/categoria/samsung-incell/"],
      ["Otras calidades", "Si necesitas OLED o TIPO ORIGINAL, usa la pagina Samsung de mayoreo.", "/pantallas-samsung-mayoreo-mexico/"]
    ],
    faq: [
      ["¿Samsung INCELL es lo mismo que OLED?", "No. Son lineas diferentes. El cliente debe indicar calidad, modelo y cantidad antes de cotizar."],
      ["¿Se puede cotizar por WhatsApp?", "Si. Envia modelos Galaxy, cantidades y ciudad para revisar disponibilidad y precio aplicable."],
      ["¿La pagina muestra todo el inventario exacto?", "No. La pagina organiza la busqueda; el inventario se confirma por WhatsApp."]
    ]
  },
  {
    slug: "pantallas-samsung-zflip-zfold-original-mexico",
    title: "Pantallas Samsung Z Flip y Z Fold TIPO ORIGINAL | HAODE",
    meta: "Pantallas Samsung Z Flip y Z Fold TIPO ORIGINAL en Mexico. Cotiza modelo, version, cantidad, disponibilidad y envio por WhatsApp.",
    ogImage: "/assets/products/samsung-original/z-flip5/main.png",
    kicker: "Z Flip y Z Fold",
    h1: "Samsung Z Flip y Z Fold TIPO ORIGINAL",
    hero: "Busqueda enfocada en plegables Samsung. Estos modelos requieren confirmar serie, version y calidad antes de preparar una cotizacion.",
    campaign: "samsung_zflip_zfold_original",
    appPath: "/app/?utm_source=seo&utm_medium=organic&utm_campaign=samsung_zflip_zfold_original&utm_content=landing_cta#categoria/Pantallas%20Samsung%20Original",
    whatsappPrompt: "Hola HAODE Mexico, quiero cotizar pantallas Samsung Z Flip o Z Fold.\nModelo:\nVersion:\nCantidad:\nCiudad:\n¿Me pueden confirmar disponibilidad, calidad, precio y envio?",
    proof: ["Z Flip", "Z Fold", "TIPO ORIGINAL"],
    cards: [
      ["Z Flip", "Consulta modelos Z Flip publicados y confirma generacion exacta.", "/producto/samsung-original-z-flip5/"],
      ["Z Fold", "Revisa plegables Z Fold por generacion antes de cotizar.", "/producto/samsung-original-z-fold5/"],
      ["Samsung TIPO ORIGINAL", "Ver toda la familia Samsung TIPO ORIGINAL con marco.", "/categoria/samsung-tipo-original/"]
    ],
    faq: [
      ["¿Por que confirmar version en Z Flip y Z Fold?", "Los plegables pueden variar por generacion y presentacion. Se debe revisar modelo exacto antes de cotizar."],
      ["¿Puedo pedir varias generaciones juntas?", "Si. Envia cada modelo, cantidad y ciudad en una sola lista por WhatsApp."],
      ["¿HAODE publica precio final automatico para plegables?", "La pagina dirige la consulta; disponibilidad, precio final y envio se confirman antes del pedido."]
    ]
  },
  {
    slug: "fundas-celular-mayoreo-mexico",
    title: "Fundas para celular de mayoreo en Mexico | HAODE",
    meta: "Fundas para celular de mayoreo en Mexico para tiendas y tecnicos. Consulta modelos, cantidades y disponibilidad por WhatsApp.",
    ogImage: "/assets/images/home-categories/fundas-accesorios.jpg",
    kicker: "Fundas y accesorios",
    h1: "Fundas para celular de mayoreo",
    hero: "Pagina para productos de rotacion en tienda. Usa WhatsApp para confirmar modelos, cantidades y condiciones antes de preparar el pedido.",
    campaign: "fundas_mayoreo",
    appPath: "/app/?utm_source=seo&utm_medium=organic&utm_campaign=fundas_mayoreo&utm_content=landing_cta#categoria/Fundas",
    whatsappPrompt: "Hola HAODE Mexico, quiero cotizar fundas por mayoreo.\nModelos:\nCantidad:\nCiudad:\n¿Me pueden confirmar disponibilidad y precio por cantidad?",
    proof: ["Rotacion en tienda", "Modelos por confirmar", "Pedido por lista"],
    cards: [
      ["Fundas publicadas", "Revisa modelos activos antes de enviar lista grande.", "/categoria/fundas/"],
      ["Combinar con micas", "Para venta en tienda, combina fundas con micas y accesorios.", "/micas.html"],
      ["Lista por WhatsApp", "Manda modelo, cantidad y ciudad para preparar cotizacion.", "/app/#lista"]
    ],
    faq: [
      ["¿HAODE vende fundas por mayoreo?", "Si. Los modelos publicados se pueden consultar por cantidad y disponibilidad."],
      ["¿Puedo pedir surtido?", "Si. Envia lista con modelos y cantidades para revisar disponibilidad."],
      ["¿Debo poner precio en publicaciones?", "No agregues precios no confirmados. El precio aplicable se confirma por WhatsApp."]
    ]
  },
  {
    slug: "micas-hidrogel-mayoreo-mexico",
    title: "Micas e hidrogel de mayoreo en Mexico | HAODE",
    meta: "Micas, hidrogel y maquinas para tiendas en Mexico. Consulta modelos, consumibles, disponibilidad y condiciones por WhatsApp.",
    ogImage: "/assets/images/home-categories/maquinas-micas.jpg",
    kicker: "Micas e hidrogel",
    h1: "Micas e hidrogel para tiendas",
    hero: "Entrada para tiendas que venden proteccion de pantalla. Consulta micas, maquinas y consumibles con modelo, cantidad y ciudad.",
    campaign: "micas_hidrogel_mayoreo",
    appPath: "/app/?utm_source=seo&utm_medium=organic&utm_campaign=micas_hidrogel_mayoreo&utm_content=landing_cta#categoria/Micas",
    whatsappPrompt: "Hola HAODE Mexico, quiero cotizar micas o hidrogel.\nProducto:\nCantidad:\nCiudad:\n¿Me pueden confirmar disponibilidad y condiciones?",
    proof: ["Micas", "Hidrogel", "Maquinas"],
    cards: [
      ["Micas publicadas", "Revisa las opciones disponibles para venta y reparacion.", "/micas.html"],
      ["Maquinas de hidrogel", "Consulta maquinas y accesorios para tiendas.", "/categoria/maquinas-de-hidrogel/"],
      ["Cotizacion rapida", "Envia producto, cantidad y ciudad por WhatsApp.", "/app/#lista"]
    ],
    faq: [
      ["¿HAODE vende micas e hidrogel?", "Si. La pagina publica micas, maquinas y productos relacionados para tiendas y tecnicos."],
      ["¿La disponibilidad es inmediata?", "Debe confirmarse por WhatsApp antes de preparar el pedido."],
      ["¿Que datos debo enviar?", "Producto, modelo si aplica, cantidad y ciudad."]
    ]
  }
];

function absolute(assetPath) {
  return `${SITE_URL}${assetPath}`;
}

function whatsappLink(prompt) {
  const requiredClose = "Por favor confirmen stock en México, precio por cantidad, garantía local y envío antes de preparar el pedido.";
  const message = /stock en M[eé]xico/i.test(prompt) && /precio por cantidad/i.test(prompt) && /garant[ií]a local/i.test(prompt) && /env[ií]o/i.test(prompt)
    ? prompt
    : `${prompt}\n${requiredClose}`;
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`;
}

function jsonLdFor(page) {
  const url = `${SITE_URL}/${page.slug}/`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "name": page.h1,
        "url": url,
        "description": page.meta
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Inicio", "item": `${SITE_URL}/` },
          { "@type": "ListItem", "position": 2, "name": page.h1, "item": url }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": page.faq.map(([question, answer]) => ({
          "@type": "Question",
          "name": question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": answer
          }
        }))
      }
    ]
  };
}

function cardMarkup(cards) {
  return cards.map(([title, text, href]) => (
    `          <article class="high-end-seo-card"><h3>${title}</h3><p>${text}</p><a href="${href}">Ver ruta</a></article>`
  )).join("\n");
}

function faqMarkup(page) {
  return page.faq.map(([question, answer]) => (
    `          <article class="trust-card"><strong>${question}</strong><span>${answer}</span></article>`
  )).join("\n");
}

function renderPage(page) {
  const url = `${SITE_URL}/${page.slug}/`;
  const wa = whatsappLink(page.whatsappPrompt);
  const proof = page.proof.map((item) => `<span>${item}</span>`).join("");
  return `<!DOCTYPE html>
<html lang="es-MX">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="${page.meta}" />
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="HAODE MÉXICO" />
  <meta property="og:title" content="${page.title}" />
  <meta property="og:description" content="${page.meta}" />
  <meta property="og:image" content="${absolute(page.ogImage)}" />
  <meta property="og:url" content="${url}" />
  <link rel="canonical" href="${url}" />
  <title>${page.title}</title>
  <link rel="icon" href="/assets/logo/favicon.png" type="image/png" />
  <link rel="stylesheet" href="/style.css?v=20260813-editorial-release" />
  <script type="application/ld+json">
${JSON.stringify(jsonLdFor(page), null, 2)}
  </script>
</head>
<body class="new-page seo-conversion-page conversion-reference-page seo-exposure-page">
  <header class="topbar catalog-topbar">
    <div class="wrap topbar-inner">
      <a class="brand" href="/" aria-label="HAODE MÉXICO"><img class="brand-logo" src="/assets/logo/logo.png" alt="Logo oficial de HAODE" /><span class="brand-copy"><strong>HAODE</strong><small>MÉXICO</small></span></a>
      <nav class="topnav" aria-label="Navegación principal"><a href="/">Inicio</a><a href="/productos/">Productos</a><a href="/app/">App</a><a href="/distribuidores/">Distribuidores</a><a href="/contacto/">Contacto</a></nav>
    </div>
  </header>

  <main>
    <section class="new-page-hero">
      <div class="wrap new-page-hero-inner">
        <div>
          <p class="section-kicker">${page.kicker}</p>
          <h1>${page.h1}</h1>
          <p class="hero-text">${page.hero}</p>
          <div class="reference-conversion-strip" aria-label="Ventajas HAODE">
            <span><strong>Stock en México</strong><small>Bajo confirmación</small></span>
            <span><strong>Precio por cantidad</strong><small>Según lista aprobada</small></span>
            <span><strong>WhatsApp privado</strong><small>Modelo y cantidad</small></span>
            <span><strong>Soporte local</strong><small>Antes del pedido</small></span>
          </div>
        </div>
        <div class="new-page-links">
          <a class="btn btn-primary" href="${wa}" target="_blank" rel="noopener noreferrer">Cotizar por WhatsApp</a>
          <a class="btn btn-primary" href="${page.appPath}">Abrir en App</a>
          <a class="btn btn-secondary" href="/productos/">Ver catálogo</a>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap section-shell">
        <div class="reference-conversion-panel detail-conversion-panel" data-reference-conversion="seo-${page.campaign}">
          <img src="${page.ogImage}" alt="${page.h1} HAODE" loading="eager" decoding="async" />
          <div>
            <p class="reference-panel-kicker">Busqueda de compra</p>
            <h2>Confirma modelo, cantidad y ciudad antes de preparar pedido</h2>
            <p>HAODE atiende por WhatsApp para revisar disponibilidad, precio final aplicable, soporte local y envio antes de cerrar la compra.</p>
            <div class="reference-panel-proof">${proof}</div>
          </div>
          <a class="reference-btn reference-btn-whatsapp" href="${wa}" target="_blank" rel="noopener noreferrer">Enviar lista</a>
        </div>

        <div class="high-end-seo-grid" aria-label="Rutas relacionadas">
${cardMarkup(page.cards)}
        </div>
      </div>
    </section>

    <section class="reference-section" aria-labelledby="faq-${page.slug}">
      <div class="reference-wrap">
        <div class="reference-section-head">
          <h2 id="faq-${page.slug}">Preguntas frecuentes</h2>
          <a href="/guia-ia-haode-mexico/">Guía oficial HAODE</a>
        </div>
        <div class="trust-grid">
${faqMarkup(page)}
        </div>
      </div>
    </section>
  </main>

  <script src="/campaign-attribution.js?v=20260727-exposure-pages"></script>
  <script src="/detail-header.js?v=20260727-exposure-pages"></script>
  <script src="/site-footer.js?v=20260727-exposure-pages"></script>
</body>
</html>
`;
}

export async function writeSeoExposurePages() {
  const written = [];
  for (const page of pages) {
    const dir = path.join(ROOT, page.slug);
    await fs.mkdir(dir, { recursive: true });
    const file = path.join(dir, "index.html");
    await fs.writeFile(file, renderPage(page));
    written.push(file);
  }
  return written;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const written = await writeSeoExposurePages();
  console.log(written.map((file) => path.relative(ROOT, file)).join("\n"));
}
