const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

const BASE_URL = (process.env.BASE_URL || 'http://127.0.0.1:4190').replace(/\/$/, '');
const appSource = () => fs.readFileSync(path.join(__dirname, '../app/app.js'), 'utf8');

// Expose the real module only in the intercepted test response, never in production.
const auditAccess = `
window.__cartAudit = {
  addProduct, changeQuantity, removeProduct, trafficAttribution,
  seed(entries, fixtures) {
    if (fixtures) products = fixtures.map(normalizeProduct);
    state.cart = new Map(entries);
    renderCart();
  },
  snapshot() {
    return { cart: [...state.cart], total: cartTotal(), items: ga4CartItems(),
      order: webOrderPayload(), message: new URL(buildWhatsappUrl()).searchParams.get('text') };
  }
};`;

async function boot(page, { consent = true, fallback = false, referrer = '', query = '' } = {}) {
  await page.addInitScript(({ consent, referrer }) => {
    localStorage.setItem('haode-privacy-consent-v1', JSON.stringify({ version: 1, analytics: consent, advertising: false }));
    if (referrer) Object.defineProperty(document, 'referrer', { configurable: true, get: () => referrer });
    window.open = (url) => { window.__openedWhatsapp = String(url); return null; };
  }, { consent, referrer });
  // External boundaries are isolated: no analytics transmission, ERP writes or remote SDKs.
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (url.origin !== new URL(BASE_URL).origin) {
      if (url.pathname === '/api/public/web-orders') {
        return route.fulfill({ status: 201, json: { ok: true, order_number: 'WEB-APP-AUDIT' } });
      }
      return route.fulfill({ status: 200, contentType: url.hostname === 'erp.haode.com.mx' ? 'application/json' : 'application/javascript', body: url.hostname === 'erp.haode.com.mx' ? '[]' : '' });
    }
    if (url.pathname === '/app/app.js') return route.fulfill({ contentType: 'application/javascript', body: appSource() + auditAccess });
    if (fallback && url.pathname === '/campaign-attribution.js') return route.fulfill({ contentType: 'application/javascript', body: '' });
    return route.continue();
  });
  await page.goto(`${BASE_URL}/app/${query}#lista`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-add-product]').first()).toBeVisible();
}

async function events(page, names = ['add_to_cart', 'remove_from_cart']) {
  return page.evaluate((names) => window.dataLayer
    .filter((entry) => entry[0] === 'event' && names.includes(entry[1]))
    .map((entry) => ({ name: entry[1], ...entry[2] })), names);
}

function item(name, quantity, price, value, sku = 'QA-ONE') {
  return { name, currency: 'MXN', value, items: [expect.objectContaining({ item_id: sku, quantity, price })] };
}

function fixture(id = 'audit-one', tiers = [], extra = {}) {
  return { id, sku: id === 'audit-one' ? 'QA-ONE' : 'QA-TWO', nombre: 'Producto de prueba',
    categoria: 'Micas', modelo: 'QA', precioPublico: 100, precioMayoreo: 80,
    imagen: '/assets/products/placeholder.svg', stock: 'consultar inventario', activo: true,
    priceTiers: tiers, ...extra };
}

test('real cart controls emit exact deltas for add, increase, decrease and zero removal', async ({ page }) => {
  await boot(page);
  await page.locator('[data-add-product="iphone-incell-14"]').click();
  const drawer = page.locator('[data-cart-drawer]');
  await drawer.locator('[data-increase="iphone-incell-14"]').click();
  await drawer.locator('[data-decrease="iphone-incell-14"]').click();
  await drawer.locator('[data-decrease="iphone-incell-14"]').click();
  expect(await events(page)).toEqual([
    item('add_to_cart', 1, 205, 205, 'iphone-incell-14'),
    item('add_to_cart', 1, 205, 205, 'iphone-incell-14'),
    item('remove_from_cart', 1, 205, 205, 'iphone-incell-14'),
    item('remove_from_cart', 1, 205, 205, 'iphone-incell-14'),
  ]);
  expect((await page.evaluate(() => window.__cartAudit.snapshot())).cart).toEqual([]);
});

test('full deletion reports every removed unit and no-op removals emit nothing', async ({ page }) => {
  await boot(page);
  await page.evaluate((product) => {
    const api = window.__cartAudit;
    api.seed([['audit-one', 3]], [product]);
    api.removeProduct('audit-one');
    api.removeProduct('audit-one');
    api.changeQuantity('audit-one', -1);
    api.removeProduct('missing');
    api.seed([['audit-one', 0]]);
    api.removeProduct('audit-one');
    api.changeQuantity('audit-one', 0);
  }, fixture());
  expect(await events(page)).toEqual([item('remove_from_cart', 3, 100, 300)]);
});

test('single-product inclusive min/max boundaries price events separately from delta quantity', async ({ page }) => {
  await boot(page);
  const product = fixture('audit-one', [{ code: 'TEST', minQty: 3, maxQty: 4, price: 80, label: 'QA', scope: 'single_product', autoApply: true }]);
  const totals = await page.evaluate((product) => {
    const api = window.__cartAudit;
    api.seed([['audit-one', 2]], [product]);
    const totals = [];
    api.addProduct('audit-one'); totals.push(api.snapshot().total);
    api.changeQuantity('audit-one', 1); totals.push(api.snapshot().total);
    api.changeQuantity('audit-one', 1); totals.push(api.snapshot().total);
    api.changeQuantity('audit-one', -2); totals.push(api.snapshot().total);
    api.changeQuantity('audit-one', -99); totals.push(api.snapshot().total);
    return totals;
  }, product);
  expect(totals).toEqual([240, 320, 500, 240, 0]);
  expect(await events(page)).toEqual([
    item('add_to_cart', 1, 80, 80), item('add_to_cart', 1, 80, 80), item('add_to_cart', 1, 100, 100),
    item('remove_from_cart', 2, 100, 200), item('remove_from_cart', 3, 80, 240),
  ]);
});

for (const operation of ['decrease', 'delete']) {
  test(`mixed-order ${operation} takes its unit price before crossing the minimum`, async ({ page }) => {
    await boot(page);
    const products = [fixture('audit-one', [{ code: 'TEST', minQty: 5, maxQty: 6, price: 70, label: 'QA mix', scope: 'mixed_order', autoApply: true }]), fixture('audit-two')];
    const snapshot = await page.evaluate(({ products, operation }) => {
      const api = window.__cartAudit;
      api.seed([['audit-one', 2], ['audit-two', 3]], products);
      if (operation === 'delete') api.removeProduct('audit-one');
      else api.changeQuantity('audit-one', -1);
      return api.snapshot();
    }, { products, operation });
    expect(await events(page)).toEqual([item('remove_from_cart', operation === 'delete' ? 2 : 1, 70, operation === 'delete' ? 140 : 70)]);
    expect(snapshot.total).toBe(operation === 'delete' ? 300 : 400);
  });
}

test('mixed-order add/max crossing uses the new order size, not whole-cart value difference', async ({ page }) => {
  await boot(page);
  const products = [fixture('audit-one', [{ code: 'TEST', minQty: 5, maxQty: 6, price: 70, label: 'QA mix', scope: 'mixed_order', autoApply: true }]), fixture('audit-two')];
  const totals = await page.evaluate((products) => {
    const api = window.__cartAudit;
    api.seed([['audit-one', 1], ['audit-two', 3]], products);
    api.changeQuantity('audit-one', 1);
    const atMin = api.snapshot().total;
    api.changeQuantity('audit-one', 2);
    const aboveMax = api.snapshot().total;
    api.changeQuantity('audit-one', -1);
    return [atMin, aboveMax, api.snapshot().total];
  }, products);
  expect(totals).toEqual([440, 700, 510]);
  expect(await events(page)).toEqual([item('add_to_cart', 1, 70, 70), item('add_to_cart', 2, 100, 200), item('remove_from_cart', 1, 100, 100)]);
});

test('manual MICA tiers never auto-apply; cart, WhatsApp and ERP keep identical business math', async ({ page }) => {
  await boot(page);
  await page.evaluate(() => window.__cartAudit.seed([['mica-hd', 10], ['iphone-incell-14', 2]]));
  const snapshot = await page.evaluate(() => window.__cartAudit.snapshot());
  expect(snapshot.total).toBe(3910);
  expect(snapshot.order.total).toBe(3910);
  expect(snapshot.order.items.map(({ quantity, unit_price }) => [quantity, unit_price])).toEqual([[10, 350], [2, 205]]);
  expect(snapshot.items.map(({ quantity, price }) => [quantity, price])).toEqual([[10, 350], [2, 205]]);
  expect(snapshot.message).toContain('precio estimado de Menudeo');
  expect(snapshot.message).toContain('Mayoreo / Caja / VIP: confirmar por WhatsApp');
  expect(snapshot.message).toContain('Total estimado: $3,910 MXN');
  await page.goto(`${BASE_URL}/app/#carrito`);
  await expect(page.locator('.cart-pricing-note')).toContainText('Mayoreo, Caja y VIP se confirman con un asesor por WhatsApp');
  await page.locator('[data-open-cart]').first().click();
  await expect(page.locator('.cart-bulk-note')).toContainText('Mayoreo, Caja y VIP se confirman con un asesor por WhatsApp');
});

test('legacy wholesale boundary and diagnostic no-wholesale fallback remain unchanged', async ({ page }) => {
  await boot(page);
  const snapshots = await page.evaluate((products) => {
    const api = window.__cartAudit;
    api.seed([['audit-one', 9]], products);
    api.addProduct('audit-one');
    const wholesale = api.snapshot();
    api.seed([['audit-two', 10]]);
    return [wholesale, api.snapshot()];
  }, [fixture(), fixture('audit-two', [], { categoria: 'Pantallas OLED Diagnóstica', precioMayoreo: 0 })]);
  expect(snapshots.map((snapshot) => snapshot.total)).toEqual([800, 1000]);
  expect(await events(page)).toEqual([item('add_to_cart', 1, 80, 80)]);
});

test('no analytics consent suppresses mutations without blocking the cart', async ({ page }) => {
  await boot(page, { consent: false });
  const snapshot = await page.evaluate((product) => {
    const api = window.__cartAudit;
    api.seed([], [product]); api.addProduct('audit-one'); api.changeQuantity('audit-one', 2); api.removeProduct('audit-one');
    return api.snapshot();
  }, fixture());
  expect(await events(page)).toEqual([]);
  expect(snapshot.cart).toEqual([]);
});

for (const [referrer, source, medium] of [
  ['', 'direct', 'none'], ['https://www.bing.com/search?q=screen', 'bing', 'organic_search'],
  ['https://chatgpt.com/', 'chatgpt', 'ai_referral'], ['https://chat.openai.com/', 'chatgpt', 'ai_referral'],
]) {
  test(`App fallback classifies ${referrer || 'direct'} as ${source}/${medium} without writing GA4 attribution`, async ({ page }) => {
    await boot(page, { fallback: true, referrer });
    const result = await page.evaluate(() => ({ attribution: window.__cartAudit.trafficAttribution(), order: window.__cartAudit.snapshot().order }));
    expect(result.attribution).toMatchObject({ source, medium });
    expect(result.order).toMatchObject({ source: 'haode_web', utm_source: source, utm_medium: medium });
    const overrides = await page.evaluate(() => window.dataLayer.filter((entry) => ['set', 'config'].includes(entry[0]))
      .flatMap((entry) => [entry[1], entry[2]]).filter((value) => value && typeof value === 'object')
      .flatMap((value) => Object.keys(value)).filter((key) => ['source', 'medium', 'campaign_source', 'campaign_medium'].includes(key)));
    expect(overrides).toEqual([]);
  });
}

test('checkout keeps customer details out of DOM URLs and native GA4 attribution fields', async ({ page }) => {
  await boot(page, { query: '?utm_source=Instagram&utm_medium=social&utm_campaign=audit' });
  await page.locator('[data-add-product="iphone-incell-14"]').click();
  await page.locator('[data-customer-name]').fill('Cliente QA');
  await page.locator('[data-customer-phone]').fill('5512345678');
  await page.locator('[data-customer-city]').fill('CDMX');
  await expect(page.locator('[data-whatsapp-link]')).toHaveAttribute('href', 'https://wa.me/523326684296');
  await page.locator('[data-whatsapp-link]').click();
  await expect.poll(async () => (await events(page, ['generate_lead'])).length).toBe(1);
  const checkoutEvents = await events(page, ['begin_checkout', 'generate_lead']);
  for (const payload of checkoutEvents) {
    expect(payload.value).toBe(205);
    for (const key of ['source', 'medium', 'campaign', 'campaign_source', 'campaign_medium']) expect(payload).not.toHaveProperty(key);
    expect(JSON.stringify(payload)).not.toContain('5512345678');
  }
  const order = await page.evaluate(() => window.__cartAudit.snapshot().order);
  expect(order).toMatchObject({ source: 'haode_web', utm_source: 'instagram', utm_medium: 'social', total: 205 });
});

test('static MICA HD and MATTE contain four intact table rows', async ({ request }) => {
  const source = await (await request.get(`${BASE_URL}/micas.html`)).text();
  for (const label of ['MICA HD', 'MICA MATTE']) {
    const table = source.match(new RegExp(`<table class="detail-price-table" aria-label="Precios de ${label}">([\\s\\S]*?)<\\/table>`))?.[1] || '';
    expect((table.match(/<tr>/g) || [])).toHaveLength(4);
    expect(table).toContain('<th scope="row">Menudeo</th><td>$350 MXN</td>');
    expect(table).toContain('<th scope="row">Mayoreo</th><td>$300 MXN</td>');
    expect(table).toContain('<th scope="row">Caja</th><td>$275 MXN</td>');
    expect(table).toContain('<th scope="row">⭐ VIP</th><td>$250 MXN</td>');
  }
});
