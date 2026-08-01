const { test, expect } = require('@playwright/test');

const SERVER_URL = (process.env.BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const ATTACK_TEXT = 'Pantalla <img src=x onerror="document.body.dataset.auditXss=\'1\'">';
const ATTACK_IMAGE = 'x" onerror="document.body.dataset.auditImageXss=\'1\'';

test('ERP catalog text is rendered as text in the public App', async ({ page }) => {
  await page.route('https://erp.haode.com.mx/api/public/catalog**', (route) => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({
      schema_version: '2.0',
      products: [{
        sku: 'AI-GAFAS-G3',
        slug: 'gafas-ai-g3',
        public_name_es: ATTACK_TEXT,
        category: 'Productos AI',
        quality: 'Profesional',
        model: 'G3',
        description_es: ATTACK_TEXT,
        image_url: ATTACK_IMAGE,
        public_price_mxn: 1700,
        public_price_tiers: [],
        sales_available: true,
        stock_status: 'available',
        stock_label: ATTACK_TEXT,
      }],
    }),
  }));
  await page.route('https://erp.haode.com.mx/public-stock.json**', (route) => route.fulfill({
    contentType: 'application/json',
    body: '[]',
  }));

  await page.goto(`${SERVER_URL}/app/#lista`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('h3', { hasText: 'Pantalla <img src=x' }).first()).toBeVisible();
  await expect(page.locator('img[src="x"]')).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => ({
    textAttack: document.body.dataset.auditXss || null,
    imageAttack: document.body.dataset.auditImageXss || null,
  }))).toEqual({ textAttack: null, imageAttack: null });
});

test('generated category product text is rendered as text', async ({ page }) => {
  await page.route('**/data/products.generated.js**', (route) => route.fulfill({
    contentType: 'application/javascript',
    body: `window.HAODE_PRODUCTS_DATA = ${JSON.stringify([{
      id: 'xss-product',
      category: 'iphone-oled',
      name: ATTACK_TEXT,
      model: 'Modelo seguro',
      sku: 'XSS-TEST',
      description: ATTACK_TEXT,
      quality: ATTACK_TEXT,
      images: [ATTACK_IMAGE],
      prices: [{ quantity: ATTACK_TEXT, price: '$100 MXN' }],
    }])};`,
  }));

  await page.goto(`${SERVER_URL}/categoria/iphone-oled/`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('h3', { hasText: 'Pantalla <img src=x' })).toBeVisible();
  await expect(page.locator('img[src="x"]')).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => ({
    textAttack: document.body.dataset.auditXss || null,
    imageAttack: document.body.dataset.auditImageXss || null,
  }))).toEqual({ textAttack: null, imageAttack: null });
});
