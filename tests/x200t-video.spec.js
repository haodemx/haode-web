const { test, expect } = require('@playwright/test');
const BASE = (process.env.BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const ROUTE = '/producto/x200t-cortadora-micas/';

test.beforeEach(async ({ page }) => {
  await page.route('https://erp.haode.com.mx/**', route => route.abort());
  await page.route(/https:\/\/(?:www\.)?google(?:tagmanager|analytics)\.com\//, route => route.abort());
  await page.route('https://wa.me/**', route => route.abort());
});

for (const width of [390, 1280]) {
  test(`approved female video plays without eager download and preserves the quote at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const mediaRequests = [];
    page.on('request', request => { if (request.url().includes('haode-x200t-operacion-es-mx-v01.mp4')) mediaRequests.push(request.url()); });
    await page.goto(BASE + ROUTE + '?utm_source=chatgpt&utm_medium=ai_referral');
    const video = page.locator('[data-x200t-operation]');
    await expect(video).toBeVisible();
    await expect(page.locator('[data-detail-main-image]')).toBeVisible();
    expect(mediaRequests).toEqual([]);
    await video.evaluate(async element => { element.muted = true; await element.play(); });
    await expect.poll(() => video.evaluate(element => element.currentTime)).toBeGreaterThan(0.1);
    expect(await video.evaluate(element => [element.videoWidth, element.videoHeight, element.duration])).toEqual([1280, 720, 60]);
    expect(await page.evaluate(() => (window.dataLayer || []).filter(x => x[0] === 'event' && /^video_/.test(x[1])).length)).toBe(0);
    await page.evaluate(() => window.HaodePrivacy.updateConsent({ analytics: true, advertising: true }));
    await expect.poll(() => page.evaluate(() => (window.dataLayer || []).filter(x => x[0] === 'event' && x[1] === 'video_start').length)).toBe(1);
    await video.evaluate(element => element.pause());
    await video.evaluate(element => element.play());
    expect(await page.evaluate(() => window.dataLayer.filter(x => x[0] === 'event' && x[1] === 'video_start').length)).toBe(1);
    const quote = new URL(await page.locator('[data-detail-whatsapp]').getAttribute('href'));
    expect(quote.pathname).toBe('/523326684296');
    expect(quote.searchParams.get('text')).toMatch(/X200T/);
    expect(quote.searchParams.get('text')).toMatch(/Cantidad:/);
    expect(quote.searchParams.get('text')).toMatch(/Ciudad:/);
    expect(quote.searchParams.get('text')).toMatch(/Origen:.*chatgpt/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    await video.evaluate(element => element.pause());
  });
}

test('operation video and search metadata remain available without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(BASE + ROUTE);
  await expect(page.locator('[data-x200t-operation]')).toBeVisible();
  await expect(page.locator('[data-detail-whatsapp]')).toHaveAttribute('href', /wa\.me\/523326684296/);
  expect(JSON.parse(await page.locator('[data-x200t-video-schema]').textContent())).toMatchObject({ '@type': 'VideoObject', duration: 'PT1M' });
  await context.close();
});

test('native media seeks do not report skipped progress or a completed view', async ({ page }) => {
  await page.goto(BASE + ROUTE);
  await page.evaluate(() => window.HaodePrivacy.updateConsent({ analytics: true, advertising: false }));
  const video = page.locator('[data-x200t-operation]');
  await video.evaluate(async element => { element.muted = true; await element.play(); });
  await expect.poll(() => video.evaluate(element => element.currentTime)).toBeGreaterThan(0.1);
  await video.evaluate(element => { element.currentTime = 50; });
  await expect.poll(() => video.evaluate(element => element.seeking)).toBe(false);
  await video.evaluate(element => { element.currentTime = 59.9; });
  await expect.poll(() => video.evaluate(element => element.ended)).toBe(true);
  expect(await page.evaluate(() => window.dataLayer.filter(x => x[0] === 'event' && ['video_progress', 'video_complete'].includes(x[1])).length)).toBe(0);
});

test('a failed media source exposes the direct-video fallback', async ({ page }) => {
  await page.route('**/haode-x200t-operacion-es-mx-v01.mp4', route => route.fulfill({ status: 404, body: '' }));
  await page.goto(BASE + ROUTE);
  const video = page.locator('[data-x200t-operation]');
  await video.scrollIntoViewIfNeeded();
  const failedSource = page.waitForResponse(response => response.url().includes('haode-x200t-operacion-es-mx-v01.mp4'));
  await video.evaluate(element => { element.muted = true; element.load(); element.play().catch(() => {}); });
  expect((await failedSource).status()).toBe(404);
  await expect(page.locator('[data-x200t-video-error]')).toBeVisible();
  await expect(page.locator('[data-x200t-video-error] a')).toHaveAttribute('href', /haode-x200t-operacion-es-mx-v01\.mp4$/);
});
