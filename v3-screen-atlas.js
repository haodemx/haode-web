(() => {
  const body = document.body;
  if (!body || body.dataset.zayBooted) return;
  body.dataset.zayBooted = 'true';
  const isStaticHomepage = body.dataset.v3Page === 'home';
  if (!isStaticHomepage) {
    const css = document.createElement('link');
    css.rel = 'stylesheet'; css.href = '/zay-full-candidate.css?v=20260918-store-directions-1';
    document.head.append(css);
  }

  const PHONE = '523326684296';
  const STORE_ADDRESS = 'Eje Central Lázaro Cárdenas 87, Piso 2, Local 225, Colonia Centro, Cuauhtémoc, 06070, Ciudad de México, México';
  const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(STORE_ADDRESS)}`;
  const mapPinIcon = '<svg class="store-map-pin" viewBox="0 0 24 24" aria-hidden="true" data-ui-id="icon-store-map-pin" data-icon-family="haode-line"><path d="M12 21s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/></svg>';
  const menuIcon = '<svg class="zay-ui-icon" viewBox="0 0 24 24" aria-hidden="true" data-ui-id="icon-menu" data-icon-family="haode-line"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
  const searchIcon = '<svg class="zay-ui-icon" viewBox="0 0 24 24" aria-hidden="true" data-ui-id="icon-search" data-icon-family="haode-line"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>';
  const facebookIcon = '<svg viewBox="0 0 24 24" aria-hidden="true" data-ui-id="icon-social-facebook" data-icon-family="haode-line"><path d="M14 8h3V4h-3c-3 0-5 2-5 5v2H6v4h3v7h4v-7h3l1-4h-4V9c0-.7.3-1 1-1Z"/></svg>';
  const instagramIcon = '<svg viewBox="0 0 24 24" aria-hidden="true" data-ui-id="icon-social-instagram" data-icon-family="haode-line"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg>';
  const tiktokIcon = '<svg viewBox="0 0 24 24" aria-hidden="true" data-ui-id="icon-social-tiktok" data-icon-family="haode-line"><path d="M14 3v11.5a4.5 4.5 0 1 1-4-4.47V14a1.8 1.8 0 1 0 1 1.62V3h3Zm0 0c.4 2.4 1.8 3.8 4 4.2V11c-1.6-.2-2.9-.8-4-1.7"/></svg>';
  const youtubeIcon = '<svg viewBox="0 0 24 24" aria-hidden="true" data-ui-id="icon-social-youtube" data-icon-family="haode-line"><rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3Z"/></svg>';
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const uiId = (value) => `data-${'ui-id'}="${esc(value)}"`;
  const asset = (v) => { const s=String(v||'').trim(); return !s||/[\u0000-\u001f\u007f"'<>`\\]/.test(s)||/^[a-z][a-z0-9+.-]*:/i.test(s)?'/assets/products/placeholder.svg':s.startsWith('/')?s:`/${s}`; };
  const products = () => Array.isArray(window.HAODE_PRODUCTS)&&window.HAODE_PRODUCTS.length?window.HAODE_PRODUCTS:(window.HAODE_PRODUCTS_DATA||[]);
  const tiers = (p) => Array.isArray(p.prices)&&p.prices.length?p.prices:(p.priceTable||[]);
  const image = (p) => asset(p.cardImage||p.mainImage||(p.images||[])[0]);
  const GENERIC_DETAIL_CATEGORIES = new Set(['gafas-ai','camaras-inteligentes','celulares-samsung','fundas']);
  const detail = (p) => GENERIC_DETAIL_CATEGORIES.has(p.category)
    ? `/producto.html?id=${encodeURIComponent(p.id)}`
    : `/producto/${encodeURIComponent(p.id)}/`;
  const searchText = (p) => [p.id,p.sku,p.name,p.model,p.quality,p.category,p.description].filter(Boolean).join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const quote = (p) => `https://wa.me/${PHONE}?text=${encodeURIComponent(['Hola HAODE México, quiero cotizar:',`Producto: ${p?`${p.name||p.model||p.id}${p.quality?` · ${p.quality}`:''}`:'una lista de productos'}`,`Modelo/SKU: ${p?(p.sku||p.id||''):''}`,'Cantidad:','Ciudad:','¿Me confirman stock en México, precio por cantidad, garantía local y envío?'].join('\n'))}`;
  const searchQuote = (query) => quote(query ? { name: 'Búsqueda del catálogo', sku: query } : null);
  const SCREENS = new Set(['iphone-incell','iphone-oled','oled-diagnostica','samsung-incell','samsung-oled','samsung-tipo-original']);
  const primary = (p) => SCREENS.has(p.category)?'pantallas':p.category==='micas'?'hidrogel':p.category==='gafas-ai'?'ai':'otros';
  const isFoldable = (p) => primary(p)==='pantallas'&&/(?:^|\b)z[\s-]*(?:flip|fold)|\b(?:flip|fold)\d*/i.test(`${p.model||''} ${p.name||''} ${p.id||''}`);
  const family = (p) => {
    if(primary(p)==='pantallas') return isFoldable(p)?'foldables':/^iphone-|^oled-diagnostica$/.test(p.category)?'iphone':'samsung';
    if(primary(p)==='hidrogel') return p.id==='x200t-cortadora-micas'?'maquinas':'peliculas';
    if(primary(p)==='ai') return 'gafas-ai';
    return 'otros';
  };
  const technology = (p) => ({
    'iphone-incell':'INCELL','samsung-incell':'INCELL','iphone-oled':'OLED',
    'oled-diagnostica':'OLED diagnóstica','samsung-oled':'OLED','samsung-tipo-original':'Tipo original',
  }[p.category]||'');
  const qualityGroup = (p) => {
    if(family(p)==='iphone'){
      if(p.category==='iphone-incell') return 'incell';
      if(p.category==='iphone-oled') return /SOFT/i.test(p.quality||'')?'oled-soft':'oled-premium';
      if(p.category==='oled-diagnostica') return /HARD/i.test(p.quality||'')?'diagnostic-hard':/SOFT/i.test(p.quality||'')?'diagnostic-soft':'diagnostic-standard';
    }
    if(family(p)==='samsung') return p.category==='samsung-incell'?'incell':p.category==='samsung-oled'?'oled':'original';
    return '';
  };
  const foldSeries = (p) => family(p)==='foldables'&&/fold/i.test(`${p.model||''} ${p.id||''}`)?'fold':family(p)==='foldables'?'flip':'';
  const LEGACY_SUB = {
    'iphone-incell':['iphone','INCELL'],'iphone-oled':['iphone','OLED'],
    'samsung-incell':['samsung','INCELL'],'samsung-oled':['samsung','OLED'],'plegables':['foldables',''],
  };
  const EXACT_HYDRO = {'hd-clear':'mica-hd','matte':'mica-matte','privacy-hd':'mica-privacidad-hd','privacy-matte':'mica-privacidad-matte','x200t':'x200t-cortadora-micas'};
  const FAMILIES = {
    pantallas:[
      ['iphone','iPhone','Pantallas para iPhone. Filtra por modelo, tecnología y versión.'],
      ['samsung','Samsung','Pantallas Samsung no plegables, organizadas por modelo y versión.'],
      ['foldables','Foldables','Pantallas para Z Flip y Z Fold publicadas en el catálogo.'],
    ],
    hidrogel:[
      ['peliculas','Películas de hidrogel','HD Clear, Matte, Privacy HD y Privacy Matte.'],
      ['maquinas','Máquina X200T','Equipo publicado para corte de hidrogel.'],
    ],
    ai:[['gafas-ai','Gafas AI','Modelos de gafas AI confirmados en el catálogo.']],
  };
  const familyHref = (key,sub) => `/productos/?category=${key}&sub=${sub}`;
  const familyCount = (all,key,sub) => all.filter(p=>primary(p)===key&&family(p)===sub).length;
  const uniqueValues = (list,getter) => [...new Set(list.map(getter).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es',{numeric:true,sensitivity:'base'}));
  const withParams = (values) => {const u=new URL('/productos/',location.origin);Object.entries(values).forEach(([key,value])=>value&&u.searchParams.set(key,value));return `${u.pathname}?${u.searchParams}`;};

  function header(active='') {
    const groups=[['pantallas','Pantallas','/productos/?category=pantallas'],['hidrogel','Hidrogel','/micas.html'],['ai','Productos AI','/productos-ai/']];
    return `<header class="zay-header" data-zay-header data-v3-header data-ui-id="site-header"><div class="zay-header-inner" data-ui-id="site-header-inner"><a class="zay-brand" href="/" aria-label="HAODE México, inicio" data-ui-id="header-brand" data-ui-action="navigate-home"><img src="/assets/images/haode-header-logo-horizontal-preview.png" alt="HAODE" width="190" height="55" data-ui-id="header-brand-image"></a><button class="zay-menu-button" type="button" aria-expanded="false" aria-controls="zay-nav" data-ui-id="header-menu-button" data-ui-action="toggle-primary-navigation">${menuIcon}<span class="zay-visually-hidden">Abrir menú</span></button><nav class="zay-nav" id="zay-nav" aria-label="Navegación principal" data-ui-id="header-navigation" data-ui-project-menu><a href="/"${active==='home'?' class="is-active"':''} data-ui-id="nav-home" data-ui-action="navigate-home">Inicio</a>${groups.map(([key,label,href])=>`<details class="zay-nav-group"${active===key?' data-active="true"':''} ${uiId(`nav-group-${key}`)}><summary>${label}</summary><div><a href="${href}" ${uiId(`nav-${key}`)} data-ui-action="navigate-${key}">Ver ${label}</a>${FAMILIES[key].map(([s,l])=>`<a href="${familyHref(key,s)}" ${uiId(`nav-${key}-${s}`)} data-ui-action="navigate-${key}-${s}">${l}</a>`).join('')}</div></details>`).join('')}<a href="/novedades/" data-ui-id="nav-news" data-ui-action="navigate-news">Novedades</a><a href="/contacto/" data-ui-id="nav-contact" data-ui-action="navigate-contact">Contacto</a></nav><div class="zay-header-actions" data-ui-id="header-actions"><a class="zay-search-icon" href="/productos/" aria-label="Buscar productos" data-ui-id="header-search" data-ui-action="open-catalog-search">${searchIcon}</a><a class="zay-button zay-whatsapp" data-detail-header-whatsapp data-contact-area="header" href="${quote()}" target="_blank" rel="noopener noreferrer" data-ui-id="header-whatsapp" data-ui-action="open-whatsapp">WhatsApp</a><a class="zay-button zay-orange" data-detail-header-app href="/app/" data-ui-id="header-app" data-ui-action="open-app">APP</a></div></div></header>`;
  }
  function footer(){
    const social=(name,url,icon)=>`<a data-social-link="${name.toLowerCase()}" href="${url}" target="_blank" rel="noopener noreferrer" aria-label="${name} de HAODE México">${icon}</a>`;
    return `<footer class="zay-footer" data-zay-footer data-v3-footer data-site-sales-footer data-ui-id="site-footer"><div class="zay-footer-grid" data-ui-id="footer-grid"><section class="zay-footer-brand" data-ui-id="footer-brand"><img src="/assets/images/haode-header-logo-horizontal-preview.png" alt="HAODE"><p>Pantallas y tecnología para técnicos, talleres, tiendas y distribuidores en México.</p><div class="zay-socials" aria-label="Redes sociales">${social('Facebook','https://www.facebook.com/haodemx',facebookIcon)}${social('Instagram','https://www.instagram.com/cristi3an/',instagramIcon)}${social('TikTok','https://www.tiktok.com/@haodemx',tiktokIcon)}${social('YouTube','https://www.youtube.com/@haodemx',youtubeIcon)}</div></section><nav aria-label="Navegación del sitio" data-ui-id="footer-navigation"><h2>Navegación</h2><a href="/">Inicio</a><a href="/productos/?category=pantallas">Pantallas</a><a href="/micas.html">Hidrogel</a><a href="/productos-ai/">Productos AI</a><a href="/novedades/">Novedades</a><a href="/contacto/">Contacto</a></nav><section class="zay-footer-contact" data-ui-id="footer-contact"><h2>Contacto</h2><a class="site-sales-footer-whatsapp" href="${quote()}" target="_blank" rel="noopener noreferrer" data-ui-action="open-whatsapp">WhatsApp +52 33 2668 4296</a><p class="zay-footer-address-label">Dirección</p><a class="zay-footer-address" data-store-address-link href="${DIRECTIONS_URL}" target="_blank" rel="noopener noreferrer">Eje Central Lázaro Cárdenas 87<br>Piso 2, Local 225, Centro, CDMX</a><a class="zay-footer-directions" data-store-directions href="${DIRECTIONS_URL}" target="_blank" rel="noopener noreferrer" data-ui-id="footer-directions" data-ui-action="open-store-directions">${mapPinIcon}<span>Cómo llegar</span></a><p><strong>Lun–Sáb</strong> · 10:00–18:00<br><strong>Domingo</strong> · Cerrado</p></section><section class="zay-footer-actions" data-ui-id="footer-actions"><h2>HAODE</h2><a class="zay-footer-app" href="/app/" data-ui-action="open-app">Abrir APP</a><a href="/privacidad/">Privacidad</a><a href="/garantia/">Garantía</a><a href="/terminos/">Términos de uso</a></section></div><div class="zay-footer-bottom"><span>© 2026 HAODE México</span><span>Diseño base: <a href="https://templatemo.com/tm-559-zay-shop" target="_blank" rel="noopener noreferrer">Zay Shop por TemplateMo</a></span></div></footer>`;
  }
  function price(p){const t=tiers(p);return !t.length||p.salesAvailable===false||p.priceStatus==='PENDING'?'Consultar precio':`${esc(t[0].quantity)} · ${esc(t[0].price)}`}
  function card(p){const pending=p.usesPlaceholder||/placeholder\.svg/i.test(image(p)),model=p.name||p.model||p.id,version=p.quality||p.category,id=esc(p.id);return `<article class="zay-product-card" data-zay-product data-catalog-card data-v3-product data-site-search-item data-id="${id}" data-primary="${primary(p)}" data-family="${family(p)}" data-technology="${esc(technology(p))}" data-quality="${esc(p.quality||'')}" data-model="${esc(p.model||'')}" data-category="${esc(p.category)}" data-search="${esc(searchText(p))}" ${uiId(`product-card-${id}`)}><a class="zay-card-media" href="${detail(p)}" ${uiId(`product-media-${id}`)} data-ui-action="open-product-${id}"><img src="${image(p)}" alt="${esc(model)}" loading="lazy" decoding="async">${pending?'<span>Imagen pendiente</span>':''}</a><div class="zay-card-body" ${uiId(`product-content-${id}`)}><h3><a href="${detail(p)}" title="${esc(model)}">${esc(model)}</a></h3><p>${esc(version)}</p><strong>${price(p)}</strong><div><a href="${detail(p)}" data-ui-action="open-product-${id}">Ver detalle</a><a class="zay-card-quote" data-product-whatsapp href="${quote(p)}" target="_blank" rel="noopener noreferrer" aria-label="Cotizar ${esc(model)} por WhatsApp" data-ui-action="quote-product-${id}">Cotizar</a></div></div></article>`}
  const steps=()=>`<section class="zay-steps" data-ui-id="purchase-steps">${[['01','Modelo','Encuentra el equipo'],['02','Calidad','Elige la versión'],['03','Cantidad','Indica las piezas'],['04','Confirmación','Validamos contigo']].map(([n,t,c])=>`<div ${uiId(`purchase-step-${n}`)}><b>${n}</b><span><strong>${t}</strong>${c}</span></div>`).join('')}</section>`;
  const categoryCard=(title,copy,img,href,links)=>{const id=title==='Pantallas'?'screens':title==='Hidrogel'?'hydrogel':'ai-products';return `<article class="zay-category-card" ${uiId(`category-${id}`)}><a class="zay-category-image" href="${href}" ${uiId(`category-${id}-media`)} data-ui-action="open-category-${id}"><img src="${img}" alt="${title}"></a><div><h3><a href="${href}">${title}</a></h3><p>${copy}</p><nav>${links.map(([l,u])=>`<a href="${u}">${l}</a>`).join('')}</nav></div></article>`};

  function familyLanding(key,all){
    const titles={pantallas:'Elige tu tipo de pantalla',hidrogel:'Elige la familia de hidrogel',ai:'Productos AI confirmados'};
    return `<section class="zay-family-landing" data-category-landing="${key}"><header><p class="zay-kicker">Categorías claras</p><h2>${titles[key]}</h2></header><div class="zay-family-grid">${FAMILIES[key].map(([sub,label,copy])=>{const count=familyCount(all,key,sub);return `<a class="zay-family-card" data-family-link="${sub}" href="${familyHref(key,sub)}"><span>${label}</span><strong>${count} ${count===1?'producto':'productos'}</strong><p>${copy}</p><b>Ver productos →</b></a>`}).join('')}</div></section>`;
  }

  function screenQualityNavigation(sub,all,selectedTechnology,selectedQualityGroup,selectedSeries){
    if(!['iphone','samsung','foldables'].includes(sub)) return '';
    const list=all.filter(p=>family(p)===sub),count=(predicate)=>list.filter(predicate).length;
    if(sub==='foldables'){
      const groups=[['flip','Z Flip'],['fold','Z Fold']];
      return `<section class="zay-quality-section" data-quality-navigation="foldables"><header><p class="zay-kicker">Tipo y modelo</p><h2>Elige Z Flip o Z Fold</h2><p>Solo aparecen modelos publicados en el catálogo actual.</p></header><div class="zay-fold-grid">${groups.map(([series,label])=>{const seriesProducts=list.filter(p=>foldSeries(p)===series),models=uniqueValues(seriesProducts,p=>p.model);return `<article class="zay-fold-card${selectedSeries===series?' is-active':''}"><a href="${withParams({category:'pantallas',sub:'foldables',series})}"><span>${label}</span><strong>${seriesProducts.length} productos</strong></a><nav aria-label="Modelos ${label}">${models.map(model=>`<a href="${withParams({category:'pantallas',sub:'foldables',series,model})}">${esc(model.replace(/^Samsung\s*/i,''))}</a>`).join('')}</nav></article>`}).join('')}</div></section>`;
    }
    const defs=sub==='iphone'?
      [
        ['INCELL','INCELL FHD','Pantallas INCELL FHD publicadas.',count(p=>p.category==='iphone-incell'),''],
        ['OLED','OLED','OLED Premium y Soft OLED Premium.',count(p=>p.category==='iphone-oled'),'oled'],
        ['OLED diagnóstica','Diagnóstico OLED','Tamaño original, Hard y Soft según SKU.',count(p=>p.category==='oled-diagnostica'),'diagnostic'],
      ]:
      [
        ['INCELL','INCELL','INCELL CON MARCO e INCELL FHD C/M.',count(p=>p.category==='samsung-incell'),''],
        ['OLED','AMOLED / OLED','OLED CON MARCO.',count(p=>p.category==='samsung-oled'),''],
        ['Tipo original','TIPO ORIGINAL','TIPO ORIGINAL C/M.',count(p=>p.category==='samsung-tipo-original'),''],
      ];
    const variants=sub==='iphone'&&selectedTechnology==='OLED'?
      [['oled-premium','OLED Premium',count(p=>qualityGroup(p)==='oled-premium')],['oled-soft','Soft OLED Premium',count(p=>qualityGroup(p)==='oled-soft')]]:
      sub==='iphone'&&selectedTechnology==='OLED diagnóstica'?
      [['diagnostic-standard','Tamaño original',count(p=>qualityGroup(p)==='diagnostic-standard')],['diagnostic-hard','Hard OLED',count(p=>qualityGroup(p)==='diagnostic-hard')],['diagnostic-soft','Soft OLED',count(p=>qualityGroup(p)==='diagnostic-soft')]]:[];
    return `<section class="zay-quality-section" data-quality-navigation="${sub}"><header><p class="zay-kicker">Calidad y tecnología</p><h2>${sub==='iphone'?'Calidad de pantalla iPhone':'Calidad de pantalla Samsung'}</h2><p>${sub==='iphone'?'Original no aparece porque el catálogo actual no contiene SKU iPhone Original.':'Los 50 SKU Samsung no plegables publicados son versiones con marco.'}</p></header><div class="zay-quality-grid">${defs.filter(([, , ,n])=>n).map(([tech,label,copy,n,variant])=>`<article class="zay-quality-card${selectedTechnology===tech?' is-active':''}"><a href="${withParams({category:'pantallas',sub,technology:tech})}"><span>${label}</span><strong>${n} SKU</strong><p>${copy}</p><b>Elegir calidad →</b></a>${variant&&selectedTechnology===tech?`<small>${variant==='oled'?'Premium 16 · Soft Premium 4':'Tamaño original 22 · Hard 1 · Soft 1'}</small>`:''}</article>`).join('')}</div>${variants.length?`<div class="zay-variant-panel"><h3>Versiones reales dentro de ${selectedTechnology==='OLED'?'OLED':'Diagnóstico OLED'}</h3><div>${variants.filter(([, ,n])=>n).map(([key,label,n])=>`<a class="${selectedQualityGroup===key?'is-active':''}" href="${withParams({category:'pantallas',sub,technology:selectedTechnology,qualityGroup:key})}"><span>${label}</span><strong>${n}</strong></a>`).join('')}</div></div>`:''}</section>`;
  }

  function home(){const all=products();const chosen=['iphone-incell-11','samsung-oled-s23-ultra','mica-hd','haode-ai-w610-smart-glasses'].map(id=>all.find(p=>p.id===id)).filter(Boolean);const count=(key,sub)=>familyCount(all,key,sub);return `${header('home')}<main data-ui-id="home-page"><section class="zay-hero" data-ui-id="home-hero"><div class="zay-container zay-hero-grid"><div data-ui-id="home-hero-copy"><p class="zay-kicker">HAODE México · Suministro profesional</p><h1>Pantallas y tecnología para vender y reparar.</h1><p>Busca el modelo exacto, revisa la versión publicada y cotiza por cantidad.</p><form class="zay-search" action="/productos/" method="get" data-home-catalog-search-form data-ui-id="home-product-search" data-ui-action="search-catalog"><label class="zay-visually-hidden" for="home-q">Buscar producto</label><input id="home-q" name="q" type="search" placeholder="iPhone 11, S24 Ultra, MICA HD…" data-home-catalog-search-input><button>Buscar producto</button></form><div class="zay-hero-actions" data-ui-id="home-hero-actions"><a class="zay-button zay-orange" href="/productos/" data-ui-action="open-catalog">Ver catálogo</a><a class="zay-button zay-outline" href="${quote()}" target="_blank" rel="noopener noreferrer" data-ui-action="open-whatsapp">Cotizar por WhatsApp</a></div></div><figure data-ui-id="home-hero-media"><img src="/assets/products/iphone-incell/16e/gallery-01.png" alt="Pantalla real HAODE para iPhone 16e" fetchpriority="high"><figcaption>Producto real HAODE</figcaption></figure></div></section>${steps()}<section class="zay-section" data-ui-id="home-categories"><div class="zay-container"><header class="zay-section-heading"><p>Explora el catálogo</p><h2>Tres categorías principales</h2></header><div class="zay-category-grid">${categoryCard('Pantallas','iPhone, Samsung y plegables. INCELL, OLED, diagnóstico y tipo original según datos publicados.','/assets/products/iphone-incell/16promax/main.display.webp','/productos/?category=pantallas',[[`iPhone · ${count('pantallas','iphone')}`,familyHref('pantallas','iphone')],[`Samsung · ${count('pantallas','samsung')}`,familyHref('pantallas','samsung')],[`Foldables · ${count('pantallas','foldables')}`,familyHref('pantallas','foldables')]])}${categoryCard('Hidrogel','Películas por acabado y equipo de corte en familias separadas.','/assets/products/micas/hd/main-hero.webp','/micas.html',[[`Películas · ${count('hidrogel','peliculas')}`,familyHref('hidrogel','peliculas')],[`Máquina X200T · ${count('hidrogel','maquinas')}`,familyHref('hidrogel','maquinas')]])}${categoryCard('Productos AI','Solo productos AI confirmados en el catálogo.','/assets/products/productos-ai/w610-ai-smart-glasses/main.display.webp','/productos-ai/',[[`Gafas AI · ${count('ai','gafas-ai')}`,familyHref('ai','gafas-ai')]])}</div></div></section><section class="zay-section zay-soft" data-ui-id="home-featured-products"><div class="zay-container"><header class="zay-section-heading"><p>Selección del catálogo real</p><h2>Productos destacados</h2></header><div class="zay-product-grid">${chosen.map(card).join('')}</div></div></section><section class="zay-final" data-ui-id="home-final-cta"><div><h2>¿Ya tienes modelo y cantidad?</h2><p>Confirma disponibilidad y precio aplicable con un asesor.</p></div><div><a class="zay-button zay-light" href="${quote()}" target="_blank" rel="noopener noreferrer" data-ui-action="open-whatsapp">WhatsApp</a><a class="zay-button zay-dark" href="/app/" data-ui-action="open-app">Abrir APP</a></div></section></main>${footer()}<a class="zay-floating" href="${quote()}" target="_blank" rel="noopener noreferrer" data-ui-id="floating-whatsapp" data-ui-action="open-whatsapp">WhatsApp</a>`}

  function catalog(){
    const all=products(),params=new URLSearchParams(location.search);
    const selected=['pantallas','hidrogel','ai'].includes(params.get('category'))?params.get('category'):'all';
    const requestedSub=params.get('sub')||'',legacy=LEGACY_SUB[requestedSub];
    const sub=legacy?.[0]||requestedSub;
    const qRaw=(params.get('q')||'').slice(0,120),q=qRaw.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    const selectedTechnology=(params.get('technology')||legacy?.[1]||'').slice(0,80);
    const selectedQuality=(params.get('quality')||'').slice(0,120);
    const selectedModel=(params.get('model')||'').slice(0,120);
    const selectedQualityGroup=(params.get('qualityGroup')||'').slice(0,80);
    const selectedSeries=(params.get('series')||'').slice(0,20);
    const counts={all:all.length};
    ['pantallas','hidrogel','ai'].forEach(k=>counts[k]=all.filter(p=>primary(p)===k).length);
    const tops=[['all','Todo'],['pantallas','Pantallas'],['hidrogel','Hidrogel'],['ai','Productos AI']];
    const matchesFamily=(p,value) => !value||value==='all'||(EXACT_HYDRO[value]?p.id===EXACT_HYDRO[value]:family(p)===value);
    const matchesExcept=(p,except='') => (selected==='all'||primary(p)===selected)
      &&(except==='sub'||matchesFamily(p,sub))
      &&(except==='technology'||!selectedTechnology||technology(p)===selectedTechnology)
      &&(except==='quality'||!selectedQuality||p.quality===selectedQuality)
      &&(except==='model'||!selectedModel||p.model===selectedModel)
      &&(!selectedQualityGroup||qualityGroup(p)===selectedQualityGroup)
      &&(!selectedSeries||foldSeries(p)===selectedSeries)
      &&(!q||searchText(p).includes(q));
    const matches=all.filter(p=>matchesExcept(p));
    const hasSearchOrFilter = Boolean(q.trim() || selected !== 'all' || sub || selectedTechnology || selectedQuality || selectedModel || selectedQualityGroup || selectedSeries);
    const showEmpty = hasSearchOrFilter && matches.length === 0;
    const landingOnly=selected!=='all'&&!sub&&!q&&!selectedTechnology&&!selectedQuality&&!selectedModel&&!selectedQualityGroup&&!selectedSeries&&params.get('view')!=='all';
    const pageTitle={all:'Productos publicados',pantallas:'Pantallas',hidrogel:'Hidrogel',ai:'Productos AI'}[selected];
    const pageCopy=selected==='all'
      ?`Busca en los ${all.length} productos del catálogo actual. Cada ficha conserva sus datos, precio e imágenes.`
      :`Explora ${counts[selected]} productos publicados con categorías y filtros basados en los datos actuales.`;
    if(landingOnly){
      return `${header(selected)}<main data-ui-id="catalog-landing-page"><section class="zay-page-head"><div class="zay-container"><p class="zay-kicker">Catálogo HAODE México</p><h1>${pageTitle}</h1><p>${pageCopy}</p></div></section><section class="zay-catalog"><div class="zay-container">${familyLanding(selected,all)}<a class="zay-view-all" href="/productos/?category=${selected}&view=all">Ver los ${counts[selected]} productos</a></div></section></main>${footer()}<a class="zay-floating" href="${quote()}" target="_blank" rel="noopener noreferrer">WhatsApp</a>`;
    }
    const familyItems=selected==='all'?[]:(FAMILIES[selected]||[]);
    const optionMarkup=(name,label,values,current)=>values.length?`<label class="zay-filter-select"><span>${label}</span><select name="${name}"><option value="">Todos</option>${values.map(value=>`<option value="${esc(value)}"${value===current?' selected':''}>${esc(value)}</option>`).join('')}</select></label>`:'';
    const scope=all.filter(p=>selected==='all'||primary(p)===selected);
    const technologyValues=uniqueValues(scope.filter(p=>matchesExcept(p,'technology')),technology);
    const qualityValues=uniqueValues(scope.filter(p=>matchesExcept(p,'quality')),p=>p.quality);
    const modelValues=uniqueValues(scope.filter(p=>matchesExcept(p,'model')),p=>p.model);
    const familyLabel=(familyItems.find(([key])=>key===sub)||[])[1];
    const resultTitle=familyLabel||pageTitle;
    return `${header(selected==='all'?'':selected)}<main data-ui-id="catalog-page"><section class="zay-page-head"><div class="zay-container"><p class="zay-kicker">Catálogo HAODE México</p><h1>${pageTitle}</h1><p>${pageCopy}</p></div></section><section class="zay-catalog"><div class="zay-container">${selected==='pantallas'&&sub?screenQualityNavigation(sub,all,selectedTechnology,selectedQualityGroup,selectedSeries):''}<div class="zay-catalog-layout"><aside class="zay-filter-panel" data-zay-filter-panel><button class="zay-filter-toggle" type="button" aria-expanded="false">Filtros y categorías <span>+</span></button><div class="zay-filter-content"><form class="zay-search" action="/productos/"><label for="catalog-q">Buscar producto</label><input id="catalog-q" name="q" type="search" value="${esc(qRaw)}" placeholder="Modelo, SKU o versión" data-site-catalog-search-input data-v3-search>${selected!=='all'?`<input type="hidden" name="category" value="${selected}">`:''}${sub?`<input type="hidden" name="sub" value="${esc(sub)}">`:''}<button>Buscar</button></form><div class="zay-filter-group"><h2>Categorías principales</h2>${tops.map(([k,l])=>`<a class="zay-filter-row${selected===k?' is-active':''}" data-primary-filter="${k}" href="/productos/${k==='all'?'':`?category=${k}`}"><span>${l}</span><b>${counts[k]}</b></a>`).join('')}</div>${familyItems.length?`<div class="zay-filter-group"><h2>Familia</h2><a class="zay-filter-row${!sub?' is-active':''}" data-sub-filter="all" href="/productos/?category=${selected}&view=all"><span>Todas</span><b>${counts[selected]}</b></a>${familyItems.map(([key,label])=>{const count=familyCount(all,selected,key);return count?`<a class="zay-filter-row${sub===key?' is-active':''}" data-sub-filter="${key}" href="${familyHref(selected,key)}"><span>${label}</span><b>${count}</b></a>`:''}).join('')}</div>`:''}${selected==='pantallas'&&sub?`<form class="zay-attribute-filters" action="/productos/" method="get"><input type="hidden" name="category" value="pantallas"><input type="hidden" name="sub" value="${esc(sub)}">${qRaw?`<input type="hidden" name="q" value="${esc(qRaw)}">`:''}${selectedQualityGroup?`<input type="hidden" name="qualityGroup" value="${esc(selectedQualityGroup)}">`:''}${selectedSeries?`<input type="hidden" name="series" value="${esc(selectedSeries)}">`:''}<h2>Filtros del producto</h2>${optionMarkup('model','Modelo',modelValues,selectedModel)}${optionMarkup('technology','Tecnología',technologyValues,selectedTechnology)}${optionMarkup('quality','Calidad / versión',qualityValues,selectedQuality)}<button type="submit">Aplicar filtros</button></form>`:''}</div></aside><div class="zay-results"><header><div><p class="zay-kicker">Resultados</p><h2 data-result-title>${esc(resultTitle)}</h2></div><a data-clear href="${selected==='all'?'/productos/':`/productos/?category=${selected}`}">Limpiar filtros</a></header><p data-result-count data-site-catalog-status data-v3-results>${matches.length} ${matches.length===1?'producto encontrado':'productos encontrados'}</p><div class="zay-product-grid" data-zay-catalog>${matches.map(card).join('')}</div>${showEmpty ? `<div class="zay-empty" data-empty data-site-catalog-empty><h2 data-site-catalog-empty-title>Sin resultados${qRaw?`: ${esc(qRaw)}`:''}</h2><p>No sustituimos con productos de otra categoría.</p><a class="zay-button zay-orange" data-site-catalog-empty-whatsapp href="${searchQuote(qRaw)}" target="_blank" rel="noopener noreferrer">Consultar por WhatsApp</a></div>` : ''}<button class="zay-load-more" data-load-more data-v3-more>Ver más productos</button></div></div></div></section></main>${footer()}<a class="zay-floating" href="${quote()}" target="_blank" rel="noopener noreferrer">WhatsApp</a>`;
  }

  function category(type){const all=products(),isHydro=type==='hidrogel',key=isHydro?'hidrogel':'ai',title=isHydro?'Hidrogel':'Productos AI',list=all.filter(p=>primary(p)===key),count=list.length,intro=isHydro?'Películas por acabado y equipo de corte organizados en familias claras.':'Gafas inteligentes y cámaras publicadas para ampliar el catálogo de tu tienda.';return `${header(key)}<main ${uiId(`${key}-category-page`)}><section class="zay-page-head"><div class="zay-container"><p class="zay-kicker">HAODE México</p><h1>${title}</h1><p>${intro}</p></div></section><section class="zay-catalog"><div class="zay-container">${familyLanding(key,all)}<a class="zay-view-all" href="/productos/?category=${key}&view=all">Ver los ${count} productos con filtros</a><section class="zay-category-products"><header class="zay-results-head"><div><p class="zay-kicker">Productos publicados</p><h2>${count} productos</h2></div></header><div class="zay-product-grid">${list.map(card).join('')}</div></section>${isHydro?'':'<aside class="zay-review-note"><strong>También puedes explorar cámaras</strong><p>Consulta los modelos de cámara publicados y confirma versión, disponibilidad y precio por WhatsApp.</p><a href="/categoria/camaras-inteligentes/">Ver cámaras publicadas</a></aside>'}</div></section></main>${footer()}<a class="zay-floating" data-contact-area="floating" href="${quote()}" target="_blank" rel="noopener noreferrer">WhatsApp</a>`}

  function news(){const list=products().filter(p=>!p.usesPlaceholder).slice(0,6);return `${header('')}<main data-ui-id="news-page"><section class="zay-page-head"><div class="zay-container"><p class="zay-kicker">HAODE México</p><h1>Novedades</h1><p>Selección actual del catálogo publicado para técnicos, tiendas y distribuidores.</p></div></section><section class="zay-section"><div class="zay-container"><div class="zay-product-grid">${list.map(card).join('')}</div></div></section></main>${footer()}<a class="zay-floating" href="${quote()}" target="_blank" rel="noopener noreferrer">WhatsApp</a>`}

  function wireShell(){const h=document.querySelector('[data-zay-header]'),b=h?.querySelector('.zay-menu-button');b?.addEventListener('click',()=>{const open=h.classList.toggle('is-open');b.setAttribute('aria-expanded',open)});}
  function wireCatalog(){const grid=document.querySelector('[data-zay-catalog]'),panel=document.querySelector('[data-zay-filter-panel]'),toggle=panel?.querySelector('.zay-filter-toggle');toggle?.addEventListener('click',()=>{const open=panel.classList.toggle('is-open');toggle.setAttribute('aria-expanded',open)});if(!grid)return;const cards=[...grid.querySelectorAll('[data-zay-product]')],more=document.querySelector('[data-load-more]');let limit=matchMedia('(max-width: 760px)').matches?12:24;const update=()=>{cards.forEach((card,index)=>card.hidden=index>=limit);if(more){more.hidden=cards.length<=limit;more.textContent=`Ver más (${Math.max(0,cards.length-limit)})`}};more?.addEventListener('click',()=>{limit=cards.length;update()});update()}
  function installDetail(){document.querySelectorAll('header,.catalog-topbar').forEach(n=>n.remove());body.insertAdjacentHTML('afterbegin',header('pantallas'));document.querySelectorAll('footer').forEach(n=>n.remove());body.insertAdjacentHTML('beforeend',footer());if(!document.querySelector('.zay-floating'))body.insertAdjacentHTML('beforeend',`<a class="zay-floating" href="${quote()}" target="_blank" rel="noopener noreferrer">WhatsApp</a>`);body.classList.add('zay-candidate','zay-detail');body.dataset.v3Ready='true';wireShell()}
  function render(){if(body.dataset.v3Detail==='true'){installDetail();window.HaodePrivacy?.mountControls?.();return}const page=body.dataset.v3Page;if(page==='home'){body.dataset.v3Ready='true';window.HaodePrivacy?.mountControls?.();return}const builders={pantallas:catalog,hidrogel:()=>category('hidrogel'),ai:()=>category('ai'),novedades:news};if(builders[page])body.innerHTML=`<div class="zay-shell">${builders[page]()}</div>`;else{document.querySelectorAll('header,.catalog-topbar,.reference-header,.site-header,.topbar').forEach(n=>n.remove());body.insertAdjacentHTML('afterbegin',header(''));document.querySelectorAll('footer').forEach(n=>n.remove());body.insertAdjacentHTML('beforeend',footer());document.querySelectorAll('.reference-sticky-whatsapp').forEach(n=>n.remove());if(!document.querySelector('.zay-floating'))body.insertAdjacentHTML('beforeend',`<a class="zay-floating" href="${quote()}" target="_blank" rel="noopener noreferrer">WhatsApp</a>`)}body.classList.add('zay-candidate');body.classList.remove('v3-atlas','v3-lab');body.dataset.v3Ready='true';wireShell();wireCatalog();window.HaodePrivacy?.mountControls?.()}
  const boot=()=>{render();const copy=document.querySelector('.zay-footer-brand>p');if(copy)copy.textContent='Productos para técnicos: pantallas y tecnología para talleres, tiendas y distribuidores en México.';const footerApp=document.querySelector('.zay-footer-app');if(footerApp)footerApp.classList.add('site-sales-footer-app');const iphoneNote=document.querySelector('[data-quality-navigation="iphone"]>header>p:last-child');if(iphoneNote)iphoneNote.textContent='Elige tecnología y después filtra el modelo y la versión publicada.';document.querySelectorAll('.zay-quality-card>small').forEach(node=>node.remove());};
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();
