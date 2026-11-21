const { expect, test } = require('@playwright/test');

const baseURL = (process.env.BASE_URL || 'http://127.0.0.1:4197').replace(/\/$/, '');

const routes = [
  ['/categoria/maquinas-de-hidrogel/', 'Cortadora de micas de hidrogel para tiendas'],
  ['/producto/x200t-cortadora-micas/', 'HAODE X200T Cortadora Inteligente de Micas'],
  ['/mx5t7-290-cortadora-micas/', 'MX5T7-290 cortadora inteligente de micas'],
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
  await expect(page.locator('a[href="/mx5t7-290-cortadora-micas/"]').first()).toBeVisible();

  await page.goto(`${baseURL}/mx5t7-290-cortadora-micas/`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('a[href="/categoria/maquinas-de-hidrogel/"]').first()).toBeVisible();
  await expect(page.locator('a[href="/micas-hidrogel-mayoreo-mexico/"]').first()).toBeVisible();

  await page.goto(`${baseURL}/producto/x200t-cortadora-micas/`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('a[href="/categoria/maquinas-de-hidrogel/"]').first()).toBeVisible();
  await expect(page.locator('a[href="/micas-hidrogel-mayoreo-mexico/"]').first()).toBeVisible();

  await page.goto(`${baseURL}/producto/mica-hd/`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('a[href="/micas-hidrogel-mayoreo-mexico/"]').first()).toBeVisible();
});

for (const analytics of [true, false]) {
  test(`MX5T7-290 WhatsApp quote respects analytics consent (${analytics})`, async ({ page }) => {
    const route = '/mx5t7-290-cortadora-micas/';
    await page.route('https://www.googletagmanager.com/**', (request) =>
      request.fulfill({ contentType: 'application/javascript', body: '' }));
    await page.route('https://*.google-analytics.com/**', (request) => request.abort());
    await page.route('https://wa.me/**', (request) => request.abort());
    await page.addInitScript((analytics) => {
      localStorage.setItem('haode-privacy-consent-v1', JSON.stringify({ version: 1, analytics, advertising: false }));
    }, analytics);
    await page.goto(`${baseURL}${route}?utm_source=google`, { waitUntil: 'domcontentloaded' });
    const quote = page.getByRole('link', { name: 'Cotizar MX5T7-290', exact: true });
    const destination = new URL(await quote.getAttribute('href'));
    expect(destination.origin + destination.pathname).toBe('https://wa.me/523326684296');
    expect(destination.searchParams.get('text')).toMatch(/Modelo: MX5T7-290\nCantidad:\nCiudad:/);
    await quote.evaluate((link) => link.addEventListener('click', (event) => event.preventDefault(), { once: true }));
    await quote.click();
    const contacts = await page.evaluate(() => (window.dataLayer || []).map((event) => Array.from(event))
      .filter(([kind, name]) => kind === 'event' && name === 'contact'));
    expect(contacts).toHaveLength(analytics ? 1 : 0);
    if (analytics) {
      expect(contacts[0][2]).toMatchObject({ method: 'whatsapp', attribution_source: 'google', page_path: route });
    }
  });
}

test('candidate pricing keeps the four approved named tiers after client rendering', async ({ page }) => {
  const expected = [
    ['/producto/mica-hd/', '$375 MXN', ['$375 MXN', '$325 MXN', '$300 MXN', '$275 MXN']],
    ['/producto/mica-matte/', '$375 MXN', ['$375 MXN', '$325 MXN', '$300 MXN', '$275 MXN']],
    ['/producto/mica-privacidad-hd/', '$825 MXN', ['$825 MXN', '$775 MXN', '$725 MXN', '$675 MXN']],
    ['/producto/mica-privacidad-matte/', '$825 MXN', ['$825 MXN', '$775 MXN', '$725 MXN', '$675 MXN']],
    ['/producto/x200t-cortadora-micas/', '$6,100 MXN', ['$6,100 MXN', '$5,900 MXN', '$5,600 MXN', '$5,400 MXN']],
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
