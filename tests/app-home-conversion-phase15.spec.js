const { test, expect } = require('@playwright/test');

const serverURL = (process.env.BASE_URL || 'https://haode.com.mx').replace(/\/app\/?$/, '').replace(/\/$/, '');
const appURL = `${serverURL}/app/`;

test.describe('HAODE App home conversion UI phase 15', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('haode-privacy-consent-v1', JSON.stringify({
        version: 1,
        analytics: false,
        advertising: false,
      }));
    });
  });

  async function routeErpEmpty(page) {
    await page.route('https://erp.haode.com.mx/**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });
  }

  async function makeErpHang(page) {
    await page.addInitScript(() => {
      const originalFetch = window.fetch.bind(window);
      window.fetch = (input, init = {}) => {
        const url = typeof input === 'string' ? input : input?.url || '';
        if (url.startsWith('https://erp.haode.com.mx/')) {
          return new Promise((resolve, reject) => {
            init.signal?.addEventListener('abort', () => {
              reject(new DOMException('Aborted', 'AbortError'));
            });
          });
        }
        return originalFetch(input, init);
      };
    });
  }

  test('App first screen shows factory, quantity pricing and private WhatsApp prompts', async ({ page }) => {
    await routeErpEmpty(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(appURL, { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'Fábrica directa para pantallas' })).toBeVisible();
    await expect(page.locator('.brand img')).toHaveAttribute('src', '/assets/images/haode-wordmark-transparent.png');
    await expect(page.locator('.app-stock-strip')).toContainText('Stock en México');
    await expect(page.locator('.app-stock-strip')).toContainText('Precio por cantidad');
    await expect(page.locator('.app-stock-strip')).toContainText('Calidad revisada');
    await expect(page.locator('.app-stock-strip')).toContainText('WhatsApp privado');
    await expect(page.locator('.app-hero-actions a[href*="wa.me"]').first()).toBeVisible();
    await expectAppFastQuoteWorkbench(page);
    await expect(page.locator('.app-home-product-card').first()).toBeVisible({ timeout: 15000 });
    await expectHomeProductMediaVisible(page);
    await expectBottomSearchNav(page);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test('App shows local catalog immediately when ERP does not answer', async ({ page }) => {
    await makeErpHang(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(appURL, { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'Fábrica directa para pantallas' })).toBeVisible({ timeout: 6000 });
    await expect(page.locator('.app-home-product-card').first()).toBeVisible({ timeout: 6000 });

    const diagnostics = await page.evaluate(() => window.HAODE_DIAGNOSTICS);
    expect(diagnostics.fuente).toBe('products.json');
    expect(diagnostics.productosVisibles).toBeGreaterThan(0);
  });
});

async function expectHomeProductMediaVisible(page) {
  const media = page.locator('.app-home-product-media').first();
  await expect(media).toBeVisible();
  const details = await media.evaluate((el) => {
    const img = el.querySelector('img');
    const rect = el.getBoundingClientRect();
    const computed = getComputedStyle(el);
    return {
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      background: computed.backgroundColor,
      naturalWidth: img?.naturalWidth || 0,
      complete: img?.complete || false
    };
  });
  expect(details.width).toBeGreaterThanOrEqual(60);
  expect(details.height).toBeGreaterThanOrEqual(56);
  expect(details.background).not.toBe('rgba(0, 0, 0, 0)');
  expect(details.complete).toBe(true);
  expect(details.naturalWidth).toBeGreaterThan(0);
}

async function expectBottomSearchNav(page) {
  const searchNav = page.locator('.bottom-nav [data-focus-search]').filter({ hasText: 'Buscar' });
  await expect(searchNav).toBeVisible();
  await searchNav.click();
  await expect(page.locator('[data-search-products]')).toBeFocused();
}

async function expectAppFastQuoteWorkbench(page) {
  const details = await page.evaluate(() => {
    const search = document.querySelector('.app-quick-search')?.getBoundingClientRect();
    const proof = document.querySelector('.app-stock-strip')?.getBoundingClientRect();
    const whatsapp = document.querySelector('.app-hero-actions a[href*="wa.me"]')?.getBoundingClientRect();
    const firstProofText = document.querySelector('.app-stock-strip strong');
    return {
      searchTop: Math.round(search?.top || 0),
      searchBottom: Math.round(search?.bottom || 0),
      proofTop: Math.round(proof?.top || 0),
      proofBackground: proof ? getComputedStyle(document.querySelector('.app-stock-strip')).backgroundImage : '',
      proofTextColor: firstProofText ? getComputedStyle(firstProofText).color : '',
      whatsappTop: Math.round(whatsapp?.top || 0),
      whatsappBottom: Math.round(whatsapp?.bottom || 0),
    };
  });

  expect(details.searchTop).toBeLessThan(details.proofTop);
  expect(details.searchBottom).toBeLessThan(470);
  expect(details.whatsappTop).toBeGreaterThanOrEqual(0);
  expect(details.whatsappBottom).toBeLessThanOrEqual(620);
  expect(details.proofBackground).toContain('linear-gradient');
  expect(details.proofTextColor).toBe('rgb(255, 255, 255)');
}
