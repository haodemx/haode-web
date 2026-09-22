const {test,expect}=require('@playwright/test');
const base=(process.env.BASE_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
for(const width of [1440,768,390]) {
  test(`approved customer and secondary owner email at ${width}px`,async({page})=>{
    await page.setViewportSize({width,height:900});
    for(const route of ['/','/contacto/','/privacidad/','/terminos/','/eliminacion-de-datos/']) {
      const response=await page.goto(base+route,{waitUntil:'networkidle'});
      expect(response.status()).toBe(200);
      const collapsedContact=page.locator('details:not([open])').filter({has:page.locator('a[href^="mailto:haodemx@gmail.com"]')});
      if(await collapsedContact.count()) await collapsedContact.locator('summary').click();
      await expect(page.locator('a[href^="mailto:haodemx@gmail.com"]').first()).toBeVisible();
      await expect(page.locator('a[href*="ventas@haode.com.mx"]')).toHaveCount(0);
      await expect(page.locator('a[href="mailto:cristi3an@gmail.com"]')).toHaveCount(route==='/contacto/'?1:0);
      if(route==='/contacto/') {
        await expect(page.getByText('Ventas / Cotizaciones / Mayoreo / Contacto general',{exact:true})).toBeVisible();
        await expect(page.locator('a[href="mailto:cristi3an@gmail.com"]')).toBeVisible();
      }
      expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
    }
  });
}
