const { test, expect } = require('@playwright/test');

const baseURL = process.env.BASE_URL || 'http://127.0.0.1:4173';

test.describe('HAODE legacy entry conversion UI phase 8', () => {
  for (const path of ['/micas.html', '/categoria/micas/']) {
    test(`${path} keeps micas package prices and WhatsApp bulk intake visible`, async ({ page }) => {
      await page.goto(`${baseURL}${path}`);

      await expect(page.locator('body')).toHaveClass(/conversion-reference-page/);
      await expect(page.locator('body')).toHaveClass(/micas-reference-page/);
      await expect(page.locator('.reference-conversion-strip')).toContainText('Paquete 50 pzs');
      await expect(page.locator('[data-reference-conversion="micas-packages"]')).toContainText('Envía tu lista de micas');
      await expect(page.locator('text=$450 MXN').first()).toBeVisible();
      await expect(page.locator('a[href*="wa.me"]').first()).toBeVisible();

      const floatingDisplay = await page.locator('.floating-cta').evaluate((el) => getComputedStyle(el).display);
      expect(floatingDisplay).toBe('none');

      const overflow = await page.evaluate(() => Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth));
      expect(overflow).toBe(0);
    });
  }

  test('/productos-ai.html matches the unified AI conversion entry', async ({ page }) => {
    await page.goto(`${baseURL}/productos-ai.html`);

    await expect(page.locator('body')).toHaveClass(/conversion-reference-page/);
    await expect(page.locator('body')).toHaveClass(/legacy-ai-alias-page/);
    await expect(page.locator('.reference-conversion-strip')).toContainText('Stock en México');
    await expect(page.locator('[data-reference-conversion="productos-ai-alias"]')).toContainText('Cotiza Productos AI');
    await expect(page.locator('a[href*="wa.me"]').first()).toBeVisible();

    const floatingDisplay = await page.locator('.floating-cta').evaluate((el) => getComputedStyle(el).display);
    expect(floatingDisplay).toBe('none');

    const overflow = await page.evaluate(() => Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth));
    expect(overflow).toBe(0);
  });
});
