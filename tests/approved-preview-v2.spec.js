const { test, expect } = require('@playwright/test');

const BASE_URL = (process.env.BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const CONSENT_KEY = 'haode-privacy-consent-v1';

test.beforeEach(async ({ page }) => {
  await page.addInitScript((key) => {
    localStorage.setItem(key, JSON.stringify({
      version: 1,
      analytics: false,
      advertising: false,
      updatedAt: new Date().toISOString(),
    }));
  }, CONSENT_KEY);
});

test('homepage desktop matches the approved compact product-first preview', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });

  await expect(page.getByRole('heading', { level: 1 })).toContainText('Refacciones precisas');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Pedidos claros');

  const presentation = await page.evaluate(() => {
    const header = document.querySelector('.reference-header');
    const logo = document.querySelector('.reference-logo img');
    const title = document.querySelector('.reference-hero h1');
    const hero = document.querySelector('.reference-hero-grid');
    const image = document.querySelector('.reference-hero-visual [data-home-hero-carousel-image]');
    const logistics = document.querySelector('.reference-logistics-strip');
    return {
      headerHeight: header.getBoundingClientRect().height,
      logoContent: getComputedStyle(logo).content,
      titleSize: parseFloat(getComputedStyle(title).fontSize),
      heroHeight: hero.getBoundingClientRect().height,
      imageFit: getComputedStyle(image).objectFit,
      imageRatio: image.getBoundingClientRect().width / image.getBoundingClientRect().height,
      logisticsBottom: logistics.getBoundingClientRect().bottom,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });

  expect(presentation.logoContent).toContain('haode-header-logo-horizontal-preview.png');
  expect(presentation.headerHeight).toBeLessThanOrEqual(112);
  expect(presentation.titleSize).toBeGreaterThanOrEqual(48);
  expect(presentation.titleSize).toBeLessThanOrEqual(64);
  expect(presentation.heroHeight).toBeLessThanOrEqual(670);
  expect(presentation.imageFit).toBe('contain');
  expect(presentation.imageRatio).toBeGreaterThan(1.65);
  expect(presentation.logisticsBottom).toBeLessThanOrEqual(900);
  expect(presentation.overflow).toBeLessThanOrEqual(1);
  await expect(page.locator('.reference-logistics-logos img')).toHaveCount(4);
});

test('homepage mobile keeps readable type and complete hero media in the first screen', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });

  const presentation = await page.evaluate(() => {
    const title = document.querySelector('.reference-hero h1');
    const image = document.querySelector('.reference-mobile-hero-visual [data-home-hero-carousel-image]');
    return {
      titleSize: parseFloat(getComputedStyle(title).fontSize),
      titleLineHeight: parseFloat(getComputedStyle(title).lineHeight),
      imageFit: getComputedStyle(image).objectFit,
      imageTop: image.getBoundingClientRect().top,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });

  expect(presentation.titleSize).toBeGreaterThanOrEqual(38);
  expect(presentation.titleSize).toBeLessThanOrEqual(48);
  expect(presentation.titleLineHeight).toBeGreaterThanOrEqual(38);
  expect(presentation.imageFit).toBe('contain');
  expect(presentation.imageTop).toBeLessThan(760);
  expect(presentation.overflow).toBeLessThanOrEqual(1);
});

test('catalog uses a compact hero and short route cards on desktop and mobile', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${BASE_URL}/productos/`, { waitUntil: 'domcontentloaded' });

  const desktop = await page.evaluate(() => {
    const title = document.querySelector('.catalog-title-row h1');
    const visual = document.querySelector('.catalog-visual-strip');
    const firstRoute = document.querySelector('.catalog-priority-links a');
    return {
      titleSize: parseFloat(getComputedStyle(title).fontSize),
      visualHeight: visual.getBoundingClientRect().height,
      routeHeight: firstRoute.getBoundingClientRect().height,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });

  expect(desktop.titleSize).toBeLessThanOrEqual(62);
  expect(desktop.visualHeight).toBeLessThanOrEqual(190);
  expect(desktop.routeHeight).toBeLessThanOrEqual(132);
  expect(desktop.overflow).toBeLessThanOrEqual(1);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: 'domcontentloaded' });
  const mobile = await page.evaluate(() => ({
    titleSize: parseFloat(getComputedStyle(document.querySelector('.catalog-title-row h1')).fontSize),
    visualHeight: document.querySelector('.catalog-visual-strip').getBoundingClientRect().height,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }));
  expect(mobile.titleSize).toBeLessThanOrEqual(48);
  expect(mobile.visualHeight).toBeLessThanOrEqual(150);
  expect(mobile.overflow).toBeLessThanOrEqual(1);
});

test('product detail keeps the complete product image and purchase information together', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${BASE_URL}/producto/iphone-incell-14/`, { waitUntil: 'domcontentloaded' });

  const desktop = await page.evaluate(() => {
    const title = document.querySelector('.detail-title');
    const grid = document.querySelector('.detail-grid');
    const image = document.querySelector('.detail-main-image');
    const info = document.querySelector('.detail-info');
    const imageRect = image.getBoundingClientRect();
    const infoRect = info.getBoundingClientRect();
    return {
      titleSize: parseFloat(getComputedStyle(title).fontSize),
      gridTop: grid.getBoundingClientRect().top,
      imageFit: getComputedStyle(image).objectFit,
      imageBottom: imageRect.bottom,
      infoTop: infoRect.top,
      infoLeft: infoRect.left,
      imageRight: imageRect.right,
      navColor: getComputedStyle(document.querySelector('.catalog-topbar .topnav a')).color,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });

  expect(desktop.titleSize).toBeLessThanOrEqual(56);
  expect(desktop.gridTop).toBeLessThanOrEqual(360);
  expect(desktop.imageFit).toBe('contain');
  expect(desktop.imageBottom).toBeLessThanOrEqual(970);
  expect(desktop.infoTop).toBeLessThanOrEqual(desktop.gridTop + 2);
  expect(desktop.infoLeft).toBeGreaterThan(desktop.imageRight + 20);
  expect(desktop.overflow).toBeLessThanOrEqual(1);
  expect(desktop.navColor).toBe('rgb(77, 81, 87)');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: 'domcontentloaded' });
  const mobile = await page.evaluate(() => {
    const header = document.querySelector('.catalog-topbar').getBoundingClientRect();
    const action = document.querySelector('.detail-header-action').getBoundingClientRect();
    return {
      titleSize: parseFloat(getComputedStyle(document.querySelector('.detail-title')).fontSize),
      imageFit: getComputedStyle(document.querySelector('.detail-main-image')).objectFit,
      headerBottom: header.bottom,
      actionBottom: action.bottom,
      navDisplay: getComputedStyle(document.querySelector('.catalog-topbar .topnav')).display,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  expect(mobile.titleSize).toBeLessThanOrEqual(40);
  expect(mobile.imageFit).toBe('contain');
  expect(mobile.actionBottom).toBeLessThanOrEqual(mobile.headerBottom);
  expect(mobile.navDisplay).toBe('none');
  expect(mobile.overflow).toBeLessThanOrEqual(1);
});

test('App shares the approved logo, compact desktop grid, and two-column mobile catalog', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${BASE_URL}/app/`, { waitUntil: 'domcontentloaded' });

  await expect(page.getByRole('heading', { name: 'Encuentra tu refacción.' })).toBeVisible();
  await expect(page.locator('.app-header .brand img')).toHaveAttribute('src', '/assets/images/haode-header-logo-horizontal-preview.png');

  const desktop = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('.app-home-product-card')];
    const tops = new Set(cards.slice(0, 4).map((card) => Math.round(card.getBoundingClientRect().top)));
    return {
      firstFourRows: tops.size,
      cardWidth: cards[0]?.getBoundingClientRect().width || 0,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  expect(desktop.firstFourRows).toBe(1);
  expect(desktop.cardWidth).toBeGreaterThan(180);
  expect(desktop.overflow).toBeLessThanOrEqual(1);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('.app-home-product-card').first()).toBeVisible({ timeout: 15000 });
  const mobile = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('.app-home-product-card')];
    const first = cards[0]?.getBoundingClientRect();
    const second = cards[1]?.getBoundingClientRect();
    return {
      sameRow: Math.abs((first?.top || 0) - (second?.top || 0)) <= 2,
      cardWidth: first?.width || 0,
      stockCopyColor: getComputedStyle(document.querySelector('.app-stock-strip small')).color,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  expect(mobile.sameRow).toBe(true);
  expect(mobile.cardWidth).toBeGreaterThan(165);
  expect(mobile.stockCopyColor).not.toBe('rgb(255, 255, 255)');
  expect(mobile.overflow).toBeLessThanOrEqual(1);
});
