const { expect, test } = require('@playwright/test');

const baseURL = (process.env.BASE_URL || 'http://127.0.0.1:4197').replace(/\/$/, '');

const routes = [
  ['/categoria/maquinas-de-hidrogel/', 'Máquina de hidrogel para cortar micas'],
  ['/producto/x200t-cortadora-micas/', 'HAODE X200T Cortadora Inteligente de Micas'],
  ['/producto/mica-hd/', 'MICA HD'],
  ['/producto/mica-matte/', 'MICA MATTE'],
  ['/producto/mica-privacidad-hd/', 'MICA PRIVACIDAD HD'],
  ['/producto/mica-privacidad-matte/', 'MICA PRIVACIDAD MATTE'],
];

for (const [route, heading] of routes) {
  test(`${route} renders its hydrogel search path without overflow`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const response = await page.goto(`${baseURL}${route}`, { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
    await expect(page).toHaveTitle(/hidrogel/i);
    const documentWidth = await page.evaluate(() => ({
      client: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
    }));
    expect(documentWidth.scroll).toBeLessThanOrEqual(documentWidth.client + 1);
  });
}

test('machine and MICA pages provide crawlable links in both directions', async ({ page }) => {
  await page.goto(`${baseURL}/categoria/maquinas-de-hidrogel/`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('a[href="/producto/x200t-cortadora-micas/"]').first()).toBeVisible();

  await page.goto(`${baseURL}/producto/x200t-cortadora-micas/`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('a[href="/categoria/maquinas-de-hidrogel/"]').first()).toBeVisible();
  await expect(page.locator('a[href="/micas-hidrogel-mayoreo-mexico/"]').first()).toBeVisible();

  await page.goto(`${baseURL}/producto/mica-hd/`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('a[href="/micas-hidrogel-mayoreo-mexico/"]').first()).toBeVisible();
});
