const { test, expect } = require('@playwright/test');

const BASE_URL = (process.env.BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');

test.describe('homepage approved product-family carousel', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
  });

  test('desktop controls move through the approved families and wrap', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    const carousel = page.locator('.reference-hero-visual [data-home-hero-carousel]');
    const image = carousel.locator('[data-home-hero-carousel-image]');

    await expect(carousel).toBeVisible();
    const desktopArrow = await carousel.locator('[data-home-hero-carousel-next]').boundingBox();
    expect(desktopArrow?.width).toBeGreaterThanOrEqual(44);
    expect(desktopArrow?.height).toBeGreaterThanOrEqual(44);
    await expect(image).toHaveAttribute('src', '/assets/images/home-hero-carousel/iphone-incell.webp');
    await carousel.locator('[data-home-hero-carousel-next]').click();
    await expect(image).toHaveAttribute('src', '/assets/images/home-hero-carousel/iphone-oled.webp');
    await expect(carousel.locator('[data-home-hero-carousel-status]')).toContainText('2 de 7');
    await expect(carousel.locator('[data-home-hero-carousel-dot][aria-current="true"]')).toHaveCount(1);

    await carousel.locator('[data-home-hero-carousel-prev]').click();
    await expect(image).toHaveAttribute('src', '/assets/images/home-hero-carousel/iphone-incell.webp');
    await carousel.locator('[data-home-hero-carousel-prev]').click();
    await expect(image).toHaveAttribute('src', '/assets/images/home-hero-carousel/samsung-plegables-incell.webp');
  });

  test('mobile shows its carousel without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const mobileCarousel = page.locator('.reference-mobile-hero-visual [data-home-hero-carousel]');

    await expect(mobileCarousel).toBeVisible();
    await expect(page.locator('.reference-hero-visual')).toBeHidden();
    await expect(mobileCarousel.locator('[data-home-hero-carousel-dot]')).toHaveCount(7);

    const mobileArrow = await mobileCarousel.locator('[data-home-hero-carousel-next]').boundingBox();
    const mobileDot = await mobileCarousel.locator('[data-home-hero-carousel-dot]').first().boundingBox();
    expect(mobileArrow?.width).toBeGreaterThanOrEqual(44);
    expect(mobileArrow?.height).toBeGreaterThanOrEqual(44);
    expect(mobileDot?.width).toBeGreaterThanOrEqual(24);
    expect(mobileDot?.height).toBeGreaterThanOrEqual(44);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
