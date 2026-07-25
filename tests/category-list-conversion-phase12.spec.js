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
      await expectCompactMobileTopbar(page, 100);
      const overflow = await page.evaluate(() => Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth));
      expect(overflow).toBe(0);
    });
  }
});

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
