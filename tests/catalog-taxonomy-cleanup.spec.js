const { test, expect } = require('@playwright/test');

const baseURL = (process.env.BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');

test.beforeEach(async ({ page }) => {
  await page.route('https://erp.haode.com.mx/**', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: '[]',
  }));
});

test('Pantallas landing uses three mutually exclusive product families', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${baseURL}/productos/?category=pantallas`, { waitUntil: 'domcontentloaded' });

  await expect(page.locator('[data-category-landing="pantallas"]')).toBeVisible();
  await expect(page.locator('[data-family-link]')).toHaveCount(3);
  await expect(page.locator('[data-family-link="iphone"]')).toContainText(/iPhone.*78 productos/s);
  await expect(page.locator('[data-family-link="samsung"]')).toContainText(/Samsung.*50 productos/s);
  await expect(page.locator('[data-family-link="foldables"]')).toContainText(/Foldables.*13 productos/s);
  await expect(page.locator('[data-zay-catalog]')).toHaveCount(0);
});

test('screen family and attribute filters preserve real result counts', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${baseURL}/productos/?category=pantallas&sub=iphone`, { waitUntil: 'domcontentloaded' });

  await expect(page.locator('[data-result-count]')).toHaveText('78 productos encontrados');
  await expect(page.locator('[data-sub-filter="iphone"]')).toHaveClass(/is-active/);
  await page.locator('select[name="technology"]').selectOption('INCELL');
  await Promise.all([
    page.waitForURL((url) => url.searchParams.get('technology') === 'INCELL'),
    page.locator('.zay-attribute-filters button').click(),
  ]);
  await expect(page.locator('[data-result-count]')).toHaveText('34 productos encontrados');
  await expect(page.locator('[data-catalog-card]')).toHaveCount(34);
  expect(await page.locator('[data-catalog-card]').evaluateAll((cards) => (
    cards.every((card) => card.dataset.family === 'iphone' && card.dataset.technology === 'INCELL')
  ))).toBe(true);

  const optionLabels = await page.locator('.zay-attribute-filters option').allTextContents();
  expect(optionLabels.some((label) => /\b0\b/.test(label))).toBe(false);
});

test('iPhone quality architecture reflects the real catalog and exposes OLED variants', async ({ page }) => {
  await page.goto(`${baseURL}/productos/?category=pantallas&sub=iphone`, { waitUntil: 'domcontentloaded' });

  const quality = page.locator('[data-quality-navigation="iphone"]');
  await expect(quality).toContainText(/INCELL FHD\s*34 SKU/s);
  await expect(quality).toContainText(/OLED\s*20 SKU/s);
  await expect(quality).toContainText(/Diagnóstico OLED\s*24 SKU/s);
  await expect(quality.locator('.zay-quality-card')).toHaveCount(3);
  await expect(quality.locator('.zay-quality-card>a>span', { hasText: /^Original$/ })).toHaveCount(0);

  await page.goto(`${baseURL}/productos/?category=pantallas&sub=iphone&technology=OLED`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-result-count]')).toHaveText('20 productos encontrados');
  await expect(page.locator('.zay-variant-panel')).toContainText(/OLED Premium\s*16/s);
  await expect(page.locator('.zay-variant-panel')).toContainText(/Soft OLED Premium\s*4/s);

  await page.goto(`${baseURL}/productos/?category=pantallas&sub=iphone&technology=OLED%20diagn%C3%B3stica`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-result-count]')).toHaveText('24 productos encontrados');
  await expect(page.locator('.zay-variant-panel')).toContainText(/Tamaño original\s*22/s);
  await expect(page.locator('.zay-variant-panel')).toContainText(/Hard OLED\s*1/s);
  await expect(page.locator('.zay-variant-panel')).toContainText(/Soft OLED\s*1/s);
});

test('Samsung quality architecture separates technology before model', async ({ page }) => {
  await page.goto(`${baseURL}/productos/?category=pantallas&sub=samsung`, { waitUntil: 'domcontentloaded' });
  const quality = page.locator('[data-quality-navigation="samsung"]');
  await expect(quality).toContainText(/INCELL\s*33 SKU/s);
  await expect(quality).toContainText(/AMOLED \/ OLED\s*9 SKU/s);
  await expect(quality).toContainText(/TIPO ORIGINAL\s*8 SKU/s);
  await expect(quality).toContainText('50 SKU Samsung no plegables publicados son versiones con marco');

  await page.goto(`${baseURL}/productos/?category=pantallas&sub=samsung&technology=Tipo%20original`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-result-count]')).toHaveText('8 productos encontrados');
});

test('Foldables expose only published Z Flip and Z Fold models', async ({ page }) => {
  await page.goto(`${baseURL}/productos/?category=pantallas&sub=foldables`, { waitUntil: 'domcontentloaded' });
  const quality = page.locator('[data-quality-navigation="foldables"]');
  await expect(quality).toContainText(/Z Flip\s*9 productos/s);
  await expect(quality).toContainText(/Z Fold\s*4 productos/s);
  for (const model of ['Z FLIP3', 'Z FLIP4', 'Z FLIP5', 'Z FLIP6', 'Z FLIP7', 'Z FOLD3', 'Z FOLD4', 'Z FOLD5', 'Z FOLD6']) {
    await expect(quality.getByRole('link', { name: model, exact: true })).toBeVisible();
  }
});

test('restored footer exposes confirmed navigation, contact, social and legal links', async ({ page }) => {
  await page.goto(`${baseURL}/`, { waitUntil: 'domcontentloaded' });
  const footer = page.locator('[data-v3-footer]');
  await expect(footer).toContainText('Eje Central Lázaro Cárdenas 87');
  await expect(footer).toContainText('Lun–Sáb · 10:00–18:00');
  await expect(footer.getByRole('link', { name: 'Abrir APP' })).toHaveAttribute('href', '/app/');
  const expected = {
    facebook: 'https://www.facebook.com/haodemx',
    instagram: 'https://www.instagram.com/cristi3an/',
    tiktok: 'https://www.tiktok.com/@haodemx',
    youtube: 'https://www.youtube.com/@haodemx',
  };
  for (const [platform, href] of Object.entries(expected)) {
    await expect(footer.locator(`[data-social-link="${platform}"]`)).toHaveAttribute('href', href);
  }
  expect(await footer.locator('[data-social-link]').evaluateAll((links) => links.every((link) => link.href && !link.href.endsWith('#')))).toBe(true);
});

test('legacy technology links remain compatible with the new family hierarchy', async ({ page }) => {
  await page.goto(`${baseURL}/productos/?category=pantallas&sub=iphone-oled`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-result-count]')).toHaveText('20 productos encontrados');
  expect(await page.locator('[data-catalog-card]').evaluateAll((cards) => (
    cards.every((card) => card.dataset.category === 'iphone-oled')
  ))).toBe(true);
});

test('Hidrogel and confirmed AI families use actual catalog counts', async ({ page }) => {
  await page.goto(`${baseURL}/micas.html`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-family-link="peliculas"]')).toContainText('4 productos');
  await expect(page.locator('[data-family-link="maquinas"]')).toContainText('1 producto');

  await page.goto(`${baseURL}/productos-ai/`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-family-link="gafas-ai"]')).toContainText('9 productos');
  await expect(page.locator('.zay-review-note')).toContainText('4 productos de cámara');
});

test('catalog cards use a square contained media stage and stable information order', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${baseURL}/productos/?category=pantallas&sub=samsung`, { waitUntil: 'domcontentloaded' });

  const metrics = await page.locator('[data-catalog-card]:visible').evaluateAll((cards) => cards.slice(0, 12).map((card) => {
    const stage = card.querySelector('.zay-card-media');
    const image = stage.querySelector('img');
    const body = card.querySelector('.zay-card-body');
    const rect = stage.getBoundingClientRect();
    return {
      ratio: rect.width / rect.height,
      objectFit: getComputedStyle(image).objectFit,
      padding: parseFloat(getComputedStyle(stage).paddingTop),
      bodyOrder: [...body.children].map((node) => node.tagName),
    };
  }));

  expect(metrics.length).toBeGreaterThan(0);
  metrics.forEach((item) => {
    expect(item.ratio).toBeGreaterThan(0.99);
    expect(item.ratio).toBeLessThan(1.01);
    expect(item.objectFit).toBe('contain');
    expect(item.padding).toBeGreaterThanOrEqual(24);
    expect(item.bodyOrder).toEqual(['H3', 'P', 'STRONG', 'DIV']);
  });
});

test('mobile category controls remain readable, tappable and overflow-free', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseURL}/productos/?category=pantallas`, { waitUntil: 'domcontentloaded' });

  const familyCards = await page.locator('[data-family-link]').evaluateAll((links) => links.map((link) => {
    const rect = link.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }));
  expect(familyCards.every(({ width, height }) => width >= 44 && height >= 44)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);

  await page.goto(`${baseURL}/productos/?category=pantallas&sub=foldables`, { waitUntil: 'domcontentloaded' });
  const qualityTargets = await page.locator('.zay-fold-card a').evaluateAll((links) => links.map((link) => link.getBoundingClientRect().height));
  expect(qualityTargets.every((height) => height >= 44)).toBe(true);
  await page.locator('.zay-filter-toggle').click();
  await expect(page.locator('.zay-filter-content')).toBeVisible();
  await expect(page.locator('[data-result-count]')).toHaveText('13 productos encontrados');
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
});
