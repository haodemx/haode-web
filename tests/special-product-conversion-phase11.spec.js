const { test, expect } = require('@playwright/test');

const baseURL = process.env.BASE_URL || 'http://127.0.0.1:4173';

const specialPages = [
  ['/producto/lk-007-camara-digital-4k/', 'special-camera-lk007', '$500 MXN'],
  ['/producto/lk-018-camara-accion-hd/', 'special-camera-lk018', '$1,200 MXN'],
  ['/producto/lk-030-mini-camara-retro-digital/', 'special-camera-lk030', '$400 MXN'],
  ['/producto/lk-032-camara-inteligente-con-gimbal/', 'special-camera-lk032', '$1,000 MXN'],
  ['/producto/x200t-cortadora-micas/', 'special-machine-x200t', '$6,800 MXN'],
];

test.describe('HAODE special product conversion UI phase 11', () => {
  for (const [path, panelId, priceText] of specialPages) {
    test(`${path} keeps price and adds private WhatsApp conversion`, async ({ page }) => {
      await page.goto(`${baseURL}${path}`, { waitUntil: 'domcontentloaded' });

      await expect(page.locator('body')).toHaveClass(/conversion-reference-page/);
      await expect(page.locator('body')).toHaveClass(/special-product-reference-page/);
      await expect(page.locator('.reference-conversion-strip')).toContainText('Stock en México');
      await expect(page.locator('.reference-conversion-strip')).toContainText('WhatsApp privado');
      await expect(page.locator(`[data-reference-conversion="${panelId}"]`)).toContainText(/WhatsApp privado|Cotiza/);
      await expect(page.locator(`[data-reference-conversion="${panelId}"] a[href*="wa.me"]`)).toBeVisible();
      await expect(page.locator(`text=${priceText}`).first()).toBeVisible();
      await expectUnifiedDetailHeader(page);

      const panelBeforeGrid = await page.locator(`[data-reference-conversion="${panelId}"]`).evaluate((panel) => {
        const grid = panel.parentElement?.querySelector('.detail-grid');
        return Boolean(grid && panel.compareDocumentPosition(grid) & Node.DOCUMENT_POSITION_FOLLOWING);
      });
      expect(panelBeforeGrid).toBe(true);

      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`${baseURL}${path}`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator(`[data-reference-conversion="${panelId}"]`)).toBeVisible();
      await expectUnifiedDetailHeader(page);
      const overflow = await page.evaluate(() => Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth));
      expect(overflow).toBe(0);
    });
  }
});

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
