const { test, expect } = require('@playwright/test');

const BASE_URL = (process.env.BASE_URL || 'http://127.0.0.1:4181').replace(/\/$/, '');

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

test('catalog desktop keeps filters compact and gives quick links the full content width', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(`${BASE_URL}/productos/`, { waitUntil: 'domcontentloaded' });

  const measurements = await page.locator('.catalog-hero-inner').evaluate((hero) => {
    const filter = hero.querySelector('.catalog-filter-strip');
    const firstChip = filter.querySelector('.filter-chip');
    const links = hero.querySelector('.catalog-priority-links');
    const firstLink = links.querySelector('a');
    const visual = hero.querySelector('.catalog-visual-strip');
    const heroRect = hero.getBoundingClientRect();
    const filterRect = filter.getBoundingClientRect();
    const firstChipRect = firstChip.getBoundingClientRect();
    const linksRect = links.getBoundingClientRect();
    const firstLinkRect = firstLink.getBoundingClientRect();
    const visualRect = visual.getBoundingClientRect();

    return {
      filterHeight: filterRect.height,
      chipHeight: firstChipRect.height,
      linksWidthGap: heroRect.width - linksRect.width,
      linksLeftGap: linksRect.left - heroRect.left,
      linkWidth: firstLinkRect.width,
      visualHeight: visualRect.height,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });

  expect(measurements.filterHeight).toBeLessThanOrEqual(150);
  expect(measurements.chipHeight).toBeGreaterThanOrEqual(44);
  expect(measurements.chipHeight).toBeLessThanOrEqual(56);
  expect(Math.abs(measurements.linksWidthGap)).toBeLessThanOrEqual(2);
  expect(Math.abs(measurements.linksLeftGap)).toBeLessThanOrEqual(2);
  expect(measurements.linkWidth).toBeGreaterThanOrEqual(180);
  expect(measurements.visualHeight).toBeLessThanOrEqual(280);
  expect(measurements.overflow).toBeLessThanOrEqual(1);
});

test('website headers use the new horizontal HAODE quality mark', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });

  for (const route of ['/', '/productos/', '/categoria/', '/producto/iphone-incell-14/']) {
    await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded' });
    const logo = page.locator('.reference-header .reference-logo img, .topbar .brand-logo, .catalog-topbar .brand-logo').first();
    await expect(logo).toBeVisible();
    const presentation = await logo.evaluate((image) => {
      const rect = image.getBoundingClientRect();
      return {
        content: getComputedStyle(image).content,
        ratio: rect.width / rect.height,
      };
    });
    expect(presentation.content).toContain('haode-header-logo-horizontal-preview.png');
    expect(presentation.ratio).toBeGreaterThan(3);
  }
});

test('homepage desktop status labels remain readable on the light header', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });

  const colors = await page.locator('.reference-topline').evaluate((topline) => ({
    background: getComputedStyle(topline).backgroundColor,
    availability: getComputedStyle(topline.querySelector('.reference-head-info strong')).color,
    support: getComputedStyle(topline.querySelector('.reference-head-support strong')).color,
    cart: getComputedStyle(topline.querySelector('.reference-head-cart strong')).color,
  }));

  expect(contrastRatio(colors.availability, colors.background)).toBeGreaterThanOrEqual(4.5);
  expect(contrastRatio(colors.support, colors.background)).toBeGreaterThanOrEqual(4.5);
  expect(contrastRatio(colors.cart, colors.background)).toBeGreaterThanOrEqual(4.5);
});
