const { test, expect } = require('@playwright/test');

const SERVER_URL = (process.env.BASE_URL || 'https://haode.com.mx').replace(/\/app\/?$/, '').replace(/\/$/, '');
const APP_URL = `${SERVER_URL}/app/`;

const productRoutes = [
  ['iphone-incell-14', 'Pantalla para iPhone 14'],
  ['x200t-cortadora-micas', 'X200T'],
];

test.describe('HAODE App product detail conversion UI phase 17', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('https://erp.haode.com.mx/**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });
  });

  for (const [productId, heading] of productRoutes) {
    test(`${productId} shows detail conversion strip and WhatsApp path`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`${APP_URL}#producto/${productId}`, { waitUntil: 'domcontentloaded' });

      await expect(page.getByRole('heading', { name: new RegExp(heading, 'i') })).toBeVisible({ timeout: 15000 });
      await expect(page.locator('.detail-conversion-strip')).toContainText('Referencia por confirmar');
      await expect(page.locator('.detail-conversion-strip')).toContainText('Precio por cantidad');
      await expect(page.locator('.detail-conversion-strip')).toContainText('Calidad revisada');
      await expect(page.locator('.detail-conversion-strip')).toContainText('WhatsApp privado');
      await expect(page.locator('.sticky-actions a[href*="wa.me"]').first()).toContainText('Cotizar por WhatsApp');
      await expect(page.locator('.sticky-actions a[href*="wa.me"]').first()).toBeVisible();
      await expect(page.locator('.detail-whatsapp-note')).toContainText('Lista grande por WhatsApp');
      await expect(page.locator('.detail-whatsapp-note')).toContainText('garantía local');
      await expectProductSummaryFirstScreen(page);
      await expectProductWhatsappPrimary(page);
      await expectDetailProofStripReadable(page);

      const overflow = await page.evaluate(() => (
        Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth)
      ));
      expect(overflow).toBeLessThanOrEqual(1);
    });
  }

  test('catalog navigation opens product detail from the top', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${APP_URL}#lista`, { waitUntil: 'domcontentloaded' });

    const productCards = page.locator('.product-card');
    await expect(productCards.nth(4)).toBeVisible({ timeout: 15000 });
    await page.evaluate(() => window.scrollTo(0, 1100));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(600);

    await productCards.nth(4).locator('a[href^="#producto/"]').first().click();
    await expect(page.locator('.detail-panel h1')).toBeVisible({ timeout: 15000 });
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThanOrEqual(4);

    const topBox = await page.locator('.page-stack').evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { top: Math.round(rect.top), bottom: Math.round(rect.bottom) };
    });
    expect(topBox.top).toBeGreaterThanOrEqual(0);
    expect(topBox.top).toBeLessThan(160);
    await expect(page.locator('.back-link')).toBeVisible();
  });
});

async function expectProductSummaryFirstScreen(page) {
  const layout = await page.evaluate(() => {
    const title = document.querySelector('.detail-panel h1')?.getBoundingClientRect();
    const gallery = document.querySelector('.gallery-shell')?.getBoundingClientRect();
    const stickyActions = document.querySelector('.sticky-actions')?.getBoundingClientRect();

    return {
      titleTop: Math.round(title?.top || 0),
      galleryTop: Math.round(gallery?.top || 0),
      actionsTop: Math.round(stickyActions?.top || 0),
      actionsHeight: Math.round(stickyActions?.height || 0),
    };
  });

  expect(layout.titleTop).toBeGreaterThanOrEqual(0);
  expect(layout.titleTop).toBeLessThan(390);
  expect(layout.galleryTop).toBeGreaterThan(layout.titleTop);
  expect(layout.actionsHeight).toBeGreaterThan(48);
  expect(layout.actionsTop).toBeLessThan(844);
}

async function expectProductWhatsappPrimary(page) {
  const details = await page.evaluate(() => {
    const whatsapp = document.querySelector('.sticky-actions a[href*="wa.me"]');
    const rect = whatsapp?.getBoundingClientRect();
    const styles = whatsapp ? getComputedStyle(whatsapp) : null;
    return {
      width: Math.round(rect?.width || 0),
      background: styles?.backgroundColor || '',
      whiteSpace: styles?.whiteSpace || '',
      color: styles?.color || '',
    };
  });

  expect(details.width).toBeGreaterThan(150);
  expect(details.background).toContain('18');
  expect(details.whiteSpace).toBe('nowrap');
  expect(details.color).toBe('rgb(255, 255, 255)');
}

async function expectDetailProofStripReadable(page) {
  const details = await page.evaluate(() => {
    const strip = document.querySelector('.detail-conversion-strip');
    const cell = document.querySelector('.detail-conversion-strip span');
    const strong = document.querySelector('.detail-conversion-strip strong');
    return {
      stripBackground: strip ? getComputedStyle(strip).backgroundImage : '',
      cellBackground: cell ? getComputedStyle(cell).backgroundColor : '',
      strongColor: strong ? getComputedStyle(strong).color : '',
    };
  });

  expect(details.stripBackground).toContain('linear-gradient');
  expect(details.cellBackground).toBe('rgba(0, 0, 0, 0)');
  expect(details.strongColor).toBe('rgb(255, 255, 255)');
}
