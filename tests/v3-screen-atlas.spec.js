const { test, expect } = require('@playwright/test');

const baseURL = (process.env.BASE_URL || 'http://127.0.0.1:4177').replace(/\/$/, '');
const pages = [
  ['/', 'Pantallas y tecnología'],
  ['/productos/', 'Productos publicados'],
  ['/producto/iphone-oled-11promax/', 'Pantalla para iPhone 11 Pro Max'],
  ['/micas.html', 'Hidrogel'],
  ['/productos-ai/', 'Productos AI'],
  ['/novedades/', 'Novedades'],
  ['/contacto/', 'HAODE México'],
];

test.beforeEach(async ({ page }) => {
  await page.route('https://erp.haode.com.mx/**', (route) => route.abort());
});

test('V3 renders every complete route with the shared navigation and footer', async ({ page }) => {
  for (const [route, heading] of pages) {
    const response = await page.goto(`${baseURL}${route}`, { waitUntil: 'domcontentloaded' });
    expect(response?.status(), route).toBe(200);
    await expect(page.locator('h1')).toContainText(heading);
    await expect(page.locator('[data-v3-header]')).toBeVisible();
    await expect(page.locator('[data-v3-footer]')).toBeAttached();
    await expect(page.locator('.zay-nav')).toContainText('Pantallas');
    await expect(page.locator('.zay-nav')).toContainText('Hidrogel');
    await expect(page.locator('.zay-nav')).not.toContainText('Fundas');
    await expect(page.locator('a[href="/app/"]').first()).toBeAttached();
  }
});

test('390px layouts do not overflow and mobile navigation is usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const [route] of pages) {
    await page.goto(`${baseURL}${route}`, { waitUntil: 'domcontentloaded' });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  }
  await page.goto(`${baseURL}/`, { waitUntil: 'domcontentloaded' });
  const menu = page.locator('.zay-menu-button');
  await expect(menu).toBeVisible();
  await menu.click();
  await expect(page.locator('#zay-nav')).toBeVisible();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
});

test('Pantallas uses real catalog data and supports filter and search', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseURL}/productos/?q=S23%20Ultra`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-catalog-card]:visible').first()).toContainText('S23 Ultra');
  await expect(page.locator('[data-v3-results]')).toContainText('productos encontrados');
  await page.goto(`${baseURL}/productos/?category=pantallas&sub=iphone-oled`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-catalog-card]:visible').first()).toHaveAttribute('data-category', 'iphone-oled');
});

test('product detail keeps price, quantity, WhatsApp, APP and canonical behavior', async ({ page }) => {
  await page.goto(`${baseURL}/producto/iphone-oled-11promax/`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-detail-price-body] tr')).toHaveCount(5);
  await expect(page.locator('[data-detail-whatsapp]')).toHaveAttribute('href', /wa\.me\/523326684296\?text=/);
  await expect(page.locator('[data-v3-detail-quality]')).toHaveText(/OLED/i);
  await expect(page.locator('[data-v3-qty]')).toHaveText('1');
  await page.locator('[data-v3-qty-preset="10"]').click();
  await expect(page.locator('[data-v3-qty]')).toHaveText('10');
  await expect(page.locator('[data-v3-detail-summary]')).toContainText('10 piezas');
  const quoteHref = await page.locator('[data-detail-whatsapp]').getAttribute('href');
  expect(decodeURIComponent(quoteHref)).toContain('Cantidad: 10');
  await expect(page.locator('a[href="/app/"]').first()).toBeAttached();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://haode.com.mx/producto/iphone-oled-11promax/');
});

test('Baterías exposes no invented catalog entries', async ({ page }) => {
  await page.goto(`${baseURL}/baterias/`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-catalog-card]')).toHaveCount(0);
  await expect(page.locator('body')).not.toContainText(/comprar batería|precio de batería/i);
});

test('approved Zay homepage uses a real product hero and the three truthful categories', async ({ page }) => {
  await page.goto(`${baseURL}/`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('body')).toHaveClass(/zay-candidate/);
  const hero = page.locator('.zay-hero figure img');
  await expect(hero).toBeVisible();
  await expect(hero).not.toHaveAttribute('src', /placeholder/);
  await expect(page.locator('.zay-steps>div')).toHaveCount(4);
  await expect(page.locator('.zay-category-card')).toHaveCount(3);
  await expect(page.locator('.zay-category-card')).toContainText(['Pantallas', 'Hidrogel', 'Productos AI']);
  await expect(page.locator('body')).not.toContainText('Baterías');
});

test('approved Zay homepage avoids synthetic background and placeholder effects', async ({ page }) => {
  await page.goto(`${baseURL}/`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('body')).toHaveClass(/zay-candidate/);
  await page.waitForFunction(() => {
    const hero = document.querySelector('.zay-hero');
    return hero && getComputedStyle(hero).backgroundImage.includes('linear-gradient');
  });
  const visualStyle = await page.evaluate(() => {
    const hero = getComputedStyle(document.querySelector('.zay-hero'));
    const image = document.querySelector('.zay-hero figure img');
    return {
      heroBackgroundImage: hero.backgroundImage,
      heroBackdropFilter: hero.backdropFilter,
      imageSrc: image?.getAttribute('src') || '',
    };
  });
  expect(visualStyle.heroBackgroundImage).toContain('linear-gradient');
  expect(visualStyle.heroBackdropFilter).toBe('none');
  expect(visualStyle.imageSrc).not.toContain('placeholder');
});
