import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

function read(path) {
  return fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
}

test('App metadata, visible FAQ and FAQ schema use the same catalog intent', () => {
  const html = read('app/index.html');
  assert.match(html, /<title>Catálogo de pantallas y refacciones \| HAODE México<\/title>/);
  assert.match(html, /Cómo usar el catálogo HAODE/);
  assert.match(html, /"@type": "FAQPage"/);
});

test('priority search pages keep specific Mexico intent and useful snippets', () => {
  assert.match(read('categoria/samsung-oled/index.html'), /Pantallas Samsung OLED y AMOLED en México \| HAODE/);
  assert.match(read('categoria/maquinas-de-hidrogel/index.html'), /Máquina de hidrogel para cortar micas \| HAODE México/);
  assert.match(read('producto/iphone-incell-xr/index.html'), /Pantalla para iPhone XR INCELL: precio y cotización \| HAODE/);
});

test('HAODE publishes the verified HL official-site relationship without rating claims', () => {
  const home = read('index.html');
  const store = read('tienda-oficial-hl-cdmx/index.html');
  assert.match(home, /"url": "https:\/\/displayhl\.com\.mx\/"/);
  assert.match(store, /"url": "https:\/\/displayhl\.com\.mx\/"/);
  assert.doesNotMatch(`${home}\n${store}`, /AggregateRating|ratingValue|reviewCount/);
});

test('priority pages do not claim unverified stock or availability', () => {
  const pages = [
    read('app/index.html'),
    read('categoria/maquinas-de-hidrogel/index.html'),
    read('categoria/samsung-oled/index.html'),
    read('producto/iphone-incell-xr/index.html'),
  ].join('\n');
  assert.doesNotMatch(pages, /<strong>Stock en México<\/strong>|>stock local en CDMX<|Disponible para técnicos/i);
});
