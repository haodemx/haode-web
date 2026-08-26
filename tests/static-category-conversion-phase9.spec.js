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
      const expectedBadge = path === '/categoria/maquinas-de-hidrogel/' ? 'Modelo exacto' : 'Stock en México';
      await expect(page.locator('.reference-conversion-strip')).toContainText(expectedBadge);
      await expectFactoryProofStrip(page);
      await expect(page.locator(`[data-reference-conversion="${panelId}"]`)).toContainText(/WhatsApp|Cotiza|Cotización|Envía/);
      await expect(page.locator('a[href*="wa.me"]').first()).toBeVisible();
      await expect(page.locator('[data-detail-header-whatsapp]')).toBeVisible();
      await expect(page.locator('[data-detail-header-app]')).toBeVisible();
      await expect(page.locator('[data-site-sales-footer]')).toBeVisible();
      await expect(page.getByRole('heading', { name: new RegExp(label, 'i') }).first()).toBeVisible();

      await page.setViewportSize({ width: 360, height: 844 });
      await expect(page.locator('.topnav a').first()).toBeVisible();
      await expectCategoryContentStartsInView(page);
      const overflow = await page.evaluate(() => Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth));
      expect(overflow).toBe(0);
    });
  }

  test('/categoria/productos-ai/ points structured data to the primary AI route', async ({ page }) => {
    await page.goto(`${baseURL}/categoria/productos-ai/`);
    const jsonLd = await page.locator('script[type="application/ld+json"]').first().textContent();
    expect(jsonLd).not.toContain('categoria/categoria');
    expect(jsonLd).toContain('https://haode.com.mx/productos-ai/#gafas-inteligentes-ai');
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
  expect(details.backgroundImage).toBe('none');
  expect(details.strongColor).toBe('rgb(16, 16, 18)');
}

async function expectCategoryContentStartsInView(page) {
  const top = await page.locator('.section-shell > .section-head').first().evaluate((el) => Math.round(el.getBoundingClientRect().top));
  expect(top).toBeGreaterThanOrEqual(0);
  expect(top).toBeLessThan(844);
}
