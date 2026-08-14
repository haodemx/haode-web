const { test, expect } = require('@playwright/test');

const BASE_URL = (process.env.BASE_URL || 'http://127.0.0.1:4189').replace(/\/$/, '');
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

test('App keeps premium and bulk-purchase text readable with a usable catalogue target', async ({ page }) => {
  await page.route('https://erp.haode.com.mx/**', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: '[]',
  }));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE_URL}/app/`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Encuentra tu refacción.' })).toBeVisible();

  await expectReadableText(page, '.premium-showcase-copy h2');
  await expectReadableText(page, '.premium-showcase-copy p');
  await expectReadableText(page, '.app-quick-search strong');
  await expectReadableText(page, '.whatsapp-header-action');
  await expectReadableText(page, '.app-stock-strip small');
  await expectReadableText(page, '.app-home-product-copy p');
  await expectReadableText(page, '.app-home-product-copy .product-kicker');

  const catalogueTarget = page.locator('.app-home-section-head a').first();
  const target = await catalogueTarget.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const hit = document.elementFromPoint(rect.left + (rect.width / 2), rect.top + (rect.height / 2));
    return {
      width: rect.width,
      height: rect.height,
      receivesPointer: hit === element || element.contains(hit),
    };
  });
  expect(target.width).toBeGreaterThanOrEqual(44);
  expect(target.height).toBeGreaterThanOrEqual(44);
  expect(target.receivesPointer).toBe(true);

  const featuredSpacing = await page.evaluate(() => {
    const heading = document.querySelector('.app-home-section-head')?.getBoundingClientRect();
    const firstProduct = document.querySelector('.app-home-product-media')?.getBoundingClientRect();
    return {
      headingBottom: heading?.bottom || 0,
      productTop: firstProduct?.top || 0,
    };
  });
  expect(featuredSpacing.productTop).toBeGreaterThanOrEqual(featuredSpacing.headingBottom + 8);

  await page.goto(`${BASE_URL}/app/#lista`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.app-card-b2b-strip').first()).toBeVisible({ timeout: 15_000 });
  await expectReadableText(page, '.app-card-b2b-strip strong', 13);
  await expectReadableText(page, '.app-card-b2b-strip span', 12);
  await expectReadableText(page, '.product-body .model');
  await expectReadableText(page, '.price-lines span');
});

test('homepage and shared product footer keep customer actions readable', async ({ page }) => {
  await page.route('https://erp.haode.com.mx/**', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: '[]',
  }));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.reference-hero h1')).toBeVisible();

  await expectReadableText(page, '.reference-eyebrow');
  await expectReadableText(page, '.haode-hero-primary');
  await expectReadableText(page, '.haode-supply-path > span');
  await expectReadableText(page, '.reference-bottom-whatsapp small');
  await expectReadableText(page, '.reference-copyright');

  await page.goto(`${BASE_URL}/producto/iphone-incell-14/`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.site-sales-footer')).toBeVisible();
  await expectReadableText(page, '.site-sales-footer-whatsapp');
  await expectReadableText(page, '.site-sales-footer-app');
});

test('product detail keeps its optimized verified local main image after ERP enrichment', async ({ page }) => {
  await page.addInitScript(() => {
    window.__haodeCumulativeLayoutShift = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) window.__haodeCumulativeLayoutShift += entry.value;
      }
    }).observe({ type: 'layout-shift', buffered: true });
  });
  await page.route('https://erp.haode.com.mx/api/public/catalog**', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify([{
      sku: 'IP-14-INCELL-FHD',
      public_name_es: 'Pantalla iPhone 14 INCELL FHD',
      model: 'Pantalla iPhone 14 INCELL FHD',
      quality: '',
      description_es: 'Pantalla INCELL FHD para iPhone 14.',
      image_url: 'https://erp.haode.com.mx/uploads/products/IP-14-INCELL-FHD-test.jpg',
      stock_status: 'ask_stock',
      stock_label: 'Consultar inventario',
      sales_available: true,
      public_price_mxn: 260,
      public_price_tiers: [],
    }]),
  }));
  await page.route('https://erp.haode.com.mx/public-stock.json**', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: '[]',
  }));
  await page.route('https://erp.haode.com.mx/uploads/**', (route) => route.abort());

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE_URL}/producto/iphone-incell-14/`, { waitUntil: 'domcontentloaded' });
  await expect.poll(() => page.evaluate(() => window.HAODE_GET_PRODUCT?.('iphone-incell-14')?.mainImage || ''))
    .toContain('erp.haode.com.mx');

  const mainImage = page.locator('[data-detail-main-image]');
  await expect(mainImage).toHaveAttribute('src', '/assets/products/iphone-incell/14/main.display.webp');
  await expect(mainImage).toHaveAttribute('fetchpriority', 'high');
  await expect(mainImage).toHaveAttribute('loading', 'eager');
  await expect.poll(() => mainImage.evaluate((image) => image.complete && image.naturalWidth > 0)).toBe(true);
  await expect.poll(() => page.evaluate(() => window.__haodeCumulativeLayoutShift || 0), { timeout: 5_000 })
    .toBeLessThan(0.05);
});

test('product detail defers gallery, video, and related media until the customer scrolls to them', async ({ page }) => {
  await page.route('https://erp.haode.com.mx/**', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: '[]',
  }));
  await page.setViewportSize({ width: 390, height: 844 });

  const requestedUrls = [];
  page.on('request', (request) => requestedUrls.push(request.url()));
  await page.goto(`${BASE_URL}/producto/iphone-incell-14/`, { waitUntil: 'load' });
  await page.waitForTimeout(1_000);

  expect(requestedUrls.some((url) => /\/gallery-\d+\.(?:jpe?g|png)$/i.test(url))).toBe(false);
  expect(requestedUrls.some((url) => /\/video-\d+\.mp4$/i.test(url))).toBe(false);
  expect(requestedUrls.some((url) => /iphone-incell\/(?:11|11pro)\/(?:fhd-)?main\.(?:jpe?g|png)$/i.test(url))).toBe(false);

  const galleryImage = page.locator('[data-detail-gallery] img').first();
  await expect(galleryImage).not.toHaveAttribute('src', /gallery-/);
  await galleryImage.scrollIntoViewIfNeeded();
  await expect.poll(() => requestedUrls.some((url) => /\/gallery-01\.jpg$/i.test(url))).toBe(true);
});

async function expectReadableText(page, selector, minimumFontSize = 0) {
  const appearance = await page.locator(selector).first().evaluate((element) => {
    const parseColor = (value) => {
      const numbers = value.match(/[\d.]+/g)?.map(Number) || [];
      return {
        red: numbers[0] || 0,
        green: numbers[1] || 0,
        blue: numbers[2] || 0,
        alpha: numbers.length > 3 ? numbers[3] : 1,
      };
    };
    const opaqueBackground = (start) => {
      let current = start;
      while (current) {
        const color = parseColor(getComputedStyle(current).backgroundColor);
        if (color.alpha > 0) return color;
        current = current.parentElement;
      }
      return { red: 255, green: 255, blue: 255, alpha: 1 };
    };
    const foreground = parseColor(getComputedStyle(element).color);
    const background = opaqueBackground(element);
    const composite = (channel) => (foreground[channel] * foreground.alpha)
      + (background[channel] * (1 - foreground.alpha));
    const luminance = ({ red, green, blue }) => {
      const channels = [red, green, blue].map((value) => {
        const normalized = value / 255;
        return normalized <= 0.03928
          ? normalized / 12.92
          : ((normalized + 0.055) / 1.055) ** 2.4;
      });
      return (0.2126 * channels[0]) + (0.7152 * channels[1]) + (0.0722 * channels[2]);
    };
    const foregroundLuminance = luminance({
      red: composite('red'),
      green: composite('green'),
      blue: composite('blue'),
    });
    const backgroundLuminance = luminance(background);
    const contrast = (Math.max(foregroundLuminance, backgroundLuminance) + 0.05)
      / (Math.min(foregroundLuminance, backgroundLuminance) + 0.05);
    return {
      contrast,
      fontSize: Number.parseFloat(getComputedStyle(element).fontSize),
    };
  });

  expect(appearance.contrast).toBeGreaterThanOrEqual(4.5);
  expect(appearance.fontSize).toBeGreaterThanOrEqual(minimumFontSize);
}
