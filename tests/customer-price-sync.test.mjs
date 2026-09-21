import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

function websiteProducts() {
  const text = fs.readFileSync(new URL('../data/products.generated.js', import.meta.url), 'utf8');
  return JSON.parse(text.slice(text.indexOf('['), text.lastIndexOf(']') + 1));
}
const website = websiteProducts();
const app = JSON.parse(fs.readFileSync(new URL('../app/products.json', import.meta.url), 'utf8'));
const source = JSON.parse(fs.readFileSync(new URL('../data/customer-price-list-2026-09-21.json', import.meta.url), 'utf8'));
const report = JSON.parse(fs.readFileSync(new URL('../docs/reports/customer-price-sync-2026-09-21.json', import.meta.url), 'utf8'));
const appJs = fs.readFileSync(new URL('../app/app.js', import.meta.url), 'utf8');

function byId(items,id){const p=items.find(x=>x.id===id);assert.ok(p,`Missing product ${id}`);return p;}
function price(product,label){return product.prices.find(x=>x.quantity===label)?.price;}

test('2026-09-21 workbook is the authoritative customer price source', () => {
  assert.equal(source.sourceVersion, '2026-09-21');
  assert.equal(source.sourceWorkbook, 'HAODE_Lista_de_Precios_CLIENTES_V3_IPHONE_OLED_25-23-16-13_2026-09-21.xlsx');
  assert.equal(source.rows.length, 156);
  assert.deepEqual(source.rules.tiers, ['Menudeo','Mayoreo','Caja','VIP']);
  assert.equal(source.rules.automaticQuantityDiscounts, false);
});

test('website and App received all exact matched prices', () => {
  assert.equal(report.summary.websiteMatched, 153);
  assert.equal(report.summary.appMatched, 153);
  assert.equal(report.summary.ambiguous, 0);
  assert.equal(report.summary.unmatchedSource, 3);
  assert.equal(price(byId(website,'iphone-incell-11'),'Menudeo'),'$175 MXN');
  assert.equal(price(byId(website,'iphone-incell-11'),'Mayoreo'),'$165 MXN');
  assert.equal(price(byId(website,'iphone-incell-11'),'Caja'),'$155 MXN');
  assert.equal(price(byId(website,'iphone-incell-11'),'⭐ VIP'),'$150 MXN');
  assert.equal(byId(app,'iphone-incell-11').precioPublico,175);
  assert.equal(byId(app,'iphone-incell-11').precioMayoreo,165);
});

test('representative OLED, diagnostic, Samsung, hydrogel and AI prices match workbook', () => {
  assert.equal(price(byId(website,'iphone-oled-13pro'),'Menudeo'),'$835 MXN');
  assert.equal(price(byId(website,'haode-pantalla-oled-diagnostica-modelo-13-pro'),'Menudeo'),'$975 MXN');
  assert.equal(price(byId(website,'samsung-incell-s8'),'Menudeo'),'$365 MXN');
  assert.equal(price(byId(website,'samsung-original-z-fold3'),'Menudeo'),'$4,100 MXN');
  assert.equal(price(byId(website,'mica-hd'),'Menudeo'),'$350 MXN');
  assert.equal(price(byId(website,'mica-hd'),'⭐ VIP'),'$250 MXN');
  assert.equal(price(byId(website,'aimb-g5-ai-sports'),'Menudeo'),'$900 MXN');
  assert.equal(price(byId(website,'gafas-ai-gafas-ai-m02'),'Caja'),'$680 MXN');
});

test('manual Mayoreo/Caja/VIP tiers are displayed but never auto-applied', () => {
  const p=byId(app,'iphone-incell-11');
  assert.deepEqual(p.priceTiers.map(x=>x.code),['WHOLESALE','BOX','VIP']);
  assert.ok(p.priceTiers.every(x=>x.autoApply===false));
  assert.ok(appJs.includes('New 2026-09-21 customer list'));
});

test('source rows without an exact website product are reported, not guessed', () => {
  assert.deepEqual(report.unmatchedSource.map(x=>x.model),['X Bolsa Protectora','Xs Bolsa Protectora','S26 Ultra']);
});
