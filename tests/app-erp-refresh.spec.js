const {test,expect}=require('@playwright/test');
const fs=require('fs');
const BASE=(process.env.BASE_URL||'http://127.0.0.1:4188').replace(/\/$/,'');
const approved=JSON.parse(fs.readFileSync('app/products.json','utf8'));
const variants=[
 {id:'iphone-incell-xr',sku:'IP-XR-INCELL-FHD',quality:'INCELL FHD C/IC',box:160},
 {id:'iphone-incell-xr-bolsa-protectora',sku:'IP-INCELL-XR-HD',quality:'INCELL HD+ C/IC',box:150}
];
for(const width of [390,1440])for(const p of variants)for(const mode of ['slow-body','recover-body','success']) {
 test(`App ERP timing ${p.id} ${mode} ${width}`,async({page},info)=>{
  await page.setViewportSize({width,height:900});
  await page.route('**/*',r=>new URL(r.request().url()).origin===new URL(BASE).origin&&r.request().method()==='GET'?r.continue():r.fulfill({status:200,body:''}));
  await page.route('**/public-stock.json**',r=>r.fulfill({json:[]}));
  await page.route('**/api/public/catalog**',r=>r.fulfill({json:{products:mode!=='slow-body'?[{sku:p.sku,public_name_es:'Pantalla iPhone XR INCELL FHD',model:'XR INCELL FHD',category:'iPhone INCELL',quality:'INCELL FHD',description_es:'Caja 999; old unapproved ERP copy',public_price_mxn:999,public_price_tiers:[]}]:[]}}));
  await page.addInitScript(({slow,recover})=>{
   localStorage.setItem('haode-privacy-consent-v1',JSON.stringify({version:1,analytics:false,advertising:false}));
   if(!slow||!location.pathname.includes('/app/'))return;
   const original=window.fetch.bind(window);
   let attempts=0;
   window.fetch=(input,options={})=>{
    if(!String(input).includes('/api/public/catalog'))return original(input,options);
    attempts+=1;
    if(recover&&attempts>1)return original(input,options);
    return Promise.resolve({ok:true,status:200,json:()=>new Promise((resolve,reject)=>{
     const timer=setTimeout(()=>resolve({products:[]}),4500);
     options.signal.addEventListener('abort',()=>{clearTimeout(timer);reject(new DOMException('Body aborted','AbortError'));},{once:true});
    })});
   };
  },{slow:mode!=='success',recover:mode==='recover-body'});
  await page.goto(`${BASE}/app/?utm_source=erp-timing-qa#producto/${p.id}`,{waitUntil:'domcontentloaded'});
  // Worst case is two 3s requests + one 1s recovery delay + first-paint scheduling.
  await expect.poll(()=>page.evaluate(()=>window.HAODE_DIAGNOSTICS?.externalRefresh?.phase),{timeout:12000}).toBe('complete');
  const diagnostics=await page.evaluate(()=>window.HAODE_DIAGNOSTICS);
  const timing=diagnostics.externalRequests.catalog;
  expect(timing.timeoutMs).toBe(3000);
  expect(timing.status).toBe(mode==='slow-body'?'timeout':'success');
  expect(timing.phase).toBe(mode==='slow-body'?'body':'complete');
  expect(timing.httpStatus).toBe(200);
  expect(timing.elapsedMs).toBeGreaterThanOrEqual(timing.headersMs);
  expect(diagnostics.externalRefresh.source).toBe(mode==='slow-body'?'local':'catalog');
  const attempts=diagnostics.catalogAttempts;
  expect(attempts.map(a=>a.status)).toEqual(mode==='success'?['success']:mode==='recover-body'?['timeout','success']:['timeout','timeout']);
  expect(attempts.length).toBeLessThanOrEqual(2);
  if(attempts.length===2) {
   expect(attempts[1].startedAtMs-attempts[0].startedAtMs-attempts[0].elapsedMs).toBeGreaterThanOrEqual(900);
   expect(attempts.every(a=>a.timeoutMs===3000)).toBe(true);
  }
  expect(diagnostics.externalRefresh.startedAtMs).toBeGreaterThanOrEqual(diagnostics.externalRefresh.scheduledAtMs);
  if(mode!=='slow-body')expect(diagnostics.externalRefresh.renderedAtMs).toBeGreaterThanOrEqual(diagnostics.externalRefresh.completedAtMs);
  expect(JSON.stringify(timing)).not.toMatch(/http:|https:|SKU|private|description/);
  const source=approved.find(x=>x.id===p.id);
  await expect(page.locator('main')).toContainText(source.descripcion);
  const prices=(await page.locator('.price-stack strong').allTextContents()).map(s=>Number(s.replace(/[^0-9.]/g,'')));
  expect(prices).toEqual([source.precioPublico,...source.priceTiers.map(t=>t.price)]);
  expect(prices[2]).toBe(p.box);
  const href=await page.locator('[data-detail-whatsapp]').getAttribute('href');
  const quote=new URL(href).searchParams.get('text');
  expect(new URL(href).pathname).toBe('/523326684296');
  expect(quote).toContain(`Calidad: ${p.quality}`);
  expect(quote).toContain('Origen: erp_timing_qa');
  if(mode!=='slow-body')expect(quote).toContain(`SKU: ${p.sku}`);
  if(p.id.includes('bolsa'))expect(quote).not.toContain('INCELL FHD');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  fs.writeFileSync(info.outputPath('erp-timing.json'),JSON.stringify({mode,width,id:p.id,diagnostics,quote,prices},null,2));
  await page.screenshot({path:info.outputPath('app-xr.png'),fullPage:false});
  await page.goto(`${BASE}/producto/${p.id}/`,{waitUntil:'networkidle'});
  const nodes=await page.locator('script[type="application/ld+json"]').evaluateAll(xs=>xs.flatMap(s=>{const d=JSON.parse(s.textContent);return d['@graph']||[d]}));
  const product=nodes.find(n=>n['@type']==='Product');
  expect(product.description).toBe((await page.locator('[data-detail-description]').textContent()).trim());
  expect(product.description).toContain(p.quality);
  expect(product.offers.map(o=>Number(o.price))).toEqual(prices);
  if(p.id.includes('bolsa'))expect(nodes.find(n=>n['@type']==='LocalBusiness')).not.toHaveProperty('description');
 });
}
