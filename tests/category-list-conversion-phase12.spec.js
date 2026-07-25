const { test, expect } = require('@playwright/test');

const baseURL = process.env.BASE_URL || 'http://127.0.0.1:4173';

const pages = [
  ['/categoria/iphone-incell/', 'Stock en México'],
  ['/categoria/iphone-oled/', 'Stock en México'],
  ['/categoria/samsung-incell/', 'Stock en México'],
  ['/categoria/samsung-oled/', 'Stock en México'],
  ['/categoria/samsung-tipo-original/', 'Stock en México'],
  ['/categoria/oled-diagnostica/', 'Stock en México'],
  ['/categoria/samsung-plegables/', 'Pedido especial'],
];

test.describe('HAODE dynamic category conversion UI phase 12', () => {
  for (const [path, firstBadge] of pages) {
    test(`${path} exposes first-screen WhatsApp category intake`, async ({ page }) => {
      await page.goto(`${baseURL}${path}`, { waitUntil: 'domcontentloaded' });

      await expect(page.locator('body')).toHaveClass(/conversion-reference-page/);
      await expect(page.locator('body')).toHaveClass(/category-list-reference-page/);
      await expect(page.locator('.reference-conversion-strip')).toContainText(firstBadge);
      await expect(page.locator('.reference-conversion-strip')).toContainText('WhatsApp privado');
      await expect(page.locator('.new-page-links a[href*="wa.me"]').first()).toBeVisible();
      await expect(page.locator('[data-category-whatsapp-panel], .contact-whatsapp-panel').first()).toBeVisible();
      if (await page.locator('.category-whatsapp-primary').count()) {
        await expect(page.locator('.category-whatsapp-primary').first()).toContainText('Cotizar modelo por WhatsApp');
      }

      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`${baseURL}${path}`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('.reference-conversion-strip')).toBeVisible();
      await expect(page.locator('.topnav a').first()).toBeVisible();
      const overflow = await page.evaluate(() => Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth));
      expect(overflow).toBe(0);
    });
  }
});
