const { test, expect } = require('@playwright/test');
const base = (process.env.BASE_URL || 'http://127.0.0.1:4175').replace(/\/$/, '');
for (const width of [390, 1440]) {
  for (const [route, heading, title] of [
    ['/productos-ai/', 'Gafas inteligentes y productos AI', 'Gafas y productos AI en México | HAODE'],
    ['/tienda-oficial-hl-cdmx/', 'Cómo llegar a HAODE en CDMX', 'Cómo llegar a HAODE en CDMX | Piso 2, Local 225']
  ]) {
    test(`reviewed candidate survives hydration at ${width}: ${route}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 960 });
      await page.route('**/*', request => new URL(request.request().url()).origin === base
        ? request.continue() : request.abort());
      await page.goto(base + route, { waitUntil: 'networkidle' });
      await expect(page).toHaveTitle(title);
      await expect(page.locator('h1')).toHaveText(heading);
      await expect(page.locator('a[href*="wa.me"]').first()).toHaveAttribute('href', /^https:\/\/wa\.me\/523326684296/);
      if (route.includes('productos-ai')) await expect(page.locator('main')).toContainText('modelo, cantidad y ciudad');
      else await expect(page.locator('main')).toContainText('Piso 2, Local 225');
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
      expect(await page.evaluate(() => [...document.images].filter(image => image.complete && !image.naturalWidth).length)).toBe(0);
    });
  }
}
for (const route of ['/productos-ai/', '/tienda-oficial-hl-cdmx/']) {
  test(`static fallback stays readable without JavaScript: ${route}`, async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    try {
      await context.route('**/*', request => new URL(request.request().url()).origin === base
        ? request.continue() : request.abort());
      const page = await context.newPage();
      await page.goto(base + route);
      await page.locator('.reference-menu-button').click();
      const styles = await page.evaluate(() => {
        const heading = getComputedStyle(document.querySelector('h1'));
        return {
          tracking: parseFloat(heading.letterSpacing) / parseFloat(heading.fontSize),
          buttons: ['.reference-menu-button', '.reference-nav-actions a[href*="wa.me"]'].map(selector => {
            const element = document.querySelector(selector), style = getComputedStyle(element);
            return { color: style.color, background: style.backgroundColor, visible: element.getBoundingClientRect().height > 0 };
          })
        };
      });
      expect(styles.tracking).toBeGreaterThanOrEqual(-0.03);
      expect(styles.buttons).toEqual([
        { color: 'rgb(255, 255, 255)', background: 'rgb(184, 59, 6)', visible: true },
        { color: 'rgb(255, 255, 255)', background: 'rgb(8, 124, 59)', visible: true }
      ]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    } finally { await context.close(); }
  });
}
