const { test, expect } = require('@playwright/test');

const BASE_URL = (process.env.BASE_URL || 'https://haode.com.mx').replace(/\/$/, '');

const criticalPages = [
  {
    path: '/',
    name: 'home',
    texts: ['Pantallas y tecnología para vender y reparar.', 'Hidrogel', 'WhatsApp'],
  },
  {
    path: '/app/',
    name: 'app home',
    texts: ['Encuentra tu refacción.', 'Precio por cantidad', 'WhatsApp privado'],
  },
  {
    path: '/productos/',
    name: 'catalog',
    texts: ['Catálogo HAODE México', 'Productos publicados', 'Cotizar'],
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
    path: '/producto/x200t-cortadora-micas/',
    name: 'special product detail',
    texts: ['HAODE X200T Cortadora Inteligente de Micas', 'WhatsApp privado', 'Precio por cantidad'],
  },
  {
    path: '/contacto/',
    name: 'contact',
    texts: ['Contacto', 'Local 225', 'WhatsApp'],
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
    const productImages = page.locator('.zay-hero figure img');
    await expect(productImages).toHaveCount(1);
    expect(await productImages.evaluateAll((images) => images.every((image) => image.complete && image.naturalWidth > 0))).toBe(true);
    if (viewport.width <= 430) {
      await expect(page.locator('.zay-floating')).toBeVisible();
    } else {
      await expect(page.locator('.zay-hero-actions a[href*="wa.me"]')).toBeVisible();
    }
  }
  await expectNoHorizontalOverflow(page);
}

async function expectHomepageStickyWhatsapp(page, viewportHeight) {
  const stickyWhatsapp = page.locator('.reference-sticky-whatsapp');
  await expect(stickyWhatsapp).toBeHidden();
  const heroWhatsapp = page.locator('.haode-hero-primary[href*="wa.me"]');
  await expect(heroWhatsapp).toBeVisible();
  await expect(heroWhatsapp).toContainText('Cotizar');

  const box = await heroWhatsapp.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    return {
      top: Math.round(rect.top),
      bottom: Math.round(rect.bottom),
      width: Math.round(rect.width),
    };
  });

  expect(box.top).toBeGreaterThanOrEqual(0);
  expect(box.bottom).toBeLessThanOrEqual(viewportHeight);
  expect(box.width).toBeGreaterThan(40);
}

async function expectMobileHomeVisual(page) {
  const visual = page.locator('.zay-hero figure');
  await expect(visual).toBeVisible();
  await expect(page.locator('[data-home-hero-carousel]')).toHaveCount(0);
  const box = await visual.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    return { top: Math.round(rect.top), height: Math.round(rect.height) };
  });
  expect(box.top).toBeLessThan(760);
  expect(box.height).toBeGreaterThanOrEqual(180);
}

async function expectReferenceMobileSalesHeader(page) {
  const header = page.locator('.zay-header');
  const logo = page.locator('.zay-brand').first();
  const nav = page.locator('.zay-nav').first();

  await expect(header).toBeVisible();
  await expect(logo).toBeVisible();
  await expect(nav).toBeHidden();
  await expect(header.locator('a[href="/app/"]')).toBeVisible();
  await expect(page.locator('.zay-floating')).toBeVisible();
  const menu = page.locator('.zay-menu-button');
  await expect(menu).toBeVisible();
  await menu.click();
  await expect(nav).toBeVisible();

  const layout = await page.evaluate(() => {
    const headerRect = document.querySelector('.zay-header')?.getBoundingClientRect();
    const logoRect = document.querySelector('.zay-brand')?.getBoundingClientRect();
    const logoImage = document.querySelector('.zay-brand img');
    const navRect = document.querySelector('.zay-nav')?.getBoundingClientRect();

    return {
      headerHeight: Math.round(headerRect?.height || 0),
      headerTop: Math.round(headerRect?.top || 0),
      logoLeft: Math.round(logoRect?.left || 0),
      logoTop: Math.round(logoRect?.top || 0),
      logoWidth: Math.round(logoRect?.width || 0),
      imageDisplay: logoImage ? getComputedStyle(logoImage).display : null,
      navTop: Math.round(navRect?.top || 0),
    };
  });

  expect(layout.headerHeight).toBeLessThanOrEqual(260);
  expect(layout.logoLeft).toBeLessThanOrEqual(18);
  expect(layout.logoTop - layout.headerTop).toBeLessThanOrEqual(12);
  expect(layout.logoWidth).toBeGreaterThanOrEqual(118);
  expect(layout.imageDisplay).toBe('block');
  expect(layout.navTop).toBeGreaterThan(layout.logoTop);
}

async function expectReferenceDesktopWordmark(page) {
  const logo = page.locator('.zay-brand').first();
  await expect(logo).toBeVisible();
  const details = await logo.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    const image = el.querySelector('img');
    return {
      width: Math.round(rect.width),
      imageDisplay: image ? getComputedStyle(image).display : null,
      imageWidth: Math.round(image?.getBoundingClientRect().width || 0),
      imageContent: image ? getComputedStyle(image).content : '',
    };
  });

  expect(details.width).toBeGreaterThanOrEqual(130);
  expect(details.imageDisplay).toBe('block');
  expect(details.imageWidth).toBeGreaterThanOrEqual(130);
  await expect(logo.locator('img')).toHaveAttribute('src', '/assets/images/haode-header-logo-horizontal-preview.png');
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
