const {test,expect}=require('@playwright/test');
const BASE=(process.env.BASE_URL||'http://127.0.0.1:4187').replace(/\/$/,'');
async function isolate(page,consent=true){
 await page.route('**/*',route=>new URL(route.request().url()).origin===new URL(BASE).origin?route.continue():route.fulfill({status:200,body:''}));
 await page.addInitScript(value=>{localStorage.setItem('haode-privacy-consent-v1',JSON.stringify({version:1,analytics:value,advertising:value}));window.open=()=>null;},consent);
}
for(const width of [390,1440]){
 test(`Samsung exact qualities, empty result and reset at ${width}`,async({page})=>{
  await page.setViewportSize({width,height:900});await isolate(page);
  await page.goto(BASE+'/pantallas-samsung-mayoreo-mexico/');
  const root=page.locator('[data-acquisition-directory]');
  await root.locator('[data-acquisition-search]').fill('S24 Ultra');
  await expect(root.locator('details:visible')).toHaveCount(1);
  await expect(root.locator('[data-acquisition-count]')).toHaveText('1 modelo encontrado');
  await expect(root.locator('li:visible')).toHaveCount(3);
  const link=root.locator('[data-product-whatsapp="samsung-oled-s24-ultra"]');
  const href=await link.getAttribute('href'),text=new URL(href).searchParams.get('text');
  expect(text).toContain('1:1 AMOLED PREMIUM C/M');expect(text).toContain('/producto/samsung-oled-s24-ultra/');
  expect(text).toContain('https://haode.com.mx/pantallas-samsung-mayoreo-mexico/');
  await page.evaluate(()=>document.addEventListener('click',e=>{if(e.target.closest('a[href*="wa.me"]'))e.preventDefault();}));
  await link.click();
  const events=await page.evaluate(()=>Array.from(window.dataLayer||[]).map(e=>Array.from(e)).filter(e=>e[0]==='event'));
  expect(events.filter(e=>e[1]==='contact')).toHaveLength(1);
  expect(events.some(e=>/Lead|Purchase|generate_lead|purchase/.test(e[1]))).toBe(false);
  expect(JSON.stringify(events)).not.toContain('1:1 AMOLED'); // product attributes stay in the quote; no chat payload enters analytics.
  await root.locator('[data-acquisition-search]').fill('not-existing-999');
  await expect(root.locator('[data-acquisition-empty]')).toBeVisible();
  await expect(root.locator('[data-acquisition-count]')).toHaveText('0 modelos encontrados');
  await root.locator('[data-acquisition-reset]').click();
  await expect(root.locator('details:visible')).toHaveCount(34);
  await expect(root.locator('[data-acquisition-count]')).toHaveText('34 modelos encontrados');
  await root.locator('[data-acquisition-series]').selectOption('Note');
  await expect(root.locator('details:visible')).toHaveCount(6);
  await expect(root.locator('[data-acquisition-count]')).toHaveText('6 modelos encontrados');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 });
}
test('iPhone actual model combines diagnostic and preserves packaging',async({page})=>{
 await isolate(page);await page.goto(BASE+'/pantallas-iphone-mayoreo-mexico/');
 await page.locator('[data-acquisition-search]').fill('iPhone 13');
 const exact=page.locator('details').filter({has:page.locator('summary',{hasText:/^iPhone 13 3 referencias$/})});
 await expect(exact.locator('li')).toHaveCount(3);
 await page.locator('[data-acquisition-search]').fill('Bolsa Protectora');
 await expect(page.locator('[data-acquisition-model]:visible')).toHaveCount(2);
});
test('foldable references exclude flat screens and preserve exact generation',async({page})=>{
 await isolate(page);await page.goto(BASE+'/pantallas-samsung-zflip-zfold-original-mexico/');
 await page.locator('[data-acquisition-search]').fill('Z Flip5');
 await expect(page.locator('[data-acquisition-model]:visible')).toHaveCount(1);
 await expect(page.locator('[data-acquisition-reference]:visible')).toHaveCount(2);
});
test('no JavaScript retains canonical product links and usable quality quote',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
 const page=await context.newPage();await page.goto(BASE+'/pantallas-samsung-mayoreo-mexico/');
 await expect(page.locator('[data-acquisition-filters]')).toBeHidden();
 await page.locator('[data-acquisition-model]').filter({has:page.locator('summary',{hasText:'Samsung S24 Ultra'})}).locator('summary').click();
 await expect(page.locator('[data-product-whatsapp="samsung-original-s24-ultra"]')).toBeVisible();
 await context.close();
});
test('declined consent emits no contact and detail quote has exact canonical page',async({page})=>{
 await isolate(page,false);await page.goto(BASE+'/producto/samsung-oled-s24-ultra/');
 await expect(page.locator('[data-detail-whatsapp]').first()).toHaveAttribute('href',/wa.me/);
 const text=new URL(await page.locator('[data-detail-whatsapp]').first().getAttribute('href')).searchParams.get('text');
 expect(text).toContain('https://haode.com.mx/producto/samsung-oled-s24-ultra/');
 expect(text).toContain('1:1 AMOLED PREMIUM C/M');
 expect(await page.evaluate(()=>Array.from(window.dataLayer||[]).filter(e=>e[0]==='event').length)).toBe(0);
});
for(const width of [390,1440]) test(`homepage three acquisition lines remain accessible at ${width}`,async({page},testInfo)=>{
 await page.setViewportSize({width,height:900});await isolate(page);await page.goto(BASE+'/');
 const section=page.locator('.acquisition-business-lines');
 await expect(section.locator('article')).toHaveCount(3);
 for(const path of ['pantallas-iphone-mayoreo-mexico','pantallas-samsung-mayoreo-mexico','micas-hidrogel-mayoreo-mexico']) await expect(section.locator(`a[href="/${path}/"]`)).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect(await page.locator('img').evaluateAll(images=>images.filter(i=>i.complete&&i.naturalWidth===0).length)).toBe(0);
 await page.screenshot({path:testInfo.outputPath(`home-${width}.png`),fullPage:true});
});
