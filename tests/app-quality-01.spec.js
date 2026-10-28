// APP-QUALITY-01: approved customer workbook facts must survive public ERP enrichment.
const {test, expect} = require('@playwright/test');
const fs = require('fs');
const BASE = (process.env.BASE_URL || 'http://127.0.0.1:4188').replace(/\/$/, '');
const app = JSON.parse(fs.readFileSync('app/products.json', 'utf8'));
const cases = [
  {id:'iphone-incell-xr', sku:'IP-XR-INCELL-FHD', name:'Pantalla para iPhone XR', quality:'INCELL FHD C/IC', prices:[160,150,145,140], oldBox:165},
  {id:'iphone-incell-xr-bolsa-protectora', sku:'IP-INCELL-XR-HD', name:'Pantalla para iPhone XR Bolsa Protectora', quality:'INCELL HD+ C/IC', prices:[155,145,135,130], oldBox:145},
];
function staleRow(p) {
 return {sku:p.sku, public_name_es:`Pantalla iPhone XR ${p.id.includes('bolsa')?'Bolsa Protectora ':''}INCELL FHD`, model:p.id.includes('bolsa')?'iPhone XR Bolsa Protectora':'Pantalla iPhone XR INCELL FHD', category:'iPhone INCELL', quality:'INCELL FHD', description_es:`100 pzs/modelo: ${p.oldBox}; Fuente: Lista_Precios`, public_price_mxn:999, public_price_tiers:[{code:'WHOLESALE_5',unit_price_mxn:998},{code:'BOX_MODEL',unit_price_mxn:997}], sales_available:true,stock_status:'available',stock_label:'Disponible ERP',updated_at:'2026-10-27T12:00:00-06:00'};
}
async function isolate(page,state,p) {
 await page.route('**/*',r=>new URL(r.request().url()).origin===new URL(BASE).origin&&r.request().method()==='GET'?r.continue():r.fulfill({status:200,body:''}));
 await page.addInitScript(()=>localStorage.setItem('haode-privacy-consent-v1',JSON.stringify({version:1,analytics:false,advertising:false})));
 await page.route('**/public-stock.json**',r=>r.fulfill({json:[]}));
 await page.route('**/api/public/catalog**',r=>r.fulfill(state==='unavailable'?{status:503,json:{error:'isolated ERP outage'}}:{json:{products:state==='stale'?[staleRow(p)]:[]}}));
}
async function assertApp(page,p) {
 await expect(page.locator('h1')).toHaveText(p.name);
 // The detail copy is a direct rendering of the approved local description.
 await expect(page.locator('main')).toContainText(app.find(x=>x.id===p.id).descripcion);
 const quote=page.locator('[data-detail-whatsapp]');
 const text=new URL(await quote.getAttribute('href')).searchParams.get('text');
 expect(text).toContain(p.quality);
 if(p.id.includes('bolsa'))expect(text).not.toContain('INCELL FHD');
 expect((await page.locator('.price-stack strong').allTextContents()).map(t=>Number(t.replace(/[^0-9.]/g,'')))).toEqual(p.prices);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
}
for(const width of [390,1440])for(const p of cases)for(const state of ['stale','empty','unavailable']) {
 test(`APP-QUALITY-01 ${p.id} approved copy / ${state} / ${width}`,async({page},testInfo)=>{
  await page.setViewportSize({width,height:900});await isolate(page,state,p);
  await page.goto(`${BASE}/app/#producto/${p.id}`,{waitUntil:'networkidle'});
  if(state==='stale')await expect(page.locator('[data-detail-whatsapp]')).toHaveAttribute('href',new RegExp(encodeURIComponent(`SKU: ${p.sku}`)));
  await assertApp(page,p);
  await expect.poll(()=>page.evaluate(()=>window.HAODE_DIAGNOSTICS?.externalRefresh?.phase)).toBe('complete');
  const timing=await page.evaluate(()=>window.HAODE_DIAGNOSTICS.externalRequests.catalog);
  expect(timing.status).toBe(state==='stale'?'success':state==='empty'?'empty':'http_error');
  expect(timing.elapsedMs).toBeGreaterThanOrEqual(timing.headersMs);
  await page.screenshot({path:testInfo.outputPath('app-approved-xr.png'),fullPage:false});
  await page.goto(`${BASE}/producto/${p.id}/`,{waitUntil:'networkidle'});
  if(state==='stale')await expect(page.locator('[data-detail-subtitle]')).toContainText('Disponible ERP');
  await expect(page.locator('h1').first()).toHaveText(p.name);
  await expect(page.locator('[data-detail-quality]')).toHaveText(p.quality);
  await expect(page.locator('[data-detail-description]')).toContainText(p.quality);
  const nodes=await page.locator('script[type="application/ld+json"]').evaluateAll(xs=>xs.flatMap(x=>{const d=JSON.parse(x.textContent);return d['@graph']||[d];}));
  const schema=nodes.find(x=>x['@type']==='Product');expect(schema.name).toBe(`${p.name} INCELL`);
  if(p.id.includes('bolsa')) {
   const business=nodes.find(x=>x['@type']==='LocalBusiness');
   expect(business).toBeTruthy();
   expect(business).not.toHaveProperty('description');
   expect(business.telephone).toBe('+52 33 2668 4296');
   expect(business).not.toHaveProperty('priceRange');
  }
  expect(schema.description).toBe((await page.locator('[data-detail-description]').textContent()).trim());
  expect(schema.description).toContain(p.quality);
  expect(schema.offers.map(o=>Number(o.price))).toEqual(p.prices);
  expect(nodes.find(x=>x['@type']==='BreadcrumbList').itemListElement.at(-1).item).toBe(`https://haode.com.mx/producto/${p.id}/`);
  const webQuote=new URL(await page.locator('[data-detail-whatsapp]').first().getAttribute('href')).searchParams.get('text');expect(webQuote).toContain(p.quality);expect(webQuote).toContain(`/producto/${p.id}/`);
 });
}
for(const p of cases)test(`APP-QUALITY-01 ${p.id} late ERP completion preserves visible facts`,async({page})=>{
 await isolate(page,'empty',p);
 let deliver;const held=new Promise(resolve=>deliver=resolve);let requested;const seen=new Promise(resolve=>requested=resolve);
 await page.route('**/api/public/catalog**',async r=>{requested();await held;await r.fulfill({json:{products:[staleRow(p)]}});});
 await page.goto(`${BASE}/app/#producto/${p.id}`,{waitUntil:'domcontentloaded'});await seen;
 await expect(page.locator('h1')).toHaveText(p.name);deliver();await page.waitForLoadState('networkidle');await assertApp(page,p);
 expect(new URL(await page.locator('[data-detail-whatsapp]').getAttribute('href')).searchParams.get('text')).toContain(`SKU: ${p.sku}`);
});
