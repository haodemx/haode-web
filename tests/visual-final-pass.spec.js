const { test, expect } = require('@playwright/test');

const BASE_URL = (process.env.BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844, columns: 1 },
  { name: 'tablet', width: 768, height: 1024, columns: 2 },
  { name: 'desktop', width: 1440, height: 900, columns: 4 },
  { name: 'large-desktop', width: 1920, height: 1080, columns: 4 },
];

async function settleImages(page) {
  await page.evaluate(async () => {
    document.querySelectorAll('img').forEach((image) => { image.loading = 'eager'; });
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 60));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForFunction(() => Array.from(document.images).every((image) => image.complete), null, { timeout: 5_000 });
}

function monitorPage(page) {
  const failures = [];
  page.on('console', (message) => {
    if (message.type() === 'error') failures.push(`console: ${message.text()}`);
  });
  page.on('pageerror', (error) => failures.push(`page: ${error.message}`));
  page.on('response', (response) => {
    if (response.status() === 404) failures.push(`404: ${response.url()}`);
  });
  page.on('requestfailed', (request) => {
    if (request.url().startsWith(BASE_URL) && request.failure()?.errorText !== 'net::ERR_ABORTED') {
      failures.push(`request: ${request.url()}`);
    }
  });
  return failures;
}

test.beforeEach(async ({ page }) => {
  await page.route('https://erp.haode.com.mx/**', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: '[]',
  }));
});

for (const viewport of VIEWPORTS) {
  test(`homepage visual health at ${viewport.width}px`, async ({ page }) => {
    const failures = monitorPage(page);
    await page.setViewportSize(viewport);
    await page.goto(`${BASE_URL}/`, { waitUntil: 'load' });
    await settleImages(page);

    const health = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      brokenImages: Array.from(document.images).filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.src),
      clippedText: Array.from(document.querySelectorAll('h1,h2,h3,p,a,button')).filter((element) => element.textContent.trim()).filter((element) => (
        element.scrollWidth > element.clientWidth + 1 || element.scrollHeight > element.clientHeight + 1
      )).filter((element) => getComputedStyle(element).overflow === 'hidden').map((element) => element.textContent.trim()),
    }));

    expect(health.overflow).toBeLessThanOrEqual(1);
    expect(health.brokenImages).toEqual([]);
    expect(health.clippedText).toEqual([]);
    expect(failures).toEqual([]);
    await expect(page.locator('[data-ui-id="site-header"]')).toBeVisible();
    await expect(page.locator('[data-ui-id="home-hero"]')).toBeVisible();
    await expect(page.locator('[data-ui-id="home-final-cta"]')).toBeVisible();
    await expect(page.locator('[data-ui-id="site-footer"]')).toBeVisible();

    const cards = page.locator('[data-ui-id="home-featured-products"] [data-v3-product]');
    await expect(cards).toHaveCount(4);
    const columnCount = await cards.evaluateAll((items) => new Set(items.map((item) => Math.round(item.getBoundingClientRect().left))).size);
    expect(columnCount).toBe(viewport.columns);
  });
}

test('category, product, conversion, and footer journeys remain intact', async ({ page }) => {
  const failures = monitorPage(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  const routes = [
    ['/productos/?category=pantallas', 'Pantallas'],
    ['/micas.html', 'Hidrogel'],
    ['/productos-ai/', 'Productos AI'],
    ['/producto/iphone-incell-11/', 'Pantalla iPhone 11 INCELL FHD'],
  ];

  for (const [route, heading] of routes) {
    await page.goto(`${BASE_URL}${route}`, { waitUntil: 'load' });
    await expect(page.getByRole('heading', { name: heading, exact: true }).first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  }

  await page.goto(`${BASE_URL}/`, { waitUntil: 'load' });
  await expect(page.locator('[data-ui-id="header-app"]')).toHaveAttribute('href', '/app/');
  await expect(page.locator('[data-ui-id="header-whatsapp"]')).toHaveAttribute('href', /^https:\/\/wa\.me\/523326684296/);
  await expect(page.locator('[data-ui-id="footer-directions"]')).toHaveAttribute('href', /^https:\/\/www\.google\.com\/maps\/dir\//);
  await expect(page.locator('[data-ui-id="footer-navigation"] a[href="/productos-ai/"]')).toBeVisible();

  await page.goto(`${BASE_URL}/producto/iphone-incell-11/`, { waitUntil: 'load' });
  const mainImage = page.locator('[data-detail-main-image]');
  const imageThumbs = page.locator('[data-detail-media-thumb][data-product-media-kind="image"]');
  const videoThumb = page.locator('[data-detail-media-thumb][data-product-media-kind="video"]');
  await expect(imageThumbs).toHaveCount(3);
  await expect(videoThumb).toHaveCount(1);
  await videoThumb.click();
  await expect(page.locator('[data-detail-stage-video]')).toBeVisible();
  await imageThumbs.nth(1).click();
  await expect(mainImage).toHaveAttribute('src', /gallery-02\.jpg/);
  expect(failures).toEqual([]);
});
