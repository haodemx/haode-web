import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const targets = [
  ['productos-ai/index.html', 'Gafas y productos AI en México | HAODE', 'Gafas inteligentes y productos AI'],
  ['tienda-oficial-hl-cdmx/index.html', 'Cómo llegar a HAODE en CDMX | Piso 2, Local 225', 'Cómo llegar a HAODE en CDMX']
];
for (const [file, title, heading] of targets) {
  test(`search intent and canonical metadata stay consistent: ${file}`, () => {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    assert.ok(html.includes(`<title>${title}</title>`));
    for (const property of ['og:title', 'twitter:title']) assert.ok(html.includes(`content="${title}"`), property);
    assert.ok(html.includes(`<h1>${heading}</h1>`));
    assert.equal((html.match(/<h1>/g) || []).length, 1);
    const schema = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
    const pages = schema.flatMap(value => value['@graph'] || [value]).filter(value => ['CollectionPage', 'WebPage'].includes(value['@type']));
    assert.equal(pages[0].name, title);
    assert.ok(html.includes('https://haode.com.mx/' + file.replace('index.html', '')));
    assert.doesNotMatch(html, /(?:\/Users\/|localhost|garantizado|mejor precio)/i);
  });
}
test('store route facts remain unchanged and AI copy requires confirmation', () => {
  const store = fs.readFileSync(path.join(root, targets[1][0]), 'utf8');
  const ai = fs.readFileSync(path.join(root, targets[0][0]), 'utf8');
  assert.match(store, /Eje Central Lázaro Cárdenas 87/);
  assert.match(store, /Piso 2, Local 225/);
  assert.match(store, /https:\/\/wa\.me\/523326684296/);
  assert.match(ai, /modelo, cantidad y ciudad/);
  assert.match(ai, /confirmar versión, disponibilidad y precio/);
  const maintenance = fs.readFileSync(path.join(root, 'scripts/refresh-seo-pages.mjs'), 'utf8');
  assert.ok(maintenance.includes("['productos-ai/index.html'"));
  assert.ok(maintenance.includes("['tienda-oficial-hl-cdmx/index.html'"));
});
test('bounded candidate stylesheet is explicitly packaged without widening the asset tree', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'public-site-files.json'), 'utf8'));
  assert.ok(manifest.files.includes('assets/css/growth-local-pages.css'));
  assert.ok(manifest.required.includes('assets/css/growth-local-pages.css'));
  assert.ok(!manifest.trees.find(tree => tree.path === 'assets').extensions.includes('.css'));
});
