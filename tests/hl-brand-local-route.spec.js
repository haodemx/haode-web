const { test, expect } = require('@playwright/test');

const baseURL = process.env.BASE_URL || 'http://127.0.0.1:4175';

for (const viewport of [
  { width: 390, height: 844 },
  { width: 1440, height: 900 },
]) {
  test(`official HL store route renders cleanly at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const response = await page.goto(`${baseURL}/tienda-oficial-hl-cdmx/`, { waitUntil: 'domcontentloaded' });

    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1, name: /Tienda oficial de fábrica HL en CDMX/i })).toBeVisible();
    await expect(page.getByText(/HAODE México es el nombre de nuestra tienda/i)).toBeVisible();
    await expect(page.locator('video')).toHaveAttribute('poster', /haode-como-llegar-local-225\.png$/);
    await expect(page.getByRole('heading', { name: /Cómo llegar al Piso 2, Local 225/i })).toBeVisible();

    const audit = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      brokenImages: [...document.images]
        .filter((image) => image.complete && image.naturalWidth === 0)
        .map((image) => image.currentSrc || image.src),
    }));

    expect(audit.overflow).toBeLessThanOrEqual(1);
    expect(audit.brokenImages).toEqual([]);
  });
}
