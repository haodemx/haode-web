// Screen-only editorial rules. Catalogue facts, prices, routes and assets stay in their original sources.
export const SCREEN_DATE = '2026-09-04';
export const SCREEN_FAMILIES = {
  'iphone-incell': {
    label: 'Pantallas iPhone INCELL', wholesale: 'pantallas-iphone-incell-mayoreo-mexico',
    description: 'Pantallas iPhone INCELL en México. Selecciona modelo y versión estándar o Bolsa Protectora donde esté publicada; cotiza cantidad con HAODE.',
    advice: 'Distingue el modelo base, mini, Plus, Pro y Pro Max. En iPhone 11 y XR, la versión estándar y Bolsa Protectora tienen fichas separadas: indica cuál necesitas.',
    question: '¿Cómo distingo la versión de esta pantalla INCELL?',
  },
  'iphone-oled': {
    label: 'Pantallas iPhone OLED', wholesale: 'pantallas-iphone-oled-mayoreo-mexico',
    description: 'Pantallas iPhone OLED en México. Consulta modelos y variantes publicadas, revisa la calidad de cada ficha y cotiza con HAODE por WhatsApp.',
    advice: 'Elige primero el modelo completo y después la variante publicada. Soft OLED, Hard OLED y MOVE IC no deben tratarse como equivalentes; confirma el procedimiento de instalación de la referencia.',
    question: '¿Todas las referencias OLED tienen la misma construcción?',
  },
  'oled-diagnostica': {
    label: 'Pantallas diagnóstico para iPhone', wholesale: 'pantallas-iphone-mayoreo-mexico',
    description: 'Pantallas diagnóstico para iPhone de HAODE México: consulta la línea OLED diagnóstica y confirma modelo, instalación y cantidad antes de comprar.',
    advice: 'La denominación OLED Diagnóstica identifica esta línea del catálogo. No garantiza por sí sola autoprogramación, ausencia de avisos, True Tone ni instalación sin trasplante de IC. Confirma cada función para el modelo y la versión de iOS.',
    question: '¿Diagnóstica significa que funciona sin trasplante ni avisos?',
  },
  'samsung-incell': {
    label: 'Pantallas Samsung INCELL', wholesale: 'pantallas-samsung-incell-mayoreo-mexico',
    description: 'Pantallas Samsung INCELL en México. Busca el modelo completo, revisa la calidad publicada y confirma versión y cantidad con HAODE.',
    advice: 'Además del nombre Galaxy, envía el código de modelo del equipo. No asumas que una pantalla INCELL conserva las funciones de otra tecnología; confirma montaje, sensores y pruebas necesarias antes de instalar.',
    question: '¿Basta con indicar el nombre comercial del Samsung?',
  },
  'samsung-oled': {
    label: 'Pantallas Samsung OLED', wholesale: 'pantallas-samsung-oled-mayoreo-mexico',
    description: 'Pantallas Samsung OLED en México: consulta Galaxy S y Note publicados. Confirma código de modelo, calidad y cantidad con HAODE antes de comprar.',
    advice: 'Revisa el código del equipo y la referencia de la ficha. La búsqueda AMOLED no confirma por sí sola tecnología exacta, lector de huella, frecuencia de actualización ni equivalencia con la pantalla de fábrica.',
    question: '¿OLED o AMOLED confirma todas las funciones del equipo?',
  },
  'samsung-tipo-original': {
    label: 'Pantallas Samsung tipo original con marco', wholesale: 'pantallas-samsung-mayoreo-mexico',
    description: 'Pantallas Samsung tipo original con marco en HAODE México. Revisa modelo y referencia; confirma el conjunto incluido antes de cotizar.',
    advice: 'Tipo original es la clasificación comercial de esta categoría, no una certificación de Samsung ni una promesa de Service Pack. Confirma código, marco, color y componentes incluidos en cada referencia.',
    question: '¿Tipo original equivale a Service Pack certificado?',
  },
};

export const isScreen = (product) => Object.hasOwn(SCREEN_FAMILIES, product.category);
export const isFoldable = (product) => product.category === 'samsung-tipo-original' && /Z (Flip|Fold)/i.test(product.name);
const escape = (value) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const link = (href, text) => `<a href="${href}">${escape(text)}</a>`;

export function screenName(product) {
  let name = product.name.replace(/^HAODE\s+/i, '').replace(/\s*-\s*Modelo\s+/i, ' para iPhone ');
  const quality = product.quality || '';
  const label = /SOFT OLED/i.test(quality) ? 'Soft OLED' : /HARD OLED/i.test(quality) ? 'Hard OLED'
    : /ORIGINAL/i.test(quality) && product.category === 'samsung-tipo-original' ? 'Tipo Original'
      : /INCELL/i.test(quality) ? 'INCELL' : /OLED/i.test(quality) ? 'OLED' : '';
  if (label && !name.toLowerCase().includes(label.toLowerCase())) name += ` ${label}`;
  return name;
}

export function screenAdvice(product) {
  return isFoldable(product)
    ? 'Para Z Flip y Z Fold, confirma generación, código de modelo y si necesitas pantalla interna, externa o conjunto con marco. El nombre de la generación no confirma qué componentes incluye esta referencia.'
    : SCREEN_FAMILIES[product.category].advice;
}

export function screenGuide(product, products) {
  const family = SCREEN_FAMILIES[product.category];
  const name = screenName(product);
  const same = products.filter((p) => p.category === product.category);
  const at = same.findIndex((p) => p.id === product.id);
  const neighbours = [same[at - 1], same[at + 1], same[at + 2]].filter(Boolean);
  const question = isFoldable(product) ? '¿Esta referencia corresponde a pantalla interna o externa?' : family.question;
  return `      <section class="detail-seo-guide" data-seo-product-guide="20260821" data-screen-seo="${SCREEN_DATE}" aria-labelledby="seo-guide-${escape(product.id)}">
        <div>
          <p class="section-kicker">Modelo y calidad</p>
          <h2 id="seo-guide-${escape(product.id)}">${escape(name)}: qué revisar antes de comprar</h2>
          <p>Esta ficha de HAODE México corresponde a ${escape(name)}. La calidad registrada es ${escape(product.quality)}; la referencia de catálogo es ${escape(product.id)}.</p>
          <p>Para cotizar esta pantalla o display, envía la referencia, cantidad y ciudad por WhatsApp. Confirma compatibilidad, disponibilidad, precio vigente y condiciones de garantía y envío antes de cerrar el pedido.</p>
        </div>
        <div class="seo-product-faq" aria-label="Preguntas sobre esta referencia">
          <details><summary>${escape(question)}</summary><p>${escape(screenAdvice(product))}</p></details>
          <details><summary>¿Qué referencia debo enviar a HAODE?</summary><p>Indica ${escape(product.id)} (${escape(name)}), la cantidad y tu ciudad. Adjunta el código de modelo del equipo si hay variantes.</p></details>
          <details><summary>¿Puedo pedir otro modelo como sustituto?</summary><p>No asumas compatibilidad entre modelos ni calidades. Las fichas relacionadas son opciones de consulta, no sustitutos confirmados de esta referencia.</p></details>
        </div>
        <nav class="seo-related-static" aria-label="Categoría y referencias relacionadas">
          ${link(`/categoria/${product.category}/`, family.label)}${link(`/${family.wholesale}/`, 'Preparar una lista de mayoreo')}${neighbours.map((p) => link(`/producto/${p.id}/`, screenName(p))).join('')}
        </nav>
      </section>`;
}

function metadata(html, title, description) {
  let out = html.replace(/<title>[^<]*<\/title>/i, `<title>${escape(title)}</title>`);
  for (const [attr, key, value] of [
    ['name', 'description', description], ['property', 'og:title', title],
    ['property', 'og:description', description], ['name', 'twitter:title', title], ['name', 'twitter:description', description],
  ]) {
    const pattern = new RegExp(`(<meta\\s+${attr}=["']${key}["']\\s+content=["'])[^"']*(["'][^>]*>)`, 'i');
    if (pattern.test(out)) out = out.replace(pattern, (_, open, close) => `${open}${escape(value)}${close}`);
    else out = out.replace('</head>', `  <meta ${attr}="${key}" content="${escape(value)}" />\n</head>`);
  }
  return out;
}

function schemaNodes(html, update) {
  return html.replace(/(<script[^>]+type=["']application\/ld\+json["'][^>]*>)([\s\S]*?)(<\/script>)/gi, (block, open, source, close) => {
    const data = JSON.parse(source);
    for (const node of data['@graph'] || [data]) update(node);
    // Preserve formatting when the semantic data did not change.
    if (JSON.stringify(data) === JSON.stringify(JSON.parse(source))) return block;
    return `${open}\n${JSON.stringify(data, null, 2).replace(/</g, '\\u003c')}\n${close}`;
  });
}

export function refreshScreenProduct(html, product) {
  const name = screenName(product);
  const title = product.id === 'iphone-incell-xr'
    ? 'Pantalla para iPhone XR INCELL: precio y cotización | HAODE' : `${name} | HAODE México`;
  const description = `${name} en HAODE México. Confirma modelo, calidad y cantidad por WhatsApp antes de comprar.`;
  let out = metadata(html, title, description);
  out = out.replace(/<meta\s+name=["']keywords["'][^>]*>\s*/i, '');
  out = out.replace(/(<[^>]+data-detail-quality[^>]*>)[^<]*(<\/[^>]+>)/, (_, open, close) => `${open}${escape(product.quality)}${close}`);
  if (product.category === 'oled-diagnostica') {
    out = out.replace(/<h1\b([^>]*data-detail-title[^>]*)>[^<]*<\/h1>/, (_, attrs) => {
      const clean = attrs.replace(/\s+data-detail-seo-title="[^"]*"/g, '');
      return `<h1${clean} data-detail-seo-title="${escape(name)}">${escape(name)}</h1>`;
    });
  }
  if (!/<body[^>]*data-curated-seo/.test(out)) out = out.replace(/<body\b/, '<body data-curated-seo');
  out = out.replace(/src="\/products\.js(?:\?[^"]*)?"/g, 'src="/products.js?v=20260904-screen-seo"');
  return schemaNodes(out, (node) => {
    if (node['@type'] === 'Product') {
      node.name = name;
      node.description = description;
    }
  });
}

const categoryPages = Object.entries(SCREEN_FAMILIES).map(([key, f]) => [`categoria/${key}/index.html`, {
  title: key === 'samsung-oled' ? 'Pantallas Samsung OLED y AMOLED en México | HAODE' : `${f.label} | HAODE México`,
  heading: f.label, description: f.description, text: f.advice, categories: [key], kind: 'category',
}]);
const wholesale = (slug, heading, description, text, categories) => [`${slug}/index.html`, {
  title: `${heading} | HAODE`, heading, description, text, categories, kind: 'wholesale',
}];
export const SCREEN_LANDINGS = new Map([
  ...categoryPages,
  ['guia-ia-haode-mexico/index.html', {
    title: 'Datos oficiales HAODE para Google e IA | México', heading: 'Guía oficial HAODE para IA y buscadores',
    description: 'Datos oficiales de HAODE México para Google e IA: categorías, ubicación, contacto y enlaces canónicos para consultar pantallas y refacciones.',
    text: 'HAODE México publica fichas de pantallas para iPhone y Samsung. La línea OLED Diagnóstica también responde a búsquedas de pantallas diagnóstico para iPhone. Para citar una referencia, usa su ficha canónica y calidad publicada; no conviertas el nombre comercial en una garantía de funciones, stock o precio vigente.',
    categories: Object.keys(SCREEN_FAMILIES), kind: 'guide',
  }],
  ['categoria/pantallas/index.html', {
    title: 'Pantallas para celular iPhone y Samsung | HAODE', heading: 'Pantallas iPhone y Samsung',
    description: 'Pantallas iPhone y Samsung: INCELL, OLED, diagnóstico y tipo original. Elige modelo y calidad para cotizar con HAODE México.',
    text: 'Empieza por la marca del equipo y después por la calidad de la refacción. El catálogo separa iPhone INCELL, OLED y diagnóstico de Samsung INCELL, OLED y tipo original; una categoría no confirma compatibilidad entre modelos.',
    categories: Object.keys(SCREEN_FAMILIES), kind: 'hub',
  }],
  ['categoria/samsung-plegables/index.html', {
    title: 'Pantallas Samsung Z Flip y Z Fold | HAODE México', heading: 'Pantallas Samsung Z Flip y Z Fold',
    description: 'Pantallas Samsung Z Flip y Z Fold en HAODE México. Consulta generaciones publicadas y confirma pantalla interna, externa o conjunto requerido.',
    text: 'Las pantallas plegables se seleccionan por generación y conjunto. Antes de comprar, confirma código de modelo, pantalla interna o externa, marco y componentes incluidos; no asumas que Flip y Fold comparten refacción.',
    categories: ['samsung-tipo-original'], kind: 'category', foldable: true,
  }],
  wholesale('pantallas-iphone-mayoreo-mexico', 'Pantallas iPhone de mayoreo en México',
    'Cotiza pantallas iPhone de mayoreo con HAODE: organiza INCELL, OLED y diagnóstico por modelo y cantidad. Confirma condiciones antes de comprar.',
    'Prepara una lista con una fila por modelo, calidad y variante. Separa INCELL, OLED y OLED Diagnóstica; no agrupes versiones Pro, Plus y Pro Max en una sola referencia.', ['iphone-incell', 'iphone-oled', 'oled-diagnostica']),
  wholesale('pantallas-samsung-mayoreo-mexico', 'Pantallas Samsung de mayoreo en México',
    'Cotiza pantallas Samsung de mayoreo con HAODE. Envía modelo, código del equipo, INCELL, OLED o tipo original, cantidad y ciudad.',
    'Organiza tu compra Samsung por código de equipo y calidad. Separa las referencias Galaxy S y Note de Z Flip y Z Fold; indica el conjunto requerido en cada plegable.', ['samsung-incell', 'samsung-oled', 'samsung-tipo-original']),
  ...['iphone-incell', 'iphone-oled', 'samsung-incell', 'samsung-oled'].map((key) => {
    const f = SCREEN_FAMILIES[key];
    const phrase = f.label.replace(/^Pantallas/, 'pantallas');
    return wholesale(f.wholesale, `${f.label} de mayoreo`,
      `Cotiza ${phrase} de mayoreo con HAODE México. Envía una lista por modelo, versión y cantidad; confirma las condiciones del pedido.`,
      `Para compras de ${phrase}, registra cada referencia por separado. ${f.advice}`, [key]);
  }),
  wholesale('pantallas-samsung-zflip-zfold-original-mexico', 'Pantallas Z Flip y Z Fold: cotización por lista',
    'Prepara tu pedido de pantallas Samsung Z Flip y Z Fold con HAODE México. Confirma generación, conjunto, código y cantidad por referencia.',
    'En una compra de plegables, especifica pantalla interna, externa o conjunto solicitado por cada generación. La palabra original en una búsqueda no demuestra procedencia ni certificación; solicita la ficha de la referencia antes de decidir.', ['samsung-tipo-original']),
  wholesale('pantallas-iphone-11-xr-mayoreo', 'Pantallas iPhone 11 y XR Mayoreo',
    'Cotiza pantallas iPhone 11 y XR INCELL con HAODE México. Distingue versión estándar y Bolsa Protectora, cantidad por referencia y ciudad.',
    'Envía cuatro renglones distintos si necesitas iPhone 11 estándar, iPhone 11 Bolsa Protectora, XR estándar y XR Bolsa Protectora. No uses una cantidad global que oculte la distribución de versiones.', ['iphone-incell']),
  ['pantallas-premium-iphone-samsung-fabrica/index.html', {
    title: 'Pantallas iPhone y Samsung: guía de calidades | HAODE', heading: 'Pantallas premium iPhone y Samsung: guía de calidades',
    description: 'Compara las líneas de pantallas iPhone y Samsung de HAODE México. Revisa calidad, modelo y requisitos de instalación antes de cotizar.',
    text: 'Premium es una descripción comercial, no una especificación única. Compara la calidad registrada de cada ficha, el modelo exacto y los requisitos de instalación. No deduzcas brillo, frecuencia, huella ni procedencia a partir de esa palabra.',
    categories: Object.keys(SCREEN_FAMILIES), kind: 'guide',
  }],
]);

export const DIAGNOSTIC_FAQ = [
  ['¿Qué son las pantallas diagnóstico para iPhone de HAODE?', 'Son las referencias publicadas en la línea OLED Diagnóstica de HAODE México. Consulta cada modelo y confirma compatibilidad y procedimiento de instalación antes de comprar.'],
  ['¿Pantallas diagnóstico y modo diagnóstico del iPhone son lo mismo?', 'No. Aquí se trata de una refacción de pantalla. El modo diagnóstico del iPhone es una función del equipo; buscar cómo entrar en ese modo no identifica una pantalla de reemplazo.'],
  ['¿Diagnóstica significa autoprogramable o sin trasplante de IC?', 'No debe asumirse. Los términos diagnóstico, diagnosticable y autoprogramable aparecen en búsquedas, pero no garantizan las mismas funciones. Confirma el procedimiento para el SKU y la versión de iOS.'],
  ['¿Se garantiza que no habrá mensaje de pieza desconocida?', 'No por el nombre de la categoría. Antes de comprar, confirma para la referencia exacta los avisos, True Tone, calibración y pasos de instalación; no extrapoles resultados de otro modelo.'],
];

export function refreshScreenLanding(html, config, products) {
  let out = metadata(html, config.title, config.description);
  if (!/<body[^>]*data-screen-seo-page/.test(out)) out = out.replace(/<body\b/, '<body data-screen-seo-page');
  out = out.replace(/href="\/style\.css(?:\?[^"]*)?"/g, 'href="/style.css?v=20260904-screen-seo"');
  out = out.replace(/<h1\b([^>]*)>[^<]*<\/h1>/i, `<h1$1>${escape(config.heading)}</h1>`);
  out = out.replace(/(<p class="hero-text">)[\s\S]*?(<\/p>)/i, (_, open, close) => `${open}${escape(config.description)}${close}`);
  out = out.replace(/Listado de iPhone OLED Pro Max/g, 'Listado de pantallas iPhone OLED');
  out = out.replace(/Listado de Samsung Ultra OLED/g, 'Listado de pantallas Samsung OLED');
  if (config.kind === 'category') {
    out = out.replace(/(<div class="seo-content" data-seo-content="phase1">)[\s\S]*?(<\/div>)/, (_, open, close) => `${open}\n          <p>${escape(config.description)}</p>\n          <p>${escape(config.text)}</p>\n        ${close}`);
  }
  const copyCorrections = [
    ['La línea iPhone OLED está enfocada en técnicos, talleres y distribuidores que atienden reparaciones de mayor valor y necesitan cotizar modelos iPhone Pro y Pro Max por cantidad.', 'La línea iPhone OLED permite consultar los modelos publicados, incluidos modelos base, Plus, Pro y Pro Max. La calidad y el procedimiento deben confirmarse por referencia.'],
    ['Técnicos, talleres y distribuidores que atienden reparaciones de mayor valor y necesitan cotizar modelos iPhone Pro y Pro Max por cantidad.', 'Técnicos, talleres y distribuidores que necesitan seleccionar el modelo y la variante OLED de cada refacción.'],
    ['Esta categoría reúne rutas para pantallas Samsung OLED y AMOLED de líneas Galaxy Ultra y modelos premium, orientadas a técnicos, talleres y distribuidores.', 'Esta categoría reúne las referencias Samsung OLED publicadas, incluidas Galaxy S y Note. Confirma las funciones y la tecnología exacta por referencia.'],
    ['Rutas para pantallas Samsung OLED y AMOLED de líneas Galaxy Ultra y modelos premium, orientadas a técnicos, talleres y distribuidores.', 'Referencias Samsung OLED publicadas, incluidas Galaxy S y Note. Confirma funciones y tecnología exacta por referencia.'],
    ['HAODE organiza la oferta en líneas iPhone INCELL y iPhone OLED.', 'HAODE organiza la oferta en líneas iPhone INCELL, iPhone OLED y OLED Diagnóstica.'],
    ['Para modelos Pro o Pro Max, revisa la línea OLED.', 'Para modelos base, Plus, Pro y Pro Max publicados, revisa la calidad específica de la línea OLED.'],
  ];
  for (const [before, after] of copyCorrections) out = out.split(before).join(after);
  out = out.replace(/<meta\s+name=["']keywords["'][^>]*>\s*/i, '');
  const selected = products.filter((p) => config.categories.includes(p.category) && (!config.foldable || isFoldable(p)));
  const links = config.kind === 'category'
    ? selected.map((p) => link(`/producto/${p.id}/`, screenName(p))).join('')
    : config.categories.map((key) => link(`/categoria/${key}/`, SCREEN_FAMILIES[key].label)).join('');
  const buying = config.kind === 'wholesale';
  const section = `    <section class="section seo-index-hub" data-seo-index-hub="20260821" data-screen-seo="${SCREEN_DATE}" aria-labelledby="seo-index-hub-title">
      <div class="wrap section-shell">
        <p class="section-kicker">${buying ? 'Compra por lista' : 'Selección de referencia'}</p>
        <h2 id="seo-index-hub-title">${buying ? 'Cómo preparar tu solicitud de mayoreo' : 'Modelo, calidad y requisitos antes de comprar'}</h2>
        <p>${escape(config.text)}</p>
        ${buying ? '<ol><li>Envía una fila por referencia, versión y cantidad.</li><li>Indica ciudad y las condiciones que necesitas confirmar.</li><li>Revisa con HAODE disponibilidad, precio aplicable, garantía y envío antes de cerrar la compra.</li></ol>' : ''}
        <nav class="seo-index-hub-links" aria-label="${buying ? 'Seleccionar referencias para la lista' : 'Consultar fichas y categorías'}">${links}</nav>
        <nav class="seo-index-hub-links" aria-label="Continuar la consulta">${link('/categoria/pantallas/', 'Todas las líneas de pantallas')}${config.categories.length === 1 && !buying ? link(`/${SCREEN_FAMILIES[config.categories[0]].wholesale}/`, 'Compra por cantidad') : ''}${link('/guia-ia-haode-mexico/', 'Información oficial y contacto HAODE')}</nav>
      </div>
    </section>`.replace(/^ +$/gm, '');
  if (/<section[^>]+data-seo-index-hub=/.test(out)) out = out.replace(/<section[^>]+data-seo-index-hub=["']20260821["'][\s\S]*?<\/section>/, section.trimStart());
  else out = out.replace('</main>', `${section}\n  </main>`);
  if (config.categories[0] === 'oled-diagnostica') {
    const faq = DIAGNOSTIC_FAQ.map(([q, a]) => `<article><h3>${escape(q)}</h3><p>${escape(a)}</p></article>`).join('\n          ');
    out = out.replace(/(<div class="faq-grid">)[\s\S]*?(<\/div>)/, (_, open, close) => `${open}\n          ${faq}\n        ${close}`);
  }
  return schemaNodes(out, (node) => {
    if (['CollectionPage', 'WebPage'].includes(node['@type'])) {
      node.name = config.heading;
      node.description = config.description;
    }
    if (node['@type'] === 'FAQPage' && config.categories[0] === 'oled-diagnostica') {
      node.mainEntity = DIAGNOSTIC_FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } }));
    }
  });
}
