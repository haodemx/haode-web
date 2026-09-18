const { test, expect } = require('@playwright/test');

const baseURL = (process.env.BASE_URL || 'http://127.0.0.1:4187').replace(/\/$/, '');
const viewports = [
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'mobile-430', width: 430, height: 932 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-1440', width: 1440, height: 900 },
];

test.beforeEach(async ({ page }) => {
  await page.route('https://erp.haode.com.mx/**', (route) => route.abort());
});

test('ProductMediaGallery shows only media from the exact product directory', async ({ page }) => {
  await page.goto(`${baseURL}/producto/iphone-incell-14/`, { waitUntil: 'domcontentloaded' });

  const visual = page.locator('.detail-visual');
  await expect(visual).toHaveAttribute('data-media-model', 'iPhone 14');
  await expect(visual).toHaveAttribute('data-media-quality', /INCELL/i);
  await expect(page.locator('.detail-video-wrap')).toBeHidden();
  const videoThumb = page.locator('[data-detail-media-thumb][data-product-media-kind="video"]').first();
  await expect(videoThumb).toHaveAttribute('data-media-model', 'iPhone 14');
  await expect(videoThumb).toHaveAttribute('data-media-quality', /INCELL/i);
  await expect(videoThumb).toHaveAttribute('data-media-src', /assets\/products\/iphone-incell\/14\/video-01\.mp4/);
  await videoThumb.click();
  const video = page.locator('[data-detail-stage-video]');
  await expect(video).toBeVisible();
  await expect(video).toHaveAttribute('src', /assets\/products\/iphone-incell\/14\/video-01\.mp4/);
  await expect(video).toHaveAttribute('poster', /assets\/products\/iphone-incell\/14\/main\.display\.webp/);

  await page.evaluate(() => {
    const product = window.HAODE_GET_PRODUCT('iphone-incell-14');
    product.videos = ['assets/products/iphone-incell/13/video-01.mp4'];
    new window.HAODE_PRODUCT_MEDIA_GALLERY(document.querySelector('[data-product-detail]'), product).render();
  });
  await expect(page.locator('.detail-video-wrap')).toBeHidden();
  await expect(page.locator('[data-detail-media-thumb][data-product-media-kind="video"]')).toHaveCount(0);
});

test('missing galleries and videos collapse without coming-soon whitespace', async ({ page }) => {
  await page.goto(`${baseURL}/producto/samsung-original-s22-plus/`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.detail-visual > .detail-gallery-wrap')).toBeHidden();
  await expect(page.locator('.detail-visual > .detail-video-wrap')).toBeHidden();
  await expect(page.locator('.detail-visual')).toHaveClass(/is-main-media-only/);
  await expect(page.locator('body')).not.toContainText(/próximamente/i);

  const gap = await page.locator('.detail-visual').evaluate((element) => getComputedStyle(element).gap);
  expect(gap).toBe('0px');
});

test('gallery-only products retain real images and hide the absent video entry', async ({ page }) => {
  await page.goto(`${baseURL}/producto/iphone-incell-17/`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.detail-visual > .detail-gallery-wrap')).toBeVisible();
  await expect(page.locator('[data-detail-media-thumb][data-product-media-kind="image"]')).toHaveCount(4);
  await expect(page.locator('.detail-visual > .detail-video-wrap')).toBeHidden();
  const sources = await page.locator('[data-detail-media-thumb][data-product-media-kind="image"] img').evaluateAll((images) => images.map((image) => image.dataset.performanceSrc || image.getAttribute('src')));
  expect(sources.every((src) => /assets\/products\/iphone-incell\/17\//.test(src))).toBe(true);
});

test('series-level videos stay hidden when no exact product manifest directory exists', async ({ page }) => {
  await page.goto(`${baseURL}/producto/haode-pantalla-oled-diagnostica-modelo-14/`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.detail-video-wrap')).toBeHidden();
  await expect(page.locator('[data-detail-media-thumb][data-product-media-kind="video"]')).toHaveCount(0);
});

for (const viewport of viewports) {
  test(`V3 shared shell and product detail remain visually stable at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    for (const route of ['/', '/productos/', '/producto/iphone-incell-14/', '/producto/samsung-original-s22-plus/']) {
      const response = await page.goto(`${baseURL}${route}`, { waitUntil: 'domcontentloaded' });
      expect(response?.status(), route).toBe(200);
      await expect(page.locator('[data-v3-header]')).toBeVisible();
      await expect(page.locator('[data-v3-footer]')).toBeAttached();
      await expect(page.locator('a[href*="wa.me"]').first()).toBeAttached();
      await expect(page.locator('a[href="/app/"]').first()).toBeAttached();
      const audit = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        brokenImages: Array.from(document.images)
          .filter((image) => {
            const rect = image.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0 && image.complete && image.naturalWidth === 0;
          })
          .map((image) => image.currentSrc || image.src),
      }));
      expect(audit.overflow, `${route} horizontal overflow`).toBeLessThanOrEqual(1);
      expect(audit.brokenImages, `${route} broken images`).toEqual([]);
    }

    await page.goto(`${baseURL}/producto/iphone-incell-14/`, { waitUntil: 'networkidle' });
    await page.evaluate(async () => {
      const pause = () => new Promise((resolve) => setTimeout(resolve, 35));
      for (let y = 0; y < document.documentElement.scrollHeight; y += Math.max(320, window.innerHeight / 2)) {
        window.scrollTo(0, y);
        await pause();
      }
      window.scrollTo(0, 0);
    });
    await page.evaluate(() => {
      document.querySelectorAll('img[data-performance-src]').forEach((image) => {
        image.loading = 'eager';
        image.src = image.dataset.performanceSrc;
        delete image.dataset.performanceSrc;
      });
    });
    await page.waitForFunction(() => Array.from(document.images).every((image) => image.complete));
    await page.evaluate(async () => {
      await Promise.all(Array.from(document.images, (image) => image.decode().catch(() => undefined)));
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(200);
    await expect(page).toHaveScreenshot(`v3-product-detail-${viewport.name}.png`, {
      animations: 'disabled',
      fullPage: true,
      maxDiffPixelRatio: 0.002,
    });
  });
}
