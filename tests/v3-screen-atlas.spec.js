const { test, expect } = require('@playwright/test');

const baseURL = (process.env.BASE_URL || 'http://127.0.0.1:4177').replace(/\/$/, '');
const pages = [
  ['/', 'el mundo conectado'],
  ['/productos/', 'Pantallas'],
  ['/producto/iphone-oled-11promax/', 'Pantalla para iPhone 11 Pro Max'],
  ['/micas.html', 'Hidrogel'],
  ['/baterias/', 'Baterías'],
  ['/productos-ai/', 'Productos AI'],
  ['/novedades/', 'Novedades'],
  ['/contacto/', 'Contacto'],
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
    await expect(page.locator('.v3-nav')).toContainText('Pantallas');
    await expect(page.locator('.v3-nav')).toContainText(route === '/' ? 'Películas' : 'Hidrogel');
    await expect(page.locator('.v3-nav')).not.toContainText('Fundas');
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
  const menu = page.locator('.v3-menu');
  await expect(menu).toBeVisible();
  await menu.click();
  await expect(page.locator('#v3-navigation')).toBeVisible();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
});

test('Pantallas uses real catalog data and supports filter and search', async ({ page }) => {
  await page.goto(`${baseURL}/productos/`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-v3-product]:visible')).toHaveCount(12);
  await page.locator('[data-v3-search]').fill('S23 Ultra');
  await expect(page.locator('[data-v3-product]:visible').first()).toContainText('S23 Ultra');
  await expect(page.locator('[data-v3-results]')).toContainText('modelos visibles');
  await page.locator('[data-v3-search]').fill('');
  await page.locator('[data-v3-filter="iphone-oled"]').click();
  await expect(page.locator('[data-v3-product]:visible').first()).toHaveAttribute('data-category', 'iphone-oled');
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
  await expect(page.getByText('FOTOGRAFÍA REAL PENDIENTE DE VALIDACIÓN')).toBeVisible();
  await expect(page.getByText('Sin productos confirmados.')).toBeVisible();
  await expect(page.locator('[data-v3-product]')).toHaveCount(0);
});

test('selected D2.1 homepage uses the locked factory photography and approved product assets', async ({ page }) => {
  await page.goto(`${baseURL}/`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('body')).toHaveClass(/d21-home/);
  await expect(page.locator('.d21-hero-scene')).toHaveAttribute('src', '/assets/images/d21-light-stage/factory-laboratory.webp');
  await expect(page.locator('.d21-hero-scene')).toHaveAttribute('alt', /inspección/i);
  await expect(page.locator('.d21-product img')).toHaveCount(2);
  await expect(page.locator('.vm1-category--foldables')).toContainText('REAL ASSET REQUIRED');
  await expect(page.locator('.d21-steps article')).toHaveCount(4);
  await expect(page.locator('.d21-secondary')).toContainText('Hidrogel');
  await expect(page.locator('.d21-secondary')).toContainText('Productos AI');
  await expect(page.locator('body')).not.toContainText('Baterías');
});

test('laboratory homepage keeps the light product stage and text-first secondary categories', async ({ page }) => {
  await page.goto(`${baseURL}/`, { waitUntil: 'domcontentloaded' });
  const visualStyle = await page.evaluate(() => {
    const stage = getComputedStyle(document.querySelector('.d21-product-stage'));
    return {
      stageBackground: stage.backgroundColor,
      secondaryImages: document.querySelectorAll('.d21-secondary img').length,
      productLinks: document.querySelectorAll('.d21-product[href^="/categoria/"]').length,
    };
  });
  expect(visualStyle.stageBackground).toBe('rgb(255, 255, 255)');
  expect(visualStyle.secondaryImages).toBe(0);
  expect(visualStyle.productLinks).toBe(3);
});
