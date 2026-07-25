const { test, expect } = require('@playwright/test');

const baseURL = process.env.BASE_URL || 'http://127.0.0.1:4173';

const categoryPages = [
  ['/categoria/pantallas/', 'category-pantallas', 'Pantallas'],
  ['/categoria/fundas/', 'category-fundas', 'Fundas'],
  ['/categoria/maquinas-de-hidrogel/', 'category-maquinas', 'Máquinas'],
  ['/categoria/camaras-inteligentes/', 'category-camaras', 'Cámaras'],
  ['/categoria/gafas-inteligentes-ai/', 'category-gafas-ai', 'Gafas'],
  ['/categoria/productos-ai/', 'category-productos-ai', 'Productos AI'],
];

test.describe('HAODE static category conversion UI phase 9', () => {
  for (const [path, panelId, label] of categoryPages) {
    test(`${path} has unified category WhatsApp conversion`, async ({ page }) => {
      await page.goto(`${baseURL}${path}`);

      await expect(page.locator('body')).toHaveClass(/conversion-reference-page/);
      await expect(page.locator('body')).toHaveClass(/category-entry-reference-page/);
      await expect(page.locator('.reference-conversion-strip')).toContainText('Stock en México');
      await expectFactoryProofStrip(page);
      await expect(page.locator(`[data-reference-conversion="${panelId}"]`)).toContainText(/WhatsApp|Cotiza|Cotización|Envía/);
      await expect(page.locator('a[href*="wa.me"]').first()).toBeVisible();
      await expect(page.getByRole('heading', { name: new RegExp(label, 'i') }).first()).toBeVisible();

      await page.setViewportSize({ width: 390, height: 844 });
      await expect(page.locator('.topnav a').first()).toBeVisible();
      const overflow = await page.evaluate(() => Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth));
      expect(overflow).toBe(0);
    });
  }

  test('/categoria/productos-ai/ keeps structured data route canonical', async ({ page }) => {
    await page.goto(`${baseURL}/categoria/productos-ai/`);
    const jsonLd = await page.locator('script[type="application/ld+json"]').first().textContent();
    expect(jsonLd).not.toContain('categoria/categoria');
    expect(jsonLd).toContain('https://haode.com.mx/categoria/productos-ai/#gafas-inteligentes-ai');
  });
});

async function expectFactoryProofStrip(page) {
  const details = await page.locator('.reference-conversion-strip').first().evaluate((el) => {
    const firstStrong = el.querySelector('strong');
    return {
      backgroundImage: getComputedStyle(el).backgroundImage,
      strongColor: firstStrong ? getComputedStyle(firstStrong).color : '',
    };
  });
  expect(details.backgroundImage).toContain('linear-gradient');
  expect(details.strongColor).toBe('rgb(255, 255, 255)');
}
