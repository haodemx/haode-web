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
    texts: ['Visítanos en CDMX', 'Lista grande, precio por cantidad', 'Enviar lista'],
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
  await expectNoHorizontalOverflow(page);
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
