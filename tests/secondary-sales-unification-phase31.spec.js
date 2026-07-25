const { test, expect } = require('@playwright/test');

const baseURL = (process.env.BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');

const sharedFooterPages = [
  '/garantia/',
  '/ai-smart-glasses-s1.html',
  '/pantallas-premium-iphone-samsung-fabrica/',
  '/guia-ia-haode-mexico/',
  '/producto/iphone-incell-12-12pro/',
];

test.describe('HAODE secondary sales unification phase 31', () => {
  for (const path of sharedFooterPages) {
    test(`${path} closes with visible WhatsApp and APP actions`, async ({ page }) => {
      await page.goto(`${baseURL}${path}`, { waitUntil: 'domcontentloaded' });

      const footer = page.locator('[data-site-sales-footer]');
      await expect(footer).toBeVisible();
      await expect(footer.locator('.site-sales-footer-whatsapp')).toBeVisible();
      await expect(footer.locator('.site-sales-footer-whatsapp')).toHaveAttribute('href', /wa\.me/);
      await expect(footer.locator('.site-sales-footer-app')).toBeVisible();
      await expect(footer.locator('.site-sales-footer-app')).toHaveAttribute('href', '/app/');
      await page.waitForLoadState('load');
      await expectNoHorizontalOverflow(page);
    });
  }

  test('trust page keeps a compact desktop hierarchy and active navigation', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${baseURL}/garantia/`, { waitUntil: 'domcontentloaded' });

    await expect(page.locator('[data-detail-header-whatsapp]')).toBeVisible();
    await expect(page.locator('[data-detail-header-app]')).toBeVisible();
    await expect(page.locator('.topnav a[aria-current="page"]')).toHaveAttribute('href', '/garantia/');

    const layout = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      const header = document.querySelector('.catalog-topbar');
      const strip = document.querySelector('.reference-conversion-strip');
      return {
        fontSize: Number.parseFloat(getComputedStyle(h1).fontSize),
        headerHeight: Math.round(header.getBoundingClientRect().height),
        stripBackground: getComputedStyle(strip).backgroundColor,
        bodyBackground: getComputedStyle(document.body).backgroundColor,
      };
    });

    expect(layout.fontSize).toBeLessThanOrEqual(58);
    expect(layout.headerHeight).toBeLessThanOrEqual(130);
    expect(layout.stripBackground).toBe('rgb(16, 18, 20)');
    expect(layout.bodyBackground).toBe('rgb(243, 243, 241)');
    await expectNoHorizontalOverflow(page);
  });

  test('SEO landing page fits its sales hero without card stacking on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${baseURL}/pantallas-premium-iphone-samsung-fabrica/`, {
      waitUntil: 'domcontentloaded',
    });

    const layout = await page.evaluate(() => {
      const grid = document.querySelector('.seo-landing-hero-grid');
      const copy = document.querySelector('.seo-landing-copy');
      const media = document.querySelector('.seo-landing-media');
      const h1 = document.querySelector('h1');
      return {
        columns: getComputedStyle(grid).gridTemplateColumns,
        gridRadius: getComputedStyle(grid).borderRadius,
        copyShadow: getComputedStyle(copy).boxShadow,
        mediaShadow: getComputedStyle(media).boxShadow,
        fontSize: Number.parseFloat(getComputedStyle(h1).fontSize),
      };
    });

    expect(layout.columns.split(' ').length).toBeGreaterThanOrEqual(2);
    expect(layout.gridRadius).toBe('4px');
    expect(layout.copyShadow).toBe('none');
    expect(layout.mediaShadow).toBe('none');
    expect(layout.fontSize).toBeLessThanOrEqual(58);
    await expectNoHorizontalOverflow(page);
  });

  for (const width of [360, 390, 768, 1440, 1920]) {
    test(`secondary page shell stays inside ${width}px viewport`, async ({ page }) => {
      await page.setViewportSize({ width, height: width < 700 ? 844 : 1000 });
      await page.goto(`${baseURL}/ai-smart-glasses-s1.html`, { waitUntil: 'domcontentloaded' });

      await expect(page.locator('[data-detail-header-whatsapp]')).toBeVisible();
      await expect(page.locator('[data-detail-header-app]')).toBeVisible();
      await expect(page.locator('[data-site-sales-footer]')).toBeVisible();
      await expectNoHorizontalOverflow(page);
    });
  }
});

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(
    () => Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth)
  );
  expect(overflow).toBe(0);
}
