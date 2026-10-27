import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const ids = ['samsung-incell-note-10-lite','samsung-incell-note-20','samsung-incell-s10-lite'];
const context={window:{}};
vm.runInNewContext(fs.readFileSync('data/products.generated.js','utf8'),context);
const app=JSON.parse(fs.readFileSync('app/products.json','utf8'));
for(const id of ids) test(`MEDIA-01 approved neutral source and static page: ${id}`,()=>{
 const web=context.window.HAODE_PRODUCTS_DATA.find(p=>p.id===id), mobile=app.find(p=>p.id===id);
 assert.deepEqual(Array.from(web.images),['assets/products/placeholder.svg']);
 assert.equal(mobile.imagen,'/assets/products/placeholder.svg');
 const html=fs.readFileSync(`producto/${id}/index.html`,'utf8');
 assert.ok(html.includes('Foto específica de este modelo pendiente de confirmar.'));
 assert.ok(!/samsung-incell\/main\.(jpg|display.webp)/.test(html));
 assert.ok(!/<meta[^>]+(?:og:image|twitter:image)/.test(html));
 for(const [,json] of html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)){
  const d=JSON.parse(json);for(const n of d['@graph']||[d]) if(n['@type']==='Product') {assert.ok(!('image' in n));assert.ok(n.offers);}
 }
});

const {default: policy}=await import('../scripts/product-media-policy.cjs');
test('MEDIA-01 scope is exactly the three approved INCELL identities',()=>{
 assert.deepEqual(Object.keys(policy.PENDING_MEDIA),ids);
 for(const file of ['products.js','app/app.js','categoria/category-page.js']){
  const source=fs.readFileSync(file,'utf8');
  const declared=source.match(/const PENDING_PRODUCT_MEDIA_IDS = new Set\((\[[^;]+\])\);/)[1];
  assert.deepEqual(vm.runInNewContext(declared).join('|'),ids.join('|'));
 }
 const other={id:'samsung-oled-note-20',images:['real-approved.jpg']};
 assert.equal(policy.mediaSafeProduct(other),other);
 assert.equal(policy.mediaSafeHtml('<html>unchanged</html>',other.id),'<html>unchanged</html>');
});
test('MEDIA-01 removes Product image and social claims after a stale generator writes them',()=>{
 for(const id of ids){
  const stale=`<meta property="og:image" content="wrong.jpg"><meta name="twitter:image" content="wrong.jpg"><script type="application/ld+json">${JSON.stringify({'@graph':[{'@type':'Product',name:id,image:['wrong.jpg'],offers:{price:145}},{'@type':'Organization',image:'brand.jpg'}]})}</script><img data-detail-main-image src="wrong.jpg" alt="Wrong photo"><div data-detail-mobile-preview><img src="wrong.jpg" srcset="wrong.jpg 2x" alt="Product"><strong>Foto del producto</strong></div>`;
  const clean=policy.mediaSafeHtml(stale,id);
  assert.ok(!clean.includes('wrong.jpg'));
  assert.ok(clean.includes('brand.jpg'));
  assert.ok(clean.includes(policy.PENDING_MEDIA_TEXT));
  assert.equal(policy.mediaSafeHtml(clean,id),clean);
 }
});
