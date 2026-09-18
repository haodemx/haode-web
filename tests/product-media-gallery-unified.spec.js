const { test, expect } = require('@playwright/test');

const baseURL = (process.env.BASE_URL || 'http://127.0.0.1:4189').replace(/\/$/, '');

test.beforeEach(async ({ page }) => {
  await page.route('https://erp.haode.com.mx/**', (route) => route.abort());
});

for (const viewport of [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
]) {
  test(`unified gallery switches image, video, and image again at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto(`${baseURL}/producto/iphone-incell-11/`, { waitUntil: 'domcontentloaded' });

    const stage = page.locator('[data-detail-media-stage]');
    const mainImage = stage.locator('[data-detail-main-image]');
    const stageVideo = stage.locator('[data-detail-stage-video]');
    const videoThumbs = page.locator('[data-detail-media-thumb][data-product-media-kind="video"]');
    const imageThumbs = page.locator('[data-detail-media-thumb][data-product-media-kind="image"]');

    await expect(stage).toBeVisible();
    await expect(imageThumbs).toHaveCount(3);
    await expect(videoThumbs).toHaveCount(1);
    await expect(stageVideo).toBeHidden();
    await expect(page.locator('[data-video-jump]')).toHaveCount(0);

    const detailLayout = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('.v3-detail-row'), (row) => {
        const rect = row.getBoundingClientRect();
        return { top: rect.top, bottom: rect.bottom, width: rect.width };
      });
      return {
        rows,
        titleSize: Number.parseFloat(getComputedStyle(document.querySelector('.detail-title')).fontSize),
      };
    });
    expect(detailLayout.rows).toHaveLength(4);
    expect(detailLayout.rows.every((row) => row.width > 250)).toBe(true);
    expect(detailLayout.rows.slice(1).every((row, index) => row.top >= detailLayout.rows[index].bottom - 1)).toBe(true);
    expect(detailLayout.titleSize).toBeLessThanOrEqual(viewport.width <= 760 ? 34 : 44);

    await videoThumbs.first().click();
    await expect(mainImage).toBeHidden();
    await expect(stageVideo).toBeVisible();
    await expect(stageVideo).toHaveAttribute('poster', /iphone-incell\/11\/fhd-main\.display\.webp/);
    await expect(stageVideo).toHaveAttribute('src', /iphone-incell\/11\/video-02\.mp4/);
    await expect(stage.locator('[data-detail-media-title]')).toHaveCount(0);
    await expect(stageVideo).toHaveAttribute('aria-label', 'Prueba real — iPhone 11 INCELL FHD');
    await stageVideo.evaluate(async (video) => {
      video.muted = true;
      await video.play();
    });
    await expect(stageVideo).not.toHaveJSProperty('paused', true);
    await stageVideo.evaluate((video) => video.pause());

    await imageThumbs.nth(1).click();
    await expect(stageVideo).toBeHidden();
    await expect(mainImage).toBeVisible();
    await expect(mainImage).toHaveAttribute('src', /iphone-incell\/11\/gallery-02\.jpg/);

    const health = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      stageRatio: document.querySelector('[data-detail-media-stage]').getBoundingClientRect().width
        / document.querySelector('[data-detail-media-stage]').getBoundingClientRect().height,
    }));
    expect(health.overflow).toBeLessThanOrEqual(1);
    expect(health.stageRatio).toBeGreaterThan(1.3);
    expect(health.stageRatio).toBeLessThan(1.36);
  });
}

test('ambiguous diagnostic and foldable series videos stay unbound', async ({ page }) => {
  for (const productId of [
    'haode-pantalla-oled-diagnostica-modelo-14',
    'samsung-original-z-flip3',
    'samsung-original-z-fold3',
  ]) {
    await page.goto(`${baseURL}/producto/${productId}/`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-detail-media-thumb][data-product-media-kind="video"]')).toHaveCount(0);
    await expect(page.locator('[data-detail-stage-video]')).toBeHidden();
  }
});

test('representative exact-match media keeps brand, model, and quality identity', async ({ page }) => {
  const products = [
    ['iphone-incell-11', /iPhone 11/i, /INCELL FHD/i, 1],
    ['iphone-oled-13', /iPhone 13/i, /OLED PREMIUM/i, 1],
    ['haode-pantalla-oled-diagnostica-modelo-14', /Modelo 14/i, /OLED Diagnóstica/i, 0],
    ['samsung-incell-s22-ultra', /Samsung S22 Ultra/i, /INCELL CON MARCO/i, 2],
    ['samsung-oled-s24-ultra', /Samsung S24 Ultra/i, /OLED CON MARCO/i, 1],
    ['samsung-original-s22-plus', /S22 PLUS/i, /TIPO ORIGINAL C\/M/i, 0],
    ['samsung-original-z-flip3', /Z FLIP3/i, /TIPO ORIGINAL C\/M/i, 0],
    ['samsung-original-z-fold3', /Z FOLD3/i, /ORIGINAL C\/M/i, 0],
  ];

  for (const [productId, model, quality, videoCount] of products) {
    await page.goto(`${baseURL}/producto/${productId}/`, { waitUntil: 'domcontentloaded' });
    const visual = page.locator('.detail-visual');
    await expect(visual).toHaveAttribute('data-media-model', model);
    await expect(visual).toHaveAttribute('data-media-quality', quality);
    await expect(page.locator('[data-detail-media-thumb][data-product-media-kind="video"]')).toHaveCount(videoCount);
  }
});
