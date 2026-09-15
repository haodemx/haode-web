const { test, expect } = require('@playwright/test');

const baseURL = (process.env.BASE_URL || 'http://127.0.0.1:4177').replace(/\/$/, '');
const pages = [
  ['/', 'Pantallas profesionales'],
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
    await expect(page.locator('.v3-nav')).toContainText('Hidrogel');
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

test('selected repair-lab homepage uses the locked laboratory photography and honest product assets', async ({ page }) => {
  await page.goto(`${baseURL}/`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('body')).toHaveClass(/v3-lab/);
  await expect(page.locator('.lab-hero-photo')).toHaveAttribute('src', '/assets/images/v3-lab-hero.png');
  await expect(page.locator('.lab-hero-photo')).toHaveAttribute('alt', /laboratorio/i);
  await expect(page.locator('.lab-category--hydrogel')).toHaveAttribute('data-real-asset-required', 'true');
  await expect(page.locator('.lab-category--battery')).toHaveAttribute('data-real-asset-required', 'true');
  await expect(page.locator('.lab-buying-flow .v3-step')).toHaveCount(4);
  await expect(page.locator('.lab-category--screens')).toBeVisible();
  await expect(page.locator('.lab-category--hydrogel')).toBeVisible();
  await expect(page.locator('.lab-category--battery [class*="pending"]')).toBeVisible();
});

test('laboratory homepage avoids synthetic hero and placeholder effects', async ({ page }) => {
  await page.goto(`${baseURL}/`, { waitUntil: 'domcontentloaded' });
  const visualStyle = await page.evaluate(() => {
    const hero = getComputedStyle(document.querySelector('.lab-hero'));
    const hydrogel = getComputedStyle(document.querySelector('.lab-hydrogel-visual'), '::after');
    return {
      heroBackgroundImage: hero.backgroundImage,
      heroBackdropFilter: hero.backdropFilter,
      hydrogelPseudoContent: hydrogel.content,
    };
  });
  expect(visualStyle.heroBackgroundImage).toBe('none');
  expect(visualStyle.heroBackdropFilter).toBe('none');
  expect(visualStyle.hydrogelPseudoContent).toBe('none');
});
