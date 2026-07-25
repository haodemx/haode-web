const { test, expect } = require('@playwright/test');

const baseURL = process.env.BASE_URL || 'http://127.0.0.1:4173';

const pages = [
  '/producto/iphone-incell-14/',
  '/producto/samsung-incell-s8/',
  '/producto/iphone-14-incell/',
];

const legacyPlegablePages = [
  '/productos/samsung-z-flip3/',
  '/productos/samsung-z-fold6/',
];

test.describe('HAODE product detail highlight grid phase 14', () => {
  for (const path of pages) {
    test(`${path} shows unified first-screen detail highlights`, async ({ page }) => {
      await page.goto(`${baseURL}${path}`, { waitUntil: 'domcontentloaded' });

      await expect(page.locator('[data-detail-title]')).not.toHaveText('Producto HAODE México');
      const highlights = page.locator('[data-detail-highlights] span');
      await expect(highlights).toHaveCount(4);
      await expect(page.locator('[data-detail-highlights]')).toContainText('Stock en México');
      await expect(page.locator('[data-detail-highlights]')).toContainText('Precio por cantidad');
      await expect(page.locator('[data-detail-highlights]')).toContainText('WhatsApp privado');
      await expect(page.locator('[data-detail-conversion]')).toContainText('Cotiza este modelo por WhatsApp privado');
      await expect(page.locator('[data-detail-conversion]')).toContainText('Stock en México');

      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`${baseURL}${path}`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('.topnav a').first()).toBeVisible();
      await expectCompactMobileTopbar(page, 100);
      await expectMobileDetailPreview(page);
      await expectFirstWhatsAppInViewport(page);
      const overflow = await page.evaluate(() => Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth));
      expect(overflow).toBe(0);
    });
  }

  test('mobile detail preview keeps the loaded local image when ERP sends a hosted image', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${baseURL}/producto/iphone-incell-14/`, { waitUntil: 'domcontentloaded' });
    await expectMobileDetailPreview(page);

    await page.evaluate(() => {
      window.syncDetailMobilePreview(document.querySelector('[data-product-detail]'), {
        imageSrc: 'https://erp.haode.com.mx/uploads/products/slow-iphone-14.webp',
        title: 'Pantalla para iPhone 14',
      });
    });

    const previewSrc = await page.locator('[data-detail-mobile-preview] img').getAttribute('src');
    expect(previewSrc).toBe('/assets/products/iphone-incell/14/main.jpg');
  });

  for (const path of legacyPlegablePages) {
    test(`${path} keeps quote action in the first screen`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`${baseURL}${path}`, { waitUntil: 'domcontentloaded' });

      const quickQuote = page.locator('.detail-quick-whatsapp').first();
      await expect(quickQuote).toBeVisible();
      await expect(quickQuote).toContainText('Cotizar por WhatsApp');
      await expect(quickQuote).toHaveAttribute('href', /wa\.me/);
      await expectDesktopQuoteInViewport(page);
      await expectDesktopFoldableSalesLayout(page);

      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`${baseURL}${path}`, { waitUntil: 'domcontentloaded' });

      await expect(page.locator('.topnav a').first()).toBeVisible();
      await expectCompactMobileTopbar(page, 100);
      const quoteButton = page.locator('.detail-buttons a[href*="wa.me"]').first();
      await expect(quoteButton).toBeVisible();
      await expect(quoteButton).toContainText('Cotizar por WhatsApp');
      const firstQuoteVisible = await quoteButton.evaluate((el) => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && rect.top < window.innerHeight;
      });
      expect(firstQuoteVisible).toBe(true);

      const overflow = await page.evaluate(() => Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth));
      expect(overflow).toBe(0);
    });
  }
});

async function expectDesktopQuoteInViewport(page) {
  const layout = await page.locator('.detail-quick-whatsapp').first().evaluate((el) => {
    const rect = el.getBoundingClientRect();
    return {
      top: Math.round(rect.top),
      bottom: Math.round(rect.bottom),
    };
  });

  expect(layout.top).toBeGreaterThanOrEqual(0);
  expect(layout.bottom).toBeLessThanOrEqual(900);
}

async function expectDesktopFoldableSalesLayout(page) {
  const layout = await page.evaluate(() => {
    const imageRect = document.querySelector('.detail-main-image')?.getBoundingClientRect();
    const infoRect = document.querySelector('.detail-info')?.getBoundingClientRect();
    const titleRect = document.querySelector('.detail-title')?.getBoundingClientRect();

    return {
      imageTop: Math.round(imageRect?.top || 0),
      imageBottom: Math.round(imageRect?.bottom || 0),
      infoTop: Math.round(infoRect?.top || 0),
      infoBottom: Math.round(infoRect?.bottom || 0),
      titleRight: Math.round(titleRect?.right || 0),
      imageLeft: Math.round(imageRect?.left || 0),
    };
  });

  expect(layout.imageTop).toBeLessThan(260);
  expect(layout.imageBottom).toBeLessThanOrEqual(720);
  expect(layout.infoTop).toBeLessThan(260);
  expect(layout.infoBottom).toBeLessThanOrEqual(900);
  expect(layout.imageLeft).toBeGreaterThan(layout.titleRight + 40);
}

async function expectCompactMobileTopbar(page, maxHeight) {
  const layout = await page.evaluate(() => {
    const topbar = document.querySelector('.topbar')?.getBoundingClientRect();
    const brand = document.querySelector('.brand')?.getBoundingClientRect();
    const logo = document.querySelector('.brand-logo');
    const brandText = document.querySelector('.brand-copy strong');

    return {
      topbarHeight: Math.round(topbar?.height || 0),
      brandLeft: Math.round(brand?.left || 0),
      brandWidth: Math.round(brand?.width || 0),
      logoDisplay: logo ? getComputedStyle(logo).display : null,
      brandText: brandText?.textContent?.trim() || '',
      brandColor: brandText ? getComputedStyle(brandText).color : null,
    };
  });

  expect(layout.topbarHeight).toBeLessThanOrEqual(maxHeight);
  expect(layout.brandLeft).toBeLessThanOrEqual(18);
  expect(layout.brandWidth).toBeGreaterThanOrEqual(100);
  expect(layout.logoDisplay).toBe('none');
  expect(layout.brandText).toBe('HAODE');
  expect(layout.brandColor).toBe('rgb(240, 68, 24)');
}

async function expectFirstWhatsAppInViewport(page) {
  const isInViewport = await page.locator('a[href*="wa.me"]').first().evaluate((el) => {
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && rect.top < window.innerHeight;
  });
  expect(isInViewport).toBe(true);
}

async function expectMobileDetailPreview(page) {
  const preview = page.locator('[data-detail-mobile-preview]');
  await expect(preview).toBeVisible();
  const details = await preview.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    const image = el.querySelector('img');
    return {
      top: Math.round(rect.top),
      width: Math.round(rect.width),
      imageLoaded: Boolean(image && image.complete && image.naturalWidth > 0),
    };
  });
  expect(details.top).toBeLessThan(560);
  expect(details.width).toBeGreaterThan(320);
  expect(details.imageLoaded).toBe(true);
}
