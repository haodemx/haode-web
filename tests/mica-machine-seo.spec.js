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

test('candidate pricing keeps the four approved named tiers after client rendering', async ({ page }) => {
  const expected = [
    ['/producto/mica-hd/', '$350 MXN', ['$350 MXN', '$300 MXN', '$275 MXN', '$250 MXN']],
    ['/producto/mica-matte/', '$350 MXN', ['$350 MXN', '$300 MXN', '$275 MXN', '$250 MXN']],
    ['/producto/mica-privacidad-hd/', '$800 MXN', ['$800 MXN', '$750 MXN', '$700 MXN', '$650 MXN']],
    ['/producto/mica-privacidad-matte/', '$800 MXN', ['$800 MXN', '$750 MXN', '$700 MXN', '$650 MXN']],
    ['/producto/x200t-cortadora-micas/', '$6,000 MXN', ['$6,000 MXN', '$5,800 MXN', '$5,500 MXN', '$5,300 MXN']],
  ];
  for (const [route, retailPrice, tiers] of expected) {
    await page.goto(`${baseURL}${route}`, { waitUntil: 'networkidle' });
    await expect(page.locator('[data-detail-price]')).toHaveText(`Menudeo: ${retailPrice}`);
    await expect(page.locator('[data-detail-price-body] th')).toHaveText(['Menudeo', 'Mayoreo', 'Caja', '⭐ VIP']);
    await expect(page.locator('[data-detail-price-body] td')).toHaveText(tiers);
  }
});

test('OEM landing is readable and overflow-free on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const response = await page.goto(`${baseURL}/micas-hidrogel-marca-propia/`, { waitUntil: 'networkidle' });
  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1, name: 'Micas de hidrogel con tu marca' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Solicitar cotización' }).first()).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
