const { test, expect } = require('@playwright/test');
const BASE = (process.env.BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const ORIGIN = new URL(BASE).origin;

for (const [label, storedLanding, expectedPath] of [
  ['relative landing', '/productos/?email=qa%40example.invalid#private', '/productos/'],
  ['same-origin landing', `${ORIGIN}/catalogo-modelos/?phone=QA_ONLY#private`, '/catalogo-modelos/'],
  ['foreign landing', 'https://foreign.invalid/private?phone=QA_ONLY#private', '/app/'],
  ['malformed landing', 'http://[', '/app/'],
]) {
  test(`combined compact search and frozen checkout preserve ${label}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.route('**/*', route => {
      const url = new URL(route.request().url());
      if (url.origin === ORIGIN) return route.continue();
      if (url.origin === 'https://erp.haode.com.mx') return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
      return route.abort();
    });
    await page.addInitScript(landingPage => {
      localStorage.setItem('haode-privacy-consent-v1', JSON.stringify({ version: 1, analytics: true, advertising: false }));
      localStorage.setItem('haode-campaign-attribution-v1', JSON.stringify({ source: 'google', medium: 'organic_search', landingPage, capturedAt: Date.now() }));
      const nativeFetch = window.fetch.bind(window);
      window.compositionAudit = { requests: [], urls: [] };
      window.open = url => { window.compositionAudit.urls.push(url); return null; };
      window.fetch = (url, options = {}) => {
        if (String(url) !== 'https://erp.haode.com.mx/api/public/web-orders' || options.method !== 'POST') return nativeFetch(url, options);
        const audit = window.compositionAudit;
        audit.requests.push({ payload: JSON.parse(options.body), key: options.headers['Idempotency-Key'] });
        return new Promise(resolve => { audit.finish = () => resolve(new Response(JSON.stringify({ order_number: 'WEB-COMPOSITION-QA' }), { status: 201 })); });
      };
    }, storedLanding);
    await page.goto(`${BASE}/app/#lista`, { waitUntil: 'domcontentloaded' });
    await page.locator('[data-search-products]').fill('s205g');
    await expect(page.locator('.product-card')).toHaveCount(2);
    await page.locator('.product-card').filter({ has: page.locator('.price-lines') }).first().getByRole('button', { name: 'Agregar', exact: true }).click();
    await page.locator('[data-customer-name]').fill('QA combined client');
    await page.locator('[data-customer-phone]').fill('5512345678');
    await page.locator('[data-customer-city]').fill('QA original city');
    await page.clock.install();
    await page.locator('[data-whatsapp-link]').click();
    await page.clock.fastForward(15001);
    await page.locator('[data-customer-city]').fill('QA changed city');
    await page.locator('[data-whatsapp-link]').click();
    const pending = await page.evaluate(() => window.compositionAudit);
    expect(pending.requests).toHaveLength(1);
    expect(pending.urls).toHaveLength(2);
    expect(pending.urls[1]).toBe(pending.urls[0]);
    const { payload, key } = pending.requests[0];
    expect(key).toBe(payload.client_request_id);
    expect(payload.landing_page).toBe(`${ORIGIN}${expectedPath}`);
    expect(payload.landing_page).not.toMatch(/[?#]/);
    expect(payload.landing_page).not.toContain('foreign.invalid');
    expect(payload.utm_source).toBe('google');
    expect(payload.utm_medium).toBe('organic_search');
    expect(payload.message).toContain('QA original city');
    const text = new URL(pending.urls[1]).searchParams.get('text');
    expect(text).toContain('QA original city');
    expect(text).not.toContain('QA changed city');
    await expect(page.locator('[data-checkout-status]')).toContainText('cambios no se han enviado');
    await page.evaluate(() => window.compositionAudit.finish());
    await expect(page.locator('[data-checkout-status]')).toContainText('Registro confirmado');
    await page.locator('[data-whatsapp-link]').click();
    const settled = await page.evaluate(() => window.compositionAudit);
    expect(settled.requests).toEqual(pending.requests);
    expect(settled.urls).toEqual([pending.urls[0], pending.urls[0], pending.urls[0]]);
  });
}
