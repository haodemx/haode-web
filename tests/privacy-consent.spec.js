const { test, expect } = require('@playwright/test');

const baseURL = process.env.BASE_URL || 'http://127.0.0.1:4175';
const consentStorageKey = 'haode-privacy-consent-v1';

test.beforeEach(async ({ page }) => {
  await page.route('https://www.googletagmanager.com/**', (route) => route.abort());
  await page.route('https://www.google-analytics.com/**', (route) => route.abort());
});

test('Consent Mode starts denied and saves an explicit analytics choice', async ({ page }) => {
  await page.addInitScript((key) => {
    if (sessionStorage.getItem('haode-consent-test-initialized')) return;
    localStorage.removeItem(key);
    sessionStorage.setItem('haode-consent-test-initialized', 'true');
  }, consentStorageKey);
  await page.goto(`${baseURL}/`, { waitUntil: 'domcontentloaded' });

  const banner = page.getByRole('region', { name: 'Tu privacidad en HAODE' });
  await expect(banner).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('haode-campaign-attribution-v1'))).toBeNull();
  expect(await page.evaluate(() => sessionStorage.getItem('haode-campaign-attribution-v1'))).toBeNull();

  const initialCommands = await page.evaluate(() => window.dataLayer.map((entry) => Array.from(entry)));
  const defaultConsent = initialCommands.find((entry) => entry[0] === 'consent' && entry[1] === 'default');
  const configIndex = initialCommands.findIndex((entry) => entry[0] === 'config');
  const consentIndex = initialCommands.indexOf(defaultConsent);
  expect(defaultConsent[2]).toMatchObject({
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
  expect(consentIndex).toBeGreaterThanOrEqual(0);
  expect(configIndex).toBeGreaterThan(consentIndex);

  await page.getByRole('button', { name: 'Configurar' }).click();
  const dialog = page.getByRole('dialog', { name: 'Configura tu privacidad' });
  await expect(dialog).toBeVisible();
  await expect(dialog).toBeFocused();
  await dialog.getByText('Analítica', { exact: true }).click();
  await dialog.getByRole('button', { name: 'Guardar selección' }).click();

  await expect(page.getByRole('button', { name: 'Cambiar preferencias de privacidad' })).toBeVisible();
  const saved = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), consentStorageKey);
  expect(saved).toMatchObject({ version: 1, analytics: true, advertising: false });
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('haode-campaign-attribution-v1')))).toMatchObject({
    source: 'haode_web',
  });
  const update = await page.evaluate(() => window.dataLayer
    .map((entry) => Array.from(entry))
    .findLast((entry) => entry[0] === 'consent' && entry[1] === 'update'));
  expect(update[2]).toMatchObject({
    analytics_storage: 'granted',
    ad_storage: 'denied',
    ad_user_data: 'denied',
  });

  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(banner).toBeHidden();
  await expect(page.getByRole('button', { name: 'Cambiar preferencias de privacidad' })).toBeVisible();
  const reloadDefault = await page.evaluate(() => window.dataLayer
    .map((entry) => Array.from(entry))
    .find((entry) => entry[0] === 'consent' && entry[1] === 'default'));
  expect(reloadDefault[2].analytics_storage).toBe('granted');
  expect(reloadDefault[2].ad_storage).toBe('denied');
});

test('analytics strips sensitive query values and does not persist them', async ({ page }) => {
  await page.addInitScript((key) => localStorage.removeItem(key), consentStorageKey);
  await page.goto(`${baseURL}/?utm_source=cliente%40example.com&utm_campaign=5512345678&phone=5512345678`, {
    waitUntil: 'domcontentloaded',
  });

  const commands = await page.evaluate(() => window.dataLayer.map((entry) => Array.from(entry)));
  const config = commands.find((entry) => entry[0] === 'config');
  expect(config[2].page_location).toBe(`${baseURL}/`);
  expect(JSON.stringify(commands)).not.toContain('cliente@example.com');
  expect(JSON.stringify(commands)).not.toContain('5512345678');
  expect(await page.evaluate(() => localStorage.getItem('haode-campaign-attribution-v1'))).toBeNull();
});

test('privacy controls fit a 320px viewport without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.addInitScript((key) => localStorage.removeItem(key), consentStorageKey);
  await page.goto(`${baseURL}/app/`, { waitUntil: 'domcontentloaded' });

  await expect(page.getByRole('region', { name: 'Tu privacidad en HAODE' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.getByRole('button', { name: 'Configurar' }).click();
  await expect(page.getByRole('dialog', { name: 'Configura tu privacidad' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test('App cart never exposes entered customer data in the tracked WhatsApp href', async ({ page }) => {
  await page.addInitScript((key) => {
    localStorage.setItem(key, JSON.stringify({
      version: 1,
      analytics: false,
      advertising: false,
      updatedAt: new Date().toISOString(),
    }));
  }, consentStorageKey);
  await page.goto(`${baseURL}/app/`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-add-product]');
  await page.locator('[data-add-product]').first().click();
  await page.locator('[data-customer-name]').fill('Cliente Privado');
  await page.locator('[data-customer-phone]').fill('5512345678');
  await page.locator('[data-customer-city]').fill('Ciudad de México');

  const href = await page.locator('[data-whatsapp-link]').getAttribute('href');
  expect(href).toBe('https://wa.me/525645866014');
  expect(href).not.toContain('Cliente%20Privado');
  expect(href).not.toContain('5512345678');
});
