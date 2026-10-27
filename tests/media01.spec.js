const { test, expect } = require('@playwright/test');
const fs=require('fs'),vm=require('vm');
const {PENDING_MEDIA,PENDING_MEDIA_TEXT}=require('../scripts/product-media-policy.cjs');
const BASE=(process.env.BASE_URL||'http://127.0.0.1:4188').replace(/\/$/,'');
const context={window:{}};vm.runInNewContext(fs.readFileSync('data/products.generated.js','utf8'),context);
for(const width of [390,1440]) for(const [id,sku] of Object.entries(PENDING_MEDIA)) test(`MEDIA-01 ${id} neutral all surfaces with stale ERP at ${width}`,async({page},testInfo)=>{
 const product=context.window.HAODE_PRODUCTS_DATA.find(p=>p.id===id);
 await page.setViewportSize({width,height:900});
 await page.route('**/*',r=>new URL(r.request().url()).origin===new URL(BASE).origin&&r.request().method()==='GET'?r.continue():r.fulfill({status:200,body:''}));
 await page.route('**/public-stock.json**',r=>r.fulfill({json:[]}));
 await page.route('**/api/public/catalog**',r=>r.fulfill({json:{products:[{sku,slug:id,public_name_es:product.name,model:product.model,category:'Samsung INCELL',quality:product.quality,image_url:'https://erp.haode.com.mx/uploads/wrong-model.jpg',public_price_mxn:999,public_price_tiers:[],sales_available:true,stock_status:'available',stock_label:'Disponible ERP',updated_at:'2026-10-26T12:00:00-06:00'}]}}));
 await page.addInitScript(()=>localStorage.setItem('haode-privacy-consent-v1',JSON.stringify({version:1,analytics:false,advertising:false})));
 await page.goto(`${BASE}/producto/${id}/`,{waitUntil:'networkidle'});
 await expect(page.locator('[data-detail-subtitle]')).toContainText('Disponible ERP');
 const main=page.locator('[data-detail-main-image]');
 await expect(main).toHaveAttribute('src',/placeholder.svg$/);
 await expect(page.locator('[data-product-image-status]')).toHaveText(PENDING_MEDIA_TEXT);
 if(width===390){await expect(page.locator('[data-detail-mobile-preview]')).toBeVisible();await expect(page.locator('[data-detail-mobile-preview] strong')).toHaveText(PENDING_MEDIA_TEXT);await expect(page.locator('[data-detail-mobile-preview] img')).toHaveAttribute('src',/placeholder.svg$/);}
 expect(await page.locator('meta[property^="og:image"],meta[name^="twitter:image"]').count()).toBe(0);
 const nodes=await page.locator('script[type="application/ld+json"]').evaluateAll(scripts=>scripts.flatMap(s=>{let d=JSON.parse(s.textContent);return d['@graph']||[d];}));
 expect(nodes.find(n=>n['@type']==='Product').image).toBeUndefined();
 expect(nodes.find(n=>n['@type']==='Product').offers.map(o=>o.price)).toEqual(product.prices.map(p=>p.price.replace(/[^0-9.]/g,'')));
 const quote=new URL(await page.locator('[data-detail-whatsapp]').first().getAttribute('href')).searchParams.get('text');expect(quote).toContain(product.quality);expect(quote).toContain(`/producto/${id}/`);
 await main.click();await expect(page.locator('[data-detail-zoom-modal] img')).toHaveAttribute('src',/placeholder.svg$/);await page.keyboard.press('Escape');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:testInfo.outputPath(`${id}-${width}.png`),fullPage:true});
 await page.goto(`${BASE}/categoria/samsung-incell/`,{waitUntil:'networkidle'});
 const card=page.locator(`.new-product-card[data-product-id="${id}"]`);await expect(card.locator('img')).toHaveAttribute('src',/placeholder.svg$/);await expect(card.locator('.product-image-status')).toHaveText(PENDING_MEDIA_TEXT);
 await page.goto(`${BASE}/app/#producto/${id}`,{waitUntil:'networkidle'});
 await expect(page.locator('[data-product-gallery] img').first()).toHaveAttribute('src',/placeholder.svg$/);
 await expect(page.locator('[data-product-gallery] .product-image-status')).toHaveText(PENDING_MEDIA_TEXT);
 expect(await page.locator('[data-product-gallery] img').first().getAttribute('srcset')).toBeNull();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:testInfo.outputPath(`${id}-app-${width}.png`),fullPage:true});
});
test('MEDIA-01 generic route uses normalized product identity for mobile disclosure',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.route('**/*',r=>new URL(r.request().url()).origin===new URL(BASE).origin&&r.request().method()==='GET'?r.continue():r.fulfill({status:200,body:''}));
 for(const id of Object.keys(PENDING_MEDIA)){
  await page.goto(`${BASE}/producto.html?id=${id.toUpperCase()}`,{waitUntil:'networkidle'});
  await expect(page.locator('[data-detail-mobile-preview] strong')).toHaveText(PENDING_MEDIA_TEXT);
  await expect(page.locator('[data-detail-mobile-preview] img')).toHaveAttribute('src',/placeholder.svg$/);
  await expect(page.locator('[data-detail-main-image]')).toHaveAttribute('src',/placeholder.svg$/);
 }
});
