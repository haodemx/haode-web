const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:4173';
const pages = [
  ['/producto/mica-hd/', 'MICA HD transparente para corte profesional'],
  ['/producto/mica-matte/', 'MICA MATTE con acabado mate'],
  ['/producto/mica-privacidad-hd/', 'MICA PRIVACIDAD HD para protección visual'],
  ['/producto/mica-privacidad-matte/', 'MICA PRIVACIDAD MATTE con menos reflejo'],
];

for (const [route, heading] of pages) {
  test(`${route} renders crawlable FAQ content without mobile overflow`, async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    await page.setViewportSize({ width: 390, height: 844 });

    const response = await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { name: heading })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Preguntas frecuentes' })).toBeVisible();
    await expect(page.locator('[data-mica-indexing-content] .faq-grid article')).toHaveCount(3);

    const schema = await page.locator('script[type="application/ld+json"]').first().textContent();
    const graph = JSON.parse(schema)['@graph'];
    expect(graph.find((node) => node['@type'] === 'FAQPage')?.mainEntity).toHaveLength(3);

    const layout = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
      brokenImages: [...document.images].filter((image) => image.complete && image.naturalWidth === 0).length,
    }));
    expect(layout.document).toBeLessThanOrEqual(layout.viewport);
    expect(layout.brokenImages).toBe(0);
    expect(pageErrors).toEqual([]);
  });
}

test('/micas-hidrogel/ reaches the canonical landing route', async ({ page }) => {
  await page.goto(`${BASE_URL}/micas-hidrogel/`, { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(`${BASE_URL}/micas-hidrogel-mayoreo-mexico/`);
  await expect(page.getByRole('heading', { name: 'Micas e hidrogel para tiendas' })).toBeVisible();
});

test('hydrogel landing exposes all four direct MICA links', async ({ page }) => {
  await page.goto(`${BASE_URL}/micas-hidrogel-mayoreo-mexico/`, { waitUntil: 'domcontentloaded' });

  for (const [route] of pages) {
    await expect(page.locator(`a[href="${route}"]`)).toHaveCount(1);
  }
});
