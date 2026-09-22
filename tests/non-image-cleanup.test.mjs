import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
test('public email roles match owner decision and secondary contact stays on Contacto', () => {
  const walk = dir => fs.readdirSync(dir, {withFileTypes:true}).flatMap(e => ['.git','node_modules','_site'].includes(e.name) ? [] : e.isDirectory() ? walk(path.join(dir,e.name)) : [path.join(dir,e.name)]);
  for (const file of walk(root).filter(f => f.endsWith('.html'))) {
    const html = fs.readFileSync(file,'utf8');
    assert.doesNotMatch(html, /ventas@haode\.com\.mx/i, file);
    if (file !== path.join(root,'contacto/index.html')) assert.doesNotMatch(html, /mailto:cristi3an@gmail\.com/i, file);
  }
  const contact=read('contacto/index.html');
  assert.match(contact, /Ventas \/ Cotizaciones \/ Mayoreo \/ Contacto general/);
  assert.match(contact, /Dirección: <a[^>]+href="mailto:cristi3an@gmail.com"/);
  assert.match(contact, /"email": "haodemx@gmail.com"/);
  assert.match(read('index.html'), /mailto:haodemx@gmail.com/);
});
test('homepage structured categories match all nine locked C-layout entries', () => {
  const html = read('index.html');
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  const items = schema['@graph'].find(x => x['@id'].endsWith('#main-categories')).itemListElement;
  const links = [...html.matchAll(/class="c-category-card" href="([^"]+)"/g)].map(m => 'https://haode.com.mx' + m[1]);
  assert.deepEqual(items.map(i => i.url), links);
  assert.match(read('index.md'), /Pantallas y tecnología para vender y reparar/);
  assert.match(read('index.md'), /Diagnóstico OLED/);
});
test('AI public pages do not expose editorial instructions or future catalog scaffolding', () => {
  for (const p of ['productos-ai/index.html','productos-ai.html','categoria/productos-ai/index.html','ai-productos.html']) {
    assert.doesNotMatch(read(p), /Este contenido ayuda|mantiene una comunicación|funciones no verificadas|futuros modelos|base visual lista|Base lista para crecer|cargar un producto/i, p);
  }
});
test('empty media containers are hidden before JavaScript on every static product route', () => {
  const files = ['producto.html', ...fs.readdirSync(path.join(root,'producto')).filter(x => fs.existsSync(path.join(root,'producto',x,'index.html'))).map(x => `producto/${x}/index.html`)];
  for (const file of files) {
    const html=read(file);
    for (const match of html.matchAll(/<div\b[^>]*class="detail-(?:gallery|video)-wrap"[^>]*>[\s\S]*?<div\b[^>]*data-detail-(?:gallery|videos)[^>]*>\s*<\/div>\s*<\/div>/g)) {
      assert.match(match[0].split('>')[0], /\bhidden\b/, file);
    }
    assert.doesNotMatch(html, /Más fotos y videos próximamente/);
  }
  assert.match(read('scripts/sync-customer-prices.js'), /class="detail-gallery-wrap" hidden/);
});
test('static catalog offers the established diagnostic category beside other screen technologies', () => {
  const quick = read('productos/index.html').match(/class="catalog-priority-links"[\s\S]*?<\/div>\s*<div class="catalog-positioning"/)[0];
  assert.match(quick, /href="\/categoria\/oled-diagnostica\/"/);
  assert.doesNotMatch(read('productos/index.html'), /No encontramos ese producto/);
});

test('no-JavaScript visitors are not hidden by the JavaScript boot guard', () => {
  assert.match(read('v3-screen-atlas.css'), /@media \(scripting: enabled\)\{body\[data-v3-page\][^\n]+visibility:hidden/);
});
