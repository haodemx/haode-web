const { test, expect } = require('@playwright/test');
const base = (process.env.BASE_URL || 'http://127.0.0.1:4196').replace(/\/$/, '');

for (const width of [1440, 768, 390]) {
  test(`cleanup: default, empty search and diagnostic entry at ${width}px`, async ({ page }) => {
    await page.setViewportSize({width,height:900});
    await page.goto(`${base}/productos/`);
    await expect(page.locator('[data-catalog-card]').first()).toBeVisible();
    await expect(page.locator('[data-site-catalog-empty]')).toHaveCount(0);
    await page.goto(`${base}/productos/?q=NO-SUCH-MODEL-987654321`);
    await expect(page.locator('[data-site-catalog-empty]')).toBeVisible();
    await expect(page.locator('[data-catalog-card]')).toHaveCount(0);
    await page.goto(`${base}/productos/?category=pantallas&sub=iphone`);
    const diagnostic = page.locator('[data-quality-navigation="iphone"] a').filter({hasText:'Diagnóstico OLED'});
    await diagnostic.click();
    await expect(page.locator('[data-catalog-card]').first()).toBeVisible();
    expect(await page.locator('[data-catalog-card]').evaluateAll(xs=>xs.every(x=>x.dataset.category==='oled-diagnostica'))).toBe(true);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
  });
  test(`cleanup: C-layout and AI customer copy at ${width}px`, async ({ page }) => {
    await page.setViewportSize({width,height:900});
    await page.goto(base+'/');
    await expect(page.locator('h1')).toHaveText('Pantallas y tecnologíapara vender y reparar');
    await expect(page.locator('.c-category-card')).toHaveCount(9);
    await page.goto(base+'/productos-ai/');
    await expect(page.locator('h1')).toHaveText('Productos AI');
    expect(await page.locator('body').innerText()).not.toMatch(/clasificación interna|cargar un producto|Base lista para crecer|módulos pendientes|backend|auditoría/i);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
  });
  test(`cleanup: no-JS homepage, catalog, AI and empty media at ${width}px`, async ({ browser }) => {
    const context=await browser.newContext({javaScriptEnabled:false,viewport:{width,height:900}});
    const page=await context.newPage();
    await page.goto(base+'/');
    await expect(page.locator('#c-hero-title')).toBeVisible();
    await expect(page.locator('.c-category-card')).toHaveCount(9);
    await page.goto(base+'/productos/');
    expect(await page.locator('body').innerText()).not.toMatch(/No encontramos|Sin resultados/);
    await expect(page.locator('.catalog-priority-links a[href="/categoria/oled-diagnostica/"]')).toBeVisible();
    await page.goto(base+'/productos-ai/');
    expect(await page.locator('body').innerText()).not.toMatch(/Este contenido ayuda|mantiene una comunicación|no verificadas|futuros modelos/);
    for(const id of ['iphone-incell-11','iphone-oled-13','samsung-incell-s24','samsung-original-z-fold5','haode-pantalla-oled-diagnostica-modelo-14']) {
      await page.goto(`${base}/producto/${id}/`);
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('.detail-gallery-wrap:visible,.detail-video-wrap:visible')).toHaveCount(0);
    }
    await context.close();
  });
}
