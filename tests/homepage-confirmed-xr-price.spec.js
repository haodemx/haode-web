// Owner-approved standard XR homepage Caja display: 145 MXN.
// Keep Bolsa separate; replay old public ERP tiers without any real business writes.
const { test, expect } = require('@playwright/test');
const BASE = (process.env.BASE_URL || 'http://127.0.0.1:4188').replace(/\/$/, '');
for(const width of [390,1440]) for(const state of ['empty','oldERP','unavailable']) {
 test(`approved homepage XR display at ${width}px / ${state}`, async ({page})=>{
  await page.setViewportSize({width,height:900});
  await page.route('**/*',route=>{
   const req=route.request();
   return new URL(req.url()).origin===new URL(BASE).origin && req.method()==='GET'
    ?route.continue():route.fulfill({status:200,body:''});
  });
  await page.addInitScript(()=>localStorage.setItem('haode-privacy-consent-v1',JSON.stringify({version:1,analytics:false,advertising:false})));
  await page.route('**/public-stock.json**',route=>route.fulfill({json:[]}));
  let catalogRequests = 0;
  await page.route('**/api/public/catalog**',route=>{
   catalogRequests += 1;
   return route.fulfill(state==='unavailable'
   ?{status:503,json:{error:'isolated catalog outage'}}
   :{json:{products:state==='oldERP'?[{
    sku:'IP-XR-INCELL-FHD',public_name_es:'Pantalla iPhone XR INCELL FHD',
    model:'Pantalla iPhone XR INCELL FHD',quality:'INCELL FHD',
    public_price_mxn:180,public_price_tiers:[{code:'WHOLESALE_5',unit_price_mxn:175},{code:'MIXED_100',unit_price_mxn:170},{code:'MODEL_100',unit_price_mxn:165},{code:'BOX_MODEL',unit_price_mxn:155}],
    description_es:'100 pzs surtido: 170; 100 pzs/modelo: 165; Nota: Tamaño original; Fuente: Lista_Precios',
    price_status:'confirmed',sales_available:true,stock_status:'ask_stock',stock_label:'Consultar inventario'
   }]:[]}});
  });
  await page.goto(`${BASE}/`,{waitUntil:'networkidle'});
  const card=page.locator('a.c-product-card[href="/producto/iphone-incell-xr/"]');
  await expect(card).toContainText('Caja · confirmar condiciones: $145 MXN');
  await expect(page.locator('a.c-product-card[href="/producto/iphone-incell-xr-bolsa-protectora/"]')).toContainText('$135 MXN');
  await card.click();await page.waitForLoadState('networkidle');
  expect(catalogRequests).toBeGreaterThan(0);
  await expect(page.locator('[data-detail-quality]')).toHaveText('INCELL FHD C/IC');
  await expect(page.locator('[data-detail-price-body] tr').filter({hasText:'Caja'})).toContainText('$145 MXN');
  const offers=await page.evaluate(()=>[...document.querySelectorAll('script[type="application/ld+json"]')].flatMap(s=>{const d=JSON.parse(s.textContent);return d['@graph']||[d]}).find(n=>n['@type']==='Product').offers);
  expect(Number(offers.find(o=>o.name==='Caja').price)).toBe(145);
  await page.goto(`${BASE}/`,{waitUntil:'networkidle'});
  await expect(page.locator('a.c-product-card[href="/producto/iphone-incell-xr/"]')).toContainText('$145 MXN');
 });
}
