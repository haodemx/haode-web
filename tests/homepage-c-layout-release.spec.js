const { test, expect } = require('@playwright/test');

const BASE_URL = (process.env.BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const CONSENT_KEY = 'haode-privacy-consent-v1';

async function prepare(page) {
  await page.route('https://www.googletagmanager.com/**', (route) => route.fulfill({ status: 200, body: '' }));
  await page.route('https://www.google-analytics.com/**', (route) => route.fulfill({ status: 204, body: '' }));
  await page.route('https://erp.haode.com.mx/**', (route) => route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }));
}

for (const viewport of [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile-390', width: 390, height: 844 },
]) {
  test(`C-layout renders without overflow or console errors on ${viewport.name}`, async ({ page }) => {
    await prepare(page);
    await page.addInitScript((key) => {
      localStorage.setItem(key, JSON.stringify({ version: 1, analytics: false, advertising: false }));
    }, CONSENT_KEY);
    await page.setViewportSize(viewport);
    const errors = [];
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('pageerror', (error) => errors.push(error.message));
    const response = await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    expect(response?.status()).toBe(200);
    await expect(page.locator('[data-home-c-section="hero"]')).toBeVisible();
    await expect(page.locator('.c-category-rail a')).toHaveCount(9);
    const audit = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      order: Array.from(document.querySelectorAll('[data-home-c-section]')).map((node) => node.dataset.homeCSection),
      brokenImages: Array.from(document.images).filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.currentSrc || image.src),
      duplicateIds: [...document.querySelectorAll('[id]')].map((node) => node.id).filter((id, index, ids) => ids.indexOf(id) !== index),
      headings: document.querySelectorAll('h1').length,
      unnamedButtons: Array.from(document.querySelectorAll('button')).filter((button) => !(button.getAttribute('aria-label') || button.textContent.trim())).length,
      imagesWithoutAlt: Array.from(document.images).filter((image) => !image.hasAttribute('alt')).length,
    }));
    expect(audit.overflow).toBeLessThanOrEqual(1);
    expect(audit.order.slice(0, 5)).toEqual(['hero', 'service-strip', 'category-finder', 'feature-blocks', 'featured-products']);
    expect(audit.brokenImages).toEqual([]);
    expect(audit.duplicateIds).toEqual([]);
    expect(audit.headings).toBe(1);
    expect(audit.unnamedButtons).toBe(0);
    expect(audit.imagesWithoutAlt).toBe(0);
    expect(errors).toEqual([]);
  });
}

test('C-layout routes, Schema, MICA table and 404 behavior are valid', async ({ page, request }) => {
  await prepare(page);
  const routes = [
    '/categoria/iphone-incell/', '/categoria/iphone-oled/', '/categoria/oled-diagnostica/',
    '/categoria/samsung-incell/', '/categoria/samsung-oled/', '/categoria/samsung-tipo-original/',
    '/categoria/samsung-plegables/', '/micas-hidrogel-mayoreo-mexico/', '/productos-ai/'
  ];
  for (const route of routes) expect((await request.get(`${BASE_URL}${route}`)).status(), route).toBeLessThan(400);
  expect((await request.get(`${BASE_URL}/ruta-que-no-existe-qa`)).status()).toBe(404);

  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
  const schemas = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(schemas.length).toBeGreaterThan(0);
  for (const schema of schemas) expect(() => JSON.parse(schema)).not.toThrow();

  const micaSource = await (await request.get(`${BASE_URL}/micas.html`)).text();
  const micaTable = micaSource.match(/<table class="detail-price-table" aria-label="Precios de MICA HD">([\s\S]*?)<\/table>/)?.[1] || '';
  expect(micaTable).toContain('<th scope="row">Menudeo</th><td>$350 MXN</td>');
  expect(micaTable).toContain('<th scope="row">Mayoreo</th><td>$300 MXN</td>');
  expect(micaTable).toContain('<th scope="row">Caja</th><td>$275 MXN</td>');
  expect(micaTable).toContain('<th scope="row">⭐ VIP</th><td>$250 MXN</td>');
});

test('cart emits the exact 0→1→2→1→0 ecommerce delta sequence', async ({ page }) => {
  await prepare(page);
  await page.addInitScript((key) => {
    localStorage.setItem(key, JSON.stringify({ version: 1, analytics: true, advertising: false }));
  }, CONSENT_KEY);
  await page.goto(`${BASE_URL}/app/#producto/iphone-incell-14`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-add-product]').first()).toBeVisible({ timeout: 15000 });
  await page.locator('[data-add-product]').first().click();
  await expect(page.locator('[data-cart-count]').first()).toHaveText('1');
  await page.locator('[data-increase]').first().click();
  await expect(page.locator('[data-cart-count]').first()).toHaveText('2');
  await page.locator('[data-decrease]').first().click();
  await expect(page.locator('[data-cart-count]').first()).toHaveText('1');
  await page.locator('[data-remove]').first().click();
  await expect(page.locator('[data-cart-count]').first()).toHaveText('0');

  const mutations = await page.evaluate(() => (window.dataLayer || [])
    .map((entry) => Array.from(entry))
    .filter((entry) => ['add_to_cart', 'remove_from_cart'].includes(entry[1]))
    .map((entry) => ({ name: entry[1], quantity: entry[2].items[0].quantity, value: entry[2].value })));
  expect(mutations).toHaveLength(4);
  expect(mutations.map(({ name, quantity }) => [name, quantity])).toEqual([
    ['add_to_cart', 1], ['add_to_cart', 1], ['remove_from_cart', 1], ['remove_from_cart', 1]
  ]);
  expect(mutations.every(({ value }) => Number(value) > 0)).toBe(true);
});

test('attribution and contact_area preserve explicit custom classifications', async ({ browser }) => {
  const cases = [
    { name: 'google', referer: 'https://www.google.com/search?q=haode', expected: ['google', 'organic_search'] },
    { name: 'bing', referer: 'https://www.bing.com/search?q=haode', expected: ['bing', 'organic_search'] },
    { name: 'chatgpt', referer: 'https://chatgpt.com/', expected: ['chatgpt', 'ai_referral'] },
    { name: 'social', referer: 'https://www.instagram.com/', expected: ['instagram', 'organic_social'] },
    { name: 'direct', referer: undefined, expected: ['direct', 'none'] },
  ];
  for (const item of cases) {
    const context = await browser.newContext();
    const page = await context.newPage();
    await prepare(page);
    await page.addInitScript((key) => localStorage.setItem(key, JSON.stringify({ version: 1, analytics: true, advertising: false })), CONSENT_KEY);
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', referer: item.referer });
    const attribution = await page.evaluate(() => window.HaodeCampaign.capture());
    expect([attribution.source, attribution.medium], item.name).toEqual(item.expected);
    await context.close();
  }

  const context = await browser.newContext();
  const page = await context.newPage();
  await prepare(page);
  await page.goto(`${BASE_URL}/?utm_source=boletin&utm_medium=email&utm_campaign=septiembre`, { waitUntil: 'domcontentloaded' });
  const classifications = await page.evaluate(() => ({
    utm: window.HaodeCampaign.capture(),
    header: window.HaodeCampaign.contactArea(document.querySelector('[data-contact-area="header"]')),
    hero: window.HaodeCampaign.contactArea(document.querySelector('[data-contact-area="home_hero"]')),
    floating: window.HaodeCampaign.contactArea(document.querySelector('[data-contact-area="floating"]')),
  }));
  expect(classifications.utm).toMatchObject({ source: 'boletin', medium: 'email', campaign: 'septiembre' });
  expect([classifications.header, classifications.hero, classifications.floating]).toEqual(['header', 'home_hero', 'floating']);
  await page.goto(`${BASE_URL}/producto/iphone-incell-14/`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof window.HaodeCampaign?.contactArea === 'function');
  expect(await page.evaluate(() => window.HaodeCampaign.contactArea(document.querySelector('[data-product-whatsapp], [data-detail-whatsapp]')))).toBe('product');
  await page.goto(`${BASE_URL}/app/`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof window.HaodeCampaign?.contactArea === 'function');
  expect(await page.evaluate(() => window.HaodeCampaign.contactArea(document.querySelector('[data-whatsapp-link]')))).toBe('cart');
  await context.close();
});
