const { test, expect } = require('@playwright/test');

const baseURL = process.env.BASE_URL || 'http://127.0.0.1:4173';

const mobileRoutes = [
  '/productos/',
  '/producto/iphone-incell-14/',
  '/producto/lk-030-mini-camara-retro-digital/',
  '/contacto/',
  '/garantia/',
  '/distribuidores/',
  '/pantallas-premium-iphone-samsung-fabrica/',
  '/productos-ai/',
  '/app/',
];

for (const width of [320, 390]) {
  test.describe(`factory-store UI at ${width}px`, () => {
    test.use({ viewport: { width, height: 844 } });

    for (const route of mobileRoutes) {
      test(`${route} has no document overflow`, async ({ page }) => {
        await page.goto(`${baseURL}${route}`, { waitUntil: 'domcontentloaded' });
        await expect(page.locator('body')).toBeVisible();

        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow).toBeLessThanOrEqual(1);
      });
    }
  });
}

test.describe('factory-store shared page contracts', () => {
  test('catalog mobile menu expands without a clipped navigation row', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${baseURL}/productos/`, { waitUntil: 'domcontentloaded' });

    const menu = page.locator('.reference-menu-button');
    const nav = page.locator('.reference-nav');
    await expect(menu).toBeVisible();
    await expect(nav).toBeHidden();
    await menu.click();
    await expect(nav).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Contacto' })).toBeVisible();
  });

  test('product detail uses the approved wordmark and balanced desktop columns', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${baseURL}/producto/iphone-incell-14/`, { waitUntil: 'domcontentloaded' });

    const wordmark = page.locator('.catalog-topbar .brand-logo');
    await expect(wordmark).toHaveAttribute('src', '/assets/images/factory-store-wordmark.png');

    const layout = await page.evaluate(() => {
      const visual = document.querySelector('.detail-visual').getBoundingClientRect();
      const info = document.querySelector('.detail-info').getBoundingClientRect();
      const title = document.querySelector('.detail-top').getBoundingClientRect();
      return {
        visualWidth: visual.width,
        infoWidth: info.width,
        sameRow: Math.abs(visual.top - info.top),
        titleAboveColumns: title.bottom <= visual.top,
      };
    });

    expect(layout.visualWidth).toBeGreaterThan(480);
    expect(layout.infoWidth).toBeGreaterThan(380);
    expect(layout.sameRow).toBeLessThanOrEqual(2);
    expect(layout.titleAboveColumns).toBe(true);
  });

  test('special-product hero exposes confirmed product media in the first screen', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${baseURL}/producto/lk-030-mini-camara-retro-digital/`, {
      waitUntil: 'domcontentloaded',
    });

    const hero = page.locator('.new-page-hero-inner');
    await expect(hero.getByRole('heading', { level: 1 })).toBeVisible();

    const media = await hero.evaluate((element) => {
      const styles = getComputedStyle(element, '::after');
      return {
        backgroundImage: styles.backgroundImage,
        height: parseFloat(styles.height),
      };
    });

    expect(media.backgroundImage).toContain('lk-030-mini-camara-retro-digital');
    expect(media.height).toBeGreaterThanOrEqual(220);
  });

  test('trust-page mobile navigation fits inside the viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    for (const route of ['/garantia/', '/distribuidores/']) {
      await page.goto(`${baseURL}${route}`, { waitUntil: 'domcontentloaded' });
      const bounds = await page.locator('.topnav a').evaluateAll((links) => (
        links.map((link) => {
          const rect = link.getBoundingClientRect();
          return { left: rect.left, right: rect.right };
        })
      ));
      expect(Math.min(...bounds.map(({ left }) => left))).toBeGreaterThanOrEqual(0);
      expect(Math.max(...bounds.map(({ right }) => right))).toBeLessThanOrEqual(390);
    }
  });
});
