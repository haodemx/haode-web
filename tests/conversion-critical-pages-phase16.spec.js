const { test, expect } = require('@playwright/test');

const BASE_URL = (process.env.BASE_URL || 'https://haode.com.mx').replace(/\/$/, '');

const criticalPages = [
  {
    path: '/',
    name: 'home',
    texts: ['Fábrica directa para talleres', 'Stock en México', 'WhatsApp'],
  },
  {
    path: '/app/',
    name: 'app home',
    texts: ['Fábrica directa para talleres', 'Precio por cantidad', 'WhatsApp privado'],
  },
  {
    path: '/productos/',
    name: 'catalog',
    texts: ['Catálogo HAODE México', 'Enviar lista por WhatsApp', 'Precio por cantidad'],
  },
  {
    path: '/categoria/samsung-oled/',
    name: 'samsung oled category',
    texts: ['Stock en México', 'WhatsApp privado', 'Precio por cantidad'],
  },
  {
    path: '/categoria/samsung-plegables/',
    name: 'samsung plegables category',
    texts: ['Pedido especial', 'WhatsApp privado', 'Cotiza Samsung Z Flip y Z Fold por WhatsApp'],
  },
  {
    path: '/producto/iphone-incell-14/',
    name: 'product detail',
    texts: ['Pantalla para iPhone 14', 'Cotiza este modelo por WhatsApp privado', 'Precio por cantidad'],
  },
  {
    path: '/producto/x200t-cortadora-inteligente-de-micas/',
    name: 'special product detail',
    texts: ['HAODE X200T Cortadora Inteligente de Micas', 'WhatsApp privado', 'Precio por cantidad'],
  },
  {
    path: '/contacto/',
    name: 'contact',
    texts: ['Fábrica directa en CDMX', 'Lista grande, precio por cantidad', 'Enviar lista'],
  },
  {
    path: '/distribuidores/',
    name: 'distributors',
    texts: ['Distribuidores HAODE México', 'Solicita distribución por WhatsApp privado', 'Precio por cantidad'],
  },
];

test.describe('HAODE critical conversion pages phase 16', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('https://erp.haode.com.mx/**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });
  });

  for (const pageCase of criticalPages) {
    test(`${pageCase.name} keeps conversion prompts, WhatsApp and responsive layout`, async ({ page }) => {
      const badResponses = [];
      trackBadSameOriginResponses(page, badResponses);

      await checkCriticalPage(page, pageCase, { width: 1280, height: 900 });
      await checkCriticalPage(page, pageCase, { width: 390, height: 844 });

      expect(badResponses).toEqual([]);
    });
  }
});

async function checkCriticalPage(page, pageCase, viewport) {
  await page.setViewportSize(viewport);
  await page.goto(`${BASE_URL}${pageCase.path}`, { waitUntil: 'domcontentloaded' });

  for (const text of pageCase.texts) {
    await expect(page.locator('body')).toContainText(text);
  }

  await expect(page.locator('body')).not.toContainText('Producto HAODE México');
  await expect(page.locator('a:visible[href*="wa.me"], a:visible[href*="whatsapp"]').first()).toBeVisible();
  if (pageCase.name === 'home' && viewport.width <= 430) {
    await expectMobileHomeVisual(page);
  }
  if ((pageCase.name === 'catalog' || pageCase.name === 'contact') && viewport.width <= 430) {
    await expectReferenceMobileSalesHeader(page);
  }
  if ((pageCase.name === 'catalog' || pageCase.name === 'contact') && viewport.width > 430) {
    await expectReferenceDesktopWordmark(page);
  }
  if (pageCase.name === 'home') {
    await expect(page.locator('.reference-proof-band')).toContainText('Fábrica directa');
    await expect(page.locator('.reference-proof-band')).toContainText('Control de calidad');
    await expectHomepageStickyWhatsapp(page, viewport.height);
  }
  await expectNoHorizontalOverflow(page);
}

async function expectHomepageStickyWhatsapp(page, viewportHeight) {
  const stickyWhatsapp = page.locator('.reference-sticky-whatsapp');
  await expect(stickyWhatsapp).toBeVisible();
  await expect(stickyWhatsapp).toContainText('Enviar lista grande por WhatsApp');
  await expect(stickyWhatsapp).toHaveAttribute('href', /wa\.me/);

  const box = await stickyWhatsapp.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    return {
      top: Math.round(rect.top),
      bottom: Math.round(rect.bottom),
      width: Math.round(rect.width),
    };
  });

  expect(box.top).toBeGreaterThanOrEqual(0);
  expect(box.bottom).toBeLessThanOrEqual(viewportHeight);
  expect(box.width).toBeGreaterThan(300);
}

async function expectMobileHomeVisual(page) {
  const visual = page.locator('.reference-mobile-hero-visual');
  await expect(visual).toBeVisible();
  await expect(visual).toContainText('Stock MX');
  const box = await visual.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    return { top: Math.round(rect.top), height: Math.round(rect.height) };
  });
  expect(box.top).toBeLessThan(620);
  expect(box.height).toBeGreaterThanOrEqual(110);
}

async function expectReferenceMobileSalesHeader(page) {
  const header = page.locator('.reference-header');
  const logo = page.locator('.reference-logo').first();
  const nav = page.locator('.reference-nav').first();
  const actions = page.locator('.reference-nav-actions').first();

  await expect(header).toBeVisible();
  await expect(logo).toBeVisible();
  await expect(nav).toBeVisible();
  await expect(actions).toBeVisible();
  await page.waitForFunction(() => {
    const logoRect = document.querySelector('.reference-logo')?.getBoundingClientRect();
    const navRect = document.querySelector('.reference-nav')?.getBoundingClientRect();
    const actionsRect = document.querySelector('.reference-nav-actions')?.getBoundingClientRect();
    const logoImage = document.querySelector('.reference-logo img');

    return Boolean(logoRect && navRect && actionsRect && logoImage)
      && getComputedStyle(logoImage).display === 'none'
      && logoRect.top <= 12
      && navRect.top <= 58
      && actionsRect.top <= 104;
  });

  const layout = await page.evaluate(() => {
    const headerRect = document.querySelector('.reference-header')?.getBoundingClientRect();
    const logoRect = document.querySelector('.reference-logo')?.getBoundingClientRect();
    const navRect = document.querySelector('.reference-nav')?.getBoundingClientRect();
    const actionsRect = document.querySelector('.reference-nav-actions')?.getBoundingClientRect();

    return {
      headerHeight: Math.round(headerRect?.height || 0),
      logoLeft: Math.round(logoRect?.left || 0),
      logoTop: Math.round(logoRect?.top || 0),
      logoWidth: Math.round(logoRect?.width || 0),
      navTop: Math.round(navRect?.top || 0),
      actionsTop: Math.round(actionsRect?.top || 0),
    };
  });

  expect(layout.headerHeight).toBeLessThanOrEqual(140);
  expect(layout.logoLeft).toBeLessThanOrEqual(18);
  expect(layout.logoTop).toBeLessThanOrEqual(12);
  expect(layout.logoWidth).toBeGreaterThanOrEqual(100);
  expect(layout.navTop).toBeLessThanOrEqual(58);
  expect(layout.actionsTop).toBeLessThanOrEqual(104);
}

async function expectReferenceDesktopWordmark(page) {
  const logo = page.locator('.reference-logo').first();
  await expect(logo).toBeVisible();
  await page.waitForFunction(() => {
    const logoElement = document.querySelector('.reference-logo');
    const image = logoElement?.querySelector('img');
    if (!logoElement || !image) return false;
    return getComputedStyle(image).display === 'none'
      && getComputedStyle(logoElement, '::before').content.includes('HAODE');
  });
  const details = await logo.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    const image = el.querySelector('img');
    return {
      width: Math.round(rect.width),
      imageDisplay: image ? getComputedStyle(image).display : null,
      brand: getComputedStyle(el, '::before').content,
      country: getComputedStyle(el, '::after').content,
    };
  });

  expect(details.width).toBeGreaterThanOrEqual(100);
  expect(details.imageDisplay).toBe('none');
  expect(details.brand).toContain('HAODE');
  expect(details.country).toContain('MÉXICO');
}

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => (
    Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth)
  ));
  expect(overflow).toBeLessThanOrEqual(1);
}

function trackBadSameOriginResponses(page, badResponses) {
  page.on('response', (response) => {
    const url = response.url();
    if (isSameOrigin(url) && response.status() >= 400 && !isIgnoredResource(url)) {
      badResponses.push(`${response.status()} ${url}`);
    }
  });
}

function isSameOrigin(url) {
  try {
    return new URL(url).origin === new URL(BASE_URL).origin;
  } catch {
    return false;
  }
}

function isIgnoredResource(url) {
  return /\/favicon\.ico(?:\?|$)|\.mp4(?:\?|$)/.test(url);
}
