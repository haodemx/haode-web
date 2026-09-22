const { test, expect } = require('@playwright/test');

const BASE_URL = (process.env.BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const STORE_ADDRESS = 'Eje Central Lázaro Cárdenas 87, Piso 2, Local 225, Colonia Centro, Cuauhtémoc, 06070, Ciudad de México, México';

async function expectDirectionsLink(link) {
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute('target', '_blank');
  await expect(link).toHaveAttribute('rel', /noopener/);
  const href = await link.getAttribute('href');
  const url = new URL(href);
  expect(url.origin).toBe('https://www.google.com');
  expect(url.pathname).toBe('/maps/dir/');
  expect(url.searchParams.get('api')).toBe('1');
  expect(url.searchParams.get('destination')).toBe(STORE_ADDRESS);
}

test('footer address and Cómo llegar open the confirmed store destination', async ({ page, context }) => {
  await context.route('https://www.google.com/maps/dir/**', (route) => route.fulfill({
    status: 200,
    contentType: 'text/html',
    body: '<title>Google Maps route</title>',
  }));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${BASE_URL}/`, { waitUntil: 'load' });

  const footer = page.locator('[data-ui-id="site-footer"]');
  const address = footer.locator('[data-store-address-link]');
  const directions = footer.locator('[data-store-directions]');
  await expectDirectionsLink(address);
  await expectDirectionsLink(directions);
  await expect(directions.locator('.store-map-pin')).toHaveCount(1);
  expect(await directions.evaluate((element) => element.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);

  const [mapsPage] = await Promise.all([
    context.waitForEvent('page'),
    directions.click(),
  ]);
  await mapsPage.waitForLoadState('domcontentloaded');
  expect(new URL(mapsPage.url()).searchParams.get('destination')).toBe(STORE_ADDRESS);
});

test('Contacto and Tienda pair WhatsApp with Cómo llegar', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });

  for (const route of ['/contacto/', '/tienda-oficial-hl-cdmx/']) {
    await page.goto(`${BASE_URL}${route}`, { waitUntil: 'load' });
    const actions = page.locator('[data-store-primary-actions]').first();
    await expect(actions.getByRole('link', { name: 'Cotizar por WhatsApp', exact: true })).toBeVisible();
    const directions = actions.getByRole('link', { name: 'Cómo llegar', exact: true });
    await expectDirectionsLink(directions);
    await expect(directions.locator('.store-map-pin')).toHaveCount(1);
    await expectDirectionsLink(page.locator('[data-store-address-link]').first());
  }
});

test('390px directions controls stay tappable and overflow-free', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  for (const route of ['/', '/contacto/', '/tienda-oficial-hl-cdmx/']) {
    await page.goto(`${BASE_URL}${route}`, { waitUntil: 'load' });
    if (route === '/') {
      const contactAccordion = page.locator('.c-footer-accordion').filter({ has: page.locator('[data-store-directions]') });
      await contactAccordion.locator('summary').click();
    }
    const directions = route === '/'
      ? page.locator('[data-ui-id="site-footer"] [data-store-directions]')
      : page.locator('[data-store-primary-actions] [data-store-directions]').first();
    await expectDirectionsLink(directions);
    expect(await directions.evaluate((element) => element.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  }
});
