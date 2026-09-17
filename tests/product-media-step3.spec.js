const { test, expect } = require('@playwright/test');
const path = require('node:path');

const baseURL = (process.env.BASE_URL || 'http://127.0.0.1:4185').replace(/\/$/, '');
const outputDir = process.env.STEP3_SCREENSHOT_DIR
  || '/Users/mac/.codex/visualizations/2026/09/17/haode-real-media-step-3';

async function openChecked(page, route) {
  const errors = [];
  const brokenMedia = [];
  await page.route('https://erp.haode.com.mx/**', async (requestRoute) => {
    await requestRoute.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
  });
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  page.on('response', (response) => {
    const resourceType = response.request().resourceType();
    if (['image', 'media'].includes(resourceType) && response.status() >= 400) {
      brokenMedia.push(`${response.status()} ${response.url()}`);
    }
  });
  const response = await page.goto(`${baseURL}${route}`, { waitUntil: 'networkidle' });
  expect(response?.ok(), route).toBeTruthy();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  expect(errors, route).toEqual([]);
  expect(brokenMedia, route).toEqual([]);
}

test('desktop and mobile visual master remain intact', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await openChecked(page, '/');
  await expect(page.getByRole('heading', { level: 1, name: /Pantallas que mantienen/i })).toBeVisible();
  await page.screenshot({ path: path.join(outputDir, '01-home-desktop-1440.png'), fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: 'networkidle' });
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  await page.screenshot({ path: path.join(outputDir, '02-home-mobile-390.png'), fullPage: true });
});

test('iPhone unique-match gallery switches image and real test video', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await openChecked(page, '/producto/iphone-incell-14/');
  const videoThumb = page.locator('.detail-media-thumb-video').first();
  await expect(videoThumb).toBeVisible();
  await page.screenshot({ path: path.join(outputDir, '03-iphone-real-image-video-desktop.png'), fullPage: true });
  await videoThumb.click();
  const video = page.locator('[data-detail-stage-video]');
  await expect(video).toBeVisible();
  await expect(page.locator('[data-detail-stage-video-title]')).toContainText('Prueba real — iPhone 14 INCELL FHD');
  const playback = await video.evaluate(async (element) => {
    const start = element.currentTime;
    try { await element.play(); } catch (error) { return { played: false, error: error.message }; }
    await new Promise((resolve) => setTimeout(resolve, 700));
    return {
      played: !element.paused && element.currentTime > start,
      muted: element.muted,
      autoplay: element.autoplay,
      preload: element.preload,
    };
  });
  expect(playback.played).toBe(true);
  expect(playback.muted).toBe(false);
  expect(playback.autoplay).toBe(false);
  expect(playback.preload).toBe('metadata');
  await page.screenshot({ path: path.join(outputDir, '06-gallery-video-playing.png'), fullPage: true });
  await page.locator('.detail-media-thumb-image').first().click();
  await expect(video).toBeHidden();
});

test('Samsung exact-quality detail and foldable missing state are truthful', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await openChecked(page, '/producto/samsung-incell-s24/');
  await expect(page.locator('[data-detail-quality]')).toContainText('INCELL');
  await expect(page.locator('.detail-media-thumb-video').first()).toBeVisible();
  await page.screenshot({ path: path.join(outputDir, '04-samsung-detail-desktop.png'), fullPage: true });

  await openChecked(page, '/producto/samsung-incell-z-flip3/');
  await expect(page.locator('[data-detail-gallery]')).toContainText('REAL ASSET REQUIRED');
  await expect(page.locator('.detail-media-thumb-video')).toHaveCount(0);
  await page.screenshot({ path: path.join(outputDir, '05-foldable-real-asset-required.png'), fullPage: true });

  const manualChecks = [
    ['/producto/iphone-oled-16promax/', 'SOFT OLED PREMIUM MOVE IC', true],
    ['/producto/samsung-oled-s24-ultra/', 'OLED CON MARCO', true],
    ['/producto/samsung-original-s24-ultra/', 'TIPO ORIGINAL C/M', false],
    ['/producto/samsung-original-z-fold6/', 'ORIGINAL C/M', false],
  ];
  for (const [route, quality, expectsVideo] of manualChecks) {
    await openChecked(page, route);
    await expect(page.locator('[data-detail-quality]')).toContainText(quality);
    await expect(page.locator('.detail-media-thumb-video')).toHaveCount(expectsVideo ? 1 : 0);
  }
});

test('mobile gallery is touch-sized and does not overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openChecked(page, '/producto/iphone-incell-14/');
  const sizes = await page.locator('.detail-media-thumb').evaluateAll((items) => items.map((item) => {
    const rect = item.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }));
  expect(sizes.length).toBeGreaterThan(1);
  expect(sizes.every((size) => size.width >= 44 && size.height >= 44)).toBe(true);
  await page.locator('.detail-media-thumb-video').first().click();
  await expect(page.locator('[data-detail-stage-video]')).toBeVisible();
  await page.screenshot({ path: path.join(outputDir, '07-mobile-gallery.png'), fullPage: true });
});
