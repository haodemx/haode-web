const { test, expect } = require('@playwright/test');
const BASE = process.env.BASE_URL || 'http://127.0.0.1:4190';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('haode-privacy-consent-v1', JSON.stringify({ version: 1, analytics: true, advertising: false }));
    document.addEventListener('click', e => { if (e.target.closest('a[href*="wa.me"]')) e.preventDefault(); });
  });
  await page.route('**/*', route => new URL(route.request().url()).origin === new URL(BASE).origin
    ? route.continue() : route.fulfill({ status: 200, body: '', contentType: 'application/javascript' }));
});

for (const [referer, source, medium] of [
  ['', 'direct', 'none'], ['https://www.bing.com/search?q=pantallas', 'bing', 'organic_search'],
  ['https://chatgpt.com/', 'chatgpt', 'ai_referral'], ['https://example.org/article', 'example_org', 'referral']
]) test(`actual WhatsApp clicks preserve GA4 attribution: ${source}`, async ({ page }) => {
  await page.goto(BASE, referer ? { referer } : {});
  for (const [selector, area] of [['.c-nav-actions a[href*="wa.me"]', 'header'], ['.c-hero-actions a[href*="wa.me"]', 'home_hero'], ['.c-sticky-whatsapp', 'floating']]) {
    if (area === 'floating') await page.setViewportSize({ width: 390, height: 844 });
    await page.locator(selector).click();
    const event = await page.evaluate(() => [...window.dataLayer].filter(x => x[0] === 'event' && x[1] === 'contact').at(-1)?.[2]);
    expect(event).toMatchObject({ contact_area: area, attribution_source: source, attribution_medium: medium });
    for (const key of ['source', 'medium', 'campaign', 'campaign_source', 'campaign_medium', 'traffic_source']) expect(event).not.toHaveProperty(key);
  }
  const config = await page.evaluate(() => [...window.dataLayer].find(x => x[0] === 'config')[2]);
  expect(config).not.toHaveProperty('source');
  expect(config).not.toHaveProperty('medium');
});

test('product WhatsApp click has its own contact area', async ({ page }) => {
  await page.goto(`${BASE}/producto/iphone-incell-11/`);
  const link = page.locator('[data-product-whatsapp], [data-detail-whatsapp]').first();
  await expect(link).toHaveAttribute('href', /wa.me\/523326684296/);
  await link.click();
  const events = await page.evaluate(() => [...window.dataLayer].filter(x => x[0] === 'event' && x[1] === 'contact').map(x => x[2]));
  expect(events.some(x => x.contact_area === 'product')).toBe(true);
});

for (const width of [390, 768, 1440]) test(`C layout, selected preload and contrast at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(BASE);
  await expect(page.locator('h1')).toHaveCount(1);
  const info = await page.evaluate(async () => {
    const image = document.querySelector('.c-hero-media img'); await image.decode();
    const preload = document.querySelector('link[rel="preload"][as="image"]');
    const luminance = color => { const rgb = color.match(/[\d.]+/g).slice(0, 3).map(Number).map(v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }); return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722; };
    return { overflow: document.documentElement.scrollWidth - innerWidth, src: image.currentSrc,
      preloadSet: preload.imageSrcset, imageSet: image.parentElement.querySelector('source').srcset,
      preloadSizes: preload.imageSizes, imageSizes: image.parentElement.querySelector('source').sizes,
      heroTransfers: performance.getEntriesByName(image.currentSrc).length,
      contrast: [...document.querySelectorAll('.c-button-primary, .c-button-app, .c-button-whatsapp, .c-hero-search button, .c-promo-copy b')].map(e => { const c = getComputedStyle(e), a = luminance(c.color), b = luminance(c.backgroundColor); return (Math.max(a,b)+.05)/(Math.min(a,b)+.05); }) };
  });
  expect(info.overflow).toBe(0); expect(info.preloadSet).toBe(info.imageSet); expect(info.preloadSizes).toBe(info.imageSizes);
  expect(info.heroTransfers).toBe(1); expect(Math.min(...info.contrast)).toBeGreaterThanOrEqual(4.5); expect(errors).toEqual([]);
  if (width < 1100) {
    await page.locator('.c-menu-button').focus(); await page.keyboard.press('Enter');
    await expect(page.locator('.c-primary-nav')).toBeVisible();
    await page.keyboard.press('Escape'); await expect(page.locator('.c-menu-button')).toBeFocused();
    await expect(page.locator('.c-menu-button')).toHaveAttribute('aria-expanded', 'false');
  }
});

test('MICA static table and public AI/Samsung text keep approved facts', async ({ page, request }) => {
  const micaSource = await (await request.get(`${BASE}/micas.html`)).text();
  const approvedTables = [...micaSource.matchAll(/<table class="detail-price-table"[^>]*>([\s\S]*?)<\/table>/g)]
    .map((match) => match[1])
    .filter((table) => ['350', '300', '275', '250'].every((price) => table.includes(price)));
  expect(approvedTables.length).toBeGreaterThanOrEqual(2);
  await page.goto(`${BASE}/productos-ai/`);
  await expect(page.locator('body')).not.toContainText('revisión de clasificación');
  await expect(page.locator('body')).toContainText('También puedes explorar cámaras');
  await page.goto(`${BASE}/productos/?category=pantallas&sub=samsung`);
  await expect(page.locator('body')).not.toContainText('Quality / Technology');
  await expect(page.locator('body')).toContainText('Calidad y tecnología');
});
