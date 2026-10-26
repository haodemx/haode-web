import fs from 'node:fs';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const escape = v => String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
export function readCatalog() {
  const c = {window:{}};
  vm.runInNewContext(fs.readFileSync(path.join(ROOT,'data/products.generated.js'),'utf8'),c);
  return c.window.HAODE_PRODUCTS_DATA;
}
export function modelKey(p) {
  // Preserve variants and combined-model references; never infer interchangeability.
  if (p.category === 'oled-diagnostica') return p.model.replace(/^Modelo\s+/i, 'iPhone ');
  return p.name.replace(/^Pantalla\s+(?:para\s+)?/i,'').replace(/\s+INCELL FHD$/i,'').trim().replace(/\s+/g,' ');
}
export function groupsFor(products, kind) {
  const groups = new Map();
  for (const p of products) {
    const samsung = ['samsung-incell','samsung-oled','samsung-tipo-original'].includes(p.category);
    const fold = samsung && /\bZ\s*(?:Flip|Fold)/i.test(p.name);
    const iphone = ['iphone-incell','iphone-oled','oled-diagnostica'].includes(p.category);
    if (!(kind==='iphone' ? iphone : kind==='fold' ? fold : samsung && !fold)) continue;
    const label = modelKey(p);
    const key = label.toLowerCase().replace(/\s+/g,'').replace(/galaxy/g,'');
    if (!groups.has(key)) groups.set(key,{model:label,series: fold?'Plegables':/Ultra/i.test(label)?'Ultra':/Note/i.test(label)?'Note':iphone?'iPhone':'Galaxy S', products:[]});
    groups.get(key).products.push(p);
  }
  return [...groups.values()].sort((a,b)=>a.model.localeCompare(b.model,'es',{numeric:true}));
}
export function quoteUrl(p, route) {
  const text = ['Hola HAODE México, quiero cotizar:',`Producto: ${p.name}`,`Referencia de catálogo: ${p.id}`,`Calidad / versión: ${p.quality}`,'Cantidad:','Ciudad:',`Producto: https://haode.com.mx/producto/${p.id}/`,`Origen: https://haode.com.mx${route}`,'¿Me confirman compatibilidad, stock en México, precio por cantidad, garantía local y envío antes del pedido?'].join('\n');
  return `https://wa.me/523326684296?text=${encodeURIComponent(text)}`;
}
export const DIRECTORIES = [
 ['pantallas-samsung-mayoreo-mexico/index.html','samsung','Pantallas Samsung de gama alta por mayoreo en México'],
 ['pantallas-iphone-mayoreo-mexico/index.html','iphone','Elige tu modelo iPhone y la calidad publicada'],
 ['pantallas-samsung-zflip-zfold-original-mexico/index.html','fold','Z Flip y Z Fold: generaciones y referencias publicadas'],
];
export function renderDirectory(products, kind, route, title) {
  const groups = groupsFor(products,kind);
  return `<section class="section acquisition-directory" data-acquisition-directory aria-labelledby="acquisition-title">
  <div class="wrap section-shell">
    <h2 id="acquisition-title">${escape(title)}</h2>
    <p>Selecciona el modelo completo y compara únicamente las calidades publicadas para esa referencia. HAODE vende pantallas y accesorios; no ofrece servicio de reparación de celulares.</p>
    <p>Los nombres de calidad son denominaciones del catálogo. Confirma tecnología, marco, funciones y compatibilidad antes de instalar; no indican por sí solos brillo, frecuencia ni certificación del fabricante.</p>
    ${kind==='samsung'?'<p><a href="/pantallas-samsung-zflip-zfold-original-mexico/">Consultar Z Flip y Z Fold por separado</a></p>':''}
    <div class="acquisition-filters" data-acquisition-filters hidden>
      <label>Buscar modelo <input type="search" data-acquisition-search placeholder="${kind==='iphone'?'Ej. iPhone 13 Pro':'Ej. S24 Ultra o Note 20'}" maxlength="80" /></label>
      <label>Filtrar línea <select data-acquisition-series><option value="">Todas las líneas</option>${[...new Set(groups.map(g=>g.series))].map(s=>`<option>${escape(s)}</option>`).join('')}</select></label>
      <button type="button" data-acquisition-reset>Mostrar todos</button>
    </div>
    <p role="status" data-acquisition-count>${groups.length} modelos publicados</p>
    <p data-acquisition-empty hidden>No hay coincidencias en este listado. Revisa el modelo o <a href="/contacto/">consulta una referencia con HAODE</a>. No asumimos disponibilidad para modelos no publicados.</p>
    <div class="acquisition-models">${groups.map(g=>`<details data-acquisition-model data-series="${escape(g.series)}"><summary>${escape(g.model)} <span>${g.products.length} ${g.products.length===1?'referencia':'referencias'}</span></summary><ul>${g.products.map(p=>`<li data-acquisition-reference="${escape(p.id)}"><strong>${escape(p.quality)}</strong><span>${escape(p.name)}</span><a href="/producto/${escape(p.id)}/">Ver ficha y material publicado</a><a data-product-whatsapp="${escape(p.id)}" href="${escape(quoteUrl(p,route))}" target="_blank" rel="noopener noreferrer">Cotizar ${escape(p.quality)}</a></li>`).join('')}</ul></details>`).join('\n')}</div>
    <p>¿Compras para tu taller o tienda? Envía una fila por modelo, calidad y cantidad. Confirmamos las condiciones de la cotización antes del pedido.</p>
  </div>
</section>`.replace(/^ +$/gm,'');
}
export function applyDirectories() {
  const products=readCatalog();
  for (const [file,kind,title] of DIRECTORIES) {
    const target=path.join(ROOT,file), route='/'+file.replace(/index.html$/,'');
    let html=fs.readFileSync(target,'utf8');
    const section=renderDirectory(products,kind,route,title);
    html=html.includes('data-acquisition-directory')?html.replace(/<section[^>]*data-acquisition-directory[\s\S]*?<\/section>/,section):html.replace('  </main>',section+'\n  </main>');
    if (!html.includes('/acquisition-directory.css')) html=html.replace('</head>','  <link rel="stylesheet" href="/acquisition-directory.css?v=20261026" />\n</head>');
    if (!html.includes('/acquisition-directory.js')) html=html.replace('</body>','  <script src="/acquisition-directory.js?v=20261026" defer></script>\n</body>');
    fs.writeFileSync(target,html);
  }
}
if (process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) applyDirectories();
