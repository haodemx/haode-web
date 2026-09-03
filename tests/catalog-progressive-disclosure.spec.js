const { test, expect } = require('@playwright/test');

const BASE_URL = (process.env.BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');

test.describe('catalog progressive disclosure', () => {
  test('background ERP enrichment does not rebuild the rendered catalog', async ({ page }) => {
    await page.route('**/api/public/catalog*', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 350));
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          products: [{
            sku: 'AI-GAFAS-G3',
            public_name_es: 'Gafas AI G3',
            category: 'Productos AI',
            quality: 'Gafas AI',
            model: '',
            public_price_mxn: 1700,
            public_price_tiers: [],
            price_status: 'CONFIRMED',
            sales_available: true,
            stock_status: 'available',
            stock_label: 'Disponible',
          }],
        }),
      });
    });
    await page.route('**/public-stock.json*', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 350));
      await route.fulfill({ contentType: 'application/json', body: '[]' });
    });

    await page.goto(`${BASE_URL}/productos/`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      window.__catalogFirstSection = document.querySelector('[data-catalog-group]');
      window.__catalogDeferredImage = document.querySelector('.shop-card img[data-performance-src]');
      window.__catalogDeferredImageSrc = window.__catalogDeferredImage?.getAttribute('src');
    });
    await page.waitForTimeout(900);

    const keptInitialSection = await page.evaluate(() => (
      window.__catalogFirstSection === document.querySelector('[data-catalog-group]')
    ));
    expect(keptInitialSection).toBe(true);
    const keptDeferredMedia = await page.evaluate(() => (
      window.__catalogDeferredImage
      && window.__catalogDeferredImage === document.querySelector('.shop-card img[data-performance-src]')
      && window.__catalogDeferredImage.getAttribute('src') === window.__catalogDeferredImageSrc
    ));
    expect(keptDeferredMedia).toBe(true);
    await expect(page.locator('.shop-card', { hasText: 'Gafas AI G3' })).toHaveCount(1);
  });

  test('plain catalog visits do not rewrite every WhatsApp link during startup', async ({ page }) => {
    await page.route('**/api/public/catalog*', (route) => route.fulfill({
      contentType: 'application/json',
      body: '[]',
    }));
    await page.route('**/public-stock.json*', (route) => route.fulfill({
      contentType: 'application/json',
      body: '[]',
    }));

    await page.goto(`${BASE_URL}/productos/`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.HaodeCampaign);
    await page.waitForTimeout(200);
    const heroWhatsappHref = await page.locator('.catalog-actions a[href*="wa.me"]').getAttribute('href');

    expect(decodeURIComponent(heroWhatsappHref || '')).not.toContain('Origen:');
  });

  test('mobile catalog limits long categories and reveals the remaining models on demand', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/productos/`, { waitUntil: 'domcontentloaded' });

    const longCategory = page.locator('.catalog-category-block').filter({
      has: page.locator('[data-catalog-reveal]'),
    }).first();
    await expect(longCategory).toBeVisible();

    const cards = longCategory.locator('[data-catalog-card]');
    const initialVisibleCards = longCategory.locator('[data-catalog-card]:visible');
    expect(await cards.count()).toBeGreaterThan(4);
    await expect(initialVisibleCards).toHaveCount(4);

    const reveal = longCategory.locator('[data-catalog-reveal]');
    await expect(reveal).toBeVisible();
    await expect(reveal).toHaveText(/Mostrar .* modelos/i);
    await expect(reveal).toHaveCSS('min-height', '44px');

    await reveal.click();
    await expect(longCategory.locator('[data-catalog-card]:visible')).toHaveCount(await cards.count());
    await expect(reveal).toBeHidden();
  });

  test('catalog search exposes every matching model even when its category is collapsed', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/productos/?q=LK-007`, { waitUntil: 'domcontentloaded' });

    const matchingCard = page.locator('[data-catalog-card]:visible').filter({ hasText: 'LK-007' });
    await expect(matchingCard).toHaveCount(1);
    await expect(matchingCard).toBeVisible();
  });
});
