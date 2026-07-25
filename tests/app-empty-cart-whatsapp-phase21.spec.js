const { test, expect } = require('@playwright/test');

const SERVER_URL = (process.env.BASE_URL || 'https://haode.com.mx').replace(/\/app\/?$/, '').replace(/\/$/, '');
const APP_URL = `${SERVER_URL}/app/`;

test.describe('HAODE App empty cart WhatsApp UI phase 21', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('https://erp.haode.com.mx/**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });
  });

  test('empty cart page offers large list WhatsApp instead of a dead end', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${APP_URL}#carrito`, { waitUntil: 'domcontentloaded' });

    await expect(page.locator('.app-bulk-panel')).toContainText('Envía tu lista grande por WhatsApp');
    await expect(page.locator('.app-bulk-panel').getByRole('link', { name: 'Enviar lista por WhatsApp' })).toHaveAttribute('href', /wa\.me/);
    await expect(page.locator('.cart-page-card')).toHaveCount(0);

    const overflow = await page.evaluate(() => (
      Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth)
    ));
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test('empty cart drawer also exposes the large list WhatsApp path', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
    await page.locator('[data-open-cart]').first().click();

    const drawer = page.locator('[data-cart-drawer]');
    await expect(drawer).toHaveClass(/open/);
    await expect(drawer.locator('.cart-drawer-proof')).toBeVisible();
    await expect(drawer.locator('.cart-drawer-proof')).toContainText('Stock en México');
    await expect(drawer.locator('.cart-drawer-proof')).toContainText('Precio por cantidad');
    await expectDarkDrawerProof(page);
    await expect(drawer.locator('.checkout-form')).toBeHidden();
    await expect(drawer.locator('.cart-empty-whatsapp')).toBeVisible();
    await expect(drawer.locator('.cart-empty-whatsapp')).toContainText('Enviar lista grande por WhatsApp');
    await expect(page.locator('[data-whatsapp-link]')).toContainText('Agrega productos para pedido');
    await expectDrawerCtaInViewport(page);
  });
});

async function expectDarkDrawerProof(page) {
  const color = await page.locator('.cart-drawer-proof strong').first().evaluate((el) => getComputedStyle(el).color);
  expect(color).toBe('rgb(255, 255, 255)');
}

async function expectDrawerCtaInViewport(page) {
  const layout = await page.locator('[data-whatsapp-link]').evaluate((el) => {
    const rect = el.getBoundingClientRect();
    return {
      top: Math.round(rect.top),
      bottom: Math.round(rect.bottom),
    };
  });

  expect(layout.top).toBeGreaterThanOrEqual(0);
  expect(layout.bottom).toBeLessThanOrEqual(844);
}
