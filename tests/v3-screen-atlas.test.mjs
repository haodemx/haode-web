import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (file) => fs.readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');

test('entry pages load their approved shared visual systems', () => {
  const homepage = read('index.html');
  assert.match(homepage, /<body class=["']home-page-c["']>/, 'index.html misses its approved C-layout marker');
  assert.match(homepage, /homepage-c\.css/, 'index.html misses approved C-layout styles');
  assert.match(homepage, /script\.js/, 'index.html misses approved C-layout behavior');

  const pages = [
    ['productos/index.html', 'pantallas'],
    ['micas.html', 'hidrogel'],
    ['productos-ai/index.html', 'ai'],
    ['baterias/index.html', 'baterias'],
    ['novedades/index.html', 'novedades'],
    ['contacto/index.html', 'contacto'],
  ];
  for (const [file, page] of pages) {
    const html = read(file);
    assert.match(html, new RegExp(`data-v3-page=["']${page}["']`), `${file} misses its V3 page marker`);
    assert.match(html, /v3-screen-atlas\.css/, `${file} misses shared V3 styles`);
    assert.match(html, /v3-screen-atlas\.js/, `${file} misses shared V3 behavior`);
  }
});

test('V3 navigation prioritizes Pantallas and Hidrogel without removing Fundas compatibility', () => {
  const script = read('v3-screen-atlas.js');
  const fundas = read('categoria/fundas/index.html');
  assert.match(script, /\['pantallas','Pantallas','\/productos\/\?category=pantallas'\]/);
  assert.match(script, /\['hidrogel','Hidrogel','\/micas\.html'\]/);
  assert.match(script, /\['ai','Productos AI','\/productos-ai\/'\]/);
  assert.doesNotMatch(script, /\['fundas','Fundas'/);
  assert.match(script, /GENERIC_DETAIL_CATEGORIES = new Set\(\[[^\]]*'fundas'/);
  assert.match(fundas, /rel=\"canonical\" href=\"https:\/\/haode\.com\.mx\/categoria\/fundas\/\"/);
});

test('V3 preserves real catalog data and uses an honest battery placeholder', () => {
  const script = read('v3-screen-atlas.js');
  const batteries = read('baterias/index.html');
  assert.match(script, /window\.HAODE_PRODUCTS_DATA/);
  assert.match(script, /\/assets\/products\/placeholder\.svg/);
  assert.match(script, /Imagen pendiente/);
  assert.match(batteries, /Modelos, imágenes, compatibilidad y precios se publicarán únicamente después de su validación\./);
  assert.doesNotMatch(batteries, /data-catalog-card/);
  assert.doesNotMatch(script, /fábrica directa|factory direct/i);
  assert.ok(script.includes("${p.quality?` · ${p.quality}`:''}"));
  assert.match(script, /Modelo\/SKU:/);
  assert.match(script, /Cantidad:/);
});

test('V3 routes are canonical and present in the sitemap', () => {
  const sitemap = read('sitemap.xml');
  for (const route of ['/baterias/', '/novedades/']) {
    const html = read(`${route.slice(1)}index.html`);
    assert.match(html, new RegExp(`rel=["']canonical["'] href=["']https://haode\\.com\\.mx${route.replaceAll('/', '\\/')}["']`));
    assert.match(sitemap, new RegExp(`<loc>https://haode\\.com\\.mx${route.replaceAll('/', '\\/')}</loc>`));
  }
});
