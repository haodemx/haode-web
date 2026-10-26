import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {ROOT,readCatalog,groupsFor,quoteUrl,DIRECTORIES,renderDirectory} from '../scripts/acquisition-directory.mjs';
const products=readCatalog();
test('model selection contains only exact published qualities and existing canonical detail routes',()=>{
 const sitemap=fs.readFileSync(`${ROOT}/sitemap.xml`,'utf8');
 for(const [file,kind,title] of DIRECTORIES){
  const groups=groupsFor(products,kind), route='/'+file.replace(/index.html$/,'');
  assert.ok(groups.length>5);
  const html=fs.readFileSync(`${ROOT}/${file}`,'utf8');
  assert.equal(html.match(/<section[^>]*data-acquisition-directory[\s\S]*?<\/section>/)[0],renderDirectory(products,kind,route,title));
  for(const g of groups) for(const p of g.products){
   assert.ok(fs.existsSync(`${ROOT}/producto/${p.id}/index.html`));
   assert.ok(sitemap.includes(`<loc>https://haode.com.mx/producto/${p.id}/</loc>`),p.id);
   const text=new URL(quoteUrl(p,route)).searchParams.get('text');
   for(const fact of [p.name,p.id,p.quality,`https://haode.com.mx/producto/${p.id}/`,`https://haode.com.mx${route}`]) assert.ok(text.includes(fact),p.id);
   assert.ok(!text.includes('undefined'));
  }
 }
});
test('Samsung S24 Ultra has exactly its three source references; S24 does not inherit them',()=>{
 const groups=groupsFor(products,'samsung');
 assert.equal(groups.find(g=>g.model==='Samsung S24 Ultra').products.length,3);
 assert.deepEqual(Array.from(groups.find(g=>g.model==='Samsung S24').products,p=>p.quality),['INCELL FHD C/M']);
 assert.ok(!groups.some(g=>/Flip|Fold/.test(g.model)));
 assert.equal(groupsFor(products,'fold').flatMap(g=>g.products).length,13);
});
test('iPhone base, Pro, Pro Max, combined references and packaging remain distinct',()=>{
 const groups=groupsFor(products,'iphone');
 assert.equal(groups.find(g=>g.model==='iPhone 13').products.length,3);
 assert.ok(groups.find(g=>g.model==='iPhone 13 Pro'));
 assert.ok(groups.find(g=>g.model==='iPhone 13 Pro Max'));
 assert.ok(groups.find(g=>g.model==='iPhone 12 / 12 Pro'));
 assert.ok(groups.find(g=>g.model==='iPhone 11 Bolsa Protectora'));
 assert.ok(groups.find(g=>g.model==='iPhone 11'));
});
test('directory is additive, contains no price or invented metrics, and excludes unrelated businesses',()=>{
 for(const [,kind,title] of DIRECTORIES){
  const html=renderDirectory(products,kind,'/test/',title);
  assert.doesNotMatch(html,/\$|Hz|nits|Service Pack|data-acquisition-reference="(?:mica|ai-)/);
  assert.match(html,/no ofrece servicio de reparación/);
  assert.match(html,/data-product-whatsapp=/);
 }
});
test('homepage presents all three acquisition lines and retains AI business without blanket compatibility',()=>{
 const html=fs.readFileSync(`${ROOT}/index.html`,'utf8');
 assert.match(html,/acquisition-business-grid/);
 for(const route of ['pantallas-iphone-mayoreo-mexico','pantallas-samsung-mayoreo-mexico','micas-hidrogel-mayoreo-mexico','micas-hidrogel-marca-propia','productos-ai']) assert.ok(html.includes(`/${route}/`));
 assert.doesNotMatch(html,/Protección flexible para todos los modelos/);
});
