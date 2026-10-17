const {test,expect}=require('@playwright/test');
const BASE=(process.env.BASE_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
async function ready(page,mode){
 await page.route('https://erp.haode.com.mx/**',r=>r.fulfill({status:200,contentType:'application/json',body:'[]'}));
 await page.goto(`${BASE}/app/#lista`,{waitUntil:'domcontentloaded'});
 await page.locator('[data-haode-consent-necessary]').click();
 await page.locator('.product-card').filter({has:page.locator('.price-lines')}).first().getByRole('button',{name:'Agregar',exact:true}).click();
 await page.locator('[data-customer-name]').fill('QA isolated quotation');
 await page.locator('[data-customer-phone]').fill('5512345678');
 await page.locator('[data-customer-city]').fill('QA city');
 await expect(page.locator('[data-whatsapp-link]')).not.toHaveClass(/disabled/);
 await page.evaluate(mode=>{
  const originalFetch=window.fetch.bind(window);window.quoteAudit={requests:[],opens:0};
  window.open=()=>{window.quoteAudit.opens++;if(mode==='popup-error'&&window.quoteAudit.opens===1)throw new Error('Popup unavailable');return null;};
  window.fetch=(url,options={})=>{
   if(String(url)==='https://erp.haode.com.mx/api/public/web-orders'&&options.method==='POST'){
    const requests=window.quoteAudit.requests;
    requests.push({payload:JSON.parse(options.body),key:options.headers['Idempotency-Key']});
    if(requests.length===1){
     if(mode==='stalled-request')return new Promise(()=>{});
     if(mode==='stalled-body')return Promise.resolve({ok:true,json:()=>new Promise(()=>{})});
     if(mode==='network-error')return Promise.reject(new Error('Network unavailable'));
     if(mode==='http-error')return Promise.resolve(new Response('{}',{status:503}));
    }
    return Promise.resolve(new Response(JSON.stringify({ok:true,replayed:requests.length>1,order_number:'WEB-QA-ISOLATED'}),{status:200,headers:{'Content-Type':'application/json'}}));
   }
   return originalFetch(url,options);
  };
 },mode);
}
for(const mode of ['stalled-request','stalled-body'])test(`quotation retry recovers from ${mode} without changing idempotency`,async({page})=>{
 await ready(page,mode);await page.clock.install();
 await page.locator('[data-whatsapp-link]').click();
 await page.locator('[data-whatsapp-link]').click();
 expect(await page.evaluate(()=>window.quoteAudit.opens)).toBe(1);
 await page.clock.fastForward(15001);
 await page.locator('[data-whatsapp-link]').click();
 const audit=await page.evaluate(()=>window.quoteAudit);
 expect(audit.opens).toBe(2);expect(audit.requests).toHaveLength(2);
 expect(audit.requests[1].key).toBe(audit.requests[0].key);
 expect(audit.requests[1].payload).toEqual(audit.requests[0].payload);
});
for(const mode of ['success','network-error','http-error','popup-error'])test(`quotation remains usable after ${mode}`,async({page})=>{
 await ready(page,mode);
 await page.locator('[data-whatsapp-link]').click();
 await page.locator('[data-whatsapp-link]').click();
 const audit=await page.evaluate(()=>window.quoteAudit);
 expect(audit.opens).toBe(2);expect(audit.requests).toHaveLength(mode==='popup-error'?1:2);
 if(audit.requests.length===2)expect(audit.requests[1].key).toBe(audit.requests[0].key);
});
