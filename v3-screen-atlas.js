(() => {
  const PHONE = '523326684296';
  const body = document.body;
  if (!body || body.dataset.v3Booted === 'true') return;
  body.dataset.v3Booted = 'true';
  if (!document.querySelector('link[href*="/v3-screen-atlas-fixes.css"]')) {
    const fixes = document.createElement('link');
    fixes.rel = 'stylesheet';
    fixes.href = '/v3-screen-atlas-fixes.css?v=20260915-d21-final';
    document.head.appendChild(fixes);
  }
  const isV3Detail = body.dataset.v3Detail === 'true';
  if (!isV3Detail) {
    body.dataset.v3Ready = 'true';
    body.classList.remove('home-page-reference', 'catalog-reference-page', 'conversion-reference-page', 'micas-reference-page', 'ai-reference-page', 'contact-reference-page');
  } else {
    const revealDetail = () => { body.dataset.v3Ready = 'true'; };
    document.addEventListener('haode:v3-detail-ready', revealDetail, { once: true });
    window.addEventListener('load', revealDetail, { once: true });
  }
  body.classList.add('v3-atlas', 'v3-lab');
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[char]));
  const asset = (path) => {
    const value = String(path || '').trim();
    if (!value || /[\u0000-\u001f\u007f"'<>`\\]/.test(value)) return '/assets/products/placeholder.svg';
    if (value.startsWith('/') && !value.startsWith('//')) return value;
    if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return '/assets/products/placeholder.svg';
    return `/${value.replace(/^\/+/, '')}`;
  };
  const quoteUrl = (subject = 'una lista de productos') => {
    const text = [
      'Hola HAODE México, quiero cotizar:',
      `Producto o lista: ${subject}`,
      'Modelo/SKU:',
      'Calidad / versión:',
      'Cantidad:',
      'Ciudad:',
      '¿Me confirman stock en México, precio por cantidad, garantía local y envío?',
    ].join('\n');
    return `https://wa.me/${PHONE}?text=${encodeURIComponent(text)}`;
  };
  const products = () => Array.isArray(window.HAODE_PRODUCTS) && window.HAODE_PRODUCTS.length
    ? window.HAODE_PRODUCTS
    : (Array.isArray(window.HAODE_PRODUCTS_DATA) ? window.HAODE_PRODUCTS_DATA : []);
  const lightSamsungCards = new Set(['samsung-original-s22-plus','samsung-original-s23-plus','samsung-original-s24-ultra','samsung-original-s25-ultra','samsung-original-z-flip3','samsung-original-z-flip4','samsung-original-z-flip5','samsung-original-z-flip6','samsung-original-z-flip7','samsung-original-z-fold3','samsung-original-z-fold4','samsung-original-z-fold5','samsung-original-z-fold6']);
  const detailHref = (item) => `/producto/${encodeURIComponent(String(item.id || ''))}/`;
  const tiersFor = (item) => Array.isArray(item.prices) && item.prices.length
    ? item.prices
    : (Array.isArray(item.priceTable) ? item.priceTable : []);
  const firstPrice = (item) => tiersFor(item)[0]?.price || item.lowestPriceText || 'Consultar';
  const imageFor = (item) => asset(item.cardImage || item.mainImage || (Array.isArray(item.images) ? item.images[0] : ''));

  const navItems = [
    ['pantallas', 'Pantallas', '/productos/'],
    ['hidrogel', 'Hidrogel', '/micas.html'],
    ['ai', 'Productos AI', '/productos-ai/'],
    ['novedades', 'Novedades', '/novedades/'],
    ['contacto', 'Contacto', '/contacto/'],
  ];

  function header(active = '') {
    return `<header class="v3-header reference-header topbar catalog-topbar" data-v3-header>
      <a class="v3-logo reference-logo brand" href="/" aria-label="HAODE México, inicio"><img class="brand-logo" src="/assets/images/d21-light-stage/haode-logo-official.webp" alt="HAODE Calidad Profesional" width="184" height="45"><span class="brand-copy" hidden><strong>HAODE</strong></span></a>
      <button class="v3-btn v3-menu reference-menu-button" type="button" aria-label="Abrir menú" aria-expanded="false" aria-controls="v3-navigation"><span aria-hidden="true">≡</span><span class="v3-sr-only">Menú</span></button>
      <nav class="v3-nav reference-nav topnav" id="v3-navigation" aria-label="Navegación principal">${navItems.map(([key,label,href]) => `<a href="${href}"${key === active ? ' class="is-active" aria-current="page"' : ''}>${label}</a>`).join('')}<a class="v3-sr-only" href="/app/#lista">Catálogo</a></nav>
      <div class="v3-actions reference-nav-actions detail-header-actions">
        <a class="v3-btn v3-whatsapp detail-header-action detail-header-whatsapp" data-detail-header-whatsapp href="${quoteUrl()}" target="_blank" rel="noopener noreferrer"><span class="v3-mark" aria-hidden="true">W</span><span>Consultar por WhatsApp</span></a>
        <a class="v3-btn v3-btn--orange detail-header-action detail-header-app reference-head-account" data-detail-header-app href="/app/"><span class="v3-mark" aria-hidden="true">A</span><span>Abrir APP</span></a>
      </div>
    </header>`;
  }

  function footer() {
    return `<footer class="v3-footer site-sales-footer" data-v3-footer data-site-sales-footer>
      <div class="v3-footer-brand"><img src="/assets/images/d21-light-stage/haode-logo-official.webp" alt="HAODE Calidad Profesional"><p>Tienda oficial de fábrica HL. Refacciones y productos para técnicos, talleres, tiendas y distribuidores en México.</p><small>Garantía local · Precio por cantidad</small></div>
      <nav aria-label="Productos"><h4>Productos</h4><a href="/productos/">Pantallas</a><a class="d21-footer-detail" href="/categoria/iphone-incell/">iPhone INCELL</a><a class="d21-footer-detail" href="/categoria/iphone-oled/">iPhone OLED</a><a class="d21-footer-detail" href="/categoria/samsung-incell/">Samsung INCELL</a><a class="d21-footer-detail" href="/categoria/samsung-oled/">Samsung OLED</a><a href="/micas.html">Hidrogel</a><a href="/productos-ai/">Productos AI</a></nav>
      <nav aria-label="Comprar"><h4>Comprar</h4><a class="site-sales-footer-app" href="/app/">APP HAODE</a><a href="/productos/">Buscar modelo</a><a class="site-sales-footer-whatsapp" href="${quoteUrl()}" target="_blank" rel="noopener noreferrer">WhatsApp</a><a href="/garantia/">Garantía</a></nav>
      <nav aria-label="HAODE México"><h4>HAODE México</h4><a href="/novedades/">Novedades</a><a href="/contacto/">Contacto</a><a href="/tienda-oficial-hl-cdmx/">Tienda HL CDMX</a><a href="/privacidad/">Privacidad</a><a href="/terminos/">Términos</a></nav>
    </footer>`;
  }

  const steps = () => `<div class="v3-steps" aria-label="Flujo de compra">
    ${[['Modelo','Encuentra el equipo'],['Calidad','Elige la versión publicada'],['Cantidad','Indica las piezas'],['Confirmación','Valida disponibilidad']].map(([title,copy],i) => `<div class="v3-step"><b><span class="v3-num">0${i+1}</span>${title}</b><small>${copy}</small></div>`).join('')}
  </div>`;

  function card(item) {
    if (!item) return '';
    const image = lightSamsungCards.has(item.id)
      ? imageFor(item).replace(/\/main\.(?:png|jpg)$/i, '/main-card.webp')
      : imageFor(item);
    const publishedPrices = tiersFor(item);
    const firstTier = publishedPrices[0];
    const boxTier = publishedPrices.find((tier) => /caja\/modelo/i.test(String(tier.quantity || '')));
    const priceSummary = [firstTier, boxTier && boxTier !== firstTier ? boxTier : null]
      .filter(Boolean)
      .map((tier) => `${esc(tier.quantity)} · ${esc(tier.price)}`)
      .join('<br>') || esc(firstPrice(item));
    return `<article class="v3-product shop-card" data-v3-product data-catalog-card data-site-search-item data-search="${esc([item.name,item.model,item.quality,item.id].join(' ').toLowerCase())}" data-category="${esc(item.category)}">
      <div class="v3-product-meta"><span>${esc(item.quality || 'Versión por confirmar')}</span><span>${esc(item.id || '')}</span></div>
      <img src="${image}" alt="${esc(item.name || item.model || 'Producto HAODE')}" loading="lazy" decoding="async">
      <h3>${esc(item.name || item.model || 'Producto HAODE')}</h3>
      <p>${priceSummary}<br><span>Disponibilidad por confirmar</span></p>
      <a class="v3-btn" href="${detailHref(item)}">Ver detalle</a>
    </article>`;
  }

  const pageHero = (eyebrow, title, intro, extra = '') => `<section class="v3-page-hero v3-grid"><div class="v3-wrap"><p class="v3-eyebrow">${eyebrow}</p><h1 class="v3-page-title">${title}</h1><p class="v3-page-intro">${intro}</p>${extra}</div></section>`;
  const cta = (title = 'Cotiza con precisión.') => `<section class="v3-section v3-grid"><div class="v3-wrap v3-cta"><div><p class="v3-eyebrow">Modelo · versión · cantidad</p><h2 class="v3-display">${title}</h2></div><div><p class="v3-page-intro">Comparte el modelo exacto, la calidad o versión publicada, la cantidad y tu ciudad. Confirmamos la información antes de continuar.</p><div class="v3-cta-row"><a class="v3-btn v3-btn--orange" href="${quoteUrl()}" target="_blank" rel="noopener noreferrer">Cotizar por WhatsApp</a><a class="v3-btn" href="/app/">Abrir APP HAODE</a></div></div></div></section>`;

  function homePage() {
    return `${header('pantallas')}<main>
      <section class="d21-hero lab-hero" id="inicio" aria-labelledby="d21-hero-title"><img class="d21-hero-scene lab-hero-photo" src="/assets/images/d21-light-stage/factory-laboratory.webp" alt="Proceso real de inspección en fábrica de pantallas" fetchpriority="high"><div class="d21-hero-shade lab-hero-shade" aria-hidden="true"></div><div class="d21-hero-inner"><div class="d21-hero-copy lab-hero-copy"><p class="d21-brand-word">HAODE</p><h1 id="d21-hero-title">Pantallas profesionales<br>para técnicos</h1><p class="d21-hero-meta">iPhone · Samsung · INCELL · OLED</p><div class="d21-hero-actions"><a class="d21-button d21-button--hot" href="#pantallas">Ver pantallas</a><a class="d21-button d21-button--light" href="${quoteUrl('pantallas')}" target="_blank" rel="noopener noreferrer">WhatsApp</a></div></div><a class="d21-hero-product" href="/producto/iphone-oled-16promax/" aria-label="Ver pantalla iPhone 16 Pro Max OLED"><img src="/assets/images/d21-light-stage/iphone-16promax.webp" alt="Pantalla iPhone 16 Pro Max OLED aprobada"></a><div class="d21-calibration" aria-hidden="true"></div></div></section>
      <section class="d21-screens" id="pantallas" aria-labelledby="d21-screens-title"><div class="d21-section-head"><h2 id="d21-screens-title">Pantallas</h2><p>Tres referencias reales para iniciar la búsqueda.</p></div><div class="d21-product-stage"><a class="d21-product d21-product--a" href="/producto/iphone-incell-16e/"><img src="/assets/images/d21-light-stage/iphone-16e.webp" alt="Pantalla iPhone 16e INCELL"><span class="d21-product-caption"><strong>iPhone 16e</strong><small>INCELL FHD</small></span></a><a class="d21-product d21-product--b" href="/producto/iphone-oled-16promax/"><img src="/assets/images/d21-light-stage/iphone-16promax.webp" alt="Pantalla iPhone 16 Pro Max OLED"><span class="d21-product-caption"><strong>iPhone 16 Pro Max</strong><small>SOFT OLED</small></span></a><a class="d21-product d21-product--c" href="/producto/samsung-incell-s24/"><img src="/assets/images/d21-light-stage/samsung-s24.webp" alt="Pantalla Samsung S24 INCELL"><span class="d21-product-caption"><strong>Samsung S24</strong><small>INCELL CON MARCO</small></span></a></div></section>
      <section class="d21-quick" aria-labelledby="d21-quick-title"><div class="d21-quick-inner"><h2 id="d21-quick-title">Encuentra modelo y calidad</h2><div><form class="d21-finder" action="/productos/" method="get" role="search" data-home-catalog-search-form><label class="v3-sr-only" for="d21-home-search">Modelo o referencia</label><input id="d21-home-search" name="q" type="search" placeholder="Modelo o referencia" autocomplete="off" enterkeyhint="search" maxlength="120" data-home-catalog-search-input><button class="d21-button d21-button--hot" type="submit">Buscar modelo</button></form><nav class="d21-quick-links" aria-label="Calidades de pantallas"><a href="/categoria/iphone-incell/">iPhone INCELL</a><a href="/categoria/iphone-oled/">iPhone OLED</a><a href="/categoria/samsung-incell/">Samsung INCELL</a><a href="/categoria/samsung-oled/">Samsung OLED</a></nav></div></div></section>
      <section class="d21-secondary" aria-label="Categorías secundarias"><a href="/micas.html"><h2>Hidrogel</h2><p>Consulta tipo, medida y acabado.</p><strong>Consultar <span aria-hidden="true">→</span></strong></a><a href="/productos-ai/"><h2>Productos AI</h2><p>Explora referencias publicadas.</p><strong>Ver catálogo <span aria-hidden="true">→</span></strong></a></section>
      <section class="d21-process lab-buying-flow" aria-labelledby="d21-process-title"><div class="d21-process-inner"><h2 id="d21-process-title">Cómo comprar</h2><div class="d21-steps"><article><b>01</b><h3>Modelo</h3></article><article><b>02</b><h3>Calidad</h3></article><article><b>03</b><h3>Cantidad</h3></article><article><b>04</b><h3>Confirmación</h3></article></div></div></section>
      <section class="d21-final-cta" id="contacto" aria-labelledby="d21-final-title"><div class="d21-final-copy"><h2 id="d21-final-title">¿Ya tienes modelo y cantidad?</h2></div><div class="d21-final-actions"><a class="d21-button d21-button--light" href="${quoteUrl()}" target="_blank" rel="noopener noreferrer">Consultar por WhatsApp</a><a class="d21-button" href="/app/">Abrir APP HAODE</a></div></section>
      </main>${footer()}<a class="v3-floating" href="${quoteUrl()}" target="_blank" rel="noopener noreferrer">WhatsApp</a>`;
  }

  function pantallasPage() {
    const screenCategories = new Set(['iphone-incell','iphone-oled','samsung-incell','samsung-oled','samsung-tipo-original','oled-diagnostica']);
    const all = [...products()].sort((a,b) => Number(screenCategories.has(b.category)) - Number(screenCategories.has(a.category)));
    const filters = [['all','Todas'],['iphone-incell','iPhone INCELL'],['iphone-oled','iPhone OLED'],['samsung-incell','Samsung INCELL'],['samsung-oled','Samsung OLED'],['samsung-tipo-original','Samsung TIPO ORIGINAL']];
    const panel = `<form class="v3-filter-panel" action="/productos/" method="get" role="search"><div class="v3-filter-search"><input name="q" type="search" placeholder="Busca modelo o SKU" aria-label="Buscar productos" data-v3-search data-site-catalog-search-input data-pantallas-search-input data-catalog-search-input="fundas-micas"><button class="v3-btn v3-btn--orange" type="submit" data-v3-search-button>Buscar</button></div><div class="v3-filters" aria-label="Filtrar pantallas">${filters.map(([key,label],i)=>`<button class="v3-chip${i===0?' is-active':''}" type="button" data-v3-filter="${key}">${label}</button>`).join('')}</div><p class="v3-results" data-v3-results data-site-catalog-status>${all.length} modelos publicados</p></form>`;
    const groups = [
      ['pantallas', all.filter((item) => screenCategories.has(item.category))],
      ['productos-ai', all.filter((item) => ['gafas-ai','camaras-inteligentes'].includes(item.category))],
      ['fundas-micas', all.filter((item) => ['fundas','micas'].includes(item.category))],
      ['celulares-samsung', all.filter((item) => item.category === 'celulares-samsung')],
    ];
    const groupHtml = groups.map(([key,items]) => `<section class="v3-catalog-group" data-catalog-group="${key}">${key === 'celulares-samsung' ? '<span id="celulares-samsung"></span><section data-category="celulares-samsung" id="celulares-samsung-productos">' : ''}${items.map(card).join('')}${key === 'celulares-samsung' ? '</section>' : ''}</section>`).join('');
    return `${header('pantallas')}<main>${pageHero('Prioridad 01 · Catálogo técnico','Pantallas','Catálogo HAODE México: modelos iPhone y Samsung organizados por calidad. Busca también las demás categorías sin salir del sitio.',panel)}${steps()}<section class="v3-section"><div class="v3-wrap"><div class="v3-section-head"><h2>Atlas de modelos.</h2><p>Los resultados provienen del catálogo actual. Los precios y la compatibilidad se conservan por producto.</p></div><div class="v3-product-rail" data-v3-catalog>${groupHtml}</div><div class="v3-empty" data-v3-empty data-pantallas-empty data-site-catalog-empty data-catalog-empty="fundas-micas" hidden><strong data-site-catalog-empty-title>Sin coincidencias</strong><p>Envía tu lista grande por WhatsApp e incluye el modelo.</p><a class="v3-btn v3-btn--orange" data-site-catalog-empty-whatsapp data-catalog-empty-whatsapp href="${quoteUrl('una pantalla')}" target="_blank" rel="noopener noreferrer">Enviar búsqueda por WhatsApp</a></div><div class="v3-more"><button class="v3-btn" type="button" data-v3-more>Ver todos los modelos</button></div></div></section>${cta('Modelo exacto. Respuesta clara.')}</main>${footer()}<a class="v3-floating" href="${quoteUrl('pantallas')}" target="_blank" rel="noopener noreferrer">WhatsApp</a>`;
  }

  function hidrogelPage() {
    const all = products().filter((item) => item.category === 'micas');
    return `${header('hidrogel')}<main>${pageHero('Prioridad 02 · Protección para corte','Hidrogel','Cuatro opciones principales para elegir por acabado: HD, Matte, Privacy HD y Privacy Matte. La información y los precios vienen del catálogo vigente.')} ${steps()}<section class="v3-section"><div class="v3-wrap"><div class="v3-section-head"><h2>Cuatro acabados.</h2><p>Compara cada línea en una sola lectura y abre su ficha para revisar cantidad y cotización.</p></div><div class="v3-product-rail v3-product-rail--four">${all.slice(0,4).map(card).join('')}</div></div></section><section class="v3-section v3-grid"><div class="v3-wrap"><div class="v3-section-head"><h2>Corte y preparación.</h2><p>La cortadora X200T conserva su fotografía real y su ruta de producto existente.</p></div><div class="v3-split"><div><p class="v3-eyebrow">Equipo relacionado</p><h3>Cortadora X200T</h3><p>Consulta la ficha publicada para confirmar información, disponibilidad y cantidad.</p><a class="v3-btn v3-btn--orange" href="/producto/x200t-cortadora-micas/">Ver ficha X200T</a></div><div><img src="/assets/products/cut-machine/x200t/main.jpg" alt="Cortadora X200T" style="width:100%;height:330px;object-fit:contain"></div></div></div></section>${cta('Elige acabado y cantidad.')}</main>${footer()}<a class="v3-floating" href="${quoteUrl('Hidrogel')}" target="_blank" rel="noopener noreferrer">WhatsApp</a>`;
  }

  function bateriasPage() {
    return `${header('baterias')}<main>${pageHero('Línea de producto · Validación pendiente','Baterías','La entrada está preparada sin publicar modelos, precios, compatibilidades ni imágenes que todavía no forman parte del catálogo confirmado.')}<section class="v3-section"><div class="v3-wrap"><div class="v3-section-head"><h2>Catálogo pendiente.</h2><p>Cuando cada modelo y su fotografía real estén validados, se conectarán aquí al mismo flujo de modelo, versión, cantidad y confirmación.</p></div><div class="v3-split"><div class="v3-placeholder v3-grid">REAL ASSET REQUIRED<br>FOTOGRAFÍA REAL PENDIENTE DE VALIDACIÓN</div><div><p class="v3-eyebrow">Estado de la línea</p><h3>Sin productos confirmados.</h3><p>No mostramos referencias, precios ni compatibilidades hasta tener datos verificables.</p><a class="v3-btn" href="${quoteUrl('Baterías; necesito confirmar si manejan mi modelo')}" target="_blank" rel="noopener noreferrer">Consultar disponibilidad</a></div></div></div></section>${cta('Confirma antes de elegir.')}</main>${footer()}`;
  }

  function aiPage() {
    const all = products().filter((item) => ['gafas-ai','camaras-inteligentes'].includes(item.category));
    return `${header('ai')}<main>${pageHero('Línea complementaria · Catálogo actual','Productos AI','Gafas y cámaras inteligentes con fichas reales. Cada función, versión y precio se consulta en el producto publicado.')}<section class="v3-section"><div class="v3-wrap"><div class="v3-section-head"><h2>Objetos inteligentes.</h2><p>Productos existentes del catálogo, presentados con su fotografía real y sin añadir prestaciones no verificadas.</p></div><div class="v3-product-rail">${all.map(card).join('')}</div></div></section><section class="v3-section v3-band"><div class="v3-wrap v3-flow"><div><p class="v3-eyebrow">Antes de comprar</p><h2>Revisa el modelo.</h2></div><div class="v3-flow-list">${[['01','Abre la ficha','Modelo'],['02','Lee la versión publicada','Información'],['03','Indica cantidad y ciudad','Cotización'],['04','Confirma disponibilidad','WhatsApp / APP']].map(([n,t,s])=>`<div class="v3-flow-row"><span class="v3-num">${n}</span><strong>${t}</strong><span>${s}</span></div>`).join('')}</div></div></section>${cta('Pregunta por la versión exacta.')}</main>${footer()}<a class="v3-floating" href="${quoteUrl('Productos AI')}" target="_blank" rel="noopener noreferrer">WhatsApp</a>`;
  }

  function novedadesPage() {
    const all = products();
    const chosen = ['lk-030-mini-camara-retro-digital','iphone-incell-11-bolsa-protectora','samsung-oled-s23-ultra','mica-hd'].map((id)=>all.find((item)=>item.id===id)).filter(Boolean);
    return `${header('novedades')}<main>${pageHero('Selección del catálogo','Novedades','Una lectura editorial de productos publicados. “Novedades” no cambia el precio, el inventario ni el estado de ningún producto.')}<section class="v3-section"><div class="v3-wrap"><div class="v3-section-head"><h2>Selección actual.</h2><p>Abre cada ficha para consultar la información vigente y confirmar disponibilidad.</p></div><div class="v3-editorial-list">${chosen.map((item,i)=>`<article class="v3-editorial-row"><span class="v3-num">0${i+1}</span><strong>${esc(item.name)}</strong><p>${esc(item.quality || 'Información en ficha')}</p><a class="v3-btn" href="${detailHref(item)}">Ver producto</a></article>`).join('')}</div></div></section><section class="v3-section v3-grid"><div class="v3-wrap"><div class="v3-section-head"><h2>Tres rutas.</h2><p>Pantallas mantiene la prioridad; Hidrogel y Productos AI amplían la consulta sin mezclar categorías.</p></div><div class="v3-lines"><a class="v3-line-item" href="/productos/">Pantallas →</a><a class="v3-line-item" href="/micas.html">Hidrogel →</a><a class="v3-line-item" href="/productos-ai/">Productos AI →</a><a class="v3-line-item" href="/app/">APP →</a></div></div></section>${cta()}</main>${footer()}`;
  }

  function contactoPage() {
    const address = 'Eje Central Lázaro Cárdenas 87, Piso 2, Local 225, Colonia Centro, Cuauhtémoc, 06070 Ciudad de México, CDMX';
    const map = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    return `${header('contacto')}<main>${pageHero('Contacto · Local 225','Contacto','Comparte modelo, calidad o versión, cantidad y ciudad para preparar una consulta precisa.')}<section class="v3-section"><div class="v3-wrap"><div class="v3-contact-grid"><div><p class="v3-eyebrow">HAODE México</p><h2>Visítanos o escríbenos.</h2><p class="v3-address">${address}</p><div class="v3-contact-list"><a href="${quoteUrl()}" target="_blank" rel="noopener noreferrer">WhatsApp +52 33 2668 4296 →</a><a href="tel:+523326684296">Teléfono +52 33 2668 4296 →</a><a href="mailto:haodemx@gmail.com">haodemx@gmail.com →</a><a href="/tienda-oficial-hl-cdmx/">Ver cómo llegar al Local 225 →</a></div><div class="v3-cta-row"><a class="v3-btn v3-btn--orange" href="${quoteUrl()}" target="_blank" rel="noopener noreferrer">Abrir WhatsApp</a><a class="v3-btn" href="${map}" target="_blank" rel="noopener noreferrer">Cómo llegar</a></div></div><div class="v3-map v3-grid"><div class="v3-placeholder">MAPA EXTERNO<br><br>ABRIR SOLO AL SOLICITAR</div></div></div></div></section><section class="v3-section v3-band"><div class="v3-wrap v3-flow"><div><p class="v3-eyebrow">Para cotizar</p><h2>Cuatro datos.</h2></div><div class="v3-flow-list">${[['01','Modelo exacto','Equipo'],['02','Calidad o versión','Producto'],['03','Cantidad','Piezas'],['04','Ciudad','Entrega']].map(([n,t,s])=>`<div class="v3-flow-row"><span class="v3-num">${n}</span><strong>${t}</strong><span>${s}</span></div>`).join('')}</div></div></section></main>${footer()}<a class="v3-floating" href="${quoteUrl()}" target="_blank" rel="noopener noreferrer">WhatsApp</a>`;
  }

  function wireInteractions() {
    const headerEl = document.querySelector('[data-v3-header]');
    const menu = headerEl?.querySelector('.v3-menu');
    menu?.addEventListener('click', () => {
      const open = headerEl.classList.toggle('is-open');
      menu.setAttribute('aria-expanded', String(open));
    });
    const input = document.querySelector('[data-v3-search]');
    const filterButtons = [...document.querySelectorAll('[data-v3-filter]')];
    const items = [...document.querySelectorAll('[data-v3-product]')];
    const result = document.querySelector('[data-v3-results]');
    const empty = document.querySelector('[data-v3-empty]');
    const more = document.querySelector('[data-v3-more]');
    let filter = 'all';
    let expanded = false;
    const update = () => {
      const query = (input?.value || '').trim().toLowerCase();
      const matches = items.filter((item) => (!query || item.dataset.search.includes(query)) && (filter === 'all' || item.dataset.category === filter));
      const limit = !expanded && !query ? 12 : matches.length;
      items.forEach((item) => {
        const matchesQuery = !query || item.dataset.search.includes(query);
        const matchesFilter = filter === 'all' || item.dataset.category === filter;
        const matchIndex = matches.indexOf(item);
        item.hidden = !(matchesQuery && matchesFilter) || matchIndex >= limit;
      });
      const visible = Math.min(matches.length, limit);
      if (result) result.textContent = visible === matches.length ? `${visible} resultados · ${visible === 1 ? 'modelo visible' : 'modelos visibles'}` : `${visible} de ${matches.length} resultados · modelos visibles`;
      if (empty) {
        empty.hidden = matches.length !== 0;
        const title = empty.querySelector('[data-site-catalog-empty-title]');
        if (title && query) title.textContent = `No encontramos "${query}".`;
        const link = empty.querySelector('[data-site-catalog-empty-whatsapp]');
        if (link && query) link.href = quoteUrl(query);
      }
      document.querySelectorAll('[data-catalog-group]').forEach((group) => {
        group.hidden = Boolean(query) && !group.querySelector('[data-v3-product]:not([hidden])');
      });
      if (more) {
        more.hidden = Boolean(query) || matches.length <= 12;
        more.textContent = expanded ? 'Mostrar selección' : `Ver los ${matches.length} modelos`;
      }
    };
    input?.addEventListener('input', update);
    document.querySelector('[data-v3-search-button]')?.addEventListener('click', (event) => {
      if (!input?.value.trim()) event.preventDefault();
      update();
    });
    filterButtons.forEach((button) => button.addEventListener('click', () => {
      filter = button.dataset.v3Filter;
      filterButtons.forEach((item) => item.classList.toggle('is-active', item === button));
      update();
    }));
    more?.addEventListener('click', () => { expanded = !expanded; update(); });
    const params = new URLSearchParams(location.search);
    if (input && params.get('q')) { input.value = params.get('q').slice(0,120); update(); }
    else update();
  }

  function installShellOnly(active) {
    [...body.children].filter((node) => node.matches('header, .catalog-topbar')).forEach((node) => node.remove());
    document.body.insertAdjacentHTML('afterbegin', header(active));
    [...body.children].filter((node) => node.matches('footer')).forEach((node) => node.remove());
    document.body.insertAdjacentHTML('beforeend', footer());
    wireInteractions();
  }

  function render() {
    const page = body.dataset.v3Page;
    body.classList.toggle('d21-home', page === 'home');
    if (body.dataset.v3Detail === 'true') {
      installShellOnly('pantallas');
      return;
    }
    const builders = {home:homePage,pantallas:pantallasPage,hidrogel:hidrogelPage,baterias:bateriasPage,ai:aiPage,novedades:novedadesPage,contacto:contactoPage};
    if (!builders[page]) { installShellOnly(''); return; }
    const privacyRoot = body.querySelector('[data-haode-privacy-root]');
    body.innerHTML = `<div class="v3-shell">${builders[page]()}</div>`;
    if (privacyRoot) body.appendChild(privacyRoot);
    wireInteractions();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render, {once:true});
  else render();
  document.addEventListener('haode:catalog-hydrated', () => {
    if (['pantallas', 'hidrogel', 'ai', 'novedades'].includes(body.dataset.v3Page)) render();
  });
})();
