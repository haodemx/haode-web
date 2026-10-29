const {test, expect}=require('@playwright/test');
const fs=require('fs'),vm=require('vm');
const BASE=(process.env.BASE_URL||'http://127.0.0.1:4188').replace(/\/$/,'');
const c={window:{}};vm.runInNewContext(fs.readFileSync('data/products.generated.js','utf8'),c);
const ids=['samsung-incell-s23-ultra','samsung-oled-s23-ultra','samsung-original-s23-ultra'];
const products=ids.map(id=>c.window.HAODE_PRODUCTS_DATA.find(p=>p.id===id));
async function isolate(page, rows, stock=[]) {
  await page.route('**/*',r=>new URL(r.request().url()).origin===new URL(BASE).origin&&r.request().method()==='GET'?r.continue():r.abort());
  await page.route('**/api/public/catalog**',r=>r.fulfill({json:{products:rows}}));
  await page.route('**/public-stock.json**',r=>r.fulfill({json:stock}));
  await page.addInitScript(()=>localStorage.setItem('haode-privacy-consent-v1',JSON.stringify({version:1,analytics:false,advertising:false})));
}
async function open(page,surface,id) {
  await page.goto(`${BASE}${surface==='app'?`/app/#producto/${id}`:`/producto/${id}/`}`,{waitUntil:'networkidle'});
  if(surface==='app')await expect.poll(()=>page.evaluate(()=>window.HAODE_DIAGNOSTICS?.externalRefresh?.phase)).toBe('complete');
}
for(const surface of ['app','web'])for(const p of products)test(`unknown ERP SKU uses exact Samsung quality identity ${surface} ${p.id}`,async({page})=>{
  const sku=`QA-EXACT-${p.id}`;
  await isolate(page,[{sku,public_name_es:p.name,category:'Pantallas Samsung',model:p.model,quality:p.quality,
    public_price_mxn:999,public_price_tiers:[],stock_status:'ask_stock',stock_label:'ONLY EXACT QUALITY TEST'}]);
  await open(page,surface,p.id);
  await expect(page.locator('main')).toContainText('ONLY EXACT QUALITY TEST');
  const quote=new URL(await page.locator('[data-detail-whatsapp]').getAttribute('href')).searchParams.get('text');
  expect(quote).toContain(sku);expect(quote).toContain(p.quality);
  const prices=surface==='app'?await page.locator('.price-stack strong').allTextContents():await page.locator('[data-detail-price-body] td').allTextContents();
  expect(prices.map(t=>Number(t.replace(/[^0-9.]/g,'')))).toEqual(p.prices.map(t=>Number(t.price.replace(/[^0-9.]/g,''))));
  for(const other of ids.filter(id=>id!==p.id)){
    await open(page,surface,other);
    await expect(page.locator('main')).not.toContainText('ONLY EXACT QUALITY TEST');
    expect(new URL(await page.locator('[data-detail-whatsapp]').getAttribute('href')).searchParams.get('text')).not.toContain(sku);
  }
});
for(const surface of ['app','web'])for(const mode of ['catalog','stock'])test(`ambiguous Samsung name cannot enrich another quality ${surface} ${mode}`,async({page})=>{
  const row={sku:'QA-AMBIGUOUS-S23',public_name_es:products[0].name,category:'Pantallas Samsung',model:'Samsung S23 Ultra',
    stock_status:'ask_stock',stock_label:'AMBIGUOUS STOCK TEST',public_price_mxn:999,public_price_tiers:[]};
  await isolate(page,mode==='catalog'?[row]:[],mode==='stock'?[row]:[]);
  for(const id of ids){
    await open(page,surface,id);
    await expect(page.locator('main')).not.toContainText('AMBIGUOUS STOCK TEST');
    expect(new URL(await page.locator('[data-detail-whatsapp]').getAttribute('href')).searchParams.get('text')).not.toContain(row.sku);
  }
});
