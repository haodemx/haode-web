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
      await expectFirstWhatsAppInViewport(page);
      const overflow = await page.evaluate(() => Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth));
      expect(overflow).toBe(0);
    });
  }

  for (const path of legacyPlegablePages) {
    test(`${path} keeps mobile quote action in the first screen`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`${baseURL}${path}`, { waitUntil: 'domcontentloaded' });

      await expect(page.locator('.topnav a').first()).toBeVisible();
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

async function expectFirstWhatsAppInViewport(page) {
  const isInViewport = await page.locator('a[href*="wa.me"]').first().evaluate((el) => {
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && rect.top < window.innerHeight;
  });
  expect(isInViewport).toBe(true);
}
