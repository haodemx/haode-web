const { test, expect } = require('@playwright/test');

const baseURL = process.env.BASE_URL || 'http://127.0.0.1:4175';

const representativeRoutes = [
  '/',
  '/productos/',
  '/categoria/',
  '/categoria/iphone-incell/',
  '/categoria/samsung-oled/',
  '/categoria/fundas/',
  '/categoria/micas/',
  '/categoria/camaras-inteligentes/',
  '/producto/iphone-incell-14/',
  '/producto/iphone-incell-11/',
  '/productos/samsung-z-flip3/',
  '/producto/lk-030-mini-camara-retro-digital/',
  '/producto/x200t-cortadora-inteligente-de-micas/',
  '/ai-mouse.html',
  '/productos-ai/',
  '/contacto/',
  '/garantia/',
  '/distribuidores/',
  '/pantallas-premium-iphone-samsung-fabrica/',
  '/pantallas-iphone-11-xr-mayoreo/',
  '/pantallas-samsung-mayoreo-mexico/',
  '/refacciones-celulares-mayoreo-mexico/',
  '/guia-ia-haode-mexico/',
  '/offline.html',
  '/404.html',
];

for (const viewport of [
  { width: 360, height: 844 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
]) {
  test(`all shared layouts render cleanly at ${viewport.width}px`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize(viewport);

    for (const route of representativeRoutes) {
      const response = await page.goto(`${baseURL}${route}`, { waitUntil: 'domcontentloaded' });
      expect(response?.status(), `${route} should load`).toBeLessThan(400);
      await expect(page.locator('body')).toBeVisible();

      const audit = await page.evaluate(() => {
        const visibleImages = Array.from(document.images).filter((image) => {
          const rect = image.getBoundingClientRect();
          return rect.bottom > 0
            && rect.top < window.innerHeight
            && rect.right > 0
            && rect.left < window.innerWidth;
        });
        return {
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          badImages: visibleImages
            .filter((image) => image.complete && image.naturalWidth === 0)
            .map((image) => image.currentSrc || image.src),
        };
      });

      expect(audit.overflow, `${route} should not overflow horizontally`).toBeLessThanOrEqual(1);
      expect(audit.badImages, `${route} should not show broken first-screen images`).toEqual([]);
    }
  });
}
