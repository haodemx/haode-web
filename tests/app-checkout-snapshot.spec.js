const { test, expect } = require('@playwright/test');
const BASE = (process.env.BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const original = { name: 'QA original client', phone: '5512345678', city: 'QA original city', comment: 'QA original comment' };
const changed = { name: 'QA changed client', phone: '5598765432', city: 'QA changed city', comment: 'QA changed comment' };

async function ready(page, mode) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.origin === new URL(BASE).origin) return route.continue();
    if (url.origin === 'https://erp.haode.com.mx') return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    return route.abort();
  });
  await page.goto(`${BASE}/app/#lista`, { waitUntil: 'domcontentloaded' });
  await page.locator('[data-haode-consent-necessary]').click();
  await page.locator('.product-card').filter({ has: page.locator('.price-lines') }).first().getByRole('button', { name: 'Agregar', exact: true }).click();
  for (const [field, value] of Object.entries(original)) await page.locator(`[data-customer-${field}]`).fill(value);
  await page.evaluate(mode => {
    const nativeFetch = window.fetch.bind(window);
    window.snapshotAudit = { requests: [], urls: [] };
    window.open = url => { window.snapshotAudit.urls.push(url); return null; };
    window.fetch = (url, options = {}) => {
      if (String(url) !== 'https://erp.haode.com.mx/api/public/web-orders' || options.method !== 'POST') return nativeFetch(url, options);
      const audit = window.snapshotAudit;
      audit.requests.push({ payload: JSON.parse(options.body), key: options.headers['Idempotency-Key'] });
      const response = { ok: true, replayed: audit.requests.length > 1, order_number: 'WEB-QA-SNAPSHOT' };
      if (mode === 'stalled-request') return new Promise(resolve => { audit.finish = () => resolve(new Response(JSON.stringify(response), { status: 200 })); });
      if (mode === 'stalled-body') return Promise.resolve({ ok: true, json: () => new Promise(resolve => { audit.finish = () => resolve(response); }) });
      if (mode === 'network-error') return Promise.reject(new Error('QA response lost; server result unknown'));
      if (mode === 'http-error') return Promise.resolve(new Response('{}', { status: 503 }));
      return Promise.resolve(new Response(JSON.stringify(response), { status: 200 }));
    };
  }, mode);
}

for (const mode of ['stalled-request', 'stalled-body']) {
  for (const field of Object.keys(original)) {
    test(`${mode}: edited ${field} preserves the submitted WhatsApp/ERP snapshot`, async ({ page }) => {
      await ready(page, mode);
      await page.clock.install();
      await page.locator('[data-whatsapp-link]').click();
      await page.clock.fastForward(15001);
      await page.locator(`[data-customer-${field}]`).fill(changed[field]);
      await page.locator('[data-whatsapp-link]').click();
      const pending = await page.evaluate(() => window.snapshotAudit);
      expect(pending.urls).toHaveLength(2);
      expect(pending.requests).toHaveLength(1);
      expect(pending.requests[0].payload).toMatchObject({
        customer_name: original.name, whatsapp: original.phone, phone: original.phone,
        message: `Ciudad: ${original.city} | ${original.comment}`,
      });
      expect(pending.urls[1]).toBe(pending.urls[0]);
      const message = new URL(pending.urls[1]).searchParams.get('text');
      expect(message).toContain(original[field]);
      expect(message).not.toContain(changed[field]);
      const notice = page.locator('[data-checkout-status]');
      await expect(notice).toBeVisible();
      await expect(notice).toContainText('cambios no se han enviado');
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
      await page.evaluate(() => window.snapshotAudit.finish());
      await expect(notice).toContainText('Registro confirmado');
      await page.locator('[data-whatsapp-link]').click();
      const settled = await page.evaluate(() => window.snapshotAudit);
      expect(settled.requests).toEqual(pending.requests);
      expect(settled.urls).toEqual([pending.urls[0], pending.urls[0], pending.urls[0]]);
      expect(settled.requests[0].key).toBe(settled.requests[0].payload.client_request_id);
    });
  }
}

for (const mode of ['success', 'network-error', 'http-error']) {
  test(`${mode}: same request never posts again or changes the submitted snapshot`, async ({ page }) => {
    await ready(page, mode);
    await page.locator('[data-whatsapp-link]').click();
    await page.locator('[data-customer-phone]').fill(changed.phone);
    await page.locator('[data-whatsapp-link]').click();
    const audit = await page.evaluate(() => window.snapshotAudit);
    expect(audit.requests).toHaveLength(1);
    expect(audit.requests[0].payload.phone).toBe(original.phone);
    expect(audit.urls).toHaveLength(2);
    expect(audit.urls[1]).toBe(audit.urls[0]);
    await expect(page.locator('[data-checkout-status]')).toContainText('cambios no se han enviado');
    if (mode !== 'success') await expect(page.locator('[data-checkout-status]')).toContainText('Sin confirmación');
  });
}
