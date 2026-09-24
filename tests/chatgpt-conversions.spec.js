const { test, expect } = require('@playwright/test');
const BASE = (process.env.BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const campaigns = require('../data/marketing/chatgpt-launch-pack.json').campaigns;

test.beforeEach(async ({ page }) => {
  await page.route('https://erp.haode.com.mx/**', route => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
  await page.route(/https:\/\/(?:www\.)?google(?:tagmanager|analytics)\.com\//, route => route.abort());
  await page.route('https://wa.me/**', route => route.abort());
});
async function ready(page) { await page.waitForFunction(() => !!window.HaodeConversions); }
async function consent(page) { await page.locator('[data-haode-consent-all]').click(); }

test('product views, consent, withdrawal, duplicate clicks and Purchase rejection', async ({ page }) => {
  const requests = [];
  page.on('request', req => { if (/openai\.com|chatgpt\.com/.test(req.url())) requests.push(req.url()); });
  await page.goto(`${BASE}/producto/mica-hd/?utm_source=chatgpt&utm_medium=paid&utm_campaign=pilot&utm_content=ad_v1&utm_term=hydrogel`);
  await ready(page);
  await expect.poll(() => page.evaluate(() => window.HaodeConversionProductId)).toBe('mica-hd');
  expect(await page.evaluate(() => window.HaodeConversions.getEvents())).toEqual([]);
  await consent(page);
  await expect.poll(() => page.evaluate(() => window.HaodeConversions.getEvents().filter(x => x.event === 'ViewProduct').length)).toBe(1);
  await page.evaluate(() => {
    document.addEventListener('click', e => { if (e.target.closest('a[href*="wa.me"]')) e.preventDefault(); }, true);
    const link = document.querySelector('[data-detail-whatsapp]');
    link.click(); link.click();
    window.HaodeConversions.viewProduct('mica-hd');
  });
  const events = await page.evaluate(() => window.HaodeConversions.getEvents());
  expect(events.filter(x => x.event === 'ViewProduct')).toHaveLength(1);
  expect(events.filter(x => x.event === 'WhatsAppClick')).toHaveLength(1);
  expect(events[1]).toMatchObject({ utm_source: 'chatgpt', utm_campaign: 'pilot', utm_term: 'hydrogel', product_id: 'mica-hd' });
  expect(JSON.stringify(events)).not.toMatch(/wa\.me|quiero|phone|email/);
  expect(await page.evaluate(() => window.HaodeConversions.track('Purchase', { paid: true }).reason)).toBe('purchase_not_configured');
  await page.evaluate(() => window.HaodePrivacy.updateConsent({ analytics: false, advertising: false }));
  expect(await page.evaluate(() => window.HaodeConversions.getEvents())).toEqual([]);
  expect(await page.evaluate(() => sessionStorage.getItem('haode-conversions-v1'))).toBeNull();
  expect(requests).toEqual([]);
});

test('attribution survives same-origin navigation and app renders emit one view', async ({ page }) => {
  await page.goto(`${BASE}/micas-hidrogel-mayoreo-mexico/?utm_source=chatgpt&utm_campaign=hydrogel&utm_term=corte`);
  await ready(page); await consent(page);
  await page.goto(`${BASE}/app/#producto/x200t-cortadora-micas`);
  await ready(page);
  await expect(page.getByRole('heading', { name: /X200T/i })).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.HaodeConversions.getEvents().filter(e => e.event === 'ViewProduct').length)).toBe(1);
  const event = await page.evaluate(() => window.HaodeConversions.getEvents()[0]);
  expect(event).toMatchObject({ product_id: 'x200t-cortadora-micas', utm_campaign: 'hydrogel', utm_term: 'corte' });
});

for (const outcome of ['success', 'empty', 'failure']) {
  test(`Lead is emitted only for confirmed ERP registration: ${outcome}`, async ({ page }) => {
    const posts = [];
    await page.route('https://erp.haode.com.mx/api/public/web-orders', route => {
      posts.push(route.request().postDataJSON());
      return route.fulfill({ status: outcome === 'failure' ? 503 : 200, contentType: 'application/json', body: JSON.stringify(outcome === 'success' ? { order_number: 'TEST-ONLY-NOT-REAL' } : {}) });
    });
    await page.goto(`${BASE}/app/?utm_source=chatgpt&utm_campaign=lead`);
    await ready(page); await consent(page);
    await page.locator('.product-card').filter({ has: page.locator('.price-lines') }).first().getByRole('button', { name: 'Agregar' }).click();
    await page.locator('[data-customer-name]').fill('Synthetic QA');
    await page.locator('[data-customer-phone]').fill('5512345678');
    await page.locator('[data-customer-city]').fill('CDMX');
    await page.evaluate(() => { window.open = () => ({ location: { href: '' }, close() {} }); });
    await page.locator('[data-whatsapp-link]').click();
    await expect.poll(() => posts.length).toBe(1);
    await expect.poll(() => page.locator('[data-whatsapp-link]').getAttribute('aria-busy')).not.toBe('true');
    await expect.poll(() => page.evaluate(() => window.HaodeConversions.getEvents().filter(e => e.event === 'Lead').length)).toBe(outcome === 'success' ? 1 : 0);
    const events = await page.evaluate(() => window.HaodeConversions.getEvents());
    expect(JSON.stringify(events)).not.toMatch(/Synthetic|5512345678|TEST-ONLY-NOT-REAL/);
    expect(events.filter(e => e.event === 'Purchase')).toHaveLength(0);
    if (outcome === 'success') {
      const requestId = posts[0].client_request_id;
      expect(await page.evaluate(id => window.HaodeConversions.track('Lead', { request_id: id, lead_registered: true }).reason, requestId)).toBe('duplicate');
    }
  });
}

for (const width of [1280, 390]) {
  for (const campaign of campaigns) {
    test(`${campaign.id} landing ${width}px keeps canonical, CTA, media and layout`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      const target = new URL(campaign.url);
      const response = await page.goto(`${BASE}${target.pathname}${target.search}`);
      expect(response.status()).toBe(200);
      await ready(page);
      await page.locator('[data-haode-consent-necessary]').click();
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', campaign.landing_page);
      const whatsapp = page.locator('a[href*="wa.me/"]').first();
      await expect(whatsapp).toHaveAttribute('href', /https:\/\/wa\.me\/\d+/);
      const badImages = await page.evaluate(async () => {
        for (const img of document.images) { img.loading = 'eager'; try { await img.decode(); } catch {} }
        return [...document.images].filter(img => !img.naturalWidth).map(img => img.src);
      });
      expect(badImages).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
      if (campaign.id !== 'pantallas_tecnicos') {
        const layout = await page.evaluate(() => {
          const box = selector => document.querySelector(selector).getBoundingClientRect();
          const image = box('.reference-conversion-panel > img');
          const copy = box('.reference-conversion-panel > div');
          const logo = box('[data-ui-id="header-brand-image"], .brand-logo');
          return { overlap: image.left < copy.right && image.right > copy.left && image.top < copy.bottom && image.bottom > copy.top, logoWidth: logo.width };
        });
        expect(layout.overlap).toBe(false);
        expect(layout.logoWidth).toBe(width === 390 ? 128 : 184);
      }
      await page.screenshot({ path: testInfo.outputPath(`${campaign.id}-${width}.png`), fullPage: true });
    });
  }
}

test('leaving App detail clears product context before a later consent grant', async ({ page }) => {
  await page.goto(`${BASE}/app/#producto/mica-hd`);
  await ready(page);
  await expect.poll(() => page.evaluate(() => window.HaodeConversionProductId)).toBe('mica-hd');
  await page.evaluate(() => { location.hash = '#contacto'; });
  await expect.poll(() => page.evaluate(() => window.HaodeConversionProductId)).toBeNull();
  await consent(page);
  expect(await page.evaluate(() => window.HaodeConversions.getEvents().filter(e => e.event === 'ViewProduct'))).toEqual([]);
});

test('related product WhatsApp uses clicked card id rather than current detail', async ({ page }) => {
  await page.goto(`${BASE}/producto/mica-hd/`);
  await ready(page); await consent(page);
  const card = page.locator('[data-related-products] [data-product-whatsapp]').first();
  const id = await card.getAttribute('data-product-whatsapp');
  expect(id).not.toBe('mica-hd');
  await card.evaluate(link => { link.addEventListener('click', e => e.preventDefault()); link.click(); });
  expect(await page.evaluate(() => window.HaodeConversions.getEvents().find(e => e.event === 'WhatsAppClick').product_id)).toBe(id);
});

for (const revoke of [false, true]) {
  test(`late conversion module handles successful Lead with revoke=${revoke}`, async ({ page }) => {
    let held;
    await page.route('**/conversion-tracking.js*', route => { held = route; });
    await page.route('https://erp.haode.com.mx/api/public/web-orders', route => route.fulfill({ status: 201, json: { order_number: 'SYNTHETIC-ONLY' } }));
    await page.goto(`${BASE}/app/`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => !!window.HaodeConversionBridge);
    await consent(page);
    await page.locator('.product-card').filter({ has: page.locator('.price-lines') }).first().getByRole('button', { name: 'Agregar' }).click();
    await page.locator('[data-customer-name]').fill('Synthetic QA');
    await page.locator('[data-customer-phone]').fill('5512345678');
    await page.locator('[data-customer-city]').fill('CDMX');
    await page.evaluate(() => {
      const bridge = window.HaodeConversionBridge;
      window.HaodeConversionBridge = { recordLead(id) { bridge.recordLead(id); window.__testLeadRecorded = true; } };
      window.open = () => null;
    });
    await page.locator('[data-whatsapp-link]').click();
    await page.waitForFunction(() => window.__testLeadRecorded === true);
    expect(await page.evaluate(() => !!window.HaodeConversions)).toBe(false);
    if (revoke) {
      await page.evaluate(() => {
        window.HaodePrivacy.updateConsent({ analytics: false, advertising: false });
        window.HaodePrivacy.updateConsent({ analytics: true, advertising: true });
      });
    }
    await expect.poll(() => !!held).toBe(true);
    await held.continue();
    await ready(page);
    await expect.poll(() => page.evaluate(() => window.HaodeConversions.getEvents().filter(e => e.event === 'Lead').length)).toBe(revoke ? 0 : 1);
  });
}

for (const mode of ['accepted', 'denied', 'revoked']) {
  test(`early WhatsApp click while module loads: ${mode}`, async ({ page }) => {
    let held;
    await page.route('**/conversion-tracking.js*', route => { held = route; });
    await page.goto(`${BASE}/producto/mica-hd/?utm_source=chatgpt&utm_campaign=early`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => !!window.HaodeConversionBridge && window.HaodeConversionProductId === 'mica-hd');
    if (mode !== 'denied') await consent(page);
    await page.locator('[data-detail-whatsapp]').evaluate(link => { link.addEventListener('click', event => event.preventDefault()); link.click(); link.click(); });
    if (mode !== 'accepted') {
      await page.evaluate(() => {
        window.HaodePrivacy.updateConsent({ analytics: false, advertising: false });
        window.HaodePrivacy.updateConsent({ analytics: true, advertising: true });
      });
    }
    expect(await page.evaluate(() => !!window.HaodeConversions)).toBe(false);
    await expect.poll(() => !!held).toBe(true);
    await held.continue();
    await ready(page);
    await expect.poll(() => page.evaluate(() => window.HaodeConversions.getEvents().filter(e => e.event === 'WhatsAppClick').length)).toBe(mode === 'accepted' ? 1 : 0);
    if (mode === 'accepted') expect(await page.evaluate(() => window.HaodeConversions.getEvents().find(e => e.event === 'WhatsAppClick'))).toMatchObject({ product_id: 'mica-hd', utm_source: 'chatgpt', utm_campaign: 'early' });
  });
}
