const { test, expect } = require('@playwright/test');

const BASE_URL = (process.env.BASE_URL || 'http://127.0.0.1:4175').replace(/\/$/, '');
const CONSENT_KEY = 'haode-privacy-consent-v1';

async function dismissConsent(page) {
  await page.addInitScript((key) => {
    localStorage.setItem(key, JSON.stringify({
      version: 1,
      analytics: false,
      advertising: false,
      updatedAt: new Date().toISOString(),
    }));
  }, CONSENT_KEY);
}

test('contact, warranty, and distributor conversion panels keep readable contrast', async ({ page }) => {
  await dismissConsent(page);
  await page.setViewportSize({ width: 1440, height: 900 });

  for (const route of ['/contacto/', '/garantia/', '/distribuidores/']) {
    await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded' });
    const panel = page.locator('.reference-conversion-panel').first();
    await expect(panel).toBeVisible();

    const colors = await panel.evaluate((element) => ({
      background: getComputedStyle(element).backgroundColor,
      heading: getComputedStyle(element.querySelector('h2')).color,
      copy: getComputedStyle(element.querySelector('p:not(.reference-panel-kicker)')).color,
    }));

    expect(colors.background).toBe('rgb(16, 16, 18)');
    expect(colors.heading).toBe('rgb(255, 255, 255)');
    expect(colors.copy).toBe('rgb(210, 211, 213)');
  }
});

test('warranty header spans the viewport and navigation remains readable', async ({ page }) => {
  await dismissConsent(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE_URL}/garantia/`, { waitUntil: 'domcontentloaded' });

  const presentation = await page.evaluate(() => {
    const header = document.querySelector('header.catalog-topbar');
    const link = header.querySelector('.topnav a');
    return {
      headerWidth: header.getBoundingClientRect().width,
      viewportWidth: document.documentElement.clientWidth,
      linkColor: getComputedStyle(link).color,
      linkOpacity: getComputedStyle(link).opacity,
    };
  });

  expect(presentation.headerWidth).toBe(presentation.viewportWidth);
  expect(presentation.linkColor).toBe('rgb(69, 69, 73)');
  expect(presentation.linkOpacity).toBe('1');
});

test('official HL store hero respects real poster proportions', async ({ page }) => {
  await dismissConsent(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE_URL}/tienda-oficial-hl-cdmx/`, { waitUntil: 'domcontentloaded' });

  const presentation = await page.evaluate(() => {
    const hero = document.querySelector('.store-location-hero');
    const title = hero.querySelector('h1');
    const poster = hero.querySelector('.store-location-poster img');
    return {
      heroHeight: hero.getBoundingClientRect().height,
      titleTop: title.getBoundingClientRect().top,
      posterHeight: poster.getBoundingClientRect().height,
      naturalWidth: poster.naturalWidth,
      naturalHeight: poster.naturalHeight,
    };
  });

  expect(presentation.naturalWidth).toBe(1023);
  expect(presentation.naturalHeight).toBe(1537);
  expect(presentation.posterHeight).toBeLessThan(700);
  expect(presentation.heroHeight).toBeLessThan(800);
  expect(presentation.titleTop).toBeLessThan(400);
});

test('model directory exposes both contact and App actions on desktop and mobile', async ({ page }) => {
  await dismissConsent(page);

  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 768, height: 1024 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto(`${BASE_URL}/catalogo-modelos/`, { waitUntil: 'domcontentloaded' });

    await expect(page.locator('.model-directory-whatsapp')).toBeVisible();
    await expect(page.locator('.reference-nav-actions a[href="/app/"]')).toBeVisible();
    const header = await page.locator('.reference-header').evaluate((element) => ({
      width: element.getBoundingClientRect().width,
      overflow: element.scrollWidth - element.clientWidth,
    }));
    expect(header.width).toBe(viewport.width);
    expect(header.overflow).toBeLessThanOrEqual(1);
  }
});

test('long product guidance stays inside a 360px viewport', async ({ page }) => {
  await dismissConsent(page);
  await page.setViewportSize({ width: 360, height: 844 });
  await page.goto(`${BASE_URL}/producto/fundas-kit-aluminio-de-17pro-con-logo-13pro-14pro-15pro-16pro/`, {
    waitUntil: 'domcontentloaded',
  });

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

test('mobile privacy choice stays compact without shrinking touch targets', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE_URL}/contacto/`, { waitUntil: 'domcontentloaded' });

  const banner = page.locator('.haode-privacy-banner');
  await expect(banner).toBeVisible();
  const presentation = await banner.evaluate((element) => ({
    height: element.getBoundingClientRect().height,
    buttonHeights: [...element.querySelectorAll('button')].map((button) => button.getBoundingClientRect().height),
  }));

  expect(presentation.height).toBeLessThanOrEqual(150);
  expect(Math.min(...presentation.buttonHeights)).toBeGreaterThanOrEqual(44);
});
