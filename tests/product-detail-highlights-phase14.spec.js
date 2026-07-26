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
      await expect(page.locator('[data-detail-factory-callout]')).toContainText('Lista grande');
      await expect(page.locator('[data-detail-factory-callout]')).toContainText('Garantía local');
      await expect(page.locator('[data-detail-highlights] strong').first()).toHaveCSS('color', 'rgb(255, 255, 255)');
      await expectDesktopStandardDetailSalesLayout(page);
      await expectUnifiedDetailHeader(page);

      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`${baseURL}${path}`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('.topnav a').first()).toBeVisible();
      await expectCompactMobileTopbar(page, 100);
      await expectUnifiedDetailHeader(page);
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
      await expectUnifiedDetailHeader(page);

      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`${baseURL}${path}`, { waitUntil: 'domcontentloaded' });

      await expect(page.locator('.topnav a').first()).toBeVisible();
      await expectCompactMobileTopbar(page, 100);
      await expectUnifiedDetailHeader(page);
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

async function expectUnifiedDetailHeader(page) {
  const whatsapp = page.locator('[data-detail-header-whatsapp]');
  const app = page.locator('[data-detail-header-app]');
  await expect(whatsapp).toBeVisible();
  await expect(whatsapp).toHaveAttribute('href', /wa\.me/);
  await expect(whatsapp).toHaveCSS('background-color', 'rgb(18, 168, 84)');
  await expect(app).toBeVisible();
  await expect(app).toHaveAttribute('href', /\/app\/$/);
  await expect(app).toHaveCSS('background-color', 'rgb(255, 90, 10)');
}

async function expectDesktopStandardDetailSalesLayout(page) {
  const layout = await page.evaluate(() => {
    const titleRect = document.querySelector('.detail-title')?.getBoundingClientRect();
    const imageRect = document.querySelector('.detail-main-image')?.getBoundingClientRect();
    const gridRect = document.querySelector('.detail-grid')?.getBoundingClientRect();
    const quoteRect = document.querySelector('[data-detail-whatsapp]')?.getBoundingClientRect();
    const topFloat = document.querySelector('.detail-top .floating-cta');
    return {
      titleBottom: Math.round(titleRect?.bottom || 0),
      imageTop: Math.round(imageRect?.top || 0),
      imageLeft: Math.round(imageRect?.left || 0),
      imageRight: Math.round(imageRect?.right || 0),
      gridLeft: Math.round(gridRect?.left || 0),
      infoTop: Math.round(document.querySelector('.detail-info')?.getBoundingClientRect().top || 0),
      infoLeft: Math.round(document.querySelector('.detail-info')?.getBoundingClientRect().left || 0),
      quoteTop: Math.round(quoteRect?.top || 0),
      quoteBottom: Math.round(quoteRect?.bottom || 0),
      topFloatDisplay: topFloat ? getComputedStyle(topFloat).display : 'missing',
    };
  });

  expect(layout.imageTop).toBeLessThan(520);
  expect(layout.titleBottom).toBeLessThan(layout.imageTop);
  expect(layout.imageLeft).toBe(layout.gridLeft);
  expect(layout.infoTop).toBe(layout.imageTop);
  expect(layout.infoLeft).toBeGreaterThan(layout.imageRight + 20);
  expect(layout.quoteTop).toBeGreaterThanOrEqual(0);
  expect(layout.quoteBottom).toBeLessThanOrEqual(1000);
  expect(layout.topFloatDisplay).toBe('none');
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
      titleBottom: Math.round(titleRect?.bottom || 0),
      imageLeft: Math.round(imageRect?.left || 0),
      imageRight: Math.round(imageRect?.right || 0),
      infoLeft: Math.round(infoRect?.left || 0),
    };
  });

  expect(layout.imageTop).toBeLessThan(600);
  expect(layout.imageBottom).toBeLessThanOrEqual(1050);
  expect(layout.infoTop).toBe(layout.imageTop);
  expect(layout.infoBottom).toBeLessThanOrEqual(1100);
  expect(layout.titleBottom).toBeLessThan(layout.imageTop);
  expect(layout.infoLeft).toBeGreaterThan(layout.imageRight + 20);
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
      logoWidth: Math.round(logo?.getBoundingClientRect().width || 0),
      logoSource: logo?.getAttribute('src') || '',
      brandCopyDisplay: brandText ? getComputedStyle(brandText.parentElement).display : null,
    };
  });

  expect(layout.topbarHeight).toBeLessThanOrEqual(maxHeight);
  expect(layout.brandLeft).toBeLessThanOrEqual(18);
  expect(layout.brandWidth).toBeGreaterThanOrEqual(100);
  expect(layout.logoDisplay).toBe('block');
  expect(layout.logoWidth).toBeGreaterThanOrEqual(118);
  expect(layout.logoSource).toContain('factory-store-wordmark.png');
  expect(layout.brandCopyDisplay).toBe('none');
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
  const previewImage = preview.locator('img');
  await expect(previewImage).toBeVisible();
  await expect.poll(
    () => previewImage.evaluate((image) => image.complete && image.naturalWidth > 0),
    { message: 'mobile detail preview image should finish loading' }
  ).toBe(true);
  const details = await preview.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    return {
      top: Math.round(rect.top),
      width: Math.round(rect.width),
    };
  });
  expect(details.top).toBeLessThan(560);
  expect(details.width).toBeGreaterThan(320);
}
