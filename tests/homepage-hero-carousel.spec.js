const { test, expect } = require('@playwright/test');

const BASE_URL = (process.env.BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');

function relativeLuminance(rgb) {
  const channels = (rgb.match(/[\d.]+/g) || []).slice(0, 3).map(Number).map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return (0.2126 * channels[0]) + (0.7152 * channels[1]) + (0.0722 * channels[2]);
}

function contrastRatio(foreground, background) {
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

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
    const mobileControls = await mobileCarousel.locator('.reference-home-carousel-controls').boundingBox();
    const mobileCarouselBox = await mobileCarousel.boundingBox();
    expect(mobileArrow?.width).toBeGreaterThanOrEqual(44);
    expect(mobileArrow?.height).toBeGreaterThanOrEqual(44);
    expect(mobileDot?.width).toBeGreaterThanOrEqual(24);
    expect(mobileDot?.height).toBeGreaterThanOrEqual(44);
    expect(mobileControls?.x).toBeGreaterThanOrEqual(mobileCarouselBox?.x ?? 0);
    expect(mobileControls?.x + mobileControls?.width).toBeLessThanOrEqual((mobileCarouselBox?.x ?? 0) + (mobileCarouselBox?.width ?? 0));
    expect(mobileControls?.y + mobileControls?.height).toBeLessThanOrEqual((mobileCarouselBox?.y ?? 0) + (mobileCarouselBox?.height ?? 0));

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test('mobile carousel shows the complete landscape product image without cropping', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const mobileCarousel = page.locator('.reference-mobile-hero-visual [data-home-hero-carousel]');
    const image = mobileCarousel.locator('[data-home-hero-carousel-image]');

    const presentation = await image.evaluate((element) => {
      const imageRect = element.getBoundingClientRect();
      const carouselRect = element.closest('[data-home-hero-carousel]').getBoundingClientRect();
      const style = getComputedStyle(element);
      const carouselStyle = getComputedStyle(element.closest('[data-home-hero-carousel]'));

      return {
        objectFit: style.objectFit,
        imageRatio: imageRect.width / imageRect.height,
        naturalRatio: element.naturalWidth / element.naturalHeight,
        carouselWidth: carouselRect.width,
        imageWidth: imageRect.width,
        carouselMarginInline: [carouselStyle.marginLeft, carouselStyle.marginRight],
      };
    });

    expect(presentation.objectFit).toBe('contain');
    expect(Math.abs(presentation.imageRatio - presentation.naturalRatio)).toBeLessThan(0.03);
    expect(presentation.imageWidth).toBeGreaterThanOrEqual(presentation.carouselWidth - 1);
    expect(presentation.carouselMarginInline).toEqual(['0px', '0px']);
  });

  test('mobile wholesale panel keeps paragraph and account action readable on black', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    const colors = await page.locator('.reference-workshop-card').evaluate((card) => ({
      background: getComputedStyle(card).backgroundColor,
      paragraph: getComputedStyle(card.querySelector('p')).color,
      accountAction: getComputedStyle(card.querySelector('a')).color,
    }));

    expect(contrastRatio(colors.paragraph, colors.background)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(colors.accountAction, colors.background)).toBeGreaterThanOrEqual(4.5);
  });

  test('storefront image does not receive a duplicate caption over its embedded information strip', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const duplicateCaption = page.locator('.reference-store-photo-card:not(.reference-warehouse-photo-card) figcaption');

    await expect(duplicateCaption).toBeHidden();
  });

  test('mobile proof band keeps headings and supporting text readable on its light surface', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    const colors = await page.locator('.reference-proof-band').evaluate((band) => {
      const article = band.querySelector('article');
      return {
        background: getComputedStyle(band).backgroundColor,
        heading: getComputedStyle(article.querySelector('strong')).color,
        supportingText: getComputedStyle(article.querySelector('small')).color,
      };
    });

    expect(contrastRatio(colors.heading, colors.background)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(colors.supportingText, colors.background)).toBeGreaterThanOrEqual(4.5);
  });
});
