const { test, expect } = require('@playwright/test');

const BASE_URL = (process.env.BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const LANDING = '/micas-hidrogel-mayoreo-mexico/';

async function isolate(page, analytics = true) {
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.origin === new URL(BASE_URL).origin && route.request().method() === 'GET') return route.continue();
    return route.fulfill({ status: 200, contentType: 'application/javascript', body: '' });
  });
  await page.addInitScript(analyticsConsent => {
    localStorage.setItem('haode-privacy-consent-v1', JSON.stringify({version: 1, analytics: analyticsConsent, advertising: false}));
    window.open = () => null;
  }, analytics);
}

function events(page) {
  return page.evaluate(() => Array.from(window.dataLayer || []).map(e => Array.from(e)).filter(e => e[0] === 'event'));
}

for (const [source, medium] of [['instagram', 'organic_social'], ['chatgpt', 'ai_referral'], ['google', 'organic_search']]) {
  test(`hydrogel landing preserves ${source} through App and acknowledged quotation`, async ({ page }) => {
    await isolate(page);
    let submitted;
    await page.route('https://erp.haode.com.mx/api/public/web-orders', async route => {
      submitted = route.request().postDataJSON();
      return route.fulfill({status: 201, contentType: 'application/json', body: JSON.stringify({order_number: 'QA-HYDROGEL-ISOLATED', replayed: false})});
    });
    await page.goto(`${BASE_URL}${LANDING}?utm_source=${source}&utm_medium=${medium}&utm_campaign=hydrogel_trial`);
    await expect(page.getByRole('heading', {name: 'Compara las cuatro opciones de hidrogel'})).toBeVisible();
    await page.getByRole('link', {name: 'Preparar lista en App', exact: true}).click();
    await expect(page).toHaveURL(/\/app\/#categoria\/Micas$/);
    await page.goto(`${BASE_URL}/app/#producto/mica-hd`);
    await page.locator('[data-add-product]').first().click();
    await page.locator('[data-customer-name]').fill('Prueba aislada');
    await page.locator('[data-customer-phone]').fill('5512345678');
    await page.locator('[data-customer-city]').fill('CDMX');
    expect((await events(page)).filter(e => e[1] === 'generate_lead')).toHaveLength(0);
    await page.locator('[data-whatsapp-link]').click();
    await expect.poll(async () => (await events(page)).filter(e => e[1] === 'generate_lead').length).toBe(1);
    expect(submitted).toMatchObject({utm_source: source, utm_medium: medium, utm_campaign: 'hydrogel_trial', landing_page: `${new URL(BASE_URL).origin}${LANDING}`});
    expect(submitted.items[0]).toMatchObject({quantity: 1, quantity_unit: 'box_50', unit_price: 375});
    const lead = (await events(page)).find(e => e[1] === 'generate_lead')[2];
    expect(lead).toMatchObject({request_id: submitted.client_request_id, lead_registered: true, attribution_source: source});
    expect(lead.items[0].item_id).toBeTruthy();
    expect(JSON.stringify(lead)).not.toMatch(/5512345678|Prueba aislada|QA-HYDROGEL-ISOLATED/);
    expect((await events(page)).some(e => /purchase|close_convert_lead/i.test(e[1]))).toBe(false);
  });
}

test('hydrogel quotation is usable without analytics consent and emits no tracking events', async ({ page }) => {
  await isolate(page, false);
  await page.route('https://erp.haode.com.mx/api/public/web-orders', route => route.fulfill({status: 201, contentType: 'application/json', body: JSON.stringify({order_number: 'QA-NO-CONSENT'})}));
  await page.goto(`${BASE_URL}${LANDING}?utm_source=instagram`);
  await page.getByRole('link', {name: 'Elegir HD en App', exact: true}).click();
  await page.locator('[data-add-product]').first().click();
  await page.locator('[data-customer-name]').fill('Prueba aislada');
  await page.locator('[data-customer-phone]').fill('5512345678');
  await page.locator('[data-customer-city]').fill('CDMX');
  await page.locator('[data-whatsapp-link]').click();
  await expect(page.locator('[data-whatsapp-link]')).not.toHaveClass(/disabled/);
  expect(await events(page)).toHaveLength(0);
  expect(await page.evaluate(() => localStorage.getItem('haode-campaign-attribution-v1'))).toBeNull();
});

test('four-style comparison and visible FAQ agree with schema on a narrow screen', async ({ page }) => {
  await isolate(page, false);
  await page.setViewportSize({width: 360, height: 800});
  await page.goto(`${BASE_URL}${LANDING}`);
  await expect(page.getByRole('link', {name: 'Preparar lista en App', exact: true})).toBeVisible();
  await expect(page.getByRole('link', {name: 'Comparar las cuatro micas', exact: true})).toBeVisible();
  for (const image of await page.locator('img').all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate(i => i.complete && i.naturalWidth > 0)).toBe(true);
  }
  await expect(page.locator('.hydrogel-comparison tbody tr')).toHaveCount(4);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  const audit = await page.evaluate(() => {
    const graph = JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent)['@graph'];
    return {
      breadcrumbTypes: graph.find(s => s['@type'] === 'BreadcrumbList').itemListElement.map(i => i['@type']),
      faq: graph.find(s => s['@type'] === 'FAQPage').mainEntity.map(q => ({question: q.name, answer: q.acceptedAnswer.text})),
      visible: Array.from(document.querySelectorAll('.trust-card')).map(c => ({question: c.querySelector('strong').textContent, answer: c.querySelector('span').textContent})),
      broken: Array.from(document.images).filter(i => !i.complete || i.naturalWidth === 0).map(i => i.src)
    };
  });
  expect(audit.breadcrumbTypes).toEqual(['ListItem', 'ListItem']);
  expect(audit.faq).toEqual(audit.visible);
  expect(audit.faq).toHaveLength(6);
  expect(audit.broken).toEqual([]);
  const anchor = await page.locator('#comparar-micas').evaluate(e => {
    e.scrollIntoView({block: 'start', behavior: 'instant'});
    return {top: e.getBoundingClientRect().top, headerBottom: document.querySelector('.zay-header').getBoundingClientRect().bottom};
  });
  expect(anchor.top).toBeGreaterThanOrEqual(anchor.headerBottom);
  const readability = await page.evaluate(() => {
    const rgb = v => (v.match(/[\d.]+/g) || []).map(Number).slice(0, 3);
    const luminance = values => values.map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4).reduce((n, v, i) => n + v * [.2126, .7152, .0722][i], 0);
    return Array.from(document.querySelectorAll('.reference-conversion-panel h2, .new-page-links .btn, .zay-orange, .zay-whatsapp, .hydrogel-comparison a')).filter(e => e.getBoundingClientRect().width && e.getBoundingClientRect().height).map(e => {
      let bg = 'rgb(255,255,255)';
      for (let n = e; n; n = n.parentElement) {
        if (getComputedStyle(n).backgroundColor !== 'rgba(0, 0, 0, 0)') { bg = getComputedStyle(n).backgroundColor; break; }
      }
      const a = luminance(rgb(getComputedStyle(e).color)), b = luminance(rgb(bg));
      return {text: e.textContent.trim(), contrast: (Math.max(a,b) + .05) / (Math.min(a,b) + .05), height: e.getBoundingClientRect().height};
    });
  });
  for (const item of readability) {
    expect(item.contrast, item.text).toBeGreaterThanOrEqual(4.5);
    expect(item.height, item.text).toBeGreaterThanOrEqual(44);
  }
});

for (const width of [390, 1280]) {
  test(`only the four hydrogel consumables show a 50-sheet box on ${width}px cards`, async ({page}) => {
    await isolate(page, false);
    let catalogueFailures = 0;
    await page.route("**/api/public/catalog**", route => {
      catalogueFailures++;
      return route.fulfill({status: 503, json: {error: "isolated catalogue unavailable"}});
    });
    await page.setViewportSize({width, height: 1000});
    await page.goto(`${BASE_URL}/app/#producto/mica-hd`);
    const machine = page.locator('.product-card').filter({has: page.locator('[data-add-product="x200t-cortadora-micas"]')});
    await expect(machine).toHaveCount(1);
    await expect(machine.locator('.product-kicker')).toHaveText('Equipo');
    await expect(machine.locator('.price-lines')).toContainText('Precio menudeo');
    await expect(machine.locator('.price-lines')).not.toContainText('Paquete 50 pzs');
    for (const id of ['mica-matte', 'mica-privacidad-hd', 'mica-privacidad-matte']) {
      const card = page.locator('.product-card').filter({has: page.locator(`[data-add-product="${id}"]`)});
      await expect(card.locator('.price-lines')).toContainText('Paquete 50 pzs');
    }
    await page.goto(`${BASE_URL}/app/#categoria/Micas`);
    for (const id of ['mica-hd', 'mica-matte', 'mica-privacidad-hd', 'mica-privacidad-matte']) {
      const card = page.locator('.product-card').filter({has: page.locator(`[data-add-product="${id}"]`)});
      await expect(card.locator('.price-lines')).toContainText('Paquete 50 pzs');
    }
    const listedMachine = page.locator('.product-card').filter({has: page.locator('[data-add-product="x200t-cortadora-micas"]')});
    await expect(listedMachine.locator('.price-lines')).toContainText('Precio menudeo');
    await expect(listedMachine.locator('.price-lines')).not.toContainText('Paquete 50 pzs');
    await expect.poll(() => catalogueFailures).toBeGreaterThan(0);
    await expect(listedMachine.locator('.price-lines')).not.toContainText('Paquete 50 pzs');
  });
}
